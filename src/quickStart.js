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
      
      if (snapResult.code == 500) {
        console.log('截图失败任务 😢😢' + JSON.stringify(taskInfo,2))
      } else {
        console.log('截图成功任务 😄😄 ' + JSON.stringify(taskInfo, 2))
      }
      resolve(200)
    })()
  })
}


// 模拟接口获取截图任务
async function fetchTask () {
  return new Promise(function(resolve,reject){
    let task1 = {
      detailUrl: 'https://github.com/FantasticLBP',
      area: '浙江',
      type: 'Github',
      city: '杭州',
      region: '西湖'
    }
    let task2 = {
        detailUrl: 'https://github.com/FantasticLBP/Anti-WebSpider',
        area: '浙江',
        type: '大前端反爬虫方案',
        city: '杭州',
        region: '西湖'
    }
    let task3 = {
        detailUrl: 'https://github.com/FantasticLBP/Company-Website-Pro',
        area: '浙江',
        type: '现代公司企业官网以及电子商务产品网站',
        city: '杭州',
        region: '西湖'
    }
    let task4 = {
        detailUrl: 'https://github.com/FantasticLBP/BlogDemos',
        area: '浙江',
        type: '本项目主要保存一些自己平时写的博文Demo或者一些小实验',
        city: '杭州',
        region: '西湖'
    }
    let info = {}

    switch ((parseInt(Math.random()*10+1))%5) {
        case 1:
            info = task1
            break;
        case 2:
            info = task2
            break;
        case 3:
            info = task3
            break;
        case 4:
            info = task4
            break;
        default:
            break;
    }
    resolve({
      code: 200,
      info: info
    })
  })
}


// 通过模拟接口不断循环开始整个截图处理任务
async function quickStartSnapshotTask () {
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

quickStartSnapshotTask()
