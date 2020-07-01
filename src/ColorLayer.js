import React from 'react';
import './ColorLayer.css';

function ColorLayer(props) {
    const colors = props.colors;
    return (
        <div className="ColorLayer">
            <table>
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
        </div>
    );
}

export default ColorLayer;