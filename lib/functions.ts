import { useEffect } from "react";
import { NodeType } from "lib/utils/DOMIntoMarkdown";
import Secrets from "secrets";

export const validPageLink = (originalName: string) => `${encodeURIComponent(originalName.toLowerCase().trim().replace(/ +/g, "_"))}`;

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
  dictionary: { [key: string]: any; },
  key: any,
  updateFunction: (f: unknown) => unknown
) {
  const newDictionary = { ...dictionary };
  newDictionary[key] = updateFunction(dictionary[key]);
  return newDictionary;
}

export function dictionaryUpdateKeyNested(
  dictionary: { [key: string]: any; },
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

export const useTimeout = (callback: () => void, delay: number) => {
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
  while (node.classList.length > 0) {
    node.classList.remove(node.classList.item(0) || "");
  }
}

export function classListReplace(node: Element, classes: string[]) {
  classListClear(node);
  console.log(node.classList);
  for (const classItem of classes) {
    node.classList.add(classItem);
  }
  console.log(node.classList);
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

function isDevelopment() {
  if (process.env.NODE_ENV && process.env.NODE_ENV === "development") {
    return true;
  }

  return false;
}

/*
  This thing is just useful for having messages that don't show up in production
  and also allow for more noticable TODOs because probably no one reads comments, but
  I assure you that we will read the console.

  Although in practice we may only just use General/Warning/Error as just console wrappers
  to avoid spamming in the console.
*/
export enum MessageLogType {
  General,
  Warning,
  Error,
  Todo,
  Note,
}

export function logMessage(type: MessageLogType, message?: any, ...optionalParams: any[]) {
  if (isDevelopment()) {
    let messageFn = console.log;
    const argumentsList = [];
    let composedMessage = "";

    switch (type) {
    case MessageLogType.Todo:
    case MessageLogType.Note:
    case MessageLogType.General:
      if (type === MessageLogType.Todo) {
        composedMessage += "%cTODO%c";
        argumentsList.push("background-color: black; color: orange; font-size: 1.2em;", "unset: all;");
      } else if (type === MessageLogType.Note) {
        composedMessage += "%cNOTE:%c";
        argumentsList.push("background-color: black; color: lightgreen; font-size: 1.2em;", "unset: all;");
      } else {
        composedMessage += "%cINFO: %c";
        argumentsList.push("background-color: black; color: white; font-size: 1.2em;", "unset: all;");
      }
      messageFn = console.log;
      break;
    case MessageLogType.Warning:
      composedMessage += "%cWARNING%c";
      argumentsList.push("background-color: black; color: white; font-size: 1.2em;", "unset: all;");
      messageFn = console.warn;
      break;
    case MessageLogType.Error:
      messageFn = console.error;
      composedMessage += "%cERROR!%c";
      argumentsList.push("background-color: black; color: red; font-size: 1.2em;", "unset: all;");
      break;
    }

    composedMessage += (message || "");
    for (const element of optionalParams) {
      argumentsList.push(element);
    }

    messageFn(composedMessage, argumentsList);
  }
}