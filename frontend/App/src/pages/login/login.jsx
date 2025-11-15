import React, { useState } from 'react';
import './login.css';
import Bg from '../../components/layout/bg';
import { registerUser, loginUser, getUserInfo } from '../../api/Login';
import { useNavigate } from 'react-router-dom';

const StoreUserInfo = (data) => {
    localStorage.setItem('CueOwned', JSON.stringify(data.bar_possess));
    localStorage.setItem('matches', data.total_games);
    localStorage.setItem('WinGames', data.win_games);
    localStorage.setItem('Win_Rate', data.win_games === 0 ? '0%' : ((data.win_games / data.total_games) * 100).toFixed(2) + '%');
    localStorage.setItem('coins', data.coins);
}

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    const handleRegister = async () => {
        setErrorMessage(''); // Clear previous error message

        if (!username || !password) {
            setErrorMessage('用户名和密码不能为空');
            return;
        }

        if (password.length < 8 || password.length > 20) {
            setErrorMessage('密码长度必须在 8 到 20 个字符之间');
            return;
        }

        try {
            const response = await registerUser(username, password, { withCredentials: true });
            console.log('状态码：', response.status);
            console.log('响应内容：', response.data.message); 
            console.log('user_id：', response.data.data.user_id);   
            if (response.status === 201) {
                alert(`注册成功`);
                
                const user_id = response.data.data.user_id;
                localStorage.setItem('user_id', user_id);
                localStorage.setItem('username', username);

                const res = await getUserInfo(user_id);
                localStorage.setItem('userInfo', JSON.stringify(res.data.data));
                console.log('用户信息：', res.data);
                StoreUserInfo(res.data.data);
                const storedUserInfo = localStorage.getItem('userInfo');
                console.log('userInfo：', storedUserInfo);

                navigate('/mainmenu');
            }
        } catch (error) {
            console.error('注册错误:', error);
            setErrorMessage(error.data?.error || '注册失败。');
        }
    };

    const handleLogin = async () => {
        setErrorMessage(''); // Clear previous error message
        try {
            const response = await loginUser(username, password);
            if (response.status === 200) {
                console.log('状态码：', response.status);
                console.log('响应内容：', response.data.message);
                alert(`登录成功`);

                localStorage.setItem('username', username);
                localStorage.setItem('user_id', response.data.data.user_id);
                // ✅ 登录成功后立即获取用户信息
                const res = await getUserInfo(user_id);
                localStorage.setItem('userInfo', JSON.stringify(res.data.data));
                console.log('用户信息：', res.data);
                StoreUserInfo(res.data.data);
                const storedUserInfo = localStorage.getItem('userInfo');
                console.log('userInfo：', storedUserInfo);

                navigate('/mainmenu');
            } else if (response.status === 401) {
                setErrorMessage(response.data.error || '登录失败，用户名或密码错误。');
            }
        } catch (error) {
            console.error('登录异常:', error);
            setErrorMessage(error.data?.error || '登录失败。');
        }
    };

    return (
        <Bg>
            <div className="page-container">
                <div className="login-container">
                    <div className='header'>用户登录/注册</div>
                        <div className='input-group'>
                            <input 
                                type="text" 
                                placeholder="请输入用户名：" 
                                value={username} 
                                onChange={(e) => setUsername(e.target.value)} 
                            />
                            <input 
                                type="password" 
                                placeholder="请输入密码：" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                            />
                        </div>
                    {errorMessage && <div className="error-message">{errorMessage}</div>}{/* Display error message if any */}
                    <div className="button-group">
                        <div className="button" onClick={handleRegister}>注册并登录</div>
                        <div className="button" onClick={handleLogin}>登录</div>
                    </div>
                </div>
            </div>
        </Bg>
    );
};

export default Login;