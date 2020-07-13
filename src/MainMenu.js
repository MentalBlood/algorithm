import React from 'react';
import './MainMenu.css';
import getSvgCircle from './paintFunctions.js';

function MainMenu(props) {
    const lastLevelNumber = props.lastLevelNumber;
    const lastLevelPackColor = props.lastLevelPackColor;
    const onPlayButtonClick = props.onPlayButtonClick;

    return (
        <div className="MainMenu">
            <button className="upperButton creditsButton">Credits</button>
            <button className="upperButton settingsButton">Settings</button>
            <div className="appLogo"></div>
            <button className="playButton" onClick={onPlayButtonClick}>
                Play {getSvgCircle(lastLevelPackColor, "2.3vw")}{lastLevelNumber}
            </button>
        </div>
    );
}

export default MainMenu;