# Read-Mode-Pro-Crack
Chrome Extension (Read Mode Pro 1.2.6.0) Crack

（2021-10-25 发布）

（插件版本为 1.2.6.0 ，若此方法失效，请联系我）


---
<br>
<br>


# 一、下载 crx 文件 （最好去官方网站下载）
专门下载 crx 文件的小工具：[Get CRX - Chrome 网上应用店](https://chrome.google.com/webstore/detail/get-crx/dijpllakibenlejkbajahncialkbdkjc)

Reader Mode Pro插件地址：[Reader Mode Pro - Chrome 网上应用店](https://chrome.google.com/webstore/detail/reader-mode-pro/koddbhkhginnhnfnhgldkampappgmmje)

<br>

# 二、解压 crx 文件
下载完的 crx 文件，可以把 crx 后缀换成 zip，然后解压

<br>

# 三、用记事本打开文件 "background.js"
目录：``你解压到的目录\Reader Mode Pro - Chrome 网上应用店 1.2.6.0\javascripts\background.js``

打开文件后，在第37行 （这一行意思是判断许可证是否为空，许可证内容长度是否大于30）：

```javascript
if (license.cr_license !== undefined && Object.keys(license.cr_license).length > 1 && license.cr_license.key.length > 30) {
```

直接让它跳过判断，这一行修改为：
```javascript
if (true) {
```

#### 保存文件

<br>

# 四、Chrome 扩展程序页面，加载已解压的扩展程序
1. 打开Chrome，转到扩展程序页面：``chrome://extensions``
2. 在右上角把开发者模式打开
3. 加载已解压的程序，选择刚刚解压的文件夹 ``Reader Mode Pro - Chrome 网上应用店 1.2.6.0`` 这个目录

<br>

# 五、完成
<br>
<br>
<br>
<br>


#### 注：
- 其他基于 Chromium 浏览器一样可以
- 仅供学习使用，仅供学习使用，仅供学习使用
- 请勿用于其他目的，产生的后果自负
- 插件版权归 [reader mode.io](https://readermode.io/) 所有
