import request from '../../utils/request';
// import moment from 'moment';
const appInstance = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isPlay: false,
    lyricVisible: false,
    song: '',
    lyric: [],
    musicId: '',
  },
  toggleLyric() {
    this.setData({
      lyricVisible: !this.data.lyricVisible
    })
  },
  // 播放暂停
  togglePlay() {
    this.setData({
      isPlay: !this.data.isPlay
    })
    this.musicControl()
  },
  // 控制音乐播放
  async musicControl() {
    if (this.data.isPlay) {
      // 获取音乐播放链接
      let musicLinkData = await request('/song/url', { id: this.data.musicId })
      let musicLink = musicLinkData.data[0].url

      this.backAudioManager.src = musicLink
      this.backAudioManager.title = this.data.song.name
    } else {
      this.backAudioManager.pause()
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    let musicId = options.song
    this.setData({
      musicId
    })
    this.getMusicInfo(musicId)
    this.getLyric(musicId)

    this.backAudioManager = wx.getBackgroundAudioManager();
    // 判断当前的音乐是否在播放
    if(appInstance.globalData.isMusicPlay && appInstance.globalData.musicId === musicId){
      this.setData({
        isPlay: true
      })
    }else{
      this.backAudioManager.pause()
    }

    // 监听音乐播放 暂停
    this.listenStopAndPlay()
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
  },
  changePlayState(isPlay) {
    this.setData({
      isPlay
    })
    // 修改全局播放状态
    appInstance.globalData.isMusicPlay = isPlay
  },

  async getMusicInfo(musicId) {
    let songData = await request('/song/detail', { ids: musicId });
    console.log(songData)
    // let durationTime = moment(songData.songs[0].dt).format('mm:ss');
    this.setData({
      song: songData.songs[0],
      // durationTime: durationTime
    })
    //动态修改窗口标题
    wx.setNavigationBarTitle({
      title: this.data.song.ar[0].name + '-' + this.data.song.name
    })
  },

  // 切换上一首 下一首
  handleSwitch(event){
  //切换类型
    let type = event.currentTarget.id;
    console.log(type,'type')
    //关闭当前播放音乐
    this.backAudioManager.stop();

    //订阅来自recommendSong页面
    // PubSub.subscribe('musicId',(msg,musicId) => {
    //   //获取歌曲
    //   this.getMusicInfo(musicId);
    //   //自动播放当前音乐
    //   this.musicControl(true,musicId);
    //   //取消订阅
    //   PubSub.unsubscribe('musicId');
    // })
    // //发布消息数据给recommendSong页面
    // PubSub.publish('switchMusic',type);
  },

  //获取歌词
  async getLyric(musicId) {
    let lyricData = await request("/lyric", { id: musicId });
    let lyric = this.formatLyric(lyricData.lrc.lyric);
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