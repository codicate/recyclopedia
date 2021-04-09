import React from 'react';
import Form from 'components/Form/Form';
import Button from 'components/Form/Button';

export default function Admin({ articlesData, setArticlesData }) {
  function submitHandler(input) {
    const newData = {
      "articles": articlesData.articles.concat(input)
    };
    setArticlesData(newData);
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