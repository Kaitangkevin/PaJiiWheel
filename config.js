window.LUCKY_DRAW_CONFIG = {
  brandName: "PaJii啪唧电竞",
  // 以后只需要改分享链接里的 batch 或 code 参数，就能开启新一轮抽奖。
  // 例如：?batch=round1、?batch=round2、?code=pajii0512
  storageKeyPrefix: "pajii_lucky_drawn_",
  spinDurationMs: 5400,
  spinTurns: 6,
  normalizeWhenTotalMismatch: true,
  totalProbabilityTarget: 100,
  drawButtonText: "立即抽奖",
  finishedButtonText: "已抽奖",
  defaultStatusText: "抽中奖品后，请截图本页面发送给客服核销。",
  modalTitleText: "恭喜你抽中奖品",
  modalResultTemplate:
    "恭喜你抽中：{name}{descriptionText}，请截图本页面发送给客服核销。",
  wheelPalette: ["#22d3ee", "#0f172a", "#38bdf8", "#111827", "#67e8f9"],
  prizes: [
    {
      name: "5元优惠券",
      description: "任意可以使用",
      probability: 40,
    },
    {
      name: "8元优惠券",
      description: "除体验单外可以使用",
      probability: 20,
    },
    {
      name: "10元优惠券",
      description: "除体验单外可以使用",
      probability: 10,
    },
    {
      name: "免费体验单",
      description: "",
      probability: 0,
    },
    {
      name: "谢谢参与",
      description: "欢迎下次再来",
      probability: 30,
    },
  ],
  rules: [
    "每位玩家仅限核销一次。",
    "抽中奖品后，请截图当前中奖页面发送给客服。",
    "优惠券不可叠加使用，不可兑换现金。",
    "重复截图、伪造截图、恶意刷奖无效。",
    "奖品数量有限，先到先得。",
    "最终核销结果以客服确认为准。",
  ],
};
