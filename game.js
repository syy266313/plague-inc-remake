/* ================= 瘟疫公司 · 复刻版 (game engine) ================= */
//<SIM>
var BAL = {
  dnaStart: 3,
  r0: 0.00145,             // 病毒基本传染系数（乘 传染性）
  kLand: 0.0045,          // 陆路跨境
  kAir: 0.055,            // 空港
  kSea: 0.035,            // 海港
  deathCoef: 0.00045,     // 致死系数
  cureBase: 0.15,
  cureNoticeSev: 8,       // 严重性超过此值，各国开始重视
  bubbleSec: 3.0,         // 气泡间隔（秒，1×）
  daySec: 0.95             // 1× 时一天多少秒
};

var PATHOGENS = {
  bacteria: { name:'细菌', ic:'🦠', inf:8,  sev:1, let:1, mut:0.005, dna:1.00,
    desc:'标准病原体。各项均衡，最容易上手，也最考验节奏。' },
  virus:    { name:'病毒', ic:'🧬', inf:11, sev:2, let:2, mut:0.022, dna:0.95,
    desc:'基因极不稳定，会频繁自发突变。省下买症状的 DNA，但严重性也压不住。' },
  fungus:   { name:'真菌', ic:'🍄', inf:6,  sev:2, let:1, mut:0.003, dna:1.10,
    desc:'孢子扩散，跨洲传播极慢。想出海必须先点出空港/水源相关的传播。' },
  parasite: { name:'寄生虫', ic:'🪱', inf:7,  sev:4, let:3, mut:0.007, dna:1.00,
    desc:'高致死起步，但会被宿主的死亡拖累传播。适合慢慢养、最后一击。' }
};

var NODES = [
 // ---- 传播 ----
 {id:'air1', cat:'tra', n:'空气传播 I',  ic:'💨', c:4,  inf:3, req:[]},
 {id:'air2', cat:'tra', n:'空气传播 II', ic:'💨', c:9,  inf:5, req:['air1']},
 {id:'air3', cat:'tra', n:'极限空气',    ic:'🌪️', c:16, inf:8, air:0.25, req:['air2']},
 {id:'wat1', cat:'tra', n:'水源传播 I',  ic:'💧', c:4,  inf:3, sea:0.15, req:[]},
 {id:'wat2', cat:'tra', n:'水源传播 II', ic:'💧', c:10, inf:5, sea:0.25, req:['wat1']},
 {id:'wat3', cat:'tra', n:'极限水源',    ic:'🌊', c:15, inf:7, req:['wat2']},
 {id:'live1',cat:'tra', n:'牲畜传播 I',  ic:'🐄', c:5,  inf:3, req:[]},
 {id:'live2',cat:'tra', n:'牲畜传播 II', ic:'🐄', c:11, inf:5, req:['live1']},
 {id:'live3',cat:'tra', n:'极限牲畜',    ic:'🐖', c:14, inf:6, req:['live2']},
 {id:'rod1', cat:'tra', n:'鼠类传播 I',  ic:'🐀', c:5,  inf:3, req:[]},
 {id:'rod2', cat:'tra', n:'鼠类传播 II', ic:'🐀', c:10, inf:5, req:['rod1']},
 {id:'ins1', cat:'tra', n:'昆虫传播 I',  ic:'🦟', c:6,  inf:4, hot:0.15, req:[]},
 {id:'ins2', cat:'tra', n:'昆虫传播 II', ic:'🦟', c:11, inf:5, req:['ins1']},
 {id:'ins3', cat:'tra', n:'极限昆虫',    ic:'🪰', c:14, inf:6, req:['ins2']},
 {id:'blo1', cat:'tra', n:'血液传播 I',  ic:'🩸', c:7,  inf:4, req:[]},
 {id:'blo2', cat:'tra', n:'血液传播 II', ic:'🩸', c:13, inf:6, req:['blo1']},
 // ---- 症状 ----
 {id:'nau', cat:'sym', n:'恶心',       ic:'🤢', c:2, sev:1, req:[]},
 {id:'vom', cat:'sym', n:'呕吐',       ic:'🤮', c:4, sev:2, inf:1, req:['nau']},
 {id:'dia', cat:'sym', n:'腹泻',       ic:'🚽', c:5, sev:2, inf:1, req:['vom']},
 {id:'dys', cat:'sym', n:'痢疾',       ic:'💩', c:8, sev:3, let:2, req:['dia']},
 {id:'cou', cat:'sym', n:'咳嗽',       ic:'😷', c:2, inf:1, sev:1, req:[]},
 {id:'sne', cat:'sym', n:'喷嚏',       ic:'🤧', c:3, inf:2, req:['cou']},
 {id:'pne', cat:'sym', n:'肺炎',       ic:'🫁', c:9, sev:4, let:2, req:['sne']},
 {id:'arf', cat:'sym', n:'呼吸衰竭',   ic:'💀', c:14, sev:3, let:6, req:['pne']},
 {id:'ras', cat:'sym', n:'皮疹',       ic:'🔴', c:3, sev:1, req:[]},
 {id:'swe', cat:'sym', n:'出汗',       ic:'💦', c:4, inf:1, sev:1, req:['ras']},
 {id:'les', cat:'sym', n:'皮肤病变',   ic:'🟣', c:6, sev:2, req:['swe']},
 {id:'nec', cat:'sym', n:'坏死',       ic:'⚫', c:12, sev:2, let:4, req:['les']},
 {id:'hem', cat:'sym', n:'内出血',     ic:'🩸', c:15, sev:2, let:6, req:['nec']},
 {id:'fev', cat:'sym', n:'发热',       ic:'🌡️', c:3, sev:2, inf:1, req:[]},
 {id:'hea', cat:'sym', n:'头痛',       ic:'🤕', c:5, sev:1, inf:1, req:['fev']},
 {id:'ins', cat:'sym', n:'失眠',       ic:'😵', c:6, sev:1, req:['hea']},
 {id:'psy', cat:'sym', n:'精神错乱',   ic:'🌀', c:10, sev:3, inf:1, req:['ins']},
 {id:'com', cat:'sym', n:'昏迷',       ic:'😴', c:13, sev:2, let:4, req:['psy']},
 {id:'mus', cat:'sym', n:'肌肉疼痛',   ic:'💪', c:4, sev:1, req:[]},
 {id:'joi', cat:'sym', n:'关节痛',     ic:'🦴', c:6, sev:2, req:['mus']},
 {id:'par', cat:'sym', n:'瘫痪',       ic:'♿', c:11, sev:3, let:3, req:['joi']},
 {id:'tof', cat:'sym', n:'全面器官衰竭', ic:'☠️', c:18, sev:3, let:10, req:['par']},
 {id:'ane', cat:'sym', n:'贫血',       ic:'🩹', c:5, sev:2, let:1, req:[]},
 {id:'imm', cat:'sym', n:'免疫抑制',   ic:'🛡️', c:12, sev:2, inf:3, req:['ane']},
 // ---- 能力 ----
 {id:'cold1', cat:'abi', n:'抗寒 I',   ic:'❄️', c:5,  cold:0.35, req:[]},
 {id:'cold2', cat:'abi', n:'抗寒 II',  ic:'❄️', c:10, cold:0.40, req:['cold1']},
 {id:'heat1', cat:'abi', n:'耐热 I',   ic:'🔥', c:5,  hot:0.35, req:[]},
 {id:'heat2', cat:'abi', n:'耐热 II',  ic:'🔥', c:10, hot:0.40, req:['heat1']},
 {id:'drug1', cat:'abi', n:'抗药性 I', ic:'💊', c:8,  drug:0.30, req:[]},
 {id:'drug2', cat:'abi', n:'抗药性 II', ic:'💊', c:15, drug:0.35, req:['drug1']},
 {id:'hard1', cat:'abi', n:'基因强化 I', ic:'🔒', c:7,  harden:0.25, req:[]},
 {id:'hard2', cat:'abi', n:'基因强化 II', ic:'🔒', c:14, harden:0.30, req:['hard1']},
 {id:'reco',  cat:'abi', n:'基因重组', ic:'🧬', c:12, mut:-0.01, dna:0.3, req:['hard1']},
 {id:'env',   cat:'abi', n:'环境适应', ic:'🌍', c:9,  cold:0.15, hot:0.15, arid:0.2, req:['cold1','heat1']},
 {id:'arid1', cat:'abi', n:'耐旱 I',   ic:'🏜️', c:6,  arid:0.35, req:[]},
 {id:'arid2', cat:'abi', n:'耐旱 II',  ic:'🏜️', c:11, arid:0.40, req:['arid1']}
];

