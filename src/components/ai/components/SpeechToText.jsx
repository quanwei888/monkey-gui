import React, {useState, useEffect, useCallback} from 'react';
import {RecordingIcon, VoiceIcon} from "./Icon";

const SpeechToText = ({onTextRecognized, language = 'zh-CN', continuous = false, interimResults = true}) => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [recognition, setRecognition] = useState(null);
    const [error, setError] = useState('');

    // 初始化语音识别
    useEffect(() => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            setError('您的浏览器不支持语音识别');
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognitionInstance = new SpeechRecognition();

        recognitionInstance.continuous = continuous;
        recognitionInstance.interimResults = interimResults;
        recognitionInstance.lang = language;

        recognitionInstance.onstart = () => {
            setIsListening(true);
            setError('');
        };

        recognitionInstance.onresult = (event) => {
            let currentTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                if (event.results[i].isFinal) {
                    currentTranscript += event.results[i][0].transcript;
                } else {
                    currentTranscript += event.results[i][0].transcript;
                }
            }

            setTranscript(currentTranscript);

            // 如果是最终结果，调用回调函数
            if (event.results[event.resultIndex].isFinal) {
                onTextRecognized && onTextRecognized(currentTranscript);
            }
        };

        recognitionInstance.onerror = (event) => {
            setError(`语音识别错误: ${event.error}`);
            setIsListening(false);
        };

        recognitionInstance.onend = () => {
            setIsListening(false);
        };

        setRecognition(recognitionInstance);

        return () => {
            recognitionInstance.abort();
        };
    }, [language, continuous, interimResults, onTextRecognized]);

    // 开始录音
    const startListening = useCallback(() => {
        if (recognition) {
            try {
                recognition.start();
                setTranscript('');
            } catch (error) {
                console.error('启动语音识别失败:', error);
                setError('启动语音识别失败');
            }
        }
    }, [recognition]);

    // 停止录音
    const stopListening = useCallback(() => {
        if (recognition) {
            recognition.stop();
        }
    }, [recognition]);

    return (
        <div className="speech-to-text">
            <div className="controls">
                {!isListening ? (
                    <button
                        onClick={startListening}
                        className={` bg-blue-100 text-blue-600 flex h-12 w-12 items-center justify-center rounded-full transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-400`}
                    >
                        <VoiceIcon/>
                    </button>
                ) : (
                    <button
                        onClick={stopListening}
                        className={` bg-blue-100 text-blue-600 flex h-12 w-12 items-center justify-center rounded-full transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-400`}
                    >
                        <RecordingIcon/>
                    </button>
                )}
            </div>
        </div>
    );
};

export default SpeechToText;
