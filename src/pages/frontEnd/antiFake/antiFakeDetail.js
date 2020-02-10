
import React, { Component } from "react";
import ActivityPage from '../../../components/common-page/ActivityPage';
import InputGroup from 'react-input-groups';
import Toast from '../../../utils/toast';
import dateUtil from '../../../utils/dateUtil';
import { apiUrlPrefix } from '../../../config/http.config';
import { wxConfigInit, getUserLocation } from '../../../api/wx/wxConfig';
import wx from 'weixin-js-sdk';
import {
  securityDecoration, obtainTheVerificationCode, voucherDetails, activityHome,
  increasePoints, sendMessages, bindPhoneNumber, getImageVerifiCode, getIp
} from '../../../api/frontEnd/trace';
import { eventPage } from '../../../api/frontEnd/o2oIndex';
import { attentionInfo, writeOffStatus, bindInggetIintegral } from '../../../api/frontEnd/menberCenter';
import { getCacheWxUserInfo } from '../../../middleware/localStorage/wxUser';
import { setTurntablePageInitData } from '../../../middleware/localStorage/o2oIndex';
import './index.less';
import { parseUrl, getReactRouterParams } from '../../../utils/urlUtils';

import { CopyToClipboard } from 'react-copy-to-clipboard';
import BottomComponent from './BottomComponent';
import MemberCenterComponent from './MemberCenterComponent';
import ShowActivegoodsComponent from './ShowActivegoodsComponent';
import ShowIntegralComponent from './ShowIntegralComponent';
import BindPhoneComponent from './BindPhoneComponent';

const _title = "防伪详情";
const _description = "防伪详情";
const _tabList = [{
  type: 1,
  title: "商品详情"
}, {
  type: 2,
  title: "活动详情"
}, {
  type: 3,
  title: "检测报告"
}]
const backgroundImage = window.localStorage.getItem('backgroundImage');
const backgroundColor = window.localStorage.getItem('backgroundColor');
class Page extends Component {
  state = {
    traceDetail: null,
    frnId: '4',
    details: null,
    createTime: null,
    bottomNav: { isShowAntiFake: true, isShowMemberCenter: false },
    // 防伪查询
    isShowAntiFake: true,
    // 会员中心
    isShowMemberCenter: false,
    // 显示满赠商品
    isShowGoods: true,
    isStartActive: false,
    // 是否展示活动
    isShowActive: false,
    // 是否展示积分
    isShowIntegral: false,
    // 是否满赠商品展示
    isShowActivegoods: false,
    token: '',
    tencentLat: '',
    tencentLng: '',
    // 活动详情
    activeDetail: null,
    // 满赠商品列表
    productDtoList: null,
    image: null,
    // 附近站点
    dealerVoList: null,
    // 会员信息
    attentionInfo: null,
    writeOffLogId: null,
    // 核销二维码
    qrCode: '',
    // 积分是否绑定手机号
    isIntegralBind: false,
    editGoods: null,
    // 是否能选择换赠品
    iscanChoose: true,
    // 积分信息
    integralInfo: null,
    cdTimer: null,
    showVerifyCDTime: false,
    phone: '',
    code: '',
    inShowBindPhone: false,
    status: 3,
    latitudeAndLongitude: null,
    // 后台是否开始绑定手机号
    phoneBinding: true,
    verifyCDTime: 60,
    integral: '',
    ip: '',
    isShowNote: false,
    now: '',
    verifyImage: '',
    imgeCode: '',
    endActivityTime: '',
    isPhone: false,
    isShowBottom: true,
    _bindPhoneNumber: false,
    writeOffStatus: true,
    bindphoneNumberIntegral: null,
    menberCenterIntegral: null,
    pdfUrl: null,
    activeType: 1,
    isgoO2o: null,
    o2oList: null,
    isShow: false,
    backgroundImage: null,
    backgroundColor: null

  }

  componentDidMount() {
    this.pageInit();
    this.imageChange();
  }
  // 切换
  tabOrder = (e) => {
    let activeType = e.currentTarget.dataset.type;
    this.setState({ activeType });

  }

