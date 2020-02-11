import React, { Component } from 'react';
import './index.less';
import {  Cascader  } from "antd";
import ActivityPage from '../../../components/common-page/ActivityPage';
import Toast from '../../../utils/toast';
import { parseUrl, joinParam, getReactRouterParams } from '../../../utils/urlUtils';
import { prizeInformation, submitShippingInformation, getShipArea } from '../../../api/frontEnd/o2oIndex';
import { getCacheWxUserInfo } from '../../../middleware/localStorage/wxUser';

const _title = "签到";
const _description = "";

 class Page extends Component {
  state = {
  
  }

  componentDidMount() {
  
  }


  //UI渲染
  render() {
    return (
      <ActivityPage title={_title} description={_description} >
        <div style={{ background: '#f2f2f2', minHeight: '100vh', padding: '10px' }}>
          <div className='comfirmSingIn'>确认签到</div>
          <div className='singIn'>已签到</div>
        </div>
      </ActivityPage >
    );
  }
}
export default Page


