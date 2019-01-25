const request = require('request')

var postSuccessResult = async function (snapInfo, snapShotPath) {

  return new Promise(function (resolve, reject) {

    let requestUrl = 'http://192.168.0.107:8000/springboot/donetask'
    let params = {
      task : snapInfo,
      path: snapShotPath
    }
    
    request({
      url: requestUrl,
      method: "POST",
      json: true,
      headers: {
          "content-type": "application/json",
      },
      body: params
    }, function(error, response, body) {
        if (!error && response.statusCode == 200) {
          resolve(true)
        } else {
          resolve(false)
        }
    })
  })
}

var postFailResult = async function (snapInfo, snapShotPath) {

  return new Promise(function (resolve, reject) {
    let requestUrl = 'http://192.168.0.107:8000/springboot/errortask'
    let params = {
      task : snapInfo,
      status: 0
    }
  
    request({
      url: requestUrl,
      method: "POST",
      json: true,
      headers: {
          "content-type": "application/json",
      },
      body: params
    }, function(error, response, body) {
        if (!error && response.statusCode == 200) {
          resolve(true)
        } else {
          resolve(false)
        }
    })
  })
}

module.exports = {
  postSuccessResult: postSuccessResult,
  postFailResult: postFailResult
}