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

    set(start_position, end_position = start_position) {
        var start_selection = this.get_selection(start_position);
        var end_selection = this.get_selection(end_position);

        if (!start_selection.found || !end_selection.found)
            console.warn("Position was not found")

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

    get_selection(position, container = this.element) {
        var container_length = this.format_length(container);      
        var current_position = 0;

        if (position === 0 || 
            (container.nodeType === Node.TEXT_NODE &&
             container_length >= position))
            return {
                node: container, 
                offset: position,
                position: current_position,
                found: true
            }

        if (container.hasChildNodes()) {
            var child_nodes = container.childNodes;

            for (let i = 0; i < child_nodes.length; i++) {
                let child_node = child_nodes[i];

                // Skip last break
                if (child_node === container.lastChild &&
                    child_node.nodeName === "BR") continue

                let selection = this.get_selection(position - current_position, child_node);
                current_position += selection.position;

                if (selection.found) {
                    // Handle void elements
                    if (selection.node.nodeType === Node.TEXT_NODE || 
                        selection.node.childNodes.length > 0) return selection;
                    
                    return {
                        node: container,
                        offset: i + 1,
                        position: position,
                        found: true
                    };
                };
            }
        }

        current_position += container_length;

        return { 
            node: container, 
            offset: (container.nodeType === Node.TEXT_NODE) ? container.data.length : container.childNodes.length,
            position: current_position,
            found: false
        }

    }

    format_length(node) {
        if (node.nodeType === Node.TEXT_NODE) return node.data.length;

        let block = this.format.block[node.nodeName];
        if (block) return block.length;

        return 0;
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