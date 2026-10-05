/* =============================================================
   内置 Java 运行器（浏览器端迷你解释器）
   支持一个面向教学的 Java 子集：控制台输出、基本类型、数组、
   分支循环、方法、类与对象、继承/接口/多态、异常、集合、文件读写、
   Scanner 输入等，用于让练习里的代码“真正跑起来”看输出。
   说明：这是为学习打造的简化解释器，不是完整的 JVM，语法覆盖范围有限。
   ============================================================= */
(function (root) {
  'use strict';

  /* ---------- 预处理：去掉 package / import / 注解 ---------- */
  function preprocess(src) {
    let s = src.replace(/\/\*[\s\S]*?\*\//g, function (m) {
      return m.replace(/[^\n]/g, ' ');   // 块注释替换成等长空白，保留行号结构
    });
    s = s.replace(/\/\/[^\n]*/g, '');
    s = s.replace(/^\s*package\s+[^;]*;/gm, '');
    s = s.replace(/^\s*import\s+[^;]*;/gm, '');
    s = s.replace(/@\w+(\([^)]*\))?/g, ' ');
    return s;
  }

  /* ---------- 词法分析 ---------- */
  function tokenize(src) {
    const toks = [];
    let i = 0, n = src.length;
    while (i < n) {
      const c = src[i];
      if (/\s/.test(c)) { i++; continue; }
      if (c === '/' && src[i + 1] === '/') { while (i < n && src[i] !== '\n') i++; continue; }
      if (c === '/' && src[i + 1] === '*') {
        i += 2;
        while (i < n && !(src[i] === '*' && src[i + 1] === '/')) i++;
        i += 2;
        continue;
      }
      if (c === '"' || c === "'") {
        const q = c; let v = ''; i++;
        while (i < n && src[i] !== q) {
          if (src[i] === '\\' && i + 1 < n) {
            const esc = src[i + 1];
            const map = { n: '\n', t: '\t', r: '\r', b: '\b', f: '\f', '\\': '\\', '"': '"', "'": "'" };
            v += (map[esc] !== undefined ? map[esc] : esc);
            i += 2;
          } else { v += src[i]; i++; }
        }
        i++;
        toks.push({ k: 'str', v: v });
        continue;
      }
      if (/[0-9]/.test(c) || (c === '.' && /[0-9]/.test(src[i + 1] || ''))) {
        let num = ''; let isFloat = false;
        while (i < n && /[0-9_]/.test(src[i])) { if (src[i] !== '_') num += src[i]; i++; }
        if (src[i] === '.') { isFloat = true; num += '.'; i++; while (i < n && /[0-9]/.test(src[i])) { num += src[i]; i++; } }
        if (src[i] === 'e' || src[i] === 'E') { isFloat = true; num += 'e'; i++; if (src[i] === '+' || src[i] === '-') { num += src[i]; i++; } while (i < n && /[0-9]/.test(src[i])) { num += src[i]; i++; } }
        if (/[fFdDlL]/.test(src[i] || '')) { if (/[lL]/.test(src[i])) { i++; } else { isFloat = true; i++; } }
        toks.push({ k: 'num', v: num, isFloat: isFloat });
        continue;
      }
      if (/[A-Za-z_$]/.test(c)) {
        let v = '';
        while (i < n && /[A-Za-z0-9_$]/.test(src[i])) { v += src[i]; i++; }
        toks.push({ k: 'id', v: v });
        continue;
      }
      const two = src.substr(i, 2);
      const three = src.substr(i, 3);
      if (three === '>>>') { toks.push({ k: 'op', v: '>>>' }); i += 3; continue; }
      if (two === '>>' || two === '<<') { toks.push({ k: 'op', v: two }); i += 2; continue; }
      if (['==', '!=', '<=', '>=', '&&', '||', '++', '--', '+=', '-=', '*=', '/=', '%=', '->', '::'].indexOf(two) >= 0) {
        toks.push({ k: 'op', v: two }); i += 2; continue;
      }
      if ('+-*/%<>=!&|?^~'.indexOf(c) >= 0) { toks.push({ k: 'op', v: c }); i++; continue; }
      if ('(){}[];,.:'.indexOf(c) >= 0) { toks.push({ k: 'p', v: c }); i++; continue; }
      throw new Error('无法识别的字符：' + c);
    }
    toks.push({ k: 'eof' });
    return toks;
  }

  /* ---------- 括号配对 ---------- */
  function buildMatch(toks) {
    const stack = [];
    const match = {};
    const open = { '(': ')', '[': ']', '{': '}' };
    toks.forEach((t, idx) => {
      if (t.k === 'p' && open[t.v]) stack.push(idx);
      else if (t.k === 'p' && (t.v === ')' || t.v === ']' || t.v === '}')) {
        const oi = stack.pop();
        match[oi] = idx;
        match[idx] = oi;
      }
    });
    return match;
  }

  /* ---------- 值类型判断 ---------- */
  function isIntType(t) { return t === 'int' || t === 'long' || t === 'byte' || t === 'short'; }
  function isFloatType(t) { return t === 'double' || t === 'float'; }
  function isNumType(t) { return isIntType(t) || isFloatType(t); }

  function inferType(v) {
    if (v === null || v === undefined) return 'null';
    if (typeof v === 'boolean') return 'boolean';
    if (typeof v === 'number') return 'int';
    if (typeof v === 'string') return 'String';
    if (typeof v === 'function') return 'fn';
    if (v.__kind === 'strbox') return 'String';
    if (v.__kind) return v.__kind;
    if (v.__cls) return v.__cls.name;
    return 'object';
  }

  function toJavaString(v) {
    if (v === null || v === undefined) return 'null';
    if (typeof v === 'boolean') return v ? 'true' : 'false';
    if (typeof v === 'number') return String(v);
    if (typeof v === 'string') return v;
    if (typeof v === 'function') return '<function>';
    if (v.__kind === 'array') return arrToString(v);
    if (v.__kind === 'list') return '[' + v.a.map(toJavaString).join(', ') + ']';
    if (v.__kind === 'map') {
      let s = '{';
      let first = true;
      v.m.forEach((val, key) => { if (!first) s += ', '; first = false; s += key + '=' + toJavaString(val); });
      return s + '}';
    }
    if (v.__kind === 'set') {
      const arr = Array.from(v.s);
      if (v.sorted) arr.sort(compareNatural);
      return '[' + arr.map(toJavaString).join(', ') + ']';
    }
    if (v.__kind === 'date') return v.toString();
    return String(v);
  }

  function arrToString(v) {
    return '[' + v.a.map(toJavaString).join(', ') + ']';
  }

  function num(v) { return Number(v); }

  /* ---------- 字符串静态方法 & 格式化 ---------- */
  function javaFormat(fmt, args) {
    let ai = 0, out = '', i = 0;
    while (i < fmt.length) {
      const c = fmt[i];
      if (c !== '%') { out += c; i++; continue; }
      i++;
      if (fmt[i] === '%') { out += '%'; i++; continue; }
      if (fmt[i] === 'n') { out += '\n'; i++; continue; }
      let flags = '';
      while (i < fmt.length && '-+0 #'.indexOf(fmt[i]) >= 0) { flags += fmt[i]; i++; }
      let width = '';
      while (i < fmt.length && /\d/.test(fmt[i])) { width += fmt[i]; i++; }
      let prec = '';
      if (fmt[i] === '.') { i++; while (i < fmt.length && /\d/.test(fmt[i])) { prec += fmt[i]; i++; } }
      const conv = fmt[i]; i++;
      const a = args[ai++];
      let s = '';
      if (conv === 's') s = (a == null ? 'null' : toJavaString(a));
      else if (conv === 'd') s = String(Math.trunc(num(a)));
      else if (conv === 'f') { const p = prec === '' ? 6 : Number(prec); s = num(a).toFixed(p); }
      else if (conv === 'b') s = String(Boolean(a));
      else if (conv === 'c') s = String.fromCharCode(num(a));
      else s = '%' + conv;
      if (width) {
        const w = Number(width);
        if (flags.indexOf('-') >= 0) s = s.padEnd(w);
        else if (flags.indexOf('0') >= 0 && conv !== 's') s = s.padStart(w, '0');
        else s = s.padStart(w);
      }
      out += s;
    }
    return out;
  }

  /* ---------- 文件系统（内存模拟，供文件读写练习使用） ---------- */
  const FS = Object.create(null);

  /* ---------- 运行器对外接口（run 在文件末尾定义） ---------- */
  root.JavaRunner = {};
  root.JavaRunner.__fs = FS;
  root.JavaRunner.__preprocess = preprocess;
  root.JavaRunner.__tokenize = tokenize;

  root.__JAVA_INTERNALS = { preprocess: preprocess, tokenize: tokenize, buildMatch: buildMatch, inferType: inferType, toJavaString: toJavaString, javaFormat: javaFormat, num: num, arrToString: arrToString };
})(typeof window !== 'undefined' ? window : globalThis);
/* =============================================================
   运行器第二部分：内置对象与类解析（后续块继续）
   ============================================================= */
