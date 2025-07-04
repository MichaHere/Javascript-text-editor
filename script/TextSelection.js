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

    set(position) {
        var position = this.get_node(position);

        if (!position.found)
            console.warn("Position was not found")

        return this.set_selection(position.node, position.offset);
    }

    text_position(node, offset, container = this.element) {
        var position = 0;

        if (node === container) {
            // if node is a text node
            if (node.nodeType === 3) return { position: position + offset, found: true };

            if (offset <= 0) return { position: position, found: true };

            for (let i = 0; i < offset; i++) {
                let child_node = container.childNodes[i];

                var inner = this.text_position(node, offset, child_node);
                position += inner.position;
            }

            return { position: position, found: true };
        }

        if (container.hasChildNodes()) {
            var child_nodes = container.childNodes;

            for (let i = 0; i < child_nodes.length; i++) {
                let child_node = child_nodes[i];

                var inner = this.text_position(node, offset, child_node);
                position += inner.position;
                
                if (inner.found) return { position: position, found: true };
            }
        }

        if (container !== this.element.lastChild)
            position += this.node_length(container);

        return { position: position, found: false }
    }

    get_node(position, container = this.element) {  
        var container_length = this.node_length(container);      
        var current_position = 0;

        if (container_length >= position) 
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

                let node = this.get_node(position - current_position, child_node);
                current_position += node.position;

                if (node.found) return node;
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

    node_length(node) {
        // if node is a text node
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