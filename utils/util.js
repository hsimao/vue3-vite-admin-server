const log4js = require('./log4js')

const CODE = {
  SUCCESS: 200,
  PARAM_ERROR: 10001, // 參數錯誤
  USER_ACCOUNT_ERROR: 20001, // 帳號或密碼錯誤
  USER_LOGIN_ERROR: 30001, // 用戶未登入
  BUSINESS_ERROR: 40001, // 業務請求失敗
  AUTH_ERROR: 50001, // 認證失敗或 TOKEN 過期
}

module.exports = {
  /**
   * mongoDB 分頁結構封裝
   * @param {number} pageNum
   * @param {number} pageSize
   */
  pager({ pageNum = 1, pageSize = 10 }) {
    // 轉數字
    pageNum *= 1
    pageSize *= 1
    const skipIndex = (pageNum - 1) * pageSize

    return {
      page: {
        pageNum,
        pageSize,
      },
      skipIndex,
    }
  },
  success(data = '', msg = '', code = CODE.SUCCESS) {
    log4js.debug(data)
    return {
      code,
      data,
      msg,
    }
  },
  fail(msg = '', code = CODE.BUSINESS_ERROR) {
    log4js.debug(msg)
    return {
      code,
      msg,
      data: null,
    }
  },
  CODE,
}
