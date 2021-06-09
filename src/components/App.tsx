import * as React from "react";
import { hot } from "react-hot-loader/root";
import styled from "styled-components";

import "styles/style.scss";

interface ArrowProps {
  readonly width: number;
};

const Arrow = styled.div<ArrowProps>`
  background-color: #000;
  height: 0.1rem;
  position: relative;
  width: ${props => props.width};

  &:before,
  &:after {
    background-color: #000;
    content: "";
    display: block;
    height: 0.1rem;
    position: absolute;
    right: 0;
    top: 0;
    width: 1rem;
  }

  &:before {
    transform: rotate(45deg);
    transform-origin: top right;
  }

  &:after {
    transform: rotate(-45deg);
    transform-origin: bottom right;
  }
`;

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
          <Arrow width="5rem" />
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
