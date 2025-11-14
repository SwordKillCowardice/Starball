import React from "react";
import "./Dialog.css";
import { useState } from "react";

const JoinRoomDialog = ({ onClose, onConfirm }) => {
    const [roomId, setRoomId] = useState('');

    const handleConfirm = () => {
        if (!roomId.trim()) {
            alert('请输入房间号');
            return;
        }
        onConfirm(roomId);
    };

    return (
        <div className="dialog-overlay" onClick={onClose}>
            <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
                <h2>请输入房间号</h2>
                <input
                    type="text"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    placeholder="输入房间号"
                    className="room-input"
                />
                <div className="dialog-buttons">
                    <button onClick={handleConfirm}>确认</button>
                    <button onClick={onClose}>取消</button>
                </div>
            </div>
        </div>
    );
};

const Dialog = ({ onClose, onCreateRoom, onJoinRoom }) => {
    const [showJoinDialog, setShowJoinDialog] = React.useState(false);

    return (
        <>
        <div className="dialog-overlay" onClick={onClose}>
            <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
                <h2>请选择</h2>
                <div className="dialog-buttons">
                    <button
                        onClick={() => {
                            onClose();
                            onCreateRoom();
                        }}
                    >
                        创建房间
                    </button>
                    <button onClick={() => setShowJoinDialog(true)}>
                        加入房间
                    </button>
                </div>
                <button className="close-btn" onClick={onClose}>关闭</button>
            </div>
        </div>
            {showJoinDialog && (
                <JoinRoomDialog
                    onClose={() => setShowJoinDialog(false)}
                    onConfirm={(roomId) => {
                        setShowJoinDialog(false);
                        onClose();
                        onJoinRoom(roomId); // 调用父组件传入的 handleJoinRoom
                    }}
                />
            )}
        </>
    );
};

export default Dialog;
