import React from 'react';

function getSvgCircle(color, radius) {
    const radiusString = radius.toString();
    return (
        <svg width={"calc(" + radiusString + "*2)"}
            height={"calc(" + radiusString + "*2)"}>
            <circle cx={"calc(" + radiusString + ")"}
                cy={"calc(" + radiusString + ")"}
                r={"calc(" + radiusString + ")"} fill={color}></circle>
        </svg>
    );
}

export default getSvgCircle;