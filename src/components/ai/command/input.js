 import Rpa from "../rpa";
 import Command from "./base";

/**
 * 输入命令基类
 */
class InputCommand extends Command {
    id = "";
    paramIndex = 0;
    paramValue = null;

    constructor(vm) {
        super(vm);
    }

    validateParams() {
        super.validateParams();
        if (!this.id) {
            throw new Error('Block ID is required');
        }
        if (this.paramIndex < 0) {
            throw new Error('Parameter index must be non-negative');
        }
        if (this.paramValue === null || this.paramValue === undefined) {
            throw new Error('Parameter value is required');
        }
    }

    /**
     * 获取参数的DOM元素
     */
    getParamEl(id) {
        console.log("Getting parameter element for:", id);
        const parentEl = this.getScriptEl(id);
        const parentBlockEl = this.getBlockEl(id);
        const nodes = parentEl.querySelectorAll(':scope > g, :scope > [data-argument-type]');

        const slots = [];
        nodes.forEach(node => {
            const argType = node.getAttribute('data-argument-type');
            if (!argType) {
                // 根据位置判断是参数还是下一个块
                const parentBounds = this.getElementCoords(parentBlockEl);
                const nodeDataId = node.getAttribute('data-id');

                if (!nodeDataId) {
                    slots.push(node);
                    return;
                }

                const nodeEl = this.getScriptEl(nodeDataId);
                const nodeBounds = this.getElementCoords(nodeEl);

                if (nodeBounds[1] + nodeBounds[3] > parentBounds[1] + parentBounds[3]) {
                    // 是下一个块，跳过
                    return;
                } else {
                    slots.push(node);
                }
            } else {
                slots.push(node);
            }
        });

        return slots[this.paramIndex];
    }

    /**
     * 计算参数位置
     */
    calcPosition() {
        const slot = this.getParamEl(this.id);
        const coords = this.getElementCoords(slot);
        return [
            coords[0] + coords[2] / 2,
            coords[1] + coords[3] / 2
        ];
    }
}

/**
 * 块输入命令
 */
export class BlockInputCommand extends InputCommand {
    dataId = "";
    parentId = "";
    inputName = "";

    constructor(vm) {
        super(vm);
        this.paramValue = "";
    }

    validateParams() {
        super.validateParams();
        if (!this.parentId) {
            throw new Error('Parent block ID is required');
        }
    }

    getDataId() {
        return this.dataId;
    }

    /**
     * 计算块输入的位置
     */
    calcPosition() {
        if (this.inputName === "SUBSTACK") {
            const blockEl = this.getBlockEl(this.parentId);
            const coords = this.getElementCoords(blockEl);
            return [coords[0] + 40, coords[1] + 40];
        }

        if (this.inputName === "SUBSTACK2") {
            const blockEl = this.getBlockEl(this.parentId);
            const coords = this.getElementCoords(blockEl);
            return [coords[0] + 40, coords[1] + coords[3] - 30];
        }

        const slot = this.getParamEl(this.parentId);
        const coords = getElementCoords(slot);
        return [
            coords[0] + coords[2] / 2,
            coords[1] + coords[3] / 2
        ];
    }

    /**
     * 执行块输入操作
     */
    async execute() {
        if (this.blockExists(this.id)) {
            return;
        }

        const blockEl = this.getScriptEl(this.getDataId());
        const opcode = blockEl.getAttribute("data-id");
        window.opcodeToId = { [opcode]: this.id };

        let pos = this.calcPosition();
        if (await this.ensureVisible(pos[0], pos[1])) {
            pos = this.calcPosition();
        }

        await Rpa.drag(blockEl, pos[0], pos[1], this.dataId);
        window.opcodeToId = {};

        // 执行后检查
        if (!this.blockExists(this.id)) {
            console.log(`Block input creation failed for ID: "${this.id}"`);
        }
    }
}

/**
 * 变量输入命令
 */
export class VariableInputCommand extends BlockInputCommand {
    varName = "";
    varType = "";

    constructor(vm) {
        super(vm);
    }

    validateParams() {
        super.validateParams();
        if (!this.varName) {
            throw new Error('Variable name is required');
        }
        if (!this.varType) {
            throw new Error('Variable type is required');
        }
    }

    blockExists(id) {
        return false; // 变量块总是需要重新创建
    }

    /**
     * 根据变量类型获取对应的dataId
     */
    getDataId() {
        const categoryMap = {
            'SCALAR': 'data',
            'LIST': 'data-lists'
        };

        const category = categoryMap[this.varType];
        if (!category) {
            throw new Error(`Unknown variable type: "${this.varType}"`);
        }

        const container = document.querySelector('.blocklyFlyout');
        const nodes = container.querySelectorAll(`[data-category="${category}"]`);

        for (const node of nodes) {
            if (node.textContent.trim() === this.varName) {
                return node.getAttribute("data-id");
            }
        }

        throw new Error(`Variable "${this.varName}" not found in category "${category}"`);
    }
}

/**
 * 文本输入命令
 */
export class TextInputCommand extends InputCommand {
    /**
     * 执行文本输入操作
     */
    async execute() {
        const pos = this.calcPosition();
        await this.ensureVisible(pos[0], pos[1]);

        const slot = this.getParamEl(this.id);
        await Rpa.type(slot, this.paramValue);
    }
}

/**
 * 选项输入命令
 */
export class OptionInputCommand extends InputCommand {
    /**
     * 执行选项选择操作
     */
    async execute() {
        const pos = this.calcPosition();
        await this.ensureVisible(pos[0], pos[1]);

        const slot = this.getParamEl(this.id);
        await Rpa.click(slot);

        // 查找并点击对应的选项
        const options = document.querySelectorAll('.goog-menuitem-content');
        for (const option of options) {
            if (option.textContent.trim() === this.paramValue) {
                await Rpa.click(option);
                break;
            }
        }
    }
}
