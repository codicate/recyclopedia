import React, { useEffect, useRef } from 'react';
import { Secrets } from "secrets";

//Return the current property of a ref if it is a ref
export const getRefCurrent = (ref: React.MutableRefObject<any>) => {
  return ref.hasOwnProperty("current")
    ? ref.current
    : ref;
};

export const validPageLink = (originalName: string) => `/${originalName.toLowerCase().trim().replace(/ +/g, '_')}`;

export async function uploadImage(image_name: string) {
  let form_data = new FormData();
  form_data.append("image", image_name);

  const expirationValue = 600;
  const requestUrl = `https://api.imgbb.com/1/upload?expiration${expirationValue}&key=${Secrets.IMGBB_KEY}`;
  const res = await fetch(requestUrl, { method: "POST", body: form_data, });

  return await res.json();
}

// for now this is an alias.
type Base64String = string;
type RetrievedImageCallback = (f: Base64String) => void;
export async function 
retrieveImageData(
  imageFileName: string,
  whenRetrieved: RetrievedImageCallback
) {
  const image_file = imageFileName;
  const img = document.createElement('img');
  img.src = URL.createObjectURL(image_file);
  img.onload = async function () {
    const canvas = document.createElement("canvas");
    const canvas_context = canvas.getContext("2d");
    if (canvas_context) {
      canvas.width = img.width;
      canvas.height = img.height;

      canvas_context.drawImage(img, 0, 0);
      const imgData = canvas.toDataURL().split(',')[1];
      whenRetrieved(imgData);
    }
  };
}

/*
  These functions are legitimately supposed to be any. These are supposed to operate indiscriminately
  on any type of dictionary like object.

  Javascript allows you to use anything as a key technically for dictionaries,
  but this is as close I can get to that I suppose...
 */
export function dictionaryUpdateKey(dictionary: {[key: string]: any}, key: any, updateFunction: (f: any) => any) {
  let newDictionary = { ...dictionary };
  newDictionary[key] = updateFunction(dictionary[key]);
  return newDictionary;
}

export function dictionaryUpdateKeyNested(dictionary: {[key: string]: any}, keys: any[], updateFunction: (f: any) => any) {
  if (keys.length > 1) {
    let shallowClone = { ...dictionary };
    shallowClone[keys[0]] =
      dictionaryUpdateKeyNested(shallowClone[keys[0]], keys.slice(1), updateFunction);
    return shallowClone;
  }

  return dictionaryUpdateKey(dictionary, keys[0], updateFunction);
}

export const useTimeout = (callback : (f: void) => void, delay: number) => {
  useEffect(() => {
    const timer = setTimeout(() => callback(), delay);
    return () => clearTimeout(timer);
  }, [delay, callback]);
};

export function randomElt(array: any[]) {
  return array[Math.floor(Math.random() * array.length)];
}
