"use strict"

function Functions(props) {
    const functionsList = props.functionsList;
    const pointerFunctionIndex = props.pointerFunctionIndex;
    const pointerCommandIndex = props.pointerCommandIndex;
    const onMouseDown = props.onMouseDownOnFunctionCell;
    const onTouchStart = props.onTouchStart;
    const minSolutionFunctionsLengths = props.minSolutionFunctionsLengths;
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
                                        if (cellIndex < minSolutionFunctionsLengths[rowIndex])
                                            className += " minSolutionCell";
                                        const color = command.color;
                                        if (color !== 'n')
                                            className += " color color-" + color;
                                        const action = command.action;
                                        if (action !== undefined)
                                            className += " action action-" + action;
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
                                                   onMouseDown={onMouseDown} onTouchStart={onTouchStart}
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