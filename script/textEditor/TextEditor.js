import Delta from "./Delta.js";

function flat_child_nodes (element, filter = () => true) {
    let child_nodes = filter(element) ? [element] : [];

    for (let i = 0; i < element.childNodes.length; i++) {
        child_nodes.push(...flat_child_nodes(element.childNodes[i], filter));
    }

    return child_nodes;
}

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
    constructor (element, options = {}) {
        this.element = element;

        // Default options
        this.options = {
            state: [],
            delta_options: {},
            HTML_delta_element: undefined
        }

        // Overwrite default options
        this.options = { ...this.options, ...options };

        this.state = new Delta(this.options.state, this.options.delta_options);

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

    get selection () {
        var selection = window.getSelection();

        var from = this.text_position(this.element, selection.anchorNode, selection.anchorOffset);
        var to = this.text_position(this.element, selection.focusNode, selection.focusOffset);
        
        return {
            from: from,
            to: to
        }
    }

    set selection (position) {
        // TODO: Add a selection setter 
    }

    text_position (container, target, offset) {
        var element_list = flat_child_nodes(container);
        var index = element_list.findIndex((x) => x === target);
            
        if (index < 0) return false;
    
        var char_count = 0;
    
        if (target.nodeType === 3) {
            char_count += offset;
        }

        // Get all the break types available from the delta class 
        var break_types = [...new Set(Object.values(this.state.options.breaks).map(break_type => {
            let tag = (break_type.inner_tag) ? break_type.inner_tag : break_type.outer_tag;
            return tag.toUpperCase();
        }))]
    
        for (let i = index - 1; i >= 0; i--) {
            if (element_list[i].nodeType === 3) {
                char_count += element_list[i].textContent.length;
                continue;
            };

            if (break_types.includes(element_list[i].nodeName.toUpperCase())) char_count++;
        }
    
        return char_count;
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
