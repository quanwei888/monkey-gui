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
    const {
        vm,
        ...componentProps
    } = props;
    console.log(222,Blockly.ScratchMsgs);

    const handleRemote = async () => {
        const hashMatch = window.location.hash.match(/#(.+)/);
        const projectId = hashMatch ? hashMatch[1] : null;
        // 从 API 获取命令数据
        const response = await fetch(`http://api.xiaomalong.org:3001/cmd/${projectId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const cmds = await response.json();
        //console.log(222,Blockly.Blocks,Blockly.Msg);

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
                case "CreateVariableCommand":
                    cmd = new CreateVariableCommand(vm);
                    break;
            }
            console.log(cmd_json);
            Object.assign(cmd, cmd_json);
            if (cmd.id == "id_30") {
                console.log("id is null");
            }
            //await cmd.sug();
            console.log("start execute", cmd.id);
            await cmd.exec();
            console.log("end execute", cmd.id);
        }
    };

    return (
        <div>
            <button onClick={handleRemote}>AAA{Blockly.Msg.CONTROLS_IF_MSG_IF}</button>
        </div>
    );
};

AiTestComponent.defaultProps = {};
export default AiTestComponent;
