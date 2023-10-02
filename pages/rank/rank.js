//获取应用实例
const app = getApp()

// 连接云数据库
const db = wx.cloud.database();
// 获取集合的引用
const activityScore = db.collection('activityScore');
// 数据库操作符
const _ = db.command;

Page({
  data: {
    rankList: []
  },
  
  onLoad() {
    this.getRankList();
  },

  getRankList() {
    // 显示 loading 提示框
    wx.showLoading({
      title: '拼命加载中'
    });
    // 数据库集合的聚合操作实例
    activityScore
    .where({       //类似于where，对记录进行筛选
      _openid: _.exists(true)
    })
    .orderBy('totalScore', 'desc')
    .get()
    .then(res => {
      // 获取集合数据，或获取根据查询条件筛选后的集合数据。
      console.log('[云数据库] [排行榜] 查询成功')
      console.log(res.data)
      let data = res.data || [];
      
      // 将数据从逻辑层发送到视图层，通俗的说，也就是更新数据到页面展示
      this.setData({
        rankList:data
      });

      // 隐藏 loading 提示框
      wx.hideLoading();
    })
  },
})
