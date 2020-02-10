import React, { Component } from 'react';
import './index.less';
import ActivityPage from '../../../components/common-page/ActivityPage';
import { wxLogin, getWxAuthRedirectUri } from '../../../api/wx/auth';
import wx from 'weixin-js-sdk';
import Toast from '../../../utils/toast';
import { wxConfigInit, getUserLocation } from '../../../api/wx/wxConfig';
import { getWxConfig } from '../../../api/wx/common';
import { parseUrl, getReactRouterParams } from '../../../utils/urlUtils';
import { getArea,eventPage} from '../../../api/frontEnd/o2oIndex';
import { setCacheWxUserInfo, getCacheWxUserInfo } from '../../../middleware/localStorage/wxUser';
import { setTurntablePageInitData } from '../../../middleware/localStorage/o2oIndex';
import { attentionInfo } from '../../../api/frontEnd/menberCenter';
import MemberCenterComponent from '../antiFake/MemberCenterComponent';
import BottomComponent from '../antiFake/BottomComponent';
const _title = "智慧防伪";
const _description = "";
export default class O2oIndex extends Component {
  state = {
    isShowAntiFake: true,
    isShowMemberCenter: false,
    isShow: false,
    isgoO2o: true,
    
    // 会员信息
    attentionInfo: null,
    bindphoneNumberIntegral: null,
    menberCenterIntegral: null
    // token: 'kcuFhL8NStlOPtyCmEAQKRGHJ7gHWjCZX0gG1zYSCuT5yY31pomDZYIpgC5RVnst'
  }
  componentDidMount() {
    let urlParams = parseUrl(this.props.location.search);
    if (!urlParams || !urlParams.args) {
      Toast('无效链接！')
      return;
    }
    let { frnId, code } = urlParams.args;
    if (!code) {
      this.getWxAuth(frnId)
    } else {
      this.wxLogin(code, urlParams)
    }
  }
  getWxAuth = (frnId) => {
    let url = url || window.location.href;
    getWxConfig({ url, frnId })
      .then((res) => {
        let { appId } = res;
        let uri = getWxAuthRedirectUri(`http://test.h5.trace.adorsmart.com/frontEnd/o2oIndex`, 'user', frnId, appId);
        window.location.href = uri;
      })
  }
  wxLogin = (code, urlParams) => {
    let frnId = urlParams.args.state;
    wxLogin({ code, frnId })
      .then(data => {
        setCacheWxUserInfo(data);
        let token = data.token
        this.setState({ isShow: true })
        this.pageWxInit({ frnId, token })
          .then(data => {
            let { latitude, longitude } = data;
            let tencentLng = longitude;
            let tencentLat = latitude;
            let latitudeAndLongitude = `${tencentLng},${tencentLat}`;
            this.setState({ latitudeAndLongitude });
            return getArea({ latitudeAndLongitude, token });
          })
          .then(res => {
            if (res && res.length == 0) {
              this.setState({ isgoO2o: false })
            } else {
              this.setState({ isgoO2o: true, o2oList: res })
            }
          });

      })
      .catch((data) => {
        if (data == "trace.0010" || data == "trace.0011") {
          let url = url || window.location.href;
          getWxConfig({ url, frnId })
            .then(data => {
              let { appId } = data;
              let uri = getWxAuthRedirectUri(`http://test.h5.trace.adorsmart.com/frontEnd/o2oIndex`, 'user', null, appId);
              window.location.href = uri;
            })
        }
        if (data == 'trace.0028') {
          this.setState({ isShow: true });
          let wxUserInfo = getCacheWxUserInfo();
          let token = wxUserInfo.token
          this.pageWxInit({ frnId, token })
            .then(data => {
              let { latitude, longitude } = data;
              let tencentLng = longitude;
              let tencentLat = latitude;
              let latitudeAndLongitude = `${tencentLng},${tencentLat}`;
              this.setState({ latitudeAndLongitude });
              return getArea({ latitudeAndLongitude, token });
            })
            .then(res => {
              if (res && res.length == 0) {
                this.setState({ isgoO2o: false })
              } else {

                this.setState({ isgoO2o: true, o2oList: res })
              }
            });
        }
      })
  }
  /***微信注册SDK************************************************************************************************** */
  pageWxInit = (frn) => {
    let frnId = frn.frnId
    return new Promise((resolve, reject) => {
      // 注册jsdk
      wxConfigInit(null, frnId, null);
      wx.ready(() => {
        // 获取用户经纬度
        getUserLocation()
          .then((data) => {
            if (!data) {
              Toast('获取地理位置失败');
              return;
            }
            resolve(data)
          })
          .catch(() => {
            Toast('获取地理位置失败');
          })
      })
    })
  }

