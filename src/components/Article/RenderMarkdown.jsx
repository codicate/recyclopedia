const md = require('markdown-it')(
  {
    html: true,
    breaks: true,
    linkify: true,
    typographer: true,
  }
);

export const renderMarkdown = (text) => md.render(text);
export function MarkdownRender({className, children}) {
    return (<div
        className={className}
        dangerouslySetInnerHTML={{ __html: renderMarkdown(children) }}>
    </div>);
}