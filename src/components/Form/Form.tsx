import { useState, FormEvent } from 'react';

import Input, { InputOptions, ChangeHandler } from 'components/Form/Input';

function Form<
  T extends { [name: string]: InputOptions; }
>({
  className,
  submitFn,
  children,
  inputItems
}: {
  className?: string;
  submitFn?: (inputItems: Record<keyof T, string>) => void | boolean | Promise<boolean | void>;
  children?: React.ReactNode;
  inputItems: T;
}) {

  const defaultItems = Object.assign(
    Object.entries(inputItems).map(([name, value]) => ({
      [name]: value.defaultValue || ''
    }))
  );

  const [input, setInput] = useState(defaultItems);

  const changeHandler: ChangeHandler = (e) => {
    const { name, value } = e.target;

    setInput({
      ...input,
      [name]: value
    });
  };

  const submitHandler = async (e: FormEvent) => {
    e.preventDefault();

    const reset = submitFn
      ? await submitFn(input)
      : true;

    reset && setInput(defaultItems);
  };

  return (
    <form
      className={className}
      onSubmit={submitHandler}
    >
      {
        Object.entries(inputItems).map(([name, value], idx) => (
          <Input
            key={idx}
            changeHandler={changeHandler}
            name={name}
            value={input[name]}
            {...value}
          />
        ))
      }
      {children}
    </form>
  );
};

export default Form;
