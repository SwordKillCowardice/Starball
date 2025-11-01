import { BallState, Vector } from "../type";

export class Ball {
  id: number;
  position: Vector;
  velocity: Vector;
  radius: number;
  isPocketed: boolean;
  mass: number;

  constructor(id: number, position: Vector, radius: number = 15) {
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
  applyForce(force: Vector): void {
    this.velocity.x += force.x / this.mass;
    this.velocity.y += force.y / this.mass;
  }

  /**
   * 更新球的位置（物理步进）
   */
  update(deltaTime: number, friction: number = 0.98): void {
    if (this.isPocketed) return;

    // 更新位置
    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;

    // 应用摩擦力
    this.velocity.x *= friction;
    this.velocity.y *= friction;

    // 速度过小时停止
    const speed = Math.sqrt(this.velocity.x ** 2 + this.velocity.y ** 2);
    if (speed < 0.1) {
      this.velocity.x = 0;
      this.velocity.y = 0;
    }
  }

  /**
   * 检查球是否静止
   */
  isStationary(): boolean {
    return this.velocity.x === 0 && this.velocity.y === 0;
  }

  /**
   * 获取球的状态
   */
  getState(): BallState {
    return {
      id: this.id,
      position: { ...this.position },
      isPocketed: this.isPocketed,
    };
  }
}