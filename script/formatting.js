class Format {
    constructor() {
        this.block = {
            P: "\n",
            BR: "\n",
        }

        this.inline = {}
    }

    to_html(content) {
        var html = new DocumentFragment();
        var buffer;

        for (let i = 0; i < content.length; i++) {
            let element = content[i];

            if (!buffer) buffer = document.createElement(element.format.block);
            if (buffer.nodeName !== element.format.block.toUpperCase()) {
                buffer.innerHTML += "<br>";
                html.appendChild(buffer);
                buffer = document.createElement(element.format.block);
            }

            buffer.innerHTML += this.element_to_html(element)
        }
        
        buffer.innerHTML += "<br>";
        html.appendChild(buffer);

        return html;
    }

    element_to_html(element) {
        // TODO: Add proper inline format handling
        var new_text = `${element.text}`;
        new_text = new_text.replace(/(?:\r\n|\r|\n)/g, "<br>")

        return new_text;
        
        // var formats = element.format.inline;

        // for (let i = 0; i < formats.length; i++) {
        //     let format = formats[i];

        // }
    }

    from_html(html) {
        return this.strip_tags(html);
    }

    strip_tags(html) {
        return html.replaceAll(/<\/?[^>]+(>|$)/g, "");
    }
}

export default Format;