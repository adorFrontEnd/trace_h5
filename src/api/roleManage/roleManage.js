import baseHttpProvider from '../base/baseHttpProvider';
const searchRoleList = (params) => {
  return baseHttpProvider.postFormApi('api/adminRole/searchRoleList', { page: 1, size: 10, ...params },
    {
      total: true
    })
}
const deleteRole = (params) => {
  return baseHttpProvider.getApi('api/adminRole/delete', params)
}

const getAllList = (params) => {
  return baseHttpProvider.getApi('api/adminSource/getAllList', params)
}
const saveOrUpdate = (params) => {
  return baseHttpProvider.postFormApi('api/adminRole/saveOrUpdate', params)
}
export {
  searchRoleList,
  deleteRole,
  getAllList,
  saveOrUpdate
}