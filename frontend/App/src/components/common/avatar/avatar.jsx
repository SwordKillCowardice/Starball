import React from 'react';
import './avatar.css';

// 支持通过 position 控制布局：'left'（头像在左）或 'right'（头像在右）
const Avatar = ({onClick, position = 'left' }) => {

    const SERVER_URL = import.meta.env.VITE_BACKEND_URL;
    const DefaultAvatar = SERVER_URL + '/head/0.png';

    const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {};
    const username = localStorage.getItem('username') || '用户名';
    const Win_Rate = localStorage.getItem('Win_Rate') || '0%';
    
    const containerStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: 20,
        flexDirection: position === 'right' ? 'row-reverse' : 'row',
    };

    // 为了在样式表中仍然能定制左右区块，可以保留原有 className
    // 但同时通过额外 class 给出位置提示，方便 CSS 细粒度覆盖
    const positionClass = position === 'right' ? 'avatar--right' : 'avatar--left';

    return (
        <div className={`avatar ${positionClass}`} style={containerStyle} onClick={onClick}>
            <div className="avatar__left">
                <img
                    src={userInfo?.img || DefaultAvatar}
                    alt={username}
                    className="avatar__img"
                    style={{ width: 56, height: 56, borderRadius: '25%', objectFit: 'cover' }}
                />
            </div>

            <div className="avatar__right">
                <div className="avatar__name" title={username}>
                    {username}
                </div>
                <div className="avatar__meta">
                    <span className="avatar__level">{"胜率: " + Win_Rate}</span>
                </div>
            </div>
        </div>
    );
};

Avatar.defaultProps = {
    src: '',
    alt: 'avatar',
    name: '用户名',
    position: 'left',
};

export default Avatar;