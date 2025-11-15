import React from 'react';
import CoinImage from '../../../assets/coin.jpg';
import './cueCarousel.css';
import { useState } from 'react';

const CueCarousel = ({ CueInfo, onBuy, buyingId }) => {

    const SERVER_URL = import.meta.env.VITE_BACKEND_URL;

    const handleBuyClick = async (cue) => {
        const res = await onBuy(cue);

        if (res.ok) {
            alert("购买成功！");
            console.log("购买成功", res.data);
        } else {
            alert("购买失败" + (res.status === "409" ? "：余额不足" : ""));
            console.log("购买失败", res.msg);
        }
    };

    return (
        <div className="cue-carousel">
            {CueInfo.map((cue) => (
                <div key={cue.bar_id} className="cue-card">
                    <img src={SERVER_URL + cue.bar_picturea} alt={cue.bar_name} className="cue-image" />
                    <h3>{cue.bar_name}</h3>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <img src={CoinImage} alt="coin" className="coin-icon" style={{ width: 20 }} />
                        {cue.price}
                    </div>
                    
                    {cue.owned && <div className="owned-tag">已拥有</div>}

                    {!cue.owned && (
                        <button
                            className="buy-button"
                            onClick={() => handleBuyClick(cue)}
                            disabled={buyingId === cue.bar_id}
                        >
                            {buyingId === cue.bar_id ? '购买中...' : '购买'}
                        </button>
                    )}
                    
                </div>
            ))}
        </div>
    );
};

export default CueCarousel;