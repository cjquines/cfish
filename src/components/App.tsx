import React from "react";

import { Players } from "components/Players";
import { Question } from "components/Question";
import { CFish as C } from "lib/cfish";
import { Client } from "lib/client";

export namespace App {
  export type Props = {
    url: string;
  };

  export type State = {
    client: Client | null;
    name: string;
    room: string;
  };
}

export class App extends React.Component<App.Props, App.State> {
  constructor(props: App.Props) {
    super(props);

    this.state = {
      client: null,
      name: window.prompt("enter your name") || "no name",
      room: "test",
    };
  }

  componentDidMount() {
    if (this.state.client !== null) return;
    const client = new Client(this.props.url, this.state.room, this.state.name);
    client.onUpdate = (client: Client) => this.setState({ client });
    client.connect();
    this.setState({ client });
  }

  render() {
    const { client } = this.state;
    if (!client?.engine) {
      return <div className="wrapper">loading...</div>;
    }

    const { engine } = client;

    return (
      <div className="wrapper">
        <div className="game">
          <div className="table">
            <Players client={client} />
            <Question from="p1" to="p6" label="3S" />
          </div>
          <div className="action">
            <button
              onClick={(e) => client.startGame()}
              disabled={
                engine.phase !== C.Phase.WAIT ||
                engine.identity !== engine.host ||
                engine.numSeated < engine.numPlayers
              }
            >
              start game
            </button>
          </div>
          <div className="hand">
            <div className="cardarea">
              {engine.handOf[engine.ownSeat]?.cards.map((card) => (
                <div className="card">{card.toString()}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
