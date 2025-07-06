import React, {useEffect, useRef, useState} from 'react';
import {MessagePlayer, MessagePlayerEvents} from "../lib/message";
import MessageBar from "./MessageBar";
import Mode from "../lib/mode";
import audioMgr from "../lib/audio";

const Test = function (props) {
    const {
        vm,
        pid
    } = props;

    const qaPlayer = useRef(new MessagePlayer({vm}));
    const [mode, setMode] = useState(Mode.TestMode);

    // 在 useEffect 中注册事件监听器，只执行一次
    useEffect(() => {
        const qaPlayerInstance = qaPlayer.current;

        // 定义事件处理函数
        const handleMessageReceived = (messageData) => {
            const text = messageData.text.trim();
            if (text) {
                audioMgr.getOrFetchAudio(text);
            }
        };

        // 注册事件监听器
        qaPlayerInstance.on(MessagePlayerEvents.MESSAGE_RECEIVED, handleMessageReceived);

        // 清理函数：组件卸载时移除事件监听器
        return () => {
            qaPlayerInstance.off(MessagePlayerEvents.MESSAGE_RECEIVED, handleMessageReceived);
        };
    }, []); // 空依赖数组，只在组件挂载时执行一次

    // pid 变化时的处理
    useEffect(() => {
        console.log("pid changed to:", pid);
        qaPlayer.current.reset();
        qaPlayer.current.setIsPaused(false); // 自动播放
    }, [pid]); // 依赖项包含 pid，当 pid 变化时触发

    const onSendMessage = async (question) => {
        const sb3 = vm.toJSON();
        const data = {pid, sb3, question}
        let action = "stream_test_qa";
        if (question === "@comment") {
            action = "stream_test_comment";
        }
        qaPlayer.current.loadMessage(action, data);
    };

    return (
        <MessageBar onSendMessage={onSendMessage} mode={mode}/>
    );
};

export default Test;
