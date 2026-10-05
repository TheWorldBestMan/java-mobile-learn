/* 项目工坊 · 从控制台到 App 的 6 个实战项目 */
window.PROJECTS = [
  {
    id: 'p1',
    title: '项目 1：控制台计算器',
    level: '入门',
    hours: '3~5 小时',
    after: ['j1', 'j2', 'j3', 'j4', 'j5'],
    summary: '第一个完整程序：从键盘读入两个数和运算符，输出计算结果。练的是流程控制、输入输出和输入校验。',
    skills: ['Scanner 输入', 'if / switch 分支', 'while 循环', '方法抽取', '异常处理入门'],
    features: [
      '必做：支持 + - * / 四则运算',
      '必做：除数为 0 时给出提示，不崩溃',
      '必做：输入非法（比如运算符敲成 #）时提示重试',
      '必做：计算完成后询问“是否继续计算”，输入 y 继续、n 退出',
      '进阶：支持连续运算（如 1+2+3，用上一次结果继续算）',
      '进阶：支持 % 取余与平方根 sqrt',
      '进阶：记录本次运行一共算了多少道题'
    ],
    steps: [
      { title: '第 1 步：先写出最笨的版本', detail: '用 Scanner 读两个 double 和一个 String 运算符，用 if-else 输出结果。不要一开始就想着支持连续运算。' },
      { title: '第 2 步：把计算逻辑抽成方法', detail: '写 double calculate(double a, String op, double b)，主干代码只负责输入输出。这样分支逻辑就集中在一个地方了。' },
      { title: '第 3 步：加除法与输入的防御', detail: '除以 0 时输出“除数不能为 0”；用 try/catch 包住 Double.parseDouble 或使用 hasNextDouble 判断输入类型。' },
      { title: '第 4 步：加上循环', detail: '用 while(true) 包住整个流程，计算完成后询问是否继续，输入 n 时 break。' },
      { title: '第 5 步：自己测边界', detail: '测：除零、负数、小数、非数字输入、连续计算 20 次。把遇到问题的原因记到笔记里。' }
    ],
    acceptance: [
      '程序能连续计算，不需要每次重启',
      '所有非法输入都有提示，程序不崩溃',
      '计算逻辑集中在方法里，main 方法不超过 40 行',
      '自己至少发现并修复 2 个 bug（写进笔记）'
    ],
    hints: [
      '读运算符：String op = sc.next(); 然后用 switch 判断，注意 break',
      '字符串比较运算符：op.equals("+")，不要用 ==',
      '保留两位小数：String.format("%.2f", result)'
    ],
    stretch: '把历史记录保存到 history.txt，启动时读取并显示上次的 5 条计算记录。'
  },
  {
    id: 'p2',
    title: '项目 2：学生成绩管理系统',
    level: '简单',
    hours: '6~8 小时',
    after: ['j6', 'j7', 'j8', 'j9'],
    summary: '用面向对象的方式管理一个班的学生：增删改查、统计、排序、按条件筛选。这是把“数组 + 方法 + 类”串起来的经典练习。',
    skills: ['类与对象', '对象数组 / ArrayList', '方法设计', '封装', '排序与统计'],
    features: [
      '必做：Student 类（学号、姓名、三门课成绩），封装 + getter/setter',
      '必做：能添加学生、按学号删除学生',
      '必做：按学号或姓名查询学生信息',
      '必做：统计每门课的平均分、最高分、最低分',
      '必做：按总分从高到低排序并输出排行榜',
      '必做：控制台菜单（1 添加 2 删除 3 查询 4 统计 5 排序 6 退出）',
      '进阶：按分数段统计人数（90+ / 80-89 / 60-79 / 不及格）',
      '进阶：把数据保存到 students.txt，启动时自动读取'
    ],
    steps: [
      { title: '第 1 步：设计类结构', detail: 'Student 类放数据；StudentManager 类放业务方法（add / remove / find / statistics / sort）。main 只做菜单和调用。' },
      { title: '第 2 步：用 ArrayList 存数据', detail: '先不要考虑文件，全部内存操作，确保增删改查都对。' },
      { title: '第 3 步：写统计与排序', detail: '统计用一次遍历；排序可以用 Collections.sort + Comparator，也可以手写冒泡练手。' },
      { title: '第 4 步：做控制台菜单', detail: 'while 循环 + switch。每个功能一个方法，注意输入校验（学号不存在怎么办）。' },
      { title: '第 5 步：加文件持久化', detail: '每行存 “学号,姓名,语文,数学,英语”；读取时用 split(",") 解析。读写都要 try-with-resources。' }
    ],
    acceptance: [
      '菜单能一直循环，输入 6 才退出',
      '删除不存在的学号、查询不存在的学生都有友好提示',
      '排行榜按总分降序，分数相同的按学号升序',
      '数据能保存到文件，重启程序后还在',
      'main 方法不超过 60 行，业务逻辑都在 Manager 里'
    ],
    hints: [
      'toString 重写好后，System.out.println(student) 就能直接输出一行信息',
      'Comparator 排序：students.sort(Comparator.comparingInt(Student::getTotal).reversed())',
      '一句话菜单可以用 String.format 对齐输出，界面好看很多'
    ],
    stretch: '增加“按课程筛选”：输入课程名，列出该课程不及格的学生名单。'
  },
  {
    id: 'p3',
    title: '项目 3：记账本（控制台 + 数据持久化）',
    level: '中等',
    hours: '8~12 小时',
    after: ['j9', 'j11', 'j12', 'j13'],
    summary: '记录每天的收支，能按月统计、按类别汇总、查询明细。重点是异常处理、集合统计与文件持久化。',
    skills: ['封装与校验', '集合与 HashMap 统计', 'LocalDate 日期处理', 'IO 读写', '自定义异常'],
    features: [
      '必做：一条记录包含 日期、类型（收入/支出）、金额、分类、备注',
      '必做：添加记录时校验金额 > 0、类型只能是收入或支出',
      '必做：按月份查看明细（输入 2026-09，列出该月全部记录）',
      '必做：按月统计总收入、总支出、结余',
      '必做：按分类汇总支出（用 HashMap 统计，例如 餐饮 320，交通 88）',
      '必做：所有记录保存到 records.csv，启动时读取',
      '进阶：查询指定日期区间（如 2026-09-01 ~ 2026-09-15）的记录',
      '进阶：导出月度报表 report_2026-09.txt，内容对齐美观'
    ],
    steps: [
      { title: '第 1 步：设计记录类', detail: 'Record 类：id、date（LocalDate）、type、amount（double 或分为单位用 long）、category、note。构造器里做参数校验，非法直接抛 IllegalArgumentException。' },
      { title: '第 2 步：设计管理类', detail: 'RecordManager：add、listByMonth、summaryByMonth、summaryByCategory、save、load。' },
      { title: '第 3 步：先做内存版', detail: '用 ArrayList 存记录，手动 add 几条测试数据，先把统计逻辑跑对再考虑输入菜单。' },
      { title: '第 4 步：加文件读写', detail: '格式：id,date,type,amount,category,note。读取时逐行 split 解析，遇到格式错误的行跳过并打印警告，不要整个程序崩溃。' },
      { title: '第 5 步：做报表输出', detail: '用 String.format 对齐列宽，例如 %-10s %8.2f。做一个“总计”行。' }
    ],
    acceptance: [
      '金额、日期格式非法时给出明确提示，不崩溃',
      '月度统计结果与手算一致',
      '分类汇总按金额降序排列',
      '重启程序后数据完整（包括中文备注）',
      '导出报表文件能用记事本打开且对齐正常'
    ],
    hints: [
      '记录金额建议用 long 存“分”，避免 double 精度问题；展示时再除以 100',
      'LocalDate.parse("2026-09-24") 直接可用；判断月份：date.getYear()==2026 && date.getMonthValue()==9',
      'HashMap 统计：map.put(cat, map.getOrDefault(cat, 0.0) + amount)',
      '写文件时若用 FileWriter 覆盖会清空原文件，追加要传 true'
    ],
    stretch: '加入“预算”功能：设置每月预算，超支时用醒目的方式提醒，并计算超支百分比。'
  },
  {
    id: 'p4',
    title: '项目 4：图书借阅管理系统',
    level: '较难',
    hours: '12~18 小时',
    after: ['j10', 'j11', 'j12', 'j13'],
    summary: '一个接近真实业务的小系统：图书、读者、借阅记录三者关联，支持借书、还书、逾期计算、搜索与排序。',
    skills: ['继承与多态', '接口', '集合嵌套', '日期计算', 'IO 持久化', '自定义异常'],
    features: [
      '必做：Book（isbn、书名、作者、分类、是否在馆）、Reader（学号、姓名、已借数量）',
      '必做：抽象类 LibraryItem + 子类 Book / Magazine，用多态统一管理藏品',
      '必做：接口 Borrowable（borrow / returnItem / isBorrowed）',
      '必做：借书：同一本书不能重复借、读者最多借 3 本、不在馆不能借',
      '必做：还书：计算是否逾期（借期 30 天），逾期输出应缴罚金（每天 0.5 元）',
      '必做：搜索：按书名关键字模糊搜索、按作者搜索、按分类列出',
      '必做：排序：书名升序、借阅次数降序',
      '必做：保存图书、读者、借阅记录到三个文件，启动时全部读回',
      '必做：自定义异常 BorrowException，业务错误统一用它抛出并友好提示',
      '进阶：统计最受欢迎的 5 本书'
    ],
    steps: [
      { title: '第 1 步：画数据关系', detail: '在纸上写出三个类的关系：Reader 借 Book，产生 BorrowRecord（含借出日期、应还日期、归还日期）。别急着写代码。' },
      { title: '第 2 步：先写模型与接口', detail: 'LibraryItem 抽象类、Book / Magazine 子类、Borrowable 接口、BorrowRecord 类。这一步只写字段和方法签名。' },
      { title: '第 3 步：写 LibraryService 业务层', detail: '所有业务规则（最多借 3 本、逾期罚金、重复借书）集中在这里，每个方法入口先做校验。' },
      { title: '第 4 步：做菜单与输入输出', detail: '按功能分菜单：1 藏书管理 2 读者管理 3 借还书 4 查询统计 5 保存退出。' },
      { title: '第 5 步：持久化', detail: '三个文件分别存书、读者、借阅记录。用 ID 关联（记录的 bookIsbn、readerId），读回时重建对象。' },
      { title: '第 6 步：补测试数据', detail: '造 10 本书、3 个读者、几条借阅记录，跑 20 个不同场景（书不在馆、已借满、逾期归还……），看是否有漏洞。' }
    ],
    acceptance: [
      '所有业务规则都有对应校验与提示，不存在“能借不存在的书”这类漏洞',
      '多态生效：LibraryItem 数组里能同时处理 Book 与 Magazine，各自打印不同信息',
      '逾期天数与罚金计算正确（用测试数据验证）',
      '三个文件读写正常，重启后借阅状态不变',
      '代码有清晰的包结构：model / service / util / ui（或 main）'
    ],
    hints: [
      '逾期天数：ChronoUnit.DAYS.between(dueDate, returnDate)，大于 0 才算逾期',
      '模糊搜索：book.getTitle().contains(keyword)，注意先用 toLowerCase 统一大小写',
      '三个文件互相依赖，保存顺序无关，但读取时要先读书和读者，再读借阅记录',
      '把主菜单拆成多个方法（handleBookMenu、handleBorrowMenu），避免一个 main 写 500 行'
    ],
    stretch: '把控制台换成 Android App：图书列表用 RecyclerView，借还用 Intent 跳转详情页。这一步做完，Java 与移动端就真正打通了。'
  },
  {
    id: 'p5',
    title: '项目 5：Android 待办清单 App',
    level: '中等',
    hours: '15~20 小时',
    after: ['a1', 'a2', 'a3', 'a4', 'a5', 'a6'],
    summary: '第一个真正的 Android App：列表、新增、编辑、删除、完成状态、数据持久化，做完就是一个能装到手机上日常使用的工具。',
    skills: ['Activity + XML 布局', 'RecyclerView 列表', 'Intent 跳转与回传', 'Room 数据库', '状态与三态界面'],
    features: [
      '必做：主界面显示待办列表（RecyclerView + 分割线）',
      '必做：底部或顶部有输入框 + 添加按钮，添加后立刻出现在列表顶部',
      '必做：点击条目切换完成状态（带删除线动画）',
      '必做：长按条目弹出确认对话框，确认后删除',
      '必做：点击条目进入详情页可编辑标题（Intent 传参 + 回传结果）',
      '必做：空列表时显示“还没有待办事项”的提示',
      '必做：数据用 Room 持久化，杀掉 App 再打开数据还在',
      '必做：顶部显示“剩余 N 条未完成”，并支持“清除已完成”',
      '进阶：按完成状态筛选（全部 / 未完成 / 已完成）',
      '进阶：设置页（SharedPreferences 存默认排序方式）'
    ],
    steps: [
      { title: '第 1 步：先做静态界面', detail: '布局 + RecyclerView + Adapter + 手写的 5 条假数据。目标是先看到列表。' },
      { title: '第 2 步：加入交互', detail: '添加、点击切换、长按删除，全部操作内存里的 List，不涉及数据库。' },
      { title: '第 3 步：接上 Room', detail: 'Entity、Dao、Database 三件套，把列表读写换成数据库。每改一个功能就重装验证一次。' },
      { title: '第 4 步：加详情编辑页', detail: '新 Activity + Intent 传参 + registerForActivityResult 接收结果并刷新对应 item。' },
      { title: '第 5 步：打磨细节', detail: '空状态提示、剩余条数统计、删除确认对话框、长文本框里的换行、深色模式下的文字颜色。' },
      { title: '第 6 步：装到自己手机上', detail: '生成签名 APK 安装使用，连续用三天，把不顺手的地方列成清单再改进。' }
    ],
    acceptance: [
      '新增、编辑、删除、切换状态四个功能都正常工作',
      '杀掉 App 后重开，数据完整（包括完成状态与时间）',
      '空列表、只有已完成项等边界情况都有合理界面',
      '快速点击、重复点击不会造成重复数据',
      'APK 已经装在自己的手机上并能正常使用'
    ],
    hints: [
      '数据库操作写在线程池里，用 runOnUiThread 回到主线程更新界面',
      'Adapter 数据更新推荐写一个 submit(List) 方法，内部 notifyDataSetChanged 或 DiffUtil',
      'item 里长按删除要弹 AlertDialog 二次确认，避免误删',
      '深色模式：颜色统一写在 colors.xml，主题里配置 values-night'
    ],
    stretch: '加上“备注 + 截止日期 + 分类标签”，并按截止日期排序，超期任务标红。'
  },
  {
    id: 'p6',
    title: '项目 6：资讯/天气类 App（毕业作品）',
    level: '挑战',
    hours: '25~40 小时',
    after: ['a5', 'a6', 'a7'],
    summary: '一个能写进简历的完整 App：网络接口 + 列表 + 详情 + 搜索 + 本地缓存 + 加载三态 + 发布出来。做完这一项，你就具备初级 Android 岗位的项目经验。',
    skills: ['Retrofit 网络层', 'JSON 解析', 'RecyclerView 多类型 item', 'Room 缓存', 'MVVM（ViewModel + LiveData）', '图片加载与打包发布'],
    features: [
      '必做：首页列表（RecyclerView）从网络接口拉取数据并显示',
      '必做：下拉刷新（SwipeRefreshLayout）',
      '必做：滚动到底部自动加载下一页（分页）',
      '必做：点击列表进入详情页，展示完整内容与图片',
      '必做：搜索功能（输入关键字请求接口并刷新列表）',
      '必做：三种状态齐全：加载中 / 有数据 / 出错可重试',
      '必做：网络失败时降级读取 Room 里的本地缓存，并提示“当前显示缓存数据”',
      '必做：图片用 Glide 加载，列表滚动时不要卡顿',
      '必做：引入 ViewModel + LiveData，Activity 里不直接写网络请求',
      '必做：打包签名 APK，写一份约 500 字的项目说明（功能、技术选型、遇到的坑与解决）',
      '进阶：收藏功能 + 收藏列表页',
      '进阶：分享到微信（隐式 Intent）',
      '进阶：深色模式与中英文双语（values-night、values-en）'
    ],
    steps: [
      { title: '第 1 步：确定接口与数据结构', detail: '选一个公开 API，用浏览器或 Postman 看清返回的 JSON 结构，先写数据模型类，字段与 JSON key 一一对应。' },
      { title: '第 2 步：搭网络层', detail: 'ApiClient（OkHttp + 日志拦截器 + Gson 转换器）+ ApiService 接口。先用一个按钮把 json 打印到 Logcat，确认能通。' },
      { title: '第 3 步：静态列表 → 真实数据', detail: '复用 RecyclerView 那一章（第 20 章）的结构，把假数据换成接口数据。先不做分页。' },
      { title: '第 4 步：加分页与刷新', detail: 'SwipeRefreshLayout 下拉刷新；监听 RecyclerView 滚动到底部触发下一页，注意 page 与 loading 标志位，避免重复请求。' },
      { title: '第 5 步：加详情页', detail: 'Intent 传递 id 或整个对象（Parcelable），详情页再请求详情接口或使用列表已有数据。' },
      { title: '第 6 步：加 Room 缓存', detail: '把列表数据同时写入 Room；网络失败时读缓存并给出提示。' },
      { title: '第 7 步：重构为 MVVM', detail: '把网络与缓存逻辑从 Activity 移到 ViewModel + Repository，用 LiveData 通知界面。这一步做完，代码结构会有质的提升。' },
      { title: '第 8 步：打磨与发布', detail: '处理空状态、错误提示、深色模式适配、应用图标与名称，最后生成签名 APK 并写项目说明。' }
    ],
    acceptance: [
      '冷启动 3 秒内能看到内容（有缓存时更快）',
      '弱网、断网、服务器报错三种情况都不会崩溃，且能重试',
      '分页不重复、不漏数据，快速滑动不崩',
      'Activity 里没有直接出现 Retrofit 调用（都在 ViewModel/Repository）',
      'APK 能装到别人手机上正常使用，项目说明可以讲清技术选型',
      '至少记录 5 个自己踩过的坑以及解决思路（面试会被问到）'
    ],
    hints: [
      '分页关键：用一个 isLoading 布尔量防止重复触发，加载完成后置回 false',
      '详情页传对象用 Parcelable；嫌麻烦可以把数据存到 ViewModel（共享 ViewModel）或传 id 再查一次',
      '缓存策略：先展示缓存（快）再请求网络（新），成功后覆盖缓存并刷新界面',
      '项目说明模板：项目背景 → 功能清单 → 技术方案（架构图/分层）→ 难点与解决 → 如果重做会怎么改'
    ],
    stretch: '用 Kotlin + Jetpack Compose 重写整个列表页，对比两种写法的差异，这一步完成后你就能同时接 Kotlin 与 Java 项目。'
  }
];
