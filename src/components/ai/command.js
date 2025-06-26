import Rpa from './rpa';
import {getElementCoords} from './func';

export const ParamType = {
    Field: 0,
    TextInput: 1,
    OptionInput: 2
};
const GLOBAL_PARAM_DOM_CACHE = {};

class Command {
    /** @type {VirtualMachine} */
    vm = null;

    constructor(vm) {
        this.vm = vm
    }

    async exec() {
        console.log("Executing command")
        await this.execute();
        console.log("Executed command")
    }

    async execute() {
        console.log("Not implemented")
    }

    getScriptDom(dataId) {
        const element = document.querySelector(`[data-id="${dataId}"]`);
        if (!element) {
            console.log(`未找到 data-id 为 "${dataId}" 的元素`);
            return null;
        }

        return element;
    }

    getBlockDom(dataId) {
        const selector = dataId.startsWith("$") ? `[data-id$="${dataId.substring(1)}"]` : `[data-id="${dataId}"]`;
        const element = document.querySelector(selector);
        if (!element) {
            console.log(`未找到 data-id 为 "${dataId}" 的元素`);
            return null;
        }

        // 查找元素内的第一个 path
        const path = element.querySelector('path');
        if (!path) {
            console.log(`在 data-id 为 "${dataId}" 的元素中未找到 path`);
            return null;
        }

        return path;
    }

    getParamDom(dataId, paramType, paramIndex) {
        // 创建缓存键
        const cacheKey = `${dataId}_${paramType}_${paramIndex}`;

        // 检查全局缓存中是否已有结果
        if (GLOBAL_PARAM_DOM_CACHE[cacheKey]) {
            //return GLOBAL_PARAM_DOM_CACHE[cacheKey];
        }

        // 原始逻辑
        const domParent = this.getScriptDom(dataId);
        const domParentBlock = this.getBlockDom(dataId);
        const nodes = domParent.querySelectorAll(':scope > g');
        const textNodes = []
        const fieldNodes = []
        const optionNodes = []
        nodes.forEach(node => {
            const argumentType = node.getAttribute('data-argument-type');
            if (!argumentType) {
                //根据位置信息判断是参数还是next
                const parentBbox = getElementCoords(domParentBlock);
                const block = this.getScriptDom(node.getAttribute('data-id'));
                const blockBbox = getElementCoords(block);
                if (blockBbox[1] + blockBbox[3] > parentBbox[1] + parentBbox[3]) {
                    // next block
                    return;
                } else {
                    textNodes.push(node);
                    return;
                }
            }


            if (["text", "boolean"].includes(argumentType)) {
                textNodes.push(node);
            }
            if (["dropdown", "variable", "colour"].includes(argumentType)) {
                if (node.hasAttribute('data-id')) {
                    optionNodes.push(node);
                } else {
                    fieldNodes.push(node);
                }
            } else {

            }
        })

        var slot = null;
        switch (paramType) {
            case ParamType.TextInput:
                slot = textNodes[paramIndex];
                break;
            case ParamType.Field:
                slot = fieldNodes[paramIndex]
                break;
            case ParamType.OptionInput:
                slot = optionNodes[paramIndex]
                break;
        }

        // 存储结果到全局缓存
        GLOBAL_PARAM_DOM_CACHE[cacheKey] = slot;

        return slot;
    }

    async makeVisualble(x, y) {
        const svgCanvas = document.querySelector('.injectionDiv');
        const canvasRect = svgCanvas.getBoundingClientRect();
        const minX = 300;
        const maxX = canvasRect.x + canvasRect.width - 50;
        const minY = canvasRect.y + 100;
        const maxY = canvasRect.y + canvasRect.height - 200;

        console.log(minX, minY, maxX, maxY);

        var targetX = -1;
        var targetY = -1;

        if (x < minX || x > maxX) {
            console.log(`位置不合法，x: ${x}, y: ${y}`);
            targetX = x
        }

        if (y > maxY || y < minY) {
            console.log(`位置不合法，x: ${x}, y: ${y}`);
            targetY = y;
        }
        await Rpa.center(targetX, targetY);
        return targetX != -1 || targetY != -1
    }
}

class BlockCommand extends Command {
    id = null
    newId = null

    constructor(vm, id) {
        super(vm)
        this.id = id
        this.newId = null
    }
    async dragBlock(domBlock,x,y){
        window.opcodeToId = {[this.id]: this.newId};
        await Rpa.drag(domBlock, x,y, this.newId)
        window.opcodeToId = {};
    }
}

