import React, { Component } from 'react';
import './AvailableControls.css';

function AvailableControls(props) {
    const controlsList = props.controlsList;
    return (
        <table className="AvailableControls" style={{width: props.mapWidth, height: props.mapHeight}}>
            <tbody>
                <tr>
                    {controlsList.map((controlsListElement, index) =>
                        <td key={index} className={controlsListElement}></td>)}
                </tr>
            </tbody>
        </table>
    );
}

export default AvailableControls;