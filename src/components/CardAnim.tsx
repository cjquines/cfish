import React from "react";

import { CardSpan } from "components/Card";
import { Card } from "lib/cards";
import { SeatID } from "lib/cfish";
import { Client } from "lib/client";

export namespace SingleCardAnim {
  export type Props = {
    askedCard: Card;
    askee: SeatID;
    asker: SeatID;
    fulfilled: () => void;
  };
}

export class SingleCardAnim extends React.Component<SingleCardAnim.Props> {
  render() {
    const { askedCard, askee, asker, fulfilled } = this.props;
    return (
      <div className="cardAnim">
        <div
          className={`cardAnimate rot-${asker}`}
          onAnimationEnd={(e) => fulfilled()}
          style={{ animationName: `rot-${asker}-${askee}` }}
        >
          <CardSpan card={askedCard} />
        </div>
      </div>
    );
  }
}

export namespace CardAnim {
  export type Props = {
    client: Client;
  };

  export type State = {
    lastIndex: number;
    toRender: {
      askedCard: Card;
      askee: SeatID;
      asker: SeatID;
      index: number;
    }[];
  };
}

export class CardAnim extends React.Component<CardAnim.Props, CardAnim.State> {
  constructor(props) {
    super(props);

    this.state = {
      lastIndex: 0,
      toRender: [],
    };
  }

  componentDidMount() {
    this.props.client.cardAnimHook = (
      asker: SeatID,
      askee: SeatID,
      askedCard: Card
    ) => {
      console.log("hook called", asker, askee, askedCard);
      this.setState((state) => ({
        lastIndex: state.lastIndex + 1,
        toRender: state.toRender.concat({
          asker,
          askee,
          askedCard,
          index: state.lastIndex,
        }),
      }));
    };
  }

  render() {
    const { client } = this.props;
    const { engine } = client;

    return (
      <>
        {this.state.toRender.map(({ askedCard, asker, askee, index }) => (
          <SingleCardAnim
            askedCard={askedCard}
            asker={asker}
            askee={askee}
            fulfilled={() =>
              this.setState((state) => ({
                toRender: state.toRender.filter((elt) => elt.index !== index),
              }))
            }
            key={index}
          />
        ))}
      </>
    );
  }
}
