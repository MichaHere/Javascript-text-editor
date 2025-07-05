import TextEditor from "../TextEditor.js";
import Format from "../formatting.js";

let text_editor_element = document.createElement("div");
document.body.appendChild(text_editor_element);
let text_editor = new TextEditor(text_editor_element, Format);

text_editor_element.innerHTML = "<p>This is a test</p>"

// Test
let expect = 3

text_editor.selection.set(expect)

let test = text_editor.selection.get().from;

if (test === expect) {
    console.log("test passed!");
} else {
    console.log(`test failed: got ${test}, expected ${expect}`)
}