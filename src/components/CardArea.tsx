import React from "react";
import { DragDropContext, Droppable, DropResult } from "react-beautiful-dnd";

import { Card } from "components/Card";
import { Client } from "lib/client";

export namespace CardArea {
  export type Props = {
    client: Client;
  };
}

export class CardArea extends React.Component<CardArea.Props> {
  onDragEnd(result: DropResult): void {
    const { source, destination } = result;
    if (!destination) return;

    const { client } = this.props;
    const { engine } = client;

    engine.ownHand.move(source.index, destination.index);
    client.onUpdate(client);
  }

  render() {
    const { client } = this.props;
    const { engine } = client;

    return (
      <DragDropContext onDragEnd={(result) => this.onDragEnd(result)}>
        <Droppable direction="horizontal" droppableId="cardArea">
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="cardArea"
            >
              {engine.ownHand?.cards.map((card, i) => (
                <Card card={card} index={i} />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    );
  }
}