function newGame(pid, startIdx, diff) {
  var p = PATHOGENS[pid];
  var cs = MAPDATA.countries.map(function(c, i){
    return { i:i, n:c.n, pop:c.pop, cl:c.cl, w:c.w, hc:c.hc, air:c.air, sea:c.sea, x:c.c[0], y:c.c[1], nb:c.nb,
             inf:0, dead:0, everInf:false, airC:false, seaC:false, landC:false, mil:0 };
  });
  var s = {
    pid:pid, p:p, day:0, dna:BAL.dnaStart, speed:1, phase:'play',
    started:false, over:false, win:false, cure:0, cureOn:false,
    inf:0, dead:0, cs:cs, mods:{inf:0,sev:0,let:0,cold:0,hot:0,arid:0,drug:0,harden:0,mut:0,air:0,sea:0,dna:0},
    owned:{}, news:[], newCountryBonus:0, ctryCount:0, totalPop:0,
    flash:[], mil:{}, peakShare:0, closedCount:0, bubbles:[], lastBubble:0,
    name:'未命名病原体', diff:diff||'normal',
    cureMul:({'easy':0.72,'normal':1,'hard':1.4})[diff||'normal']||1
  };
  cs.forEach(function(c){ s.totalPop += c.pop; });
  if (typeof startIdx === 'number') startOne(s, startIdx);
  return s;
}

function startOne(s, idx) {
  var c = s.cs[idx];
  c.inf = Math.max(4, Math.floor(c.pop * 0.00002));
  c.everInf = true;
  s.ctryCount = 1;
  s.started = true;
  s.phase = 'play';
  addNews(s, '零号病人在' + c.n + '被发现，当地医院束手无策。');

  // 自适应：病毒突变更快（用 mut 值控制）
}

function pushFlash(s, tag, title, body) {
  if (s.flash.length > 6) return;
  s.flash.push({ tag: tag, title: title, body: body });
}

function once(s, key, fn) {
  if (s.mil[key]) return;
  s.mil[key] = 1;
  fn();
}

function addNews(s, t) {
  s.news.unshift('D' + s.day + ' · ' + t);
  if (s.news.length > 12) s.news.pop();
  s.newsDirty = true;
}

function fmtB(n) {
  if (n >= 1e8) return (n / 1e8).toFixed(2) + ' 亿';
  if (n >= 1e4) return (n / 1e4).toFixed(0) + ' 万';
  return Math.round(n).toString();
}

function stats(s) {
  var m = s.mods, p = s.p;
  return {
    inf: p.inf + m.inf,
    sev: p.sev + m.sev,
    let: p.let + m.let,
    mut: Math.max(0.004, p.mut + m.mut)
  };
}

function ownedNode(s, id){ return !!s.owned[id]; }

function canBuy(s, node) {
  if (s.owned[node.id]) return false;
  if (s.dna < node.c) return false;
  for (var i = 0; i < node.req.length; i++) if (!s.owned[node.req[i]]) return false;
  return true;
}

