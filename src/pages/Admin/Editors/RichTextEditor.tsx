import { useState, useRef, KeyboardEventHandler, } from 'react';
import { preprocessMarkdown } from 'utils/preprocessMarkdown';
import { uploadImage, retrieveImageData } from 'utils/functions';

import { renderMarkdown } from "components/Article/MarkdownRender";
import { renderDomAsMarkdown } from 'utils/DOMIntoMarkdown';
import { dictionaryUpdateKeyNested } from 'utils/functions';
import { widgets, toggleWidgetActiveState, flattenWidgetStateTypes, WidgetCategory } from './RichTextEditWidgetInformation';

import { Article } from 'app/articlesSlice';

import bottomToolbarStyle from './bottomToolbar.module.scss';
import editorStyle from './RichTextEditor.module.scss';
import styles from 'pages/Admin/Admin.module.scss';
import articleStyles from 'components/Article/Article.module.scss';
import Button from 'components/Form/Button';

function executeRichTextCommand(commandName: string, optionalArgument?: string) {
    if (commandName === "@_insertImage") {
        console.log("image handling");
        const fileDialog = document.createElement("input");
        fileDialog.type = "file";
        fileDialog.click();

        // TODO(jerry): cleanup
        fileDialog.addEventListener("change", fileHandlerOnChange);
    } else {
        document.execCommand(commandName, false, optionalArgument);
    }
}

function queryRichTextCommand(command: string, wantedValue?: boolean) {
    if (wantedValue) {
        return document.queryCommandValue(command);
    } else {
        return document.queryCommandState(command);
    }
}

function fileHandlerOnChange({ target }: Event): void {
    const probablyFile = (target as HTMLInputElement).files?.[0];

    if (probablyFile)
        retrieveImageData(probablyFile,
                          function (imgData) {
                              uploadImage(imgData).then(
                                  function (imgURL) {
                                      if (imgURL.success) {
                                          document.execCommand("insertImage", false, imgURL.data.url);
                                      } else {
                                          console.error("IMGBB is down. Tony pls get us a server");
                                      }
                                  }
                              );
                          });
}

function editorHandleKeybindings({
    saveDocument,
    toggleWidget,
    executeRichTextCommand,
    updateDirtyFlag
}: {
    saveDocument: () => void,
    toggleWidget: (widgetId: string, categoryValue?: string) => void,
    executeRichTextCommand: (command: string, argument?: string) => void,
    updateDirtyFlag: React.Dispatch<boolean>,
}): KeyboardEventHandler<HTMLDivElement> {
    return function (event) {
        const { key, shiftKey, ctrlKey } = event;
        let disableDefaultBehavior = false;
        if (ctrlKey) {
            if (!shiftKey) {
                switch (key) {
                case 's':
                    saveDocument();
                    disableDefaultBehavior = true;
                    break;
                case 'b':
                    toggleWidget("bold");
                    executeRichTextCommand("bold");
                    disableDefaultBehavior = true;
                    break;
                case 'i':
                    toggleWidget("italic");
                    executeRichTextCommand("italic");
                    disableDefaultBehavior = true;
                    break;
                case 'u':
                    toggleWidget("underline");
                    executeRichTextCommand("underline");
                    disableDefaultBehavior = true;
                    break;
                case '1': case '2': case '3': case '4': case '5': case '6':
                    toggleWidget(`h${key}`, "heading");
                    executeRichTextCommand("heading", `H${key}`);
                    disableDefaultBehavior = true;
                    break;
                }
            } else {
                console.log("CTRL and SHIFT", key);
                switch (key) {
                case 'U':
                    console.log("unordered list");
                    executeRichTextCommand("insertunorderedlist");
                    disableDefaultBehavior = true;
                    break;
                case 'O':
                    executeRichTextCommand("insertorderedlist");
                    disableDefaultBehavior = true;
                    break;
                }
            }
        }

        if (disableDefaultBehavior) {
            event.preventDefault();
            event.stopPropagation();
        } else {
            updateDirtyFlag(true);
        }
    };
}

const editModeInlineStyle = {
    outline: "0px solid transparent",
    borderColor: "black",
    borderWidth: "1px",
    borderStyle: "solid",
    margin: "0",
};

interface EditorToolbarProperties {
    toggleDraftStatus: () => void,
    saveDocument: () => void,
    isInitial: boolean,
};

// TODO better name.
function EditorToolbar({toggleDraftStatus, saveDocument, isInitial}: EditorToolbarProperties) {
    return (<div className={bottomToolbarStyle.main}>
                       <Button onClick={() => { toggleDraftStatus(); }}>
                         Toggle Draft Status
                       </Button>
                       <Button onClick={saveDocument}>
                         {(isInitial) ? "Save Article" : "Publish Article"}
                       </Button>
                     </div>);
}

function TagDisplay({id, name, removeTag}:{id: string, name: string, removeTag: (id: string) => void}) {
    return (
        <div className={editorStyle.tageditor_tag}>
            <span>
            <button onClick={(_) => removeTag(id)}>&times;</button>
            </span>
            {name}</div>
    );
}

interface ArticleTagEditorProperties {
    tags: string[];
    setTagState: React.Dispatch<string[]>;
};

