import Rpa from './rpa';
import { getElementCoords } from './func';

/**
 * 基础命令类，所有命令的父类
 */
class Cmd {
    /** @type {VirtualMachine} */
    vm = null;

    constructor(vm) {
        this.vm = vm;
    }

    /**
     * 命令执行入口，包含参数校验
     */
    async exec() {
        this.validateParams();
        await this.execute();
        console.log('Scripts after execution:', this.vm.editingTarget.blocks.getScripts());
    }

    /**
     * 参数校验方法，子类需重写
     */
    validateParams() {
        if (!this.vm) {
            throw new Error('VM is required');
        }
    }

    /**
     * 具体执行逻辑，子类需重写
     */
    async execute() {
        console.log("Execute method not implemented");
    }

    /**
     * 检查指定ID的块是否存在
     */
    blockExists(id) {
        const element = document.querySelector(`[data-id="${id}"]`);
        return element !== null;
    }

    /**
     * 获取脚本DOM元素
     */
    getScriptEl(id) {
        const selector = id.startsWith("$")
            ? `[data-id$="${id.substring(1)}"]`
            : `[data-id="${id}"]`;

        const element = document.querySelector(selector);
        if (!element) {
            console.log(`Script element not found for ID: "${id}"`);
            return null;
        }
        return element;
    }

    /**
     * 获取块的DOM元素（path元素）
     */
    getBlockEl(id) {
        const element = this.getScriptEl(id);
        if (!element) return null;

        // 查找元素内的第一个path
        const path = element.querySelector('path');
        if (!path) {
            console.log(`Path element not found in block ID: "${id}"`);
            return null;
        }
        return path;
    }

    /**
     * 确保指定坐标在可视区域内
     */
    async ensureVisible(x, y) {
        const canvas = document.querySelector('.injectionDiv');
        const rect = canvas.getBoundingClientRect();

        const bounds = {
            minX: 300,
            maxX: rect.x + rect.width - 50,
            minY: rect.y + 100,
            maxY: rect.y + rect.height - 200
        };

        console.log('Canvas bounds:', bounds);

        let targetX = -1;
        let targetY = -1;

        if (x < bounds.minX || x > bounds.maxX) {
            console.log(`X coordinate out of bounds: ${x}, Y: ${y}`);
            targetX = x;
        }

        if (y > bounds.maxY || y < bounds.minY) {
            console.log(`Y coordinate out of bounds: X: ${x}, Y: ${y}`);
            targetY = y;
        }

        await Rpa.center(targetX, targetY);
        return targetX !== -1 || targetY !== -1;
    }
}

/**
 * 块命令基类
 */
class BlockCommand extends Cmd {
    id = null;
    dataId = null;

    constructor(vm) {
        super(vm);
    }

    validateParams() {
        super.validateParams();
        if (!this.id) {
            throw new Error('Block ID is required');
        }
    }

    /**
     * 计算块的放置位置，子类需重写
     */
    calcPosition() {
        throw new Error("calcPosition method not implemented");
    }

    /**
     * 执行块的拖拽操作
     */
    async execute() {
        if (this.blockExists(this.id)) {
            return;
        }

        const blockEl = this.getScriptEl(this.dataId);
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
            console.log(`Block creation failed for ID: "${this.id}"`);
        }
    }
}

/**
 * 添加新块命令
 */
export class AddBlockCommand extends BlockCommand {
    /**
     * 计算新块的放置位置
     */
    calcPosition() {
        const scriptIds = this.vm.editingTarget.blocks.getScripts();
        if (scriptIds.length === 0) {
            return [400, 200];
        }

        let minX = Infinity;
        let maxY = 200;

        for (const scriptId of scriptIds) {
            const block = this.vm.editingTarget.blocks.getBlock(scriptId);
            if (block.shadow) continue;

            const blockEl = this.getScriptEl(block.id);
            const coords = getElementCoords(blockEl);

            if (coords[0] < minX) {
                minX = coords[0];
            }

            const bottomY = coords[1] + coords[3];
            if (bottomY > maxY) {
                maxY = bottomY;
            }
        }
        return [minX, maxY + 50];
    }
}

/**
 * 连接块命令
 */
export class ConnectBlockCommand extends BlockCommand {
    parentId = "";

    constructor(vm) {
        super(vm);
    }

    validateParams() {
        super.validateParams();
        if (!this.parentId) {
            throw new Error('Parent block ID is required');
        }
    }

    /**
     * 计算连接块的位置（在父块下方）
     */
    calcPosition() {
        const parentEl = this.getBlockEl(this.parentId);
        const coords = getElementCoords(parentEl);
        return [coords[0], coords[1] + coords[3]];
    }
}

/**
 * 输入命令基类
 */
class InputCommand extends Cmd {
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
                const parentBounds = getElementCoords(parentBlockEl);
                const nodeDataId = node.getAttribute('data-id');

                if (!nodeDataId) {
                    slots.push(node);
                    return;
                }

                const nodeEl = this.getScriptEl(nodeDataId);
                const nodeBounds = getElementCoords(nodeEl);

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
        const coords = getElementCoords(slot);
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
            const coords = getElementCoords(blockEl);
            return [coords[0] + 40, coords[1] + 40];
        }

        if (this.inputName === "SUBSTACK2") {
            const blockEl = this.getBlockEl(this.parentId);
            const coords = getElementCoords(blockEl);
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
            'LIST': 'data-lists',
            'BROADCAST_MESSAGE': 'variables'
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

/**
 * 选择目标命令
 */
export class SelectTargetCommand extends Cmd {
    name = "";

    constructor(vm) {
        super(vm);
    }

    validateParams() {
        super.validateParams();
        if (!this.name) {
            throw new Error('Target name is required');
        }
    }

    /**
     * 执行目标选择操作
     */
    async execute() {
        if (this.name === "Stage") {
            const labels = document.querySelectorAll('.stage-selector_label_Ao0a3');
            for (const label of labels) {
                if (label.textContent.trim() === "背景") {
                    await Rpa.click(label);
                    break;
                }
            }
        } else {
            const sprites = document.querySelectorAll('.sprite-selector-item_sprite-name_iMqNV');
            for (const sprite of sprites) {
                if (sprite.textContent.trim() === this.name) {
                    await Rpa.click(sprite);
                    break;
                }
            }
        }
    }
}

/**
 * 选择分类命令
 */
export class SelectCategoryCommand extends Cmd {
    name = "";

    constructor(vm) {
        super(vm);
    }

    validateParams() {
        super.validateParams();
        if (!this.name) {
            throw new Error('Category name is required');
        }
    }

    /**
     * 执行分类选择操作
     */
    async execute() {
        const el = document.querySelector(`[class*="${this.name}"]`);
        if (!el) {
            throw new Error(`Category "${this.name}" not found`);
        }
        await Rpa.click(el);
    }
}
