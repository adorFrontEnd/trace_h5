import React, { Component } from "react";
import { getWxConfig } from '../../../api/wx/common';
import ActivityPage from '../../../components/common-page/ActivityPage';
import { wxLogin, getWxAuthRedirectUri } from '../../../api/wx/auth';
import { parseUrl, getReactRouterParams } from '../../../utils/urlUtils';
import Toast, { T } from 'react-toast-mobile';
import 'react-toast-mobile/lib/react-toast-mobile.css';
import { securityCheck, securityDecoration, boxCodeQuery, getIp, getCity } from '../../../api/frontEnd/trace';
import { getArea } from '../../../api/frontEnd/o2oIndex';
import { setCacheWxUserInfo, getCacheWxUserInfo } from '../../../middleware/localStorage/wxUser';
import { wxConfigInit, getUserLocation } from '../../../api/wx/wxConfig';
import { withRouter } from 'react-router';
import wx from 'weixin-js-sdk';
import './index.less';

const _title = "智慧防伪";
const _description = "";
class Page extends Component {
  state = {
    inputCode: null,
    uniqueCode: null,
    traceDetail: null,
    status: null,
    frnId: '',
    backgroundImage: null,
    buttonStyleBgColor: null,
    buttonStyleColor: null,
    buttonStyleType: null,
    backgroundColor: null,
    urlParams: null,
    isStartActive: false,
    appId: '',
    isPhone: false,
    isBoxCode: false,
    boxDetail: null,
    boxSpecification: null,
    // 是否开起引流
    openDrainageSetting: null,
    latitudeAndLongitude: null,
    cityId: null,
    isgoO2o: false,
    token: null
  }

  componentDidMount() {
    let urlParams = parseUrl(this.props.location.search);
    if (!urlParams || !urlParams.args || !urlParams.args.code) {
      T.alert({
        title: '无效的二维码',
        message: '无效的二维码!'
      });
      return;
    }
    let { code, key } = urlParams.args;
    if (code) {
      if (!key) {
        // 第二次进入页面
        this.handleWithSecordEnter(code, urlParams);
        return;
      }
      // 第一次进入页面
      this.handleWithFirstEnter(code, urlParams);
    }

  }

  /****第一次进入页面******************************************************************************************************************* */
  // 第一次进入页面，用户扫二维码进入。url中有Key和code
  handleWithFirstEnter = (code, urlParams) => {
    let frnId = this._getFrnIdFromCode(code);
    window.localStorage.setItem('_frnId', frnId);
    if (!frnId) {
      T.alert({
        title: '无效的二维码',
        message: '无效的二维码!'
      });
      return;
    }
    this.setState({ frnId, urlParams });
    this.getSecurityDecoration(frnId);
    this.pageWxInit({ frnId })
      .then(data => {
        let { latitude, longitude } = data;
        let tencentLng = longitude;
        let tencentLat = latitude;
        this.firstAuthorized({ frnId, urlParams, tencentLng, tencentLat });
      })

  }

