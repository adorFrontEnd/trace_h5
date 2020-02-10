import React, { Component } from 'react';
import '../../frontEnd/trace/index.less';
import { parseUrl,joinParam ,getReactRouterParams} from '../../../utils/urlUtils';
import Toast from '../../../utils/toast';

export default class MemberCenter extends Component {
  state = {
    address: null,
    tencentLat:'',
    tencentLng:''
  }
  componentDidMount() {

    let urlParams = parseUrl(this.props.location.search);
    if (!urlParams || !urlParams.args) {
      Toast('参数获取失败')
      return;
    }

    let {tencentLat,tencentLng}=urlParams.args;
    let address = window.localStorage.getItem('address');
    this.setState({
      tencentLat,
      tencentLng,
      address
    }, () => {
      let { tencentLat, tencentLng } = this.state;
      this.initMap([tencentLng, tencentLat]);
    })
  }


  
  /*****************************************地图**************************************************** */
  initMap = (position) => {
    var map = new window.AMap.Map('container', {
      resizeEnable: true,
      zoom: 12,
      center: position,
      showIndoorMap: true, //关闭室内地图
      doubleClickZoom: false
    });
    map.setCenter(position);
   let {tencentLng,tencentLat,address}=this.state;
    var marker = new window.AMap.Marker({
      position: new window.AMap.LngLat(tencentLng,tencentLat),
      offset: new window.AMap.Pixel(-10, -10),
      icon: 'https://webapi.amap.com/theme/v1.3/markers/n/mark_bs.png', // 添加 Icon 图标 URL
      title: address
    });
    var msg_label = `<span>${address}</span>`;
    marker.setLabel({
        offset: new window.AMap.Pixel(-20, -20), //显示位置
        content: msg_label //显示内容
    });
    map.add(marker);
  }

  
  //UI渲染
  render() {
    return (
      <div id='container' style={{ height: '100vh' }}>

      </div>

    );
  }
}


