import { Ball } from "./physics/ball";
import { PhysicsWorld } from "./physics/PhysicsWorld";
import { RuleEngine } from "./rules/RuleEngine";
import { GameState, TurnReport, BallState, Player, Vector } from "./type";

export class Game {
  private physicsWorld: PhysicsWorld;
  private ruleEngine: RuleEngine | null;
  private state: GameState;
  
  // 回调函数
  private turnEndCallback: ((report: TurnReport) => void) | null;
  private stateUpdateCallback: ((ballStates: BallState[]) => void) | null;
  private gameOverCallback: ((winnerId: string) => void) | null;

  constructor() {
    this.physicsWorld = new PhysicsWorld();
    this.ruleEngine = null;
    this.state = 'waiting';
    
    this.turnEndCallback = null;
    this.stateUpdateCallback = null;
    this.gameOverCallback = null;
  }

  /**
   * 初始化游戏
   */
  setup(players: Player[], initialBallStates: BallState[]): void {
    // 创建规则引擎
    this.ruleEngine = new RuleEngine(players);

    // 创建所有球
    for (const ballState of initialBallStates) {
      const ball = new Ball(ballState.id, ballState.position);
      this.physicsWorld.addBall(ball);
    }

    this.state = 'aiming';
  }

  /**
   * 处理击球输入
   */
  strike(force: Vector): void {
    if (this.state !== 'aiming') {
      console.warn('Cannot strike: not in aiming state');
      return;
    }

    // 重置回合数据
    this.physicsWorld.resetTurnData();

    // 对母球施加力
    this.physicsWorld.applyForce(0, force);

    // 切换到动画状态
    this.state = 'animating';
  }

  /**
   * 每帧更新
   */
  update(deltaTime: number): void {
    if (this.state !== 'animating') return;

    // 物理步进
    this.physicsWorld.step(deltaTime);

    // 通知状态更新
    if (this.stateUpdateCallback) {
      this.stateUpdateCallback(this.getBallStates());
    }

    // 检查是否所有球都静止
    if (this.physicsWorld.isAllBallsStationary()) {
      this.onAnimationEnd();
    }
  }

  /**
   * 动画结束处理
   */
  private onAnimationEnd(): void {
    if (!this.ruleEngine) return;

    // 获取回合数据
    const turnData = this.physicsWorld.getTurnData();
    const ballStates = this.getBallStates();

    // 生成权威报告
    const report = this.ruleEngine.analyzeTurn(turnData, ballStates);

    // 检查游戏是否结束
    if (report.turnWinnerId) {
      this.state = 'ended';
      if (this.gameOverCallback) {
        this.gameOverCallback(report.turnWinnerId);
      }
    } else {
      this.state = 'aiming';
    }

    // 处理犯规（重置母球）
    if (report.isFoul) {
      this.physicsWorld.resetCueBall({ x: 200, y: 200 });
    }

    // 触发回合结束回调
    if (this.turnEndCallback) {
      this.turnEndCallback(report);
    }
  }

  /**
   * 获取当前所有球的状态
   */
  getBallStates(): BallState[] {
    return this.physicsWorld.getBallStates();
  }

  /**
   * 状态和解（用于网络同步）
   */
  reconcile(report: TurnReport): void {
    // 强制设置所有球的最终状态
    for (const finalState of report.finalBallStates) {
      const ball = this.physicsWorld.balls.get(finalState.id);
      if (ball) {
        // 平滑过渡到目标位置
        const dx = finalState.position.x - ball.position.x;
        const dy = finalState.position.y - ball.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 5) {
          // 如果偏差较大，快速修正
          ball.position = { ...finalState.position };
        }

        ball.isPocketed = finalState.isPocketed;
        ball.velocity = { x: 0, y: 0 };
      }
    }

    this.state = 'aiming';
  }

  /**
   * 获取当前游戏状态
   */
  getCurrentState(): GameState {
    return this.state;
  }

  // ============================================================================
  // 回调注册方法
  // ============================================================================

  onTurnEnd(callback: (report: TurnReport) => void): void {
    this.turnEndCallback = callback;
  }

  onStateUpdate(callback: (ballStates: BallState[]) => void): void {
    this.stateUpdateCallback = callback;
  }

  onGameOver(callback: (winnerId: string) => void): void {
    this.gameOverCallback = callback;
  }
}

// ============================================================================
// 导出接口
// ============================================================================

export default Game;