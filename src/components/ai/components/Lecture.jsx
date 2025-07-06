import React, {useEffect, useRef, useState} from 'react';
import {MessagePlayer, MessagePlayerEvents} from "../lib/message";
import MessageBar from "./MessageBar";
import Mode from "../lib/mode";
import audioMgr from "../lib/audio";

const Lecture = function (props) {
    const {
        vm,
        pid
    } = props;

    const mainPlayer = useRef(new MessagePlayer({vm}));
    const qaPlayer = useRef(new MessagePlayer({vm}));
    const [isMuted, setIsMuted] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [mode, setMode] = useState(Mode.Loading);

    // 添加一个 useEffect 来监听 pid 的变化
    useEffect(() => {
        console.log("pid changed to:", pid);
        mainPlayer.current.reset();
        qaPlayer.current.reset();
        setIsPaused(true);
        setMode(Mode.Loading);
        loadLectureMessage();
    }, [pid]); // 依赖项包含 pid，当 pid 变化时触发

    mainPlayer.current.on(MessagePlayerEvents.FIRST_MESSAGE_RECEIVED, () => {
        setMode(Mode.LectureMode);
        setIsPaused(true);
    })
    mainPlayer.current.on(MessagePlayerEvents.ALL_MESSAGES_PLAYED, () => {
        setMode(Mode.LectureExploreMode);
    })
    mainPlayer.current.on(MessagePlayerEvents.PAUSE_CHANGED, (isPaused) => {
        setIsPaused(isPaused);
    })
    mainPlayer.current.on(MessagePlayerEvents.MUTE_CHANGED, (isMuted) => {
        setIsMuted(isMuted);
    })
    qaPlayer.current.on(MessagePlayerEvents.MESSAGE_RECEIVED, (messageData) => {
        const text = messageData.text.trim();
        if (text) {
            audioMgr.getOrFetchAudio(text)
        }
    });

    const loadLectureMessage = () => {
        const data = {pid}
        mainPlayer.current.setIsPaused(true);//只加载不播放
        mainPlayer.current.loadMessage("stream_lecture", data)
    }

    const onSendMessage = async (question) => {
        const data = {pid, question}
        qaPlayer.current.setIsPaused(false);//自动播放
        qaPlayer.current.loadMessage("stream_lecture_qa", data)
    };

    const onMuteChange = async () => {
        mainPlayer.current.setIsMuted(!isMuted);
    }
    const onPlayChange = () => {
        mainPlayer.current.setIsPaused(!isPaused);
    }


    return (
        <MessageBar onSendMessage={onSendMessage} onPlayChange={onPlayChange} onMuteChange={onMuteChange}
                    player={mainPlayer.current} mode={mode}/>
    );
};

export default Lecture;
