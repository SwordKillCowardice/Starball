import React from 'react';
import './game.css';
import Avatar from '../../components/common/avatar/avatar';
// import GameLogic from '../../components/game/GameLogic'; // 你的游戏逻辑模块
import vsImage from '../../assets/vs.png';
import Bg from '../../components/layout/bg';


const Game = () => {
    return (
        <Bg>
        <div className="game-main">
            {/* 顶部用户栏 */}
            <div className="top-bar">
                {/* 左侧玩家信息 */}
                <div className="player-info">
                    <Avatar position='right'/> 
                </div>

                {/* 中间图片 */}
                <div className="center-image">
                    <img src={vsImage} alt="Game Scene" />
                </div>

                {/* 右侧玩家信息 */}
                <div className="player-info">
                    <Avatar /> {/* 头像靠左 */}
                </div>
            </div>

            {/* 游戏逻辑模块（中下部） */}
            <div className="game-area">
                {/* <GameLogic /> */}
            </div>
        </div>
        </Bg>
    );
};

export default Game;
