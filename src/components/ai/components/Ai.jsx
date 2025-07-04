import React, {useEffect, useState, useRef} from 'react';
import Lecture from "./Lecture";
import Explore from "./Explore";
import Coder from "./Coder";

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

    let content;
    if (mode == "lecture") {
        content = <Lecture vm={vm} pid={pid}/>;
    } else if (mode == "explore") {
        content = <Explore vm={vm} pid={pid}/>;
    } else if (mode == "coder") {
        content = <Coder vm={vm} pid={pid}/>;
    } else {
        content = null;
    }

    return (
        <div
            className="z-[99] absolute bottom-5 left-1/2 transform -translate-x-1/2 border bg-gray z-50 w-auto inline-block">
            {content}
        </div>
    );
};

export default Ai;
