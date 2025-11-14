import React from 'react';
import Avatar from '../../components/common/avatar/avatar.jsx';
import Coins from '../../components/common/coins/coins.jsx';
import './mainmenu.css';
import startGameImg from '../../assets/start_game.jpg';
import marketImg from '../../assets/market.jpg';
import Bg from '../../components/layout/bg';
import { useState, useEffect } from 'react';
import Dialog from '../../components/common/Dialog/Dialog.jsx';
import { useNavigate } from 'react-router-dom';
import { getCueInfo, CreateRoom, JoinRoom } from '../../api/mainmenu.js';
import { socket } from '../../utils/socket.js';

const MainMenu = () => {
    const navigate = useNavigate();
    const userId = localStorage.getItem('user_id');

    const JmptoUserInfo = () => {
        navigate('/userInfo');
    }

    const handleEnterMarket = async () => {
        try {
            const response = await getCueInfo(userId);
            if (response.status === 200) {
                const { bar_possess, bar_npossess } = response.data.data;
                localStorage.setItem('cueOwned', JSON.stringify(bar_possess));
                localStorage.setItem('cueNowned', JSON.stringify(bar_npossess));
                navigate('/market');
            } else {
                alert('获取球杆信息失败');
            }
        } catch (err) {
            console.error('handleEnterMarket error:', err);
            alert('网络错误，请稍后再试');
        }
    };

    useEffect(() => {
        socket.on('connect', () => {
            console.log('✅ 已连接到 Socket 服务器:', socket.id);
        });

        socket.on('ok', (data) => {
            console.log('进入房间:', data);
        });

        socket.on('game start', (data) => {
            console.log('游戏开始:', data);
            navigate(`/game?room_id=${data.room_id}`);
        });

        socket.on('fail', (data) => {
            console.error('操作失败:', data);
            alert(`操作失败: ${data.error}`);
        });

        return () => {
            socket.off('connect');
            socket.off('ok');
            socket.off('fail');
            socket.off('game start');
        };
    }, [navigate]);

    const [showDialog, setShowDialog] = useState(false); // 控制弹窗状态

    const handleStartGame = () => {
        setShowDialog(true);
    };

    const handleCloseDialog = () => {
        setShowDialog(false);
    };

    const handleCreateRoom = async () => {
        try {
            const response = await CreateRoom(userId);
            if (response.status === 200) {
                const roomId = response.data.data.room_id;
                localStorage.setItem('room_id', roomId);

                console.log('创建房间成功:', roomId);
                socket.emit('join_room', { user_id: userId, room_id: roomId });

                navigate(`/game?room_id=${roomId}`);
                setShowDialog(false);
            } else {
                alert('创建房间失败');
            }
        } catch (err) {
            console.error('handleCreateRoom error:', err);
            alert('网络错误，无法创建房间');
        }
    };

    /** 加入房间 */
    const handleJoinRoom = async (roomId) => {
        try {
            const response = await JoinRoom(userId, roomId);
            if (response.status === 200) {
                localStorage.setItem('room_id', roomId);

                console.log('🚪 加入房间成功:', roomId);
                socket.emit('join_room', { user_id: userId, room_id: roomId });

                navigate(`/game?room_id=${roomId}`);
                setShowDialog(false);
            } else {
                alert('加入房间失败');
            }
        } catch (err) {
            console.error('handleJoinRoom error:', err);
            alert('网络错误，无法加入房间');
        }
    };

    return (
        <Bg children={"main-menu"}>
            <div className="avatar-container">
                <Avatar onClick={JmptoUserInfo}/>
            </div>
            <Coins />
            <div className="main-menu">
                <div className="content">
                    <div className="left-section" onClick={handleStartGame}>
                        <img src={startGameImg} alt="Start Game" />
                        <span>开始游戏</span>
                    </div>
                    <div className="right-section" onClick={handleEnterMarket}>
                        <img src={marketImg} alt="Market" />
                        <span>商城</span>
                    </div>
                </div>
            </div>
            {showDialog && (
                <Dialog
                    onClose={handleCloseDialog}
                    onCreateRoom={handleCreateRoom}
                    onJoinRoom={handleJoinRoom}
                />
            )}
        </Bg>
    );
};

export default MainMenu;

