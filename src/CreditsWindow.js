import React from 'react';
import './CreditsWindow.css';
import credits from './credits.json';
import ModalWindow from './ModalWindow.js';

function CreditsWindow(props) {
    const closeFunction = props.closeFunction;
    return (
        <ModalWindow className="credits"
            closeFunction={closeFunction}>
            {
                credits.map(
                    credit =>
                    <div className="credit">
                        <div className="position">{credit.position}</div>
                        <div className="name">{credit.name}</div>
                    </div>
                )
            }
        </ModalWindow>
    );
}

export default CreditsWindow;