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
                "name": "Casket",
                "controlsBinaryId": 1583,
                "columns": 11,
                "rows": 9,
                "path": "g n n n n n n n n n g g n n n n n n n n n g b g g r b g b r g g b g n n n n n n n n n g g n n n n b n n n n g g n n n n r n n n n g b g g g n g n g r g b n n n r n g n g n n n n n n b g b g b n n n",
                "angle": 1.0,
                "elements": "f n n n n n n n n n a n n n n n n n n n n n n n n n s n s n n n n n n n n n n n n n n n n n n n n s n n n n n n n n n n n n n n n n n n n n n n n n n n n n n n n n n n n n n n n n n n n n n n n n n",
                "f1Len": 4,
                "f2Len": 4,
                "f1MinSol": "u_n l_b f2_r f1_n",
                "f2MinSol": "u_n u_b u_n",
                "f1StarSol": "u_n l_b f2_r f1_n",
                "f2StarSol": "u_n r_n r_b u_n"
            };

let testingLevelsList = [];
for (const [levelPackNumber, levelPack] of Object.entries(levels)) {
    for (const [levelNumber, level] of Object.entries(levelPack.levels)) {
        testingLevelsList.push(level);
    }
}

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

function deepCopy(inObject) {
    let outObject, value, key;
    if (typeof inObject !== "object" || inObject === null)
        return inObject;
    outObject = Array.isArray(inObject) ? [] : {};
    for (key in inObject) {
        value = inObject[key];
        outObject[key] = deepCopy(value);
    }
    return outObject;
}

