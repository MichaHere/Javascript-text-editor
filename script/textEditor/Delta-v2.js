class Delta {
    constructor (operations = [ ]) {
        this.operations = operations;

        this.options = {
            formats: {
                "bold": {
                    "tag": "strong",
                },
                "italic": {
                    "tag": "i",
                }
            },
            blocks: {
                "line": {
                    "tag": "br",
                    "enclosed": false,
                },
                "paragraph": {
                    "tag": "p",
                    "enclosed": true,
                },
                "ordered_list": {
                    "tag": "ol", 
                    "inner_tag": "li",
                    "enclosed": true,
                },
                "unordered_list": {
                    "tag": "ul", 
                    "inner_tag": "li",
                    "enclosed": true,
                }
            }
        }
    }

    test () {
        // TODO: Remove this function 
        console.log(this.#operations_to_content());
        console.log(this.#recalculate_positions(this.#sort_operations()))

    }

    insert (text, position) {
        // TODO: Add functionality 
    }

    delete (count, position) {
        // TODO: Add functionality 
    }

    get HTML () {
        var HTML = "";

        this.content.forEach(element => {
            HTML += this.#content_element_to_HTML(element);
        });

        return HTML;
    }

    get content () {
        return this.#operations_to_content();
    }

    #operations_to_content (operations = this.operations) {
        var content = this.#apply_all_delete_operations(operations);
        content = this.#merge_sequential_content(content);
        content = this.#recalculate_positions(content);
        return content;
    }

    #sort_operations (operations = this.operations) {
        let sorted_operations = structuredClone(operations);

        sorted_operations.sort((a, b) => {
            return parseFloat(a.position) - parseFloat(b.position);
        })
        
        return sorted_operations;
    }
    
    #apply_all_delete_operations (operations = this.operations) {
        operations = this.#sort_operations(operations);

        // get the position of the last delete operation
        function last_delete_operation_index () {
            let reverse_index = structuredClone(operations).reverse().findIndex(operation => {
                if (operation.type === "delete") {
                    return operation;
                }
            })

            if (reverse_index < 0) return -1;
            return operations.length - 1 - reverse_index;
        }

        let delete_operation_index = last_delete_operation_index();
        while (delete_operation_index > 0) {
            this.#apply_delete_operation(delete_operation_index, operations);
            
            operations.splice(delete_operation_index, 1);
            delete_operation_index = last_delete_operation_index();
        }

        return operations;
    }

    #apply_delete_operation (operation_index, operations = this.operations) {
        if (operations[operation_index].type !== "delete") return false;

        let operation = operations[operation_index];
        let delete_count = operation.count;

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

    #merge_sequential_content (content = this.content) {
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

    #content_element_to_HTML (content_element) {
        // TODO: Add functionality 

        return element_HTML;
    }

    #recalculate_positions (content = this.content) {
        content = structuredClone(content);
        let current_position = 0;

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
}

import sample_delta from "./test/content.js";


// TODO: Remove this code 
let d = new Delta(sample_delta.input_1)
d.test()