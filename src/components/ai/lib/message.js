import {
    AddBlockCommand,
    ConnectBlockCommand,
    BlockInputCommand,
    TextInputCommand,
    CreateVariableCommand,
    OptionInputCommand,
    SelectCategoryCommand,
    SelectTargetCommand,
    VariableInputCommand, RemoveBlockCommand
} from '../command';
import audioMgr from "./audio";

/**
 * 消息处理类 - 负责执行指令和处理单条消息
 */
export class MessageProcessor {
    /**
     * 创建消息处理器实例
     * @param {Object} vm - 虚拟机实例
     */
    constructor(vm) {
        this.vm = vm;
        this.currentAudio = null;
        this.commandMap = {
            "AddBlockCommand": AddBlockCommand,
            "ConnectBlockCommand": ConnectBlockCommand,
            "BlockInputCommand": BlockInputCommand,
            "TextInputCommand": TextInputCommand,
            "OptionInputCommand": OptionInputCommand,
            "SelectCategoryCommand": SelectCategoryCommand,
            "SelectTargetCommand": SelectTargetCommand,
            "VariableInputCommand": VariableInputCommand,
            "CreateVariableCommand": CreateVariableCommand,
            "InputBlockCommand": BlockInputCommand,
            "RemoveBlockCommand": RemoveBlockCommand,
        };
    }

    /**
     * 重置处理状态
     */
    reset = () => {
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio = null;
        }
    }

    /**
     * 创建并执行单个命令
     * @param {Object} cmdSpec - 命令规格说明
     * @returns {Promise} - 命令执行完成的Promise
     */
    executeCommand = async (cmdSpec) => {
        const CommandClass = this.commandMap[cmdSpec.class];

        if (!CommandClass) {
            console.error(`未知命令类型: ${cmdSpec.class}`);
            return;
        }

        const command = new CommandClass(this.vm);
        Object.assign(command, cmdSpec);

        try {
            await command.exec();
        } catch (error) {
            console.error(`执行命令失败: ${cmdSpec.class}`, error);
            throw error;
        }
    }

    /**
     * 播放音频
     * @param {string} audioData - Base64编码的音频数据
     * @returns {Promise} - 音频播放的Promise
     */
    playAudio = (audioData) => {
        if (!audioData) {
            return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
            const audio = new Audio(`data:audio/wav;base64,${audioData}`);
            this.currentAudio = audio;

            audio.onended = () => {
                this.currentAudio = null;
                resolve();
            };

            audio.onerror = (error) => {
                this.currentAudio = null;
                reject(error);
            };

            audio.play();
        });
    }

    /**
     * 处理消息
     * @param {Object} message - 要处理的消息
     * @returns {Promise<boolean>} - 消息处理完成后的Promise，完成返回true
     */
    process = async (message) => {
        // 如果没有消息，则不执行任何操作
        if (!message) {
            return true;
        }

        // 确保重置之前的状态
        this.reset();

        try {
            // 如果消息没有音频但有文本，尝试从API获取音频
            let audioData = message.audio;
            if (!audioData && message.text) {
                console.log("消息没有音频，正在从API获取...");
                audioData = await audioMgr.getOrFetchAudio(message.text);
            }

            // 启动音频播放
            const audioPromise = audioData ? this.playAudio(audioData) : Promise.resolve();

            // 处理所有命令
            const cmdsPromise = (async () => {
                if (message.cmds && message.cmds.length > 0) {
                    for (let i = 0; i < message.cmds.length; i++) {
                        const cmd = message.cmds[i];
                        const cmdId = cmd.id || '未知ID';
                        console.log(`执行命令: ${cmdId} (${i + 1}/${message.cmds.length})`);
                        await this.executeCommand(cmd);
                    }
                }
            })();

            // 同时等待音频和命令执行完成
            await Promise.all([audioPromise, cmdsPromise]);

            // 显示消息文本
            if (message.text) {
                console.log("消息文本:", message.text);
            }

            console.log("消息处理完成");
            return true;

        } catch (error) {
            console.error("处理消息时发生错误:", error);
            return false;
        }
    }
}
