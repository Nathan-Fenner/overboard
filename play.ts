
import {ViewState, Move, Area} from './common';

function makeMove(move: Move) {
    let req = new XMLHttpRequest();
    req.open("POST", "/move"); // TODO: async
    req.setRequestHeader('Content-Type', 'application/json')
    req.send(JSON.stringify(move));
}

function updateDisplay(view: ViewState) {
    const elements = {
        oceanChallengeCount: null as any as HTMLDivElement,
        forestChallengeCount: null as any as HTMLDivElement,
        beachChallengeCount: null as any as HTMLDivElement,
        oceanChallengeAttempt: null as any as HTMLButtonElement,
        forestChallengeAttempt: null as any as HTMLButtonElement,
        beachChallengeAttempt: null as any as HTMLButtonElement,

        remainingEnergy: null as any as HTMLDivElement,
        playerDeckSize: null as any as HTMLDivElement,
        playerHand: null as any as HTMLDivElement,
        drawAttempt: null as any as HTMLButtonElement,
    };
    for (let id in elements) {
        (elements as any)[id] = document.getElementById(id);
    }

    elements.beachChallengeCount.innerText = `The beach has ${view.challengeDeckSizes.beach} remaining challenges.`;
    elements.oceanChallengeCount.innerText = `The ocean has ${view.challengeDeckSizes.ocean} remaining challenges.`;
    elements.forestChallengeCount.innerText = `The forest has ${view.challengeDeckSizes.forest} remaining challenges.`;
    
    elements.remainingEnergy.innerText = `You have ${view.playerEnergy} unspent energy this turn.`;

    elements.playerDeckSize.innerText = `Your deck has ${view.playerDeckSize} cards.`;

    if (view.mode == "draw") {
        elements.playerHand.innerText = "Draw your hand!";
        elements.drawAttempt.hidden = false;
        elements.drawAttempt.onclick = () => makeMove({move: "draw"});
        elements.beachChallengeAttempt.hidden = true;
        elements.oceanChallengeAttempt.hidden = true;
        elements.forestChallengeAttempt.hidden = true;
    } else {
        elements.playerHand.innerText = view.playerHand.map(card => JSON.stringify(card)).join("  ;;; ");
        elements.drawAttempt.hidden = true;
        elements.beachChallengeAttempt.hidden = false;
        elements.oceanChallengeAttempt.hidden = false;
        elements.forestChallengeAttempt.hidden = false;
        elements.beachChallengeAttempt.onclick = () => makeMove({move: "buy", area: "beach"});
        elements.oceanChallengeAttempt.onclick = () => makeMove({move: "buy", area: "ocean"});
        elements.forestChallengeAttempt.onclick = () => makeMove({move: "buy", area: "forest"});
    }
}

setInterval(() => {
    let req = new XMLHttpRequest();
    req.open("GET", "/state");
    req.send();
    req.onload = () => {
        // TODO: guarantee in-order application.
        updateDisplay(JSON.parse(req.responseText));
    };
}, 1000);

