import Command from "./base";
import Rpa from '../rpa';
/**
 * 选择目标命令
 */
export class SelectTargetCommand extends Command {
    name = "";

    validateParams() {
        super.validateParams();
        if (!this.name) {
            throw new Error('Target name is required');
        }
    }

    /**
     * 执行目标选择操作
     */
    execute = async () => {
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
