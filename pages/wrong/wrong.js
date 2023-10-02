//获取应用实例

const app = getApp()

// 连接云数据库
const db = wx.cloud.database();
// 获取集合的引用
const activityWrong = db.collection('activityWrong');
// 数据库操作符
const _ = db.command;

Page({
  data: {
    index: 0,
    wrongList: []
  },

  onLoad() {
    this.getWrongList();
  },

  goToResult(event) {
    const {
      id
    } = event.currentTarget.dataset;
    wx.navigateTo({
      url: '../result/result?id=' + id
    })
  },

  getWrongList() {
    // 显示 loading 提示框
    wx.showLoading({
      title: '拼命加载中'
    });
    // 数据库集合的聚合操作实例
    wx.cloud.callFunction({
      name: "login",
      complete: res => {
        activityWrong.where({
          _openid: res.result.openid //进行筛选 
        }).get({
          success: res => {
            console.log(res.data.length)
            if (res.data.length == 0) {
              //通过判断data数组长度是否为0来进行下一步的逻辑处理
              wx.hideLoading();
            } else {
              console.log('[云数据库] [答题记录] 查询成功')
              console.log(res.data)
              let data = res.data || [];
              let wrongQues = [];
              data.forEach(item => {
                item.date = this.formatTime(item.createDate)
                wrongQues.push(item.wrongList)
              })
              var arr = []
              for (var i in wrongQues) {
                console.log("当前记录为： ", wrongQues[i]);
                for (var j in wrongQues[i])
                  arr.push(wrongQues[i][j]);
              }
              console.log("最终记录为： ", arr);
              // 将数据从逻辑层发送到视图层，通俗的说，也就是更新数据到页面展示
              this.setData({
                wrongList: arr,
                index: 0
              });
              // 隐藏 loading 提示框
              wx.hideLoading();
            }
          }

        })
      }
    })
  },

  // 下一题按钮
  nextBack() {
    // 判断是不是最后一题
    if (this.data.index < this.data.wrongList.length - 1) {
      // 如果不是最后一题，则切换下一题
      let index = this.data.index + 1;
      this.setData({
        index
      })
    } else {
      // 如果是最后一题，则提交答卷
      this.goToIndex()
    }
  },

  goToIndex() {
    wx.navigateTo({
      url: '../index/index'
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