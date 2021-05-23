import React, { useState } from 'react';
import { preprocessMarkdown } from 'utils/preprocessMarkdown';

import Form from 'components/Form/Form';
import Button from 'components/Form/Button';

import { uploadImage, retrieveImageData } from 'utils/functions';
import { MediaPreview } from "../MediaPreview";
import { widgets, flattenWidgetStateTypes } from './RichTextEditWidgetInformation.js';

/*
  Until appendToTextArea actually exists,
  it's supposed to be a function that appends to a text area.

  Then gives us the new selection region. Then we could select in between the inserted
  area.

  The current input may not be able to do that, so this is a "stub"
 */
function editorHandleKeybindings({saveDocument,
                                  updateDirtyFlag,
                                  appendToTextArea}) {
    return function (event) {
        let {key, shiftKey, ctrlKey} = event;
        let disableDefaultBehavior = false;
        if (ctrlKey) {
            if (!shiftKey) {
                switch (key) {
                case 's':
                    saveDocument();
                    disableDefaultBehavior = true;
                    break;
                case 'b':
                    appendToTextArea("**bold text**");
                    disableDefaultBehavior = true;
                    break;
                case 'i':
                    appendToTextArea("_Italic text_");
                    disableDefaultBehavior = true;
                    break;
                case 'u':
                    appendToTextArea("__Underlined Text__");
                    disableDefaultBehavior = true;
                    break;
                case '1': case '2': case '3': case '4': case '5': case '6':
                    appendToTextArea("#".repeat(Number(key)) + " Heading");
                    disableDefaultBehavior = true;
                    break;
                }
            } else {
                switch (key) {
                case 'U':
                case 'O':
                    alert("This editor does not support automatically inserted list items!");
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
    }
}

export function MarkdownEditor({ submissionHandler, currentArticle, updateDirtyFlag, toggleDraftStatus }) {
  const [imageURLs, updateImageURLs] = useState(
    function () {
      let existing_images = [];
      if (currentArticle?.content) {
        preprocessMarkdown(currentArticle.content, (img) => existing_images.push([img, img]));
      }
      return existing_images;
    }()
  );

  return (
    <>
      <div> {/*requires styling*/}
        {
          Object.entries(flattenWidgetStateTypes(widgets)).map(
            ([widgetId, widget]) => (<button
              key={widgetId}
              id={widgetId}
              onClick={
                (_) => {
                    editorHandleKeybindings({
                        saveDocument: function() {
                            console.log("STUB: saveDocument!");
                        },
                        updateDirtyFlag: updateDirtyFlag,
                        appendToTextArea: function(text) {
                            console.log("STUB ", text);
                        }
                    });
                    console.log(widgetId, widget.category, widget.command, widget.argument);
                }
              }>{(widget.display) ? widget.display : widget.name}</button>)
          )
        }
      </div>
      <h2>Upload Media</h2>
      {
        imageURLs.map((info) => <MediaPreview updateImageURLs={updateImageURLs} imagePreviewInfo={info} />)
      }
      <form>
        <input
          type="file"
          onChange={
              ({ target }) => {
                  retrieveImageData(target.files[0], 
                      function (imgData) {
                          uploadImage(imgData).then(
                              function (imgURL) {
                                  if (imgURL.success) {
                                      updateImageURLs(imageURLs.concat([[imgURL.data.thumb.url, imgURL.data.url]]));
                                  } else {
                                      console.error("IMGBB is down. Tony pls get us a server");
                                  }
                              }
                          );
                      });
              }
          }
        />
      </form>

      <Form
        submitFn={(input) => submissionHandler(input)}
        inputItems={[
          ["name",
            "Name",
            (currentArticle?.name) &&
            {
              defaultValue: currentArticle.name,
              readOnly: true
            }
          ],
          ["content", "Content",
            {
              option: 'textarea',
              defaultValue: (currentArticle?.content) && currentArticle.content
            }
          ]
        ]}
      >
        <Button onClick={() => {toggleDraftStatus();} }>
          Toggle Draft Status
        </Button>
        <Button type='submit'>
          {(currentArticle)
           ? "Save Article"
           : "Submit Article"}
        </Button>
      </Form>
    </>
  );
}
