import Format from "./formatting.js";

class Markdown extends Format {
    constructor() {
        super();
        this.block = {
            P: "\n\n",
            BR: "\n",
        }

        this.inline = {
            STRONG: {
                start: "**",
                end: "**"
            },
            I: {
                start: " _",
                end: "_ "
            }
        }
    }

    to_html(md) {
        var result = md;

        return result;
    }

    apply_paragraphs(md) {
        var array = md.split("\n\n");
        var html = "";

        for (let i = 0; i < array.length; i++) {
            html += `<p>${array[i]}</p>`;
        }

        return html;
    }
}

export default Markdown;