function ArticleTagEditor({tags, setTagState}: ArticleTagEditorProperties) {
    const [input, setInput] = useState('');

    function removeTagById(id: string) {
        setTagState(tags.filter((tagName) => id !== tagName));
    }

    return (
        <div
        className={editorStyle.tageditor}>
            <button
            className={editorStyle.button}
        onClick={() => setTagState([]) }
            >Clear</button>
            {tags?.map((tag) => <TagDisplay removeTag={removeTagById} key={tag} id={tag} name={tag}/>)}
            <input
        value={input}
        onChange = {
            function (event) {
                setInput(event.target.value);
            }
        }
        onKeyDown = {
            function ({key}) {
                if (key === "Backspace" && input.length === 0) {
                    setTagState(tags?.slice(0, tags.length-1));
                } else if (key === "Enter" && input.length > 0) {
                    // too lazy to google for proper function.
                    const doesIndexAlreadyExist = tags?.indexOf(input) !== -1;
                    if (!doesIndexAlreadyExist) {
                        setTagState(tags?.concat([input]));
                        setInput('');
                    }
                }
            }
        }
            ></input>
        </div>
    );
}

export function RichTextEditor({
    submissionHandler,
    currentArticle,
    updateDirtyFlag,
    toggleDraftStatus
}:
                               {
                                   submissionHandler: (f: { name: string, tags: string[], content: string; }) => void,
                                   currentArticle?: Article,
                                   updateDirtyFlag: React.Dispatch<React.SetStateAction<boolean>>,
                                   toggleDraftStatus: () => void,
                               }) {
    const [initialArticleState, _] = useState(currentArticle);
    const [tagEditorShown, setTagEditorVisibility] = useState(true);
    const [tags, setTagState] = useState((currentArticle?.tags) || []);

    const editableTitleDOMRef = useRef<HTMLHeadingElement>(null);
    const editableAreaDOMRef = useRef<HTMLDivElement>(null);

    document.execCommand("defaultParagraphSeparator", false, "br");
    const [widgetStates, updateWidgetState] = useState(widgets);

    function saveDocument() {
        if (editableAreaDOMRef.current && editableTitleDOMRef.current) {
            const markdownText = renderDomAsMarkdown(editableAreaDOMRef.current);
            submissionHandler({
                name: (initialArticleState?.name) || (editableTitleDOMRef.current.textContent || ""),
                content: markdownText,
                tags: tags
            });

            if (initialArticleState === undefined) {
                editableAreaDOMRef.current.innerHTML = renderMarkdown(preprocessMarkdown(markdownText).processed);
            }
        }
    }

    // would only apply to a few relevant states.
    function _toggleWidgetActiveState(widgetId: string, categoryValue?: string) {
        updateWidgetState(toggleWidgetActiveState(widgetStates, widgetId, categoryValue));
    }

    function synchronizeCommandStateToWidgetBar() {
        updateWidgetState(
            Object.keys(widgetStates).reduce(
                (newWidgetState, type) => {
                    return dictionaryUpdateKeyNested(newWidgetState, [type, "active"],
                                                     (type === "heading") ?
                        () => queryRichTextCommand(type, true) :
                        () => queryRichTextCommand(type) ? type : null
                                                    );
                }, widgetStates)
        );
    }

    return (
        <>
            <h1
        className={articleStyles.title}
        contentEditable={(initialArticleState) ? "false" : "true"}
        ref={editableTitleDOMRef}
            >
            {(currentArticle) ? currentArticle.name : "Edit New Title"}
        </h1>
            <div>
            <div
        contentEditable={true}
        className={articleStyles.article}
        onSelect={synchronizeCommandStateToWidgetBar}
        onKeyDown={editorHandleKeybindings({
            saveDocument: saveDocument,
            toggleWidget: _toggleWidgetActiveState,
            executeRichTextCommand: executeRichTextCommand,
            updateDirtyFlag: updateDirtyFlag,
        })}
        dangerouslySetInnerHTML={
            { __html: renderMarkdown(preprocessMarkdown((initialArticleState) ? initialArticleState.content : "Begin typing your article.").processed) }
        }
        ref={editableAreaDOMRef}>
            </div>
            </div>
            <br></br>
            <br></br>
            <div className={editorStyle.widgetbar}> {/*requires styling*/}
            <button style={{float: "left", marginLeft: "3em"}}
        className={editorStyle.button}
        onClick={() => setTagEditorVisibility(!tagEditorShown)}>
            Toggle Tag Editor</button>
            {
                Object.entries(flattenWidgetStateTypes(widgetStates)).map(
                    ([widgetId, widget]) =>
                        <button
                    key={widgetId}
                    id={widgetId}
                    className={
                        ((widgetStates[(widget.category !== undefined) ?
                            widget.category : widgetId].active) === widgetId) ?
                            editorStyle.active : editorStyle.button
                    }
                    onClick={
                        (_) => {
                            _toggleWidgetActiveState(widgetId, widget.category);
                            executeRichTextCommand(widget.command, widget.argument);
                        }
                    }>{(widget.display) ? widget.display : widget.name}
                    </button>
                )
            }
            <button style={{float: "right", marginRight: "3em"}}
        className={editorStyle.button}
            >Set as Featured Article</button>
        {(tagEditorShown) ? <ArticleTagEditor setTagState={setTagState} tags={tags}/> : <></>}
        </div>
            <EditorToolbar isInitial={(!!initialArticleState)} saveDocument={saveDocument} toggleDraftStatus={toggleDraftStatus}/>
            </>
    );
}
