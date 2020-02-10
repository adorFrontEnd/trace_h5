const baseRoute = "";
const routerSort = ["home", "setting", "frn", "asset", "user", "order", "settlement", "auth"];

const routerConfigArr = [
  {
    route_name: "login",
    path: baseRoute + "/login",
  },
  {
    route_name: "home",
    path: baseRoute + "/home",
    loginRequired: true,
    title: "首页",
    icon: "home",
    moduleAuth: true
  },
  {
    route_name: "customer",
    title: "客户账号",
    icon: "user",
    moduleAuth: true
  },
  {
    route_name: "customer.customerManage",
    path: baseRoute + "/customer/customerManage",
    loginRequired: true,
    moduleAuth: true,
    title: "客户账号",
    icon: "user"
  }, 
  {
    route_name: "roleManage",
    title: "角色管理",
    icon: "usergroup-add",
    moduleAuth: true
  },
  {
    route_name: "roleManage.roleManage",
    path: baseRoute + "/roleManage/roleManage",
    loginRequired: true,
    moduleAuth: true,
    title: "角色管理",
    icon: "usergroup-add"
  }, 
  {
    route_name: "operManage",
    title: "操作员管理",
    icon: "safety-certificate",
    moduleAuth: true
  },
  {
    route_name: "operManage.operManage",
    path: baseRoute + "/operManage/operManage",
    loginRequired: true,
    moduleAuth: true,
    title: "操作员管理",
    icon: "safety-certificate"
  },
  {
    route_name: "setting",
    title: "设置",
    icon: "setting",
    moduleAuth: true
  },
  {
    route_name: "setting.password",
    path: baseRoute + "/setting/password",
    loginRequired: true,
    moduleAuth: true,
    title: "修改密码",
    icon: "unlock"
  }
]

const getRouterConfig = (routerConfigArr) => {
  let config = {};
  routerConfigArr.forEach((item, i) => {
    if (item && item.route_name) {
      let k = item.route_name;
      config[k] = { ...item, sort: i };
    }
  })
  return config;
}
const routerConfig = getRouterConfig(routerConfigArr);

export {
  baseRoute,
  routerConfig
}



