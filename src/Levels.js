import React from 'react';
import './Levels.css';
import getSvgCircle from './paintFunctions.js';

function getAchivmentCircle(isAchivmentGot, radius) {
    return isAchivmentGot ? getSvgCircle("#3E3E3E", radius) : getSvgCircle("red", radius);
}

function Levels(props) {
    return (
        <div className="levels">
            {
                Object.values(props.levels).map(
                    (levelPack, index) => <div key={index} style={{backgroundColor: levelPack.color}} className="levelPack">
                                              <div className="levelPackName">{levelPack.name}</div>
                                              <div className="levels">
                                                  {
                                                      Object.values(levelPack.levels).map(
                                                          (level, index) => <div key={index} className="levelCell">
                                                              <div className="level">
                                                                  <div className="levelNumber">{index+1}</div>
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