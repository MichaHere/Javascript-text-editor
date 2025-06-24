import TextSelection from "./TextSelection.js";
import State from "./State.js";
import { md_to_html } from "./markdown.js";

class TextEditor {
    constructor(element) {
        this.element = element;

        this.selection = new TextSelection(this.element);
        this.state = new State();

        this.element.role = "textbox";
        this.element.contentEditable = true;

        this.element.addEventListener("keydown", event => {
            let shift = event.getModifierState('CapsLock') ? !event.shiftKey : event.shiftKey;
            
            if (
                event.ctrlKey && !shift &&
                event.keyCode === 90 // z key
            ) {
                this.update(this.state.undo());
            }
            
            if (
                event.ctrlKey && shift &&
                event.keyCode === 90 // z key
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
        this.element.innerHTML = md_to_html(this.state.current);

        this.selection.set(selection);
    }

    insertText(event) {
        var selection = this.selection.get();
        var selection_range = Math.abs(selection.from - selection.to);
        let first_anchor = (selection.from > selection.to) ? selection.to : selection.from;

        this.state.update(first_anchor, {
            text: event.data,
            delete_count: selection_range,
        });

        this.update(first_anchor + event.data.length);
    }

    deleteContentForward(event) {
        var selection = this.selection.get();
        var selection_range = Math.abs(selection.from - selection.to);
        let first_anchor = (selection.from > selection.to) ? selection.to : selection.from;

        this.state.update(first_anchor, {
            delete_count: Math.max(1, selection_range),
        })

        this.update(first_anchor);
    }

    deleteContentBackward(event) {
        var selection = this.selection.get();
        var selection_range = Math.abs(selection.from - selection.to);
        let first_anchor = (selection.from > selection.to) ? selection.to : selection.from;

        if (selection_range > 0) {

            this.state.update(first_anchor, {
                delete_count: selection_range,
            })

            this.update(first_anchor);

        } else {

            this.state.update(first_anchor - 1, {
                delete_count: 1,
            })

            this.update(Math.max(0, first_anchor - 1));

        }
    }

    deleteWordForward(event) {
        var selection = this.selection.get().from;

        var string = this.state.current.substring(selection);
        var words = string.match(/(?!\n)\s\S+|\S+|(?!\n)\s+|\n/gm);

        if (words == null) return;

        var word_length = words[0].length;

        this.state.update(selection, {
            delete_count: word_length,
        })

        this.update(selection);
    }

    deleteWordBackward(event) {
        var selection = this.selection.get().from;

        var string = this.state.current.substring(0, selection);
        var words = string.match(/\S+(?!\n)\s(?!\s)|\S+|(?!\n)\s+|\n/gm);

        if (words == null) return;

        var word_length = words[words.length - 1].length;

        this.state.update(selection - word_length, {
            delete_count: word_length,
        })

        this.update(selection - word_length);
    }

    insertParagraph(event) {
        this.insertText({ data: "\n\n" });
    }

    insertLineBreak(event) {
        this.insertText({ data: "\n" });
    }
}

export default TextEditor;