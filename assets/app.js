/* =============================================================
   从 Java 到移动端 · 学习软件
   交互逻辑：课程浏览、测验判分、练习关键点检查、进度与 XP
   ============================================================= */

const STORE_KEY = 'java-mobile-learn.progress.v1';

/* ---------- 组装课程数据 ---------- */
const MODULES = [
  {
    id: 'java',
    title: '第一阶段 · Java 语言基础',
    desc: '从环境搭建讲到 IO 流、集合与多线程，把编程思维、面向对象和并发基础彻底打牢。16 章，约 34 个练习。',
    chapters: [].concat(
      window.COURSE_JAVA_PART1 || [],
      window.COURSE_JAVA_PART2 || [],
      window.COURSE_JAVA_PART3 || [],
      window.COURSE_JAVA_PART4 || [],
      window.COURSE_JAVA_PART5 || [],
      window.COURSE_JAVA_PART6 || [],
      window.COURSE_JAVA_PART7 || [],
      window.COURSE_JAVA_PART8 || []
    )
  },
  {
    id: 'android',
    title: '第二阶段 · 移动端（Android）开发',
    desc: '从工程结构讲到网络请求与打包发布，最后做出能装到手机上的完整 App。7 章。',
    chapters: [].concat(
      window.COURSE_MOBILE_PART1 || [],
      window.COURSE_MOBILE_PART2 || [],
      window.COURSE_MOBILE_PART3 || [],
      window.COURSE_MOBILE_PART4 || [],
      window.COURSE_MOBILE_PART5 || [],
      window.COURSE_MOBILE_PART6 || [],
      window.COURSE_MOBILE_PART7 || []
    )
  }
];

const PROJECTS = window.PROJECTS || [];
const CHEATSHEET = window.CHEATSHEET || { sections: [] };

const ALL_CHAPTERS = [];
MODULES.forEach(mod => {
  mod.chapters.forEach(ch => {
    ch.moduleId = mod.id;
    ch.moduleTitle = mod.title;
    ch.order = ALL_CHAPTERS.length + 1;
    ALL_CHAPTERS.push(ch);
  });
});

function chapterById(id) { return ALL_CHAPTERS.find(c => c.id === id); }
function projectById(id) { return PROJECTS.find(p => p.id === id); }

/* ---------- 进度存储 ---------- */
let memoryStore = null;

function defaultState() {
  return {
    version: 1,
    theme: 'dark',
    xp: 0,
    chapters: {},
    exercises: {},
    projects: {},
    lastChapterId: null,
    library: {},
    libraryAuto: true,
    updatedAt: Date.now()
  };
}

function loadState() {
  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    return Object.assign(defaultState(), parsed);
  } catch (e) {
    console.warn('本地存储不可用，本次进度只保存在内存中', e);
    return memoryStore || defaultState();
  }
}

function saveState() {
  state.updatedAt = Date.now();
  try {
    window.localStorage.setItem(STORE_KEY, JSON.stringify(state));
  } catch (e) {
    memoryStore = state;   // file:// 场景下 localStorage 可能被禁用，退化到内存
  }
}

let state = loadState();
/* ---------- 我的类库：多文件协作（跨文件调用类与方法） ---------- */
// 数据结构：state.library = { "Calculator.java": { code: "类的代码", updatedAt: 时间戳 } }
// 每个文件就相当于真实项目里一个独立的 .java 源文件，文件名必须和 public 类名一致。
function libraryEntries() {
  if (!state.library || typeof state.library !== 'object') state.library = {};
  return Object.keys(state.library).map(function (name) {
    const rec = state.library[name] || {};
    return { name: name, code: String(rec.code == null ? '' : rec.code), updatedAt: rec.updatedAt || 0 };
  }).sort(function (a, b) { return a.name < b.name ? -1 : (a.name > b.name ? 1 : 0); });
}

// 返回“运行时自动附带”的类库文件；关掉开关、或类库为空时返回空数组
function getLibraryFiles() {
  if (state.libraryAuto === false) return [];
  return libraryEntries()
    .filter(function (f) { return f.code.trim() !== ''; })
    .map(function (f) { return { name: f.name, code: f.code }; });
}

// 校验文件名：必须长得像 “Calculator.java”，因为 Java 要求 public 类名和文件名一致
function libraryFileNameOk(name) {
  const n = String(name || '').trim();
  if (!n) return '文件名不能为空。';
  if (!/^[A-Za-z_$][A-Za-z0-9_$]*\.java$/.test(n)) {
    return '文件名要写成「类名.java」，例如 Calculator.java：只能由字母、数字、下划线组成，并以 .java 结尾。';
  }
  return null;
}

function upsertLibraryFile(name, code) {
  if (!state.library || typeof state.library !== 'object') state.library = {};
  state.library[String(name).trim()] = { code: String(code == null ? '' : code), updatedAt: Date.now() };
  saveState();
}

function removeLibraryFile(name) {
  if (state.library && state.library[name]) { delete state.library[name]; saveState(); }
}

// 语法体检：把某个文件当成“依赖文件”跑一次最小编译，看它能不能通过解析。
// 结果按内容缓存，避免每次渲染都重复解析。
let LIB_PROBLEM_CACHE = { sig: '', list: [] };
function libraryProblems(files) {
  const list = (files || []).filter(function (f) { return f && f.code && String(f.code).trim(); });
  if (!list.length) return [];
  const sig = list.map(function (f) { return f.name + '\u0000' + f.code; }).join('\u0001');
  if (LIB_PROBLEM_CACHE.sig === sig) return LIB_PROBLEM_CACHE.list;
  const bad = [];
  if (window.JavaRunner && typeof window.JavaRunner.run === 'function') {
    const probe = 'public class LibraryProbe { public static void main(String[] args) { } }';
    list.forEach(function (f) {
      let res;
      try { res = window.JavaRunner.run(probe, '', { files: [{ name: f.name, code: f.code }] }); }
      catch (e) { res = { ok: false, error: String(e && e.message ? e.message : e) }; }
      if (res && !res.ok) bad.push({ name: f.name, error: res.error || '未知错误' });
    });
  }
  LIB_PROBLEM_CACHE = { sig: sig, list: bad };
  return bad;
}

// 某个练习运行时要用到的依赖文件 = 我的类库 + 练习自带文件（同名时以练习自带的为准）
function runFilesForExercise(ex) {
  const provided = ((ex && ex.files) || []).filter(function (f) { return f && f.name && f.code; });
  const names = provided.map(function (f) { return f.name; });
  const files = [];
  getLibraryFiles().forEach(function (f) { if (names.indexOf(f.name) < 0) files.push(f); });
  provided.forEach(function (f) { files.push({ name: f.name, code: f.code }); });
  return files;
}

// 依赖文件面板：让学习者一眼看到“这次运行会把哪些文件一起编译”
function dependencyPanelHtml(ex) {
  const provided = ((ex && ex.files) || []).filter(function (f) { return f && f.name && f.code; });
  const lib = libraryEntries().filter(function (f) { return f.code.trim() !== ''; });
  if (!provided.length && !lib.length) return '';
  const libOn = state.libraryAuto !== false;

  let html = '<div class="dep-panel">';
  html += '<div class="row between" style="gap:8px">' +
    '<b style="font-size:13.5px">🧩 依赖文件（跨文件调用别的类）</b>' +
    '<button class="btn sm ghost" data-libopen="1">管理我的类库</button></div>';

  if (provided.length) {
    html += '<div class="small muted mt-1">这个练习自带下面的辅助类文件，运行时会和你的代码一起编译。你只要在代码里写 <code>类名.方法名(...)</code> 就能调用它们：</div>';
    html += '<div class="chip-list mt-1">' + provided.map(function (f) {
      return '<span class="chip done">' + esc(f.name) + '</span>';
    }).join('') + '</div>';
    provided.forEach(function (f) {
      html += '<details class="dep-file"><summary>' + esc(f.name) + '（点开看代码）</summary>' + codeBlock(f.code, f.name, {}) + '</details>';
    });
  }

  if (lib.length) {
    const problems = libraryProblems(lib);
    const badNames = problems.map(function (p) { return p.name; });
    html += '<label class="dep-toggle mt-2"><input type="checkbox" data-libtoggle="1"' + (libOn ? ' checked' : '') + ' /> ' +
      '运行代码时自动带上「我的类库」（共 ' + lib.length + ' 个文件）</label>';
    html += '<div class="chip-list mt-1">' + lib.map(function (f) {
      const bad = badNames.indexOf(f.name) >= 0;
      return '<span class="chip' + (bad ? ' bad' : (libOn ? '' : ' off')) + '">' + esc(f.name) + '</span>';
    }).join('') + '</div>';
    if (problems.length) {
      html += '<div class="callout warn" style="margin:8px 0 0">类库里有文件语法有问题，会导致所有运行失败，请到「我的类库」里修复：' +
        problems.map(function (p) { return '<div class="small">· ' + esc(p.name + '：' + p.error) + '</div>'; }).join('') + '</div>';
    } else if (!libOn) {
      html += '<div class="small faint mt-1">当前已关闭自动附带。勾选上面的选项，就能在本次运行中调用类库里的类。</div>';
    }
  }
  return html + '</div>';
}

function chapterState(id) {
  if (!state.chapters[id]) {
    state.chapters[id] = { completed: false, quiz: { answers: {}, correct: 0, total: 0 }, checks: {} };
  }
  return state.chapters[id];
}

function exerciseState(id) {
  if (!state.exercises[id]) {
    state.exercises[id] = { code: '', passed: false, checkedAt: 0, showSolution: false };
  }
  return state.exercises[id];
}

function projectState(id) {
  if (!state.projects[id]) state.projects[id] = { done: false, tasks: {} };
  return state.projects[id];
}

function addXp(n, why) {
  state.xp += n;
  saveState();
  toast('+' + n + ' 经验' + (why ? ' · ' + why : ''), 'ok');
  renderChrome();
}

function levelInfo() {
  const level = Math.floor(state.xp / 200) + 1;
  const titles = ['编程新手', '语法见习', '代码学徒', '面向对象学徒', 'Android 学徒', '界面工程师', '数据工程师', '网络工程师', '独立开发者', '全栈小能手'];
  return {
    level,
    title: titles[Math.min(level - 1, titles.length - 1)],
    inLevel: state.xp % 200,
    percent: ((state.xp % 200) / 200) * 100
  };
}

function chapterDone(id) { return !!(state.chapters[id] && state.chapters[id].completed); }

function overallProgress() {
  const total = ALL_CHAPTERS.length + PROJECTS.length;
  const doneChapters = ALL_CHAPTERS.filter(c => chapterDone(c.id)).length;
  const doneProjects = PROJECTS.filter(p => state.projects[p.id] && state.projects[p.id].done).length;
  const done = doneChapters + doneProjects;
  return { done, total, percent: total ? Math.round((done / total) * 100) : 0, doneChapters, doneProjects };
}

function exerciseStats() {
  let passed = 0, total = 0;
  ALL_CHAPTERS.forEach(ch => {
    (ch.exercises || []).forEach(ex => {
      total++;
      if (state.exercises[ex.id] && state.exercises[ex.id].passed) passed++;
    });
  });
  return { passed, total };
}

function quizStats() {
  let correct = 0, answered = 0, total = 0;
  ALL_CHAPTERS.forEach(ch => {
    const qs = ch.quiz || [];
    total += qs.length;
    const cs = state.chapters[ch.id];
    if (cs) { correct += cs.quiz.correct || 0; answered += Object.keys(cs.quiz.answers || {}).length; }
  });
  return { correct, answered, total };
}

