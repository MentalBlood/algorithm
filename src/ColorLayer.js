import React from 'react';
import './Layer.css';
import './ColorLayer.css';

function ColorLayer(props) {
    const colors = props.colors;
    return (
        <table className="Layer ColorLayer" style={{width: props.mapWidth, height: props.mapHeight}}>
            <tbody>
                {
                    colors.map((row, index) => 
                        <tr key={index}>
                            {row.map((color, index) => <td key={index} className={color}></td>)}
                        </tr>
                    )
                }
            </tbody>
        </table>
    );
}

export default ColorLayer;