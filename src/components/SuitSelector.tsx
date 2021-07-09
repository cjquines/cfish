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
        <span>{string}</span> <span className="suit">{suitChar}</span>
      </span>
    );
  }
}

export namespace SuitSelector {
  export type Props = {
    callback: (suit: FishSuit) => void;
    close: () => void;
    disabled: FishSuit[];
    update: () => void;
  };
}

export class SuitSelector extends React.Component<SuitSelector.Props> {
  componentDidMount() {
    this.props.update();
  }

  render() {
    const { callback, close, disabled } = this.props;

    return (
      <div className="suitSelector">
        {Card.FISH_SUITS.map((suit, i) => (
          <button
            disabled={disabled.some((suit_) => suit_ === suit)}
            key={i}
            onClick={(e) => callback(suit)}
          >
            <SuitSpan suit={suit} />
          </button>
        ))}
        {/*<button onClick={(e) => close()}>close</button>*/}
      </div>
    );
  }
}
