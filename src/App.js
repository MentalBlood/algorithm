import React, {Component} from 'react';
import './App.css';
import getSvgCircle from './paintFunctions.js';
import levels from './levels.json';
import MainMenu from './MainMenu.js';
import Levels from './Levels.js';
import Game from './Game.js';

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            levels: levels,
            currentLevelNumber: 20,
            currentLevelPack: 2,
            currentScreen: "main"
        };
        this.launchLevel = this.launchLevel.bind(this);
    }

    getCurrentLevelPackColor() {
        const currentLevelPack = this.state.currentLevelPack;
        return this.state.levels[currentLevelPack].color;
    }

    launchLevel(levelPack, levelNumber) {
        this.setState({currentScreen: "game"});
    }

    render() {
        const currentScreen = this.state.currentScreen;
        if (currentScreen === "main") {
            const currentLevelPackColor = this.getCurrentLevelPackColor();
            const currentLevelNumber = this.state.currentLevelNumber;

            return (
                <div className="app">
                    <MainMenu lastLevelNumber={currentLevelNumber}
                        lastLevelPackColor={currentLevelPackColor}
                        onPlayButtonClick={this.launchLevel}></MainMenu>
                    <Levels levels={this.state.levels}></Levels>
                </div>
            );
        }
        else if (currentScreen === "game") {
            return <Game></Game>
        }
    }
}

export default App;