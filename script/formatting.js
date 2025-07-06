// FIX: When the paragraph and linebreak have the same characters it does not know which to pick and breaks

class Format {
    constructor() {
        this.block = {
            P: "\n\n",
            BR: "\n",
        }

        this.inline = {}
    }

    to_html(text) {
        var content = new DocumentFragment();

        this.format_paragraphs(text, content);

        return content;
    }

    format_paragraphs(text, content) {
        var text_array = text.split(this.block.P);

        for (let i = 0; i < text_array.length; i++) {
            let paragraph_content = text_array[i];
            let paragraph = document.createElement("p");
            
            paragraph.innerText = paragraph_content + "\n";
            content.appendChild(paragraph);
        }

        return content;
    }

    from_html(html) {
        return this.strip_tags(html);
    }

    strip_tags(html) {
        return html.replaceAll(/<\/?[^>]+(>|$)/g, "");
    }
}

export default Format;