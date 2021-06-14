export enum CardSuit {
  CLUBS = "♣",
  DIAMONDS = "♦",
  SPADES = "♠",
  HEARTS = "♥",
  JOKER = "Joker",
}

export enum FishSuit {
  LOW_CLUBS = "Low ♣",
  HIGH_CLUBS = "High ♣",
  LOW_DIAMONDS = "Low ♦",
  HIGH_DIAMONDS = "High ♦",
  LOW_SPADES = "Low ♠",
  HIGH_SPADES = "High ♠",
  LOW_HEARTS = "Low ♥",
  HIGH_HEARTS = "High ♥",
  EIGHTS = "Eights",
}

export enum Rank {
  R2 = 2,
  R3 = 3,
  R4 = 4,
  R5 = 5,
  R6 = 6,
  R7 = 7,
  R8 = 8,
  R9 = 9,
  R10 = 10,
  J = 11, // jack
  Q = 12, // queen
  K = 13, // king
  A = 14, // ace
  BLACK = 15, // black joker
  RED = 16, // red joker
}

export function rankToString(rank: Rank): string {
  if (rank <= 10) return String(rank);
  switch (rank) {
    case Rank.J:
      return "J";
    case Rank.Q:
      return "Q";
    case Rank.K:
      return "K";
    case Rank.A:
      return "A";
    case Rank.BLACK:
      return "Black ";
    case Rank.RED:
      return "Red ";
  }
}

export class Card {
  readonly fishSuit: FishSuit;

  constructor(readonly cardSuit: CardSuit, readonly rank: Rank) {
    console.assert(Card.validate(cardSuit, rank));
    this.fishSuit = Card.fishSuit(cardSuit, rank);
  }

  static validate(cardSuit: CardSuit, rank: Rank): boolean {
    return cardSuit === CardSuit.JOKER ? rank > Rank.A : rank <= Rank.A;
  }

  static fishSuit(cardSuit: CardSuit, rank: Rank): FishSuit {
    if (rank === Rank.R8) return FishSuit.EIGHTS;
    switch (cardSuit) {
      case CardSuit.CLUBS:
        return rank < Rank.R8 ? FishSuit.LOW_CLUBS : FishSuit.HIGH_CLUBS;
      case CardSuit.HEARTS:
        return rank < Rank.R8 ? FishSuit.LOW_HEARTS : FishSuit.HIGH_HEARTS;
      case CardSuit.SPADES:
        return rank < Rank.R8 ? FishSuit.LOW_SPADES : FishSuit.HIGH_SPADES;
      case CardSuit.DIAMONDS:
        return rank < Rank.R8 ? FishSuit.LOW_DIAMONDS : FishSuit.HIGH_DIAMONDS;
      case CardSuit.JOKER:
        return FishSuit.EIGHTS;
    }
  }

  toString(): string {
    return rankToString(this.rank) + String(this.cardSuit);
  }
}