function getConvertedLevelDescription(levelDescription) {
    const levelDescriptionCopy = deepCopy(levelDescription);
    const convertedLevelDescription = {
        'name': levelDescriptionCopy.name,
        'availableControls': controlsListFromControlsBinaryId(levelDescriptionCopy.controlsBinaryId),
        'colors': twoDimArrayFromColumnsAndString(levelDescriptionCopy.columns, levelDescriptionCopy.path),
        'angle': convertedAngle(levelDescriptionCopy.angle),
        'elements': twoDimArrayFromColumnsAndString(levelDescriptionCopy.columns, levelDescriptionCopy.elements),
        'arrowCoordinates': elementCoordinatesFromColumnsAndElementsString('a', levelDescriptionCopy.columns, levelDescriptionCopy.elements),
        'finishCoordinates': elementCoordinatesFromColumnsAndElementsString('f', levelDescriptionCopy.columns, levelDescriptionCopy.elements),
        'minSolution': minSolutionsFunctionsListFromLevelDescription(levelDescriptionCopy),
        'starSolution': starSolutionsFunctionsListFromLevelDescription(levelDescriptionCopy)
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
            'speed': 0,
            'testing': false,
            'mapWidth': undefined,
            'mapHeight': undefined,
            'draggingControllerType': undefined,
            'draggingControllerPosition': undefined,
            'timersIds': []
        }
        this.state.levelDescription = deepCopy(this.state.initialLevelDescription);

        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.onMouseDownOnAvailableControl = this.onMouseDownOnAvailableControl.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.loadCurrentAlgorithmToStack = this.loadCurrentAlgorithmToStack.bind(this);
        this.speedRangeOnInput = this.speedRangeOnInput.bind(this);
        this.onMouseDownOnFunctionCell = this.onMouseDownOnFunctionCell.bind(this);
    }

    setLevel(levelDescription, functionToExecuteAfter) {
        console.log('set level', levelDescription.name);
        const convertedLevelDescription = getConvertedLevelDescription(levelDescription);
        this.setState(state => {
            state.initialLevelDescription = convertedLevelDescription;
            state.levelDescription = deepCopy(state.initialLevelDescription);
            state.functionsList = emptyFunctionsListFromLevelDescription(levelDescription);
            return state;
        }, functionToExecuteAfter);
    }

    resetCurrentLevel() {
        console.log('reset level');
        this.setState(state => {
            state.timersIds.forEach(clearTimeout);
            return {
                levelDescription: deepCopy(state.initialLevelDescription),
                stack: [],
                stackPointerPosition: undefined,
                timersIds: []
            };
        });
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
        else {
            this.resetCurrentLevel();
            return false;
        }
    }

    loadCurrentAlgorithmToStack() {
        console.log('loadCurrentAlgorithmToStack');
        console.log(this.state.functionsList[0]);
        this.setState(state => ({stackPointerPosition: 0, stack: state.functionsList[0]}));
    }

    processMinSolution() {
        this.setAlgorithm(this.state.levelDescription.minSolution);
    }

    processStarSolution() {
        this.setAlgorithm(this.state.levelDescription.starSolution);
    }

    handleKeyPress(event) {
        const key = event.key;
        if (key === 'a')
            this.processStarSolution();
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

    clearTimers() {
        this.setState(state => {
            state.timersIds.forEach(clearTimeout);
            return {timersIds: []};
        });
    }

    componentDidUpdate(prevProps, prevState) {
        const stack = this.state.stack;
        const stackIsEmpty = (stack.length === 0);
        if (stackIsEmpty)
            return;
        const speed = Number.parseFloat(this.state.speed);
        const evaluating = (speed > 0);
        if (!(evaluating))
            return;
        const pointerPosition = this.state.stackPointerPosition;
        const algorithmEnded = (pointerPosition === stack.length);
        if (algorithmEnded) {
            this.resetCurrentLevel();
            return;
        }
        const timersIds = this.state.timersIds;
        const waitingForSetState = (timersIds.length > 0);
        if (waitingForSetState)
            return;
        if (this.finishReached()) {
            this.resetCurrentLevel();
            return;
        }

        const command = stack[pointerPosition];
        const functionsList = this.state.functionsList;
        let newStack = stack;
        let newPointerPosition = pointerPosition + 1;
        let newState = this.state;
        let newTesting = this.state.testing;
        if ((command.action !== undefined) && (this.commandCondition(command) === true)) {
            if (command.action === 'f') {
                newStack = this.replaceElement(stack, functionsList[command.fNumber - 1], pointerPosition);
                newPointerPosition = pointerPosition;
            }
            else if (command.action[0] === 'p')
                newState = this.paintArrowCell(command.paintColor);
            else {
                newState = this.tryMove(command.action);
                if (newState === false)
                    return;
            }
        }
        const delay = 1000 / ((speed + 1) * (speed + 1));
        const timerId = setTimeout(() => {
            if (this.state.speed === 0)
                this.clearTimers();
            else
                this.setState(state => {
                    newState.stack = newStack;
                    newState.stackPointerPosition = newPointerPosition;
                    newState.testing = newTesting;
                    const indexOfThisTimerId = newState.timersIds.indexOf(timerId)
                    if (indexOfThisTimerId > -1) {
                        newState.timersIds.splice(indexOfThisTimerId, 1);
                    }
                    newState.speed = state.speed;
                    return newState;
                });
        }, delay);
        this.setState(state => {
            if (state.timersIds.indexOf(timerId) === -1) {
                return {timersIds: state.timersIds.concat([timerId])};
            }
        });
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

    onMouseDownOnAvailableControl(event, controllerType) {
        if (this.state.speed > 0)
            return;
        const mouseX = event.pageX;
        const mouseY = event.pageY;
        this.setState(state => ({
            draggingControllerPosition: {x: mouseX, y: mouseY},
            draggingControllerType: controllerType
        }));
    }

    onMouseDownOnFunctionCell(event) {
        const cellElement = event.target;
        const functionIndex = cellElement.getAttribute('rowindex');
        const commandIndex = cellElement.getAttribute('cellIndex');
        const cellCommand = this.state.functionsList[functionIndex][commandIndex];
        const mouseX = event.pageX;
        const mouseY = event.pageY;
        if (cellCommand.action !== undefined) {
            const action = cellCommand.action;
            let controllerType = 'action-' + action;
            if (action === 'f')
                controllerType += '-' + cellCommand.fNumber.toString();
            else if (action === 'p')
                controllerType += '-' + cellCommand.paintColor;
            this.setState(state => {
                const newFunctionsList = state.functionsList;
                newFunctionsList[functionIndex][commandIndex].action = undefined;
                return {
                    functionsList: newFunctionsList,
                    draggingControllerPosition: {x: mouseX, y: mouseY},
                    draggingControllerType: controllerType
                };
            });
        }
        else if (cellCommand.color !== 'n') {
            const color = cellCommand.color;
            const controllerType = 'color-' + color;
            this.setState(state => {
                const newFunctionsList = state.functionsList;
                newFunctionsList[functionIndex][commandIndex].color = 'n';
                return {
                    functionsList: newFunctionsList,
                    draggingControllerPosition: {x: mouseX, y: mouseY},
                    draggingControllerType: controllerType
                };
            });
        }
    }

    onMouseMove(event) {
        if (this.state.draggingControllerType === undefined)
            return;
        const mouseX = event.pageX;
        const mouseY = event.pageY;
        this.setState(state => ({draggingControllerPosition: {x: mouseX, y: mouseY}}));
    }

    onMouseUp(event) {
        if (this.state.speed > 0) {
            this.setState({speed: 0, stack: [], pointerPosition: undefined});
            this.resetCurrentLevel();
        }

        if (this.state.draggingControllerType === undefined)
            return;
        const mouseX = event.pageX;
        const mouseY = event.pageY;
        const DraggingControlElement = document.getElementById('DraggingController');
        DraggingControlElement.hidden = true;
        const elementUnderCursor = document.elementFromPoint(mouseX, mouseY);
        DraggingControlElement.hidden = false;
        if (elementUnderCursor.classList.contains('functionCell')) {
            const rowIndex = elementUnderCursor.getAttribute('rowindex');
            const cellIndex = elementUnderCursor.getAttribute('cellindex');
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
        }
        this.setState(state => ({draggingControllerType: undefined}));
    }

    speedRangeOnInput(event) {
        const stack = this.state.stack;
        const stackIsEmpty = (stack.length === 0);
        if (stackIsEmpty) {
            this.resetCurrentLevel();
            this.loadCurrentAlgorithmToStack();
        }
        this.setState({speed: event.target.value});
    }

    refreshMapSize() {
        const colors = this.state.levelDescription.colors;
        const maxMapWidth = 80 * window.innerWidth / 100;
        const maxMapHeight = 60 * window.innerHeight / 100;
        const dimension = 'px';

        const rowsNumber = colors.length;
        const columnsNumber = colors[0].length;
        const cellSize = Math.min(maxMapWidth / columnsNumber, maxMapHeight / rowsNumber);

        const mapWidth = cellSize * columnsNumber + dimension;
        const mapHeight = cellSize * rowsNumber + dimension;

        this.setState({mapWidth: mapWidth, mapHeight: mapHeight})
    }

    componentDidMount() {
        window.addEventListener('resize', this.refreshMapSize.bind(this));
        this.refreshMapSize();
    }

    render() {
        const colors = this.state.levelDescription.colors;
        const elements = this.state.levelDescription.elements;
        const angle = this.state.levelDescription.angle;
        const controlsList = this.state.levelDescription.availableControls;
        const functionsList = this.state.functionsList;
        const draggingControllerType = this.state.draggingControllerType;
        const draggingControllerPosition = this.state.draggingControllerPosition;
        const speedRangeOnInput = this.speedRangeOnInput;
        const speed = this.state.speed;
        const onMouseDownOnFunctionCell = this.onMouseDownOnFunctionCell;

        const stack = this.state.stack;
        const pointerPosition = this.state.stackPointerPosition;
        const command = stack[pointerPosition];
        const pointerFunctionIndex = command === undefined ? undefined : command.functionIndex;
        const pointerCommandIndex = command === undefined ? undefined : command.commandIndex;

        const mapWidth = this.state.mapWidth;
        const mapHeight = this.state.mapHeight;

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
                        pointerCommandIndex={pointerCommandIndex} onMouseDownOnFunctionCell={onMouseDownOnFunctionCell}></Functions>
                    <DraggingController type={draggingControllerType} position={draggingControllerPosition}></DraggingController>
                    <input className="speedRange" type="range" min="0" max="7" step="0.1"
                        value={speed} onChange={speedRangeOnInput}/>
                </div>
            </div>
        );
    }
}

export default App;