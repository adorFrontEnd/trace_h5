import React, { Component } from "react";
import './index.less';

export default class Page extends Component {

  render() {
    return <div>
      {
        this.props.isShowMemberCenter ?
          <div>
            <div className='itemList'>
              <div className='head'>
                {
                  this.props.attentionInfo && this.props.attentionInfo.avatar ?
                    <img src={this.props.attentionInfo && this.props.attentionInfo.avatar} style={{ height: '100%', width: '100%', borderRadius: '50%' }} alt=''></img> :
                    <img src='/image/avatar.jfif' style={{ height: '100%', width: '100%', borderRadius: '50%' }} alt=''></img>
                }
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', width: '85%' }}>
                <div style={{ fontWeight: 'bold' }}>{this.props.attentionInfo && this.props.attentionInfo.nickname || '--'}</div>
                {
                  this.props.bindphoneNumberIntegral > 0 ?
                    <div className='itemList' style={{ justifyContent: 'space-between' }} onClick={this.props._integralbindPhone}>
                      <div>绑定手机号获得积分+{this.props.bindphoneNumberIntegral}</div>
                      <img src='/image/detail.png' style={{ width: '15px', height: '15px' }} alt='' />
                    </div> : null
                }
              </div>
            </div>
            <div className='itemList'>
              <div style={{ height: '35px', width: '35px', background: 'ccc', marginRight: '10px' }}>
                <img src='/image/total.png' style={{ height: '100%', width: '100%' }} alt=''></img>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', width: '90%' }}>
                <div >可用积分</div>
                <div >{this.props.menberCenterIntegral}</div>
              </div>
            </div>
            <div className='itemList' style={{ width: '100%', padding: '0',overflowY:'scroll',height:'59vh' }} >

              <div style={{ display: 'flex', flexWrap: 'wrap',width:'100%' }}>

                {
                  this.props.activityList && this.props.activityList.map((item, index) => {
                    return (

                      <div className='item' onClick={() => this.props.goTurntable(item)} key={index}>
                        {
                          item.name == '订购' ?
                            <img src='/image/order.png' style={{ height: '35px', width: '35px', marginBottom: '20px' }} alt=''></img> : null
                        }
                        {
                          item.name == '奖品' ?
                            <img src='/image/prize.png' style={{ height: '35px', width: '35px', marginBottom: '20px' }} alt=''></img> : null
                        }
                        {
                          item.name != '奖品' && item.name != '订购' ? <img src={item.logoUrl} style={{ height: '35px', width: '35px', marginBottom: '20px' }} alt=''></img> : null
                        }

                        <div>{item.name}</div>
                      </div>


                    )
                  })
                }

              </div>
            </div>

          </div>
          :
          null
      }

    </div>
  }
}
