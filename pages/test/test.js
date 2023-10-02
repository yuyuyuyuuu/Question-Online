const app = getApp();

// 连接云数据库
const db = wx.cloud.database();
// 获取集合的引用
const activityQuestion = db.collection('activityQuestion');
const activityRecord = db.collection('activityRecord');
const activityScore = db.collection('activityScore');
const activityWrong = db.collection('activityWrong');
const activityUser = db.collection('activityUser');
// 数据库操作符
const _ = db.command;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    questionList: [],
    index: 0,

    doneList: [],
    chooseValue: [],
    totalScore: 0,
    wrong: 0,
    wrongList: [],
    wrongListSort: [],

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    // 获取题库-函数执行
    this.getQuestionList()
  },

  // 获取题库-函数定义
  getQuestionList() {
    // 显示 loading 提示框
    wx.showLoading({
      title: '拼命加载中'
    });
    // 查询用户当前做过的题目id
    var that = this;
    wx.cloud.callFunction({
      name: "login",
      complete: ans => {
        activityUser.where({
          _openid: ans.result.openid //进行筛选 
        }).get({
          success: res => {
            that.setData({
              doneList: res.data[0]['doneQuestion']
            })
            activityQuestion
              .aggregate()
              .match({ //类似于where，对记录进行筛选
                true: _.exists(true),
                _id: _.nin(that.data.doneList)
              })
              .sample({
                size: 10
              })
              .end()
              .then(res => {
                // 获取集合数据，或获取根据查询条件筛选后的集合数据。
                console.log('[云数据库] [activityQuestion] 查询成功')
                console.log(res.list)
                let data = res.list || [];

                // 将数据从逻辑层发送到视图层，通俗的说，也就是更新数据到页面展示
                that.setData({
                  questionList: data,
                  index: 0
                });
                
                console.log("当前题目列表长度为：", that.data.questionList.length)
                if (that.data.questionList.length < 10) {
                  wx.showModal({
                    title: '提示',
                    content: '当前题库已经联系完毕，是否重新练习',
                    success: function (res) {
                      if (res.confirm) {//这里是点击了确定以后
                        console.log('用户点击确定重新开始')
                        console.log(ans.result._openid)
                        activityUser.where({
                          _openid: ans.result.openid
                        })
                        .update({
                          data: {
                            doneQuestion: []
                          }
                        })
                        activityWrong.where({
                          _openid: ans.result.openid
                        })
                        .update({
                          data: {
                            wrongList: []
                          }
                        })
                        activityScore.where({
                          _openid: ans.result.openid
                        })
                        .update({
                          data: {
                            totalScore: 0
                          }
                        })
                      } else {//这里是点击了取消以后
                        console.log('用户点击取消')
                        wx.reLaunch({
                          url: '../index/index'
                        })
                      }
                      wx.navigateTo({
                        url: '../index/index'
                      })
                    }
                  })
                }
                // 隐藏 loading 提示框
                wx.hideLoading();
              })
          }
        })
      }
    })
  },

  // 选中单选项事件
  radioChange(e) {
    this.data.chooseValue[this.data.index] = e.detail.value;
  },

  // 选中多选项事件
  checkboxChange(e) {
    this.data.chooseValue[this.data.index] = e.detail.value;
  },

  // 下一题/提交 按钮
  nextSubmit() {

    // 如果没有选择
    if (this.data.chooseValue[this.data.index] == undefined || this.data.chooseValue[this.data.index].length == 0) {
      return wx.showToast({
        title: '请选择答案!',
        icon: 'none'
      })
    }

    // 判断所选择的选项是否为正确答案
    this.chooseJudge();

    // 判断是不是最后一题
    this.lastJudge();
  },

  // 判断所选择的选项是否为正确答案
  chooseJudge() {
    var trueValue = this.data.questionList[this.data.index]['true'];
    var chooseVal = this.data.chooseValue[this.data.index];
    var arr = []; //定义数组
    for (var i in chooseVal) {
      arr.push(chooseVal[i]);
    }
    arr.sort()
    if (arr.toString() != trueValue.toString()) {
      // 答错则记录错题
      this.data.wrong++;
      this.data.wrongListSort.push(this.data.index);
      this.data.questionList[this.data.index]['wrongChoice'] = arr.toString();
      this.data.wrongList.push(this.data.questionList[this.data.index]);
    } else {
      // 答对则累计总分
      this.setData({
        totalScore: this.data.totalScore + 1
      })
    }
  },

  // 判断是不是最后一题
  lastJudge() {
    if (this.data.index < this.data.questionList.length - 1) {
      // 如果不是最后一题，则切换下一题
      let index = this.data.index + 1;
      this.setData({
        index
      })
    } else {
      // 如果是最后一题，则提交答卷
      this.addExamRecord()
    }
  },

  // 提交答卷
  addExamRecord() {
    wx.showLoading({
      title: '提交答卷中'
    });
    let examResult = {
      wrong: this.data.wrong,
      totalScore: this.data.totalScore,
      nickName: app.globalData.hasUserInfo ? app.globalData.userInfo.nickName : '',
      avatarUrl: app.globalData.hasUserInfo ? app.globalData.userInfo.avatarUrl : '',
      realName: wx.getStorageSync('realname')
    };
    let scoreResult = {
      totalScore: this.data.totalScore,
      nickName: app.globalData.hasUserInfo ? app.globalData.userInfo.nickName : '',
      avatarUrl: app.globalData.hasUserInfo ? app.globalData.userInfo.avatarUrl : '',
      realName: wx.getStorageSync('realname')
    };
    let wrongResult = {
      wrong: this.data.wrong,
      nickName: app.globalData.hasUserInfo ? app.globalData.userInfo.nickName : '',
      avatarUrl: app.globalData.hasUserInfo ? app.globalData.userInfo.avatarUrl : '',
      wrongList: this.data.wrongList,
      realName: wx.getStorageSync('realname')
    }
    activityRecord.add({
      data: {
        ...examResult,
        createDate: db.serverDate()
      }
    }).then(res => {
      wx.cloud.callFunction({
        name: "login",
        complete: rres => {
          activityScore.where({
            _openid: rres.result.openid //进行筛选 
          }).get({
            success: rres => {
              console.log(rres.data.length)
              if (rres.data.length == 0) { // 用户第一次答题
                activityScore.add({
                  data: {
                    ...scoreResult,
                    createDate: db.serverDate()
                  }
                })
              } else {
                console.log("用户已经答过题") // 用户之后答题累计答对数量
                let curScore = scoreResult.totalScore
                let curUrl = scoreResult.avatarUrl
                activityScore.where({
                  _openid: _.exists(true)
                }).update({
                  data: {
                    avatarUrl: curUrl,
                    totalScore: _.inc(curScore)
                  }
                })
              }
            }
          })
        }
      })
      // 跳转到答题结果页，查看成绩
      wx.reLaunch({
        url: '../result/result?id=' + res._id
      });
      wx.hideLoading();
    }).then(res => {
      // 插入错误记录
      console.log("开始错误统计");
      wx.cloud.callFunction({
        name: "login",
        complete: res => {
          activityWrong.where({
            _openid: res.result.openid //进行筛选 
          }).get({
            success: rres => {
              if (rres.data.length == 0) { // 用户第一次答题
                activityWrong.add({
                  data: {
                    ...wrongResult,
                    createDate: db.serverDate()
                  }
                })
              } else {
                console.log("用户已在记录中") // 用户之后答题累计答对数量
                let curWrong = wrongResult.wrongList
                let curWnum = wrongResult.wrong
                console.log("本次错题为： ", curWrong);
                activityWrong.where({
                  _openid: _.exists(true)
                }).update({
                  data: {
                    wrong: _.inc(curWnum),
                    wrongList: _.push(curWrong)
                  }
                })
              }
            }
          })
        }
      })
    })
    let questionIdList = []
    for (var i in this.data.questionList) {
      questionIdList.push(this.data.questionList[i]._id);
    }
    activityUser.where({
      _openid: _.exists(true)
    }).update({
      data: {
        doneQuestion: _.push(questionIdList)
      }
    })
  }
})