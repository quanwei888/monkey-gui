import React, {useEffect, useState} from 'react';
import {PlayIcon, PlayNextIcon, SpeakingIcon, VoiceIcon} from './Icon';
import {MessageProcessor} from "../lib/message";
import audioMgr from "../lib/audio";
import SpeechToText from "./SpeechToText";
import {fetchStudyMessages} from "../lib/api";

const Lecture = function (props) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPlayingNext, setIsPlayingNext] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [processor, setProcessor] = useState(new MessageProcessor(props.vm));
    const [messages, setMessages] = useState([]);
    const [nextMessageIndex, setNextMessageIndex] = useState(0);
    const {
        vm,
        pid
    } = props;

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                setIsLoading(true);
                const messages = await fetchStudyMessages(pid)
                setMessages(messages);
                if (messages.length > 0) {
                    audioMgr.getOrFetchAudio(messages[0].text);
                }
                setNextMessageIndex(0);
            } catch (error) {
                console.error("Failed to fetch messages:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMessages();
    }, [pid]); // 空依赖数组确保只执行一次

    const playMessage = async () => {
        if (nextMessageIndex >= messages.length) {
            return;
        }

        setIsPlayingNext(true);

        try {
            if (nextMessageIndex + 1 < messages.length) {
                audioMgr.getOrFetchAudio(messages[nextMessageIndex].text);
            }
            await processor.process(messages[nextMessageIndex]);
            setNextMessageIndex(nextMessageIndex + 1);
        } catch (error) {
            console.error("Error processing message:", error);
        } finally {
            setIsPlayingNext(false);
        }
    };

    const onTextRecognized = (text) => {
        console.log(text);
    };
    const playMessages = async () => {
        setIsPlaying(true);
        for (let i = nextMessageIndex; i < messages.length; i++) {
            if (i + 1 < messages.length) {
                audioMgr.getOrFetchAudio(messages[i + 1].text);
            }
            await processor.process(messages[i]);
        }
        setNextMessageIndex(messages.length);
        setIsPlaying(false);
    };

    if (isLoading) {
        return <></>
    }

    return (
        <div id="ai-group"
             className="z-[9999] absolute right-32 bottom-6 flex flex-row items-center space-x-4 rounded-xl border-2 border-blue-300 bg-white/95 px-4 py-3 shadow-lg backdrop-blur-md transition-all duration-200">
            <button
                onClick={playMessage}
                disabled={isRecording || isPlaying || nextMessageIndex >= messages.length}
                className={`flex h-12 w-12 items-center justify-center rounded-full transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                    isRecording || isPlaying || nextMessageIndex >= messages.length
                        ? 'bg-gray-100 text-gray-300'
                        : 'bg-blue-100 text-blue-600'
                }`}
            >
                {isPlayingNext ? <SpeakingIcon className="animate-spin"/> : <PlayNextIcon/>}
            </button>
            <button
                onClick={playMessages}
                disabled={isRecording || isPlayingNext || nextMessageIndex >= messages.length}
                className={`flex h-12 w-12 items-center justify-center rounded-full transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                    isRecording || isPlayingNext || nextMessageIndex >= messages.length
                        ? 'bg-gray-100 text-gray-300'
                        : 'bg-blue-100 text-blue-600'
                }`}
            >
                {isPlaying ? <SpeakingIcon className="animate-spin"/> : <PlayIcon/>}
            </button>
            <SpeechToText onTextRecognized={onTextRecognized}/>
        </div>
    );
};

export default Lecture;
