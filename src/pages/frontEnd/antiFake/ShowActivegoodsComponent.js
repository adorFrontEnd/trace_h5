import React, { Component } from "react";
import { CopyToClipboard } from 'react-copy-to-clipboard';
import './index.less';

export default class Page extends Component {

  render() {
    return <div>
       {
            this.props.isShowActivegoods ?
              <div className='box'>
                <div className='prize'>
                  <div>
                    {
                      this.props.isShowGoods ?
                        <div>
                          {this.props.isShowGoods ?
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 10px 0 10px' }}>
                              <div style={{ fontWeight: 'bold' }}>选择可兑换的商品</div>
                              <img src='/image/close.png' className='closeimg' onClick={this.props.clickCloseModal} alt='' />
                            </div>
                            :
                            null
                          }
                          <div style={{ overflowY: 'auto', padding: '10px', height: '30vh' }}>
                            {this.props.productDtoList && this.props.productDtoList.length ?
                              this.props.productDtoList.map((item, index) => {
                                return (
                                  <div className='goodlist' onClick={() => this.props.getGoosDetail(item, this.props.dealerVoList)} key={index}>
                                    <div style={{ display: 'flex' }}>
                                      <img src={item.image} style={{ width: '53px', height: '53px', background: '#ccc', marginRight: '10px' }} alt='' />
                                      <div>
                                        <div style={{ fontWeight: 'bold' }}>{item.name}</div>
                                        <div style={{ marginTop: '10px' }}>编号：{item.barCode}</div>
                                      </div>
                                    </div>
                                    {
                                      item.type == 1 ? <div style={{ color: '#A1A1A1' }}>已兑完</div> : <div style={{ color: '#33AAF9' }}>可兑换</div>
                                    }
                                  </div>
                                )
                              })
                              :
                              null
                            }

                          </div>
                        </div>
                        :
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 10px 0 10px' }}>
                            <div></div>
                            <img src='/image/close.png' className='closeimg' onClick={this.props.clickCloseModal} alt='' />
                          </div>
                          <div className='qrcode'>
                            <img src={this.props.qrCode} style={{ width: '100%', height: '100%' }} ref="qrCode" />
                          </div>
                          <div style={{ display: 'flex' }}>
                            <div style={{ width: '100%', background: '#fff', padding: '10px 70px' }}>
                              <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <div style={{ width: '80%', display: 'inline-block', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{this.props.editGoods && this.props.editGoods.name}</div>

                                  <div style={{ color: '#33AAF9' }} onClick={this.props.clickEdit}>修改</div>
                                </div>
                                <div style={{ marginTop: '10px' }}>No.{this.props.editGoods && this.props.editGoods.barCode}</div>
                              </div>
                            </div>

                          </div>

                        </div>
                    }
                  </div>
                  <div style={{ width: "100%", height: "36px" }} className='flex-between'>
                    <div className='circle' style={{ left: '-17px' }} ></div>
                    < img src='/image/line.png' style={{ heigth: '3px', width: '100%' }} alt='' />
                    <div className='circle' style={{ right: '-17px' }}></div>
                  </div>

                  <div className='line' style={{ paddingTop: '0' }}>
                    <div style={{ padding: '0px 30px', paddingBottom: '10px' }} >
                      <div>关闭后可到会员中心-兑奖券查看</div>
                      <div>兑奖券失效时间：{this.props.endActivityTime}</div>
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
                  </div>
                </div>
              </div>
              :
              null
          }
    </div>
  }
}