  // 第一次进入页面判断用户是否应该关注公众号
  firstAuthorized = (inputData) => {
    let { frnId, urlParams, cityId, tencentLng, tencentLat } = inputData;
    window.localStorage.setItem('tencentLng', tencentLng);
    window.localStorage.setItem('tencentLat', tencentLat);
    let latitudeAndLongitude = `${tencentLng},${tencentLat}`;
    this.setState({ latitudeAndLongitude })
    if (!urlParams || !urlParams.args || !urlParams.args.code) {
      return;
    }
    let uniqueCode = urlParams.args.code;
    if (uniqueCode[0] == 'X') {
      boxCodeQuery({ uniqueCode })
        .then(data => {
          let specification = JSON.parse(data.specification);
          let boxLength = specification.boxLength + 'cm';
          let boxWidth = specification.boxWidth + 'cm';
          let boxHeight = specification.boxHeight + 'cm';
          specification = boxLength + '*' + boxWidth + '*' + boxHeight
          this.setState({
            isBoxCode: true,
            boxDetail: data,
            boxSpecification: specification
          })
        })
      return;
    }
    this.setState({ uniqueCode });
    let url = url || window.location.href;
    getWxConfig({ url, frnId })
      .then((res) => {
        window.localStorage.openDrainageSetting = res.openDrainageSetting;
        let { appId } = res;
        this.goWxAuth(appId, uniqueCode);
        // 无需关注的情况
        if (res.openDrainageSetting == 0) {
          getCity({ latitudeAndLongitude })
            .then(res => {
              this.setState({ cityId: res.cityId });
              this.getSecurityCheck(null, uniqueCode, frnId, res.cityId);
            })
        }
      })
  }
  // 授权
  goWxAuth = (appId, uniqueCode) => {
    this.setState({ appId })
    let uri = getWxAuthRedirectUri(`http://test.h5.trace.adorsmart.com/code/product`, 'user', uniqueCode, appId);
    window.location.href = uri;
  }
  /****第二次进入页面******************************************************************************************************************* */

  // 第二次进入页面，用户扫二维码进入。url中只有code
  handleWithSecordEnter = (code, urlParams) => {
    // code为微信返回的code 
    let uniqueCode = urlParams.args.state;
    let frnId = this._getFrnIdFromCode(uniqueCode);
    window.localStorage.setItem('_frnId', frnId);
    this.setState({ frnId, urlParams, uniqueCode })
    let tencentLat = window.localStorage.getItem('tencentLat');
    let tencentLng = window.localStorage.getItem('tencentLng');
    let backgroundImage = window.localStorage.getItem('backgroundImage');
    let backgroundColor = window.localStorage.getItem('backgroundColor');
    let latitudeAndLongitude = `${tencentLng},${tencentLat}`;
    this.setState({ latitudeAndLongitude, backgroundImage, backgroundColor })
    getCity({ latitudeAndLongitude })
      .then(res => {
        this.setState({ cityId: res.cityId });
        this.secondAuthorized(res.cityId);
        this.getSecurityDecoration(frnId);
      })
  }

  // 第二次进入页面的关注判断
  secondAuthorized = (cityId) => {
    // wxCode码
    let { frnId, uniqueCode, urlParams, latitudeAndLongitude } = this.state;
    window.localStorage.setItem('_frnId', frnId);
    let code = urlParams.args.code;
    let wxUserInfo = getCacheWxUserInfo();
    let token = (wxUserInfo && wxUserInfo.token) || this.state.token;
    // 判断用户是否已经关注 
    wxLogin({ code, frnId })
      .then(data => {
        setCacheWxUserInfo(data);
        window.localStorage.isPhone = data.phone;
        if (data && data.subscribe == 1) {
          // 用户已经关注，判断是否开启防伪验证
          if (latitudeAndLongitude == 'undefined,undefined') {
            // this.getUserIp(uniqueCode, frnId, cityId,token)
            this.getSecurityCheck(null, uniqueCode, frnId, cityId);
            return
          } else {
            this.getarea(latitudeAndLongitude, uniqueCode, frnId, cityId,token);
          }
        } else {
          //未关注提示用户去关注微信公众号
          let qrCode = data.qrCode;
          T.alert({
            title: '关注微信公众号',
            message: '您暂未关注防伪公众号，关注公众号后才能查询哟~',
            text: '去关注',
            fn: () => window.location.href = `http://test.h5.trace.adorsmart.com/frontEnd/userSubscribe?qrCode=${qrCode}&&frnId=${frnId}`
          });
        }
      })
      .catch((data) => {
        if (data == "trace.0010" || data == "trace.0011") {
          let url = url || window.location.href;
          getWxConfig({ url, frnId })
            .then(data => {
              let { appId } = data;
              this.setState({ appId })
              let uri = getWxAuthRedirectUri(`http://test.h5.trace.adorsmart.com/code/product`, 'user', uniqueCode, appId);
              window.location.href = uri;
            })
        }
        if (data == "trace.0012") {
          T.alert({
            title: '提示信息',
            message: '网络错误，请关闭后重新扫描'
          });
        }
        if (data == 'trace.0028') {
          this.getSecurityCheck(null, uniqueCode, frnId, cityId);
        }
      })
  }

