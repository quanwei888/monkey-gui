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
import api from "./api";

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
        this.isProcessing = false;
        this.isPaused = false;
        this.muted = false;
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
        this.messageQueue = [];
    }

    pause = () => {
        this.isPaused = true;
    }
    resume = () => {
        this.isPaused = false;
        this.processNext();
    }

    addMessage = (msg) => {
        this.messageQueue.push(msg);
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
        if (this.muted) {
            return Promise.resolve();
        }

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
                try {
                    audioData = await audioMgr.getOrFetchAudio(message.text);
                } catch (error) {
                    console.error("从API获取音频失败:", error);
                }
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
            throw error;
        }
    }

    processNext = async () => {
        if (this.isPaused) {
            return;
        }

        // 如果已经在处理中，直接返回
        if (this.isProcessing) {
            return;
        }

        // 队列为空则返回
        if (this.messageQueue.length === 0) {
            return;
        }

        try {
            this.isProcessing = true;

            // 只处理队列中的第一条消息，而不是全部
            const message = this.messageQueue.shift();

            if (message.done) {
                console.log("Stream completed");
            }
            console.log("Processing message:", message);

            try {
                if (this.messageQueue.length > 0) {
                    audioMgr.getOrFetchAudio(this.messageQueue[0].text)
                }
                await this.process(message);
            } catch (error) {
                console.error("Error processing message:", error);
                throw error;
            }
        } finally {
            this.isProcessing = false;
            this.processNext();
        }
    }

    startStreamMessage = async (action, data) => {
        try {
            const sid = await api.submit(action, data);
            const eventSource = new EventSource(`http://test.xiaomalong.org:3001/stream/${sid}`);

            // 添加连接成功处理
            eventSource.onopen = () => {
                console.log("SSE connection established");
            };

            // 处理消息
            eventSource.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    console.log("Received data:", message);
                    this.addMessage(message);
                    // 只有当当前没有正在处理的消息时，才启动处理
                    if (!this.isProcessing) {
                        this.processNext();
                    }
                    if (message.done) {
                        console.log("Stream completed, closing connection");
                        eventSource.close();
                    }
                } catch (e) {
                    console.error("Error parsing event data:", e);
                    console.log("Raw event data:", event.data);
                }
            };

            // 添加错误处理
            eventSource.onerror = (error) => {
                console.error("EventSource error:", error);
                eventSource.close();
            };
        } catch (error) {
            console.error("Error in text recognition process:", error);
        }
    };
}

