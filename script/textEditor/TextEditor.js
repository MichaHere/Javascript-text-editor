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
    constructor (element, options) {
        this.element = element;

        // Default options
        this.options = {
            state: new Delta(),
            HTML_delta_element: undefined
        }

        // Overwrite default options
        if (options) this.options = { ...this.options, ...options };

        this.state = this.options.state;

        this.cursor_position = 0;

        this.#init();
    }

    #init () {
        this.element.contentEditable = true;
        this.element.ariaMultiLine = true;
        this.element.role = "textbox";
        this.element.spellcheck = true;

        this.element.addEventListener("beforeinput", event => {
            event.preventDefault();

            if (!this[event.inputType]) 
                throw new Error(`${event.inputType} is not a valid method. `);

            this[event.inputType](event);
        })
        
        this.update()
    }

    

    insertText (event) {

    }

    // deleteContentBackward (event) {

    // }

    // deleteContentForward (event) {

    // }

    update (state = this.state) {
        this.element.innerHTML = state.HTML;

        if (this.options.HTML_delta_element) {
            this.options.HTML_delta_element.innerHTML = JSON.stringify(state.content);
        }
    }
}

export default TextEditor;
