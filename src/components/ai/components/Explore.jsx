import React, {useRef, useState} from 'react';
import {PlayNextIcon} from './Icon';
import {MessageProcessor} from "../lib/message";
import SpeechToText from "./SpeechToText";
import api from "../lib/api";
import audioMgr from "../lib/audio";

const Explore = function (props) {
    const {
        vm,
        pid
    } = props;

    // 添加状态来控制输入框的显示
    const [showInput, setShowInput] = useState(false);
    const [inputValue, setInputValue] = useState('');

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
            const processor = new MessageProcessor(vm);
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

    const handleStreamMessage = async (question) => {
        try {
            const sb3 = vm.toJSON();
            const sid = await api.submit("qa", {sb3, question});
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

                    // 预进行TTS
                    if (!message.done) {
                        audioMgr.getOrFetchAudio(message.text)
                    }

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

    // 处理按钮点击事件
    const handleButtonClick = () => {
        setShowInput(true);
    };

    // 处理输入提交
    const handleSubmit = (e) => {
        e.preventDefault();
        if (inputValue.trim()) {
            handleStreamMessage(inputValue);
            setInputValue('');
            setShowInput(false);
        }
    };

    // 处理取消输入
    const handleCancel = () => {
        setShowInput(false);
        setInputValue('');
    };

    return (
        <div id="ai-group"
             className="z-[9999] absolute right-32 bottom-6 flex flex-row items-center space-x-4 rounded-xl border-2 border-blue-300 bg-white/95 px-4 py-3 shadow-lg backdrop-blur-md transition-all duration-200">
            {showInput ? (
                <form onSubmit={handleSubmit} className="flex items-center space-x-2">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="请输入问题..."
                        className="border border-blue-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        autoFocus
                    />
                    <button
                        type="submit"
                        className="bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition duration-200"
                    >
                        发送
                    </button>
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="bg-gray-300 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-400 transition duration-200"
                    >
                        取消
                    </button>
                </form>
            ) : (
                <button
                    onClick={handleButtonClick}
                    className={`flex bg-blue-100 text-blue-600 h-12 w-12 items-center justify-center rounded-full transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-400`}>
                    <PlayNextIcon/>
                </button>
            )}
        </div>
    );
};

export default Explore;
