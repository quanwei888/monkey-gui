import React, {useEffect, useRef, useState} from 'react';
import {PlayNextIcon} from './Icon';
import {MessageProcessor} from "../lib/message";
import api from "../lib/api";
import audioMgr from "../lib/audio";
import MessageBar from "./MessageBar";

const Coder = function (props) {
    const {
        vm,
        pid
    } = props;
    useEffect(() => {
        console.log("pid changed to:", pid);
    }, [pid]);

    const messageProcessor = useRef(new MessageProcessor(vm));
    const streamQa = async (question) => {
        const sb3 = vm.toJSON();
        const data = {sb3, question}
        messageProcessor.current.startStreamMessage("coder", data)
    }

    const onSendMessage = (message) => {
        streamQa(message);
    }

    return (
        <MessageBar onSendMessage={onSendMessage}/>
    );
};

export default Coder;
