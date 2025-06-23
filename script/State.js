class State {
    constructor() {
        this.content = "";
        this.commands = [];
        this.redo_commands = [];
    }

    update(position, { text: text = "", delete_count: delete_count = 0 }) {
        if (position < 0 || (!text && !delete_count)) {
            console.warn("Failed to update state");
            return;
        }

        var type = (text && delete_count) ? "replace" : (text) ? "insert" : "delete";

        this.commands.push({
            type: type,
            text: text,
            delete_count: delete_count,
            position: position,
        })

        this.redo_commands = [];
    }

    undo() {
        var redo_command = this.commands.pop();

        if (!redo_command) return 0;

        this.redo_commands.push(redo_command);

        return this.get_selection(this.commands[this.commands.length - 1]);
    }

    redo() {
        var command = this.redo_commands.pop();

        if (!command) return this.get_selection(this.commands[this.commands.length - 1]);

        this.commands.push(command);

        return this.get_selection(command);
    }

    get current() {
        this.commands = this.clean_commands(this.commands);
        
        var content = this.apply(this.content, ...this.commands)

        return content + "\n";
    }

    apply(content, ...commands) {
        var applied_content = content;

        for (let i = 0; i < commands.length; i++) {
            let command = commands[i];

            applied_content = this.apply_command(applied_content, command);
        }

        return applied_content;
    }

    apply_command(content, command) {
        return [
            content.substring(0, command.position), 
            command.text, 
            content.substring(command.position + command.delete_count)
        ].join("");
    }

    // NOTE: Could be optimized by intergrating this into the apply function
    clean_commands(commands = this.commands) {
        if (commands.length === 0) return commands;

        var new_array = [ commands[0] ];

        for (let i = 1; i < commands.length; i++) {
            let command = commands[i];
            let previous_command = new_array[new_array.length - 1]

            if (!this.clean_command(previous_command, command)) {
                new_array.push(command);
            }
        }

        return new_array;
    }

    clean_command(previous, current) {
        if (previous.text && current.text) {
            return this.clean_insert(previous, current);
        }

        if (!previous.text && !current.text) {
            return this.clean_delete(previous, current);
        }

        return false;
    }
    
    clean_insert (previous, current) {
        if (previous.position + previous.text.length !== current.position) return false;

        previous.text += current.text;

        return true;
    }

    clean_delete (previous, current) {
        if (current.position + current.delete_count !== previous.position) return false;

        previous.delete_count += current.delete_count;
        previous.position = current.position;

        return true;
    }

    get_selection(command) {
        if (!command) return 0;

        return command.position + command.text.length;
    }
}

export default State;