import React, { Component } from "react";
import './index.less';

export default class Page extends Component {

  render() {
    return <div>
      <div className='bottom' >
        <div onClick={this.props.clickAntiFake} style={{ marginTop: '10px' }}>
          <img src={this.props.isShowAntiFake ? '/image/antiFake_active.png' : '/image/antiFake.png'} className='icon1' alt='' />
          <div className={this.props.isShowAntiFake ? "active-color" : "color"} style={{ marginLeft: '5px' }}>  发现</div>
        </div>
        <div onClick={this.props.clickMemberCenter} style={{ marginTop: '10px' }}>
          <img src={this.props.isShowMemberCenter ? '/image/menberCenter_active.png' : '/image/menberCenter.png'} className='icon2' alt='' />
          <div className={this.props.isShowMemberCenter ? "active-color" : "color"}>  我的</div>
        </div>
      </div>
    </div>
  }
}
