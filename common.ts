export type Area = "beach" | "ocean" | "forest";

export type ViewState = {
    state: "draw",
    deckSize: number,
} | {
    state: "play",
    hand: Hand,
    deckSize: number,
};

export type Move = {move: "draw"} | {move: "end"} | {move: "buy3", using: number[]};


export type RewardCard = {
    rewardType:     Area | "starter";
    rarityType:     "rare" | "common";
    shipParts: number; // use towards end game
    provisions: number; // use towards end game
    energyStores: number; // shuffles into deck, use to buy future challenge cards 
};

export type ChallengeCard = {
    challengeCost: number;
    challengeType: Area;
    challengeText: string;
    challengeOutcomes: Outcome[]; 
};

export type Outcome = {
    outcomeType: "reward" | "bonus" | "discard" | "nothing";
}

export type BonusCard = {
    bonusType: string;
    bonusText: string;
}

export class Deck<T> {
    private cards: T[];
    constructor() {
        this.cards = [];
    }
    draw(): T {
        if (this.cards.length == 0) {
            throw "cannot draw from empty deck";
        }
        let index = Math.random() * this.cards.length | 0;
        let out = this.cards[index];
        this.cards[index] = this.cards[this.cards.length-1];
        this.cards.pop();
        return out;
    }
    size(): number {
        return this.cards.length;
    }
    insert(card: T) {
        this.cards.push(card);
    }
    discardRandom() {
        let index = Math.random() * this.cards.length | 0;
        this.cards[index] = this.cards[this.cards.length-1];
        this.cards.pop();
    }
}

export type Hand = {
    cards: RewardCard[]
};