/* ---------- 小工具 ---------- */
function esc(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function inline(s) {
  let out = esc(s);
  out = out.replace(/`([^`]+)`/g, '<code>$1</code>');
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  return out;
}

function qs(sel, root) { return (root || document).querySelector(sel); }
function qsa(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

function el(html) {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

function toast(msg, kind) {
  let host = qs('.toast-host');
  if (!host) { host = el('<div class="toast-host"></div>'); document.body.appendChild(host); }
  const node = el('<div class="toast ' + (kind || '') + '">' + esc(msg) + '</div>');
  host.appendChild(node);
  setTimeout(() => { node.style.opacity = '0'; node.style.transition = 'opacity .3s'; }, 2200);
  setTimeout(() => node.remove(), 2600);
}

function confirmDialog(title, body, onOk, okText) {
  const overlay = el(
    '<div class="overlay"><div class="modal">' +
      '<div class="card-title">' + esc(title) + '</div>' +
      '<p class="muted small">' + inline(body) + '</p>' +
      '<div class="row" style="justify-content:flex-end">' +
        '<button class="btn ghost" data-act="cancel">取消</button>' +
        '<button class="btn primary" data-act="ok">' + esc(okText || '确认') + '</button>' +
      '</div>' +
    '</div></div>'
  );
  document.body.appendChild(overlay);
  qs('[data-act="cancel"]', overlay).onclick = () => overlay.remove();
  qs('[data-act="ok"]', overlay).onclick = () => { overlay.remove(); onOk(); };
  overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
}

/* ---------- 代码高亮 ---------- */
const JAVA_KEYWORDS = 'abstract|assert|boolean|break|byte|case|catch|char|class|const|continue|default|do|double|else|enum|extends|final|finally|float|for|goto|if|implements|import|instanceof|int|interface|long|native|new|package|private|protected|public|record|return|short|static|strictfp|super|switch|synchronized|this|throw|throws|transient|try|var|void|volatile|while|true|false|null';

function highlight(code) {
  let text = esc(code);
  const re = new RegExp(
    '(\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/)|("(?:\\\\.|[^"\\\\])*")|(\'(?:\\\\.|[^\'\\\\])*\')|(@\\w+)|\\b(\\d+\\.?\\d*[fFdDlL]?)\\b|\\b(' + JAVA_KEYWORDS + ')\\b|\\b([A-Z][A-Za-z0-9_]*)\\b|\\b(\\w+)(?=\\s*\\()',
    'g'
  );
  return text.replace(re, function (m, com, str, chr, ann, num, kw, typ, fn) {
    if (com) return '<span class="tok-com">' + com + '</span>';
    if (str) return '<span class="tok-str">' + str + '</span>';
    if (chr) return '<span class="tok-str">' + chr + '</span>';
    if (ann) return '<span class="tok-ann">' + ann + '</span>';
    if (num) return '<span class="tok-num">' + num + '</span>';
    if (kw) return '<span class="tok-key">' + kw + '</span>';
    if (typ) return '<span class="tok-typ">' + typ + '</span>';
    if (fn) return '<span class="tok-fn">' + fn + '</span>';
    return m;
  });
}

function codeBlock(code, title, opts) {
  opts = opts || {};
  const actions = [];
  if (opts.runnable) {
    actions.push('<button class="btn sm primary" data-lessonrun="' + esc(opts.runKey) + '">▶ 运行</button>');
  }
  actions.push('<button class="btn sm ghost" data-copy="1">复制</button>');
  const head = (title || opts.runnable)
    ? '<div class="code-head"><span>' + esc(title || '示例代码') + '</span><span class="spacer"></span>' + actions.join('') + '</div>'
    : '';
  let html = '<div class="code-block">' + head + '<pre><code>' + highlight(code) + '</code></pre></div>';
  if (opts.runnable) {
    html += '<div class="lesson-run">';
    if (opts.needsInput) {
      html += '<div class="small faint">这段示例需要键盘输入，请在下面按行填写数据后再运行：</div>' +
        '<textarea class="editor" spellcheck="false" style="min-height:64px" data-lessonin="' + esc(opts.runKey) + '">' + esc(opts.inputHint || '') + '</textarea>';
    }
    html += '<div class="run-out-box" data-lessonout="' + esc(opts.runKey) + '" style="display:none"></div></div>';
  }
  return html;
}

function tableBlock(head, rows) {
  let html = '<div class="table-wrap"><table><thead><tr>';
  head.forEach(h => { html += '<th>' + inline(h) + '</th>'; });
  html += '</tr></thead><tbody>';
  rows.forEach(r => {
    html += '<tr>';
    r.forEach(cell => { html += '<td>' + inline(cell) + '</td>'; });
    html += '</tr>';
  });
  return html + '</tbody></table></div>';
}

/* ---------- 讲解示例的运行支持 ---------- */
let LESSON_RUN = {};

function javaLike(code) {
  if (!code) return false;
  if (/android:|<\?xml|<resources|<manifest|<\/[A-Za-z]/.test(code)) return false;
  if (/\b(javac|java\s+-version|adb\s|gradlew|npm\s)\b/.test(code) && !/\bclass\s+\w+/.test(code)) return false;
  const hasSemi = /;/.test(code);
  const javaMarker = /\b(class|interface)\s+\w+/.test(code) || /System\.out\./.test(code) || /\breturn\b/.test(code);
  return hasSemi && javaMarker;
}

function lessonRunPlan(code) {
  if (!javaLike(code)) return null;
  const hasClass = /\b(class|interface)\s+\w+/.test(code);
  const hasMain = /static\s+void\s+main\s*\(/.test(code);
  if (hasClass && hasMain) return { mode: 'direct', code: code };
  if (hasClass && !hasMain) return { mode: 'nomain', code: code };
  if (!hasClass && hasMain) return { mode: 'wrapClass', code: 'public class Demo {\n' + code + '\n}' };
  if (/\bstatic\s+[\w<>\[\]]+\s+\w+\s*\(/.test(code)) return null;
  const body = code.split('\n').map(l => (l.trim() === '' ? '' : '        ' + l)).join('\n');
  return { mode: 'wrapMain', code: 'public class Demo {\n    public static void main(String[] args) {\n' + body + '\n    }\n}' };
}

function findClassCode(chapterId, className) {
  const re = new RegExp('\\b(?:class|interface)\\s+' + className + '\\b');
  const keys = Object.keys(LESSON_RUN).filter(k => k.indexOf(chapterId + '#') === 0);
  for (let i = 0; i < keys.length; i++) {
    const item = LESSON_RUN[keys[i]];
    const code = (item.plan && item.plan.code) ? item.plan.code : item.code;
    if (re.test(code) && !/static\s+void\s+main\s*\(/.test(code)) return code;
  }
  return null;
}

function runJavaWithDeps(code, input, chapterId, extraFiles) {
  if (!window.JavaRunner || typeof window.JavaRunner.run !== 'function') {
    return { ok: false, output: '', error: '运行器脚本没有加载成功，请刷新页面重试。' };
  }
  let attempt = code;
  const added = [];
  for (let round = 0; round < 5; round++) {
    let res;
    try { res = window.JavaRunner.run(attempt, input || '', { files: extraFiles || [] }); }
    catch (e) { return { ok: false, output: '', error: '运行器内部错误：' + (e && e.message ? e.message : String(e)) }; }
    if (res.ok) return res;
    const m = /找不到(?:类|标识符)：([A-Za-z_$][\w$]*)/.exec(res.error || '');
    if (!m) return res;
    const name = m[1];
    if (added.indexOf(name) >= 0) return res;
    const dep = findClassCode(chapterId, name);
    if (!dep) return res;
    added.push(name);
    attempt = dep + '\n\n' + attempt;
  }
  return { ok: false, output: '', error: '依赖层级过多，建议把代码复制到 IDEA 中运行。' };
}

function lessonHtml(lesson, idx, chapterId, enableRun) {
  switch (lesson.t) {
    case 'h': return '<h3 class="lesson-head" id="h-' + idx + '">' + inline(lesson.text) + '</h3>';
    case 'p': return '<p class="lesson-p">' + inline(lesson.text) + '</p>';
    case 'list': return '<ul class="lesson-list">' + lesson.items.map(i => '<li>' + inline(i) + '</li>').join('') + '</ul>';
    case 'code': {
      const key = chapterId + '#' + idx;
      const plan = (enableRun && !lesson.noRun) ? lessonRunPlan(lesson.code) : null;
      const needsInput = /Scanner/.test(lesson.code || '');
      LESSON_RUN[key] = { code: lesson.code, plan: plan, needsInput: needsInput };
      return codeBlock(lesson.code, lesson.title, {
        runKey: key,
        runnable: !!plan,
        needsInput: needsInput,
        inputHint: ''
      });
    }
    case 'tip': return '<div class="callout tip"><span class="tag accent">提示</span>' + inline(lesson.text) + '</div>';
    case 'warn': return '<div class="callout warn"><span class="tag warn">注意</span>' + inline(lesson.text) + '</div>';
    case 'table': return tableBlock(lesson.head, lesson.rows);
    default: return '';
  }
}

/* ---------- 侧边栏与顶栏 ---------- */
function renderChrome() {
  renderSidebar();
  renderTopbar();
}

function renderSidebar() {
  const host = qs('#sidebar');
  if (!host) return;
  const hash = location.hash || '#/home';
  const stat = overallProgress();

  let html = '';
  html += '<div class="sidebar-head">' +
    '<div class="brand"><span class="logo">J</span><div>从 Java 到移动端<small>交互式学习软件 · 0 基础路线</small></div></div>' +
    '<div class="mt-2"><div class="progress"><i style="width:' + stat.percent + '%"></i></div>' +
    '<div class="small faint mt-1">总进度 ' + stat.percent + '% · 已完成 ' + stat.done + '/' + stat.total + ' 项</div></div>' +
  '</div>';

  html += '<div class="sidebar-scroll">';

  const navBtn = (href, label, icon, active) =>
    '<a class="nav-item' + (active ? ' active' : '') + '" href="' + href + '" data-nav="1">' +
    '<span class="idx">' + icon + '</span><span class="label">' + esc(label) + '</span></a>';

  html += '<div class="nav-group-title">开始</div>';
  html += navBtn('#/home', '学习总览', '⌂', hash === '#/home');
  html += navBtn('#/roadmap', '学习路线', '☰', hash === '#/roadmap');
  html += navBtn('#/progress', '我的进度', '◔', hash === '#/progress');
  html += navBtn('#/cheatsheet', '速查手册', '★', hash === '#/cheatsheet');
  html += navBtn('#/library', '我的类库', '🧩', hash === '#/library');

  MODULES.forEach(mod => {
    html += '<div class="nav-group-title">' + esc(mod.title.split(' · ')[0]) + '</div>';
    mod.chapters.forEach(ch => {
      const done = chapterDone(ch.id);
      const active = hash === '#/chapter/' + ch.id;
      html += '<a class="nav-item' + (active ? ' active' : '') + '" href="#/chapter/' + ch.id + '" data-nav="1">' +
        '<span class="idx">' + String(ch.order).padStart(2, '0') + '</span>' +
        '<span class="label">' + esc(ch.title) + '</span>' +
        '<span class="dot' + (done ? ' done' : '') + '"></span></a>';
    });
  });

  html += '<div class="nav-group-title">实战</div>';
  html += navBtn('#/projects', '项目工坊（6 个）', '⚒', hash === '#/projects' || hash.indexOf('#/project/') === 0);

  html += '</div>';
  html += '<div class="sidebar-foot">进度自动保存在本机浏览器。' +
    '<button class="btn sm ghost" id="themeBtn2" style="margin-top:8px">切换明暗主题</button></div>';
  host.innerHTML = html;
}

function renderTopbar() {
  const host = qs('#topbar');
  if (!host) return;
  const lv = levelInfo();
  const stats = exerciseStats();
  const qstat = quizStats();
  host.innerHTML =
    '<button class="btn sm menu-btn" id="menuBtn" aria-label="菜单">☰</button>' +
    '<div class="search-wrap">' +
      '<input id="searchInput" type="search" placeholder="搜索章节、项目、知识点…" autocomplete="off" />' +
      '<div id="searchResults" style="display:none"></div>' +
    '</div>' +
    '<span class="spacer"></span>' +
    '<span class="badge-level hide-sm">Lv.' + lv.level + ' ' + esc(lv.title) + '</span>' +
    '<span class="tag hide-sm">测验 ' + qstat.correct + '/' + qstat.total + '</span>' +
    '<span class="tag ok hide-sm">练习 ' + stats.passed + '/' + stats.total + '</span>' +
    '<button class="btn sm ghost" id="phoneBtn" title="在手机上打开">📱</button>' +
    '<button class="btn sm ghost" id="themeBtn" title="切换主题">◐</button>';

  bindChrome();
}

function bindChrome() {
  const menuBtn = qs('#menuBtn');
  if (menuBtn) menuBtn.onclick = () => toggleSidebar(true);

  [qs('#phoneBtn'), qs('#phoneBtn2')].forEach(btn => {
    if (btn) btn.onclick = () => showPhonePanel();
  });

  [qs('#themeBtn'), qs('#themeBtn2')].forEach(btn => {
    if (btn) btn.onclick = () => {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
      applyTheme();
      saveState();
    };
  });

  const input = qs('#searchInput');
  if (input) {
    input.oninput = () => renderSearch(input.value);
    input.onfocus = () => renderSearch(input.value);
    input.onkeydown = (e) => { if (e.key === 'Escape') { input.value = ''; renderSearch(''); input.blur(); } };
  }
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-wrap')) {
      const box = qs('#searchResults');
      if (box) box.style.display = 'none';
    }
  }, { once: false });
}

function toggleSidebar(open) {
  const sb = qs('#sidebar');
  let backdrop = qs('.backdrop');
  if (!backdrop) {
    backdrop = el('<div class="backdrop"></div>');
    document.body.appendChild(backdrop);
    backdrop.onclick = () => toggleSidebar(false);
  }
  sb.classList.toggle('open', open);
  backdrop.classList.toggle('show', open);
}

function renderSearch(keyword) {
  const box = qs('#searchResults');
  if (!box) return;
  const kw = (keyword || '').trim().toLowerCase();
  if (!kw) { box.style.display = 'none'; box.innerHTML = ''; return; }

  const hits = [];
  ALL_CHAPTERS.forEach(ch => {
    const bag = [ch.title].concat(ch.tags || []).concat((ch.goals || [])).join(' ').toLowerCase();
    if (bag.indexOf(kw) >= 0) hits.push({ href: '#/chapter/' + ch.id, label: ch.order + '. ' + ch.title, kind: '章节' });
  });
  PROJECTS.forEach(p => {
    const bag = [p.title, p.summary].concat(p.skills || []).join(' ').toLowerCase();
    if (bag.indexOf(kw) >= 0) hits.push({ href: '#/project/' + p.id, label: p.title, kind: '项目' });
  });
  CHEATSHEET.sections.forEach(s => {
    const bag = [s.title, s.group, s.code || '', s.note || ''].concat((s.rows || []).map(r => r.join(' '))).concat(s.items || []).join(' ').toLowerCase();
    if (bag.indexOf(kw) >= 0) hits.push({ href: '#/cheatsheet?q=' + encodeURIComponent(keyword), label: s.title + '（速查）', kind: '速查' });
  });

  if (!hits.length) {
    box.innerHTML = '<div class="hint">没有找到“' + esc(keyword) + '”，换个关键词试试（例如 switch、RecyclerView、异常）</div>';
  } else {
    box.innerHTML = hits.slice(0, 12).map(h =>
      '<button data-href="' + h.href + '"><span class="tag">' + h.kind + '</span> ' + esc(h.label) + '</button>'
    ).join('');
    qsa('button', box).forEach(b => {
      b.onclick = () => {
        location.hash = b.getAttribute('data-href');
        box.style.display = 'none';
        const inp = qs('#searchInput');
        if (inp) inp.value = '';
      };
    });
  }
  box.style.display = 'block';
}

function applyTheme() {
  document.documentElement.setAttribute('data-theme', state.theme === 'light' ? 'light' : 'dark');
}

/* =============================================================
   视图渲染
   ============================================================= */
function setMain(html, opts) {
  const keepScroll = !!(opts && opts.keepScroll);
  const y = window.scrollY;
  qs('#content').innerHTML = html;
  if (keepScroll) window.scrollTo(0, y);
  else window.scrollTo({ top: 0, behavior: 'auto' });
  bindCopyButtons();
}

function bindCopyButtons() {
  qsa('[data-copy]').forEach(btn => {
    btn.onclick = () => {
      const block = btn.closest('.code-block');
      const code = qs('code', block);
      copyText(code.innerText);
    };
  });
}

function copyText(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => toast('已复制到剪贴板', 'ok'))
      .catch(() => fallbackCopy(text));
  } else {
    fallbackCopy(text);
  }
}

function fallbackCopy(text) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand('copy'); toast('已复制到剪贴板', 'ok'); }
  catch (e) { toast('复制失败，请手动选择复制', 'warn'); }
  ta.remove();
}

function nextStepSuggestion() {
  const next = ALL_CHAPTERS.find(c => !chapterDone(c.id));
  if (next) return { label: '继续学习：第 ' + next.order + ' 章 ' + next.title, href: '#/chapter/' + next.id };
  const proj = PROJECTS.find(p => !(state.projects[p.id] && state.projects[p.id].done));
  if (proj) return { label: '去做项目：' + proj.title, href: '#/project/' + proj.id };
  return { label: '全部完成，去看看速查手册复习一下', href: '#/cheatsheet' };
}

/* ---------- 总览页 ---------- */
function viewHome() {
  const stat = overallProgress();
  const lv = levelInfo();
  const ex = exerciseStats();
  const qz = quizStats();
  const sug = nextStepSuggestion();

  let html = '';
  html += '<h1 class="page-title">从 0 开始，学完 Java 再进移动端</h1>';
  html += '<p class="page-sub">这是一套可以边看边练的课程：每章有知识讲解、随堂测验和编程练习，最后用 6 个项目把技能串起来。进度会自动保存在本机。</p>';

  html += '<div class="card">' +
    '<div class="row between">' +
      '<div><div class="muted small">你的下一步</div><div style="font-size:19px;font-weight:700;margin-top:2px">' + esc(sug.label) + '</div></div>' +
      '<a class="btn primary" href="' + sug.href + '">立即开始 →</a>' +
    '</div>' +
    '<div class="mt-2"><div class="progress"><i style="width:' + stat.percent + '%"></i></div>' +
    '<div class="small faint mt-1">总进度 ' + stat.percent + '%　章节 ' + stat.doneChapters + '/' + ALL_CHAPTERS.length + '　项目 ' + stat.doneProjects + '/' + PROJECTS.length + '</div></div>' +
    '<div class="row mt-2"><button class="btn sm ghost" id="phoneBtn2">📱 在手机上打开</button>' +
    '<span class="small faint">手机和电脑连同一个 WiFi，扫不了码也能手输地址</span></div>' +
  '</div>';

  html += '<div class="grid cols-4">' +
    '<div class="stat"><b>' + lv.level + '</b><span>等级 · ' + esc(lv.title) + '（' + lv.inLevel + '/200）</span></div>' +
    '<div class="stat"><b>' + state.xp + '</b><span>累计经验值</span></div>' +
    '<div class="stat"><b>' + qz.correct + '/' + qz.total + '</b><span>测验答对</span></div>' +
    '<div class="stat"><b>' + ex.passed + '/' + ex.total + '</b><span>练习通过</span></div>' +
  '</div>';

  html += '<div class="card mt-2"><h2 class="card-title">怎么用这套课程</h2>' +
    '<ol class="lesson-list">' +
      '<li><b>按顺序学</b>：左侧目录按 01 → 20 排列，前一章是后一章的基础，别跳。</li>' +
      '<li><b>先做测验再做练习</b>：测验帮你确认概念，练习才是真正长本事的地方。</li>' +
      '<li><b>练习必须自己敲</b>：写不出先看提示，实在不行再看参考答案，看完要关掉自己重写一遍。</li>' +
      '<li><b>每完成一章点“完成本章打卡”</b>：进度和等级会记录下来，看得见的成长更容易坚持。</li>' +
      '<li><b>学完 Java 16 章后做控制台项目</b>，学完 Android 7 章后做两个 App 项目，最后一个可以写进简历。</li>' +
    '</ol>' +
  '</div>';

  html += '<div class="grid cols-2">';
  MODULES.forEach(mod => {
    const doneCount = mod.chapters.filter(c => chapterDone(c.id)).length;
    const pct = Math.round((doneCount / mod.chapters.length) * 100);
    html += '<div class="card"><h2 class="card-title">' + esc(mod.title) + '</h2>' +
      '<p class="muted small mb-2">' + esc(mod.desc) + '</p>' +
      '<div class="progress"><i style="width:' + pct + '%"></i></div>' +
      '<div class="small faint mt-1">' + doneCount + '/' + mod.chapters.length + ' 章完成（' + pct + '%）</div>' +
      '<div class="mt-2"><a class="btn sm" href="#/roadmap">查看路线</a></div>' +
    '</div>';
  });
  html += '</div>';

  const lastCh = state.lastChapterId ? chapterById(state.lastChapterId) : null;
  if (lastCh) {
    html += '<div class="card tight"><span class="faint small">上次学到</span> ' +
      '<a href="#/chapter/' + lastCh.id + '">第 ' + lastCh.order + ' 章 ' + esc(lastCh.title) + '</a></div>';
  }

  html += '<div class="card tight small faint">建议节奏：每天 1～2 小时，一周完成 2～3 章。Java 阶段约 6～8 周，Android 阶段约 6～8 周。中间不要只看不写，练习通过率比学习时长更能说明问题。</div>';

  setMain(html);
}

/* ---------- 路线图 ---------- */
function viewRoadmap() {
  let html = '<h1 class="page-title">学习路线图</h1><p class="page-sub">从零基础到能独立做出 Android App 的完整路径。点击任意章节可以直接进入。</p>';

  MODULES.forEach((mod, mi) => {
    const doneCount = mod.chapters.filter(c => chapterDone(c.id)).length;
    html += '<div class="card"><h2 class="card-title">' + esc(mod.title) + '</h2>' +
      '<p class="muted small mb-2">' + esc(mod.desc) + '　当前完成 ' + doneCount + '/' + mod.chapters.length + '</p>' +
      '<div class="timeline">';
    mod.chapters.forEach(ch => {
      const done = chapterDone(ch.id);
      const exs = (ch.exercises || []).length;
      html += '<div class="timeline-node' + (done ? ' done' : '') + '">' +
        '<div class="node-title"><a href="#/chapter/' + ch.id + '">第 ' + ch.order + ' 章 · ' + esc(ch.title) + '</a>' +
        (done ? ' <span class="tag ok">已完成</span>' : '') + '</div>' +
        '<div class="small faint">约 ' + ch.minutes + ' 分钟　测验 ' + (ch.quiz || []).length + ' 题　练习 ' + exs + ' 个' +
        (ch.tags && ch.tags.length ? '　· ' + ch.tags.slice(0, 4).map(t => esc(t)).join(' / ') : '') + '</div>' +
      '</div>';
    });
    html += '</div></div>';

    if (mi === 0) {
      const p = PROJECTS[0];
      html += '<div class="card tight"><span class="tag purple">阶段项目</span> <a href="#/project/' + p.id + '">' + esc(p.title) + '</a>' +
        '<div class="small muted mt-1">Java 基础学完一半后就可以开始做控制台项目，做完再继续往下学，理解会扎实很多。</div></div>';
    } else {
      html += '<div class="card tight"><span class="tag purple">阶段项目</span> ' +
        '<a href="#/project/p5">' + esc('待办清单 App') + '</a> · <a href="#/project/p6">' + esc('资讯/天气 App（毕业作品）') + '</a>' +
        '<div class="small muted mt-1">Android 阶段的重点不是看完课程，而是把两个 App 真正做出来并装到手机上。</div></div>';
    }
  });

  html += '<div class="card"><h2 class="card-title">项目工坊</h2><div class="chip-list">' +
    PROJECTS.map(p => '<button class="chip" data-href="#/project/' + p.id + '">' + esc(p.title) + '（' + esc(p.level) + '）</button>').join('') +
    '</div><div class="mt-2"><a class="btn" href="#/projects">打开项目工坊 →</a></div></div>';

  setMain(html);
  qsa('[data-href]').forEach(b => { b.onclick = () => { location.hash = b.getAttribute('data-href'); }; });
}

/* ---------- 章节页 ---------- */
function viewChapter(id, scrollMode) {
  const ch = chapterById(id);
  if (!ch) { setMain('<div class="card">没有找到这一章。<a href="#/home">回到总览</a></div>'); return; }
  state.lastChapterId = ch.id;
  saveState();

  const cs = chapterState(ch.id);
  const prev = ALL_CHAPTERS[ch.order - 2];
  const next = ALL_CHAPTERS[ch.order];

  let html = '';
  html += '<div class="crumb"><a href="#/roadmap">' + esc(ch.moduleTitle) + '</a> · 第 ' + ch.order + ' 章 / 共 ' + ALL_CHAPTERS.length + ' 章</div>';
  html += '<h1 class="page-title">' + esc(ch.title) + '</h1>';
  html += '<div class="row mb-2">' +
    '<span class="tag accent">约 ' + ch.minutes + ' 分钟</span>' +
    '<span class="tag">测验 ' + (ch.quiz || []).length + ' 题</span>' +
    '<span class="tag">练习 ' + (ch.exercises || []).length + ' 个</span>' +
    (cs.completed ? '<span class="tag ok">已完成</span>' : '') +
    (ch.tags || []).map(t => '<span class="tag">' + esc(t) + '</span>').join('') +
  '</div>';

  html += '<div class="card tight"><div class="card-title">本章学习目标</div><ul class="lesson-list">' +
    (ch.goals || []).map(g => '<li>' + inline(g) + '</li>').join('') + '</ul></div>';

  const heads = (ch.lessons || []).map((l, i) => ({ l: l, i: i })).filter(x => x.l.t === 'h');
  if (heads.length > 1) {
    html += '<div class="card tight"><div class="card-title">本章内容地图</div><div class="outline">' +
      heads.map(x => '<button class="outline-item" data-goto="h-' + x.i + '">' + inline(x.l.text) + '</button>').join('') +
      '</div><div class="small faint mt-1">点标题可以跳到对应段落。</div></div>';
  }

  html += '<div class="card"><h2 class="card-title">① 知识点讲解</h2>' +
    (ch.lessons || []).map((l, i) => lessonHtml(l, i, ch.id, ch.moduleId === 'java')).join('') + '</div>';

  html += '<div class="card" id="quizCard"><h2 class="card-title">② 随堂测验</h2>' + quizHtml(ch) + '</div>';

  html += '<div class="card"><h2 class="card-title">③ 编程练习</h2>' +
    (ch.exercises && ch.exercises.length
      ? ch.exercises.map(ex => exerciseHtml(ex, ch.moduleId === 'java')).join('')
      : '<p class="muted">本章没有编程练习，把讲解里的示例代码在 IDE 里敲一遍并改一改。</p>') +
  '</div>';

  html += '<div class="card"><h2 class="card-title">④ 打卡与检查</h2>' +
    '<div class="small muted mb-1">逐条确认，确认完可以打卡这一章。</div>' +
    (ch.checklist || []).map((item, i) =>
      '<label class="done-check"><input type="checkbox" data-check="' + i + '"' + (cs.checks[i] ? ' checked' : '') + ' />' +
      '<span>' + inline(item) + '</span></label>').join('') +
    '<div class="row mt-2">' +
      '<button class="btn primary" id="completeBtn">' + (cs.completed ? '已完成本章（点击取消）' : '完成本章打卡') + '</button>' +
      '<span class="small faint">打卡条件不强制，但建议测验答完、练习至少通过一个再打。</span>' +
    '</div>' +
  '</div>';

  html += '<div class="row between mt-2">' +
    (prev ? '<a class="btn" href="#/chapter/' + prev.id + '">← 上一章：' + esc(prev.title) + '</a>' : '<span></span>') +
    (next ? '<a class="btn primary" href="#/chapter/' + next.id + '">下一章：' + esc(next.title) + ' →</a>' : '<a class="btn primary" href="#/projects">去做项目 →</a>') +
  '</div>';

  setMain(html, { keepScroll: scrollMode === 'keep' });
  bindChapter(ch);
}

function quizHtml(ch) {
  const cs = chapterState(ch.id);
  const answered = Object.keys(cs.quiz.answers || {}).length;
  let html = '<div class="small faint mb-1">已答 ' + answered + '/' + ch.quiz.length + ' 题，答对 ' + (cs.quiz.correct || 0) + ' 题。每题答对 +10 经验。</div>';
  ch.quiz.forEach((q, qi) => {
    const picked = cs.quiz.answers[qi];
    html += '<div class="quiz-q" data-q="' + qi + '">';
    html += '<div class="quiz-stem">' + (qi + 1) + '. ' + inline(q.q) + '</div>';
    q.options.forEach((opt, oi) => {
      let cls = 'quiz-opt';
      if (picked !== undefined) {
        if (oi === q.answer) cls += ' correct';
        else if (oi === picked) cls += ' wrong';
      }
      html += '<button class="' + cls + '" data-opt="' + oi + '"' + (picked !== undefined ? ' disabled' : '') + '>' +
        '<span class="k">' + 'ABCD'[oi] + '</span><span>' + inline(opt) + '</span></button>';
    });
    if (picked !== undefined) {
      html += '<div class="quiz-explain">' + (picked === q.answer ? '<b>答对了。</b> ' : '<b>正确答案是 ' + 'ABCD'[q.answer] + '。</b> ') + inline(q.explain) + '</div>';
    }
    html += '</div>';
  });
  if (answered === ch.quiz.length) {
    const all = cs.quiz.correct === ch.quiz.length;
    html += '<div class="row mt-2"><span class="tag ' + (all ? 'ok' : 'warn') + '">本章测验完成：' + cs.quiz.correct + '/' + ch.quiz.length + (all ? ' 全对！' : '') + '</span>' +
      '<button class="btn sm ghost" id="resetQuiz">重新作答</button></div>';
  }
  return html;
}

function bindChapter(ch) {
  const cs = chapterState(ch.id);

  qsa('[data-lessonrun]').forEach(btn => {
    btn.onclick = () => {
      const key = btn.getAttribute('data-lessonrun');
      const item = LESSON_RUN[key];
      const box = document.querySelector('[data-lessonout="' + key + '"]');
      if (!item || !box) return;
      const inputEl = document.querySelector('[data-lessonin="' + key + '"]');
      const input = inputEl ? inputEl.value : '';
      if (item.needsInput && !input.trim()) {
        box.style.display = 'block';
        box.innerHTML = '<div class="callout tip" style="margin:0">这段示例需要键盘输入：请先在上面的输入框里填写数据（每行一条），再点“▶ 运行”。</div>';
        return;
      }
      const res = runJavaWithDeps(item.plan.code, input, ch.id, getLibraryFiles());
      let html = '<div class="small faint">程序输出（System.out）</div>';
      if (res.output) {
        html += '<pre class="run-out">' + esc(res.output.replace(/\n$/, '')) + '</pre>';
      }
      if (res.error) {
        if (/没有找到\s*public\s+static\s+void\s+main/.test(res.error)) {
          html = '<div class="small ok-text">✔ 语法检查通过</div>' +
            '<div class="small faint">这段示例只定义了类或方法，没有 main 方法，所以运行时没有输出。可以把它和章节里的测试类一起运行（点下面练习区的运行按钮试试）。</div>';
        } else {
          html += '<div class="callout warn" style="margin:10px 0 0">' + esc(res.error) + '</div>' +
            '<div class="small faint">如果提示“暂不支持/找不到类”，说明这段示例依赖别的文件或用了运行器未覆盖的语法，复制到 IDEA 里运行即可。</div>';
        }
      } else if (!res.output) {
        html += '<div class="small muted">程序正常结束，但没有任何输出。</div>';
      }
      box.innerHTML = html;
      box.style.display = 'block';
    };
  });

  qsa('[data-goto]').forEach(btn => {
    btn.onclick = () => {
      const target = document.getElementById(btn.getAttribute('data-goto'));
      if (target) target.scrollIntoView({ block: 'start', behavior: 'smooth' });
    };
  });

  qsa('#quizCard .quiz-opt').forEach(btn => {
    btn.onclick = () => {
      const qIndex = Number(btn.closest('.quiz-q').getAttribute('data-q'));
      const optIndex = Number(btn.getAttribute('data-opt'));
      const q = ch.quiz[qIndex];
      if (cs.quiz.answers[qIndex] !== undefined) return;
      cs.quiz.answers[qIndex] = optIndex;
      const right = optIndex === q.answer;
      if (right) { cs.quiz.correct = (cs.quiz.correct || 0) + 1; state.xp += 10; }
      cs.quiz.total = ch.quiz.length;
      if (Object.keys(cs.quiz.answers).length === ch.quiz.length && cs.quiz.correct === ch.quiz.length) {
        state.xp += 20;
        toast('测验全对，额外 +20 经验', 'ok');
      } else {
        toast(right ? '答对了 +10 经验' : '答错了，看看解析', right ? 'ok' : 'warn');
      }
      saveState();
      viewChapter(ch.id, 'keep');
      renderChrome();
    };
  });

  const resetQuiz = qs('#resetQuiz');
  if (resetQuiz) resetQuiz.onclick = () => {
    confirmDialog('重新作答本章测验？', '当前得分会被清空，历史经验值不受影响。', () => {
      cs.quiz.answers = {};
      cs.quiz.correct = 0;
      saveState();
      viewChapter(ch.id, 'keep');
      renderChrome();
    }, '重新作答');
  };

  qsa('[data-check]').forEach(box => {
    box.onchange = () => {
      cs.checks[box.getAttribute('data-check')] = box.checked;
      saveState();
    };
  });

  const completeBtn = qs('#completeBtn');
  if (completeBtn) completeBtn.onclick = () => {
    if (cs.completed) {
      cs.completed = false;
      saveState();
      toast('已取消本章打卡', 'warn');
    } else {
      cs.completed = true;
      state.xp += 30;
      saveState();
      toast('第 ' + ch.order + ' 章打卡完成，+30 经验', 'ok');
    }
    viewChapter(ch.id, 'keep');
    renderChrome();
  };

  (ch.exercises || []).forEach(ex => bindExercise(ex, ch));
}

/* ---------- 练习区 ---------- */
const RUN_INPUT_HINT = { 'ex-j3-1': '70\n1.75', 'ex-j3-2': '25.5\n4\n200' };
function defaultRunInput(ex) { return RUN_INPUT_HINT[ex.id] || ''; }

function normalizeOut(s) {
  return String(s == null ? '' : s)
    .replace(/\r/g, '')
    .split('\n')
    .map(l => l.trim())
    .filter(l => l !== '')
    .join('\n');
}

function looseKey(s) {
  return normalizeOut(s)
    .replace(/(\d)\.0(?=\D|$)/g, '$1')
    .replace(/\d{4}-\d{2}-\d{2}/g, '<日期>')
    .replace(/\s+/g, '');
}

function compareOutput(actual, expected) {
  const a = normalizeOut(actual), e = normalizeOut(expected);
  if (a === e) return { exact: true, close: true };
  if (looseKey(a) === looseKey(e)) return { exact: false, close: true };
  return { exact: false, close: false };
}

function exerciseHtml(ex, runnable) {
  const es = exerciseState(ex.id);
  const code = es.code && es.code.trim() ? es.code : ex.starter;
  const needsInput = /Scanner/.test(ex.starter || '') || /Scanner/.test(ex.solution || '');
  let html = '<div class="ex-block" data-ex="' + ex.id + '">';
  html += '<div class="ex-head"><span class="ex-title">' + esc(ex.title) + '</span>' +
    '<span class="tag">' + esc(ex.level) + '</span>' +
    (runnable ? '<span class="tag accent">可在线运行</span>' : '<span class="tag">需在 Android Studio 中运行</span>') +
    (((ex.files && ex.files.length) || libraryEntries().some(function (f) { return f.code.trim() !== ''; })) ? '<span class="tag accent">多文件</span>' : '') +
    (es.passed ? '<span class="tag ok">关键点已全部通过</span>' : '') + '</div>';
  html += '<p class="lesson-p small">' + inline(ex.brief) + '</p>';

  html += '<div class="card-title" style="font-size:14.5px">需求清单</div><ul class="req-list">' +
    ex.requirements.map(r => '<li>' + inline(r) + '</li>').join('') + '</ul>';

  html += '<details><summary class="small muted" style="cursor:pointer">查看期望输出</summary>' +
    '<div class="output-box">' + esc(ex.expectedOutput) + '</div></details>';

  html += '<div class="card-title mt-2" style="font-size:14.5px">你的代码</div>';
  if (runnable) {
    html += '<div class="small faint" style="margin-bottom:6px">写完点“▶ 运行代码”，就能在页面里直接看到 System.out 的输出，不用切到 IDE。运行器覆盖教学常用语法（变量、数组、循环、方法、类与对象、集合、异常、文件读写、Scanner 输入）；如果提示“暂不支持”，把代码复制到 IDEA 里运行即可。</div>';
  }
  html += '<textarea class="editor" spellcheck="false" data-editor="' + ex.id + '">' + esc(code) + '</textarea>';
  html += '<div class="row mt-1">' +
    (runnable ? '<button class="btn sm primary" data-act="run">▶ 运行代码</button>' : '') +
    '<button class="btn sm" data-act="check">检查关键点</button>' +
    '<button class="btn sm" data-act="hint">看提示</button>' +
    '<button class="btn sm ghost" data-act="solution">查看参考答案</button>' +
    (runnable ? '<button class="btn sm ghost" data-act="runsample">跑一遍参考答案</button>' : '') +
    '<button class="btn sm ghost" data-act="copy">复制我的代码</button>' +
    '<button class="btn sm ghost" data-act="clear">清空重写</button>' +
    '<button class="btn sm ok" data-act="finish">标记完成</button>' +
  '</div>';
  if (runnable) {
    html += '<div class="run-panel">' +
      (needsInput
        ? '<div class="small muted mt-2">这个程序需要键盘输入（Scanner），请在下面按行填写输入数据，每行一条：</div>' +
          '<textarea class="editor" spellcheck="false" style="min-height:64px" data-runin="' + ex.id + '">' + esc(defaultRunInput(ex)) + '</textarea>'
        : '') +
      '<div class="run-out-box" data-runout="' + ex.id + '" style="display:none"></div>' +
      '</div>';
    html += dependencyPanelHtml(ex);
  }
  html += '<div class="check-list" data-result="' + ex.id + '"></div>';
  html += '<div data-hints="' + ex.id + '"></div>';
  html += '<div data-solution="' + ex.id + '"></div>';
  html += '</div>';
  return html;
}

function bindExercise(ex, ch) {
  const es = exerciseState(ex.id);
  const block = qs('[data-ex="' + ex.id + '"]');
  if (!block) return;
  const editor = qs('[data-editor="' + ex.id + '"]', block);

  editor.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = editor.selectionStart, end = editor.selectionEnd;
      editor.value = editor.value.slice(0, start) + '    ' + editor.value.slice(end);
      editor.selectionStart = editor.selectionEnd = start + 4;
    }
  });

  let timer = null;
  editor.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      es.code = editor.value;
      saveState();
    }, 350);
  });

  const resultBox = qs('[data-result="' + ex.id + '"]', block);
  const hintBox = qs('[data-hints="' + ex.id + '"]', block);
  const solBox = qs('[data-solution="' + ex.id + '"]', block);

  function runCheck() {
    const code = editor.value;
    es.code = code;
    const results = ex.keyPoints.map(kp => {
      let ok = false;
      try { ok = new RegExp(kp.test, 'i').test(code); } catch (err) { ok = false; }
      return { label: kp.label, ok: ok };
    });
    const allPass = results.every(r => r.ok);
    resultBox.innerHTML = results.map(r =>
      '<div class="check-item ' + (r.ok ? 'pass' : 'fail') + '">' +
      '<span class="mark">' + (r.ok ? '✔' : '✘') + '</span><span>' + esc(r.label) + '</span></div>'
    ).join('') +
    '<div class="small ' + (allPass ? 'muted' : 'faint') + '">' +
      (allPass
        ? '关键点全部命中。请在 IDE 里真正运行一次，把实际输出和上面的期望输出逐行对照。'
        : '还有关键点没命中。可以看提示，或对照上方需求清单逐条检查。') +
    '</div>';

    if (allPass && !es.passed) {
      es.passed = true;
      es.checkedAt = Date.now();
      state.xp += 20;
      saveState();
      toast('练习关键点全部通过，+20 经验', 'ok');
      renderChrome();
      const head = qs('.ex-head', block);
      if (head && !qs('.tag.ok', head)) head.appendChild(el('<span class="tag ok">关键点已全部通过</span>'));
    } else {
      saveState();
    }
  }

  qs('[data-act="check"]', block).onclick = runCheck;

  // 依赖文件面板：勾选/取消是否自动带上我的类库
  const libToggle = qs('[data-libtoggle]', block);
  if (libToggle) libToggle.onchange = () => {
    state.libraryAuto = !!libToggle.checked;
    saveState();
    toast(libToggle.checked ? '已开启：运行时会自动带上我的类库' : '已关闭：本次运行不再附带我的类库', libToggle.checked ? 'ok' : 'warn');
  };
  const libOpenBtn = qs('[data-libopen]', block);
  if (libOpenBtn) libOpenBtn.onclick = () => { location.hash = '#/library'; };


  /* ---------- 在线运行 Java 代码 ---------- */
  function doRun(code, inputText, labelPrefix) {
    const outBox = qs('[data-runout="' + ex.id + '"]', block);
    if (!outBox) return;
    let res;
    try {
      if (!window.JavaRunner) throw new Error('运行器未加载');
      res = window.JavaRunner.run(code, inputText || '', { files: runFilesForExercise(ex) });
    } catch (err) {
      res = { ok: false, output: '', error: '运行器内部错误：' + (err && err.message ? err.message : String(err)) };
    }
    const cmp = (res.ok && res.output && res.output.trim()) ? compareOutput(res.output, ex.expectedOutput) : null;
    let html = '<div class="small faint">' + esc(labelPrefix || '运行结果') + '</div>';
    if (res.output) {
      html += '<pre class="run-out">' + esc(res.output.replace(/\n$/, '')) + '</pre>';
    } else if (!res.error) {
      html += '<div class="small muted">程序正常结束，但没有任何输出。检查一下是否漏了 System.out.println。</div>';
    }
    if (res.error) {
      html += '<div class="callout warn" style="margin:10px 0 0">' + esc(res.error) + '</div>' +
        '<div class="small faint">常见原因：少了 main 方法、括号/分号不配对、用了运行器暂不支持的语法。改完再点一次“运行代码”。</div>';
    } else if (cmp) {
      if (cmp.exact) html += '<div class="small ok-text">✔ 输出与期望输出完全一致</div>';
      else if (cmp.close) html += '<div class="small faint">≈ 结果基本一致（只有日期或小数格式的差异）</div>';
      else html += '<div class="small faint">⚠ 输出与期望不完全一致：交互式程序的输入提示会挤在一样，请重点核对结果行是否相同。</div>';
    }
    outBox.innerHTML = html;
    outBox.style.display = 'block';

    if (res.ok && !es.ranOkOnce) {
      es.ranOkOnce = true;
      state.xp += 5;
      saveState();
      toast('代码成功运行，+5 经验', 'ok');
      renderChrome();
    }
  }

  const runBtn = qs('[data-act="run"]', block);
  if (runBtn) runBtn.onclick = () => {
    es.code = editor.value;
    saveState();
    const inputEl = qs('[data-runin="' + ex.id + '"]', block);
    doRun(editor.value, inputEl ? inputEl.value : '', '程序输出（System.out）');
  };

  const runSampleBtn = qs('[data-act="runsample"]', block);
  if (runSampleBtn) runSampleBtn.onclick = () => {
    const inputEl = qs('[data-runin="' + ex.id + '"]', block);
    doRun(ex.solution, inputEl ? inputEl.value : '', '参考答案的运行结果');
  };

  let hintShown = 0;
  qs('[data-act="hint"]', block).onclick = () => {
    if (hintShown >= ex.hints.length) { toast('提示已经全部看完啦，先自己试一版', 'warn'); return; }
    hintBox.innerHTML += '<div class="hint-item"><b>提示 ' + (hintShown + 1) + '：</b>' + inline(ex.hints[hintShown]) + '</div>';
    hintShown++;
  };

  qs('[data-act="solution"]', block).onclick = () => {
    if (state.exercises[ex.id] && state.exercises[ex.id].showSolution) {
      solBox.innerHTML = '';
      state.exercises[ex.id].showSolution = false;
      saveState();
      return;
    }
    confirmDialog('确定要看参考答案吗？', '先自己写一版、哪怕写错也很有价值。看完参考实现后，建议关掉它自己重写一遍。', () => {
      state.exercises[ex.id].showSolution = true;
      saveState();
      solBox.innerHTML = '<div class="card-title mt-2" style="font-size:14.5px">参考实现</div>' + codeBlock(ex.solution, '参考答案');
      bindCopyButtons();
    }, '查看答案');
  };

  qs('[data-act="copy"]', block).onclick = () => copyText(editor.value);

  qs('[data-act="clear"]', block).onclick = () => {
    confirmDialog('清空当前代码？', '会恢复成初始模板，你写的内容不会保留。', () => {
      editor.value = ex.starter;
      es.code = ex.starter;
      saveState();
      resultBox.innerHTML = '';
    }, '清空');
  };

  qs('[data-act="finish"]', block).onclick = () => {
    const results = ex.keyPoints.map(kp => {
      try { return new RegExp(kp.test, 'i').test(editor.value); } catch (e) { return false; }
    });
    const allPass = results.every(Boolean);
    if (allPass) { runCheck(); return; }
    confirmDialog('还有关键点没通过，仍然标记为完成？', '建议先对照需求清单检查。如果你已经在自己电脑上跑通了，也可以先标记完成。', () => {
      es.passed = true;
      es.checkedAt = Date.now();
      saveState();
      toast('已标记完成（自我评估）', 'warn');
      viewChapter(ch.id, 'keep');
      renderChrome();
    }, '仍然完成');
  };
}

/* ---------- 项目工坊 ---------- */
function viewProjects() {
  let html = '<h1 class="page-title">项目工坊</h1>' +
    '<p class="page-sub">6 个项目，从控制台程序一路做到可以装进手机的 App。每个项目都给了功能清单、实现步骤、验收标准和提示，照着做就能落地。</p>';

  html += '<div class="grid cols-2">';
  PROJECTS.forEach(p => {
    const ps = projectState(p.id);
    const doneFeatures = Object.keys(ps.tasks || {}).filter(k => ps.tasks[k]).length;
    html += '<div class="card project-card">' +
      '<div class="row between"><h3>' + esc(p.title) + '</h3>' +
      (ps.done ? '<span class="tag ok">已完成</span>' : '<span class="tag">' + esc(p.level) + '</span>') + '</div>' +
      '<div class="small muted">' + inline(p.summary) + '</div>' +
      '<div class="skill-list">' + (p.skills || []).map(s => '<span class="tag accent">' + esc(s) + '</span>').join('') + '</div>' +
      '<div class="progress"><i style="width:' + Math.round(doneFeatures / p.features.length * 100) + '%"></i></div>' +
      '<div class="small faint">功能完成 ' + doneFeatures + '/' + p.features.length + '　预计 ' + esc(p.hours) + '</div>' +
      '<div class="row"><a class="btn sm primary" href="#/project/' + p.id + '">打开项目 →</a>' +
      '<a class="btn sm ghost" href="#/roadmap">看它在路线里的位置</a></div>' +
    '</div>';
  });
  html += '</div>';
  setMain(html);
}

function viewProject(id) {
  const p = projectById(id);
  if (!p) { setMain('<div class="card">没有找到这个项目。<a href="#/projects">回到项目工坊</a></div>'); return; }
  const ps = projectState(p.id);

  let html = '';
  html += '<div class="crumb"><a href="#/projects">项目工坊</a> · ' + esc(p.level) + ' · 预计 ' + esc(p.hours) + '</div>';
  html += '<h1 class="page-title">' + esc(p.title) + '</h1>';
  html += '<p class="page-sub">' + inline(p.summary) + '</p>';
  html += '<div class="row mb-2">' + (p.skills || []).map(s => '<span class="tag accent">' + esc(s) + '</span>').join('') + '</div>';

  const afterChapters = (p.after || []).map(cid => chapterById(cid)).filter(Boolean);
  if (afterChapters.length) {
    html += '<div class="card tight"><div class="card-title">前置知识</div><div class="chip-list">' +
      afterChapters.map(c => '<button class="chip' + (chapterDone(c.id) ? ' done' : '') + '" data-href="#/chapter/' + c.id + '">第 ' + c.order + ' 章 ' + esc(c.title) + '</button>').join('') +
      '</div></div>';
  }

  html += '<div class="card"><h2 class="card-title">功能清单（勾选你完成的项）</h2>';
  p.features.forEach((f, i) => {
    const checked = ps.tasks && ps.tasks[i];
    html += '<label class="done-check"><input type="checkbox" data-task="' + i + '"' + (checked ? ' checked' : '') + ' />' +
      '<span>' + inline(f) + '</span></label>';
  });
  html += '</div>';

  html += '<div class="card"><h2 class="card-title">实现步骤</h2>' +
    p.steps.map((s, i) => '<div class="step"><b>第 ' + (i + 1) + ' 步 · ' + esc(s.title) + '</b><span class="small muted">' + inline(s.detail) + '</span></div>').join('') +
  '</div>';

  html += '<div class="card"><h2 class="card-title">验收标准</h2><ul class="lesson-list">' +
    p.acceptance.map(a => '<li>' + inline(a) + '</li>').join('') + '</ul>' +
    '<div class="callout tip"><span class="tag accent">提示</span>验收标准就是你的“完成定义”。做完一个功能就回来核对一次，比最后一次性测试省时间。</div>' +
  '</div>';

  html += '<div class="card"><h2 class="card-title">实现提示</h2><ul class="lesson-list">' +
    p.hints.map(h => '<li>' + inline(h) + '</li>').join('') + '</ul>' +
    '<div class="callout warn"><span class="tag warn">进阶挑战</span>' + inline(p.stretch) + '</div>' +
  '</div>';

  html += '<div class="card tight"><div class="row between">' +
    '<div><div class="small muted">完成项目可以点击右边的按钮，会记录进度并奖励经验。</div></div>' +
    '<button class="btn ' + (ps.done ? '' : 'primary') + '" id="projectDoneBtn">' + (ps.done ? '已完成（点击取消）' : '标记项目完成（+100 经验）') + '</button>' +
  '</div></div>';

  setMain(html);

  qsa('[data-href]').forEach(b => { b.onclick = () => { location.hash = b.getAttribute('data-href'); }; });
  qsa('[data-task]').forEach(box => {
    box.onchange = () => {
      ps.tasks[box.getAttribute('data-task')] = box.checked;
      saveState();
      const doneFeatures = Object.keys(ps.tasks).filter(k => ps.tasks[k]).length;
      if (doneFeatures === p.features.length) toast('功能清单全部勾完，去核对验收标准吧', 'ok');
    };
  });
  const btn = qs('#projectDoneBtn');
  if (btn) btn.onclick = () => {
    if (ps.done) {
      ps.done = false;
      saveState();
      toast('已取消项目完成标记', 'warn');
    } else {
      const doneFeatures = Object.keys(ps.tasks || {}).filter(k => ps.tasks[k]).length;
      if (doneFeatures < p.features.length) {
        confirmDialog('还有功能没勾选，仍然标记完成？', '建议先对照功能清单与验收标准逐条确认。', () => {
          ps.done = true;
          state.xp += 100;
          saveState();
          toast('项目完成！+100 经验', 'ok');
          viewProject(p.id);
          renderChrome();
        }, '仍然完成');
        return;
      }
      ps.done = true;
      state.xp += 100;
      saveState();
      toast('项目完成！+100 经验', 'ok');
    }
    viewProject(p.id);
    renderChrome();
  };
}

/* ---------- 速查手册 ---------- */
function viewCheatsheet(query) {
  const kw = (query || '').trim().toLowerCase();
  const groups = [];
  CHEATSHEET.sections.forEach(s => {
    const bag = [s.title, s.group].concat((s.rows || []).map(r => r.join(' '))).join(' ').toLowerCase();
    if (kw && bag.indexOf(kw) < 0) return;
    if (!groups.includes(s.group)) groups.push(s.group);
  });

  let html = '<h1 class="page-title">速查手册</h1>' +
    '<p class="page-sub">写代码时随时回来查：语法怎么写、控件用什么属性、报错怎么修、去哪儿找文档。' +
    (kw ? '（当前筛选：' + esc(query) + '）' : '') + '</p>';

  const active = state.cheatGroup && groups.includes(state.cheatGroup) ? state.cheatGroup : (groups[0] || 'Java 基础');
  html += '<div class="tabs">' + groups.map(g =>
    '<button class="tab' + (g === active ? ' active' : '') + '" data-group="' + esc(g) + '">' + esc(g) + '</button>').join('') + '</div>';

  const sections = CHEATSHEET.sections.filter(s => {
    if (s.group !== active) return false;
    if (!kw) return true;
    const bag = [s.title, s.group].concat((s.rows || []).map(r => r.join(' '))).join(' ').toLowerCase();
    return bag.indexOf(kw) >= 0;
  });

  if (!sections.length) {
    html += '<div class="card muted">这个分组下没有匹配的内容。</div>';
  }

  sections.forEach(s => {
    html += '<div class="card"><h2 class="card-title">' + esc(s.title) + '</h2>';
    if (s.type === 'table') html += tableBlock(s.head, s.rows);
    else if (s.type === 'list') html += '<ul class="lesson-list">' + s.items.map(i => '<li>' + inline(i) + '</li>').join('') + '</ul>';
    else if (s.type === 'code') {
      html += codeBlock(s.code, s.codeTitle || '示例代码');
      if (s.note) html += '<div class="small faint mt-1">' + inline(s.note) + '</div>';
    }
    html += '</div>';
  });

  html += '<div class="card tight small faint">提示：在顶部搜索框输入关键词（例如 switch、RecyclerView、NullPointerException），可以直接跳到对应的速查条目。</div>';

  setMain(html);
  qsa('.tab').forEach(tab => {
    tab.onclick = () => {
      state.cheatGroup = tab.getAttribute('data-group');
      saveState();
      viewCheatsheet(query);
    };
  });
}

/* ---------- 我的进度 ---------- */
function viewProgress() {
  const stat = overallProgress();
  const lv = levelInfo();
  const ex = exerciseStats();
  const qz = quizStats();

  let html = '<h1 class="page-title">我的进度</h1><p class="page-sub">所有数据保存在你本机浏览器的 localStorage 里，换浏览器或清理数据会丢失，可以用下面的导出功能备份。</p>';

  html += '<div class="grid cols-4">' +
    '<div class="stat"><b>' + stat.percent + '%</b><span>总进度</span></div>' +
    '<div class="stat"><b>' + lv.level + '</b><span>' + esc(lv.title) + '</span></div>' +
    '<div class="stat"><b>' + qz.correct + '/' + qz.total + '</b><span>测验答对</span></div>' +
    '<div class="stat"><b>' + ex.passed + '/' + ex.total + '</b><span>练习通过</span></div>' +
  '</div>';

  html += '<div class="card mt-2"><h2 class="card-title">等级进度</h2>' +
    '<div class="progress"><i style="width:' + lv.percent + '%"></i></div>' +
    '<div class="small faint mt-1">Lv.' + lv.level + ' ' + esc(lv.title) + '　经验 ' + state.xp + '　距离下一级还差 ' + (200 - lv.inLevel) + ' 点</div>' +
    '<div class="small muted mt-1">经验获取：测验答对 +10，测验全对额外 +20，练习关键点全通过 +20，章节打卡 +30，项目完成 +100。</div>' +
  '</div>';

  html += '<div class="card"><h2 class="card-title">分模块进度</h2>';
  MODULES.forEach(mod => {
    const doneCount = mod.chapters.filter(c => chapterDone(c.id)).length;
    const pct = Math.round(doneCount / mod.chapters.length * 100);
    html += '<div class="mt-2"><div class="row between"><span class="small">' + esc(mod.title) + '</span><span class="small faint">' + doneCount + '/' + mod.chapters.length + '</span></div>' +
      '<div class="progress"><i style="width:' + pct + '%"></i></div></div>';
  });
  html += '</div>';

  html += '<div class="card"><h2 class="card-title">章节清单</h2><div class="chip-list">' +
    ALL_CHAPTERS.map(c => '<button class="chip' + (chapterDone(c.id) ? ' done' : '') + '" data-href="#/chapter/' + c.id + '">' + c.order + '. ' + esc(c.title) + '</button>').join('') +
  '</div><div class="chip-list mt-2">' +
    PROJECTS.map(p => '<button class="chip' + ((state.projects[p.id] && state.projects[p.id].done) ? ' done' : '') + '" data-href="#/project/' + p.id + '">' + esc(p.title) + '</button>').join('') +
  '</div></div>';

  html += '<div class="card"><h2 class="card-title">📱 在手机上学习</h2>' +
    '<div class="small muted">手机和电脑连同一个 WiFi，就可以在手机上打开同一个课程；进度各设备独立保存，可以用下面的导出/导入搬运。</div>' +
    '<div class="row mt-2"><button class="btn sm" id="phoneBtn2">查看手机访问地址</button></div>' +
  '</div>';

  html += '<div class="card"><h2 class="card-title">备份与重置</h2>' +
    '<div class="row">' +
      '<button class="btn sm" id="exportBtn">导出进度</button>' +
      '<button class="btn sm" id="importBtn">导入进度</button>' +
      '<button class="btn sm danger" id="resetBtn">清空所有进度</button>' +
    '</div>' +
    '<div class="small faint mt-2">导出的内容是一段 JSON 文本，可以粘贴到记事本保存，换设备时用“导入进度”恢复。</div>' +
    '<div id="ioBox" class="mt-2"></div>' +
  '</div>';

  setMain(html);

  qsa('[data-href]').forEach(b => { b.onclick = () => { location.hash = b.getAttribute('data-href'); }; });

  qs('#exportBtn').onclick = () => {
    const box = qs('#ioBox');
    const text = JSON.stringify(state, null, 2);
    box.innerHTML = '<div class="card-title" style="font-size:14.5px">导出内容（点复制按钮）</div>' +
      '<textarea class="editor" style="min-height:160px" id="exportArea"></textarea>' +
      '<div class="row mt-1"><button class="btn sm primary" id="copyExport">复制</button>' +
      '<button class="btn sm ghost" id="downloadExport">下载为文件</button></div>';
    qs('#exportArea').value = text;
    qs('#copyExport').onclick = () => copyText(text);
    qs('#downloadExport').onclick = () => {
      const blob = new Blob([text], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'java-mobile-learn-progress.json';
      a.click();
      URL.revokeObjectURL(a.href);
      toast('进度文件已下载', 'ok');
    };
  };

  qs('#importBtn').onclick = () => {
    const box = qs('#ioBox');
    box.innerHTML = '<div class="card-title" style="font-size:14.5px">把导出的 JSON 粘贴到这里</div>' +
      '<textarea class="editor" style="min-height:160px" id="importArea" placeholder="粘贴进度 JSON"></textarea>' +
      '<div class="row mt-1"><button class="btn sm primary" id="doImport">导入并覆盖</button></div>';
    qs('#doImport').onclick = () => {
      try {
        const parsed = JSON.parse(qs('#importArea').value);
        state = Object.assign(defaultState(), parsed);
        saveState();
        applyTheme();
        toast('导入成功', 'ok');
        viewProgress();
        renderChrome();
      } catch (e) {
        toast('JSON 格式不对，请检查后重试', 'err');
      }
    };
  };

  qs('#resetBtn').onclick = () => {
    confirmDialog('清空所有学习进度？', '章节打卡、测验成绩、练习代码和经验值都会被删除，且无法恢复。', () => {
      state = defaultState();
      saveState();
      applyTheme();
      toast('进度已清空', 'warn');
      viewProgress();
      renderChrome();
    }, '确认清空');
  };
}

/* ---------- 我的类库页面 ---------- */
const LIB_EXAMPLE = 'public class Calculator {\n' +
  '    // 两数相加\n' +
  '    public static int add(int a, int b) {\n' +
  '        return a + b;\n' +
  '    }\n\n' +
  '    // 两数相减\n' +
  '    public static int sub(int a, int b) {\n' +
  '        return a - b;\n' +
  '    }\n' +
  '}\n';

function viewLibrary() {
  const entries = libraryEntries();
  const problems = libraryProblems(entries.filter(function (f) { return f.code.trim() !== ''; }));
  const badNames = problems.map(function (p) { return p.name; });

  let html = '<h1 class="page-title">我的类库</h1>' +
    '<p class="page-sub">把常用的类写成一个个<b>独立的 .java 文件</b>放在这里，之后在任何示例、练习里都能直接用「类名.方法名(...)」调用它 —— 就像真实项目里把代码拆成多个文件那样。</p>';

  html += '<div class="card"><h2 class="card-title">它是怎么工作的？</h2>' +
    '<ul class="req-list">' +
      '<li>你在这里写好的每个文件，文件名要和里面定义的 <code>public class</code> 同名，例如 <code>Calculator.java</code> 里必须写 <code>public class Calculator</code>。</li>' +
      '<li>点「▶ 运行代码」时，学习软件会把「类库文件 + 当前代码」拼在一起编译运行 —— 这正是 Java 多文件协作的原理。</li>' +
      '<li>于是你的代码里可以直接写 <code>Calculator.add(1, 2)</code>，不用把方法复制粘贴一遍。</li>' +
      '<li>同一个类名只能定义一次：如果某个练习自带的辅助文件和你类库里的文件重名，会以练习自带的为准。</li>' +
      '<li>类库默认在<b>所有</b>运行中自动附带，可以在下面关掉。</li>' +
      '<li>一个类库文件里也可以有 <code>main</code> 方法，它只会被当作普通方法存在，入口仍然优先用你当前写的代码。</li>' +
    '</ul></div>';

  html += '<div class="card"><h2 class="card-title">运行设置</h2>' +
    '<label class="dep-toggle"><input type="checkbox" id="libAuto"' + (state.libraryAuto !== false ? ' checked' : '') + ' /> ' +
      '在所有示例和练习中自动附带我的类库（推荐）</label>' +
    '<div class="small faint mt-1">关掉之后，示例运行就不带类库了；练习区里仍可单独按需勾选。类库里的代码如果有语法错误，会拖累所有运行，下面会帮你标出来。</div>' +
  '</div>';

  if (problems.length) {
    html += '<div class="callout warn">下面的文件有语法问题，会影响所有运行，建议先修好：' +
      problems.map(function (p) { return '<div class="small">· <b>' + esc(p.name) + '</b>：' + esc(p.error) + '</div>'; }).join('') + '</div>';
  }

  html += '<div class="card"><h2 class="card-title">类库文件（' + entries.length + ' 个）</h2>';
  if (!entries.length) {
    html += '<div class="small muted">还没有文件。点下面的「插入示例」先体验一下：示例文件定义了一个计算器工具类，然后在任意练习里写 <code>Calculator.add(1, 2)</code> 就能调用它。</div>';
  } else {
    html += '<div style="display:grid;gap:10px">';
    entries.forEach(function (f) {
      const bad = badNames.indexOf(f.name) >= 0;
      const lines = f.code.trim().split('\n');
      html += '<div class="lib-item">' +
        '<div class="row between" style="gap:8px">' +
          '<span class="lib-name">📄 ' + esc(f.name) + (bad ? ' <span class="tag warn">有语法问题</span>' : '') + '</span>' +
          '<span class="row" style="gap:6px">' +
            '<button class="btn sm ghost" data-libedit="' + esc(f.name) + '">编辑</button>' +
            '<button class="btn sm ghost" data-libdel="' + esc(f.name) + '">删除</button>' +
          '</span>' +
        '</div>' +
        '<pre class="lib-preview">' + esc(lines.slice(0, 6).join('\n')) + (lines.length > 6 ? '\n…' : '') + '</pre>' +
      '</div>';
    });
    html += '</div>';
  }
  html += '<div class="row mt-2">' +
    '<button class="btn sm primary" id="libNew">＋ 新建文件</button>' +
    '<button class="btn sm ghost" id="libExample">插入示例：Calculator.java</button>' +
  '</div></div>';

  html += '<div class="card" id="libEditorCard" style="display:none">' +
    '<h2 class="card-title" id="libEditorTitle">编辑文件</h2>' +
    '<div class="small muted">文件名（要含 .java，并且和 public 类名一致）</div>' +
    '<input class="lib-input" id="libName" placeholder="Calculator.java" spellcheck="false" />' +
    '<div class="small muted mt-2">代码内容（注意给每段逻辑写注释，方便以后自己看得懂）</div>' +
    '<textarea class="editor" id="libCode" spellcheck="false" style="min-height:300px"></textarea>' +
    '<div class="row mt-1">' +
      '<button class="btn sm primary" id="libSave">保存文件</button>' +
      '<button class="btn sm ghost" id="libCheck">语法检查</button>' +
      '<button class="btn sm ghost" id="libCancel">取消</button>' +
    '</div>' +
    '<div id="libCheckOut" class="mt-1"></div>' +
  '</div>';

  setMain(html);

  qs('#libAuto').onchange = (e) => {
    state.libraryAuto = !!e.target.checked;
    saveState();
    toast(e.target.checked ? '已开启：运行时会自动带上我的类库' : '已关闭：示例运行不再自动带类库', e.target.checked ? 'ok' : 'warn');
  };

  let editingName = null;

  // 类库编辑器里按 Tab 也能缩进（和练习区编辑器一致，方便写代码）
  qs('#libCode').addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    e.preventDefault();
    const box = e.target;
    const start = box.selectionStart, end = box.selectionEnd;
    box.value = box.value.slice(0, start) + '    ' + box.value.slice(end);
    box.selectionStart = box.selectionEnd = start + 4;
  });

  function openEditor(name) {
    const rec = (name && state.library[name]) ? state.library[name] : null;
    editingName = rec ? name : null;
    const card = qs('#libEditorCard');
    card.style.display = 'block';
    qs('#libEditorTitle').textContent = rec ? ('编辑 ' + name) : '新建文件';
    qs('#libName').value = rec ? name : 'Calculator.java';
    qs('#libCode').value = rec ? rec.code : LIB_EXAMPLE;
    qs('#libCheckOut').innerHTML = '';
    card.scrollIntoView({ behavior: 'smooth', block: 'start' });
    qs('#libName').focus();
  }

  qs('#libNew').onclick = () => openEditor(null);
  qs('#libExample').onclick = () => { openEditor(null); qs('#libName').value = 'Calculator.java'; qs('#libCode').value = LIB_EXAMPLE; };
  qsa('[data-libedit]').forEach(b => { b.onclick = () => openEditor(b.getAttribute('data-libedit')); });

  qsa('[data-libdel]').forEach(b => {
    b.onclick = () => {
      const n = b.getAttribute('data-libdel');
      confirmDialog('删除类库文件 ' + n + '？', '删除后，任何依赖它的代码都会报「找不到类」。这个操作无法撤销。', () => {
        removeLibraryFile(n);
        LIB_PROBLEM_CACHE = { sig: '', list: [] };
        toast('已删除 ' + n, 'warn');
        viewLibrary();
        renderChrome();
      }, '删除');
    };
  });

  qs('#libCancel').onclick = () => { qs('#libEditorCard').style.display = 'none'; editingName = null; };

  qs('#libCheck').onclick = () => {
    const name = qs('#libName').value.trim() || 'Untitled.java';
    const code = qs('#libCode').value;
    const out = qs('#libCheckOut');
    if (!code.trim()) { out.innerHTML = '<div class="small warn-text">代码是空的，先写点内容再检查。</div>'; return; }
    const probe = 'public class LibraryProbe { public static void main(String[] args) { } }';
    let res;
    try { res = window.JavaRunner.run(probe, '', { files: [{ name: name, code: code }] }); }
    catch (e) { res = { ok: false, error: String(e && e.message ? e.message : e) }; }
    if (res && res.ok) {
      const cls = /(?:class|interface)\s+(\w+)/.exec(code);
      const fname = /^[A-Za-z_$][A-Za-z0-9_$]*\.java$/.test(name) ? name.replace(/\.java$/, '') : '';
      let extra = '';
      if (cls && fname && cls[1] !== fname) {
        extra = '<div class="small faint">⚠ 提醒：文件名叫 ' + esc(name) + '，但里面第一个类叫 ' + esc(cls[1]) + '。Java 要求 public 类名和文件名一致，建议改成 ' + esc(cls[1]) + '.java。</div>';
      }
      out.innerHTML = '<div class="small ok-text">✔ 语法检查通过，可以用「类名.方法名(...)」调用它了。</div>' + extra;
    } else {
      out.innerHTML = '<div class="callout warn" style="margin:6px 0 0">' + esc((res && res.error) || '检查失败') + '</div>' +
        '<div class="small faint">常见原因：括号/分号不配对、类名写错、用了运行器暂不支持的语法。</div>';
    }
  };

  qs('#libSave').onclick = () => {
    const name = qs('#libName').value.trim();
    const err = libraryFileNameOk(name);
    if (err) { toast(err, 'err'); return; }
    const code = qs('#libCode').value;
    if (!code.trim()) { toast('代码不能是空的', 'err'); return; }
    if (editingName && editingName !== name) removeLibraryFile(editingName);
    upsertLibraryFile(name, code);
    LIB_PROBLEM_CACHE = { sig: '', list: [] };
    toast('已保存到我的类库：' + name, 'ok');
    viewLibrary();
    renderChrome();
  };
}

/* ---------- 手机打开：把局域网地址告诉用户 ---------- */
// 判断当前页面是不是在本机（电脑）上打开的；如果 hostname 是 IP，说明已经在手机/局域网设备上
function isLocalHostName(host) {
  return /^(localhost|127\.0\.0\.1|::1|\[::1\]|)$/i.test(String(host || ''));
}

// 局域网内网地址（手机通过 WiFi 访问电脑时就是这种）
function isPrivateIpHost(host) {
  return /^(10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[01])\.|169\.254\.)/.test(String(host || ''));
}

// 当前页面的完整网址（要保留子路径：GitHub Pages 的项目地址形如 /项目名/）
function currentPageUrl() {
  if (location.protocol === 'file:') return location.href.split('#')[0];
  return location.protocol + '//' + location.host + (location.pathname || '/');
}

// 当前页面的打开方式：local=本机 / lan=局域网 IP / public=已部署到公网
function hostKind() {
  const h = String(location.hostname || '');
  if (isLocalHostName(h)) return 'local';
  if (isPrivateIpHost(h)) return 'lan';
  return 'public';
}

function phoneUrlRow(url, note) {
  return '<div class="phone-url">' +
    '<code>' + esc(url) + '</code>' +
    '<button class="btn sm primary" data-copyurl="' + esc(url) + '">复制</button>' +
    (note ? '<div class="small faint">' + esc(note) + '</div>' : '') +
  '</div>';
}

function showPhonePanel() {
  const kind = hostKind();
  const curUrl = currentPageUrl();
  const onPhone = (kind === 'lan');

  const overlay = el('<div class="overlay"><div class="modal phone-modal">' +
    '<div class="card-title">📱 在手机上打开这个学习软件</div>' +
    '<div id="phoneBody" class="small muted">正在读取本机的局域网地址…</div>' +
    '<div class="row" style="justify-content:flex-end;margin-top:14px">' +
      '<button class="btn primary" data-act="close">知道了</button>' +
    '</div></div></div>');
  document.body.appendChild(overlay);

  const close = () => overlay.remove();
  qs('[data-act="close"]', overlay).onclick = close;
  overlay.onclick = (e) => { if (e.target === overlay) close(); };

  // 复制按钮统一在这里绑定
  function bindCopies() {
    qsa('[data-copyurl]', overlay).forEach(b => {
      b.onclick = () => copyText(b.getAttribute('data-copyurl'));
    });
  }

  const steps = '<div class="mt-2"><b class="small">手机上的操作步骤</b>' +
      '<ol class="lesson-list small">' +
        '<li>确认手机连的 WiFi 和电脑是<b>同一个</b>（别用手机流量）。</li>' +
        '<li>在手机浏览器地址栏里输入上面的地址，要带 <code>http://</code>。</li>' +
        '<li>如果是用微信点开的，点右上角「···」→「在浏览器打开」，运行代码、复制代码这些功能才完整。</li>' +
        '<li>电脑上那个命令行窗口要<b>一直开着</b>，关掉手机就访问不了了。</li>' +
      '</ol></div>';

  const trouble = '<details class="mt-2"><summary class="small muted" style="cursor:pointer">打不开？点这里看排查清单</summary>' +
      '<ul class="lesson-list small">' +
        '<li>电脑上的服务器窗口还在吗？关了要重新双击「启动学习软件.bat」。</li>' +
        '<li>第一次运行时 Windows 会弹防火墙提示，要选「允许访问」（专用和公用网络都勾上）。</li>' +
        '<li>手机和电脑是不是连在同一个路由器 / 同一个 WiFi 名字下。</li>' +
        '<li>公司、学校、公共 WiFi 常常禁止设备互访，可以打开手机热点让电脑连上，再回来看新地址。</li>' +
        '<li>路由器重启、换了 WiFi 之后 IP 会变，重新点这个按钮看一次就行。</li>' +
      '</ul></details>';

  const syncNote = '<div class="callout tip mt-2" style="margin-bottom:0">' +
      '<b>关于进度：</b>学习进度保存在「当前浏览器」里，电脑和手机的进度互相独立、不会自动同步。' +
      '想带着进度走，用电脑上的「我的进度 → 导出进度」复制那串 JSON，再到手机上的「我的进度 → 导入进度」粘贴进去。</div>';

  const body = qs('#phoneBody', overlay);

  // 情况一：已经是在手机（或局域网里的其他设备）上打开
  if (onPhone) {
    body.className = 'small';
    body.innerHTML = '<div class="small">你现在已经是在手机 / 局域网设备上打开啦，这个地址就是：</div>' +
      phoneUrlRow(curUrl, '收藏这个地址，下次直接打开') + syncNote;
    bindCopies();
    return;
  }

  // 情况二：这个网站已经发布到公网了（例如托管在 GitHub Pages / Cloudflare Pages 上）
  if (kind === 'public') {
    body.className = 'small';
    body.innerHTML = '<div class="small">这个网站已经在公网上了，开机、关机都能访问。把这个链接发到手机、或者发给同学就能打开：</div>' +
      phoneUrlRow(curUrl, '这就是完整的网址（http 或 https 开头）') +
      '<div class="mt-2"><b class="small">怎么发到手机上</b>' +
        '<ol class="lesson-list small">' +
          '<li>在手机上用微信 / QQ 把上面这个链接发给自己，点开就能看。</li>' +
          '<li>或者手机浏览器直接输入这个网址。</li>' +
          '<li>手机上也能写代码、点「▶ 运行代码」看输出，进度会记在这台手机的浏览器里。</li>' +
        '</ol></div>' +
      '<div class="small faint mt-1">它跑在托管服务器上，和你自己的电脑有没有开机没关系。</div>' +
      syncNote;
    bindCopies();
    return;
  }

  // 情况三：在电脑上打开，去问本地服务器要局域网地址
  body.className = 'small';

  function render(urls, extraNote) {
    let html = '<div class="small">手机和电脑连上<b>同一个 WiFi</b>，然后在手机浏览器里打开下面的地址：</div>';
    html += urls.map(u => phoneUrlRow(u.url, u.iface ? ('来自网卡：' + u.iface) : '')).join('');
    if (extraNote) html += '<div class="small faint mt-1">' + esc(extraNote) + '</div>';
    html += steps + trouble + syncNote;
    body.innerHTML = html;
    bindCopies();
  }

  fetch('lan.json', { cache: 'no-store' })
    .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
    .then(d => {
      const urls = (d && d.urls) || [];
      if (!urls.length) {
        render([{ url: curUrl, iface: '' }], '没有检测到局域网地址：请确认电脑已经连上 WiFi 或网线，然后重新运行「启动学习软件.bat」。');
      } else {
        // 记下来，下次即使服务器没开也能把地址给用户看
        state.phoneUrls = urls;
        state.phoneCheckedAt = Date.now();
        saveState();
        render(urls, urls.length > 1 ? '上面有多个地址时，挨个在手机上试一下（可能有一个是虚拟网卡）。' : '');
      }
    })
    .catch(() => {
      const cached = (state.phoneUrls || []).filter(u => u && u.url);
      let html = '';
      if (cached.length) {
        html += '<div class="small">这是<b>上次</b>读到的手机访问地址（如果路由器重启或换了 WiFi，IP 可能会变）：</div>';
        html += cached.map(u => phoneUrlRow(u.url, u.iface ? ('来自网卡：' + u.iface) : '')).join('');
        html += '<div class="small faint mt-1">想让软件重新确认一遍：关掉电脑上那个命令行窗口，重新双击「启动学习软件.bat」，再点这个按钮。</div>';
      } else {
        html += '<div class="small">没能读到局域网地址（本机服务器可能没在运行）。两个办法：</div>' +
          '<div class="small muted mt-1"><b>办法一：</b>看电脑上那个命令行窗口，找到 <code>Open on your phone</code> 下面的地址，直接照着在手机上输入。</div>' +
          '<div class="small muted mt-1"><b>办法二：</b>如果窗口里根本没有这行地址，说明启动方式不对（比如直接用 <code>index.html</code> 打开的）。关掉窗口，双击文件夹里的 <b>启动学习软件.bat</b> 再试一次。</div>';
      }
      html += steps + trouble + syncNote;
      body.innerHTML = html;
      bindCopies();
    });
}

/* ---------- 路由 ---------- */
function route() {
  const raw = (location.hash || '#/home').slice(2);
  const parts = raw.split('?');
  const seg = parts[0].split('/').filter(Boolean);
  const query = parts[1] || '';
  const getQ = (k) => {
    const m = new RegExp('(?:^|&)' + k + '=([^&]*)').exec(query);
    return m ? decodeURIComponent(m[1]) : '';
  };

  toggleSidebar(false);

  let active;
  if (!seg.length || seg[0] === 'home') { active = 'home'; viewHome(); }
  else if (seg[0] === 'roadmap') { active = 'roadmap'; viewRoadmap(); }
  else if (seg[0] === 'progress') { active = 'progress'; viewProgress(); }
  else if (seg[0] === 'cheatsheet') { active = 'cheatsheet'; viewCheatsheet(getQ('q')); }
  else if (seg[0] === 'library') { active = 'library'; viewLibrary(); }
  else if (seg[0] === 'projects') { active = 'projects'; viewProjects(); }
  else if (seg[0] === 'project') { active = 'project'; viewProject(seg[1]); }
  else if (seg[0] === 'chapter') { active = 'chapter'; viewChapter(seg[1]); }
  else { viewHome(); }

  renderChrome();
  if (active === 'chapter') toggleSidebar(false);
}

function initApp() {
  applyTheme();
  renderChrome();
  window.addEventListener('hashchange', route);
  if (!location.hash) location.hash = '#/home';
  route();
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') toggleSidebar(false);
  });
  window.addEventListener('beforeunload', saveState);
}

document.addEventListener('DOMContentLoaded', initApp);
