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

    // 添加一个 useEffect 来监听 pid 的变化
    useEffect(() => {
        console.log("pid changed to:", pid);
        qaPlayer.current.reset();
        qaPlayer.current.setIsPaused(false);//自动播放
    }, [pid]); // 依赖项包含 pid，当 pid 变化时触发

    qaPlayer.current.on(MessagePlayerEvents.MESSAGE_RECEIVED, (messageData) => {
        const text = messageData.text.trim();
        if (text) {
            audioMgr.getOrFetchAudio(text)
        }
    });

    const onSendMessage = async (question) => {
        const sb3 = vm.toJSON();
        const data = {pid, sb3, question}
        let action = "stream_test_qa";
        if (question === "@comment") {
            action = "stream_test_comment";
        }
        qaPlayer.current.loadMessage(action, data)
    };


    return (
        <MessageBar onSendMessage={onSendMessage} mode={mode}/>
    );
};

export default Test;