(function (root) {
  const I = root.__JAVA_INTERNALS;
  const preprocess = I.preprocess, tokenize = I.tokenize, buildMatch = I.buildMatch, javaFormat = I.javaFormat;

  function exc(name, message) { return { __exc: true, name: name, message: String(message) }; }
  function isExc(v) { return v && v.__exc === true; }
  function isBrk(v) { return v && v.__brk === true; }
  function isCnt(v) { return v && v.__cnt === true; }
  function isRet(v) { return v && v.__ret === true; }
  function num(v) { return Number(v); }

  function inferType(v) {
    if (v === null || v === undefined) return 'null';
    if (typeof v === 'boolean') return 'boolean';
    if (typeof v === 'number') return 'int';
    if (typeof v === 'string') return 'String';
    if (typeof v === 'function') return 'fn';
    if (v.__kind === 'array') return 'array';
    if (v.__kind === 'list') return 'list';
    if (v.__kind === 'map') return 'map';
    if (v.__kind === 'set') return 'set';
    if (v.__kind === 'date') return 'date';
    if (v.__kind === 'sb') return 'StringBuilder';
    if (v.__kind === 'scanner') return 'Scanner';
    if (v.__clsObj) return 'class';
    if (v.__cls) return v.__cls.name;
    return 'object';
  }

  /* ---------- 值工厂 ---------- */
  function makeArray(elems, t) { return { __kind: 'array', a: elems || [], t: t || 'Object' }; }
  function makeList(arr) { return { __kind: 'list', a: arr || [] }; }
  function makeMap() { return { __kind: 'map', m: new Map() }; }
  function makeSet(arr, sorted) {
    const st = { __kind: 'set', s: new Set(), sorted: !!sorted };
    if (arr && arr.length) arr.forEach(function (x) { st.s.add(toKey(x)); });
    return st;
  }
  function makeDate(y, m, d) { return { __kind: 'date', y: y, m: m, d: d }; }
  function dateToStr(d) {
    const p = function (x) { return String(x).padStart(2, '0'); };
    return d.y + '-' + p(d.m) + '-' + p(d.d);
  }

  function toJavaString(v) {
    if (v === null || v === undefined) return 'null';
    if (typeof v === 'boolean') return v ? 'true' : 'false';
    if (typeof v === 'number') return String(v);
    if (typeof v === 'string') return v;
    if (v.__kind === 'array') return '[' + v.a.map(toJavaString).join(', ') + ']';
    if (v.__kind === 'strbox') return v.s;
    if (v.__kind === 'list') return '[' + v.a.map(toJavaString).join(', ') + ']';
    if (v.__kind === 'set') {
      const stArr = Array.from(v.s);
      if (v.sorted) stArr.sort(compareNatural);
      return '[' + stArr.map(toJavaString).join(', ') + ']';
    }
    if (v.__kind === 'map') {
      let s = '{';
      let first = true;
      v.m.forEach(function (val, key) { if (!first) s += ', '; first = false; s += key + '=' + toJavaString(val); });
      return s + '}';
    }
    if (v.__kind === 'date') return dateToStr(v);
    if (v.__kind === 'sb') return v.s;
    if (v.__cls) {
      const rt = root.__JAVA_RT;
      const m = rt.findMethod(v.__cls, 'toString');
      if (m) { const r = rt.invokeMethod(m, v, [], null); return toJavaString(r.v); }
      return v.__cls.name + '@' + Math.floor(Math.random() * 1e6).toString(16);
    }
    return String(v);
  }

  /* ---------- 字符串方法 ---------- */
  function strOf(v) {
    if (v === null || v === undefined) return 'null';
    if (v && v.__kind === 'strbox') return v.s;
    return String(v);
  }

  function stringMethod(s, name, args) {
    args = (args || []).map(strOf);
    switch (name) {
      case 'length': return s.length;
      case 'equals': return s === String(args[0] == null ? 'null' : args[0]);
      case 'equalsIgnoreCase': return s.toLowerCase() === String(args[0] == null ? '' : args[0]).toLowerCase();
      case 'contains': return s.indexOf(String(args[0])) >= 0;
      case 'toUpperCase': return s.toUpperCase();
      case 'toLowerCase': return s.toLowerCase();
      case 'trim': return s.trim();
      case 'substring': return args.length > 1 ? s.substring(num(args[0]), num(args[1])) : s.substring(num(args[0]));
      case 'replace': return s.split(String(args[0])).join(String(args[1]));
      case 'charAt': return s.charAt(num(args[0]));
      case 'isEmpty': return s.length === 0;
      case 'indexOf': return s.indexOf(String(args[0]));
      case 'startsWith': return s.startsWith(String(args[0]));
      case 'endsWith': return s.endsWith(String(args[0]));
      case 'toCharArray': return makeArray(s.split(''), 'char');
      case 'getBytes': return makeArray(s.split('').map(function (c) { return c.charCodeAt(0); }), 'byte');
      case 'concat': return s + String(args[0]);
      case 'split': {
        const d = String(args[0]);
        if (d === '\\|') return makeArray(s.split('|'), 'String');
        if (d === '\\s+') return makeArray(s.split(/\s+/), 'String');
        return makeArray(s.split(d), 'String');
      }
      case 'compareTo': { const o = String(args[0]); return s < o ? -1 : (s > o ? 1 : 0); }
      case 'hashCode': { let h = 0; for (let i = 0; i < s.length; i++) { h = (31 * h + s.charCodeAt(i)) | 0; } return h; }
      default: throw exc('Error', '暂不支持的字符串方法：' + name);
    }
  }

  /* ---------- 集合方法 ---------- */
  function listMethod(l, name, args) {
    const a = l.a;
    switch (name) {
      case 'addAll': {
        const src = args[0];
        const items = src && src.__kind === 'list' ? src.a : (src && src.__kind === 'set' ? Array.from(src.s) : (src && src.__kind === 'array' ? src.a : []));
        if (args.length >= 2) { a.splice(num(args[0]), 0, ...items); return true; }
        items.forEach(function (x) { a.push(x); });
        return items.length > 0;
      }
      case 'containsAll': {
        const src = args[0];
        const items = src && src.__kind === 'list' ? src.a : (src && src.__kind === 'set' ? Array.from(src.s) : (src && src.__kind === 'array' ? src.a : []));
        for (let i = 0; i < items.length; i++) { if (a.indexOf(items[i]) < 0) return false; }
        return true;
      }
      case 'removeAll': {
        const src = args[0];
        const items = src && src.__kind === 'list' ? src.a : (src && src.__kind === 'set' ? Array.from(src.s) : (src && src.__kind === 'array' ? src.a : []));
        for (let i = a.length - 1; i >= 0; i--) { if (items.indexOf(a[i]) >= 0) a.splice(i, 1); }
        return true;
      }
      case 'retainAll': {
        const src = args[0];
        const items = src && src.__kind === 'list' ? src.a : (src && src.__kind === 'set' ? Array.from(src.s) : (src && src.__kind === 'array' ? src.a : []));
        for (let i = a.length - 1; i >= 0; i--) { if (items.indexOf(a[i]) < 0) a.splice(i, 1); }
        return true;
      }
      case 'add':
        if (args.length >= 2) { a.splice(num(args[0]), 0, args[1]); return true; }
        a.push(args[0]); return true;
      case 'get': return a[num(args[0])];
      case 'set': { const old = a[num(args[0])]; a[num(args[0])] = args[1]; return old; }
      case 'remove': {
        const x = args[0];
        if (typeof x === 'number' && Number.isInteger(x) && x >= 0 && x < a.length) return a.splice(x, 1)[0];
        const idx = a.indexOf(x);
        if (idx >= 0) { a.splice(idx, 1); return true; }
        return false;
      }
      case 'size': return a.length;
      case 'contains': return a.indexOf(args[0]) >= 0;
      case 'indexOf': return a.indexOf(args[0]);
      case 'clear': a.length = 0; return undefined;
      case 'isEmpty': return a.length === 0;
      case 'toArray': return makeArray(a.slice(), 'Object');
      case 'forEach': { const fn = args[0]; a.slice().forEach(function (it) { fn(it); }); return undefined; }
      case 'removeIf': {
        const fn = args[0];
        const keep = [];
        for (let i = 0; i < a.length; i++) { if (!fn(a[i])) keep.push(a[i]); }
        const changed = keep.length !== a.length;
        a.length = 0;
        keep.forEach(function (x) { a.push(x); });
        return changed;
      }
      case 'replaceAll': { const fn = args[0]; for (let i = 0; i < a.length; i++) a[i] = fn(a[i]); return undefined; }
      case 'iterator': {
        let idx = 0;
        return {
          hasNext: function () { return idx < a.length; },
          next: function () { return a[idx++]; },
          remove: function () { if (idx > 0) { a.splice(idx - 1, 1); idx--; } return undefined; }
        };
      }
      case 'listIterator': return listMethod(l, 'iterator', args);
      case 'sort': {
        const c = args[0];
        if (c && c.__kind === 'cmp') a.sort(function (x, y) { return c.c(x, y); });
        else if (typeof c === 'function') a.sort(function (x, y) { return c(x, y); });
        else a.sort(function (x, y) { return compareNatural(x, y); });
        return undefined;
      }
      default: throw exc('Error', '暂不支持的 List 方法：' + name);
    }
  }

  function mapMethod(mp, name, args) {
    switch (name) {
      case 'put': return mp.m.set(toKey(args[0]), args[1]) === undefined ? null : mp.m.get(toKey(args[0]));
      case 'get': { const v = mp.m.get(toKey(args[0])); return v === undefined ? null : v; }
      case 'getOrDefault': { const v = mp.m.get(toKey(args[0])); return v === undefined ? args[1] : v; }
      case 'putIfAbsent': { const k = toKey(args[0]); if (!mp.m.has(k)) mp.m.set(k, args[1]); return mp.m.get(k); }
      case 'computeIfAbsent': {
        const k = toKey(args[0]);
        if (!mp.m.has(k) || mp.m.get(k) === undefined) mp.m.set(k, args[1](args[0]));
        return mp.m.get(k);
      }
      case 'merge': {
        const k = toKey(args[0]);
        if (!mp.m.has(k) || mp.m.get(k) === undefined) mp.m.set(k, args[1]);
        else mp.m.set(k, args[2](mp.m.get(k), args[1]));
        return mp.m.get(k);
      }
      case 'containsKey': return mp.m.has(toKey(args[0]));
      case 'size': return mp.m.size;
      case 'remove': { const k = toKey(args[0]); const v = mp.m.get(k); mp.m.delete(k); return v === undefined ? null : v; }
      case 'keySet': { const s = makeSet(); mp.m.forEach(function (v, k) { s.s.add(k); }); return s; }
      case 'values': { const l = makeList(); mp.m.forEach(function (v) { l.a.push(v); }); return l; }
      case 'entrySet': {
        const l = makeList();
        mp.m.forEach(function (v, k) {
          l.a.push({ getKey: function () { return k; }, getValue: function () { return v; } });
        });
        return l;
      }
      case 'forEach': {
        const fn = args[0];
        mp.m.forEach(function (v, k) { fn(k, v); });
        return undefined;
      }
      default: throw exc('Error', '暂不支持的 Map 方法：' + name);
    }
  }

  function setMethod(st, name, args) {
    switch (name) {
      case 'add': return !st.s.has(toKey(args[0])) ? (st.s.add(toKey(args[0])), true) : false;
      case 'contains': return st.s.has(toKey(args[0]));
      case 'size': return st.s.size;
      case 'remove': return st.s.delete(toKey(args[0]));
      case 'iterator': {
        const items = Array.from(st.s);
        let idx = 0;
        return {
          hasNext: function () { return idx < items.length; },
          next: function () { return items[idx++]; },
          remove: function () { if (idx > 0) st.s.delete(items[--idx]); return undefined; }
        };
      }
      case 'isEmpty': return st.s.size === 0;
      case 'clear': st.s.clear(); return undefined;
      case 'addAll': {
        const src = args[0];
        if (src && src.__kind === 'list') src.a.forEach(function (x) { st.s.add(toKey(x)); });
        else if (src && src.__kind === 'set') src.s.forEach(function (x) { st.s.add(x); });
        return true;
      }
      case 'containsAll': {
        const src = args[0];
        const arr = src && src.__kind === 'list' ? src.a : (src && src.__kind === 'set' ? Array.from(src.s) : []);
        for (let i = 0; i < arr.length; i++) { if (!st.s.has(toKey(arr[i]))) return false; }
        return true;
      }
      case 'retainAll': {
        const src = args[0];
        const keep = new Set((src && src.__kind === 'list' ? src.a : (src && src.__kind === 'set' ? Array.from(src.s) : [])).map(toKey));
        Array.from(st.s).forEach(function (k) { if (!keep.has(k)) st.s.delete(k); });
        return true;
      }
      case 'removeAll': {
        const src = args[0];
        (src && src.__kind === 'list' ? src.a : (src && src.__kind === 'set' ? Array.from(src.s) : [])).forEach(function (x) { st.s.delete(toKey(x)); });
        return true;
      }
      default: throw exc('Error', '暂不支持的 Set 方法：' + name);
    }
  }

  function toKey(v) {
    if (v === null || v === undefined) return 'null';
    if (v && v.__kind === 'strbox') return v.s;
    if (typeof v === 'number' || typeof v === 'string' || typeof v === 'boolean') return v;
    const rt = root.__JAVA_RT;
    // 对象作为 key：优先使用用户重写的 hashCode（模拟 Java 哈希表），否则按对象身份区分
    if (v && v.__cls && rt && rt.findMethod) {
      const m = rt.findMethod(v.__cls, 'hashCode');
      if (m) {
        try { return 'h#' + rt.invokeMethod(m, v, [], v.__cls).v; } catch (e) { /* 回退到身份 */ }
      }
    }
    if (!v.__keyId) v.__keyId = 'o#' + (++keySeq);
    return v.__keyId;
  }
  let keySeq = 0;

  function compareNatural(a, b) {
    if (typeof a === 'number' && typeof b === 'number') return a - b;
    return String(a).localeCompare(String(b));
  }

  /* ---------- 内置静态对象 ---------- */
  const System = {
    in: { __kind: 'stdin' },
    currentTimeMillis: function () { return Date.now(); },
    lineSeparator: function () { return '\n'; },
    getProperty: function (k) { return String(k) === 'line.separator' ? '\n' : ''; },
    nanoTime: function () { return Date.now() * 1e6; },
    out: {
      println: function () {
        const parts = Array.prototype.slice.call(arguments).map(function (a) { return toJavaString(a); });
        I._emit.apply(null, parts.concat(['\n']));
      },
      print: function () {
        const parts = Array.prototype.slice.call(arguments).map(function (a) { return toJavaString(a); });
        I._emit.apply(null, parts);
      },
      printf: function (fmt) {
        const args = Array.prototype.slice.call(arguments, 1);
        I._emit(javaFormat(String(fmt), args));
      }
    },
    err: {
      println: function () {
        const parts = Array.prototype.slice.call(arguments).map(function (a) { return toJavaString(a); });
        I._emit.apply(null, parts.concat(['\n']));
      },
      print: function () {
        const parts = Array.prototype.slice.call(arguments).map(function (a) { return toJavaString(a); });
        I._emit.apply(null, parts);
      }
    }
  };

  const MathObj = {
    round: function (x) { return Math.round(num(x)); },
    abs: function (x) { return Math.abs(num(x)); },
    max: function () { return Math.max.apply(null, Array.prototype.map.call(arguments, num)); },
    min: function () { return Math.min.apply(null, Array.prototype.map.call(arguments, num)); },
    pow: function (a, b) { return Math.pow(num(a), num(b)); },
    sqrt: function (a) { return Math.sqrt(num(a)); },
    ceil: function (a) { return Math.ceil(num(a)); },
    floor: function (a) { return Math.floor(num(a)); },
    random: function () { return Math.random(); },
    PI: Math.PI,
    E: Math.E
  };

  const StringStatics = {
    valueOf: function (x) { return x == null ? 'null' : toJavaString(x); },
    format: function (fmt) { return javaFormat(String(fmt), Array.prototype.slice.call(arguments, 1)); },
    join: function (d) {
      const arr = arguments[1];
      if (arr && arr.__kind === 'array') return arr.a.map(toJavaString).join(String(d));
      return Array.prototype.slice.call(arguments, 1).map(toJavaString).join(String(d));
    }
  };

  const IntegerObj = {
    parseInt: function (s) { const r = parseInt(String(s).trim(), 10); if (isNaN(r)) throw exc('NumberFormatException', 'For input string: "' + s + '"'); return r; },
    compare: function (a, b) { return (num(a) > num(b)) - (num(a) < num(b)); },
    valueOf: function (s) { return IntegerObj.parseInt(s); },
    MAX_VALUE: 2147483647, MIN_VALUE: -2147483648
  };

  const DoubleObj = {
    parseDouble: function (s) { const r = parseFloat(String(s).trim()); if (isNaN(r)) throw exc('NumberFormatException', 'For input string: "' + s + '"'); return r; },
    valueOf: function (s) { return DoubleObj.parseDouble(s); },
    MAX_VALUE: Number.MAX_VALUE
  };

  const BooleanObj = {
    parseBoolean: function (s) { return String(s) === 'true'; },
    valueOf: function (s) { return BooleanObj.parseBoolean(s); }
  };

  const ArraysObj = {
    toString: function (arr) {
      if (!arr || arr.__kind !== 'array') return String(arr);
      if (arr.t === 'char') return arr.a.join('');
      return '[' + arr.a.map(toJavaString).join(', ') + ']';
    },
    sort: function (arr) {
      if (arr && arr.__kind === 'array') arr.a.sort(compareNatural);
      return undefined;
    },
    fill: function (arr, val) { if (arr && arr.__kind === 'array') { for (let i = 0; i < arr.a.length; i++) arr.a[i] = val; } return undefined; },
    copyOf: function (arr, n) {
      if (!arr || arr.__kind !== 'array') return makeArray([], 'Object');
      return makeArray(arr.a.slice(0, num(n)), arr.t);
    },
    equals: function (a, b) {
      if (!a || !b || a.__kind !== 'array' || b.__kind !== 'array') return a === b;
      return JSON.stringify(a.a) === JSON.stringify(b.a);
    },
    asList: function () {
      if (arguments.length === 1 && arguments[0] && arguments[0].__kind === 'array') {
        return makeList(arguments[0].a.slice());
      }
      return makeList(Array.prototype.slice.call(arguments));
    },
    binarySearch: function (arr, x) {
      if (!arr || arr.__kind !== 'array') return -1;
      let lo = 0, hi = arr.a.length - 1;
      while (lo <= hi) { const mid = (lo + hi) >> 1; const c = compareNatural(arr.a[mid], x); if (c === 0) return mid; else if (c < 0) lo = mid + 1; else hi = mid - 1; }
      return -(lo + 1);
    }
  };

  const CollectionsObj = {
    sort: function (list, cmp) {
      if (list && list.__kind === 'list') {
        // 支持三种写法：Collections.sort(list) 自然排序；
        // Collections.sort(list, (a, b) -> ...) 传入 lambda；传入 Comparator 对象。
        if (cmp && cmp.__kind === 'cmp') list.a.sort(function (x, y) { return cmp.c(x, y); });
        else if (typeof cmp === 'function') list.a.sort(function (x, y) { return cmp(x, y); });
        else list.a.sort(compareNatural);
      }
      return undefined;
    },
    reverse: function (list) { if (list && list.__kind === 'list') list.a.reverse(); return undefined; },
    max: function (list) {
      if (!list || list.__kind !== 'list' || !list.a.length) throw exc('Error', '空集合');
      if (arguments.length > 1 && arguments[1] && arguments[1].__kind === 'cmp') {
        let m = list.a[0];
        for (let i = 1; i < list.a.length; i++) if (arguments[1].c(list.a[i], m) > 0) m = list.a[i];
        return m;
      }
      let m = list.a[0];
      for (let i = 1; i < list.a.length; i++) if (compareNatural(list.a[i], m) > 0) m = list.a[i];
      return m;
    },
    min: function (list) {
      if (!list || list.__kind !== 'list' || !list.a.length) throw exc('Error', '空集合');
      if (arguments.length > 1 && arguments[1] && arguments[1].__kind === 'cmp') {
        let m = list.a[0];
        for (let i = 1; i < list.a.length; i++) if (arguments[1].c(list.a[i], m) < 0) m = list.a[i];
        return m;
      }
      let m = list.a[0];
      for (let i = 1; i < list.a.length; i++) if (compareNatural(list.a[i], m) < 0) m = list.a[i];
      return m;
    },
    frequency: function (list, obj) {
      if (!list || list.__kind !== 'list') return 0;
      let n = 0;
      list.a.forEach(function (x) { if (x === obj) n++; });
      return n;
    },
    shuffle: function (list) {
      if (list && list.__kind === 'list') {
        for (let i = list.a.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          const t = list.a[i]; list.a[i] = list.a[j]; list.a[j] = t;
        }
      }
      return undefined;
    },
    swap: function (list, i, j) { if (list && list.__kind === 'list') { const t = list.a[i]; list.a[i] = list.a[j]; list.a[j] = t; } return undefined; },
    unmodifiableList: function (l) { return l; },
    unmodifiableMap: function (m) { return m; },
    unmodifiableSet: function (s) { return s; },
    synchronizedList: function (l) { return l; },
    synchronizedMap: function (m) { return m; },
    synchronizedSet: function (s) { return s; },
    emptyList: function () { return makeList([]); },
    emptyMap: function () { return makeMap(); },
    emptySet: function () { return makeSet(); },
    addAll: function (list) { const items = Array.prototype.slice.call(arguments, 1); if (list && list.__kind === 'list') items.forEach(function (x) { list.a.push(x); }); return items.length > 0; },
    nCopies: function (n, v) { const l = makeList([]); for (let i = 0; i < num(n); i++) l.a.push(v); return l; }
    ,
    singletonList: function (v) { return makeList([v]); },
    singleton: function (v) { const s = makeSet(); s.s.add(toKey(v)); return s; },
    singletonMap: function (k, v) { const m = makeMap(); m.m.set(toKey(k), v); return m; }
  };

  const ListStatics = {
    of: function () { return makeList(Array.prototype.slice.call(arguments)); },
    copyOf: function (l) { return makeList(l && l.__kind === 'list' ? l.a.slice() : []); }
  };
  const SetStatics = {
    of: function () { const s = makeSet(); Array.prototype.slice.call(arguments).forEach(function (x) { s.s.add(toKey(x)); }); return s; },
    copyOf: function (st) { const s = makeSet(); if (st && st.__kind === 'set') st.s.forEach(function (x) { s.s.add(x); }); return s; }
  };
  const MapStatics = {
    of: function () { return makeMap(); },
    entry: function (k, v) { return { getKey: function () { return k; }, getValue: function () { return v; } }; }
  };

  function makeComparator(c) {
    const cmp = {
      __kind: 'cmp', c: c,
      reversed: function () { return makeComparator(function (a, b) { return c(b, a); }); },
      thenComparing: function (fn) {
        const prev = c;
        return makeComparator(function (a, b) {
          const r = prev(a, b);
          if (r !== 0) return r;
          const ra = fn(a), rb = fn(b);
          return compareNatural(ra, rb);
        });
      }
    };
    return cmp;
  }

  const ComparatorObj = {
    naturalOrder: function () { return makeComparator(compareNatural); },
    reverseOrder: function () { return makeComparator(function (a, b) { return compareNatural(b, a); }); },
    comparingInt: function (fn) { return makeComparator(function (a, b) { return num(fn(a)) - num(fn(b)); }); },
    comparing: function (fn) { return makeComparator(function (a, b) { return compareNatural(fn(a), fn(b)); }); }
  };

  /* ---------- StringBuilder / Scanner / 文件 / 日期 ---------- */
  const FS = root.JavaRunner.__fs;

  function newSB(init) { return { __kind: 'sb', s: init == null ? '' : String(init) }; }
  function sbMethod(sb, name, args) {
    switch (name) {
      case 'append': sb.s += (args[0] == null ? 'null' : toJavaString(args[0])); return sb;
      case 'insert': { const idx = num(args[0]); const str = toJavaString(args[1]); sb.s = sb.s.slice(0, idx) + str + sb.s.slice(idx); return sb; }
      case 'replace': { const a = num(args[0]), b = num(args[1]); sb.s = sb.s.slice(0, a) + toJavaString(args[2]) + sb.s.slice(b); return sb; }
      case 'delete': { const a = num(args[0]), b = num(args[1]); sb.s = sb.s.slice(0, a) + sb.s.slice(b); return sb; }
      case 'charAt': return sb.s.charAt(num(args[0]));
      case 'indexOf': return sb.s.indexOf(toJavaString(args[0]));
      case 'setLength': { sb.s = args[0] < sb.s.length ? sb.s.slice(0, num(args[0])) : sb.s.padEnd(num(args[0]), '\u0000'); return undefined; }
      case 'isEmpty': return sb.s.length === 0;
      case 'deleteCharAt': { const idx = num(args[0]); sb.s = sb.s.slice(0, idx) + sb.s.slice(idx + 1); return sb; }
      case 'reverse': sb.s = sb.s.split('').reverse().join(''); return sb;
      case 'toString': return sb.s;
      case 'length': return sb.s.length;
      default: throw exc('Error', '暂不支持的 StringBuilder 方法：' + name);
    }
  }

  function newScanner(inputText) {
    const lines = String(inputText || '').split(/\r?\n/);
    return { __kind: 'scanner', lines: lines, words: lines.map(function (l) { return l.trim() === '' ? [] : l.trim().split(/\s+/); }), li: 0, wi: 0 };
  }
  function scannerMethod(sc, name) {
    const nextWord = function () {
      while (sc.li < sc.words.length) {
        if (sc.wi < sc.words[sc.li].length) return sc.words[sc.li][sc.wi++];
        sc.li++; sc.wi = 0;
      }
      return null;
    };
    switch (name) {
      case 'nextInt': { const w = nextWord(); if (w == null) throw exc('Error', '输入不足'); const r = parseInt(w, 10); if (isNaN(r)) throw exc('Error', '输入不是整数：' + w); return r; }
      case 'nextDouble': { const w = nextWord(); if (w == null) throw exc('Error', '输入不足'); const r = parseFloat(w); if (isNaN(r)) throw exc('Error', '输入不是数字：' + w); return r; }
      case 'next': { const w = nextWord(); if (w == null) throw exc('Error', '输入不足'); return w; }
      case 'nextLine': { if (sc.li < sc.lines.length) return sc.lines[sc.li++]; return null; }
      case 'hasNext': { return nextWord() !== null; }
      case 'close': return undefined;
      default: throw exc('Error', '暂不支持的 Scanner 方法：' + name);
    }
  }

  function newFile(path) { return { __kind: 'file', path: String(path) }; }
  function fileMethod(f, name, args) {
    if (name === 'exists') return FS[f.path] !== undefined;
    if (name === 'getName') { const s = String(f.path).replace(/\\/g, '/'); return s.split('/').pop(); }
    if (name === 'length') return FS[f.path] !== undefined ? FS[f.path].length : 0;
    if (name === 'delete') { if (FS[f.path] !== undefined) { delete FS[f.path]; return true; } return false; }
    if (root.__JAVA_RT && root.__JAVA_RT.fileExtra && root.__JAVA_RT.fileExtra[name]) return root.__JAVA_RT.fileExtra[name](f, args || []);
    throw exc('Error', '暂不支持的 File 方法：' + name);
  }

  function newFileWriter(path, append) {
    if (!append) FS[String(path)] = '';
    else if (FS[String(path)] === undefined) FS[String(path)] = '';
    return { __kind: 'fwriter', path: String(path) };
  }
  function writerMethod(w, name, args) {
    if (name === 'write') { FS[w.path] = (FS[w.path] || '') + String(args[0]); return undefined; }
    if (name === 'flush') return undefined;
    if (name === 'close') return undefined;
    throw exc('Error', '暂不支持的 Writer 方法：' + name);
  }
  function newBWriter(w) { return { __kind: 'bwriter', w: w }; }
  function bWriterMethod(bw, name, args) {
    if (name === 'write') { FS[bw.w.path] = (FS[bw.w.path] || '') + String(args[0]); return undefined; }
    if (name === 'newLine') { FS[bw.w.path] = (FS[bw.w.path] || '') + '\n'; return undefined; }
    if (name === 'close' || name === 'flush') return undefined;
    throw exc('Error', '暂不支持的 BufferedWriter 方法：' + name);
  }
  function newBReader(path) {
    const content = FS[String(path)] !== undefined ? FS[String(path)] : '';
    const lines = splitLines(content);
    return { __kind: 'breader', lines: lines, idx: 0 };
  }
  // 按 Java 语义切分文本行：末尾的换行不会多出一行空行
  function splitLines(content) {
    const parts = String(content == null ? '' : content).split('\n');
    while (parts.length && parts[parts.length - 1] === '') parts.pop();
    return parts;
  }
  function bReaderMethod(br, name) {
    if (name === 'readLine') { if (br.idx < br.lines.length) return br.lines[br.idx++]; return null; }
    if (name === 'close') return undefined;
    throw exc('Error', '暂不支持的 BufferedReader 方法：' + name);
  }

  const FilesObj = {
    writeString: function (p, s) { FS[pathStr(p)] = String(s); return undefined; },
    readAllLines: function (p) { const c = FS[pathStr(p)] || ''; return makeList(c === '' ? [] : c.split('\n').filter(function (l, i, arr) { return !(i === arr.length - 1 && l === ''); })); },
    exists: function (p) { return FS[pathStr(p)] !== undefined; },
    size: function (p) { return FS[pathStr(p)] !== undefined ? FS[pathStr(p)].length : 0; }
  };
  function pathStr(p) { return p && p.__kind === 'path' ? p.p : String(p); }

  function newPath(p) { return { __kind: 'path', p: String(p) }; }

  /* ---------- 日期时间 ---------- */
  function makeDate(y, m, d) { return { __kind: 'date', y: y, m: m, d: d, toString: function () { return dateToStr(this); } }; }
  function dateParse(s) { const parts = String(s).split('-'); return makeDate(num(parts[0]), num(parts[1]), num(parts[2])); }
  function daysBetween(a, b) {
    const da = Date.UTC(a.y, a.m - 1, a.d), db = Date.UTC(b.y, b.m - 1, b.d);
    return Math.round((db - da) / 86400000);
  }
  function dateFormat(d, fmt) {
    const p = function (x, n) { return String(x).padStart(n, '0'); };
    return String(fmt)
      .replace(/yyyy/g, p(d.y, 4))
      .replace(/yy/g, p(d.y % 100, 2))
      .replace(/MM/g, p(d.m, 2))
      .replace(/dd/g, p(d.d, 2))
      .replace(/M/g, String(d.m))
      .replace(/d/g, String(d.d));
  }
  const LocalDateObj = {
    now: function () { const t = new Date(); return makeDate(t.getFullYear(), t.getMonth() + 1, t.getDate()); },
    of: function (y, m, d) { return makeDate(num(y), num(m), num(d)); },
    parse: function (s) { return dateParse(s); }
  };
  function dateMethod(d, name, args) {
    if (name === 'toString') return dateToStr(d);
    if (name === 'getYear') return d.y;
    if (name === 'getMonthValue') return d.m;
    if (name === 'getDayOfMonth') return d.d;
    if (name === 'plusDays') { const t = new Date(Date.UTC(d.y, d.m - 1, d.d) + num(args[0]) * 86400000); return makeDate(t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate()); }
    if (name === 'plusWeeks') { return dateMethod(d, 'plusDays', [num(args[0]) * 7]); }
    if (name === 'minusDays') { return dateMethod(d, 'plusDays', [-num(args[0])]); }
    if (name === 'format') { const f = args[0]; return dateFormat(d, f && f.__kind === 'fmt' ? f.p : String(f)); }
    if (name === 'isAfter') { return daysBetween(args[0], d) > 0; }
    if (name === 'isBefore') { return daysBetween(args[0], d) < 0; }
    throw exc('Error', '暂不支持的日期方法：' + name);
  }
  const DateTimeFormatterObj = {
    ofPattern: function (p) { return { __kind: 'fmt', p: String(p) }; }
  };
  const ChronoUnitObj = {
    DAYS: {
      between: function (a, b) { return daysBetween(a, b); }
    }
  };

  /* ---------- 内置名字表（解释器会用到） ---------- */
  const builtins = {
    'System': System,
    'Math': MathObj,
    'String': StringStatics,
    'Integer': IntegerObj,
    'Double': DoubleObj,
    'Boolean': BooleanObj,
    'Arrays': ArraysObj,
    'Collections': CollectionsObj,
    'List': ListStatics,
    'Set': SetStatics,
    'Map': MapStatics,
    'Comparator': ComparatorObj,
    'Files': FilesObj,
    'Path': { of: function (p) { return newPath(p); } },
    'Paths': { get: function (p) { return newPath(p); } },
    'LocalDate': LocalDateObj,
    'DateTimeFormatter': DateTimeFormatterObj,
    'ChronoUnit': ChronoUnitObj,
    'Random': { nextInt: function (n) { return Math.floor(Math.random() * (n === undefined ? 2 : num(n))); } },
    'true': true, 'false': false, 'null': null
  };

  root.__JAVA_RT = {
    exc: exc, isExc: isExc, isBrk: isBrk, isCnt: isCnt, isRet: isRet,
    inferType: inferType, toJavaString: toJavaString, num: num,
    makeArray: makeArray, makeList: makeList, makeMap: makeMap, makeSet: makeSet, makeDate: makeDate,
    stringMethod: stringMethod, listMethod: listMethod, mapMethod: mapMethod, setMethod: setMethod,
    toKey: toKey, compareNatural: compareNatural,
    newSB: newSB, sbMethod: sbMethod, newScanner: newScanner, scannerMethod: scannerMethod,
    newFile: newFile, fileMethod: fileMethod, newFileWriter: newFileWriter, writerMethod: writerMethod,
    newBWriter: newBWriter, bWriterMethod: bWriterMethod, newBReader: newBReader, bReaderMethod: bReaderMethod,
    newPath: newPath, pathStr: pathStr,
    dateMethod: dateMethod, makeComparator: makeComparator, builtins: builtins
  };

  root.JavaRunner.__rt = root.__JAVA_RT;
})(typeof window !== 'undefined' ? window : globalThis);
/* =============================================================
   运行器第三部分：类解析、作用域、方法调用（后续块继续）
   ============================================================= */
