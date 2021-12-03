// app.js
App({
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
