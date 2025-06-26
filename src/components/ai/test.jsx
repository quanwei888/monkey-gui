import React, {useEffect, useState, useRef} from 'react';
import {
    AddBlockCommand,
    ConnectBlockCommand,
    InputBlockCommand,
    TextInputCommand,
    ParamType,
    OptionInputCommand, SelectCategoryCommand, SelectTargetCommand
} from './command';
import Rpa from "./rpa";

const AiTestComponent = function (props) {
    const {
        vm,
        ...componentProps
    } = props;
    console.log(vm);
    const generateUUID = ()=> {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
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

        const dataId = 'motion_movesteps';
        cmd = new AddBlockCommand(vm, dataId)
        cmd.newId = "12345_" + generateUUID();
        await cmd.exec();
    };
    const handleConnectBlock = async () => {
        const dataId = 'motion_movesteps';
        const parentId = "set_sum_0";
        const cmd = new ConnectBlockCommand(vm, dataId, parentId)
        await cmd.exec();
    };
    const handleInputBlock = async () => {
        const dataId = '$_xposition';
        const parentId = "set_sum_0";
        const cmd = new InputBlockCommand(
            vm,
            dataId,
            parentId,
            ParamType.TextInput,
            0
        )
        await cmd.exec();
    };
    const handleTextInputBlock = async () => {
        const id = "set_sum_0";
        const cmd = new TextInputCommand(
            vm,
            id,
            ParamType.TextInput,
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
            ParamType.Field,
            0,
            "当前数字"
        )
        await cmd.exec();
    };
    return (
        <div>
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
