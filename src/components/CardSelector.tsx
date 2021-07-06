import React from "react";

import { Card, FishSuit, fishSuitToString, genFishSuit } from "lib/cards";

namespace CardSelectorRow {
  export type Props = {
    callback: (card: Card) => void;
    disabled: Card[];
    suit: FishSuit;
  };
}

class CardSelectorRow extends React.Component<CardSelectorRow.Props> {
  render() {
    const { callback, disabled, suit } = this.props;

    return (
      <div className="row" key={fishSuitToString(suit)}>
        {[...genFishSuit(suit)].map((card) => (
          <button
            disabled={disabled.some((card_) => card_.equals(card))}
            key={card.toString()}
            onClick={(e) => callback(card)}
            style={{ color: card.color() }}
            title={card.toString()}
          >
            {card.symbol()}
          </button>
        ))}
      </div>
    );
  }
}

export namespace CardSelector {
  export type Props = {
    callback: (card: Card) => void;
    close: () => void;
    disabled: Card[];
    suits: FishSuit[];
  };
}

export class CardSelector extends React.Component<CardSelector.Props> {
  render() {
    const { callback, close, disabled, suits } = this.props;

    return (
      <div className="cardSelector">
        {suits.map((suit) => (
          <CardSelectorRow
            callback={callback}
            disabled={disabled}
            suit={suit}
          />
        ))}
        <button onClick={(e) => this.props.close()}>cancel</button>
      </div>
    );
  }
}
