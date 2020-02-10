



const setTurntablePageInitData = (data) => {
  if (!data) {
    window.localStorage['_turntablePageInitData'] = "";
    return;
  }
  data=JSON.stringify(data)
  window.localStorage['_turntablePageInitData'] = data;
}

const getTurntablePageInitData = () => {
  let data = window.localStorage['_turntablePageInitData'];
  if (data) {
    return JSON.parse(data);
  }
  return;
}

export {
  setTurntablePageInitData,
  getTurntablePageInitData
} 