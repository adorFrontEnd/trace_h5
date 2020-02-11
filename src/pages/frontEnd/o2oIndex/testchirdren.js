import React, { Component } from 'react';
import './index.less';
export default class demoItem extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { content, activedId } = this.props;
    return (
      // <div className={activedId === content.id ? 'row_item row_item-active l-general__desc c-award__desc' : 'row_item l-general__desc c-award__desc'} id={`row_item_${content}` }>
      //   {content.name}
      // </div>
      <div className={activedId === content.id ? 'c-award__container row_item-active' : ' c-award__container '}>
        <img src='https://img.yzcdn.cn/upload_files/2020/01/13/FsNfTk00APfdZiQtC_la1qTSTyIt.png!small.png' className='c-award__icon' />
        {/* <p >一等奖</p> */}
        <p className='l-general__desc c-award__desc'>{content.name}</p>


      </div>
    );
  }
}



