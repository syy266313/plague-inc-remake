/* 瘟疫公司复刻版 · 数据层
 *
 * 只在运行时从 CDN 拉取 world-atlas 的 TopoJSON，解码成"国家多边形 + 锚点 + 邻国"，
 * 因此仓库里不需要存放几百 KB 的几何数据。
 * 气候/财富/医疗/机场/港口/人口这类人工校准过的数值放在下面的 META 表里。
 *
 * 格式： 国名|气候(cold/hot/arid/temp)|财富(0-2)|医疗(0-1)|机场(0-3)|港口(0-2)|人口
 */
(function () {
  var META = `Fiji|temp|0|0.38|1|1|930000
Tanzania|hot|0|0.38|2|1|56318348
W. Sahara|arid|0|0.38|1|0|600000
Canada|cold|2|0.9|3|2|37057765
United States of America|temp|2|0.9|3|2|335000000
Kazakhstan|arid|1|0.62|2|0|18272430
Uzbekistan|arid|0|0.38|2|0|32955400
Papua New Guinea|hot|0|0.38|1|1|8606316
Indonesia|hot|0|0.38|2|1|267663435
Argentina|temp|1|0.62|2|1|44494502
Chile|temp|1|0.62|2|1|18729160
Dem. Rep. Congo|hot|0|0.38|2|1|102000000
Somalia|arid|0|0.38|2|1|15008154
Kenya|hot|0|0.38|2|1|51393010
Sudan|arid|0|0.38|2|1|41801533
Chad|arid|0|0.38|2|0|15477751
Haiti|temp|0|0.38|1|1|11123176
Dominican Rep.|temp|0|0.38|1|1|11300000
Russia|cold|1|0.62|2|1|144000000
Bahamas|temp|0|0.38|0|1|385640
Falkland Is.|temp|0|0.38|0|1|4000
Norway|cold|2|0.9|2|2|5311916
Greenland|cold|0|0.38|0|1|56025
Timor-Leste|hot|0|0.38|1|1|1400000
South Africa|temp|1|0.62|2|1|57779622
Lesotho|temp|0|0.38|1|0|2108132
Mexico|temp|1|0.62|2|1|126190788
Uruguay|temp|1|0.62|1|1|3449299
Brazil|hot|1|0.62|2|1|209469333
Bolivia|temp|0|0.38|1|0|11353142
Peru|hot|1|0.62|2|1|31989256
Colombia|hot|1|0.62|2|1|49648685
Panama|hot|1|0.62|1|1|4176873
Costa Rica|hot|1|0.62|1|1|4999441
Nicaragua|hot|0|0.38|1|1|6465513
Honduras|hot|0|0.38|1|1|9587522
El Salvador|hot|0|0.38|1|1|6420744
Guatemala|hot|0|0.38|2|1|17247807
Belize|temp|0|0.38|0|1|383071
Venezuela|hot|1|0.62|2|1|28870195
Guyana|hot|0|0.38|1|1|779004
Suriname|hot|0|0.38|1|1|575991
France|temp|2|0.9|3|2|66977107
Ecuador|hot|0|0.38|2|1|17084357
Puerto Rico|temp|0|0.38|1|1|3195153
Jamaica|temp|0|0.38|1|1|2934855
Cuba|temp|0|0.38|1|1|11338138
Zimbabwe|temp|0|0.38|1|0|14439018
Botswana|temp|0|0.38|1|0|2254126
Namibia|temp|0|0.38|1|1|2448255
Senegal|hot|0|0.38|2|1|15854360
Mali|arid|0|0.38|2|0|19077690
Mauritania|arid|0|0.38|1|1|4403319
Benin|hot|0|0.38|1|1|11485048
Niger|arid|0|0.38|2|0|22442948
Nigeria|hot|0|0.38|2|1|195874740
Cameroon|hot|0|0.38|2|1|25216237
Togo|hot|0|0.38|1|1|7889094
Ghana|hot|0|0.38|2|1|29767108
Côte d'Ivoire|hot|0|0.38|2|1|28000000
Guinea|hot|0|0.38|1|1|12414318
Guinea-Bissau|hot|0|0.38|1|1|1874309
Liberia|hot|0|0.38|1|1|4818977
Sierra Leone|hot|0|0.38|1|1|7650154
Burkina Faso|hot|0|0.38|2|1|19751535
Central African Rep.|hot|0|0.38|1|0|5600000
Congo|hot|0|0.38|1|1|5244363
Gabon|hot|0|0.38|1|1|2119275
Eq. Guinea|hot|0|0.38|1|1|1700000
Zambia|hot|0|0.38|2|0|17351822
Malawi|hot|0|0.38|2|0|18143315
Mozambique|temp|0|0.38|2|1|29495962
eSwatini|temp|0|0.38|1|0|1200000
Angola|hot|0|0.38|2|1|30809762
Burundi|hot|0|0.38|1|0|11175378
Israel|arid|2|0.9|2|2|8882800
Lebanon|temp|1|0.62|1|1|6848925
Madagascar|temp|0|0.38|2|1|26262368
Palestine|temp|0|0.38|1|1|4569087
Gambia|hot|0|0.38|1|1|2280102
Tunisia|arid|1|0.62|1|1|11565204
Algeria|arid|1|0.62|2|1|42228429
Jordan|arid|1|0.62|1|1|9956011
United Arab Emirates|arid|2|0.9|2|2|9630959
Qatar|arid|2|0.9|2|2|2781677
Kuwait|arid|2|0.9|2|2|4137309
Iraq|arid|0|0.38|2|1|38433600
Oman|arid|1|0.62|1|1|4829483
Vanuatu|hot|0|0.38|0|1|292680
Cambodia|hot|0|0.38|2|1|16249798
Thailand|hot|1|0.62|2|1|69428524
Laos|temp|0|0.38|1|0|7061507
Myanmar|temp|0|0.38|2|1|53708395
Vietnam|hot|0|0.38|2|1|95540395
North Korea|temp|0|0.38|2|1|25549819
South Korea|temp|2|0.9|3|2|51606633
Mongolia|arid|0|0.38|1|0|3170208
India|temp|0|0.38|2|1|1352617328
Bangladesh|temp|0|0.38|2|1|161356039
Bhutan|temp|0|0.38|1|0|754394
Nepal|temp|0|0.38|2|0|28087871
Pakistan|arid|0|0.38|2|1|212215030
Afghanistan|arid|0|0.38|2|0|37172386
Tajikistan|temp|0|0.38|1|0|9100837
Kyrgyzstan|temp|0|0.38|1|0|6322800
Turkmenistan|arid|0|0.38|1|0|5850908
Iran|arid|1|0.62|2|1|81800269
Syria|arid|0|0.38|2|1|16906283
Armenia|temp|0|0.38|1|0|2951776
Sweden|cold|2|0.9|2|2|10175214
Belarus|temp|1|0.62|1|0|9483499
Ukraine|temp|0|0.38|2|1|44622516
Poland|temp|1|0.62|2|1|37974750
Austria|temp|2|0.9|2|0|8840521
Hungary|temp|1|0.62|1|0|9775564
Moldova|temp|0|0.38|1|0|2706049
Romania|temp|1|0.62|2|1|19466145
Lithuania|cold|1|0.62|1|1|2801543
Latvia|cold|1|0.62|1|1|1927174
Estonia|cold|2|0.9|2|2|1321977
Germany|temp|2|0.9|3|2|82905782
Bulgaria|temp|1|0.62|1|1|7025037
Greece|temp|2|0.9|2|2|10731726
Turkey|temp|1|0.62|2|1|82319724
Albania|temp|0|0.38|1|1|2866376
Croatia|temp|1|0.62|1|1|4087843
Switzerland|temp|2|0.9|2|0|8513227
Luxembourg|temp|2|0.9|2|0|607950
Belgium|temp|2|0.9|2|2|11433256
Netherlands|temp|2|0.9|3|2|17231624
Portugal|temp|2|0.9|2|2|10283822
Spain|temp|2|0.9|3|2|46796540
Ireland|temp|2|0.9|2|2|4867309
New Caledonia|temp|0|0.38|0|1|284060
Solomon Is.|hot|0|0.38|1|1|740000
New Zealand|temp|2|0.9|2|2|4841000
Australia|arid|2|0.9|3|2|24982688
Sri Lanka|hot|0|0.38|2|1|21670000
China|temp|1|0.62|2|1|1392730000
Taiwan|temp|2|0.9|3|2|23500000
Italy|temp|2|0.9|3|2|60421760
Denmark|cold|2|0.9|2|2|5793636
United Kingdom|temp|2|0.9|3|2|66460344
Iceland|cold|2|0.9|1|2|352721
Azerbaijan|temp|0|0.38|1|0|9939800
Georgia|temp|0|0.38|1|1|3726549
Philippines|hot|0|0.38|2|1|106651922
Malaysia|hot|1|0.62|2|1|31528585
Brunei|hot|2|0.9|1|2|428962
Slovenia|temp|2|0.9|2|2|2073894
Finland|cold|2|0.9|2|2|5515525
Slovakia|temp|1|0.62|1|0|5446771
Czechia|temp|2|0.9|2|0|10800000
Eritrea|arid|0|0.38|1|1|6213972
Japan|temp|2|0.9|3|2|126529100
Paraguay|temp|0|0.38|1|0|6956071
Yemen|arid|0|0.38|2|1|28498687
Saudi Arabia|arid|2|0.9|3|2|33699947
N. Cyprus|temp|0|0.38|0|1|380000
Cyprus|temp|2|0.9|2|2|1189265
Morocco|arid|0|0.38|2|1|36029138
Egypt|arid|0|0.38|2|1|98423595
Libya|arid|1|0.62|1|1|7000000
Ethiopia|hot|0|0.38|2|0|109224559
Djibouti|arid|0|0.38|1|1|958920
Somaliland|arid|0|0.38|1|1|5800000
Uganda|hot|0|0.38|2|0|42723139
Rwanda|hot|0|0.38|1|0|12301939
Bosnia and Herz.|temp|0|0.38|1|0|3200000
Macedonia|temp|0|0.38|1|0|1800000
Serbia|temp|1|0.62|1|0|6963764
Montenegro|temp|0|0.38|1|1|631219
Kosovo|temp|0|0.38|1|0|1700000
Trinidad and Tobago|hot|0|0.38|1|1|1389858
S. Sudan|hot|0|0.38|1|0|11400000`;

  var ATLAS = [
    'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json',
    'https://unpkg.com/world-atlas@2/countries-110m.json'
  ];

  var SKIP = { 'Antarctica': 1, 'Fr. S. Antarctic Lands': 1 };

  /* ---------- TopoJSON 解码：增量编码的 arcs -> 绝对经纬度 ---------- */
  function decodeArcs(topo) {
    var t = topo.transform || { scale: [1, 1], translate: [0, 0] };
    var sx = t.scale[0], sy = t.scale[1], tx = t.translate[0], ty = t.translate[1];
    var out = [], arcs = topo.arcs;
    for (var i = 0; i < arcs.length; i++) {
      var pts = arcs[i], x = 0, y = 0, arr = [];
      for (var j = 0; j < pts.length; j++) {
        x = j === 0 ? pts[j][0] : x + pts[j][0];
        y = j === 0 ? pts[j][1] : y + pts[j][1];
        arr.push([x * sx + tx, y * sy + ty]);
      }
      out.push(arr);
    }
    return out;
  }

  /* ---------- 把一个环的 arc 序列拼成连续点列 ---------- */
  function ringPoints(seq, arcs) {
    var pts = [];
    for (var i = 0; i < seq.length; i++) {
      var k = seq[i], rev = k < 0, src = arcs[rev ? ~k : k];
      var seg = rev ? src.slice().reverse() : src;
      for (var j = i ? 1 : 0; j < seg.length; j++) pts.push(seg[j]);
    }
    return pts;
  }

  function round1(v) { return Math.round(v * 10) / 10; }

  function buildRings(geom, arcs) {
    var rings = [];
    /* Polygon 的 arcs 是"环的列表"，MultiPolygon 才是"多边形的列表" */
    var polys = geom.type === 'MultiPolygon' ? geom.arcs : [geom.arcs];
    for (var p = 0; p < polys.length; p++) {
      var poly = polys[p];
      for (var r = 0; r < poly.length; r++) {
        var raw = ringPoints(poly[r], arcs), pts = [];
        for (var i = 0; i < raw.length; i++) {
          var lon = round1(raw[i][0]), lat = round1(raw[i][1]);
          if (pts.length && pts[pts.length - 1][0] === lon && pts[pts.length - 1][1] === lat) continue;
          pts.push([lon, lat]);
        }
        /* 收尾点与起点重合就去掉，交给渲染端 closePath */
        while (pts.length > 3) {
          var a = pts[0], b = pts[pts.length - 1];
          if (a[0] === b[0] && a[1] === b[1]) pts.pop(); else break;
        }
        if (pts.length >= 3) rings.push(pts);
      }
    }
    return rings;
  }

  /* ---------- 点在多边形内（偶奇规则，遍历所有环） ---------- */
  function inside(px, py, rings) {
    var hit = false;
    for (var r = 0; r < rings.length; r++) {
      var pts = rings[r];
      for (var i = 0, j = pts.length - 1; i < pts.length; j = i++) {
        var xi = pts[i][0], yi = pts[i][1], xj = pts[j][0], yj = pts[j][1];
        if ((yi > py) !== (yj > py) && px < (xj - xi) * (py - yi) / (yj - yi) + xi) hit = !hit;
      }
    }
    return hit;
  }

  function segDist(px, py, ax, ay, bx, by) {
    var dx = bx - ax, dy = by - ay, t = 0;
    var len = dx * dx + dy * dy;
    if (len > 0) t = ((px - ax) * dx + (py - ay) * dy) / len;
    t = t < 0 ? 0 : t > 1 ? 1 : t;
    var qx = ax + t * dx, qy = ay + t * dy;
    return Math.sqrt((px - qx) * (px - qx) + (py - qy) * (py - qy));
  }

  /* ---------- 锚点：多边形内部"离边界最远"的那个点 ----------
   * 用包围盒上均匀网格搜索代替原来的 64×64 固定网格：
   * 小国网格更细，大国更粗，总代价可控。
   */
  function anchorOf(rings, bbox) {
    var w = bbox[2] - bbox[0], h = bbox[3] - bbox[1];
    if (!(w > 0) || !(h > 0)) return [(bbox[0] + bbox[2]) / 2, (bbox[1] + bbox[3]) / 2];
    var n = 30, best = null, bestD = -1;
    for (var i = 1; i < n; i++) {
      for (var j = 1; j < n; j++) {
        var lon = bbox[0] + w * i / n, lat = bbox[1] + h * j / n;
        if (!inside(lon, lat, rings)) continue;
        var d = 1e9;
        for (var r = 0; r < rings.length && d > 0; r++) {
          var pts = rings[r], step = pts.length > 400 ? 4 : pts.length > 120 ? 2 : 1;
          for (var k = 0; k < pts.length; k += step) {
            var a = pts[k], b = pts[(k + step) % pts.length];
            var dist = segDist(lon, lat, a[0], a[1], b[0], b[1]);
            if (dist < d) d = dist;
            if (d <= bestD) break;
          }
        }
        if (d > bestD) { bestD = d; best = [lon, lat]; }
      }
    }
    if (best) return [round1(best[0]), round1(best[1])];
    return [round1((bbox[0] + bbox[2]) / 2), round1((bbox[1] + bbox[3]) / 2)];
  }

  /* ---------- 邻国：包围盒外扩 0.8°，顶点距离 ≤0.7° ---------- */
  function neighbors(list) {
    for (var i = 0; i < list.length; i++) {
      var a = list[i];
      for (var j = i + 1; j < list.length; j++) {
        var b = list[j], bb = b.bb;
        if (bb[0] - 0.8 > a.bb[2] || bb[2] + 0.8 < a.bb[0]) continue;
        if (bb[1] - 0.8 > a.bb[3] || bb[3] + 0.8 < a.bb[1]) continue;
        if (near(a, b)) { a.nb.push(b.i); b.nb.push(a.i); }
      }
    }
  }

  function near(a, b) {
    var pa = a.sample, pb = b.sample;
    for (var i = 0; i < pa.length; i++) {
      for (var j = 0; j < pb.length; j++) {
        var dx = pa[i][0] - pb[j][0], dy = pa[i][1] - pb[j][1];
        if (dx * dx + dy * dy <= 0.49) return true;
      }
    }
    return false;
  }

  function build(topo) {
    var arcs = decodeArcs(topo);
    var geoms = topo.objects.countries.geometries;
    var meta = {};
    META.split('\n').forEach(function (line) {
      var f = line.split('|');
      if (f.length === 7) meta[f[0]] = f.slice(1);
    });

    var list = [], total = 0;
    for (var g = 0; g < geoms.length; g++) {
      var name = geoms[g].properties.name;
      if (SKIP[name]) continue;
      var rings = buildRings(geoms[g], arcs);
      if (!rings.length) continue;
      var bb = [180, 90, -180, -90];
      for (var r = 0; r < rings.length; r++) for (var k = 0; k < rings[r].length; k++) {
        var p = rings[r][k];
        if (p[0] < bb[0]) bb[0] = p[0];
        if (p[0] > bb[2]) bb[2] = p[0];
        if (p[1] < bb[1]) bb[1] = p[1];
        if (p[1] > bb[3]) bb[3] = p[1];
      }
      var m = meta[name] || ['temp', '0', '0.38', '1', '0', '0'];
      var pop = parseInt(m[5], 10) || 0;
      total += pop;
      list.push({
        i: list.length, n: name, pop: pop,
        cl: m[0], w: +m[1], hc: +m[2], air: +m[3], sea: +m[4],
        r: rings, bb: bb, nb: [],
        c: anchorOf(rings, bb)
      });
    }

    /* 邻国用的顶点抽样 */
    for (var a = 0; a < list.length; a++) {
      var pts = [];
      for (var r2 = 0; r2 < list[a].r.length; r2++) {
        var ring = list[a].r[r2], step = ring.length > 300 ? 3 : ring.length > 80 ? 2 : 1;
        for (var k2 = 0; k2 < ring.length; k2 += step) pts.push(ring[k2]);
      }
      list[a].sample = pts;
    }
    neighbors(list);

    list.forEach(function (c) { delete c.bb; delete c.sample; });
    return { countries: list, worldPop: total };
  }

  function load(urls, ok, fail) {
    var i = 0;
    (function next() {
      if (i >= urls.length) return fail(new Error('no source'));
      var xhr = new XMLHttpRequest();
      xhr.open('GET', urls[i++], true);
      xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) {
          try { ok(JSON.parse(xhr.responseText)); } catch (e) { next(); }
        } else next();
      };
      xhr.onerror = next;
      xhr.send();
    })();
  }

  function boot() {
    var t0 = Date.now();
    load(ATLAS, function (topo) {
      window.MAPDATA = build(topo);
      window.MAPDATA.ms = Date.now() - t0;
      var el = document.getElementById('boot');
      if (el) el.parentNode.removeChild(el);
      var s = document.createElement('script');
      s.src = 'game.js';
      document.body.appendChild(s);
    }, function () {
      var el = document.getElementById('boot');
      if (el) el.textContent = '世界地图加载失败，请检查网络后刷新页面';
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
