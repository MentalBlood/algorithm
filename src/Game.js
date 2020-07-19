import React, { Component } from 'react';
import './Game.css';
import './Map.css';
import ColorLayer from './ColorLayer.js';
import ElementsLayer from './ElementsLayer.js';
import AvailableControls from './AvailableControls.js';
import Functions from './Functions.js';
import DraggingController from './DraggingController.js';
import ModalWindow from './ModalWindow.js';
import levels from './levels.json';
import {downloadFile} from './uploadDownload.js';

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

function convertedAngle(angle) {
    return (angle - 0.5 + 2) % 2;
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

function getMinSolutionFunctionsLengths(levelDescription) {
    const result = [];
    for (let functionNumber = 1; ; functionNumber++) {
        const propertyName = 'f' + functionNumber.toString() + "MinSol";
        if (propertyName in levelDescription) {
            const currentFunction = levelDescription[propertyName];
            if (currentFunction.length === 0)
                result.push(0);
            else
                result.push(currentFunction.split(" ").length);
        }
        else
            break;
    }
    return result;
}

function getConvertedLevelDescription(levelDescription) {
    const levelDescriptionCopy = deepCopy(levelDescription);
    const convertedLevelDescription = {
        name: levelDescriptionCopy.name,
        availableControls: controlsListFromControlsBinaryId(levelDescriptionCopy.controlsBinaryId),
        colors: twoDimArrayFromColumnsAndString(levelDescriptionCopy.columns, levelDescriptionCopy.path),
        angle: convertedAngle(levelDescriptionCopy.angle),
        elements: twoDimArrayFromColumnsAndString(levelDescriptionCopy.columns, levelDescriptionCopy.elements),
        arrowCoordinates: elementCoordinatesFromColumnsAndElementsString('a', levelDescriptionCopy.columns, levelDescriptionCopy.elements),
        finishCoordinates: elementCoordinatesFromColumnsAndElementsString('f', levelDescriptionCopy.columns, levelDescriptionCopy.elements),
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

class Game extends Component {
    constructor(props) {
        super(props);

        const level = props.level;
        const backToMenuFunction = props.backToMenuFunction;
        const nextLevelFunction = props.nextLevelFunction;
        const restartLevelFunction = props.restartLevelFunction;
        const reportAchivmentsFunction = props.reportAchivmentsFunction;

        const emptyFunctionsList = emptyFunctionsListFromLevelDescription(level);

        this.state = {
            backToMenuFunction: backToMenuFunction,
            restartLevelFunction: restartLevelFunction,
            reportAchivmentsFunction: reportAchivmentsFunction,
            nextLevelFunction: nextLevelFunction,
            initialLevelDescription: getConvertedLevelDescription(level),
            stack: [],
            stackPointerPosition: undefined,
            functionsList: emptyFunctionsList,
            speed: 0,
            testing: false,
            mapWidth: undefined,
            mapHeight: undefined,
            draggingControllerType: undefined,
            draggingControllerPosition: undefined,
            timersIds: [],
            finishReached: false,
            minSolutionFunctionsLengths: level.minSolutionFunctionsLengths
        }
        this.state.levelDescription = deepCopy(this.state.initialLevelDescription);

        this.onMouseDownOnAvailableControl = this.onMouseDownOnAvailableControl.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.loadCurrentAlgorithmToStack = this.loadCurrentAlgorithmToStack.bind(this);
        this.speedRangeOnInput = this.speedRangeOnInput.bind(this);
        this.onMouseDownOnFunctionCell = this.onMouseDownOnFunctionCell.bind(this);
        this.getAchivmentsBinary = this.getAchivmentsBinary.bind(this);
    }

    resetLevel() {
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

    resetFunctions() {
        this.setState(state => ({functionsList: deepCopy(state.emptyFunctionsList)}));
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
            this.resetLevel();
            return false;
        }
    }

    loadCurrentAlgorithmToStack() {
        this.setState(state => ({stackPointerPosition: 0, stack: state.functionsList[0]}));
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
        if (this.state.finishReached === true)
            return true;
        const x = this.state.levelDescription.arrowCoordinates.x;
        const y = this.state.levelDescription.arrowCoordinates.y;
        const finishCoordinates = this.state.levelDescription.finishCoordinates;
        const result = (x === finishCoordinates.x) && (y === finishCoordinates.y);
        if (result === true) {
            this.setState({finishReached: true});
        }
        return result;
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
            this.resetLevel();
            return;
        }
        const timersIds = this.state.timersIds;
        const waitingForSetState = (timersIds.length > 0);
        if (waitingForSetState)
            return;
        if (this.finishReached()) {
            if (this.state.timersIds.length > 0)
                this.clearTimers();
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

    onMouseDownOnAvailableControl(event, controllerType) {
        if (this.state.speed > 0)
            return;
        const mouseX = event.clientX !== undefined ? event.clientX : event.touches[0].clientX;
        const mouseY = event.clientY !== undefined ? event.clientY : event.touches[0].clientY;
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
        const mouseX = event.clientX !== undefined ? event.clientX : event.touches[0].clientX;
        const mouseY = event.clientY !== undefined ? event.clientY : event.touches[0].clientY;
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
        const mouseX = event.clientX !== undefined ? event.clientX : event.touches[0].clientX;
        const mouseY = event.clientY !== undefined ? event.clientY : event.touches[0].clientY;
        this.setState(state => ({draggingControllerPosition: {x: mouseX, y: mouseY}}));
    }

    onMouseUp(event) {
        this.setState({speed: 0, stack: [], stackPointerPosition: undefined});
        if (this.state.stackPointerPosition !== undefined)
            this.resetLevel();

        if (this.state.draggingControllerType === undefined)
            return;
        const mouseX = event.clientX !== undefined ? event.clientX : event.changedTouches[0].clientX;
        const mouseY = event.clientY !== undefined ? event.clientY : event.changedTouches[0].clientY;
        const DraggingControlElement = document.getElementById('draggingController');
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
            this.resetLevel();
            this.loadCurrentAlgorithmToStack();
        }
        this.setState({speed: event.target.value});
    }

    refreshMapSize() {
        const colors = this.state.levelDescription.colors;
        const maxMapWidth = 80 * window.innerWidth / 100;
        const maxMapHeight = 50 * window.innerHeight / 100;
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

    isAllStarsGathered() {
        const elements = this.state.levelDescription.elements;
        for (const row of elements)
            for (const element of row)
                if (element === 's')
                    return false;
        return true;
    }

    functionNotEmptyCellsNumber(someFunction) {
        let result = 0;
        for (const cell of someFunction)
            if (cell.action !== undefined)
                result += 1;
        return result;
    }

    isCurrentAlgorithmMinimal() {
        const minSolutionFunctionsLengths = this.state.minSolutionFunctionsLengths;
        const currentSolution = this.state.functionsList;
        for (let functionNumber = 0; functionNumber < minSolutionFunctionsLengths.length; functionNumber++)
            if (currentSolution[functionNumber] !== undefined)
                if (minSolutionFunctionsLengths[functionNumber] < this.functionNotEmptyCellsNumber(currentSolution[functionNumber]))
                    return false;
        return true;
    }

    getAchivments() {
        const achivments = {
            levelFinished: true,
            minSolutionFound: this.isCurrentAlgorithmMinimal(),
            allStarsGathered: this.isAllStarsGathered()
        }
        return achivments;
    }

    getAchivmentsBinary() {
        const achivments = this.getAchivments();
        return [
            achivments.levelFinished,
            achivments.minSolutionFound,
            achivments.allStarsGathered
        ];
    }

    getAchivmentsHtml() {
        const achivments = this.getAchivments();
        return (
            <div className="achivments">
                {
                    Object.entries(achivments).map(
                        achivment => {
                            const achivmentName = achivment[0];
                            const achivmentGot = achivment[1];
                            const className = "achivment" + " " + achivmentName;
                            return achivmentGot ?
                                <div key={achivmentName} className={className}></div>
                                :
                                null;
                        }
                    )
                }
            </div>
        );
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
        const minSolutionFunctionsLengths = this.state.minSolutionFunctionsLengths;
        const finishReached = this.state.finishReached === true;
        const onMouseDownOnFunctionCell = this.onMouseDownOnFunctionCell;
        const onMouseUp = finishReached ? null : this.onMouseUp;
        const onMouseMove = this.onMouseMove;
        const onMouseDownOnAvailableControl = this.onMouseDownOnAvailableControl;
        const onBackToMenuButtonClick = this.state.backToMenuFunction;
        const achivmentsBinary = finishReached ? this.getAchivmentsBinary() : null;
        const achivmentsGot = finishReached ? achivmentsBinary.filter(achivmentGot => achivmentGot === true).length : null;

        const stack = this.state.stack;
        const pointerPosition = this.state.stackPointerPosition;
        const command = stack[pointerPosition];
        const pointerFunctionIndex = command === undefined ? undefined : command.functionIndex;
        const pointerCommandIndex = command === undefined ? undefined : command.commandIndex;

        const mapWidth = this.state.mapWidth;
        const mapHeight = this.state.mapHeight;

        return (
            <div className="Game" onKeyDown={this.handleKeyPress}
                onMouseUp={onMouseUp} onTouchEnd={onMouseUp}
                onMouseMove={onMouseMove} onTouchMove={onMouseMove} tabIndex={-1}>
                <button className="backToMenuButton"
                    onClick={onBackToMenuButtonClick}></button>
                {
                    finishReached ?
                    <ModalWindow className="finishMenu"
                        closeFunction={event => null}>
                        <div className="verdict">
                            {
                                ["CONGRATULATIONS", "AWESOME", "AMAZING"][achivmentsGot-1]
                            }
                        </div>
                        {this.getAchivmentsHtml()}
                        <div className="buttons">
                            <button className="button restartButton"
                                onClick={event => this.state.restartLevelFunction(achivmentsBinary)}>Restart</button>
                            <button className="button nextButton"
                                onClick={event => this.state.nextLevelFunction(achivmentsBinary)}>Next</button>
                        </div>
                    </ModalWindow>
                    :
                    null
                }
                <div className="Map" style={{width: mapWidth, height: mapHeight}}>
                    <ColorLayer colors={colors} mapWidth={mapWidth} mapHeight={mapHeight}></ColorLayer>
                    <ElementsLayer elements={elements} angle={angle} mapWidth={mapWidth} mapHeight={mapHeight}></ElementsLayer>
                </div>
                <div className="ControlsPanel">
                    <AvailableControls controlsList={controlsList}
                        onMouseDown={onMouseDownOnAvailableControl}
                        onTouchStart={onMouseDownOnAvailableControl}></AvailableControls>
                    <Functions functionsList={functionsList} pointerFunctionIndex={pointerFunctionIndex}
                        pointerCommandIndex={pointerCommandIndex}
                        onMouseDownOnFunctionCell={onMouseDownOnFunctionCell}
                        onTouchStart={onMouseDownOnFunctionCell}
                        minSolutionFunctionsLengths={minSolutionFunctionsLengths}></Functions>
                    {
                        draggingControllerType === undefined ?
                        null
                        :
                        <DraggingController type={draggingControllerType} position={draggingControllerPosition}></DraggingController>
                    }
                    <input className="speedRange" type="range" min="0" max="7" step="0.1"
                        value={speed} onChange={speedRangeOnInput}/>
                </div>
            </div>
        );
    }
}

export default Game;