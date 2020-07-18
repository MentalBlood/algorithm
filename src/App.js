import React, {Component} from 'react';
import './App.css';
import getSvgCircle from './paintFunctions.js';
import levels from './levels.json';
import MainMenu from './MainMenu.js';
import Levels from './Levels.js';
import Game from './Game.js';
import {uploadFile, downloadFile} from './uploadDownload.js';

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            levels: levels,
            statistics: {},
            currentLevelNumber: 1,
            currentLevelPack: 0,
            currentScreen: "main"
        };
        this.launchLevel = this.launchLevel.bind(this);
        this.launchNextLevel = this.launchNextLevel.bind(this);
        this.getCurrentLevel = this.getCurrentLevel.bind(this);
        this.closeLevel = this.closeLevel.bind(this);
        this.load = this.load.bind(this);
        this.save = this.save.bind(this);
        this.getLevelAchivments = this.getLevelAchivments.bind(this);
        this.setLevelAchivments = this.setLevelAchivments.bind(this);
        this.restartLevel = this.restartLevel.bind(this);
        this.launchCurrentLevel = this.launchCurrentLevel.bind(this);
        this.packAchivmentsGot = this.packAchivmentsGot.bind(this);
        this.packAchivmentsMax = this.packAchivmentsMax.bind(this);
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
            currentLevelPack: levelPack,
            currentLevelNumber: levelNumber
        }));
    }

    launchCurrentLevel() {
        const currentLevelPack = this.state.currentLevelPack;
        const currentLevelNumber = this.state.currentLevelNumber;
        this.launchLevel(currentLevelPack, currentLevelNumber);
    }

    restartLevel(achivmentsBinary) {
        const currentLevelPack = this.state.currentLevelPack;
        const currentLevelNumber = this.state.currentLevelNumber;
        this.setLevelAchivments(currentLevelPack, currentLevelNumber, achivmentsBinary);
        this.setState(state => ({
            currentScreen: "game"
        }));
    }

    launchNextLevel(achivmentsBinary) {
        const currentLevelNumber = this.state.currentLevelNumber;
        const currentLevelPack = this.state.currentLevelPack;
        this.setLevelAchivments(currentLevelPack, currentLevelNumber, achivmentsBinary);
        let nextLevelNumber = currentLevelNumber + 1;
        let nextLevelPack = currentLevelPack;
        if (this.state.levels[nextLevelPack].levels[nextLevelNumber-1] === undefined) {
            nextLevelNumber = 1;
            nextLevelPack = currentLevelPack + 1;
            if (this.state.levels[nextLevelPack] === undefined)
                nextLevelPack = 0;
        }
        this.setState({
            currentLevelNumber: nextLevelNumber,
            currentLevelPack: nextLevelPack,
            currentScreen: "game"
        });
    }

    getSaveData() {
        return {
            currentLevelNumber: this.state.currentLevelNumber,
            currentLevelPack: this.state.currentLevelPack,
            statistics: this.state.statistics
        };
    }

    setSaveData(data) {
        this.setState(data);
    }

    closeLevel() {
        this.setState({currentScreen: "main"});
    }

    load() {
        uploadFile('json', jsonText => {
            const json = JSON.parse(jsonText);
            this.setSaveData(json);
        });
    }

    save() {
        const saveData = this.getSaveData();
        const saveDataText = JSON.stringify(saveData);
        const today = new Date();
        const currentDate = today.getFullYear().toString()
            + '-' + (today.getMonth() + 1).toString()
            + '-' + today.getDate().toString();
        const currentTime = today.getHours()
            + ":" + today.getMinutes()
            + ":" + today.getSeconds();
        downloadFile('algorithm-save'
            + '-' + currentDate
            + '-' + currentTime
            + '.json', saveDataText);
    }

    getLevelAchivments(levelNumber, levelPack) {
        const statistics = this.state.statistics;
        if (statistics[levelPack] === undefined)
            return [false, false, false];
        if (statistics[levelPack][levelNumber] === undefined)
            return [false, false, false];
        return statistics[levelPack][levelNumber];
    }

    setLevelAchivments(levelPack, levelNumber, achivments) {
        this.setState(state => {
            const newAchivments = achivments;
            if (state.statistics[levelPack] === undefined)
                state.statistics[levelPack] = {};
            if (state.statistics[levelPack][levelNumber] !== undefined)
                for (let i = 0; i < newAchivments.length; i++) {
                    if ((newAchivments[i] === false)
                        && (state.statistics[levelPack][levelNumber][i] === true))
                        newAchivments[i] = true;
                }
            state.statistics[levelPack][levelNumber] = newAchivments;
            return {statistics: state.statistics};
        });
    }

    packAchivmentsGot(packIndex) {
        let result = 0;
        const packStatistics = this.state.statistics[packIndex];
        if (packStatistics !== undefined) {
            for (const levelStatistics of Object.values(packStatistics))
                result += levelStatistics.filter(achivmentGot => achivmentGot === true).length;
        }
        return result;
    }

    packAchivmentsMax(packIndex) {
        const pack = this.state.levels[packIndex];
        const numberOfLevelsInPack = Object.values(pack.levels).length;
        return numberOfLevelsInPack * 3;
    }

    render() {
        const currentScreen = this.state.currentScreen;
        const statistics = this.state.statistics;
        if (currentScreen === "main") {
            const currentLevelPackColor = this.getCurrentLevelPackColor();
            const currentLevelNumber = this.state.currentLevelNumber;

            return (
                <div className="app">
                    <MainMenu lastLevelNumber={currentLevelNumber}
                        lastLevelPackColor={currentLevelPackColor}
                        onPlayButtonClick={this.launchCurrentLevel}
                        loadFunction={this.load}
                        saveFunction={this.save}></MainMenu>
                    <Levels levels={this.state.levels}
                        launchLevelFunction={this.launchLevel}
                        getLevelAchivments={this.getLevelAchivments}
                        packAchivmentsMax={this.packAchivmentsMax}
                        packAchivmentsGot={this.packAchivmentsGot}></Levels>
                </div>
            );
        }
        else if (currentScreen === "game") {
            const level = this.getCurrentLevel();
            return <Game key={level.name + " " + Date.now().toString()} level={level}
                       backToMenuFunction={this.closeLevel}
                       nextLevelFunction={this.launchNextLevel}
                       restartLevelFunction={this.restartLevel}
                       reportAchivmentsFunction={this.setLevelAchivments}></Game>
        }
    }
}

export default App;