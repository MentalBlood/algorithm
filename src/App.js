import React, { Component } from 'react';
import './App.css';
import './Map.css';
import ColorLayer from './ColorLayer.js';
import ElementsLayer from './ElementsLayer.js';
import AvailableControls from './AvailableControls.js';
import Functions from './Functions.js';
import DraggingController from './DraggingController.js';

import levels from './levels.json';

const defaultLevelDescription = {
                "name": "Recursion",
                "controlsBinaryId": 565,
                "columns": 8,
                "rows": 8,
                "path": "n n n n n n n b n n n n n n n b n n n n n n n b n n n n n n n b n n n n n n n b n n n n n n n b n n n n n n n b g g g g g g g b",
                "angle": 0.5,
                "elements": "n n n n n n n f n n n n n n n n n n n n n n n n n n n n n n n n n n n n n n n n n n n n n n n n n n n n n n n n a n n n n n n s",
                "f1Len": 4,
                "f2Len": 0,
                "f1MinSol": "u_n r_b f1_g u_n",
                "f2MinSol": "",
                "f1StarSol": "u_n r_b f1_g u_n",
                "f2StarSol": ""
            };

function controlsListFromControlsBinaryId(controlsBinaryId) {
    let controlsList = [];
    const controllers = {
        'action-u': 1,
        'action-l': 2,
        'action-r': 4,
        'color-r': 8,
        'color-g': 16,
        'color-b': 32,
        'action-p-r': 64,
        'action-p-g': 128,
        'action-p-b': 256,
        'action-f-1': 512,
        'action-f-2': 1024
    };
    for (const controllerName in controllers)
        if (controlsBinaryId & controllers[controllerName])
            controlsList.push(controllerName);
    return controlsList;
}

function twoDimArrayFromColumnsAndString(columns, string) {
    let twoDimArray = []
    const splitedString = string.split(' ');
    const rows = splitedString.length / columns;
    for (let i = 0; i < rows; i++)
        twoDimArray.push(splitedString.slice(columns * i, columns * (i + 1)));
    twoDimArray = twoDimArray.reverse();
    return twoDimArray;
}

function elementCoordinatesFromColumnsAndElementsString(element, columns, elements) {
    const coordinates = {
        'x': undefined,
        'y': undefined
    };
    const splitedElements = elements.split(' ');
    for (let i = 0; i < splitedElements.length; i++) {
        const currentElement = splitedElements[i];
        if (currentElement === element) {
            coordinates.x = i % columns;
            const rows = splitedElements.length / columns;
            coordinates.y = rows - 1 - Math.floor(i / columns);
            break;
        }
    }
    return coordinates;
}

function commandDictFromCommandString(commandString, functionIndex, commandIndex) {
    let commandDict = undefined;
    const splitedCommandString = commandString.split('_');
    commandDict = {
        'action': splitedCommandString[0][0],
        'color': splitedCommandString[1],
        'functionIndex': functionIndex,
        'commandIndex': commandIndex
    };
    if (commandDict.action[0] === 'f') {
        commandDict.fNumber = Number.parseInt(splitedCommandString[0].substring(1));
        commandDict.action = 'f';
    }
    else if (commandDict.action[0] === 'p')
        commandDict.paintColor = splitedCommandString[0][1];
    return commandDict;
}

function commandsListFromCommandsString(commandsString, functionIndex) {
    if (commandsString.length === 0)
        return [];
    let commandsList = undefined;
    const commandsStringsList = commandsString.split(' ');
    commandsList = commandsStringsList.map(
        (commandString, commandIndex) => commandDictFromCommandString(commandString, functionIndex, commandIndex)
    );
    return commandsList;
}

function convertedAngle(angle) {
    return (angle - 0.5 + 2) % 2;
}

function solutionsFunctionsListFromLevelDescription(levelDescription, postfix) {
    let result = [];
    for (let functionNumber = 1; ; functionNumber++) {
        const propertyName = 'f' + functionNumber.toString() + postfix;
        if (propertyName in levelDescription)
            result.push(levelDescription[propertyName]);
        else
            break;
    }
    result = result.map(commandsListFromCommandsString);
    return result;
}

