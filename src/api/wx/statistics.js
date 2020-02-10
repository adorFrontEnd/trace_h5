import baseHttpProvider from '../base/baseHttpProvider';
import { postForObject } from '../home/home';
import { getAccessToken } from '../home/home';
import { getRecentDay, getRecentDays } from '../../utils/dateUtil';

/**默认访问最近一周*****************************************************************************************************************/
// endDate，days
const getDailyVisitedTrend = (params) => {
  let days = params && params.days ? Math.abs(days) * -1 : -7;
  let endDate = params && params.endDate ? Date.parse(params.endDate) : null
  return new Promise((resolve, reject) => {
    getAccessToken().then(access_token => {
      // let access_token = "18_BPwm0jjmmScfVPn9VEg1hjzFvGGH2a_tPFUZ8RnFohw4P7Y4dCgd-hruW1aZVDJCBV6gg8GihAUIObMQWeQs19dEJNG9J70QL0Aj0HVdQIXnIL33lJidjO-gf9NJXrk_O5DM2dded0cjowJNODAeAGAAPM"
      let dayArr = getRecentDays(endDate, -7);
      let asnycArr = dayArr.map(date => _getDailyData(date, access_token))
      Promise.all(asnycArr)
        .then((results) => {
          resolve(results)
        })
        .catch(()=>{
          reject()
        })
    })
  })
}

const _getDailyData = (date, access_token) => {
  let params = {
    "begin_date": date,
    "end_date": date,
    // access_token
  }
  return _getDailyVisitedData(params, access_token)
}

/*********** datacube/getweanalysisappiddailyvisittrend ***************************************************************************/

// ref_date	string	日期，格式为 yyyymmdd
// session_cnt	number	打开次数
// visit_pv	number	访问次数
// visit_uv	number	访问人数
// visit_uv_new	number	新用户数

const _getDailyVisitedData = (params, access_token) => {
  let url = "/datacube/getweanalysisappiddailyvisittrend?access_token=" + access_token;
  let data = params; 
  return new Promise((resolve, reject) => {
    postForObject({ url, data })
      .then(res => {
        if(!res){
          reject()
        }
        res = JSON.parse(res);
        if (res.list && res.list.length) {
          resolve(res.list[0])
        } else {
          reject()
        }
      })
  })
}

export {
  getDailyVisitedTrend
}
