//Return the current property of a ref if it is a ref
export const getRefCurrent = (ref) => {
  return ref.hasOwnProperty("current")
    ? ref.current
    : ref;
};

export const validPageLink = (originalName) => `/recyclopedia/${originalName.toLowerCase().replace(" ", "_")}`;