import Rpa from '../lib/rpa';
import Command from "./base";

/**
 * 块命令基类
 */
class BlockCommand extends Command {
    id = null;
    dataId = null;

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
    execute = async () => {
        if (this.blockExists(this.id)) {
            return;
        }

        const domBlock = this.getScriptEl(this.dataId);
        const opcode = domBlock.getAttribute("data-id");

        let pos = this.calcPosition();
        await this.ensureToolboxBlockVisible(this.dataId)
        if (await this.ensureScriptBlockVisible(pos[0], pos[1])) {
            pos = this.calcPosition();
        }
        window.opcodeToId = {[opcode]: this.id};
        await Rpa.drag(domBlock, pos[0], pos[1]);
        window.opcodeToId = {};

        // 执行后检查
        if (!this.blockExists(this.id)) {
            console.log(`Block creation failed for ID: "${this.id}"`);
        }
    }

    async suggest() {
        const blockEl = this.getScriptEl(this.dataId);
        Rpa.highlightElement(blockEl);
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

        const rectWorkspace = this.getElementCoords(document.querySelector(".injectionDiv"));
        const rectToolBox = this.getElementCoords(document.querySelector(".blocklyFlyout"));
        const defaultPos = [rectWorkspace[0] + rectToolBox[2] + 100, 200];

        if (scriptIds.length === 0) {
            return defaultPos
        }

        let minX = Infinity;
        let maxY = 200;

        for (const scriptId of scriptIds) {
            const block = this.vm.editingTarget.blocks.getBlock(scriptId);
            if (block.shadow) continue;

            const blockEl = this.getScriptEl(block.id);
            const coords = this.getElementCoords(blockEl);

            if (coords[0] < minX) {
                minX = coords[0];
            }

            const bottomY = coords[1] + coords[3];
            if (bottomY > maxY) {
                maxY = bottomY;
            }
        }
        if (Math.abs(minX - defaultPos[0]) < 20) {
            minX = defaultPos[0];
        }
        return [minX, maxY + 50];
    }
}

/**
 * 连接块命令
 */
export class ConnectBlockCommand extends BlockCommand {
    parentId = "";

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
        const coords = this.getElementCoords(parentEl);
        return [coords[0], coords[1] + coords[3]];
    }
}

/**
 * 连接块命令
 */
export class RemoveBlockCommand extends BlockCommand {
    /**
     * 执行块的拖拽操作
     */
    execute = async () => {
        if (!this.blockExists(this.id)) {
            return;
        }

        const domBlock = this.getScriptEl(this.id);
        await Rpa.click(domBlock, 2);
        await this.selectLastOption();

        if (this.blockExists(this.id)) {
            console.log(`Block removal failed for ID: "${this.id}"`);
        }
    }
}


var currentCategory = null;

/**
 * 选择分类命令
 */
export class SelectCategoryCommand extends Command {
    name = "";

    validateParams() {
        super.validateParams();
        if (!this.name) {
            throw new Error('Category name is required');
        }
    }

    /**
     * 执行分类选择操作
     */
    execute = async () => {
        if (currentCategory === this.name) {
            return;
        }
        await Rpa.selectCategory(this.name)
        currentCategory = this.name;
    }

    async suggest() {
        Rpa.highlightCategory(this.name);
    }
}
