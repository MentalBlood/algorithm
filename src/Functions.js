import React from 'react';
import './Functions.css';

function Functions(props) {
    const functionsList = props.functionsList;
    return (
        <table className="Functions" style={{width: props.mapWidth, height: props.mapHeight}}>
            <tbody>
                {
                    functionsList.map((someFunction, index) => 
                        <tr key={index}>
                            <td className={"functionName" + " " + "f" + (index+1).toString()}></td>
                            {someFunction.map((command, index) => {
                                let className = "";
                                const color = command.color === "n" ? undefined : command.color;
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
                                return <td key={index} className={className}></td>;
                            })}
                        </tr>
                    )
                }
            </tbody>
        </table>
    );
}

export default Functions;