import React, { Component } from 'react';
import './index.less';
import { securityDecoration, getIp, sendMessages, getImageVerifiCode, bindPhoneNumber } from '../../../api/frontEnd/trace';
import { redemptionVoucher, redeemedDetails, voucherDetails, obtainTheVerificationCode, writeOffStatus } from '../../../api/frontEnd/menberCenter';
import { getCacheWxUserInfo } from '../../../middleware/localStorage/wxUser';
import ActivityPage from '../../../components/common-page/ActivityPage';
import { prizeList } from '../../../api/frontEnd/o2oIndex';
import dateUtil from '../../../utils/dateUtil';

import { CopyToClipboard } from 'react-copy-to-clipboard';
import { wxConfigInit, getUserLocation } from '../../../api/wx/wxConfig';
import InputGroup from 'react-input-groups';
import wx from 'weixin-js-sdk';
import Toast from '../../../utils/toast';
import { parseUrl, joinParam, getReactRouterParams } from '../../../utils/urlUtils';
const mapKey = '8052f9e9c547eae2205aa45225407b74'
const _title = "奖品";
const _description = "";
export default class MemberCenter extends Component {
  state = {
    frnId: 4,
    backgroundImage: null,
    backgroundColor: null,
    isShow: false,
    token: 'kcuFhL8NStlOPtyCmEAQKRGHJ7gHWjCZX0gG1zYSCuQpGmvP2Z1K15nkg2bsiaDX',
    redemptionVoucherList: null,
    tencentLat: null,
    tencentLng: null,
    status: null,
    productDtoList: null,
    dealerVoList: null,
    isclick: true,
    editGoods: null,
    writeOffLogId: null,
    qrCode: '',
    iscanChoose: true,
    endActivityTime: '',
    copied: false,
    cdTimer: null,
    showVerifyCDTime: false,
    phone: '',
    code: '',
    inShowBindPhone: false,
    status: 3,
    verifyCDTime: 60,
    integral: '',
    ip: '',
    isShowNote: false,
    now: '',
    verifyImage: '',
    imgeCode: '',
    isPhone: false,
    isShowBottom: true,
    productId: null,
    writeOffStatustype: true,
    listEndActivityTime: null,
    isShowPrize: true,
    isShowLottery: false,
    page: 1,
    size: 10,
    prizeList: null,
    isLoadingMore: '暂无数据',
    hasMore: false
  }
  componentDidMount() {
    let wxUserInfo = getCacheWxUserInfo();
    if (!wxUserInfo || !wxUserInfo.token) {
      return;
    }
    let token = wxUserInfo.token;
    this.imageChange();
    let frnId = window.localStorage.getItem(frnId);
    this.setState({ token, frnId });
    this.getPrizeList(token, this.state.page);
  }
  // **************************注册sdk，获取经纬度*********************************************
  pageWxInit = (info) => {
    let { token, frnId, writeOffLogId } = info;
    return new Promise((resolve, reject) => {
      // 注册jsdk
      wxConfigInit(null, frnId, null);
      wx.ready(() => {
        // 获取用户经纬度
        getUserLocation()
          .then((data) => {
            if (!data) {
              this.getUserIp(info);
              // return;
            }
            let { latitude, longitude } = data;
            let tencentLng = longitude;
            let tencentLat = latitude;
            let { status } = this.state;
            // 已兑换
            if (status == 2) {
              this.setState({
                isShow: true
              })
              this.getredeemedDetails(tencentLat, tencentLng, token, writeOffLogId);
            }
            // 未兑换
            if (status == 1) {
              this.setState({
                isShow: true
              })
              this.getvoucherDetails(tencentLat, tencentLng, token, writeOffLogId);
            }
            this.setState({ tencentLat, tencentLng });
          })
          .catch(() => {
            this.getUserIp();
          })
      })
    })
  }
  getUserIp = () => {
    // let { isStartActive, frnId, uniqueCode, token } = data;
    getIp()
      .then(data => {
        let ip = data.query;
      })
      .catch(() => {
        Toast('获取地理位置失败，请开启定位！');
      })
  }


