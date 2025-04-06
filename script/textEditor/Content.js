import Delta from "./Delta.js";

class Content extends Delta {
    constructor(operations = [], options = {}) {
        super(operations, options);
    }

    get content() {
        var operations = this.oder_operations(this.operations);
        operations = this.make_queue(operations);

        var content = operations;
        return content;
    }

    get HTML() {
        return JSON.stringify(this.content);
    }

    make_queue(operations = this.operations) {
        var operations = structuredClone(operations);
        var position = 0;

        let last_operation;
        for (let i = 0; i < operations.length; i++) {
            let operation = operations[i];

            if (operation.type !== "insert") {
                last_operation = operation;
                continue;
            }

            if (operation.content_type !== "text") {
                position++;

                last_operation = operation;
                continue;
            }

            if (operation.position < position) {
                // TODO: This should append the current operation to the previous one if they have the same type, 
                // otherwise it should split the previous operation at the position of the current operation and reorder. 
            }

            position += operation.text.length;
            last_operation = operation;
        }

        return operations;
    }

    split_operation(operation, position) {
        // TODO: Add functionality
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
}

export default Content;
