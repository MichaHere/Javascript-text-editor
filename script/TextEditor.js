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
            
            if (event.ctrlKey && !shift &&
                event.keyCode === 90 // z key
            ) {
                let position = this.state.undo()
                
                this.updateContent();
                
                this.selection.absolute_position = { start: position };
            }
            
            if (event.ctrlKey && shift &&
                event.keyCode === 90 // z key
            ) {
                let position = this.state.redo()
                
                this.updateContent();
                
                this.selection.absolute_position = { start: position };
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

    updateContent() {
        this.element.innerHTML = this.format.to_html(this.state.content);
    }

    beforeInputHandler(event) {
        let data = this.getEventTextData(event);
        let range = event.getTargetRanges() ? event.getTargetRanges()[0] : null;

        if (!range) return;

        this.updateState(data, range);
    }

    updateState(data, range) {
        let start = this.selection.text_position(range.startContainer, range.startOffset, this.element.parentNode).offset;
        let end = this.selection.text_position(range.endContainer, range.endOffset, this.element.parentNode).offset;
        
        this.state.add_command(start, {
            text: data,
            delete_count: end - start,
        });
        
        this.updateContent();

        this.selection.absolute_position = { start: start + data.length };
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