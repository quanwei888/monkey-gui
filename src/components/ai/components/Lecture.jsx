import React, {useEffect, useRef, useState} from 'react';
import {MessagePlayer} from "../lib/message";
import MessageBar from "./MessageBar";

const Lecture = function (props) {
    const {
        vm,
        pid
    } = props;

    const mainPlayer = useRef(new MessagePlayer({vm}));
    const qaPlayer = useRef(new MessagePlayer({vm}));
    const [isMuted, setIsMuted] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isReady, setIsReady] = useState(false);

    // 添加一个 useEffect 来监听 pid 的变化
    useEffect(() => {
        console.log("pid changed to:", pid);
        mainPlayer.current.reset();
        qaPlayer.current.reset();
        setIsPlaying(false);
        setIsReady(false);
        loadStudyMessage();
    }, [pid]); // 依赖项包含 pid，当 pid 变化时触发

    const loadStudyMessage = () => {
        const data = {pid}
        mainPlayer.current.onMessagePlayedCompleted = () => {
            setIsPlaying(false);
        }
        mainPlayer.current.setIsPaused(true);//只加载不播放
        mainPlayer.current.loadMessage("study", data, () => {
            setIsReady(true);
        });
    }

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

    const onMuteChange = async () => {
        mainPlayer.current.setIsMuted(!isMuted);
        setIsMuted(!isMuted);
    }
    const onPlayChange = () => {
        if (isPlaying) {
            mainPlayer.current.setIsPaused(true);
            console.log("暂停")
        } else {
            mainPlayer.current.setIsPaused(false);
            mainPlayer.current.play();
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
