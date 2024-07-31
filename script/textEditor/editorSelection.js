import { isDefined } from "../usefullFunctions.js";

export class EditorSelection {
    constructor (editor, selection = window.getSelection()) {
        this.update(editor, selection);
    }

    set(beginNode, start, endNode = beginNode, end = start, update = true) {
        let range = document.createRange();
    
        range.collapse();
        range.setStart(beginNode, (isDefined(start) ? start : 0));
        range.setEnd(endNode, (isDefined(end) ? end : isDefined(start) ? start : 0))
    
        this.selection.removeAllRanges();
        this.selection.addRange(range);
        if (update) this.update(this.editor, this.selection, false);
    }

    update(editor = this.editor, selection = window.getSelection(), set = true) {
        this.editor = editor;
        this.selection = selection;

        if (!selection.anchorNode || !selection.focusNode) return false;
        
        let [ anchor, focus ] = this.#find(editor, selection);
        this.anchor = anchor;
        this.anchorOffset = selection.anchorOffset;
        this.focus = focus;
        this.focusOffset = selection.focusOffset;
        
        let [ top, topOffset, bottom, bottomOffset ] = this.#orderNodes(this.anchor, this.anchorOffset, this.focus, this.focusOffset);
        this.top = top;
        this.bottom = bottom;
        this.topOffset = topOffset;
        this.bottomOffset = bottomOffset;
        if (set) this.set(top.textNode, topOffset, bottom.textNode, bottomOffset, false);
    }

    deleteContent() {
        let selectionOffset = this.topOffset;

        let topContent = this.top.content.substring(0, this.topOffset);
        let bottomContent = this.bottom.content.substring(this.bottomOffset);
        let compoundContent = topContent + bottomContent;

        this.editor.deleteInbetween(this.top, this.bottom);

        if (this.top === this.bottom) this.top.setText(compoundContent); else {
            this.top.setText(topContent);
            this.bottom.setText(bottomContent);

            this.top.merge(this.bottom);
            this.top.parent.merge(this.bottom.parent);
        }

        this.top.select(selectionOffset);
    }

    #find(editor, selection = window.getSelection()) {
        let anchor;
        let focus;

        anchor = selection.anchorNode?.textEditorObject || selection.anchorNode.parentElement?.textEditorObject || editor;
        focus = selection.focusNode?.textEditorObject || selection.focusNode.parentElement?.textEditorObject || editor;

        if (selection.anchorNode === editor.node) anchor = editor;
        if (selection.focusNode === editor.node) focus = editor;

        return [ anchor, focus ];
    }

    #getTextNode(object, offset, fromTop = true) {
        if (object.type === "Text") return [ object, offset ];
        if (object.parent && object?.parent.type === "Text") return [ object.parent, offset ];

        if (typeof offset === "undefined") return false;
        offset = Math.min(offset, (object.content.length - 1));

        let selected = object.content[offset];
        let offsetAtEnd = (fromTop) ? false : true;

        while (selected.type !== "Text" && selected.type !== "Linebreak") {
            let index = (fromTop) ? 0 : selected.content.length - 1;
            selected = selected.content[index];
        }

        if (selected.type === "Linebreak") {
            selected = selected.previous("Text");
            offsetAtEnd = true;
        }
        
        let newOffset = (offsetAtEnd) ? selected.content.length - 1 : 0;

        return [ selected, newOffset ];


        /* FIX: When one of the selected objects is a linebreak it incorrectly selects the entire text (only happens in chromium  based browsers) 
        REPRODUCE: Start the selection at the end of a paragraph, and drag it to the beginning of the next paragragh */
        /* FIX: When one of the selections is the text and the other is the paragraph, it selects the whole span (only happens in chromium  based browsers) 
        REPRODUCE: Start the selection at the end of a paragraph, and drag it to just before the start of the next */
    }

    /**
     * @param {EditorNode} object1 
     * @param {EditorNode} object2 
     * @returns 0 if object1 is lower than object2, 1 if object2 is lower than object1, and 2 if the objects are at the same position
     */
    #orderNodes(object1, object1Offset, object2, object2Offset) {

        let [position1, position2, ancestor] = this.editor.computePosition(object1.node, object2.node);

        this.commonAncestor = ancestor.textEditorObject;
        this.topPosition = (position1 > position2) ? position2 : position1;
        this.bottomPosition = (position1 > position2) ? position1 : position2;
        
        let top = (position1 > position2) ? object2 : object1;
        let bottom = (position1 > position2) ? object1 : object2;

        let topOffset = (position1 > position2) ? object2Offset : object1Offset;
        let bottomOffset = (position1 > position2) ? object1Offset : object2Offset;

        if (position1 === position2 && object1 === object2) {
            topOffset = (object1Offset >= object2Offset) ? object2Offset : object1Offset;
            bottomOffset = (object1Offset <= object2Offset) ? object2Offset : object1Offset;
        }

        let [ topTextNode, newTopOffset ] = this.#getTextNode(top, topOffset, true);
        let [ bottomTextNode, newBottomOffset ] = this.#getTextNode(bottom, bottomOffset, false);

        // topOffset = (top.type !== "Text") ? (topOffset === bottomOffset) ? `${bottomTextNode.content}`.length : 0 : topOffset;
        // bottomOffset = (bottom.type !== "Text") ? `${bottomTextNode.content}`.length : bottomOffset;

        return [ topTextNode, newTopOffset, bottomTextNode, newBottomOffset ];
    }
}