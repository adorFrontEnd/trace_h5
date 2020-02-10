


const isUserLogin = () => {
  return getCacheToken() ? true : false;
}
const getCacheToken = () => {
  let userInfo = getCacheUserInfo();
  if (userInfo && userInfo.token) {
    return userInfo.token;
  }
  return null;
}

const getCacheRouterConfig = () => {
  let userInfo = getCacheUserInfo();
  if (userInfo && userInfo.data) {
    return userInfo.data;
  }
  return null;
}

const userLogout = (token) => {
  window.localStorage['_userInfo'] = null;
}

const setCacheUserInfo = (userInfo) => {
  if (!userInfo) {
    window.localStorage['_userInfo'] = null;
  } else {
    if (userInfo.token) {
      userInfo.token = decodeURIComponent(userInfo.token);
    }
    window.localStorage['_userInfo'] = JSON.stringify(userInfo);
  }
}

const getCacheUserInfo = () => {
  let userInfo = window.localStorage['_userInfo'];
  if (userInfo) {
    return JSON.parse(userInfo);
  }
  return null
}


export {
  setCacheUserInfo,
  getCacheRouterConfig,
  getCacheToken,
  getCacheUserInfo,
  isUserLogin,
  userLogout
} 