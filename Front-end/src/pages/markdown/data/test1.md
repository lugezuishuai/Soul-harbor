# 如何开发网页应用
:::note 
通过本文，你可以将已有的网页系统上线到飞书工作台。预计时间：3 分钟。
:::

##  创建一个网页应用

进入[飞书开放平台---开发者后台](https://open.feishu.cn/app/)，登录飞书账号后，创建应用，详情查看[如何创建企业自建应用](/ssl:ttdoc/uQjL04CN/ukzM04SOzQjL5MDN)。创建完成后，点击应用进入详情页，点击侧边栏的**网页**，开启网页。


##  主页配置

- 桌面端主页：在桌面端飞书工作台打开应用主页（桌面端暂不支持调用 Native 能力）
- 移动端主页：在移动端飞书工作台打开应用主页
- 管理后台主页：企业管理员可以从企业管理后台访问该页面进行应用配置

![图片名称](//sf1-ttcdn-tos.pstatp.com/obj/website-img/a0f7300f426ca5dd872e87211a64be19_home.png)

![图片名称](//sf1-ttcdn-tos.pstatp.com/obj/website-img/60f61a22cc01befc457f5e9d4dd247c0_6.png)

##  接入开放平台的登录和鉴权系统

::: note
如果不需要以下三个功能，可以忽略这一步。
:::

接入开放平台登录和鉴权系统，你可以实现如下功能：
- 飞书中实现免登录打开网页应用；
- 获取开放平台提供的能力和 API；
- 接入 H5-JS-SDK，并使用需要鉴权的 Native API。

开放平台的登录认证使用的开放平台 SSO，web 登录请参考[客户端内网页免登](/ssl:ttdoc/uYjL24iN/ukTO4UjL5kDO14SO5gTN)。


::: note
需要配置 OAuth 重定向 URL， 具体说明参考[配置安全域名](/ssl:ttdoc/uQjL04CN/uYjN3QjL2YzN04iN2cDN)
:::

## 接入 H5-JS-SDK

::: note
这一步是为了调用飞书 Native 的能力，如果之前你的网页应用是在浏览器环境下打开的，可以忽略这一步。
:::

如果你的网页应用已经接入过其它平台的 JS-SDK，你需要接入H5-JS-SDK，详细使用请看 [H5-JS-SDK 使用说明](/ssl:ttdoc/uYjL24iN/uITO4IjLykDOy4iM5gjM)。

H5-JS-SDK 的 API 文档请看 [API文档](/ssl:ttdoc/ukTMukTMukTM/ugjN1EjL4YTNx4CO2UTM)。

如果想看 H5-JS-SDK 的示例代码和效果，请看[示例代码](/ssl:ttdoc/uYjL24iN/uYDM04iNwQjL2ADN)。

##  开发调试

 - 在开发过程中，你可能需要用飞书真机调试一下，你可以通过[这个地址](https://lark.bytedance.net/)下载飞书。
 - 为你的页面地址生成一个二维码，然后用飞书扫码进行真机调试。
 - 本地开发的地址，类似 <http://192.168.1.10:8080/> 本机地址，这种情况，手机和电脑需要在同一个局域网内。
 - 如果还没上线之前，想看看你的线上网页应用效果，用线上网页应用的页面地址生成二维码即可。

##  发布应用
进入 **开放平台** > [**开发者后台**](https://open.feishu.cn/app) > **应用详情** > **版本管理与发布**，创建版本并提交发布申请，具体可见：[如何开发企业自建应用](/ssl:ttdoc/uQjL04CN/ukzM04SOzQjL5MDN)-在企业内发布上线。

## 代码测试
```xml
<view class="page-cells page-cells_after-title">
    <view class="page-cell page-cell_input">
        <input class="page-input"
            placeholder="这个只有在按钮点击的时候才聚焦" focus="{{focus}}" />
    </view>
</view>
<view class="btn-area">
  <button bindtap="bindButtonTap">使得输入框获取焦点</button>
</view>
<view class="page-cells page-cells_after-title">
<view class="page-cell page-cell_input">
    <input class="page-input"
        placeholder="focus详情"
        bindfocus="onfocus" bindconfirm="onconfirm" />
</view>
</view>
<view class="btn-area">{{focusDetail}}</view>
<view class="page-cells page-cells_after-title">
<view class="page-cell page-cell_input">
    <input class="page-input" placeholder="blur测试" bindblur="onblur" />
</view>
</view>
<view class="page-cells page-cells_after-title">
    <view class="page-cell page-cell_input">
        <input class="page-input"
            placeholder="这个只有在按钮点击的时候才聚焦" focus="{{focus}}" />
    </view>
</view>
<view class="btn-area">
  <button bindtap="bindButtonTap">使得输入框获取焦点</button>
</view>
<view class="page-cells page-cells_after-title">
<view class="page-cell page-cell_input">
    <input class="page-input"
        placeholder="focus详情"
        bindfocus="onfocus" bindconfirm="onconfirm" />
</view>
</view>
<view class="btn-area">{{focusDetail}}</view>
<view class="page-cells page-cells_after-title">
<view class="page-cell page-cell_input">
    <input class="page-input" placeholder="blur测试" bindblur="onblur" />
</view>
</view>
```

```shell
npm run start
```

## API

### PreviewLayout

| 参数     | 说明                       | 类型 | 默认值 | 版本  |
| :------- | :------------------------- | :--: | :----: | :---: |
| children | 传递的组件，可以是任意组件 | jsx  |  null  | 0.1.0 |

### MdPreviewer

| 参数 | 说明          |  类型  | 默认值 | 版本  |
| :--- | :------------ | :----: | :----: | :---: |
| md   | markdown 文档 | string |  null  | 0.1.0 |

### CodePreviewer

| 参数     | 说明           |  类型  | 默认值 | 版本  |
| :------- | :------------- | :----: | :----: | :---: |
| code     | 要显示的代码   | string |  null  | 0.0.1 |
| showCode | 是否要展示代码 |  bool  |  true  | 0.1.0 |

| Feature    | Support              |
| ---------: | :------------------- |
| CommonMark | 100%                 |
| GFM        | 100% w/ `remark-gfm` |

$P(v)=\frac{1}{1+exp(-v/T)}$

$\sum_i^na_i$