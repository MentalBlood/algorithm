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
        this.launchNextLevel = this.launchNextLevel.bind(this);
        this.getCurrentLevel = this.getCurrentLevel.bind(this);
        this.closeLevel = this.closeLevel.bind(this);
    }

    getCurrentLevelPackColor() {
        const currentLevelPack = this.state.currentLevelPack;
        return this.state.levels[currentLevelPack].color;
    }

    getCurrentLevel() {
        const currentLevelPack = this.state.currentLevelPack;
        const currentLevelNumber = this.state.currentLevelNumber;
        return this.state.levels[currentLevelPack].levels[currentLevelNumber-1];
    }

    launchLevel(levelPack, levelNumber) {
        this.setState(state => ({
            currentScreen: "game",
            currentLevelPack: levelPack === undefined ? state.currentLevelPack : levelPack,
            currentLevelNumber: levelNumber === undefined ? state.currentLevelNumber : levelNumber
        }));
    }

    launchNextLevel() {
        const currentLevelNumber = this.state.currentLevelNumber;
        const currentLevelPack = this.state.currentLevelPack;
        let nextLevelNumber = currentLevelNumber + 1;
        let nextLevelPack = currentLevelPack;
        if (this.state.levels[nextLevelPack].levels[nextLevelNumber-1] === undefined) {
            nextLevelNumber = 1;
            nextLevelPack = currentLevelPack + 1;
            if (this.state.levels[nextLevelPack] === undefined)
                nextLevelPack = 1;
        }
        this.setState({
            currentLevelNumber: nextLevelNumber,
            currentLevelPack: nextLevelPack,
            currentScreen: "game"
        });
    }

    closeLevel() {
        this.setState({currentScreen: "main"});
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
                    <Levels levels={this.state.levels} launchLevelFunction={this.launchLevel}></Levels>
                </div>
            );
        }
        else if (currentScreen === "game") {
            const level = this.getCurrentLevel();
            return <Game key={level.name + " " + Date.now().toString()} level={level}
                       backToMenuFunction={this.closeLevel}
                       nextLevelFunction={this.launchNextLevel}
                       restartLevelFunction={this.launchLevel}></Game>
        }
    }
}

export default App;