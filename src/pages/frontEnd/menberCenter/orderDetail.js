import React, { Component } from 'react';
import './index.less';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import ActivityPage from '../../../components/common-page/ActivityPage';
import wx from 'weixin-js-sdk';
import Toast from '../../../utils/toast';
import { parseUrl, joinParam } from '../../../utils/urlUtils';
import { getCacheWxUserInfo } from '../../../middleware/localStorage/wxUser';
import { eventGoodsDetail, createOrder, subscriptionListDetail, couponQRCode } from '../../../api/frontEnd/o2oIndex';
const mapKey = '8052f9e9c547eae2205aa45225407b74'
const _title = "订单详情";
const _description = "";
export default class MemberCenter extends Component {
  state = {
    type: 5,
    orderId: null,
    orderDetail: null,
    qrCode: null,
    copied: false    
  }
  componentDidMount() {
    let urlParams = parseUrl(this.props.location.search);
    if (!urlParams || !urlParams.args) {
      Toast('参数获取失败')
      return;
    }
    let { orderId } = urlParams.args;

    let wxUserInfo = getCacheWxUserInfo();
    let token = wxUserInfo.token;
    this.getsubscriptionListDetail(orderId, token);
    this.getcouponQRCode(orderId, token);


  }
  // 获取详情
  getsubscriptionListDetail = (orderId, token) => {
    subscriptionListDetail({ orderId, token })
      .then(data => {
        this.setState({ orderDetail: data });
      })
  }

  getcouponQRCode = (orderId, token) => {
    let qrCode = couponQRCode({ orderId, token });
    this.setState({ qrCode });
  }

  /**复制*************************************************************************************************************************/
  onCopiedClicked = () => {
    this.setState({ copied: true });
    Toast("复制成功！")
  }

  /**发起支付 **************************/
  goOrderAdpay = () => {
    let { orderDetail } = this.state;
    if (!orderDetail || !orderDetail.url) {
      return;
    }
    window.location.href = orderDetail.url;
  }
  /*******************************跳转*******************************************************************************************/

  //UI渲染
  render() {
    const { orderDetail } = this.state;
    return (
      <ActivityPage title={_title} description={_description} >
        <div style={{ minHeight: '100vh', borderTop: '1px solid #f2f2f2', padding: '10px' }}>
          <div className='order_top'>
            <div>
              <div>{orderDetail && orderDetail.name}</div>
              <div style={{ marginTop: '25px' }}>{orderDetail && orderDetail.purchases}</div>
            </div>
            <div style={{ width: '65px', height: '65px', background: '#ccc' }}>
              <img src={orderDetail && orderDetail.mainImage} style={{ width: '100%', height: '100%' }} />
            </div>
          </div>
          {
            orderDetail && orderDetail.serviceStatus == 1 ?
              <div className='order_list'>
                <div style={{ lineHeight: '30px' }}>待付款</div>
                <div className='order_btn' onClick={this.goOrderAdpay}>立即付款</div>
              </div> : null
          }
          {
            orderDetail && orderDetail.serviceStatus == 2 ?
              <div className='order_list'>
                <div style={{ lineHeight: '30px' }}>待服务</div>
              </div> : null
          }
          {
            orderDetail && orderDetail.serviceStatus == 3 ?
              <div className='order_list'>
                <div style={{ lineHeight: '30px' }}>已完成</div>
              </div> : null
          }
          {
            orderDetail && orderDetail.serviceStatus == 4 ?
              <div className='order_list' style={{ color: '#666666' }}>
                <div style={{ lineHeight: '30px' }}>已取消</div>
              </div> : null
          }
          {
            orderDetail && orderDetail.serviceStatus == 5 ?
              <div className='order_list' style={{ color: '#666666' }}>
                <div style={{ lineHeight: '30px' }}>已过期</div>
              </div> : null
          }
          {orderDetail && orderDetail.serviceStatus == 2 || orderDetail && orderDetail.serviceStatus == 3 || orderDetail && orderDetail.serviceStatus == 5 ?
            <div style={{ padding: '10px 0', borderBottom: '1px solid #f2f2f2' }}>
              <div style={{ height: '250px', width: '250px', background: '#ccc', margin: '0px auto' }}>
                <img src={this.state.qrCode} style={{ width: '100%', height: '100%' }} ref="qrCode" />
              </div>
              <div>服务地址：</div>
              <div>{orderDetail && orderDetail.serviceAddress}</div>
              <div>{orderDetail && orderDetail.businessName} {orderDetail && orderDetail.businessPhone}</div>
            </div> : null
          }
          <div style={{ padding: '10px 0', borderBottom: '1px solid #f2f2f2', lineHeight: '30px' }}>
            <div>订单信息</div>
            <div style={{ display: 'flex' }}>
              <div style={{ marginRight: '10px' }}>订单编号</div>
              <div style={{ display: 'flex' }}>
                <div>{orderDetail && orderDetail.orderNo}</div>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <CopyToClipboard text={orderDetail && orderDetail.orderNo}
                onCopy={() => { this.onCopiedClicked() }}>
                <div style={{ color: '#FF2B64', width: 50, textAlign: "center" }}>
                  复制
              </div>
              </CopyToClipboard>
            </div>
            <div style={{ display: 'flex' }}>
              <div style={{ marginRight: '10px' }}>下单时间</div>
              <div>{orderDetail && orderDetail.time}</div>
            </div>
          </div>
          {
            orderDetail && orderDetail.serviceStatus == 1 ?
              <div style={{ paddingTop: '20px' }}>需付款：<span style={{ fontSize: '24px', color: '#FF2B64', fontWeight: 'bold' }}>{orderDetail && orderDetail.amount}</span><span style={{ color: '#FF2B64' }}>元</span></div> : null
          }
          {
            orderDetail && orderDetail.serviceStatus == 2 || orderDetail && orderDetail.serviceStatus == 3 || orderDetail && orderDetail.serviceStatus == 5 ?
              <div style={{ paddingTop: '20px' }}>已付款：<span style={{ fontSize: '24px', color: '#FF2B64', fontWeight: 'bold' }}>{orderDetail && orderDetail.amount}</span><span style={{ color: '#FF2B64' }}>元</span></div> : null
          }
        </div>
      </ActivityPage >
    );
  }
}


