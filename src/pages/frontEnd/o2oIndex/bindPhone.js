import React, { Component } from 'react';
import './index.less';
import { getCacheWxUserInfo } from '../../../middleware/localStorage/wxUser';
import { getImageVerifiCode, sendMessages, bindPhoneNumber } from '../../../api/frontEnd/trace';
import ActivityPage from '../../../components/common-page/ActivityPage';
import wx from 'weixin-js-sdk';
import Toast from '../../../utils/toast';
import { parseUrl, joinParam, getReactRouterParams } from '../../../utils/urlUtils';
import { createOrder } from '../../../api/frontEnd/o2oIndex';

const mapKey = '8052f9e9c547eae2205aa45225407b74'
const _title = "绑定手机号";
const _description = "";


class Page extends Component {
  state = {
    verifyCDTime: 60,
    cdTimer: null,
    showVerifyCDTime: false,
    isShowVerifyBox: false,
    phone: '',
    verifyImage: null,
    imgeCode: '',
    code: ''
  }
  componentDidMount() {
    this.imageChange();
  }

  /**获取URL的参数Id */
  getUrlId = () => {
    let urlParams = parseUrl(this.props.location.search);
    if (urlParams && urlParams.args && urlParams.args.id) {
      return urlParams.args.id
    }
  }

  // 开始倒计时
  _startVerifyCDtime = () => {
    if (this.state.cdTimer) {
      return
    }
    this.setState({ showVerifyCDTime: true })
    this.state.cdTimer = setInterval(() => {
      let time = this.state.verifyCDTime - 1
      this.setState({
        verifyCDTime: time
      })
      if (time <= 0) {
        this._resetCDtimeNum();
        this._clearCDTimer();
      }
    }, 1000)
  }

  // 重置倒计时
  _resetCDtimeNum = () => {
    this.setState({
      verifyCDTime: 60,
      showVerifyCDTime: false
    });
  }

  // 清除倒计时
  _clearCDTimer = () => {
    if (this.state.cdTimer) {
      clearInterval(this.state.cdTimer);
      this.state.cdTimer = null;
    }
  }
  // 点击获取验证码
  clickGetverifyCode = () => {
    let { phone } = this.state;
    if (!phone) {
      Toast("请先输入手机号")
      return;
    }
    if (phone.length < 11) {
      Toast("手机号格式不正确")
      return;
    }
    this.setState({ isShowVerifyBox: true }, () => {
      this.getImageVerifiCode()
    });
  }
  getphone = (event) => {
    this.setState({
      phone: event.target.value
    })
  }
  getCode = (e) => {
    this.setState({ code: e.target.value })
  }
  //********************************获取图片验证码************************************** */ 
  imageChange = () => {
    this.setState({
      now: Date.now()
    })
  }
  getImageVerifiCode = () => {
    let { phone } = this.state
    let verifyImage = getImageVerifiCode({ phone })
    this.setState({
      verifyImage
    })
  }
  getImgeCode = (event) => {
    this.setState({
      imgeCode: event.target.value
    })
  }
  clickComfirm = () => {
    this.setState({ isShowVerifyBox: false }, () => {
      let wxUserInfo = getCacheWxUserInfo();
      // if (!wxUserInfo || !wxUserInfo.token) {
      //   return;
      // }
      // let token = wxUserInfo.token;
      let token='kcuFhL8NStlOPtyCmEAQKRGHJ7gHWjCZX0gG1zYSCuT2lOxwfisRTANkDYsTymvw'
      let { phone, imgeCode } = this.state;
      sendMessages({ phone, token, code: imgeCode })
        .then((data) => {
          Toast('发送成功!')
          this.setState({ showVerifyCDTime: true })
          this._startVerifyCDtime()
        })
    });
  }

  // 隐藏验证码的modal
  hideVerifyCodeModal = (e) => {
    this.setState({ isShowVerifyBox: false });
    e.stopPropagation();
  }

  clickVerifyCode(e) {
    e.stopPropagation();
  }

  bindPhone = () => {
    let { phone, code } = this.state;
    let wxUserInfo = getCacheWxUserInfo();
    if (!wxUserInfo || !wxUserInfo.token) {
      return;
    }
    let token = wxUserInfo.token;
    let id = this.getUrlId();
    bindPhoneNumber({ phone, code, token })
      .then(data => {
        Toast('绑定成功！');
        return createOrder({ id, token });
      })
      .then((data) => {
        if (data && data.id) {
          let orderId = data.id;
          let pathParams = getReactRouterParams('/frontEnd/orderDetail', { orderId });
          this.props.history.push(pathParams);
        }
      })
  }

  /**下单********************************************************************/

  // *******************************跳转**************************************

  //UI渲染
  render() {
    const { backgroundImage, backgroundColor, phone, verifyImage } = this.state;
    return (
      <ActivityPage title={_title} description={_description} >
        <div style={{ background: '#f2f2f2', height: '100vh', padding: '20px', paddingTop: '25%', display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div>为了提供更好的服务，需绑定您的手机号</div>
            <div style={{ padding: '30px' }}>
              <div style={{ display: 'flex', justifyContent: ' space-between', borderBottom: '1px solid #ccc' }}>
                <input onChange={this.getphone} placeholder-style="color:#ccc" placeholder="填写手机号" value={phone} className='phoneNum' style={{ width: '68%' }} />
                {
                  this.state.showVerifyCDTime ?
                    <div></div> : <div className={phone && phone.length == 11 ? 'verifycode_active' : 'verifycode'} onClick={this.clickGetverifyCode}>获取验证码</div>
                }

              </div>

              <div style={{ display: 'flex', justifyContent: ' space-between', borderBottom: '1px solid #ccc', marginTop: '20px' }}>
                <input onChange={this.getCode} placeholder-style="color:#ccc" placeholder="填写验证码" value={this.state.code} className='phoneNum' style={{ width: '68%' }} />
                {
                  this.state.showVerifyCDTime ?
                    <div style={{ color: '#FF2B64', lineHeight: '42px' }} > {this.state.verifyCDTime}后重发</div> : null
                }

              </div>
            </div>
          </div>
          <div className='binding' onClick={this.bindPhone}>绑定</div>
        </div>

        {
          this.state.isShowVerifyBox ?
            <div className='commodity_attr_box' onClick={this.hideVerifyCodeModal} style={{ height: "100vh",background:'#949494' }}>
              <div style={{textAlign:'right',padding:'10px'}}> <img src='/image/close.png' className='closeimg' onClick={this.clickVerifyCode} /></div>
              <div className='content commodity_attr_box' onClick={this.clickVerifyCode}>
                <div>填写下图中的验证码</div>
                <div className='login-container '>
                  <input  type="text" className="login-input" onChange={this.getImgeCode} style={{marginTop:'0'}}/>
                  <div className='verify-image'>
                    <img src={verifyImage} style={{ width: '100%', height: '100%' }}></img>
                  </div>
                </div>
                <div className='comfirm' onClick={this.clickComfirm}>确定</div>
              </div>
            </div> : null
        }
      </ActivityPage >
    );
  }
}
export default Page;

