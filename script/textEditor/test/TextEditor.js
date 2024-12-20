import TextEditor from "../TextEditor.js";
import Delta from "../Delta.js";
import sample_delta from "./content.js";

var text_editor = document.getElementById("textEditor");

var test_delta = new Delta(sample_delta.input_1);
var test_text_editor = new TextEditor(text_editor, {
    state: test_delta
})