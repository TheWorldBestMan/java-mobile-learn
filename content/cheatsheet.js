/* 速查手册：Java 与 Android 常用写法、高频错误、学习资源 */
window.CHEATSHEET = {
  sections: [
    {
      id: 'java-basic',
      group: 'Java 基础',
      title: '基本语法速查',
      type: 'table',
      head: ['场景', '写法', '注意'],
      rows: [
        ['输出', 'System.out.println("文本");', 'print 不换行，printf 支持格式化'],
        ['格式化输出', 'String.format("%s %d %.2f", a, b, c)', '%s 字符串 %d 整数 %.2f 两位小数'],
        ['读键盘输入', 'Scanner sc = new Scanner(System.in);', '需要 import java.util.Scanner'],
        ['读一行', 'sc.nextLine()', 'nextInt 之后再 nextLine 会读到空串'],
        ['常量', 'final int MAX = 100;', '名字全大写，只能赋值一次'],
        ['类型转换', '(int) 3.99 → 3', '截断而非四舍五入；小转大自动、大转小要写括号'],
        ['字符串转数字', 'Integer.parseInt("123")', '格式错误会抛 NumberFormatException'],
        ['数字转字符串', 'String.valueOf(123) 或 123 + ""', '拼接时注意运算优先级'],
        ['判断相等', 'a == b（基本类型） / s.equals(t)（字符串）', '字符串比较永远用 equals'],
        ['三元运算符', 'int max = a > b ? a : b;', '只适合简单判断，复杂逻辑用 if'],
        ['增强 for', 'for (String s : list) { }', '遍历时不能删除元素'],
        ['数组转字符串', 'Arrays.toString(arr)', '直接 println(arr) 打印的是地址']
      ]
    },
    {
      id: 'java-oop',
      group: 'Java 基础',
      title: '面向对象速查',
      type: 'table',
      head: ['概念', '写法要点', '容易踩的坑'],
      rows: [
        ['类与对象', 'class Student { String name; }  Student s = new Student();', '类名首字母大写，对象用 new 创建'],
        ['构造器', 'public Student(String name) { this.name = name; }', '有参构造器会覆盖默认无参构造器'],
        ['this', 'this.name = name;', 'static 方法里不能用 this'],
        ['封装', 'private 属性 + public getter/setter', 'setter 里要做参数校验'],
        ['static', '静态方法用 类名.方法名() 调用', '静态方法不能访问实例成员'],
        ['继承', 'class Dog extends Animal', 'Java 只能单继承'],
        ['构造器顺序', '父类构造器先执行', '子类要用 super(...) 显式调用'],
        ['重写', '@Override public void eat() { }', '权限不能变严格；static/final 方法不可重写'],
        ['多态', 'Animal a = new Dog();', '父类引用只能调用父类里有的方法'],
        ['抽象类', 'abstract class Shape { abstract double area(); }', '不能 new，子类必须实现抽象方法'],
        ['接口', 'class Book implements Payable', '可以实现多个接口；Java 8+ 支持 default 方法'],
        ['equals/hashCode', '按业务 id 重写两个方法', 'hashCode 是 HashMap / HashSet 的去重依据']
      ]
    },
    {
      id: 'java-collections',
      group: 'Java 基础',
      title: '集合与常用 API',
      type: 'table',
      head: ['需求', '写法', '说明'],
      rows: [
        ['创建列表', 'List<String> list = new ArrayList<>();', '接口声明 + 实现类创建是主流写法'],
        ['添加 / 获取 / 大小', 'list.add(x)  list.get(i)  list.size()', '下标从 0 开始'],
        ['删除', 'list.remove(index) 或 list.remove(obj)', '删除对象用循环时要用迭代器'],
        ['排序', 'Collections.sort(list)', '只适用于 Comparable 元素'],
        ['自定义排序', 'list.sort(Comparator.comparingInt(Student::getScore).reversed())', 'thenComparing 做二级排序'],
        ['去重', 'Set<String> set = new HashSet<>();', 'TreeSet 会自动排序'],
        ['键值对', 'Map<String, Integer> map = new HashMap<>();', 'key 不重复，重复 put 会覆盖'],
        ['安全取值', 'map.getOrDefault(key, 0)', '不存在时返回默认值，避免 null'],
        ['遍历 Map', 'for (Map.Entry<K, V> e : map.entrySet())', '同时拿 key 和 value，效率最高'],
        ['字符串拼接', 'StringBuilder sb = new StringBuilder(); sb.append(x);', '循环里别用 String 的 +'],
        ['日期', 'LocalDate.now()  LocalDate.of(2026, 9, 24)', '不可变；格式化用 DateTimeFormatter'],
        ['日期相减', 'ChronoUnit.DAYS.between(start, end)', '返回 long'],
        ['写文件', 'try (BufferedWriter w = new BufferedWriter(new FileWriter("a.txt"))) { }', 'try-with-resources 自动关闭'],
        ['读文件', 'while ((line = reader.readLine()) != null) { }', '读完返回 null']
      ]
    },
    {
      id: 'primitives',
      group: '基础 API',
      title: '基本类型、字面量与类型转换速查',
      type: 'table',
      head: ['类型', '字节 / 范围', '默认值', '包装类', '示例'],
      rows: [
        ['byte', '1 字节，-128 ~ 127', '0', 'Byte', 'byte b = 100;'],
        ['short', '2 字节，约 ±3.2 万', '0', 'Short', 'short s = 1000;'],
        ['int', '4 字节，约 ±21 亿（最常用）', '0', 'Integer', 'int age = 18;'],
        ['long', '8 字节，很大；字面量后加 L', '0', 'Long', 'long money = 9999999999L;'],
        ['float', '4 字节，约 7 位有效数字；字面量后加 F', '0.0f', 'Float', 'float f = 3.14F;'],
        ['double', '8 字节，约 15 位有效数字（默认小数类型）', '0.0', 'Double', 'double d = 3.14159;'],
        ['char', '2 字节，单个字符，用单引号', '编码为 0 的字符', 'Character', "char c = 'A';"],
        ['boolean', '1 字节，只有 true / false', 'false', 'Boolean', 'boolean ok = true;']
      ]
    },
    {
      id: 'literals',
      group: '基础 API',
      title: '字面量写法与类型转换规则',
      type: 'table',
      head: ['写法', '说明', '示例'],
      rows: [
        ['十进制 / 二进制 / 八进制 / 十六进制', '0b 开头是二进制，0 开头是八进制，0x 开头是十六进制', 'int a = 255;  int b = 0b1111_1111;  int c = 0xFF;'],
        ['下划线分隔', '数字中间可用下划线提高可读性，编译时会被忽略', 'int million = 1_000_000;'],
        ['long / float 后缀', 'long 加 L，float 加 F；不加后缀的小数字面量默认是 double', 'long l = 100L;  float f = 3.14F;'],
        ['char 字面量', '单引号，只能一个字符；也可以直接写编码值', "char a = 'A';  char b = 65;  两者等价"],
        ['字符串字面量', '双引号；String 是引用类型，不是基本类型', 'String s = "hello";'],
        ['自动类型转换', '小范围到大范围，安全，不用写转换', 'int i = 100;  double d = i;  long l = i;'],
        ['强制类型转换', '大范围到小范围，可能丢精度或溢出，必须写括号', 'double pi = 3.99;  int n = (int) pi;  结果是 3，直接截断'],
        ['char 与 int 互转', 'char 本质是编码值，可以互相转换', "int code = 'A';  结果是 65；char c = (char) 97; 结果是 a"],
        ['字符串与数字互转', '数字转字符串用 String.valueOf，字符串转数字用 parseXxx', 'int n = Integer.parseInt("123");  String s = String.valueOf(456);'],
        ['两个大坑', '整数除法 5 / 2 得到 2；int 溢出时最大值加一会变成负数', 'double x = 5 / 2.0;  结果是 2.5']
      ]
    },
    {
      id: 'wrapper',
      group: '基础 API',
      title: 'Integer / Double 等包装类常用函数',
      type: 'table',
      head: ['方法', '作用', '示例与结果'],
      rows: [
        ['Integer.parseInt(s)', '字符串转 int，格式错误抛 NumberFormatException', 'Integer.parseInt("123") 得到 123'],
        ['Integer.parseInt(s, radix)', '按指定进制解析', 'Integer.parseInt("FF", 16) 得到 255'],
        ['Integer.valueOf(s)', '字符串转 Integer 对象', 'Integer.valueOf("12") 得到 12'],
        ['Integer.toString(n) / String.valueOf(n)', '数字转字符串', 'String.valueOf(456) 得到 "456"'],
        ['Integer.compare(a, b)', '比较大小，返回 -1 / 0 / 1', 'Integer.compare(3, 7) 得到 -1'],
        ['Integer.MAX_VALUE / MIN_VALUE', 'int 的最大最小值（做边界判断很有用）', '2147483647 / -2147483648'],
        ['Integer.toBinaryString(n)', '转二进制字符串', 'Integer.toBinaryString(10) 得到 "1010"'],
        ['Integer.toHexString(n) / toOctalString(n)', '转十六进制 / 八进制字符串', 'Integer.toHexString(255) 得到 "ff"'],
        ['Integer.bitCount(n)', '统计二进制里 1 的个数', 'Integer.bitCount(7) 得到 3'],
        ['Integer.max / min / sum', '两个数的最大 / 最小 / 求和', 'Integer.max(3, 7) 得到 7'],
        ['Double.parseDouble(s)', '字符串转 double', 'Double.parseDouble("3.14") 得到 3.14'],
        ['Double.compare(a, b)', '比较两个 double（比直接用 == 安全）', 'Double.compare(1.0, 2.0) 得到 -1'],
        ['Double.isNaN(d) / isInfinite(d)', '判断是不是 NaN / 无穷大', 'Double.isNaN(0.0 / 0.0) 得到 true'],
        ['自动装箱 / 拆箱', 'int 与 Integer 自动转换；集合只能装对象所以要装箱', 'List<Integer> list = new ArrayList<>(); list.add(5);'],
        ['陷阱一：== 比较', 'Integer 缓存 -128~127，这个范围内 == 为 true，超出就是 false', 'Integer a = 127, b = 127; a == b 是 true；换成 128 就是 false'],
        ['陷阱二：null 拆箱', 'Integer 为 null 时参与运算会抛 NullPointerException', 'Integer n = null; int x = n;  抛 NPE']
      ]
    },
    {
      id: 'string-methods',
      group: '基础 API',
      title: 'String 常用方法全表（按用途分类）',
      type: 'table',
      head: ['分类', '方法', '作用与结果（以 s = "Hello Java" 为例）'],
      rows: [
        ['基本信息', 'length()', '字符个数：11'],
        ['基本信息', 'isEmpty() / isBlank()', '是否为空 / 是否只有空白字符（isBlank 需 Java 11+）'],
        ['基本信息', 'charAt(i)', '取第 i 个字符（下标从 0 开始）：s.charAt(0) 得到 H'],
        ['比较', 'equals(t)', '内容是否相同（永远用它比较字符串内容）'],
        ['比较', 'equalsIgnoreCase(t)', '忽略大小写比较'],
        ['比较', 'compareTo(t)', '按字典序比较，返回负数 / 0 / 正数（用于排序）'],
        ['比较', 'contains(t)', '是否包含子串：s.contains("Java") 得到 true'],
        ['比较', 'startsWith(t) / endsWith(t)', '是否以某前缀 / 后缀开头结尾'],
        ['比较', 'matches(regex)', '是否匹配正则表达式'],
        ['查找', 'indexOf(t) / lastIndexOf(t)', '第一次 / 最后一次出现的下标，没有则返回 -1'],
        ['截取', 'substring(start) / substring(start, end)', '截取子串（含头不含尾）：s.substring(0, 5) 得到 Hello'],
        ['替换', 'replace(a, b)', '替换所有出现的子串，返回新字符串'],
        ['替换', 'replaceAll(regex, b) / replaceFirst(regex, b)', '按正则替换全部 / 只替换第一个'],
        ['去空格', 'trim() / strip()', '去掉首尾空白（strip 支持更多空白字符，Java 11+）'],
        ['大小写', 'toUpperCase() / toLowerCase()', '转大写 / 小写'],
        ['拆分', 'split(regex)', '按分隔符拆成数组："a,b,c".split(",") 得到三个元素'],
        ['拆分', 'split(regex, limit)', '限制拆分个数，limit 传 -1 可保留末尾空串'],
        ['拼接', 'String.join(delimiter, 元素...)', '把多个元素拼成字符串：String.join("-", "a", "b") 得到 a-b'],
        ['拼接', 'concat(t) / 加号运算符', '拼接字符串；循环里拼接要用 StringBuilder'],
        ['转换', 'toCharArray()', '转成 char 数组，便于逐字符处理'],
        ['转换', 'getBytes()', '转成字节数组（依赖默认编码，生产环境要显式指定编码）'],
        ['转换', 'valueOf(x)', '任意类型转字符串（静态方法）'],
        ['转换', 'repeat(n)', '重复 n 次（Java 11+）："ab".repeat(2) 得到 abab'],
        ['格式化', 'String.format(fmt, args)', '按格式生成字符串：String.format("%.2f", 3.14159) 得到 3.14'],
        ['格式化', 'printf(fmt, args)', '直接输出格式化内容（System.out.printf）'],
        ['更安全的比较', 'Objects.equals(a, b)', '两边都可能为 null 时用它（java.util.Objects）'],
        ['注意一：不可变', '任何修改都会返回新字符串，原字符串不变', 'String s2 = s.toUpperCase();  s 本身不变'],
        ['注意二：比较', '== 比的是地址，equals 比的是内容', 'new String("a") == "a" 得到 false'],
        ['注意三：循环拼接', '循环里用加号会产生大量临时对象，性能差', '改用 StringBuilder.append()'],
        ['注意四：split 的坑', '按点号拆不能写 split(".")（点号是正则通配符）', '要写成 split("\\.")；按竖线拆写成 split("\\|")']
      ]
    },
    {
      id: 'convert-format',
      group: '基础 API',
      title: 'String 与数字 / 数组互转 + 格式化占位符',
      type: 'table',
      head: ['需求', '写法', '说明'],
      rows: [
        ['String 转 int', 'Integer.parseInt(s)', '格式不对会抛 NumberFormatException'],
        ['String 转 double', 'Double.parseDouble(s)', '同上'],
        ['int / double 转 String', 'String.valueOf(x) 或 x + ""', '推荐 String.valueOf，语义清晰'],
        ['String 转 char[]', 's.toCharArray()', '便于逐字符处理'],
        ['char[] 转 String', 'new String(charArray)', '也可以 new String(arr, 起始, 长度)'],
        ['String 转 String[]', 's.split(",")', '参数是正则，特殊符号要转义'],
        ['String[] 转 String', 'String.join(",", arr)', '比手写循环简洁'],
        ['String 转字节数组', 's.getBytes(StandardCharsets.UTF_8)', '显式指定编码，避免乱码'],
        ['数字补零', 'String.format("%03d", 5)', '结果 005'],
        ['保留两位小数', 'String.format("%.2f", 3.14159)', '结果 3.14（四舍五入）'],
        ['千分位', 'String.format("%,d", 1234567)', '结果 1,234,567'],
        ['左对齐 / 右对齐', 'String.format("%-10s|", "abc") 与 "%10s"', '%-10s 左对齐补空格，%10s 右对齐'],
        ['占位符 %s', '字符串（任意对象会调用 toString）', 'String.format("你好 %s", "小明")'],
        ['占位符 %d', '整数（long 也可以）', 'String.format("%d 个", 5)'],
        ['占位符 %f 与 %.2f', '浮点数 / 保留两位小数', 'String.format("%.2f", 1.5) 得到 1.50'],
        ['占位符 %b %c %n %%', '布尔 / 字符 / 换行 / 百分号本身', 'String.format("%d%%", 90) 得到 90%'],
        ['金额计算', '用 BigDecimal，不要用 double', 'double 有精度误差，0.1 + 0.2 不等于 0.3'],
        ['整数溢出防护', 'Math.addExact / Math.multiplyExact', '溢出时抛 ArithmeticException，而不是悄悄变成负数']
      ]
    },
    {
      id: 'stringbuilder',
      group: '基础 API',
      title: 'StringBuilder / StringBuffer 速查',
      type: 'table',
      head: ['方法 / 主题', '说明', '示例'],
      rows: [
        ['为什么用它', 'String 不可变，循环拼接会产生大量临时对象；StringBuilder 可变，原地追加', '循环一万次拼接，StringBuilder 快几个数量级'],
        ['创建', 'new StringBuilder() / new StringBuilder("初始内容")', 'StringBuilder sb = new StringBuilder();'],
        ['append(x)', '追加任意类型（数字、字符、对象都会转成字符串）', 'sb.append("a").append(1).append(true);'],
        ['insert(i, x)', '在下标 i 处插入', 'sb.insert(0, "前缀");'],
        ['delete(a, b) / deleteCharAt(i)', '删除 [a, b) 区间 / 删除某个字符', 'sb.deleteCharAt(sb.length() - 1);'],
        ['replace(a, b, s)', '用 s 替换 [a, b) 区间', 'sb.replace(0, 2, "XY");'],
        ['reverse()', '反转内容（翻转字符串最方便的写法）', 'new StringBuilder("abc").reverse() 得到 cba'],
        ['charAt(i) / indexOf(s)', '取字符 / 查下标', 'sb.charAt(0)'],
        ['length() / setLength(n)', '长度 / 截断或补齐到指定长度', 'sb.setLength(0);  相当于清空'],
        ['toString()', '转回 String（需要字符串时必须调用）', 'String s = sb.toString();'],
        ['链式调用', '每个修改方法都返回自身，可以连续调用', 'new StringBuilder().append("a").append("b").toString()'],
        ['StringBuilder 与 StringBuffer', 'StringBuilder 更快但线程不安全；StringBuffer 方法带 synchronized，线程安全但慢', '单线程一律用 StringBuilder'],
        ['预设容量', '能预估长度时先指定容量，减少扩容', 'new StringBuilder(1024)'],
        ['与 String 的分工', '少量拼接、常量拼接用 String；循环内拼接用 StringBuilder', '编译期常量拼接会被编译器优化']
      ]
    },
    {
      id: 'math',
      group: '基础 API',
      title: 'Math 数学函数与 Random 速查',
      type: 'table',
      head: ['方法', '作用', '示例与结果'],
      rows: [
        ['Math.abs(x)', '绝对值', 'Math.abs(-5) 得到 5'],
        ['Math.max(a, b) / min(a, b)', '两个数的较大 / 较小值', 'Math.max(3, 7) 得到 7'],
        ['Math.pow(a, b)', 'a 的 b 次方（返回 double）', 'Math.pow(2, 10) 得到 1024.0'],
        ['Math.sqrt(x) / cbrt(x)', '平方根 / 立方根', 'Math.sqrt(16) 得到 4.0'],
        ['Math.round(x)', '四舍五入到整数（返回 long 或 int）', 'Math.round(3.6) 得到 4；注意 Math.round(-1.5) 得到 -1'],
        ['Math.ceil(x) / floor(x)', '向上取整 / 向下取整（返回 double）', 'Math.ceil(3.1) 得到 4.0；Math.floor(3.9) 得到 3.0'],
        ['Math.random()', '返回 [0.0, 1.0) 的随机小数', '生成 1~100：(int)(Math.random() * 100) + 1'],
        ['Math.signum(x)', '符号：正数 1、负数 -1、0 是 0', 'Math.signum(-3.5) 得到 -1.0'],
        ['Math.exp / log / log10', 'e 的 x 次方 / 自然对数 / 常用对数', 'Math.log(Math.E) 得到 1.0'],
        ['Math.sin / cos / tan / atan2', '三角函数（参数是弧度）', 'Math.sin(Math.PI / 2) 得到 1.0'],
        ['Math.toRadians / toDegrees', '角度与弧度互转', 'Math.toRadians(180) 得到 π'],
        ['Math.PI / Math.E', '圆周率 / 自然常数', '3.141592653589793'],
        ['Math.addExact / multiplyExact', '溢出时抛异常，适合金额等敏感计算', 'Math.addExact(Integer.MAX_VALUE, 1) 抛异常'],
        ['Random 类', '更灵活的随机数（可指定种子，便于复现）', 'Random r = new Random();'],
        ['r.nextInt(bound)', '随机整数 [0, bound)', 'r.nextInt(6) + 1 得到 1~6（掷骰子）'],
        ['r.nextInt() / nextDouble() / nextBoolean()', '随机 int / double [0,1) / 布尔', 'r.nextDouble()'],
        ['保留两位小数', 'String.format("%.2f", x) 或 Math.round(x * 100) / 100.0', 'String.format("%.2f", 3.14159) 得到 3.14'],
        ['取整陷阱', 'round 是四舍五入到最近整数，负数要小心；要固定小数位用 String.format', 'Math.round(-1.5) 得到 -1；Math.round(2.5) 得到 3']
      ]
    },
    {
      id: 'char-arrays',
      group: '基础 API',
      title: 'Character / char 与 Arrays 工具类',
      type: 'table',
      head: ['方法 / 主题', '作用', '示例与结果'],
      rows: [
        ['Character.isDigit(c)', '是不是数字字符', "Character.isDigit('5') 得到 true"],
        ['Character.isLetter(c)', '是不是字母', "Character.isLetter('A') 得到 true"],
        ['Character.isLetterOrDigit(c)', '字母或数字', "Character.isLetterOrDigit('a') 得到 true"],
        ['Character.isUpperCase / isLowerCase(c)', '是不是大写 / 小写字母', "Character.isUpperCase('A') 得到 true"],
        ['Character.isWhitespace(c)', '是不是空白字符（空格、制表符、换行）', "Character.isWhitespace(' ') 得到 true"],
        ['Character.toUpperCase / toLowerCase(c)', '字符大小写转换（返回 char）', "Character.toUpperCase('a') 得到 A"],
        ['Character.getNumericValue(c)', '字符转数字值', "Character.getNumericValue('7') 得到 7"],
        ['Character.toString(c)', '字符转字符串', "Character.toString('A') 得到字符串 A"],
        ['char 转数字的常用写法', '字符数字减去字符 0 的编码值', "int n = '5' - '0';  得到 5"],
        ['Arrays.toString(arr)', '数组转可读字符串（打印数组必须用它）', '得到类似 [1, 2, 3]'],
        ['Arrays.sort(arr)', '原地升序排序（对象数组可传 Comparator）', 'Arrays.sort(nums);'],
        ['Arrays.sort(arr, from, to)', '只排序区间 [from, to)', 'Arrays.sort(nums, 0, 3);'],
        ['Arrays.fill(arr, v)', '用 v 填充整个数组', 'Arrays.fill(nums, 0);'],
        ['Arrays.copyOf / copyOfRange', '复制数组 / 复制指定区间（也可用来扩容）', 'Arrays.copyOf(nums, nums.length * 2)'],
        ['Arrays.equals(a, b)', '内容是否完全相同', '返回 true / false'],
        ['Arrays.binarySearch(arr, x)', '二分查找（数组必须已排序），找不到返回负数', '返回下标，或 -(插入点 + 1)'],
        ['Arrays.asList(arr)', '数组转 List（固定长度，不能 add / remove）', '需要可变就再包一层 new ArrayList<>(...)'],
        ['Arrays.deepToString(arr)', '二维或嵌套数组转字符串', '得到类似 [[1, 2], [3, 4]]'],
        ['Arrays.stream(arr)', '数组转流（可配合 sum / max / filter 等）；本课程浏览器运行器暂不支持 Stream，请在 IDEA 里使用', 'Arrays.stream(nums).sum()']
      ]
    },
    {
      id: 'basic-snippets',
      group: '基础 API',
      title: '最常用的 8 段基础代码片段',
      type: 'code',
      codeTitle: 'Basics.java · 每天都会用到的写法',
      note: '这 8 段覆盖了入门阶段最常见的数字与字符串处理：保留小数、随机数、补零、翻转、回文、闰年、字符分类、字符串去重。',
      code: `import java.util.LinkedHashSet;   // 保序的 Set：用来做"去重但保留原顺序"
import java.util.Random;           // 随机数工具类
import java.util.Set;              // Set 接口

/**
 * 演示：入门阶段最常写的 8 段代码。
 * 每一段都可以单独复制到 IDE 里运行，输出结果写在每段末尾的注释里。
 */
public class Basics {
    public static void main(String[] args) {
        // ================= 一、保留两位小数（两种常用写法） =================
        double price = 3.14159;
        // 写法 A：String.format("%.2f", x) —— 返回字符串，会自动四舍五入
        System.out.println("格式化保留两位：" + String.format("%.2f", price));   // 3.14
        // 写法 B：先乘 100、四舍五入取整、再除以 100.0 —— 结果是 double
        System.out.println("四舍五入保留两位：" + (Math.round(price * 100) / 100.0));   // 3.14

        // ================= 二、生成 [1, 100] 的随机整数 =================
        Random random = new Random();
        // nextInt(100) 返回 [0, 100)，加 1 之后变成 [1, 100]
        int r = random.nextInt(100) + 1;
        System.out.println("随机数在 1~100 之间：" + (r >= 1 && r <= 100));   // true

        // ================= 三、数字补零（编号、日期字符串常用） =================
        for (int i = 1; i <= 2; i++) {
            // %03d：不足 3 位就在左边补 0，所以 1 变成 001
            System.out.println("编号：" + String.format("A%03d", i));
        }

        // ================= 四、翻转字符串 =================
        String origin = "hello";
        // StringBuilder 提供了 reverse()，比手写循环更简洁
        String reversed = new StringBuilder(origin).reverse().toString();
        System.out.println("翻转结果：" + reversed);   // olleh

        // ================= 五、判断回文（忽略大小写） =================
        String word = "Level";
        String lower = word.toLowerCase();                              // 先统一成小写
        String back = new StringBuilder(lower).reverse().toString();    // 再翻转
        System.out.println("是回文：" + lower.equals(back));              // true

        // ================= 六、判断闰年 =================
        int year = 2024;
        // 闰年规则：能被 4 整除且不能被 100 整除，或者能被 400 整除
        boolean leap = (year % 4 == 0 && year % 100 != 0) || (year % 400 == 0);
        System.out.println(year + " 是闰年：" + leap);   // true

        // ================= 七、字符分类统计 =================
        String text = "Ab3 xY7";
        int digits = 0;      // 数字字符个数
        int letters = 0;     // 字母个数
        for (char c : text.toCharArray()) {          // toCharArray()：转成字符数组再遍历
            if (Character.isDigit(c)) {
                digits++;
            } else if (Character.isLetter(c)) {
                letters++;
            }
        }
        System.out.println("数字 " + digits + " 个，字母 " + letters + " 个");   // 数字 2 个，字母 4 个

        // ================= 八、字符串去重并保持原顺序 =================
        String raw = "banana";
        Set<Character> set = new LinkedHashSet<>();  // LinkedHashSet 保证"去重 + 保留添加顺序"
        for (char c : raw.toCharArray()) {
            set.add(c);                              // 重复的元素加不进去
        }
        System.out.println("去重后：" + set);         // [b, a, n]
    }
}`
    },
    {
      id: 'class-anatomy',
      group: '面向对象',
      title: '一个类由哪些部分组成（完整骨架）',
      type: 'code',
      codeTitle: 'Student.java · 类的完整结构',
      note: 'Java 里写任何类都是这个结构：**包声明 → 导入 → 类声明 → 字段（属性）→ 构造器 → 方法**，再加上静态代码块和内部类。记住这张骨架，就不会再“不知道代码该写在哪”。',
      code: `package com.example.demo;              // ① 包声明：文件第一行，与目录结构一一对应

import java.util.List;                 // ② 导入：用别的包里的类必须先 import（java.lang 下的不用）

/**
 * ③ 类声明：[修饰符] class 类名 [extends 父类] [implements 接口1, 接口2]
 *    - 类名首字母大写，必须与文件名一致（public 类时）
 *    - extends 只能有一个（单继承），implements 可以写多个（多实现）
 */
public class Student extends Person implements Comparable<Student> {

    // ④ 字段（属性）：[修饰符] 类型 名字 [= 初始值];
    private String name;                          // 实例字段：每个对象各一份，默认值为 null
    private int age = 18;                         // 声明时可以直接给初始值
    private static int count = 0;                 // 静态字段：全类共享一份，用 类名.字段 访问
    public static final String SCHOOL = "第一中学"; // 常量：static + final，名字全大写加下划线

    // ⑤ 静态代码块：类第一次被加载时执行一次（常用来初始化静态资源或打印启动日志）
    static {
        System.out.println("Student 类被加载了");
    }

    // ⑥ 构造器：名字与类名相同、没有返回类型，只在 new 的时候被调用
    public Student(String name) {
        this(name, 18);               // this(...) 调用本类另一个构造器，必须是第一行
    }

    public Student(String name, int age) {
        super();                      // super(...) 调用父类构造器；不写也会隐式调用父类无参构造器
        this.name = name;             // this 表示"当前对象"，用来区分同名的参数和字段
        this.age = age;
        count++;                      // 每 new 一个对象，静态计数器 +1
    }

    // ⑦ 方法：[修饰符] 返回类型 方法名(参数列表) [throws 异常] { 方法体 }
    public String getName() {         // 有返回类型的方法，所有分支都必须 return
        return name;
    }

    public void setAge(int age) {     // void 表示不返回任何值
        if (age < 0) {                // 方法入口先做参数校验（防御性编程）
            throw new IllegalArgumentException("年龄不能为负");
        }
        this.age = age;
    }

    public static int getCount() {    // 静态方法：属于类，用 类名.方法() 调用；不能用 this
        return count;
    }

    @Override                         // 注解：告诉编译器"这是重写父类/Object 的方法"，写错会报错
    public String toString() {        // 重写 Object.toString()，让打印对象时看得懂
        return "Student{" + name + ", " + age + "}";
    }

    // ⑧ 内部类：定义在类里面的类，可以访问外部类的成员
    static class Score {
        int math;
    }
}`
    },
    {
      id: 'field',
      group: '面向对象',
      title: '属性（字段）速查',
      type: 'table',
      head: ['项目', '说明', '示例'],
      rows: [
        ['声明语法', '[修饰符] 类型 名字 [= 初始值];', 'private String name;'],
        ['实例字段', '没有 static：每个对象一份，随对象创建和销毁', 'private int age;'],
        ['静态字段', '有 static：全类共享一份，用 类名.字段 访问', 'private static int count = 0;'],
        ['常量', 'static final：值不能改，名字全大写加下划线', 'public static final int MAX_SCORE = 100;'],
        ['默认值（字段）', 'int/long/short/byte 是 0；double/float 是 0.0；boolean 是 false；char 是编码为 0 的字符；引用类型是 null', 'int age;  // 默认 0'],
        ['局部变量没有默认值', '方法里的变量必须先赋值再使用，否则编译不过', 'int x; System.out.println(x);  // 编译错误'],
        ['访问修饰符', 'private（本类）< 不写/包私有（同包）< protected（同包 + 子类）< public（所有）', 'private double balance;'],
        ['其它修饰符', 'static 共享、final 不可改、volatile 多线程可见（不保证原子性）、transient 不参与序列化', 'private transient String password;'],
        ['命名规范', '小驼峰、见名知意；布尔字段常用 is/has 开头', 'totalScore、isFinished'],
        ['封装建议', '字段一律先写 private，需要对外暴露再补 getter/setter', 'public double getBalance() { return balance; }']
      ]
    },
    {
      id: 'constructor',
      group: '面向对象',
      title: '构造器（构造方法）速查',
      type: 'table',
      head: ['项目', '说明', '示例 / 注意'],
      rows: [
        ['作用', '创建对象（new）时执行，负责初始化字段', 'new Student("小明", 18) 里的 Student(...) 就是构造器'],
        ['语法', '[修饰符] 类名(参数列表) { 构造器体 }', 'public Student(String name) { this.name = name; }'],
        ['三条铁律', '① 名字必须与类名完全一致 ② 没有返回类型（连 void 都不能写）③ 不能被继承、不能被重写', 'public void Student() {} 是普通方法，不是构造器'],
        ['默认构造器', '一个构造器都没写时，编译器自动补一个无参构造器', '一旦写了有参构造器，默认的就不再自动生成'],
        ['重载', '可以有多个参数不同的构造器', 'Student() / Student(String name) / Student(String name, int age)'],
        ['调用本类构造器', 'this(参数) 必须是构造器体的**第一行**', 'public Student(String name) { this(name, 18); }'],
        ['调用父类构造器', 'super(参数) 必须是第一行；不写则默认调用父类无参构造器', 'super(name, age);'],
        ['私有构造器', '禁止外部 new，常用于单例模式和工具类', 'public final class Utils { private Utils() {} }'],
        ['与方法的区别', '构造器：名字固定、无返回类型、只在 new 时调用；方法：名字随意、有返回类型、随时可调用', '两者可以同名（同名时靠有无返回类型区分）'],
        ['常见错误', '父类只有有参构造器时，子类必须显式调用 super(...)', '否则编译报错：父类没有无参构造器']
      ]
    },
    {
      id: 'constructor-code',
      group: '面向对象',
      title: '构造器三种典型写法（含运行结果）',
      type: 'code',
      codeTitle: 'Account.java · this() / super() / 初始化',
      note: '`this(...)` 和 `super(...)` 都**只能写在构造器第一行**，而且二者不能同时出现。',
      code: `/**
 * 演示：构造器的三种典型写法。
 * 关键规则：名字必须与类名完全相同、没有返回类型；
 * this(...) 和 super(...) 如果写，就必须写在构造器体的第一行，而且两者不能同时出现。
 */
public class Account {
    private final String owner;       // final 字段：只能在声明处或构造器里赋值一次
    private double balance;           // 普通字段：默认 0.0

    // ---------- 写法一：一个参数的构造器，委托给全参构造器 ----------
    // 好处：默认值只写一处，以后要改默认值只改一行
    public Account(String owner) {
        this(owner, 0);               // this(...) 必须是第一行
    }

    // ---------- 写法二：全参构造器，做真正的初始化 ----------
    public Account(String owner, double balance) {
        super();                      // 调用父类 Object 的构造器，通常省略不写
        this.owner = owner;           // 把参数值存进字段（this 区分同名的两者）
        this.balance = balance;
    }

    // ---------- 写法三：私有构造器 ----------
    // 加 private 后外部就 new 不了，只能通过下面的静态方法拿到实例（单例/工厂模式的基础）
    private Account() {
        this("匿名");
    }

    public static Account createEmpty() {
        return new Account();
    }

    // 重写 toString：打印对象时自动调用
    public String toString() {
        return owner + " 余额 " + balance;
    }

    public static void main(String[] args) {
        Account a = new Account("小明");          // 走第一个构造器 → 内部 this(owner, 0)
        Account b = new Account("小红", 100.5);   // 走第二个构造器（全参）
        Account c = Account.createEmpty();        // 走私有构造器（只能从类内部创建）
        System.out.println(a);
        System.out.println(b);
        System.out.println(c);
    }
}`
    },
    {
      id: 'method-shape',
      group: '面向对象',
      title: '方法的结构与规则速查',
      type: 'table',
      head: ['项目', '说明', '示例'],
      rows: [
        ['完整结构', '[修饰符] 返回类型 方法名(参数类型 参数名, …) [throws 异常] { 方法体 }', 'public static int add(int a, int b) { return a + b; }'],
        ['方法签名', '方法名 + 参数列表；返回类型**不算**签名', '同名同参只能存在一个方法'],
        ['无返回值', '用 void；方法体里可以写 return; 提前结束', 'public void printLine() { System.out.println("---"); }'],
        ['有返回值', '所有分支都要 return，返回类型必须匹配', 'public int max(int a, int b) { return a > b ? a : b; }'],
        ['修饰符顺序', '习惯写法：public static final synchronized ...', 'public static void main(String[] args)'],
        ['访问修饰符', 'private < 包私有 < protected < public，决定谁能调用', 'private void log() {}'],
        ['静态方法', '属于类，用 类名.方法() 调用；不能用 this、不能直接访问实例字段', 'Math.max(1, 2)'],
        ['实例方法', '属于对象，可以访问实例字段；用 对象.方法() 调用', 'list.add("a")'],
        ['参数传递', 'Java 只有值传递：基本类型传值的副本，引用类型传"地址的副本"', '改数组元素外面能看到；让参数指向新对象则外面看不到'],
        ['可变参数', '类型... 名字，必须是参数列表最后一个', 'public static int sum(int... nums)'],
        ['重载 overload', '同一个类中：方法名相同、参数列表不同', 'add(int,int) 与 add(double,double)'],
        ['重写 override', '子类改写父类方法：名字与参数必须相同，访问权限不能更严格', '建议加 @Override，写错编译器会提醒'],
        ['递归', '方法自己调用自己，必须写出口条件并向出口靠近', 'if (n <= 1) return 1; return n * f(n - 1);'],
        ['命名规范', '动词开头小驼峰：getName / isPrime / calculate / printReport', '返回布尔值常用 is、has、can 开头']
      ]
    },
    {
      id: 'method-code',
      group: '面向对象',
      title: '五种方法写法对照',
      type: 'code',
      codeTitle: 'MethodShape.java · 无参 / 有参 / 可变参数 / 递归 / 重载',
      note: '这五种写法覆盖了初学阶段 95% 的方法需求；注意重载只看参数列表，与返回类型无关。',
      code: `/**
 * 演示：五种最常见的方法写法。
 * 方法五要素：修饰符 + 返回类型 + 方法名 + 参数列表 + 方法体（加上可选的 throws 异常声明）。
 * 注意：方法签名只看"方法名 + 参数列表"，返回类型不算 —— 所以重载必须参数不同。
 */
public class MethodShape {

    // ---------- ① 无参无返回：用 void，方法体里不需要 return ----------
    public static void sayHi() {
        System.out.println("Hi");            // 只做事，不返回结果
    }

    // ---------- ② 有参有返回：参数写类型+名字，返回类型与 return 的值匹配 ----------
    public static int add(int a, int b) {
        return a + b;                        // 返回 int
    }

    // ---------- ③ 可变参数：类型后面写三个点，必须是参数列表的最后一个 ----------
    public static int sumAll(int... nums) {
        int total = 0;                       // 累加器
        for (int n : nums) {                 // 可变参数在方法内就是一个数组
            total += n;
        }
        return total;
    }

    // ---------- ④ 递归：方法自己调用自己，必须有出口 + 每步向出口靠近 ----------
    public static long factorial(int n) {
        if (n <= 1) {
            return 1;                        // 出口：1! = 1
        }
        return n * factorial(n - 1);         // 把问题缩小成 (n-1)!
    }

    // ---------- ⑤ 重载：方法名相同、参数列表不同（这里参数类型不同） ----------
    public static double add(double a, double b) {
        return a + b;                        // 调用 add(1.5, 2.5) 会走到这里
    }

    public static void main(String[] args) {
        sayHi();                             // 调用无参方法
        System.out.println(add(1, 2));       // 走 int 版本
        System.out.println(add(1.5, 2.5));   // 走 double 版本（重载由参数类型决定）
        System.out.println(sumAll(1, 2, 3, 4));   // 可变参数：想传几个都行
        System.out.println(factorial(5));    // 递归：5*4*3*2*1 = 120
    }
}`
    },
    {
      id: 'object-class',
      group: '面向对象',
      title: 'Object 类：所有类的父类',
      type: 'table',
      head: ['方法', '作用', '是否需要重写'],
      rows: [
        ['getClass()', '返回运行时的类对象，可以拿到类名', '不重写；常用 getClass().getSimpleName()'],
        ['toString()', '返回对象的字符串表示，打印对象时自动调用', '**建议重写**，否则输出 Student@1b6d3586 这种地址'],
        ['equals(Object)', '判断两个对象是否"逻辑相等"', '**按业务需要重写**（比如只比较 id）'],
        ['hashCode()', '返回哈希值，供 HashMap / HashSet 定位使用', '**重写 equals 就必须重写 hashCode**'],
        ['clone()', '复制对象（浅拷贝）', '需要实现 Cloneable；更推荐自己写拷贝构造器'],
        ['wait() / notify() / notifyAll()', '线程间通信，必须在 synchronized 块里调用', '不重写，用法见多线程章节'],
        ['finalize()', 'GC 回收前调用', '**已废弃**，不要使用'],
        ['默认实现是怎样的', 'equals 比较地址（等价于 ==）；hashCode 由 JVM 按对象地址生成；toString 输出 类名@十六进制哈希', '——'],
        ['常见考点', 'a.equals(b) 为 true 时，a.hashCode() 必须等于 b.hashCode()；反过来不要求相等', '——'],
        ['工具类', 'java.util.Objects 提供 equals / hash / isNull / requireNonNull，写重写代码时更安全', '——']
      ]
    },
    {
      id: 'object-code',
      group: '面向对象',
      title: 'Object 三个方法的标准重写模板',
      type: 'code',
      codeTitle: 'User.java · toString / equals / hashCode',
      note: '实际开发直接用 IDE 的“Generate → equals() and hashCode() / toString()”生成最稳；手写时记住**参与 equals 的字段，也要参与 hashCode**。',
      code: `/**
 * 演示：Object 三个最常被重写的方法。
 * toString()   —— 打印/拼接对象时自动调用，不重写会输出 User@1b6d3586 这种看不懂的地址
 * equals()     —— 定义"什么算逻辑相等"，这里用业务主键 id
 * hashCode()   —— 给哈希表（HashMap/HashSet）定位用，必须与 equals 使用同一批字段
 */
public class User {
    private final String id;      // 业务主键：相等判断的依据
    private final String name;    // 姓名：不参与相等判断（允许重名）

    public User(String id, String name) {
        this.id = id;
        this.name = name;
    }

    // 1）toString：返回值要能说清这个对象是谁
    @Override
    public String toString() {
        return "User{id=" + id + ", name=" + name + "}";
    }

    // 2）equals：固定套路 —— 先判自己、再判 null 和类型、最后比字段
    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;                                  // 同一个对象直接相等（性能优化）
        }
        if (o == null || getClass() != o.getClass()) {
            return false;                                 // 为 null 或类型不同
        }
        User other = (User) o;                            // 类型已确认，可以安全强转
        return id != null && id.equals(other.id);         // 只比较主键 id
    }

    // 3）hashCode：与 equals 使用同一批字段（这里只有 id）
    @Override
    public int hashCode() {
        return id == null ? 0 : id.hashCode();            // 直接借用 String 的哈希实现
    }

    public static void main(String[] args) {
        User u1 = new User("U001", "小明");
        User u2 = new User("U001", "小明（重名）");     // id 相同 → 业务上算同一个人

        System.out.println("toString：" + u1);                       // 调用 toString
        System.out.println("equals：" + u1.equals(u2));              // true：id 相同
        System.out.println("== 比较：" + (u1 == u2));                // false：两个不同对象
        System.out.println("hashCode 相同：" + (u1.hashCode() == u2.hashCode()));   // true
    }
}`
    },
    {
      id: 'modifiers',
      group: '面向对象',
      title: '修饰符速查：能修饰谁、什么含义',
      type: 'table',
      head: ['修饰符', '可修饰', '含义与注意'],
      rows: [
        ['public', '类、字段、方法、构造器', '任何地方都能访问；工具类方法常用'],
        ['protected', '字段、方法、构造器、内部类', '同包 + 子类可访问；给子类用但不想公开时使用'],
        ['不写（包私有）', '类、字段、方法、构造器', '只有同一个包能访问，跨包即不可见'],
        ['private', '字段、方法、构造器、内部类', '只有本类能访问；字段默认都该是 private'],
        ['static', '字段、方法、代码块、内部类', '属于类不属于对象；静态方法里不能用 this'],
        ['final', '类、字段、方法、局部变量', '类不可继承（如 String）；方法不可重写；变量只能赋值一次'],
        ['abstract', '类、方法', '类不能 new；方法必须由子类实现（抽象方法没有方法体）'],
        ['synchronized', '方法、代码块', '同一时刻只有一个线程能进入，保证线程安全'],
        ['volatile', '字段', '多线程之间立即可见 + 禁止指令重排；**不保证原子性**'],
        ['transient', '字段', '序列化时跳过该字段（密码、缓存等）'],
        ['native', '方法', '由本地代码（C/C++）实现，如 System.currentTimeMillis()'],
        ['strictfp / default（接口方法）', '类 / 接口方法', '前者很少用；后者是接口里的默认实现']
      ]
    },
    {
      id: 'init-order',
      group: '面向对象',
      title: '类初始化与对象初始化顺序',
      type: 'list',
      items: [
        '**总口诀：静态先于实例，父类先于子类，字段先于构造器体。**',
        '① 类加载阶段（只执行一次）：父类静态字段 → 父类静态代码块 → 子类静态字段 → 子类静态代码块',
        '② 创建对象阶段（每次 new 都执行）：父类实例字段初始化 → 父类实例代码块 → **父类构造器体** → 子类实例字段初始化 → 子类实例代码块 → **子类构造器体**',
        '③ 同一个类里，静态字段和静态代码块按**书写顺序**执行；实例字段和实例代码块同理',
        '④ 子类构造器的第一行一定是 `super(...)`（不写则隐式调用父类无参构造器），所以父类总能先初始化完',
        '⑤ 记忆例子：`new Child()` 的输出顺序是 —— 父静态块 → 子静态块 → 父字段/父构造器 → 子字段/子构造器',
        '⑥ 面试常问：`static` 变量为什么是全局共享的？因为它在类加载时创建、只存一份；`final static` 常量还会在编译期就放进常量池',
        '⑦ 实践建议：字段尽量在声明处或构造器里赋值，避免使用实例代码块和静态代码块做复杂逻辑（可读性差）'
      ]
    },
    {
      id: 'multi-file',
      group: '面向对象',
      title: '多文件协作与「我的类库」速查',
      type: 'table',
      head: ['场景', '写法', '注意'],
      rows: [
        ['一个类一个文件', 'public class Student { ... } 存成 Student.java', '文件名必须和 public 类名完全一致，大小写也不能错'],
        ['调用同包里其他文件的类', 'Student s = new Student("小明", 96);', '同一个包（含默认包）不需要 import，直接用类名'],
        ['调用其他文件的静态方法', 'MathBox.max3(3, 9, 5)', '格式是「类名.方法名(...)」，不用先创建对象'],
        ['调用其他文件的实例方法', 'Student s = new Student(...); s.getName();', '先用 new 创建对象，再用「对象.方法()」调用'],
        ['调用其他包里的类', 'import com.demo.Student;', '不 import 就写全名 com.demo.Student，否则报「找不到符号」'],
        ['一个文件里写多个类', 'class A { } class B { }', '只能有一个 public 类，文件名必须跟它一致，其他类不能加 public'],
        ['被调用的前提', '类和方法通常要写成 public', '不是 public 的类/方法只能被同一个包里的代码访问'],
        ['本软件的「我的类库」', '侧边栏「我的类库」→ 新建 Calculator.java', '相当于把工具类放进同一个包，之后所有练习和示例都能直接调用'],
        ['报错「找不到类 X」', '依次检查三件事', '① 文件名和类名是否一致；② 类库开关是否被关掉；③ 是不是忘了 import'],
        ['类库代码写错了', '依赖面板会标出问题文件', '类库里有语法错误会拖累所有运行，先修好再继续做题']
      ]
    },
    {
      id: 'multi-file-code',
      group: '面向对象',
      title: '两个文件怎么互相调用（含运行结果）',
      type: 'code',
      codeTitle: 'Calculator.java + Main.java',
      note: '两个文件在**同一个包**里，所以 Main 不用 import 就能用 Calculator。把 Calculator.java 写进软件的「我的类库」，Main 的代码就能直接跑出下面的结果。',
      code: [
        '/* ===== 文件一：Calculator.java（文件名必须和 public 类名一致） ===== */',
        'public class Calculator {',
        '    // 静态方法：用「类名.方法名(...)」调用，不需要 new 对象',
        '    public static int add(int a, int b) {',
        '        return a + b;',
        '    }',
        '',
        '    // 实例方法：必须先 new 出对象，再用「对象.方法(...)」调用',
        '    public int doubleIt(int x) {',
        '        return x * 2;',
        '    }',
        '}',
        '',
        '/* ===== 文件二：Main.java ===== */',
        'public class Main {',
        '    public static void main(String[] args) {',
        '        // ① 调用另一个文件的静态方法：类名.方法名(...)',
        '        int sum = Calculator.add(3, 4);',
        '',
        '        // ② 调用另一个文件的实例方法：先 new，再 对象.方法()',
        '        Calculator c = new Calculator();',
        '        int twice = c.doubleIt(sum);',
        '',
        '        System.out.println("3 + 4 = " + sum);',
        '        System.out.println("(3 + 4) * 2 = " + twice);',
        '    }',
        '}',
        '',
        '/* ===== 运行结果 =====',
        '3 + 4 = 7',
        '(3 + 4) * 2 = 14',
        '===================== */'
      ].join('\n')
    },
    {
      id: 'android-view',
      group: 'Android',
      title: '布局与控件速查',
      type: 'table',
      head: ['场景', '写法', '注意'],
      rows: [
        ['线性布局', '<LinearLayout android:orientation="vertical">', 'weight 分配剩余空间'],
        ['约束布局', 'app:layout_constraintTop_toBottomOf="@id/tvTitle"', '宽度用 0dp 由约束决定'],
        ['尺寸单位', 'android:layout_width="120dp"', '尺寸 dp，文字 sp'],
        ['加载布局', 'setContentView(R.layout.activity_main);', '必须在 onCreate 里'],
        ['找控件', 'TextView tv = findViewById(R.id.tvTitle);', 'id 用 android:id="@+id/xxx" 定义'],
        ['点击事件', 'btn.setOnClickListener(v -> { });', 'lambda 就是接口的简写'],
        ['读取输入', 'et.getText().toString().trim();', 'trim 去掉首尾空格'],
        ['输入校验提示', 'et.setError("不能为空");', '比 Toast 更精准地指向字段'],
        ['显示图片', 'img.setImageResource(R.drawable.logo);', '大图用 Glide 加载，避免 OOM'],
        ['控件显隐', 'view.setVisibility(View.GONE);', 'GONE 不占位，INVISIBLE 占位'],
        ['文本资源', 'android:text="@string/btn_login"', '所有文案尽量放 strings.xml'],
        ['圆角背景', 'android:background="@drawable/bg_button"', '用 shape drawable 定义']
      ]
    },
    {
      id: 'android-flow',
      group: 'Android',
      title: '页面跳转、存储与网络',
      type: 'table',
      head: ['场景', '写法', '注意'],
      rows: [
        ['跳转页面', 'startActivity(new Intent(this, DetailActivity.class));', '新 Activity 要在 Manifest 注册'],
        ['传参', 'intent.putExtra("id", 1001);', '取值需要给默认值'],
        ['接收返回', 'registerForActivityResult(new ActivityResultContracts.StartActivityForResult(), callback)', '旧的 startActivityForResult 已废弃'],
        ['回传数据', 'setResult(RESULT_OK, intent); finish();', '上一页判断 resultCode'],
        ['打开网页', 'startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse("https://...")));', '先判断能不能处理，避免崩溃'],
        ['保存配置', 'getSharedPreferences("cfg", MODE_PRIVATE).edit().putString(k, v).apply();', '只适合少量数据'],
        ['Room 三件套', '@Entity 表 / @Dao 操作 / @Database 数据库', '数据库操作别放主线程'],
        ['联网权限', '<uses-permission android:name="android.permission.INTERNET" />', 'Manifest 里声明即可'],
        ['网络请求', 'api.getWeather(city).enqueue(new Callback<...>() { ... })', 'onResponse 已在主线程'],
        ['baseUrl 规则', 'baseUrl 以 / 结尾，接口路径不以 / 开头', '拼错就报 404'],
        ['接口注解', '@GET("v1/weather") Call<Resp> get(@Query("city") String c);', '@Path 用于路径参数，@Body 用于 POST'],
        ['日志调试', 'addInterceptor(new HttpLoggingInterceptor().setLevel(BODY))', 'Logcat 里能看到完整 JSON']
      ]
    },
    {
      id: 'errors',
      group: '排错',
      title: '高频错误对照表',
      type: 'table',
      head: ['看到这个错误', '原因', '怎么修'],
      rows: [
        ['NullPointerException', '拿了 null 当对象用', '用之前判空；对象属性注意初始化'],
        ['ArrayIndexOutOfBoundsException', '下标越界', '循环条件用 i < arr.length'],
        ['NumberFormatException', '字符串不是合法数字', '先校验或用 try/catch 兜底'],
        ['ClassCastException', '类型转换转错了', '先用 instanceof 判断再强转'],
        ['ConcurrentModificationException', '遍历集合时增删元素', '用迭代器 remove 或先收集再删'],
        ['StackOverflowError', '递归没有出口', '补上结束条件，检查是否向出口靠近'],
        ['编译错误：cannot find symbol', '类名/变量名拼错或没 import', '看行号 + 检查 import'],
        ['AndroidRuntimeException: Unable to start activity', 'Activity 没在 Manifest 注册 / 布局有错', '查 Logcat 里 Caused by 的第一行'],
        ['NetworkOnMainThreadException', '主线程发起网络请求', '放到线程池 + runOnUiThread'],
        ['Logcat: E/RecyclerView: No adapter attached', '忘了 setAdapter', '在设置 LayoutManager 后调用 setAdapter'],
        ['Gradle: Could not find / Failed to resolve', '依赖版本写错或网络问题', '检查版本号，配置国内镜像后 Sync'],
        ['Android 11+ 找不到了自定义文件', '分区存储限制', '用 MediaStore 或应用专属目录']
      ]
    },
    {
      id: 'tools',
      group: '排错',
      title: '常用工具命令',
      type: 'table',
      head: ['命令', '用途', '说明'],
      rows: [
        ['java -version', '查看 JDK 版本', 'JDK 17/21 是主流 LTS'],
        ['javac HelloWorld.java', '编译 Java 文件', '生成 .class 文件'],
        ['java HelloWorld', '运行类', '不要加 .class 后缀'],
        ['adb devices', '查看连接的设备', '真机调试第一步'],
        ['adb install app-debug.apk', '安装 APK 到设备', '也可用 Android Studio 的 Run'],
        ['adb logcat | findstr LifeCycle', '按关键字过滤日志', 'Windows 用 findstr，macOS 用 grep'],
        ['gradlew assembleRelease', '命令行打包正式版', '需要在项目根目录执行'],
        ['Build → Rebuild Project', '清理并重新编译', 'Room 生成类报错时先试这个']
      ]
    },
    {
      id: 'glossary',
      group: '入门答疑',
      title: '术语表（先看懂这些词）',
      type: 'table',
      head: ['术语', '一句话解释'],
      rows: [
        ['JDK / JRE / JVM', 'JDK 是开发工具包（含编译器），JRE 是运行环境，JVM 是真正执行字节码的虚拟机；写代码装 JDK。'],
        ['字节码 (.class)', 'Java 源码编译后的中间文件，由 JVM 执行，所以“一次编写到处运行”。'],
        ['编译期 / 运行期', '编译期是 javac 检查语法的时候，运行期是程序真正跑起来的时候；很多错误只有运行期才暴露。'],
        ['栈 / 堆', '栈放局部变量和对象引用，堆放 new 出来的对象；方法结束栈自动回收，堆靠 GC 回收。'],
        ['引用', '变量里存的不是对象本身，而是对象在堆里的地址，所以两个引用可以指向同一个对象。'],
        ['装箱 / 拆箱', 'int 与 Integer 之间的自动转换；集合只能装对象，所以 List<Integer> 里放 int 会自动装箱。'],
        ['方法重载 / 重写', '重载：同类中同名不同参数；重写：子类改写父类的同名同参方法。'],
        ['多态', '父类引用指向子类对象，运行时调用子类重写后的实现。'],
        ['抽象类 / 接口', '抽象类抽共性（可以带属性和实现），接口描述能力（可以多实现）。'],
        ['异常 / 检查型异常', '异常是运行时的问题；IOException 这类必须处理，NullPointerException 这类通常要写代码时避免。'],
        ['集合 / 泛型', '集合是能动态增删的容器；泛型 <String> 限定里面装什么类型。'],
        ['迭代器', '遍历集合的标准工具；在遍历中删元素要用它，不能直接 remove。'],
        ['Activity', 'Android 里的一个屏幕，有完整的生命周期。'],
        ['布局 / 控件', '布局（如 LinearLayout）负责排列，控件（如 TextView）负责显示与交互。'],
        ['Adapter', '把数据翻译成列表 item 的“翻译官”，配合 RecyclerView 使用。'],
        ['Intent', '页面之间的信使：说明去哪（显式）或想做什么（隐式），以及带什么数据。'],
        ['RecyclerView', '官方列表控件，靠复用 item 视图支撑长列表，性能好。'],
        ['SharedPreferences', '存少量键值对（开关、token）的轻量存储。'],
        ['Room', '官方推荐的数据库方案（SQLite 的封装），用注解定义表、DAO 和数据库。'],
        ['Retrofit', '把 HTTP 接口写成 Java 接口的网络库，常与 OkHttp、Gson 搭配。'],
        ['JSON', '服务器和客户端交换数据的文本格式：对象 {}、数组 []、键值对 "k": v。'],
        ['主线程 / 子线程', '主线程负责界面，不能做网络和数据库；耗时操作放子线程，结果再回主线程更新 UI。'],
        ['API 级别 (minSdk)', 'App 支持的最低 Android 版本，数字越大能用的新特性越多、能装的手机越少。'],
        ['Gradle', 'Android 项目的构建工具，负责依赖下载、编译、打包。'],
        ['Logcat', 'Android 的日志窗口，调试时用它看 Log.d 打印的内容和崩溃堆栈。'],
        ['APK / AAB', 'APK 是安装包，AAB 是上架 Google Play 用的发布格式。']
      ]
    },
    {
      id: 'faq',
      group: '入门答疑',
      title: '新手最常问的 12 个问题',
      type: 'table',
      head: ['问题', '回答'],
      rows: [
        ['Java 和 Kotlin 先学哪个？', '先用 Java 学编程思维和面向对象（资料多、语法啰嗦但清晰），再花几天补 Kotlin 语法糖，最后用 Kotlin 写新项目。'],
        ['要背代码吗？', '不背。要背的是“有哪些能力”（比如字符串有 split、集合有 getOrDefault）和“怎么查”，具体写法交给 IDE 补全和文档。'],
        ['看懂教程但自己写不出来？', '正常。把教程代码关掉，用自己的变量名和题目重写一遍；卡住再看提示。写不出来说明输入不够，不是笨。'],
        ['报错看不懂怎么办？', '先看第一行的异常类型和行号，再找你自己的包名出现的第一行。搜索“异常类型 + 关键信息”通常能找到答案。'],
        ['一天学多久合适？', '1～2 小时，其中至少一半时间要动手写代码。只看不写，第二天基本忘光。'],
        ['需要买书吗？', '可以不买。课程 + 官方文档 + 自己写项目足够；要买就买《Java 核心技术》这类工具书当查询用。'],
        ['什么时候能写 App？', '学完 Java 16 章（含 IO、集合、多线程三章深挖）+ Android 前 3 章，就可以做第一个能装到手机上的 App 了。'],
        ['做不出项目怎么办？', '把项目拆成“最小可运行版本”：先让列表显示假数据，再接数据库，再加编辑和删除。一次只加一个功能。'],
        ['英文文档难读怎么办？', '先读中文教程建立框架，再回官方文档看 API 签名。常用词就那几百个，看两周就顺了。'],
        ['面试会问什么？', 'Java 基础（集合、异常、面向对象、字符串）、Android 四大组件与生命周期、RecyclerView、网络请求、以及你的项目细节。'],
        ['手机能学吗？', '能看课程和做测验；写代码建议用电脑，屏幕大、有补全和调试。'],
        ['学完这些能找到工作吗？', '这些是入门必备，不是全部。找工作还需要：一个能讲清楚的完整项目、Git 基本操作、以及不断调试解决问题的经验。']
      ]
    },
    {
      id: 'method',
      group: '入门答疑',
      title: '一套经过验证的学习方法',
      type: 'list',
      items: [
        '**先跑起来再理解**：每学一个语法点，先让它输出点东西，看到结果再回头看原理。',
        '**每章只做三件事**：读讲解、做测验、写练习。三件都完成才翻到下一章。',
        '**卡住 20 分钟就求助**：先看提示，再看参考答案，但看完必须关掉答案自己重写一遍。',
        '**把错误当成笔记素材**：每次报错，把“错误信息 + 原因 + 怎么修”记三行，一个月后这就是你专属的速查表。',
        '**每周做一次回顾**：打开“我的进度”，把本周的章节练习重做一遍，重点做上次没通过的。',
        '**用项目检验学习**：控制台项目重在逻辑，Android 项目重在把界面和数据串起来，两者都要亲手做完至少一个。',
        '**学会读别人的代码**：GitHub 上找一个小项目，只读懂一个类，看它怎么分层、怎么命名。',
        '**不要同时学太多东西**：Java 基础没打完就别开 Flutter，Android 没做出一个 App 就别急着学 Compose。'
      ]
    },    {
      id: 'resources',
      group: '排错',
      title: '学习资源',
      type: 'table',
      head: ['资源', '地址', '用途'],
      rows: [
        ['Android 官方文档', 'developer.android.com', '权威 API 参考与官方教程'],
        ['Android Studio 下载', 'developer.android.com/studio', '开发工具'],
        ['Java 官方教程', 'dev.java/learn', 'Java 语言与 API 学习'],
        ['Google Android 示例', 'github.com/android', '官方开源示例项目，照抄结构最快'],
        ['Kotlin 官方文档', 'kotlinlang.org/docs', '学完 Java 后过一遍语法糖'],
        ['JSON 在线格式化', 'json.cn', '看接口返回结构、检查格式'],
        ['Postman / Apifox', 'postman.com / apifox.com', '调接口、调试请求参数'],
        ['Stack Overflow', 'stackoverflow.com', '报错信息直接搜索，大概率有人问过'],
        ['GitHub Trending', 'github.com/trending/java', '找练手项目与灵感']
      ]
    }
  ]
};



