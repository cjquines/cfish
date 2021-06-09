import * as React from "react";
import { hot } from "react-hot-loader/root";

import "styles/style.scss";

const App = () => (
  <div className="wrapper">
    <div className="game">
      <div className="table">
        <div className="players">
          <div className="player">Player 1</div>
          <div className="player">Player 2</div>
          <div className="player">Player 3</div>
          <div className="player">Player 4</div>
          <div className="player">Player 5</div>
          <div className="player">Player 6</div>
        </div>
        <div className="question">
          <div className="card">3S</div>
          <div className="arrow">→</div>
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

export default hot(App);
