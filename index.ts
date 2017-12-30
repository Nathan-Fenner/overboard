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
    playerBonusDeck: Deck<BonusCard>,
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
    playerBonusDeck: new Deck(),
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

function createTestBeach() {
    gameState.challengeDecks.beach.insert({
        challengeCost: 2,
        challengeType: "beach",
        challengeText: "This is a test beach card 1.",
        challengeOutcomes: [{outcomeType: "discard"}, {outcomeType: "reward"}, {outcomeType: "discard"} ],
    })
    gameState.challengeDecks.beach.insert({
        challengeCost: 3,
        challengeType: "beach",
        challengeText: "This is a test beach card 2.",
        challengeOutcomes: [{outcomeType: "nothing"}, {outcomeType: "nothing"}, {outcomeType: "reward"} ],
    })
    gameState.challengeDecks.beach.insert({
        challengeCost: 5,
        challengeType: "beach",
        challengeText: "This is a test beach card 3.",
        challengeOutcomes: [{outcomeType: "bonus"}, {outcomeType: "reward"}, {outcomeType: "discard"} ],
    })
    gameState.challengeDecks.beach.insert({
        challengeCost: 7,
        challengeType: "beach",
        challengeText: "This is a test beach card 4.",
        challengeOutcomes: [{outcomeType: "reward"}, {outcomeType: "reward"}, {outcomeType: "reward"} ],
    })
    gameState.challengeDecks.beach.insert({
        challengeCost: 8,
        challengeType: "beach",
        challengeText: "This is a test beach card. 5",
        challengeOutcomes: [{outcomeType: "reward"}, {outcomeType: "discard"} ],
    })
}

function createTestOcean() {
    gameState.challengeDecks.ocean.insert({
        challengeCost: 2,
        challengeType: "ocean",
        challengeText: "This is a test ocean card 1.",
        challengeOutcomes: [{outcomeType: "discard"}, {outcomeType: "reward"}, {outcomeType: "discard"} ],
    })
    gameState.challengeDecks.ocean.insert({
        challengeCost: 3,
        challengeType: "ocean",
        challengeText: "This is a test ocean card 2.",
        challengeOutcomes: [{outcomeType: "nothing"}, {outcomeType: "nothing"}, {outcomeType: "reward"} ],
    })
    gameState.challengeDecks.ocean.insert({
        challengeCost: 5,
        challengeType: "ocean",
        challengeText: "This is a test ocean card 3.",
        challengeOutcomes: [{outcomeType: "bonus"}, {outcomeType: "reward"}, {outcomeType: "discard"} ],
    })
    gameState.challengeDecks.ocean.insert({
        challengeCost: 7,
        challengeType: "ocean",
        challengeText: "This is a test ocean card 4.",
        challengeOutcomes: [{outcomeType: "reward"}, {outcomeType: "reward"}, {outcomeType: "reward"} ],
    })
    gameState.challengeDecks.ocean.insert({
        challengeCost: 8,
        challengeType: "ocean",
        challengeText: "This is a shark.",
        challengeOutcomes: [{outcomeType: "reward"}, {outcomeType: "discard"} ],
    })
}

function createTestForest() {
    gameState.challengeDecks.forest.insert({
        challengeCost: 2,
        challengeType: "forest",
        challengeText: "This is a test forest card 1.",
        challengeOutcomes: [{outcomeType: "discard"}, {outcomeType: "reward"}, {outcomeType: "discard"} ],
    })
    gameState.challengeDecks.forest.insert({
        challengeCost: 3,
        challengeType: "forest",
        challengeText: "This is a test forest card 2.",
        challengeOutcomes: [{outcomeType: "nothing"}, {outcomeType: "nothing"}, {outcomeType: "reward"} ],
    })
    gameState.challengeDecks.forest.insert({
        challengeCost: 5,
        challengeType: "forest",
        challengeText: "This is a test forest card 3.",
        challengeOutcomes: [{outcomeType: "bonus"}, {outcomeType: "reward"}, {outcomeType: "discard"} ],
    })
    gameState.challengeDecks.forest.insert({
        challengeCost: 7,
        challengeType: "forest",
        challengeText: "This is a test forest card 4.",
        challengeOutcomes: [{outcomeType: "reward"}, {outcomeType: "reward"}, {outcomeType: "reward"} ],
    })
    gameState.challengeDecks.forest.insert({
        challengeCost: 8,
        challengeType: "forest",
        challengeText: "This is a test forest card. 5",
        challengeOutcomes: [{outcomeType: "reward"}, {outcomeType: "discard"} ],
    })
}

