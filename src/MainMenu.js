import React from 'react';
import './MainMenu.css';

function MainMenu(props) {
    const lastLevelNumber = props.lastLevelNumber;
    const lastLevelPackColor = props.lastLevelPackColor;
    const onPlayButtonClick = props.onPlayButtonClick;
    const loadFunction = props.loadFunction;
    const saveFunction = props.saveFunction;

    const lastLevelNumberStyle = {backgroundColor: lastLevelPackColor};

    return (
        <div className="mainMenu">
            <div className="buttonsGroup upperButtons">
                <button className="upperButton creditsButton">Credits</button>
                <button className="upperButton settingsButton">Settings</button>
            </div>
            <div className="appLogo"><span className="logoText">ALGORITHM</span></div>
            <div className="buttonsGroup lowerButtons">
                <button className="lowerButton loadButton"
                    onClick={() => loadFunction()}>Load</button>
                <button className="lowerButton playButton" onClick={event => onPlayButtonClick()}>
                    Play <span className="lastLevelNumber" style={lastLevelNumberStyle}>{lastLevelNumber}</span>
                </button>
                <button className="lowerButton saveButton"
                    onClick={() => saveFunction()}>Save</button>
            </div>
        </div>
    );
}

export default MainMenu;