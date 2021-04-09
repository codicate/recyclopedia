import { useState } from 'react';

import Input from 'components/Form/Input';
import Textarea from 'components/Form/Textarea';

const Form = ({ submitFn, children, inputItems }) => {
  const defaultItems = inputItems.reduce((
    dict, item
  ) => {
    dict[item[0]] = item[2]?.defaultValue || '';
    return dict;
  }, {});

  const [input, setInput] = useState(defaultItems);

  const changeHandler = (e) => {
    const { name, value } = e.target;

    setInput({
      ...input,
      [name]: value
    });
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    const reset = submitFn
      ? await submitFn(input)
      : true;

    reset && setInput(defaultItems);
  };

  return (
    <form onSubmit={submitHandler}>
      {
        inputItems.map((item, idx) => (
          item[2]?.option === 'textarea'
            ? (
              <Textarea
                key={idx}
                changeHandler={changeHandler}
                name={item[0]}
                value={input[item[0]]}
                label={item[1]}
                {...item[2]}
              />
            )
            : (
              <Input
                key={idx}
                changeHandler={changeHandler}
                name={item[0]}
                value={input[item[0]]}
                label={item[1]}
                {...item[2]}
              />
            )
        ))
      }
      {children}
    </form>
  );
};

export default Form;