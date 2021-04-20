import React from 'react';
import Form from 'components/Form/Form';
import Button from 'components/Form/Button';

export default function Admin({ api, articlesData, setArticlesData }) {
  function submitHandler(input) {
      (async function() {
          await api.insertArticle(input);
          let result = await api.queryForArticles();
          setArticlesData(result);
          console.log("Article written! ", result);
      })();
  }

  return (
    <div>
      <Form
        submitFn={submitHandler}
        inputItems={[
          ["name", "Name"],
          ["content", "Content", { option: 'textarea' }]
        ]}>
        <Button type='submit'>Submit</Button>

      </Form>
    </div>
  );
}
