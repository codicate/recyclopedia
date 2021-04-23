import React, { useState } from 'react';
import { preprocessMarkdown } from 'utils/preprocessMarkdown';

import styles from 'pages/Admin/Admin.module.scss';
import Form from 'components/Form/Form';
import Button from 'components/Form/Button';
import { uploadImage } from 'utils/functions';

function ImageURL({ children }) {
  return (
    <a
      href="#"
      onClick={
        () => {
          navigator.clipboard.writeText(`@@src='${children}'@@`).then(
            function () {
              alert("copied to clipboard");
            }
          );
        }}>
      {children}
    </a>
  );
}

function MediaPreview({ imagePreviewInfo, updateImageURLs }) {
  const [thumbnail, image] = imagePreviewInfo;

  return (
    <div className="image-preview-thing">
      <img key={thumbnail} src={thumbnail} alt={image} width="80px"></img>
      <ImageURL>{image}</ImageURL>
      <button
        onClick={() => {
          updateImageURLs(imageURLs => imageURLs.filter(([previewName]) => (previewName !== thumbnail)));
        }}
      >
        X
      </button>
    </div>
  );
}

export default function Admin({ api, articlesData, setArticlesData, currentArticle }) {
  function submitHandler(input) {
    setArticlesData({
      ...articlesData,
      articles: articlesData.articles.map(item => ({
        name: item.name,
        content: (item.name === input.name) ? input.content : item.content,
      }))
    });

    (async function () {
      await api.insertArticle(input);
      let result = await api.queryForArticles();
      setArticlesData(result);
    })();
  }

  const [imageURLs, updateImageURLs] = useState(
    function() {
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
              const image_file = target.files[0];
              const img = document.createElement('img');
              img.src = URL.createObjectURL(image_file);
              img.onload = async function () {
                const canvas = document.createElement("canvas");
                const canvas_context = canvas.getContext("2d");

                canvas.width = img.width;
                canvas.height = img.height;

                canvas_context.drawImage(img, 0, 0);
                const imgData = canvas.toDataURL().split(',')[1];

                const imgURL = await uploadImage(imgData);
                if (imgURL.success) {
                  updateImageURLs(imageURLs.concat([[imgURL.data.thumb.url, imgURL.data.url]]));
                } else {
                  console.error("IMGBB is down. Tony pls get us a server");
                }
              };
            }
          }
        />
      </form>

      <Form
        submitFn={submitHandler}
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
