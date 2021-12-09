import request from '../../utils/request';
import moment from 'moment';
const appInstance = getApp()
import PubSub from 'pubsub-js';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isPlay: true,  // 进来就播放
    lyricVisible: true,
    song: '',
    musicLink: '',
    lyric: '',
    activeTime: '',
    musicId: '',
    currentTime: '00.00',
    durationTime: '05:03',
    currentWidth: 0,
    lyricTransform: 150
  },



  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      musicId: options.musicId
    })

    // 1 初始化歌曲信息
    this.initMusic()
    // 2 监听音乐播放 暂停
    this.listenStopAndPlay()
    // 3 订阅 上一首下一首
    this.subscribeSwitch()
  },
  initMusic() {

    this.backAudioManager = wx.getBackgroundAudioManager();

    // 当前没有音乐在播放 或者后台播放的音乐不是当前音乐 
    if (!appInstance.globalData.isMusicPlay || appInstance.globalData.musicId !== this.data.musicId) {
      // 1 获取音乐信息
      this.getMusicInfo().then((res) => {
        this.playMusic()
      })
    } else {
      this.getMusicInfo()
    }

    // 获取歌词 不放在getMusicInfo里是为了更快的播放音乐 
    this.getLyric()
  },
  subscribeSwitch() {
    //订阅来自recommendSong页面
    PubSub.subscribe('musicId', (msg, musicId) => {
      this.setData({ musicId })
      //获取歌曲后播放音乐
      this.getMusicInfo().then(res => {
        this.playMusic()
      })
    })
  },
  listenStopAndPlay() {
    this.backAudioManager.onPause(() => {
      this.changePlayState(false)
    })
    this.backAudioManager.onStop(() => {
      this.changePlayState(false)
    })
    this.backAudioManager.onPlay(() => {
      this.changePlayState(true)
      appInstance.globalData.musicId = this.data.musicId
    })
    // 音乐自然播放结束 自动切换到下一首音乐
    this.backAudioManager.onEnded(() => {
      PubSub.publish('switchMusic', 'next');
      this.setData({
        currentWidth: 0,
        currentTime: '00:00',
        lyric: [],
        lyricTime: 0,
      })
    })
    // 监听音乐实时播放的进度
    this.backAudioManager.onTimeUpdate(() => {
      const currentTime = moment(this.backAudioManager.currentTime * 1000).format('mm:ss')
      const currentWidth = 450 * (this.backAudioManager.currentTime / this.backAudioManager.duration)
      this.setData({ currentTime, currentWidth })
      this.getCurrentLyric()
    })
  },
  changePlayState(isPlay) {
    this.setData({
      isPlay
    })
    // 修改全局播放状态
    appInstance.globalData.isMusicPlay = isPlay
  },

  async getMusicInfo() {
    const songData = await request('/song/detail', { ids: this.data.musicId });
    const song = songData.songs[0]

    // 获取音乐时长
    const durationTime = moment(song.dt).format('mm:ss');

    //动态修改窗口标题
    wx.setNavigationBarTitle({
      title: song.ar[0].name + '-' + song.name
    })

    // 获取音乐链接
    let musicLinkData = await request('/song/url', { id: this.data.musicId })
    const musicLink = musicLinkData.data[0].url

    this.setData({ song, durationTime, musicLink })

    return song
  },
  toggleLyric() {
    this.setData({
      lyricVisible: !this.data.lyricVisible
    })
  },
  // 播放暂停
  togglePlay() {
    if (this.data.isPlay) {
      this.stopMusic()
    } else {
      this.playMusic()
    }
  },
  // 播放音乐
  playMusic() {
    this.setData({ isPlay: true })
    this.backAudioManager.src = this.data.musicLink
    this.backAudioManager.title = this.data.song.name
  },
  stopMusic() {
    this.setData({ isPlay: false })
    this.backAudioManager.pause()
  },

  // 切换上一首 下一首
  handleSwitch(event) {
    //切换类型
    let type = event.currentTarget.id;
    //关闭当前播放音乐
    this.stopMusic()

    //发布消息数据给recommendSong页面
    PubSub.publish('switchMusic', type)
  },


  //获取歌词
  async getLyric() {
    let lyricData = await request("/lyric", { id: this.data.musicId });
    this.formatLyric(lyricData.lrc.lyric)
  },
  //传入初始歌词文本text
  formatLyric(text) {
    let lyric = []
    let lyricArr = text.split("\n")
    lyricArr.pop()  // 去除最后一个空行
    for (let i = 0; i < lyricArr.length; i++) {
      let lyricRow = lyricArr[i];
      const match = lyricRow.match(/\[(.+)\](.+)/)
      if (match) {
        const [res, time_s, text] = match
        let time_arr = time_s.substr(1, time_s.length - 1).split(":");//先把多余的“[”去掉，再分离出分、秒
        let time = parseInt(time_arr[0]) * 60 + Math.ceil(time_arr[1]); //把时间转换成与currentTime相同的类型，方便待会实现滚动效果
        const lyricObj = { time, text }
        lyric.push(lyricObj)
      }
    }
    this.setData({ lyric })
  },
  getCurrentLyric() {
    let lyricTime = Math.ceil(this.backAudioManager.currentTime);
    const lyric = this.data.lyric
    for (let i = 0; i < lyric.length; i++) {
      if (lyricTime >= lyric[i].time && lyricTime <= lyric[i + 1].time) {
        this.setData({
          activeTime: lyric[i].time
        })
        // 当播放到第六行歌词时 开始歌词滚动
        // 一行歌词的高度是30px => 60rpx
        if (i >= 4) {
          this.setData({
            lyricTransform: 150 - (i - 4) * 60
          })
          console.log(this.data.lyricTransform,i)
        }
        break
      }
    }
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
    PubSub.unsubscribe('musicId')
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