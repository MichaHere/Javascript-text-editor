class TextSelection {
    constructor(element, format) {
        this.element = element;
        this.format = format;
    }

    get() {
        var selection = window.getSelection();
 
        var from = this.text_position(selection.anchorNode, selection.anchorOffset);
        var to = this.text_position(selection.focusNode, selection.focusOffset);

        return {
            from: from,
            to: to
        };
    }

    set(start_index, start_offset, end_index = start_index, end_offset = start_offset) {
        var start_selection = this.get_text_node(this.element.childNodes[start_index], start_offset);
        var end_selection = this.get_text_node(this.element.childNodes[end_index], end_offset);

        if (typeof start_selection.node === undefined || 
            typeof start_selection.offset === undefined ||
            typeof end_selection.node === undefined ||
            typeof end_selection.offset === undefined) return;

        return this.set_selection(
            start_selection.node, 
            start_selection.offset, 
            end_selection.node, 
            end_selection.offset,
        );
    }

    text_position(node, nodeOffset, container = this.element, offset = 0) {
        if (!container.contains(node)) {
            console.error("Position not found: Provided node is not an ancestor of the container node");
            return { index: undefined, offset: undefined };
        }

        var parent_node = node.parentNode;
        var child_nodes = Array.from(parent_node.childNodes);
        var node_child_index = child_nodes.indexOf(node);

        if (node.nodeType === Node.TEXT_NODE) {
            return this.text_position(parent_node, node_child_index, container, nodeOffset);
        }

        for (let i = 0; i < nodeOffset; i++) {
            let child_node = node.childNodes[i];
            let length = this.text_length(child_node);

            offset += length;
        }

        if (parent_node === container)
            return {
                index: node_child_index,
                offset: offset
            }

        return this.text_position(parent_node, node_child_index, container, offset);
    }

    get_text_node(node, offset) {
        if (node.nodeType === Node.TEXT_NODE)
            return { node: node, offset: offset };

        var current_offset = 0;

        console.log(node)

        for (let i = 0; i < node.childNodes.length; i++) {
            let child_node = node.childNodes[i];
            let child_length = this.text_length(child_node);

            current_offset += child_length;

            if (current_offset < offset) continue;
            if (child_node.nodeType !== Node.TEXT_NODE &&
                child_node.childNodes.length === 0) continue;
            
            return this.get_text_node(child_node, offset + child_length - current_offset);
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