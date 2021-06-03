/*
  Parsable is an interface produced from a string input.
  
  It'll convert a string into a `Parsable` object which removes the
  ability to modify the string, and instead replaces it with reading
  facilities that would be very useful for tokenizing or lexical analysis.
  
  To use just do:

  object = intoParsable("abcdefghijklmnop");
  
  There's also a few premade parsable functions that aid in building parsers.
*/

export function intoParsable(input) {
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


  function require_character(character) {
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

  function consume_until(ending_predicate_fn) {
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

  function with_preserved_position(progn_fn) {
    const restoration_index = current_character_index;
    let result = progn_fn();
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
export function tryParseString(parsable, { delimiter, acceptMultiline }) {
  if (parsable.requireCharacter(delimiter)) {
    let successful_parse = true;
    let string_contents = parsable.consumeUntil(
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

// Pairs are singular characters unfortunately.
// not strings.
export function matchedQuotePairs(parsable) {
  return true;

  // Henry: Commented out to resolve warnings in console

  // return parsable.withPreservedPosition(
  //   function () {
  //     let count = 0;

  //     while (parsable.stillParsing()) {
  //       if (parsable.requireCharacter('\\')) {
  //         parsable.eatCharacter();
  //       } else {
  //         if (parsable.requireCharacter('\'')) {
  //           count++;
  //         }
  //         parsable.eatCharacter();
  //       }
  //     }

  //     return (count % 2 === 0);
  //   }
  // );
}

// console.log(tryParseString(intoParsable('\'Hello\nWorld!\'|'), {delimiter: '\'', acceptMultiline: true}));
// console.log(tryParseString(intoParsable('\'Hello\nWorld!\'|'), {delimiter: '\''}));

const is_literal_acceptable = (c) => (c >= "a" && c <= "z") || (c >= "A" && c <= "Z") || (c >= "0" && c <= "9");
export function eatIdentifier(parsable) {
  if (parsable.stillParsing()) {
    return parsable.consumeUntil(() => !is_literal_acceptable(parsable.peekCharacter()));
  } else {
    return null;
  }
}

export function eatWhitespace(parsable) {
  while (parsable.stillParsing()) {
    if (parsable.peekCharacter() === " ") {
      parsable.eatCharacter();
    } else {
      console.log(parsable.peekCharacter());
      break;
    }
  }
}
