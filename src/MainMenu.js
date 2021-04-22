"use strict"

function MainMenu(props) {
    const lastLevelNumber = props.lastLevelNumber;
    const lastLevelPackColor = props.lastLevelPackColor;
    const onPlayButtonClick = props.onPlayButtonClick;
    const loadFunction = props.loadFunction;
    const saveFunction = props.saveFunction;
    const [showCredits, setShowCredits] = React.useState(false);

    const lastLevelNumberStyle = {backgroundColor: lastLevelPackColor};

    return (
        <div className="mainMenu">
            <div className="buttonsGroup upperButtons">
                <button className="upperButton creditsButton"
                    onClick={event => setShowCredits(true)}>Credits</button>
            </div>
            {
                showCredits ?
                <CreditsWindow closeFunction={event => setShowCredits(false)}></CreditsWindow>
                :
                null
            }
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