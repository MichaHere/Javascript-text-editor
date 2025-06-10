class State {
    constructor() {
        this.content = "";
        this.commands = [];
    }

    insert(data, position) {
        if (!data) return;
        if (position < 0) return;

        this.commands.push({
            type: "insert",
            data: data,
            position: position,
        })
    }

    delete(data, position) {
        if (!data) return;
        if (position < 0) return;

        this.commands.push({
            type: "delete",
            data: data,
            position: position,
        })
    }

    get current() {
        this.commands = this.clean_commands(this.commands);
        
        return this.apply(this.content, ...this.commands);
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
        switch (command.type) {
            case "insert":
                return this.apply_insert(content, command);
            case "delete":
                return this.apply_delete(content, command);
            default:
                console.warn("Error: Invalid command type was used. ")
                return content;
        }
    }

    apply_insert(content, command) {
        return [
            content.substring(0, command.position), 
            command.data, 
            content.substring(command.position)
        ].join("");
    }

    apply_delete(content, command) {
        return [
            content.substring(0, command.position),
            content.substring(command.position + command.data)
        ].join("");
    }

    // NOTE: Could be optimized by intergrating this into the apply function
    clean_commands(commands = this.commands) {
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
        if (previous.type !== current.type) return false;

        switch (current.type) {
            case "insert":
                return this.clean_insert(previous, current);
            case "delete":
                return this.clean_delete(previous, current);
            default:
                console.warn("Error: Invalid command type was used. ")
                return content;
        }
    }

    clean_insert(previous, current) {
        if (previous.position + previous.data.length !== current.position) return false;

        previous.data += current.data;

        return true;
    }

    clean_delete(previous, current) {
        if (current.position + current.data !== previous.position) return false;

        previous.data += current.data;
        previous.position = current.position;

        return true;
    }
}

export default State;