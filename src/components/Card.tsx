import React from "react";
import { Draggable } from "react-beautiful-dnd";

import { Card as CardT, cardSuitToSymbol, rankToSymbol } from "lib/cards";
import { Client } from "lib/client";

export namespace CardSpan {
  export type Props = {
    break?: boolean;
    card: CardT;
  };
}

export class CardSpan extends React.Component<CardSpan.Props> {
  render() {
    const { card } = this.props;
    const color = card.color();
    const suit = cardSuitToSymbol(card.cardSuit);
    const rank =
      this.props.break && suit === "★" ? "" : rankToSymbol(card.rank);

    return (
      <span className="cardSpan" style={{ color }}>
        {rank !== "" ? (
          <>
            <span className="rank">{rank}</span>
            {this.props.break ? <br /> : null}
          </>
        ) : null}
        <span className="suit">{suit}</span>
      </span>
    );
  }
}

export namespace Card {
  export type Props = {
    card: CardT;
    disabled?: boolean;
    index: number;
  };
}

export class Card extends React.Component<Card.Props> {
  render() {
    const { card, index } = this.props;

    return (
      <Draggable
        draggableId={card.toString()}
        index={index}
        isDragDisabled={this.props.disabled ?? false}
        key={card.toString()}
      >
        {(provided, snapshot) => (
          <div
            className="cardFrame"
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            {...provided.draggableProps.style}
          >
            <div className="card">
              <CardSpan break={true} card={card} />
            </div>
          </div>
        )}
      </Draggable>
    );
  }
}
