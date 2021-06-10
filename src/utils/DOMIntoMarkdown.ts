/*
    Inhouse DOM to Markdown interpreter.
*/
import { render } from "@testing-library/react";
import articleStyles from "components/Article/Article.module.scss";
import { imageDOMGetCaption, imageDOMHasCaption } from "pages/Admin/Editors/RichTextEditor";
import { resourceUsage } from "process";
import { isBreakStatement } from "typescript";

function surrounder(sym: string) {
  return function (content: typeof sym) {
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
// @ts-ignore
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

enum NodeType {
  Element = 1,
  Attribute = 2,
  Text = 3,
  CDataSection = 4,
  ProcessingInformation = 5,
  Comment = 6,
  Document = 7,
  DocumentType = 8,
  DocumentFragment = 9,
}

// we're going to use divs as semantic types.
enum DivSemanticType {
  Unknown,
  CaptionedImage,
  Article
}

function determineSemanticTypeOfDivElement(root: HTMLDivElement): DivSemanticType {
  const classList = root.classList;

  if (root.classList.contains(articleStyles.captionBox)) {
    return DivSemanticType.CaptionedImage;
  } else if (root.classList.contains(articleStyles.article)) {
    return DivSemanticType.Article;
  }

  return DivSemanticType.Unknown;
}

function renderDivElementIntoMarkdown(root: HTMLDivElement): string {
  const semanticType = determineSemanticTypeOfDivElement(root);
  console.log(semanticType);

  switch (semanticType) {
  case DivSemanticType.CaptionedImage: {
    const imageElement = root.children[0] as HTMLImageElement;
    const captionTextElement = root.children[1] as HTMLDivElement;
    const captionTextContents = captionTextElement.children[0] as HTMLParagraphElement;

    let rendered_string = "";
    rendered_string += `src = '${imageElement.src}' |` ;
    rendered_string += `width = ${imageElement.width} |` ;
    rendered_string += `height = ${imageElement.height} |` ;
    rendered_string += `caption = '${captionTextContents.textContent?.trim()}'`;

    if (root.classList.contains(articleStyles.floatLeft)) {
      rendered_string += "| floatingMethod = floatLeft";
    } else if (root.classList.contains(articleStyles.floatCenter)) {
      rendered_string += "| floatingMethod = floatCenter";
    } else if (root.classList.contains(articleStyles.floatRight)) {
      rendered_string += "| floatingMethod = floatRight";
    }

    return "@@ " + rendered_string + " @@";
  } break;

  case DivSemanticType.Article: {
    return renderChildrenOfDomAsMarkdown(root);
  } break;

  case DivSemanticType.Unknown:
  default:
    console.error("This is unusual... Unknown Div structure?");
    return "";
  }
}

function renderChildrenOfDomAsMarkdown(root: HTMLElement): string {
  let result = "";

  for (const child of Array.from(root.childNodes)) {
    const asHTMLElementChild = child as HTMLElement;

    result += renderElementAsMarkdown(asHTMLElementChild);
  }

  return result;
}

function renderElementAsMarkdown(root: HTMLElement): string {
  if (root.nodeType === NodeType.Text) {
    return (root.textContent || "");
  }

  switch (root.tagName) {
  case "DIV": {
    return renderDivElementIntoMarkdown(root as HTMLDivElement); 
  } break;

  /*
  TODO(jerry):
  I do not attempt to parse additional decoration here.
  */
  case "A": {
    const anchorElement = root as HTMLAnchorElement;
    const anchorText = anchorElement.textContent; 
    const anchorLink = anchorElement.href;

    return `[${anchorText}](${anchorLink})`;
  } break;

  case "IMG": {
    const imageElement = root as HTMLImageElement; 

    let rendered_string = "";
    rendered_string += `src = '${imageElement.src}' |` ;
    rendered_string += `width = ${imageElement.width} |` ;
    rendered_string += `height = ${imageElement.height}` ;

    if (imageElement.classList.contains(articleStyles.floatLeft)) {
      rendered_string += "| floatingMethod = floatLeft";
    } else if (imageElement.classList.contains(articleStyles.floatCenter)) {
      rendered_string += "| floatingMethod = floatCenter";
    } else if (imageElement.classList.contains(articleStyles.floatRight)) {
      rendered_string += "| floatingMethod = floatRight";
    }

    return "@@ " + rendered_string + " @@\n";
  } break;

  case "H6": case "H5": case "H4": case "H3": case "H2": case "H1": {
    const headerElement = root as HTMLHeadingElement;
    return "\n" + "#".repeat(Number(root.tagName[1])) + " " + renderChildrenOfDomAsMarkdown(root) + "\n";
  } break;

  case "B": case "U": case "I": case "STRONG": case "EM": {
    const inbetween = renderChildrenOfDomAsMarkdown(root);
    console.log("TWEEN", inbetween);
    if (inbetween !== "") {
      return safe_call(surrounders[root.tagName])(inbetween);
    }

    // return "<p><br/></p>";
  } break;

  case "OL": {
    const childrenNodes = Array.from(root.childNodes);
    let result = "";

    let i = 1;
    for (const child of childrenNodes) {
      if (child.nodeType === NodeType.Element) {
        result += `${i++}. ` + renderChildrenOfDomAsMarkdown(child as HTMLElement) + "\n";
      }
    }

    return result+"\n";
  } break;

  case "UL": {
    const childrenNodes = Array.from(root.childNodes);
    let result = "";

    for (const child of childrenNodes) {
      if (child.nodeType === NodeType.Element) {
        result += "- " + renderChildrenOfDomAsMarkdown(child as HTMLElement) + "\n";
      }
    }

    return result+"\n";
  } break;

  /*
  ALERT(jerry):

  This seems to be the most problematic element as it can never convert 1-1 from anything we give it... Most elements will parent themselves to
  the paragraph which makes it iffy af.

  IE: The structural that's generated by a contenteditable element... Is really confusing and not easy to figure out... I may have to do way more manual work
  than I was ever expecting...
  */
  case "P": {
    /*
    NOTE(jerry):

    Why doesn't everyone just agree on what shit should be generated?
    This has only been tested on Firefox. We'll have to find this out later...
    */
    const childrenNodes = Array.from(root.children);

    // As I set the defaultSeparator to use <p>
    // the only way I can get consistent appearance with the actual article
    // is to literally just output it... It looks dumb.
    // This is also not 100% correct... But it may pass inspection.
    if (childrenNodes.length === 1 && childrenNodes[0].tagName === "BR") {
      return root.outerHTML + "\n";
    }

    return renderChildrenOfDomAsMarkdown(root) + "\n\n";
  } break;

  default: {
    console.error("Unhandled case: ", root.tagName);
  } break;
  }

  return "";
}

export function renderDomAsMarkdown(root: HTMLElement): string {
  return renderElementAsMarkdown(root);
}