(function (root) {
  const I = root.__JAVA_INTERNALS;
  const R = root.__JAVA_RT;
  const tokenize = I.tokenize, buildMatch = I.buildMatch;

  const exc = R.exc, isExc = R.isExc, isBrk = R.isBrk, isCnt = R.isCnt, isRet = R.isRet;
  const toJavaString = R.toJavaString, num = R.num;

  /* ---------- 作用域 ---------- */
  function newFrame() { return { vals: new Map(), types: new Map() }; }
  function pushScope(frames, frame) { frames.push(frame || newFrame()); return frames[frames.length - 1]; }
  function declare(frames, name, value, type) {
    const top = frames[frames.length - 1];
    top.vals.set(name, value);
    top.types.set(name, type || inferType(value));
  }
  function lookup(frames, name) {
    for (let i = frames.length - 1; i >= 0; i--) {
      if (frames[i].vals.has(name)) return { v: frames[i].vals.get(name), t: frames[i].types.get(name), found: true };
    }
    return { v: undefined, t: undefined, found: false };
  }
  function assign(frames, name, value, type) {
    for (let i = frames.length - 1; i >= 0; i--) {
      if (frames[i].vals.has(name)) {
        frames[i].vals.set(name, value);
        if (type) frames[i].types.set(name, type);
        return;
      }
    }
    declare(frames, name, value, type);
  }

  /* ---------- 类结构 ---------- */
  function makeClassObj(name) {
    return {
      __clsObj: true, name: name, sup: null, interfaces: [], isAbstract: false, isInterface: false,
      fields: [], statics: new Map(), methods: new Map(), ctors: [], nested: {}
      , staticBlocks: []
    };
  }
  function makeMethod(name) {
    return { name: name, params: [], paramTypes: [], isStatic: false, isAbstract: false, isConstructor: false, body: null, cls: null };
  }

  function findMethod(cls, name, argCount) {
    let cur = cls, candidates = [];
    while (cur) {
      const ms = cur.methods.get(name);
      if (ms) candidates = candidates.concat(ms);
      cur = cur.sup;
    }
    if (!candidates.length) return null;
    if (argCount !== undefined && argCount !== null) {
      for (let i = 0; i < candidates.length; i++) { if (candidates[i].params.length === argCount) return candidates[i]; }
      for (let i = 0; i < candidates.length; i++) {
        if (candidates[i].varargs && argCount >= candidates[i].params.length - 1) return candidates[i];
      }
    }
    return candidates[0];
  }
  function findField(cls, name) {
    let cur = cls;
    while (cur) {
      for (let i = 0; i < cur.fields.length; i++) { if (cur.fields[i].name === name) return cur.fields[i]; }
      cur = cur.sup;
    }
    return null;
  }
  R.findMethod = findMethod;
  R.findField = findField;
  R.invokeMethod = invokeMethod;

  /* ---------- 内置异常类 ---------- */
  function makeBuiltinException(name) {
    const cls = makeClassObj(name);
    cls.ctors = [{
      name: name, params: ['message'], paramTypes: ['String'], isConstructor: true, isStatic: false, cls: cls,
      invoke: function (thisObj, args) { thisObj.message = args[0] == null ? null : String(args[0]); return thisObj; }
    }];
    cls.methods.set('getMessage', [{
      name: 'getMessage', params: [], paramTypes: [], isStatic: false, cls: cls,
      invoke: function (thisObj) { return thisObj.message; }
    }]);
    return cls;
  }
  const exceptionClasses = {
    'Throwable': makeBuiltinException('Throwable'),
    'Exception': makeBuiltinException('Exception'),
    'RuntimeException': makeBuiltinException('RuntimeException'),
    'Error': makeBuiltinException('Error'),
    'NumberFormatException': makeBuiltinException('NumberFormatException'),
    'ArithmeticException': makeBuiltinException('ArithmeticException'),
    'IOException': makeBuiltinException('IOException'),
    'IllegalArgumentException': makeBuiltinException('IllegalArgumentException'),
    'IllegalStateException': makeBuiltinException('IllegalStateException'),
    'IndexOutOfBoundsException': makeBuiltinException('IndexOutOfBoundsException'),
    'UnsupportedOperationException': makeBuiltinException('UnsupportedOperationException'),
    'FileNotFoundException': makeBuiltinException('FileNotFoundException'),
    'NullPointerException': makeBuiltinException('NullPointerException'),
    'ArrayIndexOutOfBoundsException': makeBuiltinException('ArrayIndexOutOfBoundsException')
  };

  /* ---------- 方法引用 / 成员调用 ---------- */
  function instanceMethodRef(obj, name) {
    return function () {
      const args = Array.prototype.slice.call(arguments);
      return R.invokeMember(obj, name, args);
    };
  }

  R.invokeMember = function (obj, name, args) {
    args = args || [];
    if (obj === null || obj === undefined) throw exc('NullPointerException', '调用 null 的方法：' + name);
    if (typeof obj === 'string') return stringMethod(obj, name, args);
    if (obj.__kind === 'strbox') return stringMethod(obj.s, name, args.map(strOf));
    if (obj.__superOf) {
      const m = findMethod(obj.__cls, name, args.length);
      if (m) { const res = invokeMethod(m, obj.__superOf, args, obj.__cls); R.__lastReturnType = m.returnType; return res.v; }
      if (obj.__superOf[name] !== undefined && typeof obj.__superOf[name] !== 'function') return obj.__superOf[name];
      throw exc('Error', '父类没有方法 ' + name);
    }
    if (typeof obj === 'number' || typeof obj === 'boolean') throw exc('Error', '基础类型没有方法：' + name);
    if (obj.__kind === 'list') return listMethod(obj, name, args);
    if (obj.__kind === 'map') return mapMethod(obj, name, args);
    if (obj.__kind === 'set') return setMethod(obj, name, args);
    if (obj.__kind === 'array') {
      if (name === 'clone') return makeArray(obj.a.slice(), obj.t);
      throw exc('Error', '数组不支持的方法：' + name);
    }
    if (obj.__kind === 'sb') return sbMethod(obj, name, args);
    if (obj.__kind === 'scanner') return scannerMethod(obj, name, args);
    if (obj.__kind === 'date') return dateMethod(obj, name, args);
    if (obj.__kind === 'file') return fileMethod(obj, name, args);
    if (obj.__kind === 'fwriter') return writerMethod(obj, name, args);
    if (obj.__kind === 'bwriter') return bWriterMethod(obj, name, args);
    if (obj.__kind === 'breader') return bReaderMethod(obj, name, args);
    if (obj.__kind === 'cmp') {
      if (name === 'reversed') return obj.reversed();
      if (name === 'thenComparing') return obj.thenComparing(args[0]);
      throw exc('Error', 'Comparator 不支持的方法：' + name);
    }
    if (obj.__kind && R.kindMethods && R.kindMethods[obj.__kind]) {
      const handler = R.kindMethods[obj.__kind];
      return handler(obj, name, args);
    }
    if (obj.__clsObj) {
      if (obj.statics.has(name)) { const v = obj.statics.get(name); if (typeof v === 'function') return v.apply(null, args); return v; }
      const m = findMethod(obj, name, args.length);
      if (m) { const res = invokeMethod(m, null, args, obj); R.__lastReturnType = m.returnType; return res.v; }
      throw exc('Error', '类 ' + obj.name + ' 没有静态方法 ' + name);
    }
    if (obj.__cls) {
      const m = findMethod(obj.__cls, name, args.length);
      if (m) { const res = invokeMethod(m, obj, args, obj.__cls); R.__lastReturnType = m.returnType; return res.v; }
      if (obj[name] !== undefined && typeof obj[name] === 'function') return obj[name].apply(obj, args);
      if (obj[name] !== undefined) throw exc('Error', name + ' 不是方法');
      throw exc('Error', '对象没有方法 ' + name);
    }
    if (typeof obj === 'function') return obj.apply(null, args);
    if (typeof obj === 'object') {
      const fn = obj[name];
      if (typeof fn === 'function') return fn.apply(obj, args);
      if (name === 'toString') return toJavaString(obj);
    }
    throw exc('Error', '无法调用 ' + name);
  };

  R.getMember = function (obj, name) {
    if (obj === null || obj === undefined) throw exc('NullPointerException', '访问 null 的属性：' + name);
    if (typeof obj === 'string') { throw exc('Error', '字符串请用方法：' + name); }
    if (obj.__kind === 'array') {
      if (name === 'length') return obj.a.length;
      throw exc('Error', '数组不支持属性：' + name);
    }
    if (obj.__superOf) {
      if (obj.__superOf[name] !== undefined) return obj.__superOf[name];
      throw exc('Error', '父类没有成员 ' + name);
    }
    if (obj.__clsObj) {
      if (name === 'class') return obj;   // Type.class
      if (obj.statics.has(name)) return obj.statics.get(name);
      const m = findMethod(obj, name);
      if (m) return function () { return invokeMethod(m, null, Array.prototype.slice.call(arguments), obj); };
      throw exc('Error', '类 ' + obj.name + ' 没有静态成员 ' + name);
    }
    if (obj.__cls) {
      if (obj[name] !== undefined && !(obj[name] === undefined)) { return obj[name]; }
      const m = findMethod(obj.__cls, name);
      if (m) return function () { return invokeMethod(m, obj, Array.prototype.slice.call(arguments), obj.__cls); };
      throw exc('Error', '对象没有成员 ' + name);
    }
    if (typeof obj === 'object' || typeof obj === 'function') {
      if (obj[name] !== undefined) return obj[name];
    }
    throw exc('Error', '无法访问 ' + name);
  };

  /* ---------- 方法执行 ---------- */
  function invokeMethod(m, thisObj, args, selfClass) {
    if (m.invoke) return { v: m.invoke(thisObj, args), t: m.returnType || 'object' };
    const frames = [newFrame()];
    m.params.forEach(function (p, idx) {
      let val = args[idx] !== undefined ? args[idx] : null;
      if (m.varargs && idx === m.params.length - 1) val = makeArray(args.slice(idx), 'Object');
      declare(frames, p, val, m.paramTypes[idx] || inferType(val));
    });
    if (!m.isStatic && thisObj) declare(frames, 'this', thisObj, thisObj.__cls ? thisObj.__cls.name : 'object');
    if (selfClass) declare(frames, '__selfClass', selfClass, 'class');
    try {
      R.execBlock(frames, m.body.start, m.body.end, thisObj, selfClass);
      return { v: undefined, t: 'void' };
    } catch (e) {
      if (isRet(e)) return e.value;
      throw e;
    }
  }

  /* 构造函数 */
  function construct(cls, args, argTypes) {
    const inst = { __cls: cls };
    let cur = cls;
    while (cur) {
      cur.fields.forEach(function (f) {
        if (!f.isStatic && !(f.name in inst)) inst[f.name] = defaultForType(f.type);
      });
      cur = cur.sup;
    }
    const ctor = pickCtor(cls, args.length);
    if (ctor) {
      if (ctor.invoke) { ctor.invoke(inst, args); return inst; }
      inst.__ctor = ctor;
      const frames = [newFrame()];
      ctor.params.forEach(function (p, idx) { declare(frames, p, args[idx] !== undefined ? args[idx] : null, ctor.paramTypes[idx] || inferType(args[idx])); });
      declare(frames, 'this', inst, cls.name);
      try {
        R.execBlock(frames, ctor.body.start, ctor.body.end, inst, cls);
      } catch (e) { if (!isRet(e)) throw e; }
    } else if (cls.sup) {
      // 无显式构造器时，调用父类默认构造
      const supCtor = pickCtor(cls.sup, 0);
      if (supCtor && supCtor.invoke) supCtor.invoke(inst, []);
    }
    return inst;
  }
  function pickCtor(cls, argCount) {
    if (!cls.ctors.length) return null;
    for (let i = 0; i < cls.ctors.length; i++) { if (cls.ctors[i].params.length === argCount) return cls.ctors[i]; }
    return cls.ctors[0];
  }
  function defaultForType(t) {
    if (!t) return null;
    if (t.indexOf('[]') >= 0) return null;
    if (['int', 'long', 'byte', 'short', 'double', 'float'].indexOf(t) >= 0) return 0;
    if (t === 'boolean') return false;
    if (t === 'char') return '';
    return null;
  }

  R.construct = construct;
  R.pickCtor = pickCtor;
  R.exceptionClasses = exceptionClasses;

  function stringMethod(s, name, args) { return R.stringMethod(s, name, args); }
  function strOf(v) { return (v && v.__kind === 'strbox') ? v.s : String(v); }
  function listMethod(l, n, a) { return R.listMethod(l, n, a); }
  function mapMethod(m, n, a) { return R.mapMethod(m, n, a); }
  function setMethod(s, n, a) { return R.setMethod(s, n, a); }
  function sbMethod(s, n, a) { return R.sbMethod(s, n, a); }
  function scannerMethod(s, n, a) { return R.scannerMethod(s, n, a); }
  function dateMethod(d, n, a) { return R.dateMethod(d, n, a); }
  function fileMethod(f, n, a) { return R.fileMethod(f, n, a); }
  function writerMethod(w, n, a) { return R.writerMethod(w, n, a); }
  function bWriterMethod(w, n, a) { return R.bWriterMethod(w, n, a); }
  function bReaderMethod(r, n, a) { return R.bReaderMethod(r, n, a); }
  function makeArray(e, t) { return R.makeArray(e, t); }
  function makeList(a) { return R.makeList(a); }
  function makeMap() { return R.makeMap(); }
  function makeSet() { return R.makeSet(); }
  function inferType(v) { return R.inferType(v); }

  root.__JAVA_RT2 = {
    newFrame: newFrame, pushScope: pushScope, declare: declare, lookup: lookup, assign: assign,
    makeClassObj: makeClassObj, makeMethod: makeMethod, invokeMethod: invokeMethod,
    exceptionClasses: exceptionClasses
  };
})(typeof window !== 'undefined' ? window : globalThis);
/* =============================================================
   运行器第四部分：类解析（后续块继续）
   ============================================================= */
