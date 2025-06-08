import TextSelection from "./TextSelection.js";

class TextEditor {
    constructor(element) {
        this.element = element;

        this.selection = new TextSelection(this.element);

        this.element.role = "textbox";
        this.element.contentEditable = true;

        this.element.addEventListener("beforeinput", event => {
            event.preventDefault();

            if (typeof this[event.inputType] === "function") {
                this[event.inputType](event);
            } else {
                console.warn(`Function ${event.inputType} has jet to be implemented. `)
            }

        })
    }

    insertText(event) {
        var selection = this.selection.get().from;

        var content = this.element.innerHTML;
        this.element.innerHTML = [
            content.substring(0, selection), 
            event.data, 
            content.substring(selection)
        ].join("");
        
        this.selection.set(selection + event.data.length);
        
    }
}

export default TextEditor;