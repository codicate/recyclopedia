import React from 'react';

import styles from 'pages/Admin/Admin.module.scss';
import Form from 'components/Form/Form';
import Button from 'components/Form/Button';

export default function Admin({ api, articlesData, setArticlesData, currentArticle }) {
  function submitHandler(input) {
    for (let index = 0; index < articlesData.articles.length; ++index) {
      if (articlesData.articles[index].name === input.name) {
        articlesData.articles[index].content = input.content;
        break;
      }
    }
    setArticlesData(articlesData);

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
              defaultValue: (currentArticle?.contents) ? currentArticle.contents : ""
            }]
        ]}
      >
        <Button type='submit'>Submit</Button>
      </Form>
    </>
  );
}
