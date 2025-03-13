function insert_text_at (text, at, insert) {
    return text.substring(0, at) + insert + text.substring(at);
}

class Delta {
    constructor(operations = [], options) {
        this.operations = operations;
        this.length;

        // Default options
        this.options = {
            formats: {
                "bold": {
                    "tags": ["strong"],
                    "mergeIndex": [0],
                },
                "italic": {
                    "tags": ["i"],
                    "mergeIndex": [0],
                }
            },
            blocks: {
                "paragraph": {
                    "tags": ["p"],
                    "mergeIndex": [],
                },
                "ordered_list": {
                    "tags": ["ol", "li"],
                    "mergeIndex": [0],
                },
                "unordered_list": {
                    "tags": ["ul", "li"],
                    "mergeIndex": [0],
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

        if (
            last.type === node_type &&
            last.text.length + last.position === position
        ) {
            last.text += text;
            return;
        }

        this.operations.push({
            "type": node_type,
            "position": position,
            "content_type": content_type,
            "text": text,
            "format": format
        })
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
            
            if (!previous.format) continue;

            if (current.format.length === previous.format.length &&
                current.format.every((current_format) => {
                    return previous.format.includes(current_format);
                })
            ) {
                previous.text += current.text;
                delta.operations.splice(i, 1);
                i--;
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
        content = this.#recalculate_positions(content);
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

        var delete_operation_indexes = this.filter_operations("delete", delta);

        for (let i = 0; i < delete_operation_indexes.length; i++) {
            let delete_operation_index = delete_operation_indexes[i];
            this.apply_delete(delete_operation_index, delta);
        }

        this.clean(delta);
        
        return delta;
    }

    apply_delete(operation_index, delta = this) {
        var delete_operation = delta.operations[operation_index];
        var insert_indexes = this.filter_operations("insert", delta);
        var closest_insert = get_closest_integer(operation_index, insert_indexes)
        
        let total_delete_count = delete_operation.count;
        for (let i = insert_indexes.indexOf(closest_insert); i < insert_indexes.length; i++) {
            let index = insert_indexes[i];
            let insert_operation = delta.operations[index];

            if (!insert_operation) continue;

            let delete_position = Math.max(0, delete_operation.position - insert_operation.position);

            if (insert_operation.content_type === "text") {
                let delete_count = insert_operation.text.length - delete_position;
                if (total_delete_count <= delete_count) {
                    insert_operation.text = removeAt(delete_position, total_delete_count, insert_operation.text);
                    break;
                };

                insert_operation.text = removeAt(delete_position, total_delete_count, insert_operation.text);
                total_delete_count = total_delete_count - delete_count;
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
                })
            )) continue;
            
            // FIX: Maybe use a local position 
            console.log(current.text, next.position, next.text);
            current.text = insert_text_at(current.text, next.position, next.text);
            content.splice(1 + i--, 1);
        }
    }

    get HTML() {
        var delta = this.apply_operations();
        var HTML = "";
        var buffer = "";
        var line_end_buffer = "";

        for (let index = 0; index < delta.operations.length; index++) {
            let operation = delta.operations[index];
            if (operation.content_type === "text") {
                let formatBuffer = operation.text;
    
                var supported_formats = Object.keys(this.options.formats);
                for (let format_index = 0; format_index < supported_formats.length; format_index++) {
                    let format = supported_formats[format_index];
                    if (!operation.format.includes(format)) continue;
                    
                    format = this.options.formats[format];
                    formatBuffer = this.get_HTML_tags(format.tags).start + formatBuffer + this.get_HTML_tags(format.tags).end;
                }

                buffer += formatBuffer;
            }

            if (operation.content_type === "break") {
                if (operation.break === "line") {
                    buffer += "<br>";
                    continue;
                }

                var supported_blocks = Object.keys(this.options.blocks);
                var block_index = supported_blocks.indexOf(operation.break);

                if (isNaN(block_index)) continue;

                var block = this.options.blocks[supported_blocks[block_index]];

                buffer += line_end_buffer + this.get_HTML_tags(block.tags).start;
                line_end_buffer = "<br>" + this.get_HTML_tags(block.tags).end;

                HTML += buffer;
                buffer = "";
            }
        }

        HTML += buffer + line_end_buffer;

        HTML = this.merge_sequential_HTML_tags(HTML);

        return HTML;
    }

    merge_sequential_HTML_tags(HTML) {
        var checks = {...this.options.formats, ...this.options.blocks};
        var checkNames = Object.keys(checks);

        for (let checkName of checkNames) {
            let check = checks[checkName];
            
            for (let i of check.mergeIndex) {
                let mergeTag = check.tags[i];
                
                HTML = HTML.replaceAll(`</${mergeTag}><${mergeTag}>`, "");
            }
        }

        return HTML;
    }

    filter_operations(type, delta = this) {
        return delta.operations.reduce((output, operation, index) => {
            if (operation.type === type) {
                output.push(index);
            }
            return output;
        }, [])
    }
}

export default Delta;
