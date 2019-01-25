
# 批量截图任务

> 作为一个软件工程师，不只是做好自己的本职工作（iOS），而是需要解决项目中的技术问题。这次就是解决自动截图的问题
> 早期公司的数据工程师利用 phantomjs 来截图，后期不断发现截图效率低，加之开发者团队不再维护，因此决定将截图这部分跟你剥离开来，以后方便开发维护。我就承担了这个工作

## puppeteer 

`Puppeteer is a Node library which provides a high-level API to control Chrome or Chromium over the DevTools Protocol. Puppeteer runs headless by default, but can be configured to run full (non-headless) Chrome or Chromium.`


## 安装问题

一开始按照往常的套路（`npm install --save puppeteer`） 好几次都卡住了，后期查找资料发现切换到国内的镜像就可以顺利下载

```power-shell
 PUPPETEER_DOWNLOAD_HOST=https://storage.googleapis.com.cnpmjs.org npm i --save puppeteer
```



* To use Puppeteer in your project, run:
  ```
  PUPPETEER_DOWNLOAD_HOST=https://storage.googleapis.com.cnpmjs.org npm i --save puppeteer
  ```

* Install some basic packages

  ```
  npm install 
  ```

## Usage

```
const puppeteer = require('puppeteer'),
      fs = require('fs'),
      path = require('path'),
      request = require('request')

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

var snapShotFolerPath = path.join(__dirname, '../snspshot/')
mkdirsSync(snapShotFolerPath)

 function snapShot (taskInfo) {
  return new Promise(function (resolve, reject) {

    (async function(){
      // 启动Chromium
      const browser = await puppeteer.launch({ignoreHTTPSErrors: true, headless:true, args: ['--no-sandbox']})
      // 打开新页面
      const page = await browser.newPage()
      // 设置页面分辨率
      await page.setViewport({width: 1920, height: 1080})

      // 访问
      await page.goto(taskInfo.websiteUrl, {waitUntil: 'domcontentloaded'}).catch(err => console.log(err))
      await page.waitFor(1000)

      try {
        // 截图
        await page.screenshot({path: snapShotFolerPath + taskInfo.imageName, fullPage:true}).catch(err => {
          console.log('截图失败: ' + err)
        });
        await page.waitFor(6000)
      } catch (e) {
        console.log('failed ' + e)
      } finally {
        await browser.close()

        fs.stat(snapShotFolerPath + taskInfo.imageName, function(err,stats){
          if (err) {
            reject('fail')
          } else {                                                                                                  
            if (stats.isFile()) {
              resolve('success')
            }
          }
        })
      }

    })()
  })
}

module.exports = snapShot
```


## 如何安装 (Linux 、Unix 操作系统)
  
- 如果你有翻墙环境
  1. 执行 npm install
  2. 执行 npm start

- 如果你没有翻墙环境
  1. 打开 package.json 文件，检查 dependencies 项目，如果 key 为 puppeteer 的条目，先删除该条目。
  2. 进入工程命令行，输入 PUPPETEER_DOWNLOAD_HOST=https://storage.googleapis.com.cnpmjs.org npm i --save puppeteer
  3. 执行 npm install 命令
  4. 执行 npm start

## 流程说明

 1. while 循环去调用接口去获取当前的截图任务
    - 在有截图任务情况下继续截图
    - 没有截任务的情况下，为了避免浪费资源，程序休眠10分钟后继续下一次的获取截图任务
    - 如果遇到调用截图任务接口500错误，则强制停止截图任务，相应的服务端工程师去查询失败原因
 2. 如果有截图任务那么就去截图
   - 截图后将截图图片保存到文件夹，命令为当前日期 yyyy-MM-dd-hh-mm-ss-S 格式。然后将结果上传到服务端
   - 截图失败将当前任务结果保存到本地 failedTasks.json 文件夹一份，然后上传到服务端
 3. 截图成功不管失败还是成功都去通知服务端。如果失败将当前任务告诉服务端，如果成功将当前任务信息和截图成功的绝对路径告诉服务端

## 一些说明

  Demo 中执行 `npm start` 真正执行的是 quickStart.js 中的代码。完整的“获取截图任务、截图、截图上传到OSS、失败则将失败任务上传到服务”逻辑在 index.js 文件中
 - 工程是在没有提供真正的接口获取任务，而是采用随机数获取截图任务
 - 截图成功后将结果上传到OSS这一个步骤是没有的，采用 log 出来
 - 失败的上传也是不存在的，log 打印而已

## todoList

 - 多线程高效率的去截图
 - 一些写法暂时比较粗糙，不优雅，待改进
 - puppeteer 很强大，大家可以去研究下

[代码地址](https://github.com/FantasticLBP/BatchSnapshot)
