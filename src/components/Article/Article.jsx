import React from 'react';
import { Route } from 'react-router-dom';

import styles from 'components/Article/Article.module.scss';
import { validPageLink } from 'utils/functions';

var md = require('markdown-it')(
  {
    html: true,
    breaks: true,
    linkify: true,
    typographer: true,
  }
);
var result = md.renderInline('__markdown-it__ rulezz!');
console.log(result);

export function buildFromJSON({ name, content, id }) {
  return (
    <Route key={name} exact path={validPageLink(name)}>
      <Article name={name} content={content} />
    </Route>
  );
}

const smaller_parse_string = `
<img src="https://i.ibb.co/kyXHS0n/8-Bit-Deck-Assets.png" alt="8BitDeckAssets" style="zoom:67%;" />

@@src='https://i.ibb.co/kyXHS0n/8-Bit-Deck-Assets.png' | alt='this is alt' | zoom=50@@

---
__Advertisement :)__

- __[pica](https://nodeca.github.io/pica/demo/)__ - high quality and fast image
  resize in browser.
- __[babelfish](https://github.com/nodeca/babelfish/)__ - developer friendly
  i18n with plurals support and easy syntax.

You will like those projects!
`;

const smallest_parse_string = `
  yolo
  asdfoiuazsdiuofdsjoifaoijfdsa
  @@src='www.google.com' | alt='This is alt' | super='asdf'@@
  @@src='www.google.com' |alt='This is alt'@@
  @@src='www.google.com' |alt='This is alt'@@
  @@src='www.google.com' |alt='This is alt'@@
  @@src='www.google.com' |alt='This is alt'@@
  asdfoiuazsdiuofdsjoifaoijfdsa
  asdfoiuazsdiuofdsjoifaoijfdsa
  asdfoiuazsdiuofdsjoifaoijfdsa
  asdfoiuazsdiuofdsjoifaoijfdsa
`;

const test_parser = (text) =>
  text.replace(
    /@@\s*src\s*=\s*['|"]([^['|"]]*)['|"][^@]*\s*@@/g,
    `<img src="$1" alt="$2"/>`
  );
// C programmer does string parsing 
// it's somewhat successful 

/*   
  TODO(jerry): There's no error checking for anything here,     
    since this was a rush job. 

  Make something that stores parsing state so you can do proper
  error checking and also more robust parsing
  
  In C I would do something like
    struct ParseState {
        char* string;
        size_t current_character_index;
    }
    
    // ETC.
    string eat_string(ParseState*); // ADVANCE
    char eat_character(ParseState*);  // ADVANCE
    char peek_character(ParseState*); // DON'T ADVANCE
*/
function test_parser2(str) {
  let result = "";

  for (let i = 0; i < str.length; ++i) {
    switch (str[i]) {
      case '@': {
        if (str[i + 1] == '@') {
          i += 2;
          let inbetween = "";

          result += "<img ";
          while (i < str.length) {
            if (str[i] == '@') {
              if (str[i + 1] == '@') {
                i += 2;
                break;
              }
            } else {
              inbetween += str[i++];
            }
          }

          for (let j = 0; j < inbetween.length; ++j) {
            let token = "";
            switch (inbetween[j]) {
              case ' ': continue; break;
              case '\'': {
                j++;
                token += "\'";
                do {
                  token += inbetween[j++];
                } while (inbetween[j] != '\'' && j < inbetween.length);
                token += "\'";
              } break;
              case '|': continue; break;
              case '=': token += "="; break;
              default: {
                do {
                  token += inbetween[j++];
                } while (inbetween[j] != ' ' && j < inbetween.length);
              } break;
            }
            result += token;
            result += " ";
          }

          result += "/>\n";
        }
      } break;
      default: { result += str[i]; } break;
    }
  }

  return result;
}

test_parser(smallest_parse_string);

const TEXT = `
<img src="https://i.ibb.co/kyXHS0n/8-Bit-Deck-Assets.png" alt="8BitDeckAssets" style="zoom:10%;" />

@@src='https://i.ibb.co/kyXHS0n/8-Bit-Deck-Assets.png' | alt='this is alt' | style='height: 10px;'@@

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

const result2 = test_parser2(TEXT);
console.log('Jerry', result2);


function Article({ name, content }) {
  content = test_parser2(TEXT);
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