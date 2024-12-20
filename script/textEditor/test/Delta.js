import Delta from "../Delta.js";
import sample_delta from "./content.js";


const test_delta = new Delta(sample_delta.input_1);

let html = test_delta.HTML;

document.getElementById("textEditor").innerHTML = html;
document.getElementById("plain-html").innerText = html;
document.getElementById("delta").innerHTML = JSON.stringify(test_delta.operations)