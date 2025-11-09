import React from 'react';
import './avatar.css';
// 支持通过 position 控制布局：'left'（头像在左）或 'right'（头像在右）
const Avatar = ({ src = '', alt = 'avatar', name = '用户名', level = 'Lv.1', extra = '', position = 'left' }) => {
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
        <div className={`avatar ${positionClass}`} style={containerStyle}>
            <div className="avatar__left">
                <img
                    src={src?src:'https://via.placeholder.com/56'}
                    alt={alt}
                    className="avatar__img"
                    style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover' }}
                />
            </div>

            <div className="avatar__right">
                <div className="avatar__name" title={name}>
                    {name}
                </div>
                <div className="avatar__meta">
                    <span className="avatar__level">{level}</span>
                    {extra ? <span className="avatar__extra">{extra}</span> : null}
                </div>
            </div>
        </div>
    );
};

Avatar.defaultProps = {
    src: '',
    alt: 'avatar',
    name: '用户名',
    level: 'Lv.1',
    extra: '',
    position: 'left',
};

export default Avatar;