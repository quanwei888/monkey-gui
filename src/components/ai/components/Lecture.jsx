import React, {useEffect, useRef, useState} from 'react';
import {MessagePlayer} from "../lib/message";
import MessageBar from "./MessageBar";

const Lecture = function (props) {
    const {
        vm,
        pid
    } = props;

    const mainProcessor = useRef(new MessagePlayer({vm}));
    const qaProcessor = useRef(new MessagePlayer({vm}));
    const [isMuted, setIsMuted] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isReady, setIsReady] = useState(false);

    // 添加一个 useEffect 来监听 pid 的变化
    useEffect(() => {
        console.log("pid changed to:", pid);
        loadStudyMessage();
    }, [pid]); // 依赖项包含 pid，当 pid 变化时触发

    const loadStudyMessage = () => {
        const data = {pid}
        mainProcessor.current.onMessagePlayedCompleted = () => {
            setIsPlaying(false);
        }
        mainProcessor.current.setIsPaused(true);//只加载不播放
        mainProcessor.current.loadMessage("study", data, () => {
            setIsReady(true);
        });
    }

    const onSendMessage = async (question) => {
        const sb3 = vm.toJSON();
        const data = {sb3, question}
        qaProcessor.current.setIsPaused(false);
        qaProcessor.current.loadMessage("qa", data)
    };

    const onMuteChange = async () => {
        mainProcessor.current.setIsMuted(!isMuted);
        setIsMuted(!isMuted);
    }
    const onPlayChange = () => {
        if (isPlaying) {
            mainProcessor.current.setIsPaused(true);
            console.log("暂停")
        } else {
            mainProcessor.current.setIsPaused(false);
            mainProcessor.current.play();
            console.log("播放")
        }
        setIsPlaying(!isPlaying);
    }


    return (
        <div className={""}>
            <MessageBar onSendMessage={onSendMessage} onPlayChange={onPlayChange} onMuteChange={onMuteChange}
                        isMuted={isMuted} isPlaying={isPlaying} isReady={isReady}/>
        </div>
    );
};

export default Lecture;
