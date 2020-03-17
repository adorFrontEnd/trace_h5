import React, { Component } from 'react';
import './index.less';
export default class demoItem extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { content, activedId} = this.props;
    return (
      <div className={activedId === content.prizeIndex? 'c-award__container row_item-active' : ' c-award__container '}>
        <img src={content.prizeImage?content.prizeImage:null} className='c-award__icon' />
        
        <p className='l-general__desc c-award__desc'>{content.prizeName?content.prizeName:content.prizeLevel}</p>


      </div>
    );
  }
}



