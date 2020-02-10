
import React, { Component } from "react";
import { Link } from 'react-router-dom';
import ActivityPage from '../../components/common-page/ActivityPage';
// import Toast from '../../../utils/toast';
import Toast, { T } from 'react-toast-mobile';
import 'react-toast-mobile/lib/react-toast-mobile.css';
import { Modal } from 'antd';
import { parseUrl, joinParam } from '../../utils/urlUtils';
import { wxConfigInit, scanQRCode } from '../../api/wx/wxConfig';

import wx from 'weixin-js-sdk';

const _title = "扫描";
const _description = "扫描";
class Page extends Component {
  state = {
    pageAfterInit: false,
    frnId: 4,
    showData: null

  }

  componentDidMount() {
    let { frnId } = this.state;
    this.pageInit(frnId)

  }
  addEle = (value) => {
    return <div >{value}</div>;
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
        if (data.indexOf('http') != -1) {
          window.location.href = joinParam(data);
        } else {
          this.setState({
            showData: data
          })
        }

      })

  }





  render() {
    const showData = this.state.showData
    return (
      <ActivityPage title={_title} description={_description}>
        <div style={{textAlign:'center',marginTop:'20px'}}>{this.addEle(showData)}</div>
      </ActivityPage>

    )
  }
}
export default Page;