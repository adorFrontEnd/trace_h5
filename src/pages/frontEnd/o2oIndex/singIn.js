import React, { Component } from 'react';
import './index.less';
import { Cascader } from "antd";
import ActivityPage from '../../../components/common-page/ActivityPage';
import Toast from '../../../utils/toast';
import { parseUrl, joinParam, getReactRouterParams } from '../../../utils/urlUtils';
import { signIn, comfirmSinIn } from '../../../api/frontEnd/o2oIndex';
import { getCacheWxUserInfo } from '../../../middleware/localStorage/wxUser';

const _title = "签到";
const _description = "";

class Page extends Component {
  state = {
    token: null,
    singInList: null,
    buttonMessage: null,
    type: null,
    o2oList: null
  }

  componentDidMount() {
    let wxUserInfo = getCacheWxUserInfo();
    let result = window.localStorage.getItem('o2oList');
    let o2oList = JSON.parse(result).slice(0,4);
    if (!wxUserInfo || !wxUserInfo.token) {
      return;
    }
    let token = wxUserInfo.token;
    this.setState({ token, o2oList })
    this.getsignInData(token)
  }
  // 获取签到数据
  getsignInData = (token) => {
    signIn({ token })
      .then(data => {
        let buttonMessage = data.buttonMessage;
        let type = data.type
        this.setState({ singInList: data, buttonMessage, type })
      })
  }
  // 点击确认签到
  clickComfirmSinIn = () => {
    let { token } = this.state
    comfirmSinIn({ token })
      .then(data => {
        this.getsignInData(token)
        console.log(data)
      })
  }
  //UI渲染
  render() {
    return (
      <ActivityPage title={_title} description={_description} >
        <div style={{ background: '#f2f2f2', minHeight: '100vh', padding: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            {
              this.state.singInList && this.state.singInList.list.map((item, index) => {
                return (
                  <div className={item.type == 1 ? 'singInList' : 'singInListing'} key={index}>
                    <div style={{ margin: '30px 0 10px 0' }}>{item.name}</div>
                    <div>{item.integral}</div>
                  </div>
                )
              })
            }

          </div>
          {
            this.state.type ? <div className='singIn'>已签到</div>
              :
              <div className='comfirmSingIn' onClick={this.clickComfirmSinIn}>{this.state.buttonMessage}</div>
          }

         {
           this.state.o2oList&&this.state.o2oList.length?
           <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', }}>

           {
             this.state.o2oList && this.state.o2oList.map((item, index) => {
               return (
                 <div className='list_item' key={index} onClick={() => this.goDetail(item)}>
                   <div style={{ height: '150px', background: 'red', borderRadius: '5px 5px 0 0' }}>
                     <img src={item.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt='' />
                   </div>
                   <div style={{ padding: '10px' }}>
                     <div>{item.name}</div>
                     <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                       <div style={{ color: '#FF0000' }}>{item.price}元</div>
                       <div>已售{item.sold + item.salesBase}件</div>
                     </div>
                   </div>
                 </div>
               )
             })
           }

         </div>:<div style={{width:'100%',height:'60vh',background:'#ccc'}}>广告</div>
         }
        </div>
      </ActivityPage >
    );
  }
}
export default Page


