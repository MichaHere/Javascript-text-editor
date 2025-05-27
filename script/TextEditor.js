import TextSelection from "./TextSelection.js";
import { flat_child_nodes } from "./functions.js";

class TextEditor {
    constructor(element) {
        this.element = element;

        this.selection = new TextSelection(this.element);

        this.element.role = "textbox";
        this.element.contentEditable = true;

        this.element.addEventListener("beforeinput", event => {
            event.preventDefault();

            try {
                this[event.inputType](event);
            } catch (error) {
                console.error(`${error} in TextEditor`.replace(
                    "[event.inputType]", `.${event.inputType}`
                ))
            }
        })
    }

    insertText(event) {
        let selection = this.selection.get().from;

        this.element.innerHTML += event.data;
        
        this.selection.set(selection + event.data.length);
        
    }
}

export default TextEditor;