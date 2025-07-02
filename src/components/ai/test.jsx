import React, {useEffect, useState, useRef} from 'react';
import {
    AddBlockCommand,
    ConnectBlockCommand,
    BlockInputCommand,
    TextInputCommand,
    CreateVariableCommand,
    OptionInputCommand, SelectCategoryCommand, SelectTargetCommand, VariableInputCommand, RemoveBlockCommand
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


    const handleClick = async () => {
         const cmd = new RemoveBlockCommand(vm);
         cmd.id = ";}yDU#DipB}e6)Z?((P]";
         await cmd.exec();
    }

    return (
        <div>
            <audio ref={startSoundRef} src="https://www.soundjay.com/buttons/sounds/button-3.mp3" preload="auto"/>
            <button onClick={handleClick}>Remove</button>
        </div>
    );
};

AiTestComponent.defaultProps = {};
export default AiTestComponent;