  // 获取兑奖券列表
  getredemptionVoucher = (token) => {
    redemptionVoucher({ token })
      .then(data => {
        this.setState({
          redemptionVoucherList: this._formatList(data)
        })
      })
  }
  // 获取奖品列标配
  getPrizeList = (token, page) => {
    let { loading, size } = this.state
    prizeList({ token, page, size })
      .then(res => {
        console.log(res)
        let list = null;
        let hasMore = false;
        hasMore = res.hasMore
        let { prizeList } = this.state;
        if (page == 1) {
          prizeList = []
        }
        if (res.data && res.data.length) {
          list = res.data;
          if (hasMore) {
            this.setState({ isLoadingMore: '点击加载更多' })
          } else {
            this.setState({ isLoadingMore: '没有更多了' })
          }

          list = prizeList.concat(list);
        } else {
          list = prizeList;
          this.setState({ isLoadingMore: '暂无数据' })
        }
        this.setState({ prizeList: list, hasMore })
      })
  }
  // 获取未兑换详情
  getvoucherDetails = (tencentLat, tencentLng, token, writeOffLogId) => {
    voucherDetails({ tencentLat, tencentLng, token, writeOffLogId })
      .then(data => {
        this.setState({
          productDtoList: data.productDtoList,
          dealerVoList: data.dealerVoList,
          writeOffLogId
        })
      })
  }
  // 获取已兑换详情
  getredeemedDetails = (tencentLat, tencentLng, token, writeOffLogId) => {
    redeemedDetails({ tencentLat, tencentLng, token, writeOffLogId })
      .then(data => {
        this.setState({
          productDtoList: data,
          dealerVoList: data.dealerVoList
        })
        let qrCode = obtainTheVerificationCode({ writeOffLogId, token });
        this.setState({ qrCode });
      })
  }
  // 判断核销码状态，是否已核销
  getWriteOffStatus = () => {
    let { token, writeOffLogId } = this.state;
    writeOffStatus({ writeOffLogId, token })
      .then((data) => {
        if (data.type == 1) {
          Toast('该商品已核销');
          return;
        }
        this.setState({
          isclick: true
        })
      })
  }

  clickShowModal = (item) => {
    let writeOffLogId = item.id;
    let endActivityTime = dateUtil.getDateTime(item.endActivityTime);
    let status = item.status;
    this.setState({
      status,
      endActivityTime,
      writeOffLogId
    })
    let { tencentLat, tencentLng, token, frnId } = this.state;

    this.pageWxInit({ token, frnId, writeOffLogId })
  }

  clickCloseModal = () => {
    let { token } = this.state;
    this.setState({
      isShow: false,
      isclick: true
    })
    this.getredemptionVoucher(token);
  }

