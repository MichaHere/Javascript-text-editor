import { sameArray } from "../usefullFunctions.js";

/**
 * The base node for the text editor nodes. 
 * @param {Number} id The id given to the element
 */
class EditorNode {
    constructor (editor, parent) {
        this.editor = editor;
        this.id = editor.newId++;
        this.parent = parent;
    }

    /**
     * @param {Element} parentElement 
     * @param {String} insertType "before" or "after"
     * @param {Node} referenceNode 
     */
    insert(insertType, referenceNode, parentElement = this.parent.node) {
        if (!this.node) return false;
        let newNode = this.node;
        let index = (referenceNode) ? [...parentElement.childNodes].findIndex(node => { return node === referenceNode }) : parentElement.childNodes.length;
        
        switch(insertType){
            case "before":
                this.node = parentElement.insertBefore(newNode, referenceNode);
                this.parent.content.splice(index, 0, this);
                break;
            case "after":
                this.node = insertAfter(parentElement, newNode, referenceNode);
                this.parent.content.splice(index + 1, 0, this);
                break;
            default:
                this.node = parentElement.appendChild(newNode);
                this.parent.content.push(this);
        }

        this.node.textEditorObject = this;

        return this;
    }

    getContents(filter = null) {
        return this.editor.getContents(filter, this.content);
    }

    previous(filter = null) {
        if (filter) {
            let siblings = this.editor.getContents();
            let index = siblings.findIndex(item => { return item === this });
            for (let i = index - 1; i >= 0; i--) {
                if (siblings[i].type === filter) return siblings[i];
            }
            return false;
        }
        if (this["node"] && this.node.previousSibling) return this.node.previousSibling.textEditorObject;
        return null;
    }

    next(type = null) {
        if (type) {
            let siblings = this.parent.getContents();
            let index = siblings.findIndex(item => { return item === this });
            for (let i = index + 1; i < siblings.length; i++) {
                if (siblings[i].type === filter) return siblings[i];
            }
            return false;
        }
        if (this["node"] && this.node.nextSibling) return this.node.nextSibling.textEditorObject;
        return null;
    }

    merge(node) {
        if (node === this) return false;
        // if (node.type !== this.type) return false;
        this.content = this.content.concat(node.content);
        for (
            let child = node.node.firstChild; 
            child; 
            child = node.node.firstChild
        ) {
            this.node.appendChild(child);
        }
        node.delete();
        return true;
    }

    select(at = this.content.length) {
        this.editor.selection.set(this.node, at);
    }

    delete() {
        this.node.remove();

        let siblings = this.parent.content;
        for (let index = 0; index < siblings.length; index++) {
            if (siblings[index] === this) {
                siblings.splice(index, 1);

                this.parent.content = siblings;
                return true;
            }
        }
        return false;
    }
}

export class OrderedList extends EditorNode {
    constructor (editor, parent, content = []) {
        super(editor, parent);

        this.node = document.createElement("ol");
        this.node.classList.add(editor.classes["OrderedList"]);

        this.content = content;
        this.type = "OrderedList";
    }
}

export class ListItem extends EditorNode {
    constructor (editor, parent, content = []) {
        super(editor, parent);

        this.node = document.createElement("li");
        this.node.classList.add(editor.classes["ListItem"]);

        this.content = content;
        this.type = "ListItem";
    }
}

export class Paragraph extends EditorNode {
    constructor (editor, parent, content = []) {
        super(editor, parent);

        this.node = document.createElement("p");
        this.node.classList.add(editor.classes["Paragraph"]);

        this.content = content;
        this.type = "Paragraph";
    }

    updateFormat() {

    }
    
    insertText(content = "") {
        let text = new TextNode(this.editor, this, content);
        text.insert();
        let linebreak = new Linebreak(this.editor, this);
        linebreak.insert();
        text.select();
    }
}

export class TextNode extends EditorNode {
    constructor (editor, parent, content = "", formats = []) {
        super(editor, parent);

        this.formats = formats;
        this.content = content;
        this.type = "Text";

        this.node = document.createElement("span");
        this.node.classList.add(this.editor.classes["Text"], this.editor.formats["normal"]);
        for (let format of formats) {
            this.node.classList.add(this.editor.formats[format]);
        }

        this.textNode = document.createTextNode(this.content);
        this.node.appendChild(this.textNode);
    }

    editFormat() {

    }

    merge(node) {
        if (node === this) return false;
        if (node.type !== this.type) return false;
        if (!sameArray(node.formats, this.formats) && node.content) return false;
        
        let offset = this.content.length;

        this.content += node.content;
        this.textNode.textContent = this.content;

        node.delete();
        this.select(offset);

        return true;
    }

    setText(text) {
        this.content = text;
        this.textNode.textContent = text;
    }

    insertText(content) {
        
    }

    deleteText(at = this.content.length, to = at-1) {
        if (at === to) return false;
        let bigger = (at > to) ? at : to;
        let smaller = (at < to) ? at : to;
        if (bigger <= 0) return false;

        this.content = this.content.slice(0, smaller) +
                       this.content.slice(bigger);
        this.textNode.textContent = this.content;

        this.select(smaller);
    }

    select(at = this.content.length) {
        this.editor.selection.set(this.textNode, at);
    }
}

export class Linebreak extends EditorNode {
    constructor (editor, parent) {
        super(editor, parent);

        this.preceding_node;
        this.node = document.createElement("br");
        this.type = "Linebreak";
    }
}