import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, {useEffect, useState} from 'react';

import PlayIcon from './play.svg';
import PlayingIcon from './playing.svg';
import styles from './ai.css';

const AiComponent = function (props) {
    const [isBusy, setIsBusy] = useState(false); // 整个周期锁
    const [audioSource, setAudioSource] = useState(null); // 当前播放的音频源
    const [isPlaying, setIsPlaying] = useState(false); // 是否正在播放

    const baseUrl = 'http://api.xiaomalong.org:3001';
    const {
        vm,
        ...componentProps
    } = props;

    // 停止音频播放
    const stopAudio = () => {
        if (audioSource) {
            try {
                audioSource.stop();
                audioSource.disconnect();
            } catch (error) {
                console.log('音频已经停止或断开连接');
            }
            setAudioSource(null);
            setIsPlaying(false);
        }
    };

    const play = async (text, options = {}) => {
        try {
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

            // 保存音频源引用并设置播放状态
            setAudioSource(source);
            setIsPlaying(true);

            source.start(0);

            return new Promise(resolve => {
                source.onended = function () {
                    setAudioSource(null);
                    setIsPlaying(false);
                    resolve();
                };
            });

        } catch (error) {
            console.error('播放音频时出错:', error);
            setIsPlaying(false);
            setAudioSource(null);
            throw error;
        }
    };

    const askAi = async () => {
        const helpUrl = `${baseUrl}/p/${hashProjectId}/ask_for_help`;
        if (isBusy) return;
        setIsBusy(true);
        try {
            const projectJson = props.vm.toJSON();
            const response = await fetch(helpUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    json: projectJson
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Success:', data);
            await play(data.tip);
        } catch (error) {
            try {
                await play("哎呀，我现在出了点小问题，请稍后再试。");
            } catch (e2) {
                // 处理提示音播放失败
            }
            console.error('Error:', error);
        } finally {
            setIsBusy(false); // 无论如何都解锁
        }
    };

    // 处理点击事件
    const handleClick = () => {
        if (isPlaying) {
            // 如果正在播放，则停止播放
            stopAudio();
        } else {
            // 如果没有播放，则开始AI询问
            askAi();
        }
    };

    useEffect(() => {
        console.log('只执行一次的函数');
        //play("你好，我是小助手，很高兴为你服务。");
    }, []);

    const hashMatch = window.location.hash.match(/#(\d+)/);
    if (hashMatch === null) {
        return (<div></div>);
    }
    const hashProjectId = hashMatch[1]

    return (
        <div
            className={classNames(
                styles.ai
            )}
            onClick={handleClick}
            style={{
                opacity: isBusy ? 0.5 : 1,
                cursor: isPlaying ? 'pointer' : 'pointer',
            }}
            title={isPlaying ? '点击停止播放' : '点击询问AI'}
        >
            <img src={isPlaying ? PlayingIcon : PlayIcon} alt="AI"/>
        </div>
    );
};

AiComponent.defaultProps = {};
export default AiComponent;
