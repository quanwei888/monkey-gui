import React, {useEffect, useRef, useState} from 'react';
import {PlayIcon, PlayNextIcon, SpeakingIcon, LoadingIcon, VoiceIcon} from './Icon';
import {MessageProcessor} from "../lib/message";
import audioMgr from "../lib/audio";
import SpeechToText from "./SpeechToText";
import api, {fetchStudyMessages} from "../lib/api";

const Lecture = function (props) {
    const {
        vm,
        pid
    } = props;

    const STATES = {
        IDLE: 0,
        LOADING: 1,
        PLAYING: 2,
        PAUSED: 3,
        COMPLATE: 4
    };

    // 创建引用来存储消息队列和处理状态
    const messageQueueRef = useRef([]);
    const isProcessingRef = useRef(false);
    const [state, setState] = useState(STATES.IDLE);

    // 添加一个 useEffect 来监听 pid 的变化
    useEffect(() => {
        // 重置组件状态
        setState(STATES.IDLE);
        messageQueueRef.current = [];
        isProcessingRef.current = false;

        console.log("pid changed to:", pid);
        // 如果需要，可以在这里添加其他初始化逻辑

    }, [pid]); // 依赖项包含 pid，当 pid 变化时触发

    // 处理队列中的下一条消息
    const processNextMessage = async () => {
        if (messageQueueRef.current.length === 0 || isProcessingRef.current) {
            return;
        }
        setState(STATES.PLAYING);
        isProcessingRef.current = true;
        const message = messageQueueRef.current.shift();

        try {
            console.log("Processing message:", message);
            const processor = new MessageProcessor(vm);
            await processor.process(message);

            if (message.done) {
                setState(STATES.COMPLATE);
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

    const handleStreamMessage = async () => {
        try {
            const sid = await api.submit("study", {pid});
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

    const handlePlay = async () => {
        console.log("Current state:", state);
        switch (state) {
            case STATES.IDLE:
                handleStreamMessage();
                break;
        }
    };

    return (
        <div id="ai-group"
             className="z-[9999] absolute right-32 bottom-6 flex flex-row items-center space-x-4 rounded-xl border-2 border-blue-300 bg-white/95 px-4 py-3 shadow-lg backdrop-blur-md transition-all duration-200">

            <button
                onClick={handlePlay}
                disabled={state == STATES.LOADING}
                className={`flex h-12 w-12 bg-blue-100 text-blue-600 items-center justify-center rounded-full transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-400 `}
            >
                {(() => {
                    switch (state) {
                        case STATES.IDLE:
                            return <PlayIcon/>;
                        case STATES.LOADING:
                            return <LoadingIcon/>;
                        case STATES.PLAYING:
                            return <SpeakingIcon/>;
                        case STATES.COMPLATE:
                            return <PlayIcon/>;
                    }
                })()}
            </button>
        </div>
    );
};

export default Lecture;
