export class Ball {
    constructor(id, position, radius = 15) {
        this.id = id;
        this.position = { ...position };
        this.velocity = { x: 0, y: 0 };
        this.radius = radius;
        this.isPocketed = false;
        this.mass = 1.0;
    }
    /**
     * 应用力到球上
     */
    applyForce(force) {
        this.velocity.x += force.x / this.mass;
        this.velocity.y += force.y / this.mass;
    }
    /**
     * 更新球的位置（物理步进）
     */
    update(deltaTime, friction = 0.98) {
        if (this.isPocketed)
            return;
        // 计算下一帧的位置
        const nextX = this.position.x + this.velocity.x * deltaTime;
        const nextY = this.position.y + this.velocity.y * deltaTime;
        // 应用摩擦力（基于时间的衰减）
        const frictionFactor = Math.pow(friction, deltaTime * 60); // 标准化到60fps
        this.velocity.x *= frictionFactor;
        this.velocity.y *= frictionFactor;
        // 速度过小时停止（阈值也要考虑时间步长）
        const speed = Math.sqrt(this.velocity.x ** 2 + this.velocity.y ** 2);
        const minSpeed = 5; // 降低最小速度阈值
        if (speed < minSpeed) {
            this.velocity.x = 0;
            this.velocity.y = 0;
        }
        // 更新位置（只有在速度不为零时才更新）
        if (this.velocity.x !== 0 || this.velocity.y !== 0) {
            this.position.x = nextX;
            this.position.y = nextY;
        }
    }
    /**
     * 检查球是否静止
     */
    isStationary() {
        return this.velocity.x === 0 && this.velocity.y === 0;
    }
    /**
     * 获取球的状态
     */
    getState() {
        return {
            id: this.id,
            position: { ...this.position },
            isPocketed: this.isPocketed,
        };
    }
}
//# sourceMappingURL=Ball.js.map