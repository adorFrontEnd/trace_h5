import baseHttpProvider from '../base/baseHttpProvider';


// 获取o2o页面
const getArea = (params) => {
  return baseHttpProvider.postFormApi('api/v1.0/newSecurity/area'+Date.now().toString().slice(0, -3), params);
}
// 获取o2o详情
const eventGoodsDetail = (params) => {
  return baseHttpProvider.getApi('api/v1.0/newSecurity/eventGoodsDetail', params);
}
// createOrder
const createOrder = (params) => {
  return baseHttpProvider.postFormApi('api/v1.0/newSecurity/createOrder', params);
}

const subscriptionListDetail = (params) => {
  return baseHttpProvider.getApi('api/v1.0/newSecurity/subscriptionListDetail', params);
}
// 获取服务码
const couponQRCode = (params) => {
  let result = baseHttpProvider.getReqObj('api/v1.0/newSecurity/couponQRCode', params);
  if (result.url) {
    return result.url;
  }
}
// 获取订购列表
const subscriptionList = (params) => {
  return baseHttpProvider.getApi('api/v1.0/newSecurity/subscriptionList', params, { total: true });
}
// 活动券查询
const queryList = (params) => {
  return baseHttpProvider.getApi('eventVoucher/queryList', params, {
    tokenless: true
  });
}
// 活动券查询
const scanActivityCode = (params) => {
  return baseHttpProvider.getApi('eventVoucher/scanActivityCode', params, {
    tokenless: true
  });
}
// 确认服务
const confirmationService = (params) => {
  return baseHttpProvider.getApi('eventVoucher/confirmationService', params, {
    tokenless: true
  });
}
// 大转盘
const eventPage = (params) => {
  return baseHttpProvider.getApi('api/v1.0/activity/eventPage', params, {
    tokenless: true
  });
}
// 点击抽奖
const lottery = (params) => {
  return baseHttpProvider.getApi('api/v1.0/activity/lottery', params, {toast: { required: false},total: true
  });
}
// 中奖详情
const prizeInformation = (params) => {
  return baseHttpProvider.getApi('api/v1.0/activity/prizeInformation', params, {
    tokenless: true
  });
}
// 保存收货信息完成兑奖
const submitShippingInformation = (params) => {
  return baseHttpProvider.postFormApi('api/v1.0/activity/submitShippingInformation', params, {
    tokenless: true
  });
}
// 奖品列表
const prizeList = (params) => {
  return baseHttpProvider.getApi('api/v1.0/activity/prizeList', params, {
    tokenless: true,total: true
  });
}
// 获取收货区域
const getShipArea = (params) => {
  return baseHttpProvider.getApi('api/v1.0/activity/getArea', params, {
    tokenless: true
  });
}
// 获取轮播数据
const prizeCarousel = (params) => {
  return baseHttpProvider.getApi('api/v1.0/activity/prizeCarousel', params, {
    tokenless: true
  });
}
export {
  getArea,
  eventGoodsDetail,
  createOrder,
  subscriptionListDetail,
  couponQRCode,
  subscriptionList,
  queryList,
  scanActivityCode,
  confirmationService,
  eventPage,
  lottery,
  prizeList,
  prizeInformation,
  submitShippingInformation,
  getShipArea,
  prizeCarousel
}