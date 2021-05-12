import React, { useState } from 'react';
import { preprocessMarkdown } from 'utils/preprocessMarkdown';

import Form from 'components/Form/Form';
import Button from 'components/Form/Button';

import { uploadImage, retrieveImageData } from 'utils/functions';
import { MediaPreview } from "../MediaPreview";

export function MarkdownEditor({ submissionHandler, currentArticle }) {
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
                      function (imgURL) {
                          if (imgURL.success) {
                              updateImageURLs(imageURLs.concat([[imgURL.data.thumb.url, imgURL.data.url]]));
                          } else {
                              console.error("IMGBB is down. Tony pls get us a server");
                          }
                      });
              }
          }
        />
      </form>

      <Form
        submitFn={(input) => submissionHandler(input) }
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
        <Button type='submit'>
          {(currentArticle)
            ? "Save Article"
            : "Submit Article"}
        </Button>
      </Form>
    </>
  );
}
