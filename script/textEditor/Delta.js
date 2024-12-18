function removeAt(index, count, string) {
    return string.slice(0, index) + string.slice(index + count);
}

class Delta {
    constructor(operations = []) {
        this.operations = operations;

        this.formats = {
            "bold": {
                "tags": ["strong"],
                "mergeIndex": [0],
            },
            "italic": {
                "tags": ["i"],
                "mergeIndex": [0],
            }
        }

        this.blocks = {
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
            },
        }
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

    filter_operations(type, delta = this) {
        return delta.operations.reduce((output, operation, index) => {
            if (operation.type === type) {
                output.push(index);
            }
            return output;
        }, [])
    }

    get_closest_integer(goal, array) {
        return array.reduce((previous, current) => {
            return (current > goal) ? previous : current
        })
    }

    apply_delete(operation_index, delta = this) {
        var delete_operation = delta.operations[operation_index];
        var insert_indexes = this.filter_operations("insert", delta);
        var closest_insert = this.get_closest_integer(operation_index, insert_indexes)
        
        let total_delete_count = delete_operation.count;
        for (let i = insert_indexes.indexOf(closest_insert); i < insert_indexes.length; i++) {
            let index = insert_indexes[i];
            let insert_operation = delta.operations[index];
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
                /*FIX:
                The paragraph becomes a list item */
                i--;
                total_delete_count--;
                delta.operations.splice(index, 1);
            }
        }

        delta.operations.splice(operation_index, 1);
    }

    apply_operations(delta = this) {


        /* TODO:
        Applies the delete operations, leaving only insert operations in order,  
        in as much as that the position property does not matter. */

        delta.operations.sort((a, b) => {
            return parseFloat(a.position) - parseFloat(b.position);
        })

        var delete_operation_indexes = this.filter_operations("delete", delta);

        for (let i = 0; i < delete_operation_indexes.length; i++) {
            let delete_operation_index = delete_operation_indexes[i];
            this.apply_delete(delete_operation_index, delta);
        }

        /* TODO: 
        Remove any insert operations without any text inside*/

        /*TODO:
        Merge consecutive operations into one */
        
        return delta;
    }

    get HTML() {
        var delta = this.apply_operations();
        var HTML = "";
        var buffer = "";

        for (let index = 0; index < delta.operations.length; index++) {
            let operation = delta.operations[index];
            if (operation.content_type === "text") {
                let formatBuffer = operation.text;
    
                var supported_formats = Object.keys(this.formats);
                for (let format_index = 0; format_index < supported_formats.length; format_index++) {
                    let format = supported_formats[format_index];
                    if (!operation.format.includes(format)) continue;
                    
                    format = this.formats[format];
                    formatBuffer = this.get_HTML_tags(format.tags).start + formatBuffer + this.get_HTML_tags(format.tags).end;
                }

                buffer += formatBuffer;
            }

            if (operation.content_type === "break") {
                if (operation.break === "line") {
                    buffer += "<br>";
                    continue;
                }

                var supported_blocks = Object.keys(this.blocks);
                var block_index = supported_blocks.indexOf(operation.break);

                if (isNaN(block_index)) continue;
                
                var block = this.blocks[supported_blocks[block_index]];

                buffer = this.get_HTML_tags(block.tags).start + buffer + "<br>" + this.get_HTML_tags(block.tags).end

                HTML += buffer;
                buffer = "";
            }
        }

        HTML = this.merge_sequential_HTML_tags(HTML);

        return HTML;
    }

    merge_sequential_HTML_tags(HTML) {
        var checks = {...this.formats, ...this.blocks};
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
}

// Maybe use AI to generate some more examples
sample_delta_input_2 = [
    {
        "type": "insert",
        "position": 0,
        "content_type": "break",
        "break": "paragraph"
    },
    {
        "type": "insert",
        "position": 1,
        "content_type": "text",
        "text": "Hello",
        "format": ["bold"]
    },
    {
        "type": "insert",
        "position": 6,
        "content_type": "break",
        "break": "line"
    },
    {
        "type": "insert",
        "position": 7,
        "content_type": "text",
        "text": "This is a second paragraph",
        "format": ["italic", "bold"]
    },
    {
        "type": "insert",
        "position": 33,
        "content_type": "break",
        "break": "ordered_list"
    },
    {
        "type": "insert",
        "position": 34,
        "content_type": "text",
        "text": "one",
        "format": []
    },
    {
        "type": "insert",
        "position": 37,
        "content_type": "break",
        "break": "ordered_list"
    },
    {
        "type": "insert",
        "position": 38,
        "content_type": "text",
        "text": "two",
        "format": []
    },
    {
        "type": "insert",
        "position": 39,
        "content_type": "break",
        "break": "paragraph"
    },
    {
        "type": "insert",
        "position": 40,
        "content_type": "text",
        "text": "The end",
        "format": []
    },
]

sample_delta_input_1 = [
    {
        "type": "insert",
        "position": 0,
        "content_type": "text",
        "text": "Hello",
        "format": ["bold"]
    },
    {
        "type": "insert",
        "position": 5,
        "content_type": "break",
        "break": "line"
    },
    {
        "type": "insert",
        "position": 6,
        "content_type": "text",
        "text": "This is a second paragraph",
        "format": ["italic", "bold"]
    },
    {
        "type": "insert",
        "position": 32,
        "content_type": "break",
        "break": "paragraph"
    },
    {
        "type": "insert",
        "position": 37,
        "content_type": "text",
        "text": "two",
        "format": []
    },
    {
        "type": "insert",
        "position": 40,
        "content_type": "break",
        "break": "ordered_list"
    },
    {
        "type": "insert",
        "position": 33,
        "content_type": "text",
        "text": "one",
        "format": []
    },
    {
        "type": "insert",
        "position": 36,
        "content_type": "break",
        "break": "ordered_list"
    },
    {
        "type": "delete",
        "position": 28,
        "count": 6
    }
]


const test_delta = new Delta(sample_delta_input_2);

let html = test_delta.HTML;

document.getElementById("textEditor").innerHTML = html;
document.getElementById("plain-html").innerText = html;
document.getElementById("delta").innerHTML = JSON.stringify(test_delta.operations)