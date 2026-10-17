/* ==========================================================================
   data.js —— 语料内容层
   说明：以下纹样资料、窑址与展览信息均为演示用示例文案，用于呈现信息结构，
   正式上线前请替换为博物馆审核后的学术数据。
   ========================================================================== */
(function () {
  const CZ = (window.CZ = window.CZ || {});
  const D = (CZ.DATA = {});

  const pad = (i) => String(i).padStart(2, '0');

  D.app = {
    name: '磁州窑数智化图案语料库',
    museum: '中国磁州窑遗址博物馆',
    version: 'v1.2.0 · 内测版',
    slogan: '黑与白的艺术',
    notice: '磁州窑数智化图案语料库 APP 即将上线，首批开放 1,286 件纹样高清数据与注释语料',
    stats: [
      { n: '1,286', l: '收录纹样' },
      { n: '342', l: '历史语料' },
      { n: '12', l: '窑址点位' },
      { n: '9', l: '工艺工序' }
    ]
  };

  D.hero = [
    { id: 'h1', variant: 'museum', title: '中国磁州窑遗址博物馆', sub: '黑白之间，千年窑火', tag: '馆藏' },
    { id: 'h2', variant: 'kiln', title: '观台窑址 · 馒头窑群', sub: '一窑一器，薪火不息', tag: '窑址' },
    { id: 'h3', variant: 'shards', title: '白地黑花 · 瓷片纹样', sub: '残片之上，纹样犹新', tag: '纹样' },
    { id: 'h4', variant: 'saggars', title: '匣钵装烧 · 窑具遗存', sub: '火路有序，成品有度', tag: '工艺' },
    { id: 'h5', variant: 'glaze', title: '化妆土与施釉', sub: '施白为地，以刀代笔', tag: '技法' }
  ];
  D.heroLink = {
    h1: '#/exhibitions', h2: '#/craft/kiln', h3: '#/list/plant', h4: '#/craft/saggar', h5: '#/craft/glaze'
  };

  /* ------------------------------------------------------------------ 装饰分类 */
  D.categories = {
    plant: { key: 'plant', title: '植物装饰', subtitle: '简练豪放，写意质朴', art: 'peony', motif: 'peony' },
    figure: { key: 'figure', title: '人物装饰', subtitle: '笔底故事，人间情味', art: 'child', motif: 'child' }
  };

  D.groups = {
    plant: [
      { key: 'mudan', name: '牡丹纹', motif: 'peony', count: 12 },
      { key: 'juancao', name: '卷草纹', motif: 'scroll', count: 8 },
      { key: 'lianhua', name: '莲花纹', motif: 'lotus', count: 8 },
      { key: 'juhua', name: '菊花纹', motif: 'chrys', count: 6 }
    ],
    figure: [
      { key: 'yingxi', name: '婴戏纹', motif: 'child', count: 9 },
      { key: 'gushi', name: '人物故事纹', motif: 'story', count: 6 },
      { key: 'shenxian', name: '神仙纹', motif: 'immortal', count: 5 }
    ]
  };

  // 各纹样的构图变化（决定图形生成方式）
  const COMPS = {
    peony: ['single', 'broken', 'cluster', 'wrap', 'band', 'medallion', 'scatter', 'single', 'broken', 'cluster', 'medallion', 'wrap'],
    scroll: ['single', 'band', 'scatter', 'medallion', 'single', 'band', 'scatter', 'medallion'],
    lotus: ['single', 'medallion', 'band', 'broken', 'cluster', 'medallion', 'single', 'band'],
    chrys: ['single', 'cluster', 'medallion', 'broken', 'scatter', 'single'],
    child: ['single', 'pair', 'medallion', 'single', 'pair', 'single', 'medallion', 'pair', 'single'],
    story: ['single', 'pair', 'medallion', 'pair', 'single', 'medallion'],
    immortal: ['single', 'medallion', 'single', 'pair', 'medallion']
  };
  const COMP_LABEL = {
    single: '单独纹样', broken: '折枝式', cluster: '簇花式', wrap: '缠枝式',
    band: '连续纹样', medallion: '适合纹样', scatter: '散点式', pair: '对称式'
  };

  // 每类纹样的命名、器物、年代、技法、产地
  const META = {
    peony: {
      names: ['折枝牡丹纹', '缠枝牡丹纹', '牡丹纹', '白地黑花牡丹纹', '珍珠地牡丹纹', '牡丹纹开光'],
      wares: ['元宝枕', '梅瓶', '四系罐', '大盘', '钵', '长方枕'],
      tech: ['白化妆刻花', '白地黑花', '珍珠地划花', '白釉划花', '黑釉剔花'],
      era: ['宋', '金', '北宋', '金代', '宋末金初'],
      themes: [
        ['折枝牡丹纹', '牡丹纹', '折枝花卉纹', '植物纹样', '磁州窑装饰纹样'],
        ['缠枝牡丹纹', '缠枝纹', '牡丹纹', '连续纹样', '白地黑花'],
        ['牡丹纹', '花卉纹', '开光装饰', '磁州窑纹样', '陶瓷装饰']
      ],
      meaning: [
        '富贵、荣华、吉祥、繁盛、兴旺、世俗审美、民间吉祥观念',
        '富贵圆满、家业兴旺、花开富贵、多子多福',
        '吉祥富贵、和美圆满、生机不息、民间祈福'
      ],
      form: [
        '折枝构图、局部取象、去地化、装饰化处理、连续纹样、单元式纹样、散点式布局',
        '缠枝骨架、二方连续、枝蔓回旋、花叶互为宾主、布局匀称',
        '适合式构图、随器成形、开光分隔、主次分明、留白得当'
      ],
      context: [
        '宋金时期、民窑体系、市民文化、商品生产、世俗化审美',
        '金代磁州窑鼎盛期、批量生产、枕类器物、民间日用',
        '宋代北方民窑、白地黑花成熟期、画工署名传统'
      ],
      sample: [
        '折枝牡丹纹是磁州窑牡丹花及其枝叶为局部提取与重组，具有装饰性与象征性。牡丹在宋金时期被视作富贵祥瑞之花，折枝形式则更便于随器布陈，常在枕面、瓶腹以单枝或双枝构图，配合白地黑花的对比手法，形成简练豪放、写意质朴的面貌。',
        '缠枝牡丹纹以回旋的枝蔓为骨架，花头与叶片交替换位，形成二方连续的装饰带。画工以毛笔直接绘于化妆土上，用笔爽利，黑白反差强烈，是磁州窑最具辨识度的装饰语言之一。',
        '该纹样采用适合式构图，随器物曲面布陈，主花居中、枝叶环护，边饰以卷草收束，整体疏密有致，体现了民窑画工对器形与纹样关系的熟练把握。'
      ]
    },
    scroll: {
      names: ['卷草纹', '缠枝卷草纹', '忍冬卷草纹', '卷草纹边饰', '水波卷草纹'],
      wares: ['瓶', '罐', '枕', '碗', '盘'],
      tech: ['白地黑花', '白化妆刻花', '黑釉剔花', '划花'],
      era: ['宋', '金', '北宋', '金代'],
      themes: [
        ['卷草纹', '缠枝纹', '边饰纹样', '植物纹样', '连续纹样'],
        ['忍冬卷草', '卷草纹', '二方连续', '装饰带', '磁州窑边饰'],
        ['水波卷草', '卷草纹', '辅助纹样', '带状构图']
      ],
      meaning: [
        '生生不息、绵延不断、吉祥连绵、生命轮回',
        '绵长不绝、福泽连绵、枝叶繁盛',
        '源远流长、绵延吉庆、柔韧不折'
      ],
      form: [
        '二方连续、带状构图、骨架匀齐、波峰波谷交替、叶形统一',
        '缠枝骨架、单元重复、节奏均匀、主次相依',
        '边饰环绕、随器转折、疏密有节奏、收放自如'
      ],
      context: [
        '宋金民窑装饰体系、边饰传统、与主纹配合使用',
        '磁州窑批量生产、辅助纹样规范化、画工分工',
        '北方民窑交流、纹样传播、商品化生产'
      ],
      sample: [
        '卷草纹以波状枝蔓为骨架，叶片与卷涡交替排列，形成节奏均匀的带状装饰，多用于器物的肩部、腹部或枕面边沿，起到分隔与收束画面的作用。磁州窑卷草纹用笔迅疾，黑白对比明快，兼具装饰性与书写性。',
        '卷草纹来源于忍冬、卷耳等植物形态的抽象化处理，经长期演变为高度程式化的连续纹样。在磁州窑器物上，它常与牡丹、莲花等主纹配合，构成主次分明的装饰层次。'
      ]
    },
    lotus: {
      names: ['莲花纹', '缠枝莲纹', '莲瓣纹', '一束莲纹', '莲花纹开光'],
      wares: ['碗', '盘', '罐', '枕', '净瓶'],
      tech: ['白地黑花', '白化妆刻花', '划花', '篦划纹'],
      era: ['宋', '金', '北宋', '金代'],
      themes: [
        ['莲花纹', '莲瓣纹', '植物纹样', '佛教因素', '磁州窑装饰'],
        ['一束莲', '莲花纹', '缠枝莲', '吉祥纹样'],
        ['莲瓣纹', '多层花瓣', '适合纹样', '陶瓷装饰']
      ],
      meaning: [
        '清净、高洁、连生贵子、吉祥、出淤泥而不染',
        '清廉高洁、平安连年、子孙绵延',
        '洁净吉祥、和美圆满、佛家意涵'
      ],
      form: [
        '多层花瓣、放射式布局、对称均衡、瓣形规整',
        '缠枝骨架、花头饱满、叶片穿插、疏密相间',
        '适合式构图、随器转折、层叠排布'
      ],
      context: [
        '宋金时期、民间信仰、佛教世俗化、日用器物装饰',
        '磁州窑白地黑花成熟期、商品化生产',
        '北方民窑体系、纹样程式化、批量生产'
      ],
      sample: [
        '莲花纹在磁州窑器物中多为多层花瓣的程式化表现，瓣形饱满、排列规整，配合留白形成明快的黑白层次。莲花既承载佛教清净意涵，也在民间语境中引申为连生贵子、平安连年的吉祥祝愿。',
        '缠枝莲纹以缠绕的枝蔓串联花头，形成连续的装饰带。画工用笔连贯，花瓣以一笔或两笔写就，体现出民窑装饰讲求速度与整体气势的特点。'
      ]
    },
    chrys: {
      names: ['菊花纹', '折枝菊纹', '团菊纹', '菊花纹盏', '菊瓣纹'],
      wares: ['盏', '碗', '盘', '枕', '小罐'],
      tech: ['白地黑花', '白化妆刻花', '印花', '划花'],
      era: ['宋', '金', '北宋', '金代'],
      themes: [
        ['菊花纹', '折枝菊', '植物纹样', '团花', '磁州窑装饰'],
        ['团菊纹', '菊花纹', '适合纹样', '吉祥纹样'],
        ['菊瓣纹', '放射式花瓣', '辅助纹样']
      ],
      meaning: [
        '长寿、延年、清雅、隐逸、秋实',
        '益寿延年、高洁自持、岁岁平安',
        '清雅高洁、康健长寿'
      ],
      form: [
        '放射式花瓣、团花构图、瓣形细密、中心留白',
        '折枝构图、主花突出、枝叶相辅',
        '适合式构图、随器布陈、层次分明'
      ],
      context: [
        '宋金民间审美、重阳习俗、日用装饰',
        '磁州窑商品生产、纹样通俗化',
        '北方民窑体系、装饰程式化'
      ],
      sample: [
        '菊花纹多以细密的放射状花瓣构成团花，中心作小蕊，外形圆满。宋金时期民间重九赏菊之风盛行，菊花由此成为器物上的常见题材，既取清雅之意，也寄延年之愿。',
        '折枝菊纹取菊花一枝，配以叶片，构图疏朗，常施于碗盏内底，与白地黑花的明快对比相得益彰。'
      ]
    },
    child: {
      names: ['婴戏纹', '婴戏莲纹', '童子蹴鞠纹', '双婴戏莲纹', '婴戏牡丹纹'],
      wares: ['枕', '罐', '盘', '碗', '梅瓶'],
      tech: ['白地黑花', '白化妆刻花', '珍珠地划花'],
      era: ['宋', '金', '北宋', '金代'],
      themes: [
        ['婴戏纹', '童子', '人物纹样', '民间生活', '吉祥图案'],
        ['婴戏莲', '童子持莲', '吉祥纹样', '民间信仰'],
        ['双婴', '蹴鞠', '民俗活动', '磁州窑人物装饰']
      ],
      meaning: [
        '多子多福、子孙绵延、生活富足、平安喜乐',
        '连生贵子、人丁兴旺、吉庆有余',
        '童趣天真、家族繁盛、世俗欢愉'
      ],
      form: [
        '人物居中、以线造型、衣纹简括、动态夸张、留白为地',
        '对称式构图、双人呼应、道具点题',
        '适合式构图、随枕面布陈、背景留白'
      ],
      context: [
        '宋金市民文化、民间求子观念、枕类器物流行',
        '磁州窑商品生产、民俗题材盛行',
        '北方民窑人物画传统、画工署名'
      ],
      sample: [
        '婴戏纹是磁州窑人物装饰中最富生气的题材。画工以寥寥数笔勾出童子体态，圆头丰颊、衣纹简括，或持莲、或蹴鞠、或嬉戏于花间，笔意爽利，形象憨拙可爱，反映出宋金民间对多子多福的朴素祈愿。',
        '婴戏莲纹将童子与莲花组合，取「连生贵子」之谐音寓意，多施于枕面。画面以白地为底，黑彩为形，黑白关系明快，是磁州窑白地黑花人物装饰的代表性样式。'
      ]
    },
    story: {
      names: ['人物故事纹', '携琴访友纹', '高士图纹', '童子诵书纹', '人物故事纹开光'],
      wares: ['枕', '罐', '梅瓶', '盘'],
      tech: ['白地黑花', '白化妆刻花', '红绿彩'],
      era: ['宋', '金', '金代', '宋末金初'],
      themes: [
        ['人物故事纹', '高士图', '叙事性装饰', '民间戏曲', '世俗生活'],
        ['携琴访友', '文人题材', '故事纹样'],
        ['诵书童子', '科举文化', '民俗题材']
      ],
      meaning: [
        '崇文重教、福禄寿喜、劝勉教化、生活理想',
        '友爱知音、文雅高逸、出世情怀',
        '教子成才、功名期许、家道兴隆'
      ],
      form: [
        '横向展开、人物叙事、场景化处理、背景留白、题记辅助',
        '连环式布局、主次人物分明、道具点题',
        '适合式构图、随器布陈、情节凝练'
      ],
      context: [
        '金代市民文化、戏曲繁荣、民间教化需求',
        '磁州窑商品生产、叙事装饰流行',
        '北方民窑人物画传统、题记与画工署名'
      ],
      sample: [
        '人物故事纹把情节性内容搬上器物，常见携琴访友、高士雅集、童子诵书等题材，画面常配题记以点明内容。这类装饰既满足观赏需求，也承担劝勉教化的功能，是金代市民文化兴盛的物证。',
        '该纹样以横向展开的叙事布局呈现，人物以线造型，衣纹用笔迅疾，背景大块留白，使情节一目了然。磁州窑画工将绘画语言转化为器物装饰语言，形成了朴素而鲜活的民间样式。'
      ]
    },
    immortal: {
      names: ['神仙纹', '仙人乘云纹', '八仙纹', '仙人祝寿纹', '云中仙人纹'],
      wares: ['罐', '枕', '梅瓶', '盘'],
      tech: ['白地黑花', '白化妆刻花', '红绿彩'],
      era: ['金', '宋', '金代', '元代'],
      themes: [
        ['神仙纹', '道教因素', '民间信仰', '人物纹样', '祥瑞'],
        ['仙人乘云', '祥云纹', '道教题材'],
        ['八仙', '祝寿', '吉庆题材']
      ],
      meaning: [
        '长生久视、吉祥如意、超脱尘世、祈福禳灾',
        '得道长生、福寿绵长、云游自在',
        '吉庆祝寿、护佑平安、仙凡相通'
      ],
      form: [
        '人物与云纹组合、动态飘逸、衣带当风、留白为云',
        '对称式构图、云气环绕、主次分明',
        '适合式构图、随器布陈、虚实相生'
      ],
      context: [
        '金元道教兴盛、民间信仰世俗化、日用器物装饰',
        '磁州窑商品生产、道教题材流行',
        '北方民窑体系、宗教与民俗交融'
      ],
      sample: [
        '神仙纹多见于金元磁州窑器物，仙人脚踏云气、衣带飘举，与卷曲云纹相互穿插。道教信仰在民间社会的普及，使这类题材成为器物装饰的常见选择，寄托长生久视、祈福禳灾的愿望。',
        '此纹以人物与云纹的组合见长，云气以连续的卷涡表现，既作背景又起分隔作用，虚实相生，构图饱满而不拥塞。'
      ]
    }
  };

  /* ------------------------------------------------------------------ 生成纹样数据 */
  const patterns = [];
  Object.keys(D.groups).forEach((catKey) => {
    D.groups[catKey].forEach((g) => {
      const meta = META[g.motif];
      const comps = COMPS[g.motif];
      for (let i = 1; i <= g.count; i++) {
        const k = i - 1;
        const comp = comps[k % comps.length];
        const tech = meta.tech[k % meta.tech.length];
        const era = meta.era[k % meta.era.length];
        const ware = meta.wares[k % meta.wares.length];
        const nameBase = meta.names[k % meta.names.length];
        const title = nameBase;
        const themes = meta.themes[k % meta.themes.length];
        const sources = ['磁州窑', '彭城窑', '观台窑', '冶子窑'];
        const sizeW = 22 + ((k * 3) % 16), sizeH = 18 + ((k * 5) % 14), sizeT = 4 + ((k * 2) % 9);
        patterns.push({
          id: catKey + '-' + g.key + '-' + pad(i),
          cat: catKey,
          group: g.key,
          groupName: g.name,
          motif: g.motif,
          comp: comp,
          styleLabel: COMP_LABEL[comp],
          no: pad(i),
          listName: g.name + pad(i),
          title: title,
          meta: {
            name: title + ware,
            era: era + '代',
            tech: tech,
            origin: sources[k % sources.length],
            size: '长' + sizeW + '厘米、宽' + sizeH + '厘米、高' + (sizeT + 8) + '厘米'
          },
          themes: themes,
          meaning: meta.meaning[k % meta.meaning.length],
          form: meta.form[k % meta.form.length],
          context: meta.context[k % meta.context.length],
          sample: meta.sample[k % meta.sample.length],
          views: 120 + ((k * 37) % 860),
          updated: ['3 天前', '上周', '2 周前', '昨天', '本月'][k % 5],
          lineArt: true
        });
      }
    });
  });
  // 新增图片沿用现有示例文案，原始 34 条植物纹样内容与 ID 保持不变。
  // 新素材单独收录；不从训练标签生成年代、器物出处等学术信息。
  D.groups.plant.find((g) => g.key === 'juancao').count = 10;
  D.groups.plant.push(
    { key: 'chanzhi', name: '缠枝纹', motif: 'peony', count: 31 },
    { key: 'huahui', name: '花卉纹样', motif: 'peony', count: 54 }
  );
  const addedPlantImages = [
  {
    "id": "plant-chanzhi-01",
    "template": "plant-mudan-04",
    "group": "chanzhi",
    "no": "01"
  },
  {
    "id": "plant-chanzhi-02",
    "template": "plant-mudan-04",
    "group": "chanzhi",
    "no": "02"
  },
  {
    "id": "plant-chanzhi-03",
    "template": "plant-mudan-04",
    "group": "chanzhi",
    "no": "03"
  },
  {
    "id": "plant-chanzhi-04",
    "template": "plant-mudan-04",
    "group": "chanzhi",
    "no": "04"
  },
  {
    "id": "plant-chanzhi-05",
    "template": "plant-mudan-04",
    "group": "chanzhi",
    "no": "05"
  },
  {
    "id": "plant-chanzhi-06",
    "template": "plant-mudan-04",
    "group": "chanzhi",
    "no": "06"
  },
  {
    "id": "plant-chanzhi-07",
    "template": "plant-mudan-04",
    "group": "chanzhi",
    "no": "07"
  },
  {
    "id": "plant-chanzhi-08",
    "template": "plant-mudan-04",
    "group": "chanzhi",
    "no": "08"
  },
  {
    "id": "plant-chanzhi-09",
    "template": "plant-mudan-04",
    "group": "chanzhi",
    "no": "09"
  },
  {
    "id": "plant-chanzhi-10",
    "template": "plant-mudan-04",
    "group": "chanzhi",
    "no": "10"
  },
  {
    "id": "plant-chanzhi-11",
    "template": "plant-mudan-04",
    "group": "chanzhi",
    "no": "11"
  },
  {
    "id": "plant-chanzhi-12",
    "template": "plant-mudan-04",
    "group": "chanzhi",
    "no": "12"
  },
  {
    "id": "plant-chanzhi-13",
    "template": "plant-mudan-04",
    "group": "chanzhi",
    "no": "13"
  },
  {
    "id": "plant-chanzhi-14",
    "template": "plant-mudan-04",
    "group": "chanzhi",
    "no": "14"
  },
  {
    "id": "plant-chanzhi-15",
    "template": "plant-mudan-04",
    "group": "chanzhi",
    "no": "15"
  },
  {
    "id": "plant-chanzhi-16",
    "template": "plant-mudan-04",
    "group": "chanzhi",
    "no": "16"
  },
  {
    "id": "plant-chanzhi-17",
    "template": "plant-mudan-04",
    "group": "chanzhi",
    "no": "17"
  },
  {
    "id": "plant-chanzhi-18",
    "template": "plant-mudan-04",
    "group": "chanzhi",
    "no": "18"
  },
  {
    "id": "plant-chanzhi-19",
    "template": "plant-mudan-04",
    "group": "chanzhi",
    "no": "19"
  },
  {
    "id": "plant-chanzhi-20",
    "template": "plant-mudan-04",
    "group": "chanzhi",
    "no": "20"
  },
  {
    "id": "plant-chanzhi-21",
    "template": "plant-mudan-04",
    "group": "chanzhi",
    "no": "21"
  },
  {
    "id": "plant-chanzhi-22",
    "template": "plant-mudan-04",
    "group": "chanzhi",
    "no": "22"
  },
  {
    "id": "plant-chanzhi-23",
    "template": "plant-mudan-04",
    "group": "chanzhi",
    "no": "23"
  },
  {
    "id": "plant-chanzhi-24",
    "template": "plant-mudan-04",
    "group": "chanzhi",
    "no": "24"
  },
  {
    "id": "plant-chanzhi-25",
    "template": "plant-mudan-04",
    "group": "chanzhi",
    "no": "25"
  },
  {
    "id": "plant-chanzhi-26",
    "template": "plant-mudan-04",
    "group": "chanzhi",
    "no": "26"
  },
  {
    "id": "plant-chanzhi-27",
    "template": "plant-mudan-04",
    "group": "chanzhi",
    "no": "27"
  },
  {
    "id": "plant-chanzhi-28",
    "template": "plant-mudan-04",
    "group": "chanzhi",
    "no": "28"
  },
  {
    "id": "plant-chanzhi-29",
    "template": "plant-mudan-04",
    "group": "chanzhi",
    "no": "29"
  },
  {
    "id": "plant-chanzhi-30",
    "template": "plant-mudan-04",
    "group": "chanzhi",
    "no": "30"
  },
  {
    "id": "plant-chanzhi-31",
    "template": "plant-mudan-04",
    "group": "chanzhi",
    "no": "31"
  },
  {
    "id": "plant-juancao-09",
    "template": "plant-juancao-01",
    "group": "juancao",
    "no": "09"
  },
  {
    "id": "plant-juancao-10",
    "template": "plant-juancao-01",
    "group": "juancao",
    "no": "10"
  },
  {
    "id": "plant-huahui-01",
    "template": "plant-mudan-01",
    "group": "huahui",
    "no": "01"
  },
  {
    "id": "plant-huahui-02",
    "template": "plant-mudan-02",
    "group": "huahui",
    "no": "02"
  },
  {
    "id": "plant-huahui-03",
    "template": "plant-mudan-03",
    "group": "huahui",
    "no": "03"
  },
  {
    "id": "plant-huahui-04",
    "template": "plant-mudan-04",
    "group": "huahui",
    "no": "04"
  },
  {
    "id": "plant-huahui-05",
    "template": "plant-mudan-05",
    "group": "huahui",
    "no": "05"
  },
  {
    "id": "plant-huahui-06",
    "template": "plant-mudan-06",
    "group": "huahui",
    "no": "06"
  },
  {
    "id": "plant-huahui-07",
    "template": "plant-mudan-07",
    "group": "huahui",
    "no": "07"
  },
  {
    "id": "plant-huahui-08",
    "template": "plant-mudan-08",
    "group": "huahui",
    "no": "08"
  },
  {
    "id": "plant-huahui-09",
    "template": "plant-mudan-09",
    "group": "huahui",
    "no": "09"
  },
  {
    "id": "plant-huahui-10",
    "template": "plant-mudan-10",
    "group": "huahui",
    "no": "10"
  },
  {
    "id": "plant-huahui-11",
    "template": "plant-mudan-11",
    "group": "huahui",
    "no": "11"
  },
  {
    "id": "plant-huahui-12",
    "template": "plant-mudan-12",
    "group": "huahui",
    "no": "12"
  },
  {
    "id": "plant-huahui-13",
    "template": "plant-mudan-01",
    "group": "huahui",
    "no": "13"
  },
  {
    "id": "plant-huahui-14",
    "template": "plant-mudan-02",
    "group": "huahui",
    "no": "14"
  },
  {
    "id": "plant-huahui-15",
    "template": "plant-mudan-03",
    "group": "huahui",
    "no": "15"
  },
  {
    "id": "plant-huahui-16",
    "template": "plant-mudan-04",
    "group": "huahui",
    "no": "16"
  },
  {
    "id": "plant-huahui-17",
    "template": "plant-mudan-05",
    "group": "huahui",
    "no": "17"
  },
  {
    "id": "plant-huahui-18",
    "template": "plant-mudan-06",
    "group": "huahui",
    "no": "18"
  },
  {
    "id": "plant-huahui-19",
    "template": "plant-mudan-07",
    "group": "huahui",
    "no": "19"
  },
  {
    "id": "plant-huahui-20",
    "template": "plant-mudan-08",
    "group": "huahui",
    "no": "20"
  },
  {
    "id": "plant-huahui-21",
    "template": "plant-mudan-09",
    "group": "huahui",
    "no": "21"
  },
  {
    "id": "plant-huahui-22",
    "template": "plant-mudan-10",
    "group": "huahui",
    "no": "22"
  },
  {
    "id": "plant-huahui-23",
    "template": "plant-mudan-11",
    "group": "huahui",
    "no": "23"
  },
  {
    "id": "plant-huahui-24",
    "template": "plant-mudan-12",
    "group": "huahui",
    "no": "24"
  },
  {
    "id": "plant-huahui-25",
    "template": "plant-mudan-01",
    "group": "huahui",
    "no": "25"
  },
  {
    "id": "plant-huahui-26",
    "template": "plant-mudan-02",
    "group": "huahui",
    "no": "26"
  },
  {
    "id": "plant-huahui-27",
    "template": "plant-mudan-03",
    "group": "huahui",
    "no": "27"
  },
  {
    "id": "plant-huahui-28",
    "template": "plant-mudan-04",
    "group": "huahui",
    "no": "28"
  },
  {
    "id": "plant-huahui-29",
    "template": "plant-mudan-05",
    "group": "huahui",
    "no": "29"
  },
  {
    "id": "plant-huahui-30",
    "template": "plant-mudan-06",
    "group": "huahui",
    "no": "30"
  },
  {
    "id": "plant-huahui-31",
    "template": "plant-mudan-07",
    "group": "huahui",
    "no": "31"
  },
  {
    "id": "plant-huahui-32",
    "template": "plant-mudan-08",
    "group": "huahui",
    "no": "32"
  },
  {
    "id": "plant-huahui-33",
    "template": "plant-mudan-09",
    "group": "huahui",
    "no": "33"
  },
  {
    "id": "plant-huahui-34",
    "template": "plant-mudan-10",
    "group": "huahui",
    "no": "34"
  },
  {
    "id": "plant-huahui-35",
    "template": "plant-mudan-11",
    "group": "huahui",
    "no": "35"
  },
  {
    "id": "plant-huahui-36",
    "template": "plant-mudan-12",
    "group": "huahui",
    "no": "36"
  },
  {
    "id": "plant-huahui-37",
    "template": "plant-mudan-01",
    "group": "huahui",
    "no": "37"
  },
  {
    "id": "plant-huahui-38",
    "template": "plant-mudan-02",
    "group": "huahui",
    "no": "38"
  },
  {
    "id": "plant-huahui-39",
    "template": "plant-mudan-03",
    "group": "huahui",
    "no": "39"
  },
  {
    "id": "plant-huahui-40",
    "template": "plant-mudan-04",
    "group": "huahui",
    "no": "40"
  },
  {
    "id": "plant-huahui-41",
    "template": "plant-mudan-05",
    "group": "huahui",
    "no": "41"
  },
  {
    "id": "plant-huahui-42",
    "template": "plant-mudan-06",
    "group": "huahui",
    "no": "42"
  },
  {
    "id": "plant-huahui-43",
    "template": "plant-mudan-07",
    "group": "huahui",
    "no": "43"
  },
  {
    "id": "plant-huahui-44",
    "template": "plant-mudan-08",
    "group": "huahui",
    "no": "44"
  },
  {
    "id": "plant-huahui-45",
    "template": "plant-mudan-09",
    "group": "huahui",
    "no": "45"
  },
  {
    "id": "plant-huahui-46",
    "template": "plant-mudan-10",
    "group": "huahui",
    "no": "46"
  },
  {
    "id": "plant-huahui-47",
    "template": "plant-mudan-11",
    "group": "huahui",
    "no": "47"
  },
  {
    "id": "plant-huahui-48",
    "template": "plant-mudan-12",
    "group": "huahui",
    "no": "48"
  },
  {
    "id": "plant-huahui-49",
    "template": "plant-mudan-01",
    "group": "huahui",
    "no": "49"
  },
  {
    "id": "plant-huahui-50",
    "template": "plant-mudan-02",
    "group": "huahui",
    "no": "50"
  },
  {
    "id": "plant-huahui-51",
    "template": "plant-mudan-03",
    "group": "huahui",
    "no": "51"
  },
  {
    "id": "plant-huahui-52",
    "template": "plant-mudan-04",
    "group": "huahui",
    "no": "52"
  },
  {
    "id": "plant-huahui-53",
    "template": "plant-mudan-05",
    "group": "huahui",
    "no": "53"
  },
  {
    "id": "plant-huahui-54",
    "template": "plant-mudan-06",
    "group": "huahui",
    "no": "54"
  }
];
  addedPlantImages.forEach((entry) => {
    const template = patterns.find((p) => p.id === entry.template);
    const group = D.groups.plant.find((g) => g.key === entry.group);
    patterns.push(Object.assign({}, template, {
      id: entry.id,
      group: entry.group,
      groupName: group.name,
      no: entry.no,
      listName: group.name + entry.no
    }));
  });
  // 分类以用户确认的原始文件夹为准：两组 mudan 素材均为牡丹纹。
  // 保留既有 ID，以兼容收藏、历史记录和详情链接。
  const plantSourceGroups = {"mudan": ["plant-mudan-01", "plant-mudan-02", "plant-mudan-03", "plant-mudan-04", "plant-mudan-05", "plant-mudan-06", "plant-mudan-07", "plant-mudan-08", "plant-mudan-09", "plant-mudan-10", "plant-mudan-11", "plant-mudan-12", "plant-lianhua-01", "plant-lianhua-02", "plant-lianhua-03", "plant-lianhua-04", "plant-lianhua-05", "plant-lianhua-06", "plant-lianhua-07", "plant-lianhua-08", "plant-juhua-01", "plant-juhua-02", "plant-juhua-03", "plant-juhua-04", "plant-juhua-05", "plant-juhua-06", "plant-huahui-01", "plant-huahui-02", "plant-huahui-03", "plant-huahui-04", "plant-huahui-05", "plant-huahui-06", "plant-huahui-07", "plant-huahui-08", "plant-huahui-09", "plant-huahui-10", "plant-huahui-11", "plant-huahui-12", "plant-huahui-13", "plant-huahui-14", "plant-huahui-15", "plant-huahui-16", "plant-huahui-17", "plant-huahui-18", "plant-huahui-19", "plant-huahui-20", "plant-huahui-21", "plant-huahui-22", "plant-huahui-23", "plant-huahui-24", "plant-huahui-25", "plant-huahui-26", "plant-huahui-27", "plant-huahui-28", "plant-huahui-29", "plant-huahui-30", "plant-huahui-31", "plant-huahui-32", "plant-huahui-33", "plant-huahui-34", "plant-huahui-35", "plant-huahui-36", "plant-huahui-37", "plant-huahui-38", "plant-huahui-39", "plant-huahui-40", "plant-huahui-41", "plant-huahui-42", "plant-huahui-43", "plant-huahui-44", "plant-huahui-45", "plant-huahui-46", "plant-huahui-47", "plant-huahui-48", "plant-huahui-49", "plant-huahui-50", "plant-huahui-51", "plant-huahui-52", "plant-huahui-53", "plant-huahui-54"], "juancao": ["plant-juancao-01", "plant-juancao-02", "plant-juancao-03", "plant-juancao-04", "plant-juancao-05", "plant-juancao-06", "plant-juancao-07", "plant-juancao-08", "plant-juancao-09", "plant-juancao-10"], "chanzhi": ["plant-chanzhi-01", "plant-chanzhi-02", "plant-chanzhi-03", "plant-chanzhi-04", "plant-chanzhi-05", "plant-chanzhi-06", "plant-chanzhi-07", "plant-chanzhi-08", "plant-chanzhi-09", "plant-chanzhi-10", "plant-chanzhi-11", "plant-chanzhi-12", "plant-chanzhi-13", "plant-chanzhi-14", "plant-chanzhi-15", "plant-chanzhi-16", "plant-chanzhi-17", "plant-chanzhi-18", "plant-chanzhi-19", "plant-chanzhi-20", "plant-chanzhi-21", "plant-chanzhi-22", "plant-chanzhi-23", "plant-chanzhi-24", "plant-chanzhi-25", "plant-chanzhi-26", "plant-chanzhi-27", "plant-chanzhi-28", "plant-chanzhi-29", "plant-chanzhi-30", "plant-chanzhi-31"]};
  D.groups.plant = [
    { key: 'mudan', name: '牡丹纹', motif: 'peony', count: 80 },
    { key: 'juancao', name: '卷草纹', motif: 'scroll', count: 10 },
    { key: 'chanzhi', name: '缠枝纹', motif: 'peony', count: 31 }
  ];
  Object.keys(plantSourceGroups).forEach((key) => {
    const group = D.groups.plant.find((g) => g.key === key);
    plantSourceGroups[key].forEach((id, index) => {
      const p = patterns.find((item) => item.id === id);
      if (!p) return;
      if (key === 'mudan' && (p.group === 'lianhua' || p.group === 'juhua')) {
        // Correct old flower names in visible text along with their classification.
        const rename = (text) => text.replace(/莲花|菊花|莲瓣|菊瓣|团菊|莲纹|菊纹/g,
          (word) => ({ '莲花': '牡丹', '菊花': '牡丹', '莲瓣': '牡丹花瓣',
            '菊瓣': '牡丹花瓣', '团菊': '团牡丹', '莲纹': '牡丹纹', '菊纹': '牡丹纹' }[word]));
        ['title', 'meaning', 'form', 'context', 'sample'].forEach((field) => { p[field] = rename(p[field]); });
        p.themes = p.themes.map(rename);
        p.meta = Object.assign({}, p.meta, { name: rename(p.meta.name) });
      }
      p.group = key;
      p.groupName = group.name;
      p.motif = group.motif;
      p.no = String(index + 1).padStart(2, '0');
      p.listName = group.name + p.no;
    });
  });
  D.patterns = patterns;
  D.byId = (id) => D.patterns.filter((p) => p.id === id)[0];
  D.siblings = (p) => D.patterns.filter((x) => x.group === p.group && x.id !== p.id);

  /* ------------------------------------------------------------------ 传统烧制工艺 */
  D.craftIntro = '磁州窑创烧于北朝，鼎盛于宋金，以白地黑花、白化妆刻花著称。一件器物的成型需经选料、练泥、拉坯、修坯、刻花、施釉、装窑、烧成等工序，环环相扣，故有「一窑一器」之说。';

  D.crafts = [
    { id: 'clay', art: 'clay', step: '01', name: '选料与练泥', short: '取土淘洗，反复捶练', era: '全期',
      desc: '磁州窑就地取材，取大青土、二青土配以化妆土原料，经淘洗、沉淀、晾晒后反复捶练，排出泥中气泡，使泥料致密均匀，为成型打下基础。',
      points: ['大青土与二青土按比例配制', '淘洗沉淀去除粗砂杂质', '反复捶练、陈腐，提高可塑性', '含水量控制在成型所需区间'],
      flaws: ['泥料含水不均易开裂', '气泡未排尽烧成后起泡'] },
    { id: 'wheel', art: 'wheel', step: '02', name: '拉坯成型', short: '轮上取形，一气呵成', era: '宋金',
      desc: '在辘轳轮盘上以手拉制坯体，凭手感控制器壁厚薄与器形曲线。枕类、瓶罐多用拉坯或泥板粘合成型，是决定器物比例与气韵的关键环节。',
      points: ['轮盘匀速，双手对称用力', '器壁厚薄一致，底足稍厚', '枕类以泥板粘合成型', '半干时修坯，旋出底足'],
      flaws: ['器壁过薄易塌陷', '干燥过快产生变形'] },
    { id: 'carve', art: 'shards', step: '03', name: '化妆土与刻花', short: '施白为地，以刀代笔', era: '宋金',
      desc: '在坯体上施一层白色化妆土，再以竹刀、篦子剔刻纹样，露出胎色形成黑白对比；或直接在化妆土上用黑彩绘画，即白地黑花。',
      points: ['化妆土须均匀覆盖胎面', '剔花以刀代笔，讲究一气呵成', '珍珠地以圆管戳印为地', '刻花与划花技法结合使用'],
      flaws: ['化妆土与胎体收缩不一致而剥落', '刻划过深伤及胎体'] },
    { id: 'glaze', art: 'glaze', step: '04', name: '施釉', short: '蘸釉吹釉，薄厚由人', era: '宋金',
      desc: '器物以蘸釉、浇釉或吹釉方式施透明釉，釉层厚薄直接影响发色与光泽。磁州窑多数器物施半截釉，形成独特的露胎效果。',
      points: ['蘸釉时间决定釉层厚度', '半截釉便于叠烧、减少粘连', '釉面须洁净无油污', '釉浆浓度需随时调整'],
      flaws: ['釉层过厚易流釉粘底', '釉面针孔、缩釉'] },
    { id: 'saggar', art: 'saggars', step: '05', name: '装窑', short: '匣钵套叠，火路有序', era: '宋金',
      desc: '将器物装入匣钵，按火路与温度梯度码放于馒头窑内。装窑方式决定窑内气氛与成品率，是窑工经验的集中体现。',
      points: ['依火路分布决定器物位置', '匣钵套叠以隔绝烟灰', '支钉、垫圈防止粘连', '窑门与火膛留出火道'],
      flaws: ['码放过密导致生烧', '匣钵破裂落砂'] },
    { id: 'fuel', art: 'fuel', step: '06', name: '烧成', short: '薪火数日，火候难欺', era: '宋金',
      desc: '以木柴为燃料，经升温、保温、降温数日完成烧成。窑工凭观察火色判断温度，控制氧化与还原气氛，最终决定釉色与胎质。',
      points: ['升温分阶段控制，避免惊裂', '还原气氛影响釉色深浅', '保温阶段使釉面成熟', '自然冷却，忌急开窑'],
      flaws: ['升温过快造成器物炸裂', '气氛不当导致发色灰暗'] },
    { id: 'kiln', art: 'kiln', step: '07', name: '馒头窑', short: '倒焰升烟，窑室如馒', era: '宋金',
      desc: '磁州窑典型窑炉为馒头窑，窑室呈半球形，火焰自火膛上升后倒流至窑底，经烟囱排出，蓄热性能好，适合北方寒冷气候下的长期烧造。',
      points: ['窑室半球形，蓄热稳定', '倒焰式火路，温度均匀', '烟囱设于窑后，抽力可调', '窑壁以耐火砖砌筑'],
      flaws: ['窑壁开裂漏气', '烟道堵塞影响抽力'] },
    { id: 'museum', art: 'museum', step: '08', name: '窑址与展陈', short: '遗址为证，纹样可读', era: '当代',
      desc: '观台窑址、彭城窑址等遗存出土大量瓷片与窑具，成为研究纹样谱系与工艺流变的实物依据，也是数字化语料库的数据来源。',
      points: ['窑址地层与年代序列', '瓷片纹样的类型学比对', '窑具与装烧工艺复原', '数字化采集与三维记录'],
      flaws: ['遗存扰动影响断代', '残片拼接信息不完整'] }
  ];
  D.craftById = (id) => D.crafts.filter((c) => c.id === id)[0];

  D.sites = [
    { name: '观台窑址', era: '宋—金', place: '河北邯郸峰峰矿区观台镇', note: '磁州窑中心窑场之一，地层序列完整' },
    { name: '彭城窑址', era: '金—元', place: '河北邯郸峰峰矿区彭城镇', note: '元明时期主要产区，窑具遗存丰富' },
    { name: '冶子窑址', era: '宋', place: '河北邯郸峰峰矿区冶子村', note: '以白地黑花枕类见长' },
    { name: '临水窑址', era: '宋—元', place: '河北邯郸峰峰矿区临水镇', note: '与观台窑关系密切，产品面貌相近' }
  ];

  /* ------------------------------------------------------------------ 展览与活动 */
  D.exhibitions = [
    { id: 'e1', title: '黑白之间 · 磁州窑纹样特展', status: 'ongoing', date: '2024.09.20 — 2025.03.16',
      place: '中国磁州窑遗址博物馆 · 一层临展厅', tag: '常设特展',
      desc: '以白地黑花为主线，梳理宋金时期磁州窑纹样的题材谱系与构图类型，展出枕、瓶、罐等器物 128 件。', art: 'kiln' },
    { id: 'e2', title: '一窑一器 · 传统烧制工艺复原展', status: 'ongoing', date: '2024.11.01 — 2025.05.10',
      place: '彭城窑址展示馆 · 工艺厅', tag: '工艺复原',
      desc: '按选料、练泥、拉坯、刻花、施釉、装窑、烧成七道工序复原窑作场景，可近距离观察馒头窑结构。', art: 'wheel' },
    { id: 'e3', title: '瓷上的童年 · 婴戏纹专题陈列', status: 'soon', date: '2025.04.18 开展',
      place: '中国磁州窑遗址博物馆 · 二层专题厅', tag: '专题陈列',
      desc: '聚焦婴戏纹的图像来源与吉祥寓意，结合枕面纹样比对，呈现宋金民间生活图景。', art: 'shards' },
    { id: 'e4', title: '纹样工坊 · 白地黑花绘制体验', status: 'soon', date: '2025.05.01 起 每周六',
      place: '博物馆公教空间', tag: '公共教育',
      desc: '在陶坯上体验化妆土施敷与黑彩绘制，完成一件属于自己的纹样小器。', art: 'glaze' },
    { id: 'e5', title: '北朝窑火 · 磁州窑早期面貌', status: 'past', date: '2024.03.10 — 2024.08.30',
      place: '中国磁州窑遗址博物馆 · 一层临展厅', tag: '已结束',
      desc: '以早期青瓷与素烧器物为线索，回顾磁州窑创烧阶段的技术来源与面貌。', art: 'museum' }
  ];
  D.exhibitionById = (id) => D.exhibitions.filter((e) => e.id === id)[0];

  /* ------------------------------------------------------------------ 我的相关内容 */
  D.services = [
    { key: 'follows', icon: 'heart', title: '我的关注', route: '#/follows' },
    { key: 'favorites', icon: 'star', title: '我的收藏', route: '#/favorites' },
    { key: 'theme', icon: 'shirt', title: '主题更换', route: '#/theme' },
    { key: 'history', icon: 'clock', title: '历史记录', route: '#/history' },
    { key: 'uploads', icon: 'uploadBox', title: '我的上传', route: '#/uploads' },
    { key: 'downloads', icon: 'downloadBox', title: '本地下载', route: '#/downloads' },
    { key: 'exhibitions', icon: 'pavilion', title: '展览信息', route: '#/exhibitions' },
    { key: 'more', icon: 'dots', title: '更多服务', route: '#/more' }
  ];
  D.moreServices = [
    { key: 'theme', icon: 'shirt', title: '主题更换', desc: '浅色 / 深色 / 宣纸', route: '#/theme' },
    { key: 'font', icon: 'filter', title: '正文字号', desc: '标准 / 较大 / 特大', action: 'font' },
    { key: 'cache', icon: 'refresh', title: '清理缓存', desc: '已占用 12.6 MB', action: 'cache' },
    { key: 'feedback', icon: 'message', title: '意见反馈', desc: '纹样纠错与建议', action: 'feedback' },
    { key: 'about', icon: 'info', title: '关于语料库', desc: '版本 ' + D.app.version, route: '#/about' },
    { key: 'privacy', icon: 'bookmark', title: '数据与版权说明', desc: '图像授权范围', route: '#/about' }
  ];
  D.hotSearch = ['牡丹纹', '婴戏纹', '白地黑花', '元宝枕', '卷草纹', '馒头窑', '莲花纹', '金代'];

  D.friends = ['刘', '陈', '王', '赵', '孙', '周'];
  D.user = { name: '用户名', desc: '纹样研究者 · 已关注 6 人' };

  /* 预览用的示例状态（首次进入时写入本地存储，之后以用户数据为准） */
  D.seed = {
    favorites: ['plant-mudan-01', 'plant-mudan-05', 'plant-lianhua-02', 'figure-yingxi-01', 'plant-juancao-03'],
    follows: [
      { id: 'plant-mudan', kind: 'group', name: '牡丹纹', desc: '12 件纹样 · 5 条更新' },
      { id: 'plant-juancao', kind: 'group', name: '卷草纹', desc: '8 件纹样 · 暂无更新' },
      { id: 'figure-yingxi', kind: 'group', name: '婴戏纹', desc: '9 件纹样 · 3 条更新' },
      { id: 'site-guanta', kind: 'site', name: '观台窑址', desc: '窑址动态 · 2 条更新' },
      { id: 'exh-e1', kind: 'exhibition', name: '黑白之间 · 磁州窑纹样特展', desc: '展讯提醒已开启' }
    ],
    history: ['plant-mudan-01', 'figure-yingxi-02', 'plant-lianhua-01', 'plant-juancao-02', 'plant-mudan-06', 'figure-gushi-01'],
    uploads: [
      { id: 'u1', name: '白地黑花牡丹纹枕（残片整理）', date: '2025.03.12', status: 'pass', num: 12 },
      { id: 'u2', name: '彭城采集 · 卷草纹瓷片', date: '2025.03.02', status: 'review', num: 8 },
      { id: 'u3', name: '婴戏纹拓片翻拍', date: '2025.02.18', status: 'reject', num: 5 }
    ],
    downloads: [
      { id: 'd1', name: '植物装饰纹样包 · 高清', size: '286 MB', count: '36 件', done: true, progress: 100 },
      { id: 'd2', name: '人物装饰纹样包 · 高清', size: '164 MB', count: '20 件', done: true, progress: 100 },
      { id: 'd3', name: '工艺工序影像资料', size: '420 MB', count: '8 段', done: false, progress: 0 },
      { id: 'd4', name: '宋金瓷片纹样 · 线稿集', size: '92 MB', count: '58 件', done: false, progress: 0 }
    ]
  };

  /* 我常看的纹样（我的页） */
  D.watchList = [
    { id: 'plant-mudan-01', label: '牡丹纹', status: '5 条更新' },
    { id: 'plant-juancao-01', label: '卷草纹', status: '暂无更新' },
    { id: 'plant-lianhua-01', label: '牡丹纹', status: '2 条更新' }
  ];
})();
