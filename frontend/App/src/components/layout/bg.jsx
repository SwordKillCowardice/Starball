import React from 'react';
import mainBackground from '../../assets/main_background.jpg';
import './bg.css';

const Background = ({ children }) => {
    return (
        <div className="background-container">
            <img
                src={mainBackground}
                alt="Background"
                className="background-image"
            />
            <div className="background-content">
                {children}
            </div>
        </div>
    );
};

export default Background;
