import TextEditor from "../TextEditor.js";
import Delta from "../Delta-v2.js";
import sample_delta from "./content.js";

var text_editor = document.getElementById("textEditor");
var delta_element = document.getElementById("delta");

var test_delta = new Delta(sample_delta.input_1);
var test_text_editor = new TextEditor(text_editor, {
    state: test_delta,
    HTML_delta_element: delta_element,
})