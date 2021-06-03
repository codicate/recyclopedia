/*
    Inhouse DOM to Markdown interpreter.
*/
function log_message(msg) {
  // This is intentional... This should be in a module called "debug" or something? idk
  (msg);
}

function surrounder(sym) {
  return function (content) {
    let spacesLeft = 0;
    let spacesRight = 0;
    for (let i = 0; i < content.length; ++i) {
      if (content[i] !== " ") {
        spacesLeft = i - 1;
        break;
      }
    }
    for (let i = content.length - 1; i > 0; --i) {
      if (content[i] !== " ") {
        break;
      }
      spacesRight++;
    }
    return `${spacesLeft > 0 ? " ".repeat(spacesLeft) : ""}${sym}${content.trim()}${sym}${spacesRight > 0 ? " ".repeat(spacesRight) : ""}`;
  };
}
const surrounders = {
  "B": surrounder("**"),
  "STRONG": surrounder("**"),
  "I": surrounder("_"),
  "EM": surrounder("_"),
  "U": surrounder("__"),
};
const safe_call = (fn) => (...rest) => (fn) ? fn(...rest) : rest[0];
/*
NOTE(jerry):

I'm not a particular fan of this since this is definitely very scrappy. It does not know how to
properly handle nested lists, although without extra modification the RichTextEditor doesn't allow you
to do nested lists trivially anyways... So hopefully it's not much of a disaster (just store the current indent
level and then do it based off of whatever markdown seems to recognize a list as.)

Most other normal elements are handled fine, it's really just the lists I'm concerned about.

This is entirely recursive, and because it's recursive it loses some information that may be useful for
cleaner and probably easier rendering...
*/
function renderElement(root, text_contents) {
  if (text_contents !== "") {
    if (root.tagName === "P") {
      log_message("paragraph");
      log_message(root.parentElement);
      if (root.parentElement && (root.parentElement.tagName === "LI")) {
        log_message("Parent was list?");
        return text_contents;
      } else {
        return text_contents + "\n\n";
      }
    } else if (root.tagName[0] === "H") {
      return "#".repeat(Number(root.tagName[1])) + " " + text_contents + "\n";
    } else if (root.tagName === "OL") {
      let i = 0;
      return Array.from(root.children).reduce(
        function (accumulator, listItem) {
          const childText = renderDomAsMarkdown(listItem);
          if (childText !== "") {
            return accumulator + `${((i++) + 1)}. ${childText}\n`;
          } else {
            return accumulator;
          }
        }, "");
    } else if (root.tagName === "UL") {
      return Array.from(root.children).reduce(
        function (accumulator, listItem) {
          const childText = renderDomAsMarkdown(listItem);
          if (childText !== "") {
            return accumulator + `- ${childText}\n`;
          } else {
            return "";
          }
        }, "");
    }

    log_message("going to try and root out tags friends", root.tagName);
    return safe_call(surrounders[root.tagName])(text_contents);
  } else {
    if (root.tagName === "IMG") {
      const src = root.getAttribute("src");
      const result = `@@ src = '${src}' @@\n`;
      return result;
    }

    return (root.tagName === "P" || root.tagName === "BR") ? "\\\n" : "";
  }
}

export function renderDomAsMarkdown(root) {
  if (root.nodeType === 3) {
    return root.textContent;
  } else if (root.hasChildNodes()) {
    const childrenStrings = Array.from(root.childNodes).reduce((output, node) => { return output + renderDomAsMarkdown(node); }, "");
    const res = renderElement(root, childrenStrings);
    return res;
  }

  return renderElement(root, "");
}
