import React, { useState, useRef, useEffect } from 'react';
import { MicIcon,RecordingMicIcon } from "./Icon";


const Recorder = ({ onRecordingComplete, disabled }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [interimTranscript, setInterimTranscript] = useState('');
    const [finalTranscript, setFinalTranscript] = useState('');
    const [supported, setSupported] = useState(true);

    const timerRef = useRef(null);
    const recognitionRef = useRef(null);
    const buttonRef = useRef(null);

    // 初始化语音识别
    useEffect(() => {
        window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!window.SpeechRecognition) {
            setSupported(false);
            return;
        }

        recognitionRef.current = new window.SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'zh-CN';

        recognitionRef.current.onresult = (event) => {
            let interim = '';
            let final = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                if (event.results[i].isFinal) {
                    final += event.results[i][0].transcript;
                } else {
                    interim += event.results[i][0].transcript;
                }
            }

            if (final) {
                setFinalTranscript(prev => prev + final);
            }
            setInterimTranscript(interim);
        };

        return () => {
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.stop();
                } catch (error) {}
            }
            clearInterval(timerRef.current);
        };
    }, []);

    // 处理录音状态变化
    useEffect(() => {
        if (!recognitionRef.current) return;

        recognitionRef.current.onend = () => {
            if (isRecording) {
                try {
                    recognitionRef.current.start();
                } catch (error) {}
            }
        };

        if (isRecording) {
            try {
                recognitionRef.current.start();
            } catch (error) {}

            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        } else {
            try {
                recognitionRef.current.stop();
            } catch (error) {}
            clearInterval(timerRef.current);
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.onend = null;
            }
            clearInterval(timerRef.current);
        };
    }, [isRecording]);

    const startRecording = () => {
        if (!supported || disabled) return;

        setIsRecording(true);
        setRecordingTime(0);
        setInterimTranscript('');
        setFinalTranscript('');
    };

    const stopRecording = async () => {
        setIsRecording(false);

        const completeTranscript = finalTranscript + interimTranscript;
        if (completeTranscript && onRecordingComplete) {
            await onRecordingComplete(completeTranscript);
        }

        setInterimTranscript('');
        setFinalTranscript('');
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleEvents = {
        onMouseDown: startRecording,
        onMouseUp: stopRecording,
        onTouchStart: startRecording,
        onTouchEnd: stopRecording,
        onMouseLeave: isRecording ? stopRecording : undefined
    };

    return (
        <div className="relative">
            <button
                ref={buttonRef}
                className={`p-2 rounded-full flex-shrink-0 mr-2 transition-colors duration-200
                    ${isRecording ? 'bg-red-500 text-white' : 'bg-blue-500 text-white hover:bg-blue-600' }
                    ${disabled || !supported ? 'opacity-50 cursor-not-allowed' : ''}
                    w-10 h-10 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-300`}
                {...handleEvents}
                disabled={disabled || !supported}
                type="button"
                title={!supported ? "您的浏览器不支持语音识别" : "按住说话，松开发送"}
            >
                {isRecording ? <RecordingMicIcon /> : <MicIcon />}
            </button>

            {/* 绝对定位的实时预览区域 */}
            {isRecording && (
                <div className="absolute bottom-full mb-2 left-0 w-64 z-10 shadow-lg">
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        {/* 录音状态栏 */}
                        <div className="flex items-center bg-gray-50 px-3 py-2 border-b border-gray-200">
                            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse mr-2"></div>
                            <span className="text-gray-700 text-xs font-medium">正在录音 {formatTime(recordingTime)}</span>
                        </div>

                        {/* 实时预览内容 */}
                        <div className="p-3">
                            <div className="min-h-[40px] max-h-[120px] overflow-y-auto text-sm">
                                {finalTranscript || interimTranscript ? (
                                    <>
                                        <span>{finalTranscript}</span>
                                        <span className="italic text-gray-500">{interimTranscript}</span>
                                    </>
                                ) : (
                                    <span className="text-gray-400 italic">请开始说话...</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 小三角指示箭头 */}
                    <div className="absolute bottom-[-6px] right-4 w-3 h-3 bg-white border-r border-b border-gray-200 transform rotate-45"></div>
                </div>
            )}
        </div>
    );
};

export default Recorder;
