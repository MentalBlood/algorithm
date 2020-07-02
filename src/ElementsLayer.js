import React from 'react';
import './Layer.css';
import './ElementsLayer.css';

function directionFromAngle(angle) {
    let direction = undefined;
    if (angle === 0)
        direction = 'right';
    else if (angle === 0.5)
        direction = 'up';
    else if (angle === 1)
        direction = 'left';
    else if (angle === 1.5)
        direction = 'down'
    else
        direction = null;
    return direction;
}

function ElementsLayer(props) {
    const elements = props.elements;
    const angle = props.angle;
    const cellSize = props.cellSize;
    return (
        <table className="Layer ElementsLayer">
            <tbody>
                {
                    elements.map((row, index) => 
                        <tr key={index}>
                            {
                                row.map((element, index) => <td key={index} className={
                                        (element === 'a') ? element + ' ' + directionFromAngle(angle) : element
                                    } style={{width: cellSize, height: cellSize}}></td>)
                            }
                        </tr>
                    )
                }
            </tbody>
        </table>
    );
}

export default ElementsLayer;