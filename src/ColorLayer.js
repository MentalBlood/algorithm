import React from 'react';
import './Layer.css';
import './ColorLayer.css';

function ColorLayer(props) {
    const colors = props.colors;
    const cellSize = props.cellSize;
    return (
        <table className="Layer ColorLayer">
            <tbody>
                {
                    colors.map((row, index) => 
                        <tr key={index}>
                            {row.map((color, index) => <td key={index} className={color}
                                style={{width: cellSize, height: cellSize}}></td>)}
                        </tr>
                    )
                }
            </tbody>
        </table>
    );
}

export default ColorLayer;