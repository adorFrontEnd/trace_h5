
import baseHttpProvider from '../base/baseHttpProvider';
import { md5 } from '../../utils/signMD5';


const deleteCustomer = (params) => {
  return baseHttpProvider.getApi('api/user/delete', params);
}

const searchUserList = (params) => {
  return baseHttpProvider.postFormApi('api/user/searchUserList', { page: 1, size: 10, ...params }, { total: true });
}

const saveOrUpdate = (params) => {

  if (params && params.adminPassword) {
    params.adminPassword = md5(params.adminPassword);
  }

  return baseHttpProvider.postFormApi('api/user/saveOrUpdate', params, { total: true });
}
const statusUpdateUser = (params) => {

  if (params && params.adminPassword) {
    params.adminPassword = md5(params.adminPassword);
  }

  return baseHttpProvider.getApi('api/user/updateUser', params, { total: true });
}

export {
  deleteCustomer,
  searchUserList,
  saveOrUpdate,
  statusUpdateUser
}