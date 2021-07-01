import React from "react";

import { Question } from "components/Question";
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

    return (
      <div className="wrapper">
        <div className="game">
          <div className="table">
            <div className="players">
              <p>
                {this.state.client?.users.map((user) => user.name).join(" ")}
              </p>
              <div className="player">
                <div className="playerInt">Player 1</div>
              </div>
              <div className="player">
                <div className="playerInt">Player 2</div>
              </div>
              <div className="player">
                <div className="playerInt">Player 3</div>
              </div>
              <div className="player">
                <div className="playerInt">Player 4</div>
              </div>
              <div className="player">
                <div className="playerInt">Player 5</div>
              </div>
              <div className="player">
                <div className="playerInt">Player 6</div>
              </div>
            </div>
            <Question from="p1" to="p6" label="3S" />
          </div>
          <div className="hand">
            <div className="cardarea">
              <div className="card">1</div>
              <div className="card">2</div>
              <div className="card">3</div>
              <div className="card">4</div>
              <div className="card">5</div>
              <div className="card">6</div>
              <div className="card">7</div>
              <div className="card">8</div>
              <div className="card">9</div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
