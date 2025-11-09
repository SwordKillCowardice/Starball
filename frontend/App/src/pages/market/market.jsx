import React from 'react';
import Avatar from '../../components/common/avatar/avatar.jsx';
import Coins from '../../components/common/coins/coins.jsx';
import './market.css';
import Bg from '../../components/layout/bg';
import CueCarousel from '../../components/common/CueCarousel/CueCarousel.jsx';

const cues = [
    { id: 1, name: '红心球杆', image: '../../assets/cue1.png', power: 80, accuracy: 70, price: 1000 },
    { id: 2, name: '蓝焰球杆', image: '../../assets/cue2.png', power: 90, accuracy: 65, price: 1500 },
    { id: 3, name: '黄金球杆', image: '../../assets/cue3.png', power: 100, accuracy: 80, price: 2000 },
    { id: 4, name: '白银球杆', image: '../../assets/cue4.png', power: 70, accuracy: 85, price: 1200 },
    { id: 5, name: '黑曜石球杆', image: '../../assets/cue5.png', power: 95, accuracy: 90, price: 2500 },
    { id: 6, name: '碳纤维球杆', image: '../../assets/cue6.png', power: 85, accuracy: 75, price: 1800 },
    { id: 7, name: '钻石球杆', image: '../../assets/cue7.png', power: 110, accuracy: 95, price: 3000 },
    { id: 8, name: '紫电球杆', image: '../../assets/cue8.png', power: 88, accuracy: 78, price: 1600 },
    { id: 9, name: '烈焰球杆', image: '../../assets/cue9.png', power: 92, accuracy: 82, price: 2200 },
    { id: 10, name: '冰霜球杆', image: '../../assets/cue10.png', power: 75, accuracy: 88, price: 1400 },
    // 还可以继续添加更多
];

const Market = () => {
    return (
        <Bg children={"market"}>
            <div className="avatar-container">
                <Avatar />
            </div>
            <Coins />
            <div>
                <CueCarousel CueInfo={cues} />
            </div>
        </Bg>
    );
};

export default Market;

