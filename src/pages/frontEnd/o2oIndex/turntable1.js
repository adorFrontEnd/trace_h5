import React, { Component } from 'react';
import './index.less';
import { Carousel } from "antd";
import ActivityPage from '../../../components/common-page/ActivityPage';
import Toast from '../../../utils/toast';
import { parseUrl, getReactRouterParams } from '../../../utils/urlUtils';
import { lottery } from '../../../api/frontEnd/o2oIndex';
import { getCacheWxUserInfo } from '../../../middleware/localStorage/wxUser';
import { getTurntablePageInitData, setTurntablePageInitData } from '../../../middleware/localStorage/o2oIndex';
import { prizeCarousel } from '../../../api/frontEnd/o2oIndex';
const _title = "大转盘";
const _description = "";
class Page extends Component {
  constructor(props) {
    super(props);
    this.state = {
      awards: null,//大转盘的奖品列表
      animation: true,
      fileRootPath: "",//"http://co.dev.touty.io"
      startRadian: -90 * Math.PI / 180,//大转盘的开始弧度(canvas绘制圆从水平方向开始，所以这里调整为垂直方向) 弧度计算公式：角度*Math.PI/180
      canBeClick: true,//判断抽奖有没有结束
      canvas: '',
      content: '',
      currentPrizeIndex: null,
      isShowPrize: false,
      // 轮播
      carouselImage: null,
      // 初始化数据
      pageInitData: null,
      integral: null,
      restrict: null,
      // 中奖详情
      lotteryDetail: null,
      prizeId: null,
      token: null,
      status: null,
      prizesList: null,
      activityId: null,
      o2oList: null,
      o2oPrize: null,
      type: null
    }
  }
  componentDidMount() {
    let urlParams = parseUrl(this.props.location.search);
    if (!urlParams || !urlParams.args) {
      Toast('参数获取失败');
      return;
    }
    let wxUserInfo = getCacheWxUserInfo();
    if (!wxUserInfo || !wxUserInfo.token) {
      return;
    }
    let token = wxUserInfo.token;
    let { activityId } = urlParams.args;
    // 获取缓存初始化页面数据
    let pageInitData = getTurntablePageInitData();
    let result = window.localStorage.getItem('o2oList');
    let o2oList = JSON.parse(result).slice(0, 4);
    this.getPrizeCarousel(activityId, token);
    let prizesList = pageInitData.prizes.filter(v => v.id != 'id');
    let awards = pageInitData.prizes
    this.onLoadPage(awards);
    this.setState({
      pageInitData, o2oList,
      integral: pageInitData.integral,
      awards,
      token,
      prizesList,
      restrict: pageInitData.restrict,
      activityId
    })
  }

  // 获取轮播数据
  getPrizeCarousel = (activityId, token) => {
    prizeCarousel({ activityId, token })
      .then(data => {
        this.setState({ carouselImage: data });
      })
  }

  onLoadPage(awards) {
    let { startRadian } = this.state;
    let canvas = document.getElementById("wheelcanvas");
    // 获取canvas的上下文,context含有各种api用来操作canvas
    let context = canvas.getContext('2d');
    this.setState({ canvas: canvas, context: context });
    context.save();
    // 新建一个路径,画笔的位置回到默认的坐标(0,0)的位置
    // 保证了当前的绘制不会影响到之前的绘制
    context.beginPath();
    // 设置填充转盘用的颜色,fill是填充而不是绘制
    context.fillStyle = '#fff';
    // 绘制一个圆,有六个参数,分别表示:圆心的x坐标,圆心的y坐标,圆的半径,开始绘制的角度,结束的角度,绘制方向(false表示顺时针)
    context.arc(211, 211, 211, startRadian, Math.PI * 2 + startRadian, false);
    // 将设置的颜色填充到圆中,这里不用closePath是因为closePath对fill无效.
    context.fill();
    // 将画布的状态恢复到上一次save()时的状态
    context.restore();
    // 第一个奖品色块开始绘制时开始的弧度及结束的弧度
    let RadianGap = Math.PI * 2 / awards.length, endRadian = startRadian + RadianGap;
    for (let i = 0; i < awards.length; i++) {
      context.save();
      context.beginPath();
      // 为了区分不同的色块,使用随机生成的颜色作为色块的填充色
      context.fillStyle = awards[i].color;
      // 这里需要使用moveTo方法将初始位置定位在圆点处,这样绘制的圆弧都会以圆点作为闭合点
      context.moveTo(211, 211);
      // 画圆弧时,每次都会自动调用moveTo,将画笔移动到圆弧的起点,半径设置的比转盘稍小一点
      context.arc(211, 211, 201, startRadian, endRadian, false);
      context.fill();
      context.restore();
      // 开始绘制文字
      context.save();
      //设置文字颜色
      context.fillStyle = '#f00';
      //设置文字样式
      context.font = "18px Arial";
      // 改变canvas原点的位置,简单来说,translate到哪个坐标点,那么那个坐标点就将变为坐标(0, 0)
      context.translate(
        211 + Math.cos(startRadian + RadianGap / 2) * 201,
        211 + Math.sin(startRadian + RadianGap / 2) * 201
      );
      // 旋转角度,这个旋转是相对于原点进行旋转的.
      context.rotate(startRadian + RadianGap / 2 + Math.PI / 2);
      // 这里就是根据获取的各行的文字进行绘制,maxLineWidth取70,相当与一行最多展示5个文字
      this.getLineTextList(context, awards[i].prizeLevel, 70).forEach((line, index) => {
        // 绘制文字的方法,三个参数分别带:要绘制的文字,开始绘制的x坐标,开始绘制的y坐标
        context.fillText(line, -context.measureText(line).width / 2, ++index * 25);
      });
      context.restore();
      // 每个奖品色块绘制完后,下个奖品的弧度会递增
      startRadian += RadianGap;
      endRadian += RadianGap;
    }
    //下面是画中间的小圆
    context.save();
    // 新建一个路径,画笔的位置回到默认的坐标(0,0)的位置
    // 保证了当前的绘制不会影响到之前的绘制
    context.beginPath();
    // 设置填充转盘用的颜色,fill是填充而不是绘制
    context.fillStyle = '#fff';
    // 绘制一个圆,有六个参数,分别表示:圆心的x坐标,圆心的y坐标,圆的半径,开始绘制的角度,结束的角度,绘制方向(false表示顺时针)
    context.arc(211, 211, 70, startRadian, Math.PI * 2 + startRadian, false);
    // 将设置的颜色填充到圆中,这里不用closePath是因为closePath对fill无效.
    context.fill();
    // 将画布的状态恢复到上一次save()时的状态
    context.restore();
  }

