import React from "react";
import { hot } from "react-hot-loader/root";

import { Question } from "components/Question";

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
          <Question from="p1" to="p6" label="3S" />
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
