import React, {useEffect, useState, useRef} from 'react';
import {PlayIcon, PlayNextIcon, SpeakingIcon, VoiceIcon} from './Icon';
import {MessageProcessor} from "../lib/message";
import audioMgr from "../lib/audio";
import SpeechToText from "./SpeechToText";
import api, {fetchQaMessages, fetchStudyMessages} from "../lib/api";

const Explore = function (props) {
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

    // 创建引用来存储消息队列和处理状态
    const messageQueueRef = useRef([]);
    const isProcessingRef = useRef(false);

    // 处理队列中的下一条消息
    const processNextMessage = async () => {
        if (messageQueueRef.current.length === 0 || isProcessingRef.current) {
            return;
        }

        isProcessingRef.current = true;
        const message = messageQueueRef.current.shift();

        try {
            console.log("Processing message:", message);
            await processor.process(message);

            if (message.done) {
                console.log("Stream completed");
            }
        } catch (e) {
            console.error("Error processing message:", e);
        } finally {
            isProcessingRef.current = false;
            // 处理完当前消息后，检查队列中是否还有消息需要处理
            processNextMessage();
        }
    };

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

    const onTextRecognized = async (text = "test") => {
        console.log(111, text);
        try {
            const sb3 = vm.toJSON();
            const question = "写一个从 1加到 50的程序";
            const sid = await api.submit("qa", {sb3, question});

            console.log("Connecting to SSE with sid:", sid);

            const eventSource = new EventSource(`http://test.xiaomalong.org:3001/stream/${sid}`);

            // 添加连接成功处理
            eventSource.onopen = () => {
                console.log("SSE connection established");
            };

            // 处理消息
            eventSource.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    console.log("Received data:", message);

                    // 将消息添加到队列
                    messageQueueRef.current.push(message);

                    // 尝试处理队列中的下一条消息
                    processNextMessage();

                    if (message.done) {
                        console.log("Stream completed, closing connection");
                        eventSource.close();
                    }
                } catch (e) {
                    console.error("Error parsing event data:", e);
                    console.log("Raw event data:", event.data);
                }
            };

            // 添加错误处理
            eventSource.onerror = (error) => {
                console.error("EventSource error:", error);
                eventSource.close();
            };
        } catch (error) {
            console.error("Error in text recognition process:", error);
        }
    };

    if (isLoading) {
        return <></>
    }

    return (
        <div id="ai-group"
             className="z-[9999] absolute right-32 bottom-6 flex flex-row items-center space-x-4 rounded-xl border-2 border-blue-300 bg-white/95 px-4 py-3 shadow-lg backdrop-blur-md transition-all duration-200">
            <button
                onClick={onTextRecognized}
                className={`flex bg-blue-100 text-blue-600 h-12 w-12 items-center justify-center rounded-full transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-400`}>
                <PlayNextIcon/>
            </button>
            <SpeechToText onTextRecognized={onTextRecognized}/>
        </div>
    );
};

export default Explore;