  //绘制文字，文字过长进行换行，防止文字溢出
  getLineTextList(context, text, maxLineWidth) {
    let wordList = text.split(''), tempLine = '', lineList = [];
    for (let i = 0; i < wordList.length; i++) {
      if (context.measureText(tempLine).width >= maxLineWidth) {
        lineList.push(tempLine);
        maxLineWidth -= context.measureText(text[0]).width;
        tempLine = '';
      }
      tempLine += wordList[i];
    }
    lineList.push(tempLine);
    return lineList;
  }


  //点击抽奖让转盘转起来
  draw(e) {
    let { canvas, context, pageInitData, integral, token, activityId } = this.state;
    // 只要抽奖没有结束，就不让再次抽奖
    if (!this.state.canBeClick) {
      return;
    }
    // this.rotatePanel(100);
    this.state.canBeClick = false;
    this.getLottery()
      .then(data => {
        if (data.status == 3) {
          Toast('很遗憾,你的抽奖次数不足');
          this.state.canBeClick = true;
          return;
        }
        if (data.status == 4) {
          Toast('积分不足，无法参与抽奖');
          this.state.canBeClick = true;
          return;
        }
        pageInitData.restrict = data.restrict;
        pageInitData.integral = data.integral;
        setTurntablePageInitData(pageInitData);
        this.setState({ integral: data.integral, restrict: data.restrict });
        // 每次点击抽奖，都将初始化角度重置
        this.state.startRadian = 0;
        const distance = this.distanceToStop(pageInitData, data);
        this.rotatePanel(distance);
        this.getPrizeCarousel(activityId, token);
      })
      .catch(res => {
        pageInitData.restrict = res.restrict;
        pageInitData.integral = res.integral;
        setTurntablePageInitData(pageInitData);
        this.setState({ integral: res.integral, restrict: res.restrict });
        // 每次点击抽奖，都将初始化角度重置
        this.state.startRadian = 0;
        const distance = this.distanceToStop(pageInitData, res);
        this.rotatePanel(distance);
      })

  }

  // 处理旋转的关键方法
  rotatePanel(distance) {
    let { lotteryDetail } = this.state;
    // 这里用一个很简单的缓动函数来计算每次绘制需要改变的角度，这样可以达到一个转盘从块到慢的渐变的过程
    let changeRadian = (distance - this.state.startRadian) / 20;
    this.state.startRadian += changeRadian;
    // 当最后的目标距离与startRadian之间的差距低于0.0001时，就默认奖品抽完了，可以继续抽下一个了。
    if (distance - this.state.startRadian <= 0.001) {
      this.state.canBeClick = true;
      if (this.state.status == 1) {
        this.setState({ isShowPrize: true });
        console.log(this.state.type)
      }
      if (this.state.status == 2) {
        Toast('很遗憾,未抽中');
      }
      return;
    };

    // 初始角度改变后，需要重新绘制
    this.onLoadPage(this.state.awards);
    // 循环调用rotatePanel函数，使得转盘的绘制连续，造成旋转的视觉效果
    window.requestAnimationFrame(this.rotatePanel.bind(this, distance));
  }

