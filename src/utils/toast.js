import { message} from 'antd';
import React from 'react';
const toast = (title,type)=>{
  type = type || 'info'
  message[type](<span dangerouslySetInnerHTML={{__html: title}}></span>);
}
export default toast