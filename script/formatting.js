class Format {
    constructor() {
        this.block = {
            paragraph: "\n",
            break: "\n",
        }

        this.inline = {}
    }
    to_html(text) {
        return text;
    }

    from_html(html) {
        return this.strip_tags(html);
    }

    strip_tags(html) {
        return html.replaceAll(/<\/?[^>]+(>|$)/g, "");
    }
}

export default Format;