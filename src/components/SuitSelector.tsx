import React from "react";

import { Card, FishSuit, fishSuitToString } from "lib/cards";

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
            {fishSuitToString(suit)}
          </button>
        ))}
        <button onClick={(e) => this.props.close()}>close</button>
      </div>
    );
  }
}
