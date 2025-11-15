import React, { useRef, useState } from 'react';
import Avatar from '../../components/common/avatar/avatar.jsx';
import Coins from '../../components/common/coins/coins.jsx';
import './UserInfo.css';
import Bg from '../../components/layout/bg';
import UserInfoPanel from '../../components/common/UserInfoPanel/UserInfoPanel.jsx';
import BackButton from "../../components/common/BackButton";

const UserInfo = () => {

    const user_id = localStorage.getItem('user_id');
    const matches = localStorage.getItem('matches');
    const WinGames = localStorage.getItem('WinGames');
    const SERVER_URL = import.meta.env.VITE_BACKEND_URL;
    const CueOwned = localStorage.getItem('cueOwned') ? JSON.parse(localStorage.getItem('cueOwned')) : [];

    // ⬇ 新增：控制头像
    const fileInputRef = useRef(null);
    const [avatarUrl, setAvatarUrl] = useState(localStorage.getItem("avatar") || '/default-avatar.png');

    // 点击头像触发 input
    const openFilePicker = () => {
        fileInputRef.current.click();
    };

    // 处理文件选择
    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // 本地预览
        const localUrl = URL.createObjectURL(file);
        setAvatarUrl(localUrl);

        // 存入 localStorage（如果还没接后台）
        localStorage.setItem("avatar", localUrl);

        // 如需上传到服务器:
        // const formData = new FormData();
        // formData.append("avatar", file);
        // await fetch(SERVER_URL + "/upload-avatar", {
        //     method: "POST",
        //     body: formData
        // });

    };

    return (
        <Bg children={"userInfo"}>

            {/* 隐藏的上传控件 */}
            <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                accept="image/*"
                onChange={handleAvatarChange}
            />

            {/* 点击头像触发上传 */}
            <div className="avatar-container">
                <Avatar src={avatarUrl} onClick={openFilePicker} />
            </div>

            <Coins />

            <div style={{
                position: 'absolute',
                top: '150px',
                left: '50%',
                transform: 'translateX(-50%)'
            }}>
                <UserInfoPanel user={{
                    id: user_id || '123456',
                    matches: matches || 0,
                    winRate: (matches != 0 && WinGames) ? ((WinGames / matches) * 100).toFixed(2) : 0,
                    rank: '青铜III'
                }} />
            </div>

            <BackButton />

            <div className="cue-section">
                <h2 className="user-cue-title">我的球杆展柜</h2>
                <div className="user-cue-carousel">
                    {CueOwned.map((cue) => (
                        <div key={cue.bar_id} className="user-cue-card">
                            <img src={SERVER_URL + cue.bar_pictureb} alt={cue.bar_name} className="user-cue-image" />
                        </div>
                    ))}
                </div>
            </div>

        </Bg>
    );
};

export default UserInfo;
