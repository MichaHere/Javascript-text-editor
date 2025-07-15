// FIX: When the paragraph and linebreak have the same characters it does not know which to pick and breaks

class Format {
    constructor() {
        this.block = {
            P: "\n\n",
            BR: "\n",
        }

        this.inline = {}
    }

    to_html(content) {
        var html = new DocumentFragment();

        // TODO: Convert content to html

        return html;
    }

    from_html(html) {
        return this.strip_tags(html);
    }

    strip_tags(html) {
        return html.replaceAll(/<\/?[^>]+(>|$)/g, "");
    }
}

export default Format;