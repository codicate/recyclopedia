/*
  A very minimal in-house Rich Text Editor.

  Please keep this as one giant file. I'd rather sift through
  a thousand lines here, than going through multiple different files.

  Also this is not a "modular" Rich Text Editor, and it isn't really supposed to be.
  Although it probably could with some slightly more careful thought since most of the logic
  will work fine.
  
  You just need a title element and body element to focus on, and the rest may work just
  fine.

  NOTE(jerry):
  Hmmm, I am curious to know what would the best method be to allow for draggable images with
  captions? It probably doesn't matter too much, but I'd like to know.

  It might not be worth the effort to try and do, as I'm certain someone can probably just
  put the image at the right place later on.

  I'll probably leave it out until it's requested?

  NOTE(jerry):
  For obvious reasons, this can be shortened later. Probably not 100%, and I might have to do
  something like a weird tagged union with a single context menu component that just does conditional
  rendering for every type of thing, which I guess is fine too.

  Keeping it one place or something like that.

  Why is contenteditable so hacky?

  TODO(jerry):
  Hmmm, for some reason the float changing of images with captions doesn't work.
  Investigate later.

  (Oh... Yeah I should've used a class for that. Whoops)
*/
import React, {
  useState,
  useRef,
  KeyboardEventHandler,
  useEffect,
  CSSProperties,
} from "react";

import { preprocessMarkdown } from "utils/preprocessMarkdown";
import {
  uploadImage,
  retrieveImageData,
  classListReplace,
  classListClear,
  selectionStackPop,
  selectionStackPush,
  dictionaryUpdateKeyNested,
  isVoidElement,
} from "utils/functions";

import { renderMarkdown } from "components/Article/MarkdownRender";
import { renderDomAsMarkdown } from "utils/DOMIntoMarkdown";

import {
  widgets,
  toggleWidgetActiveState,
  flattenWidgetStateTypes,
} from "./RichTextEditWidgetInformation";

import { Article } from "app/articlesSlice";
import Input from "components/Form/Input";

import bottomToolbarStyle from "./bottomToolbar.module.scss";
import editorStyle from "./RichTextEditor.module.scss";
import articleStyles from "components/Article/Article.module.scss";
import Button from "components/UI/Button";
import { isVoidExpression } from "typescript";

/** Unsafe wrappers... Cause most of this has to be unsafe to be even possible... **/
/** Well... Draft.JS is a thing, but that can't exactly do the same thing as this... Otherwise it would require way less code. **/
/** Although Draft.JS itself is actually pretty big. **/
function unsafeDOMStyleSet(element: HTMLElement, style: string) {
  // @ts-expect-error
  element.style = style;
}
function unsafeReferenceSet<T>(ref: React.RefObject<T>, value: T) {
  //@ts-expect-error
  ref.current = value;
}

function ExecuteRichTextCommand(commandName: string, optionalArgument?: string, hookFn?: (name: string) => void) {
  switch (commandName) {
  case "@_insertImage": {
    const fileDialog = document.createElement("input");
    fileDialog.type = "file";
    fileDialog.click();
    fileDialog.addEventListener("change", fileHandlerOnChange);
  }
    break;
  case "@_hyperlink": break;
  default:
    document.execCommand(commandName, false, optionalArgument);
    return;
  }

  hookFn?.(commandName);
}

function queryRichTextCommand(command: string, wantedValue?: boolean) {
  /*
    NOTE(jerry):

    Is there no way to query the selection state of a link?

    I would like to know if this is the case cause otherwise... That's kind of fucked.
  */
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
              document.execCommand("insertParagraph");
            } else {
              console.error("IMGBB is down. Tony pls get us a server");
            }
          }
        );
      });
}

