# 项目报告移动阅读版

来源：用户提供的 E:/磁州窑/总总总总.doc。原文件未修改。

网页位置：“我的” → “我常看的纹样”上方的总结报告入口。

阅读结构：
- 概览：项目简介、项目资料、采集成果和目录。
- 七章主报告、两篇研究专题，以及心得、致谢、参考文献与附件。
- 章节内部按小节展开；表格支持横向滚动，49 张报告配图支持放大。

原报告中的封面重复页、自动目录域代码、签名图片未放入网页。概览文字作了压缩整理，正文按来源保留；项目指标采用中文主报告的口径，相关杂志文章保留“拟发表”状态。附件沿用原报告的外部链接，本次未另行验证其在线可访问性。

维护文件：
- assets/js/report-data.js：报告内容与配图索引。
- assets/js/view-report.js：概览和分节阅读页面。
- assets/css/report.css：卡片与阅读排版。
- assets/img/report/：网页配图副本。
- docs/report/content-map.json：来源与内容范围记录。

重新从原文件整理时，可依次执行 extract_doc.py、extract_figures.py、prepare_report.py、structure_report.py，再执行 node tools/build-single.mjs。Python 脚本使用 Pillow；extract_figures.py 生成的 work 文件夹是临时核对材料，可在完成后删除。