(function (root) {
  const I = root.__JAVA_INTERNALS;
  const R = root.__JAVA_RT;
  const R2 = root.__JAVA_RT2;
  const tokenize = I.tokenize, buildMatch = I.buildMatch;
  const makeClassObj = R2.makeClassObj, makeMethod = R2.makeMethod;

  const MODIFIERS = ['public', 'private', 'protected', 'static', 'final', 'abstract', 'synchronized', 'native', 'volatile', 'transient', 'default', 'strictfp'];

  function readType(toks, i) {
    if (toks[i].k !== 'id') throw new Error('期望类型名');
    let t = toks[i].v; i++;
    while (toks[i].k === 'p' && toks[i].v === '.' && toks[i + 1] && toks[i + 1].k === 'id') { i++; t += '.' + toks[i].v; i++; }
    if (toks[i].k === 'op' && toks[i].v === '<') i = skipGeneric(toks, i);
    let dims = 0, varargs = false;
    while (toks[i].k === 'p' && toks[i].v === '[') { dims++; i += 2; }
    // 可变参数：int... nums
    if (toks[i] && toks[i].k === 'p' && toks[i].v === '.' && toks[i + 1] && toks[i + 1].v === '.' && toks[i + 2] && toks[i + 2].v === '.') {
      dims++; varargs = true; i += 3;
    }
    return { type: t + '[]'.repeat(dims), next: i, varargs: varargs };
  }

  function skipGeneric(toks, i) {
    let depth = 0;
    while (i < toks.length) {
      if (toks[i].k === 'op' && toks[i].v === '<') depth++;
      else if (toks[i].k === 'op' && toks[i].v === '>') { depth--; if (depth === 0) return i + 1; }
      else if (toks[i].k === 'op' && toks[i].v === '>>') { depth -= 2; if (depth <= 0) return i + 1; }
      i++;
    }
    return i;
  }

  function readModifiers(toks, i) {
    const flags = { isStatic: false, isFinal: false, isAbstract: false };
    while (toks[i].k === 'id' && MODIFIERS.indexOf(toks[i].v) >= 0) {
      if (toks[i].v === 'static') flags.isStatic = true;
      if (toks[i].v === 'final') flags.isFinal = true;
      if (toks[i].v === 'abstract') flags.isAbstract = true;
      i++;
    }
    return { i: i, flags: flags };
  }

  function parseClasses(src) {
    const toks = tokenize(I.preprocess(src));
    const match = buildMatch(toks);
    const classes = {};
    const order = [];
    let i = 0;

    while (toks[i].k !== 'eof') {
      const m = readModifiers(toks, i); i = m.i;
      if (toks[i].k === 'id' && (toks[i].v === 'class' || toks[i].v === 'interface' || toks[i].v === 'enum')) {
        const kind = toks[i].v; i++;
        if (toks[i].k !== 'id') throw new Error('类名缺失');
        const name = toks[i].v; i++;
        if (toks[i].k === 'op' && toks[i].v === '<') i = skipGeneric(toks, i);   // class Box<T>
        let supName = null, ifaceNames = [];
        if (toks[i].k === 'id' && toks[i].v === 'extends') { i++; supName = toks[i].v; i++; if (toks[i].k === 'op' && toks[i].v === '<') i = skipGeneric(toks, i); }
        if (toks[i].k === 'id' && toks[i].v === 'implements') {
          i++;
          while (true) { ifaceNames.push(toks[i].v); i++; if (toks[i].k === 'op' && toks[i].v === '<') i = skipGeneric(toks, i); if (toks[i].k === 'p' && toks[i].v === ',') { i++; continue; } break; }
        }
        if (toks[i].k !== 'p' || toks[i].v !== '{') throw new Error('类 ' + name + ' 缺少 {');
        const bodyStart = i + 1, bodyEnd = match[i];
        const cls = makeClassObj(name);
        cls.isInterface = kind === 'interface';
        cls.isAbstract = m.flags.isAbstract || kind === 'interface';
        cls.supName = supName;
        cls.interfaceNames = ifaceNames;
        classes[name] = cls;
        order.push({ name: name, cls: cls, start: bodyStart, end: bodyEnd });
        i = bodyEnd + 1;
        continue;
      }
      if (toks[i].k === 'p' && toks[i].v === ';') { i++; continue; }
      i++;
    }

    order.forEach(function (d) { parseClassBody(toks, match, classes, d.cls, d.start, d.end); });

    // 链接继承关系
    Object.keys(classes).forEach(function (name) {
      const cls = classes[name];
      if (cls.supName) {
        cls.sup = classes[cls.supName] || R.exceptionClasses[cls.supName] || null;
      }
    });

    return { tokens: toks, match: match, classes: classes };
  }

  function parseClassBody(toks, match, classes, cls, start, end) {
    let i = start;
    while (i < end) {
      // static 初始化块：static { ... }
      if (toks[i].k === 'id' && toks[i].v === 'static' && toks[i + 1] && toks[i + 1].k === 'p' && toks[i + 1].v === '{') {
        cls.staticBlocks.push({ start: i + 2, end: match[i + 1] });
        i = match[i + 1] + 1;
        continue;
      }
      const m = readModifiers(toks, i); i = m.i;
      const flags = m.flags;
      // 其它初始化块（如实例初始化块 { ... }）
      if (toks[i].k === 'p' && toks[i].v === '{') { i = match[i] + 1; continue; }

      if (toks[i].k === 'id' && (toks[i].v === 'class' || toks[i].v === 'interface' || toks[i].v === 'enum')) {
        const kind = toks[i].v; i++;
        const name = toks[i].v; i++;
        if (toks[i].k === 'op' && toks[i].v === '<') i = skipGeneric(toks, i);
        let supName = null, ifaceNames = [];
        if (toks[i].k === 'id' && toks[i].v === 'extends') { i++; supName = toks[i].v; i++; if (toks[i].k === 'op' && toks[i].v === '<') i = skipGeneric(toks, i); }
        if (toks[i].k === 'id' && toks[i].v === 'implements') { i++; while (true) { ifaceNames.push(toks[i].v); i++; if (toks[i].k === 'op' && toks[i].v === '<') i = skipGeneric(toks, i); if (toks[i].k === 'p' && toks[i].v === ',') { i++; continue; } break; } }
        if (toks[i].k !== 'p' || toks[i].v !== '{') throw new Error('内部类 ' + name + ' 缺少 {');
        const bs = i + 1, be = match[i];
        const nested = makeClassObj(name);
        nested.isInterface = kind === 'interface';
        nested.isAbstract = flags.isAbstract || kind === 'interface';
        nested.supName = supName;
        nested.interfaceNames = ifaceNames;
        classes[name] = nested;
        cls.nested[name] = nested;
        parseClassBody(toks, match, classes, nested, bs, be);
        i = be + 1;
        continue;
      }

      // static 初始化块
      if (toks[i].k === 'id' && toks[i].v === 'static' && toks[i + 1].k === 'p' && toks[i + 1].v === '{') {
        i = match[i + 1] + 1;
        continue;
      }

      // 构造器检测：类名 + (
      if (toks[i].k === 'id' && toks[i].v === cls.name && toks[i + 1].k === 'p' && toks[i + 1].v === '(') {
        const name = toks[i].v; i += 2;
        const params = parseParams(toks, i, match);
        i = params.next;
        i = skipThrows(toks, i);
        let body = null;
        if (toks[i].k === 'p' && toks[i].v === '{') { body = { start: i + 1, end: match[i] }; i = match[i] + 1; }
        else { i++; }
        const ctor = makeMethod(name);
        ctor.isConstructor = true;
        ctor.params = params.names; ctor.paramTypes = params.types; ctor.body = body; ctor.cls = cls;
        cls.ctors.push(ctor);
        continue;
      }

      // 泛型方法签名 <T>（课程练习不用，跳过并继续解析）
      if (toks[i].k === 'op' && toks[i].v === '<') { i = skipGeneric(toks, i); }

      // 返回类型 + 名字
      const rt = readType(toks, i); i = rt.next;
      if (toks[i].k !== 'id') throw new Error('成员名缺失');
      const name = toks[i].v; i++;

      if (toks[i].k === 'p' && toks[i].v === '(') {
        // 方法
        i++;
        const params = parseParams(toks, i, match);
        i = params.next;
        i = skipThrows(toks, i);
        let body = null, isAbstract = flags.isAbstract || cls.isInterface;
        if (toks[i].k === 'p' && toks[i].v === '{') { body = { start: i + 1, end: match[i] }; i = match[i] + 1; isAbstract = false; }
        else { i++; }
        const meth = makeMethod(name);
        meth.params = params.names; meth.paramTypes = params.types;
        meth.varargs = params.varargs;
        meth.returnType = rt.type;
        meth.isStatic = flags.isStatic; meth.isAbstract = isAbstract; meth.body = body; meth.cls = cls;
        if (!cls.methods.has(name)) cls.methods.set(name, []);
        cls.methods.get(name).push(meth);
        continue;
      }

      // 字段
      const fieldList = [];
      while (true) {
        let init = null;
        if (toks[i].k === 'op' && toks[i].v === '=') { i++; const s = i; i = skipExpressionEnd(toks, i); init = { s: s, e: i }; }
        fieldList.push({ name: name, type: rt.type, isStatic: flags.isStatic, isFinal: flags.isFinal, init: init });
        if (toks[i].k === 'p' && toks[i].v === ',') {
          i++;
          if (toks[i].k !== 'id') throw new Error('字段名缺失');
          const nextName = toks[i].v; i++;
          // 继续循环用新的 name
          cls.fields.push.apply(cls.fields, []);
          fieldList.push(null); fieldList.pop();
          // 用变量承接
          // 简化：递归处理剩余字段
          i = parseFieldRest(toks, i, rt.type, flags, fieldList, match);
          break;
        }
        break;
      }
      fieldList.forEach(function (f) { if (f) cls.fields.push(f); });
      if (toks[i].k === 'p' && toks[i].v === ';') { i++; continue; }
      continue;
    }
  }

  function parseFieldRest(toks, i, type, flags, fieldList, match) {
    while (true) {
      const name = toks[i].v;
      let init = null;
      if (toks[i + 1].k === 'op' && toks[i + 1].v === '=') {
        i += 2;
        const s = i;
        i = skipExpressionEnd(toks, i);
        init = { s: s, e: i };
      } else {
        i += 1;
      }
      fieldList.push({ name: name, type: type, isStatic: flags.isStatic, isFinal: flags.isFinal, init: init });
      if (toks[i].k === 'p' && toks[i].v === ',') { i++; continue; }
      break;
    }
    return i;
  }

  function skipExpressionEnd(toks, i) {
    let depth = 0;
    while (i < toks.length) {
      const t = toks[i];
      if (t.k === 'eof') return i;
      if (t.k === 'p' && (t.v === '(' || t.v === '[' || t.v === '{')) depth++;
      else if (t.k === 'p' && (t.v === ')' || t.v === ']' || t.v === '}')) { if (depth === 0) return i; depth--; }
      else if (depth === 0 && (t.k === 'p' && (t.v === ',' || t.v === ';'))) return i;
      i++;
    }
    return i;
  }

  function parseParams(toks, i, match) {
    const names = [], types = [];
    let varargs = false;
    if (toks[i].k === 'p' && toks[i].v === ')') return { names: names, types: types, next: i + 1, varargs: false };
    while (true) {
      const rt = readType(toks, i); i = rt.next;
      if (toks[i].k !== 'id') throw new Error('参数名缺失');
      names.push(toks[i].v); i++;
      types.push(rt.type);
      if (rt.varargs) varargs = true;
      if (toks[i].k === 'p' && toks[i].v === ',') { i++; continue; }
      if (toks[i].k === 'p' && toks[i].v === ')') { i++; break; }
      throw new Error('参数列表格式错误');
    }
    return { names: names, types: types, next: i, varargs: varargs };
  }

  function skipThrows(toks, i) {
    if (toks[i].k === 'id' && toks[i].v === 'throws') {
      i++;
      while (toks[i].k === 'id' || (toks[i].k === 'p' && toks[i].v === '.')) i++;
      // 可能连续多个异常，逗号分隔
      while (toks[i].k === 'p' && toks[i].v === ',') { i++; while (toks[i].k === 'id' || (toks[i].k === 'p' && toks[i].v === '.')) i++; }
    }
    return i;
  }

  R2.parseClasses = parseClasses;
  R2.readType = readType;
  R2.skipGeneric = skipGeneric;
})(typeof window !== 'undefined' ? window : globalThis);
/* =============================================================
   运行器第五部分 A：表达式求值
   ============================================================= */
