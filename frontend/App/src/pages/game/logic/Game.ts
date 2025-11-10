export type Player = {
    id: string;
    name: string;
    ballType: 'solid' | 'striped' | null;
};

export class Game {
    players: Player[];
    currentPlayer: number;
    gameOver: boolean;

    constructor() {
        this.players = [];
        this.currentPlayer = 0;
        this.gameOver = false;
    }

    addPlayer(player: Player) {
        this.players.push(player);
    }

    nextPlayer() {
        this.currentPlayer = (this.currentPlayer + 1) % this.players.length;
    }

    isGameOver(): boolean {
        return this.gameOver;
    }

    start(): void {
        // 游戏开始逻辑
    }

    stop(): void {
        // 游戏停止逻辑
    }

    update(): void {
        // 游戏更新逻辑
    }
}
