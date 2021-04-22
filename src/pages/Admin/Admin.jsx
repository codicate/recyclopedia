import React from 'react';

import styles from 'pages/Admin/Admin.module.scss';
import Form from 'components/Form/Form';
import Button from 'components/Form/Button';

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

  return (
    <>
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
