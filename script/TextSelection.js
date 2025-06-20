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
        let editor_text_nodes = this.descendant_text_nodes();

        console.log(editor_text_nodes, position);

        if (editor_text_nodes.length === 0) {
            this.set_selection(this.element, 0);
            return;
        }

        if (position <= 0) {
            this.set_selection(editor_text_nodes[0], 0);
            return;
        }

        let current_position = 0;
        let node;

        // NOTE: Could probably be optimized by starting at the bottom of the node
        for (let i = 0; current_position < position; i++) {
            node = editor_text_nodes[i];
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
            // NOTE: Might not work properly: assumes the offset is either zero or one in this case
            return offset * container.textContent.length;
        }

        var container_descendants = this.descendant_text_nodes(container);
        var target_text_node = this.get_text_node(target, offset);
        var target_index = container_descendants.indexOf(target_text_node);

        var elements_before_target = container_descendants.slice(0, target_index);

        var text_count = offset;

        for (let i = 0; i < elements_before_target.length; i++) {
            let element = elements_before_target[i];

            text_count += element.textContent.length;
        }

        return text_count;

    }

    get_text_node(element, index) {
        if (element.nodeType === 3) return element;

        return element.childNodes[index];
    }

    descendant_text_nodes(element = this.element) {
        var text_nodes = [];

        if (element.nodeType === 3) return [ element ]

        if (!element.hasChildNodes()) return [];

        var child_nodes = element.childNodes;

        for (let i = 0; i < child_nodes.length; i++) {
            let child_node = child_nodes[i];

            text_nodes.push(...this.descendant_text_nodes(child_node));
        }

        return text_nodes;
    }
}

export default TextSelection;