import Rpa from '../rpa';

/**
 * 基础命令类，所有命令的父类
 */
export default class Command {
    /** @type {VirtualMachine} */
    vm = null;

    constructor(vm) {
        this.vm = vm;
    }

    getVariableDataId(varName, varType) {
        var varTypeStr = "" // 默认是变量
        if (varType == "list") {
            varTypeStr = "list";
        } else if (varType == "BROADCAST_MESSAGE") {
            varTypeStr = "broadcast_msg";
        }
        const variables = this.vm.runtime.targets[0].variables;

        for (const variable of Object.values(variables)) {
            if (variable.name === varName && variable.type === varTypeStr) {
                return variable.id;
            }
        }
        return null;
    }


    getElementCoords = (element, relativeToPage = true) => {
        // 如果传入的是字符串ID，获取对应的DOM元素
        if (typeof element === 'string') {
            element = document.getElementById(element);
        }

        // 如果找不到元素，返回 [0, 0, 0, 0]
        if (!element) {
            console.warn('Element not found');
            return [0, 0, 0, 0];
        }

        const rect = element.getBoundingClientRect();

        let x, y;

        if (relativeToPage) {
            // 相对于整个页面（包括滚动部分）的坐标
            x = rect.left + window.scrollX;
            y = rect.top + window.scrollY;
        } else {
            // 相对于视口的坐标
            x = rect.left;
            y = rect.top;
        }

        const width = rect.width;
        const height = rect.height;

        return [x, y, width, height];
    }


    /**
     * 命令执行入口，包含参数校验
     */
    async exec() {
        this.validateParams();
        await this.execute();
    }

    async sug(...args) {
        this.validateParams();
        await this.suggest();
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
    execute = async () => {
        console.log("Execute method not implemented");
    }
    /**
     * 具体执行逻辑，子类需重写
     */
    async suggest() {
        console.log("Execute method not implemented");
    }


    /**
     * 检查指定ID的块是否存在
     */
    blockExists(blockId) {
        const blocks = this.vm.editingTarget.blocks._blocks;
        return blockId in blocks;
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

export const VariableType = {
    SCALAR: 'SCALAR',
    LIST: 'LIST_TYPE',
    BROADCAST_MESSAGE: 'BROADCAST_MESSAGE',
};
