import baseHttpProvider from '../base/baseHttpProvider';
const traceabilityCheck = (params) => {
  return baseHttpProvider.postFormApi('api/security/traceabilityCheck', params,{
    tokenless: true
  });
}
const securityCheck = (params) => {
  return baseHttpProvider.postFormApi('api/security/securityCheck', params,{
    tokenless: true
  });
}
// 溯源
const getDetailByUserId = (params) => {
  return baseHttpProvider.getApi('api/decoration/getDetailByUserId', params,{
    tokenless: true
  });
}

// 防伪
const securityDecoration = (params) => {
  return baseHttpProvider.getApi('api/decoration/securityDecoration', params,{
    tokenless: true
  });
}
const getVersionFrn = (params) => {
  return baseHttpProvider.getApi('auth/versionFrn', params, { showLoading: true });
}
// 防伪是否需要关注公众号
const getAuthorized = (params) => {
  return baseHttpProvider.getApi('authorize/authorized', params, { showLoading: true });
}
// 是否开始调用活动接口
const activityHome = (params) => {
  return baseHttpProvider.postFormApi('api/activity/activityHome', params, { showLoading: true});
}
// 是否绑定手机号
const judgingThePhone = (params) => {
  return baseHttpProvider.getApi('api/attention/judgingThePhone', params, { showLoading: true});
}
// 获取验证码
const sendMessages = (params) => {
  return baseHttpProvider.postFormApi('api/memberCentre/sendMessages', params, { showLoading: true});
}
// 绑定手机号
const bindPhoneNumber = (params) => {
  return baseHttpProvider.postFormApi('api/memberCentre/bindPhoneNumber', params, { showLoading: true});
}
// 获取附近门店
const voucherDetails = (params) => {
  return baseHttpProvider.postFormApi('api/memberCentre/voucherDetails', params, { showLoading: true});
}
// 获取核销码
const obtainTheVerificationCode = (params) => {
  let result =  baseHttpProvider.getReqObj('api/memberCentre/obtainTheVerificationCode', params);
  if (result.url) {
    return result.url;
  }
}
// 获取图片验证码
const getImageVerifiCode = (params) => {
  let result =  baseHttpProvider.getReqObj('api/smsVerificationCode', params);
  if (result.url) {
    return result.url;
  }
}
// 获取积分
const increasePoints = (params) => {
  return baseHttpProvider.getApi('api/memberCentre/increasePoints', params, { showLoading: true});
}
// 获取用户ip
const getIp = () => {
  return baseHttpProvider.GET('http://ip-api.com/json');
}
// 获取箱码详情
const boxCodeQuery = (params) => {
  return baseHttpProvider.getApi('api/security/boxCodeQuery', params, { showLoading: true,tokenless: true});
}
// 获取城市
const getCity = (params) => {
  return baseHttpProvider.postFormApi('api/activity/getCity', params, { showLoading: true,tokenless: true});
}


export {
  traceabilityCheck,
  securityCheck,
  getDetailByUserId,
  securityDecoration,
  getVersionFrn,
  getAuthorized,
  activityHome,
  judgingThePhone,
  sendMessages,
  bindPhoneNumber,
  voucherDetails,
  obtainTheVerificationCode,
  increasePoints,
  getImageVerifiCode,
  getIp,
  boxCodeQuery,
  getCity
}