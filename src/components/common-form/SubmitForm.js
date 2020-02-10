import React, { Component } from 'react'
import { Input, Select, Form, Button, Checkbox, Radio, DatePicker, AutoComplete } from 'antd'
import DateRange from './DatetimePicker';
import locale from 'antd/lib/date-picker/locale/zh_CN';
import moment, { relativeTimeRounding } from 'moment';
import Toast from '../../utils/toast';
import { ID } from 'postcss-selector-parser';

const FormItem = Form.Item;
const Option = Select.Option;
class SearchForm extends Component {
  autoCompleteList = []
  renderformItemList = () => {
    const { getFieldDecorator } = this.props.form;
    const formItemList = this.props.formItemList;
    const formItems = [];
    if (formItemList && formItemList.length > 0) {
      formItemList.forEach((item, i) => {
        let props = item.props;
        let label = item.label;
        let labelStop = item.labelStop;
        let field = item.field;
        let fieldStop = item.fieldStop;
        let optionList = item.optionList;
        let className = item.className || "";
        let initialValue = item.initialValue || '';
        let placeholder = item.placeholder;
        let inputType = item.inputType || 'text';
        let placeholderStop = item.placeholderStop;
        let defaultOption = item.defaultOption;
        let dataSource = item.dataSource;
        let style = item.style || {};
        let styleStop = item.styleStop || {};
        let addonAfter = item.addonAfter;
        let addonAfterStop = item.addonAfterStop;
        let addonBefore = item.addonBefore;
        let addonBeforeStop = item.addonBeforeStop;
        let rules = item.rules;
        let colon = item.colon === false ? false : true;
        let min = item.min;
        let maxLength = item.maxLength;
        let disabled = item.disabled;     


        switch (item.type) {

          // 下拉选择
          case "SELECT":
            const select = <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 12 }} label={label} key={field} colon={colon} style={style}>
              {
                getFieldDecorator(field, {
                  rules: rules
                })(
                  <Select
                    {...props}
                    disabled={disabled}
                    labelInValue
                    style={style}
                    placeholder="请选择站点"
                    onChange={item.onChange}
                    style={style}
                    placeholder={placeholder}
                  >

                    {optionList ?
                      optionList.map(item => <Option title={item.title} key={item.id} value={item.id}>{item.name}</Option>)
                      : null
                    }
                  </Select>

                )
              }
            </FormItem>;
            formItems.push(select);
            break;

          case "AUTOCOMPLETE":
            const AUTOCOMPLETE = <FormItem label={label} key={field} style={style} colon={colon}>
              {
                getFieldDecorator(field)(
                  <AutoComplete
                    {...props}
                    disabled={disabled}
                    allowClear
                    style={style}
                    children={optionList.map(item => <AutoComplete.Option title={item.title} key={item.id} value={item.name}>{item.name}</AutoComplete.Option>)}
                    addonAfter={addonAfter}
                    addonBefore={addonBefore}
                    placeholder={placeholder}
                    // dataSource={optionList}
                    filterOption={this.autoCompleteFilter}
                  />)
              }
            </FormItem>
            formItems.push(AUTOCOMPLETE);
            break;

          // 多选
          case "CHECKBOX":
            const CHECKBOX = <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 12 }} label={label} key={field} style={style} colon={colon}>
              {
                getFieldDecorator(field, {
                  valuePropName: 'checked',
                  initialValue: initialValue||""
                })(
                  <Checkbox disabled={disabled} {...props} onChange={this.onChange}>
                    {label}
                  </Checkbox>
                )
              }
            </FormItem>;
            formItems.push(CHECKBOX)
            break;

          // 输入框
          case "INPUT":
            const INPUT = <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 12 }} label={label} key={field} colon={colon}>
              {
                getFieldDecorator(field, {
                  initialValue: initialValue || "",
                  rules: rules
                })(
                  <Input
                    {...props}
                    type={inputType}
                    onChange={this.onChange}
                    style={style}
                    min={min}
                    maxLength={maxLength}
                    addonAfter={addonAfter}
                    addonBefore={addonBefore}
                    placeholder={placeholder}
                    disabled={disabled}
                  />
                )
              }
            </FormItem>
            formItems.push(INPUT)
            break;

          // 输入框
          case "INPUT_RANGE":
            const INPUT_START = <FormItem label={label} key={field} colon={colon}>
              {
                getFieldDecorator(field, {
                  initialValue: initialValue||""
                })(
                  <Input
                    {...props}
                    disabled={disabled}
                    onChange={this.onChange}
                    style={style}
                    addonAfter={addonAfter}
                    addonBefore={addonBefore}
                    placeholder={placeholder}
                  />
                )
              }
            </FormItem>
            const INPUT_STOP = <FormItem label={labelStop || "~"} key={fieldStop} colon={false}>
              {
                getFieldDecorator(fieldStop, {
                  initialValue: initialValue||""
                })(
                  <Input
                    {...props}
                    disabled={disabled}
                    onChange={this.onChange}
                    style={styleStop}
                    addonAfter={addonAfterStop}
                    addonBefore={addonBeforeStop}
                    placeholder={placeholderStop}
                  />
                )
              }
            </FormItem>
            const RANGE = <div key={field + fieldStop} style={{ display: "inline-block" }}>
              {INPUT_START}{INPUT_STOP}
            </div>
            formItems.push(RANGE);
            break;

          case "DATE":
            const startTime = <FormItem label={label || "选择时间"} key={"startTime"}>
              {
                getFieldDecorator('startTime')(
                  <DatePicker onChange={this.onChange} style={{ width: 170 }} showTime={true} placeholder={placeholder || "请选择开始时间"} format="YYYY-MM-DD HH:mm:ss" />
                )
              }
            </FormItem>;
            const endTime = <FormItem label="~" colon={false} key={"endTime"}>
              {
                getFieldDecorator('endTime')(
                  <DatePicker onChange={this.onChange} style={{ width: 170 }} showTime={true} placeholder={placeholderStop || "请选择结束时间"} format="YYYY-MM-DD HH:mm:ss" />
                )
              }
            </FormItem>;

            const DATE = <div key='dateRange' style={{ display: "inline-block" }}>
              {startTime}{endTime}
            </div>
            formItems.push(DATE);
            break;

        }
      })
      return formItems;
    }
  }
  render() {
    const _forms = (
      <Form style={{ minWidth: 500, margin: '0 auto', padding: "20px 20px 0" }}>
        {this.renderformItemList()}
      </Form>
    )
    const _buttons = (
      <div className="flex" style={{ padding: "5px 10px", justifyContent: 'flex-end', width: "100%", lineHeight: 30, borderTop: "1px solid #ddd" }}>
        <div className='flex-middle' style={{ height: 40 }}>
          {
            this.props.cancelClicked ?
              <Button onClick={this.cancelClicked}>{this.props.cancelText || "取消"}</Button>
              : null
          }
          {
            this.props.saveClicked ?
              <Button type="primary" style={{ marginLeft: 10 }} onClick={this.saveClicked}>{this.props.okText || "保存"}</Button>
              : null
          }
          
        </div>
      </div>
    );
    return <div style={{ width: "100%" }}>
      {_forms}
      {this.props.children ?
        <div className='padding0-20'>{this.props.children}</div>
        : null
      }
      {_buttons}
    </div>
  }

  autoCompleteFilter = (inputValue, option) => {
    return option.props.children.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
  }

  getValue = () => {
    let params = this.props.form.getFieldsValue();
    params = this.getAutoCompleteIds(params);

    if (params && params.startTime) {
      params.startTime = Date.parse(params.startTime)
    }
    if (params && params.endTime) {
      params.endTime = Date.parse(params.endTime)
    }
    if (params && params.endTime && params.startTime) {
      if (parseInt(params.startTime) > parseInt(params.endTime)) {
        Toast("开始时间大于结束时间", 'info')
        return;
      }
    }
    return params;
  }

  getAutoCompleteIds = (params) => {
    this.autoCompleteList = this.props.formItemList.filter((item) => item.type == 'AUTOCOMPLETE')
    if (!this.autoCompleteList || !this.autoCompleteList.length) {
      return params;
    }
    this.autoCompleteList.forEach(item => {
      let k = item.field;
      if (params.hasOwnProperty(k) && params[k]) {
        let optionList = item.optionList;
        let val = params[k];
        let filtArr = optionList.filter(option => option.name == val);
        if (filtArr && filtArr.length) {
          params[k] = filtArr[0].id;
        }
      }
    })
    return params;
  }

  // 重置
  cancelClicked = () => {
    this.props.cancelClicked();
  }
  saveClicked = () => {
    this.props.form.validateFields((err, data) => {
      if (err) {
        return;
      }
      this.props.saveClicked(data);
    })
  }

  componentWillReceiveProps(props) {
    if (props.showForm && !this.props.showForm && props.setFormValue && JSON.stringify(props.setFormValue) != JSON.stringify(this.props.setFormValue)) {
      this.props.form.setFieldsValue(props.setFormValue);
    }

    if (props.resetFormItem && JSON.stringify(props.resetFormItem) != JSON.stringify(this.props.resetFormItem)) {
      for (let i in props.resetFormItem) {
        if (i != "upDate") {
          this.props.form.resetFields(i, props.resetFormItem[i]);
        }
      }
    }

    if (!props.showForm && this.props.showForm && props.clearWhenHide) {
      this.props.form.resetFields();
    }
  }

  componentDidMount() {
    this.props.form.setFieldsValue(this.props.setFormValue);
  }

  onChange = () => {
    if (!this.props.onValueChange) {
      return;
    }
    let params = this.props.form.getFieldsValue();
    this.props.onValueChange(params);
  }

}
export default Form.create()(SearchForm);