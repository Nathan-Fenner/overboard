import * as express from 'express';
import * as bodyParser from 'body-parser';

import {Area, RewardCard, BonusCard, Deck, Hand, ChallengeCard, Move, ViewState} from './common';


// Removes the hand from the deck.
function drawHand(deck: Deck<RewardCard>, count: number): Hand {
    let hand: Hand = { cards: [] };
    while (deck.size() > 0 && count > 0) {
        hand.cards.push(deck.draw());
        count--;
    }
    return hand;
}

function drawBonus(deck: Deck<BonusCard>, type: Area) {
    let bonus = deck.draw();
    while (bonus.bonusType != type){
        deck.insert(bonus);
        bonus = deck.draw();
    }
    return bonus;
}

function drawReward(deck: Deck<RewardCard>, type: Area) {
    let reward = deck.draw();
    while (reward.rewardType != type){
        deck.insert(reward);
        reward = deck.draw();
    }
    return reward;
}

type GameDrawState = {
    type: "draw",
}

type GamePlayState = {
    type: "play",
    hand: Hand,
    energy: number,
}

type GameState = GameDrawState | GamePlayState

type Game = {
    challengeDecks: {[area in Area]: Deck<ChallengeCard>},
    playerDeck: Deck<RewardCard>,
    rewardDeck: Deck<RewardCard>,
    bonusDeck: Deck<BonusCard>,
    state: GameState,
}

const gameState: Game = {
    challengeDecks: {
        beach: new Deck(),
        ocean: new Deck(),
        forest: new Deck(),
    },
    playerDeck: new Deck(),
    rewardDeck: new Deck(),
    bonusDeck: new Deck(),
    state: {type: "draw"},
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
    if (gameState.state.type != "draw") {
        throw "invalid - game not in 'draw' state";
    }
    let hand = drawHand(gameState.playerDeck, 5);
    gameState.state = {
        type: "play",
        hand: hand,
        energy: hand.cards.reduce((a, b) => a + b.energyStores, 0),
    };
}

function moveBuyChallenge(challenge: ChallengeCard) {
    if (gameState.state.type != "play"){
        throw "invalid - game not in 'play' state";
    }
    // verify user has enough energy
    if (gameState.state.energy < challenge.challengeCost) {
        throw "invalid - not enough engergy to buy this challenge"
    }
    gameState.state.energy -= challenge.challengeCost;
    // Choose an outcome
    let outcome = Math.random() * challenge.challengeOutcomes.length | 0;
    let result = challenge.challengeOutcomes[outcome];

    if (result.outcomeType == "reward") {
        drawReward(gameState.rewardDeck, challenge.challengeType);
    }
    if (result.outcomeType == "bonus") {
        drawBonus(gameState.bonusDeck, challenge.challengeType);
    }
    if (result.outcomeType == "discard") {
        //TO DO Discard
    }
}

function moveBuy3() {
    if (gameState.state.type != "play") {
        throw "invalid - game not in 'play' state";
    }
    if (gameState.state.energy < 4) {
        throw "invalid - not enough energy to buy a 3";
    }
    gameState.state.energy -= 4;
    gameState.playerDeck.insert({
        rewardType: "starter",
        rarityType: "rare",
        provisions: 1,
        shipParts: 1,
        energyStores: 4,
    });
}

function moveEnd() {
    if (gameState.state.type != "play") {
        throw "invalid - game not in 'play' state";
    }
    // put the cards back
    for (let card of gameState.state.hand.cards) {
        gameState.playerDeck.insert(card);
    }
    gameState.state = {type: "draw"};
}

const app = express();

app.use(bodyParser.json());

function renderViewState(): ViewState {
    if (gameState.state.type == "draw") {
        return {
            state: "draw",
            deckSize: gameState.playerDeck.size()
        };
    } else {
        return {
            state: "play",
            hand: gameState.state.hand,
            deckSize: gameState.playerDeck.size(),
        }
    }
}


app.get("/state", (req, res) => {
    res.send(JSON.stringify(renderViewState()));
});

app.post("/move", (req, res, next) => {
    let move: Move = req.body;
    if (move.move == "draw") {
        moveStart();
    }
    if (move.move == "end") {
        moveEnd();
    }
    if (move.move == "buy3") {
        moveBuy3();
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

