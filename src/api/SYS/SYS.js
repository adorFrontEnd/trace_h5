import baseHttpProvider from '../base/baseHttpProvider'

// 获取当前服务器时间
const getServerCurrentTime = () => {
  return baseHttpProvider.getApi('auth/getCurrentTimeMillis', null, {
    tokenless: true
  })
}


export {
  getServerCurrentTime
}