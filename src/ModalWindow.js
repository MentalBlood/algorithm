import React from 'react';
import './ModalWindow.css';

function ModalWindow(props) {
    return (
        <div className={props.className}>
            <div className="modalWindowOverlay"
                onClick={props.closeFunction}></div>
            <div className="modalWindow">
                {props.children}
            </div>
        </div>
    );
}

export default ModalWindow;