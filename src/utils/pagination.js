// 分页器
const pagination = (res, callback, sizeCallback, options) => {
  return {
    onChange: (current) => {
      callback && callback(current)
    },
    current: res.currentPage,
    pageSize: res.pageSize,
    total: res.totalNum,
    showTotal: () => `共${res.totalNum}条数据`,
    showQuickJumper: (options && options.showQuickJumper === false) ? false : true,
    showSizeChanger: (options && options.showSizeChanger === false) ? false : true,
    pageSizeOptions: (options && options.pageSizeOptions) || ['10', '20', '40', '50', '100'],
    onShowSizeChange: (current, pageSize) => {
      sizeCallback && sizeCallback(current, pageSize)
    }
  }
}

export {
  pagination
}