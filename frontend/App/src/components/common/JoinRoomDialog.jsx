import React, { useState } from 'react';
import './Dialog/Dialog.css'; // 可以复用样式

const JoinRoomDialog = ({ onClose, onConfirm }) => {
    const [roomId, setRoomId] = useState('');

    return (
        <div className="dialog-overlay" onClick={onClose}>
            <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
                <h2>输入房间号</h2>
                <input
                    type="text"
                    placeholder="请输入房间号"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    className="room-input"
                />
                <div className="dialog-buttons">
                    <button
                        onClick={() => {
                            if (!roomId.trim()) {
                                alert('请输入房间号');
                                return;
                            }
                            onConfirm(roomId);
                        }}
                    >
                        确认
                    </button>
                    <button onClick={onClose}>取消</button>
                </div>
            </div>
        </div>
    );
};

export default JoinRoomDialog;
