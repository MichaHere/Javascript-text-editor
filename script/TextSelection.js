import { flat_child_nodes } from "./functions.js";
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
        });
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
        // TODO
    }
}

export default TextSelection;