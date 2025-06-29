import TextEditor from "../TextEditor.js";
import Format from "../formatting.js";
import Markdown from "../markdown.js";

var text_editor_elements = document.getElementsByClassName("text_editor");

for (let i = 0; i < text_editor_elements.length; i++) {
    let text_editor_element = text_editor_elements[i];
    let text_editor = new TextEditor(text_editor_element, Format);

    document.addEventListener("selectionchange", e => {
        console.log(text_editor.selection.get(), window.getSelection());
    })
}