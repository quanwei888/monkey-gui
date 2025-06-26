import React, {useEffect, useState, useRef} from 'react';
import {
    AddBlockCommand,
    ConnectBlockCommand,
    BlockInputCommand,
    TextInputCommand,
    OptionInputCommand, SelectCategoryCommand, SelectTargetCommand, VariableInputCommand
} from './command';

const AiTestComponent = function (props) {
    const {
        vm,
        ...componentProps
    } = props;
    const generateUUID = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
    const handleAddBlock = async () => {
        var cmd = new SelectCategoryCommand(vm, "events");
        await cmd.exec();
        cmd = new SelectCategoryCommand(vm, "motion");
        await cmd.exec();
        cmd = new SelectTargetCommand(vm, "Cat");
        await cmd.exec();

        cmd = new AddBlockCommand(vm, generateUUID())
        cmd.dataId = 'motion_movesteps';
        await cmd.exec();
    };
    const handleConnectBlock = async () => {
        const dataId = 'motion_movesteps';
        const parentId = "set_sum_0";
        const cmd = new ConnectBlockCommand(vm, generateUUID(), parentId)
        cmd.dataId = 'motion_movesteps';
        await cmd.exec();
    };
    const handleInputBlock = async () => {
        const parentId = "set_sum_0";
        const cmd = new BlockInputCommand(
            vm,
            generateUUID(),
            parentId,
            0
        )
        cmd.dataId = '$_xposition';
        await cmd.exec();
    };
    const handleTextInputBlock = async () => {
        const id = "set_sum_0";
        const cmd = new TextInputCommand(
            vm,
            id,
            0,
            "10"
        )
        await cmd.exec();
    };
    const handleOptionInputBlock = async () => {
        const id = "set_sum_0";
        const cmd = new OptionInputCommand(
            vm,
            id,
            1,
            "当前数字"
        )
        await cmd.exec();
    };

    const handleRemote = async () => {
        const hashMatch = window.location.hash.match(/#(\d+)/);
        const projectId = hashMatch ? hashMatch[1] : null;
        // 从 API 获取命令数据
        const response = await fetch(`http://api.xiaomalong.org:3001/cmd/${projectId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const cmds = await response.json();

        var cmd = null;
        for (const cmd_json of cmds) {
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
            }
            console.log(cmd_json);
            Object.assign(cmd, cmd_json);
            await cmd.exec();
        }
    };

    return (
        <div>
            <button onClick={handleRemote}>r</button>
            <button onClick={handleAddBlock}>add</button>
            <button onClick={handleConnectBlock}>connect</button>
            <button onClick={handleInputBlock}>input</button>
            <button onClick={handleTextInputBlock}>text</button>
            <button onClick={handleOptionInputBlock}>option</button>
        </div>
    );
};

AiTestComponent.defaultProps = {};
export default AiTestComponent;
