import React, { Component } from 'react';
import './index.less';
import ActivityPage from '../../../components/common-page/ActivityPage';
import { wxLogin, getWxAuthRedirectUri } from '../../../api/wx/auth';
import wx from 'weixin-js-sdk';
import Toast, { T } from 'react-toast-mobile';
import { wxConfigInit, getUserLocation } from '../../../api/wx/wxConfig';
import { getWxConfig } from '../../../api/wx/common';
import { parseUrl, getReactRouterParams } from '../../../utils/urlUtils';
import { getArea, eventPage } from '../../../api/frontEnd/o2oIndex';
import { setCacheWxUserInfo, getCacheWxUserInfo } from '../../../middleware/localStorage/wxUser';
import { setTurntablePageInitData } from '../../../middleware/localStorage/o2oIndex';
import { attentionInfo } from '../../../api/frontEnd/menberCenter';
import { getCity } from '../../../api/frontEnd/trace';
import MemberCenterComponent from '../antiFake/MemberCenterComponent';
import BottomComponent from '../antiFake/BottomComponent';
const _title = '池上育宝记';
const _description = "";
export default class O2oIndex extends Component {
  state = {
    isShowAntiFake: true,
    isShowMemberCenter: false,
    isShow: false,
    isgoO2o: true,
    activityList: null,
    // 会员信息
    attentionInfo: null,
    bindphoneNumberIntegral: null,
    menberCenterIntegral: null,
    tencentLng: null,
    tencentLat: null,
    cityId: null,
    isshowTips: false
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
        let uri = getWxAuthRedirectUri(`http://h5.trace.adorsmart.com/frontEnd/o2oIndex`, 'user', frnId, appId);
        window.location.href = uri;
      })
  }
  wxLogin = (code, urlParams) => {
    let frnId = urlParams.args.state;
    wxLogin({ code, frnId })
      .then(data => {
        // alert(data)
        if (data && data.subscribe == 1) {
          setCacheWxUserInfo(data);
          let token = data.token
          // alert(JSON.stringify(data))
          this.setState({ isShow: true })
          this.pageWxInit({ frnId, token })
            .then(data => {
              if (data.errMsg == 'getLocation:fail') {
                alert('获取地理位置失败');
                return;
              }
              let { latitude, longitude } = data;
              let tencentLng = longitude;
              let tencentLat = latitude;
              if ((tencentLng == 'undefined' && tencentLat == 'undefined')) {
                alert('未获取到地理位置')
                return
              }
              let latitudeAndLongitude = `${tencentLng},${tencentLat}`;
              getCity({ latitudeAndLongitude })
                .then(res => {
                  this.setState({ cityId: res.cityId });
                })
              this.setState({ latitudeAndLongitude, tencentLng, tencentLat });
              return getArea({ latitudeAndLongitude, token });

            })
            .then(res => {
              if (res && res.length == 0) {
                this.setState({ isgoO2o: false })
              } else {
                this.setState({ isgoO2o: true, o2oList: res })
              }
            });
        } else {
          //未关注提示用户去关注微信公众号
          let qrCode = data.qrCode;
          let userSubscribeUrl = `http://h5.trace.adorsmart.com/frontEnd/userSubscribe?qrCode=${qrCode}&&frnId=${frnId}`
          this.setState({ userSubscribeUrl, isshowTips: true })
        }

      })
      .catch((data) => {
        if (data == "trace.0010" || data == "trace.0011") {
          let url = url || window.location.href;
          getWxConfig({ url, frnId })
            .then(data => {
              let { appId } = data;
              let uri = getWxAuthRedirectUri(`http://h5.trace.adorsmart.com/frontEnd/o2oIndex`, 'user', null, appId);
              window.location.href = uri;
            })
        }
        if (data == 'trace.0028') {
          this.setState({ isShow: true });
          let wxUserInfo = getCacheWxUserInfo();
          let token = wxUserInfo.token
          this.pageWxInit({ frnId, token })
            .then(data => {
              if (data.errMsg == 'getLocation:fail') {
                alert('获取地理位置失败');
                return;
              }
              let { latitude, longitude } = data;
              let tencentLng = longitude;
              let tencentLat = latitude;
              if ((tencentLng == 'undefined' && tencentLat == 'undefined')) {
                alert('未获取到地理位置')
                return
              }
              let latitudeAndLongitude = `${tencentLng},${tencentLat}`;
              this.setState({ latitudeAndLongitude, tencentLat, tencentLng });
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
        wx.hideMenuItems({
          menuList: [
            'menuItem:share:appMessage',
            "menuItem:share:timeline",
            "menuItem:copyUrl",
            "menuItem:editTag",
            "menuItem:delete",
            "menuItem:originPage",
            "menuItem:readMode",
            "menuItem:openWithQQBrowser",
            "menuItem:openWithSafari",
            "menuItem:share:email",
            "menuItem:share:brand",
            "menuItem:share:qq",
            "menuItem:share:QZone",
            "menuItem:favorite"
          ]
          // 要隐藏的菜单项，只能隐藏“传播类”和“保护类”按钮，所有menu项见附录3
        });
        // 获取用户经纬度
        getUserLocation()
          .then((data) => {
            if (!data) {
              alert('获取地理位置失败');
              return;
            }

            resolve(data)
          })
          .catch(() => {
            alert('获取地理位置失败');
            return
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
    let token = wxUserInfo.token;
    let { cityId } = this.state
    this.getattentionInfo(token, cityId);
  }

  // 获取会员中心信息
  getattentionInfo = (token, cityId) => {
    attentionInfo({ token, cityId })
      .then(data => {
        let activityList = data.activityList;
        let order = { activityId: '', name: '订购', logoUrl: '' };
        let prize = { activityId: '', name: '奖品', logoUrl: '' };
        activityList.unshift(order, prize)
        this.setState({
          attentionInfo: data,
          activityList,
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
  goTurntable = (item) => {
    let wxUserInfo = getCacheWxUserInfo();
    if (!wxUserInfo || !wxUserInfo.token) {
      return;
    }
    let token = wxUserInfo.token;
    if (item.activityId) {
      let { tencentLat, tencentLng } = this.state;
      let latLng = `${tencentLng},${tencentLat}`;
      let activityId = item.activityId
      eventPage({ token, latLng, activityId })
        .then(data => {
          if (data.activity == 1) {
            let prizes = this.formatList(data.prizes);
            let pageInitData = data;
            pageInitData.prizes = prizes;
            let pathParams
            setTurntablePageInitData(pageInitData);
            if (data.style == 1) {
              pathParams = getReactRouterParams('/frontEnd/turntable1', { activityId: data.activityId });
            } else if (data.style == 2) {
              pathParams = getReactRouterParams('/frontEnd/turntable2', { activityId: data.activityId });
            }
            this.props.history.push(pathParams);
          } else {
            Toast('活动暂未开启，敬请期待')
            return;
          }
        })
    }
    if (item.name == '订购') {
      this.goOrder()
    }
    if (item.name == '奖品') {
      this.goPrize()
    }
  }
  // 格式化
  formatList = (list) => {
    if (!list || !list.length) {
      return list;
    }
    list.forEach((order => {
      order.color = '#' + order.color;

    }))
    return list;
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
          this.state.isshowTips ?
            <div className='commodity_attr_box' onClick={this.hideVerifyCodeModal} style={{ height: "100vh", background: '#949494', padding: '0' }}>
              {/* <div style={{ textAlign: 'right', padding: '10px' }}> <img src='/image/close.png' className='closeimg' onClick={this.clickVerifyCode} /></div> */}
              <div className='content commodity_attr_box' style={{ width: '60%', top: '35%', left: '20%', padding: '0', height: '140px' }}>
                <div style={{ textAlign: "center", fontWeight: 'bold', marginTop: '10px' }}>关注微信公众号</div>
                <div style={{ textAlign: "center", borderBottom: '1px solid #f2f2f2', padding: '10px' }}>您暂未关注微信公众号，关注后才能查询哟~</div>
                <a href={this.state.userSubscribeUrl} style={{ textAlign: 'center', display: 'block', padding: '10px' }}>去关注</a>
              </div></div> : null
        }


        {
          this.state.isShow ?
            <div style={{ minHeight: '100vh', borderTop: '1px solid #f2f2f2', background: '#f2f2f2' }}>
              {
                this.state.isShowAntiFake ?
                  <div>
                    {
                      this.state.isgoO2o ?

                        <div style={{ marginBottom: '60px', padding: '10px', overflowY: 'scroll', height: '80vh' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', }}>

                            {
                              this.state.o2oList && this.state.o2oList.map((item, index) => {
                                return (
                                  <div className='list_item' key={index} onClick={() => this.goDetail(item)}>
                                    <div style={{ height: '150px', borderRadius: '5px 5px 0 0' }}>
                                      <img src={item.image} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '5px 5px 0 0' }} alt='' />
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
                activityList={this.state.activityList}
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


