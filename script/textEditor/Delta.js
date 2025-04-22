class Delta {
    constructor(operations = [], options = {}) {
        this.operations = operations;

        // Default options
        this.options = {
            formats: {
                "bold": {
                    "tag": "strong",
                },
                "italic": {
                    "tag": "i",
                }
            },
            breaks: {
                "line": {
                    "outer_tag": "br",
                    "enclosed": false,
                },
                "paragraph": {
                    "outer_tag": "p",
                    "enclosed": true,
                },
                "ordered_list": {
                    "outer_tag": "ol",
                    "inner_tag": "li",
                    "enclosed": true,
                },
                "unordered_list": {
                    "outer_tag": "ul",
                    "inner_tag": "li",
                    "enclosed": true,
                }
            }
        }

        // Overwrite default options
        this.options = { ...this.options, ...options };
    }

    insert_text(text, position, format = []) {
        // TODO: Add functionality 

        var node_type = "insert";
        var content_type = "text";
        var last = this.operations[this.operations.length - 1];

        if (last.type === node_type &&
            last.content_type === content_type &&
            last.text.length + last.position === position) {
                last.text += text;
                return;
        }

        this.#shift_positions(position, text.length);

        var new_operation = {
            "type": node_type,
            "position": position,
            "content_type": content_type,
            "text": text,
            "format": format
        }
        
        this.operations.push(new_operation);

        console.log(new_operation)
    }

    #shift_positions(at, amount) {
        for (let i = 0; i < this.operations.length; i++) {
            let operation = this.operations[i];

            if (operation.position >= at) {
                operation.position += amount;
            }
        }
    }

    insert_break(type, position) {
        // TODO: Add functionality 
    }

    delete(count, position) {
        // TODO: Add functionality 
    }
}

export default Delta;