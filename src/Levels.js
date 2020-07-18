import React from 'react';
import './Levels.css';
import {getSvgCircle, getSvgRing} from './paintFunctions.js';

function Levels(props) {
    const launchLevelFunction = props.launchLevelFunction;
    const getLevelAchivments = props.getLevelAchivments;
    return (
        <div className="levels">
            {
                Object.values(props.levels).map(
                    (levelPack, levelPackIndex) =>
                    <div key={levelPackIndex} style={{backgroundColor: levelPack.color}} className="levelPack">
                        <div className="levelPackName">{levelPack.name}</div>
                        <div className="levels">
                            {
                                Object.values(levelPack.levels).map(
                                    (level, levelIndex) => <div key={levelIndex} className="levelCell">
                                        <div className="level"
                                        onClick={event => launchLevelFunction(levelPackIndex, levelIndex+1)}>
                                            <div className="levelNumber">{levelIndex+1}</div>
                                            <div className="levelAchivments">
                                                {
                                                    getLevelAchivments(levelIndex+1, levelPackIndex)
                                                        .map((achivmentGot, achivmentIndex) =>
                                                            achivmentGot ?
                                                            getSvgCircle("#3E3E3E", "2.3vmin", achivmentIndex)
                                                            :
                                                            getSvgRing("#3E3E3E", "2.3vmin", "0.5vmin", achivmentIndex)
                                                    )
                                                }
                                            </div>
                                        </div>
                                    </div>
                                )
                            }
                        </div>
                    </div>
                )
            }
        </div>
    );
}

export default Levels;