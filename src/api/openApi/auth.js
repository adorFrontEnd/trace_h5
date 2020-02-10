import baseHttpProvider from '../base/openApiBaseHttpProvider';
import { md5 } from '../../utils/signMD5';

const getDetailByAppId = (params) => {

  return baseHttpProvider.getApi('api/userAuth/getDetailByAppId', params, { tokenless: true })
}

const getToken = (params) => {
  return baseHttpProvider.postFormApi('api/userAuth/getToken', { ...params }, { tokenless: true })
}

export {
  getDetailByAppId,
  getToken
}