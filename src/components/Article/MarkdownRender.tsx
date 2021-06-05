import MD from "markdown-it";
const md = MD({
  html: true,
  breaks: true,
  linkify: true,
  typographer: true,
});

export const renderMarkdown = (text: string) => md.render(text);

function MarkdownRender({
  className, children
}: {
  className: string; children: string;
}) {
  return (<div
    className={className}
    dangerouslySetInnerHTML={{ __html: renderMarkdown(children) }}>
  </div>);
}

export default MarkdownRender;