  distanceToStop(pageInitData, lotteryData) {
    // middleDegrees为奖品块的中间角度（最终停留都是以中间角度进行计算的）距离初始的startRadian的距离，distance就是当前奖品跑到指针位置要转动的距离。
    let middleDegrees = 0, distance = 0;
    // 映射出每个奖品的middleDegrees
    let awardsToDegreesList = this.state.awards.map((item, index) => {
      let awardRadian = (Math.PI * 2) / this.state.awards.length;
      return awardRadian * index + (awardRadian * (index + 1) - awardRadian * index) / 2;
    });
    // 生成一个索引值，来表示此次抽奖应该中的奖品
    let prizes = pageInitData.prizes;
    let currentPrizeIndex = (prizes || []).findIndex((item) => item.id === lotteryData.prizeId);
    this.setState({ currentPrizeIndex });
    middleDegrees = awardsToDegreesList[currentPrizeIndex];
    // 因为指针是垂直向上的，相当坐标系的Math.PI/2,所以这里要进行判断来移动角度
    distance = Math.PI * 3 / 2 - middleDegrees;
    distance = distance > 0 ? distance : Math.PI * 2 + distance;
    // 这里额外加上后面的值，是为了让转盘多转动几圈，看上去更像是在抽奖
    return distance + Math.PI * 10;
  }
  closeModal = () => {
    this.setState({ isShowPrize: false });
  }
  getLottery = () => {
    let { token, integral, restrict, activityId } = this.state;
    let tencentLat = window.localStorage.getItem('tencentLat');
    let tencentLng = window.localStorage.getItem('tencentLng');
    let latLng = `${tencentLng},${tencentLat}`;
    let lotteryDetail = null;
    return new Promise((resolve, reject) => {
      lottery({ token, latLng, activityId })
        .then(data => {
          lotteryDetail = data.data;
          this.setState({ lotteryDetail, status: lotteryDetail.status, prizeId: lotteryDetail.id, type: lotteryDetail.type });
          resolve(lotteryDetail);
        })
        .catch(res => {
          // if (res == 'trace.0024') {
          this.state.canBeClick = true;
          lotteryDetail = { integral: 68, message: "很遗憾,未抽中", prizeId: "id", restrict: 84, status: "2" };
          lotteryDetail.integral = integral;
          lotteryDetail.restrict = restrict;
          this.setState({ lotteryDetail, status: lotteryDetail.status, prizeId: lotteryDetail.id });
          reject(lotteryDetail);
          // }
        })
    });
  }

