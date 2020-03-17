
import React, { Component } from "react";
import { Link } from 'react-router-dom';
import ActivityPage from '../../../components/common-page/ActivityPage';
// import Toast from '../../../utils/toast';
import Toast, { T } from 'react-toast-mobile';
import 'react-toast-mobile/lib/react-toast-mobile.css';
import { Modal } from 'antd';
import { parseUrl } from '../../../utils/urlUtils';
import { wxLogin } from '../../../api/wx/auth';
import { isWxUserLogin, wxUserLogout, setCacheWxUserInfo, getCacheWxUserInfo } from '../../../middleware/localStorage/wxUser';
import { wxConfigInit, scanQRCode } from '../../../api/wx/wxConfig';
import { traceabilityCheck, getDetailByUserId, getVersionFrn } from '../../../api/frontEnd/trace';
import wx from 'weixin-js-sdk';
import './index.less'

const _title = "手机溯源";
const _description = "手机溯源";
class Page extends Component {
  state = {
    pageAfterInit: false,
    clickshare: true,
    price: '',
    antiCounterfeitingCode: null,
    uniqueCode: null,
    // uniqueCode: '000011000042019080000000a',
    status: 0,
    traceDetail: null,
    frnId: null,
    backgroundImage: null,
    buttonStyleBgColor: null,
    buttonStyleColor: null,
    buttonStyleType: null,
    backgroundColor: null,
    isShow: false
  }

  componentDidMount() {
    let urlParams = parseUrl(this.props.location.search);
    if (!urlParams.args || !urlParams.args.frnId) {
      return;
    }
    let { frnId,uniqueCode } = urlParams.args;
    
    this.setState({
      frnId
    }, () => {
      // let {frnId}=this.state
      this.pageInit(frnId);
      this.getStyle(frnId)
    })



  }
  // 获取样式
  getStyle = (frnId) => {
    // let { frnId } = this.state
    getDetailByUserId({
      frnId
    }).then((res) => {
      if (res) {
        if (res.background) {
          let backgroundImage = JSON.parse(res.background).image;
          let backgroundColor = "#" + JSON.parse(res.background).color;
          this.setState({
            backgroundImage,
            backgroundColor
          })
        }
        if (res.button) {
          let buttonStyleBgColor = "#" + JSON.parse(res.button).buttonStyleBgColor;
          let buttonStyleColor = "#" + JSON.parse(res.button).buttonStyleColor;
          let buttonStyleType = JSON.parse(res.button).buttonStyleType;
          this.setState({
            buttonStyleBgColor,
            buttonStyleColor,
            buttonStyleType
          })
        }
      }

    })
  }
  pageInit = (frnId) => {
    wxConfigInit(null, frnId, null);
    this.setState({
      pageAfterInit: true,
      frnId
    })
    wx.ready(() => {
      this.scanCode()
    });

  }
  //扫描二维码
  scanCode = () => {
    scanQRCode()
      .then(data => {
        data.replace('@', '');
        let urlParams = parseUrl(data);
        if (!urlParams) {
          return;
        }
        if (!urlParams.args) {
          return;
        }
        if (urlParams.args.code) {
          let uniqueCode = urlParams.args.code;
          let frnId = this.state.frnId;
          this.setState({
            uniqueCode
          })
          traceabilityCheck({
            uniqueCode,
            frnId
          })
            .then((res) => {
              this.setState({
                status: res.status
              })
              if (res.status != 1) {
                this.setState({
                  traceDetail: res
                })
                this.goTraceDetail();
              }
            })
            .catch(() => {
              this.setState({
                isShow: true
              })
            })
        }
      })

  }
  // 获取输入的价格
  getPrice = (e) => {
    let price = e.target.value
    this.setState({
      price
    })
  }
  // 查询详情
  searchDetail = () => {
    let { price, uniqueCode, frnId } = this.state
    if (price == '') {
      T.alert('请先输入价格!')
    } else {
      traceabilityCheck({
        price,
        uniqueCode,
        frnId
      }).then((res) => {
        this.setState({
          traceDetail: res
        })
        this.goTraceDetail();
      })
    }

  }

  goTraceDetail = () => {
    let parmas = {};
    let { traceDetail, frnId, status } = this.state;
    parmas.traceDetail = traceDetail;
    parmas.frnId = frnId;
    parmas.status = status;
    this.props.history.push({ pathname: '/frontEnd/traceDetail', state: { traceDetail: this.state.traceDetail, frnId: this.state.frnId, status: this.state.status } });
  }

  render() {
    const { backgroundImage, buttonStyleBgColor, buttonStyleColor, buttonStyleType, backgroundColor } = this.state;
    return (
      <ActivityPage title={_title} description={_description}>
        {
          this.state.status == 1 ?
            <div style={{ backgroundImage: `url(${backgroundImage})`, minHeight: '100vh', padding: '50px 30px 0 30px', background: backgroundColor, backgroundSize: '100%' }} >
              {
                buttonStyleType == '1' ?
                  <div style={{ padding: '43px 30px', background: '#fff', width: '100%' }}>
                    <input placeholder='请输入价格' type='number' onChange={this.getPrice} className='input-1' />
                    <button onClick={this.searchDetail} style={{ background: buttonStyleBgColor, color: buttonStyleColor, marginTop: '10px' }} className='button-1'>提交</button>
                  </div>
                  :
                  null
              }
              {
                buttonStyleType == '2' ?
                  <div style={{ padding: '43px 30px', background: '#fff', width: '100%' }}>
                    <div>
                      <input placeholder='请输入价格' type='number' onChange={this.getPrice} className='input-2' />
                      <button onClick={this.searchDetail} className='button-2' style={{ background: buttonStyleBgColor, color: buttonStyleColor }}>提交</button>
                    </div>
                  </div>
                  :
                  null
              }
            </div>
            :
            null
        }
        {
          this.state.isShow ?
            <div className='tipdiv'>
              <div className='tip'>
                <img src='/image/tip.png' className='tipimg'></img>
                <div style={{ fontSize: '16px' }}>可能不是该企业的二维码!</div>
              </div>

            </div>
            : null
        }
        <Toast />
      </ActivityPage>

    )
  }
}
export default Page;