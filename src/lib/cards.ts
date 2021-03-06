import _ from "lodash";

import { assert } from "lib/assert";

enum Color {
  BLACK = "#111827",
  RED = "#ef4444",
}

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

export function cardSuitToSymbol(cardSuit: CardSuit): string {
  if (cardSuit === CardSuit.JOKER) return "★";
  return cardSuitToString(cardSuit);
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

export function fishSuitToColor(fishSuit: FishSuit): string {
  switch (fishSuit) {
    case FishSuit.LOW_CLUBS:
    case FishSuit.HIGH_CLUBS:
    case FishSuit.LOW_SPADES:
    case FishSuit.HIGH_SPADES:
    case FishSuit.EIGHTS:
      return Color.BLACK;
    case FishSuit.LOW_DIAMONDS:
    case FishSuit.HIGH_DIAMONDS:
    case FishSuit.LOW_HEARTS:
    case FishSuit.HIGH_HEARTS:
      return Color.RED;
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

export function rankToSymbol(rank: Rank): string {
  if (rank === Rank.BLACK) return "B";
  if (rank === Rank.RED) return "R";
  return rankToString(rank);
}

export class Card {
  readonly fishSuit: FishSuit;

  constructor(readonly cardSuit: CardSuit, readonly rank: Rank) {
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
    return [
      cardSuit !== undefined,
      rank !== undefined,
      cardSuit === CardSuit.JOKER || (rank >= Rank.R2 && rank <= Rank.A),
      cardSuit !== CardSuit.JOKER || (rank > Rank.A && rank <= Rank.RED),
    ].every(Boolean);
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

  symbol(): string {
    return rankToSymbol(this.rank) + cardSuitToSymbol(this.cardSuit);
  }

  color(): string {
    switch (this.cardSuit) {
      case CardSuit.CLUBS:
      case CardSuit.SPADES:
        return Color.BLACK;
      case CardSuit.DIAMONDS:
      case CardSuit.HEARTS:
        return Color.RED;
    }
    switch (this.rank) {
      case Rank.BLACK:
        return Color.BLACK;
      case Rank.RED:
        return Color.RED;
    }
  }

  compare(card: Card): number {
    if (this.fishSuit - card.fishSuit) {
      return this.fishSuit - card.fishSuit;
    } else if (this.cardSuit - card.cardSuit) {
      return this.cardSuit - card.cardSuit;
    } else {
      return this.rank - card.rank;
    }
  }

  equals(card: Card): boolean {
    return this.compare(card) === 0;
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

const deckByFishSuit = _.groupBy([...genDeck()], "fishSuit");
export function* genFishSuit(suit: FishSuit): Generator<Card, void> {
  for (const card of deckByFishSuit[suit]) {
    yield new Card(card.cardSuit, card.rank);
  }
}

export class Hand {
  readonly cards: Card[] = [];
  keepSorted: boolean = false;

  constructor(cards: Iterable<Card> | Hand) {
    if ("cards" in cards) {
      // clone constructor
      for (const card of cards.cards) {
        this.insert(new Card(card.cardSuit, card.rank));
      }
    } else {
      // iterable case
      for (const card of cards) {
        this.insert(card);
      }
    }
  }

  get size(): number {
    return this.cards.length;
  }

  includes(card: Card): boolean {
    return this.cards.some((card_) => card_.equals(card));
  }

  insert(card: Card): void {
    this.cards.push(card);
    if (this.keepSorted) this.sort();
  }

  remove(card: Card): void {
    const idx = this.cards.findIndex((card_) => card_.equals(card));
    if (!assert(idx !== -1)) return;
    this.cards.splice(idx, 1);
  }

  removeSuit(fishSuit: FishSuit): void {
    _.remove(this.cards, (card) => card.fishSuit === fishSuit);
  }

  hasSuit(fishSuit: FishSuit): boolean {
    return this.cards.some((card) => card.fishSuit === fishSuit);
  }

  move(from: number, to: number): void {
    const [card] = this.cards.splice(from, 1);
    this.cards.splice(to, 0, card);
  }

  sort(): void {
    this.keepSorted = true;
    this.cards.sort((a, b) => a.compare(b));
  }

  toString(): string {
    const copy = new Hand(this.cards);
    copy.sort();
    return copy.cards.join(" ");
  }
}
