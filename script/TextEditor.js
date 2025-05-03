class TextEditor {
    constructor(element) {
        this.element = element;

        this.element.role = "textbox";
        this.element.contentEditable = true;

        this.element.addEventListener("beforeinput", event => {
            event.preventDefault();

            try {
                this[event.inputType](event);
            } catch (error) {
                console.error(`${error} in TextEditor`.replace(
                    "[event.inputType]", `.${event.inputType}`
                ))
            }
        })
    }

    insertText(event) {
        this.element.innerHTML += event.data;
    }
}

export default TextEditor;