import { block } from "./settings.js";

export class TextSelection {
    constructor(element) {
        this.element = element;
    }

    get() {
        var selection = window.getSelection();

        var from = this.text_position(this.element, selection.anchorNode, selection.anchorOffset);
        var to = this.text_position(this.element, selection.focusNode, selection.focusOffset);

        return {
            from: from,
            to: to
        };
    }

    set(position) {
        // Could probably be optimized by starting at the bottom of the node
        let editor_nodes = this.descendant_nodes();

        if (editor_nodes.length === 0) {
            this.set_selection(this.element, 0);
            return;
        }

        let current_position = 0;
        let node;

        for (let i = 0; current_position < position; i++) {
            node = editor_nodes[i];
            current_position += node.textContent.length;
        }

        let offset = node.textContent.length - (current_position - position);

        this.set_selection(node, offset);
    }

    set_selection(beginNode, beginOffset = 0, endNode = beginNode, endOffset = beginOffset) {
        var selection = window.getSelection();
        var range = document.createRange();

        range.collapse();
        range.setStart(beginNode, beginOffset);
        range.setEnd(endNode, endOffset);

        selection.removeAllRanges();
        selection.addRange(range);
    }

    text_position(container = this.element, target, offset) {

        if (target === container) {
            return offset;
        }

        var container_descendants = Array.from(container.getElementsByTagName("*"));
        var target_index = container_descendants.indexOf(target);

        var elements_before_target = container_descendants.slice(0, target_index);

        var text_count = offset;

        for (let i = 0; i < elements_before_target.length; i++) {
            let element = elements_before_target[i];

            text_count += element.textContent.length;
        }

        return text_count;

    }

    descendant_nodes(element = this.element) {
        var descendant_nodes = [];
        var descendant_elements = Array.from(element.getElementsByTagName("*"));

        if (element.hasChildNodes()) {
            descendant_nodes.push(...element.childNodes);
        }

        for (let i = 0; i < descendant_elements.length; i++) {
            let descendant_element = descendant_elements[i];
            
            if (descendant_element.hasChildNodes()) {
                descendant_nodes.push(...descendant_element.childNodes);
            }
        }

        return descendant_nodes;
    }
}

export default TextSelection;