function buyNode(s, id) {
  var node = null;
  for (var i = 0; i < NODES.length; i++) if (NODES[i].id === id) node = NODES[i];
  if (!node || !canBuy(s, node)) return false;
  s.dna -= node.c;
  s.owned[node.id] = 1;
  var m = s.mods;
  m.inf += node.inf || 0; m.sev += node.sev || 0; m.let += node.let || 0;
  m.cold += node.cold || 0; m.hot += node.hot || 0; m.arid += node.arid || 0;
  m.drug += node.drug || 0; m.harden += node.harden || 0; m.mut += node.mut || 0;
  m.air += node.air || 0; m.sea += node.sea || 0;
  if (node.dna) m.dna += node.dna;
  addNews(s, '病原体进化出「' + node.n + '」。');
  return true;
}

/* ---------- 气候适应系数 ---------- */
function climateF(s, c) {
  var m = s.mods;
  if (c.cl === 'cold') return 0.55 + Math.min(1, m.cold) * 0.45;
  if (c.cl === 'hot')  return 0.62 + Math.min(1, m.hot) * 0.38;
  if (c.cl === 'arid') return 0.58 + Math.min(1, m.arid) * 0.42;
  return 1.0;
}

function seedCountry(s, c, amount) {
  if (c.inf >= c.pop) return 0;
  var add = Math.min(c.pop - c.inf, Math.max(1, amount));
  if (!c.everInf) {
    c.everInf = true;
    s.ctryCount++;
    s.dna += 1;   // 新国家感染奖励
    if (s.ctryCount > 4 && s.ctryCount % 12 === 0)
      addNews(s, '全球已有 ' + s.ctryCount + ' 个国家沦陷。');
  }
  c.inf += add;
  return add;
}

