import React, { Component } from 'react';
import './index.less';
import dateUtil from '../../../utils/dateUtil';
import ActivityPage from '../../../components/common-page/ActivityPage';
import wx from 'weixin-js-sdk';
import Toast from '../../../utils/toast';
import { parseUrl, joinParam,getReactRouterParams } from '../../../utils/urlUtils';
import { wxConfigInit, scanQRCode } from '../../../api/wx/wxConfig';
import { queryList, scanActivityCode } from '../../../api/frontEnd/o2oIndex';
const mapKey = '8052f9e9c547eae2205aa45225407b74'
const _title = "查询";
const _description = "";
export default class MemberCenter extends Component {
  state = {
    queryCode: '',
    list: null,
    isSearch: true,
    businessId: ''
  }
  componentDidMount() {
    let urlParams = parseUrl(this.props.location.search);
    if (!urlParams || !urlParams.args) {
      Toast('参数获取失败')
      return;
    }
    let { id } = urlParams.args;
    let frnId = window.localStorage.getItem('_frnId');
    this.setState({ businessId: id })
    this.getQueryList(id);
    this.pageInit(frnId)
  }
  getValue = (e) => {
    this.setState({
      queryCode: e.target.value
    })
  }
  // 获取列表数据
  getQueryList = (id) => {
    queryList({ id })
      .then(data => {
        this.setState({ list: data })
      })
  }
  // 活动券查询
  getScanActivityCode = (id, isSearch) => {
    let businessId = this.state.businessId;
    let parmas = {
      businessId
    }

    if (isSearch) {
      parmas.code = id
    } else {
      parmas.id = id
    }
    scanActivityCode(parmas)
      .then(data => {
        var result = JSON.stringify(data)
        window.localStorage.setItem('queryList', result);      
        let pathParams = getReactRouterParams('/frontEnd/inquireResult',{ id: this.state.businessId });    
        this.props.history.push(pathParams);
      })
  }
  clickSearch = () => {
    let { queryCode, isSearch } = this.state
    if (!queryCode) {
      Toast('请先输入活动券码')
      return
    }
    this.getScanActivityCode(queryCode, isSearch)
  }
  // *************************jsdk**********************************
  pageInit = (frnId) => {
    if (!frnId) {
      frnId = 4
    }
    wxConfigInit(null, frnId, null);
  }
  //扫描二维码
  scanCode = () => {
    this.setState({ isSearch: false }, () => {
      scanQRCode()
        .then(res => {
          this.getScanActivityCode(res, this.state.isSearch)
        })
    })
  }
  clickClear = () => {
    this.setState({ queryCode: '' })
  }
  // *******************************跳转**************************************

  //UI渲染
  render() {
    const { backgroundImage, backgroundColor } = this.state;
    return (
      <ActivityPage title={_title} description={_description} >
        <div style={{ background: '#f2f2f2', minHeight: '100vh', padding: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <input placeholder='输入活动券码' className='input-1' onChange={this.getValue} value={this.state.queryCode} />
            <div style={{ width: '10%', height: '51px', background: '#FFF', lineHeight: '51px' }} onClick={this.clickClear}>
              <img src='/image/close.png' className='closeimg' />
            </div>
          </div>

          <div className='search' onClick={this.clickSearch}>查询</div>
          <div className='search' onClick={this.scanCode} style={{ marginBottom: '30px' }}> 扫描活动券二维码</div>
          {
            this.state.list && this.state.list.map((item, index) => {
              return (
                <div className='list' key={index}>
                  <div>
                    <div>{item.name}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '35px' }}>
                      <div style={{ marginRight: '10px' }}>已购：{item.saleNumber}</div>
                      <div style={{ marginRight: '10px' }}>已服务：{item.served}</div>
                      <div style={{ marginRight: '10px' }}>剩余库存：{item.stock}</div>
                    </div>
                  </div>
                  <div style={{ width: '60px', height: '60px', background: '#ccc' }}>
                    <img src={item.mainImage} style={{ width: '100%', height: '100%' }} />
                  </div>
                </div>
              )
            })
          }

        </div>
      </ActivityPage >
    );
  }
}


