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

    set(position) {
        var [node, offset] = this.get_node(position);

        console.log(node, offset)

        return this.set_selection(node, offset);
    }

    text_position(node, offset) {
        // Go over every element in the container
        // and count, using the format, the position
        // until the selection is reached, once it is
        // return the position

        function return_function(current_position, element) {
            if (element === node) {
                return current_position + offset;
            }
        }

        function fail_function(current_position, element){
            return current_position;
        }

        return this.position_counter(
            return_function,
            fail_function
        );
    }

    get_node(position) {
        // Go over every element in the container
        // and count, using the format, the position
        // until the position is reached, once it is
        // return the node and its offset

        const self = this;

        function return_function(current_position, element) {
            if (current_position + self.node_length(element) >= position) {
                return [element, position - current_position];
            }
        }

        function fail_function(current_position, element){
            console.log("fail")
            return [element, self.node_length(element)];
        }

        return this.position_counter(
            return_function, 
            fail_function
        );
    }

    position_counter(return_function, fail_function, container = this.element) {
        // count all elements using the format
        var children = container.childNodes;
        var position = 0;
        
        for (let i = 0; i < children.length; i++) {
            let child = children[i];

            let ret = return_function(position, child);
            if (ret) return ret;
            
            if (child.hasChildNodes())
                position += this.position_counter(return_function, fail_function, child);

            position += this.node_length(child);

        }

        return fail_function(position, children[children.length-1])
    }

    node_length(node) {
        // if child is a text node
        if (node.nodeType === 3) return node.data.length;

        let block = this.format.block[node.nodeName];
        if (block) return block.length;

        return 0;
    }


    

    // get() {
    //     var selection = window.getSelection();

    //     var from = this.text_position(this.element, selection.anchorNode, selection.anchorOffset);
    //     var to = this.text_position(this.element, selection.focusNode, selection.focusOffset);

    //     return {
    //         from: from,
    //         to: to
    //     };
    // }

    // set(position) {
    //     let editor_text_nodes = this.descendant_text_nodes();

    //     console.log(editor_text_nodes)

    //     if (editor_text_nodes.length === 0) {
    //         this.set_selection(this.element, 0);
    //         return;
    //     }

    //     if (position <= 0) {
    //         this.set_selection(editor_text_nodes[0], 0);
    //         return;
    //     }

    //     let current_position = 0;
    //     let node;

    //     // NOTE: Could probably be optimized by starting at the bottom of the node
    //     for (let i = 0; current_position < position; i++) {            
    //         if (!editor_text_nodes[i]) debugger;

    //         node = editor_text_nodes[i];

    //         // FIX: This line is the issue
    //         current_position += node.textContent.length;
    //     }

    //     let offset = node.textContent.length - (current_position - position);

    //     this.set_selection(node, offset);
    // }

    set_selection(beginNode, beginOffset = 0, endNode = beginNode, endOffset = beginOffset) {
        var selection = window.getSelection();
        var range = document.createRange();

        range.collapse();
        range.setStart(beginNode, beginOffset);
        range.setEnd(endNode, endOffset);

        selection.removeAllRanges();
        selection.addRange(range);
    }

    // Does not respect format or multiple elements
    // text_position(container = this.element, target, offset) {

    //     if (target === container) {
    //         // NOTE: Might not work properly: assumes the offset is either zero or one in this case
    //         return offset * container.textContent.length;
    //     }

    //     var container_descendants = this.descendant_text_nodes(container);
    //     var target_text_node = this.get_text_node(target, offset);
    //     var target_index = container_descendants.indexOf(target_text_node);

    //     var elements_before_target = container_descendants.slice(0, target_index);

    //     var text_count = offset;

    //     for (let i = 0; i < elements_before_target.length; i++) {
    //         let element = elements_before_target[i];

    //         text_count += element.textContent.length;
    //     }

    //     return text_count;

    // }

    // get_text_node(element, index) {
    //     if (element.nodeType === 3) return element;

    //     return element.childNodes[index];
    // }

    // descendant_text_nodes(element = this.element) {
    //     var text_nodes = [];

    //     if (element.nodeType === 3) return [ element ]

    //     if (!element.hasChildNodes()) return [];

    //     var child_nodes = element.childNodes;

    //     for (let i = 0; i < child_nodes.length; i++) {
    //         let child_node = child_nodes[i];

    //         text_nodes.push(...this.descendant_text_nodes(child_node));
    //     }

    //     return text_nodes;
    // }
}

export default TextSelection;