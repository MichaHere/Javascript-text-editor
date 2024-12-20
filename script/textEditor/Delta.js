function removeAt(index, count, string) {
    return string.slice(0, index) + string.slice(index + count);
}

function get_closest_integer(goal, array) {
    return array.reduce((previous, current) => {
        return (current > goal) ? previous : current
    })
}

/**
 * @class
 * @param {Array} operations - The operations that should applied to the created Delta. 
 * @param {JSON} options - The options to use in the Delta, including formats and block types to use. 
 * @description A state element that can be used to transform operations into HTML format. 
 * The order of the operations does not matter. 
 */
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
        if (options) this.options = { ...this.options, ...options };

        this.__init__();
    }

    __init__() {
        this.clean();
    }

    sort(delta = this) {
        delta.operations.sort((a, b) => {
            return parseFloat(a.position) - parseFloat(b.position);
        })
    }

    clean(delta = this) {
        this.sort(delta);

        for (let i = 0; i < delta.operations.length; i++) {
            let current = delta.operations[i];
            let previous = delta.operations[i-1];

            if (current.type !== "insert") continue;
            if (current.content_type !== "text") continue;

            if (!current.text) {
                delta.operations.splice(i, 1);
                i--;
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
        }

        this.recalculate_positions();
    } 

    recalculate_positions(ordered_delta = this) {
        let current_position = 0;

        for (let i = 0; i < ordered_delta.operations.length; i++) {
            let operation = ordered_delta.operations[i];
            
            if (operation.type !== "insert") continue;
            
            operation.position = current_position;

            if (operation.content_type === "text") {
                current_position += operation.text.length
            }

            if (operation.content_type === "break") {
                current_position++
            }
        }

        ordered_delta.length = current_position;
    }

    apply_operations(delta = this) {
        this.sort(delta);

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

            if (insert_operation.content_type === "break") {
                delta.operations.splice(index, 1);
                total_delete_count--;
                i--;
            }
        }

        delta.operations.splice(operation_index, 1);
    }

    get_HTML_tags(tags) {
        var start = "";
        var end = "";

        for (let tag of tags) {
            start = start + `<${tag}>`;
            end = `</${tag}>` + end;
        }

        return {
            "start": start,
            "end": end,
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
