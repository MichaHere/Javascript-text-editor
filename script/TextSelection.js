class TextSelection {
    constructor(element, format) {
        this.element = element;
        this.format = format;
    }

    get() {
        var selection = window.getSelection();
 
        var from = this.text_position(selection.anchorNode, selection.anchorOffset);
        var to = this.text_position(selection.focusNode, selection.focusOffset);

        if (!from.found || !to.found) 
            console.warn("Selection was not found");

        return {
            from: from.position,
            to: to.position
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

    text_position(node, offset, container = this.element) {
        var position = 0;

        if (node === container) {
            if (node.nodeType === 3) return { position: position + offset, found: true };

            if (offset <= 0) return { position: position, found: true };

            for (let i = 0; i < offset; i++) {
                let child_node = container.childNodes[i];

                // Skip last break
                if (child_node === container.lastChild &&
                    child_node.nodeName === "BR") continue

                var inner = this.text_position(node, offset, child_node);
                position += inner.position;

                if (node === this.element && i + 1 === offset)
                    position -= this.format_length(child_node);
            }

            return { position: position, found: true };
        }

        if (container.hasChildNodes()) {
            var child_nodes = container.childNodes;

            for (let i = 0; i < child_nodes.length; i++) {
                let child_node = child_nodes[i];

                // Skip last break
                if (child_node === container.lastChild &&
                    child_node.nodeName === "BR") continue

                var inner = this.text_position(node, offset, child_node);
                position += inner.position;
                
                if (inner.found) return { position: position, found: true };
            }
        }

        position += this.format_length(container);

        return { position: position, found: false }
    }

    get_selection(position, container = this.element) {
        var container_length = this.format_length(container);      
        var current_position = 0;

        if (position === 0 || 
            (container.nodeType === 3 &&
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
                    if (selection.node.nodeType === 3 || 
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
            offset: (container.type === 3) ? container.data.length : container.childNodes.length,
            position: current_position,
            found: false
        }

    }

    format_length(node) {
        if (node.nodeType === 3) return node.data.length;

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