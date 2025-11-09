import React, { useState } from 'react';
import './login.css';
import Bg from '../../components/layout/bg';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleLogin = () => {
        // Handle login logic here
        // If login fails, setErrorMessage('Your error message here');
    };

    const handleRegister = () => {
        // Handle registration logic here
        // If registration fails, setErrorMessage('Your error message here');
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