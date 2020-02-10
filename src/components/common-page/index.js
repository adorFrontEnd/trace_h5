import React, { Component } from 'react';
import './common-page.less';

export default class CommonPage extends Component {
  render(){
    return (
      <div className="page-body">
        <div className='page-meta'>
          <div className="page-title">{this.props.title}</div>
          <div className="page-description">{this.props.description}</div>
        </div>
        <div className="page-content">
          {this.props.children}
        </div>
      </div>
    )
  }
}