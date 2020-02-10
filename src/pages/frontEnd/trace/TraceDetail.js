
import React, { Component } from "react";
import { Link } from 'react-router-dom';
import ActivityPage from '../../../components/common-page/ActivityPage';
import Toast from '../../../utils/toast';
import { Modal } from 'antd';
import dateUtil from '../../../utils/dateUtil';
import { getDetailByUserId, getVersionFrn } from '../../../api/frontEnd/trace';
import './index.less';
const _title = "手机溯源";
const _description = "手机溯源";
class Page extends Component {
  state = {
    traceDetail: {},
    frnId: 4,
    backgroundImage: null,
    backgroundColor: null,
    status: ''
  }
  componentDidMount() {
    let traceDetail = this.props.location.state.traceDetail;
    let frnId = this.props.location.state.frnId;
    let status = this.props.location.state.status;
    this.setState({
      traceDetail,
      frnId,
      status
    })
    getDetailByUserId({
      frnId
    }).then((res) => {
      if (res) {
        if (res.background) {
          let backgroundImage = JSON.parse(res.background).image;
          let backgroundColor = "#" + JSON.parse(res.background).color;
          this.setState({
            backgroundImage,
            backgroundColor
          })
        }
      }
    })
  }
  
  render() {
    const { backgroundImage, backgroundColor } = this.state;
    return (
      <ActivityPage title={_title} description={_description}>
        <div style={{ backgroundImage: `url(${backgroundImage})`, padding: '50px 30px 30px 30px', minHeight: '100vh', background: backgroundColor, minHeight: '100vh', backgroundSize: '100%' }}>
          {/* <div className='goodsInfo' style={{ height: '172px' }}> */}
          <div className='goodsInfo'>
            <div style={{ fontSize: '16PX', fontWeight: 'bold' }}>商品信息</div>
            <div style={{ display: 'flex' }}>
              <div className='imgstyle'>
                <img src={this.state.traceDetail.details && this.state.traceDetail.details.image} className='imgstyle'></img>
              </div>
              <div className='hidden'>
                <div>商品名称:{this.state.traceDetail.details && this.state.traceDetail.details.name}</div>
                <div>公司名称:{this.state.traceDetail.details && this.state.traceDetail.details.companyName}</div>
                <div>生产商:{this.state.traceDetail.details && this.state.traceDetail.details.manufacturer}</div>
                <div>规格:{this.state.traceDetail.details && this.state.traceDetail.details.specification}</div>
                <div>生产日期:{this.state.traceDetail.details && dateUtil.getDate(this.state.traceDetail.details.createTime)}</div>
              </div>
            </div>
          </div>
          <div className='goodsInfo' >
            <div style={{ fontSize: '16PX', fontWeight: 'bold' }}>溯源信息</div>
            <div className='flex'>
              <div>价格信息</div>
              {
                this.state.status == 1 ?
                  <div style={{ color: '#0099FF', fontSize: '16PX', fontWeight: 'bold' }}>{this.state.traceDetail.details && this.state.traceDetail.priceInformation}</div>
                  : '--'
              }

            </div>
            {
              this.state.traceDetail.logistics ? <div className='flex'>
                <div>出厂物流</div>
                <div>{this.state.traceDetail.logistics}</div>
              </div>
                :
                null
            }

            {this.state.traceDetail && this.state.traceDetail.list ?
              <div>
                <div style={{ marginBottom: '25px' }}>经销商</div>
                {this.state.traceDetail.list.map((item, index) => {
                  return (
                    <div className={index !== this.state.traceDetail.list.length - 1 ? "dealerList" : "last-dealerList"} key={index}>
                      {
                        item.organizationName ?
                          <div><div style={{ fontSize: '14px', fontWeight: 'bold' }}>仓库：{item.organizationName}</div>
                            {
                              item.dealerName ?
                                <div style={{ fontSize: '14px' }}>To    {item.dealerName}</div>
                                : <div style={{ fontSize: '14px' }}>To    --</div>
                            }

                            {item.logistics ? <div style={{ fontSize: '12px' }}>物流：{item.logistics}</div> : null}
                            <div style={{ fontSize: '12px' }}>{dateUtil.getDateTime(item.createTime)}</div></div>
                          :
                          <div>

                            {
                              item.dealerName ?
                                <div style={{ fontSize: '14px', fontWeight: 'bold' }}>经销商：{item.dealerName}</div>
                                : <div style={{ fontSize: '14px', fontWeight: 'bold' }}>经销商：--</div>
                            }

                            {item.logistics ? <div style={{ fontSize: '12px' }}>单号：{item.logistics}</div> : null}
                            <div style={{ fontSize: '12px' }}>{dateUtil.getDateTime(item.createTime)}</div></div>
                      }

                      <div className='status'></div>
                    </div>
                  )
                })}

              </div> : null
            }

          </div>

        </div>


      </ActivityPage>

    )
  }
}
export default Page;