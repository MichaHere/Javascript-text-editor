class Format {
    constructor() {
        this.block = {
            P: "\n",
            BR: "\n",
        }

        this.inline = {}
    }

    to_html(text) {
        var content = new DocumentFragment();

        var paragraph = document.createElement("p");
        paragraph.innerText = text + "\n";

        content.appendChild(paragraph);

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