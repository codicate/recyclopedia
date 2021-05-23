import React from "react";
import { Secrets } from "secrets";
import { useEffect } from 'react';
//Return the current property of a ref if it is a ref
export const getRefCurrent = (ref) => {
  return ref.hasOwnProperty("current")
    ? ref.current
    : ref;
};

export const validPageLink = (originalName) => `/${originalName.toLowerCase().trim().replace(/ +/g, '_')}`;

export async function uploadImage(image_name) {
  let form_data = new FormData();
  form_data.append("image", image_name);

  const expirationValue = 600;
  const requestUrl = `https://api.imgbb.com/1/upload?expiration${expirationValue}&key=${Secrets.IMGBB_KEY}`;
  const res = await fetch(requestUrl, { method: "POST", body: form_data, });

  return await res.json();
}

export async function retrieveImageData(imageFileName, whenRetrieved) {
    const image_file = imageFileName;
    const img = document.createElement('img');
    img.src = URL.createObjectURL(image_file);
    img.onload = async function () {
        const canvas = document.createElement("canvas");
        const canvas_context = canvas.getContext("2d");

        canvas.width = img.width;
        canvas.height = img.height;

        canvas_context.drawImage(img, 0, 0);
        const imgData = canvas.toDataURL().split(',')[1];
        whenRetrieved(imgData);
    };
}

export function dictionaryUpdateKey(dictionary, key, updateFunction) {
  let newDictionary = {...dictionary};
  newDictionary[key] = updateFunction(dictionary[key]);
  return newDictionary;
}

export function dictionaryUpdateKeyNested(dictionary, keys, updateFunction) {
  if (keys.length > 1)  {
    let shallowClone = { ...dictionary };
    shallowClone[keys[0]] = 
      dictionaryUpdateKeyNested(shallowClone[keys[0]], keys.slice(1), updateFunction);
    return shallowClone;
  }

  return dictionaryUpdateKey(dictionary, keys[0], updateFunction);
}

export function useTimeout(timeoutTime, onTimeoutFn, dependencyList) {
  React.useEffect(() => {
    const timer = setTimeout(onTimeoutFn, timeoutTime);
    return () => clearTimeout(timer);
  }, dependencyList);
}

export function randomElt(array) {
  return array[Math.floor(Math.random() * array.length)];
}