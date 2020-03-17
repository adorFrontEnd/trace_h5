import React, { Component } from "react";

import { wxLogin, getWxAuthRedirectUri } from '../../../api/wx/auth';
import ActivityPage from '../../../components/common-page/ActivityPage';
const _title = "微信授权";
const _description = "";
class Page extends Component {
  componentDidMount() {
    let uri = getWxAuthRedirectUri('http://h5.trace.adorsmart.com/code/product');
    window.location.href = uri;
  }

  /**渲染**********************************************************************************************************************************/

  render() {    
    return (
      <ActivityPage title={_title} description={_description} >

 
      </ActivityPage >
    )
  }
}

export default Page;