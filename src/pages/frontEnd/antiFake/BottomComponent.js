import React, { Component } from "react";
import './index.less';

export default class Page extends Component {

  render() {
    return <div>
      <div className='bottom' >
        <div onClick={this.props.clickAntiFake}>
          <img src={this.props.isShowAntiFake ? '/image/antiFake_active.svg' : '/image/antiFake.svg'} className='icon1' alt='' />
          <div className={this.props.isShowAntiFake ? "active-color" : "color"} style={{ marginLeft: '6px' }}>  发现</div>
        </div>
        <div onClick={this.props.clickMemberCenter}>
          <img src={this.props.isShowMemberCenter ? '/image/menberCenter_active.svg' : '/image/menberCenter.svg'} className='icon2' alt='' />
          <div className={this.props.isShowMemberCenter ? "active-color" : "color"} style={{ marginLeft: '6px' }}>  我的</div>
        </div>
      </div>
    </div>
  }
}