function tickSim(s, dt) {   // dt: 天
  if (!s.started || s.over) return;
  s.day += dt;
  var st = stats(s), m = s.mods;
  var drugF = 1 - Math.min(1, m.drug) * 0.45;

  for (var ci = 0; ci < s.cs.length; ci++) {
    var c = s.cs[ci];
    if (c.inf <= 0) continue;
    var pop = c.pop;
    var alive = pop - c.dead;
    if (c.inf > alive) c.inf = alive;
    if (c.inf <= 0) continue;
    var cc = c.inf / pop;
    var cf = climateF(s, c);
    var hcf = 1 - c.hc * 0.45;
    var r = BAL.r0 * st.inf * Math.pow(1 - cc, 1.1) * cf * hcf * drugF;
    if (r > 0.85) r = 0.85;
    var newInf = c.inf * r * dt;
    if (newInf > alive - c.inf) newInf = alive - c.inf;
    if (newInf > 0) c.inf += newInf;
    if (st.let > 0.5) {
      var dd = c.inf * st.let * BAL.deathCoef * dt;
      if (dd > c.inf) dd = c.inf;
      c.inf -= dd; c.dead += dd;
    }
    if (c.inf + c.dead >= pop) { c.inf = 0; c.dead = pop; }
  }

  // ---------- 跨境传播 ----------
  var infList = [];
  for (var j = 0; j < s.cs.length; j++) if (s.cs[j].inf > 0) infList.push(s.cs[j]);
  var landF = 1 - m.land;
  for (var a = 0; a < infList.length; a++) {
    var src = infList[a];
    if (src.inf / src.pop < 0.02) continue;
    // 陆路
    for (var b = 0; b < src.nb.length; b++) {
      var dst = s.cs[src.nb[b]];
      if (dst.inf >= dst.pop * 0.9) continue;
      if (dst.landC) continue;
      var pr = BAL.kLand * (st.inf / 20) * (src.inf / src.pop) * dt * landF;
      if (Math.random() < pr) seedCountry(s, dst, dst.pop * 0.000004 * (1 + st.inf / 30));
    }
  }
  // 空港 / 海港
  var airP = BAL.kAir * (st.inf / 20) * (1 + m.air) * dt;
  var seaP = BAL.kSea * (st.inf / 20) * (1 + m.sea) * dt;
  for (var q = 0; q < infList.length; q++) {
    var sc = infList[q];
    if (sc.airC && sc.seaC) continue;
    if (sc.air > 0 && !sc.airC && Math.random() < airP * sc.air * 0.5) {
      var dst1 = pickDest(s, sc, 'air');
      if (dst1) seedCountry(s, dst1, dst1.pop * 0.0000045);
    }
    if (sc.sea > 0 && !sc.seaC && Math.random() < seaP * sc.sea * 0.5) {
      var dst2 = pickDest(s, sc, 'sea');
      if (dst2) seedCountry(s, dst2, dst2.pop * 0.000004);
    }
  }

  // ---------- 解药 ----------
  var sev = st.sev;
  var worldInfFrac = 0, worldDeadFrac = 0, wSum = 0, wealth, wc = 0;
  for (var k2 = 0; k2 < s.cs.length; k2++) {
    var x = s.cs[k2];
    worldInfFrac += x.inf; worldDeadFrac += x.dead;
    if (x.w) { wealth = (wealth || 0) + x.pop; }
    wSum += x.pop; wc++;
  }
  worldInfFrac /= s.totalPop; worldDeadFrac /= s.totalPop;
  var avgWealth = wealth ? (wealth / s.totalPop) : 0.4;
  if (!s.cureOn && s.ctryCount >= 4 && worldInfFrac > 0.0004) {
    s.cureOn = true;
    addNews(s, '世界卫生组织宣布启动全球解药研发计划。');
  }
  if (s.cureOn) {
    var cr = BAL.cureBase * s.cureMul * (0.55 + avgWealth * 1.6)
           * (0.35 + Math.min(1.4, sev / 26))
           * (1 + worldDeadFrac * 1.6)
           * (0.65 + worldInfFrac * 1.3)
           * (1 - Math.min(0.7, m.drug * 0.45 + m.harden * 0.55))
           * (1 - s.cure / 160);
    s.cureRate = cr;
    s.cure += cr * dt;
    if (s.cure >= 100) { s.cure = 100; endGame(s, false, '解药研制完成，疫情被彻底扑灭。'); return; }
  }

  // ---------- 政府反制 ----------
  var closedNow = 0;
  for (var g = 0; g < s.cs.length; g++) {
    var y = s.cs[g];
    if (y.inf / y.pop < 0.02) continue;
    if (!y.airC && sev > 12 && Math.random() < 0.0009 * (1 + y.hc) * (sev / 20)) {
      y.airC = true; s.closedCount++;
      if (s.closedCount < 6) addNews(s, y.n + '宣布关闭全部国际机场。');
      once(s, 'aircls', function(){ pushFlash(s, '路透社', y.n + '关闭全部国际机场', '这是本轮疫情爆发以来，第一个切断全部空中通道的国家。多国正在效仿。'); });
    }
    if (!y.seaC && sev > 16 && Math.random() < 0.0008 * (1 + y.hc) * (sev / 20)) {
      y.seaC = true; s.closedCount++;
      once(s, 'seacls', function(){ pushFlash(s, '美联社', y.n + '封锁全部港口', '所有船只禁止靠岸，港口城市事实上与外界隔绝。'); });
      if (s.closedCount < 10) addNews(s, y.n + '封锁港口，所有船只禁止靠岸。');
    }
    if (!y.landC && sev > 25 && Math.random() < 0.0006 * (sev / 30)) {
      y.landC = true; s.closedCount++;
    }
  }

  // ---------- 突变 ----------
  if (Math.random() < st.mut * dt) {
    var pool = [];
    for (var n = 0; n < NODES.length; n++) {
      var nd = NODES[n];
      if (nd.cat !== 'sym' || s.owned[nd.id]) continue;
      var ok = true;
      for (var r = 0; r < nd.req.length; r++) if (!s.owned[nd.req[r]]) ok = false;
      if (ok && (nd.req.length || Math.random() < 0.4)) pool.push(nd);
    }
    if (pool.length) {
      var pick = pool[Math.floor(Math.random() * pool.length)];
      s.owned[pick.id] = 1;
      s.mods.inf += pick.inf || 0; s.mods.sev += pick.sev || 0; s.mods.let += pick.let || 0;
      addNews(s, '病原体自发突变，获得症状「' + pick.n + '」。');
    }
  }

  // ---------- 汇总 ----------
  s.inf = 0; s.dead = 0;
  for (var z = 0; z < s.cs.length; z++) { s.inf += s.cs[z].inf; s.dead += s.cs[z].dead; }
  var shareInf = (s.inf + s.dead) / s.totalPop;
  if (shareInf > s.peakShare) s.peakShare = shareInf;

  // ---------- 重大新闻 ----------
  var deadShare = s.dead / s.totalPop;
  var infShare = s.inf / s.totalPop;
  once(s, 'inf1', function(){ pushFlash(s, 'WHO', '全球感染人数突破 ' + fmtB(s.inf) + ' 人', '世界卫生组织确认，疫情已扩散至 ' + s.ctryCount + ' 个国家，多国医疗系统开始出现挤兑。'); });
  if (shareInf >= 0.01) once(s, 'share1', function(){ pushFlash(s, 'BBC', '全球百分之一人口已被感染', '专家警告：若防控失败，「' + s.name + '」将在数周内席卷所有大陆。'); });
  if (shareInf >= 0.10) once(s, 'share10', function(){ pushFlash(s, '路透社', '全球十分之一人口倒下', '各国边境相继封锁，国际航空运输几近停摆，粮食与药品供应链断裂。'); });
  if (shareInf >= 0.35) once(s, 'share35', function(){ pushFlash(s, '新华社', '三分之一人类已被感染', '多个城市进入紧急状态，军队上街维持秩序，全球进入「非常时期」。'); });
  if (shareInf >= 0.60) once(s, 'share60', function(){ pushFlash(s, 'CNN', '全球六成人口沦陷', '各国政府承认防疫体系全面崩溃，幸存者开始向少数未沦陷地区迁徙。'); });
  if (shareInf >= 0.90) once(s, 'share90', function(){ pushFlash(s, 'BBC', '最后的人类', '全球九成人口已被感染，仅剩零星孤岛与极地据点仍在抵抗。'); });

  if (deadShare >= 0.001) once(s, 'd1', function(){ pushFlash(s, 'WHO', '死亡人数突破百万', '各国开始大规模掩埋尸体，世卫组织将本事件定性为「史无前例的灾难」。'); });
  if (deadShare >= 0.02) once(s, 'd2', function(){ pushFlash(s, '半岛电视台', '死亡人数突破一亿', '医院停尸间已无处安放，多国宣布暂停一切公共活动与选举。'); });
  if (deadShare >= 0.20) once(s, 'd3', function(){ pushFlash(s, '美联社', '五分之一人类死亡', '社会秩序彻底瓦解，货币与法律失去意义，幸存者以部落形式群居。'); });

  if (s.cureOn) {
    if (s.cure >= 25) once(s, 'c25', function(){ pushFlash(s, 'WHO', '解药研发完成 25%', '全球顶尖实验室联合攻关，动物实验显示初步抗体有效。'); });
    if (s.cure >= 50) once(s, 'c50', function(){ pushFlash(s, '路透社', '解药研发过半', '三期临床启动，若顺利，人类或将在数月内获得反击手段。'); });
    if (s.cure >= 75) once(s, 'c75', function(){ pushFlash(s, 'BBC', '解药研发进入最后阶段', '各国已开始筹备大规模生产，「' + s.name + '」的时间所剩不多。'); });
  }

  // 胜利
  if (shareInf >= 0.9995) {
    var dShare = s.dead / s.totalPop;
    endGame(s, true, dShare > 0.9 ? '全人类已无人生还。' : (dShare > 0.5 ? '半个世界已经死去，剩下的人也病入膏肓。' : '地球上每一个活人都已被感染。'));
    return;
  }

  // ---------- 被动 DNA ----------
  s.dna += (0.012 + 0.03 * shareInf) * st.inf / 8 * dt * (1 + m.dna);
}

