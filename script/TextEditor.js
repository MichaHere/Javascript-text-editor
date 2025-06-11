import TextSelection from "./TextSelection.js";
import State from "./State.js";

class TextEditor {
    constructor(element) {
        this.element = element;

        this.selection = new TextSelection(this.element);
        this.state = new State();

        this.element.role = "textbox";
        this.element.contentEditable = true;

        this.element.addEventListener("keydown", event => {
            if (
                event.ctrlKey && 
                event.key === "z"
            ) {
                this.update(this.state.undo());
            }
            
            if (
                event.ctrlKey && 
                event.shiftKey &&
                event.key === "Z"
            ) {
                this.update(this.state.redo());
            }
        })

        this.element.addEventListener("beforeinput", event => {
            event.preventDefault();

            if (typeof this[event.inputType] === "function") {
                this[event.inputType](event);
            } else {
                console.warn(`Function ${event.inputType} has jet to be implemented. `)
            }

        })
    }

    update(selection) {
        this.element.innerHTML = this.state.current;

        this.selection.set(selection);
    }

    insertText(event) {
        var selection = this.selection.get();
        var selection_range = Math.abs(selection.from - selection.to);
        let first_anchor = (selection.from > selection.to) ? selection.to : selection.from;

        this.state.delete(selection_range, first_anchor);
        this.state.insert(event.data, first_anchor);

        this.update(first_anchor + event.data.length);
    }

    deleteContentForward(event) {
        var selection = this.selection.get();
        var selection_range = Math.abs(selection.from - selection.to);
        let first_anchor = (selection.from > selection.to) ? selection.to : selection.from;

        this.state.delete(Math.max(1, selection_range), first_anchor);

        this.update(first_anchor);
    }

    deleteContentBackward(event) {
        var selection = this.selection.get();
        var selection_range = Math.abs(selection.from - selection.to);
        let first_anchor = (selection.from > selection.to) ? selection.to : selection.from;

        if (selection_range > 0) {

            this.state.delete(selection_range, first_anchor);

            this.update(first_anchor);

        } else {

            this.state.delete(1, first_anchor - 1);

            this.update(Math.max(0, first_anchor - 1));

        }
    }

    deleteWordForward(event) {
        var selection = this.selection.get().from;

        var string = this.state.current.substring(selection);
        var words = string.match(/(\s+)?[^\s]+/gm);

        if (words === null) return;

        var word_length = words[0].length;

        this.state.delete(word_length, selection);
        this.update(selection);
    }

    deleteWordBackward(event) {
        var selection = this.selection.get().from;

        var string = this.state.current.substring(0, selection);
        var words = string.match(/[^\s]+(\s+)?/gm);

        if (words === null) return;

        var word_length = words[words.length - 1].length;

        this.state.delete(word_length, selection - word_length);
        this.update(selection - word_length);
    }
}

export default TextEditor;