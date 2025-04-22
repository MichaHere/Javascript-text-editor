import Delta from "./Delta.js";

function insert_text_at (text, at, insert) {
    return text.substring(0, at) + insert + text.substring(at);
}

class Content extends Delta {
    constructor(operations = [], options = {}) {
        super(operations, options);
    }

    get content() {
        var operations = this.make_queue(operations);
        
        var content = operations;
        return content;
    }

    get HTML() {
        let content = this.content;
        console.log(content);
        return this.get_plain_text(content);
    }

    make_queue(operations = this.operations) {
        var operations = structuredClone(operations);
        operations = this.oder_operations(operations);

        console.log(structuredClone(operations))

        let position = 0;
        let last_text;
        for (let i = 0; i < operations.length; i++) {
            let operation = operations[i];
            
            // debugger
            // console.log(operation, operation.type !== "insert")

            if (operation.type !== "insert") continue;

            if (operation.content_type === "break") {
                position++;
                continue;
            }

            if (operation.content_type !== "text") continue;

            // if (operation.position !== position) debugger;

            if (operation.position < position) {
                if (this.has_same_format(operation, last_text)) {
                    let insert_position = operation.position - last_text.position;
                    last_text.text = insert_text_at(last_text.text, insert_position, operation.text);

                    position += operation.text.length; 
                    operations.splice(i, 1);
                    i--;

                    continue;
                }

                // Split the last operation, and append the current operation in the middle of the split
                let split_a, split_b = this.split_operation(last_text, operation.position);
                let last_text_index = operations.indexOf(last_text);
                operations.splice(last_text_index, 1, split_a, operation, split_b);
                operations.splice(i, 1);
            }

            position += operation.text.length;
            last_text = operation;
        }

        return operations;
    }

    split_operation(operation, position) {
        let a = structuredClone(operation);
        let b = structuredClone(operation);

        a.text = a.text.substring(0, position);
        b.text = b.text.substring(position);

        return a, b;
    }

    has_same_format(a, b) {
        if (a.format.length !== b.format.length) return false;

        if (!a.format.every(a_format => {
            return b.format.includes(a_format);
        })) return false;

        return true;
    }

    oder_operations(operations = this.operations) {
        var odered_operations = structuredClone(operations);

        odered_operations.sort((a, b) => {
            let result = parseFloat(a.position) - parseFloat(b.position);
            if (result === 0 && a.type !== b.type) {
                result = (a.type === "insert") ? -1 : 1;
            }
            return result;
        })

        return odered_operations;
    }


    get_plain_text(content = this.content) {
        var text = "";

        for (let i = 0; i < content.length; i++) {
            let element = content[i];
            if (element.type !== "insert") continue;
            if (element.content_type !== "text") {
                text += "\n";
                continue;
            };
            text += element.text;
        }

        text = text.substring(1) + "\n"

        return text;
    }
}

export default Content;
