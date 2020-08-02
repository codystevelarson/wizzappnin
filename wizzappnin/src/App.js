import React, { Component } from 'react';
import './App.css';

import { w3cwebsocket as W3CWebSocket } from 'websocket';

import { Card, Avatar, Input, Typography } from 'antd';
import 'antd/dist/antd.css';

const client = new W3CWebSocket('ws://localhost:8000');

export default class App extends Component {
  state = {
    userName: '',
    isLoggedIn: false,
    messages: [],
  };

  componentDidMount() {
    client.onopen = () => {
      console.log(`Websocket client connected`);
    };

    client.onmessage = (message) => {
      const dataFromServer = JSON.parse(message.data);
      console.log(`[REPLY] :: `, dataFromServer);
      this.setState({
        messages: [
          ...this.state.messages,
          { msg: dataFromServer.msg, user: dataFromServer.user },
        ],
      });
    };
  }

  sendButtonHandler = (message) => {
    client.send(
      JSON.stringify({
        type: 'message',
        msg: message,
        user: this.state.userName,
      })
    );
  };

  render() {
    let display = null;
    console.log('Messages', this.state.messages);
    let messages = this.state.messages.map((m, idx) => (
      <p key={idx}>
        [{m.user}] {m.msg}
      </p>
    ));
    if (this.state.isLoggedIn) {
      console.log(messages);
      display = (
        <div>
          <button onClick={() => this.sendButtonHandler('Hello')}>
            Send Message
          </button>
          {messages}
        </div>
      );
    } else {
      display = (
        <div style={{ padding: '200px 40px' }}>
          <Input.Search
            placeholder='Enter Username'
            enterButton='Login'
            size='large'
            onSearch={(value) =>
              this.setState({ isLoggedIn: true, userName: value })
            }
          />
        </div>
      );
    }

    return <div className='main'>{display}</div>;
  }
}
