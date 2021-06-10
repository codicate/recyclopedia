/*
  Parsable is an interface produced from a string input.
  
  It'll convert a string into a `Parsable` object which removes the
  ability to modify the string, and instead replaces it with reading
  facilities that would be very useful for tokenizing or lexical analysis.
  
  To use just do:

  object = intoParsable("abcdefghijklmnop");
  
  There's also a few premade parsable functions that aid in building parsers.
*/

// Semantic type. There is no such thing as a char
// and an enforced type might explode stuff (string.length === 1?)
// considering Unicode is a thing, and the planes might break it depending on
// how .length calculates.
type char = string;

interface Parsable {
  withPreservedPosition: (progn: () => unknown) => unknown;
  stillParsing: () => boolean,
  peekCharacter: () => char | null,
  eatCharacter: () => char | null,
  requireCharacter: (c: char) =>  boolean,
  consumeUntil: (predicate: () => boolean) => string,
}

export function intoParsable(input: string) : Parsable {
  // I'm internally using snake_case because I'm comfortable with it
  // but everyone else uses camel case.
  let current_character_index = 0;

  function still_parsing() {
    return (current_character_index < input.length);
  }

  function peek_character(look_ahead_offset = 0) {
    if (current_character_index + look_ahead_offset > input.length) {
      return null;
    } else {
      return input[current_character_index + look_ahead_offset];
    }
  }


  function require_character(character: char) {
    if (peek_character() === character) {
      eat_character();
      return true;
    }
    return false;
  }

  function eat_character() {
    if (current_character_index > input.length) {
      return null;
    } else {
      const result = peek_character();
      current_character_index++;
      return result;
    }
  }

  function consume_until(ending_predicate_fn: () => boolean) {
    let result = "";

    while (still_parsing()) {
      if (ending_predicate_fn()) {
        break;
      } else {
        result += eat_character();
      }
    }

    return result;
  }

  function with_preserved_position(progn_fn: () => unknown) {
    const restoration_index = current_character_index;
    const result = progn_fn();
    current_character_index = restoration_index;
    return result;
  }

  return {
    withPreservedPosition: with_preserved_position,
    stillParsing: still_parsing,
    peekCharacter: peek_character,
    requireCharacter: require_character,
    eatCharacter: eat_character,
    consumeUntil: consume_until,
  };
}

// TODO(jerry): add escaped characters!
interface TryParseStringOptions {
  delimiter: char,
  acceptMultiline?: boolean,
}
export function tryParseString(parsable: Parsable, { delimiter, acceptMultiline } : TryParseStringOptions) {
  if (parsable.requireCharacter(delimiter)) {
    let successful_parse = true;
    const string_contents = parsable.consumeUntil(
      function () {
        if (!acceptMultiline && parsable.requireCharacter("\n")) {
          successful_parse = false;
          return true;
        } else if (parsable.requireCharacter(delimiter)) {
          return true;
        }
        return false;
      }
    );
    if (string_contents && successful_parse) {
      return string_contents;
    }
  }

  return null;
}

const is_literal_acceptable = (c: char | null) => c && ((c >= "a" && c <= "z") || (c >= "A" && c <= "Z") || (c >= "0" && c <= "9"));
export function eatIdentifier(parsable: Parsable) {
  if (parsable.stillParsing()) {
    return parsable.consumeUntil(() => !is_literal_acceptable(parsable.peekCharacter()));
  } else {
    return null;
  }
}

export function eatWhitespace(parsable: Parsable) {
  while (parsable.stillParsing()) {
    const peeked = parsable.peekCharacter();
    if (peeked === " " || peeked === "\t" || peeked === "\n" || peeked === "\r") {
      parsable.eatCharacter();
    } else {
      break;
    }
  }
}