  /***页面初始化************************************************************************************************** */
  pageInit = () => {
    // 页面初始化
    let urlParams = parseUrl(this.props.location.search);
    if (!urlParams || !urlParams.args) {
      Toast('参数获取失败')
      return;
    }
    let { frnId, uniqueCode, isStartActive, cityId, isgoO2o } = urlParams.args;
    // 获取缓存数据
    let isPhone = window.localStorage.getItem('isPhone');
    let res = window.localStorage.getItem('traceDetail');
    let result = window.localStorage.getItem('o2oList');

    let wxUserInfo = getCacheWxUserInfo();
    let token = (wxUserInfo && wxUserInfo.token) || this.state.token;
    let openDrainageSetting = window.localStorage.getItem('openDrainageSetting');

    let tencentLat = window.localStorage.getItem('tencentLat');
    let tencentLng = window.localStorage.getItem('tencentLng');
    let traceDetail = JSON.parse(res);
    let o2oList = JSON.parse(result);
    let details = null
    let pdfUrl = null
    let createTime = null
    if (traceDetail) {
      details = traceDetail.details;
      pdfUrl = traceDetail.details.pdfUrl;
      createTime = dateUtil.getDateTime(traceDetail.details.createTime);
    }
    // this.getSecurityDecoration(frnId);
    if (tencentLng != 'undefined' && tencentLat != 'undefined') {
      this.activityHome({ isStartActive, openDrainageSetting, frnId, uniqueCode, token, cityId, tencentLat, tencentLng });
    } else {
      this.getUserIp({ token, frnId, uniqueCode, isStartActive, openDrainageSetting, cityId });
    }
    this.setState({
      frnId, token, uniqueCode,
      isStartActive, isPhone, traceDetail, details, createTime, pdfUrl, openDrainageSetting, cityId, isgoO2o, o2oList
    })
  }

  // 获取用户ip
  getUserIp = (data) => {
    let { isStartActive, frnId, uniqueCode, token, openDrainageSetting } = data;
    getIp()
      .then(data => {
        let ip = data.query;
        this.activityHome({ isStartActive, openDrainageSetting, frnId, uniqueCode, ip, token });
      })
      .catch(() => {
        Toast('获取地理位置失败，请开启定位！');
      })
  }
  // 获取装修
  getSecurityDecoration = (frnId) => {
    securityDecoration({
      frnId
    })
      .then((res) => {
        if (res) {
          if (res.background) {
            let backgroundImage = JSON.parse(res.background).image;
            let backgroundColor = "#" + JSON.parse(res.background).color;
            this.setState({
              backgroundImage,
              backgroundColor
            })
          }
        }
      })
  }