  /***微信注册SDK************************************************************************************************** */
  pageWxInit = (info) => {
    let { frnId, uniqueCode } = info;
    return new Promise((resolve, reject) => {
      // 注册jsdk
      wxConfigInit(null, frnId, null);
      wx.ready(() => {
        // 获取用户经纬度
        getUserLocation()
          .then((data) => {
            if (data.errMsg == 'getLocation:fail') {
              alert("获取地理位置失败,请开启定位");
              // return;
            } else {
              let { latitude, longitude } = data;
              let tencentLng = longitude;
              let tencentLat = latitude;
              console.log(tencentLng,tencentLat)
              window.localStorage.setItem('tencentLng', tencentLng);
              window.localStorage.setItem('tencentLat', tencentLat);
            }
            resolve(data)
          })
          .catch(() => {
            Toast('获取地理位置失败');

          })
      })
    })
  }


  // 获取区域
  getarea = (latitudeAndLongitude, uniqueCode, frnId, cityId,token) => {
    getArea({ latitudeAndLongitude, token })
      .then(res => {
        if (res.length == 0) {
          this.setState({ isgoO2o: false })
        }
        if (res.length != 0) {
          var result = JSON.stringify(res)
          window.localStorage.setItem('o2oList', result);
          this.setState({ isgoO2o: true });
        }
        this.getSecurityCheck(null, uniqueCode, frnId, cityId);
      })
      .catch(res => {
        this.getSecurityCheck(null, uniqueCode, frnId, cityId);
      })
  }
  // 获取用户ip
  getUserIp = (uniqueCode, frnId, cityId,token) => {
    getIp()
      .then(data => {
        let ip = data.query;
        getArea({ ip, token })
          .then(res => {
            if (res.length == 0) {
              this.setState({ isgoO2o: false })
            }
            if (res.length != 0) {
              var result = JSON.stringify(res)
              window.localStorage.setItem('o2oList', result);
              this.setState({ isgoO2o: true });
            }
            this.getSecurityCheck(null, uniqueCode, frnId, cityId);
          })
          .catch(res => {
            this.getSecurityCheck(null, uniqueCode, frnId, cityId);
          })
      })
      .catch(() => {
        Toast('获取地理位置失败，请开启定位！');
      })
  }
  // 获取装修
  getSecurityDecoration = (frnId) => {
    securityDecoration({ frnId })
      .then((res) => {
        if (res) {
          if (res.background) {
            let backgroundImage = JSON.parse(res.background).image;
            let backgroundColor = '';
            if (JSON.parse(res.background).color) {
              backgroundColor = "#" + JSON.parse(res.background).color
            }
            window.localStorage.setItem('backgroundImage', backgroundImage);
            window.localStorage.setItem('backgroundColor', backgroundColor);
            this.setState({
              backgroundImage,
              backgroundColor
            })
          }
          if (res.button) {
            let buttonStyleBgColor = "#" + JSON.parse(res.button).buttonStyleBgColor;
            let buttonStyleColor = "#" + JSON.parse(res.button).buttonStyleColor;
            let buttonStyleType = JSON.parse(res.button).buttonStyleType;
            this.setState({
              buttonStyleBgColor,
              buttonStyleColor,
              buttonStyleType
            })
          }

        }

      })
  }

  // 获取输入的防伪验证码
  getAntiCounterfeitingCode = (e) => {
    let inputCode = e.target.value;
    this.setState({
      inputCode
    })
  }

