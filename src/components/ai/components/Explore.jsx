import React, {useEffect, useRef, useState} from 'react';
import {MessagePlayer} from "../lib/message";
import MessageBar from "./MessageBar";

const Explore = function (props) {
    const {
        vm,
        pid
    } = props;
    useEffect(() => {
        console.log("pid changed to:", pid);
    }, [pid]);

    const messageProcessor = useRef(new MessagePlayer(vm));
    const streamQa = async (question) => {
        const sb3 = vm.toJSON();
        const data = {sb3, question}
        messageProcessor.current.startStreamMessage("qa", data)
    }

    const onSendMessage = (message) => {
        streamQa(message);
    }

    return (
        <MessageBar onSendMessage={onSendMessage}/>
    );
};

export default Explore;
