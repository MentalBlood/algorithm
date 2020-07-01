import React, { Component } from 'react';
import './Map.css';
import ColorLayer from './ColorLayer.js';
import ElementsLayer from './ElementsLayer.js';

/*
    anns
    nnnn
    nnnn
    nnnf

    rrrg
    nnnr
    nnnr
    nnnr
*/

const defaultLevelDescription = {
    'name': 'Angle',
    'controlsBinaryId': 531,
    'columns': 4,
    'rows': 4,
    'path': 'r r r g n n n r n n n r n n n r',
    'angle': 0.5,
    'elements': 'a n n s n n n n n n n n n n n f',
    'f1Len': 3,
    'f2Len': 0,
    'f1MinSol': 'u_n l_g f1_n',
    'f2MinSol': '',
    'f1StarSol': 'u_n l_g f1_n',
    'f2StarSol': ''
};

function controlsListFromControlsBinaryId(controlsBinaryId) {
    let controlsList = [];
    const controllers = {
        'up': 1,
        'left': 2,
        'right': 4,
        'red': 8,
        'green': 16,
        'blue': 32,
        'painter_red': 64,
        'painter_green': 128,
        'painter_blue': 256,
        'f1': 512,
        'f2': 1024
    };
    for (const controllerName in controllers)
        if (controlsBinaryId & controllers[controllerName] === 1)
            controlsList.push(controllerName);
    return controlsList;
}

function twoDimArrayFromColumnsAndString(columns, string) {
    let twoDimArray = []
    const splitedString = string.split(' ');
    const rows = splitedString.length / columns;
    for (let i = 0; i < rows; i++)
        twoDimArray.push(splitedString.slice(4 * i, 4 * (i + 1)));
    return twoDimArray.reverse();
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

function commandDictFromCommandString(commandString) {
    let commandDict = undefined;
    const splitedCommandString = commandString.split('_');
    commandDict = {
        'action': splitedCommandString[0],
        'color': splitedCommandString[1]
    };
    if (commandDict.action[0] === 'f') {
        commandDict.fNumber = commandDict.action.substr(1);
        commandDict.action = 'f';
    }
    return commandDict;
}

function commandsListFromCommandsString(commandsString) {
    let commandsList = undefined;
    const commandsStringsList = commandsString.split(' ');
    commandsList = commandsStringsList.map(commandDictFromCommandString);
    return commandsList;
}

function convertedAngle(angle) {
    return (-angle + 0.5 + 2) % 2;
}

function getConvertedLevelDescription(levelDescription) {
    const convertedLevelDescription = {
        'name': levelDescription.name,
        'availableControls': controlsListFromControlsBinaryId(levelDescription.controlsBinaryId),
        'colors': twoDimArrayFromColumnsAndString(levelDescription.columns, levelDescription.path),
        'angle': convertedAngle(levelDescription.angle),
        'elements': twoDimArrayFromColumnsAndString(levelDescription.columns, levelDescription.elements),
        'arrowCoordinates': elementCoordinatesFromColumnsAndElementsString('a', levelDescription.columns, levelDescription.elements),
        'finishCoordinates': elementCoordinatesFromColumnsAndElementsString('f', levelDescription.columns, levelDescription.elements)
    };
    return convertedLevelDescription;
}

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            'initialLevelDescription': getConvertedLevelDescription(defaultLevelDescription),
            'stack': [],
            'stackPointerPosition': undefined,
            'functionsList': undefined
        }
        this.state.levelDescription = this.state.initialLevelDescription;

        this.handleKeyPress = this.handleKeyPress.bind(this);
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
        return this.state;
    }

    handleKeyPress(event) {
        const key = event.key;
        if (key === 'a')
            this.processAlgorithm([commandsListFromCommandsString('u_n l_g f1_n')]);
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

    componentDidUpdate(prevProps, prevState) {
        const stack = this.state.stack;
        if (stack.length !== 0) {
            const pointerPosition = this.state.stackPointerPosition;
            const command = stack[pointerPosition];
            const functionsList = this.state.functionsList;
            console.log(this.state.levelDescription.arrowCoordinates, stack, pointerPosition, command);
            let newStack = stack;
            let newPointerPosition = pointerPosition + 1;
            let newFunctionsList = functionsList;
            let newState = this.state;
            if (this.finishReached()) {
                newStack = [];
                newFunctionsList = [];
                newPointerPosition = undefined;
            }
            else {
                if (this.commandCondition(command) === true) {
                    if (command.action === 'f') {
                        newStack = this.replaceElement(stack, functionsList[command.fNumber - 1], pointerPosition);
                        newPointerPosition = pointerPosition;
                    }
                    else {
                        newState = this.tryMove(command.action);
                    }
                }
            }
            setTimeout(() => {
                this.setState((state) => {
                    newState.stack = newStack;
                    newState.stackPointerPosition = newPointerPosition;
                    newState.functionsList = newFunctionsList;
                    return newState;
                });
            }, 200);
        }
    }

    processAlgorithm(functionsList) {
        console.log('processAlgorithm', functionsList);
        this.setState((state) => {
            state.stack = functionsList[0];
            state.stackPointerPosition = 0;
            state.functionsList = functionsList;
            return state;
        });
    }

    render() {
        return (
            <div className="App" onKeyDown={this.handleKeyPress} tabIndex={-1}>
                <div className="Map">
                    <ColorLayer colors={this.state.levelDescription.colors}></ColorLayer>
                    <ElementsLayer elements={this.state.levelDescription.elements} angle={this.state.levelDescription.angle}></ElementsLayer>
                </div>
            </div>
        );
    }
}

export default App;