import TextSelection from "./TextSelection.js";
import State from "./State.js";

class TextEditor {
    constructor(element, Format) {
        this.element = element;

        this.format = new Format();
        this.selection = new TextSelection(this.element, this.format);
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
            this.beforeInputHandler(event);
        })

        this.input_map = {
            "insertParagraph": this.format.block.P,
            "insertLineBreak": this.format.block.BR,
        }

    }

    update(selection) {
        this.element.innerHTML = "";

        var content = this.format.to_html(this.state.current);

        this.element.appendChild(content);

        this.selection.set(selection);
    }

    beforeInputHandler(event) {
        let data = this.getEventTextData(event);
        let range = event.getTargetRanges() ? event.getTargetRanges()[0] : null;

        console.log(event)

        if (!range) return;

        let start = this.selection.text_position(range.startContainer, range.startOffset).position;
        let end = this.selection.text_position(range.endContainer, range.endOffset).position;
        
        let length = Math.abs(end - start);

        console.log(this.selection.get_selection(start), this.selection.get_selection(end))
        console.log(start, end, length);
        
        this.state.update(start, {
            text: data,
            delete_count: length,
        });
        
        this.update(start + data.length);
    }

    getEventTextData(event) {
        if (this.input_map[event.inputType])
            return this.input_map[event.inputType];

        if (event.data) return event.data;

        if (event.dataTransfer?.types.includes("text/plain"))
            return event.dataTransfer.getData("text/plain");

        return "";
    }
}

export default TextEditor;