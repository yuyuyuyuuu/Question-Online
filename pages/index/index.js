//index.js
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
    userInfo: {},
    hasUserInfo: false
  },


  onLoad() {

  },

  //事件处理函数
  goToLogin() {
    // 判断用户当天是否已经答过题
    wx.cloud.callFunction({
      name: 'login',
      complete: res => {
        console.log('云函数获取到的openid: ', res)
        activityRecord.where({
          _openid: res.result.openid //进行筛选 
        }).get({
          success: res => {
            if (res.data.length == 0) {
              //通过判断data数组长度是否为0来进行下一步的逻辑处理
              // 跳转到
              wx.reLaunch({
                url: '../login/login'
              })
              console.log("当前登录用户open_id不存在")
              wx.hideLoading();
            } else {
              console.log("用户存在")
              activityRecord
                .where({
                  _openid: _.exists(true)
                })
                .orderBy('createDate', 'desc')
                .get()
                .then(res => {
                  // 获取集合数据，或获取根据查询条件筛选后的集合数据。
                  console.log('[云数据库] [答题记录] 查询成功')
                  console.log(res.data);
                  const date = new Date();
                  const lastDate = this.formatTime(res.data[0].createDate)
                  const curDate = this.formatTime(date)
                  console.log("上次答题日期： ", lastDate);
                  console.log("当前答题日期： ", curDate);
                  if (lastDate == curDate) {
                    wx.showModal({
                      title: '提示',
                      content: '您今日已经作答过，请明日再来',
                      success: function (res) {
                        if (res.confirm) { //这里是点击了确定以后
                          console.log('用户点击确定')
                        } else { //这里是点击了取消以后
                          console.log('用户点击取消')
                        }
                        wx.reLaunch({
                          url: '../index/index',
                        })
                      }
                    })
                  } else {
                    wx.navigateTo({
                      url: '../login/login'
                    })
                  }
                })
              wx.navigateTo({
                url: '../login/login'
              })
            }
          }
        })
      }
    })
  },

  goToTest() {
    wx.navigateTo({
      url: '../test/test'
    })
  },

  goToDetails() {
    wx.navigateTo({
      url: '../details/details'
    })
  },

  goToHistory() {
    wx.navigateTo({
      url: '../history/history'
    })
  },

  goToWrong() {
    wx.navigateTo({
      url: '../wrong/wrong'
    })
  },

  goToRank() {
    wx.navigateTo({
      url: '../rank/rank'
    })
  },

  //微信授权登录
  login() {
    wx.getUserProfile({
      desc: '用于完善会员资料',
      success: (res) => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
        app.globalData.userInfo = res.userInfo
        app.globalData.hasUserInfo = true
      }
    })
  },

  onShareAppMessage(res) {
    return {
      title: '@你，快来参与脱贫攻坚知识答题活动吧~'
    }
  },

  formatTime(date) {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    return [year, month, day].map(this.formatNumber).join('/')
  },

  formatNumber(n) {
    n = n.toString()
    return n[1] ? n : '0' + n
  }
})