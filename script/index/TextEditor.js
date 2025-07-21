import TextEditor from "../TextEditor.js";
import Format from "../formatting.js";
import Markdown from "../markdown.js";

var text_editor_elements = document.getElementsByClassName("text_editor");

for (let i = 0; i < text_editor_elements.length; i++) {
    let text_editor_element = text_editor_elements[i];
    let text_editor = new TextEditor(text_editor_element, Format);

    text_editor.state.commands = [
            {
            "type": "insert",
            "text": "This was a test",
            "delete_count": 0,
            "format": {
            "block": "P",
            "inline": []
            },
            "position": 0
        },
        {
            "type": "insert",
            "text": "is ",
            "delete_count": 4,
            "format": {
            "block": "P",
            "inline": []
            },
            "position": 5
        }
    ]

    text_editor.updateContent();
}