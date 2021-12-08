// pages/video/video.js
import request from '../../utils/request'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    videoGroupList: [],
    videoList: [],
    activeNav: '',
    activeVideo: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getVideoGroupList()

  },
  // 获取导航数据
  async getVideoGroupList() {
    const videoGroupListData = await request('/video/group/list')
    this.setData({
      videoGroupList: videoGroupListData.data.slice(0, 14),
      activeNav: videoGroupListData.data[0].id
    })
    this.getVideoList(this.data.activeNav)

  },
  // 获取视频列表数据
  async getVideoList(navId) {
    const videoListData = await request('/video/group', { id: navId, cookie: wx.getStorageSync('cookie') })
    let videoList = []
    videoListData.datas.forEach(async (item, index) => {
      // item.id = index
      const result = await request('/video/url', { id: item.data.vid })
      console.log(result, 'result')
      item.url = result.urls[0].url
      item.id = result.urls[0].id
      this.setData({
        videoList: videoListData.datas
      })
    })
    wx.hideLoading();
  },

  changeNav(event) {
    console.log(event)
    const navId = event.currentTarget.dataset.id
    this.setData({
      activeNav: +navId,
      videoList: []
    })
    wx.showLoading({
      title: '正在加载',
    })
    this.getVideoList(this.data.activeNav)
  },

  //点击播放回调
  handlePlay(event) {
    let vid = event.currentTarget.id;

    //如何确认点击播放的视频与正在播放的视频不是同一个(通过vid的对比)
    this.vid !== vid && this.videoContext && this.videoContext.pause();

    this.setData({
      activeVideo: vid
    })

    //创建控制video的实例对象
    this.vid = vid;
    this.videoContext = wx.createVideoContext(vid);
    //判断当前的视频是否播放过，有播放记录，有则跳转到之上次播放的位置
    this.videoContext.play()

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
    console.log('refresh')
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
    return {
      title: '来自心意云音乐的转发'
    }
  }
})