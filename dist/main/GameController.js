import Game from '../GameLogic/Game.js';
import { Renderer } from './Renderer.js';
import { GameUI } from './GameUI.js';
/**
 * 游戏控制器 - 协调游戏逻辑、渲染和UI
 */
export class GameController {
    constructor() {
        this.isRunning = false;
        this.animationFrameId = null;
        this.lastTime = 0;
        // 玩家数据
        this.players = [];
        this.playerScores = new Map();
        this.game = new Game();
        this.renderer = new Renderer('gameCanvas', 'aimCanvas');
        this.ui = new GameUI();
        this.setupGameCallbacks();
        this.setupUICallbacks();
    }
    /**
     * 设置游戏模块的回调
     */
    setupGameCallbacks() {
        // 回合结束回调
        this.game.onTurnEnd((report) => {
            this.handleTurnEnd(report);
        });
        // 状态更新回调（每帧）
        this.game.onStateUpdate((ballStates) => {
            this.renderer.render(ballStates);
        });
        // 游戏结束回调
        this.game.onGameOver((winnerId) => {
            this.handleGameOver(winnerId);
        });
    }
    /**
     * 设置UI回调
     */
    setupUICallbacks() {
        // 力度滑块变化
        this.ui.onPowerChange((power) => {
            // 可以在这里添加预览效果
        });
        // 角度滑块变化
        this.ui.onAngleChange((angle) => {
            // 更新瞄准线
            const cueBall = this.game.getBallStates().find(b => b.id === 0);
            if (cueBall && !cueBall.isPocketed) {
                this.renderer.drawAimLine(cueBall.position, angle);
            }
        });
    }
    /**
     * 开始新游戏
     */
    startNewGame() {
        this.ui.log('开始新游戏...', 'success');
        // 创建玩家
        this.players = [
            { id: 'player1', name: '玩家 1', ballType: null },
            { id: 'player2', name: '玩家 2', ballType: null }
        ];
        // 初始化分数
        this.playerScores.set('player1', 0);
        this.playerScores.set('player2', 0);
        // 生成初始球局
        const initialBalls = this.generateInitialBalls();
        // 初始化游戏
        this.game.setup(this.players, initialBalls);
        // 更新UI
        this.ui.updatePlayers(this.players, 'player1');
        this.ui.updateScores(this.playerScores);
        this.ui.setState('等待玩家 1 击球');
        this.ui.enableStrikeButton(true);
        this.ui.hideWinner();
        // 渲染初始画面
        this.renderer.render(this.game.getBallStates());
        // 启动游戏循环
        this.startGameLoop();
        this.ui.log('游戏已开始，玩家 1 先手', 'success');
    }
    /**
     * 生成初始球局（三角形摆放）
     */
    generateInitialBalls() {
        const balls = [];
        // 母球
        balls.push({
            id: 0,
            position: { x: 200, y: 200 },
            isPocketed: false
        });
        // 三角形摆放彩球
        const startX = 580;
        const startY = 200;
        const ballRadius = 15;
        const gap = 2;
        const spacing = (ballRadius * 2) + gap;
        let ballId = 1;
        for (let row = 0; row < 5; row++) {
            for (let col = 0; col <= row; col++) {
                const x = startX + row * spacing * Math.sqrt(3) / 2;
                const y = startY + (col - row / 2) * spacing;
                balls.push({
                    id: ballId++,
                    position: { x, y },
                    isPocketed: false
                });
                if (ballId > 15)
                    break;
            }
            if (ballId > 15)
                break;
        }
        return balls;
    }
    /**
     * 处理击球
     */
    handleStrike() {
        const state = this.game.getCurrentState();
        if (state !== 'aiming') {
            this.ui.log('当前无法击球', 'warning');
            return;
        }
        // 获取力度和角度
        const power = this.ui.getPower();
        const angle = this.ui.getAngle();
        // 计算力向量
        const angleRad = (angle * Math.PI) / 180;
        const force = {
            x: Math.cos(angleRad) * power,
            y: Math.sin(angleRad) * power
        };
        // 执行击球
        this.game.strike(force);
        // 更新UI
        this.ui.enableStrikeButton(false);
        this.ui.setState('球正在运动中...');
        this.renderer.clearAimLine();
        this.ui.log(`击球：力度=${power}, 角度=${angle}°`, 'success');
    }
    /**
     * 随机击球
     */
    randomStrike() {
        const randomPower = Math.floor(Math.random() * 100) + 30;
        const randomAngle = Math.floor(Math.random() * 360);
        this.ui.setPower(randomPower);
        this.ui.setAngle(randomAngle);
        // 延迟一下再击球，让用户看到参数变化
        setTimeout(() => {
            this.handleStrike();
        }, 300);
    }
    /**
     * 重置游戏
     */
    resetGame() {
        this.stopGameLoop();
        this.game = new Game();
        this.setupGameCallbacks();
        this.ui.setState('准备开始游戏...');
        this.ui.enableStrikeButton(false);
        this.ui.clearLog();
        this.ui.log('游戏已重置', 'success');
        this.renderer.clear();
        this.renderer.clearAimLine();
    }
    /**
     * 处理回合结束
     */
    handleTurnEnd(report) {
        // 更新分数
        if (report.pocketedBallIds.length > 0) {
            const currentScore = this.playerScores.get(report.nextPlayerId) || 0;
            this.playerScores.set(report.nextPlayerId, currentScore + report.pocketedBallIds.length);
            this.ui.updateScores(this.playerScores);
        }
        // 记录日志
        if (report.isFoul) {
            this.ui.log('犯规！交换击球权', 'error');
        }
        else if (report.pocketedBallIds.length > 0) {
            this.ui.log(`进球：${report.pocketedBallIds.join(', ')}`, 'success');
        }
        else {
            this.ui.log('未进球，交换击球权', 'warning');
        }
        // 如果游戏未结束
        if (!report.turnWinnerId) {
            // 更新当前玩家
            this.ui.updatePlayers(this.players, report.nextPlayerId);
            const nextPlayer = this.players.find(p => p.id === report.nextPlayerId);
            this.ui.setState(`等待 ${nextPlayer?.name} 击球`);
            // 重新启用击球按钮
            this.ui.enableStrikeButton(true);
            // 显示瞄准线
            setTimeout(() => {
                const cueBall = this.game.getBallStates().find(b => b.id === 0);
                if (cueBall && !cueBall.isPocketed) {
                    this.renderer.drawAimLine(cueBall.position, this.ui.getAngle());
                }
            }, 100);
        }
    }
    /**
     * 处理游戏结束
     */
    handleGameOver(winnerId) {
        const winner = this.players.find(p => p.id === winnerId);
        this.ui.setState('游戏结束');
        this.ui.enableStrikeButton(false);
        this.ui.showWinner(winner?.name || winnerId);
        this.ui.log(`🏆 ${winner?.name} 获胜！`, 'success');
        this.stopGameLoop();
    }
    /**
     * 启动游戏循环
     */
    startGameLoop() {
        if (this.isRunning)
            return;
        this.isRunning = true;
        this.lastTime = performance.now();
        const loop = (currentTime) => {
            if (!this.isRunning)
                return;
            const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.05);
            this.lastTime = currentTime;
            // 更新游戏状态
            this.game.update(deltaTime);
            // 继续循环
            this.animationFrameId = requestAnimationFrame(loop);
        };
        this.animationFrameId = requestAnimationFrame(loop);
    }
    /**
     * 停止游戏循环
     */
    stopGameLoop() {
        this.isRunning = false;
        if (this.animationFrameId !== null) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }
}
//# sourceMappingURL=GameController.js.map