import { Upload, Icon, Modal } from 'antd';
import React, { Component } from 'react';
import { getUpdatePictureUrl } from '../../api/product/product';
let updateUrl = '';
let initUid = 1;

export default class PicturesWall extends Component {

  state = {
    previewVisible: false,
    previewImage: '',
    fileList: [],
  };


  componentDidMount() {
    let folder = this.props.folder || 'product';
    updateUrl = getUpdatePictureUrl({ folder });
    this.getFileList();
  }

  componentWillReceiveProps(props) {

    if (JSON.stringify(props.pictureList) == JSON.stringify(this.props.pictureList)) {
      return;
    }

    let fileList = [];

    if (props.pictureList && props.pictureList.length) {

      let oldList = this.state.fileList && this.state.fileList.length ? this.state.fileList.map(item => item.url).join() : [];
      let newList = props.pictureList && props.pictureList.length ? props.pictureList.join() : [];

      if (JSON.stringify(oldList) == JSON.stringify(newList)) {
        return;
      }

      fileList = this.formatExistFiles(props.pictureList);
    }

    this.setState({
      fileList
    })
  }

  getFileList = () => {
    let fileList = [];
    if (this.props.pictureList && this.props.pictureList.length) {
      fileList = this.formatExistFiles(this.props.pictureList);
    }
    this.setState({
      fileList
    })
    console.log(fileList);
  }

  formatExistFiles = (fileList) => {
    if (!fileList || !fileList.length) {
      return []
    }
    let result = fileList.map(fileUrl => {
      return {
        uid: this.getExitsFileUid(fileUrl),
        name: this.getExitsFileName(fileUrl),
        status: 'done',
        url: fileUrl,
      }
    })
    return result;
  }

  getExitsFileName = (fileUrl) => {
    if (!fileUrl || !fileUrl.length) {
      return;
    }
    let index = fileUrl.lastIndexOf('/');
    if (index != -1) {
      let result = fileUrl.slice(index);
      return result
    }
    return;
  }

  getExitsFileUid = (fileUrl) => {
    if (!fileUrl || !fileUrl.length) {
      return;
    }
    return ++initUid;
  }


  formatUploadFileList = (fileList) => {
    return new Promise((resolve, reject) => {
      if (!fileList || !fileList.length) {
        reject();
      }
      let shouldResolve = fileList.length != this.state.fileList.length;

      for (let i = 0; i < fileList.length; i++) {
        let item = fileList[i];
        if (item && item.response && item.response.status && item.response.status == 'SUCCEED') {
          let newItem = {
            uid: item.uid,
            name: item.name,
            status: 'done',
            url: item.response.data
          }
          fileList[i] = newItem;
          shouldResolve = true;
        }
      }
      if (shouldResolve) {
        resolve(fileList)
      } else {
        reject()
      }
    })
  }

  handleCancel = () => this.setState({ previewVisible: false })

  handlePreview = (file) => {
    this.setState({
      previewImage: file.url || file.thumbUrl,
      previewVisible: true,
    });
  }

  picMoveLeft = (index) => {
    let fileList = this.state.fileList;
    let temp = fileList[index];
    fileList[index] = fileList[index - 1];
    fileList[index - 1] = temp;
    this.setState({
      fileList
    })
    let urlList = fileList.map(item => item.url);
    this.props.uploadCallback(urlList);

  }

  picMoveRight = (index) => {
    let fileList = this.state.fileList;
    let temp = fileList[index];
    fileList[index] = fileList[index + 1];
    fileList[index + 1] = temp;
    this.setState({
      fileList
    })
    let urlList = fileList.map(item => item.url);
    this.props.uploadCallback(urlList);
  }

  handleChange = ({ fileList }) => {

    this.setState({ fileList })
    this.formatUploadFileList(fileList)
      .then((list) => {
        let urlList = list.map(item => item.url);
        this.props.uploadCallback(urlList);
      })
      .catch(() => { })
  }

  render() {
    const { previewVisible, previewImage, fileList } = this.state;
    const limitFileLength = this.props.limitFileLength || 1;
    const uploadButton = (
      <div>
        <Icon type="plus" />
        <div className="ant-upload-text">上传图片</div>
      </div>
    );
    return (
      <div>
        <div className="clearfix">
          <Upload
            action={updateUrl}
            listType="picture-card"
            fileList={fileList}
            name='files'
            onPreview={this.handlePreview}
            onChange={this.handleChange}
          >
            {fileList.length >= limitFileLength ? null : uploadButton}
          </Upload>
        </div>
        {
          fileList.length >= 2 ?
            <div className='text-left flex align-center'>
              {
                fileList.map((item, index) =>
                  <div key={item.uid} style={{ width: 104, marginRight: 8, padding: "0 10px" }} className='flex-between'>
                    {
                      index == 0 ?
                        <Icon style={{ fontSize: 30, color: "#ccc", cursor: 'pointer' }} type="arrow-left" />
                        :
                        <Icon onClick={() => { this.picMoveLeft(index) }} style={{ fontSize: 30, color: "#52c41a", cursor: 'pointer' }} type="arrow-left" />
                    }
                    {
                      index == fileList.length - 1 ?
                        <Icon style={{ fontSize: 30, color: "#ccc", cursor: 'pointer' }} type="arrow-right" />
                        :
                        <Icon onClick={() => { this.picMoveRight(index) }} style={{ fontSize: 30, color: "#52c41a", cursor: 'pointer' }} type="arrow-right" />
                    }
                  </div>
                )
              }
            </div>
            : null
        }

        <Modal zIndex={3000} visible={previewVisible} footer={null} onCancel={this.handleCancel}>
          <img alt="example" style={{ width: '100%' }} src={previewImage} />
        </Modal>
      </div>
    );
  }
}

