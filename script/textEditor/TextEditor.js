import Delta from "./Delta.js";

/**
 * @class
 * @param {HTMLElement} element - The HTML element to use as the text editor. 
 * @param {JSON} options - The options for the text editor. 
 * This includes the state of the text editor as a Delta class (state), 
 * the formats that should be used in the text editor (formats), and
 * the block types that should be used in the text editor (blocks). 
 * @description A text editor class used to transform an HTML div into a text editor. 
 */
class TextEditor {
    constructor(element, options) {
        this.element = element;

        // Default options
        this.options = {
            state: new Delta()
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

export default TextEditor;
