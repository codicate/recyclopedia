//Return the current property of a ref if it is a ref

const getRefCurrent = (ref) => {
  return ref.hasOwnProperty("current")
    ? ref.current
    : ref;
};

export default getRefCurrent;