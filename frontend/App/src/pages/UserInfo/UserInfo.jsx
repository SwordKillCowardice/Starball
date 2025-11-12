import React from 'react';
import Avatar from '../../components/common/avatar/avatar.jsx';
import Coins from '../../components/common/coins/coins.jsx';
import './UserInfo.css';
import Bg from '../../components/layout/bg';
import UserInfoPanel from '../../components/common/UserInfoPanel/UserInfoPanel.jsx';

const user_id = localStorage.getItem('user_id');
const level = localStorage.getItem('level');
const matches = localStorage.getItem('matches');
const WinGames = localStorage.getItem('WinGames');

//
const CueOwned = localStorage.getItem('cueOwned')
    ? JSON.parse(localStorage.getItem('cueOwned'))
    : []

const UserInfo = () => {
    return (
        <Bg children={"userInfo"}>
            <div className="avatar-container">
                <Avatar />
            </div>
            <Coins />
            <div style={{position: 'absolute',
            top: '150px',
            left: '50%',
  transform: 'translateX(-50%)'}} >
                <UserInfoPanel user={{ id: user_id ? user_id : '123456', 
                    matches: matches ? matches : 0,
                    winRate: (matches != 0) && WinGames ? ((WinGames / matches) * 100).toFixed(2) : 0, 
                    rank: '青铜III' }} />
            </div>
            <div className="cue-section">
                <h2 className="user-cue-title">我的球杆展柜</h2>
                <div className="user-cue-carousel">
                    {CueOwned.map((cue) => (
                        <div key={cue.bar_id} className="user-cue-card">
                            <img src={cue.bar_image} alt={cue.bar_name} className="user-cue-image" />
                        </div>
                    ))}
                </div>
            </div>
        </Bg>
    );
};

export default UserInfo;
