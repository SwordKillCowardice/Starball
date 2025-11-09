import React from 'react';
import Avatar from '../../components/common/avatar/avatar.jsx';
import Coins from '../../components/common/coins/coins.jsx';
import './UserInfo.css';
import Bg from '../../components/layout/bg';
import UserInfoPanel from '../../components/common/UserInfoPanel/UserInfoPanel.jsx';

const CueOwned = [
    { id: 1, name: '红心球杆', image: '../../assets/cue1.png', power: 80, accuracy: 70, price: 1000 },
    { id: 3, name: '黄金球杆', image: '../../assets/cue3.png', power: 100, accuracy: 80, price: 2000 },
    { id: 5, name: '黑曜石球杆', image: '../../assets/cue5.png', power: 95, accuracy: 90, price: 2500 },
    // 这里可以添加用户拥有的球杆信息
];

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
                <UserInfoPanel user={{ id: '123456', matches: 0, winRate: 0, rank: '青铜III' }} />
            </div>
            <div className="cue-section">
                <h2 className="cue-title">我的球杆展柜</h2>
                <div className="cue-carousel">
                    {CueOwned.map((cue) => (
                        <div key={cue.id} className="cue-card">
                            <img src={cue.image} alt={cue.name} className="cue-image" />
                        </div>
                    ))}
                </div>
            </div>
        </Bg>
    );
};

export default UserInfo;
