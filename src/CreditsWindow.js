import React from 'react';
import './CreditsWindow.css';
import ModalWindow from './ModalWindow.js';

function CreditsWindow(props) {
    const closeFunction = props.closeFunction;
    return (
        <ModalWindow className="credits"
            closeFunction={closeFunction}>
            <div className="originalAppInfo">
                <div className="originalAppInfoIntro">
                    This is a web port of the iOS app <a href="https://apps.apple.com/us/app/algorithm-the-logic-game/id1475410194" className="reference"><span className="originalAppName">Algorithm - The Logic Game</span></a>
                </div>
                <div className="originalAppAuthors">
                    <div className="originalAppAuthorsIntro">iOS app made by</div>
                    <a href="mailto:theleokul@gmail.com" className="reference">
                        <div className="originalAppAuthor">Leonid Kulikov</div>
                    </a>
                    <a href="https://vk.com/iamonaboat" className="reference">
                        <div className="originalAppAuthor">Dmitry Nechaev</div>
                    </a>
                </div>
            </div>
            <div className="portInfo">
                <div className="portInfoIntro">Port made by</div>
                <a href="https://github.com/MentalBlood/algorithm" className="reference">
                    <div className="portAuthor">MentalBlood</div>
                </a>
            </div>
        </ModalWindow>
    );
}

export default CreditsWindow;