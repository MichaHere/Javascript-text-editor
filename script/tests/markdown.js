import Markdown from "../markdown.js";

var markdown = new Markdown();

var markdown_text = `
This is the first paragraph
This is a line break

And this is the second paragraph
`

console.log(markdown.to_html(markdown_text));