import React, { Component } from "react";
import { CopyToClipboard } from 'react-copy-to-clipboard';
import InputGroup from 'react-input-groups';
import './index.less';
import BottomComponent from './BottomComponent';
export default class Page extends Component {

  render() {
    return <div>
      {
          this.props.inShowBindPhone ?
            <div className='box'>
              <div className='integral'>
                {
                  this.props.isShowNote ?
                    <div style={{ padding: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div style={{ fontWeight: 'bold' }}>填写短信验证码</div>
                        <img src='/image/close.png' className='closeimg' onClick={this.props.clickCloseBind} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div>短信已发送给{this.props.phone}</div>
                        <div style={{ color: '#339cff', marginRight: '20px' }} onClick={this.props.changePhone}>更换</div>
                      </div>
                      <div style={{ margin: '10px auto', fontSize: '16px' }}>
                          <input type="number" placeholder-style="color:#ccc" placeholder="请输入验证码" onChange={this.props.getVerifyValue}
                          value={this.props.code} className='phoneNum' style={{ background: '#f2f2f2' }} />

                        {/* <InputGroup
                          getValue={this.props.getValue}
                          length={4}
                          type={'box'}
                        /> */}
                      </div>
                      {
                        this.props.showVerifyCDTime ?
                          <div className='verifyBotton' >
                            {this.props.verifyCDTime}后重发
                  </div> :
                          <div style={{ background: '#339CFF' }} className='verifyBotton' onClick={this.props.againGetVerify}>
                            重新获取短信验证码
               </div>
                      }

                      <button className='getverifybutton' onClick={this.props.clickBindPhone}>验证绑定手机号</button>
                    </div>
                    :
                    <div style={{ padding: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div style={{ fontWeight: 'bold' }}>请先绑定手机号</div>
                        <img src='/image/close.png' className='closeimg' onClick={this.props.clickCloseBind} />
                      </div>
                      <div className='phone'>
                        <div style={{ borderRight: '1px solid #ccc', padding: '0 8px' }}>+86</div>
                        <input type="number" placeholder-style="color:#ccc" placeholder="请输入手机号码" onChange={this.props.handleGetInputValue}
                          value={this.props.phone} className='phoneNum' onFocus={this.props.getFocous} onBlur={this.props.loseFocous} />
                      </div>
                      <div className='phone'>
                        <div style={{ borderRight: '1px solid #ccc', padding: '0 8px' }}>验证</div>
                        <input placeholder-style="color:#ccc" placeholder="填写下图中的验证码" onChange={this.props.getImgeCode}
                          value={this.props.imgeCode} className='phoneNum' style={{ width: '68%' }} onFocus={this.props.getFocous} onBlur={this.props.loseFocous} />
                      </div>
                      {
                        this.props.phone && this.props.phone.length == 11 ?
                          <div className='imgVerify'>
                            <img
                              onClick={this.props.getImageVerifiCode}
                              ref='verifyImage'
                              src={this.props.verifyImage}
                              style={{ width: '100%' }}
                            />
                          </div> : null
                      }
                      <button className='getverifybutton' onClick={this.props.getVerifyCode}>获取短信验证码</button>
                    </div>
                }
                 {
                  this.props.isShowBottom ?
                    <div>
                      <div style={{ width: "100%", height: "36px" }} className='flex-between'>
                        <div className='circle' style={{ left: '-17px' }} ></div>
                        < img src='/image/line.png' style={{ heigth: '3px', width: '100%' }} />
                        <div className='circle' style={{ right: '-17px' }}></div>
                      </div>

                      <div className='line'>
                        {/* 积分 */}
                        {
                          this.props.status == 3 || (this.props.bindphoneNumberIntegral > 0) ?
                            <div style={{ width: '100%', paddingBottom: '10px' }} >
                              <div style={{ width: '40px', height: '50px', margin: '10px auto' }}>
                                <img src='/image/integral.png' style={{ width: '100%', height: '100%' }} />
                              </div>
                              <div style={{ textAlign: 'center' }}>完成绑定后获得积分+{this.props.integral || this.props.bindphoneNumberIntegral}</div>
                            </div>
                            : null
                        }
                        {/* 满赠商品 */}
                        {
                          this.props.status == 1 ?
                            <div style={{ padding: '0px 30px', paddingBottom: '10px' }}>
                              <div>关闭后可到会员中心-兑奖券查看</div>
                              <div>兑奖券失效时间:{this.props.endActivityTime}</div>
                              <div style={{ fontWeight: 'bold', marginTop: '10px' }}>附近兑奖店铺：</div>
                              {
                                this.props.dealerVoList && this.props.dealerVoList.length ?
                                  this.props.dealerVoList.map((item, index) => {
                                    return (
                                      <div className='shopList' key={index} >
                                        <div>
                                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <div>{item.dealerName}</div>
                                            <CopyToClipboard text={item.address}
                                              onCopy={this.props.copyLink}>
                                              <div style={{ color: '#33AAF9' }}>
                                                复制
                                      </div>
                                            </CopyToClipboard>
                                          </div>
                                          <a className='hide' onClick={() => this.props.clickGetDelerDetail(item)}>{item.address}</a>
                                        </div>

                                      </div>
                                    )
                                  })
                                  : <div className='map' style={{ padding: '62px', textAlign: 'center' }}>附近暂无门店</div>
                              }
                            </div>

                            : null
                        }

                      </div>
                    </div>

                    : null
                }
              </div>

            </div>
            : null
        }

    </div>
  }
}
