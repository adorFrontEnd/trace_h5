


const isWxUserLogin = () => {
  return !!getCacheWxUserOpenId();
}

const wxUserLogout = (token) => {
  window.localStorage['_wxUserInfo'] = null;
}

const setCacheWxUserInfo = (userInfo) => {
  if (!userInfo) {
    window.localStorage['_wxUserInfo'] = null;
  } else {
    if (userInfo.token) {
      userInfo.token = decodeURIComponent(userInfo.token);
    }
    window.localStorage['_wxUserInfo'] = JSON.stringify(userInfo);
  }
}

const getCacheWxUserInfo = () => {
  let userInfo = window.localStorage['_wxUserInfo'];
  if (userInfo) {
    return JSON.parse(userInfo);
  }
  return null
}

const getCacheWxUserOpenId = ()=>{
  let userInfo = getCacheWxUserInfo();
  let result = null;
  if(userInfo && userInfo.openid){
    result = userInfo.openid;
  }
  return result;  
}


const getCacheWxUserToken = ()=>{
  let userInfo = getCacheWxUserInfo();
  let result = null;
  if(userInfo && userInfo.token){
    result = userInfo.token;
  }
  return result;  
}
const setCacheTraceDetail = (data) => {
  if (!data) {
    window.localStorage['traceDetail'] = "";
    return;
  }
  window.localStorage['traceDetail'] = data;
}

const getCacheTraceDetail = () => {
  let data = window.localStorage['traceDetail'];
  if (data) {
    return JSON.parse(data);
  }
  return;
}

export {
  isWxUserLogin,
  wxUserLogout,
  setCacheWxUserInfo,
  getCacheWxUserInfo,
  getCacheWxUserOpenId,
  getCacheWxUserToken,
  setCacheTraceDetail,
  getCacheTraceDetail

} 