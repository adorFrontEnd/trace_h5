import React, { Component } from 'react'
import DeomItem from './testchirdren' // 引入子组件
import { lottery, eventPage } from '../../../api/frontEnd/o2oIndex';
import Toast from '../../../utils/toast';
import './index.less';
export default class demo extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // 九宫格内容list
            list: [
                { id: 1, name: '一等奖' },
                { id: 2, name: '谢谢参与' },
                { id: 3, name: '二等奖' },
                { id: 4, name: '1.1%财富券' },
                { id: 5, name: '电视' },
                { id: 6, name: '冰箱' },
                { id: 7, name: '洗衣机' },
                { id: 8, name: '手机' },
                { id: 9, name: '手机1' },
                { id: 10, name: '手机2' },
                { id: 11, name: '手机3' },
                { id: 12, name: '手机4' }
            ],
            // 被选中的格子的ID
            activedId: '',
            // 中奖ID
            prizeId: null,
            // 获得prizeId之后计算出的动画次数
            times: 0,
            // 当前动画次数
            actTimes: 0,
            // 是否正在抽奖
            isRolling: false,
            token: 'kcuFhL8NStlOPtyCmEAQKRGHJ7gHWjCZX0gG1zYSCuSll4hKskZg7kAwEFUonOGs'
        }
    }
    componentDidMount() {
        this.getTurntable()
    }
    getLottery = () => {
        let { token } = this.state
        lottery({ token })
            .then(data => {

            })

    }
    handleBegin() {

        // this.state.isRolling为false的时候才能开始抽，不然会重复抽取，造成无法预知的后果
        if (!this.state.isRolling) {
            // 点击抽奖之后，我个人做法是将于九宫格有关的状态都还原默认
            this.setState({
                activedId: '',
                prizeId: null,
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
        this.getLottery()
        // 中将id，可随机，可自己设定，我这里暂且定为4
        let prize = 11
        console.log(prize)
        this.setState({
            prizeId: prize,
            activedId: 0
        })
        // 随机算出一个动画执行的最小次数，这里可以随机变更数值，按自己的需求来
        let times = this.state.list.length * Math.floor(Math.random() * 5 + 4)
        this.setState({
            times: times
        })
        // 抽奖正式开始
        this.begin = setInterval(() => {
            let num;
            if (this.state.activedId === this.state.prizeId && this.state.actTimes > this.state.times) {
                // 符合上述所有条件时才是中奖的时候，两个ID相同并且动画执行的次数大于(或等于也行)设定的最小次数
                clearInterval(this.begin)
                this.setState({
                    isRolling: false
                })
                return
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

        }, 40)
    }


    //   获取奖品初始化数据
    getTurntable = () => {
        let { token } = this.state
        eventPage({ token })
            .then(data => {
                if (data.activity == 1) {
                    // let prizes = this.formatList(data.prizes);
                    // let pageInitData = data;
                    // pageInitData.prizes = prizes


                } else {
                    Toast('活动暂未开启，敬请期待')
                    return;
                }
            })
    }
    render() {
        const { list, activedId } = this.state;
        return (
            <div style={{ background: '#ff6700', height: '100vh', padding: '10px' }}>
                <div style={{ fontSize: '30px', color: '#fff', textAlign: 'center' }}>幸运大抽奖</div>
                <div className='roulette-container l-scene__roulette'>
                    
                    <div className="one">
                        <DeomItem content={list[0]} activedId={activedId}></DeomItem>
                        <DeomItem content={list[1]} activedId={activedId}></DeomItem>
                        <DeomItem content={list[2]} activedId={activedId}></DeomItem>
                        <DeomItem content={list[3]} activedId={activedId}></DeomItem>
                    </div>
                    <div className="one">
                        <DeomItem content={list[11]} activedId={activedId}></DeomItem>
                        <DeomItem content={list[4]} activedId={activedId}></DeomItem>
                    </div>
                    <div className="one">
                        <DeomItem content={list[10]} activedId={activedId}></DeomItem>
                        <DeomItem content={list[5]} activedId={activedId}></DeomItem>
                    </div>
                    <div className="one">
                        <DeomItem content={list[9]} activedId={activedId}></DeomItem>
                        <DeomItem content={list[8]} activedId={activedId}></DeomItem>
                        <DeomItem content={list[7]} activedId={activedId}></DeomItem>
                        <DeomItem content={list[6]} activedId={activedId}></DeomItem>
                    </div>
                    <div className='l-lottery__btn' onClick={() => this.handleBegin()}>
                        <div className='c-btn__action'>立即抽奖</div>
                        <div className='c-btn__chance'>剩余一次机会</div>
                    </div>
                </div>
                <div>我的积分</div>
            </div>
        );
    }
}