/**
 * 2D 向量，用于描述位置、速度或力
 */
export interface Vector {
  x: number;
  y: number;
}

/**
 * 描述单个台球的物理和逻辑状态
 */
export interface BallState {
  id: number;           // 球的编号 (0: 母球, 1-15: 彩球)
  position: Vector;     // 球心在桌面坐标系中的位置
  isPocketed: boolean;  // 是否已进袋
}

/**
 * 权威回合报告
 */
export interface TurnReport {
  finalBallStates: BallState[];   // 所有球在本回合结束后的最终状态
  pocketedBallIds: number[];      // 在本回合中被打进的球的ID列表
  isFoul: boolean;                // 本回合是否判定为犯规
  turnWinnerId: string | null;    // 本回合是否直接决出胜负
  nextPlayerId: string;           // 下一个拥有击球权的玩家ID
}

/**
 * 玩家信息
 */
export interface Player {
  id: string;
  name: string;
  ballType: 'solid' | 'striped' | null; // 全色球(1-7) 或 花色球(9-15)
}

/**
 * 游戏状态
 */
export type GameState = 'waiting' | 'aiming' | 'animating' | 'ended';

/**
 * 回合数据（用于规则判断）
 */
export interface TurnData {
  pocketedBallIds: number[];
  firstBallHit: number | null;
  cueBallPocketed: boolean;
  noBallHit: boolean;
}
