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
        for (let i = 0; i < commands.length; i++) {
            let command = commands[i];

            content = this.apply_command(content, command);
        }

        console.log(content);

        return content;
    }

    apply_command(content, command) {
        if (command.text !== "") {
            content = this.apply_insert(content, command);
        }

        if (command.delete_count > 0) {
            content = this.apply_delete(content, command);
        }

        return content;
    }

    apply_insert(content, command) {
        var position = 0;

        // FIXME: Needs to be optimized
        for (let i = 0; i < content.length; i++) {
            let element = content[i];
            position += element.text.length;

            if (position < command.position) continue;

            let insert_position = command.position - position + element.text.length;
            
            if (this.same_array(
                command.attributes, 
                element.attributes
            )) {
                element.text = [
                    element.text.substring(0, insert_position),
                    command.text,
                    element.text.substring(insert_position)
                ].join("");
                return content;
            }

            content.splice(i + 1, 0,
                {
                    text: command.text,
                    attributes: command.attributes
                },
                {
                    text: element.text.substring(insert_position),
                    attributes: element.attributes
                }
            )
            element.text = element.text.substring(0, insert_position);

            return content;
        }

        content.push({
            text: command.text,
            attributes: command.attributes
        });

        return content;
    }

    apply_delete(content, command) {
        let position = 0;

        // FIXME: Needs to be optimized
        for (let i = 0; i < content.length; i++) {
            let element = content[i];
            position += element.text.length;

            if (position < command.position) continue;

            let delete_position = command.position - position + element.text.length;

            element.text = [
                element.text.substring(0, delete_position),
                element.text.substring(delete_position + command.delete_count)
            ].join("");

            command.delete_count -= element.text.length - delete_position;
            if (command.delete_count <= 0) return content;
        }

        return content;
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