import React, {useEffect, useRef, useState} from 'react';
import {MessageProcessor} from "../lib/message";
import MessageBar from "./MessageBar";

const Lecture = function (props) {
    const {
        vm,
        pid
    } = props;

    // 添加一个 useEffect 来监听 pid 的变化
    useEffect(() => {
        console.log("pid changed to:", pid);
    }, [pid]); // 依赖项包含 pid，当 pid 变化时触发
    const mainProcessor = useRef(new MessageProcessor(vm));
    const qaProcessor = useRef(new MessageProcessor(vm));
    const streamQa = async (question) => {
        const sb3 = vm.toJSON();
        const data = {sb3, question}
        qaProcessor.current.startStreamMessage("qa", data)
    }
    const onSendMessage = async (msg) => {
        streamQa(msg);
    };
    const onPlay = async () => {
        const data = {pid}
        mainProcessor.current.muted = true;
        if (mainProcessor.current.messageQueue.length > 0) {
            mainProcessor.current.resume();
        } else {
            mainProcessor.current.startStreamMessage("study", data)
        }
    }
    const onPause = async () => {
        console.log("pause")
        mainProcessor.current.pause();
    }


    return (
        <div className={""}>
            <MessageBar onSendMessage={onSendMessage} onPlay={onPlay} onPause={onPause}/>
        </div>
    );
};

export default Lecture;
