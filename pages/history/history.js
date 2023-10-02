//获取应用实例

const app = getApp()

// 连接云数据库
const db = wx.cloud.database();
// 获取集合的引用
const activityRecord = db.collection('activityRecord');
// 数据库操作符
const _ = db.command;

Page({
  data: {
    historyList: []
  },

  onLoad() {
    this.getHistoryList();
  },

  goToResult(event) {
    const {
      id
    } = event.currentTarget.dataset;
    wx.navigateTo({
      url: '../result/result?id=' + id
    })
  },

  getHistoryList() {
    // 显示 loading 提示框
    wx.showLoading({
      title: '拼命加载中'
    });

    wx.cloud.callFunction({
      name: "login",
      complete: res => {
        activityRecord.where({
            _openid: res.result.openid //进行筛选 
          })
          .orderBy('createDate', 'desc')
          .get({
            success: res => {
              console.log(res.data.length)
              if (res.data.length == 0) {
                //通过判断data数组长度是否为0来进行下一步的逻辑处理
                wx.hideLoading();
              } else {
                // 获取集合数据，或获取根据查询条件筛选后的集合数据。
                console.log('[云数据库] [答题记录] 查询成功')
                console.log(res.data)
                let data = res.data || [];
                let historyList = [];
                data.forEach(item => {
                  item.date = this.formatTime(item.createDate)
                  historyList.push(item)
                })
                // 将数据从逻辑层发送到视图层，通俗的说，也就是更新数据到页面展示
                this.setData({
                  historyList
                });
                // 隐藏 loading 提示框
                wx.hideLoading();
              }
            }
          })
      }
    })
  },

  formatTime(date) {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hour = date.getHours()
    const minute = date.getMinutes()
    return [year, month, day].map(this.formatNumber).join('/') + ' ' + [hour, minute].map(this.formatNumber).join(':')
  },

  formatNumber(n) {
    n = n.toString()
    return n[1] ? n : '0' + n
  }
})