import React, { Component } from 'react';
import './index.less';
import dateUtil from '../../../utils/dateUtil';
import { subscriptionList } from '../../../api/frontEnd/o2oIndex';
import ActivityPage from '../../../components/common-page/ActivityPage';
import { getCacheWxUserInfo } from '../../../middleware/localStorage/wxUser';
import wx from 'weixin-js-sdk';
import Toast from '../../../utils/toast';
import { parseUrl,getReactRouterParams } from '../../../utils/urlUtils';
import { eventGoodsDetail, createOrder, subscriptionListDetail, couponQRCode } from '../../../api/frontEnd/o2oIndex';
const mapKey = '8052f9e9c547eae2205aa45225407b74'
const _title = "订购";
const _description = "";
const _tabList = [{
  type: 0,
  title: "全部"
}, {
  type: 1,
  title: "待付款"
}, {
  type: 2,
  title: "待服务"
}, {
  type: 3,
  title: "已完成"
}];

export default class MemberCenter extends Component {
  state = {

    activeType: 0,
    page: 1,
    size: 10,
    hasMore: false,
    orderList: null,
    isLoadingMore: '',
    qrCode: null,
    isShowqrCode: false
  }
  componentDidMount() {
    let urlParams = parseUrl(this.props.location.search);
    if (!urlParams || !urlParams.args) {
      Toast('参数获取失败')
      return;
    }
    let { activeType } = urlParams.args;
    this.setState({ activeType })
    this.getSubscriptionList(activeType)
  }
  // 切换
  tabOrder = (e) => {
    let activeType = e.currentTarget.dataset.type;
    this.setState({ activeType, page: 1 }, () => {
      this.getSubscriptionList(activeType)
    });
  }
  getSubscriptionList = (activeType, hasMore) => {
    let wxUserInfo = getCacheWxUserInfo();
    if (!wxUserInfo || !wxUserInfo.token) {
      return;
    }

    let token = wxUserInfo.token;
    // let token = 'kcuFhL8NStlOPtyCmEAQKRGHJ7gHWjCZX0gG1zYSCuRTI7r+S8xnjKJAgP1t6RgC'
    let params = {}
    let { page, size } = this.state
    params.page = page
    params.size = size;
    params.token = token
    if (activeType != 0) {
      params.serviceStatus = activeType
    }
    subscriptionList(params)
      .then(res => {
        let list = null;
        let hasMore = false;
        hasMore = res.hasMore
        let { orderList } = this.state;
        if (this.state.page == 1) {
          orderList = []
        }
        if (res.data && res.data.length) {
          list = res.data;
          if (hasMore) {
            this.setState({ isLoadingMore: '点击加载更多' })
          } else {
            this.setState({ isLoadingMore: '没有更多了' })
          }
          if (activeType == 0) {
            list = res.data;
          } else {
            list = res.data.filter(v => v.serviceStatus == activeType);
          }
          list = orderList.concat(list);
        } else {
          list = orderList;
          this.setState({ isLoadingMore: '暂无数据' })
        }
        this.setState({ orderList: this.formatList(list), hasMore, page: this.state.page + 1 })
      })
  }
  // 获取服务码
  getcouponQRCode = (orderId) => {
    this.setState({ isShowqrCode: true }, () => {
      let wxUserInfo = getCacheWxUserInfo();
      let token = wxUserInfo.token;
      // let token = 'kcuFhL8NStlOPtyCmEAQKRGHJ7gHWjCZX0gG1zYSCuRTI7r+S8xnjKJAgP1t6RgC'
      let qrCode = couponQRCode({ orderId, token });
      this.setState({ qrCode });
    })
  }
  clickCloseModal = () => {
    this.setState({ isShowqrCode: false })
  }
  // 格式化时间
  formatList = (orderList) => {
    if (!orderList || !orderList.length) {
      return orderList;
    }
    orderList.forEach((order => {
      order.startActTime = dateUtil.getDateTime(order.createTime);
      order.upTime = dateUtil.getDateTime(order.expireDate)
    }))

    return orderList;
  }
  // 加载更多
  lodingMore = (activeType) => {
    if (this.state.hasMore) {
      this.getSubscriptionList(activeType);
    }
  }


  goOrderDetail = (item) => {
    let { orderId } = item;
    let pathParams = getReactRouterParams('/frontEnd/orderDetail', { orderId });    
    this.props.history.push(pathParams); 
  }

  //UI渲染
  render() {
    const { activeType, orderList, isLoadingMore } = this.state;
    return (
      <ActivityPage title={_title} description={_description} >
        <div>
          <div style={{ padding: '10px', display: 'flex', borderTop: '1px solid #f2f2f2', borderBottom: '2px solid #f2f2f2' }}>
            {
              _tabList.map((item, index) => {
                return (
                  <div key={index} style={{ marginRight: '30px' }} className={activeType == item.type ? "active-style" : "color_style"} data-type={item.type} onClick={this.tabOrder}>
                    {item.title}
                  </div>

                )
              })
            }
          </div>


          <div style={{ maxHeight: '100vh', overflowY: 'auto' }}>
            {
              orderList && orderList.map((item, index) => {
                return (
                  <div key={item.orderId} onClick={() => this.goOrderDetail(item)}>
                    <div style={{ padding: '10px', borderBottom: '1px solid #f2f2f2' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                          <div>{item.name}</div>
                          <div>下单时间：{item.startActTime}</div>
                        </div>
                        <div style={{ width: '40px', height: '40px', background: '#ccc' }}>
                          <img src={item.mainImage} style={{ width: '100%', height: '100%' }} />
                        </div>
                      </div>
                      <div>需付款：{item.amount}元</div>
                      {
                        item.serviceStatus == 1 ?
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <div style={{ color: '#FF2B64' }}>待付款</div>
                            <div onClick={() => this.goOrderDetail(item)} style={{ padding: '5px', background: '#FF2B64', color: '#fff', borderRadius: '5px' }}>立即付款</div>
                          </div> : null
                      }
                      {
                        item.serviceStatus == 2 ?
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <div style={{ color: '#FF2B64' }}>待服务</div>
                              <div onClick={() => this.getcouponQRCode(item.orderId)}>点击出示服务码</div>
                            </div>
                            <div>请在{item.upTime}前完成使用</div>
                          </div>
                          : null
                      }
                      {
                        item.serviceStatus == 3 ?
                          <div style={{ color: '#FF2B64' }}>已完成</div>
                          : null
                      }
                      {
                        item.serviceStatus == 4 ?
                          <div>已取消</div>
                          : null
                      }
                      {
                        item.serviceStatus == 5 ?
                          <div>
                            <div>已过期</div>
                            <div>已于{item.upTime}过期</div>
                          </div>
                          : null
                      }
                    </div>
                  </div>
                )
              })
            }
             <div style={{ textAlign: 'center', padding: '10px' }} onClick={() => this.lodingMore(activeType)}>{isLoadingMore}</div>
          </div>
         
          {
            this.state.isShowqrCode ?
              <div className='box'>
                <div className='_prize'>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div></div>
                    <img src='/image/close.png' className='closeimg' onClick={this.clickCloseModal} />
                  </div>
                  <div style={{ width: '260px', height: '260px', margin: '0 auto' }}> <img src={this.state.qrCode} style={{ width: '100%', height: '100%' }} ref="qrCode" /></div>
                </div>
              </div>
              : null
          }
        </div>
      </ActivityPage >
    );
  }
}