  // 判断是否显示活动区域
  activityHome = (info) => {
    let { frnId, uniqueCode, ip, token, cityId, isStartActive, tencentLat, tencentLng, openDrainageSetting } = info;
    if (!isStartActive || (!ip && !cityId) || openDrainageSetting == "0") {
      return;
    }
    activityHome({ frnId, uniqueCode, ip, token, cityId })
      .then((result) => {
        let writeOffLogId = result.writeOffLogId;
        if (result.phoneBinding == 1) {
          this.setState({
            phoneBinding: true
          })
        }
        if (result.status == 1) {
          if (!tencentLat && !tencentLng) {
            Toast('获取地理位置失败，请开启定位！')
          }
          this._getUserLocation(tencentLat, tencentLng, token, writeOffLogId);
          this.setState({
            isShowActivegoods: true,
            writeOffLogId,
            status: result.status
          })
        }
        if (result.status == 2) {
          this.setState({
            activeDetail: result.productName,
            image: result.image,
            isShowActive: true,
            isShow: true,
            status: result.status
          })
        }
        if (result.status == 3) {
          this.setState({
            isShowIntegral: true,
            status: result.status,
            integralInfo: result,
            writeOffLogId
          });
          if (this.state.phoneBinding) {
            let isPhone = window.localStorage.getItem('isPhone');
            if (isPhone == 'false') {
              this.setState({
                isIntegralBind: false
              })
            }
            if (isPhone == 'true') {
              this.setState({
                isIntegralBind: true,
                inShowBindPhone: false
              })
              this.getIncreasePoints(writeOffLogId, token)
            }
          } else {
            this.setState({
              isIntegralBind: true,
              inShowBindPhone: false
            })
            this.getIncreasePoints(writeOffLogId, token)
          }
        }
      })
  }
  // 获取积分
  getIncreasePoints = (integralLogId, token) => {
    increasePoints({ integralLogId, token })
      .then(data => {

      })
  }
  // 获取满赠商品列表及附近门店
  _getUserLocation = (tencentLat, tencentLng, token, writeOffLogId) => {
    voucherDetails({ tencentLat, tencentLng, token, writeOffLogId })
      .then(data => {
        this.setState({
          productDtoList: data.productDtoList,
          dealerVoList: data.dealerVoList,
          endActivityTime: dateUtil.getDateTime(data.endActivityTime)
        })
      })
  }
  // 判断核销码状态，是否已核销
  getWriteOffStatus = () => {
    let { writeOffLogId, token } = this.state;
    writeOffStatus({ writeOffLogId, token })
      .then((data) => {
        if (data.type == 1) {
          Toast('该商品已核销');
          return;
        }
        this.setState({ isShowGoods: true });
      })
  }
  //********************************获取图片验证码************************************** */ 
  imageChange = () => {
    this.setState({ now: Date.now() })
  }
  getImageVerifiCode = () => {
    let { phone } = this.state
    let verifyImage = getImageVerifiCode({ phone })
    this.setState({ verifyImage })
  }
  getImgeCode = (event) => {
    this.setState({ imgeCode: event.target.value })
  }


  // 获取满赠商品详情，并判断是否绑定手机号isGoBindPhone
  getGoosDetail = (item, dealerVoList) => {
    if (item.type == 1) {
      return;
    }
    let productId = item.id;
    let { token, writeOffLogId, phoneBinding } = this.state;
    let isPhone = window.localStorage.getItem('isPhone');
    if (phoneBinding) {
      if (isPhone == "false") {
        this.setState({
          isShowGoods: true,
          inShowBindPhone: true,
          isShowAntiFake: false,
          isShowActivegoods: false
        })
      }
      if (isPhone == "true") {
        this.setState({
          inShowBindPhone: false,
          isShowActivegoods: true,
          isShowGoods: false,
          editGoods: item
        })
        let qrCode = obtainTheVerificationCode({ writeOffLogId, token, productId })
        this.setState({ qrCode })
      }
    } else {
      this.setState({
        isShowGoods: false,
        editGoods: item,
        inShowBindPhone: false,
        isShowActivegoods: true
      })
      let qrCode = obtainTheVerificationCode({ writeOffLogId, token, productId })
      this.setState({ qrCode })
    }

  }

  // 积分绑定
  _bindPhone = (integral, dealerVoList) => {
    this.setState({
      inShowBindPhone: true,
      isShowAntiFake: false,
      isShowIntegral: false,
      integral,
      dealerVoList,
      isShowNote: false
    })
  }

  // 积分绑定手机号
  _integralbindPhone = () => {
    let isPhone = false
    window.localStorage.isPhone = isPhone;
    this.setState({
      inShowBindPhone: true,
      isShowNote: false
    })
  }

  clickCloseModal = () => {
    this.setState({
      isShowActivegoods: false,
      isShowActive: false
    })
  }
  // 点击防伪查询
  clickAntiFake = () => {
    this.setState({
      isShowAntiFake: true,
      isShowMemberCenter: false,
      inShowBindPhone: false
    })
  }