  // *******************************跳转**************************************
  // 奖品
  goPrize = () => {
    let pathParams = getReactRouterParams('/frontEnd/prize');
    this.props.history.push(pathParams);
  }
  goPrizeInfo = () => {
    let pathParams = getReactRouterParams('/frontEnd/prizeInfo', { id: this.state.prizeId });
    this.props.history.push(pathParams);
  }
    // 订购
    goOrder = () => {
      let params = {}
      params.activeType = 0
      let pathParams = getReactRouterParams('/frontEnd/order', params);
      this.props.history.push(pathParams);
    }
    // 详情
  goDetail = (item) => {
    let parmas = {};
    parmas.id = item.id
    window.localStorage.setItem('name', item.name);
    let pathParams = getReactRouterParams('/frontEnd/o2oDetail', parmas);
    this.props.history.push(pathParams);
  }
  //UI渲染
  render() {
    const { goodsDetail, carouselImage, maxHeight, prizesList, restrict } = this.state;
    return (
      <ActivityPage title={_title} description={_description} >
        {
          carouselImage && carouselImage.length ?
            <div style={{ height: '40px', background: '#FF2B64' }}>
              <Carousel autoplay style={{ height: '40px' }} dots='false'>
                {
                  carouselImage && carouselImage.map((item, index) => {
                    return (
                      <div key={index} >
                        <div style={{ display: 'flex' }} >
                          <img src='/image/massage.png' style={{ width: '25px', height: '25px', marginLeft: '20%', marginTop: '8px' }} alt='' />
                          <div style={{ width: '50%', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}> {item}</div>
                        </div>
                      </div>
                    )
                  })
                }
              </Carousel>
            </div> : null
        }

        <div style={{ padding: '10px', color: '#000' }}>
          <div style={{ display: 'flex' }}>
            <div style={{ marginRight: '30px' }}>剩余积分：{this.state.integral}</div>
            <div>剩余次数：{restrict}</div>
          </div>
          <div>每次抽奖消耗{this.state.pageInitData && this.state.pageInitData.consumptionPoints}积分</div>
          <div style={{ textAlign: 'center' }}>
            <div className='turntable'>
              <img src="http://adorsmart.oss-cn-shanghai.aliyuncs.com/Game/BigTurnTable/back.png" style={{ width: '350px', height: '350px', position: 'absolute', top: '-40px', left: '-41px' }} alt='' />
              <canvas id="wheelcanvas" height={422} width={422} style={{ position: 'absolute', top: '3%', right: '3%', width: '253px' }} />
              <img onClick={this.draw.bind(this)} src="http://adorsmart.oss-cn-shanghai.aliyuncs.com/Game/BigTurnTable/point.png" style={{ position: 'absolute', left: '31%', top: '26.5%', width: '103px', height: '104px' }} alt='' />
            </div>
          </div>
          <table className="gridtable">
            {
              prizesList && prizesList.map((item, index) => {
                return (
                  <tbody key={index}>
                    <tr >
                      <td style={{ width: '60px' }}>{item.prizeLevel}</td>
                      <td>{item.prizeName}</td>
                      <td>{item.prizeNumber}名</td>
                    </tr>
                  </tbody>
                )
              })
            }
          </table>
          <div style={{ margin: '20px 0' }}>
            <span dangerouslySetInnerHTML={{ __html: this.state.pageInitData && this.state.pageInitData.description }}></span>
          </div>
          {
            this.state.o2oList && this.state.o2oList.length ?
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', }}>

                {
                  this.state.o2oList && this.state.o2oList.map((item, index) => {
                    return (
                      <div className='list_item' key={index} onClick={() => this.goDetail(item)}>
                        <div style={{ height: '150px', background: 'red', borderRadius: '5px 5px 0 0' }}>
                          <img src={item.image} style={{ width: '100%', height: '100%', objectFit: 'cover',borderRadius: '5px 5px 0 0' }} alt='' />
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

              </div> : <div style={{ width: '100%', height: '60vh', background: '#ccc' }}>广告</div>
          }
        </div>
        {
          this.state.isShowPrize ?
            <div>
              <div className='box'>
                {this.state.type == 1 ?
                  <div className='integral' style={{ borderRadius: '10px' }}>
                    {
                      !this.state.isIntegralBind ? <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 10px 0 10px' }}>
                        <div style={{ lineHeight: '40px' }}></div>
                        <img src='/image/close.png' className='closeimg' onClick={this.closeModal} alt='' />
                      </div>
                        : null
                    }
                    <div style={{ height: '70vh', textAlign: 'center' }}>
                      <div style={{ textAlign: 'center' }}>{this.state.lotteryDetail && this.state.lotteryDetail.message}等奖</div>
                      <div style={{ height: '190px', width: '160px', margin: '10px auto' }}>
                        <img src={this.state.lotteryDetail && this.state.lotteryDetail.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt='' />
                      </div>
                      <div style={{ width: '50%', whiteSpace: 'pre-wrap', margin: '0 auto' }}>{this.state.lotteryDetail && this.state.lotteryDetail.name}</div>
                      <div style={{ margin: '10px 0' }} onClick={this.goPrize}>我的-奖品 页面查看中奖纪录</div>
                      <div style={{ margin: '60px 10px 0 10px', background: '#FF2B64', height: '40px', lineHeight: '40px', color: '#fff', borderRadius: '5px', textAlign: 'center' }} onClick={this.goPrizeInfo}>填写物流信息完成兑奖</div>
                    </div>
                  </div> :
                  <div className='integral' style={{ borderRadius: '10px' }}>
                    {
                      !this.state.isIntegralBind ? <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 10px 0 10px' }}>
                        <div style={{ lineHeight: '40px' }}></div>
                        <img src='/image/close.png' className='closeimg' onClick={this.closeModal} alt='' />
                      </div>
                        : null
                    }
                    <div style={{ height: '70vh', textAlign: 'center' }}>
                      <div style={{ textAlign: 'center' }}>{this.state.lotteryDetail && this.state.lotteryDetail.message}等奖</div>
                      <div style={{ height: '190px', width: '160px', margin: '10px auto' }}>
                        <img src={this.state.lotteryDetail && this.state.lotteryDetail.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt='' />
                      </div>
                      <div style={{ width: '50%', whiteSpace: 'pre-wrap', margin: '0 auto' }}>{this.state.lotteryDetail && this.state.lotteryDetail.name}</div>
                      <div style={{ margin: '10px 0' }} onClick={this.goPrize}>我的-订购 页面查看中奖纪录</div>
                      <div style={{ margin: '60px 10px 0 10px', background: '#FF2B64', height: '40px', lineHeight: '40px', color: '#fff', borderRadius: '5px', textAlign: 'center' }} onClick={this.goOrder}>确认</div>
                    </div>
                  </div>

                }
              </div>
            </div>
            :
            null
        }
      </ActivityPage >
    );
  }
}
export default Page;

