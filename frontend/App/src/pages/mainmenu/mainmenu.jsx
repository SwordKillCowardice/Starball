import React from 'react';
import Avatar from '../../components/common/avatar/avatar.jsx';
import Coins from '../../components/common/coins/coins.jsx';
import './mainmenu.css';
import startGameImg from '../../assets/start_game.jpg';
import marketImg from '../../assets/market.jpg';
import Bg from '../../components/layout/bg';

const MainMenu = () => {
    return (
        <Bg children={"main-menu"}>
            <div className="avatar-container">
                <Avatar />
            </div>
            <Coins />
            <div className="main-menu">
                <div className="content">
                    <div className="left-section">
                        <img src={startGameImg} alt="Start Game" />
                        <span>开始游戏</span>
                    </div>
                    <div className="right-section">
                        <img src={marketImg} alt="Market" />
                        <span>商城</span>
                    </div>
                </div>
            </div>
        </Bg>
    );
};

export default MainMenu;