function pickDest(s, src, mode) {
  // 目的国权重：人口 + 机场概率
  var total = 0, cand = [];
  for (var i = 0; i < s.cs.length; i++) {
    var c = s.cs[i];
    if (c.i === src.i) continue;
    if (mode === 'air' && (c.airC || c.air === 0)) continue;
    if (mode === 'sea' && (c.seaC || c.sea === 0)) continue;
    if (c.inf >= c.pop * 0.6) continue;
    var w = Math.pow(c.pop, 0.4) * (mode === 'air' ? (0.4 + c.air) : (0.5 + c.sea));
    if (mode === 'sea' && Math.abs(c.y) > 70) w *= 0.3;
    total += w; cand.push([c, w]);
  }
  if (!total) return null;
  var r = Math.random() * total;
  for (var k = 0; k < cand.length; k++) { r -= cand[k][1]; if (r <= 0) return cand[k][0]; }
  return cand[cand.length - 1][0];
}

function endGame(s, win, reason) {
  if (s.over) return;
  s.over = true; s.win = win; s.reason = reason; s.speed = 0;
}

/* 点击气泡 */
function popBubble(s, b) {
  if (b.t === 'dna') s.dna += (b.v || 1);
  else {
    var c = s.cs[b.ci];
    var add = Math.min(c.pop - c.inf, Math.max(2, c.pop * 0.004));
    c.inf += add;
  }
}
//</SIM>

