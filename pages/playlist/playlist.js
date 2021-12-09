// pages/playlist/playlist.js
import request from '../../utils/request'
import PubSub from 'pubsub-js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    listId: '',//歌单id
    playList: [],//歌曲对象
    listImg: '',//歌单图片
    discribe: '',//歌单描述
    index: 0,//下标
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
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

    //获取歌单id
    this.setData({
      listId: options.id
    })

    //获取歌单歌曲
    this.getPlayList();

    //订阅来自songDetail页面发布的消息
    PubSub.subscribe('switchMusic', (msg, type) => {
      let { playList, index } = this.data;
      if (type === 'pre') {//上一首
        (index === 0) && (index = playList.length);
        index -= 1;
      } else {//下一首
        (index === playList.length - 1) && (index = -1);
        index += 1;
      }

      //更新下标
      this.setData({
        index: index
      })

      let musicId = playList[index].id;
      //将音乐id回传给songDetail页面
      PubSub.publish('musicId', musicId);
    })
  },

  //获取歌单所对应的歌曲
  async getPlayList() {
    let playListData = await request("/playlist/detail", { id: this.data.listId });
    console.log(playListData, 'playlistData')
    this.setData({
      playList: playListData.playlist.tracks,
      listImg: playListData.playlist.coverImgUrl,
      discribe: playListData.playlist.name
    })
  },

  //跳转至songDetail页面
  toSongDetail(event) {
    let { song, index } = event.currentTarget.dataset;

    this.setData({
      index: index
    })
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
    // 避免多次订阅 
    PubSub.unsubscribe('switchMusic')
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