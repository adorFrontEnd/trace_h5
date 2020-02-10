import baseHttpProvider from '../base/baseHttpProvider';
import { md5 } from '../../utils/signMD5.js'

const deleteOper = (params) => {
  return baseHttpProvider.getApi('api/adminOper/delete', params);
}

const getOperPage = (params) => {
  return baseHttpProvider.postFormApi('api/adminOper/searchAdminOperList', { page: 1, size: 10, ...params }, { total: true });
}

const saveOrUpdate = (params) => {
  if (params && params.password) {
    params.password = md5(params.password);
  } 
  return baseHttpProvider.postFormApi('api/adminOper/saveOrUpdate', params, { total: true });
}
const disableStatus = (params) => {
  if (params && params.password) {
    params.password = md5(params.password);
  } 
  return baseHttpProvider.getApi('api/adminOper/disable', params, { total: true });
}



export {
  deleteOper,
  getOperPage,
  saveOrUpdate,
  disableStatus
}