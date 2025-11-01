
import type { Player } from '../GameLogic/type.js';

/**
 * UI管理器 - 负责所有UI交互
 */
export class GameUI {
    private powerSlider: HTMLInputElement;
    private powerValue: HTMLElement;
    private angleSlider: HTMLInputElement;
    private angleValue: HTMLElement;
    private strikeBtn: HTMLButtonElement;
    private gameState: HTMLElement;
    private gameLog: HTMLElement;
    private winnerOverlay: HTMLElement;
    private winnerText: HTMLElement;
    
    private player1Info: HTMLElement;
    private player2Info: HTMLElement;
    private p1Score: HTMLElement;
    private p2Score: HTMLElement;
    private player1Type: HTMLElement;
    private player2Type: HTMLElement;

    constructor() {
        // 获取所有UI元素
        this.powerSlider = document.getElementById('powerSlider') as HTMLInputElement;
        this.powerValue = document.getElementById('powerValue')!;
        this.angleSlider = document.getElementById('angleSlider') as HTMLInputElement;
        this.angleValue = document.getElementById('angleValue')!;
        this.strikeBtn = document.getElementById('strikeBtn') as HTMLButtonElement;
        this.gameState = document.getElementById('gameState')!;
        this.gameLog = document.getElementById('gameLog')!;
        this.winnerOverlay = document.getElementById('winnerOverlay')!;
        this.winnerText = document.getElementById('winnerText')!;
        
        this.player1Info = document.getElementById('player1Info')!;
        this.player2Info = document.getElementById('player2Info')!;
        this.p1Score = document.getElementById('p1Score')!;
        this.p2Score = document.getElementById('p2Score')!;
        this.player1Type = document.getElementById('player1Type')!;
        this.player2Type = document.getElementById('player2Type')!;

        this.setupEventListeners();
    }

    /**
     * 设置事件监听
     */
    private setupEventListeners(): void {
        this.powerSlider.addEventListener('input', () => {
            this.powerValue.textContent = this.powerSlider.value;
        });

        this.angleSlider.addEventListener('input', () => {
            this.angleValue.textContent = this.angleSlider.value + '°';
        });
    }

    /**
     * 获取力度
     */
    public getPower(): number {
        return parseInt(this.powerSlider.value);
    }

    /**
     * 设置力度
     */
    public setPower(value: number): void {
        this.powerSlider.value = value.toString();
        this.powerValue.textContent = value.toString();
    }

    /**
     * 获取角度
     */
    public getAngle(): number {
        return parseInt(this.angleSlider.value);
    }

    /**
     * 设置角度
     */
    public setAngle(value: number): void {
        this.angleSlider.value = value.toString();
        this.angleValue.textContent = value + '°';
    }

    /**
     * 启用/禁用击球按钮
     */
    public enableStrikeButton(enabled: boolean): void {
        this.strikeBtn.disabled = !enabled;
    }

    /**
     * 设置游戏状态文本
     */
    public setState(text: string): void {
        this.gameState.textContent = text;
    }

    /**
     * 更新玩家信息
     */
    public updatePlayers(players: Player[], currentPlayerId: string): void {
        // 更新激活状态
        if (currentPlayerId === 'player1') {
            this.player1Info.classList.add('active');
            this.player2Info.classList.remove('active');
        } else {
            this.player1Info.classList.remove('active');
            this.player2Info.classList.add('active');
        }

        // 更新球类型
        const p1 = players.find(p => p.id === 'player1');
        const p2 = players.find(p => p.id === 'player2');

        this.player1Type.textContent = this.getBallTypeText(p1?.ballType ?? null);
        this.player2Type.textContent = this.getBallTypeText(p2?.ballType ?? null);
    }

    /**
     * 获取球类型文本
     */
    private getBallTypeText(ballType: 'solid' | 'striped' | null): string {
        if (ballType === 'solid') return '全色球 (1-7)';
        if (ballType === 'striped') return '花色球 (9-15)';
        return '未确定';
    }

    /**
     * 更新分数
     */
    public updateScores(scores: Map<string, number>): void {
        this.p1Score.textContent = (scores.get('player1') || 0).toString();
        this.p2Score.textContent = (scores.get('player2') || 0).toString();
    }

    /**
     * 显示获胜者
     */
    public showWinner(winnerName: string): void {
        this.winnerText.textContent = `🎉 ${winnerName} 获得胜利！🎉`;
        this.winnerOverlay.classList.add('show');
    }

    /**
     * 隐藏获胜弹窗
     */
    public hideWinner(): void {
        this.winnerOverlay.classList.remove('show');
    }

    /**
     * 添加日志
     */
    public log(message: string, type: 'success' | 'warning' | 'error' | 'info' = 'info'): void {
        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        entry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
        
        this.gameLog.appendChild(entry);
        this.gameLog.scrollTop = this.gameLog.scrollHeight;
    }

    /**
     * 清空日志
     */
    public clearLog(): void {
        this.gameLog.innerHTML = '<div class="log-entry">日志已清空</div>';
    }

    /**
     * 监听力度变化
     */
    public onPowerChange(callback: (power: number) => void): void {
        this.powerSlider.addEventListener('input', () => {
            callback(this.getPower());
        });
    }

    /**
     * 监听角度变化
     */
    public onAngleChange(callback: (angle: number) => void): void {
        this.angleSlider.addEventListener('input', () => {
            callback(this.getAngle());
        });
    }
}
