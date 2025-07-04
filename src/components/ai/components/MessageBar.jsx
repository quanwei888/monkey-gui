import React, {useState, useRef, useEffect} from 'react';
import {LoadingSpinner, MicIcon, MuteIcon, PauseIcon, PlayIcon, SendIcon} from "./Icon";
import Recorder from "./Recorder";

// 主消息栏组件
const MessageBar = ({onSendMessage, onPlay, onPause}) => {
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const textareaRef = useRef(null);

    // 自动调整文本框高度
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
        }
    }, [message]);

    const handleInputChange = (e) => {
        setMessage(e.target.value);
    };

    const handleSendMessage = async (textToSend = message.trim()) => {
        if (textToSend && !isSending) {
            try {
                setIsSending(true);
                setMessage(''); // 立即清空输入框，提升用户体验

                if (onSendMessage) {
                    await onSendMessage(textToSend); // 等待回调函数执行完成
                    console.log('消息发送成功:', textToSend);
                } else {
                    console.log('发送文字消息:', textToSend);
                }
            } catch (error) {
                console.error('发送消息失败:', error);
                // 发送失败时可以选择将消息内容恢复到输入框
                setMessage(textToSend);
                alert('发送失败，请重试');
            } finally {
                setIsSending(false);
            }
        }
    };

    const handleKeyDown = async (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            await handleSendMessage();
        }
    };

    const handlePlayAudio = () => {
        if (isPlaying) {
            onPause && onPause();
        } else {
            onPlay && onPlay({isMuted}); // 播放时传递静音状态
        }
        setIsPlaying(!isPlaying);
    };

    const handleToggleMute = () => {
        setIsMuted(!isMuted);
        // 如果当前正在播放，则需要更新播放状态
        if (isPlaying) {
            onPlay && onPlay({isMuted: !isMuted});
        }
    };

    const handleRecordingComplete = async (text) => {
        await handleSendMessage(text);
    };

    return (
        <div className="w-full min-w-[500px] bg-white border-t border-gray-200 p-2 shadow-lg">
            {/* 消息输入区域 */}
            <div className="flex items-center">
                {/* 播放/暂停按钮 */}
                {onPlay &&
                    <button
                        className={`p-2 rounded-full flex-shrink-0 mr-2 transition-colors duration-200
                        ${isPlaying
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}
                        w-10 h-10 flex items-center justify-center `}
                        type="button"
                        title={isPlaying ? "暂停音频" : "播放音频"}
                        onClick={handlePlayAudio}
                    >
                        {isPlaying ? <PauseIcon/> : <PlayIcon/>}
                    </button>}

                <button
                    className={`p-2 rounded-full flex-shrink-0 mr-2 transition-colors duration-200 bg-gray-100 hover:bg-gray-200 text-gray-600
                        w-10 h-10 flex items-center justify-center `}
                    type="button"
                    title={isMuted ? "取消静音" : "静音"}
                    onClick={handleToggleMute}
                >
                    <MuteIcon isMuted={isMuted}/>
                </button>

                {/* 录音按钮组件 */}
                <Recorder
                    onRecordingComplete={handleRecordingComplete}
                    disabled={isSending}
                />

                <div className="flex-grow relative">
                    <textarea
                        ref={textareaRef}
                        value={message}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        placeholder="输入消息或按住麦克风说话"
                        rows="1"
                        disabled={isSending}
                        className={`w-full p-2 border border-gray-300 rounded-2xl
                            focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none overflow-hidden
                            transition-colors duration-200
                            ${isSending ? 'bg-gray-100 text-gray-500' : ''}
                            min-h-[40px] max-h-[150px]`}
                        style={{minHeight: '40px', maxHeight: '150px'}}
                    />
                </div>

                <button
                    className={`p-2 ml-2 rounded-full flex-shrink-0 flex items-center justify-center
                        transition-colors duration-200 w-10 h-10 focus:outline-none
                        ${isSending
                        ? 'bg-blue-400 text-white cursor-not-allowed'
                        : message.trim()
                            ? 'bg-blue-500 hover:bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                    onClick={() => handleSendMessage()}
                    disabled={!message.trim() || isSending}
                    type="button"
                >
                    {isSending ? <LoadingSpinner/> : <SendIcon/>}
                </button>
            </div>
        </div>
    );
};


export default MessageBar;
