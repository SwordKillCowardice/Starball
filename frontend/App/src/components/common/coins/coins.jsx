import React from 'react';
import coinImage from '../../../assets/coin.jpg';
import { FaPlus } from 'react-icons/fa';
import './coins.css';
import { useState, useEffect } from 'react';

const Coins = ({ amount }) => {
    const [coins, setCoins] = useState(() => {
        // 初始化时优先从 localStorage 获取
        const storedCoins = localStorage.getItem('coins');
        return storedCoins ? parseInt(storedCoins) : amount || 0;
    });

    // 每次 coins 改变时，自动同步到 localStorage
    useEffect(() => {
        localStorage.setItem('coins', coins.toString());
    }, [coins]);

    const handleAddCoin = () => {
        setCoins(prev => prev + 1); // ✅ 通过 useState 更新状态，触发渲染
    };

    return (
        <div className="coins-container">
            <img src={coinImage} alt="coin" className="coin-circle" />
            <span className="coin-number">{coins}</span>
            <FaPlus className="coin-plus" onClick={handleAddCoin} />
        </div>
    );
};

export default Coins;
