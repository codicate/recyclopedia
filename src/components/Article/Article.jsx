import React from 'react';
import { Route } from 'react-router-dom';

import styles from 'components/Article/Article.module.scss';
import { validPageLink } from 'utils/functions';
import { intoParsable, tryParseString, matchedQuotePairs, eatIdentifier, eatWhitespace } from 'utils/intoParsable';

var md = require('markdown-it')(
  {
    html: true,
    breaks: true,
    linkify: true,
    typographer: true,
  }
);

export function buildFromJSON({ name, content, id }) {
  return (
    <Route key={name} exact path={validPageLink(name)}>
      <Article name={name} content={content} />
    </Route>
  );
}

// A parsable object from a string.

function preprocessMarkdown(input) {
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

const TEXT = `
@@src = 'https://i.ibb.co/kyXHS0n/8-Bit-Deck-Assets.png' | alt='this is alt' | style='width: 170px; height: 500px;'@@
@@src = https://i.ibb.co/kyXHS0n/8-Bit-Deck-Assets.png' | alt='this is alt' | style='width: 170px; height: 500px;'@@

[asd]("asdoapos")

---
__Advertisement :)__

- __[pica](https://nodeca.github.io/pica/demo/)__ - high quality and fast image
  resize in browser.
- __[babelfish](https://github.com/nodeca/babelfish/)__ - developer friendly
  i18n with plurals support and easy syntax.

You will like those projects!

---

# h1 Heading 8-)
## h2 Heading
### h3 Heading
#### h4 Heading
##### h5 Heading
###### h6 Heading


## Horizontal Rules

___

---

***


## Typographic replacements

Enable typographer option to see result.

(c) (C) (r) (R) (tm) (TM) (p) (P) +-

test.. test... test..... test?..... test!....

!!!!!! ???? ,,  -- ---

"Smartypants, double quotes" and 'single quotes'


## Emphasis

**This is bold text**

__This is bold text__

*This is italic text*

_This is italic text_

~~Strikethrough~~


## Blockquotes


> Blockquotes can also be nested...
>> ...by using additional greater-than signs right next to each other...
> > > ...or with spaces between arrows.


## Lists

Unordered

+ Create a list by starting a line with \`+\`, \`-\`, or \`*\`
+ Sub-lists are made by indenting 2 spaces:
  - Marker character change forces new list start:
    * Ac tristique libero volutpat at
    + Facilisis in pretium nisl aliquet
    - Nulla volutpat aliquam velit
+ Very easy!

Ordered

1. Lorem ipsum dolor sit amet
2. Consectetur adipiscing elit
3. Integer molestie lorem at massa


1. You can use sequential numbers...
1. ...or keep all the numbers as \`1.\`

Start numbering with offset:

57. foo
1. bar


## Code

Inline \`code\`

Indented code

    // Some comments
    line 1 of code
    line 2 of code
    line 3 of code


Block code "fences"

\`\`\`
Sample text here...
\`\`\`

Syntax highlighting

\`\`\` js
var foo = function (bar) {
  return bar++;
};

console.log(foo(5));
\`\`\`

## Tables

| Option | Description |
| ------ | ----------- |
| data   | path to data files to supply the data that will be passed into templates. |
| engine | engine to be used for processing templates. Handlebars is the default. |
| ext    | extension to be used for dest files. |

Right aligned columns

| Option | Description |
| ------:| -----------:|
| data   | path to data files to supply the data that will be passed into templates. |
| engine | engine to be used for processing templates. Handlebars is the default. |
| ext    | extension to be used for dest files. |


## Links

[link text](http://dev.nodeca.com)

[link with title](http://nodeca.github.io/pica/demo/ "title text!")

Autoconverted link https://github.com/nodeca/pica (enable linkify to see)


## Images

![Minion](https://octodex.github.com/images/minion.png)
![Stormtroopocat](https://octodex.github.com/images/stormtroopocat.jpg "The Stormtroopocat")

Like links, Images also have a footnote style syntax

![Alt text][id]

With a reference later in the document defining the URL location:

[id]: https://octodex.github.com/images/dojocat.jpg  "The Dojocat"


## Plugins

The killer feature of \`markdown-it\` is very effective support of
[syntax plugins](https://www.npmjs.org/browse/keyword/markdown-it-plugin).


### [Emojies](https://github.com/markdown-it/markdown-it-emoji)

> Classic markup: :wink: :crush: :cry: :tear: :laughing: :yum:
>
> Shortcuts (emoticons): :-) :-( 8-) ;)

see [how to change output](https://github.com/markdown-it/markdown-it-emoji#change-output) with twemoji.

### [Subscript](https://github.com/markdown-it/markdown-it-sub) / [Superscript](https://github.com/markdown-it/markdown-it-sup)

- 19^th^
- H~2~O


### [\<ins>](https://github.com/markdown-it/markdown-it-ins)

++Inserted text++


### [\<mark>](https://github.com/markdown-it/markdown-it-mark)

==Marked text==


### [Footnotes](https://github.com/markdown-it/markdown-it-footnote)

Footnote 1 link[^first].

Footnote 2 link[^second].

Inline footnote^[Text of inline footnote] definition.

Duplicated footnote reference[^second].

[^first]: Footnote **can have markup**

    and multiple paragraphs.

[^second]: Footnote text.


### [Definition lists](https://github.com/markdown-it/markdown-it-deflist)

Term 1

:   Definition 1
with lazy continuation.

Term 2 with *inline markup*

:   Definition 2

        { some code, part of Definition 2 }

    Third paragraph of definition 2.

_Compact style:_

Term 1
  ~ Definition 1

Term 2
  ~ Definition 2a
  ~ Definition 2b


### [Abbreviations](https://github.com/markdown-it/markdown-it-abbr)

This is HTML abbreviation example.

It converts "HTML", but keep intact partial entries like "xxxHTMLyyy" and so on.

*[HTML]: Hyper Text Markup Language

### [Custom containers](https://github.com/markdown-it/markdown-it-container)

::: warning
*here be dragons*
:::
`;

function Article({ name, content }) {
    content = preprocessMarkdown(TEXT);
    // content = TEXT;
    return (
        <div>
          <h1 className={styles.title}>{name}</h1>
          <div className={styles.article} dangerouslySetInnerHTML={{ __html: md.render(content) }}>
          </div>
          <br></br>
        </div>
    );
}

export default Article;
