import React from "react";
import { Draggable } from "react-beautiful-dnd";

import { Card as Card_ } from "lib/cards";
import { Client } from "lib/client";

export namespace CardSpan {
  export type Props = {
    break?: boolean;
    card: Card_;
  };
}

export class CardSpan extends React.Component<CardSpan.Props> {
  render() {
    const { card } = this.props;
    const color = card.color();
    const symbol = card.symbol();
    // jank, fix this
    const suit = symbol.slice(-1);
    const rank = this.props.break && suit === "★" ? "" : symbol.slice(0, -1);

    return (
      <span className="cardSpan" style={{ color }}>
        {rank ? (
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
    card: Card_;
    index: number;
  };
}

export class Card extends React.Component<Card.Props> {
  render() {
    const { card, index } = this.props;

    return (
      <Draggable
        key={card.toString()}
        draggableId={card.toString()}
        index={index}
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
