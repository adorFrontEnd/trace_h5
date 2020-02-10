import React, { Component } from "react";
import { parseUrl } from '../../utils/urlUtils';
import { wxLogin, getWxAuthRedirectUri } from '../../api/wx/auth';
import Toast from '../../utils/toast';
import { Button, Spin } from 'antd';
import { getDetailByAppId, getToken } from '../../api/openApi/auth';

import './index.less'

const _title = "授权";
const _description = "";
const _defaultCount = 5;
class Page extends Component {
  state = {
    userId: null,
    appId: null,
    appDetail: null,
    loading: false,
    timerId: null,
    count: _defaultCount
  }

  componentDidMount() {

    document.title = '授权';
    this.setState({
      count: _defaultCount
    })
    let urlParams = parseUrl(this.props.location.search);
    if (urlParams && urlParams.args) {
      let { userId, appId, state } = urlParams.args;

      if (!userId) {
        Toast("缺少参数userId！");
        return;
      }

      if (!appId) {
        Toast("缺少参数appId！");
        return;
      }

      this.setState({
        userId, appId, state
      })

      this.setState({
        loading: true
      })
      getDetailByAppId({ appId })
        .then(appDetail => {
          this.setState({
            appDetail,
            loading: false
          })
          this.startCdTimeAuth();
        })
        .catch(() => {
          this.setState({
            loading: false
          })
        })
    }
  }

  startCdTimeAuth = () => {
    let timerId = setInterval(() => {
      let count = this.state.count;
      if (count <= 0) {
        this.authClicked();
        return;
      }
      count--;
      this.setState({
        count: count
      })
    }, 1000)

    this.setState({
      timerId
    })
  }


  clearTimerId = () => {
    if (this.state.timerId) {
      clearInterval(this.state.timerId);
      this.setState({
        timerId: null
      })
    }
  }

  authClicked = () => {
    this.clearTimerId();
    this.authAction();
  }

  authAction = () => {
    let { userId, appId, state, appDetail } = this.state;
    let redirectUrl = 'http://h5.trace.adorsmart.com/openApi/ADAuthLogin';
    let { wxAppId, callbackAddress } = appDetail;
    if (!wxAppId) {
      Toast('缺少微信AppId!');
      return;
    }

    if (!callbackAddress) {
      Toast('缺少授权回调地址!');
      return;
    }
    let redirect_uri = encodeURIComponent(callbackAddress);
    let wxState = userId + "__" + appId + "__" + redirect_uri + (state ? "__" + state : "");

    let uri = getWxAuthRedirectUri(redirectUrl, null, wxState, wxAppId);
    window.location.href = uri;
  }

  /**渲染**********************************************************************************************************************************/

  render() {
    return (
      <div className='auth-main-content'>

        <Spin
          spinning={this.state.loading}
        >
          {
            this.state.appDetail ?
              <div>
                <div style={{ marginTop: 30 }}>使用{this.state.appDetail.wxName}进行授权</div>
                <div className='auth-content'>
                  <div>
                    <div><img src={this.state.appDetail.wxLogo} style={{ height: 60, width: 60 }} /></div>
                    <div>{this.state.appDetail.wxName}</div>
                  </div>

                  <img src='/image/auth.png' style={{ height: 30, width: 30, margin: 20 }} />

                  <div>
                    <div><img src={this.state.appDetail.logo} style={{ height: 60, width: 60 }} /></div>
                    <div>{this.state.appDetail.applicationName}</div>
                  </div>
                </div>
                <div className='auth-button'>
                  <div>
                    <div>授权后应用将获得以下权限：</div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ borderRadius: "50%", height: 8, width: 8, background: "#666", marginRight: "6px" }}></div>访问你的系统资料</div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ borderRadius: "50%", height: 8, width: 8, background: "#666", marginRight: "6px" }}></div>同步你的系统信息</div>

                    <div> <Button type='primary' style={{ marginTop: 20, width: 100 }} disabled={!this.state.appId || !this.state.userId} onClick={this.authClicked}>授权</Button></div>
                    <div style={{ lineHeight: '30px', fontSize: 16,marginTop:20 }}>
                      倒计时<span style={{margin:"0 6px",color:"#F00"}}>{this.state.count}秒</span>后自动授权
                    </div>
                  </div>
                </div>
              </div>
              :
              <div style={{ width: "100%", minHeight: 200 }}></div>
          }

        </Spin>
      </div>
    )
  }
}

export default Page;