(function (root) {
  const R = root.__JAVA_RT;
  const R2 = root.__JAVA_RT2;
  const exc = R.exc, num = R.num;

  root.__RUN_CTX = { toks: null, match: null, classes: null };

  const PRIMITIVES = new Set(['int', 'long', 'double', 'float', 'boolean', 'char', 'byte', 'short', 'void']);

  function typeKind(t) {
    if (!t) return 'object';
    if (t === 'int' || t === 'long' || t === 'byte' || t === 'short') return 'int';
    if (t === 'double' || t === 'float') return 'double';
    if (t === 'boolean') return 'boolean';
    if (t === 'char') return 'char';
    if (t === 'String') return 'String';
    if (t.indexOf('[]') >= 0) return 'array';
    return 'object';
  }
  function normType(t, v) {
    if (t) { const k = typeKind(t); if (k !== 'object') return k; }
    const it = R.inferType(v);
    return it === 'int' ? 'int' : (it === 'double' ? 'double' : (it === 'boolean' ? 'boolean' : (it === 'String' ? 'String' : it)));
  }
  function isTruthy(v) { return !(v === false || v === 0 || v === null || v === undefined || v === ''); }
  function valuesEqual(a, b) {
    if (a === b) return true;
    if (a && b && a.__kind === 'array' && b.__kind === 'array') return JSON.stringify(a.a) === JSON.stringify(b.a);
    if (a && b && a.__kind === 'list' && b.__kind === 'list') return JSON.stringify(a.a) === JSON.stringify(b.a);
    if (typeof a === 'number' && typeof b === 'number') return a === b;
    if (typeof a === 'string' && typeof b === 'string') return a === b;
    return false;
  }
  function toJava(v) { return R.toJavaString(v); }
  // Java 里 double 类型的整数会打印成 12000.0 这样的形式
  function toJavaVal(v, t) {
    if (typeof v === 'number' && t === 'double' && Number.isInteger(v)) return v.toFixed(1);
    return toJava(v);
  }
  function resultTypeOf(v, declared) {
    if (typeof v === 'number') return (declared === 'double' || declared === 'float') ? 'double' : 'int';
    if (typeof v === 'boolean') return 'boolean';
    if (typeof v === 'string') return 'String';
    return 'object';
  }

  const BUILTIN_CTORS = {
    'ArrayList': function (src) {
      if (src && src.__kind === 'list') return R.makeList(src.a.slice());
      if (src && src.__kind === 'array') return R.makeList(src.a.slice());
      if (src && src.__kind === 'set') return R.makeList(Array.from(src.s));
      return R.makeList([]);
    },
    'LinkedList': function () { return R.makeList([]); },
    'String': function (s) {
      if (s && s.__kind === 'array') return { __kind: 'strbox', s: s.a.map(function (n) { return String.fromCharCode(num(n)); }).join('') };
      return { __kind: 'strbox', s: s == null ? '' : String(s) };
    },
    'Integer': function (n) { return Math.trunc(num(n)); },
    'Long': function (n) { return Math.trunc(num(n)); },
    'Double': function (n) { return num(n); },
    'Float': function (n) { return num(n); },
    'Boolean': function (b) { return Boolean(b); },
    'Character': function (c) { return String(c); },
    'Object': function () { return {}; },
    'HashMap': function () { return R.makeMap(); },
    'TreeMap': function () { return R.makeMap(); },
    'LinkedHashMap': function () { return R.makeMap(); },
    'HashSet': function (src) { const s = R.makeSet(); if (src && src.__kind === 'list') src.a.forEach(function (x) { s.s.add(R.toKey(x)); }); else if (src && src.__kind === 'array') src.a.forEach(function (x) { s.s.add(R.toKey(x)); }); else if (src && src.__kind === 'set') src.s.forEach(function (x) { s.s.add(x); }); return s; },
    'TreeSet': function (src) { const s = R.makeSet(null, true); if (src && src.__kind === 'list') src.a.forEach(function (x) { s.s.add(R.toKey(x)); }); else if (src && src.__kind === 'array') src.a.forEach(function (x) { s.s.add(R.toKey(x)); }); else if (src && src.__kind === 'set') src.s.forEach(function (x) { s.s.add(x); }); return s; },
    'LinkedHashSet': function (src) { const s = R.makeSet(); if (src && src.__kind === 'list') src.a.forEach(function (x) { s.s.add(R.toKey(x)); }); else if (src && src.__kind === 'set') src.s.forEach(function (x) { s.s.add(x); }); return s; },
    'StringBuilder': function (s) { return R.newSB(s); },
    'Scanner': function () { return R.newScanner(root.__JAVA_INTERNALS.__input || ''); },
    'File': function (p, c) {
      if (c !== undefined) {
        const base = (p && p.__kind === 'file') ? p.path : (p && p.__kind === 'path' ? p.p : String(p));
        return R.newFile(String(base).replace(/\/+$/, '') + '/' + String(c));
      }
      if (p && (p.__kind === 'file' || p.__kind === 'path')) return p;
      return R.newFile(String(p));
    },
    'FileWriter': function (p, append) { return R.newFileWriter(p, append); },
    'FileReader': function (p) { return { __kind: 'freader', path: (p && p.__kind === 'file') ? p.path : String(p) }; },
    'BufferedWriter': function (w) { return R.newBWriter(w); },
    'BufferedReader': function (r) { return R.newBReader(r.path || (r.w && r.w.path)); },
    'Random': function () { return { __kind: 'random', nextInt: function (n) { return Math.floor(Math.random() * (n === undefined ? 2 : num(n))); } }; }
  };

  function evalExpr(toks, i, ctx) { return evalAssign(toks, i, ctx); }

  function evalAssign(toks, i, ctx) {
    let left = evalTernary(toks, i, ctx);
    while (left.next < toks.length && isAssignOp(toks[left.next])) {
      const op = toks[left.next].v;
      const right = evalAssign(toks, left.next + 1, ctx);
      let nv;
      if (op === '=') nv = right.v;
      else {
        const cur = left.v, rv = right.v;
        if (op === '+=') nv = (typeof cur === 'string' || typeof rv === 'string') ? String(cur) + toJava(rv) : num(cur) + num(rv);
        else if (op === '-=') nv = num(cur) - num(rv);
        else if (op === '*=') nv = num(cur) * num(rv);
        else if (op === '/=') nv = intDiv(left.t, right.t, num(cur), num(rv));
        else if (op === '%=') nv = num(cur) % num(rv);
      }
      if (!left.set) throw exc('Error', '赋值目标不可写');
      left.set(nv);
      return { v: nv, t: left.t, next: right.next };
    }
    return left;
  }
  function isAssignOp(t) { return t.k === 'op' && ['=', '+=', '-=', '*=', '/=', '%='].indexOf(t.v) >= 0; }

  function evalTernary(toks, i, ctx) {
    const cond = evalBinary(toks, i, ctx, 1);
    if (toks[cond.next].k === 'op' && toks[cond.next].v === '?') {
      const yes = evalExpr(toks, cond.next + 1, ctx);
      if (toks[yes.next].k === 'p' && toks[yes.next].v === ':') {
        const no = evalExpr(toks, yes.next + 1, ctx);
        return { v: isTruthy(cond.v) ? yes.v : no.v, t: yes.t, next: no.next };
      }
      throw exc('Error', '三元表达式缺少 :');
    }
    return cond;
  }

  const PREC = { '||': 1, '&&': 2, '|': 3, '^': 3, '&': 4, '==': 5, '!=': 5, '<': 6, '<=': 6, '>': 6, '>=': 6, 'instanceof': 6, '+': 7, '-': 7, '*': 8, '/': 8, '%': 8, '<<': 9, '>>': 9, '>>>': 9 };

  function evalBinary(toks, i, ctx, minPrec) {
    let left = evalUnary(toks, i, ctx);
    while (true) {
      const t = toks[left.next];
      if (t.k !== 'op' && !(t.k === 'id' && t.v === 'instanceof')) break;
      const op = t.k === 'id' ? 'instanceof' : t.v;
      const prec = PREC[op];
      if (prec === undefined || prec < minPrec) break;
      // 短路求值：&& 左边为假、|| 左边为真时，右边不求值（只跳过对应 token）
      if (op === '&&' && !isTruthy(left.v)) { left = { v: false, t: 'boolean', next: skipExpr(toks, left.next + 1, prec) }; continue; }
      if (op === '||' && isTruthy(left.v)) { left = { v: true, t: 'boolean', next: skipExpr(toks, left.next + 1, prec) }; continue; }
      let right;
      if (op === 'instanceof') {
        const rt = R2.readType(toks, left.next + 1);
        let end = rt.next, patName = null;
        if (toks[end] && toks[end].k === 'id') { patName = toks[end].v; end++; }   // Java 16+：instanceof Dog d
        const typeName = String(rt.type).split('.').pop();
        const ok = instanceOf(left.v, typeName);
        if (ok && patName) R2.declare(ctx.frames, patName, left.v, rt.type);
        left = { v: ok, t: 'boolean', next: end };
        continue;
      }
      right = evalBinary(toks, left.next + 1, ctx, prec + 1);
      left = applyBinary(op, left, right);
    }
    return left;
  }
  function evalTypeForInstanceof(toks, i, ctx) {
    const rt = R2.readType(toks, i);
    return { v: rt.type, t: 'String', next: rt.next };
  }

  function applyBinary(op, a, b) {
    const av = a.v, bv = b.v;
    if (op === '+') {
      if (a.t === 'String' || b.t === 'String' || typeof av === 'string' || typeof bv === 'string') {
        return { v: toJavaVal(av, a.t) + toJavaVal(bv, b.t), t: 'String', next: b.next };
      }
      return { v: num(av) + num(bv), t: (a.t === 'double' || b.t === 'double') ? 'double' : 'int', next: b.next };
    }
    if (op === '-') return { v: num(av) - num(bv), t: (a.t === 'double' || b.t === 'double') ? 'double' : 'int', next: b.next };
    if (op === '*') return { v: num(av) * num(bv), t: (a.t === 'double' || b.t === 'double') ? 'double' : 'int', next: b.next };
    if (op === '/') return { v: intDiv(a.t, b.t, num(av), num(bv)), t: (a.t === 'double' || b.t === 'double') ? 'double' : 'int', next: b.next };
    if (op === '%') {
      if (a.t === 'int' && b.t === 'int') return { v: Math.trunc(num(av)) % Math.trunc(num(bv)), t: 'int', next: b.next };
      return { v: num(av) % num(bv), t: 'double', next: b.next };
    }
    if (op === '&&') return { v: !!(isTruthy(av) && isTruthy(bv)), t: 'boolean', next: b.next };
    if (op === '||') return { v: !!(isTruthy(av) || isTruthy(bv)), t: 'boolean', next: b.next };
    if (op === '&') return { v: num(av) & num(bv), t: 'int', next: b.next };
    if (op === '^') return { v: num(av) ^ num(bv), t: 'int', next: b.next };
    if (op === '<<') return { v: num(av) << num(bv), t: 'int', next: b.next };
    if (op === '>>') return { v: num(av) >> num(bv), t: 'int', next: b.next };
    if (op === '>>>') return { v: num(av) >>> num(bv), t: 'int', next: b.next };
    if (op === '|') return { v: num(av) | num(bv), t: 'int', next: b.next };
    if (op === '==') return { v: valuesEqual(av, bv), t: 'boolean', next: b.next };
    if (op === '!=') return { v: !valuesEqual(av, bv), t: 'boolean', next: b.next };
    if (op === '<') return { v: (typeof av === 'string' && typeof bv === 'string') ? av < bv : num(av) < num(bv), t: 'boolean', next: b.next };
    if (op === '<=') return { v: (typeof av === 'string' && typeof bv === 'string') ? av <= bv : num(av) <= num(bv), t: 'boolean', next: b.next };
    if (op === '>') return { v: (typeof av === 'string' && typeof bv === 'string') ? av > bv : num(av) > num(bv), t: 'boolean', next: b.next };
    if (op === '>=') return { v: (typeof av === 'string' && typeof bv === 'string') ? av >= bv : num(av) >= num(bv), t: 'boolean', next: b.next };
    if (op === 'instanceof') return { v: instanceOf(av, String(bv)), t: 'boolean', next: b.next };
    throw exc('Error', '未知运算符 ' + op);
  }

  function intDiv(at, bt, a, b) {
    if (b === 0) throw exc('ArithmeticException', '/ by zero');
    if (at === 'int' && bt === 'int') return Math.trunc(a / b);
    return a / b;
  }
  function instanceOf(v, typeName) {
    if (!v || !v.__cls) return false;
    let cur = v.__cls;
    while (cur) { if (cur.name === typeName) return true; cur = cur.sup; }
    return false;
  }

  function evalUnary(toks, i, ctx) {
    const t = toks[i];
    if (t.k === 'op' && ['!', '-', '+', '++', '--'].indexOf(t.v) >= 0) {
      const op = t.v;
      const r = evalUnary(toks, i + 1, ctx);
      if (op === '!') return { v: !isTruthy(r.v), t: 'boolean', next: r.next };
      if (op === '-') return { v: -num(r.v), t: r.t, next: r.next };
      if (op === '+') return { v: num(r.v), t: r.t, next: r.next };
      if (op === '++' || op === '--') {
        if (!r.set) throw exc('Error', '自增目标不可写');
        const old = r.v;
        const nv = op === '++' ? num(old) + 1 : num(old) - 1;
        r.set(nv);
        return { v: nv, t: r.t, next: r.next };
      }
    }
    return evalPostfix(toks, i, ctx);
  }

  function evalPostfix(toks, i, ctx) {
    let r = evalPrimary(toks, i, ctx);
    while (true) {
      const t = toks[r.next];
      if (t.k === 'p' && t.v === '[') {
        const idx = evalExpr(toks, r.next + 1, ctx);
        if (toks[idx.next].k !== 'p' || toks[idx.next].v !== ']') throw exc('Error', '缺少 ]');
        const base = r;
        r = { v: indexGet(base.v, idx.v), t: 'object', next: idx.next + 1, set: function (val) { indexSet(base.v, idx.v, val); } };
        continue;
      }
      if (t.k === 'p' && t.v === '.') {
        if (toks[r.next + 1].k !== 'id') throw exc('Error', '成员名缺失');
        const name = toks[r.next + 1].v;
        const after = r.next + 2;
        if (toks[after].k === 'p' && toks[after].v === '(') {
          const args = parseCallArgs(toks, after + 1, ctx);
          const callVal = R.invokeMember(r.v, name, args.vals);
          r = { v: callVal, t: resultTypeOf(callVal, R.__lastReturnType), next: args.next };
        } else {
          const base = r;
          r = { v: R.getMember(r.v, name), t: 'object', next: after, set: function (val) { base.v[name] = val; } };
        }
        continue;
      }
      if (t.k === 'op' && (t.v === '++' || t.v === '--')) {
        if (!r.set) throw exc('Error', '自增目标不可写');
        const old = r.v;
        const nv = t.v === '++' ? num(old) + 1 : num(old) - 1;
        r.set(nv);
        return { v: old, t: r.t, next: r.next + 1 };
      }
      if (t.k === 'op' && t.v === '::') {
        const mn = toks[r.next + 1].v;
        const base = r.v;
        const isClassRef = base && base.__clsObj;
        const fn = isClassRef
          ? function () {
              const args = Array.prototype.slice.call(arguments);
              return R.invokeMember(args[0], mn, args.slice(1));
            }
          : function () {
              return R.invokeMember(base, mn, Array.prototype.slice.call(arguments));
            };
        return { v: fn, t: 'fn', next: r.next + 2 };
      }
      if (t.k === 'p' && t.v === '(') {
        if (typeof r.v !== 'function') throw exc('Error', '该值不可调用');
        const args = parseCallArgs(toks, r.next + 1, ctx);
        const callVal = r.v.apply(null, args.vals);
        r = { v: callVal, t: resultTypeOf(callVal, R.__lastReturnType), next: args.next };
        continue;
      }
      break;
    }
    return r;
  }

  function indexGet(base, idx) {
    if (base && base.__kind === 'array') {
      const k = num(idx);
      if (k < 0 || k >= base.a.length) throw exc('ArrayIndexOutOfBoundsException', 'Index ' + k + ' out of bounds for length ' + base.a.length);
      return base.a[k];
    }
    if (base && base.__kind === 'list') {
      const k = num(idx);
      if (k < 0 || k >= base.a.length) throw exc('IndexOutOfBoundsException', 'Index: ' + k + ', Size: ' + base.a.length);
      return base.a[k];
    }
    if (typeof base === 'string') return base.charAt(num(idx));
    throw exc('Error', '不支持索引访问');
  }
  function indexSet(base, idx, val) {
    if (base && base.__kind === 'array') {
      const k = num(idx);
      if (k < 0 || k >= base.a.length) throw exc('ArrayIndexOutOfBoundsException', 'Index ' + k + ' out of bounds for length ' + base.a.length);
      base.a[k] = val;
    }
    else if (base && base.__kind === 'list') {
      const k = num(idx);
      if (k < 0 || k >= base.a.length) throw exc('IndexOutOfBoundsException', 'Index: ' + k + ', Size: ' + base.a.length);
      base.a[k] = val;
    }
    else throw exc('Error', '不支持索引赋值');
  }

  function parseCallArgs(toks, i, ctx) {
    const vals = [];
    if (toks[i].k === 'p' && toks[i].v === ')') return { vals: vals, next: i + 1 };
    let j = i;
    while (true) {
      const a = evalExpr(toks, j, ctx);
      vals.push(a.v);
      j = a.next;
      if (toks[j].k === 'p' && toks[j].v === ',') { j++; continue; }
      if (toks[j].k === 'p' && toks[j].v === ')') { j++; break; }
      throw exc('Error', '参数列表格式错误');
    }
    return { vals: vals, next: j };
  }

  function evalPrimary(toks, i, ctx) {
    const t = toks[i];
    if (t.k === 'num') return { v: t.isFloat ? parseFloat(t.v) : parseInt(t.v, 10), t: t.isFloat ? 'double' : 'int', next: i + 1 };
    if (t.k === 'str') return { v: t.v, t: 'String', next: i + 1 };
    if (t.k === 'p' && t.v === '(') {
      const lam = tryLambda(toks, i);
      if (lam) return { v: makeLambda(lam, ctx), t: 'fn', next: lam.next };
      if (looksLikeCast(toks, i + 1)) {
        const rt = R2.readType(toks, i + 1);
        if (toks[rt.next].k !== 'p' || toks[rt.next].v !== ')') throw exc('Error', '转换语法错误');
        const inner = evalUnary(toks, rt.next + 1, ctx);
        return applyCast(rt.type, inner);
      }
      const inner = evalExpr(toks, i + 1, ctx);
      if (toks[inner.next].k !== 'p' || toks[inner.next].v !== ')') throw exc('Error', '缺少 )');
      return { v: inner.v, t: inner.t, next: inner.next + 1 };
    }
    if (t.k === 'id') {
      if (t.v === 'new') return evalNew(toks, i + 1, ctx);
      if (t.v === 'switch') return evalSwitchExpr(toks, i, ctx);
      if (toks[i + 1] && toks[i + 1].k === 'op' && toks[i + 1].v === '->') {
        const lam2 = tryLambda(toks, i);
        if (lam2) return { v: makeLambda(lam2, ctx), t: 'fn', next: lam2.next };
      }
      if (t.v === 'this') return { v: ctx.thisObj, t: 'object', next: i + 1 };
      if (t.v === 'super') {
        if (!ctx.thisObj || !ctx.thisObj.__cls) throw exc('Error', 'super 只能在实例方法或构造器中使用');
        const sup = ctx.thisObj.__cls.sup || ctx.thisObj.__cls;
        return { v: { __superOf: ctx.thisObj, __cls: sup }, t: 'object', next: i + 1 };
      }
      if (t.v === 'true' || t.v === 'false') return { v: t.v === 'true', t: 'boolean', next: i + 1 };
      if (t.v === 'null') return { v: null, t: 'null', next: i + 1 };
      const res = resolveIdent(t.v, ctx);
      return { v: res.v, t: res.t, next: i + 1, set: res.set };
    }
    if (t.k === 'p' && t.v === '{') {
      const arr = parseArrayLiteral(toks, i, ctx);
      return { v: arr.v, t: 'array', next: arr.next };
    }
    throw exc('Error', '无法解析表达式');
  }

  // switch 表达式：String t = switch (day) { case 1, 2, 3 -> "上半周"; default -> "其他"; };
  function evalSwitchExpr(toks, i, ctx) {
    if (toks[i + 1].k !== 'p' || toks[i + 1].v !== '(') throw exc('Error', 'switch 表达式缺少 (');
    const sw = evalExpr(toks, i + 2, ctx);
    let j = sw.next;
    if (toks[j].k !== 'p' || toks[j].v !== ')') throw exc('Error', 'switch 表达式缺少 )');
    j++;
    if (toks[j].k !== 'p' || toks[j].v !== '{') throw exc('Error', 'switch 表达式缺少 {');
    const close = root.__RUN_CTX.match[j];
    let k = j + 1;
    const matched = { hit: false, v: undefined, t: 'object' };
    const def = { hit: false, v: undefined, t: 'object' };
    while (k < close) {
      if (toks[k].k === 'id' && toks[k].v === 'case') {
        k++;
        const vals = [];
        while (true) {
          const e = evalExpr(toks, k, ctx);
          vals.push(e.v);
          k = e.next;
          if (toks[k].k === 'p' && toks[k].v === ',') { k++; continue; }
          break;
        }
        if (!(toks[k].k === 'op' && toks[k].v === '->')) throw exc('Error', 'switch 表达式暂只支持 -> 写法');
        k++;
        const bodyEnd = lambdaBodyEnd(toks, k);
        let hit = false;
        for (let m = 0; m < vals.length; m++) { if (valuesEqual(sw.v, vals[m])) { hit = true; break; } }
        if (hit && !matched.hit) { const e = evalExpr(toks, k, ctx); matched.hit = true; matched.v = e.v; matched.t = e.t; }
        k = bodyEnd;
        if (toks[k].k === 'p' && toks[k].v === ';') k++;
        continue;
      }
      if (toks[k].k === 'id' && toks[k].v === 'default') {
        k++;
        if (!(toks[k].k === 'op' && toks[k].v === '->')) throw exc('Error', 'switch 表达式暂只支持 -> 写法');
        k++;
        const bodyEnd = lambdaBodyEnd(toks, k);
        if (!matched.hit && !def.hit) { const e = evalExpr(toks, k, ctx); def.hit = true; def.v = e.v; def.t = e.t; }
        k = bodyEnd;
        if (toks[k].k === 'p' && toks[k].v === ';') k++;
        continue;
      }
      k++;
    }
    const picked = matched.hit ? matched : def;
    return { v: picked.v, t: picked.t, next: close + 1 };
  }

  function looksLikeCast(toks, i) {
    if (toks[i].k !== 'id') return false;
    if (PRIMITIVES.has(toks[i].v)) return true;
    const t1 = toks[i + 1];
    if (t1 && t1.k === 'p' && t1.v === ')') return true;
    if (t1 && t1.k === 'p' && t1.v === '[') {
      let j = i + 1;
      while (toks[j].k === 'p' && toks[j].v === '[') j += 2;
      return toks[j].k === 'p' && toks[j].v === ')';
    }
    return false;
  }

  // ---- lambda 表达式：(a, b) -> 表达式 / (x) -> 表达式 / () -> { 语句 } ----
  // 跳过一段表达式（不求值），用于短路求值和 switch 表达式
  function skipExpr(toks, i, minPrec) {
    let j = i, depth = 0;
    while (j < toks.length) {
      const t = toks[j];
      if (t.k === 'eof') return j;
      if (t.k === 'p' && (t.v === '(' || t.v === '[' || t.v === '{')) { depth++; j++; continue; }
      if (t.k === 'p' && (t.v === ')' || t.v === ']' || t.v === '}')) { if (depth === 0) return j; depth--; j++; continue; }
      if (depth === 0) {
        if (t.k === 'p' && (t.v === ',' || t.v === ';')) return j;
        if (t.k === 'op' && t.v === '?') return j;
        if (t.k === 'op' || (t.k === 'id' && t.v === 'instanceof')) {
          const pr = PREC[t.k === 'id' ? 'instanceof' : t.v];
          if (pr !== undefined && pr < minPrec) return j;
        }
      }
      j++;
    }
    return j;
  }

  function lambdaBodyEnd(toks, i) {
    let depth = 0, j = i;
    while (j < toks.length) {
      const t = toks[j];
      if (t.k === 'eof') return j;
      if (t.k === 'p' && (t.v === '(' || t.v === '[' || t.v === '{')) depth++;
      else if (t.k === 'p' && (t.v === ')' || t.v === ']' || t.v === '}')) { if (depth === 0) return j; depth--; }
      else if (depth === 0 && t.k === 'p' && (t.v === ',' || t.v === ';')) return j;
      j++;
    }
    return j;
  }

  function tryLambda(toks, i) {
    let j = i;
    const params = [];
    if (toks[j].k === 'p' && toks[j].v === '(') {
      j++;
      if (!(toks[j].k === 'p' && toks[j].v === ')')) {
        while (true) {
          if (toks[j].k !== 'id') return null;
          params.push(toks[j].v); j++;
          if (toks[j].k === 'p' && toks[j].v === ',') { j++; continue; }
          break;
        }
      }
      if (!(toks[j].k === 'p' && toks[j].v === ')')) return null;
      j++;
    } else if (toks[j].k === 'id') {
      params.push(toks[j].v); j++;
    } else {
      return null;
    }
    if (!(toks[j].k === 'op' && toks[j].v === '->')) return null;
    j++;
    if (toks[j].k === 'p' && toks[j].v === '{') {
      const blockEnd = root.__RUN_CTX.match[j];
      return { params: params, bodyBlock: { start: j + 1, end: blockEnd }, bodyExpr: null, next: blockEnd + 1 };
    }
    const endIdx = lambdaBodyEnd(toks, j);
    return { params: params, bodyBlock: null, bodyExpr: j, next: endIdx };
  }

  function makeLambda(spec, ctx) {
    return function () {
      const args = Array.prototype.slice.call(arguments);
      const frames = ctx.frames.concat([R2.newFrame()]);   // 保留外层作用域，实现闭包捕获
      spec.params.forEach(function (p, idx) { R2.declare(frames, p, args[idx], R.inferType(args[idx])); });
      if (spec.bodyBlock) {
        try {
          R.execBlock(frames, spec.bodyBlock.start, spec.bodyBlock.end, ctx.thisObj, ctx.selfClass);
          return undefined;
        } catch (e) {
          if (R.isRet(e)) return e.value ? e.value.v : undefined;
          throw e;
        }
      }
      const lctx = { frames: frames, thisObj: ctx.thisObj, selfClass: ctx.selfClass };
      const r = evalExpr(root.__RUN_CTX.toks, spec.bodyExpr, lctx);
      return r.v;
    };
  }

  function applyCast(type, inner) {
    const base = type.replace(/\[\]/g, '');
    if (PRIMITIVES.has(base)) {
      if (['int', 'byte', 'short', 'long'].indexOf(base) >= 0) return { v: Math.trunc(num(inner.v)), t: 'int', next: inner.next };
      if (base === 'double' || base === 'float') return { v: num(inner.v), t: 'double', next: inner.next };
      if (base === 'char') return { v: String.fromCharCode(num(inner.v)), t: 'char', next: inner.next };
      if (base === 'boolean') return { v: isTruthy(inner.v), t: 'boolean', next: inner.next };
    }
    return { v: inner.v, t: 'object', next: inner.next };
  }

  function resolveIdent(name, ctx) {
    const lu = R2.lookup(ctx.frames, name);
    if (lu.found) return { v: lu.v, t: normType(lu.t, lu.v), set: function (val) { R2.assign(ctx.frames, name, val); } };
    if (R.builtins[name] !== undefined) return { v: R.builtins[name], t: 'object', set: null };
    if (root.__RUN_CTX.classes && root.__RUN_CTX.classes[name]) return { v: root.__RUN_CTX.classes[name], t: 'class', set: null };
    if (ctx.thisObj && ctx.thisObj.__cls) {
      const f = R.findField(ctx.thisObj.__cls, name);
      if (f && !f.isStatic) return { v: ctx.thisObj[name], t: normType(f.type, ctx.thisObj[name]), set: function (val) { ctx.thisObj[name] = val; } };
      const m = R.findMethod(ctx.thisObj.__cls, name);
      if (m && !m.isStatic) return { v: function () { return R.invokeMember(ctx.thisObj, name, Array.prototype.slice.call(arguments)); }, t: 'fn', set: null };
    }
    if (ctx.selfClass && ctx.selfClass.__clsObj) {
      const f = R.findField(ctx.selfClass, name);
      if (f && f.isStatic) return { v: ctx.selfClass.statics.get(name), t: normType(f.type, ctx.selfClass.statics.get(name)), set: function (val) { ctx.selfClass.statics.set(name, val); } };
      const m = R.findMethod(ctx.selfClass, name);
      if (m && m.isStatic) return { v: function () { return R.invokeMember(ctx.selfClass, name, Array.prototype.slice.call(arguments)); }, t: 'fn', set: null };
    }
    throw exc('Error', '找不到标识符：' + name);
  }

  function parseArrayLiteral(toks, i, ctx) {
    const elems = [];
    let j = i + 1;
    if (toks[j].k === 'p' && toks[j].v === '}') return { v: R.makeArray([], 'Object'), next: j + 1 };
    while (true) {
      if (toks[j].k === 'p' && toks[j].v === '{') { const sub = parseArrayLiteral(toks, j, ctx); elems.push(sub.v); j = sub.next; }
      else { const e = evalExpr(toks, j, ctx); elems.push(e.v); j = e.next; }
      if (toks[j].k === 'p' && toks[j].v === ',') { j++; continue; }
      if (toks[j].k === 'p' && toks[j].v === '}') { j++; break; }
      throw exc('Error', '数组字面量格式错误');
    }
    const t0 = elems.length ? inferArrElem(elems[0]) : 'Object';
    return { v: R.makeArray(elems, t0), next: j };
  }
  function inferArrElem(e) {
    if (e && e.__kind === 'array') return 'array';
    if (typeof e === 'number') return 'int';
    if (typeof e === 'string') return 'String';
    return 'Object';
  }

  function evalNew(toks, i, ctx) {
    const t = toks[i];
    if (t.k === 'id' && PRIMITIVES.has(t.v)) {
      const elem = t.v; let j = i + 1;
      if (toks[j].k === 'p' && toks[j].v === '[') {
        if (toks[j + 1].k === 'p' && toks[j + 1].v === ']') { const lit = parseArrayLiteral(toks, j + 2, ctx); return { v: lit.v, t: 'array', next: lit.next }; }
        const sizeExpr = evalExpr(toks, j + 1, ctx);
        if (toks[sizeExpr.next].k !== 'p' || toks[sizeExpr.next].v !== ']') throw exc('Error', '缺少 ]');
        const arr = R.makeArray([], elem);
        for (let k = 0; k < num(sizeExpr.v); k++) arr.a.push(elem === 'int' || elem === 'double' ? 0 : (elem === 'boolean' ? false : null));
        return { v: arr, t: 'array', next: sizeExpr.next + 1 };
      }
      throw exc('Error', 'new 数组格式错误');
    }
    if (t.k === 'id') {
      let typeName = t.v, j = i + 1;
      while (toks[j].k === 'p' && toks[j].v === '.') { j++; typeName += '.' + toks[j].v; j++; }
      if (toks[j].k === 'op' && toks[j].v === '<') j = R2.skipGeneric(toks, j);
      if (toks[j].k === 'p' && toks[j].v === '[') {
        let k = j;
        while (toks[k].k === 'p' && toks[k].v === '[') k += 2;   // 跳过 []
        const lit = parseArrayLiteral(toks, k, ctx);
        return { v: lit.v, t: 'array', next: lit.next };
      }
      if (toks[j].k !== 'p' || toks[j].v !== '(') throw exc('Error', 'new 缺少 (');
      const args = parseCallArgs(toks, j + 1, ctx);
      const simple = String(typeName).split('.').pop();
      const ctor = (R.builtinCtors && R.builtinCtors[simple]) || BUILTIN_CTORS[typeName] || BUILTIN_CTORS[simple];
      if (ctor) return { v: ctor.apply(null, args.vals), t: 'object', next: args.next };
      const cls = (root.__RUN_CTX.classes && (root.__RUN_CTX.classes[typeName] || root.__RUN_CTX.classes[simple])) || R.exceptionClasses[simple] || R.exceptionClasses[typeName];
      if (!cls) throw exc('Error', '找不到类：' + typeName);
      return { v: R.construct(cls, args.vals, null), t: 'object', next: args.next };
    }
    throw exc('Error', 'new 语法错误');
  }

  root.__EVAL = { evalExpr: evalExpr, typeKind: typeKind, normType: normType, isTruthy: isTruthy, valuesEqual: valuesEqual };
})(typeof window !== 'undefined' ? window : globalThis);
/* =============================================================
   运行器第五部分 B：语句执行 + run 入口
   ============================================================= */
