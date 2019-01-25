const puppeteer = require('puppeteer'),
      fs = require('fs'),
      path = require('path'),
      request = require('request'),
      utils = require('util')

function mkdirsSync(dirname) {
  if (fs.existsSync(dirname)) {
    return true
  } else {
    if (mkdirsSync(path.dirname(dirname))) {
      fs.mkdirSync(dirname)
      return true
    }
  }
}


function snapShot(taskInfo) {
  return new Promise(function (resolve, reject) {

    (async function () {
      if (!taskInfo) {
        console.log('任务有毒')
        reject({
          code: 500,
          filePath: ''
        })
      }

      let snapshotName = String(new Date().Format('yyyy-MM-dd-hh-mm-ss-S')) + '000.png'
      // 启动Chromium
      const browser = await puppeteer.launch({ ignoreHTTPSErrors: true, headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] }).catch( err => {
        console.log('launch-err: ' + err)
        reject({
          code: 500,
          filePath: ''
        })
      })
      // 打开新页面
      const page = await browser.newPage()
      // 设置页面分辨率
      await page.setViewport({ width: 1920, height: 1080 })

      // 访问
      console.log('截图网址-> ' + taskInfo.detailUrl )
      let snapShotFolerPath = path.join(__dirname, '../snspshot/' + taskInfo.area + '/' + taskInfo.type + '/' + taskInfo.city + '/' + taskInfo.region ) 
      mkdirsSync(snapShotFolerPath)
      await page.goto(taskInfo.detailUrl, { waitUntil: ['domcontentloaded', 'load','networkidle0'] ,timeout: 180000 }).catch(err => {
        console.log('goto-err-> ' + err)
        reject({
          code: 500,
          filePath: ''
        })
      })
      await page.waitFor(10000)

      try {
        // 截图
        await page.screenshot({ path: snapShotFolerPath + '/' +snapshotName, fullPage: true }).catch(err => {
          console.log('screenshot-err-> ' + err)
          reject({
            code: 500,
            filePath: ''
          })
        })
      } catch (e) {
        console.log('failed ' + e)
        reject({
          code: 500,
          filePath: ''
        })
      } finally {
        await browser.close()
        let snapShotPath = snapShotFolerPath + '/' + snapshotName

        fs.stat(snapShotPath, function (err, stats) {
          if (err) {
            // 文件信息读取失败则视为本次截图任务失败
            console.log(snapShotPath + '文件信息读取失败')
            reject({
              code: 500,
              filePath: ''
            })
          } else {
            if (stats.isFile()) {
              //文件存在则任务截图成功
              resolve({
                code: 200,
                filePath: snapShotPath
              })
            } else {  // 不是文件也视为本次截图任务失败
              reject({
                code: 500,
                filePath: ''
              })
            }
          }
        })
      }
    })()
  })
}

module.exports = snapShot