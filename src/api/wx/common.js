
import { appId, appSecret } from '../../config/app.config';
import baseHttpProvider from '../base/baseHttpProvider';
// 获取Wx token
const getAccessTokenFromWx = () => {
  let appid = appId;
  let secret = appSecret;
  return baseHttpProvider.GET('/cgi-bin/token', {
    grant_type: "client_credential",
    appid,
    secret
  })
}

const getWxConfig = (params) => {
  return baseHttpProvider.getApi('authorize/getWxConfig', { ...params }, { tokenless: true, toast: { required: false} })
}

export {
  getAccessTokenFromWx,
  getWxConfig
}
