import React from "react";
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from "react-beautiful-dnd";

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
            <div ref={provided.innerRef} {...provided.droppableProps} className="cardArea">
              {engine.ownHand?.cards.map((card, i) => (
                <Draggable
                  key={card.toString()}
                  draggableId={card.toString()}
                  index={i}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={provided.draggableProps.style}
                      className="card"
                    >
                      {card.toString()}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    );
  }
}