(function (root) {
  const I = root.__JAVA_INTERNALS;
  const R = root.__JAVA_RT;
  const R2 = root.__JAVA_RT2;
  const E = root.__EVAL;
  const exc = R.exc, isExc = R.isExc, isBrk = R.isBrk, isCnt = R.isCnt, isRet = R.isRet;
  const num = R.num;
  const evalExpr = E.evalExpr;

  const PRIMITIVES = new Set(['int', 'long', 'double', 'float', 'boolean', 'char', 'byte', 'short', 'void']);

  function CUR() { return root.__RUN_CTX; }

  // 执行步数保护：防止死循环把页面卡住
  let STEP_COUNT = 0;
  const STEP_LIMIT = 800000;
  function tick() {
    STEP_COUNT++;
    if (STEP_COUNT > STEP_LIMIT) {
      throw exc('Error', '执行步数过多（可能是死循环），已自动中止。请检查循环条件，例如 while 是否一定会结束。');
    }
  }

  R.execBlock = function (frames, start, end, thisObj, selfClass) {
    return execBlock(CUR().toks, start, end, { frames: frames, thisObj: thisObj, selfClass: selfClass });
  };

  function execBlock(toks, start, end, ctx) {
    let i = start;
    while (i < end) { i = execStatement(toks, i, end, ctx); }
  }

  function execStatement(toks, i, end, ctx) {
    tick();
    const t = toks[i];
    if (t.k === 'eof' || i >= end) return i + 1;
    if (t.k === 'p' && t.v === ';') return i + 1;
    if (t.k === 'p' && t.v === '{') {
      const be = CUR().match[i];
      R2.pushScope(ctx.frames);
      execBlock(toks, i + 1, be, ctx);
      ctx.frames.pop();
      return be + 1;
    }
    if (t.k === 'id') {
      if (t.v === 'if') return execIf(toks, i, end, ctx);
      if (t.v === 'for') return execFor(toks, i, end, ctx);
      if (t.v === 'while') return execWhile(toks, i, end, ctx);
      if (t.v === 'do') return execDoWhile(toks, i, end, ctx);
      if (t.v === 'switch') return execSwitch(toks, i, end, ctx);
      if (t.v === 'return') {
        if (toks[i + 1].k === 'p' && toks[i + 1].v === ';') throw { __ret: true, value: { v: undefined, t: 'void' } };
        const e = evalExpr(toks, i + 1, ctx);
        throw { __ret: true, value: { v: e.v, t: e.t } };
      }
      if (t.v === 'break') { nextSemi(toks, i + 1); throw { __brk: true }; }
      if (t.v === 'continue') { nextSemi(toks, i + 1); throw { __cnt: true }; }
      if (t.v === 'throw') { const e = evalExpr(toks, i + 1, ctx); throw toExc(e.v); }
      if (t.v === 'this' && toks[i + 1] && toks[i + 1].k === 'p' && toks[i + 1].v === '(') return execThisCall(toks, i, ctx);
      if (t.v === 'try') return execTry(toks, i, end, ctx);
      if (t.v === 'synchronized' && toks[i + 1] && toks[i + 1].k === 'p' && toks[i + 1].v === '(') return execSynchronized(toks, i, ctx);
      if (t.v === 'super' && toks[i + 1] && toks[i + 1].k === 'p' && toks[i + 1].v === '(') return execSuper(toks, i, end, ctx);
    }
    if (looksLikeDeclaration(toks, i)) return execDeclaration(toks, i, end, ctx);
    const e = evalExpr(toks, i, ctx);
    return nextSemi(toks, e.next);
  }

  function nextSemi(toks, i) { while (i < toks.length && !(toks[i].k === 'p' && toks[i].v === ';')) i++; return i + 1; }

  function toExc(v) {
    if (v && v.__cls && v.message !== undefined) return exc(v.__cls.name, v.message);
    return exc('RuntimeException', String(v));
  }

  function execIf(toks, i, end, ctx) {
    if (toks[i + 1].k !== 'p' || toks[i + 1].v !== '(') throw exc('Error', 'if 缺少 (');
    const cond = evalExpr(toks, i + 2, ctx);
    let j = cond.next;
    if (toks[j].k !== 'p' || toks[j].v !== ')') throw exc('Error', 'if 缺少 )');
    j++;
    const thenEnd = findStmtEnd(toks, j);
    if (E.isTruthy(cond.v)) {
      execOne(toks, j, thenEnd, ctx);
      if (toks[thenEnd].k === 'id' && toks[thenEnd].v === 'else') return findIfEnd(toks, thenEnd + 1);
      return thenEnd;
    } else {
      if (toks[thenEnd].k === 'id' && toks[thenEnd].v === 'else') {
        if (toks[thenEnd + 1].k === 'id' && toks[thenEnd + 1].v === 'if') {
          return execIf(toks, thenEnd + 1, end, ctx);
        }
        const es = thenEnd + 1, ee = findStmtEnd(toks, es);
        execOne(toks, es, ee, ctx);
        return ee;
      }
      return thenEnd;
    }
  }

  function findStmtEnd(toks, i) {
    if (toks[i].k === 'p' && toks[i].v === '{') return CUR().match[i] + 1;
    let depth = 0, j = i;
    while (j < toks.length) {
      const t = toks[j];
      if (t.k === 'eof') return j;
      if (t.k === 'p' && (t.v === '(' || t.v === '[' || t.v === '{')) depth++;
      else if (t.k === 'p' && (t.v === ')' || t.v === ']' || t.v === '}')) { if (depth === 0) return j + 1; depth--; }
      else if (depth === 0 && t.k === 'p' && t.v === ';') return j + 1;
      else if (depth === 0 && j > i && t.k === 'id' && ['if', 'for', 'while', 'do', 'return', 'break', 'continue', 'switch', 'throw', 'try'].indexOf(t.v) >= 0) return j;
      j++;
    }
    return j;
  }

  // 只扫描、不求值：返回表达式结束位置（终止符所在下标）
  function scanExprEnd(toks, i, stopChars) {
    let depth = 0, j = i;
    while (j < toks.length) {
      const t = toks[j];
      if (t.k === 'eof') return j;
      if (t.k === 'p' && (t.v === '(' || t.v === '[' || t.v === '{')) { depth++; j++; continue; }
      if (t.k === 'p' && (t.v === ')' || t.v === ']' || t.v === '}')) { if (depth === 0) return j; depth--; j++; continue; }
      if (depth === 0 && t.k === 'p' && stopChars.indexOf(t.v) >= 0) return j;
      j++;
    }
    return j;
  }

  // 计算一个完整 if 语句（含所有 else if / else 分支）的结束位置
  function findIfEnd(toks, i) {
    const condEnd = scanExprEnd(toks, i + 2, [')']);
    const thenEnd = findStmtEnd(toks, condEnd + 1);
    if (toks[thenEnd] && toks[thenEnd].k === 'id' && toks[thenEnd].v === 'else') {
      const es = thenEnd + 1;
      if (toks[es].k === 'id' && toks[es].v === 'if') return findIfEnd(toks, es);
      return findStmtEnd(toks, es);
    }
    return thenEnd;
  }

  function execOne(toks, start, end, ctx) {
    if (start >= end) return;
    const t = toks[start];
    if (t.k === 'p' && t.v === '{') {
      const be = CUR().match[start];
      R2.pushScope(ctx.frames);
      execBlock(toks, start + 1, be, ctx);
      ctx.frames.pop();
    } else {
      execStatement(toks, start, end, ctx);
    }
  }

  function execFor(toks, i, end, ctx) {
    if (toks[i + 1].k !== 'p' || toks[i + 1].v !== '(') throw exc('Error', 'for 缺少 (');
    let j = i + 2;
    if (looksLikeEnhancedFor(toks, j)) {
      const rt = R2.readType(toks, j); j = rt.next;
      const varName = toks[j].v; j++;
      if (toks[j].k !== 'p' || toks[j].v !== ':') throw exc('Error', '增强 for 缺少 :');
      const iter = evalExpr(toks, j + 1, ctx);
      j = iter.next;
      if (toks[j].k !== 'p' || toks[j].v !== ')') throw exc('Error', '增强 for 缺少 )');
      j++;
      const bodyStart = j, bodyEnd = findStmtEnd(toks, j);
      const items = iterableItems(iter.v);
      for (let k = 0; k < items.length; k++) {
        R2.pushScope(ctx.frames);
        R2.declare(ctx.frames, varName, items[k], rt.type);
        try { execOne(toks, bodyStart, bodyEnd, ctx); }
        catch (e) { ctx.frames.pop(); if (isBrk(e)) break; if (isCnt(e)) continue; throw e; }
        ctx.frames.pop();
      }
      return bodyEnd;
    }

    // 经典 for
    if (!(toks[j].k === 'p' && toks[j].v === ';')) {
      if (looksLikeDeclaration(toks, j)) { j = execDeclaration(toks, j, end, ctx); }
      else { const e = evalExpr(toks, j, ctx); j = e.next; }
    }
    if (toks[j].k === 'p' && toks[j].v === ';') j++;
    const condStart = j;
    let condEnd = j;
    if (!(toks[j].k === 'p' && toks[j].v === ';')) { condEnd = scanExprEnd(toks, j, [';']); }
    j = condEnd + 1;
    const updStart = j;
    if (!(toks[j].k === 'p' && toks[j].v === ')')) { j = scanExprEnd(toks, j, [')']); }
    if (toks[j].k !== 'p' || toks[j].v !== ')') throw exc('Error', 'for 缺少 )');
    j++;
    const bodyStart = j, bodyEnd = findStmtEnd(toks, j);

    while (true) {
      tick();
      let condVal = true;
      if (condEnd > condStart) { const c = evalExpr(toks, condStart, ctx); condVal = E.isTruthy(c.v); }
      if (!condVal) break;
      try { execOne(toks, bodyStart, bodyEnd, ctx); }
      catch (e) { if (isBrk(e)) break; if (isCnt(e)) { /* continue */ } else throw e; }
      if (!(toks[updStart].k === 'p' && toks[updStart].v === ')')) { evalExpr(toks, updStart, ctx); }
    }
    return bodyEnd;
  }

  function looksLikeEnhancedFor(toks, i) {
    try {
      const rt = R2.readType(toks, i);
      const j = rt.next;
    return toks[j].k === 'id' && toks[j + 1].k === 'p' && toks[j + 1].v === ':';
    } catch (e) { return false; }
  }
  function iterableItems(v) {
    if (!v) return [];
    if (v.__kind === 'array' || v.__kind === 'list') return v.a;
    if (typeof v === 'string') return v.split('');
    if (v.__kind === 'set') {
      const arr = Array.from(v.s);
      return v.sorted ? arr.sort(R.compareNatural) : arr;
    }
    throw exc('Error', '不可遍历的对象');
  }

  function execWhile(toks, i, end, ctx) {
    if (toks[i + 1].k !== 'p' || toks[i + 1].v !== '(') throw exc('Error', 'while 缺少 (');
    const condStart = i + 2;
    let j = scanExprEnd(toks, condStart, [')']);
    if (toks[j].k !== 'p' || toks[j].v !== ')') throw exc('Error', 'while 缺少 )');
    j++;
    const bodyStart = j, bodyEnd = findStmtEnd(toks, j);
    while (true) {
      tick();
      const c = evalExpr(toks, condStart, ctx);
      if (!E.isTruthy(c.v)) break;
      try { execOne(toks, bodyStart, bodyEnd, ctx); }
      catch (e) { if (isBrk(e)) break; if (isCnt(e)) continue; throw e; }
    }
    return bodyEnd;
  }

  function execDoWhile(toks, i, end, ctx) {
    const bodyStart = i + 1, bodyEnd = findStmtEnd(toks, bodyStart);
    let j = bodyEnd;
    if (toks[j].k === 'id' && toks[j].v === 'while') j++;
    if (toks[j].k !== 'p' || toks[j].v !== '(') throw exc('Error', 'do-while 缺少 (');
    const condStart = j + 1;
    j = scanExprEnd(toks, condStart, [')']);
    if (toks[j].k !== 'p' || toks[j].v !== ')') throw exc('Error', 'do-while 缺少 )');
    j++;
    if (toks[j].k === 'p' && toks[j].v === ';') j++;
    do {
      tick();
      try { execOne(toks, bodyStart, bodyEnd, ctx); }
      catch (e) { if (isBrk(e)) break; if (isCnt(e)) { /* continue */ } else throw e; }
      const c = evalExpr(toks, condStart, ctx);
      if (!E.isTruthy(c.v)) break;
    } while (true);
    return j;
  }

  function execSwitch(toks, i, end, ctx) {
    if (toks[i + 1].k !== 'p' || toks[i + 1].v !== '(') throw exc('Error', 'switch 缺少 (');
    const sw = evalExpr(toks, i + 2, ctx);
    let j = sw.next;
    if (toks[j].k !== 'p' || toks[j].v !== ')') throw exc('Error', 'switch 缺少 )');
    j++;
    if (toks[j].k !== 'p' || toks[j].v !== '{') throw exc('Error', 'switch 缺少 {');
    const close = CUR().match[j];
    parseCases(toks, j + 1, close, ctx, sw);
    return close + 1;
  }

  function parseCases(toks, start, close, ctx, sw) {
    let j = start;
    const ranges = [];
    let defaultRange = null;
    while (j < close) {
      if (toks[j].k === 'id' && toks[j].v === 'case') {
        j++;
        const vals = [];
        while (true) {
          const e = evalExpr(toks, j, ctx);
          vals.push(e.v);
          j = e.next;
          if (toks[j].k === 'p' && toks[j].v === ',') { j++; continue; }
          break;
        }
        if (toks[j].k === 'op' && toks[j].v === '->') { j++; const se = findStmtEnd(toks, j); ranges.push({ vals: vals, start: j, end: se, arrow: true }); j = se; }
        else if (toks[j].k === 'p' && toks[j].v === ':') { j++; const se = findCaseBodyEnd(toks, j, close); ranges.push({ vals: vals, start: j, end: se, arrow: false }); j = se; }
        else throw exc('Error', 'case 语法错误');
      } else if (toks[j].k === 'id' && toks[j].v === 'default') {
        j++;
        if (toks[j].k === 'op' && toks[j].v === '->') { j++; const se = findStmtEnd(toks, j); defaultRange = { start: j, end: se, arrow: true }; j = se; }
        else if (toks[j].k === 'p' && toks[j].v === ':') { j++; const se = findCaseBodyEnd(toks, j, close); defaultRange = { start: j, end: se, arrow: false }; j = se; }
      } else j++;
    }
    for (let k = 0; k < ranges.length; k++) {
      const r = ranges[k];
      let hit = false;
      for (let m = 0; m < r.vals.length; m++) { if (E.valuesEqual(sw.v, r.vals[m])) { hit = true; break; } }
      if (hit) { try { execRange(toks, r.start, r.end, ctx, r.arrow); } catch (e) { if (isBrk(e)) return; throw e; } return; }
    }
    if (defaultRange) execRange(toks, defaultRange.start, defaultRange.end, ctx, defaultRange.arrow);
  }
  function findCaseBodyEnd(toks, i, close) {
    let j = i;
    while (j < close) {
      if (toks[j].k === 'id' && (toks[j].v === 'case' || toks[j].v === 'default')) return j;
      if (toks[j].k === 'id' && toks[j].v === 'break') return j;
      j++;
    }
    return close;
  }
  function execRange(toks, start, end, ctx, isArrow) {
    if (isArrow) { execOne(toks, start, end, ctx); return; }
    execBlock(toks, start, end, ctx);
  }

  function execDeclaration(toks, i, end, ctx) {
    if (toks[i].k === 'id' && toks[i].v === 'final') i++;
    const rt = R2.readType(toks, i);
    let j = rt.next;
    while (true) {
      const name = toks[j].v; j++;
      let val = defaultForTypeLocal(rt.type);
      if (toks[j].k === 'op' && toks[j].v === '=') { const e = evalExpr(toks, j + 1, ctx); val = e.v; j = e.next; }
      R2.declare(ctx.frames, name, val, rt.type === 'var' ? undefined : rt.type);
      if (toks[j].k === 'p' && toks[j].v === ',') { j++; continue; }
      break;
    }
    return j + 1;
  }
  function defaultForTypeLocal(t) {
    if (!t) return null;
    if (t.indexOf('[]') >= 0) return null;
    if (['int', 'long', 'byte', 'short', 'double', 'float'].indexOf(t) >= 0) return 0;
    if (t === 'boolean') return false;
    return null;
  }

  function execTry(toks, i, end, ctx) {
    let j = i + 1;
    const resVars = [];
    if (toks[j].k === 'p' && toks[j].v === '(') {
      j++;
      if (!(toks[j].k === 'p' && toks[j].v === ')')) {
        if (looksLikeDeclaration(toks, j)) {
          try { const rt0 = R2.readType(toks, j); const nm0 = toks[rt0.next]; if (nm0 && nm0.k === 'id') resVars.push(nm0.v); } catch (e) { }
          j = execDeclaration(toks, j, end, ctx); j--;
        }
        else { const e = evalExpr(toks, j, ctx); j = e.next; }
      }
      if (toks[j].k === 'p' && toks[j].v === ')') j++;
    }
    if (toks[j].k !== 'p' || toks[j].v !== '{') throw exc('Error', 'try 缺少 {');
    const tryStart = j + 1, tryEnd = CUR().match[j];
    j = tryEnd + 1;
    const catches = [];
    let finallyRange = null;
    while (toks[j].k === 'id' && toks[j].v === 'catch') {
      j++;
      if (toks[j].k !== 'p' || toks[j].v !== '(') throw exc('Error', 'catch 缺少 (');
      const ct = R2.readType(toks, j + 1); let k = ct.next;
      const catchTypes = [ct.type];
      while (toks[k].k === 'op' && toks[k].v === '|') {
        k++;
        const ct2 = R2.readType(toks, k);
        catchTypes.push(ct2.type);
        k = ct2.next;
      }
      const exName = toks[k].v; k++;
      if (toks[k].k !== 'p' || toks[k].v !== ')') throw exc('Error', 'catch 缺少 )');
      k++;
      if (toks[k].k !== 'p' || toks[k].v !== '{') throw exc('Error', 'catch 缺少 {');
      catches.push({ types: catchTypes, name: exName, start: k + 1, end: CUR().match[k] });
      j = CUR().match[k] + 1;
    }
    if (toks[j].k === 'id' && toks[j].v === 'finally') {
      j++;
      if (toks[j].k === 'p' && toks[j].v === '{') { finallyRange = { start: j + 1, end: CUR().match[j] }; j = CUR().match[j] + 1; }
    }
    try {
      execBlock(toks, tryStart, tryEnd, ctx);
    } catch (e) {
      if (isExc(e)) {
        let handled = false;
        for (let c = 0; c < catches.length; c++) {
          const ctList = catches[c].types || [catches[c].type];
          let m2 = false;
          for (let ci = 0; ci < ctList.length; ci++) { if (catchMatches(ctList[ci], e.name)) { m2 = true; break; } }
          if (m2) {
            R2.pushScope(ctx.frames);
            R2.declare(ctx.frames, catches[c].name, {
              getMessage: function () { return e.message; },
              getClass: function () { return { getSimpleName: function () { return e.name; }, getName: function () { return e.name; } }; },
              message: e.message
            }, (catches[c].types || [catches[c].type])[0]);
            execBlock(toks, catches[c].start, catches[c].end, ctx);
            ctx.frames.pop();
            handled = true;
            break;
          }
        }
        if (!handled) { if (finallyRange) execBlock(toks, finallyRange.start, finallyRange.end, ctx); throw e; }
      } else {
        if (finallyRange) execBlock(toks, finallyRange.start, finallyRange.end, ctx);
        throw e;
      }
    }
    if (finallyRange) execBlock(toks, finallyRange.start, finallyRange.end, ctx);
    // 模拟 try-with-resources：结束时自动关闭资源
    resVars.forEach(function (nm) {
      const lu = R2.lookup(ctx.frames, nm);
      if (lu.found && lu.v) {
        try { R.invokeMember(lu.v, 'close', []); } catch (e) { /* 忽略关闭异常 */ }
      }
    });
    return j;
  }
  function catchMatches(type, name) {
    const base = type.replace(/\[\]/g, '');
    if (['Exception', 'Throwable', 'RuntimeException'].indexOf(base) >= 0) return true;
    return base === name;
  }

  // this(...) 构造器委托：调用同类中另一个构造器
  function execSynchronized(toks, i, ctx) {
    const lock = evalExpr(toks, i + 2, ctx);
    let j = lock.next;
    if (toks[j].k !== 'p' || toks[j].v !== ')') throw exc('Error', 'synchronized 缺少 )');
    j++;
    if (toks[j].k !== 'p' || toks[j].v !== '{') throw exc('Error', 'synchronized 缺少 {');
    const be = CUR().match[j];
    R2.pushScope(ctx.frames);
    execBlock(toks, j + 1, be, ctx);
    ctx.frames.pop();
    return be + 1;
  }

  function execThisCall(toks, i, ctx) {
    const args = parseCallArgsSimple(toks, i + 2, ctx);
    const inst = ctx.thisObj;
    if (!inst || !inst.__cls) return nextSemi(toks, args.next);
    const cls = inst.__cls;
    let ctor = null;
    for (let c = 0; c < cls.ctors.length; c++) {
      const cand = cls.ctors[c];
      if (cand.params.length === args.vals.length && cand !== inst.__ctor) { ctor = cand; break; }
    }
    if (!ctor) return nextSemi(toks, args.next);
    inst.__ctor = ctor;
    const frames = [R2.newFrame()];
    ctor.params.forEach(function (p, idx) { R2.declare(frames, p, args.vals[idx], ctor.paramTypes[idx]); });
    R2.declare(frames, 'this', inst, cls.name);
    try { R.execBlock(frames, ctor.body.start, ctor.body.end, inst, cls); }
    catch (e) { if (!isRet(e)) throw e; }
    return nextSemi(toks, args.next);
  }

  function execSuper(toks, i, end, ctx) {
    let j = i + 1;
    if (toks[j].k !== 'p' || toks[j].v !== '(') throw exc('Error', 'super 缺少 (');
    const args = parseCallArgsSimple(toks, j + 1, ctx);
    const cls = ctx.thisObj && ctx.thisObj.__cls ? ctx.thisObj.__cls : null;
    if (!cls || !cls.sup) return nextSemi(toks, args.next);
    const supCtor = R.pickCtor(cls.sup, args.vals.length);
    if (supCtor) {
      if (supCtor.invoke) { supCtor.invoke(ctx.thisObj, args.vals); }
      else {
        const frames = [R2.newFrame()];
        supCtor.params.forEach(function (p, idx) { R2.declare(frames, p, args.vals[idx], supCtor.paramTypes[idx]); });
        R2.declare(frames, 'this', ctx.thisObj, cls.sup.name);
        try { R.execBlock(frames, supCtor.body.start, supCtor.body.end, ctx.thisObj, cls.sup); }
        catch (e) { if (!isRet(e)) throw e; }
      }
    }
    return nextSemi(toks, args.next);
  }
  function parseCallArgsSimple(toks, i, ctx) {
    const vals = [];
    if (toks[i].k === 'p' && toks[i].v === ')') return { vals: vals, next: i + 1 };
    let j = i;
    while (true) {
      const a = evalExpr(toks, j, ctx);
      vals.push(a.v);
      j = a.next;
      if (toks[j].k === 'p' && toks[j].v === ',') { j++; continue; }
      if (toks[j].k === 'p' && toks[j].v === ')') { j++; break; }
      throw exc('Error', '参数列表格式错误');
    }
    return { vals: vals, next: j };
  }

  function looksLikeDeclaration(toks, i) {
    const t = toks[i];
    if (t.k !== 'id') return false;
    if (t.v === 'final') return true;
    if (t.v === 'var' && toks[i + 1] && toks[i + 1].k === 'id') return true;
    if (PRIMITIVES.has(t.v)) return true;
    let rt;
    try { rt = R2.readType(toks, i); } catch (e) { return false; }
    const nameTok = toks[rt.next];
    if (!nameTok || nameTok.k !== 'id') return false;
    const after = toks[rt.next + 1];
    if (!after) return false;
    if (after.k === 'op' && ['=', '+=', '-=', '*=', '/=', '%='].indexOf(after.v) >= 0) return true;
    if (after.k === 'p' && (after.v === ';' || after.v === ',' || after.v === '[')) return true;
    return false;
  }

  const KNOWN_JAVA_TYPES = new Set([
    'Map', 'List', 'Set', 'Collection', 'Iterable', 'Iterator', 'Comparable',
    'ArrayList', 'LinkedList', 'HashMap', 'TreeMap', 'LinkedHashMap', 'HashSet', 'TreeSet',
    'String', 'Integer', 'Double', 'Float', 'Long', 'Short', 'Byte', 'Character', 'Boolean', 'Object',
    'Math', 'System', 'Scanner', 'StringBuilder', 'StringBuffer', 'Random',
    'Comparator', 'Collections', 'Arrays', 'Optional', 'Stream',
    'LocalDate', 'LocalDateTime', 'LocalTime', 'DateTimeFormatter', 'ChronoUnit', 'Duration', 'Period',
    'File', 'FileWriter', 'FileReader', 'BufferedWriter', 'BufferedReader', 'Files', 'Path', 'Paths',
    'Throwable', 'Exception', 'RuntimeException', 'Error'
  ]);

  function isKnownTypeName(name) {
    if (PRIMITIVES.has(name)) return true;
    if (KNOWN_JAVA_TYPES.has(name)) return true;
    if (R.builtins[name] !== undefined) return true;
    if (R.exceptionClasses[name]) return true;
    const classes = root.__RUN_CTX.classes;
    if (classes && classes[name]) return true;
    return false;
  }

  // 括号配对预检查：能拦住一大类手误，并给出具体提示
  function checkBalance(src) {
    const pairs = { '{': '}', '(': ')', '[': ']' };
    const cn = { '{': '}', '(': ')', '[': ']' };
    const stack = [];
    let str = null;
    for (let i = 0; i < src.length; i++) {
      const c = src[i];
      if (str) {
        if (c === '\\') { i++; continue; }
        if (c === str) str = null;
        continue;
      }
      if (c === '"' || c === "'") { str = c; continue; }
      if (pairs[c]) stack.push(c);
      else if (c === '}' || c === ')' || c === ']') {
        const top = stack.pop();
        if (!top || cn[top] !== c) return '括号不配对：多了一个 “' + c + '”，或者顺序写错了。';
      }
    }
    if (stack.length) {
      const top = stack[stack.length - 1];
      return '括号不配对：还有 ' + stack.length + ' 个 “' + top + '” 没有闭合（少了对应的 “' + cn[top] + '”）。';
    }
    return null;
  }

  function run(code, inputText, options) {
    const out = [];
    I._emit = function () { out.push(Array.prototype.slice.call(arguments).join('')); };
    I.__input = inputText || '';
    options = options || {};

    // ---------- 多文件支持：先校验每个依赖文件，再拼成一个编译单元运行 ----------
    const files = (options.files || []).filter(function (f) { return f && f.code && String(f.code).trim(); });
    for (let fi = 0; fi < files.length; fi++) {
      const fname = files[fi].name || ('依赖文件 ' + (fi + 1));
      const fbalance = checkBalance(I.preprocess(files[fi].code));
      if (fbalance) return { ok: false, output: '', error: fname + ' 有问题：' + fbalance };
      try {
        R2.parseClasses(files[fi].code);
      } catch (e) {
        return { ok: false, output: '', error: fname + ' 解析失败：' + e.message };
      }
    }
    const merged = files.length
      ? files.map(function (f, i) {
          return '// ===== 依赖文件：' + (f.name || (i + 1)) + ' =====\n' + f.code;
        }).join('\n\n') + '\n\n// ===== 主文件 =====\n' + code
      : code;

    // 记住主文件里定义了哪些类：程序入口（main）优先从主文件里找，
    // 这样即使某个依赖文件里也写了 main，也不会跑错入口
    const entryClasses = [];
    try {
      const mainSrc = I.preprocess(code);
      const reCls = /\b(?:class|interface)\s+(\w+)/g;
      let mc;
      while ((mc = reCls.exec(mainSrc))) entryClasses.push(mc[1]);
    } catch (e) { /* 主文件有问题时交给下面的解析报错 */ }

    const balErr = checkBalance(I.preprocess(merged));
    if (balErr) return { ok: false, output: '', error: balErr };
    let parsed;
    try { parsed = R2.parseClasses(merged); }
    catch (e) { return { ok: false, output: '', error: '代码解析失败：' + e.message }; }

    CUR().toks = parsed.tokens;
    CUR().match = parsed.match;
    CUR().classes = parsed.classes;
    STEP_COUNT = 0;

    try {
      Object.keys(CUR().classes).forEach(function (name) {
        const cls = CUR().classes[name];
        cls.fields.forEach(function (f) {
          if (f.isStatic) cls.statics.set(f.name, f.init ? evalStaticInit(f) : defaultForTypeLocal(f.type));
        });
        if (cls.staticBlocks && cls.staticBlocks.length) {
          cls.staticBlocks.forEach(function (blk) {
            const frames = [R2.newFrame()];
            try { R.execBlock(frames, blk.start, blk.end, null, cls); } catch (e) { if (!isRet(e)) throw e; }
          });
        }
      });
    } catch (e) {
      return { ok: false, output: out.join(''), error: '静态初始化失败：' + (isExc(e) ? e.name + ': ' + e.message : e.message) };
    }

    let mainClass = null;
    // 优先：主文件里定义的类中带 main 的那个
    entryClasses.forEach(function (name) {
      if (mainClass) return;
      const cls = CUR().classes[name];
      if (!cls) return;
      const m = R.findMethod(cls, 'main', 1);
      if (m && m.isStatic) mainClass = cls;
    });
    // 兜底：任意一个带 main 的类（例如把代码都写在依赖文件里）
    if (!mainClass) {
      Object.keys(CUR().classes).forEach(function (name) {
        if (mainClass) return;
        const cls = CUR().classes[name];
        const m = R.findMethod(cls, 'main', 1);
        if (m && m.isStatic) mainClass = cls;
      });
    }
    if (!mainClass) return { ok: false, output: out.join(''), error: '没有找到 public static void main(String[] args) 方法。' };

    try {
      R.invokeMember(mainClass, 'main', [R.makeArray([], 'String')]);
      return { ok: true, output: out.join(''), error: null };
    } catch (e) {
      if (isExc(e)) return { ok: false, output: out.join(''), error: e.name + ': ' + e.message };
      return { ok: false, output: out.join(''), error: '运行出错：' + (e && e.message ? e.message : String(e)) };
    }
  }

  function evalStaticInit(f) {
    const frames = [R2.newFrame()];
    const e = evalExpr(CUR().toks, f.init.s, { frames: frames, thisObj: null, selfClass: null });
    return e.v;
  }

  root.JavaRunner.run = run;
  root.JavaRunner.__run = run;
})(typeof window !== 'undefined' ? window : globalThis);
/* =============================================================
   运行器扩展：多线程与并发（浏览器里是“单线程模拟”）
   说明：JS 没有真正的多线程，这里让线程/线程池按创建顺序依次执行完，
   目的是让示例代码能跑出可读的输出、帮助理解 API 用法与执行顺序，
   而不是复现真实的并发时序。涉及 wait/notify 的例子请到 IDEA 里观察。
   ============================================================= */
