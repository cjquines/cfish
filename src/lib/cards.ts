import assert from "assert/strict";
import _ from "lodash";

export enum CardSuit {
  CLUBS,
  DIAMONDS,
  SPADES,
  HEARTS,
  JOKER,
}

export function cardSuitToString(cardSuit: CardSuit): string {
  switch (cardSuit) {
    case CardSuit.CLUBS:
      return "♣";
    case CardSuit.DIAMONDS:
      return "♦";
    case CardSuit.SPADES:
      return "♠";
    case CardSuit.HEARTS:
      return "♥";
    case CardSuit.JOKER:
      return "Joker";
  }
}

export enum FishSuit {
  LOW_CLUBS,
  HIGH_CLUBS,
  LOW_DIAMONDS,
  HIGH_DIAMONDS,
  LOW_SPADES,
  HIGH_SPADES,
  LOW_HEARTS,
  HIGH_HEARTS,
  EIGHTS,
}

export function fishSuitToString(fishSuit: FishSuit): string {
  switch (fishSuit) {
    case FishSuit.LOW_CLUBS:
      return "Low ♣";
    case FishSuit.HIGH_CLUBS:
      return "High ♣";
    case FishSuit.LOW_DIAMONDS:
      return "Low ♦";
    case FishSuit.HIGH_DIAMONDS:
      return "High ♦";
    case FishSuit.LOW_SPADES:
      return "Low ♠";
    case FishSuit.HIGH_SPADES:
      return "High ♠";
    case FishSuit.LOW_HEARTS:
      return "Low ♥";
    case FishSuit.HIGH_HEARTS:
      return "High ♥";
    case FishSuit.EIGHTS:
      return "Eights";
  }
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
    assert.ok(Card.validate(cardSuit, rank));
    this.fishSuit = Card.fishSuit(cardSuit, rank);
  }

  static readonly CARD_SUITS = [
    CardSuit.CLUBS,
    CardSuit.DIAMONDS,
    CardSuit.SPADES,
    CardSuit.HEARTS,
  ];

  static readonly FISH_SUITS = [
    FishSuit.LOW_CLUBS,
    FishSuit.HIGH_CLUBS,
    FishSuit.LOW_DIAMONDS,
    FishSuit.HIGH_DIAMONDS,
    FishSuit.LOW_SPADES,
    FishSuit.HIGH_SPADES,
    FishSuit.LOW_HEARTS,
    FishSuit.HIGH_HEARTS,
    FishSuit.EIGHTS,
  ];

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
    return rankToString(this.rank) + cardSuitToString(this.cardSuit);
  }
}

export function* genDeck(): Generator<Card, void> {
  for (const suit of Card.CARD_SUITS) {
    for (let rank = Rank.R2; rank <= Rank.A; rank++) {
      yield new Card(suit, rank);
    }
  }
  yield new Card(CardSuit.JOKER, Rank.BLACK);
  yield new Card(CardSuit.JOKER, Rank.RED);
}

const deckByFishSuit = _.groupBy(...genDeck(), "fishSuit");
export function* genFishSuit(suit: FishSuit): Generator<Card, void> {
  for (const card of deckByFishSuit[suit]) {
    yield new Card(card.suit, card.rank);
  }
}

export class Hand {
  private cards: Card[];

  constructor(cards: Iterable<Card>) {
    for (const card of cards) this.insert(card);
  }

  get size(): number {
    return this.cards.length;
  }

  includes(card: Card): boolean {
    return this.cards.includes(card);
  }

  insert(card: Card): void {
    this.cards.push(card);
  }

  remove(card: Card): void {
    const idx = this.cards.indexOf(card);
    assert.notStrictEqual(idx, -1);
    this.cards.splice(idx);
  }

  hasSuit(fishSuit: FishSuit): boolean {
    return this.cards.some((card) => card.fishSuit === fishSuit);
  }
}
