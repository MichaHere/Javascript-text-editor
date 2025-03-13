import TextEditor from "../TextEditor.js";
import sample_delta from "./content.js";

var text_editor = document.getElementById("textEditor");
var delta_element = document.getElementById("delta");

var test_text_editor = new TextEditor(text_editor, {
    state: sample_delta.input_1,
    HTML_delta_element: delta_element,
})