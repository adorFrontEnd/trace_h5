 
import baseHttpProvider from '../base/baseHttpProvider';

const getAllList = (params) => {
  return baseHttpProvider.getApi('api/source/getAllList', params);
}



export {
  getAllList
}