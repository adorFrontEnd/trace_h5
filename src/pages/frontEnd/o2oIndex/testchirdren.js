import React, { Component } from 'react';
import './index.less';
export default class demoItem extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { content, activedId,prizeIdIndex } = this.props;
    return (
      <div className={activedId ===content.prizeIndex? 'c-award__container row_item-active' : ' c-award__container '}>
        <img src='https://img.yzcdn.cn/upload_files/2020/01/13/FsNfTk00APfdZiQtC_la1qTSTyIt.png!small.png' className='c-award__icon' />
        
        <p className='l-general__desc c-award__desc'>{content.prizeName}</p>


      </div>
    );
  }
}



