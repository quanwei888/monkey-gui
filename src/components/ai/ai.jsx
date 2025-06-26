import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, {useEffect, useState, useRef} from 'react';
import PlayIcon from './play.svg';
import styles from './ai.css';
import Rpa from './rpa';

const AiComponent = function (props) {
    const [showModal, setShowModal] = useState(false); // 控制浮层显示
    const [question, setQuestion] = useState('下一步要怎么办？'); // 用户输入的问题
    const [isLoading, setIsLoading] = useState(false); // 加载状态
    const modalRef = useRef(null); // 浮层引用，用于点击外部关闭
    const currentAudioSource = useRef(null); // 当前播放的音频源引用

    const baseUrl = 'http://api.xiaomalong.org:3001';
    const {
        vm,
        ...componentProps
    } = props;

    // 获取项目ID
    const getHashProjectId = () => {
        const hashMatch = window.location.hash.match(/#(\d+)/);
        return hashMatch ? hashMatch[1] : null;
    };

    // 停止当前播放的音频
    const stopCurrentAudio = () => {
        if (currentAudioSource.current) {
            try {
                currentAudioSource.current.stop();
                currentAudioSource.current = null;
            } catch (error) {
                console.log('停止音频播放:', error);
            }
        }
    };

    const play = async (text, options = {}) => {
        try {
            // 停止当前播放的音频
            stopCurrentAudio();

            const audioUrl = `${baseUrl}/audio`;
            const defaultOptions = {
                channels: 1,
                sampleRate: 16000,
                bytesPerSample: 2
            };
            const audioOptions = {...defaultOptions, ...options};
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();

            const response = await fetch(audioUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({text: text})
            });

            const arrayBuffer = await response.arrayBuffer();
            const pcmData = new Int16Array(arrayBuffer);
            const audioBuffer = audioContext.createBuffer(
                audioOptions.channels,
                pcmData.length,
                audioOptions.sampleRate
            );

            const channelData = audioBuffer.getChannelData(0);
            for (let i = 0; i < pcmData.length; i++) {
                channelData[i] = pcmData[i] / 32768.0;
            }

            const source = audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContext.destination);

            // 保存当前音频源引用
            currentAudioSource.current = source;

            source.start(0);

            return new Promise(resolve => {
                source.onended = function () {
                    currentAudioSource.current = null;
                    resolve();
                };
            });

        } catch (error) {
            console.error('播放音频时出错:', error);
            currentAudioSource.current = null;
            throw error;
        }
    };

    const askAi = async (userQuestion) => {
        const hashProjectId = getHashProjectId();
        if (!hashProjectId) {
            console.error('无法获取项目ID');
            return;
        }

        // 设置加载状态
        setIsLoading(true);

        const helpUrl = `${baseUrl}/p/${hashProjectId}/ask_for_help`;

        try {
            const projectJson = props.vm.toJSON();
            const response = await fetch(helpUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    json: projectJson,
                    question: userQuestion
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            console.log('AI Response:', data);

            // 确保AI回复内容存在
            const aiResponse = data.tip || data.response || data.message || '抱歉，我没有收到有效的回复。';
            console.log('AI Response content:', aiResponse);

            // 播放音频
            try {
                await play(aiResponse);
            } catch (audioError) {
                console.error('音频播放失败:', audioError);
            }

        } catch (error) {
            const errorMessage = "哎呀，我现在出了点小问题，请稍后再试。";
            console.error('AI request error:', error);

            try {
                await play(errorMessage);
            } catch (audioError) {
                console.error('错误提示音播放失败:', audioError);
            }
        } finally {
            // 无论成功还是失败，都要清除加载状态
            setIsLoading(false);
        }
    };

    const handleRpa = async () => {
        await Rpa.click('[data-id="motion_movesteps"]');
        const canvasDom = document.querySelector('.blocklyWorkspace');
        const block_Dom =  Rpa.findElementByDataId("change_num");
        await Rpa.centerBlock(canvasDom,block_Dom);
        //await Rpa.drag('[data-id="motion_movesteps"]', 500, 200);

    }

    // 处理点击事件
    const handleClick = () => {
        // 显示浮层让用户输入问题
        setShowModal(true);
    };

    // 处理确认按钮点击
    const handleConfirm = () => {
        if (question.trim() && !isLoading) {
            askAi(question);
            setQuestion(''); // 清空输入
            setShowModal(false); // 关闭浮层
        }
    };

    // 处理取消按钮点击
    const handleCancel = () => {
        setShowModal(false);
        setQuestion(''); // 清空输入
        // 停止当前播放的音频
        stopCurrentAudio();
    };

    // 处理输入变化
    const handleInputChange = (e) => {
        setQuestion(e.target.value);
    };

    // 处理键盘事件
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleConfirm();
        } else if (e.key === 'Escape') {
            handleCancel();
        }
    };

    // 检查项目ID是否存在
    const hashProjectId = getHashProjectId();
    if (!hashProjectId) {
        return (<div></div>);
    }

    return (
        <>
            <div
                className={classNames(
                    styles.ai,
                    {[styles.loading]: isLoading}
                )}
                title={isLoading ? "AI正在思考中..." : "点击询问AI"}
            >
                <button onClick={handleRpa} disabled={isLoading}>AA</button>
                <img src={PlayIcon} alt="AI"/>
                {isLoading && <div className={styles.loadingSpinner}></div>}
            </div>

            {/* 简单输入浮层 */}
            {showModal && (
                <div className={styles.modalOverlay}>
                    <div ref={modalRef} className={styles.modal}>
                        <div className={styles.modalHeader}>
                            <h3>我是你的 AI 老师</h3>
                            <button
                                className={styles.closeButton}
                                onClick={handleCancel}
                                disabled={isLoading}
                            >
                                ×
                            </button>
                        </div>
                        <div className={styles.modalBody}>
                            <textarea
                                className={styles.questionInput}
                                value={question}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                                placeholder="请输入你的问题..."
                                autoFocus
                                disabled={isLoading}
                            />
                            <div className={styles.buttonArea}>
                                <button
                                    className={styles.cancelButton}
                                    onClick={handleCancel}
                                    disabled={isLoading}
                                >
                                    取消
                                </button>
                                <button
                                    className={styles.confirmButton}
                                    onClick={handleConfirm}
                                    disabled={!question.trim() || isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <span className={styles.buttonSpinner}></span>
                                            思考中...
                                        </>
                                    ) : (
                                        '确认'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

AiComponent.defaultProps = {};
export default AiComponent;
