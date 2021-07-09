import React from "react";
import { withRouter } from "react-router-dom";
import { RouteComponentProps } from "react-router";

import { Action } from "components/Action";
import { Config } from "components/Config";
import { CardArea } from "components/CardArea";
import { Log } from "components/Log";
import { Players } from "components/Players";
import { Question } from "components/Question";
import { Users } from "components/Users";
import { CFish as C } from "lib/cfish";
import { Client } from "lib/client";

export namespace Room {
  export type Match = {
    room: string;
  };

  export type Props = RouteComponentProps<Match> & {
    url: string;
  };

  export type State = {
    client: Client | null;
    name: string;
    room: string;
    sidebar: "closed" | "users" | "log";
  };
}

class Room extends React.Component<Room.Props, Room.State> {
  constructor(props) {
    super(props);

    this.state = {
      client: null,
      name: window.prompt("enter your name") || "no name",
      room: this.props.match.params.room,
      sidebar: "closed",
    };
  }

  componentDidMount() {
    if (this.state.client !== null) return;
    const client = new Client(this.props.url, this.state.room, this.state.name);
    client.onUpdate = (client: Client) => this.setState({ client });
    client.connect();
    this.setState({ client });
  }

  renderToggle(pane: "users" | "log") {
    const { sidebar } = this.state;
    const label = sidebar !== pane ? `show ${pane}` : `hide ${pane}`;
    const onClick = (e) => {
      if (sidebar === pane) {
        this.setState({ ...this.state, sidebar: "closed" });
      } else {
        this.setState({ ...this.state, sidebar: pane });
      }
    };

    return <button onClick={onClick}>{label}</button>;
  }

  render() {
    const { client } = this.state;

    if (!client) {
      return <div className="game">loading...</div>;
    }

    const { engine } = client;

    if (client?.status === "disconnected") {
      return (
        <div className="game">
          you've been disconnected! reload the page to rejoin the game
        </div>
      );
    }
    if (!client?.engine) {
      return <div className="game">loading...</div>;
    }

    return (
      <div className="room">
        <div className="game">
          <div className="table">
            <Players client={client} />
            <Question client={client} />
          </div>
          <Action client={client} />
          {engine.phase === C.Phase.WAIT && engine.identity === engine.host ? (
            <Config client={client} />
          ) : null}
          {engine.ownHand !== null ? <CardArea client={client} /> : null}
        </div>
        <Users active={this.state.sidebar === "users"} client={client} />
        <Log active={this.state.sidebar === "log"} client={client} />
        <div
          className={`toggles ${
            this.state.sidebar === "closed" ? "" : "active"
          }`}
        >
          {this.renderToggle("users")}
          {this.renderToggle("log")}
        </div>
      </div>
    );
  }
}

export default withRouter(Room);
