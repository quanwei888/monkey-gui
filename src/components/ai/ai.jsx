import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, {useEffect, useState} from 'react';

import AiIcon from './icon--ai.svg';
import styles from './ai.css';

const AiComponent = function (props) {
    const [isBusy, setIsBusy] = useState(false); // 整个周期锁

    const helpUrl = 'http://api.xiaomalong.org:3001/help';
    const audioUrl = 'http://api.xiaomalong.org:3001/audio';
    const {
        vm,
        ...componentProps
    } = props;

    const play = async (text, options = {}) => {
        try {
            const defaultOptions = {
                channels: 1,
                sampleRate: 16000,
                bytesPerSample: 2
            };
            const audioOptions = { ...defaultOptions, ...options };
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();

            const response = await fetch(audioUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text: text })
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
            source.start(0);

            return new Promise(resolve => {
                source.onended = function () {
                    resolve();
                };
            });

        } catch (error) {
            console.error('播放音频时出错:', error);
            throw error;
        }
    };

    const askAi = async () => {
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
                    json: projectJson,
                    get_tip: true
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

    useEffect(() => {
        console.log('只执行一次的函数');
        //play("你好，我是小助手，很高兴为你服务。");
    }, []);

    return (
        <div
            className={classNames(
                styles.ai
            )}
            onClick={askAi}
            style={{ opacity: isBusy ? 0.5 : 1 }}
        >
            <img src={AiIcon} alt="AI" />
        </div>
    );
};

AiComponent.defaultProps = {};
export default AiComponent;
