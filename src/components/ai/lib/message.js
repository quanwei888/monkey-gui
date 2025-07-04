import {
    AddBlockCommand,
    ConnectBlockCommand,
    BlockInputCommand,
    TextInputCommand,
    CreateVariableCommand,
    OptionInputCommand,
    SelectCategoryCommand,
    SelectTargetCommand,
    VariableInputCommand,
    RemoveBlockCommand
} from '../command';
import audioManager from "./audio";
import api from "./api";
import audioMgr from "./audio";

/**
 * 消息基类 - 所有消息类型的基础
 */
export class Message {
    constructor(data = {}) {
        this.id = data.id || Date.now().toString();
        this.isCompleted = false; // 标记消息是否完成
        this.hasError = false; // 是否出错
    }

    async play() {
        throw new Error('子类必须实现play方法');
    }
}

export class AudioMessage extends Message {
    constructor(data = {}) {
        super(data);
        this.audio = null;// 音频对象
        this.audioData = null;// 音频数据，可以是base64编码的字符串或Blob对象等
        this.text = data.text; // 可选，用于获取音频
    }

    /**
     * 播放音频消息，返回一个Promise，在音频播放完成或暂停时解决
     * @returns {Promise} - 音频播放完成或出错时解决的Promise
     */
    async play() {
        // 如果已经完成，直接返回
        if (this.isCompleted) {
            return;
        }

        try {
            // 首次播放时，初始化
            if (this.audio === null) {
                // 如果没有音频数据但有文本，获取音频
                if (!this.audioData && this.text) {
                    try {
                        this.audioData = await audioManager.getOrFetchAudio(this.text);
                    } catch (error) {
                        this.isCompleted = true;
                        this.hasError = true;
                        return;
                    }
                }

                if (!this.audioData) {
                    this.isCompleted = true;
                    return;
                }

                this.audio = new Audio(`data:audio/wav;base64,${this.audioData}`);

                // 设置音频事件监听器
                this.audio.onended = () => {
                    this.isCompleted = true;
                };

                this.audio.onerror = () => {
                    this.hasError = true;
                    this.isCompleted = true;
                };
            }

            // 开始播放
            await this.audio.play();
            await new Promise(resolve => setTimeout(resolve, 1000));
            this.audio.pause();
        } catch (error) {
            this.hasError = true;
            this.isCompleted = true;
        }
    }
}

const CommandMap = {
    AddBlockCommand,
    ConnectBlockCommand,
    BlockInputCommand,
    TextInputCommand,
    OptionInputCommand,
    SelectCategoryCommand,
    SelectTargetCommand,
    VariableInputCommand,
    CreateVariableCommand,
    RemoveBlockCommand,
};

/**
 * 命令消息 - 处理命令执行
 */
export class CommandMessage extends Message {
    constructor(data = {}) {
        super(data);
        this.cmds = data.cmds || [];
        this.currentCmdIndex = 0;
    }

    async play() {
        if (!this.cmds || this.cmds.length === 0) {
            this.isCompleted = true;
            return;
        }

        // 如果已经完成，直接返回
        if (this.isCompleted) {
            return;
        }

        // 执行当前命令
        if (this.currentCmdIndex >= this.cmds.length) {
            return;
        }

        const command = this.cmds[this.currentCmdIndex];
        const commandId = command.id || '未知ID';
        console.log(`执行命令: ${commandId} (${this.currentCmdIndex + 1}/${this.cmds.length})`);

        try {
            await command.execute();
        } catch (error) {
            this.hasError = true;
            this.isCompleted = true;
        } finally {
            this.currentCmdIndex++;
            if (this.currentCmdIndex >= this.cmds.length) {
                this.isCompleted = true;
            }
        }
    }
}

/**
 * 消息工厂 - 创建不同类型的消息
 */
export class MessageFactory {
    static createMessage(vm, messageData) {
        const messageGroup = []
        if (messageData.text) {
            messageGroup.push(new AudioMessage({text: messageData.text}));
        }
        if (messageData.cmds) {
            const cmds = []
            for (const commandSpec of messageData.cmds) {
                const cmdClass = CommandMap[commandSpec.class];
                const command = new cmdClass(vm);
                Object.assign(command, commandSpec);
                cmds.push(command)
            }
            messageGroup.push(new CommandMessage({cmds}));
        }
        return messageGroup;
    }
}

