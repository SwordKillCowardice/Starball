import React from 'react';
import CoinImage from '../../../assets/coin.jpg';
import './cueCarousel.css';

const CueCarousel = ({ CueInfo }) => {
    return (
        <div className="cue-carousel">
            {CueInfo.map((cue) => (
                <div key={cue.id} className="cue-card">
                    <img src={cue.image} alt={cue.name} className="cue-image" />
                    <h3>{cue.name}</h3>
                    <p>力量：{cue.power}</p>
                    <p>精准：{cue.accuracy}</p>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <img src={CoinImage} alt="coin" className="coin-icon" style={{ width: 20 }} />
                        {cue.price}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default CueCarousel;