import React from "react";
import {
  DragDropContext,
  Droppable,
  DroppableProvided,
  DroppableStateSnapshot,
  DropResult,
} from "react-beautiful-dnd";

import { Card } from "components/Card";
import {
  Card as CardT,
  FishSuit,
  fishSuitToString,
  genFishSuit,
} from "lib/cards";
import { CFish as C, SeatID } from "lib/cfish";
import { Client } from "lib/client";

namespace DeclareArea {
  export type Props = {
    cards: CardT[];
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
    client: Client;
    seats: SeatID[];
    suit: FishSuit;
  };

  export type State = {
    cards: Record<SeatID | "unset", CardT[]>;
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

  onDragEnd(result: DropResult) {
    const { cards } = this.state;
    const { source, destination } = result;
    if (!destination) return;

    const srcId = source.droppableId;
    const destId = destination.droppableId;
    const srcIdx = source.index;
    const destIdx = destination.index;

    const [card] = cards[srcId].splice(srcIdx, 1);
    const newCards = [...cards[destId]];
    newCards.splice(destIdx, 0, card);

    this.setState({
      cards: {
        ...cards,
        [destId]: newCards,
      },
    });
  }

  submit() {
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

    const ids: (number | "unset")[] = [...seats, "unset"];
    const disabled = this.state.cards["unset"].length > 0;

    return (
      <div className="declare">
        <DragDropContext onDragEnd={(result) => this.onDragEnd(result)}>
          {ids.map((id) => (
            <Droppable
              direction="horizontal"
              droppableId={id.toString()}
              key={id}
            >
              {(provided, snapshot) => (
                <DeclareArea
                  cards={this.state.cards[id]}
                  provided={provided}
                  seat={id}
                  snapshot={snapshot}
                />
              )}
            </Droppable>
          ))}
        </DragDropContext>
        <button disabled={disabled} onClick={(e) => this.submit()}>
          submit
        </button>
      </div>
    );
  }
}
