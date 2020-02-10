import React from 'react';
import asyncComponent from "../components/asyncComponent/asyncComponent";
import { BrowserRouter as Router, Route, Link, Switch, Redirect } from 'react-router-dom';
import { baseRoute, routerConfig } from '../config/router.config';
import { isUserLogin } from '../middleware/localStorage/login';

// 前台页面u
const TraceIndex = asyncComponent(() => import("../pages/frontEnd/trace/TraceIndex"));
const UserAuth = asyncComponent(() => import("../pages/frontEnd/auth/UserAuth"));
const UserSubscribe = asyncComponent(() => import("../pages/frontEnd/auth/UserSubscribe"));
const TraceDetail = asyncComponent(() => import("../pages/frontEnd/trace/TraceDetail"));
const antiFakeDetail = asyncComponent(() => import("../pages/frontEnd/antiFake/antiFakeDetail"));
const antiFakeIndex = asyncComponent(() => import("../pages/frontEnd/antiFake/antiFakeIndex"));
const CommomScan = asyncComponent(() => import("../pages/commomScan/commomScan"));
const O2oDetail = asyncComponent(() => import("../pages/frontEnd/o2oIndex/o2oDetail"));
const BindPhone = asyncComponent(() => import("../pages/frontEnd/o2oIndex/bindPhone"));
const Order = asyncComponent(() => import("../pages/frontEnd/menberCenter/order"));
const Prize = asyncComponent(() => import("../pages/frontEnd/menberCenter/prize"));
const OrderDetail = asyncComponent(() => import("../pages/frontEnd/menberCenter/orderDetail"));
const InquireIndex = asyncComponent(() => import("../pages/frontEnd/inquire/inquireIndex"));
const InquireResult = asyncComponent(() => import("../pages/frontEnd/inquire/inquireResult"));
const Lottery = asyncComponent(() => import("../pages/frontEnd/antiFake/lottery"));
const DelerDetail = asyncComponent(() => import("../pages/frontEnd/antiFake/delerDetail"));
const O2oIndex = asyncComponent(() => import("../pages/frontEnd/o2oIndex/o2oIndex"));
const Turntable = asyncComponent(() => import("../pages/frontEnd/o2oIndex/turntable"));
const Test = asyncComponent(() => import("../pages/frontEnd/o2oIndex/test"));
const PrizeInfo = asyncComponent(() => import("../pages/frontEnd/o2oIndex/prizeInfo"));
const PcanPage = asyncComponent(() => import("../pages/scanPage/scanPage"));



const ADAuth = asyncComponent(() => import("../pages/openApi/ADAuth"));
const ADAuthLogin = asyncComponent(() => import("../pages/openApi/ADAuthLogin"));

export default class GlobalRouter extends React.Component {
  render() {
    return (
      <Router>
        <Switch>
          <Route exact={true} path="/" render={() => (
            isUserLogin() ?
              <Redirect to={routerConfig["customer.customerManage"].path} />
              :
              <Redirect to={{ pathname: '/frontEnd/index' }} />
          )} />
          <Route exact={true} path='/frontEnd/index' component={TraceIndex} />
          <Route exact={true} path='/frontEnd/userAuth' component={UserAuth} />
          <Route exact={true} path='/frontEnd/traceDetail' component={TraceDetail} />
          <Route exact={true} path='/code/product' component={antiFakeIndex} />
          <Route exact={true} path='/code/box' component={antiFakeIndex} />
          <Route exact={true} path='/frontEnd/userSubscribe' component={UserSubscribe} />
          <Route exact={true} path='/frontEnd/antiFake' component={antiFakeDetail} />
          <Route exact={true} path='/frontEnd/delerDetail' component={DelerDetail} />
          <Route exact={true} path='/frontEnd/lottery' component={Lottery} />
          <Route exact={true} path='/frontEnd/o2oDetail' component={O2oDetail} />
          <Route exact={true} path='/frontEnd/o2oIndex' component={O2oIndex} />
          <Route exact={true} path='/frontEnd/turntable' component={Turntable} />
          <Route exact={true} path='/frontEnd/prizeInfo' component={PrizeInfo} />
          <Route exact={true} path='/frontEnd/order' component={Order} />
          <Route exact={true} path='/frontEnd/prize' component={Prize} />
          <Route exact={true} path='/frontEnd/orderDetail' component={OrderDetail} />
          <Route exact={true} path='/frontEnd/bindPhone' component={BindPhone} />
          <Route exact={true} path='/frontEnd/inquireIndex' component={InquireIndex} />
          <Route exact={true} path='/frontEnd/inquireResult' component={InquireResult} />
          <Route exact={true} path='/frontEnd/commomScan' component={CommomScan} />
          <Route exact={true} path='/frontEnd/test' component={Test} />
          <Route exact={true} path='/openApi/ADAuth' component={ADAuth} />
          <Route exact={true} path='/openApi/ADAuthLogin' component={ADAuthLogin} />
          <Route exact={true} path='/frontEnd/pcanPage' component={PcanPage} />

        </Switch>
      </Router >
    )
  }
}

function PrivateRoute({ component: Component, ...rest }) {
  return (
    <Route
      {...rest}
      render={
        props =>
          isUserLogin() ?
            <Component {...props} />
            // : <Redirect to={{ pathname: '/frontEnd/index', state: { from: props.location } }} />
            : <Redirect to={{ pathname: '/code/product', state: { from: props.location } }} />
      }
    />
  )
}
