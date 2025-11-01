import { Vector } from "../type.js";
import { Ball } from "./Ball.js";

export class Table {
  width: number;
  height: number;
  pockets: Vector[];

  constructor(width: number = 800, height: number = 400) {
    this.width = width;
    this.height = height;

    // 定义六个袋口位置（四角 + 两个中袋）
    this.pockets = [
      { x: 0, y: 0 },                    // 左上角
      { x: width / 2, y: 0 },            // 上中
      { x: width, y: 0 },                // 右上角
      { x: 0, y: height },               // 左下角
      { x: width / 2, y: height },       // 下中
      { x: width, y: height },           // 右下角
    ];
  }

  /**
   * 检查球是否在袋口附近（进球判定）
   */
  checkPocket(ball: Ball): boolean {
    const pocketRadius = 25; // 袋口半径

    for (const pocket of this.pockets) {
      const dx = ball.position.x - pocket.x;
      const dy = ball.position.y - pocket.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < pocketRadius) {
        return true;
      }
    }
    return false;
  }

  /**
   * 处理球与边界的碰撞
   */
  handleWallCollision(ball: Ball): void {
    const restitution = 0.8; // 反弹系数

    // 左右边界
    if (ball.position.x - ball.radius < 0) {
      ball.position.x = ball.radius;
      ball.velocity.x = -ball.velocity.x * restitution;
    } else if (ball.position.x + ball.radius > this.width) {
      ball.position.x = this.width - ball.radius;
      ball.velocity.x = -ball.velocity.x * restitution;
    }

    // 上下边界
    if (ball.position.y - ball.radius < 0) {
      ball.position.y = ball.radius;
      ball.velocity.y = -ball.velocity.y * restitution;
    } else if (ball.position.y + ball.radius > this.height) {
      ball.position.y = this.height - ball.radius;
      ball.velocity.y = -ball.velocity.y * restitution;
    }
  }
}
