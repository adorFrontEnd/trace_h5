import baseHttpProvider from '../base/baseHttpProvider';
import { md5 } from '../../utils/signMD5';



/* api/user/updatePassword 修改个人密码*******************************************************************
@params
balance	Double	true	余额
remark	String	true	备注
id	Int	true	id
*/
const updatePassword = (params) => {
  // if (!params || !params.oldPassword || !params.newpassword) {
  //   return;
  // }
  let { oldPassword, newPassword } = params;
  oldPassword = md5(oldPassword);
  newPassword = md5(newPassword);
  return baseHttpProvider.postFormApi('api/adminOper/changePassword',
    {
      ...params,
      oldPassword,
      newPassword
    })
}
/* api/config/getVerificationCode 获取验证码*******************************************************************
@params
verificationCode 验证码
*/
const getVerificationCode = (params) => {

  return baseHttpProvider.getApi('api/config/getVerificationCode',
    {
      ...params
    })
}

/* api/config/saveOrUpdate 保存验证码*******************************************************************
@params
verificationCode 验证码
*/
const saveOrUpdateVerificationCode = (params) => {

  return baseHttpProvider.postFormApi('api/config/saveOrUpdate',
    {
      ...params
    })
}

export {
  updatePassword,
  getVerificationCode,
  saveOrUpdateVerificationCode
}