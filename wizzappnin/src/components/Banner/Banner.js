import React from 'react';


const Banner = props => {
    console.log(props.childern);
    return (
        <div className="banner">
            <span className="info">{props.info}</span>
            <h2 className='banner-main'>{props.main}</h2>
        </div>
    )

}

export default Banner;