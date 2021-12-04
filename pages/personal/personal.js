import request from '../../utils/request.js'
// pages/personal/personal.js
let startY = 0 // 手指起始坐标
let moveY = 0 // 手指移动的坐标
let moveDistance // 手指移动的距离
Page({

  /**
   * 页面的初始数据
   */
  data: {
    coverTransform: 'translateY(0)',
    coverTransition: '',
    userInfo: '',
    recentPlayList: []
  },
  toLogin() {
    wx.navigateTo({
      url: '/pages/login/login'
    })
  },
  handleTouchStart(event) {
    startY = event.touches[0].clientY
    this.setData({
      coverTransition: ''
    })
  },
  handleTouchMove(event) {
    moveY = event.touches[0].clientY
    moveDistance = moveY - startY

    if (moveDistance <= 0) {
      return
    }
    if (moveDistance >= 80) {
      moveDistance = 80
    }

    this.setData({
      coverTransform: `translateY(${moveDistance}rpx)`
    })
  },
  handleTouchEnd(event) {
    this.setData({
      coverTransform: `translateY(0)`,
      coverTransition: 'transform 0.5s linear'
    })

  },



  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 读取用户信息
    const userInfo = JSON.parse(wx.getStorageSync('userInfo'));
    console.log(userInfo)
    if(userInfo){
      this.setData({
        userInfo
      })
      
      // 获取用户播放记录
      this.getUserRecentPlay(userInfo.userId)
    }
  },
  async getUserRecentPlay(userId){
    const recentPlayData = await request('/user/record',{uid:userId,type: 1})
    console.log(recentPlayData,'xx')
    const recentPlayList = recentPlayData.weekData.slice(0,10).map((item,index)=>{
      item.id = index   // 手动添加id wx:key
      return item
    })
    this.setData({
      recentPlayList
    })
    console.log(this.data.recentPlayList)
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