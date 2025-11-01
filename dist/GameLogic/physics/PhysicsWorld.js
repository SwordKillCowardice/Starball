import { Table } from "./Table.js";
export class PhysicsWorld {
    constructor(tableWidth = 800, tableHeight = 400) {
        this.balls = new Map();
        this.table = new Table(tableWidth, tableHeight);
        this.resetTurnData();
    }
    /**
     * 添加球到物理世界
     */
    addBall(ball) {
        this.balls.set(ball.id, ball);
    }
    /**
     * 对指定的球施加力
     */
    applyForce(ballId, force) {
        const ball = this.balls.get(ballId);
        if (ball && !ball.isPocketed) {
            ball.applyForce(force);
        }
    }
    /**
     * 物理步进
     */
    step(deltaTime) {
        // 更新所有球的位置
        for (const ball of this.balls.values()) {
            ball.update(deltaTime);
        }
        // 检测并处理碰撞
        this.handleCollisions();
        // 检测进球
        this.checkPockets();
        // 处理边界碰撞
        for (const ball of this.balls.values()) {
            this.table.handleWallCollision(ball);
        }
    }
    /**
     * 处理球与球之间的碰撞
     */
    handleCollisions() {
        const ballArray = Array.from(this.balls.values());
        for (let i = 0; i < ballArray.length; i++) {
            for (let j = i + 1; j < ballArray.length; j++) {
                const ball1 = ballArray[i];
                const ball2 = ballArray[j];
                if (ball1.isPocketed || ball2.isPocketed)
                    continue;
                const dx = ball2.position.x - ball1.position.x;
                const dy = ball2.position.y - ball1.position.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const minDistance = ball1.radius + ball2.radius;
                if (distance < minDistance) {
                    // 记录第一次碰撞的球（用于犯规判断）
                    if (this.turnData.firstBallHit === null && ball1.id === 0) {
                        this.turnData.firstBallHit = ball2.id;
                    }
                    // 碰撞响应
                    this.resolveCollision(ball1, ball2);
                }
            }
        }
    }
    /**
     * 解决两球碰撞
     */
    resolveCollision(ball1, ball2) {
        const dx = ball2.position.x - ball1.position.x;
        const dy = ball2.position.y - ball1.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        // 避免除以零
        if (distance === 0)
            return;
        // 碰撞法线
        const nx = dx / distance;
        const ny = dy / distance;
        // 分离重叠的球
        const overlap = ball1.radius + ball2.radius - distance;
        ball1.position.x -= nx * overlap / 2;
        ball1.position.y -= ny * overlap / 2;
        ball2.position.x += nx * overlap / 2;
        ball2.position.y += ny * overlap / 2;
        // 相对速度
        const dvx = ball2.velocity.x - ball1.velocity.x;
        const dvy = ball2.velocity.y - ball1.velocity.y;
        const dvn = dvx * nx + dvy * ny;
        // 如果球正在分离，不处理
        if (dvn > 0)
            return;
        // 冲量计算（假设完全弹性碰撞）
        const restitution = 0.95;
        const impulse = (-(1 + restitution) * dvn) / (1 / ball1.mass + 1 / ball2.mass);
        // 应用冲量
        ball1.velocity.x -= (impulse / ball1.mass) * nx;
        ball1.velocity.y -= (impulse / ball1.mass) * ny;
        ball2.velocity.x += (impulse / ball2.mass) * nx;
        ball2.velocity.y += (impulse / ball2.mass) * ny;
    }
    /**
     * 检测进球
     */
    checkPockets() {
        for (const ball of this.balls.values()) {
            if (!ball.isPocketed && this.table.checkPocket(ball)) {
                ball.isPocketed = true;
                ball.velocity = { x: 0, y: 0 };
                this.turnData.pocketedBallIds.push(ball.id);
                if (ball.id === 0) {
                    this.turnData.cueBallPocketed = true;
                }
            }
        }
    }
    /**
     * 检查所有球是否静止
     */
    isAllBallsStationary() {
        for (const ball of this.balls.values()) {
            if (!ball.isPocketed && !ball.isStationary()) {
                return false;
            }
        }
        return true;
    }
    /**
     * 获取所有球的状态
     */
    getBallStates() {
        return Array.from(this.balls.values()).map(ball => ball.getState());
    }
    /**
     * 获取回合数据
     */
    getTurnData() {
        // 检查是否击中任何球
        if (this.turnData.firstBallHit === null) {
            const cueBall = this.balls.get(0);
            if (cueBall && !cueBall.isStationary()) {
                this.turnData.noBallHit = true;
            }
        }
        return { ...this.turnData };
    }
    /**
     * 重置回合数据
     */
    resetTurnData() {
        this.turnData = {
            pocketedBallIds: [],
            firstBallHit: null,
            cueBallPocketed: false,
            noBallHit: false,
        };
    }
    /**
     * 重置母球位置（犯规后）
     */
    resetCueBall(position) {
        const cueBall = this.balls.get(0);
        if (cueBall) {
            cueBall.position = { ...position };
            cueBall.velocity = { x: 0, y: 0 };
            cueBall.isPocketed = false;
        }
    }
}
//# sourceMappingURL=PhysicsWorld.js.map