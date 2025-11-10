import { Game } from './Game';
import { Renderer } from './Renderer';
import { GameUI } from './GameUI';
import type { Vector, BallState, TurnReport, Player } from './type';

export class GameController {
    private game: Game;
    private renderer: Renderer;
    private gameUI: GameUI;

    constructor(game: Game, renderer: Renderer, gameUI: GameUI) {
        this.game = game;
        this.renderer = renderer;
        this.gameUI = gameUI;
    }

    start(): void {
        this.game.start();
    }

    stop(): void {
        this.game.stop();
    }

    update(): void {
        this.game.update();
    }

    getGame(): Game {
        return this.game;
    }

    getRenderer(): Renderer {
        return this.renderer;
    }

    getGameUI(): GameUI {
        return this.gameUI;
    }
}
