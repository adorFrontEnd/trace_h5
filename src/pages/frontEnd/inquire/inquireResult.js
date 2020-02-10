import React, { Component } from 'react';
import './index.less';

import dateUtil from '../../../utils/dateUtil';

import { CopyToClipboard } from 'react-copy-to-clipboard';
import ActivityPage from '../../../components/common-page/ActivityPage';
import wx from 'weixin-js-sdk';
import Toast from '../../../utils/toast';
import { parseUrl, joinParam,getReactRouterParams } from '../../../utils/urlUtils';
import {confirmationService } from '../../../api/frontEnd/o2oIndex';
const mapKey = '8052f9e9c547eae2205aa45225407b74'
const _title = "订单详情";
const _description = "";
export default class MemberCenter extends Component {
  state = {
    userId: 0,
    queryResult: null
  }
  componentDidMount() {
    let urlParams = parseUrl(this.props.location.search);
    if (!urlParams || !urlParams.args) {
      Toast('参数获取失败')
      return;
    }
    let { id } = urlParams.args;
    this.setState({userId:id})
    let queryResult = window.localStorage.getItem('queryList');
    queryResult = JSON.parse(queryResult)
    this.setState({ queryResult })
  }

  // 复制链接
  copyLink = () => {
    this.setState({ copied: true });
    Toast('复制成功!')
  }

confirmService=()=>{
  let {queryResult}=this.state
  confirmationService({id:queryResult.id})
  .then(data=>{
    Toast('服务成功！');
    let params={}
    params.id=this.state.userId;
    let pathParams = getReactRouterParams('/frontEnd/inquireIndex',{ id: this.state.userId });    
    this.props.history.push(pathParams);
  })
}


  //UI渲染
  render() {
    const { queryResult } = this.state;
    return (
      <ActivityPage title={_title} description={_description} >
        <div style={{ borderTop: '1px solid #f2f2f2', minHeight: '100vh', padding: '10px' }}>
          <div className='list' style={{ border: '1px solid #f2f2f2' }}>
            <div>
              <div>{queryResult && queryResult.name}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '35px' }}>
                {queryResult && queryResult.purchases}
              </div>
            </div>
            <div style={{ width: '60px', height: '60px', background: '#ccc' }}>
              <img src={queryResult && queryResult.mainImage} style={{ width: '100%', height: '100%' }} />
            </div>
          </div>
          {
            queryResult && queryResult.serviceStatus == 2 ?
              <div className='order_list'>待服务</div> : <div className='order_list'>已完成</div>
          }
          <div style={{ padding: '10px 0', borderBottom: '1px solid #f2f2f2', lineHeight: '30px' }}>
            <div>订单信息</div>
            <div style={{ display: 'flex' }}>
              <div style={{ marginRight: '10px' }}>订单编号</div>
              <div style={{ display: 'flex' }}>
                <div>{queryResult && queryResult.orderNo}</div>
                <CopyToClipboard text={queryResult && queryResult.orderNo}
                  onCopy={this.copyLink}>
                  <div style={{ color: '#FF2B64', marginLeft: '10px' }}>
                    复制
                  </div>
                </CopyToClipboard>
              </div>
            </div>
            <div style={{ display: 'flex' }}>
              <div style={{ marginRight: '10px' }}>下单时间</div>
              <div>{queryResult && queryResult.createTime}</div>
            </div>
          </div>
          {
            queryResult && queryResult.serviceStatus == 2 ? 
            <div className='btn' onClick={this.confirmService}>确认服务</div> 
            : 
            <div className='btn' style={{ color: '#fff' ,background:'#999999'}}>已服务</div>
          }

        </div>
      </ActivityPage >
    );
  }
}


