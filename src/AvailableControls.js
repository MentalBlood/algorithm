import React from 'react';
import './AvailableControls.css';

function AvailableControls(props) {
    const controlsList = props.controlsList;
    return (
        <table className="AvailableControls">
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