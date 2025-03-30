function insert_text_at (text, at, insert) {
    return text.substring(0, at) + insert + text.substring(at);
}

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

        console.log(position, last.text.length + last.position)

        if (last.type === node_type &&
            last.content_type === content_type &&
            last.text.length + last.position === position) {
                last.text += text;
                return;
        }

        this.#shift_positions(position, text.length);

        this.operations.push({
            "type": node_type,
            "position": position,
            "content_type": content_type,
            "text": text,
            "format": format
        })

        console.log(structuredClone(this.operations))

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

    get HTML() {
        var HTML = "";
        var content = this.content;

        var outer_tag = "";
        var inner_tag = "";

        for (let i = 0; i < content.length; i++) {
            let element = content[i];

            if (element.content_type === "text") {
                let starting_tag = "";
                let ending_tag = "";

                for (let i = 0; i < element.format.length; i++) {
                    let format = element.format[i];
                    let format_data = this.options.formats[format];

                    starting_tag = starting_tag + `<${format_data.tag}>`;
                    ending_tag = `</${format_data.tag}>` + ending_tag;
                }

                HTML += starting_tag + element.text + ending_tag;
                
                continue;
            }

            if (element.content_type === "break") {
                let break_data = this.options.breaks[element.break];

                if (!break_data.enclosed) {
                    HTML += `<${break_data.outer_tag}>`;
                    continue;
                }

                HTML += (inner_tag) ? `</${inner_tag}>` : "";

                if (outer_tag !== break_data.outer_tag) {
                    HTML += (outer_tag) ? `</${outer_tag}>` : "";
                    HTML += `<${break_data.outer_tag}>`
                }

                HTML += (break_data.inner_tag) ? `<${break_data.inner_tag}>` : "";

                outer_tag = break_data.outer_tag;
                inner_tag = (break_data.inner_tag) ? break_data.inner_tag : "";

                continue;
            }

            this.#warning("get HTML", "invalid content type encountered");
        }

        HTML += (inner_tag) ? `</${inner_tag}>` : "";
        HTML += (outer_tag) ? `</${outer_tag}>` : "";

        return HTML;
    }

    get content() {
        return this.#operations_to_content();
    }

    #operations_to_content(operations = this.operations) {
        var content = this.#apply_all_delete_operations(operations);
        // TODO: Make sure to append a break if the content is empty 
        // FIX: Make breaks work even if they are not appended at the end of the text elements 
        content = this.#merge_sequential_content(content);
        content = this.#recalculate_content_positions(content);
        return content;
    }

    #sort_operations(operations = this.operations) {
        var sorted_operations = structuredClone(operations);

        sorted_operations.sort((a, b) => {
            let result = parseFloat(a.position) - parseFloat(b.position);
            if (result === 0 && a.type !== b.type) {
                result = (a.type === "insert") ? -1 : 1;
            }
            return result;
        })

        return sorted_operations;
    }

    #apply_all_delete_operations(operations = this.operations) {
        operations = this.#sort_operations(operations);

        // get the position of the last delete operation
        function last_delete_operation_index() {
            let reverse_index = structuredClone(operations).reverse().findIndex(operation => {
                if (operation.type === "delete") {
                    return operation;
                }
            })

            if (reverse_index < 0) return -1;
            return operations.length - 1 - reverse_index;
        }

        var delete_operation_index = last_delete_operation_index();
        while (delete_operation_index > 0) {
            this.#apply_delete_operation(delete_operation_index, operations);

            operations.splice(last_delete_operation_index(), 1);
            delete_operation_index = last_delete_operation_index();
        }

        return operations;
    }

    #apply_delete_operation(operation_index, operations = this.operations) {
        if (operations[operation_index].type !== "delete") {
            this.#warning("#apply_delete_operation", "encountered wrong operation type");
            return false;
        };

        var operation = operations[operation_index];
        var delete_count = operation.count;

        for (let i = operation_index - 1; i < operations.length; i++) {
            let current = operations[i];

            if (current.type !== "insert") continue;

            if (current.content_type === "text") {
                let text_position = operation.position - current.position;
                let text_delete_count = Math.min(delete_count, current.text.length - text_position);
                let old_text = current.text;

                current.text = old_text.substring(0, text_position);
                current.text += old_text.substring(text_position + text_delete_count);

                if (current.text.length === 0) {
                    operations.splice(i--, 1);
                }
            }

            if (current.content_type === "break") {
                if (operation.position + delete_count - current.position < 0) continue;
                operations.splice(i--, 1);
            }

        }
    }

    #merge_sequential_content(content = this.content) {
        content = structuredClone(content);

        for (let i = 0; i < content.length; i++) {
            let current = content[i];
            let next = content[i + 1];

            if (!current || !next) continue;
            if (current.type !== "insert") continue;
            if (next.type !== "insert") { i++; continue; }
            if (current.content_type !== "text" || next.content_type !== "text") continue;

            // Check if formats are the same
            if (!(current.format.length === next.format.length &&
                current.format.every(current_format => {
                    return next.format.includes(current_format);
                }))) continue;

            current.text += next.text;
            content.splice(1 + i--, 1);
        }

        return content;
    }

    #recalculate_content_positions(content = this.content) {
        content = structuredClone(content);
        var current_position = 0;

        for (let i = 0; i < content.length; i++) {
            let operation = content[i];

            if (operation.type !== "insert") continue;

            operation.position = current_position;

            if (operation.content_type === "text") {
                current_position += operation.text.length;
            }

            if (operation.content_type === "break") {
                current_position++;
            }
        }

        return content;
    }

    #warning (function_name, message) {
        console.warn(`[Delta] in ${function_name}: ${message}`);
    }

    #error( function_name, message) {
        console.error(`[Delta] in ${function_name}: ${message}`);
    }
}

export default Delta;