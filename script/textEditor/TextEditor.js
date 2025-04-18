import Content from "./Content.js";

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
 * This includes the state of the text editor as a Content class (state), 
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
            Content_options: {},
            HTML_Content_element: undefined
        }

        // Overwrite default options
        this.options = { ...this.options, ...options };

        this.state = new Content(this.options.state, this.options.Content_options);

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
        var element_list = flat_child_nodes(this.element);

        this.count_position(element_list, {
            function: (element, old_count, new_count) => {
                if (element.nodeType !== 3) return true;

                if (new_count >= position) {
                    let local_position = position - old_count;
                    this.set_selection(element, local_position);
                    return false;
                }

                return true;
            }
        }) 
    }

    set_selection (beginNode, beginOffset = 0, endNode = beginNode, endOffset = beginOffset) {
        var selection = window.getSelection();
        var range = document.createRange();
    
        range.collapse();
        range.setStart(beginNode, beginOffset);
        range.setEnd(endNode, endOffset)
    
        selection.removeAllRanges();
        selection.addRange(range);
    }

    text_position (container = this.element, target, offset) {
        var element_list = flat_child_nodes(container);
        var index = element_list.findIndex((x) => x === target);
        
        var char_count = this.count_position(element_list, { stop_index: index });

        if (target.nodeType === 3) {
            char_count += offset;
        }

        return char_count;
    }

    count_position (element_list, options) {
        // TODO: Maybe tidy this up a little 
        
        var default_options = {
            stop_index: element_list.length,
            function: (element, old_count, new_count) => { return true; },
        }

        options = { ...default_options, ...options }

        if (options.stop_index < 0 || options.stop_index > element_list.length) {
            this.#error("count_position", `invalid provided stop_index of ${options.stop_index}`);
            return 0;
        }
        
        var char_count = 0;

        // Get all the break types available from the Content class 
        var break_types = [...new Set(Object.values(this.state.options.breaks).map(break_type => {
            let tag = (break_type.inner_tag) ? break_type.inner_tag : break_type.outer_tag;
            return tag.toUpperCase();
        }))]
    
        for (let i = 0; i < options.stop_index; i++) {
            let element = element_list[i];

            let new_count = char_count;

            if (element.nodeType === 3) {
                new_count += element.textContent.length;
            };

            if (break_types.includes(element.nodeName.toUpperCase())) new_count++;

            // Break loop if the function returns false
            if (!options.function(element, char_count, new_count)) break;

            char_count = new_count;
        }
    
        return char_count;
    }
    
    insertText (event) {
        let position = this.selection.from;
        
        let text = event.data;
        this.state.insert_text(text, position - 1);
        
        this.update();
        this.selection = position + text.length;
    }

    // deleteContentBackward (event) {

    // }

    // deleteContentForward (event) {

    // }

    update (state = this.state) {
        this.element.innerHTML = state.HTML;

        if (this.options.HTML_Content_element) {
            this.options.HTML_Content_element.innerHTML = JSON.stringify(state.content);
        }
    }

    #warning (function_name, message) {
        console.warn(`[TextEditor] in ${function_name}: ${message}`);
    }

    #error( function_name, message) {
        console.error(`[TextEditor] in ${function_name}: ${message}`);
    }
}

export default TextEditor;
