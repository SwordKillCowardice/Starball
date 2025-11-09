import React from 'react';
import './UserInfoPanel.css';

const UserInfoPanel = ({ user }) => {
    return (
        <div className="user-stats-panel">
            <h2 className="panel-title">用户信息</h2>

            <div className="stats-grid">
                <div className="stat-item">
                    <span className="label">用户ID：</span>
                    <span className="value">{user.id}</span>
                </div>

                <div className="stat-item">
                    <span className="label">场次：</span>
                    <span className="value">{user.matches}</span>
                </div>

                <div className="stat-item">
                    <span className="label">胜率：</span>
                    <span className="value">{user.winRate}%</span>
                </div>

                <div className="stat-item">
                    <span className="label">段位：</span>
                    <span className="value">{user.rank}</span>
                </div>
            </div>
        </div>
    );
};

export default UserInfoPanel;
