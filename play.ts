

import {ViewState, Move} from './common';

type VisibleState = {
    hand: number[],
    deckSize: number,
    state: "start" | "play",
}

let viewElement = document.getElementById("gamestate") as HTMLDivElement;
let startButton = document.getElementById("start-button") as HTMLButtonElement;

function makeMove(move: Move) {
    let req = new XMLHttpRequest();
    req.open("POST", "/move"); // TODO: async
    req.setRequestHeader('Content-Type', 'application/json')
    req.send(JSON.stringify(move));
}

startButton.addEventListener("click", e => {
    makeMove({move: "draw"});
});

function updateDisplay() {
    let req = new XMLHttpRequest();
    req.open("GET", "/state", false); // TODO: async
    req.send();
    let view = JSON.parse(req.responseText) as VisibleState;

    viewElement.innerText = `Current State: ${view.state}. Your hand is [${view.hand.join()}]. Your deck has ${view.deckSize} other cards.`;
    startButton.hidden = view.state != "start";
}

setInterval(() => {
    updateDisplay();
}, 1000);

