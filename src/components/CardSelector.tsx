import React from "react";

import { CardSpan } from "components/Card";
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
            title={card.toString()}
          >
            <CardSpan card={card} />
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
    update: () => void;
  };
}

export class CardSelector extends React.Component<CardSelector.Props> {
  componentDidMount() {
    this.props.update();
  }

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
        {/*<button onClick={(e) => this.props.close()}>cancel</button>*/}
      </div>
    );
  }
}
