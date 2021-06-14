import React from "react";
import { ArcherContainer, ArcherElement } from "react-archer";
import { hot } from "react-hot-loader/root";

import "styles/style.scss";

const App = () => {
  return (
    <div className="wrapper">
      <div className="game">
        <div className="table">
          <div className="players">
            <div className="player">
              <div className="playerInt">Player 1</div>
            </div>
            <div className="player">
              <div className="playerInt">Player 2</div>
            </div>
            <div className="player">
              <div className="playerInt">Player 3</div>
            </div>
            <div className="player">
              <div className="playerInt">Player 4</div>
            </div>
            <div className="player">
              <div className="playerInt">Player 5</div>
            </div>
            <div className="player">
              <div className="playerInt">Player 6</div>
            </div>
          </div>
          <div className="question">
            <ArcherContainer strokeColor="black">
              <div className="playerTarget">
                <ArcherElement
                  id="p1"
                  relations={[
                    {
                      targetId: "p2",
                      targetAnchor: "middle",
                      sourceAnchor: "middle",
                    },
                  ]}
                >
                  <div className="playerTargetInt"></div>
                </ArcherElement>
              </div>
              <div className="playerTarget">
                <ArcherElement id="p2">
                  <div className="playerTargetInt"></div>
                </ArcherElement>
              </div>
              <div className="playerTarget"></div>
              <div className="playerTarget"></div>
              <div className="playerTarget"></div>
              <div className="playerTarget"></div>
            </ArcherContainer>
          </div>
        </div>
        <div className="hand">
          <div className="cardarea">
            <div className="card">1</div>
            <div className="card">2</div>
            <div className="card">3</div>
            <div className="card">4</div>
            <div className="card">5</div>
            <div className="card">6</div>
            <div className="card">7</div>
            <div className="card">8</div>
            <div className="card">9</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default hot(App);
