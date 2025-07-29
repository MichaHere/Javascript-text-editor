import TextEditor from "../TextEditor.js";
import Format from "../formatting.js";
import Markdown from "../markdown.js";

var text_editor_elements = document.getElementsByClassName("text_editor");

for (let i = 0; i < text_editor_elements.length; i++) {
    let text_editor_element = text_editor_elements[i];
    let text_editor = new TextEditor(text_editor_element, Format);

    // NOTE: test new position method
    text_editor_element.innerHTML = '<p>This is the <strong><i>first</i> line</strong> in the testing data. <br>This is a line break in the <strong><i>first</i> line. </strong><br></p><p>This is the <strong>second line</strong>. <br></p><p>And this the third. <br></p>'
    text_editor_element.addEventListener('click', e => {
        text_editor.selection.relative_position = { start: { index: 0, offset: 85 } };
        console.log(text_editor.selection.relative_position.start);
    })
}