  // 点击会员中心
  clickMemberCenter = () => {
    this.setState({
      isShowAntiFake: false,
      isShowMemberCenter: true,
      inShowBindPhone: false
    })
    let { token } = this.state;
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

  // 去奖券列表
  toLottery = () => {
    let parmas = {};
    parmas.token = this.state.token;
    parmas.frnId = this.state.frnId;
    let pathParams = getReactRouterParams('/frontEnd/lottery', parmas);
    this.props.history.push(pathParams);
  }
  // 点击修改选择商品
  clickEdit = () => {
    this.getWriteOffStatus();
  }
  // 点击确认积分
  comfirmIncreasePoints = () => {
    let bindphoneNumberIntegral = this.state.bindphoneNumberIntegral;
    if (bindphoneNumberIntegral > 0) {
      this.setState({
        isShowMemberCenter: true,
        _bindPhoneNumber: false,
        isShowAntiFake: false,
        bindphoneNumberIntegral: 0
      })
      return;
    }
    this.setState({ isShowIntegral: false })
  }
  // 获取输入的手机号
  handleGetInputValue = (event) => {
    this.setState({
      phone: event.target.value,
    }, () => {
      if (this.state.phone.length == 11) {
        this.getImageVerifiCode()
      }
    })

  };
  // 获取输入的验证码
  getVerifyValue = (event) => {
    this.setState({ code: event.target.value })
  }
  // 点击获取短信验证码
  getVerifyCode = () => {
    let wxUserInfo = getCacheWxUserInfo();
    let token = wxUserInfo.token;
    let phone = this.state.phone
    if (!phone) {
      Toast("请先输入手机号")
      return;
    }
    if (phone.length < 11) {
      Toast("手机号格式不正确")
      return;
    }
    if (this.state.showVerifyCDTime) {
      return
    }
    let { imgeCode } = this.state;
    sendMessages({ phone, token, code: imgeCode })
      .then((data) => {
        Toast('发送成功!')
        this.setState({
          showVerifyCDTime: true,
          canverifyCode: true,
          isShowNote: true
        })
        this._startVerifyCDtime()
      })

  }
  // 开始倒计时
  _startVerifyCDtime = () => {
    if (this.state.cdTimer) {
      return
    }
    this.state.cdTimer = setInterval(() => {
      let time = this.state.verifyCDTime - 1
      this.setState({ verifyCDTime: time })
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

  // 点击绑定手机号
  clickBindPhone = () => {
    let wxUserInfo = getCacheWxUserInfo();
    let token = wxUserInfo.token;
    let { phone, code, bindphoneNumberIntegral, menberCenterIntegral, writeOffLogId } = this.state;
    bindPhoneNumber({ phone, code, token })
      .then((res) => {
        Toast('绑定成功！');
        let isPhone = true
        window.localStorage.isPhone = isPhone;
        menberCenterIntegral = parseInt(menberCenterIntegral)
        menberCenterIntegral = bindphoneNumberIntegral + menberCenterIntegral;
        if (bindphoneNumberIntegral > 0) {
          bindInggetIintegral({ token })
            .then(() => {
              this.setState({
                _bindPhoneNumber: true,
                isShowAntiFake: false,
                isShowMemberCenter: true,
                inShowBindPhone: false,
                menberCenterIntegral
              })

            })
            .catch(data => {
              Toast('积分获取失败')
              this.setState({
                _bindPhoneNumber: false,
                isShowAntiFake: false,
                isShowMemberCenter: false,
                inShowBindPhone: true,
                isShowNote: true

              })
            })

          return;
        }
        if (this.state.status == 3) {
          this.setState({
            isShowAntiFake: true,
            inShowBindPhone: false,
            isIntegralBind: true,
            isShowIntegral: true
          })
          this.getIncreasePoints(writeOffLogId, token)
          return;
        }

        if (this.state.status == 1) {
          this.setState({
            isShowAntiFake: true,
            inShowBindPhone: false,
            isShowActivegoods: true,
            isShowGoods: true,
            isShowNote: false
          })
          return;
        }
      })
  }
  // 点击门店详情
  clickGetDelerDetail = (item) => {
    let { tencentLat, tencentLng, address } = item;
    window.localStorage.address = address
    let parmas = {};
    parmas.tencentLat = tencentLat;
    parmas.tencentLng = tencentLng;
    let pathParams = getReactRouterParams('/frontEnd/delerDetail', parmas);
    this.props.history.push(pathParams);
  }
  // 点击关闭绑定手机
  clickCloseBind = () => {
    this.setState({
      phnoe: '',
      imgeCode: ''
    })
    let isPhone = window.localStorage.getItem('isPhone');
    let bindphoneNumberIntegral = this.state.bindphoneNumberIntegral
    if (isPhone == "false") {
      if (bindphoneNumberIntegral > 0) {
        this.setState({
          isShowAntiFake: false,
          isShowMemberCenter: true,
          inShowBindPhone: false,
          isShowNote: false,
          isShowIntegral: false
        })
        return;
      }
      if (this.state.status == 3) {
        this.setState({
          isShowAntiFake: true,
          inShowBindPhone: false,
          isIntegralBind: false,
          isShowIntegral: true,
          isShowNote: false
        })
        return;
      }
      if (this.state.status == 1) {
        this.setState({
          isShowAntiFake: true,
          inShowBindPhone: false,
          isShowActivegoods: true,
          isShowGoods: true,
          isShowNote: false
        })
        return;
      }

    }

    if (isPhone == 'true') {
      if (bindphoneNumberIntegral > 0) {
        this.setState({
          isShowAntiFake: false,
          isShowMemberCenter: true,
          inShowBindPhone: false,
          bindphoneNumberIntegral: 0,
          isShowNote: false,
          isShowIntegral: false
        })
        return;
      }
      if (this.state.status == 3) {
        this.setState({
          isShowAntiFake: true,
          inShowBindPhone: false,
          isIntegralBind: true,
          isShowIntegral: true,
          locationisShowNote: false
        })
        return;
      }
      if (this.state.status == 1) {
        this.setState({
          isShowAntiFake: true,
          inShowBindPhone: false,
          isShowActivegoods: true,
          isShowGoods: true
        })
        return;
      }
    }


  }
  // 复制链接
  copyLink = () => {
    this.setState({ copied: true })
    Toast('复制成功!')
  }
  // 点击更换手机号
  changePhone = () => {
    this.setState({
      isShowNote: false,
      phone: '',
      imgeCode: ''
    })
  }

  loseFocous = () => {
    this.setState({ isShowBottom: true })
  }
  getFocous = () => {
    this.setState({ isShowBottom: false })
  }
  getValue = (value) => {
    this.setState({ code: value })
  }
  // 点击关闭积分modal
  clickIntegraModal = () => {
    this.setState({
      isShowIntegral: false,
      isShowAntiFake: true
    })
  }
  // 重新获取验证码
  againGetVerify = () => {
    this.setState({
      inShowBindPhone: true,
      isShowNote: false,
      imgeCode: ''
    })
  }
  // **************************************跳转**********************************************
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
          let prizes = this.formatList(data.prizes);
          let pageInitData = data;
          pageInitData.prizes = prizes
          setTurntablePageInitData(pageInitData);
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

  render() {
    const { activeType, isgoO2o, o2oList } = this.state;

    return (

      <ActivityPage title={_title} description={_description} >
        <div style={{ background: backgroundColor, backgroundImage: `url(${backgroundImage + "?x-oss-process=image/resize,l_800"})`, minHeight: '100vh', backgroundSize: '100%', position: 'relative' }}>
          {/* ****************************防伪查询********************************* */}
          {
            this.state.isShowAntiFake ?
              <div>
                {
                  isgoO2o ?
                    <div>
                      <div style={{ display: 'flex', background: '#fff', marginBottom: '10px' }} onClick={this.clickGetDetail}>
                        <div style={{ height: '65px', width: '65px' }}>
                          <img src={this.state.details && this.state.details.image} style={{ height: '100%' }} alt=''></img>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '80%', paddingRight: '10px' }} >
                          <div style={{ marginRight: '10px', padding: '10px' }} className='overHide'>
                            <div style={{ fontSize: '16px' }}>{this.state.details && this.state.details.name}</div>
                            <div style={{ color: '#6699FF', }} className='overHide'>{this.state.traceDetail && this.state.traceDetail.name}</div>
                          </div>
                          <div > <img src='/image/detail.png' style={{ width: '15px', height: '15px', marginTop: '26px' }} alt='' /></div>
                        </div>

                      </div>

                      <div className='center'>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', }}>

                          {
                            o2oList && o2oList.map((item, index) => {
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
                      {
                        this.state.isShowActive ?
                          <div className='box'>
                            <div className='prize'>
                              <div className='goodsInfo' style={{ padding: '10px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <div style={{ fontSize: '16PX', fontWeight: 'bold' }} >活动信息</div>
                                  <img src='/image/close.png' className='closeimg' onClick={this.clickCloseModal} alt='' />
                                </div>
                                <div style={{ color: '#FF0000' }}>您还需购买并扫描</div>
                                {this.state.activeDetail && this.state.activeDetail.length ?
                                  this.state.activeDetail.map((item, index) => {
                                    return (
                                      <div>{item}</div>
                                    )
                                  })
                                  :
                                  null
                                }
                                <div>即可参与活动:</div>
                                <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                                  <span dangerouslySetInnerHTML={{ __html: this.state.image }}></span>
                                </div>
                              </div>
                            </div>
                          </div>
                          : null
                      }

                    </div>
                    : <div>
                      <div style={{ padding: '10px 20px' }}>
                        <div className='shop'>
                          <div style={{ display: 'flex', marginBottom: '20px' }}>
                            <div className='imgstyle' style={{ marginRight: '10px' }}>
                              <img src={this.state.details && this.state.details.image} style={{ width: '60px', height: '60px', borderRadius: '10px' }} alt=''></img>
                            </div>
                            <div className='hidden'>
                              <div style={{ fontWeight: 'bold' }}>{this.state.details && this.state.details.name}</div>
                              <div>{this.state.details && this.state.details.companyName}</div>
                              <div>规格：{this.state.details && this.state.details.specification}</div>
                            </div>
                          </div>
                          <div style={{ fontSize: '14px', color: '#6699FF' }}>{this.state.traceDetail && this.state.traceDetail.name}</div>
                        </div>
                        <div style={{ display: 'flex', marginTop: '10px' }}>
                          {
                            _tabList.map((item, index) =>
                              (
                                <div key={index} style={{ width: '80px', textAlign: 'center', borderRadius: '10px 10px 0 0' }} className={activeType == item.type ? "activeStyle" : "colorStyle"} data-type={item.type} onClick={this.tabOrder}>
                                  {item.title}
                                </div>
                              )
                            )
                          }
                        </div>
                        <div style={{ background: '#fff', borderRadius: '0 10px 10px 10px', padding: '10px', marginBottom: '70px' }}>
                          {activeType == 1 ?
                            <div>
                              {
                                this.state.details && this.state.details.details ?
                                  <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                                    <span dangerouslySetInnerHTML={{ __html: this.state.details.details }}></span>
                                  </div>
                                  : null
                              }
                            </div> : null
                          }
                          {activeType == 2 ?
                            <div>
                              {
                                this.state.isShow ?
                                  <div className='goodsInfo'>
                                    <div style={{ fontSize: '16PX', fontWeight: 'bold' }} >活动信息</div>
                                    <div style={{ color: '#FF0000' }}>您还需购买并扫描</div>
                                    {this.state.activeDetail && this.state.activeDetail.length ?
                                      this.state.activeDetail.map((item, index) => {
                                        return (
                                          <div>{item}</div>
                                        )
                                      })
                                      :
                                      null
                                    }
                                    <div>即可参与活动:</div>
                                    <div style={{ maxHeight: '50vh', overflowY: 'auto' }}>
                                      <span dangerouslySetInnerHTML={{ __html: this.state.image }}></span>
                                    </div>
                                  </div>
                                  :
                                  <div style={{ textAlign: 'center' }}>暂无活动</div>
                              }

                            </div> : null
                          }
                          {activeType == 3 ?
                            <div>
                              {
                                this.state.pdfUrl ?
                                  <div style={{ textAlign: 'center' }}>
                                    <img src='/image/pdfUrl.png' style={{ width: '50px', height: '58px', marginTop: '10vh', marginBottom: '10px' }} alt='' />
                                    <div><a href={this.state.pdfUrl}>点击查看检测报告</a></div>

                                  </div>
                                  : <div style={{ textAlign: 'center' }}>暂无检测报告</div>
                              }
                            </div> : null
                          }
                        </div>

                      </div>
                    </div>
                }
              </div>
              : null
          }
          {/* **************************************我的************************** */}
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

          {/********************************* 底部导航栏******************************* */}
          <BottomComponent
            clickAntiFake={this.clickAntiFake}
            isShowAntiFake={this.state.isShowAntiFake}
            clickMemberCenter={this.clickMemberCenter}
            isShowMemberCenter={this.state.isShowMemberCenter}
          />

          {/* ******************************兑奖券Model********************************** */}
          <ShowActivegoodsComponent
            isShowActivegoods={this.state.isShowActivegoods}
            isShowGoods={this.state.isShowGoods}
            productDtoList={this.state.productDtoList}
            clickCloseModal={this.clickCloseModal}
            dealerVoList={this.state.dealerVoList}
            qrCode={this.state.qrCode}
            clickEdit={this.clickEdit}
            editGoods={this.state.editGoods}
            getGoosDetail={this.getGoosDetail}
            copyLink={this.copyLinkt}
            clickGetDelerDetail={this.clickGetDelerDetail}
          />

          {/* ********************************积分************************** */}

          <ShowIntegralComponent
            isShowIntegral={this.state.isShowIntegral}
            clickIntegraModal={this.clickIntegraModal}
            isIntegralBind={this.state.isIntegralBind}
            comfirmIncreasePoints={this.comfirmIncreasePoints}
            integralInfo={this.state.integralInfo}
            _bindPhone={this._bindPhone}
          />



          {/* ****************************会员中心积分********************************* */}
          {
            this.state._bindPhoneNumber ?
              <div className='box'>
                <div className='integral'>
                  <div style={{ padding: '60px', height: '45vh' }}>
                    <div style={{ width: '50px', height: '63px', margin: '10px auto' }}>
                      <img src='/image/integral.png' style={{ width: '100%', height: '100%' }} />
                    </div>
                    <div>
                      <div style={{ width: '100%', textAlign: 'center', fontWeight: 'bold', fontSize: '22px' }}>积分+{this.state.bindphoneNumberIntegral}</div>
                      <div className='confirm' onClick={this.comfirmIncreasePoints}>确认</div>
                    </div>
                  </div>
                  <div style={{ width: "100%", height: "36px" }} className='flex-between'>
                    <div className='circle' style={{ left: '-17px' }} ></div>
                    < img src='/image/line.png' style={{ heigth: '3px', width: '100%' }} />
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
        {/* ******************************绑定手机******************************* */}
        <BindPhoneComponent
          inShowBindPhone={this.state.inShowBindPhone}
          isShowNote={this.state.isShowNote}
          clickCloseBind={this.clickCloseBind}
          phone={this.state.phone}
          changePhone={this.changePhone}
          getValue={this.getValue}
          getVerifyValue={this.getVerifyValue}
          code={this.state.code}
          againGetVerify={this.againGetVerify}
          verifyCDTime={this.state.verifyCDTime}
          clickBindPhone={this.clickBindPhone}
          clickCloseBind={this.clickCloseBind}
          handleGetInputValue={this.handleGetInputValue}
          getImageVerifiCode={this.getImageVerifiCode}
          verifyImage={this.state.verifyImage}
          getVerifyCode={this.getVerifyCode}
          getFocous={this.getFocous}
          loseFocous={this.loseFocous}
          getImgeCode={this.getImgeCode}
          imgeCode={this.state.imgeCode}
          isShowBottom={this.state.isShowBottom}
          bindphoneNumberIntegral={this.state.bindphoneNumberIntegral}
          status={this.state.status}
          integral={this.state.integral}
          bindphoneNumberIntegral={this.state.bindphoneNumberIntegral}
          dealerVoList={this.state.dealerVoList}
          clickGetDelerDetail={this.clickGetDelerDetail}
          copyLink={this.copyLink}
          showVerifyCDTime={this.state.showVerifyCDTime}
        />

      </ActivityPage>

    )
  }
}
export default Page;