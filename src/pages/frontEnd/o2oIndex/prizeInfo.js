import React, { Component } from 'react';
import './index.less';
import {  Cascader  } from "antd";
import ActivityPage from '../../../components/common-page/ActivityPage';
import Toast from '../../../utils/toast';
import { parseUrl, joinParam, getReactRouterParams } from '../../../utils/urlUtils';
import { prizeInformation, submitShippingInformation, getShipArea } from '../../../api/frontEnd/o2oIndex';
import { getCacheWxUserInfo } from '../../../middleware/localStorage/wxUser';

const _title = "中奖信息";
const _description = "";

 class Page extends Component {
  state = {
    prizeInfo: null,
    receiptMan: '',
    receiptArea: '',
    phone: '',
    receiptAddress: '',
    token: null,
    id: null,
    provinceData: [],
    cityData: [],
    districtData: [],
    shipmentNumberUrl: ''
  }

  componentDidMount() {
    let urlParams = parseUrl(this.props.location.search);
    if (!urlParams || !urlParams.args) {
      Toast('参数获取失败')
      return;
    }
    let { id } = urlParams.args;
    let wxUserInfo = getCacheWxUserInfo();
    if (!wxUserInfo || !wxUserInfo.token) {
      return;
    }
    let token = wxUserInfo.token;
    this.getPrizeInformation(id, token);
    this.setState({ token, id });
  }
  // 获取省份
  getProvinceData = (token) => {
    getShipArea({ token }).then(res => {
      let provinceData = res;
      provinceData = provinceData && provinceData.map(province => province.id ? {
        id: province.id,
        value: province.name,
        label: province.name,
        isLeaf: false,
      } : "");
      this.setState({ provinceData });
    })
  };
  getCityLoadData = (selectedOptions) => {
    let targetOption = selectedOptions[selectedOptions.length - 1];
    let productList = null;
    let { token } = this.state;
    if (selectedOptions.length == 1) {
      getShipArea({ parentId: targetOption.id, token }).then(res => {
        productList = res;
        targetOption.children = productList && productList.map(product => product.id ?
          {
            id: product.id,
            value: product.name,
            label: product.name,
            isLeaf: false,
          } : "");
        this.setState({ cityData: [...this.state.cityData] });
      })
    } else {
      getShipArea({ parentId: targetOption.id, token }).then(res => {
        productList = res;
        targetOption.children = productList && productList.map(product => product.id ?
          {
            id: product.id,
            value: product.name,
            label: product.name,
            isLeaf: true,
          } : "")
        this.setState({ cityData: [...this.state.cityData] });
      });
    }

  }

  valueOnchange = (value) => {
    let receiptArea = value.join(',').replace(/,/g, '');
    this.setState({ receiptArea });
  }

  // 获取中奖信息
  getPrizeInformation = (id, token) => {
    prizeInformation({ id, token })
      .then(data => {
        // 0 未兑奖须获取地区
        if (data.status == 0) {
          this.getProvinceData(token);
        }
        let shipmentNumberUrl = `https://m.kuaidi100.com/result.jsp?nu=${data.shipmentNumber}`;
        this.setState({ prizeInfo: data, shipmentNumberUrl });
      })
  }
  // 获取收货人
  getReceiptMan = (event) => {
    let receiptMan=event.target.value
    var reg = /[^\u0020-\u007E\u00A0-\u00BE\u2E80-\uA4CF\uF900-\uFAFF\uFE30-\uFE4F\uFF00-\uFFEF\u0080-\u009F\u2000-\u201f\u2026\u2022\u20ac\r\n]/g;
    if(receiptMan.match(reg)) {
      // receiptMan = receiptMan.replace(reg, '');
      Toast('请不要输入表情！')
   }else{
     this.setState({ receiptMan: event.target.value });
   }
  }
  // 获取手机号
  getPhone = (event) => {
    var reg = /^\d{12}$/;
    let phone=event.target.value
    if( !reg.test(phone)){
      this.setState({ phone});
    }
   
  }
  // 获取地址
  getReceiptAddress = (event) => {
    let receiptMan=event.target.value
    var reg = /[^\u0020-\u007E\u00A0-\u00BE\u2E80-\uA4CF\uF900-\uFAFF\uFE30-\uFE4F\uFF00-\uFFEF\u0080-\u009F\u2000-\u201f\u2026\u2022\u20ac\r\n]/g;
    if(receiptMan.match(reg)) {
      // receiptMan = receiptMan.replace(reg, '');
      Toast('请不要输入表情！')
   }else{
     this.setState({ receiptAddress: event.target.value });
   }
  }


  // 保存收货信息
  clickSave = () => {
    let { receiptMan, phone, receiptArea, receiptAddress, token, id } = this.state;
    if (!receiptMan || !phone || !receiptArea || !receiptAddress) {
      Toast('请先填写收货信息')
      return
    }
    submitShippingInformation({ receiptMan, phone, receiptArea, receiptAddress, token, id })
      .then(data => {
        this.goPrize();
      })
  }
  // 奖品
  goPrize = () => {
    let pathParams = getReactRouterParams('/frontEnd/prize');
    this.props.history.push(pathParams);
  }

  //UI渲染
  render() {
    return (
      <ActivityPage title={_title} description={_description} >
        <div style={{ background: '#f2f2f2', minHeight: '100vh', padding: '10px' }}>
          <div className='prizeInfo'>
            <div style={{ height: '70px', width: '50px', marginRight: '15px'}}>
              <img src={this.state.prizeInfo && this.state.prizeInfo.image} style={{ width: '100%', height: '100%',objectFit: 'cover' }} alt='' />
            </div>
            <div>
              <div>{this.state.prizeInfo && this.state.prizeInfo.name}</div>
              <div style={{ fontSize: '12px', color: '#99999F' }}>中奖时间：{this.state.prizeInfo && this.state.prizeInfo.time}</div>
              <div style={{ fontSize: '12px', color: '#99999F' }}>兑奖截止：{this.state.prizeInfo && this.state.prizeInfo.expiredTime}</div>
              {this.state.prizeInfo && this.state.prizeInfo.status == 0 ?
                <div style={{ color: '#FF2B64' }}>未兑奖</div> : null
              }
              {this.state.prizeInfo && this.state.prizeInfo.status == 1 ?
                <div style={{ color: '#FF2B64' }}>未寄出</div> : null
              }
              {this.state.prizeInfo && this.state.prizeInfo.status == 2 ?
                <div style={{ color: '#FF2B64' }}>已寄出</div> : null
              }
              {this.state.prizeInfo && this.state.prizeInfo.status == 3 ?
                <div style={{ color: '#FF2B64' }}>已过期</div> : null
              }
            </div>
          </div>
          {
            this.state.prizeInfo && this.state.prizeInfo.status == 2 ?
              <div className='adress'>
                <div className='adress_info'>物流信息</div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>{this.state.prizeInfo && this.state.prizeInfo.shipName}</div>
                  <div>{this.state.prizeInfo && this.state.prizeInfo.shipmentNumber}</div>
                  <a href={this.state.shipmentNumberUrl}>查看物流信息</a>
                </div>
                <div style={{ marginBottom: '10px' }} className='adress_info'>收货信息</div>
                <div>{this.state.prizeInfo.receiptMan} {this.state.prizeInfo.phone}</div>
                <div>{this.state.prizeInfo.receiptArea}{this.state.prizeInfo.receiptAddress}</div>
              </div> : null
          }
          {
            this.state.prizeInfo && this.state.prizeInfo.status == 1 ?
              <div className='adress'>
                <div style={{marginBottom: '10px' }} className='adress_info'>收货信息</div>
                <div>{this.state.prizeInfo.receiptMan} &emsp; {this.state.prizeInfo.phone}</div>
                <div>{this.state.prizeInfo.receiptArea}{this.state.prizeInfo.receiptAddress}</div>
              </div> : null
          }
          {this.state.prizeInfo && this.state.prizeInfo.status == 0 ?
            <div className='adress'>
              <div style={{ display: 'flex', }}>
                <div style={{ lineHeight: '40px' }}>收货人&emsp;：</div>
                <input placeholder="填写收货人" value={this.state.receiptMan} style={{border:'none',borderBottom:'1px solid #f2f2f2',padding:'5ps',width:'70%',marginTop:'0'}} onChange={this.getReceiptMan} />
              </div>
              <div style={{ display: 'flex', marginTop: '10px' }}>
                <div style={{ lineHeight: '40px' }}>手机号码：</div>
                <input type="number" placeholder="填写手机号码" max-length='11' value={this.state.phone} style={{border:'none',borderBottom:'1px solid #f2f2f2',padding:'5ps',width:'70%',marginTop:'0'}} onChange={this.getPhone} />
              </div>
              <div style={{ display: 'flex', marginTop: '20px' }} >
                <div style={{ lineHeight: '40px' }} >收货地址：</div>
                <Cascader
                  placeholder="点击选择地区"
                  options={this.state.provinceData}
                  loadData={this.getCityLoadData}
                  onChange={this.valueOnchange}
                />

              </div>
              <div style={{ display: 'flex', marginTop: '10px' }}>
                <div style={{ lineHeight: '40px', color: '#fff' }}>收货地址：</div>
                <input placeholder="填写详细地址" value={this.state.receiptAddress} style={{border:'none',borderBottom:'1px solid #f2f2f2',padding:'5ps',width:'70%',marginTop:'0'}} onChange={this.getReceiptAddress} />
              </div>
              <div style={{ marginTop: '20px',background: '#FF2B64',height:'40px',lineHeight:'40px',color:'#fff',borderRadius:'5px',textAlign:'center' }} onClick={this.clickSave}>保存完成兑奖</div>
              <div style={{ marginTop: '10px', textAlign: 'center', color: '#99999F' }}>保存后无法修改</div>
            </div>
            
             : null
          } 
        </div>
      </ActivityPage >
    );
  }
}
export default Page


