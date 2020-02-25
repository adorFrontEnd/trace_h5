import React, { Component } from 'react'
import DeomItem from './testchirdren' // 引入子组件
import { lottery, eventPage } from '../../../api/frontEnd/o2oIndex';
import { parseUrl, getReactRouterParams } from '../../../utils/urlUtils';
import { getTurntablePageInitData, setTurntablePageInitData } from '../../../middleware/localStorage/o2oIndex';
import { getCacheWxUserInfo } from '../../../middleware/localStorage/wxUser';
import Toast from '../../../utils/toast';
import './index.less';
export default class demo extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // 九宫格内容list
            list: [],
            // 被选中的格子的ID
            activedId: '',
            // 中奖ID
            prizeIdIndex: null,
            // 获得prizeId之后计算出的动画次数
            times: 0,
            // 当前动画次数
            actTimes: 0,
            // 是否正在抽奖
            isRolling: false,
            token: 'kcuFhL8NStlOPtyCmEAQKRGHJ7gHWjCZX0gG1zYSCuSll4hKskZg7kAwEFUonOGs',
            integral: null,
            restrict: null,
            activityId: null,
            prizeId: null,
            lotteryDetail: null,
            status: null,
            isShowPrize: false,
            o2oList: null,
            isShow: false
        }
    }
    componentWillMount() {
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
        let pageInitData = getTurntablePageInitData();
        let result = window.localStorage.getItem('o2oList');
        let o2oList = JSON.parse(result).slice(0, 4);
        let list = pageInitData.prizes;
        let arr = []
        if (list && list.length < 8) {
            for (let i = 0; i < list.length; i++) {
                
                let a = { id: "id", prizeLevel: "谢谢参与", prizeName: "谢谢参与", color: "#FFEF7B", orders: 4,prizeImage:'http://images.669pic.com/element_pic/23/50/19/62/01984930591c480507111f2918aed000.jpg%21w700wb' }
                arr.push(list[i])
                arr.push(a);
            }
        }
        this.setState({
            list: this._formatList(arr),
            integral: pageInitData.integral,
            token,
            restrict: pageInitData.restrict,
            activityId, o2oList
        })
    }
    // 格式化时间
    _formatList = (list) => {
        if (!list || !list.length) {
            return list;
        }
        list.forEach((item, index) => {
            item.prizeIndex = index;
        })
        return list;
    }
    handleBegin() {

        // this.state.isRolling为false的时候才能开始抽，不然会重复抽取，造成无法预知的后果
        if (!this.state.isRolling) {
            // 点击抽奖之后，我个人做法是将于九宫格有关的状态都还原默认
            this.setState({
                activedId: '',
                prizeIdIndex: null,
                times: 0,
                actTimes: 0,
                isRolling: true
            }, () => {
                // 状态还原之后才能开始真正的抽奖
                this.handlePlay()
            })
        }
    }
    handlePlay() {
        let { token, integral, restrict, activityId, list } = this.state;
        if (integral == 0) {
            Toast('积分不足，无法参与抽奖');
            this.setState({
                activedId: '',
                prizeIdIndex: null,
                times: 0,
                actTimes: 0,
                isRolling: false,
                isShowPrize: false
            })
            return;
        }
        if (restrict == 0) {
            this.setState({
                activedId: '',
                prizeIdIndex: null,
                times: 0,
                actTimes: 0,
                isRolling: false,
                isShowPrize: false
            })
            Toast('次数不足，无法参与抽奖');
            return;
        }
        let tencentLat = window.localStorage.getItem('tencentLat');
        let tencentLng = window.localStorage.getItem('tencentLng');
        let latLng = `${tencentLng},${tencentLat}`;
        let lotteryDetail = null;

        lottery({ token, activityId, latLng })
            .then(data => {
             if(data.status==4){
                Toast('积分不足，无法参与抽奖');
                this.setState({
                    activedId: '',
                    prizeIdIndex: null,
                    times: 0,
                    actTimes: 0,
                    isRolling: false,
                    isShowPrize: false
                })
                return;
             }
                lotteryDetail = data.data;
                this.startLottry(list, lotteryDetail);
                this.setState({
                    lotteryDetail,
                    status: lotteryDetail.status,
                    prizeId: lotteryDetail.id,
                    integral: lotteryDetail.integral, restrict: lotteryDetail.restrict
                });
            })
            .catch(res => {
                let lotteryDetail = { integral: 68, message: "很遗憾,未抽中", prizeId: "id", restrict: 84, status: "2" };
                lotteryDetail.integral = integral;
                lotteryDetail.restrict = restrict;
                this.startLottry(list, lotteryDetail);
            })
    }

    startLottry = (list, data) => {
        let prizeIdIndex = (list || []).findIndex((item) => item.id === data.prizeId);
        this.setState({
            prizeIdIndex,
            activedId: 0,
            prizeId: data.id
        })
        // 随机算出一个动画执行的最小次数，这里可以随机变更数值，按自己的需求来
        let times = this.state.list.length * Math.floor(Math.random() * 5 + 4)
        this.setState({
            times: times
        })
        // 抽奖正式开始
        this.begin = setInterval(() => {
            let num;
            if (this.state.activedId === prizeIdIndex && this.state.actTimes > this.state.times) {
                // 符合上述所有条件时才是中奖的时候，两个ID相同并且动画执行的次数大于(或等于也行)设定的最小次数
                clearInterval(this.begin)
                this.setState({
                    isRolling: false
                })
                if (this.state.status == 1) {
                    setTimeout(() => {
                        this.setState({ isShowPrize: true });
                    }, 1000)
                }
                if (this.state.status == 2) {
                    setTimeout(() => {
                        Toast('很遗憾,未抽中');
                    }, 1000)

                }
                return;
            }

            // 以下是动画执行时对id的判断
            if (this.state.activedId === '') {
                num = 0
                this.setState({
                    activedId: num
                })
            } else {
                num = this.state.activedId
                if (num === 11) {
                    num = 0
                    this.setState({
                        activedId: num
                    })
                } else {
                    num = num + 1
                    this.setState({
                        activedId: num
                    })
                }
            }
            this.setState({
                actTimes: this.state.actTimes + 1
            })

        }, 80)
    }
    closeModal = () => {
        this.setState({
            activedId: '',
            prizeIdIndex: null,
            times: 0,
            actTimes: 0,
            isRolling: false,
            isShowPrize: false
        })
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
    render() {
        const { list, activedId, prizeIdIndex } = this.state;
        return (
            <div style={{ background: '#ff4444', minHeight: '100vh', backgroundImage: `url('https://img.yzcdn.cn/public_files/2019/11/06/6ced8d17e8acc56d09464a17b85105c8.png')`, backgroundSize: '100% auto', backgroundRepeat: 'no-repeat' }}>
                <div style={{ padding: '10px' }}>

                    <div className='roulette-container l-scene__roulette'>
                        <div className="one">
                            <DeomItem content={list[0]} activedId={activedId} prizeIdIndex={prizeIdIndex}></DeomItem>
                            <DeomItem content={list[1]} activedId={activedId} prizeIdIndex={prizeIdIndex}></DeomItem>
                            <DeomItem content={list[2]} activedId={activedId} prizeIdIndex={prizeIdIndex}></DeomItem>
                        </div>
                        <div className="one">
                            <DeomItem content={list[7]} activedId={activedId} prizeIdIndex={prizeIdIndex}></DeomItem>
                            <DeomItem content={list[3]} activedId={activedId} prizeIdIndex={prizeIdIndex}></DeomItem>
                        </div>
                        <div className="one">
                            <DeomItem content={list[6]} activedId={activedId} prizeIdIndex={prizeIdIndex}></DeomItem>
                            <DeomItem content={list[5]} activedId={activedId} prizeIdIndex={prizeIdIndex}></DeomItem>
                            <DeomItem content={list[4]} activedId={activedId} prizeIdIndex={prizeIdIndex}></DeomItem>

                        </div>
                        <div className='l-lottery__btn' onClick={() => this.handleBegin()}>
                            <div className='c-btn__action'>立即抽奖</div>
                            <div className='c-btn__chance'>剩余{this.state.restrict}次机会</div>
                        </div>
                    </div>
                    <div style={{ margin: '0 0 10px 10px', color: '#fff', fontSize: '16px' }}>我的积分:{this.state.integral}</div>
                    {
                        this.state.o2oList && this.state.o2oList.length ?
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', padding: '10px' }}>

                                {
                                    this.state.o2oList && this.state.o2oList.map((item, index) => {
                                        return (
                                            <div className='list_item' key={index} onClick={() => this.goDetail(item)}>
                                                <div style={{ height: '150px', background: 'red', borderRadius: '5px 5px 0 0' }}>
                                                    <img src={item.image} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '5px 5px 0 0' }} alt='' />
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
                                {this.state.lotteryDetail.type == 1 ?
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
            </div>
        );
    }
}