(function (root) {
  const R = root.__JAVA_RT;
  const R2 = root.__JAVA_RT2;
  const makeClassObj = R2.makeClassObj;
  const num = R.num;
  const exc = R.exc;

  /* ---------- 线程 ---------- */
  const mainThread = {
    getName: function () { return 'main'; },
    setName: function () { },
    isAlive: function () { return true; },
    getId: function () { return 1; },
    getPriority: function () { return 5; }
  };
  let simCurrent = null;
  let poolSeq = 0;

  function makeThreadClass() {
    const cls = makeClassObj('Thread');
    function init(inst, task, name) {
      inst.__task = task || null;
      inst.__name = name ? String(name) : ('Thread-' + (++threadSeq));
      inst.__alive = false;
      return inst;
    }
    let threadSeq = 0;
    cls.ctors = [
      { name: 'Thread', params: [], paramTypes: [], isConstructor: true, cls: cls, invoke: function (inst) { return init(inst, null, null); } },
      { name: 'Thread', params: ['target'], paramTypes: ['Runnable'], isConstructor: true, cls: cls, invoke: function (inst, a) { return init(inst, a[0], null); } },
      { name: 'Thread', params: ['target', 'name'], paramTypes: ['Runnable', 'String'], isConstructor: true, cls: cls, invoke: function (inst, a) { return init(inst, a[0], a[1]); } },
      { name: 'Thread', params: ['name'], paramTypes: ['String'], isConstructor: true, cls: cls, invoke: function (inst, a) { return init(inst, null, a[0]); } }
    ];
    const M = function (name, params, invoke) { return { name: name, params: params || [], paramTypes: [], cls: cls, invoke: invoke }; };
    cls.methods.set('run', [M('run', [], function (inst) {
      if (typeof inst.__task === 'function') inst.__task();
      else if (inst.__task && (inst.__task.__cls || inst.__task.run)) R.invokeMember(inst.__task, 'run', []);
    })]);
    cls.methods.set('start', [M('start', [], function (inst) {
      inst.__started = true;
      inst.__alive = true;
      const prev = simCurrent;
      simCurrent = inst;
      try { R.invokeMember(inst, 'run', []); }
      finally { simCurrent = prev; }
      inst.__alive = false;
    })]);
    cls.methods.set('join', [M('join', [], function () { }), M('join', ['millis'], function () { })]);
    cls.methods.set('getName', [M('getName', [], function (inst) { return inst.__name; })]);
    cls.methods.set('setName', [M('setName', ['name'], function (inst, a) { inst.__name = String(a[0]); })]);
    cls.methods.set('isAlive', [M('isAlive', [], function (inst) { return !!inst.__alive; })]);
    cls.methods.set('interrupt', [M('interrupt', [], function () { })]);
    cls.methods.set('setDaemon', [M('setDaemon', ['on'], function () { })]);
    cls.methods.set('setPriority', [M('setPriority', ['p'], function () { })]);
    cls.methods.set('getState', [M('getState', [], function (inst) {
      if (!inst.__started) return 'NEW';
      return inst.__alive ? 'RUNNABLE' : 'TERMINATED';
    })]);
    cls.methods.set('getId', [M('getId', [], function () { return 1; })]);
    cls.methods.set('getPriority', [M('getPriority', [], function () { return 5; })]);
    cls.methods.set('isInterrupted', [M('isInterrupted', [], function () { return false; })]);
    cls.statics.set('sleep', function () { });
    cls.statics.set('yield', function () { });
    cls.statics.set('currentThread', function () { return simCurrent || mainThread; });
    cls.statics.set('activeCount', function () { return 1; });
    return cls;
  }
  const ThreadClass = makeThreadClass();

  /* ---------- 线程池 / Future ---------- */
  function makeExecutor(kind, size) { return { __kind: 'executor', kind: kind, size: size || 1, shutdown: false }; }
  function makeFuture(value) { return { __kind: 'future', value: value, done: true }; }
  function makeExecutorMethod(exec, name, args) {
    switch (name) {
      case 'submit': {
        const t = args[0];
        const fake = { __cls: ThreadClass, __name: 'pool-' + (++poolSeq) + '-thread-1', __alive: true };
        const prev = simCurrent;
        simCurrent = fake;
        try {
          const v = (typeof t === 'function') ? t() : (t && typeof t.run === 'function' ? t.run() : undefined);
          exec.taskCount = (exec.taskCount || 0) + 1;
          return makeFuture(v === undefined ? null : v);
        } finally { simCurrent = prev; }
      }
      case 'execute': {
        const t = args[0];
        const fake = { __cls: ThreadClass, __name: 'pool-' + (++poolSeq) + '-thread-1', __alive: true };
        const prev = simCurrent;
        simCurrent = fake;
        try {
          if (typeof t === 'function') t(); else if (t && typeof t.run === 'function') t.run();
          exec.taskCount = (exec.taskCount || 0) + 1;
          return undefined;
        } finally { simCurrent = prev; }
      }
      case 'invokeAll': {
        const list = args[0];
        const out = R.makeList([]);
        if (list && list.__kind === 'list') list.a.forEach(function (t) { out.a.push(makeFuture(typeof t === 'function' ? t() : t.run())); });
        return out;
      }
      case 'shutdown': exec.shutdown = true; return undefined;
      case 'shutdownNow': exec.shutdown = true; return R.makeList([]);
      case 'isShutdown': return exec.shutdown;
      case 'isTerminated': return true;
      case 'awaitTermination': return true;
      case 'getPoolSize': return exec.size || 1;
      case 'getActiveCount': return 0;
      case 'getTaskCount': return exec.taskCount || 0;
      case 'getCompletedTaskCount': return exec.taskCount || 0;
      case 'getQueue': return exec.queue || makeQueue([], 0);
      case 'purge': return undefined;
      default: throw exc('Error', '暂不支持的线程池方法：' + name);
    }
  }
  function futureMethod(f, name) {
    switch (name) {
      case 'get': return f.value;
      case 'isDone': return true;
      case 'cancel': return false;
      case 'isCancelled': return false;
      default: throw exc('Error', '暂不支持的 Future 方法：' + name);
    }
  }

  /* ---------- 原子类 ---------- */
  function makeAtomic(v) { return { __kind: 'atomic', v: num(v) }; }
  function atomicMethod(a, name, args) {
    switch (name) {
      case 'get': return a.v;
      case 'set': a.v = num(args[0]); return undefined;
      case 'incrementAndGet': a.v = a.v + 1; return a.v;
      case 'getAndIncrement': { const old = a.v; a.v = a.v + 1; return old; }
      case 'decrementAndGet': a.v = a.v - 1; return a.v;
      case 'getAndDecrement': { const old = a.v; a.v = a.v - 1; return old; }
      case 'addAndGet': a.v = a.v + num(args[0]); return a.v;
      case 'getAndAdd': { const old = a.v; a.v = a.v + num(args[0]); return old; }
      case 'compareAndSet': { const expect = num(args[0]); if (a.v === expect) { a.v = num(args[1]); return true; } return false; }
      case 'toString': return String(a.v);
      default: throw exc('Error', '暂不支持的原子类方法：' + name);
    }
  }

  /* ---------- 队列 / 并发容器 ---------- */
  function makeQueue(arr, cap) { return { __kind: 'queue', a: arr || [], cap: cap || 0 }; }
  function queueMethod(q, name, args) {
    switch (name) {
      case 'put': case 'add': case 'offer': q.a.push(args[0]); return true;
      case 'take': case 'poll': case 'remove': return q.a.length ? q.a.shift() : null;
      case 'peek': case 'element': return q.a.length ? q.a[0] : null;
      case 'size': return q.a.length;
      case 'isEmpty': return q.a.length === 0;
      case 'clear': q.a.length = 0; return undefined;
      case 'remainingCapacity': return q.cap ? Math.max(0, q.cap - q.a.length) : 1024;
      default: throw exc('Error', '暂不支持的队列方法：' + name);
    }
  }

  /* ---------- 锁 / 同步工具 ---------- */
  function makeLock() { return { __kind: 'lock', held: false }; }
  function lockMethod(l, name) {
    switch (name) {
      case 'lock': case 'unlock': case 'lockInterruptibly': return undefined;
      case 'tryLock': return true;
      case 'isLocked': return l.held;
      case 'newCondition': return { __kind: 'condition' };
      default: throw exc('Error', '暂不支持的锁方法：' + name);
    }
  }
  function condMethod(c, name) {
    switch (name) {
      case 'await': case 'signal': case 'signalAll': return undefined;
      default: throw exc('Error', '暂不支持的 Condition 方法：' + name);
    }
  }
  function makeLatch(n) { return { __kind: 'latch', n: num(n) }; }
  function latchMethod(l, name) {
    switch (name) {
      case 'countDown': if (l.n > 0) l.n--; return undefined;
      case 'getCount': return l.n;
      case 'await': return true;
      default: throw exc('Error', '暂不支持的 CountDownLatch 方法：' + name);
    }
  }
  function makeSemaphore(n) { return { __kind: 'semaphore', n: num(n) }; }
  function semMethod(s, name) {
    switch (name) {
      case 'acquire': if (s.n > 0) s.n--; return undefined;
      case 'release': s.n++; return undefined;
      case 'availablePermits': return s.n;
      case 'tryAcquire': if (s.n > 0) { s.n--; return true; } return false;
      default: throw exc('Error', '暂不支持的 Semaphore 方法：' + name);
    }
  }

  R.kindMethods = {
    executor: makeExecutorMethod,
    future: futureMethod,
    atomic: atomicMethod,
    queue: queueMethod,
    lock: lockMethod,
    condition: condMethod,
    latch: latchMethod,
    semaphore: semMethod
  };

  /* ---------- 注册构造器 ---------- */
  const extraCtors = {
    'Thread': function (task, name) { const inst = { __cls: ThreadClass, __task: task || null, __name: name ? String(name) : 'Thread-' + Math.floor(Math.random() * 1000) }; return inst; },
    'ReentrantLock': function () { return makeLock(); },
    'CountDownLatch': function (n) { return makeLatch(n); },
    'Semaphore': function (n) { return makeSemaphore(n); },
    'AtomicInteger': function (v) { return makeAtomic(v === undefined ? 0 : v); },
    'AtomicLong': function (v) { return makeAtomic(v === undefined ? 0 : v); },
    'AtomicBoolean': function (v) { return { __kind: 'atomic', v: v ? 1 : 0 }; },
    'LinkedBlockingQueue': function (cap) { return makeQueue([], cap); },
    'ArrayBlockingQueue': function (cap) { return makeQueue([], cap); },
    'ConcurrentLinkedQueue': function () { return makeQueue([], 0); },
    'PriorityQueue': function () { return makeQueue([], 0); },
    'ConcurrentHashMap': function () { return R.makeMap(); },
    'CopyOnWriteArrayList': function () { return R.makeList([]); },
    'CopyOnWriteArraySet': function () { return R.makeSet(); },
    'StringBuffer': function (s) { return R.newSB(s); }
    ,
    'ThreadPoolExecutor': function (core, max, keep, unit, queue, factory, handler) {
      const exec = makeExecutor('manual', core);
      exec.queue = queue;
      return exec;
    },
    'CallerRunsPolicy': function () { return { __kind: 'reject', name: 'CallerRunsPolicy' }; },
    'AbortPolicy': function () { return { __kind: 'reject', name: 'AbortPolicy' }; },
    'DiscardPolicy': function () { return { __kind: 'reject', name: 'DiscardPolicy' }; },
    'DiscardOldestPolicy': function () { return { __kind: 'reject', name: 'DiscardOldestPolicy' }; }
  };

  const extraStatics = {
    'Character': {
      isDigit: function (c) { return /^[0-9]$/.test(String(c).charAt(0)); },
      isLetter: function (c) { return /^[A-Za-z\u4e00-\u9fa5]$/.test(String(c).charAt(0)); },
      isLetterOrDigit: function (c) { const ch = String(c).charAt(0); return /^[A-Za-z0-9\u4e00-\u9fa5]$/.test(ch); },
      isUpperCase: function (c) { const ch = String(c).charAt(0); return ch >= 'A' && ch <= 'Z'; },
      isLowerCase: function (c) { const ch = String(c).charAt(0); return ch >= 'a' && ch <= 'z'; },
      isWhitespace: function (c) { return /^\s$/.test(String(c).charAt(0)); },
      toUpperCase: function (c) { return String(c).charAt(0).toUpperCase(); },
      toLowerCase: function (c) { return String(c).charAt(0).toLowerCase(); },
      getNumericValue: function (c) { const ch = String(c).charAt(0); return ch >= '0' && ch <= '9' ? ch.charCodeAt(0) - 48 : -1; },
      toString: function (c) { return String(c).charAt(0); },
      compare: function (a, b) { return String(a).charCodeAt(0) - String(b).charCodeAt(0); }
    },
    'Objects': {
      equals: function (a, b) { return a === b || (a !== null && b !== null && String(a) === String(b)); },
      hash: function () {
        let h = 1;
        Array.prototype.slice.call(arguments).forEach(function (v) {
          let part = 0;
          if (typeof v === 'number') part = Math.trunc(v);
          else if (typeof v === 'boolean') part = v ? 1231 : 1237;
          else if (v === null || v === undefined) part = 0;
          else { const str = String(v); for (let i = 0; i < str.length; i++) part = (31 * part + str.charCodeAt(i)) | 0; }
          h = (31 * h + part) | 0;
        });
        return h;
      },
      isNull: function (v) { return v === null || v === undefined; },
      nonNull: function (v) { return !(v === null || v === undefined); },
      requireNonNull: function (v, msg) { if (v === null || v === undefined) throw exc('NullPointerException', msg ? String(msg) : '对象不能为空'); return v; },
      toString: function (v, def) { return (v === null || v === undefined) ? String(def) : String(v); }
    },
    'Executors': {
      newFixedThreadPool: function (n) { return makeExecutor('fixed', n); },
      newSingleThreadExecutor: function () { return makeExecutor('single', 1); },
      newCachedThreadPool: function () { return makeExecutor('cached', 0); },
      newScheduledThreadPool: function (n) { return makeExecutor('scheduled', n); }
      ,
      defaultThreadFactory: function () { return { __kind: 'factory', name: 'default' }; }
    },
    'TimeUnit': {
      SECONDS: { toMillis: function (n) { return num(n) * 1000; }, toSeconds: function (n) { return num(n); } },
      MILLISECONDS: { toMillis: function (n) { return num(n); }, toSeconds: function (n) { return num(n) / 1000; } },
      MINUTES: { toMillis: function (n) { return num(n) * 60000; }, toSeconds: function (n) { return num(n) * 60; } }
    },
    'Thread': ThreadClass
  };

  // 让解释器认识这些类型
  R.extraCtors = extraCtors;
  Object.keys(extraStatics).forEach(function (k) { R.builtins[k] = extraStatics[k]; });
  R.builtins['Thread'] = ThreadClass;
  R.exceptionClasses['Thread'] = ThreadClass;

  // 让「new XXX()」能找到这些构造器
  const origCtors = R.builtinCtors || {};
  R.builtinCtors = Object.assign({}, origCtors, extraCtors);
})(typeof window !== 'undefined' ? window : globalThis);
/* =============================================================
   运行器扩展：IO 流（字节流 / 转换流 / 数据流 / 对象序列化 / File / Files）
   说明：浏览器里没有真实文件系统，这里用内存文件系统模拟；
   字节数组按“字符编码”近似模拟，读写可以正确往返，具体字节数请到 IDEA 验证。
   ============================================================= */