/* ============================ 界面层 ============================ */
if (typeof document !== 'undefined') (function(){
  var canvas = document.getElementById('map'), wrap = document.getElementById('mapwrap');
  var ctx = canvas.getContext('2d');
  var S = newGame('bacteria');
  var W = 0, H = 0, DPR = 1, paths = [], projectFn = null;
  var LAT0 = -56, LAT1 = 82;
  var M0 = merc(LAT1), M1 = merc(LAT0);

  function merc(lat){ return Math.log(Math.tan(Math.PI/4 + lat * Math.PI / 360)); }

  function resize(){
    var w = wrap.clientWidth;
    var h = Math.round(w / 1.32);
    wrap.style.height = h + 'px';
    DPR = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = w * DPR; canvas.height = h * DPR;
    W = w; H = h;
    buildPaths();
    render();
  }

  function project(lon, lat){
    lat = Math.max(LAT0, Math.min(LAT1, lat));
    var x = (lon + 180) / 360 * W;
    var y = (M0 - merc(lat)) / (M0 - M1) * H;
    return [x, y];
  }

  function buildPaths(){
    paths = MAPDATA.countries.map(function(c){
      var p = new Path2D();
      for (var i = 0; i < c.r.length; i++){
        var ring = c.r[i], prevLon = null, brk = false;
        for (var j = 0; j < ring.length; j++){
          var lon = ring[j][0], lat = ring[j][1];
          var pt = project(lon, lat);
          if (j === 0) { p.moveTo(pt[0], pt[1]); brk = false; }
          else if (prevLon !== null && Math.abs(lon - prevLon) > 180) { p.closePath(); p.moveTo(pt[0], pt[1]); brk = true; }
          else { p.lineTo(pt[0], pt[1]); }
          prevLon = lon;
        }
        p.closePath();
      }
      return p;
    });
  }

  function lerp(a, b, t){ return [a[0]+(b[0]-a[0])*t, a[1]+(b[1]-a[1])*t, a[2]+(b[2]-a[2])*t]; }
  function rgb(c){ return 'rgb('+Math.round(c[0])+','+Math.round(c[1])+','+Math.round(c[2])+')'; }
  var C0 = [62,60,55], C1 = [126,22,14], C2 = [214,46,26], CD = [24,14,12];

  function countryColor(c){
    if (c.inf <= 0) return rgb(C0);
    var raw = Math.min(1, (c.inf + c.dead) / c.pop);
    var t = Math.pow(raw, 0.42);
    var dd = Math.min(1, c.dead / c.pop);
    var col = t < 0.45 ? lerp(C0, C1, t/0.45) : lerp(C1, C2, (t-0.45)/0.55);
    if (dd > 0.15) col = lerp(col, CD, Math.min(0.9, (dd - 0.15) * 1.2));
    return rgb(col);
  }

  var hover = -1, picked = -1, showInfo = -1;
  function render(){
    if (!W) return;
    ctx.setTransform(DPR,0,0,DPR,0,0);
    var og = ctx.createLinearGradient(0,0,0,H);
    og.addColorStop(0,'#0b1a20'); og.addColorStop(.55,'#070f13'); og.addColorStop(1,'#04080a');
    ctx.fillStyle = og; ctx.fillRect(0,0,W,H);
    // 经纬网格
    ctx.strokeStyle = 'rgba(120,150,140,.07)'; ctx.lineWidth = 1;
    for (var gx = -150; gx <= 150; gx += 30){ var p1 = project(gx, LAT1), p2 = project(gx, LAT0); ctx.beginPath(); ctx.moveTo(p1[0],p1[1]); ctx.lineTo(p2[0],p2[1]); ctx.stroke(); }
    for (var gy = -40; gy <= 80; gy += 20){ var q1 = project(-180, gy), q2 = project(180, gy); ctx.beginPath(); ctx.moveTo(q1[0],q1[1]); ctx.lineTo(q2[0],q2[1]); ctx.stroke(); }

    for (var i = 0; i < paths.length; i++){
      var c = S.cs[i];
      ctx.fillStyle = countryColor(c);
      ctx.fill(paths[i]);
      ctx.strokeStyle = (c.inf > 0 ? 'rgba(255,120,90,.35)' : 'rgba(150,160,150,.22)');
      ctx.lineWidth = 0.7;
      ctx.stroke(paths[i]);
    }
    // 选中高亮
    var hi = picked >= 0 ? picked : hover;
    if (hi >= 0 && paths[hi]){
      ctx.strokeStyle = '#8affc0'; ctx.lineWidth = 1.8; ctx.stroke(paths[hi]);
    }
  }

  /* ------- 气泡 ------- */
  var bubblesEl = document.getElementById('bubbles');
  var bubbleTimer = 0, lastT = 0;

  function spawnBubble(){
    var cands = [];
    S.cs.forEach(function(c){ if (c.inf > 0) cands.push(c); });
    if (!cands.length) return;
    var c = cands[Math.floor(Math.pow(Math.random(), 1.6) * cands.length)];
    var pt = project(c.x, c.y);
    var t = Math.random() < 0.72 ? 'dna' : 'bio';
    var el = document.createElement('div');
    el.className = 'bub ' + (t === 'dna' ? 'd' : 'b');
    el.textContent = t === 'dna' ? '◆' : '☣';
    el.style.left = (pt[0] + (Math.random()-0.5)*22) + 'px';
    el.style.top = (pt[1] + (Math.random()-0.5)*16) + 'px';
    var b = { el: el, t: t, ci: c.i, v: (t === 'dna' ? (Math.random() < 0.25 ? 2 : 1) : 0), born: performance.now() };
    el.addEventListener('click', function(ev){
      ev.stopPropagation();
      if (S.over) return;
      popBubble(S, b);
      el.remove(); S.bubbles.splice(S.bubbles.indexOf(b),1);
      if (t === 'dna') pulseDna();
    });
    bubblesEl.appendChild(el);
    S.bubbles.push(b);
  }

  function pulseDna(){
    var box = document.querySelector('.dnabox');
    if (!box) return;
    box.style.transform = 'scale(1.12)';
    setTimeout(function(){ box.style.transform = ''; }, 120);
  }

  var lastRender = 0, forceRender = true;
  function loop(ts){
    if (!lastT) lastT = ts;
    var real = Math.min(0.25, (ts - lastT) / 1000);
    lastT = ts;
    if (S.speed > 0 && !S.over && S.phase === 'play' && S.started){
      var sp = [0,1,2,3][S.speed] * 1;
      tickSim(S, real / BAL.daySec * sp);
      // 气泡
      bubbleTimer += real * sp;
      if (bubbleTimer > BAL.bubbleSec){
        bubbleTimer = 0;
        if (S.bubbles.length < 6) spawnBubble();
      }
      // 气泡过期
      var now = performance.now();
      for (var i = S.bubbles.length - 1; i >= 0; i--){
        if (now - S.bubbles[i].born > 6500){ S.bubbles[i].el.remove(); S.bubbles.splice(i,1); }
      }
    }
    if (ts - lastRender > 260 || forceRender) { render(); lastRender = ts; forceRender = false; }
    requestAnimationFrame(loop);
  }

  /* ------- HUD ------- */
  var dnEl = document.getElementById('dn'), dnumEl = document.getElementById('dnum'), ptypeEl = document.getElementById('ptype');
  var dnaEl = document.getElementById('dna'), vI = document.getElementById('vI'), vS = document.getElementById('vS'), vL = document.getElementById('vL');
  var pI = document.getElementById('pI'), pS = document.getElementById('pS'), pL = document.getElementById('pL');
  var wInf = document.getElementById('wInf'), wDead = document.getElementById('wDead'), wCtry = document.getElementById('wCtry');
  var wPop = document.getElementById('wPop'), cureBar = document.getElementById('cureBar'), curePct = document.getElementById('curePct');
  var newsTxt = document.getElementById('newsTxt'), grid = document.getElementById('grid');

  function fmt(n){
    if (n >= 1e9) return (n/1e9).toFixed(2) + ' 亿';
    if (n >= 1e8) return (n/1e8).toFixed(2) + ' 亿';
    if (n >= 1e4) return (n/1e4).toFixed(1) + ' 万';
    return Math.round(n).toString();
  }
  var fmt2 = function(n){
    if (n >= 1e8) return (n/1e8).toFixed(2)+'亿';
    if (n >= 1e4) return (n/1e4).toFixed(1)+'万';
    return Math.round(n);
  };

  function updateHud(){
    var st = stats(S);
    dnEl.textContent = S.name;
    ptypeEl.textContent = S.p.name;
    dnumEl.textContent = Math.floor(S.day);
    dnaEl.textContent = Math.floor(S.dna);
    vI.textContent = Math.round(st.inf); vS.textContent = Math.round(st.sev); vL.textContent = Math.round(st.let);
    pI.style.width = Math.min(100, st.inf/70*100) + '%';
    pS.style.width = Math.min(100, st.sev/50*100) + '%';
    pL.style.width = Math.min(100, st.let/50*100) + '%';
    wInf.textContent = fmt2(S.inf);
    wDead.textContent = fmt2(S.dead);
    wCtry.textContent = S.ctryCount + '/' + MAPDATA.countries.length;
    wPop.textContent = '世界 ' + (S.totalPop/1e8).toFixed(1) + ' 亿';
    var mi = document.getElementById('mapInf');
    if (mi) mi.textContent = ((S.inf + S.dead) / S.totalPop * 100).toFixed(1) + '%';
    if (cat === 'data') fillData();
    cureBar.style.width = S.cure + '%';
    curePct.textContent = (S.cureOn ? (S.cure >= 99.5 ? '完成' : S.cure.toFixed(1) + '%') : '未启动');
    if (S.newsDirty && S.news[0]) { newsTxt.textContent = S.news[0]; S.newsDirty = false; }
  }

  /* ------- 进化面板 ------- */
  var cat = 'tra';
  var tabs = document.querySelectorAll('.tabs button');
  for (var i = 0; i < tabs.length; i++){
    tabs[i].addEventListener('click', function(e){
      cat = this.dataset.cat;
      for (var k = 0; k < tabs.length; k++) tabs[k].classList.toggle('on', tabs[k] === this);
      renderNodes();
    });
  }

  var nodeSig = '';
  function renderNodes(){
    var dv = document.getElementById('dataview'), gr = document.getElementById('grid');
    if (cat === 'data'){ dv.style.display = 'flex'; gr.style.display = 'none'; fillData(); return; }
    dv.style.display = 'none'; gr.style.display = 'grid';
    var sig = cat + '|' + Math.floor(S.dna) + '|' + Object.keys(S.owned).length;
    if (sig === nodeSig) return;
    nodeSig = sig;
    var html = '';
    for (var i = 0; i < NODES.length; i++){
      var n = NODES[i]; if (n.cat !== cat) continue;
      var cls = S.owned[n.id] ? 'own' : (canBuy(S, n) ? 'can' : 'lock');
      html += '<button class="node '+cls+'" data-id="'+n.id+'">'
           + '<span class="ic">'+n.ic+'</span><span class="nm">'+n.n+'</span>'
           + '<span class="cost">'+n.c+'</span></button>';
    }
    grid.innerHTML = html;
    var els = grid.querySelectorAll('.node');
    for (var j = 0; j < els.length; j++){
      els[j].addEventListener('click', function(){
        var id = this.dataset.id;
        if (buyNode(S, id)) {
          this.classList.remove('can');
          renderNodes(); updateHud();
        }
      });
    }
  }

  function fillData(){
    var st = stats(S);
    document.getElementById('dPatho').textContent = S.p.name + ' · ' + ({easy:'简单',normal:'普通',hard:'困难'}[S.diff]||'');
    document.getElementById('dDay').textContent = Math.floor(S.day);
    document.getElementById('dInf').textContent = fmt2(S.inf);
    document.getElementById('dDead').textContent = fmt2(S.dead);
    document.getElementById('dCtry').textContent = S.ctryCount + ' / ' + MAPDATA.countries.length;
    document.getElementById('dCure').textContent = S.cureOn ? S.cure.toFixed(1) + '%' : '未启动';
    document.getElementById('dCureRate').textContent = S.cureOn ? (S.cureRate||0).toFixed(2) + '% / 天' : '—';
    document.getElementById('dShare').textContent = ((S.inf + S.dead) / S.totalPop * 100).toFixed(1) + '%';
    document.getElementById('dNote').textContent =
      '传染性 ' + Math.round(st.inf) + ' · 严重性 ' + Math.round(st.sev) + ' · 致死性 ' + Math.round(st.let)
      + ' · 已进化 ' + Object.keys(S.owned).length + ' / ' + NODES.length;
  }

  /* ------- 突发新闻 ------- */
  var flashEl = document.getElementById('flash'), fTag = document.getElementById('fTag');
  var fTitle = document.getElementById('fTitle'), fBody = document.getElementById('fBody'), flashBusy = false;
  function tickFlash(){
    if (flashBusy || !S.flash || !S.flash.length) return;
    var f = S.flash.shift();
    flashBusy = true;
    fTag.textContent = f.tag;
    fTitle.textContent = f.title;
    fBody.textContent = f.body;
    flashEl.style.display = 'block';
    flashEl.style.animation = 'none';
    void flashEl.offsetWidth;
    flashEl.style.animation = '';
    clearTimeout(tickFlash.t);
    tickFlash.t = setTimeout(function(){ flashEl.style.display = 'none'; flashBusy = false; }, 6500);
  }
  flashEl.addEventListener('click', function(){
    flashEl.style.display = 'none'; flashBusy = false; clearTimeout(tickFlash.t);
  });

  /* ------- 地图点击 ------- */
  function pointInRing(px, py, ring, proj){
    var inside = false;
    for (var i = 0, j = ring.length - 1; i < ring.length; j = i++){
      var a = proj(ring[i][0], ring[i][1]), b = proj(ring[j][0], ring[j][1]);
      if ((a[1] > py) !== (b[1] > py) && px < (b[0]-a[0]) * (py-a[1]) / (b[1]-a[1]) + a[0]) inside = !inside;
    }
    return inside;
  }

  var HITBOX = null;
  function hitTest(px, py){
    if (!HITBOX){
      HITBOX = MAPDATA.countries.map(function(c){
        var b=[1e9,-1e9,1e9,-1e9];
        for (var r=0;r<c.r.length;r++) for (var k=0;k<c.r[r].length;k++){
          var lon=c.r[r][k][0], lat=c.r[r][k][1];
          if (lon<b[0]) b[0]=lon; if (lon>b[1]) b[1]=lon;
          if (lat<b[2]) b[2]=lat; if (lat>b[3]) b[3]=lat;
        }
        return {b:b, area:(b[1]-b[0])*(b[3]-b[2])};
      });
    }
    // 反投影到经纬度
    var lon = px / W * 360 - 180;
    var my = M0 - py / H * (M0 - M1);
    var lat = (2 * Math.atan(Math.exp(my)) - Math.PI / 2) * 180 / Math.PI;
    var best = -1, bestArea = 1e18;
    for (var i=0;i<MAPDATA.countries.length;i++){
      var hb = HITBOX[i];
      if (lon < hb.b[0] || lon > hb.b[1] || lat < hb.b[2] || lat > hb.b[3]) continue;
      var c = MAPDATA.countries[i], inside = false;
      for (var r2=0;r2<c.r.length;r2++){
        var ring = c.r[r2];
        for (var a=0, b2=ring.length-1; a<ring.length; b2=a++){
          var x1=ring[a][0], y1=ring[a][1], x2=ring[b2][0], y2=ring[b2][1];
          if ((y1>lat)!==(y2>lat) && lon < (x2-x1)*(lat-y1)/(y2-y1)+x1) inside = !inside;
        }
      }
      if (inside && hb.area < bestArea) { bestArea = hb.area; best = i; }
    }
    if (best < 0){
      var near = 16, nb2 = -1;
      for (var k2=0;k2<MAPDATA.countries.length;k2++){
        var cc = MAPDATA.countries[k2], pp = project(cc.c[0], cc.c[1]);
        var d2 = Math.sqrt(Math.pow(pp[0]-px,2)+Math.pow(pp[1]-py,2));
        if (d2 < near){ near = d2; nb2 = k2; }
      }
      best = nb2;
    }
    return best;
  }

  canvas.addEventListener('click', function(e){
    var rect = canvas.getBoundingClientRect();
    var px = e.clientX - rect.left, py = e.clientY - rect.top;
    var idx = hitTest(px, py);
    if (idx < 0) return;
    if (!S.started && S.phase === 'pick'){
      startOne(S, idx);
      picked = idx; showInfo = idx; render(); showCountry(idx);
      return;
    }
    picked = idx; showInfo = idx; render(); showCountry(idx);
  });

  var cinfo = document.getElementById('cinfo');
  function showCountry(idx){
    var c = S.cs[idx], m = MAPDATA.countries[idx];
    var clName = {cold:'寒冷', hot:'炎热', arid:'干旱', temp:'温带'}[c.cl] || '温带';
    var wName = ['贫困','发展中','富裕'][c.w];
    cinfo.innerHTML = '<h4>'+c.n+'</h4><div class="g">'
      + '<span><em>人口</em> <b>'+fmt2(c.pop)+'</b></span>'
      + '<span><em>感染</em> <b>'+fmt2(c.inf)+'</b></span>'
      + '<span><em>死亡</em> <b>'+fmt2(c.dead)+'</b></span>'
      + '<span><em>气候</em> <b>'+clName+'</b></span>'
      + '<span><em>医疗</em> <b>'+(c.hc*100).toFixed(0)+'</b></span>'
      + '<span><em>机场</em> <b>'+c.air+'</b> · <em>港口</em> <b>'+c.sea+'</b></span>'
      + (c.airC?'<span style="color:#ff9a7a"><em>机场</em> <b>已关闭</b></span>':'')
      + (c.seaC?'<span style="color:#ff9a7a"><em>港口</em> <b>已封锁</b></span>':'')
      + '</div>';
    cinfo.style.display = 'block';
    clearTimeout(showCountry.t);
    showCountry.t = setTimeout(function(){ cinfo.style.display='none'; showInfo=-1; }, 4000);
  }

  /* ------- 速度 ------- */
  var spBtns = document.querySelectorAll('.spd button');
  for (var s2 = 0; s2 < spBtns.length; s2++){
    spBtns[s2].addEventListener('click', function(){
      if (S.over) return;
      S.speed = +this.dataset.s;
      for (var k = 0; k < spBtns.length; k++) spBtns[k].classList.toggle('on', spBtns[k] === this);
    });
  }

  /* ------- 开局选择 ------- */
  var cardsEl = document.getElementById('pathoCards');
  var pickBtn = document.getElementById('btnPick');
  var chosen = null;
  var order = ['bacteria','virus','fungus','parasite'];
  cardsEl.innerHTML = order.map(function(k){
    var p = PATHOGENS[k];
    return '<button class="card" data-k="'+k+'"><span class="ci">'+p.ic+'</span><span class="cm">'
      + '<b>'+p.name+'</b><span>传染 '+p.inf+' · 严重 '+p.sev+' · 致死 '+p.let+' · 突变 '+(p.mut*100).toFixed(0)+'%</span>'
      + '<span>'+p.desc+'</span></span></button>';
  }).join('');
  var cards = cardsEl.querySelectorAll('.card');
  for (var c2 = 0; c2 < cards.length; c2++){
    cards[c2].addEventListener('click', function(){
      chosen = this.dataset.k;
      for (var k = 0; k < cards.length; k++) cards[k].classList.toggle('on', cards[k] === this);
      pickBtn.disabled = false;
    });
  }
  var diffSel = 'normal';
  var diffBtns = document.querySelectorAll('#diffRow button');
  for (var d1 = 0; d1 < diffBtns.length; d1++){
    diffBtns[d1].addEventListener('click', function(){
      diffSel = this.dataset.d;
      for (var k = 0; k < diffBtns.length; k++) diffBtns[k].classList.toggle('on', diffBtns[k] === this);
    });
  }

  document.querySelector('.dname').addEventListener('click', function(){
    if (!S.started) return;
    var v = prompt('为你的病原体命名', S.name);
    if (v && v.trim()) { S.name = v.trim().slice(0, 12); updateHud(); }
  });

  pickBtn.addEventListener('click', function(){
    if (!chosen) return;
    S = newGame(chosen, undefined, diffSel);
    S.phase = 'pick';
    document.getElementById('dn').textContent = S.name;
    document.getElementById('startScreen').style.display = 'none';
    newsTxt.textContent = '点击地图上任意一个国家，投放零号病人。';
    resize();
    renderNodes(); updateHud(); render();
  });

  document.getElementById('btnAgain').addEventListener('click', function(){
    location.reload();
  });

  /* ------- 结束 ------- */
  var lastOver = false;
  function checkEnd(){
    if (S.over && !lastOver){
      lastOver = true;
      var tEl = document.getElementById('endTitle');
      tEl.textContent = S.win ? '人类灭绝' : '解药完成';
      tEl.className = S.win ? 'win' : '';
      document.getElementById('endSub').textContent = S.win ? 'HUMANITY EXTINCT' : 'CURE DEVELOPED';
      document.getElementById('endStats').innerHTML =
        '<span class="rl">' + (S.reason||'') + '</span>存活天数 <b>' + Math.floor(S.day) + '</b><br>'
        + '感染人口 <b>' + fmt2(S.inf) + '</b> · 死亡 <b>' + fmt2(S.dead) + '</b><br>'
        + '感染国家 <b>' + S.ctryCount + '/' + MAPDATA.countries.length + '</b>';
      document.getElementById('endScreen').style.display = 'flex';
    }
  }

  setInterval(function(){ if (S.over) checkEnd(); }, 300);

  var hudTimer = setInterval(function(){
    updateHud();
    tickFlash();
    if (!S.over) renderNodes();
    if (S.over) checkEnd();
  }, 400);

  window.addEventListener('resize', resize);
  if (window.ResizeObserver) new ResizeObserver(function(){ resize(); }).observe(wrap);
  resize();
  renderNodes();
  requestAnimationFrame(loop);
})();
