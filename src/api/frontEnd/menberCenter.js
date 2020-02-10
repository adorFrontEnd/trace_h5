import baseHttpProvider from '../base/baseHttpProvider';
const attentionInfo = (params) => {
  return baseHttpProvider.getApi('api/memberCentre/attentionInfo', params, {
    tokenless: true
  });
}

// 获取奖券列表
const redemptionVoucher = (params) => {
  return baseHttpProvider.getApi('api/memberCentre/redemptionVoucher', params, {
    tokenless: true
  });
}
// 获取已兑换抢券详情
const redeemedDetails = (params) => {
  return baseHttpProvider.postFormApi('api/memberCentre/redeemedDetails', params, {
    tokenless: true
  });
}
// 获取未兑换详情
const voucherDetails = (params) => {
  return baseHttpProvider.postFormApi('api/memberCentre/voucherDetails', params, {
    tokenless: true
  });
}

// 获取核销二维码
// 获取核销码
const obtainTheVerificationCode = (params) => {
  let result = baseHttpProvider.getReqObj('api/memberCentre/obtainTheVerificationCode', params);
  if (result.url) {
    return result.url;
  }
}
// 获取核销二维码状态 是否已核销
const writeOffStatus = (params) => {
  return baseHttpProvider.getApi('api/memberCentre/writeOffStatus', params);
}
// 会员中心绑定手机获得积分
const bindInggetIintegral = (params) => {
  return baseHttpProvider.getApi('api/memberCentre/binding', params, { toast: { required: false } });
}

export {
  attentionInfo,
  redemptionVoucher,
  redeemedDetails,
  voucherDetails,
  obtainTheVerificationCode,
  writeOffStatus,
  bindInggetIintegral
}