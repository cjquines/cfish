import React from "react";

import { Card, FishSuit, fishSuitToString, genFishSuit } from "lib/cards";

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
          <div key={fishSuitToString(suit)}>
            {[...genFishSuit(suit)].map((card) => (
              <button
                key={card.toString()}
                onClick={(e) => callback(card)}
                disabled={disabled.some((card_) => card_.equals(card))}
              >
                {card.toString()}
              </button>
            ))}
          </div>
        ))}
        <button onClick={(e) => this.props.close()}>cancel</button>
      </div>
    );
  }
}
