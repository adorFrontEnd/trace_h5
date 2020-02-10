import InputGroup from 'react-input-groups';
import React, { Component } from 'react';
import '../verifycation/verifycation.less';
    import 'react-input-groups/lib/css/styles.css'
    
    export default class Inputarea extends Component{
        constructor(props) {
            super(props);
            this.state = {
            };
            this.getValue = this.getValue.bind(this)
        }
        getValue(value) {
            
        }
        render() {
            return (
              <div>
                <InputGroup
                    getValue={this.getValue}
                    length={4}
                    type={'box'}
                />
                {/*length支持4或者6*/}
                {/* <InputGroup
                    getValue={this.getValue}
                    length={4}
                    type={'line'}
                /> */}
              </div>
            );
        }
    }
