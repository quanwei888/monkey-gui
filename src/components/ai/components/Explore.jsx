import React, {useEffect, useRef, useState} from 'react';
import {MessagePlayer} from "../lib/message";
import MessageBar from "./MessageBar";

const Explore = function (props) {
    const {
        vm,
        pid
    } = props;

    const qaPlayer = useRef(new MessagePlayer({vm}));
    const [isReady, setIsReady] = useState(false);

    // 添加一个 useEffect 来监听 pid 的变化
    useEffect(() => {
        console.log("pid changed to:", pid);
        qaPlayer.current.reset();
        setIsReady(false);
    }, [pid]); // 依赖项包含 pid，当 pid 变化时触发


    const onSendMessage = async (question) => {
        const sb3 = vm.toJSON();
        const data = {sb3, question}
        qaPlayer.current.setIsPaused(false);
        qaPlayer.current.loadMessage("qa", data)

        const message = {
            "text":"老师收到你的问题，我很快为你解答，请稍等...",
            "cmds":[]
        }
        qaPlayer.current.addMessage(message);
    };


    return (
        <div className={""}>
            <MessageBar onSendMessage={onSendMessage}/>
        </div>
    );
};

export default Explore;
