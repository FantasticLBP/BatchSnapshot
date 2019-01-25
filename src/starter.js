var SnapShot = require('./index'),
    ResultPoster = require('./postresult'),
    path = require('path'),
    fs = require('fs'),
    Tools = require('./util'),
    request = require('request')

var failedTasksPathName = path.join(__dirname, "./../failedtaskList")
Tools.mkdirsSync(failedTasksPathName)

/*
* 截图 + 截图成功后的处理
*/
async function handleSnapshotTask (taskInfo) {

  return new Promise(function(resolve,reject) {
    (async function(){

      let snapResult = {}
      if (JSON.stringify(taskInfo) == '{}') {
        resolve(200)
        return 
      }
      try {
        snapResult = await SnapShot(taskInfo)
        console.log('任务结果-> ' + JSON.stringify(snapResult))
        if (snapResult.code == 500) {
          fs.appendFileSync(failedTasksPathName + '/failedTasks.json', JSON.stringify(taskInfo, null, 4) + ',')
          console.log(`任务将失败的截图任务写入文件保存成功，文件路径为${failedTasksPathName + '/failedTasks.json'}😊😊`)
        }
      } catch (error) {
        console.log('任务error-> ' + JSON.stringify(error))
        if (error.code == 500) {
          snapResult = error
        }
        fs.appendFileSync(failedTasksPathName + '/failedTasks.json', JSON.stringify(taskInfo, null, 4) + ',')
        console.log(`任务将失败的截图任务写入文件保存成功，文件路径为${failedTasksPathName + '/failedTasks.json'}😊😊`)
      }

      try {
        if (snapResult.code == 500) {
          let result =  await ResultPoster.postFailResult(taskInfo, snapResult.filePath)
          console.log('截图失败任务已上传 🌞🌞' + result)
        } else {
          let result =  await ResultPoster.postSuccessResult(taskInfo, snapResult.filePath)
          console.log('截图成功任务已上传 😄😄 ' + result)
        }
      } catch (error) {
        console.log('截图结果上传失败' + error)
      }
      resolve(200)

    })()
  })
}

//获取截图任务
async function fetchTask () {
  return new Promise(function(resolve,reject){
    let requestUrl = 'http://192.168.0.107:8000/springboot/getonetask'
    request.get(requestUrl, function(error, response, body){
      if (!error && response.statusCode == 200) {
        try {
          let task = JSON.parse(body).info
          if (JSON.stringify(task) == '{}') {
            resolve({
              code: 201,
              info: '暂时没任务啦'
            })
          } else{
            resolve({
              code: 200,
              info: task.data
            })
          }
        } catch (error) {
          resolve({
            code: 202,
            info: JSON.stringify(error)
          })
        }
      } else {
        resolve({
          code: 500,
          info: ''
        })
      }
    })
  })
}


// 不断循环开始整个截图处理任务
async function startSnapshotTask () {
  while (true) {
    try {
      let taskInfo = await fetchTask()
      console.log('')
      console.log('----------------------------------------')
      if (taskInfo.code == 200) {
        await handleSnapshotTask(taskInfo.info)
      } else if (taskInfo.code == 201) {
        console.log('☕️☕️☕️ 暂时没任务啦，休息10分钟吧 ☕️☕️☕️')
        await Tools.sleep(10*60*1000)
      } else if (taskInfo.code == 202) {
        console.info(taskInfo.info)
      } else if (taskInfo.code == 500){
        console.log('☠️☠️☠️ 获取截图任务出现异常。找人来看看吧 ☠️☠️☠️')
        process.exit()
      }
    } catch (error) {
      console.log('出幺蛾子了：' + JSON.stringify(error))
    }
  }
}

startSnapshotTask()