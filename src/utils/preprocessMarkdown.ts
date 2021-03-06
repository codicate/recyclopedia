/*
  This is the markdown preprocessor for any special extensions we might want to support.
  
  Does not really do tokenizing, so be ware of dragons.
 */
import styles from "components/Article/Article.module.scss";
import {
  Parsable,
  intoParsable,
  tryParseString,
  eatIdentifier,
  eatWhitespace,
  peekWhitespaceSeparatedCharacter,
  eatWhitespaceSeparatedCharacter,
  eatWhitespaceSeparatedToken,
  requireWhitespaceSeparatedCharacter,
  eatWhitespaceSeparatedString,
} from "utils/intoParsable";

export interface HeaderInformation {
  level: number,
  text: string
}
export interface MarkdownParsedMetaInformation {
  processed: string,
  imageLinks: string[],
  headers: HeaderInformation[],
}

function pipeSeparatorErrorCheck(parsable: Parsable) {
  if (!requireWhitespaceSeparatedCharacter(parsable, "|")) {
    if (eatWhitespaceSeparatedToken(parsable) || tryParseString(parsable, { delimiter: "'" })) {
      console.error("Missing pipe separator!");
      return true;
    }
  }

  return false;
}

export function preprocessMarkdown(stringInput: string): MarkdownParsedMetaInformation {
  let result = "";
  const input = intoParsable(stringInput);

  const actualResult: MarkdownParsedMetaInformation = {
    processed: "",
    imageLinks: [],
    headers: []
  };

  while (input.stillParsing()) {
    if (input.requireCharacter("\\")) {
      const nextCharacter = input.eatCharacter();
      if (nextCharacter === "\n") {
        result += "<p><br/></p>\n";
      } else {
        result += nextCharacter;
      }
    } else if (input.requireCharacter("@")) {
      if (input.requireCharacter("@")) {
        let has_end = false;
        /*
          Whenever our region fails to parse it'll just refuse to output anything.
          
          @ asdf @ asdf -> @ asdf @ asdf
          @@ asdf @ asdf -> null
          @@ asdf @@ asdf -> whatever we would've parsed.
          
          if you need multiple @ signs consecutively just do
          \@\@ or @\@.
         */
        const inbetween = intoParsable(
          input.consumeUntil(
            function () {
              if (input.requireCharacter("@")) {
                /*
                  When we encounter an @ sign, it's likely to be the end of parsing a "region".
                 */
                if (input.requireCharacter("@")) {
                  has_end = true;
                }
                return true;
              }
              return false;
            }
          )
        );

        if (inbetween && has_end) {
          let image_tag = "<img ";
          let error = false;

          // float style for the classList.
          let floatingMethod = "";
          let captionString = "";

          // TEST?
          const width = 150;

          while (inbetween.stillParsing() && !error) {
            const property = eatWhitespaceSeparatedToken(inbetween);

            if (property === "floatingMethod") {
              if (requireWhitespaceSeparatedCharacter(inbetween, "=")) {
                floatingMethod = eatWhitespaceSeparatedToken(inbetween) || "";
                error = error || pipeSeparatorErrorCheck(inbetween);
              }
            } else if (property === "caption") {
              if (requireWhitespaceSeparatedCharacter(inbetween, "=")) {
                const maybe_string = eatWhitespaceSeparatedString(inbetween, { delimiter: "'", acceptMultiline: true });

                if (maybe_string) {
                  captionString = maybe_string;
                } else {
                  console.error("No string for caption string?");
                  error = true;
                }
              }

              error = error || pipeSeparatorErrorCheck(inbetween);
            } else if (property) {
              image_tag += property;
              if (requireWhitespaceSeparatedCharacter(inbetween, "=")) {
                image_tag += "=";
                if (peekWhitespaceSeparatedCharacter(inbetween) === "'") {
                  const maybe_string = tryParseString(inbetween, { delimiter: "'" });

                  if (maybe_string) {
                    image_tag += "'" + maybe_string + "'";
                    if (property === "src") {
                      actualResult.imageLinks.push(maybe_string);
                    }
                  } else {
                    console.error("No string value?");
                    error = true;
                  }
                } else {
                  const value_identifier = eatWhitespaceSeparatedToken(inbetween);
                  if (value_identifier) {
                    image_tag += value_identifier;
                  } else {
                    console.error("No value identifier?");
                    error = true;
                  }
                }

                error = error || pipeSeparatorErrorCheck(inbetween);
              } else {
                console.error("Missing assignment for property?");
                error = true;
              }
            } else {
              console.error("Could not find property name!");
              error = true;
            }
            image_tag += " ";
          }

          if (captionString !== "") {
            image_tag += `class="${styles.captionImagePreview}"`;
          }

          if (!error) {
            if (captionString !== "") {
              image_tag += "/>";

              let floatingMethodStr = "";
              switch (floatingMethod) {
              case "floatLeft": floatingMethodStr = styles.floatLeft; break;
              case "floatCenter": floatingMethodStr = styles.floatCenter; break;
              case "floatRight": floatingMethodStr = styles.floatRight; break;
              }

              result += `<div class="${styles.captionBox + " " + floatingMethodStr}" style="width: ${width+2}px;">
                          ${image_tag}
                          <div class=${styles.captionBoxInner}>
                            <p contenteditable="false">${captionString}</p>
                          </div>
                          </div>`;
            } else {
              image_tag += "class='";
              switch (floatingMethod) {
              case "floatLeft": image_tag += styles.floatLeft; break;
              case "floatCenter": image_tag += styles.floatCenter; break;
              case "floatRight": image_tag += styles.floatRight; break;
              }
              image_tag += "'";
              image_tag += "/>";
              result += image_tag;
            }
          } else {
            console.log("error happened");
          }
        } else {
          // not valid tag. Don't do anything.
          // maybe add a newline since there should really only be one image per
          // line as per markup style.
          result += "\n";
        }
      } else {
        result += "@";
      }
    } else {
      const peeked = input.peekCharacter();
      if (peeked === "#") {
        const headerCount = input.consumeUntil(() => input.peekCharacter() !== "#").length;
        const textContents = input.consumeUntil(() => input.peekCharacter() === "\n");

        actualResult.headers.push({
          level: headerCount,
          text: textContents
        });

        const generatedHeader = `\n<h${headerCount} id="${textContents}">${textContents}</h${headerCount}>`;
        result += generatedHeader;
      }

      result += input.eatCharacter();
    }
  }

  actualResult.processed = result;
  return actualResult as MarkdownParsedMetaInformation;
}
