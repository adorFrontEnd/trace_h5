import React, { Component } from "react";
import { parseUrl, joinParam } from '../../utils/urlUtils';
import { wxLogin, getWxAuthRedirectUri } from '../../api/wx/auth';
import { getDetailByAppId, getToken } from '../../api/openApi/auth';

import { Button, Spin } from 'antd';


import './index.less'

const _title = "授权";
const _description = "";

class Page extends Component {

  state = {
    loading: false,
    detaiLoading: false
  }

  componentDidMount() {

    document.title = '授权'
    let urlParams = parseUrl(this.props.location.search);
    if (urlParams && urlParams.args) {
      let { code, state } = urlParams.args;
      if (code && state) {
        let [userId, appId, redirect_uri, ADState] = state.split("__");
        this.setState({
          loading: true
        })
        this.showAppDetail(appId);
        getToken({ userId, appId, code })
          .then(data => {

            let { token } = data;
            this.setState({
              loading: false
            })
            let adRedirectUrl = this.getAdRedirectUrl(redirect_uri, token, ADState);
            if (adRedirectUrl) {
              window.location.href = adRedirectUrl;
            }
          })
          .catch(() => {
            this.setState({
              loading: false
            })

          })
      }
    }
  }

  getAdRedirectUrl = (redirect_uri, token, state) => {

    if (!redirect_uri || !token) {
      return;
    }
    let _uri = decodeURIComponent(redirect_uri);
    let uri = parseUrl(_uri);
    let { args, location } = uri;
    let params = { token, ...args };
    if (state) {
      params.state = state
    }

    let adRedirectUrl = joinParam(location, params);
    return adRedirectUrl;
  }

  showAppDetail = (appId) => {
    this.setState({
      detaiLoading: true
    })
    getDetailByAppId({ appId })
      .then(appDetail => {
        this.setState({
          appDetail,
          detaiLoading: false
        })
      })
      .catch(() => {
        this.setState({
          detaiLoading: false
        })
      })
  }


  /**渲染**********************************************************************************************************************************/

  render() {
    return (
      <div className='auth-main-content'>
        <Spin spinning={this.state.detaiLoading} >
          {
            this.state.appDetail ?
              <div>
                <div style={{ marginTop: 30 }}>使用{this.state.appDetail.wxName}进行授权</div>
                <div className='auth-content'>
                  <div>
                    <div><img src={this.state.appDetail.wxLogo} style={{ height: 60, width: 60 }} /></div>
                    <div>{this.state.appDetail.wxName}</div>
                  </div>
                </div>
                <Spin
                  spinning={this.state.loading} style={{ width: "100%", minHeight: 200 }} tip='授权中...'
                >
                  <div className='auth-button'>
                    <div>
                      <div>授权后应用将获得以下权限：</div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ borderRadius: "50%", height: 8, width: 8, background: "#666", marginRight: "6px" }}></div>访问你的系统资料</div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ borderRadius: "50%", height: 8, width: 8, background: "#666", marginRight: "6px" }}></div>同步你的系统信息</div>
                    </div>
                  </div>
                </Spin>
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