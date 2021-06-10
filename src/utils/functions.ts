import React, { useEffect, useRef } from "react";
import { NodeType } from "utils/DOMIntoMarkdown";
import { Secrets } from "secrets";

//Return the current property of a ref if it is a ref
export const getRefCurrent = (ref: React.MutableRefObject<any>) => {
  return Object.prototype.hasOwnProperty.call(ref, "current")
    ? ref.current
    : ref;
};

export const validPageLink = (originalName: string) => `/${originalName.toLowerCase().trim().replace(/ +/g, "_")}`;

export async function uploadImage(image_name: string) {
  const form_data = new FormData();
  form_data.append("image", image_name);

  const expirationValue = 600;
  const requestUrl = `https://api.imgbb.com/1/upload?expiration${expirationValue}&key=${Secrets.IMGBB_KEY}`;
  console.log(requestUrl);
  const res = await fetch(requestUrl, { method: "POST", body: form_data, });
  console.log("waiting...");

  return await res.json();
}

// for now this is an alias.
type Base64String = string;
type RetrievedImageCallback = (f: Base64String) => void;
export async function retrieveImageData(
  imageFile: File,
  whenRetrieved: RetrievedImageCallback
) {
  const image_file = imageFile;
  const img = document.createElement("img");
  img.src = URL.createObjectURL(image_file);
  console.log("attempting to load: ", image_file);
  img.onload = async function () {
    const canvas = document.createElement("canvas");
    const canvas_context = canvas.getContext("2d");
    if (canvas_context) {
      canvas.width = img.width;
      canvas.height = img.height;

      canvas_context.drawImage(img, 0, 0);
      const imgData = canvas.toDataURL().split(",")[1];
      console.log("image data retrieved");
      whenRetrieved(imgData);
    } else {
      console.log("null canvas?");
    }
  };
}

/*
  These functions are legitimately supposed to be any. These are supposed to operate indiscriminately
  on any type of dictionary like object.

  Javascript allows you to use anything as a key technically for dictionaries,
  but this is as close I can get to that I suppose...
 */

export function dictionaryUpdateKey(
  dictionary: {[key: string]: any}, 
  key: any,
  updateFunction: (f: unknown) => unknown
) {
  const newDictionary = { ...dictionary };
  newDictionary[key] = updateFunction(dictionary[key]);
  return newDictionary;
}

export function dictionaryUpdateKeyNested(
  dictionary: {[key: string]: any}, 
  keys: any[],
  updateFunction: (f: unknown) => unknown
) {
  if (keys.length > 1) {
    const shallowClone = { ...dictionary };
    shallowClone[keys[0]] =
      dictionaryUpdateKeyNested(shallowClone[keys[0]], keys.slice(1), updateFunction);
    return shallowClone;
  }

  // returns
  return dictionaryUpdateKey(dictionary, keys[0], updateFunction);
}

export const useTimeout = (callback: (f: void) => void, delay: number) => {
  useEffect(() => {
    const timer = setTimeout(() => callback(), delay);
    return () => clearTimeout(timer);
  }, [delay, callback]);
};

export function randomElt(array: any[]) {
  return array[Math.floor(Math.random() * array.length)];
}

// dom helps?
export function classListClear(node: Element) {
  node.classList.forEach((e) => node.classList.remove(e));
}

export function classListReplace(node: Element, classes: string[]) {
  classListClear(node);
  for (const classItem of classes) {
    node.classList.add(classItem);
  }
}

// http://w3c.github.io/html-reference/syntax.html
const voidElementTagNameTable = [
  "BR", "BASE", "AREA", "COL", "COMMAND",
  "EMBED", "HR", "IMG", "INPUT", "KEYGEN",
  "LINK", "META", "PARAM", "SOURCE", "TRACK", "WBR"
];

export function isVoidElement(root: Node) {
  if (root.nodeType === NodeType.Element) {
    const elementRoot = root as Element;

    for (const elementName of voidElementTagNameTable) {
      if (elementRoot.tagName === elementName) {
        return true;
      }
    }
  }

  return false;
}

// push and pop the current selection stack
// this is mostly to keep the selection consistent for stuff...
// that needs to temporarily break focus or whatever...
const _selectionStack: Range[] = [];
export function selectionStackPush() {
  const selection = window.getSelection();
  const topMostSelection = selection?.getRangeAt(0);

  if (topMostSelection) {
    selection?.removeRange(topMostSelection);
    _selectionStack.push(topMostSelection);
  }
}

export function selectionStackPop() {
  if (_selectionStack.length) {
    const selection = window.getSelection();
    selection?.addRange(_selectionStack.pop() as Range);
  }
}