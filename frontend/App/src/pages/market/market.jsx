import React from 'react';
import Avatar from '../../components/common/avatar/avatar.jsx';
import Coins from '../../components/common/coins/coins.jsx';
import './market.css';
import Bg from '../../components/layout/bg';
import CueCarousel from '../../components/common/CueCarousel/CueCarousel.jsx';
import { useNavigate } from 'react-router-dom';
import { HandleBuy } from '../../api/market.js';
import BackButton from '../../components/common/BackButton.jsx';

const cues_possess = localStorage.getItem('cueOwned')
    ? JSON.parse(localStorage.getItem('cueOwned'))
    : [];

const cues_npossess = localStorage.getItem('cueNowned')
    ? JSON.parse(localStorage.getItem('cueNowned'))
    : [];

const Market = () => {
    const navigate = useNavigate();
    const JmptoUserInfo = () => {
        navigate('/userInfo');
    };

    const [buyingId, setBuyingId] = React.useState(null);

    const BuyCue = async (cue) => {
        const userId = localStorage.getItem('user_id');
        if (buyingId) {
            return;
        }

        try {
            setBuyingId(cue.bar_id);
            const response = await HandleBuy(userId, cue.bar_id);
            // 根据你的后端返回结构调整判断逻辑
            if (response && response.status === 200) {
                alert(`成功购买球杆: ${cue.bar_name}`);
                // 可在这里触发刷新持有列表（例如重新请求后端）
            } else {
                // 如果后端把错误信息放在 response.data.message
                const msg = response?.data?.message || '购买失败';
                alert(`购买失败: ${msg}`);
            }
        } catch (err) {
            console.error('BuyCue error:', err);
            const msg = err?.response?.data?.message || err?.message || '网络或服务器错误';
            alert(`购买出错: ${msg}`);
        } finally {
            setBuyingId(null);
        }
    }

    return (
        <Bg children={"market"}>
            <div className="avatar-container">
                <Avatar onClick={JmptoUserInfo}/>
            </div>
            <Coins />
            <div>
                <CueCarousel CueInfo={[...cues_npossess, ...cues_possess]} onBuy={BuyCue} />
            </div>
            <BackButton/>
        </Bg>
    );
};

export default Market;

