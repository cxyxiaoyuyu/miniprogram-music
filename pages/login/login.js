import request from '../../utils/request.js'
// pages/login/login.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    phone: '13501600459',
    password: 'cxy12345'
  },
  handleInput(event) {
    const type = event.currentTarget.id
    this.setData({
      [type]: event.detail.value
    })

  },
  async login() {
    const { phone, password } = this.data
    // 验证手机号
    if (!phone) {
      wx.showToast({
        title: '手机号不能为空',
        icon: 'none'
      })
      return;
    } else {
      //正则表达式
      let phoneReg = /^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/;
      if (!phoneReg.test(phone)) {
        wx.showToast({
          title: '手机号格式错误',
          icon: 'none'
        })
        return;
      }
    }

    // 密码不能为空 
    if (!password) {
      wx.showToast({
        title: '密码不能为空',
        icon: 'none'
      })
      return;
    }

    const result = await request('/login/cellphone', { phone, password },true)
    if (result.code === 200) {
      wx.showToast({
        title: '登录成功',
        icon: 'none'
      })
      console.log(result,'result')
      // 存储个人信息
      wx.setStorageSync('userInfo', JSON.stringify(result.profile));
      // 存储cookie
      wx.setStorageSync('cookie',result.cookie)
        
      // 跳转至个人中心页面
      wx.reLaunch({
        url: '/pages/personal/personal'
      })
    } else {
      wx.showToast({
        title: result.message,
        icon: 'none'
      })
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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