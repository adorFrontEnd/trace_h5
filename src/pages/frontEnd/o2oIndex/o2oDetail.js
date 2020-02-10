import React, { Component } from 'react';
import './index.less';
import { Carousel } from "antd";
import ActivityPage from '../../../components/common-page/ActivityPage';
import wx from 'weixin-js-sdk';
import Toast from '../../../utils/toast';
import { parseUrl, joinParam, getReactRouterParams } from '../../../utils/urlUtils';
import { eventGoodsDetail, createOrder } from '../../../api/frontEnd/o2oIndex';
import { getCacheWxUserInfo } from '../../../middleware/localStorage/wxUser';
const mapKey = '8052f9e9c547eae2205aa45225407b74'
const _title = "详情";
const _description = "";
export default class MemberCenter extends Component {
  state = {
    goodsDetail: null,
    token: null,
    name: '',
    carouselImage: null,
    isPhone: false,
    id: null,
    imgheights: [],
    //图片宽度 
    imgwidth: 750,
    maxHeight: 0,
    token: 'kcuFhL8NStlOPtyCmEAQKRGHJ7gHWjCZX0gG1zYSCuT5yY31pomDZYIpgC5RVnst'
  }
  componentDidMount() {
    let urlParams = parseUrl(this.props.location.search);
    if (!urlParams || !urlParams.args) {
      Toast('参数获取失败')
      return;
    }
    let { id } = urlParams.args;
    let wxUserInfo = getCacheWxUserInfo();
    let token = (wxUserInfo && wxUserInfo.token) || this.state.token;
    let name = window.localStorage.getItem('name');
    this.setState({ name })
    this.getGoodsDetail(id, token)
  }

  getGoodsDetail = (id, token) => {
    eventGoodsDetail({ id, token })
      .then(data => {
        let carouselImage = data.carouselImage.split(',')
        this.setState({ goodsDetail: data, carouselImage, isPhone: data.isPhone, id: data.id })
      })
  }
  // 点击购买
  goBuy = () => {
    let { isPhone, id } = this.state;
    let wxUserInfo = getCacheWxUserInfo();
    let token = wxUserInfo.token;
    if (isPhone) {
      createOrder({ id, token })
        .then(data => {
          if (data && data.id) {
            let orderId = data.id;
            let pathParams = getReactRouterParams('/frontEnd/orderDetail', { orderId });
            this.props.history.push(pathParams);
          }
        })
    } else {
      this.goBingPhone(id)
    }
  }


  // *******************************跳转**************************************
  // 绑定手机
  goBingPhone = (id) => {
    let pathParams = getReactRouterParams('/frontEnd/bindPhone', { id });
    this.props.history.push(pathParams);
  }
  //UI渲染
  render() {
    const { goodsDetail, name, carouselImage, maxHeight } = this.state;
    return (
      <ActivityPage title={_title} description={_description} >
        <div style={{ background: '#f2f2f2', minHeight: '100vh' }}>
          <div style={{ height: '90vh', overflowY: 'scroll' }}>
            <div style={{ height: '200px', background: '#ccc' }}>
              <Carousel autoplay style={{ height: '200px' }}>
                {
                  carouselImage && carouselImage.map((item, index) => {
                    return (
                      <div key={index} style={{ height: '200px' }}>
                        <img src={item} style={{ height: '200px', width: '100%', objectFit: 'cover' }} alt='' />
                      </div>
                    )
                  })
                }
              </Carousel>
            </div>
            <div style={{ padding: '10px' }}>
              <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{name}</div>
              <div>{goodsDetail && goodsDetail.expired}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <span> {goodsDetail && goodsDetail.purchases}</span>
                  <span style={{ marginLeft: '10px' }}>不可退换</span>
                </div>
                <div>已售：{goodsDetail && goodsDetail.sold}件</div>
              </div>
            </div>
            <div className='price'>￥{goodsDetail && goodsDetail.price}<span style={{ fontWeight: 'normal', fontSize: '12px', marginLeft: '10px', textDecoration: 'line-through' }}>原价:￥{goodsDetail && goodsDetail.originalPrice}</span></div>
            <div style={{ padding: '10px 10px 0 10px' }}>
              <h4 style={{ fontWeight: 'bold' }}>服务地址</h4>
              <div style={{ padding: ' 0 10px', fontSize: '12px' }}>
                <div>联系地址：{goodsDetail && goodsDetail.serviceAddress}</div>
                <div>联系电话：{goodsDetail && goodsDetail.phone}</div>
              </div>
            </div>
            <div style={{ padding: '10px 10px 0 10px' }}>
              <h4 style={{ fontWeight: 'bold' }}>服务方式</h4>
              <div style={{ padding: '0px 10px ', fontSize: '12px' }}> {goodsDetail && goodsDetail.serviceMethod}</div>
            </div>
            <div style={{ padding: '10px 10px 0 10px ' }}>
              <h4 style={{ fontWeight: 'bold' }}>详情 </h4>
              <div className='imgbox'>
                <span dangerouslySetInnerHTML={{ __html: goodsDetail && goodsDetail.details }}></span>
              </div>
            </div>
          </div>
          <div className='buy'>
            <div className='gobuy' onClick={this.goBuy}>立即购买</div>
          </div>
        </div>
      </ActivityPage >
    );
  }
}


