import React from 'react';
import './AvailableControls.css';

function AvailableControls(props) {
    const controlsList = props.controlsList;
    const onMouseDown = props.onMouseDown;
    const onTouchStart = props.onTouchStart;
    return (
        <table className="AvailableControls">
            <tbody>
                <tr>
                    {
                        controlsList.map((controlsListElement, index) =>
                            <td key={index} className={controlsListElement} onDragStart={e => e.preventDefault()}
                                onMouseDown={event => onMouseDown(event, controlsListElement)}
                                onTouchStart={event => onTouchStart(event, controlsListElement)}></td>)
                    }
                </tr>
            </tbody>
        </table>
    );
}

export default AvailableControls;