import request from '../../utils/request'
// pages/index/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    statusBarHeight: 20,
    navigationBarHeight: 60,
    searchKeyWords: '搜索搜索',
    today: '1',
    bannerList: [],
    recommendList: [],
    topList: [],

  },
  getOpenId(){
    // 1 获取登录code
    wx.login({
      async success(res){
        let { code } = res
        //  2 将code发送给服务器
        let result  = await request('/getOpenId',{code})
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    // 获取用户唯一标识
    this.getOpenId()

    this.getNavigationBarHeight()
    this.getSearchKeywords()

    // 获取banner
    const bannerData = await request("/banner", { type: 2 })
    this.setData({
      bannerList: bannerData.banners
    })

    // 获取推荐歌单
    let recommendListData = await request('/personalized', { limit: 10 })
    this.setData({
      recommendList: recommendListData.result
    })

    // 获取排行榜
    const topListData = await request('/toplist');
    const topList = topListData.list.slice(0, 4)
    this.setData({
      topList
    })
    // 获取前四个榜单下的前三首数据
    for (let i = 0; i < topList.length; i++) {
      let songList = await request(`/playlist/detail?id=${topList[i].id}`)
      topList[i].tracks = songList.playlist.tracks.slice(0, 3)
    }
    this.setData({
      topList
    })
  },
  getNavigationBarHeight(){
    // 状态栏高度
    const { statusBarHeight, platform } = wx.getSystemInfoSync()
    // 胶囊按钮高度 和 高
    const { top, height } = wx.getMenuButtonBoundingClientRect()


    // 判断胶囊按钮信息是否成功获取
    if (top && top !== 0 && height && height !== 0) {

      const navigationBarHeight = (top - statusBarHeight) * 3 + height + statusBarHeight
      this.setData({ statusBarHeight,navigationBarHeight })

    } else {
      this.setData({
        navigationBarHeight: platform === 'android' ? 68 : 60
      })
    }
  },
  async getSearchKeywords(){
    const keyWordsData = await request('/search/default')
    this.setData({
      searchKeyWords: keyWordsData.data.showKeyword 
    })
  },
  toPage(event) {
    const page = event.currentTarget.dataset.page
    wx.navigateTo({
      url: `/pages/${page}/${page}`
    })
  },
  toPlayList(event){
    wx.navigateTo({
      url: '/pages/playlist/playlist?id=' + event.currentTarget.id
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.setData({
      today: new Date().getDate()
    })
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