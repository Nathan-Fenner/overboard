import * as express from 'express';
import * as bodyParser from 'body-parser';

type RewardCard = {
    rewardType:     "beach" | "ocean" | "forest" | "starter";
    rarityType:     "rare" | "common";
    shipParts: number; // use towards end game
    provisions: number; // use towards end game
    energyStores: number; // shuffles into deck, use to buy future challenge cards 
};

type ChallengeCard = {
    challengeType: "beach" | "ocean" | "forest";
    challengeText: string;
    challengeOdds: number[]; //TODO
    challengeOutcomes: Outcome[];
};

type BonusCard = {
    bonusType: string;
    bonusText: string;
}

type Outcome = {
    outcomeType: "reward" | "bonus" | "discard" | "nothing";
}

class Deck<T> {
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
}

type Hand = {
    cards: RewardCard[]
};


// Removes the hand from the deck.
function drawHand(deck: Deck<RewardCard>, count: number): Hand {
    let hand: Hand = { cards: [] };
    while (deck.size() > 0 && count > 0) {
        hand.cards.push(deck.draw());
        count--;
    }
    return hand;
}

type GameType = {
    playerDeck: Deck<RewardCard>,
    playerHand: Hand,
    state:      "start" | "play",
}

const gameState: GameType = {
    playerDeck: new Deck(),
    playerHand: {cards:[]},
    state:      "start",
};

for (let i = 0; i < 7; i++) {
    gameState.playerDeck.insert({
        rewardType: "starter",
        rarityType: "common",
        provisions: 0,
        shipParts: 0,
        energyStores: (i%3)+1,
    });
}

function moveStart() {
    // draw the cards
    if (gameState.state != "start") {
        throw "invalid - game not in 'start' state";
    }
    gameState.playerHand = drawHand(gameState.playerDeck, 5);
    gameState.state = "play";
}

function moveBuy3(handIndices: number[]) {
    if (gameState.state != "play") {
        throw "invalid - game not in 'play' state";
    }
    handIndices.sort();
    let totalValue = 0;
    for (let i = 0; i < handIndices.length; i++) {
        if (handIndices.indexOf(handIndices[i]) < i) {
            throw "invalid - duplicate selected card";
        }
        totalValue += handIndices[i];
    }
    if (totalValue < 4) {
        throw "invalid - not enough money to buy a 3";
    }
    // must spend $4 to buy a 3
    let unspentHand: Hand = {cards: []};
    for (let i = 0; i < gameState.playerHand.cards.length; i++) {
        if (handIndices.indexOf(i) < 0) {
            unspentHand.cards.push(gameState.playerHand.cards[i]);
        } else {
            gameState.playerDeck.insert(gameState.playerHand.cards[i]);
        }
    }
    gameState.playerDeck.insert({
        rewardType: "starter",
        rarityType: "rare",
        provisions: 1,
        shipParts: 1,
        energyStores: 4,
    });
    gameState.playerHand = unspentHand;
}

function moveEnd() {
    if (gameState.state != "play") {
        throw "invalid - game not in 'play' state";
    }
    // put the cards back
    for (let card of gameState.playerHand.cards) {
        gameState.playerDeck.insert(card);
    }
    gameState.playerHand = {cards: []};
    gameState.state = "start";
}

const app = express();




app.use(bodyParser.json());
// app.use(app.router);

app.get("/state", (req, res) => {
    res.send(JSON.stringify({
        hand: gameState.playerHand.cards,
        deckSize: gameState.playerDeck.size(),
        state: gameState.state,
    }));
});

type Move = {move: "draw"} | {move: "end"} | {move: "buy3", using: number[]};
  
app.post("/move", (req, res, next) => {
    let move: Move = req.body;
    if (move.move == "draw") {
        moveStart();
    }
    if (move.move == "end") {
        moveEnd();
    }
    if (move.move == "buy3") {
        moveBuy3(move.using);
    }
});

app.get("/", (req, res) => {
    res.send("hello world");
});

app.use("/play.html", express.static("play.html"));
app.use("/play.js", express.static("play.js"));

app.listen(3000, () => {
    console.log("overboard is now listening on port 3000");
});
