import React from 'react';
import './DraggingController.css';

function DraggingController(props) {
    const type = props.type;
    const position = props.position;
    const style = position === undefined ? {} : {top: position.y, left: position.x};

    return <div id="DraggingController" className={"DraggingController" + " " + type} style={style}></div>;
}

export default DraggingController;