function minSolutionsFunctionsListFromLevelDescription(levelDescription) {
    return solutionsFunctionsListFromLevelDescription(levelDescription, 'MinSol');
}

function starSolutionsFunctionsListFromLevelDescription(levelDescription) {
    return solutionsFunctionsListFromLevelDescription(levelDescription, 'StarSol');
}

function getConvertedLevelDescription(levelDescription) {
    const convertedLevelDescription = {
        'name': levelDescription.name,
        'availableControls': controlsListFromControlsBinaryId(levelDescription.controlsBinaryId),
        'colors': twoDimArrayFromColumnsAndString(levelDescription.columns, levelDescription.path),
        'angle': convertedAngle(levelDescription.angle),
        'elements': twoDimArrayFromColumnsAndString(levelDescription.columns, levelDescription.elements),
        'arrowCoordinates': elementCoordinatesFromColumnsAndElementsString('a', levelDescription.columns, levelDescription.elements),
        'finishCoordinates': elementCoordinatesFromColumnsAndElementsString('f', levelDescription.columns, levelDescription.elements),
        'minSolution': minSolutionsFunctionsListFromLevelDescription(levelDescription),
        'starSolution': starSolutionsFunctionsListFromLevelDescription(levelDescription)
    };
    return convertedLevelDescription;
}

