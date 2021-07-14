import React from "react";

import { CardSpan } from "components/Card";
import { Client } from "lib/client";

export namespace CardAnim {
  export type Props = {
    client: Client;
  };

  export type State = {
    animDone: boolean;
  };
}

export class CardAnim extends React.Component<CardAnim.Props, CardAnim.State> {
  constructor(props) {
    super(props);

    this.state = {
      animDone: true,
    };
  }

  componentDidMount() {
    this.props.client.resetCardAnimHook = () =>
      this.setState({ animDone: false });
  }

  render() {
    const { client } = this.props;
    const { engine } = client;

    if (this.state.animDone || engine.lastResponse !== "good ask") return null;

    return (
      <div className="cardAnim">
        <div
          className={`cardAnimate rot-${engine.asker}`}
          onAnimationEnd={(e) => this.setState({ animDone: true })}
          style={{ animationName: `rot-${engine.asker}-${engine.askee}` }}
        >
          <CardSpan card={engine.askedCard} />
        </div>
      </div>
    );
  }
}
