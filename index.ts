
"use strict";

import * as express from 'express';

class Coord {
    public readonly x: number;
    public readonly y: number;

    static cache: {[s: string]: Coord} = {};

    constructor(x: number, y: number) {
        let k = x + "|" + y;
        if (k in Coord.cache) {
            return Coord.cache[k];
        }
        this.x = x;
        this.y = y;
        Coord.cache[k] = this;
    }
}



type GameType = {
    board: Map<Coord, number>,
};

const game: GameType = {
    board: new Map(),
};

const app = express();

app.get("/", (req, res) => {
    res.send("hello world");
});

app.use("/play.html", express.static("play.html"));

app.listen(3000, () => {
    console.log("overboard is now listening on port 3000");
});
