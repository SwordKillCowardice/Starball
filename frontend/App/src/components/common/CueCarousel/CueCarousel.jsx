import React from 'react';
import CoinImage from '../../../assets/coin.jpg';
import './cueCarousel.css';
import { useState } from 'react';

const CueCarousel = ({ CueInfo, onBuy }) => {

    const [buyingId, setBuyingId] = useState(null); // 👈 新增：记录当前购买的球杆ID

    const handleBuyClick = async (cue) => {

        setBuyingId(cue.bar_id); // 设置正在购买的cue
        try {
            await onBuy(cue); // 调用父组件传入的购买函数
        } catch (error) {
            console.error('购买失败:', error);
        } finally {
            setBuyingId(null); // 不论成功或失败都重置状态
        }
    };

    return (
        <div className="cue-carousel">
            {CueInfo.map((cue) => (
                <div key={cue.bar_id} className="cue-card">
                    <img src={cue.bar_image} alt={cue.bar_name} className="cue-image" />
                    <h3>{cue.bar_name}</h3>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <img src={CoinImage} alt="coin" className="coin-icon" style={{ width: 20 }} />
                        {cue.price}
                    </div>
                    <button
                        className="buy-button"
                        onClick={() => handleBuyClick(cue)} // 如果传入 onBuy 回调则执行
                        disabled={buyingId === cue.bar_id} // 正在购买时禁用此卡的按钮
                    >
                        {buyingId === cue.bar_id ? '购买中...' : '购买'}
                    </button>
                </div>
            ))}
        </div>
    );
};

export default CueCarousel;