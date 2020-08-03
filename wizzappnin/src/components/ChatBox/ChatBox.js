import React from 'react';
import { Input, Button } from 'antd';

import MessageCards from '../MessageCards/MessageCards';

const ChatBox = props => {
    let toList = null;

    let toListTags = <div className='user-tag'>Everyone</div>;
    let clearBtn = null;
    if (props.to.length) {
        toListTags = props.to.map((user, idx) => (
            <div className='user-tag' key={idx}>{user.un}{idx !== props.to.length - 1 && props.to.length > 1 ? ', ' : ''}</div>
        ))
        clearBtn = <Button onClick={props.clearTo} ghost>Clear</Button>;
    }



    toList = (
        <div className='user-tag-container'>
            {clearBtn}
            Sending to:
            {toListTags}

        </div>
    )

    return (
        <div className='chatbox-container'>
            <Input.Search
                placeholder='Say Something...'
                enterButton='Send'
                size='large'
                value={props.message}
                onChange={(event) => props.changeHandler(event)}
                onSearch={props.sendHandler}
            />
            {toList}
            <div className='message-container'>
                <MessageCards messages={props.messages} user={props.user} />
            </div>
        </div>
    );
}

export default ChatBox;