  // 点击选择商品
  clickChoose = (item) => {
    if (item.type == 1) {
      return;
    }
    let productId = item.id;
    this.setState({
      isclick: false,
      editGoods: item,
      productId
    })
    let isPhone = window.localStorage.getItem('isPhone');

    let { writeOffLogId, token } = this.state;
    if (isPhone == "false") {
      this.setState({
        isclick: false,
        inShowBindPhone: true,
      })
    }
    if (isPhone == "true") {
      this.setState({
        inShowBindPhone: false,
        isclick: false
      })
      let qrCode = obtainTheVerificationCode({ writeOffLogId, token, productId })
      this.setState({ qrCode })
      // this._bindPhone(item, dealerVoList);
    }
  }
  clickEdit = () => {
    this.getWriteOffStatus();
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
    // window.location.href = joinParam('http://h5.trace.adorsmart.com/frontEnd/delerDetail', parmas)

  }
  // 复制链接
  copyLink = () => {
    this.setState({ copied: true })
    Toast('复制成功!')
  }
  // /获取输入的手机号
  handleGetInputValue = (event) => {
    this.setState({
      phone: event.target.value,
    }, () => {
      if (this.state.phone.length == 11) {
        this.getImageVerifiCode()
      }
    })

  };
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
      imgeCode: event.target.value,
    })
  }
  // 获取输入的验证码
  getVerifyValue = (event) => {
    this.setState({
      code: event.target.value,
    })
  }
  // 点击关闭绑定手机
  clickCloseBind = () => {
    this.setState({
      phnoe: '',
      imgeCode: ''
    })
    let isPhone = window.localStorage.getItem('isPhone');
    if (isPhone == 'false') {
      this.setState({
        isclick: true,
        inShowBindPhone: false
      })
    }
    if (isPhone == 'true') {
      this.setState({
        isclick: true,
        inShowBindPhone: false
      })
    }

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
    let { imgeCode } = this.state
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
  // 点击更换手机号
  changePhone = () => {
    this.setState({
      isShowNote: false,
      phone: '',
      imgeCode: ''
    })
  }

  loseFocous = () => {
    this.setState({
      isShowBottom: true
    })
  }
  getFocous = () => {
    this.setState({
      isShowBottom: false
    })
  }
  getValue = (value) => {
    this.setState({
      code: value
    })
  }
  // 点击绑定
  clickBindPhone = () => {
    let wxUserInfo = getCacheWxUserInfo();
    let token = wxUserInfo.token;
    let { phone, code } = this.state;
    bindPhoneNumber({ phone, code, token })
      .then((res) => {
        Toast('绑定成功！');
        let isPhone = true;
        window.localStorage.isPhone = isPhone;
        let { writeOffLogId, token, productId } = this.state
        let qrCode = obtainTheVerificationCode({ writeOffLogId, token, productId });
        this.setState({
          isclick: true,
          inShowBindPhone: false,
          qrCode
        })
      })
  }
  //*************************格式化时间************************* */ 
  _formatList(list) {
    if (!list || !list.length) {
      return list;
    }
    list.forEach((item => {
      item.startActTime = dateUtil.getDateTime(item.endActivityTime);
    }))
    return list;
  }

  clickPrize = () => {
    let { token, page } = this.state;
    this.getPrizeList(token, page)
    this.setState({
      isShowLottery: false,
      isShowPrize: true
    })
  }
  clickLottry = () => {
    let { token } = this.state
    this.getredemptionVoucher(token);
    this.setState({
      isShowLottery: true,
      isShowPrize: false
    })
  }
  // 加载更多
  lodingMore = () => {
    let { token, page } = this.state
    page = page + 1
    if (this.state.hasMore) {
      this.getPrizeList(token, page);
    }
  }
  goprizeInfo = (item) => {
    let { id } = item;
    let pathParams = getReactRouterParams('/frontEnd/prizeInfo', { id });
    this.props.history.push(pathParams);
  }
  //UI渲染
  render() {
    const { backgroundImage, backgroundColor, prizeList } = this.state;
    return (
      <ActivityPage title={_title} description={_description} >
        <div>
          <div style={{ backgroundImage: `url(${backgroundImage})`, background: backgroundColor, minHeight: '100vh', backgroundSize: '100%' }}>
            <div style={{ padding: '10px', display: 'flex', borderTop: '1px solid #f2f2f2', borderBottom: '1px solid #f2f2f2' }}>
              <div onClick={this.clickPrize} style={{ marginRight: '30px' }}>
                <div className={this.state.isShowPrize ? "active-style" : "color_style"} >  奖品</div>
              </div>
              <div onClick={this.clickLottry}>
                <div className={this.state.isShowLottery ? "active-style" : "color_style"} >  奖券</div>
              </div>
            </div>
            {
              this.state.isShowLottery ?
                <div style={{ height: '89vh', overflowY: 'auto' }}>
                  {this.state.redemptionVoucherList && this.state.redemptionVoucherList.length ?
                    this.state.redemptionVoucherList.map((item, index) => {
                      return (
                        <div className='lotteryList' onClick={() => this.clickShowModal(item)} key={index}>
                          <div>
                            <div style={{ lineHeight: '30px' }}>兑奖券</div>
                            <div>失效时间：{item.startActTime}</div>
                          </div>
                          <div style={{ height: '55px', width: '55px' }}>
                            {/* 已兑 */}
                            {item.status == 2 ?
                              <img src='/image/1.png' style={{ width: '100%', height: '100%' }} />
                              :
                              null
                            }
                            {/* 过期 */}
                            {item.status == 3 ?
                              <img src='/image/2.png' style={{ width: '100%', height: '100%' }} />
                              :
                              null
                            }
                            {/* 未兑 */}
                            {item.status == 1 ?
                              <img src='/image/3.png' style={{ width: '100%', height: '100%' }} />
                              :
                              null
                            }
                          </div>
                        </div>
                      )
                    })
                    :
                    <div style={{ textAlign: 'center', marginTop: '30px' }}>暂无兑奖券</div>
                  }
                </div> : null
            }
            {
              this.state.isShowPrize ?
                <div>

                  {prizeList && prizeList.length ?
                    <div>
                      {prizeList.map((item, index) => {
                        return (
                          <div style={{ padding: '10px', borderBottom: '1px solid #f2f2f2' }} onClick={() => this.goprizeInfo(item)}>
                            <div>{item.name}</div>
                            <div style={{ color: '#99999F' }}>获得时间：{item.createTime}</div>
                            {
                              item.status == 0 || item.status == 3 ?

                                <div style={{ color: '#99999F' }}>兑奖截止时间：{item.expiredTime}</div> : null
                            }
                            {item.status == 0 ?
                              <div style={{ color: '#FF2B64' }}>未兑奖</div> : null
                            }
                            {item.status == 1 ?
                              <div style={{ color: '#FF2B64' }}>未寄出</div> : null
                            }
                            {item.status == 2 ?
                              <div style={{ color: '#FF2B64' }}>已寄出</div> : null
                            }
                            {item.status == 3 ?
                              <div style={{ color: '#99999F' }}>已过期</div> : null
                            }
                          </div>
                        )
                      })}
                      <div style={{ textAlign: 'center', padding: '10px' }} onClick={() => this.lodingMore()}>{this.state.isLoadingMore}</div>
                    </div>
                    :
                    <div style={{ textAlign: 'center', marginTop: '30px' }}>暂无奖品</div>
                  }
                </div> : null
            }
          </div>
          {
            this.state.isShow ?
              <div className='box'>
                <div className='prize'>
                  <div>
                    {
                      this.state.status == 1 ?
                        <div>
                          {
                            this.state.isclick ?
                              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 10px 0 10px' }}>
                                <div style={{ fontWeight: 'bold' }}>选择可兑换的商品</div>
                                <img src='/image/close.png' className='closeimg' onClick={this.clickCloseModal} />
                              </div> :
                              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 10px 0 10px' }}>
                                <div ></div>
                                <img src='/image/close.png' className='closeimg' onClick={this.clickCloseModal} />
                              </div>
                          }
                          {
                            this.state.isclick ?
                              <div style={{ overflowY: 'auto', padding: '0 10px 10px 10px', height: '30vh' }}>
                                {
                                  this.state.status == 1 && this.state.productDtoList && this.state.productDtoList.length ?
                                    this.state.productDtoList.map((item, index) => {
                                      return (
                                        <div >

                                          <div className='goodlist' onClick={() => this.clickChoose(item)} key={index}>
                                            <div style={{ display: 'flex' }}>
                                              <img src={item.image} style={{ width: '53px', height: '53px', background: '#ccc', marginRight: '10px' }} />
                                              <div>
                                                <div style={{ fontWeight: 'bold' }} className='hide'>{item.name}</div>
                                                <div style={{ marginTop: '10px' }}>编号：{item.barCode}</div>
                                              </div>
                                            </div>
                                            {
                                              item.type == 1 ? <div style={{ color: '#A1A1A1' }}>已兑完</div> : <div style={{ color: '#33AAF9' }}>可兑换</div>
                                            }
                                          </div>

                                        </div>
                                      )
                                    })
                                    :
                                    null
                                }
                              </div>
                              : null
                          }

                          {
                            !this.state.isclick ?
                              <div>
                                <div className='qrcode'>
                                  <img src={this.state.qrCode} style={{ width: '100%', height: '100%' }} ref="qrCode" />
                                </div>
                                <div style={{ display: 'flex' }}>
                                  <div style={{ width: '100%', background: '#fff', padding: '10px 25%' }}>
                                    <div>
                                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <div style={{ width: '80%', display: 'inline-block', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{this.state.editGoods && this.state.editGoods.name}</div>

                                        <div style={{ color: '#33AAF9' }} onClick={() => this.clickEdit(this.state.editGoods)}>修改</div>
                                      </div>

                                      <div style={{ marginTop: '10px' }}>No.{this.state.editGoods && this.state.editGoods.barCode}</div>
                                    </div>
                                  </div>

                                </div>

                              </div>
                              : null
                          }
                        </div>
                        : null
                    }

                    {
                      this.state.status == 2 ?

                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 10px 0 10px' }}>
                            <div ></div>
                            <img src='/image/close.png' className='closeimg' onClick={this.clickCloseModal} />
                          </div>
                          <div className='qrcode'>
                            <img src={this.state.qrCode} style={{ width: '100%', height: '100%' }} ref="qrCode" />
                          </div>
                          <div style={{ display: 'flex' }}>
                            <div style={{ width: '100%', background: '#fff', padding: '10px 25%' }}>
                              <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <div style={{ width: '80%', display: 'inline-block', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{this.state.productDtoList && this.state.productDtoList.name}</div>
                                  <div style={{ color: '#ccc' }}>已兑</div>
                                </div>
                                <div style={{ marginTop: '10px' }}>No.{this.state.productDtoList && this.state.productDtoList.barCode}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                        : null
                    }
                  </div>




                  <div style={{ width: "100%", height: "36px" }} className='flex-between'>
                    <div className='circle' style={{ left: '-17px' }} ></div>
                    < img src='/image/line.png' style={{ heigth: '3px', width: '100%' }} />
                    <div className='circle' style={{ right: '-17px' }}></div>
                  </div>


                  <div className='line' style={{ paddingTop: '0' }}>
                    <div style={{ padding: '0px 30px', paddingBottom: '10px' }}>
                      <div>关闭后可到会员中心-兑奖券查看</div>
                      <div>兑奖券失效时间：{this.state.endActivityTime}</div>
                      <div style={{ fontWeight: 'bold', marginTop: '10px' }}>附近兑奖店铺：</div>
                      <div style={{ overflowY: 'auto', maxHeight: '28vh' }}>
                        {
                          this.state.dealerVoList && this.state.dealerVoList.length ?
                            this.state.dealerVoList.map((item, index) => {
                              return (
                                <div className='shopList' key={index} >
                                  <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                      <div>{item.dealerName}</div>
                                      <CopyToClipboard text={item.address}
                                        onCopy={this.copyLink}>
                                        <div style={{ color: '#33AAF9' }}>
                                          复制
                                    </div>
                                      </CopyToClipboard>
                                    </div>
                                    <a className='hide' onClick={() => this.clickGetDelerDetail(item)}>{item.address}</a>
                                  </div>

                                </div>
                              )
                            })
                            : <div className='map' style={{ padding: '62px', textAlign: 'center' }}>附近暂无门店</div>
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              : null
          }

          {
            this.state.inShowBindPhone ?
              <div className='box'>
                <div className='integral'>
                  {
                    this.state.isShowNote ?
                      <div style={{ padding: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <div style={{ fontWeight: 'bold' }}>填写短信验证码</div>
                          <img src='/image/close.png' className='closeimg' onClick={this.clickCloseBind} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <div>短信已发送给{this.state.phone}</div>
                          <div style={{ color: '#339cff', marginRight: '20px' }} onClick={this.changePhone}>更换</div>
                        </div>
                        <div style={{ margin: '10px auto', fontSize: '16px' }}>
                          <InputGroup
                            getValue={this.getValue}
                            length={4}
                            type={'box'}
                          />
                        </div>
                        <div style={{ background: '#ccc', width: '100%', padding: '10px', textAlign: 'center', color: '#fff' }} >
                          {this.state.verifyCDTime}后重发
                    </div>
                        <button className='getverifybutton' onClick={this.clickBindPhone}>验证绑定手机号</button>
                      </div>
                      :
                      <div style={{ padding: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <div style={{ fontWeight: 'bold' }}>请先绑定手机号</div>
                          <img src='/image/close.png' className='closeimg' onClick={this.clickCloseBind} />
                        </div>
                        <div className='phone'>
                          <div style={{ borderRight: '1px solid #ccc', padding: '0 8px' }}>+86</div>
                          <input type="number" placeholder-style="color:#ccc" placeholder="请输入手机号码" onChange={this.handleGetInputValue}
                            value={this.state.phone} className='phoneNum' />
                        </div>
                        <div className='phone'>
                          <div style={{ borderRight: '1px solid #ccc', padding: '0 8px' }}>验证</div>
                          <input placeholder-style="color:#ccc" placeholder="填写下图中的验证码" onChange={this.getImgeCode}
                            value={this.state.imgeCode} className='phoneNum' style={{ width: '68%' }} onFocus={this.getFocous} onBlur={this.loseFocous} />
                        </div>
                        {
                          this.state.phone && this.state.phone.length == 11 ?
                            <div className='imgVerify'>
                              <img
                                onClick={this.getImageVerifiCode}
                                ref='verifyImage'
                                src={this.state.verifyImage}
                                style={{ width: '100%' }}
                              />
                            </div> : null
                        }
                        <button className='getverifybutton' onClick={this.getVerifyCode}>获取短信验证码</button>
                      </div>
                  }

                  {
                    this.state.isShowBottom ?
                      <div>
                        <div style={{ width: "100%", height: "36px" }} className='flex-between'>
                          <div className='circle' style={{ left: '-17px' }} ></div>
                          < img src='/image/line.png' style={{ heigth: '3px', width: '100%' }} />
                          <div className='circle' style={{ right: '-17px' }}></div>
                        </div>

                        <div className='line'>
                          <div style={{ padding: '0px 30px', paddingBottom: '10px' }}>
                            <div>关闭后可到会员中心-兑奖券查看</div>
                            <div>兑奖券失效时间:{this.state.endActivityTime}</div>
                            <div style={{ fontWeight: 'bold', marginTop: '10px' }}>附近兑奖店铺：</div>
                            {
                              this.state.dealerVoList && this.state.dealerVoList.length ?
                                this.state.dealerVoList.map((item, index) => {
                                  return (
                                    <div className='shopList' key={index} >
                                      <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                          <div>{item.dealerName}</div>
                                          <CopyToClipboard text={item.address}
                                            onCopy={this.copyLink}>
                                            <div style={{ color: '#33AAF9' }}>
                                              复制
                                    </div>
                                          </CopyToClipboard>
                                        </div>
                                        <a className='hide' onClick={() => this.clickGetDelerDetail(item)}>{item.address}</a>
                                      </div>

                                    </div>
                                  )
                                })
                                : <div className='map' style={{ padding: '62px', textAlign: 'center' }}>附近暂无门店</div>
                            }
                          </div>


                        </div>

                      </div>
                      : null


                  }

                </div>

              </div>
              : null
          }
        </div >
      </ActivityPage>
    );
  }
}


