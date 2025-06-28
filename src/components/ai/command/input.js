import Rpa from "../rpa";
import Command from "./base";

/**
 * 输入命令基类
 */
class InputCommand extends Command {
    id = "";
    paramName = null;
    paramValue = null;

    constructor(vm) {
        super(vm);
    }

    validateParams() {
        super.validateParams();
        if (!this.id) {
            throw new Error('Block ID is required');
        }
        if (this.paramName === null || this.paramName === undefined) {
            throw new Error('Parameter name is required');
        }
        if (this.paramValue === null || this.paramValue === undefined) {
            throw new Error('Parameter value is required');
        }
    }

    getParamBlock = (blockId, paramName) => {
        const blocks = this.vm.editingTarget.blocks._blocks;
        const block = blocks[blockId];
        if (paramName in block.inputs) {
            const input = block.inputs[paramName];
            return this.getScriptEl(input.block);
        } else if (paramName in block.fields) {
            const domBlock = this.getScriptEl(blockId);
            const gElements = domBlock.querySelectorAll(":scope > g");

            for (const g of gElements) {
                const typeAttr = g.getAttribute("data-argument-type");
                if (["variable", "dropdown", "colour"].includes(typeAttr)) {
                    return g;
                }
            }
        }

        // @hack
        var idx = 0;
        if (paramName === "CONDITION") {
            idx = 0
        }
        if (paramName === "OPERAND1") {
            idx = 0
        }
        if (paramName === "OPERAND2") {
            idx = 1
        }

        const domBlock = this.getScriptEl(blockId);
        const pElements = domBlock.querySelectorAll(":scope > path");

        const ps = []
        for (const p of pElements) {
            const typeAttr = p.getAttribute("data-argument-type");
            if (["boolean"].includes(typeAttr)) {
                ps.push(p);
            }
        }

        if (ps.length > 0) {
            if (idx >= ps.length) {
                return ps[0];
            } else {
                return ps[idx];
            }
        }

        throw new Error(`Parameter ${paramName} not found in block ${blockId}`);
    }

    /**
     * 计算参数位置
     */
    calcPosition() {
        const slot = this.getParamBlock(this.id, this.paramName);
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
    /**
     * 计算块输入的位置
     */
    calcPosition = () => {
        if (this.paramName === "SUBSTACK") {
            const blockEl = this.getBlockEl(this.id);
            const coords = this.getElementCoords(blockEl);
            return [coords[0] + 40, coords[1] + 40];
        }

        if (this.paramName === "SUBSTACK2") {
            const blockEl = this.getBlockEl(this.id);
            const coords = this.getElementCoords(blockEl);
            return [coords[0] + 40, coords[1] + coords[3] - 30];
        }

        const slot = this.getParamBlock(this.id, this.paramName);
        const coords = this.getElementCoords(slot);
        return [
            coords[0] + coords[2] / 2,
            coords[1] + coords[3] / 2
        ];
    }

    /**
     * 执行块输入操作
     */
    execute = async () => {
        try {
            if (this.blockExists(this.paramValue.id)) {
                console.log("block exists", this.paramValue);
                return;
            }
            const domParamBlock = this.getScriptEl(this.paramValue.dataId);
            const opcode = domParamBlock.getAttribute("data-id");
            window.opcodeToId = {[opcode]: this.paramValue.id};//参数 block 的 id

            let pos = this.calcPosition();
            if (await this.ensureScriptBlockVisible(pos[0], pos[1])) {
                pos = this.calcPosition();
            }
            window.opcodeToId = {[opcode]: this.paramValue.id};//参数 block 的 id
            await Rpa.drag(domParamBlock, pos[0], pos[1]);
            window.opcodeToId = {};

            // 执行后检查
            if (!this.blockExists(this.paramValue.id)) {
                console.log(`Block input creation failed for ID: "${this.paramValue.id}"`);
            }
        } catch (error) {
            console.error('BlockInputCommand execute error:', error);
            throw error; // 可根据需要决定是否向上传递
        }
    }

    async suggest() {
        const blockEl = this.getScriptEl(this.getDataId());
        Rpa.highlightElement(blockEl);
    }
}

/**
 * 变量输入命令
 */
export class VariableInputCommand extends BlockInputCommand {

    execute = async () => {
        try {
            const dataId = this.getVariableDataId(this.paramValue.name, this.paramValue.type)
            if (!dataId) {
                throw new Error(`Variable "${this.paramValue.name}" not found`);
            }
            const domParamBlock = this.getScriptEl(dataId);
            let pos = this.calcPosition();
            if (await this.ensureScriptBlockVisible(pos[0], pos[1])) {
                pos = this.calcPosition();
            }
            await Rpa.drag(domParamBlock, pos[0], pos[1]);
        } catch (error) {
            console.error('VariableInputCommand execute error:', error);
        }
    }

}

/**
 * 文本输入命令
 */
export class TextInputCommand extends InputCommand {
    /**
     * 执行文本输入操作
     */
    execute = async () => {
        try {
            const pos = this.calcPosition();
            await this.ensureScriptBlockVisible(pos[0], pos[1]);

            const slot = this.getParamBlock(this.id, this.paramName);
            await Rpa.click(slot);
            const input = document.querySelector('.blocklyHtmlInput');
            if (input.value.trim() !== this.paramValue.trim()) {
                await Rpa.type(input, this.paramValue.toString());
                input.value = this.paramValue;
            }

        } catch (error) {
            console.error('TextInputCommand execute error:', error);
        }
    }

    suggest = async () => {
        const pos = this.calcPosition();
        await this.ensureScriptBlockVisible(pos[0], pos[1]);

        const slot = this.getParamBlock(this.id, this.paramName);
        Rpa.highlightElement(slot);
    }

}

/**
 * 选项输入命令
 */
export class OptionInputCommand extends InputCommand {
    /**
     * 执行选项选择操作
     */
    execute = async () => {
        try {
            const pos = this.calcPosition();
            await this.ensureScriptBlockVisible(pos[0], pos[1]);

            const slot = this.getParamBlock(this.id, this.paramName);
            await Rpa.click(slot);

            // 查找并点击对应的选项
            const options = document.querySelectorAll('.goog-menuitem-content');
            for (const option of options) {
                if (option.textContent.trim() === this.paramValue) {
                    await Rpa.click(option);
                    return;
                }
            }

            //跳过颜色 todo
            if (this.paramValue.startsWith('#')) {
                return;
            }
            throw new Error(`Option "${this.paramValue}" not found`);
        } catch (error) {
            console.error('OptionInputCommand execute error:', error);
        }
    }

    suggest = async () => {
        const pos = this.calcPosition();
        await this.ensureScriptBlockVisible(pos[0], pos[1]);

        const slot = this.getParamBlock(this.id, this.paramName);
        Rpa.highlightElement(slot);
    }
}
