import {useState} from 'react';
import React from 'react';
import Avatar from '../../components/common/avatar/avatar.jsx';
import Coins from '../../components/common/coins/coins.jsx';
import './market.css';
import Bg from '../../components/layout/bg';
import CueCarousel from '../../components/common/CueCarousel/CueCarousel.jsx';
import { useNavigate } from 'react-router-dom';
import { HandleBuy } from '../../api/market.js';
import BackButton from '../../components/common/BackButton.jsx';

const Market = () => {

    const [coins, setCoins] = useState(() =>
        Number(localStorage.getItem("coins") || 0)
    );

    const [cues_possess, setCuesPossess] = useState(() =>    
        JSON.parse(localStorage.getItem('cueOwned') || '[]')
    );

    const [cues_npossess, setCuesNpossess] = useState(() =>
        JSON.parse(localStorage.getItem('cueNowned') || '[]')
    );

    const navigate = useNavigate();
    const JmptoUserInfo = () => {
        navigate('/userInfo');
    };

    const [buyingId, setBuyingId] = React.useState(null);

    const BuyCue = async (cue) => {
        const userId = localStorage.getItem('user_id');

        if (buyingId) return { ok: false, msg: "busy" };

        try {
            setBuyingId(cue.bar_id);
            const response = await HandleBuy(userId, cue.bar_id);

            if (response && response.status === 200) {
                const data = response.data.data;

                setCoins(data.coins);
                setCuesPossess(data.bar_possess);
                setCuesNpossess(data.bar_npossess);

                localStorage.setItem("coins", data.coins);
                localStorage.setItem("cueOwned", JSON.stringify(data.bar_possess));
                localStorage.setItem("cueNowned", JSON.stringify(data.bar_npossess));

                return { ok: true, data };
            }

            return { ok: false, msg: response.data?.message || "购买失败" };

        } catch (err) {
            return { ok: false, msg: err.message};
        } finally {
            setBuyingId(null);
        }
    };

    return (
        <Bg children={"market"}>
            <div className="avatar-container">
                <Avatar onClick={JmptoUserInfo}/>
            </div>
            <Coins amount={coins}/>
            <div>
                <CueCarousel
                    CueInfo={[
                        ...cues_npossess.map(cue => ({ ...cue, owned: false })),
                        ...cues_possess.map(cue => ({ ...cue, owned: true }))
                    ]}
                    onBuy={BuyCue}
                    buyingId={buyingId}
                />

            </div>
            <BackButton/>
        </Bg>
    );
};

export default Market;

