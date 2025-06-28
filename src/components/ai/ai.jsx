
import React, {useEffect, useState, useRef} from 'react';


export default function FloatingAssistant() {
    const [isPopoverOpen, setIsPopoverOpen] = useState(false)
    const [isChatOpen, setIsChatOpen] = useState(false)
    const [messages, setMessages] = useState([
        {
            id: 1,
            text: "你好，有什么可以帮你的吗？",
            isUser: false,
            timestamp: new Date(),
        },
    ])
    const [inputValue, setInputValue] = useState("")

    const handleMainButtonClick = () => {
        setIsPopoverOpen(!isPopoverOpen)
    }

    const handleQuestionClick = () => {
        setIsPopoverOpen(false)
        setIsChatOpen(true)
    }

    const handleSendMessage = () => {
        if (!inputValue.trim()) return

        const newMessage = {
            id: messages.length + 1,
            text: inputValue,
            isUser: true,
            timestamp: new Date(),
        }

        setMessages((prev) => [...prev, newMessage])
        setInputValue("")

        // 模拟回复
        setTimeout(() => {
            const responses = ["好的，我明白了。", "这个问题很有意思。", "让我想想...", "我来帮你解答。", "还有其他问题吗？"]
            const aiResponse = {
                id: messages.length + 2,
                text: responses[Math.floor(Math.random() * responses.length)],
                isUser: false,
                timestamp: new Date(),
            }
            setMessages((prev) => [...prev, aiResponse])
        }, 800)
    }

    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            handleSendMessage()
        }
    }

    return (
        <div className="relative">
            {/* 主按钮 - 固定定位在右侧中间 */}
            <button
                onClick={handleMainButtonClick}
                className="fixed top-1/2 right-8 transform -translate-y-1/2 w-16 h-16 bg-white/90 backdrop-blur-xl rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50 flex items-center justify-center border border-gray-100"
            >
                <div className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
            </button>

            {/* 功能菜单 - 在按钮左侧 */}
            {isPopoverOpen && (
                <div className="fixed top-1/2 right-28 transform -translate-y-1/2 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
                    <div className="p-2">
                        <button
                            className="w-full flex items-center px-4 py-3 text-gray-800 hover:bg-gray-50 rounded-xl transition-all duration-200"
                            onClick={() => setIsPopoverOpen(false)}
                        >
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                <div className="w-4 h-3 border-2 border-blue-600 rounded-sm border-b-0"></div>
                            </div>
                            <span className="font-medium">跟学</span>
                        </button>
                        <button
                            className="w-full flex items-center px-4 py-3 text-gray-800 hover:bg-gray-50 rounded-xl transition-all duration-200"
                            onClick={() => setIsPopoverOpen(false)}
                        >
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                                <div className="w-4 h-4 border-2 border-green-600 rounded-full relative">
                                    <div className="absolute top-1 left-1 w-1 h-1 bg-green-600 rounded-full"></div>
                                </div>
                            </div>
                            <span className="font-medium">挑战</span>
                        </button>
                        <button
                            className="w-full flex items-center px-4 py-3 text-gray-800 hover:bg-gray-50 rounded-xl transition-all duration-200"
                            onClick={handleQuestionClick}
                        >
                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                                <div className="w-4 h-4 border-2 border-purple-600 rounded-full relative">
                                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-purple-600 rounded-full"></div>
                                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0.5 h-1 bg-purple-600"></div>
                                </div>
                            </div>
                            <span className="font-medium">提问</span>
                        </button>
                    </div>
                </div>
            )}

            {/* 对话窗口 - 固定在右下角 */}
            {isChatOpen && (
                <div className="fixed bottom-16 right-8 w-80 h-96 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-100 z-50 flex flex-col overflow-hidden">
                    {/* 头部 */}
                    <div className="flex items-center justify-between px-6 py-4">
                        <h3 className="text-lg font-semibold text-gray-900">助手</h3>
                        <button
                            onClick={() => setIsChatOpen(false)}
                            className="w-7 h-7 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors duration-200"
                        >
                            <div className="w-3 h-3 relative">
                                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-600 transform -translate-y-1/2 rotate-45"></div>
                                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-600 transform -translate-y-1/2 -rotate-45"></div>
                            </div>
                        </button>
                    </div>

                    {/* 消息区域 */}
                    <div className="flex-1 overflow-y-auto px-6 pb-4 space-y-4">
                        {messages.map((message) => (
                            <div key={message.id} className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}>
                                <div
                                    className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm ${
                                        message.isUser ? "bg-blue-500 text-white rounded-br-md" : "bg-gray-100 text-gray-900 rounded-bl-md"
                                    }`}
                                >
                                    {message.text}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* 输入区域 */}
                    <div className="px-6 pb-6">
                        <div className="flex items-center bg-gray-50 rounded-2xl px-4 py-2">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="输入消息..."
                                className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-500"
                            />
                            <button
                                onClick={handleSendMessage}
                                disabled={!inputValue.trim()}
                                className={`ml-2 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                                    inputValue.trim() ? "bg-blue-500 hover:bg-blue-600" : "bg-gray-200"
                                }`}
                            >
                                <div className={`w-4 h-4 ${inputValue.trim() ? "text-white" : "text-gray-400"}`}>
                                    <div className="w-full h-full relative">
                                        <div className="absolute top-1/2 left-0 w-0 h-0 border-l-4 border-l-current border-t-2 border-b-2 border-t-transparent border-b-transparent transform -translate-y-1/2"></div>
                                        <div className="absolute top-1/2 right-1 w-2 h-0.5 bg-current transform -translate-y-1/2"></div>
                                    </div>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 背景遮罩 */}
            {(isPopoverOpen || isChatOpen) && (
                <div
                    className="fixed inset-0 bg-black/10 backdrop-blur-sm z-40"
                    onClick={() => {
                        setIsPopoverOpen(false)
                        setIsChatOpen(false)
                    }}
                />
            )}
        </div>
    )
}

