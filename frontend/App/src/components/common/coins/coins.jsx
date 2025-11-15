import React, { useState, useEffect } from 'react';
import coinImage from '../../../assets/coin.jpg';
import { FaPlus } from 'react-icons/fa';
import './coins.css';

const Coins = ({ amount }) => {

    // 初始化：从 localStorage 或 props 获取，并保证数据合法
    const initCoins = () => {
        const stored = localStorage.getItem("coins");
        const num = parseInt(stored);

        // localStorage 无效 → 使用 props amount → 再兜底 0
        if (!isNaN(num)) return num;
        if (!isNaN(parseInt(amount))) return parseInt(amount);
        return 0;
    };

    const [coins, setCoins] = useState(initCoins);

    // 父组件更新时同步（半受控组件）
    useEffect(() => {
        if (amount != null && !isNaN(amount)) {
            setCoins(amount);
        }
    }, [amount]);

    // 同步到 localStorage
    useEffect(() => {
        if (!isNaN(coins)) {
            localStorage.setItem("coins", coins);
        }
    }, [coins]);

    // 点击 +
    const handleAddCoin = () => {
        setCoins(prev => (isNaN(prev) ? 0 : prev) + 1);
    };

    return (
        <div className="coins-container">
            <img src={coinImage} alt="coin" className="coin-circle" />
            <span className="coin-number">{Number.isFinite(coins) ? coins : 0}</span>
            <FaPlus className="coin-plus" onClick={handleAddCoin} />
        </div>
    );
};

export default Coins;
