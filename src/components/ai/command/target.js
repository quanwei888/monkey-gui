import Command from "./base";
import Rpa from '../rpa';
/**
 * 选择目标命令
 */
export class SelectTargetCommand extends Command {
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
export class SelectCategoryCommand extends Command {
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
