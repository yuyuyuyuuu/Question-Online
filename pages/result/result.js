// pages/results/results.js
const app = getApp();
// 连接云数据库
const db = wx.cloud.database();
// 获取集合的引用
const activityRecord = db.collection('activityRecord');
// 数据库操作符
const _ = db.command;
Page({
  data: {
    totalScore: null,
    wrong: 0,
    accuracy: null,
  },

  onLoad(options) {
    // 查看答题成绩
    this.getExamResult(options.id);
  },

  // 系统自动判分
  getExamResult(id){
    wx.showLoading({
      title: '系统判分中'
    });
    activityRecord
    .doc(id)
    .get()
    .then(res => {
      let examResult = res.data;
      
      let { wrong, totalScore } = examResult;
      this.setData({
        totalScore,
        wrong,
        accuracy: (10-wrong)/10*100
      })

      wx.hideLoading();
    })
  },

  // 返回首页
  toIndex(){
    wx.reLaunch({
      url: '../index/index'
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
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