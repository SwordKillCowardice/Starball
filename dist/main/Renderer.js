/**
 * 渲染器 - 负责绘制游戏画面
 */
export class Renderer {
    constructor(canvasId, aimCanvasId) {
        // 球的颜色配置
        this.BALL_COLORS = {
            0: '#FFFFFF', // 母球（白色）
            1: '#FFD700', // 1号（黄色）
            2: '#0000FF', // 2号（蓝色）
            3: '#FF0000', // 3号（红色）
            4: '#800080', // 4号（紫色）
            5: '#FFA500', // 5号（橙色）
            6: '#008000', // 6号（绿色）
            7: '#8B0000', // 7号（深红）
            8: '#000000', // 8号（黑色）
            9: '#FFD700', // 9号（黄条）
            10: '#0000FF', // 10号（蓝条）
            11: '#FF0000', // 11号（红条）
            12: '#800080', // 12号（紫条）
            13: '#FFA500', // 13号（橙条）
            14: '#008000', // 14号（绿条）
            15: '#8B0000', // 15号（深红条）
        };
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.aimCanvas = document.getElementById(aimCanvasId);
        this.aimCtx = this.aimCanvas.getContext('2d');
        if (!this.ctx || !this.aimCtx) {
            throw new Error('无法获取Canvas上下文');
        }
    }
    /**
     * 渲染游戏画面
     */
    render(ballStates) {
        this.clear();
        this.drawTable();
        this.drawPockets();
        this.drawBalls(ballStates);
    }
    /**
     * 清空画布
     */
    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    /**
     * 清空瞄准线
     */
    clearAimLine() {
        this.aimCtx.clearRect(0, 0, this.aimCanvas.width, this.aimCanvas.height);
    }
    /**
     * 绘制球台
     */
    drawTable() {
        // 台面
        this.ctx.fillStyle = '#0f4d0f';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        // 边框
        this.ctx.strokeStyle = '#8B4513';
        this.ctx.lineWidth = 8;
        this.ctx.strokeRect(4, 4, this.canvas.width - 8, this.canvas.height - 8);
        // 开球线
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);
        this.ctx.beginPath();
        this.ctx.moveTo(250, 30);
        this.ctx.lineTo(250, this.canvas.height - 30);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
    }
    /**
     * 绘制袋口
     */
    drawPockets() {
        const pockets = [
            { x: 30, y: 30 },
            { x: this.canvas.width / 2, y: 30 },
            { x: this.canvas.width - 30, y: 30 },
            { x: 30, y: this.canvas.height - 30 },
            { x: this.canvas.width / 2, y: this.canvas.height - 30 },
            { x: this.canvas.width - 30, y: this.canvas.height - 30 }
        ];
        pockets.forEach(pocket => {
            // 外圈
            this.ctx.fillStyle = '#000000';
            this.ctx.beginPath();
            this.ctx.arc(pocket.x, pocket.y, 22, 0, Math.PI * 2);
            this.ctx.fill();
            // 内圈
            this.ctx.fillStyle = '#1a1a1a';
            this.ctx.beginPath();
            this.ctx.arc(pocket.x, pocket.y, 18, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }
    /**
     * 绘制所有球
     */
    drawBalls(ballStates) {
        ballStates.forEach(ball => {
            if (!ball.isPocketed) {
                this.drawBall(ball);
            }
        });
    }
    /**
     * 绘制单个球
     */
    drawBall(ball) {
        const pos = ball.position;
        const radius = 15;
        // 阴影
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        this.ctx.shadowBlur = 10;
        this.ctx.shadowOffsetX = 3;
        this.ctx.shadowOffsetY = 3;
        // 球体
        this.ctx.fillStyle = this.BALL_COLORS[ball.id] || '#CCCCCC';
        this.ctx.beginPath();
        this.ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
        this.ctx.fill();
        // 重置阴影
        this.ctx.shadowColor = 'transparent';
        this.ctx.shadowBlur = 0;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;
        // 高光
        const gradient = this.ctx.createRadialGradient(pos.x - 5, pos.y - 5, 0, pos.x - 5, pos.y - 5, radius);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
        this.ctx.fill();
        // 球号
        if (ball.id !== 0) {
            this.ctx.fillStyle = ball.id === 8 ? '#FFFFFF' : '#000000';
            this.ctx.font = 'bold 12px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(ball.id.toString(), pos.x, pos.y);
        }
        // 花色球的条纹（9-15号）
        if (ball.id >= 9 && ball.id <= 15) {
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.fillRect(pos.x - radius, pos.y - 3, radius * 2, 6);
        }
    }
    /**
     * 绘制瞄准线
     */
    drawAimLine(cueBallPos, angle) {
        this.clearAimLine();
        const angleRad = (angle * Math.PI) / 180;
        const length = 150;
        const endX = cueBallPos.x + Math.cos(angleRad) * length;
        const endY = cueBallPos.y + Math.sin(angleRad) * length;
        // 绘制虚线
        this.aimCtx.strokeStyle = 'rgba(255, 255, 0, 0.8)';
        this.aimCtx.lineWidth = 3;
        this.aimCtx.setLineDash([10, 5]);
        this.aimCtx.beginPath();
        this.aimCtx.moveTo(cueBallPos.x, cueBallPos.y);
        this.aimCtx.lineTo(endX, endY);
        this.aimCtx.stroke();
        this.aimCtx.setLineDash([]);
        // 绘制箭头
        const arrowSize = 10;
        const arrowAngle = Math.PI / 6;
        this.aimCtx.fillStyle = 'rgba(255, 255, 0, 0.8)';
        this.aimCtx.beginPath();
        this.aimCtx.moveTo(endX, endY);
        this.aimCtx.lineTo(endX - arrowSize * Math.cos(angleRad - arrowAngle), endY - arrowSize * Math.sin(angleRad - arrowAngle));
        this.aimCtx.lineTo(endX - arrowSize * Math.cos(angleRad + arrowAngle), endY - arrowSize * Math.sin(angleRad + arrowAngle));
        this.aimCtx.closePath();
        this.aimCtx.fill();
    }
}
//# sourceMappingURL=Renderer.js.map