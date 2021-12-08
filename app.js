// app.js
App({
  globalData: {
    isMusicPlay: false,  // 是否有音乐在播放
    musicId: ''
  },
  onLaunch() {
   
  },
  onShow(){
    console.log('onShow')
  },
  onHide(){
    console.log('onHide')
  },
  onError(err){
    console.log('error',err)
  },
  globalData: {
    userInfo: null
  }
})
