class State {
    constructor() {
        this.applied = []; // TODO: Make this work
        this.commands = [];
        this.redo_commands = [];
    }

    get content() {
        this.commands = this.clean_commands(this.commands);
        
        console.log(this.commands)

        var content = this.apply(this.applied, ...this.commands);

        // TODO: Convert applied commands to content

        return content;
    }

    add_command(position, {
            text: text = "", 
            delete_count: delete_count = 0, 
            attributes: attributes = [],
        }) {
        
        if (position < 0 || (!text && !delete_count)) return;

        var type = (text && delete_count) ? "replace" : (text) ? "insert" : "delete";

        this.commands.push({
            type: type,
            text: text,
            delete_count: delete_count,
            attributes: attributes,
            position: position,
        })

        this.redo_commands = [];
    }

    undo() {
        var command = this.commands.pop();

        if (!command) return 0;

        this.redo_commands.push(command);

        return command.position + command.delete_count;
    }

    redo() {
        var redo_command = this.redo_commands.pop();

        if (!redo_command) {
            var last_command = this.commands[this.commands.length - 1];
            return last_command.position + last_command.text.length
        };

        this.commands.push(redo_command);

        return redo_command.position + redo_command.text.length
    }

    apply(content = this.applied, ...commands) {
        // TODO: Make this return commands instead
        
        var text_commands = [];
        var delete_commands = [];

        for (let i = 0; i < commands.length; i++) {
            let command = commands[i];

            if (command.text) {
                text_commands.push({
                    position: command.position,
                    text: command.text,
                    attributes: command.attributes,
                })
            }

            if (command.delete_count) {
                delete_commands.push({
                    position: command.position,
                    delete_count: command.delete_count,
                })
            }
        }
        
        for (let i = 0; i < delete_commands.length; i++) {
            let delete_command = delete_commands[i];

            text_commands = this.apply_delete(text_commands, delete_command);
        }

        console.log(text_commands);

        content = "";

        for (let i = 0; i < commands.length; i++) {
            let command = commands[i];

            content = this.apply_command(content, command);
        }

        return content;
    }

    apply_command(content, command) {
        return [
            content.substring(0, command.position), 
            command.text, 
            content.substring(command.position + command.delete_count)
        ].join("");
    }

    apply_delete(text_commands, command) {
        let position = command.position;
        let delete_count = command.delete_count;

        // TODO: Optimize this function
        for (let i = 0; i < text_commands.length; i++) {
            let text_command = text_commands[i];
            
            if (position + delete_count < text_command.position) continue;
            if (position > text_command.position + text_command.text.length) continue;

            // TODO: Clean this up
            let start;
            let length;
            if (position > text_command.position) {
                start = position - text_command.position;
                length = delete_count;
            } else {
                start = 0;
                length = position - text_command.position + delete_count;
            }

            text_command.text = text_command.text.substring(0, start) +
                                text_command.text.substring(start + length);
            
            if (!text_command.text) text_commands.splice(i, 1);
        }

        return text_commands;
    }

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
        if (previous.text && current.text &&
            this.same_array(previous.attributes, current.attributes)
        ) {
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

    same_array(array_a, array_b) {
        if (array_a.length !== array_b.length) return false;
        
        var array_a_sorted = array_a.slice().sort();
        var array_b_sorted = array_b.slice().sort();

        if (JSON.stringify(array_a_sorted) === JSON.stringify(array_b_sorted))
            return true;

        // Fallback
        for (let i = 0; i < array_a.length; i++) {
            if (array_a_sorted[i] !== array_b_sorted[i]) return false;
        }

        return true;
    }
}

export default State;