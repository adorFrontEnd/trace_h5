
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
    showData: false

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
        if (data.indexOf('http://h5.trace.adorsmart.com') != -1) {
          window.location.href = joinParam(data);
        } else if (data.indexOf('http://cx.panpass.com') != -1) {
          window.location.href = joinParam(data);
        } else {
          this.setState({ showData: true })
          setTimeout(() => {
            window.history.back()
          }, 3000)
        }

      })

  }





  render() {
    const showData = this.state.showData
    return (
      <ActivityPage title={_title} description={_description}>
        {
          showData ? <div style={{ width: '50%', textAlign: 'center', margin: '0 auto', marginTop: '30%', fontSize: '16px' }}>请扫描正确的二维码</div> : null
        }

      </ActivityPage>

    )
  }
}
export default Page;