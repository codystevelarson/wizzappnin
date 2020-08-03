import React, { Component } from 'react';
import './App.css';

import { w3cwebsocket as W3CWebSocket } from 'websocket';
import { Tag } from 'antd';
import 'antd/dist/antd.css';

import Login from './components/Login/Login';
import ChatBox from './components/ChatBox/ChatBox';
import Banner from './components/Banner/Banner';

export default class App extends Component {
  state = {
    userId: 0,
    userName: '',
    isLoggedIn: false,
    messages: [],
    message: '',
    connectionId: 'DISCONNECTED',
    onlineUsers: [],
    toUsers: []
  };

  client = new W3CWebSocket('ws://localhost:8000');


  componentDidMount() {
    // Open the connection
    this.client.onopen = this.socketOpenHandler;

    // Setup connection events
    // On Message from the server
    this.client.onmessage = this.socketMessageHandler;

    // When connection is closed
    this.client.onclose = this.socketCloseHandler;
  }

  // Set connection
  setConnection = (connectionId) => {
    this.setState({ connectionId });
  };


  // Login Function
  onLoginHandler = (value) => {
    if (!value)
      return;

    let id = value === 'admin' ? 99 : 5;

    let user = {
      isLoggedIn: true, userName: value, userId: id
    }

    this.setState(user);

    this.sendUserData(user);
  }


  sendUserData = (user) => {
    this.client.send(
      JSON.stringify({
        type: 'loadUser',
        user: {
          cid: this.state.connectionId,
          id: user.userId,
          un: user.userName
        },
      })
    );
  }

  updateUserList = (users) => {
    this.setState({ onlineUsers: users });
  }

  addToUser = (user) => {
    let idx = this.state.toUsers.indexOf(user);
    if (idx === -1) {

      this.setState(state => {
        const newList = [...state.toUsers, user];
        return { toUsers: newList }
      });
    }
    else {
      this.setState(state => {
        let toUsers = state.toUsers.filter((item, i) => i !== idx);
        return { toUsers }
      });
    }
  }

  clearToUsers = () => {
    this.setState({ toUsers: [] })
  }


  // Send Message Function
  sendButtonHandler = () => {
    if (!this.state.message)
      return;

    this.client.send(
      JSON.stringify({
        type: 'message',
        msg: this.state.message,
        user: this.state.userName,
        from: this.state.connectionId,
        to: this.state.toUsers, // use to send to specific user
      })
    );
    this.setState({ message: '' });
  };

  // Message Input 
  messageChangeHandler = (e) => {
    this.setState({ message: e.target.value });
  };


  //////
  // Socket Event Methods
  //////
  socketOpenHandler = (event) => {
    console.log(`Websocket client connected`);

  };

  socketCloseHandler = () => {
    // Wipe connection ID
    this.setState({ connectionId: 'DISCONNECTED' });
  };

  socketMessageHandler = (message) => {
    //Parse message
    const dataFromServer = JSON.parse(message.data);
    console.log(`[SERVER] :: `, dataFromServer);

    // IF CONNECTION SUCCESS MESSAGE
    if (dataFromServer.connectionId) {
      // Save connection ID
      this.setConnection(dataFromServer.connectionId);
      this.updateUserList(dataFromServer.users);
      return;
    }

    if (dataFromServer.userList) {
      this.updateUserList(dataFromServer.userList);
      return;
    }

    // Add messages to state
    this.setState({
      messages: [
        ...this.state.messages,
        { msg: dataFromServer.msg, user: dataFromServer.user },
      ],
    });
  };
  //////



  render() {
    let display = null;


    let greeting = <Banner info={this.state.connectionId} main="W!ZZ@PPN!N"></Banner>;

    if (this.state.isLoggedIn) {
      greeting = <Banner info={this.state.connectionId} main={"Hi " + this.state.userName}></Banner >;

      let userList = null;
      console.log(this.state.toUsers)
      if (this.state.onlineUsers && this.state.onlineUsers.filter((u, i) => u.cid !== this.state.connectionId).length) {
        userList =
          this.state.onlineUsers.filter((u, i) => u.cid !== this.state.connectionId).map((user, idx) => (
            <Tag key={idx}
              color={this.state.toUsers.find(u => u.cid === user.cid) ? 'processing' : 'default'}
              onClick={() => this.addToUser(user)}>
              {user.un}
            </Tag>
          ))
      } else {
        userList = <div className='empty-list'>None</div>
      }

      display = (
        <div>
          <div className="user-list">
            <h4>Online Users:</h4>
            {userList}
          </div>
          <ChatBox
            user={this.state.userName}
            to={this.state.toUsers}
            message={this.state.message}
            messages={this.state.messages}
            changeHandler={this.messageChangeHandler}
            sendHandler={this.sendButtonHandler}
            clearTo={this.clearToUsers}
          />
        </div>

      );
    } else {
      display = (
        <Login onLogin={this.onLoginHandler} />
      );
    }



    return (
      <div className='main'>
        {greeting}
        {display}
      </div>
    );
  }
}
