import React, { Component } from "react";
import ActivityPage from '../../../components/common-page/ActivityPage';
import { isWxUserLogin } from '../../../middleware/localStorage/wxUser';
import { parseUrl } from '../../../utils/urlUtils';
import Toast, { T } from 'react-toast-mobile';
import { securityDecoration } from '../../../api/frontEnd/trace';

const _title = "微信关注";
const _description = "";
class Page extends Component {
  state = {
    imgurl: '',
    frnId: '',
    backgroundImage: null,
    backgroundColor: null,
  }
  componentDidMount() {

    let urlParams = parseUrl(this.props.location.search);
    if (!urlParams || !urlParams.args || !urlParams.args.qrCode) {
      T.alert({
        title: '无效的二维码',
        message: '无效的二维码!'
      });
      return;
    }
    let { qrCode, frnId } = urlParams.args;

    this.setState({ imgurl: qrCode, frnId })

  }

 
  /**渲染**********************************************************************************************************************************/

  render() {

    return (
      <ActivityPage title={_title} description={_description}>
        <div style={{  minHeight: '100vh', padding: '50px 30px 0 30px', backgroundSize: '100%', position: 'relative' }}>
          <img style={{ position: 'absolute', top: '219px', width: '150px', height: '150px', left: '31%' }} src={this.state.imgurl} />
          <div style={{ position: 'absolute', top: '185px', left: '30%' }}>长按下方<span style={{ color: '#1890FF' }}>二维码</span>关注我们</div>
        </div>
      </ActivityPage>
    )
  }
}
export default Page;