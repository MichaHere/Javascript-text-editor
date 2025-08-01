class TextSelection {
    constructor(element, format) {
        this.element = element;
        this.format = format;
    }

    get absolute_position() {
        var position = this.get_position(this.element.parentNode);
        return {
            start: position.start.offset,
            end: position.end.offset
        }
    }

    set absolute_position({
        start: start,
        end: end = start
    }) {
        return this.set_position(this.element, start, this.element, end);
    }

    get relative_position() {
        return this.get_position();
    }

    set relative_position({
        start: start = {
            index, 
            offset, 
        },
        end: end = start
    }) {
        var start_container = this.element.childNodes[start.index];
        var end_container = this.element.childNodes[end.index];

        return this.set_position(start_container, start.offset, end_container, end.offset);
    }

    get_position(container = this.element) {
        var selection = window.getSelection();
 
        var start = this.text_position(selection.anchorNode, selection.anchorOffset, container);
        var end = this.text_position(selection.focusNode, selection.focusOffset, container);

        return {
            start: start,
            end: end
        };
    }

    set_position(start_container, start_offset, end_container, end_offset) {
        var start_selection = this.get_text_node(start_container, start_offset);
        var end_selection = this.get_text_node(end_container, end_offset);

        if (typeof start_selection.node === "undefined" || 
            typeof start_selection.offset === "undefined" ||
            typeof end_selection.node === "undefined" ||
            typeof end_selection.offset === "undefined") return;

        return this.set_selection(
            start_selection.node, 
            start_selection.offset, 
            end_selection.node, 
            end_selection.offset,
        );
    }

    text_position(node, node_offset, container = this.element, offset = 0) {
        if (!container.contains(node)) {
            console.error("Position not found: Provided node is not an ancestor of the container node");
            return { index: undefined, offset: undefined };
        }

        var parent_node = node.parentNode;
        var child_nodes = Array.from(parent_node.childNodes);
        var child_node_index = child_nodes.indexOf(node);

        if (node.nodeType === Node.TEXT_NODE) {
            return this.text_position(parent_node, child_node_index, container, node_offset);
        }

        for (let i = 0; i < node_offset; i++) {
            let child_node = node.childNodes[i];
            let length = this.text_length(child_node);

            offset += length;
        }

        if (parent_node === container)
            return {
                index: child_node_index,
                offset: offset
            }

        return this.text_position(parent_node, child_node_index, container, offset);
    }

    get_text_node(node, offset) {
        if (node.nodeType === Node.TEXT_NODE ||
            node.nodeName === "BR"
        ) return { node: node, offset: offset };

        var current_offset = 0;

        for (let i = 0; i < node.childNodes.length; i++) {
            let child_node = node.childNodes[i];
            let child_length = this.text_length(child_node);

            if (current_offset + child_length > offset) {
                return this.get_text_node(child_node, offset - current_offset);
            };

            current_offset += child_length;
        }

        console.warn("Selection not found: Provided selection is outside of the range of the text editor");
        return { node: undefined, offset: undefined };
    }

    text_length(node) {
        switch (node.nodeType) {
            case Node.TEXT_NODE:
                return node.data.length;
            case Node.ELEMENT_NODE:
                if (node.nodeName === "BR")
                    return 1;
                return node.innerText.length;
            default:
                return 1;
        }
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
    
}

export default TextSelection;