/**
 * 消息处理类 - 负责执行指令和处理消息流
 */
export class MessagePlayer {
    /**
     * 创建消息处理器实例
     * @param {Object} vm - 虚拟机实例
     */
    constructor(data) {
        this.vm = data.vm;
        this.isPaused = true;
        this.isMuted = false;
        this.isProcessing = false;
        this.messageGroupQueue = [];
        this.currentMessageGroup = null;
        this.onMessagePlayedCompleted = data.onMessagePlayedCompleted;

    }

    /**
     * 暂停消息处理
     */
    setIsPaused(isPaused) {
        this.isPaused = isPaused;
        console.log("暂停设置", isPaused);
    }


    setIsMuted(isMuted) {
        this.isMuted = isMuted;
        console.log("静音设置", isMuted);
    }


    /**
     * 添加消息到队列
     * @param {Object} messageData - 要添加的消息数据
     */
    addMessage(messageData) {
        const messageGroup = MessageFactory.createMessage(this.vm, messageData);
        this.messageGroupQueue.push(messageGroup);
    }

    /**
     * 重置处理状态，停止当前音频
     */
    reset() {
        this.isPaused = true;
        this.isMuted = false;
        this.messageGroupQueue = [];
        this.currentMessageGroup = null;
        this.isProcessing = false;
    }

    async play() {
        // 使用while循环替代递归
        while (true) {
            // 如果暂停或正在处理中，直接返回
            if (this.isPaused || this.isProcessing) {
                return;
            }

            this.isProcessing = true;

            try {
                if (!this.currentMessageGroup) {
                    this.currentMessageGroup = this.messageGroupQueue.shift();
                    if (this.messageGroupQueue.length >= 2) {
                        for (const message of this.messageGroupQueue[1]) {
                            const audioText = message.text;
                            audioMgr.getOrFetchAudio(audioText);
                        }
                    }
                }

                if (!this.currentMessageGroup) {
                    this.isProcessing = false;
                    this.onMessagePlayedCompleted && this.onMessagePlayedCompleted();
                    return;
                }

                // 如果有当前消息，处理它
                const messagePromises = [];
                for (const messageGroup of this.currentMessageGroup) {
                    if (messageGroup instanceof AudioMessage && this.isMuted) {
                        // 如果消息是音频且静音，则跳过
                        messageGroup.isCompleted = true;
                        continue;
                    }
                    if (!messageGroup.isCompleted) {
                        messagePromises.push(messageGroup.play());
                    }
                }
                await Promise.all(messagePromises);

                let completed = true;
                for (const message of this.currentMessageGroup) {
                    completed = completed && message.isCompleted;
                }

                if (completed) {
                    this.currentMessageGroup = null;
                }

                this.isProcessing = false;

            } catch (error) {
                console.error("消息处理失败:", error);
                this.currentMessageGroup = null;
                this.isProcessing = false;
                // 发生错误后继续循环处理下一个消息组
            }
        }
    }

    async loadMessage(action, data, onFirstMessageReceived) {
        try {
            const sessionId = await api.submit(action, data);
            const eventSource = new EventSource(`http://test.xiaomalong.org:3001/stream/${sessionId}`);

            eventSource.onopen = () => {
                console.log("SSE连接已建立");
            };

            eventSource.onmessage = (event) => {
                try {
                    const messageData = JSON.parse(event.data);
                    console.log("接收数据:", messageData);

                    if (!messageData.done) {
                        this.addMessage(messageData);
                        this.play();
                    }
                    if (onFirstMessageReceived) {
                        audioMgr.getOrFetchAudio(messageData.text);
                        onFirstMessageReceived && onFirstMessageReceived();
                        onFirstMessageReceived = null;
                    }

                    if (messageData.done) {
                        console.log("流处理完成，关闭连接");
                        onFirstMessageReceived && onFirstMessageReceived();
                        eventSource.close();
                    }
                } catch (error) {
                    console.error("解析事件数据出错:", error);
                    console.log("原始事件数据:", event.data);
                    onFirstMessageReceived && onFirstMessageReceived();
                }
            };

            eventSource.onerror = (error) => {
                console.error("EventSource错误:", error);
                onFirstMessageReceived && onFirstMessageReceived();
                eventSource.close();
            };
        } catch (error) {
            console.error("loadMessage 错误", error);
            onFirstMessageReceived && onFirstMessageReceived();
        }
    }
}
