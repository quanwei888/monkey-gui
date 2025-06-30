import React, {useEffect, useState, useRef} from 'react';
import {
    AddBlockCommand,
    ConnectBlockCommand,
    BlockInputCommand,
    TextInputCommand,
    CreateVariableCommand,
    OptionInputCommand, SelectCategoryCommand, SelectTargetCommand, VariableInputCommand
} from './command';

import Blockly from 'scratch-blocks';

const AiTestComponent = function (props) {
    const startSoundRef = useRef(null);
    const {
        vm,
        ...componentProps
    } = props;
    console.log(222, Blockly.ScratchMsgs);
    const hashMatch = window.location.hash.match(/#(.+)/);
    const projectId = hashMatch ? hashMatch[1] : null;

    const speakTask = async (message) => {
        return new Promise((resolve, reject) => {
            const audio = new Audio(`data:audio/wav;base64,${message.audio}`);
            audio.onended = resolve;      // 播放结束时 resolve
            audio.onerror = reject;       // 播放出错时 reject
            audio.play();
        });
    }
    const wait = async (second) => {
        return new Promise(resolve => setTimeout(resolve, second));
    }


    const playTask = async (message) => {
        for (const cmd of message.cmds) {
            await executeCmd(cmd)
        }
    }

    const executeCmd = async (cmd_json) => {
        var cmd;
        switch (cmd_json.class) {
            case "AddBlockCommand":
                cmd = new AddBlockCommand(vm);
                break;
            case "ConnectBlockCommand":
                cmd = new ConnectBlockCommand(vm);
                break;
            case "InputBlockCommand":
                cmd = new BlockInputCommand(vm);
                break;
            case "TextInputCommand":
                cmd = new TextInputCommand(vm);
                break;
            case "OptionInputCommand":
                cmd = new OptionInputCommand(vm);
                break;
            case "SelectCategoryCommand":
                cmd = new SelectCategoryCommand(vm);
                break;
            case "SelectTargetCommand":
                cmd = new SelectTargetCommand(vm);
                break;
            case "BlockInputCommand":
                cmd = new BlockInputCommand(vm);
                break;
            case "VariableInputCommand":
                cmd = new VariableInputCommand(vm);
                break;
            case "CreateVariableCommand":
                cmd = new CreateVariableCommand(vm);
                break;
        }
        Object.assign(cmd, cmd_json);
        await cmd.exec();
    }

    const processMessage = async (message) => {
        var tasks = []
        if (message.audio) {
            tasks.push(speakTask(message));
        }
        if (message.cmds.length > 0) {
            tasks.push(playTask(message));
        }
        await Promise.all(tasks);
        console.log(message.text);
    }


    const streamChunks = async (stream) => {
        try {
            // 流式读取
            const reader = stream.getReader();
            const decoder = new TextDecoder("utf-8");
            let buffer = "";

            while (true) {
                const {done, value} = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, {stream: true});
                let lines = buffer.split("\n");
                buffer = lines.pop();

                for (const line of lines) {
                    if (line.trim() === "") continue;
                    try {
                        const data = JSON.parse(line);
                        if (!("cmds" in data)) {
                            data.cmds = []
                        }
                        await processMessage(data);
                        await wait(1);
                    } catch (e) {
                        console.error("Parse error", e, line);
                    }
                }
            }
        } catch (err) {
            if (err.name === "AbortError") {
                console.log("接收已取消");
            } else {
                console.log("服务端连接失败");
            }
        } finally {
        }
    }

    const handleTest = async () => {
        const response = await fetch(`http://test.xiaomalong.org:3001/study/${projectId}`);
        await streamChunks(response.body);
    }
    const handleRemote = async () => {
        const response = await fetch(`http://test.xiaomalong.org:3001/${projectId}/cops`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const cmd_jsons = await response.json();
        var cmd = null;
        for (const cmd_json of cmd_jsons) {
            switch (cmd_json.class) {
                case "AddBlockCommand":
                    cmd = new AddBlockCommand(vm);
                    break;
                case "ConnectBlockCommand":
                    cmd = new ConnectBlockCommand(vm);
                    break;
                case "InputBlockCommand":
                    cmd = new BlockInputCommand(vm);
                    break;
                case "TextInputCommand":
                    cmd = new TextInputCommand(vm);
                    break;
                case "OptionInputCommand":
                    cmd = new OptionInputCommand(vm);
                    break;
                case "SelectCategoryCommand":
                    cmd = new SelectCategoryCommand(vm);
                    break;
                case "SelectTargetCommand":
                    cmd = new SelectTargetCommand(vm);
                    break;
                case "BlockInputCommand":
                    cmd = new BlockInputCommand(vm);
                    break;
                case "VariableInputCommand":
                    cmd = new VariableInputCommand(vm);
                    break;
                case "CreateVariableCommand":
                    cmd = new CreateVariableCommand(vm);
                    break;
            }
            console.log(cmd_json);
            Object.assign(cmd, cmd_json);
            if (cmd.id == "id_23") {
                console.log("id is null");
            }
            //await cmd.sug();
            console.log("start execute", cmd.id);
            await cmd.exec();
            //startSoundRef.current.currentTime = 0;
            //startSoundRef.current.play();
            console.log("end execute", cmd.id);
        }
    };

    return (
        <div>
            <audio ref={startSoundRef} src="https://www.soundjay.com/buttons/sounds/button-3.mp3" preload="auto"/>
            <button onClick={handleRemote}>AAA</button>
            <button onClick={handleTest}>BBB</button>
        </div>
    );
};

AiTestComponent.defaultProps = {};
export default AiTestComponent;
