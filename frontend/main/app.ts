
import { GameController } from './GameController.js';

// 创建全局游戏控制器实例
const gameController = new GameController();

// 页面加载完成后的初始化
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎱 台球游戏已加载');
    console.log('点击"开始新游戏"按钮开始游戏！');

    // 添加按钮事件监听器
    document.getElementById('newGameBtn')?.addEventListener('click', () => gameController.startNewGame());
    document.getElementById('strikeBtn')?.addEventListener('click', () => gameController.handleStrike());
    document.getElementById('randomStrikeBtn')?.addEventListener('click', () => gameController.randomStrike());
    document.getElementById('resetBtn')?.addEventListener('click', () => gameController.resetGame());
});

// 导出控制器（如果需要在其他模块中使用）
export { gameController };
