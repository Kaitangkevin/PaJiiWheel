# PaJii啪唧电竞幸运大转盘

这是一个纯前端静态网页项目，不需要数据库、不需要登录、不需要后端。

## 文件说明

- `index.html`：页面结构
- `styles.css`：页面样式
- `config.js`：品牌文案、奖项、概率、规则配置
- `script.js`：转盘绘制、抽奖逻辑、弹窗、已抽奖状态

## 如何修改奖品和概率

直接编辑 `config.js` 中的 `prizes` 数组：

```js
prizes: [
  {
    name: "5元优惠券",
    description: "任意可以使用",
    probability: 40,
  },
];
```

说明：

- `name`：奖项名称
- `description`：奖项补充说明
- `probability`：中奖权重

## 概率总和说明

- 当前默认总和是 `100`
- 如果你后续改动后总和不是 `100`，页面会提示
- `normalizeWhenTotalMismatch: true` 时，系统会按照现有权重自动换算抽奖概率

## 本地预览

你可以直接双击 `index.html` 打开，也可以使用静态服务器预览：

```bash
python3 -m http.server 8080
```

然后访问：

```text
http://localhost:8080/
```

## 部署建议

优先推荐：

1. GitHub Pages
2. Cloudflare Pages
3. 腾讯云 COS 静态网站托管
4. 阿里云 OSS 静态网站托管

如果目标用户主要在国内，建议优先使用腾讯云或阿里云静态托管并绑定国内可访问域名。