function emptyFunctionsListFromLevelDescription(levelDescription) {
    let result = [];
    for (let functionNumber = 1; ; functionNumber++) {
        const propertyName = 'f' + functionNumber.toString() + 'Len';
        if (propertyName in levelDescription) {
            const newEmptyFunctionLength = levelDescription[propertyName];
            if (newEmptyFunctionLength === 0)
                break;
            let newEmptyFunction = [];
            for (let commandIndex = 0; commandIndex < newEmptyFunctionLength; commandIndex++)
                newEmptyFunction.push({
                    color: 'n',
                    functionIndex: functionNumber - 1,
                    commandIndex: commandIndex
                });
            result.push(newEmptyFunction);
        }
        else
            break;
    }
    return result;
}

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            'initialLevelDescription': getConvertedLevelDescription(defaultLevelDescription),
            'stack': [],
            'stackPointerPosition': undefined,
            'functionsList': emptyFunctionsListFromLevelDescription(defaultLevelDescription),
            'evaluating': false,
            'testing': false,
            'mapWidth': undefined,
            'mapHeight': undefined,
            'draggingControllerType': undefined,
            'draggingControllerPosition': undefined
        }
        this.state.levelDescription = this.state.initialLevelDescription;

        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.onMouseDownOnAvailableControl = this.onMouseDownOnAvailableControl.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.processCurrentAlgorithm = this.processCurrentAlgorithm.bind(this);
        this.processStartButtonClick = this.processStartButtonClick.bind(this);
    }

    setLevel(levelDescription, functionToExecuteAfter) {
        console.log('set level', levelDescription.name);
        const convertedLevelDescription = getConvertedLevelDescription(levelDescription);
        this.setState(state => {
            state.initialLevelDescription = convertedLevelDescription;
            state.levelDescription = state.initialLevelDescription;
            state.functionsList = emptyFunctionsListFromLevelDescription(levelDescription);
            return state;
        }, functionToExecuteAfter);
    }

    isCellPassable(x, y) {
        const row = this.state.levelDescription.colors[y];
        if (row === undefined)
            return false;
        const cell = row[x];
        if (cell === undefined)
            return false;
        if (cell === 'n')
            return false;
        return true;
    }

    canMove(direction) {
        if (direction === 'l' || direction === 'r')
            return true;
        if (direction === 'u') {
            const x = this.state.levelDescription.arrowCoordinates.x;
            const y = this.state.levelDescription.arrowCoordinates.y;
            const angle = this.state.levelDescription.angle;
            return  (angle === 0 && this.isCellPassable(x + 1, y)) ||
                    (angle === 0.5 && this.isCellPassable(x, y - 1)) ||
                    (angle === 1 && this.isCellPassable(x - 1, y)) ||
                    (angle === 1.5 && this.isCellPassable(x, y + 1));
        }
        return null;
    }

    turn(direction) {
        const currentAngle = this.state.levelDescription.angle;
        let newAngle = undefined;
        if (direction === 'l') {
            if (currentAngle === 1.5)
                newAngle = 0;
            else
                newAngle = currentAngle + 0.5;
        }
        else if (direction === 'r') {
            if (currentAngle === 0)
                newAngle = 1.5;
            else
                newAngle = currentAngle - 0.5;
        }
        let newState = this.state;
        newState.levelDescription.angle = newAngle;
        return newState;
    }

    move(direction) {
        let newState = this.state;
        if (direction === 'l' || direction === 'r')
            newState = this.turn(direction);
        else if (direction === 'u') {
            const newArrowCoordinates = {
                'x': this.state.levelDescription.arrowCoordinates.x,
                'y': this.state.levelDescription.arrowCoordinates.y
            };
            if (this.state.levelDescription.angle === 0)
                newArrowCoordinates.x = this.state.levelDescription.arrowCoordinates.x + 1;
            else if (this.state.levelDescription.angle === 0.5)
                newArrowCoordinates.y = this.state.levelDescription.arrowCoordinates.y - 1;
            else if (this.state.levelDescription.angle === 1)
                newArrowCoordinates.x = this.state.levelDescription.arrowCoordinates.x - 1;
            else if (this.state.levelDescription.angle === 1.5)
                newArrowCoordinates.y = this.state.levelDescription.arrowCoordinates.y + 1;

            const oldArrowCoordinates = this.state.levelDescription.arrowCoordinates;
            newState.levelDescription.elements[oldArrowCoordinates.y][oldArrowCoordinates.x] = 'n';
            newState.levelDescription.elements[newArrowCoordinates.y][newArrowCoordinates.x] = 'a';
            newState.levelDescription.arrowCoordinates = newArrowCoordinates;
        }
        return newState;
    }

    tryMove(direction) {
        if (this.canMove(direction)) {
            return this.move(direction);
        }
        console.log('fucked');
        return this.state;
    }

    processMinSolution() {
        this.setAlgorithm(this.state.levelDescription.minSolution);
        this.processCurrentAlgorithm();
    }

    processStarSolution() {
        this.setAlgorithm(this.state.levelDescription.starSolution);
        this.processCurrentAlgorithm();
    }

    test() {
        let testingLevelsList = [];
        for (const [levelPackNumber, levelPack] of Object.entries(levels)) {
            for (const [levelNumber, level] of Object.entries(levelPack.levels)) {
                testingLevelsList.push(level);
            }
        }
        const firstLevel = testingLevelsList[0];
        this.setState(state => ({testing: true, testingLevelsList: testingLevelsList.reverse()}));
        this.setLevel(firstLevel, () => {this.processStarSolution()});
    }

    testNextLevelInTestingList() {
        const oldTestingList = this.state.testingLevelsList;
        const newTestingList = this.state.testingLevelsList.slice(1);
        const nextLevel = newTestingList[0];
        if (oldTestingList.length <= 1)
            this.setState(state => {
                state.testing = false;
                return state;
            });
        else {
            this.setState(state => {
                state.testingLevelsList = newTestingList;
            });
            this.setLevel(nextLevel);
            this.processStarSolution();
        }
    }

    handleKeyPress(event) {
        const key = event.key;
        if (key === 'a')
            this.processStarSolution();
        else if (key === 't')
            this.test();
        else
            this.tryMove(key);
    }

    commandCondition(command) {
        const x = this.state.levelDescription.arrowCoordinates.x;
        const y = this.state.levelDescription.arrowCoordinates.y;
        const color = this.state.levelDescription.colors[y][x];
        return (command.color === color) || (command.color === 'n');
    }

    replaceElement(target, source, index) {
        let result = [];
        result = result.concat(target.slice(0, index));
        result = result.concat(source);
        result = result.concat(target.slice(index + 1));
        return result;
    }

    finishReached() {
        const x = this.state.levelDescription.arrowCoordinates.x;
        const y = this.state.levelDescription.arrowCoordinates.y;
        const finishCoordinates = this.state.levelDescription.finishCoordinates;
        return (x === finishCoordinates.x) && (y === finishCoordinates.y);
    }

    paintArrowCell(color) {
        let newState = this.state;
        const x = this.state.levelDescription.arrowCoordinates.x;
        const y = this.state.levelDescription.arrowCoordinates.y;
        newState.levelDescription.colors[y][x] = color;
        return newState;
    }

    componentDidUpdate(prevProps, prevState) {
        const stack = this.state.stack;
        const evaluating = this.state.evaluating;
        console.log('componentDidUpdate', evaluating);
        if (evaluating && !(this.state.timeout === true)) {
            const pointerPosition = this.state.stackPointerPosition;
            const command = stack[pointerPosition];
            const functionsList = this.state.functionsList;
            //console.log(this.state.levelDescription.arrowCoordinates, stack, pointerPosition, command);
            let newStack = stack;
            let newPointerPosition = pointerPosition + 1;
            let newState = this.state;
            let newTesting = this.state.testing;
            let newEvaluating = evaluating;
            if (this.finishReached()) {
                console.log('finish reached');
                newEvaluating = false;
                newStack = [];
                newPointerPosition = undefined;
            } else if (pointerPosition === stack.length) {
                console.log('end of algorithm reached');
                this.setState(state => ({stack: [], evaluating: false, pointerPosition: undefined}));
                return;
            }
            else
                if ((command.action !== undefined) && (this.commandCondition(command) === true)) {
                    if (command.action === 'f') {
                        newStack = this.replaceElement(stack, functionsList[command.fNumber - 1], pointerPosition);
                        newPointerPosition = pointerPosition;
                    }
                    else if (command.action[0] === 'p')
                        newState = this.paintArrowCell(command.paintColor);
                    else
                        newState = this.tryMove(command.action);
                }
            this.setState({timeout: true});
            setTimeout(() => {
                this.setState(state => {
                    console.log(newPointerPosition, 'setState in timeout');
                    newState.stack = newStack;
                    newState.stackPointerPosition = newPointerPosition;
                    newState.testing = newTesting;
                    newState.evaluating = state.evaluating ? newEvaluating : false;
                    newState.timeout = undefined;
                    return newState;
                });
                if (newTesting && (newStack.length === 0))
                    this.testNextLevelInTestingList();
            }, 200);
        }
    }

    processCurrentAlgorithm() {
        this.setState(state => ({evaluating: true, stackPointerPosition: 0, stack: state.functionsList[0]}));
    }

    setAlgorithm(functionsList) {
        this.setState((state) => {
            for (let functionNumber = 0; functionNumber < state.functionsList.length; functionNumber++)
                for (let commandNumber = 0; commandNumber < state.functionsList[functionNumber].length; commandNumber++) {
                    const newFunction = functionsList[functionNumber][commandNumber];
                    state.functionsList[functionNumber][commandNumber] = (newFunction === undefined) ? {} : newFunction;
                }
            return {functionsList: state.functionsList};
        });
    }

    componentDidMount() {
    }
    componentWillUnmount() {
    }

    onMouseDownOnAvailableControl(event, controllerType) {
        if (this.state.evaluating)
            return;
        console.log('picked');
        const mouseX = event.pageX;
        const mouseY = event.pageY;
        this.setState(state => ({
            draggingControllerPosition: {x: mouseX, y: mouseY},
            draggingControllerType: controllerType
        }));
    }

    onMouseMove(event) {
        if (this.state.draggingControllerType === undefined)
            return;
        const mouseX = event.pageX;
        const mouseY = event.pageY;
        this.setState(state => ({draggingControllerPosition: {x: mouseX, y: mouseY}}));
    }

    onMouseUp(event) {
        if (this.state.draggingControllerType === undefined)
            return;
        console.log('droped');
        const mouseX = event.pageX;
        const mouseY = event.pageY;
        const DraggingControlElement = document.getElementById('DraggingController');
        DraggingControlElement.hidden = true;
        const elementUnderCursor = document.elementFromPoint(mouseX, mouseY);
        DraggingControlElement.hidden = false;
        if (elementUnderCursor.classList.contains('functionCell')) {
            const rowIndex = elementUnderCursor.getAttribute('rowindex');
            const cellIndex = elementUnderCursor.getAttribute('cellindex');
            console.log(rowIndex, cellIndex);
            const splitedDraggingControllerType = this.state.draggingControllerType.split('-');
            const type = splitedDraggingControllerType[0];
            const parameter = splitedDraggingControllerType[1];
            const newCommandDiff = {};
            newCommandDiff[type] = parameter;
            if (type === 'action') {
                if (parameter === 'f')
                    newCommandDiff['fNumber'] = splitedDraggingControllerType[2];
                if (parameter === 'p')
                    newCommandDiff['paintColor'] = splitedDraggingControllerType[2];
            }

            this.setState(state => {
                const oldCommand = state.functionsList[rowIndex][cellIndex];
                const newCommand = Object.assign(oldCommand, newCommandDiff);
                state.functionsList[rowIndex][cellIndex] = newCommand;
                return {functionsList: state.functionsList};
            });
            console.log(elementUnderCursor);
        }
        this.setState(state => ({draggingControllerType: undefined}));
    }

    processStartButtonClick() {
        console.log('processStartButtonClick', this.state.evaluating);
        if (this.state.evaluating === false) {
            if (this.state.stack.length === 0)
                this.processCurrentAlgorithm();
            else
                setTimeout(() => this.setState({evaluating: true}), 200);
        }
        else 
            setTimeout(() => this.setState({evaluating: false}), 200);
    }

    render() {
        const colors = this.state.levelDescription.colors;
        const elements = this.state.levelDescription.elements;
        const angle = this.state.levelDescription.angle;
        const controlsList = this.state.levelDescription.availableControls;
        const functionsList = this.state.functionsList;
        const draggingControllerType = this.state.draggingControllerType;
        const draggingControllerPosition = this.state.draggingControllerPosition;
        const startButtonText = this.state.evaluating === false ? 'Start' : 'Pause';
        const processStartButtonClick = this.processStartButtonClick;

        const stack = this.state.stack;
        const pointerPosition = this.state.stackPointerPosition;
        const command = stack[pointerPosition];
        const pointerFunctionIndex = command === undefined ? undefined : command.functionIndex;
        const pointerCommandIndex = command === undefined ? undefined : command.commandIndex;

        const maxMapWidth = 80 * window.innerWidth / 100;
        const maxMapHeight = 60 * window.innerHeight / 100;
        const dimension = 'px';

        const rowsNumber = colors.length;
        const columnsNumber = colors[0].length;
        const cellSize = Math.min(maxMapWidth / columnsNumber, maxMapHeight / rowsNumber);

        const mapWidth = cellSize * columnsNumber + dimension;
        const mapHeight = cellSize * rowsNumber + dimension;

        return (
            <div className="App" onKeyDown={this.handleKeyPress} onMouseUp={this.onMouseUp} onMouseMove={this.onMouseMove} tabIndex={-1}>
                <div className="Map" style={{width: mapWidth, height: mapHeight}}>
                    <ColorLayer colors={colors} mapWidth={mapWidth} mapHeight={mapHeight}></ColorLayer>
                    <ElementsLayer elements={elements} angle={angle} mapWidth={mapWidth} mapHeight={mapHeight}></ElementsLayer>
                </div>
                <div className="ControlsPanel">
                    <AvailableControls controlsList={controlsList}
                        onMouseDown={this.onMouseDownOnAvailableControl}></AvailableControls>
                    <Functions functionsList={functionsList} pointerFunctionIndex={pointerFunctionIndex}
                        pointerCommandIndex={pointerCommandIndex}></Functions>
                    <DraggingController type={draggingControllerType} position={draggingControllerPosition}></DraggingController>
                    <button onClick={processStartButtonClick}>{startButtonText}</button>
                </div>
            </div>
        );
    }
}

export default App;