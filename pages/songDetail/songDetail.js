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
    lyricVisible: false,
    song: '',
    musicLink: '',
    lyric: '',
    musicId: '1334270281',
    currentTime: '00.00',
    durationTime: '05:03',
    currentWidth: 0
  },



  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // this.setData({
    //   musicId: options.musicId
    // })

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
    }else{
      this.getMusicInfo()
    }

    // 获取歌词 不放在getMusicInfo里是为了更快的播放音乐 
    this.getLyric()
  },
  subscribeSwitch() {
    //订阅来自recommendSong页面
    PubSub.subscribe('musicId', (msg, musicId) => {
      this.setData({musicId})
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
    this.backAudioManager.onEnded(()=>{
      PubSub.publish('switchMusic','next');
      this.setData({
        currentWidth: 0,
        currentTime: '00:00',
        lyric: [],
        lyricTime: 0,
      })
    })
    // 监听音乐实时播放的进度
    this.backAudioManager.onTimeUpdate(()=>{
      const currentTime = moment(this.backAudioManager.currentTime * 1000).format('mm:ss')
      const currentWidth = 450 * (this.backAudioManager.currentTime / this.backAudioManager.duration)
      this.setData({ currentTime,currentWidth })
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
 
    this.setData({song,durationTime,musicLink})

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
    this.setData({isPlay: true})
    this.backAudioManager.src = this.data.musicLink
    this.backAudioManager.title = this.data.song.name
  },
  stopMusic(){
    this.setData({isPlay: false})
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
    let lyric = lyricData.lrc.lyric
    this.setData({
      lyric
    })
    console.log(lyric)
  },
  //传入初始歌词文本text
  formatLyric(text) {
    let result = [];
    let arr = text.split("\n"); //原歌词文本已经换好行了方便很多，我们直接通过换行符“\n”进行切割
    let row = arr.length; //获取歌词行数
    for (let i = 0; i < row; i++) {
      let temp_row = arr[i]; //现在每一行格式大概就是这样"[00:04.302][02:10.00]hello world";
      let temp_arr = temp_row.split("]");//我们可以通过“]”对时间和文本进行分离
      let text = temp_arr.pop(); //把歌词文本从数组中剔除出来，获取到歌词文本了！
      //再对剩下的歌词时间进行处理
      temp_arr.forEach(element => {
        let obj = {};
        let time_arr = element.substr(1, element.length - 1).split(":");//先把多余的“[”去掉，再分离出分、秒
        let s = parseInt(time_arr[0]) * 60 + Math.ceil(time_arr[1]); //把时间转换成与currentTime相同的类型，方便待会实现滚动效果
        obj.time = s;
        obj.text = text;
        result.push(obj); //每一行歌词对象存到组件的lyric歌词属性里
      });
    }
    result.sort(this.sortRule) //由于不同时间的相同歌词我们给排到一起了，所以这里要以时间顺序重新排列一下
    this.setData({
      lyric: result
    })
  },
  sortRule(a, b) { //设置一下排序规则
    return a.time - b.time;
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