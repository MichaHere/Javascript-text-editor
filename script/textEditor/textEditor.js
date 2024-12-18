class Delta {
    constructor() {
        this.operations = [];
        this.conditions = [
            {
                condition: /\*\*.+\*\*/g,
                tag: "<strong>$&</strong>",
            }
        ];
    }

    get html() {
        console.debug(this.operations)
        let HTML = "";
        for (let opi = 0; opi < this.operations.length; opi++) {
            let operation = this.operations[opi];
            let types = Object.keys(operation);

            if (types.includes("insert")) {
                let insert = operation.insert;
                insert = insert.replace("\n", "<br>");

                HTML += insert;
            }
        }

        return HTML;
    }

    retain(number) {
        let last_operation = this.operations[this.operations.length - 1];

        if (this.operations.length && 
            typeof last_operation.retain === "number") {
            last_operation.retain += number;

            return this;
        }

        this.operations.push({ retain: number });

        return this;
    }

    insert(text, attributes) {
        let last_operation = this.operations[this.operations.length - 1];
        let change = { insert: text };

        if (attributes) { change.attributes = attributes };

        if (!(text instanceof String || 
            typeof text === "string") || 
            text.length <= 0) {
            throw new Error("Text agrument must be a string instance. ")
        }
        
        if (this.operations.length && 
            Object.keys(last_operation).includes("retain") &&
            Object.keys(last_operation).length === 1) {
            change = {...this.operations.pop(), ...change};
        }

        this.operations.push(change);
            
        return this;
    }

    delete(number) {
        let last_operation = this.operations[this.operations.length - 1];
        let change = { insert: text };

        if (!(number instanceof Number || 
            typeof number === "number") || 
            number <= 0) return this;
        
        if (this.operations.length && last_operation.retain &&
            Object.keys(last_operation).length === 1) {
            change = {...this.operations.pop(), ...change};
        }
        
        this.operations.push(change);
        
        return this;
    }

    inject(other_delta, index) {
        if (!(other_delta instanceof Delta)) {
            throw new Error('Argument must be a Delta instance');
        }

        const composed_delta = new Delta();
        const operations = this.operations;
        operations.splice(index, 0, ...other_delta.operations);
        composed_delta.operations = operations;
                
        return composed_delta;
    }

    concat(other_delta) {
        if (!(other_delta instanceof Delta)) {
            throw new Error('Argument must be a Delta instance');
        }

        const composed_delta = new Delta();
        composed_delta.operations = this.operations.concat(other_delta.operations);

        return composed_delta;
    }

    static clean_up(delta) {
        if (!(delta instanceof Delta)) {
            throw new Error('Argument must be a Delta instance');
        }

        let cleaned_delta = new Delta();

        // TODO: make it look for consecutive similar operations and merge them 

        return delta;
    }
}

var testDelta = new Delta()
    .insert("This is a test text").insert("\n", {paragraph: true})
    .insert("This is the second line").insert("\n", {paragraph: true});
console.debug(testDelta.html)

document.getElementById("textEditor").innerHTML = testDelta.html


class Line {
    constructor(type, content) {
        this.type = type;
        this.content = content;
    }
}

class TextEditor {
    constructor(element, options) {
        this.element = element;

        // Default options
        this.options = {
            state: new Delta().insert("\n", { paragraph: true }),
        }

        // Overwrite default options
        if (options) this.options = { ...this.options, ...options };

        this.state = this.options.state;

        this.cursor_position = 0;

        this.block_elements = [
            "paragraph",
        ];

        this.__init__();
    }

    __init__() {
        this.element.contentEditable = true;
        this.element.ariaMultiLine = true;
        this.element.role = "textbox";
        this.element.spellcheck = true;

        this.element.addEventListener("beforeinput", event => {
            event.preventDefault();

            if (!this[event.inputType]) 
                throw new Error(`${event.inputType} is not a valid method. `);

            this.apply_delta(this[event.inputType](event));
        })
    }

    insertText(event) {
        let delta = new Delta().retain(this.cursor_position).insert(event.data);
        this.cursor_position++;
        return delta;
    }

    // deleteContentBackward(event) {

    // }

    // deleteContentForward(event) {

    // }

    remove_empty() {

    }

    apply_delta(delta) {
        this.state = this.state.concat(delta);
        this.state = Delta.clean_up(this.state);
    }


    get content() { }
}