  // 防伪详情
  getSecurityCheck = (code, uniqueCode, frnId, cityId) => {
    cityId = cityId || ''
    securityCheck({ code, uniqueCode, frnId, cityId })
      .then((res) => {
        // type==1表示用户所在区域有活动
        if (res.type == 1) {
          this.setState({ isStartActive: true })
        }
        this.setState({ status: res.status });
        if (res.status != 1) {
          // 未开启价格验证
          var result = JSON.stringify(res)
          window.localStorage.setItem('traceDetail', result);
          this.setState({ traceDetail: res })
          this.goTraceDetailPage();
        }
      })
  }

  // 查询详情
  searchDetail = () => {
    let { inputCode, uniqueCode, frnId } = this.state;
    if (!inputCode) {
      T.alert('请先输入防伪验证码!');
    }
    this.getSecurityCheck(inputCode, uniqueCode, frnId);
  }

  // 跳转详情页面
  goTraceDetailPage = () => {
    let { frnId, isStartActive, uniqueCode, openDrainageSetting, cityId, isgoO2o } = this.state;
    let params = { frnId, isStartActive, uniqueCode, openDrainageSetting, cityId, isgoO2o };
    let pathParams = getReactRouterParams('/frontEnd/antiFake', params);
    this.props.history.push(pathParams);
  }


  // 解析FrnId从Code中截取，从第-19位到最后一位，再取前五位；
  _getFrnIdFromCode = (code) => {

    if (!code || code.length < 19) {
      return;
    }

    String.prototype.Right = function (i) {
      return this.slice(this.length - i, this.length);
    };
    let result = code.Right(19).substring(0, 5);
    result = parseInt(result);
    result = parseInt(result, 16);
    return result;
  }

  render() {
    const { backgroundImage, buttonStyleBgColor, buttonStyleColor, buttonStyleType, backgroundColor, isBoxCode, boxDetail, boxSpecification } = this.state;

    return (
      <ActivityPage title={_title} description={_description} >
        <div style={{ backgroundImage: `url(${backgroundImage + "?x-oss-process=image/resize,l_800"})`, minHeight: '100vh', backgroundSize: '100% auto', position: 'relative', padding: '50px 30px 0 30px' }}>

          <div>
            {
              isBoxCode ?
                // 箱码详情
                <div className='boxCode'>
                  <div style={{ fontSize: '16px', fontWeight: 'bold' }}>箱码</div>
                  <div style={{ marginTop: '20px' }}>唯一码：{boxDetail && boxDetail.uniqueCode}</div>
                  <div style={{ marginTop: '20px' }}>箱规名称：{boxDetail && boxDetail.name}</div>
                  <div style={{ marginTop: '20px' }}>箱规格：{boxSpecification}</div>
                  <div style={{ marginTop: '20px' }}>箱容量：{boxDetail && boxDetail.capacity}</div>
                </div>
                :
                <div>
                  {this.state.status && this.state.status == 1 ?
                    <div style={{ padding: '43px 30px', background: '#fff', width: '100%' }}>
                      {buttonStyleType == '1' ?
                        <div style={{ display: 'flex' }}>
                          <input placeholder='请输入防伪验证码' type='text' onChange={this.getAntiCounterfeitingCode} maxLength="6" className='input-1' />
                          <button onClick={this.searchDetail} className='button-1' style={{ background: buttonStyleBgColor, color: buttonStyleColor }}>提交</button>
                        </div>
                        : null
                      }
                      {
                        buttonStyleType == '2' ?
                          <div>
                            <input placeholder='请输入防伪验证码' type='number' onChange={this.getAntiCounterfeitingCode} className='input-2' style={{ width: '100%' }} />
                            <button onClick={this.searchDetail} className='button-2' style={{ background: buttonStyleBgColor, color: buttonStyleColor, width: "100%", marginTop: '10px' }}>提交</button>
                          </div>
                          : null
                      }
                    </div>
                    : null
                  }
                </div>
            }
          </div>
        </div>

        <Toast />
      </ActivityPage>

    )
  }

}



/**渲染**********************************************************************************************************************************/




export default withRouter(Page);
