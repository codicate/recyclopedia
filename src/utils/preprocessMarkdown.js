/*
  This is the markdown preprocessor for any special extensions we might want to support.
  
  Does not really do tokenizing, so be ware of dragons.
 */
import { intoParsable, tryParseString, matchedQuotePairs, eatIdentifier, eatWhitespace } from 'utils/intoParsable';


export function preprocessMarkdown(input, onImageFound=undefined) {
    let result = "";
    input = intoParsable(input);

    while (input.stillParsing()) {
        if (input.requireCharacter('\\')) {
            result += input.eatCharacter();
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
                        function() {
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
                                    let maybe_string = tryParseString(inbetween, {delimiter: '\''});
                                    if (maybe_string) {
                                        image_tag += '\'' + maybe_string + '\'';
                                        if (property === "src" && onImageFound) {
                                            onImageFound(maybe_string);
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
                                    if (eatIdentifier(inbetween) || tryParseString(inbetween, {delimiter: '\''})) {
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
            result += input.eatCharacter();
        }
    }

    return result;
}
