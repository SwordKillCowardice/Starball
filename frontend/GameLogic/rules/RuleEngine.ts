import { Player, TurnData, BallState, TurnReport } from "../type";

export class RuleEngine {
  private players: Player[];
  private currentPlayerIndex: number;

  constructor(players: Player[]) {
    this.players = players;
    this.currentPlayerIndex = 0;
  }

  /**
   * 分析本回合，生成权威报告
   */
  analyzeTurn(turnData: TurnData, ballStates: BallState[]): TurnReport {
    const currentPlayer = this.players[this.currentPlayerIndex];
    const isFoul = this.detectFoul(turnData, currentPlayer);
    const winnerId = this.checkGameOver(turnData, currentPlayer, isFoul);

    // 确定下一个玩家
    let nextPlayerIndex = this.currentPlayerIndex;
    
    if (!isFoul && turnData.pocketedBallIds.length > 0) {
      // 打进球且没犯规，继续击球
      nextPlayerIndex = this.currentPlayerIndex;
    } else {
      // 犯规或没打进球，换人
      nextPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
    }

    this.currentPlayerIndex = nextPlayerIndex;

    return {
      finalBallStates: ballStates,
      pocketedBallIds: turnData.pocketedBallIds,
      isFoul,
      turnWinnerId: winnerId,
      nextPlayerId: this.players[nextPlayerIndex].id,
    };
  }

  /**
   * 判断是否犯规
   */
  private detectFoul(turnData: TurnData, player: Player): boolean {
    // 母球进袋
    if (turnData.cueBallPocketed) {
      return true;
    }

    // 没有击中任何球
    if (turnData.noBallHit) {
      return true;
    }

    // 如果玩家已经确定了球的类型
    if (player.ballType !== null) {
      const firstHit = turnData.firstBallHit;
      
      if (firstHit === null) {
        return true; // 没有击中球
      }

      // 检查是否先击中了自己的球
      if (player.ballType === 'solid' && firstHit >= 9 && firstHit <= 15) {
        return true; // 全色球玩家先击中了花色球
      }
      if (player.ballType === 'striped' && firstHit >= 1 && firstHit <= 7) {
        return true; // 花色球玩家先击中了全色球
      }
    }

    return false;
  }

  /**
   * 判断游戏是否结束
   */
  private checkGameOver(turnData: TurnData, player: Player, isFoul: boolean): string | null {
    const pocketed8Ball = turnData.pocketedBallIds.includes(8);

    if (pocketed8Ball) {
      // 打进8号球
      if (isFoul) {
        // 犯规打进8号球，输掉比赛
        const opponentIndex = (this.currentPlayerIndex + 1) % this.players.length;
        return this.players[opponentIndex].id;
      } else {
        // 合法打进8号球，赢得比赛
        return player.id;
      }
    }

    return null;
  }

  /**
   * 获取当前玩家
   */
  getCurrentPlayer(): Player {
    return this.players[this.currentPlayerIndex];
  }
}