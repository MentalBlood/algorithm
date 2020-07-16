import React from 'react';
import './MainMenu.css';
import getSvgCircle from './paintFunctions.js';

function MainMenu(props) {
    const lastLevelNumber = props.lastLevelNumber;
    const lastLevelPackColor = props.lastLevelPackColor;
    const onPlayButtonClick = props.onPlayButtonClick;

    return (
        <div className="mainMenu">
            <div className="buttons">
                <button className="upperButton creditsButton">Credits</button>
                <button className="upperButton settingsButton">Settings</button>
            </div>
            <div className="appLogo"><span className="logoText">ALGORITHM</span></div>
            <button className="playButton" onClick={event => onPlayButtonClick()}>
                Play {getSvgCircle(lastLevelPackColor, "2.3vmin")}{lastLevelNumber}
            </button>
        </div>
    );
}

export default MainMenu;