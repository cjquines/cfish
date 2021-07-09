import React from "react";

import { Card, FishSuit, fishSuitToColor, fishSuitToString } from "lib/cards";

export namespace SuitSpan {
  export type Props = {
    suit: FishSuit;
  };
}

export class SuitSpan extends React.Component<SuitSpan.Props> {
  render() {
    const { suit } = this.props;
    const color = fishSuitToColor(suit);
    const split = fishSuitToString(suit).split(" ");
    const string = split[0];
    const suitChar = split.length === 2 ? split[1] : "";

    return (
      <span className="suitSpan" style={{ color }}>
        <span>{string}</span>
        <span className="suit">{suitChar}</span>
      </span>
    );
  }
}

export namespace SuitSelector {
  export type Props = {
    callback: (suit: FishSuit) => void;
    close: () => void;
  };
}

export class SuitSelector extends React.Component<SuitSelector.Props> {
  render() {
    return (
      <div className="suitSelector">
        {Card.FISH_SUITS.map((suit, i) => (
          <button key={i} onClick={(e) => this.props.callback(suit)}>
            <SuitSpan suit={suit} />
          </button>
        ))}
        <button onClick={(e) => this.props.close()}>close</button>
      </div>
    );
  }
}