  // 点击防伪查询
  clickAntiFake = () => {
    this.setState({
      isShowAntiFake: true,
      isShowMemberCenter: false

    })
  }

  // 点击会员中心
  clickMemberCenter = () => {
    this.setState({
      isShowAntiFake: false,
      isShowMemberCenter: true
    })
    let wxUserInfo = getCacheWxUserInfo();
    let token = wxUserInfo.token
    this.getattentionInfo(token);
  }
  // 获取会员中心信息
  getattentionInfo = (token) => {
    attentionInfo({ token })
      .then(data => {
        this.setState({
          attentionInfo: data,
          bindphoneNumberIntegral: data.bindPhoneNumber,
          menberCenterIntegral: data.integral
        })
      })
  }


  // *******************************跳转**************************************
  // 订购
  goOrder = () => {
    let params = {}
    params.activeType = 0
    let pathParams = getReactRouterParams('/frontEnd/order', params);
    this.props.history.push(pathParams);
  }
  // 奖品
  goPrize = () => {
    let pathParams = getReactRouterParams('/frontEnd/prize');
    this.props.history.push(pathParams);
  }
  // 详情
  goDetail = (item) => {
    let parmas = {};
    parmas.id = item.id
    window.localStorage.setItem('name', item.name);
    let pathParams = getReactRouterParams('/frontEnd/o2oDetail', parmas);
    this.props.history.push(pathParams);
  }
  goTurntable = () => {
    let wxUserInfo = getCacheWxUserInfo();
    if (!wxUserInfo || !wxUserInfo.token) {
      return;
    }
    let token = wxUserInfo.token;
    eventPage({ token })
      .then(data => {
        if (data.activity == 1) {
          setTurntablePageInitData(data);
          let pathParams = getReactRouterParams('/frontEnd/turntable', { activityId: data.activityId });
          this.props.history.push(pathParams);
          // let parmas={activityId:data.activityId}
          // this.props.history.push('/frontEnd/turntable',parmas);
        } else {
          Toast('活动暂未开启，敬请期待')
          return;
        }
      })
  }
  //  点击详情
  clickGetDetail = () => {
    this.setState({ isgoO2o: false })
  }
  //UI渲染

  render() {
    return (
      <ActivityPage title={_title} description={_description} >

        {
          this.state.isShow ?
            <div style={{ minHeight: '100vh', borderTop: '1px solid #f2f2f2', background: '#f2f2f2' }}>
              {
                this.state.isShowAntiFake ?
                  <div>
                    {
                      this.state.isgoO2o ?

                        <div className='center'>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', }}>

                            {
                              this.state.o2oList && this.state.o2oList.map((item, index) => {
                                return (
                                  <div className='list_item' key={index} onClick={() => this.goDetail(item)}>
                                    <div style={{ height: '150px', background: 'red', borderRadius: '5px 5px 0 0' }}>
                                      <img src={item.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt='' />
                                    </div>
                                    <div style={{ padding: '10px' }}>
                                      <div>{item.name}</div>
                                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <div style={{ color: '#FF0000' }}>{item.price}元</div>
                                        <div>已售{item.sold + item.salesBase}件</div>
                                      </div>
                                    </div>
                                  </div>
                                )
                              })
                            }

                          </div>

                        </div>

                        :
                        <div >
                          <div style={{ textAlign: 'center', color: '#000' }}>
                            <img src='/image/noactive.png' style={{ width: '100px', height: '94px', marginTop: '25vh', marginBottom: '10px' }} alt='' />
                            <div>附近没有优惠券</div>
                            <div>试着逛逛其它地方再打开</div>
                          </div>
                        </div>
                    }
                  </div>



                  : null
              }


              {/* 底部导航栏 */}
              <BottomComponent
                clickAntiFake={this.clickAntiFake}
                isShowAntiFake={this.state.isShowAntiFake}
                clickMemberCenter={this.clickMemberCenter}
                isShowMemberCenter={this.state.isShowMemberCenter}
              />
              {/* *****************************我的************************************** */}
              <MemberCenterComponent
                isShowMemberCenter={this.state.isShowMemberCenter}
                attentionInfo={this.state.attentionInfo}
                bindphoneNumberIntegral={this.state.bindphoneNumberIntegral}
                _integralbindPhone={this._integralbindPhone}
                menberCenterIntegral={this.state.menberCenterIntegral}
                goOrder={this.goOrder}
                goTurntable={this.goTurntable}
                goPrize={this.goPrize}
              />
            </div>
            :
            null
        }

      </ActivityPage >
    );
  }
}


