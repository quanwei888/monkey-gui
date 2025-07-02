import React, {useEffect, useState, useRef} from 'react';
import Lecture from "./Lecture";
import Explore from "./Explore";

const Ai = function (props) {
    const {
        vm
    } = props;
    const hashMatch = window.location.hash.match(/#(.+)/);
    const cols = hashMatch ? hashMatch[1].split('/') : [];
    if (cols.length != 2) {
        return <></>
    }

    const mode = cols[0]
    const pid = cols[1]

    if (mode == "lecture") {
        return (
            <>
                <Lecture vm={vm} pid={pid}/>
            </>
        );
    }
    if (mode == "explore") {
        return (
            <>
                <Explore vm={vm} pid={pid}/>
            </>
        );
    }

};

export default Ai;
