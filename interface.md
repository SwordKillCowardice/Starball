# 在线台球游戏接口定义文档 (API Specification)

**版本:** 1.0.0
**最后更新:** 2025-09-27
**技术架构:** 客户端权威 (Client-Authoritative) + 客户端预测 (Client-Side Prediction) + 服务器和解 (Server Reconciliation)

## 1. 概述

本文档定义了在线台球游戏项目中，**游戏模块 (Gameplay Module)**、**前端应用 (Frontend Application)** 与 **后端服务器 (Backend Server)** 之间的所有接口和数据结构。所有通信均基于 WebSocket，并采用事件驱动模型。

## 2. 全局数据结构 (Data Structures)

这些是在各个接口间传递的核心数据模型。

```typescript
/**
 * 2D 向量，用于描述位置、速度或力。
 */
interface Vector {
  x: number;
  y: number;
}

/**
 * 描述单个台球的物理和逻辑状态。
 */
interface BallState {
  id: number;      // 球的编号 (0: 母球, 1-7: 全色球, 8: 8号球, 9-15: 花色球)
  position: Vector; // 球心在桌面坐标系中的位置
  isPocketed: boolean; // 是否已进袋
}

/**
 * 权威回合报告。由权威端 (击球方) 生成，并由服务器广播。
 * 这是实现状态同步的核心。
 */
interface TurnReport {
  finalBallStates: BallState[];   // 所有球在本回合结束后的最终状态
  pocketedBallIds: number[];    // 在本回合中被打进的球的ID列表
  isFoul: boolean;              // 本回合是否判定为犯规
  turnWinnerId: string | null;  // 本回合是否直接决出胜负 (null表示游戏继续)
  nextPlayerId: string;         // 下一个拥有击球权的玩家ID
}
```

## 3. 游戏模块接口 (Gameplay Module API)

这是游戏玩法程序员需要实现、并提供给前端应用调用的接口。

### 3.1. 方法 (Methods)

| 方法名 | 参数 | 返回值 | 描述 |
| :--- | :--- | :--- | :--- |
| `setup` | `(players: object[], initialBallStates: BallState[])` | `void` | 初始化游戏世界，创建玩家和初始球局。 |
| `strike` | `(force: Vector)` | `void` | **核心方法**。响应玩家的击球输入，施加物理力，并启动本地物理模拟。 |
| `reconcile` | `(report: TurnReport)` | `void` | **核心方法**。根据服务器广播的权威报告，强制修正本地游戏状态，确保所有客户端状态一致。 |
| `getBallStates` | `()` | `BallState[]` | 获取当前所有球的实时状态，用于渲染。 |

### 3.2. 回调 (Callbacks)

游戏模块需要提供注册回调函数的机制，以主动通知前端应用关键事件的发生。

| 回调名 | 参数 | 描述 |
| :--- | :--- | :--- |
| `onReady` | `()` | 游戏模块资源加载和初始化完成时触发。 |
| `onTurnEnd` | `(report: TurnReport)` | **仅在权威端触发**。本地物理模拟结束后，生成权威报告时调用。 |
| `onStateUpdate` | `(ballStates: BallState[])` | 物理模拟进行中，每帧或定期触发，用于驱动前端动画渲染。 |
| `onGameOver` | `(winnerId: string)` | 当游戏决出最终胜负时触发。 |

## 4. WebSocket 通信接口

### 4.1. 客户端 -> 服务器 (Client-to-Server, C2S)

| 事件名称 (Event Name) | 载荷 (Payload) | 触发时机与描述 |
| :--- | :--- | :--- |
| `game:join` | `{ roomId: string }` | 客户端加载完成后，请求加入一个指定的游戏房间。 |
| `game:strike` | `{ force: Vector }` | **[输入同步]** 玩家完成瞄准并击球的瞬间，由权威端 (击球方) 发送。用于通知服务器和其他客户端开始预测。 |
| `game:turnReport` | `TurnReport` | **[状态同步]** 权威端的物理模拟结束后，将生成的“权威回合报告”提交给服务器进行验证和广播。 |

### 4.2. 服务器 -> 客户端 (Server-to-Client, S2C)

| 事件名称 (Event Name) | 载荷 (Payload) | 接收方与描述 |
| :--- | :--- | :--- |
| `game:start` | `{ players: object[], initialBallStates: BallState[], firstPlayerId: string }` | **所有客户端**。服务器通知游戏正式开始，并提供初始布局、玩家信息和先手方。 |
| `game:strike` | `{ playerId: string, force: Vector }` | **非权威端**。服务器将权威端的击球输入转发给其他客户端，让其开始进行本地预测动画。 |
| `game:turnResult` | `TurnReport` | **所有客户端**。服务器在验证并接受了权威报告后，将其作为最终结果广播给房间里的所有人。客户端收到此事件后必须调用 `game.reconcile()` 进行状态和解。 |
| `game:gameOver` | `{ winnerId: string }` | **所有客户端**。服务器根据游戏规则宣布最终胜利者，游戏结束。 |
| `error` | `{ code: number, message: string }` | **特定客户端**。当发生错误时（如无效操作、作弊嫌疑），服务器向特定客户端发送错误通知。 |

---