(function (root) {
  const R = root.__JAVA_RT;
  const R2 = root.__JAVA_RT2;
  const num = R.num, exc = R.exc;
  const FS = root.JavaRunner.__fs;
  const objStore = [];

  function pathOf(p) {
    if (p === null || p === undefined) return 'null';
    if (p.__kind === 'file' || p.__kind === 'path') return p.path || p.p;
    return String(p);
  }
  function strOf(v) { return (v && v.__kind === 'strbox') ? v.s : String(v == null ? '' : v); }

  /* ---------- 字节流 ---------- */
  function makeFos(p, append) {
    const path = pathOf(p);
    if (!append) FS[path] = '';
    else if (FS[path] === undefined) FS[path] = '';
    return { __kind: 'fos', path: path };
  }
  function fosMethod(s, name, args) {
    if (name === 'write') {
      if (args[0] && args[0].__kind === 'array') {
        FS[s.path] = (FS[s.path] || '') + args[0].a.map(function (n) { return String.fromCharCode(num(n)); }).join('');
      } else {
        FS[s.path] = (FS[s.path] || '') + String.fromCharCode(num(args[0]));
      }
      return undefined;
    }
    if (name === 'flush' || name === 'close') return undefined;
    throw exc('Error', '暂不支持的输出流方法：' + name);
  }
  function makeFis(p) { return { __kind: 'fis', path: pathOf(p), pos: 0 }; }
  function fisMethod(s, name, args) {
    const data = FS[s.path] === undefined ? '' : FS[s.path];
    if (name === 'read') {
      if (args[0] && args[0].__kind === 'array') {
        const buf = args[0];
        let count = 0;
        while (count < buf.a.length && s.pos < data.length) { buf.a[count++] = data.charCodeAt(s.pos++); }
        return count === 0 ? -1 : count;
      }
      if (s.pos >= data.length) return -1;
      return data.charCodeAt(s.pos++);
    }
    if (name === 'available') return data.length - s.pos;
    if (name === 'close' || name === 'skip') return undefined;
    throw exc('Error', '暂不支持的输入流方法：' + name);
  }

  /* ---------- 转换流 ---------- */
  function makeIsr(inn) {
    const data = FS[pathOf(inn)] === undefined ? '' : FS[pathOf(inn)];
    const parts = data.split('\n'); while (parts.length && parts[parts.length - 1] === '') parts.pop(); return { __kind: 'isr', lines: parts, idx: 0 };
  }
  function isrMethod(s, name) {
    if (name === 'readLine') { if (s.idx < s.lines.length) return s.lines[s.idx++]; return null; }
    if (name === 'close') return undefined;
    if (name === 'ready') return true;
    throw exc('Error', '暂不支持的 InputStreamReader 方法：' + name);
  }
  function makeOsw(out) { return { __kind: 'osw', path: pathOf(out) }; }
  function oswMethod(s, name, args) {
    if (name === 'write') { FS[s.path] = (FS[s.path] || '') + strOf(args[0]); return undefined; }
    if (name === 'flush' || name === 'close') return undefined;
    throw exc('Error', '暂不支持的 OutputStreamWriter 方法：' + name);
  }
  function makePrintWriter(w) { return { __kind: 'pw', w: w }; }
  function pwMethod(p, name, args) {
    const target = p.w;
    if (name === 'println' || name === 'print' || name === 'write') {
      const text = strOf(args[0]);
      if (target && target.__kind === 'osw') { FS[target.path] = (FS[target.path] || '') + text + (name === 'println' ? '\n' : ''); }
      else if (target && target.__kind === 'bwriter') { R.bWriterMethod(target, 'write', [text]); if (name === 'println') R.bWriterMethod(target, 'newLine', []); }
      else if (target && target.__kind === 'fos') { R.kindMethods.fos(target, 'write', [text]); if (name === 'println') R.kindMethods.fos(target, 'write', ['\n']); }
      return undefined;
    }
    if (name === 'flush' || name === 'close') return undefined;
    throw exc('Error', '暂不支持的 PrintWriter 方法：' + name);
  }

  /* ---------- 数据流 ---------- */
  function makeDos(out) { return { __kind: 'dos', path: pathOf(out), lines: [] }; }
  function dosMethod(s, name, args) {
    const v = args[0];
    let text;
    if (name === 'writeInt' || name === 'writeLong' || name === 'writeByte') text = String(num(v));
    else if (name === 'writeDouble' || name === 'writeFloat') text = String(num(v));
    else if (name === 'writeBoolean') text = String(Boolean(v));
    else if (name === 'writeUTF') text = strOf(v);
    else if (name === 'writeChars') text = strOf(v);
    else if (name === 'flush' || name === 'close') { FS[s.path] = s.lines.join('\n'); return undefined; }
    else throw exc('Error', '暂不支持的 DataOutputStream 方法：' + name);
    s.lines.push(text);
    return undefined;
  }
  function makeDis(inn) {
    const data = FS[pathOf(inn)] === undefined ? '' : FS[pathOf(inn)];
    const parts = data.split('\n'); while (parts.length && parts[parts.length - 1] === '') parts.pop(); return { __kind: 'dis', lines: parts, idx: 0 };
  }
  function disMethod(s, name) {
    const next = function () { return s.idx < s.lines.length ? s.lines[s.idx++] : null; };
    if (name === 'readInt' || name === 'readLong' || name === 'readByte') { const v = next(); return parseInt(v, 10); }
    if (name === 'readDouble' || name === 'readFloat') { const v = next(); return parseFloat(v); }
    if (name === 'readBoolean') { const v = next(); return v === 'true'; }
    if (name === 'readUTF') return next();
    if (name === 'close') return undefined;
    throw exc('Error', '暂不支持的 DataInputStream 方法：' + name);
  }

  /* ---------- 对象序列化 ---------- */
  function makeOos(out) { return { __kind: 'oos', path: pathOf(out) }; }
  function oosMethod(s, name, args) {
    if (name === 'writeObject') { objStore.push(args[0]); return undefined; }
    if (name === 'flush' || name === 'close') return undefined;
    throw exc('Error', '暂不支持的 ObjectOutputStream 方法：' + name);
  }
  function makeOis(inn) { return { __kind: 'ois', idx: 0 }; }
  function oisMethod(s, name) {
    if (name === 'readObject') { if (s.idx < objStore.length) return objStore[s.idx++]; return null; }
    if (name === 'close') return undefined;
    throw exc('Error', '暂不支持的 ObjectInputStream 方法：' + name);
  }

  /* ---------- File 扩展方法 ---------- */
  const fileExtra = {
    mkdirs: function () { return true; },
    mkdir: function () { return true; },
    createNewFile: function (f) { if (FS[f.path] === undefined) { FS[f.path] = ''; return true; } return false; },
    isDirectory: function () { return false; },
    isFile: function (f) { return FS[f.path] !== undefined; },
    list: function () { return R.makeArray([], 'String'); },
    listFiles: function () { return R.makeArray([], 'File'); },
    getPath: function (f) { return f.path; },
    getAbsolutePath: function (f) { return f.path; },
    getParent: function () { return null; },
    canRead: function () { return true; },
    canWrite: function () { return true; },
    deleteOnExit: function () { return undefined; },
    renameTo: function () { return false; },
    toString: function (f) { return f.path; }
  };

  /* ---------- Files 扩展 ---------- */
  const filesExtra = {
    readString: function (p) { return FS[pathOf(p)] === undefined ? '' : FS[pathOf(p)]; },
    copy: function (src, dst) {
      const s = pathOf(src), d = pathOf(dst);
      if (FS[s] === undefined) throw exc('IOException', '源文件不存在：' + s);
      FS[d] = FS[s];
      return R.makePath ? R.makePath(d) : { __kind: 'path', p: d };
    },
    deleteIfExists: function (p) { const k = pathOf(p); if (FS[k] !== undefined) { delete FS[k]; return true; } return false; },
    delete: function (p) { const k = pathOf(p); if (FS[k] === undefined) throw exc('IOException', '文件不存在：' + k); delete FS[k]; return undefined; },
    createDirectories: function () { return undefined; },
    createFile: function (p) { const k = pathOf(p); if (FS[k] === undefined) FS[k] = ''; return { __kind: 'path', p: k }; },
    newBufferedReader: function (p) { return R.newBReader(pathOf(p)); },
    newBufferedWriter: function (p) { FS[pathOf(p)] = ''; return R.newBWriter(R.newFileWriter(pathOf(p), true)); },
    lines: function (p) { const c = FS[pathOf(p)] || ''; const parts = c === '' ? [] : c.split('\n'); while (parts.length && parts[parts.length - 1] === '') parts.pop(); return R.makeList(parts); },
    write: function (p, bytes) {
      const k = pathOf(p);
      FS[k] = bytes && bytes.__kind === 'array' ? bytes.a.map(function (n) { return String.fromCharCode(num(n)); }).join('') : String(bytes);
      return undefined;
    },
    readAllBytes: function (p) {
      const c = FS[pathOf(p)] || '';
      return R.makeArray(c.split('').map(function (ch) { return ch.charCodeAt(0); }), 'byte');
    }
  };

  /* ---------- 注册 ---------- */
  R.kindMethods.fos = fosMethod;
  R.kindMethods.fis = fisMethod;
  R.kindMethods.isr = isrMethod;
  R.kindMethods.osw = oswMethod;
  R.kindMethods.pw = pwMethod;
  R.kindMethods.dos = dosMethod;
  R.kindMethods.dis = disMethod;
  R.kindMethods.oos = oosMethod;
  R.kindMethods.ois = oisMethod;
  R.kindMethods.freader = function (r, name) {
    if (r.data === undefined) { r.data = FS[r.path] === undefined ? '' : FS[r.path]; r.pos = 0; }
    if (name === 'read') { if (r.pos >= r.data.length) return -1; return r.data.charCodeAt(r.pos++); }
    if (name === 'close') return undefined;
    if (name === 'ready') return true;
    throw exc('Error', '暂不支持的 FileReader 方法：' + name);
  };

  R.builtinCtors = Object.assign({}, R.builtinCtors, {
    'FileOutputStream': makeFos,
    'FileInputStream': makeFis,
    'InputStreamReader': makeIsr,
    'OutputStreamWriter': makeOsw,
    'PrintWriter': makePrintWriter,
    'DataOutputStream': makeDos,
    'DataInputStream': makeDis,
    'ObjectOutputStream': makeOos,
    'ObjectInputStream': makeOis,
    'BufferedInputStream': function (inn) { return inn; },
    'BufferedOutputStream': function (out) { return out; },
    'ByteArrayOutputStream': function () { return { __kind: 'baos', s: '' }; },
    'ByteArrayInputStream': function (b) { return { __kind: 'fis', path: '__mem__', pos: 0, mem: b }; }
  });
  R.kindMethods.baos = function (s, name, args) {
    if (name === 'write') { s.s += (args[0] && args[0].__kind === 'array') ? args[0].a.map(function (n) { return String.fromCharCode(num(n)); }).join('') : String.fromCharCode(num(args[0])); return undefined; }
    if (name === 'toString') return s.s;
    if (name === 'size') return s.s.length;
    if (name === 'close' || name === 'flush') return undefined;
    throw exc('Error', '暂不支持的 ByteArrayOutputStream 方法：' + name);
  };

  R.builtins['StandardCharsets'] = { UTF_8: { __kind: 'charset', name: 'UTF-8' }, ISO_8859_1: { __kind: 'charset', name: 'ISO-8859-1' }, GBK: { __kind: 'charset', name: 'GBK' } };
  R.builtins['Charset'] = { forName: function (n) { return { __kind: 'charset', name: String(n) }; } };
  Object.assign(R.builtins['Files'], filesExtra);
  R.fileExtra = fileExtra;
})(typeof window !== 'undefined' ? window : globalThis);






