import React from 'react';
import { Input } from 'antd';

const Login = props => {

    return (
        <div className="login-container">
            <h2>Login</h2>
            <Input.Search
                placeholder='Enter Username'
                enterButton='Login'
                size='large'
                onSearch={value => props.onLogin(value)}
            />
            <a href='/'>Create an account</a>
        </div>
    );
}

export default Login;