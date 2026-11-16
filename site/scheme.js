// Scheme scoring: how well natural materials sit with a set of paint colours.
// Plain script, shared by the build (Node) and the home page (browser). Defines one global: SCHEME.
// The rules are established colour-design practice made measurable; see Guide §7.
var SCHEME = (function () {
  function lab(hex) {
    var lin = function (c) { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
    var r = lin(parseInt(hex.slice(1, 3), 16)), g = lin(parseInt(hex.slice(3, 5), 16)), b = lin(parseInt(hex.slice(5, 7), 16));
    var q = function (t) { return t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116; };
    var X = q((0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.95047), Y = q(0.2126 * r + 0.7152 * g + 0.0722 * b), Z = q((0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.08883);
    var L = 116 * Y - 16, A = 500 * (X - Y), B = 200 * (Y - Z);
    return { L: L, a: A, b: B, C: Math.hypot(A, B), h: (Math.atan2(B, A) * 180 / Math.PI + 360) % 360 };
  }
  function de(p, q) { return Math.hypot(p.L - q.L, p.a - q.a, p.b - q.b); }
  function hueGap(x, y) { var d = Math.abs(x - y) % 360; return d > 180 ? 360 - d : d; }

  var R = { echo: 6, nearMiss: 13, quietStrength: 30, undertone: 70, neutral: 9, materialsApart: 15, valueSpread: 50 };

  // Paint colours: use their roles if given, otherwise infer them (lightest = Field, darkest = Weight, strongest of the rest = Accent).
  function roles(paints) {
    var ps = paints.map(function (p) { return { name: p.name, hex: p.hex, role: p.role, m: lab(p.hex) }; });
    if (ps.every(function (p) { return p.role; })) return ps;
    var byL = ps.slice().sort(function (x, y) { return y.m.L - x.m.L; });
    byL[0].role = 'Field'; byL[byL.length - 1].role = 'Weight';
    var rest = byL.slice(1, -1).sort(function (x, y) { return y.m.C - x.m.C; });
    if (rest[0]) rest[0].role = 'Accent';
    for (var i = 1; i < rest.length; i++) rest[i].role = 'Bridge';
    return ps;
  }

  // Score one scheme: paints plus materials. Returns a 0–100 score, a verdict, and the reasons in plain words.
  function score(paints, materials) {
    var ps = roles(paints), good = [], bad = [], pts = 100;
    var field = ps.find(function (p) { return p.role === 'Field'; }), weight = ps.find(function (p) { return p.role === 'Weight'; });
    var accent = ps.find(function (p) { return p.role === 'Accent'; });
    var loudLimit = accent ? accent.m.C - 5 : R.quietStrength;
    var ms = materials.map(function (x) { return { name: x.name, x: x, m: lab(x.typical), lo: lab(x.light), hi: lab(x.dark) }; });
    ms.forEach(function (mt) {
      var near = ps.map(function (p) { return { p: p, d: de(mt.m, p.m) }; }).sort(function (a, b) { return a.d - b.d; })[0];
      var echo = near.d <= R.echo;
      if (echo) good.push(mt.name + ' echoes the ' + near.p.role.toLowerCase() + ' (' + near.p.name + '), so it carries a palette colour');
      else if (near.d < R.nearMiss) { pts -= 25; bad.push(mt.name + ' is a near-miss for ' + near.p.name + ': close enough to look like a mistake, not a choice'); }
      if (!echo && mt.m.C > loudLimit) { pts -= 20; bad.push(mt.name + ' is louder than ' + (accent ? 'the accent' : 'a natural material should be') + ' and competes with it'); }
      else if (!echo) good.push(mt.name + ' stays quiet under the paint colours');
      if (!echo && mt.m.C >= R.neutral) {
        var anchors = [field, weight].filter(function (p) { return p && p.m.C >= R.neutral; });
        var agrees = !anchors.length || anchors.some(function (p) { return hueGap(p.m.h, mt.m.h) <= R.undertone; });
        if (agrees) good.push(mt.name + ' shares an undertone with the ' + (anchors.length ? anchors.map(function (p) { return p.role.toLowerCase(); }).join(' or ') : 'neutral paints'));
        else { pts -= 15; bad.push(mt.name + "'s undertone fights the field and weight"); }
      }
    });
    if (ms.length === 2) {
      var d2 = de(ms[0].m, ms[1].m);
      if (d2 < R.materialsApart) { pts -= 15; bad.push(ms[0].name + ' and ' + ms[1].name + ' are too alike to both earn a place'); }
      else if (Math.abs(ms[0].m.L - ms[1].m.L) >= 15) good.push('The two materials sit at different depths, which gives the room structure');
    }
    var Ls = ps.map(function (p) { return p.m.L; }).concat(ms.map(function (mt) { return mt.m.L; }));
    var spread = Math.max.apply(null, Ls) - Math.min.apply(null, Ls);
    if (spread < R.valueSpread) { pts -= 10; bad.push('Light to dark spans only ' + Math.round(spread) + ' points; the room will look flat'); }
    else good.push('Light to dark spans ' + Math.round(spread) + ' points: a full range from walls to anchors');
    // Graded fit on top of the rules: undertone affinity, an even light-to-dark ladder, and depth between the two materials.
    var anchors2 = [field, weight].filter(function (p) { return p && p.m.C >= R.neutral; });
    var aff = ms.length ? ms.reduce(function (t, mt) {
      if (!anchors2.length) return t + 1;
      if (mt.m.C < R.neutral) return t + 0.6; // neutral: safe, but adds nothing
      var g = Math.min.apply(null, anchors2.map(function (p) { return hueGap(p.m.h, mt.m.h); }));
      return t + Math.max(0, 1 - g / 90);
    }, 0) / ms.length : 1;
    var sorted = Ls.slice().sort(function (a, b) { return a - b; }), gap = 0;
    for (var k = 1; k < sorted.length; k++) gap = Math.max(gap, sorted[k] - sorted[k - 1]);
    var ladder = Math.min(1, Math.max(0, (45 - gap) / 30));
    var depth = ms.length === 2 ? Math.min(1, Math.abs(ms[0].m.L - ms[1].m.L) / 30) : 1;
    var fit = 50 * aff + 30 * ladder + 20 * depth;
    var total = Math.round(Math.max(0, pts) * 0.6 + fit * 0.4);
    return { score: total, rules: Math.max(0, pts), fit: Math.round(fit), verdict: total >= 85 ? 'Cohesive' : total >= 70 ? 'Works with care' : 'Fights itself', good: good, bad: bad };
  }

  // Candidate materials for a room: inside materials, excluding living context (plants are always allowed for, never chosen).
  function candidates(all) { return all.filter(function (x) { return x.where.indexOf('inside') >= 0 && x.group !== 'Living and outdoor context'; }); }
  // A scheme's two materials: one surface (floor, wall, worktop) and one touch (fabric, leather, metal), as designers pair them.
  var SURFACE = ['Wood', 'Stone', 'Clay', 'Plaster and concrete'];
  function kind(x) { return SURFACE.indexOf(x.group) >= 0 ? 'surface' : 'touch'; }
  function rank(paints, all) {
    var c = candidates(all), out = [];
    c.filter(function (x) { return kind(x) === 'surface'; }).forEach(function (a) {
      c.filter(function (x) { return kind(x) === 'touch'; }).forEach(function (b) { out.push({ pair: [a, b], s: score(paints, [a, b]) }); });
    });
    return out.sort(function (a, b) { return b.s.score - a.s.score || b.s.good.length - a.s.good.length; });
  }
  // Replacements for one slot, keeping the other material, best first.
  function swaps(paints, all, keep, drop) {
    return candidates(all).filter(function (x) { return x.name !== drop.name && kind(x) === kind(drop); })
      .map(function (x) { return { m: x, s: score(paints, [keep, x]) }; })
      .sort(function (a, b) { return b.s.score - a.s.score; });
  }
  return { lab: lab, de: de, roles: roles, score: score, rank: rank, swaps: swaps, kind: kind, rules: R };
})();
if (typeof module !== 'undefined') module.exports = SCHEME;
