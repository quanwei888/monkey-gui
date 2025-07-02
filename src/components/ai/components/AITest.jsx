import React, {useEffect, useState} from 'react';
import {PlayIcon, PlayNextIcon, LoadingIcon, VoiceIcon} from './Icon';
import {MessageProcessor} from "../lib/message";
import audioMgr from "../lib/audio";

const AiTutor = function (props) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPlayingNext, setIsPlayingNext] = useState(false);
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
                const response = await fetch(`http://test.xiaomalong.org:3001/${pid}/tutor`);
                const messages = await response.json();
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
    }, []); // 空依赖数组确保只执行一次

    const playMessage = async () => {
        if (nextMessageIndex >= messages.length) {
            return;
        }

        setIsPlayingNext(true);

        try {
            await processor.process(messages[nextMessageIndex]);
            setNextMessageIndex(nextMessageIndex + 1);
            if (nextMessageIndex < messages.length) {
                audioMgr.getOrFetchAudio(messages[nextMessageIndex].text);
            }
        } catch (error) {
            console.error("Error processing message:", error);
        } finally {
            setIsPlayingNext(false);
        }
    };

    const playMessages = async () => {
        setIsPlaying(true);
        for (let i = nextMessageIndex; i < messages.length; i++) {
            await processor.process(messages[i]);
            if (i < messages.length) {
                audioMgr.getOrFetchAudio(messages[i+1].text);
            }
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
                disabled={isPlaying || nextMessageIndex >= messages.length}
                className={`flex h-12 w-12 items-center justify-center rounded-full transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                    isPlaying || nextMessageIndex >= messages.length
                        ? 'bg-gray-100 text-gray-300'
                        : 'bg-blue-100 text-blue-600'
                }`}
            >
                {isPlayingNext ? <LoadingIcon className="animate-spin"/> : <PlayNextIcon/>}
            </button>
            <button
                onClick={playMessages}
                disabled={isPlayingNext || nextMessageIndex >= messages.length}
                className={`flex h-12 w-12 items-center justify-center rounded-full transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                    isPlayingNext || nextMessageIndex >= messages.length
                        ? 'bg-gray-100 text-gray-300'
                        : 'bg-blue-100 text-blue-600'
                }`}
            >
                {isPlaying ? <LoadingIcon className="animate-spin"/> : <PlayIcon/>}
            </button>
            <button
                className={`flex h-12 w-12 items-center justify-center rounded-full transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                    isPlaying || isPlayingNext
                        ? 'bg-gray-100 text-gray-300'
                        : 'bg-blue-100 text-blue-600'
                }`}>
                <VoiceIcon/>
            </button>
        </div>
    );
};

export default AiTutor;
