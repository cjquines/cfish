import { Card, FishSuit, Hand } from "lib/cards";
import { CFish as C, SeatID } from "lib/cfish";
import { UserID } from "lib/server";

export namespace Protocol {
  export type User = {
    id: UserID;
    name: string;
  };

  export type AddUser = {
    type: "addUser";
    user: UserID;
  };

  export type SeatAt = {
    type: "seatAt";
    user: UserID;
    seat: SeatID;
  };

  export type UnseatAt = {
    type: "unseatAt";
    seat: SeatID;
  };

  export type RemoveUser = {
    type: "removeUser";
    user: UserID;
  };

  export type SetRules = {
    type: "setRules";
    user: UserID;
    rules: C.Rules;
  };

  export type StartGame = {
    type: "startGame";
    user: UserID;
    shuffle?: boolean;
  };

  export type StartGameResponse = {
    type: "startGameResponse";
    server: null;
    hand: Hand | null;
    handSizes: Record<SeatID, number | null>;
  };

  export type Ask = {
    type: "ask";
    asker: SeatID;
    askee: SeatID;
    card: Card;
  };

  export type Answer = {
    type: "answer";
    askee: SeatID;
    response: boolean;
  };

  export type InitDeclare = {
    type: "initDeclare";
    declarer: SeatID;
    declaredSuit: FishSuit;
  };

  export type DeclareMove = {
    type: "declareMove";
    srcId: string;
    srcIdx: number;
    destId: string;
    destIdx: number;
  };

  export type Declare = {
    type: "declare";
    declarer: SeatID;
    owners: Record<string, SeatID>;
  };

  export type DeclareResponse = {
    type: "declareResponse";
    server: null;
    correct: boolean;
    handSizes: Record<SeatID, number> | null;
  };

  export type Pass = {
    type: "pass";
    passer: SeatID;
    next: SeatID;
  };

  export type Event =
    | AddUser
    | SeatAt
    | UnseatAt
    | RemoveUser
    | SetRules
    | StartGame
    | StartGameResponse
    | Ask
    | Answer
    | InitDeclare
    | DeclareMove
    | Declare
    | DeclareResponse
    | Pass;
}
