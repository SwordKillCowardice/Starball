import React, { useEffect } from 'react';
import './game.css';
// 迁移后的核心控制器
import { GameController } from './logic/GameController';

const Game = () => {
    useEffect(() => {
        // 初始化台球控制器
        const gameController = new GameController();
        // 按钮事件绑定
        document.getElementById('newGameBtn')?.addEventListener('click', () => gameController.startNewGame());
        document.getElementById('strikeBtn')?.addEventListener('click', () => gameController.handleStrike());
        document.getElementById('randomStrikeBtn')?.addEventListener('click', () => gameController.randomStrike());
        document.getElementById('resetBtn')?.addEventListener('click', () => gameController.resetGame());
        // 页面卸载时清理
        return () => {
            gameController.resetGame();
        };
    }, []);

    return (
        <div className="game-container">
            <h1>🎱 明星台球</h1>
            <div className="game-state" id="gameState">准备开始游戏...</div>
            <div className="players-info">
                <div className="player-info active" id="player1Info">
                    <div className="player-name">👤 玩家 1</div>
                    <div className="player-score">进球: <span id="p1Score">0</span></div>
                    <div className="player-type" id="player1Type">未确定</div>
                </div>
                <div className="vs-divider">VS</div>
                <div className="player-info" id="player2Info">
                    <div className="player-name">👤 玩家 2</div>
                    <div className="player-score">进球: <span id="p2Score">0</span></div>
                    <div className="player-type" id="player2Type">未确定</div>
                </div>
            </div>
            <div className="canvas-wrapper">
                <canvas id="gameCanvas" width="800" height="400"></canvas>
                <canvas id="aimCanvas" width="800" height="400"></canvas>
            </div>
            <div className="strike-controls">
                <div className="control-row">
                    <label htmlFor="powerSlider">⚡ 力度:</label>
                    <input type="range" id="powerSlider" min="100" max="3000" defaultValue="100" />
                    <span className="value-display" id="powerValue">100</span>
                </div>
                <div className="control-row">
                    <label htmlFor="angleSlider">🎯 角度:</label>
                    <input type="range" id="angleSlider" min="0" max="360" defaultValue="0" />
                    <span className="value-display" id="angleValue">0°</span>
                </div>
            </div>
            <div className="controls">
                <button id="newGameBtn">🎮 开始新游戏</button>
                <button id="strikeBtn" disabled>⚡ 击球</button>
                <button id="randomStrikeBtn" className="secondary">🎲 随机击球</button>
                <button id="resetBtn" className="danger">🔄 重置</button>
            </div>
            <div id="gameLog" className="game-log">
                <div className="log-messages"></div>
            </div>
            <div id="winnerOverlay">
                <div id="winnerText"></div>
            </div>
        </div>
    );
};

export default Game;
