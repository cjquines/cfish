import React from "react";
import {
  DragDropContext,
  Droppable,
  DropResult,
  DroppableProvided,
  DroppableStateSnapshot,
} from "react-beautiful-dnd";

import { Card } from "components/Card";
import {
  Card as Card_,
  FishSuit,
  fishSuitToString,
  genFishSuit,
} from "lib/cards";
import { CFish as C, SeatID } from "lib/cfish";
import { Client } from "lib/client";

namespace DeclareArea {
  export type Props = {
    cards: Card_[];
    provided: DroppableProvided;
    seat: SeatID | "unset";
    snapshot: DroppableStateSnapshot;
  };
}

class DeclareArea extends React.Component<DeclareArea.Props> {
  render() {
    const { cards, provided, seat, snapshot } = this.props;

    return (
      <div className={`declareArea rot-${seat}`}>
        <div
          className="declareInner"
          ref={provided.innerRef}
          {...provided.droppableProps}
        >
          {cards.map((card, i) => (
            <Card card={card} key={card.toString()} index={i} />
          ))}
          {provided.placeholder}
        </div>
      </div>
    );
  }
}

export namespace Declare {
  export type Props = {
    // callback: (owners: Record<string, SeatID>) => void;
    client: Client;
    seats: SeatID[];
    suit: FishSuit;
  };

  export type State = {
    cards: Record<SeatID | "unset", Card_[]>;
  };
}

export class Declare extends React.Component<Declare.Props, Declare.State> {
  constructor(props) {
    super(props);

    const { seats, suit } = this.props;

    let cards = { unset: [...genFishSuit(suit)] };
    for (const seat of seats) {
      cards[seat] = [];
    }

    this.state = { cards };
  }

  onDragEnd(result: DropResult): void {
    const { source, destination } = result;
    if (!destination) return;

    const [card] = this.state.cards[source.droppableId].splice(source.index, 1);
    const newCards = [...this.state.cards[destination.droppableId]];
    newCards.splice(destination.index, 0, card);
    this.setState({
      cards: {
        ...this.state.cards,
        [destination.droppableId]: newCards,
      },
    });
  }

  submit(): void {
    let owners = {};
    for (const seat of this.props.seats) {
      for (const card of this.state.cards[seat]) {
        owners[card.toString()] = seat;
      }
    }
    this.props.client.declare(owners);
  }

  render() {
    const { client, seats, suit } = this.props;
    const { engine } = client;

    return (
      <div className="declare">
        <DragDropContext onDragEnd={(result) => this.onDragEnd(result)}>
          {seats.map((seat) => (
            <Droppable
              direction="horizontal"
              droppableId={seat.toString()}
              key={seat}
            >
              {(provided, snapshot) => (
                <DeclareArea
                  cards={this.state.cards[seat]}
                  provided={provided}
                  snapshot={snapshot}
                  seat={seat}
                />
              )}
            </Droppable>
          ))}
          <Droppable direction="horizontal" droppableId="unset">
            {(provided, snapshot) => (
              <DeclareArea
                cards={this.state.cards["unset"]}
                provided={provided}
                snapshot={snapshot}
                seat={"unset"}
              />
            )}
          </Droppable>
        </DragDropContext>
        <button
          disabled={this.state.cards["unset"].length > 0}
          onClick={(e) => this.submit()}
        >
          submit
        </button>
      </div>
    );
  }
}
