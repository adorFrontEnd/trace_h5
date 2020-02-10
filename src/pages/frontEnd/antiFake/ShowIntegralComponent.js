import React, { Component } from "react";
import './index.less';

export default class Page extends Component {

  render() {
    return <div>
      {
        this.props.isShowIntegral ?
          <div className='box'>
            <div className='integral'>
              {
                !this.props.isIntegralBind ? <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 10px 0 10px' }}>
                  <div></div>
                  <img src='/image/close.png' className='closeimg' onClick={this.props.clickIntegraModal} alt=''/>
                </div>
                  : null
              }
              <div style={{ padding: '60px', height: '45vh' }}>
                <div style={{ width: '50px', height: '63px', margin: '10px auto' }}>
                  <img src='/image/integral.png' style={{ width: '100%', height: '100%' }} alt=''/>
                </div>
                {
                  this.props.isIntegralBind ?
                    <div>
                      <div style={{ width: '100%', textAlign: 'center', fontWeight: 'bold', fontSize: '22px' }}>积分+{this.props.integralInfo &&this.props.integralInfo.integral ? this.props.integralInfo.integral : null}</div>
                      <div className='confirm' onClick={this.props.comfirmIncreasePoints}>确认</div>
                    </div>
                    :
                    <div onClick={() => this.props._bindPhone(this.props.integralInfo && this.props.integralInfo.integral)} className='confirm' style={{ width: "100%" }}>绑定手机号获取积分+{this.props.integralInfo&&this.props.integralInfo.integral ? this.props.integralInfo.integral : null}</div>
                }

              </div>
              <div style={{ width: "100%", height: "36px" }} className='flex-between'>
                <div className='circle' style={{ left: '-17px' }} ></div>
                < img src='/image/line.png' style={{ heigth: '3px', width: '100%' }} alt=''/>
                <div className='circle' style={{ right: '-17px' }}></div>
              </div>
              <div className='lineBbg'>
                <div style={{ textAlign: 'center', padding: '30px' }}>可到会员中心-积分查看</div>
              </div>
            </div>

          </div>
          : null
      }

    </div>
  }
}
