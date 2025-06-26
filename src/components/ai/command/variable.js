class Variable {
    constructor(id, name, type) {
        this.id = id;
        this.name = name;
        this.type = type;
    }
}

const VariableType = {
    SCALAR_TYPE: 'SCALAR_TYPE',
    LIST_TYPE: 'LIST_TYPE',
    BROADCAST_MESSAGE_TYPE: 'BROADCAST_MESSAGE_TYPE',
};


class CreateVariableCommand extends Command {
    constructor(variable = null) {
        super();
        this.variable = variable;
    }

    toString() {
        const variableName = this.variable ? this.variable.name : "未知变量";
        const variableType = this.variable ? this.variable.type : "未知类型";
        return `${this.constructor.name}(name='${variableName}', type='${variableType}')`;
    }

    ops() {
        if (!this.variable) return [];

        return [
            `${this.variable.id} = new Variable('${this.variable.name}', '${this.variable.type}') // 新建变量`
        ];
    }

    executeCommand() {
        if (!this.variable || !this.variable.type) {
            throw new Error("变量或变量类型未定义");
        }

        switch (this.variable.type) {
            case VariableType.SCALAR_TYPE:
                this.rpa.create_variable(this.variable.name);
                break;
            case VariableType.LIST_TYPE:
                this.rpa.create_list(this.variable.name);
                break;
            case VariableType.BROADCAST_MESSAGE_TYPE:
                this.rpa.create_msg(this.variable.name);
                break;
            default:
                throw new Error(`不支持的变量类型: ${this.variable.type}`);
        }
    }
}
