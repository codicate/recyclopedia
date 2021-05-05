/*
    Inhouse DOM to Markdown interpreter.
*/
const surrounder = (sym) => (content) => `${sym}${content}${sym}`;
const surrounders = {
  "B": surrounder("**"),
  "I": surrounder("_"),
  "U": surrounder("__"),
};
const safeLambdaCall = (fn, ...rest) => (...rest) => (fn) ? fn(...rest) : rest;

function renderElement(root, textContents) {
  if (textContents !== "") {
      if (root.tagName === "P") {
          return textContents + "\n";
      } else if (root.tagName[0] === 'H') {
          return "#".repeat(Number(root.tagName[1])) + " " + textContents + "\n";
      } else if (root.tagName === "LI") { // List item
          return (root.parentElement.nodeName === "OL") ?
              `${Array.from(root.parentElement.childNodes).indexOf(root) + 1}. ${textContents}\n` : `- ${textContents}\n`;
      }

      console.log(root.tagName, textContents)
      return safeLambdaCall(surrounders[root.tagName])(textContents);
  } else {
      return (root.tagName === "P") ? "\\\n" : "";
  }

  return textContents + "\n";
}


export function renderDomAsMarkdown(root) {
  return (root.hasChildNodes()) ?
      renderElement(root, Array.from(root.childNodes)
                     .reduce((output, node) => output +
                             renderDomAsMarkdown(node), ""))
      : (root.nodeType === 3) ? root.textContent : "";
}