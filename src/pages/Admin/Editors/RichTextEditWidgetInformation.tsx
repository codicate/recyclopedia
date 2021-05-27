import React from 'react';

import { dictionaryUpdateKey, dictionaryUpdateKeyNested } from 'utils/functions';

export type WidgetCategoryDic = Record<string,WidgetCategory>;
export type WidgetInformationDic = Record<string, WidgetInformation>;

export interface WidgetInformation {
  name: string,
  display?: JSX.Element,
  command: string,
  argument?: string,
  category?: string,
};

export interface WidgetCategory {
  active: string | null,
  types: WidgetInformationDic
};

export const widgets: WidgetCategoryDic = {
  heading: {
    active: null,
    types: {
      h1: { name: "Heading 1", display: <b>h1</b>, command: "heading", argument: "H1", category: "heading" },
      h2: { name: "Heading 2", display: <b>h2</b>, command: "heading", argument: "H2", category: "heading" },
      h3: { name: "Heading 3", display: <b>h3</b>, command: "heading", argument: "H3", category: "heading" },
      h4: { name: "Heading 4", display: <b>h4</b>, command: "heading", argument: "H4", category: "heading" },
      h5: { name: "Heading 5", display: <b>h5</b>, command: "heading", argument: "H5", category: "heading" },
      h6: { name: "Heading 6", display: <b>h6</b>, command: "heading", argument: "H6", category: "heading" },
    }
  },
  image: {
    active: null,
    types: {
      image: { name: "Image", display: <b>Insert Image</b>, command: "@_insertImage", category: "image" },
    }
  },
  list: {
    active: null,
    types: {
      orderedList: { name: "Ordered List", command: "insertorderedlist", category: "list" },
      unorderedList: { name: "Unordered List", command: "insertunorderedlist", category: "list" },
    }
  },
  // disadvantage at the moment. You don't have to do this, but this makes the current format work without code changes
  bold: {
    active: null,
    types: {
      bold: { name: "Bold", display: <b>B</b>, command: "bold" }
    }
  },
  italic: {
    active: null,
    types: {
      italic: { name: "Italic", display: <em>I</em>, command: "italic" }
    }
  },
  underline: {
    active: null,
    types: {
      underline: { name: "Underline", display: <u>UL</u>, command: "underline" }
    }
  },
};

export function toggleWidgetActiveState(widgets: WidgetCategoryDic, widgetId: string, categoryValue?: string) {
  return dictionaryUpdateKeyNested(
    widgets,
    [(categoryValue) ? (categoryValue) : (widgetId), "active"],
    (currentlyActive) => (currentlyActive === widgetId) ? null : widgetId
  );
}

export function flattenWidgetStateTypes(widgets: WidgetCategoryDic): WidgetInformationDic {
  return Object.entries(widgets).reduce(
    function (accumulator, [id, { types }]) {
      return Object.entries(types).reduce(
        function (accumulator, [key, value]) {
          let copy = { ...accumulator as WidgetInformationDic };
          copy[key] = value;
          return copy;
        },
        accumulator
      );
    }
    , {});
}
