import Format from "./formatting.js";


class Markdown extends Format {
    constructor() {
        super();
        this.block = {
            paragraph: "\n\n",
            break: "\n",
        }

        this.inline = {
            bold: {
                start: "**",
                end: "**"
            },
            italic: {
                start: " _",
                end: "_ "
            }
        }
    }

    to_html(md) {
        return md;
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