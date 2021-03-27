//Return the current property of a ref if it is a ref

const getElement = (element) => {
  return element.hasOwnProperty("current")
    ? element.current
    : element;
};

export default getElement;