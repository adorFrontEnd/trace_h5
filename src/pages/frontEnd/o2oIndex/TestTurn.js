export default class TestTurn {
  constructor(options) {
    this.canvas = options.canvas;
    this.context = options.context;
    this.startRadian = 0;
    this.canBeClick = true;
    this.awards = [{id: "376533578684698624", prizeName: "Pouch婴儿推车", prizeLevel: "一等奖", prizeNumber: 10,color: "#7ed321"},
    {id: "376533578684698625", prizeName: "皮卡丘玩具", prizeLevel: "二等奖", prizeNumber: 30, color: "#f8e71c"},
    {id: "376533578684698626", prizeName: "泡脚鸡爪", prizeLevel: "三等奖", prizeNumber: 50, color: "#7ed321"},
    {id: "id", prizeLevel: "谢谢参与", color: "#FFEF7B", orders: 4}]
  }

  drawPanel() {
    const context = this.context;
    const startRadian = this.startRadian;
    context.save();
    context.beginPath();
    context.fillStyle = '#FD6961';
    // 根据我们设定的初始角度来绘制转盘
    context.arc(150, 150, 150, startRadian, Math.PI * 2 + startRadian, false);
    context.fill();
    context.restore();
  }

  // 整个思路就是将满足我们定义的宽度的文本作为value单独添加到数组中
  // 最后返回的数组的每一项就是我们处理后的每一行了.
  getLineTextList(context, text, maxLineWidth) {
    let wordList = text.split(''), tempLine = '', lineList = [];
    for (let i = 0; i < wordList.length; i++) {
      // measureText方法是测量文本的宽度的,这个宽度相当于我们设置的
      // fontSize的大小,所以基于这个,我们将maxLineWidth设置为当前字体大小的倍数
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
  drawPrizeBlock() {
    const context = this.context;
    const awards = this.awards;
    // 根据初始角度来绘制奖品块
    let startRadian = this.startRadian, RadianGap = Math.PI * 2 / 4, endRadian = startRadian + RadianGap;
    for (let i = 0; i < awards.length; i++) {
      context.save();
      context.beginPath();
      context.fillStyle = awards[i].color;
      context.moveTo(150, 150);
      context.arc(150, 150, 140, startRadian, endRadian, false);
      context.fill();
      context.restore();
      context.save();
      context.fillStyle = '#FFF';
      context.font = "14px Arial";
      context.translate(
        150 + Math.cos(startRadian + RadianGap / 2) * 140,
        150 + Math.sin(startRadian + RadianGap / 2) * 140
      )
      context.rotate(startRadian + RadianGap / 2 + Math.PI / 2);
      this.getLineTextList(context, awards[i].prizeLevel, 70).forEach((line, index) => {
        context.fillText(line, -context.measureText(line).width / 2, ++index * 25);
      })
      context.restore();
      startRadian += RadianGap;
      endRadian += RadianGap;
    }
  }
  drawButton() {
    const context = this.context;
    context.save();
    context.beginPath();
    context.fillStyle = '#FF0000';
    context.arc(150, 150, 30, 0, Math.PI * 2, false);
    context.fill();
    context.restore();
    context.save();
    context.beginPath();
    context.fillStyle = '#FFF';
    context.font = '20px Arial';
    context.translate(150, 150);
    context.fillText('开始', -context.measureText('Start').width / 2, 8);
    context.restore();
  }
  // 这个方法是为了将canvas再window中的坐标点转化为canvas中的坐标点
  windowToCanvas(canvas, e) {
    // getBoundingClientRect这个方法返回html元素的大小及其相对于视口的位置
    const canvasPostion = canvas.getBoundingClientRect(), x = e.clientX, y = e.clientY;
    return {
      x: x - canvasPostion.left,
      y: y - canvasPostion.top
    }
  };
  // 这个方法将作为真正的初始化方法
  startRotate() {
    const canvas = this.canvas;
    const context = this.context;
    const canvasStyle = canvas.getAttribute('style');
    this.render();
    canvas.addEventListener('mousedown', e => {
      // 只要抽奖没有结束，就不让再次抽奖
      if (!this.canBeClick) return;
      this.canBeClick = false;
      let loc = this.windowToCanvas(canvas, e);
      context.beginPath();
      context.arc(150, 150, 30, 0, Math.PI * 2, false);
      if (context.isPointInPath(loc.x, loc.y)) {
        // 每次点击抽奖，我们都将初始化角度重置
        this.startRadian = 0;
        // distance是我们计算出的将指定奖品旋转到指针处需要旋转的角度距离，distanceToStop下面会又说明
        const distance = this.distanceToStop();
        this.rotatePanel(distance);
      }
    })
    canvas.addEventListener('mousemove', e => {
      let loc = this.windowToCanvas(canvas, e);
      context.beginPath();
      context.arc(150, 150, 30, 0, Math.PI * 2, false);
      if (context.isPointInPath(loc.x, loc.y)) {
        canvas.setAttribute('style', `cursor: pointer;${canvasStyle}`);
      } else {
        canvas.setAttribute('style', canvasStyle);
      }
    })
  }

  // 处理旋转的关键方法
  rotatePanel(distance) {
    // 我们这里用一个很简单的缓动函数来计算每次绘制需要改变的角度，这样可以达到一个转盘从块到慢的渐变的过程
    let changeRadian = (distance - this.startRadian) / 10;
    this.startRadian += changeRadian;
    // 当最后我们的目标距离与startRadian之间的差距低于0.05时，我们就默认奖品抽完了，可以继续抽下一个了。
    if (distance - this.startRadian <= 0.05) {
      this.canBeClick = true;
      return
    }
    this.render();
    window.requestAnimationFrame(this.rotatePanel.bind(this, distance));
  }

  distanceToStop() {
    // middleDegrees为奖品块的中间角度（我们最终停留都是以中间角度进行计算的）距离初始的startRadian的距离，distance就是当前奖品跑到指针位置要转动的距离。
    let middleDegrees = 0, distance = 0;
    // 映射出每个奖品的middleDegrees
    const awardsToDegreesList = this.awards.map((data, index) => {
      let awardRadian = (Math.PI * 2) / this.awards.length;
      return awardRadian * index + (awardRadian * (index + 1) - awardRadian * index) / 2;
    });
    // 随机生成一个索引值，来表示我们此次抽奖应该中的奖品
    const currentPrizeIndex = Math.floor(Math.random() * this.awards.length);
    console.log('当前奖品中的奖品是：' + this.awards[currentPrizeIndex].prizeLevel);
    middleDegrees = awardsToDegreesList[currentPrizeIndex];
    // 因为指针是垂直向上的，相当坐标系的Math.PI/2,所以我们这里要进行判断来移动角度
    distance = Math.PI * 3 / 2 - middleDegrees;
    distance = distance > 0 ? distance : Math.PI * 2 + distance;
    // 这里额外加上后面的值，是为了让转盘多转动几圈，看上去更像是在抽奖
    return distance + Math.PI * 25;
  }
  // 绘制箭头，用来指向我们抽中的奖品
  drawArrow() {
    const context = this.context;
    context.save();
    context.beginPath();
    context.fillStyle = '#FF0000';
    context.moveTo(140, 125);
    context.lineTo(150, 100);
    context.lineTo(160, 125);
    context.closePath();
    context.fill();
    context.restore();
  }
  render() {
    this.drawPanel();
    this.drawPrizeBlock();
    this.drawButton();
    this.drawArrow();
  }
}