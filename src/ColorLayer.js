"use strict"

function ColorLayer(props) {
    const colors = props.colors;
    return (
        <table className="Layer ColorLayer" style={{width: props.mapWidth, height: props.mapHeight}}>
            <tbody>
                {
                    colors.map((row, index) => 
                        <tr key={index}>
                            {row.map((color, index) => <td key={index} className={'color-' + color}></td>)}
                        </tr>
                    )
                }
            </tbody>
        </table>
    );
}