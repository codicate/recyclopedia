/*
  This is the markdown preprocessor for any special extensions we might want to support.
  
  Does not really do tokenizing, so be ware of dragons.
 */
import { intoParsable, tryParseString, eatIdentifier, eatWhitespace } from 'utils/intoParsable';

interface HeaderInformation {
  level: number,
  text: string
}
export interface MarkdownParsedMetaInformation {
  processed: string,
  imageLinks: string[],
  headers: HeaderInformation[],
}

export function preprocessMarkdown(stringInput: string): MarkdownParsedMetaInformation {
  let result = "";
  const input = intoParsable(stringInput);

  let actualResult = {
    processed: "",
    imageLinks: [],
    headers: []
  };

  while (input.stillParsing()) {
    if (input.requireCharacter('\\')) {
      const nextCharacter = input.eatCharacter();
      if (nextCharacter === '\n') {
        result += "<br/>\n";
      } else {
        result += nextCharacter;
      }
    } else if (input.requireCharacter('@')) {
      if (input.requireCharacter('@')) {
        let has_end = false;
        /*
          Whenever our region fails to parse it'll just refuse to output anything.
          
          @ asdf @ asdf -> @ asdf @ asdf
          @@ asdf @ asdf -> null
          @@ asdf @@ asdf -> whatever we would've parsed.
          
          if you need multiple @ signs consecutively just do
          \@\@ or @\@.
         */
        let inbetween = intoParsable(
          input.consumeUntil(
            function () {
              if (input.requireCharacter('\n')) {
                return true;
              } else if (input.requireCharacter('@')) {
                /*
                  When we encounter an @ sign, it's likely to be the end of parsing a "region".
                 */
                if (input.requireCharacter('@')) {
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

          while (inbetween.stillParsing() && !error) {
            eatWhitespace(inbetween);
            let property = eatIdentifier(inbetween);
            if (property) {
              image_tag += property;
              eatWhitespace(inbetween);
              if (inbetween.requireCharacter('=')) {
                image_tag += "=";
                eatWhitespace(inbetween);
                if (inbetween.peekCharacter() === '\'') {
                  // @ts-ignore
                  let maybe_string = tryParseString(inbetween, { delimiter: '\'' });
                  if (maybe_string) {
                    image_tag += '\'' + maybe_string + '\'';
                    if (property === "src") {
                      // @ts-ignore
                      actualResult.imageLinks.push(maybe_string);
                    }
                  } else {
                    console.error("No string value?");
                    error = true;
                  }
                } else {
                  let value_identifier = eatIdentifier(inbetween);
                  if (value_identifier) {
                    image_tag += value_identifier;
                  } else {
                    console.error("No value identifier?");
                    error = true;
                  }
                }
                eatWhitespace(inbetween);
                if (!inbetween.requireCharacter('|')) {
                  // @ts-ignore
                  if (eatIdentifier(inbetween) || tryParseString(inbetween, { delimiter: '\'' })) {
                    console.error("Missing pipe separator!");
                    error = true;
                  }
                }
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
          image_tag += "/>";
          if (!error) {
            result += image_tag;
          } else {
            console.log("error happened");
          }
        } else {
          // not valid tag. Don't do anything.
          // maybe add a newline since there should really only be one image per
          // line as per markup style.
          result += '\n';
        }
      } else {
        result += '@';
      }
    } else {
      if (input.peekCharacter() === '#') {
        let headerCount  = input.consumeUntil(() => input.peekCharacter() !== '#').length;
        let textContents = input.consumeUntil(() => input.peekCharacter() === '\n');

        actualResult.headers.push({
        // @ts-ignore
          level: headerCount,
        // @ts-ignore
          text: textContents
        });
        const generatedHeader = `\n<h${headerCount} id="${textContents}">${textContents}</h${headerCount}>\n`;
        result += generatedHeader;
      }

      result += input.eatCharacter();
    }
  }

  actualResult.processed = result;
  return actualResult as MarkdownParsedMetaInformation;
}