import React, { Component } from 'react';
import '../../frontEnd/trace/index.less';
import { Modal } from 'antd';
import InputGroup from 'react-input-groups';
import { securityDecoration, sendMessages, bindPhoneNumber } from '../../../api/frontEnd/trace';
import Inputarea from '../../../components/verifycation/verifycation';
import Toast from '../../../utils/toast';
import {
  isWxUserLogin, wxUserLogout, setCacheWxUserInfo, getCacheWxUserInfo, setCacheUserPhone,
  getCacheUserPhone
} from '../../../middleware/localStorage/wxUser';
import { parseUrl, joinParam } from '../../../utils/urlUtils';
import { MobilePDFReader } from 'react-read-pdf';
// const pdfurl = require('../../../assets/image/doc.pdf') 
export default class Report extends Component {
  state = {
   pdfurl:''
  }
  componentDidMount() {
       // 页面初始化
       let urlParams = parseUrl(this.props.location.search);
       if (!urlParams || !urlParams.args) {
         Toast('参数获取失败')
         return;
       }
       let {url}=urlParams.args;
       this.setState({
        pdfurl:url
       })

  }
clickChange=()=>{
  this.setState({
    isShow:true
  })
}
  //UI渲染
  render() {

    return (

      <div >
   
       <MobilePDFReader url={this.state.pdfurl} isShowFooter='false'/>
      
        
      </div>
    );
  }
}