interface EditorHandleKeyBindingsProperties {
  saveDocument: () => void,
  toggleWidget: (widgetId: string, categoryValue?: string) => void,
  executeRichTextCommand: typeof ExecuteRichTextCommand,
  updateDirtyFlag: React.Dispatch<boolean>,
}
function editorHandleKeybindings({
  saveDocument,
  toggleWidget,
  executeRichTextCommand,
  updateDirtyFlag
}: EditorHandleKeyBindingsProperties): KeyboardEventHandler<HTMLDivElement> {
  return function (event) {
    const { key, shiftKey, ctrlKey } = event;
    let disableDefaultBehavior = false;
    if (ctrlKey) {
      if (!shiftKey) {
        switch (key) {
        case "s":
          saveDocument();
          disableDefaultBehavior = true;
          break;
        case "b":
          toggleWidget("bold");
          executeRichTextCommand("bold");
          disableDefaultBehavior = true;
          break;
        case "i":
          toggleWidget("italic");
          executeRichTextCommand("italic");
          disableDefaultBehavior = true;
          break;
        case "u":
          toggleWidget("underline");
          executeRichTextCommand("underline");
          disableDefaultBehavior = true;
          break;
        case "1": case "2": case "3": case "4": case "5": case "6":
          toggleWidget(`h${key}`, "heading");
          executeRichTextCommand("heading", `H${key}`);
          disableDefaultBehavior = true;
          break;
        }
      } else {
        console.log("CTRL and SHIFT", key);
        switch (key) {
        case "U":
          console.log("unordered list");
          executeRichTextCommand("insertunorderedlist");
          disableDefaultBehavior = true;
          break;
        case "O":
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

interface EditorToolbarProperties {
  toggleDraftStatus: () => void,
  saveDocument: () => void,
  isInitial: boolean,
}

// TODO better name.
function EditorToolbar({ toggleDraftStatus, saveDocument, isInitial }: EditorToolbarProperties) {
  return (<div className={bottomToolbarStyle.main}>
    <Button onClick={() => { toggleDraftStatus(); }}>
      Toggle Draft Status
    </Button>
    <Button onClick={saveDocument}>
      {(isInitial) ? "Save Article" : "Publish Article"}
    </Button>
  </div>);
}

function TagDisplay({ id, name, removeTag }: { id: string, name: string, removeTag: (id: string) => void }) {
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
}

// You know, this looks ugly, but it's almost hilarious that this is the shortest thing here...
function ArticleTagEditor({ tags, setTagState }: ArticleTagEditorProperties) {
  const [input, setInput] = useState("");

  function removeTagById(id: string) {
    setTagState(tags.filter((tagName) => id !== tagName));
  }

  return (
    <div
      className={editorStyle.tageditor}>
      <button
        className={editorStyle.button}
        onClick={() => setTagState([])}
      >Clear</button>
      {tags?.map((tag) => <TagDisplay removeTag={removeTagById} key={tag} id={tag} name={tag} />)}
      <input
        value={input}
        onChange={
          function (event) {
            setInput(event.target.value);
          }
        }
        onKeyDown={
          function ({ key }) {
            if (key === "Backspace" && input.length === 0) {
              setTagState(tags?.slice(0, tags.length - 1));
            } else if (key === "Enter" && input.length > 0) {
              // too lazy to google for proper function.
              const doesIndexAlreadyExist = tags?.indexOf(input) !== -1;
              if (!doesIndexAlreadyExist) {
                setTagState(tags?.concat([input]));
                setInput("");
              }
            }
          }
        }
      ></input>
    </div>
  );
}

interface ImageContextSettingsProperties {
  closeShownStatus: () => void,
  imageRef: React.RefObject<HTMLImageElement>,
}

enum ImageDimensionsType {
  Custom,
  Default,
}

enum LayoutFloatMode {
  Left,
  Center,
  Right,
}

// May return more information in the future?
export function imageDOMGetCaption(rootNode: Element | null) {
  if (rootNode) {
    let captionTextContents = "";

    if (rootNode.tagName === "IMG") {
      const parentNode = (rootNode.parentNode as Element);

      if (parentNode.tagName === "DIV") {
        if (parentNode.classList.contains(articleStyles.captionBox)) {
          const captionElement = parentNode.getElementsByClassName(articleStyles.captionBoxInner)[0];
          captionTextContents = captionElement.textContent || "";
        } else {
          return undefined;
        }
      } else {
        return undefined;
      }
    }

    return {
      text: captionTextContents
    };
  }

  return undefined;
}

function captionImageThumbnailStyleString(width: number, height: number) {
  return `width: ${width}px; height: ${height}px;`;
}

function captionImageBlockStyleString(width: number) {
  return `width: ${width+3}px;`;
}

function floatModeStyle(layoutFloatMode: LayoutFloatMode) {
  switch (layoutFloatMode) {
  case LayoutFloatMode.Left:
    return(articleStyles.floatLeft);
  case LayoutFloatMode.Center:
    return(articleStyles.floatCenter);
  case LayoutFloatMode.Right:
    return(articleStyles.floatRight);
  }
}

function imageDOMGetFloatStyle(rootNode: Element | null) : LayoutFloatMode {
  function styleFromClassList(rootNode: Element) {
    if (rootNode.classList.contains(articleStyles.floatLeft)) {
      return LayoutFloatMode.Left;
    } else if (rootNode.classList.contains(articleStyles.floatCenter)) {
      return LayoutFloatMode.Center;
    } else if (rootNode.classList.contains(articleStyles.floatRight)) {
      return LayoutFloatMode.Right;
    }
    return LayoutFloatMode.Left;
  }

  if (rootNode) {
    if (imageDOMHasCaption(rootNode)) {
      const parentNode = (rootNode.parentNode as HTMLElement);
      return styleFromClassList(parentNode);
    } else {
      return styleFromClassList(rootNode);
    }
  }

  return LayoutFloatMode.Left;
}

// You are calling this only if you know you can do this safely.
// Hahah no checks eh??? What's that first line then?
function imageDOMUpdateCaptionWithNoChecks(rootNode: Element | null, newWidth: number, newHeight: number, layoutFloatMode: LayoutFloatMode, textContent: string) {
  if (rootNode) {
    const parentNode = (rootNode.parentNode as HTMLElement);

    if (parentNode.tagName === "DIV") {
      const imageNode = rootNode as HTMLImageElement;
      unsafeDOMStyleSet(imageNode, captionImageThumbnailStyleString(newWidth, newHeight));
      imageNode.classList.toggle(articleStyles.captionImagePreview);

      unsafeDOMStyleSet(parentNode, captionImageBlockStyleString(newWidth));

      if (parentNode.classList.contains(articleStyles.captionBox)) {
        console.log(parentNode.classList);
        classListReplace(parentNode, [articleStyles.captionBox, floatModeStyle(layoutFloatMode)]);
        console.log(parentNode.classList);

        const captionElement = parentNode.getElementsByClassName(articleStyles.captionBoxInner)[0];
        captionElement.children[0].textContent = textContent;
      }
    }
  }
}

export function imageDOMHasCaption(rootNode: Element | null) {
  if (rootNode) {
    const check = imageDOMGetCaption(rootNode);
    return check !== undefined;
  }

  return false;
}

function imageDOMConstructCaptionedImage(imageOriginalNode: HTMLImageElement, layoutFloatMode: LayoutFloatMode, captionText: string) {
  const result = document.createElement("DIV");

  let image_tag = "<img ";
  image_tag += `class="${articleStyles.captionImagePreview}" src=${imageOriginalNode.src} style="${captionImageThumbnailStyleString(imageOriginalNode.width, imageOriginalNode.height)}"></img>`;

  // TODO(jerry): This needs to be factored out, as it is also used by the markdown preprocessor to generate our captions.
  result.innerHTML = `<div class="${articleStyles.captionBox + " " + floatModeStyle(layoutFloatMode)}" style="${captionImageBlockStyleString(imageOriginalNode.width)}">
          ${image_tag}
      <div class=${articleStyles.captionBoxInner}>
        <p contenteditable="false">${captionText}</p>
      </div>
    </div>
    <p></p>`.trim();

  console.log(result.outerHTML);
  const innerResult = result.firstChild;
  return {
    captionNode: innerResult as Element,
    //@ts-ignore
    imageNode: innerResult.childNodes[0]
  };
}

/*
  TODO(jerry):
  Like the other context settings, I would prefer if this had more feedback,
  and obviously I would prefer this to be shorter.
*/
function ImageContextSettings(properties: ImageContextSettingsProperties) {
  const imageObject = properties.imageRef?.current;
  const captionInformation = imageDOMGetCaption(imageObject);

  const [imageCaptionText, setImageCaptionText] = useState(captionInformation?.text || "");
  console.log(imageCaptionText);

  const [layoutFloatMode, setLayoutFloatMode] = useState(imageDOMGetFloatStyle(imageObject));
  const [imageAllowsWrapAround, setImageAllowWrapAroundText] = useState(true);
  const [imageDimensionType, setImageDimensionType] = useState(ImageDimensionsType.Default);
  const [imageDimensionCustomWidth, setImageDimensionCustomWidth] = useState(imageObject?.width || 150);
  const [imageDimensionCustomHeight, setImageDimensionCustomHeight] = useState(imageObject?.height || 150);

  function applyChanges() {
    if (imageObject) {
      let newWidth = imageObject.width;
      let newHeight = imageObject.height; 

      if (imageDimensionType === ImageDimensionsType.Custom) {
        newWidth = imageDimensionCustomWidth || imageObject.width;
        newHeight = imageDimensionCustomHeight || imageObject.height;
      }

      imageObject.width = newWidth;
      imageObject.height = newHeight;

      const hasCaption = imageDOMHasCaption(imageObject);
      if (!hasCaption && imageCaptionText === "") {
        classListClear(imageObject);
        /*
        NOTE(jerry):
        This is kind of iffy and I'm not particularly sure how to get the CSS to do
        this properly.
  
        Probably doesn't matter too much...

        Also new styling for input[type="check"] ended up breaking this. That's not so
        great.
        */
        if (!imageAllowsWrapAround) {
          imageObject.classList.add(articleStyles.noWrapAroundText);
        }

        imageObject.classList.add(floatModeStyle(layoutFloatMode));
      } else {
        if (hasCaption) {
          imageDOMUpdateCaptionWithNoChecks(imageObject, newWidth, newHeight, layoutFloatMode, imageCaptionText);
        } else {
          // build a new caption object...
          const captionBuildResult =
            imageDOMConstructCaptionedImage(imageObject as HTMLImageElement, layoutFloatMode, imageCaptionText);

          imageObject.replaceWith(captionBuildResult.captionNode);
          unsafeReferenceSet(properties.imageRef, captionBuildResult.imageNode);
        }
        setImageCaptionText("");
      }
    }

    console.log("end of apply changes");
    properties.closeShownStatus();
  }

  // This is being done as dirty as possible because I just need it to work.
  // although you can autogenerate the UI from the objects.
  return (
    <div id={editorStyle.blotOut}>
      <div className={editorStyle.settingsWindow} id={editorStyle.imageContextSettingsWindow}>
        <h1>Image Settings <a onClick={(_) => properties.closeShownStatus()} className={editorStyle.xOut}>X</a></h1>
        <div style={{ margin: "2.5em" }}>
          <p style={{textAlign: "center"}}><i>{imageObject?.src}</i></p>
          <div className={editorStyle.imagePreview} dangerouslySetInnerHTML={{
            __html:
              function () {
                if (imageObject) {
                  return `<img src=${imageObject.src}></img>`;
                } else {
                  return "<p>no image</p>";
                }
              }()
          }} />
          {/* Float Type */}
          <div className={editorStyle.contextGroupedRadio}>
            {

              [
                { text: "Left", type: LayoutFloatMode.Left },
                { text: "Center", type: LayoutFloatMode.Center },
                { text: "Right", type: LayoutFloatMode.Right },
              ].map((({ text, type }) => (
                <a className={((type === layoutFloatMode) ? editorStyle.currentlySelected : "")}
                  key={type}
                  onClick={(e) => setLayoutFloatMode(type)}>
                  {text}
                </a>)))
            }
          </div>
          <hr></hr>
          {/* Dimension Type */}
          <div className={editorStyle.contextGroupedRadio}>
            {

              [
                { text: "Default", type: ImageDimensionsType.Default },
                { text: "Custom", type: ImageDimensionsType.Custom },
              ].map((({ text, type }) => (
                <a className={((type === imageDimensionType) ? editorStyle.currentlySelected : "")}
                  key={type}
                  onClick={(e) => setImageDimensionType(type)}>
                  {text}
                </a>)))
            }
          </div>
          <div className={(imageDimensionType !== ImageDimensionsType.Custom) ? editorStyle.unfocused : ""} id={editorStyle.dimensionPicker}>
            <h2>Resolution Selection</h2>
            <input
              value={imageDimensionCustomWidth}
              onChange={(e) => setImageDimensionCustomWidth(Number.parseInt(e.target.value))}
              type="number"></input>
            <span>x</span>
            <input
              value={imageDimensionCustomHeight}
              onChange={(e) => setImageDimensionCustomHeight(Number.parseInt(e.target.value))}
              type="number"></input>
          </div>
          {/*Caption Text*/}
          <hr></hr>
          <p style={{textAlign: "center"}}>&ldquo;{imageCaptionText}&rdquo;</p>
          <Input
            label="Image Caption"
            changeHandler={
              function (e) {
                setImageCaptionText(e.target.value);
              }
            }
            defaultValue={imageCaptionText}
            value={imageCaptionText} />
          {/*
          Wrap

          What is this supposed to do again?
          */}
          {
            /*
          <label>Wrap Around</label>
          <input type="checkbox" 
            checked={imageAllowsWrapAround}
            onChange={
              function(e) {
                setImageAllowWrapAroundText(e.target.checked);
              }
            }></input>
            */
          }
        </div>
        <div className={editorStyle.alignToBottom}>
          <button onClick={applyChanges}>Apply Changes</button>
        </div>
      </div>
    </div>
  );
}

interface HyperlinkContextSettingsProperties {
  closeShownStatus: () => void,
  hyperlinkRef: React.RefObject<HTMLAnchorElement>,
}

/*
  TODO(jerry):

  I would like this to give more feedback regarding inputs.
*/
function HyperlinkContextSettings(properties: HyperlinkContextSettingsProperties) {
  const [hyperlinkText, setHyperlinkText] = useState("");
  const [hyperlinkAnchorText, setHyperlinkAnchorText] = useState("");

  useEffect(() => { selectionStackPush(); }, []);

  function applyChanges() {
    console.log(properties.hyperlinkRef.current);
    if (hyperlinkText !== "" && hyperlinkAnchorText !== "") {
      selectionStackPop();
      if (!properties.hyperlinkRef?.current) {
        ExecuteRichTextCommand("insertHTML", `<a href=${hyperlinkAnchorText}>${hyperlinkText}</a>`);
      } else {
        properties.hyperlinkRef.current.href = hyperlinkAnchorText;
        properties.hyperlinkRef.current.textContent = hyperlinkText;
      }
      properties.closeShownStatus();
    }
  }

  return (
    <div id={editorStyle.blotOut}>
      <div className={editorStyle.settingsWindow} id={editorStyle.hyperlinkContextSettingsWindow}>
        <h1>Hyperlink Creation <a onClick={(_) => properties.closeShownStatus()} className={editorStyle.xOut}>X</a></h1>
        <div style={{ margin: "2.5em" }}>
          <p>Hyperlink</p>
          <Input 
            label="Hyperlink Contents"
            changeHandler={
              function (e) {
                setHyperlinkText(e.target.value);
              }
            }
            defaultValue={hyperlinkText}
            value={hyperlinkText} />
          <p>Anchor Location</p>
          <Input
            label="Hyperlink Location"
            changeHandler={
              function (e) {
                setHyperlinkAnchorText(e.target.value);
              }
            }
            defaultValue={hyperlinkAnchorText}
            value={hyperlinkAnchorText} />
        </div>
        <div className={editorStyle.alignToBottom}>
          <button onClick={applyChanges}>Apply Changes</button>
        </div>
      </div>
    </div>
  );
}

interface Position {
  x: number,
  y: number,
}

interface ImageContextMenuProperties {
  image: HTMLImageElement | null,
  position: Position,
  openEdit: () => void,
  close: () => void,
}

function absolutePositionAt(x: number, y: number): CSSProperties {
  return {
    position: "absolute",
    left: `${x}px`,
    top: `${y}px`,
  };
}

function ImageContextMenu(properties: ImageContextMenuProperties) {
  const {position, image, openEdit, close} = properties;
  if (!image) return <></>;

  return (
    <div className={editorStyle.contextMenu} style={absolutePositionAt(position.x, position.y)}>
      <i style={{margin: "2em"}}>{image.src || "No image selected?"}</i>
      <br></br>
      <br></br>
      <button onClick={openEdit}>Edit</button>
      <button onClick={
        function() {
          const hasCaption = imageDOMHasCaption(image);
          if (hasCaption) {
            ((image.parentNode) as HTMLElement).remove();
          } else {
            image.remove();
          }
          close();
        }}>Remove Image</button>
    </div>
  );
}

interface HyperlinkContextMenuProperties {
  link: HTMLAnchorElement | null,
  position: Position,
  openEdit: () => void,
  close: () => void,
}

function HyperlinkContextMenu(properties: HyperlinkContextMenuProperties) {
  const {position, link, openEdit, close} = properties;
  if (!link) return <></>;

  return (
    <div className={editorStyle.contextMenu} style={absolutePositionAt(position.x, position.y)}>
      <i style={{margin: "2em"}}>{link.href || "No href selected?"}</i>
      <br></br>
      <br></br>
      <button onClick={openEdit}>Edit</button>
      <button onClick={
        function() {
          link.remove();
          close();
        }
      }>Remove Hyperlink</button>
    </div>
  );
}

interface RichTextEditorProperties {
  submissionHandler: (f: { name: string, tags: string[], content: string; }) => void,
  currentArticle?: Article,
  updateDirtyFlag: React.Dispatch<React.SetStateAction<boolean>>,
  toggleDraftStatus: () => void,
}

/*
  why does image have a cursor? This is such a stupid stupid hack, but this one is technically unavoidable
  behavior afaik.

  We could make images not contenteditable and handle their case individually? But I don't think images get
  focus so I can't really do the thing I want to do.

  NOTE(jerry): name is to get a nice little laugh. I promise I'm more professional than this.
*/
function put_the_cursor_in_a_fucking_place_i_can_actually_type_in() {
  const currentSelection = window.getSelection();
  const anchorNode = currentSelection?.anchorNode;

  if (anchorNode && isVoidElement(anchorNode)) {
    const anchorNodeAsElement = anchorNode as Element;

    if (anchorNodeAsElement.nextElementSibling) {
      currentSelection?.collapse(anchorNodeAsElement.nextElementSibling);
    } else {
      if (anchorNodeAsElement.parentNode) {
        let goodTarget = anchorNodeAsElement.parentNode.nextSibling;
        // when the hell does the browser decide to generate <BR> and not <P><BR></P>?????
        while (goodTarget && isVoidElement(goodTarget)) {
          goodTarget = goodTarget.nextSibling;
        }

        currentSelection?.collapse(goodTarget);
        currentSelection?.collapseToEnd();
      }
    }
  }
}

export function RichTextEditor({
  submissionHandler,
  currentArticle,
  updateDirtyFlag,
  toggleDraftStatus
}: RichTextEditorProperties) {
  const [initialArticleState, _] = useState(currentArticle);
  const [tagEditorShown, setTagEditorVisibility] = useState(true);

  const [imageContextEditorShown, setImageContextEditorVisibility] = useState(false);
  const [hyperlinkContextEditorShown, setHyperlinkContextEditorShown] = useState(false);

  const [tags, setTagState] = useState((currentArticle?.tags) || []);

  const editableTitleDOMRef = useRef<HTMLHeadingElement>(null);
  const editableAreaDOMRef = useRef<HTMLDivElement>(null);
  const currentImageRef = useRef<HTMLImageElement>(null);
  const currentHyperlinkRef = useRef<HTMLAnchorElement>(null);

  const [imageContextMenuPosition, setImageContextMenuPosition] = useState<undefined | Position>(undefined);
  const [hyperLinkContextMenuPosition, setHyperLinkContextMenuPosition] = useState<undefined | Position>(undefined);

  useEffect(
    function () {
      document.execCommand("defaultParagraphSeparator", false, "p");
      if (editableAreaDOMRef.current) {
        editableAreaDOMRef.current.onmousedown =
          function (e) {
            /*/goodT
              I do not know of a way to get a ref into newly generated
              HTML, so we can't exactly do this in a very React way.
 
              The only other thing I could think of is generating react friendly
              mark-up, but I don't want a ref to every single element, but I could
              probably do it with
 
              onClick for all of the images to set a "currentFocusedImage" to whatever
              was clicked on, which would suffice.
 
              I'm pretty sure markdown-it exposes an "AST" sort of thing so I can get
              that to generate JSX which can use the above. That's later though.
            */

            const target = e.target as HTMLElement;

            setImageContextMenuPosition(undefined);
            unsafeReferenceSet(currentImageRef, null);
            unsafeReferenceSet(currentHyperlinkRef, null);

            if (target?.tagName === "IMG") {
              unsafeReferenceSet(currentImageRef, target);
              setImageContextMenuPosition({
                x: target.offsetLeft,
                y: target.offsetTop,
              });
            } else if (target?.tagName === "A") {
              unsafeReferenceSet(currentHyperlinkRef, target);
              setHyperLinkContextMenuPosition({
                x: target.offsetLeft,
                y: target.offsetTop,
              });
            }
          };
      }
    }, [editableAreaDOMRef]);

  const [widgetStates, updateWidgetState] = useState(widgets);

  function saveDocument() {
    if (editableAreaDOMRef.current && editableTitleDOMRef.current) {
      const markdownText = renderDomAsMarkdown(editableAreaDOMRef.current);
      console.log("output:");
      console.log(markdownText);
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

  // @ts-ignore
  function synchronizeCommandStateToWidgetBar(e) {
    put_the_cursor_in_a_fucking_place_i_can_actually_type_in();
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
            executeRichTextCommand: ExecuteRichTextCommand,
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
        <button style={{ float: "left", marginLeft: "3em" }}
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
                  // NOTE(jerry): Wtf happened here?
                  (widget.category) ? (((widgetStates[
                    (widget.category !== undefined) ?
                      widget.category :
                      widgetId].active) === widgetId) ?
                    editorStyle.active : editorStyle.button)
                    : editorStyle.button
                }
                onClick={
                  (_) => {
                    _toggleWidgetActiveState(widgetId, widget.category);
                    ExecuteRichTextCommand(widget.command, 
                      widget.argument,
                      function (name: string) {
                        if (name === "@_hyperlink") {
                          setHyperlinkContextEditorShown(true);
                        }
                      });
                  }
                }>{(widget.display) ? widget.display : widget.name}
              </button>
          )
        }
        <button style={{ float: "right", marginRight: "3em" }}
          className={editorStyle.button}
        >Set as Featured Article</button>
        {(tagEditorShown) ? <ArticleTagEditor setTagState={setTagState} tags={tags} /> : <></>}
      </div>
      <EditorToolbar isInitial={(!!initialArticleState)} saveDocument={saveDocument} toggleDraftStatus={toggleDraftStatus} />
      { (imageContextEditorShown) ?
        <ImageContextSettings imageRef={currentImageRef} closeShownStatus={() => { setImageContextEditorVisibility(false); }} /> : <></>}
      {(hyperlinkContextEditorShown) ?
        <HyperlinkContextSettings 
          hyperlinkRef={currentHyperlinkRef}
          closeShownStatus={() => { setHyperlinkContextEditorShown(false); }} /> : <></>}
      { (imageContextMenuPosition) ? (
        <ImageContextMenu 
          close={ () => setImageContextMenuPosition(undefined) }
          openEdit={
            function() {
              setImageContextMenuPosition(undefined);
              setImageContextEditorVisibility(true);
            }
          } image={currentImageRef.current} position={imageContextMenuPosition}/>
      ) : <></> }
      {(hyperLinkContextMenuPosition) ? (
        <HyperlinkContextMenu
          close={() => setHyperLinkContextMenuPosition(undefined)}
          openEdit={
            function () {
              setHyperLinkContextMenuPosition(undefined);
              setHyperlinkContextEditorShown(true);
            }
          } link={currentHyperlinkRef.current} position={hyperLinkContextMenuPosition} />
      ) : <></>}
    </>
  );
}
