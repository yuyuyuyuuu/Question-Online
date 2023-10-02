//获取应用实例
const app = getApp()

// 连接云数据库
const db = wx.cloud.database();
// 获取集合的引用
const activityUser = db.collection('activityUser');
// 数据库操作符
const _ = db.command;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    realname: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  getRealName: function (e) {
    console.log("输入的值为：" + e.detail.value); //打印输入的值
    this.setData({
      realname:e.detail.value,//改变page--data中username的值
    })
    wx.setStorageSync('realname', e.detail.value);//将获取到的username值存入本地缓存空间
  },

  goToLogin() {
    wx.showModal({
      title: '提示',
      content: '请再次检查名字是否正确',
      success: function (res) {
        if (res.confirm) {//这里是点击了确定以后
          console.log('用户点击确定')
          let nameInfo = {
            nickName: app.globalData.hasUserInfo ? app.globalData.userInfo.nickName : '',
            avatarUrl: app.globalData.hasUserInfo ? app.globalData.userInfo.avatarUrl : '',
            _openid: app.globalData.hasUserInfo ? app.globalData.userInfo._openid : '',
            realName: wx.getStorageSync('realname'),
            doneQuestion: []
          };
      
          wx.cloud.callFunction({
            name: "login",
            complete: res => {
              activityUser.where({
                _openid: res.result.openid  //进行筛选 
              }).get({
                success: res => {
                  console.log(res.data.length)
                  if (res.data.length == 0) {
                    //通过判断data数组长度是否为0来进行下一步的逻辑处理
                    activityUser.add({
                      data: {
                        ...nameInfo
                      }
                    })
                    // 跳转到
                    wx.navigateTo({
                      url: '../test/test'
                    })
                    wx.hideLoading();
                  } else {
                    console.log("用户已经存在")
                    wx.navigateTo({
                      url: '../test/test'
                    })
                  }
                } 
              })
            }
          })
        } else {//这里是点击了取消以后
          console.log('用户点击取消')
        }
      }
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '@你，快来参与脱贫攻坚知识答题活动吧~'
    }
  }
})