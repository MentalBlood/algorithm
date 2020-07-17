import React from 'react';
import './draggingController.css';

function DraggingController(props) {
    const type = props.type;
    const position = props.position;
    const style = position === undefined ? {} : {top: position.y, left: position.x};

    return <div id="draggingController" className={"draggingController" + " " + type} style={style}></div>;
}

export default DraggingController;