import { SeatID } from "lib/cfish";
import { UserID } from "lib/server";

export namespace Protocol {
  export type User = {
    id: UserID;
    name: string;
  };

  export type AddUser = {
    type: "addUser";
    user: User;
  };

  export type SeatAt = {
    type: "seatAt";
    user: UserID;
    seat: SeatID;
  };

  export type UnseatAt = {};
  export type RemoveUser = {};
  export type Hand = {};

  export type Event = AddUser | SeatAt | UnseatAt | RemoveUser | Hand;
}
