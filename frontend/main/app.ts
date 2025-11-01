
import { GameController } from './GameController.js';

// 创建全局游戏控制器实例
const gameController = new GameController();

// 将控制器挂载到window对象，以便HTML中的onclick可以访问
(window as any).gameController = gameController;

// 页面加载完成后的初始化
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎱 台球游戏已加载');
    console.log('点击"开始新游戏"按钮开始游戏！');
});

// 导出控制器（如果需要在其他模块中使用）
export { gameController };
