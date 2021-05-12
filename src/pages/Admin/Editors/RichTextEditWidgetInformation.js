import { dictionaryUpdateKey, dictionaryUpdateKeyNested } from 'utils/functions';

export const widgets = {
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
      italic: { name: "Italic", display: <emph>I</emph>, command: "italic" }
    }
  },
  underline: {
    active: null,
    types: {
      underline: { name: "Underline", display: <u>UL</u>, command: "underline" }
    }
  },
};

export function toggleWidgetActiveState(widgets, widgetId, categoryValue) {
    return dictionaryUpdateKeyNested(
        widgets,
        [(categoryValue) ? (categoryValue) : (widgetId), "active"],
        (currentlyActive) => (currentlyActive === widgetId) ? null : widgetId
    );
}

// I should've probably just manually flattened it, since this is much more confusing
// to read...
export function flattenWidgetStateTypes(widgets) {
    return Object.entries(widgets).reduce(
        function (accumulator, [id, { types }]) {
            return Object.entries(types).reduce(
                function (accumulator, [key, value]) {
                    // can probably use updateKeyValue, but not trying it here.
                    let copy = { ...accumulator };
                    copy[key] = value;
                    return copy;
                },
                accumulator
            );
        }
        , {});
}