export class AddBlockCommand extends BlockCommand {
    calculatePosition() {
        const blkIds = this.vm.editingTarget.blocks.getScripts();
        if (blkIds.length == 0) {
            return [400, 200];
        }
        const minX = blkIds.reduce((min, blkId) => {
            const blk = this.vm.editingTarget.blocks.getBlock(blkId);
            const domBlk = this.getScriptDom(blk.id);
            const bbox = getElementCoords(domBlk);
            return Math.min(min, bbox[0]);
        }, Infinity);

        const maxY = blkIds.reduce((max, blkId) => {
            const blk = this.vm.editingTarget.blocks.getBlock(blkId);
            const domBlk = this.getScriptDom(blk.id);
            const bbox = getElementCoords(domBlk);
            return Math.max(max, bbox[1] + bbox[3]);
        }, 200);
        return [minX + 10, maxY + 60];
    }

    async execute() {
        var pos = this.calculatePosition();
        const domBlock = this.getScriptDom(this.id)
        if (await this.makeVisualble(pos[0], pos[1])) {
            pos = this.calculatePosition();
        }
        await this.dragBlock(domBlock, pos[0], pos[1])
    }
}

export class ConnectBlockCommand extends BlockCommand {
    parentId = ""

    constructor(vm, id, parentId) {
        super(vm, id)
        this.parentId = parentId
    }

    calculatePosition() {
        const domParent = this.getBlockDom(this.parentId);
        const bbox = getElementCoords(domParent)
        return [bbox[0], bbox[1] + bbox[3] + 10];
    }

    async execute() {
        var pos = this.calculatePosition();
        const domBlock = this.getScriptDom(this.id)
        if (await this.makeVisualble(pos[0], pos[1])) {
            pos = this.calculatePosition();
        }
        await this.dragBlock(domBlock, pos[0], pos[1])
    }
}

export class InputBlockCommand extends BlockCommand {
    parentId = ""
    paramType = null
    paramIndex = 0

    constructor(vm, id, parentId, paramType, paramIndex) {
        super(vm, id)
        this.parentId = parentId
        this.paramType = paramType
        this.paramIndex = 0
    }

    calculatePosition() {
        var slot = this.getParamDom(this.parentId, this.paramType, this.paramIndex);
        const bbox = getElementCoords(slot)
        return [bbox[0] + bbox[2] / 2, bbox[1] + bbox[3] / 2];
    }

    async execute() {
        var pos = this.calculatePosition();
        const domBlock = this.getScriptDom(this.id)
        if (await this.makeVisualble(pos[0], pos[1])) {
            pos = this.calculatePosition();
        }
        await this.dragBlock(domBlock, pos[0], pos[1])
    }
}

class InputCommand extends Command {
    id = ""
    paramType = null
    paramIndex = 0
    paramValue = null

    constructor(vm, id, paramType, paramIndex, paramValue) {
        super(vm)
        this.id = id
        this.paramType = paramType
        this.paramIndex = paramIndex
        this.paramValue = paramValue
    }

    calculatePosition() {
        var slot = this.getParamDom(this.id, this.paramType, this.paramIndex);
        const bbox = getElementCoords(slot)
        return [bbox[0] + bbox[2] / 2, bbox[1] + bbox[3] / 2];
    }

}

export class TextInputCommand extends InputCommand {
    async execute() {
        var pos = this.calculatePosition();
        await this.makeVisualble(pos[0], pos[1])

        const slot = this.getParamDom(this.id, this.paramType, this.paramIndex);
        await Rpa.type(slot, this.paramValue)
    }
}

export class OptionInputCommand extends InputCommand {
    async execute() {
        var pos = this.calculatePosition();
        await this.makeVisualble(pos[0], pos[1])

        const slot = this.getParamDom(this.id, this.paramType, this.paramIndex);
        await Rpa.click(slot)

        const domOptions = document.querySelectorAll('.goog-menuitem-content')
        for (const option of domOptions) {
            if (option.textContent.trim() == this.paramValue) {
                await Rpa.click(option);
            }
        }
    }
}

export class SelectTargetCommand extends Command {
    name = ""

    constructor(vm, name) {
        super(vm)
        this.name = name
    }

    async execute() {
        const nodes = document.querySelectorAll('.sprite-selector-item_sprite-name_iMqNV')
        for (const node of nodes) {
            if (node.textContent.trim() == this.name) {
                await Rpa.click(node);
            }
        }
    }
}

export class SelectCategoryCommand extends Command {
    name = ""

    constructor(vm, name) {
        super(vm)
        this.name = name
    }

    async execute() {
        const node = document.querySelector(`[class*="${this.name}"]`)
        await Rpa.click(node);
        //await Rpa.wait(1000);
    }
}
