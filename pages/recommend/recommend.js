// pages/recommend/recommend.js
import request from '../../utils/request'
import  PubSub  from 'pubsub-js';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    year: '',//年
    month: '',//月
    day: '',//天
    recommendList: [],//推荐列表数据
    index: 0,//音乐下标
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //判断用户是否登录
    let userIinfo = wx.getStorageSync('userInfo');
    if (!userIinfo) {
      wx.showToast({
        title: '请先进行登录',
        icon: 'none',
        success: () => {
          //跳转至登录界面
          wx.reLaunch({
            url: '/pages/login/login',
          })
        }
      })
      return
    }
    let nowTime = new Date();
    //更新日期
    this.setData({
      day: ('0' + nowTime.getDate()).slice(-2),
      month: ('0' + (nowTime.getMonth() + 1)).slice(-2),
      year: nowTime.getFullYear()
    })

    this.getRecommendList();

    PubSub.subscribe('switchMusic', (msg,type) => {
      let { recommendList,index } = this.data
      if(type === 'pre'){
        (index === 0) && (index = recommendList.length)
        index -= 1
      }else{
        (index === recommendList.length) && (index = 0)
        index += 1
      }
      this.setData({index})
      PubSub.publish('musicId',recommendList[index].id)
    })
  },
  async getRecommendList() {
    let recommendListData = await request('/recommend/songs', { cookie: wx.getStorageSync('cookie') });
    this.setData({
      recommendList: recommendListData.data.dailySongs
    })
  },
  //跳转至songDetail页面
  toSongDetail(event) {
    let { song, index } = event.currentTarget.dataset;

    this.setData({ index })
    //路由跳转传参：query参数
    wx.navigateTo({
      url: '/pages/songDetail/songDetail?musicId=' + song.id
    })
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

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})