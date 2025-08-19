class Format {
    constructor() {
        this.block = {
            P: "\r",
            BR: "\n",
        }

        this.inline = {}
    }

    to_html(content) {
        var html = document.createElement('div');
        var buffer = new DocumentFragment();

        if (!content.length) return "";

        for (let i = 0; i < content.length; i++) {
            let element = content[i];

            if (!buffer.firstChild) {
                buffer.append(document.createElement(element.format.block));
            }

            if (buffer.firstChild.nodeName !== element.format.block.toUpperCase()) {
                buffer.firstChild.append(document.createElement("br"));
                html.append(buffer);
                buffer.append(document.createElement(element.format.block));
            }

            let paragraphs = element.text.split(this.block.P);

            for (let i = 0; i < paragraphs.length; i++) {
                buffer.firstChild.append(this.text_to_html(paragraphs[i], element.format));
                buffer.firstChild.append(document.createElement("br"));
                html.append(buffer);
                buffer.append(document.createElement(element.format.block));
            }
        }
        
        // buffer.firstChild.append(document.createElement("br"));
        // html.append(buffer);

        return html.innerHTML;
    }

    text_to_html(text, format) {
        // TODO: Add proper inline format handling
        var html = new DocumentFragment();
        var text_nodes = text.split(this.block.BR);
        
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
}

export default Format;