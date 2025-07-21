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
        var buffer = new DocumentFragment();

        if (!content.length) return html;

        for (let i = 0; i < content.length; i++) {
            let element = content[i];

            if (!buffer.firstChild) buffer.append(document.createElement(element.format.block));
            if (buffer.firstChild.nodeName !== element.format.block.toUpperCase()) {
                buffer.firstChild.append(document.createElement("br"));
                html.append(buffer);
                buffer.append(document.createElement(element.format.block));
            }

            buffer.firstChild.append(this.element_to_html(element));
        }
        
        buffer.firstChild.append(document.createElement("br"));
        html.append(buffer);

        return html;
    }

    element_to_html(element) {
        // TODO: Add proper inline format handling
        var html = new DocumentFragment();
        var text_nodes = element.text.split("\n");
        
        for (let i = 0; i < text_nodes.length - 1; i++) {
            let text_node = text_nodes[i];
            html.append(text_node);
            html.append(document.createElement("br"));
        }

        html.append(text_nodes[text_nodes.length - 1]);

        return html;
        
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