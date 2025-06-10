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
}

export default State;