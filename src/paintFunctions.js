/** @jsx h */

function getSvgCircle(color, radius, key) {
    const radiusString = radius.toString();
    return (
        <svg className="circle" key={key} width={"calc(" + radiusString + "*2)"}
            height={"calc(" + radiusString + "*2)"}>
            <circle cx={"calc(" + radiusString + ")"}
                cy={"calc(" + radiusString + ")"}
                r={"calc(" + radiusString + ")"} fill={color}></circle>
        </svg>
    );
}

function getSvgRing(color, radius, strokeWidth, key) {
    const radiusString = "calc(" + radius.toString() + " - " + strokeWidth + " / 2)";
    return (
        <svg className="ring" key={key} width={"calc(" + radiusString + " * 2 + " + strokeWidth + ")"}
            height={"calc(" + radiusString + " * 2 + " + strokeWidth + ")"}>
            <circle cx={"calc(" + radiusString + " + " + strokeWidth + " / 2" + ")"}
                cy={"calc(" + radiusString + " + " + strokeWidth + " / 2" + ")"}
                r={"calc(" + radiusString + ")"}
                stroke={color}
                strokeWidth={strokeWidth}
                fill="transparent"></circle>
        </svg>
    );
}