function createTestReward() {
    gameState.rewardDeck.insert({
        rewardType:     "beach",
        rarityType:     "common",
        shipParts: 0, // use towards end game
        provisions: 0, // use towards end game
        energyStores: 12,
    })
    gameState.rewardDeck.insert({
        rewardType:     "beach",
        rarityType:     "rare",
        shipParts: 32, // use towards end game
        provisions: 393, // use towards end game
        energyStores: 9001,
    })
    gameState.rewardDeck.insert({
        rewardType:     "ocean",
        rarityType:     "common",
        shipParts: 0, // use towards end game
        provisions: 1, // use towards end game
        energyStores: 0,
    })
    gameState.rewardDeck.insert({
        rewardType:     "ocean",
        rarityType:     "rare",
        shipParts: 3000, // use towards end game
        provisions: 100, // use towards end game
        energyStores: 120,
    })
    gameState.rewardDeck.insert({
        rewardType:     "forest",
        rarityType:     "common",
        shipParts: 30, // use towards end game
        provisions: 0, // use towards end game
        energyStores: 0,
    })
    gameState.rewardDeck.insert({
        rewardType:     "forest",
        rarityType:     "rare",
        shipParts: 100, // use towards end game
        provisions: 20, // use towards end game
        energyStores: -12,
    })
    gameState.rewardDeck.insert({
        rewardType:     "ocean",
        rarityType:     "common",
        shipParts: 0, // use towards end game
        provisions: 0, // use towards end game
        energyStores: 12,
    })
    gameState.rewardDeck.insert({
        rewardType:     "beach",
        rarityType:     "common",
        shipParts: 0, // use towards end game
        provisions: 2, // use towards end game
        energyStores: 2,
    })
    gameState.rewardDeck.insert({
        rewardType:     "forest",
        rarityType:     "common",
        shipParts: 2, // use towards end game
        provisions: 2, // use towards end game
        energyStores: 2,
    })
    gameState.rewardDeck.insert({
        rewardType:     "beach",
        rarityType:     "common",
        shipParts: 0, // use towards end game
        provisions: 0, // use towards end game
        energyStores: 1,
    })
}

function createTestBonus(){
    gameState.bonusDeck.insert({
        bonusType: "Anti-Shark Mechanism",
        bonusText: "Wow! This really sharp object will really help me keep sharks away!",
    })
    gameState.bonusDeck.insert({
        bonusType: "Anti-Shark Mechanism",
        bonusText: "Wow! This really sharp object will really help me keep sharks away!",
    })
    gameState.bonusDeck.insert({
        bonusType: "Anti-Shark Mechanism",
        bonusText: "Wow! This really sharp object will really help me keep sharks away!",
    })
    gameState.bonusDeck.insert({
        bonusType: "Anti-Shark Mechanism",
        bonusText: "Wow! This really sharp object will really help me keep sharks away!",
    })
    gameState.bonusDeck.insert({
        bonusType: "Anti-Shark Mechanism",
        bonusText: "Wow! This really sharp object will really help me keep sharks away!",
    })
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

    if (challenge.challengeText = "This is a shark.") {
        if (gameState.playerBonusDeck.cards.some(card => card.bonusType == "Anti-Shark Mechanism")) {
            result.outcomeType = "reward";
        }

    } // shark provision

    if (result.outcomeType == "reward") {
        let resultCard = drawReward(gameState.rewardDeck, challenge.challengeType);
        gameState.playerDeck.insert(resultCard);
    }
    if (result.outcomeType == "bonus") {
        let bonusCard = drawBonus(gameState.bonusDeck, challenge.challengeType);
        gameState.playerBonusDeck.insert(bonusCard);
    }
    if (result.outcomeType == "discard") {
        gameState.playerDeck.discardRandom();
    }
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
    if (move.move == "buy") {
        moveBuyChallenge(gameState.challengeDecks[move.area].draw());
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

