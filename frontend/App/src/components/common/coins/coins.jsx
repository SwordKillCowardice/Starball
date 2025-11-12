import React from 'react';
import coinImage from '../../../assets/coin.jpg';
import { FaPlus } from 'react-icons/fa';
import './coins.css';

const coins = localStorage.getItem('coins');

const Coins = ({ amount }) => {
    return (
        <div className="coins-container">
            <img src={coinImage} alt="coin" className="coin-circle" />
            <span className="coin-number">{coins ? coins : amount}</span>
            <FaPlus className="coin-plus" />
        </div>
    );
};

export default Coins;