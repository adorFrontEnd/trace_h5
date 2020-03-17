
import React, { Component } from "react";
import { Link } from 'react-router-dom';
import ActivityPage from '../../components/common-page/ActivityPage';
// import Toast from '../../../utils/toast';
import Toast, { T } from 'react-toast-mobile';
import 'react-toast-mobile/lib/react-toast-mobile.css';
import { Modal } from 'antd';
import { parseUrl, joinParam } from '../../utils/urlUtils';
import { wxConfigInit, scanQRCode } from '../../api/wx/wxConfig';
import { parseScanCode, parseScanCodeCompatBarCode } from '../../utils/qrCode';
import wx from 'weixin-js-sdk';
import './index.less';
const _title = "验证";
const _description = "验证";
class Page extends Component {
  state = {
    pageAfterInit: false,
    frnId: 4,
    showData: null,
    code: null,
    show:false

  }

  componentDidMount() {
    let { frnId } = this.state;
    this.pageInit(frnId)

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
        this.setState({show:false})
        let result = this.getScanCode(data);
        if (!result) {
          this.setState({ showData: 0, code: data });
          return;
        }
        if (result.code || result.codeType) {
          if (result.codeType == 'product') {
            this.setState({ showData: 1, code: data })
          } else if (result.codeType == 'box') {
            this.setState({ showData: 2, code: data })
          }
        }
      })
      .catch(res=>{
        this.setState({show:true})
      })

  }
  // 解析扫码
  getScanCode = (code) => {
    if (!code) {
      return;
    }
    let result = parseScanCodeCompatBarCode(code);
    return result;
  }





  render() {
    const {showData ,show}= this.state
    return (

      <div style={{ width: '100%', height: '100vh', margin: '0 auto', padding: '10px' }}>

        <div style={{ textAlign: 'center', marginTop: '30%', fontSize: '16px' }}>
          {show?
          <div onClick={this.pageInit} style={{background:'#1AAD19',margin:'0 auto',width:'170px',color:'#fff',padding:'10px',borderRadius:'5px'}}>点击开始扫描验证</div>:null}
    
          {showData == 0 ?
            <div>
              <img src='/image/fail.png' style={{ width: '64px', height: '64px' }} alt=''></img>
              <div style={{ marginTop: '10px', fontWeight: 'bold' }}>该码格式不正确，请检查内容</div>
              <div style={{ marginTop: '10px', fontWeight: 'bold' }}>二维码内容为</div>
              <div style={{ wordWrap: 'break-word', border: '1px solid #f2f2f2', padding: '10px', marginTop: '10px' }}> {this.state.code}</div>

            </div> : null
          }
          {
            showData == 1 ? <div>
              <img src='/image/complete.png' style={{ width: '64px', height: '64px' }} alt=''></img>
              <div style={{ marginTop: '10px', fontWeight: 'bold' }}>该码为商品码</div>
              <div style={{ marginTop: '10px', fontWeight: 'bold' }}>二维码内容为</div>
              <div style={{ wordWrap: 'break-word', border: '1px solid #f2f2f2', padding: '10px', marginTop: '10px' }}> {this.state.code}</div>

            </div> :null
          }

          {
            showData == 2 ?
              <div>
                <img src='/image/complete.png' style={{ width: '64px', height: '64px' }} alt=''></img>
                <div style={{ marginTop: '10px', fontWeight: 'bold' }}>该码为箱码</div>
                <div style={{ marginTop: '10px', fontWeight: 'bold' }}>二维码内容为</div>
                <div style={{ wordWrap: 'break-word', border: '1px solid #f2f2f2', padding: '10px', marginTop: '10px' }}> {this.state.code}</div>

              </div> :null
          }




        </div>
      </div>



    )
  }
}
export default Page;