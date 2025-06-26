class Format {
    constructor() {
        this.block = {
            P: "\n",
            BR: "\n",
        }

        this.inline = {}
    }
    to_html(text) {
        return text + "\n";
    }

    from_html(html) {
        return this.strip_tags(html);
    }

    strip_tags(html) {
        return html.replaceAll(/<\/?[^>]+(>|$)/g, "");
    }
}

export default Format;