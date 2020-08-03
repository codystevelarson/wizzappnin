import React from 'react';
import { Card } from 'antd';


const MessageCards = props => {
    const messages = props.messages.map((m, idx) => (
        <div key={idx} className={
            m.user === props.user
                ? 'card-container self'
                : 'card-container user'
        }>
            <div className='card-message'>
                <Card title={m.user} extra={<a href='x'>...</a>}>
                    <p>{m.msg}</p>
                </Card>
            </div>
        </div>
    ));

    return (
        <div>
            {messages}
        </div>
    );
}
export default MessageCards;
