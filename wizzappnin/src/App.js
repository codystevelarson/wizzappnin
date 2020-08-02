import React, { Component } from 'react';
import './App.css';

import { w3cwebsocket as W3CWebSocket } from 'websocket';

import { Card, Avatar, Input, Typography } from 'antd';
import 'antd/dist/antd.css';

export default class App extends Component {
  state = {
    client: null,
    userName: '',
    isLoggedIn: false,
    messages: [],
    message: '',
    uid: 'DISCONNECTED',
  };

  componentWillMount() {
    this.setState({ client: new W3CWebSocket('ws://localhost:8000') });
  }

  componentDidMount() {
    this.state.client.onopen = (event) => {
      console.log(event);
      console.log(`Websocket client connected`);
    };

    this.state.client.onmessage = (message) => {
      const dataFromServer = JSON.parse(message.data);
      console.log(`[SERVER] :: `, dataFromServer);

      if (dataFromServer.uid) {
        console.log(dataFromServer);
        this.setConnection(dataFromServer.uid);
        return;
      }

      this.setState({
        messages: [
          ...this.state.messages,
          { msg: dataFromServer.msg, user: dataFromServer.user },
        ],
      });
    };

    this.state.client.onclose = () => {
      this.setState({ uid: 'DISCONNECTED' });
    };
  }

  sendButtonHandler = () => {
    this.state.client.send(
      JSON.stringify({
        type: 'message',
        msg: this.state.message,
        user: this.state.userName,
        to: 69420,
      })
    );
    this.setState({ message: '' });
  };

  messageChangeHandler = (e) => {
    console.log(e);
    this.setState({ message: e.target.value });
  };

  setConnection = (connection) => {
    this.setState({ uid: connection });
  };

  render() {
    let display = null;
    let messages = this.state.messages.map((m, idx) => (
      <div
        className={
          m.user === this.state.userName
            ? 'card-message self'
            : 'card-message user'
        }
      >
        <Card key={idx} title={m.user} extra={<a href='x'>...</a>}>
          <p>{m.msg}</p>
        </Card>
      </div>
    ));

    let greeting = <h2 className='greeting'>wizzappnin</h2>;

    if (this.state.isLoggedIn) {
      console.log(messages);
      greeting = <h3 className='greeting'>Hey {this.state.userName}</h3>;
      display = (
        <div>
          <Input.Search
            placeholder='Say Something...'
            enterButton='Send'
            size='large'
            value={this.state.message}
            onChange={(event) => this.messageChangeHandler(event)}
            onSearch={() => this.sendButtonHandler()}
          />
          <div className='message-container'>{messages}</div>
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

    return (
      <div className='main'>
        {this.state.uid}
        {greeting}
        {display}
      </div>
    );
  }
}
