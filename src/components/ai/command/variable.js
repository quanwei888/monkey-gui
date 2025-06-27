import Command from "./base";
import Rpa from '../rpa';

export class CreateVariableCommand extends Command {
    varName = "";
    varType = "";

    validateParams() {
        super.validateParams();
        if (!this.varName) {
            throw new Error('Variable name is required');
        }
        if (!this.varType) {
            throw new Error('Variable type is required');
        }
    }

    execute = async () => {
        if (!this.varName || !this.varType) {
            throw new Error("变量或变量类型未定义");
        }

        const dataId = this.getVariableDataId(this.varName, this.varType)
        if (dataId) {
            console.log(`变量 ${this.varName} 已经存在，无需重新创建`);
            return;
        }


        switch (this.varType) {
            case "SCALAR":
                await this._createVariable(this.varName);
                break;
            case "LIST":
                await this._createVariable(this.varName, "建立一个列表");
                break;
            case "BROADCAST_MESSAGE":
                await this._createMsg(this.varName);
                break;
            default:
                throw new Error(`不支持的变量类型: ${this.variable.type}`);
        }
    }

    async _createVariable(varName, btnTitle = "建立一个变量") {
        await Rpa.selectCategory("variables")

        const btns = document.querySelectorAll('.blocklyText'); // 获取所有相关元素
        const btn = Array.from(btns).find(el => el.textContent.includes(btnTitle));
        await Rpa.click(btn);

        const inputSelector = ".prompt_variable-name-text-input_TnOzG";
        const input = document.querySelector(inputSelector);
        await Rpa.type(input, varName);

        const okSelector = ".prompt_ok-button_9CK92";
        const ok = document.querySelector(okSelector);
        await Rpa.click(ok);
    }

    _createMsg = async (varName) => {
        await Rpa.selectCategory("event")

        // 获取“当接收到广播”这个块
        const blkLoc = document.querySelector('[data-id="event_whenbroadcastreceived"]');

        // 点击变量下拉菜单
        const optionLoc = blkLoc.querySelector('[data-argument-type="variable"]');
        await Rpa.click(optionLoc);

        // 如果存在“新消息”菜单项，则点击它
        const menuSelector = '.goog-menuitem-content';
        const menuItems = Array.from(document.querySelectorAll(menuSelector));
        const targetItem = menuItems.find(el => el.textContent.includes("新消息"));

        if (targetItem) {
            await Rpa.click(targetItem);
        }

        // 输入变量名称
        const inputSelector = ".prompt_variable-name-text-input_TnOzG";
        const input = document.querySelector(inputSelector);
        await Rpa.type(input, varName);
        await Rpa.wait(1000);

        // 点击确认按钮
        const okSelector = ".prompt_ok-button_9CK92";
        const ok = document.querySelector(okSelector);
        await Rpa.click(ok);
        await Rpa.wait(1000);
        const varType = this.varType;
        await this.waitUntil(() => {
            const dataId = this.getVariableDataId(varName, varType);
            if (dataId) {
                return true;
            }
            return false;
        });
    }

    // 轮询函数：等待某个条件为 true
    waitUntil(conditionFn, interval = 200) {
        return new Promise((resolve) => {
            const timer = setInterval(() => {
                if (conditionFn()) {
                    clearInterval(timer);
                    resolve();
                }
            }, interval);
        });
    }

}
