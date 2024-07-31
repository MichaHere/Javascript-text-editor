import { getCommonAncestor, getAncestors, getNodePosition  } from "../usefullFunctions.js";
import { EditorSelection } from "./editorSelection.js";
import * as editorNodes from "./editorNodes.js"

export class TextEditor {
    constructor (node, content = []) {
        this.node = node;
        this.node.contentEditable = true;
        this.node.role = "textbox";
        this.node.ariaMultiLine = true;

        this.classes = {
            "Paragraph": "texteditor-paragraph",
            "Text": "texteditor-text",
            "OrderedList": "texteditor-ordered-list",
            "ListItem": "texteditor-list-item"
        }

        this.formats = {
            "normal": "texteditor-normal-text", 
            "bold": "texteditor-bold-text",
        }

        this.node.textEditorObject = this;

        this.content = content;
        this.newId = 0;
        
        this.import(this.content);
        
        this.selection = new EditorSelection(this);
        
        this.node.addEventListener("beforeinput", event => {
            event.preventDefault();
            this.update(event);
        })
    }

    update(event) {
        this.selection.update(this);

        // TODO: Make a function for every input type: https://w3c.github.io/input-events/#interface-InputEvent-Attributes 
        switch (event.inputType) {
            // case "insertText":

            //     break;
            // case "insertLineBreak":

            //     break;
            case "insertParagraph":
                let currentParagraph = this.ancestorOfType(this.selection.top, "Paragraph");
                this.insertParagraph("after", currentParagraph.node);
                break;
            case "deleteContentBackward":
                this.deleteContentBackward();
                break;
            default:
                console.warn(`The function ${event.inputType} has yet to be added.`);
        }

        this.deleteEmpty();

        // let list = this.getContents();
        // for (let i = 0; i < list.length - 1; i++) {
        //     if (list[i].type !== list[i+1].type) return;
        //     console.log(list[i]);
        // }
    }

    insertParagraph(insertType, referenceNode, parent = this, single = false) {
        // FIX: Make it flexible (e.g. when in a list make it add a ListItem instead) 
        let paragraph = new editorNodes.Paragraph(this, parent);
        paragraph.insert(insertType, referenceNode);
        
        if (!single) paragraph.insertText();
        
        return paragraph;
    }

    deleteContentBackward() {
        let bottomOffset = this.selection.bottomOffset;
        let topOffset = this.selection.topOffset;
        let top = this.selection.top;
        let position = getNodePosition(top.node)[0];
        
        if (bottomOffset !== topOffset) {
            this.selection.deleteContent();
            return;
        }

        if (topOffset !== 0) {
            top.deleteText(topOffset);
            return;
        }

        let previous = top.previous(top.type);
        if (!previous) return false;
        
        let deleted = this.deleteInbetween(previous, top);
        previous.merge(top);
        
        if (position === 0) {
            previous.parent.merge(top.parent);
        } else if (!deleted) {
            previous.deleteText();
        }


        


        // // TODO: Make it so that it works when you are at the beginning of a line. 



    }

    deleteInbetween(topObject, bottomObject) {
        if (!topObject || !bottomObject) return false;

        let content = this.getContents();
        let topObjectIndex = Object.values(content).findIndex(node => node === topObject);
        let bottomObjectIndex = Object.values(content).findIndex(node => node === bottomObject);

        let topObjectContainers = getAncestors(topObject.node);
        let bottomObjectContainers = getAncestors(bottomObject.node);
        
        let itemsDeleted = false;
        for (let i = bottomObjectIndex-1; i > topObjectIndex; i--) {
            if (!bottomObjectContainers.includes(content[i].node) &&
                !topObjectContainers.includes(content[i].node)) {
                content[i].delete();
                itemsDeleted = true;
            }
        }

        return itemsDeleted;
    }

    deleteEmpty() {
        let content = [];
        this.getContents().forEach(item => {
            if (item.type !== "Text" &&
                item.type !== "Linebreak") {
                content.push(item);
            }
        });
        content.forEach(item => {
            if (item.content.length === 0) item.delete();
        })
        
    }

    logContents(content = this.content) {
        let seen = [];
        
        return JSON.stringify(content, function(key, value) {
            if (value != null && typeof value === "object") {
                if (seen.indexOf(value) >= 0) return;
                seen.push(value);
            }

            return value;
        })
    }

    getContents(filter = null, content = this.content) {
        let list = [];
        for (let item of content) {
            if (filter === null || item.type === filter) list.push(item);
            if (Array.isArray(item.content)) list.push(...this.getContents(filter, item.content));
        }
        return list;
    }

    import(content, reset = true, previous = this) {
        if (reset) {
            this.node.innerHTML = "";
            this.content = [];
        }

        for (let element of content) {
            switch (element.type) {
                case "Paragraph":
                    let paragraph = this.insertParagraph(undefined, undefined, previous, true);
                    this.import(element.content, false, paragraph);
                    break;
                case "Text":
                    let text = new editorNodes.TextNode(this, previous, element.content, element.formats);
                    text.insert();
                    break;
                case "Linebreak":
                    let linebreak = new editorNodes.Linebreak(this, previous);
                    linebreak.insert();
                    break;
                case "OrderedList":
                    let orderedList = new editorNodes.OrderedList(this, previous);
                    orderedList.insert();
                    this.import(element.content, false, orderedList);
                    break;
                case "ListItem":
                    let listItem = new editorNodes.ListItem(this, previous);
                    listItem.insert();
                    this.import(element.content, false, listItem);
                    break;
                default:
                    console.warn(`The element ${element.type} is not supported.`)
            }
        }
    }

    ancestorOfType(reference, type) {
        let positions = getNodePosition(reference.node, this.node);

        let node = this.node;
        for (let position of positions) {
            node = node.childNodes[position];
            if (node.textEditorObject.type === type) return node.textEditorObject;
        }
    }

    computePosition(node1, node2) {
        let ancestorNode = getCommonAncestor(node1, node2);

        let position1 = getNodePosition(node1, ancestorNode)[0];
        let position2 = getNodePosition(node2, ancestorNode)[0];
        
        // TODO: NOTE: THIS IS A BRUTE FORSE FIX: IT ASSUMES THAT IF THE ANCHORNODE IS THE ANCESTORNODE IT IS SELECTED FROM THE BOTTOM TO THE TOP 
        if (typeof position1 === "undefined") position1 = Infinity;
        if (typeof position2 === "undefined") position2 = -Infinity;

        return [position1, position2, ancestorNode]
    }
}
