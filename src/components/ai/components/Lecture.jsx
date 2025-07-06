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

    // 在 useEffect 中注册事件监听器，只执行一次
    useEffect(() => {
        const mainPlayerInstance = mainPlayer.current;
        const qaPlayerInstance = qaPlayer.current;

        // 定义事件处理函数
        const handleFirstMessage = () => {
            setMode(Mode.LectureMode);
            setIsPaused(true);
        };

        const handleAllMessagesPlayed = () => {
            setMode(Mode.LectureExploreMode);
        };

        const handlePauseChanged = (isPaused) => {
            setIsPaused(isPaused);
        };

        const handleMuteChanged = (isMuted) => {
            setIsMuted(isMuted);
        };

        const handleQAMessageReceived = (messageData) => {
            const text = messageData.text.trim();
            if (text) {
                audioMgr.getOrFetchAudio(text);
            }
        };

        // 注册事件监听器
        mainPlayerInstance.on(MessagePlayerEvents.FIRST_MESSAGE_RECEIVED, handleFirstMessage);
        mainPlayerInstance.on(MessagePlayerEvents.ALL_MESSAGES_PLAYED, handleAllMessagesPlayed);
        mainPlayerInstance.on(MessagePlayerEvents.PAUSE_CHANGED, handlePauseChanged);
        mainPlayerInstance.on(MessagePlayerEvents.MUTE_CHANGED, handleMuteChanged);
        qaPlayerInstance.on(MessagePlayerEvents.MESSAGE_RECEIVED, handleQAMessageReceived);

        // 清理函数：组件卸载时移除事件监听器
        return () => {
            mainPlayerInstance.off(MessagePlayerEvents.FIRST_MESSAGE_RECEIVED, handleFirstMessage);
            mainPlayerInstance.off(MessagePlayerEvents.ALL_MESSAGES_PLAYED, handleAllMessagesPlayed);
            mainPlayerInstance.off(MessagePlayerEvents.PAUSE_CHANGED, handlePauseChanged);
            mainPlayerInstance.off(MessagePlayerEvents.MUTE_CHANGED, handleMuteChanged);
            qaPlayerInstance.off(MessagePlayerEvents.MESSAGE_RECEIVED, handleQAMessageReceived);
        };
    }, []); // 空依赖数组，只在组件挂载时执行一次

    // pid 变化时的处理
    useEffect(() => {
        console.log("pid changed to:", pid);
        mainPlayer.current.reset();
        qaPlayer.current.reset();
        setIsPaused(true);
        setMode(Mode.Loading);
        loadLectureMessage();
    }, [pid]);

    const loadLectureMessage = () => {
        const data = {pid}
        mainPlayer.current.setIsPaused(true);
        mainPlayer.current.loadMessage("stream_lecture", data);
    }

    const onSendMessage = async (question) => {
        const data = {pid, question}
        qaPlayer.current.setIsPaused(false);
        qaPlayer.current.loadMessage("stream_lecture_qa", data);
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
