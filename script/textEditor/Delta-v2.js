class Delta {
    constructor (operations = [ ]) {
        this.operations = operations;
    }

    test () {
        // TODO: Remove this function 
        console.log(this.#operations_to_content());
        console.log(this.HTML)
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
        var content = this.#apply_delete_operations(operations);
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
    
    #apply_delete_operations (operations = this.operations) {
        operations = this.#sort_operations(operations);

        // get the position of the first delete operation
        function first_delete_operation_index() {
            return operations.findIndex(operation => {
                if (operation.type === "delete") {
                    return operation;
                }
            })
        }

        function apply_operation(index) {
            let current = operations[index];
            let next = operations[index + 1];

            if (!current || !next) return;

            while (current.count > 0) {
                switch (next.type) {
                    case "insert":
                        break;
                    case "delete":
                        next.count += current.count;
                        return;
                    default:
                        console.error("TextEditor Delta: Invalid operation provided.");
                        return;
                }
                
                switch (next.content_type) {
                    case "break":
                        operations.splice(index + 1, 1);
                        next = operations[index + 1];
                        current.count--;
                        break;
                    case "text":
                        if (next.text.length > current.count) {
                            next.text = next.text.substring(current.count);
                            current.count = 0;
                            return;
                        }

                        current.count -= next.text.length;
                        operations.splice(index + 1, 1);
                        next = operations[index + 1];
                        break;
                    default:
                        console.error("TextEditor Delta: Invalid operation provided.");
                        return;
                }
            }
        }

        let delete_operation_index = first_delete_operation_index();
        while (delete_operation_index > 0) {
            apply_operation(delete_operation_index);
            
            operations.splice(delete_operation_index, 1);
            delete_operation_index = first_delete_operation_index();
        }

        return operations;
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
            content.splice(i + 1, 1);
            i--;
        }

        return content;
    }

    #content_element_to_HTML (content_element) {
        // TODO: Add functionality 
        return element_HTML;
    }

    #recalculate_positions(content = this.content) {
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