import React from 'react';
import './Functions.css';

function Functions(props) {
    const functionsList = props.functionsList;
    const pointerFunctionIndex = props.pointerFunctionIndex;
    const pointerCommandIndex = props.pointerCommandIndex;
    return (
        <table className="Functions" style={{width: props.mapWidth, height: props.mapHeight}}>
            <tbody>
                {
                    functionsList.map((someFunction, rowIndex) => 
                        <tr key={rowIndex}>
                            <td className={"functionName" + " " + "f" + (rowIndex+1).toString()}></td>
                            {
                                someFunction.map(
                                    (command, cellIndex) => {
                                        let className = "functionCell";
                                        const color = command.color === "n" ? 'undefined' : command.color;
                                        className += " color-" + color;
                                        const action = command.action;
                                        className += " action-" + action;
                                        if (action === "p") {
                                            const paintColor = command.paintColor;
                                            className += " paintColor-" + paintColor;
                                        }
                                        else if (action === "f") {
                                            const functionNumber = command.fNumber;
                                            className += " function-" + functionNumber.toString();
                                        }
                                        if ((pointerFunctionIndex === rowIndex) && (pointerCommandIndex === cellIndex))
                                            className += " processing";
                                        return <td rowindex={rowIndex} cellindex={cellIndex} key={cellIndex}
                                                   className={className}></td>;
                                    }
                                )
                            }
                        </tr>
                    )
                }
            </tbody>
        </table>
    );
}

export default Functions;