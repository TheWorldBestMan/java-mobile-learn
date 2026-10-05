/* 课程内容 · Java 基础（第 1~7 章） */
window.COURSE_JAVA_PART1 = [
  {
    id: 'j1',
    title: '环境搭建与第一个 Java 程序',
    minutes: 45,
    tags: ['JDK', '环境', 'main', 'HelloWorld'],
    goals: [
      '说清 JDK、JRE、JVM 三者的关系',
      '在电脑上装好 JDK 并验证版本',
      '自己写出、编译并运行 HelloWorld.java',
      '看懂 javac 报错信息里最关键的三个信息'
    ],
    lessons: [
      { t: 'p', text: 'Java 是 1995 年诞生的面向对象语言，靠“一次编写，到处运行”出名。它也是 Android 最早的官方开发语言——今天 Android 官方推荐 Kotlin，但 **Kotlin 和 Java 可以互相调用**，大量线上 Android 项目、教程、开源库仍然是 Java 写的。所以先用 Java 学会“编程思维 + 面向对象”，再迁移到 Kotlin 和 Android，路线非常顺。' },
      { t: 'h', text: '1. JDK、JRE、JVM：别被三个缩写绕晕' },
      { t: 'table', head: ['名词', '全称', '作用', '你要不要装'], rows: [
        ['JVM', 'Java Virtual Machine', '真正运行 .class 字节码的“虚拟机”，负责把字节码变成机器指令', 'JDK 里自带'],
        ['JRE', 'Java Runtime Environment', 'JVM + 核心类库，只能运行程序，不能编译', 'JDK 里自带'],
        ['JDK', 'Java Development Kit', 'JVM + 类库 + javac 编译器等开发工具', '要装这个']
      ]},
      { t: 'tip', text: '一句话记忆：**JDK ⊃ JRE ⊃ JVM**。写代码必须装 JDK。' },
      { t: 'h', text: '2. 安装 JDK（推荐 JDK 17 或 21，LTS 长期支持版）' },
      { t: 'list', items: [
        'Windows / macOS：去 Adoptium（Eclipse Temurin）或 Oracle 官网下载安装包，一路下一步',
        '安装时**记住安装路径**，比如 C:\\Program Files\\Eclipse Adoptium\\jdk-17',
        '第三方工具推荐：IDEA（社区版免费）或 VS Code + Extension Pack for Java',
        '安装后打开终端（PowerShell）验证版本'
      ]},
      { t: 'code', title: '验证安装', code: `java -version
javac -version

# 期望输出类似：
# openjdk version "17.0.10" 2024-01-16
# javac 17.0.10` },
      { t: 'warn', text: '如果提示“不是内部或外部命令”，说明环境变量没配好。Windows 需要把 JDK 的 bin 目录加进系统变量 Path，然后**重开终端**。' },
      { t: 'h', text: '3. 第一个程序：HelloWorld.java' },
      { t: 'code', title: 'HelloWorld.java', code: `public class HelloWorld {

    // main 方法是程序的入口，JVM 从这里开始执行
    public static void main(String[] args) {
        System.out.println("Hello, Java!");
        System.out.println("我要学移动开发");
    }
}` },
      { t: 'h', text: '4. 编译并运行' },
      { t: 'code', title: '命令行方式', code: `# 1. 进入 java 文件所在目录
cd D:\\code\\java-demo

# 2. 编译：生成 HelloWorld.class 字节码文件
javac HelloWorld.java

# 3. 运行：注意不要写 .class 后缀
java HelloWorld

# 输出：
# Hello, Java!
# 我要学移动开发` },
      { t: 'h', text: '5. 逐行拆解，每一块都不能少' },
      { t: 'table', head: ['代码片段', '含义'], rows: [
        ['public', '访问修饰符：这个类对所有代码可见'],
        ['class HelloWorld', '定义了一个类，类名必须和文件名完全一致'],
        ['{ }', '一对大括号表示“一段代码的范围”，成对出现'],
        ['public static void main(String[] args)', '程序入口。JVM 只认这个固定写法'],
        ['String[] args', '命令行参数数组，暂时用不到也要写'],
        ['System.out.println(...)', '向控制台输出一行文本，println = print line'],
        [';', 'Java 语句必须以分号结束，中文分号会报错']
      ]},
      { t: 'warn', text: '新手三大高频错误：① 文件名和类名不一致；② 用了中文标点（；，（））；③ 少了分号或大括号。报错信息第一行通常写着**文件名:行号: 错误内容**，先看行号。' },
      { t: 'h', text: '6. 注释：写给未来的自己' },
      { t: 'code', title: '三种注释', code: `// 单行注释

/*
   多行注释
   可以写很多行
*/

/**
 * 文档注释，可以用 javadoc 命令生成 API 文档
 */` },
      { t: 'tip', text: '好的学习习惯：每写一个能跑的程序，就改一改、跑一跑。比如把输出内容换成你自己的名字，看会不会报错。' }
    ],
    quiz: [
      { q: '想要编写并编译 Java 程序，必须安装哪个？', options: ['JRE', 'JDK', 'JVM', 'Android Studio'], answer: 1, explain: 'JDK 里包含编译器 javac，只有 JRE/JVM 只能运行，不能编译。' },
      { q: '下面哪个类名是正确的、能编译通过？（文件名 Hello.java）', options: ['class hello', 'class Hello', 'Class Hello', 'public Class Hello'], answer: 1, explain: '类名要与文件名一致，且关键字 class 小写、类名首字母大写。' },
      { q: '编译命令和运行命令分别是？', options: ['java Hello.java → javac Hello', 'javac Hello.java → java Hello', 'javac Hello → java Hello.class', 'run Hello.java'], answer: 1, explain: 'javac 编译生成 .class，java 运行时只写类名，不加后缀。' }
    ],
    exercises: [
      {
        id: 'ex-j1-1',
        title: '练习 1：输出你的个人名片',
        level: '入门',
        brief: '新建一个文件 Me.java，在控制台按下面格式输出三行个人信息（内容换成你自己的）。',
        requirements: [
          '文件名 Me.java，类名 Me，必须有正确的 main 方法',
          '用三条 System.out.println 输出：姓名、目标、今天的学习时长',
          '加一条单行注释解释这条语句的作用'
        ],
        starter: `public class Me {
    public static void main(String[] args) {
        // TODO: 在这里写三条输出语句

    }
}`,
        expectedOutput: `姓名：张三
目标：成为 Android 开发工程师
今日学习：1 小时`,
        keyPoints: [
          { label: '类名 Me 与 main 方法', test: 'class\\s+Me\\b[\\s\\S]*static\\s+void\\s+main\\s*\\(\\s*String\\s*\\[\\s*\\]\\s*\\w+' },
          { label: '使用了 System.out.println', test: 'System\\.out\\.println' },
          { label: '至少三条输出语句', test: '(?:System\\.out\\.println[\\s\\S]*?){3}' },
          { label: '有注释', test: '//|/\\*' }
        ],
        hints: ['println 会自动换行，print 不换行', '字符串必须用英文双引号包起来'],
        solution: `public class Me {
    public static void main(String[] args) {
        // println 向控制台输出一行内容并换行
        System.out.println("姓名：张三");
        System.out.println("目标：成为 Android 开发工程师");
        System.out.println("今日学习：1 小时");
    }
}`
      },
      {
        id: 'ex-j1-2',
        title: '练习 2：用 println 画一个三角形',
        level: '入门',
        brief: '一行一行地打印一个三角形。看似简单，但能练熟 println、字符串里的空格和输出顺序——后面讲循环时画的图形，就是这个思路。',
        requirements: [
          '类名 Triangle，包含正确的 main 方法',
          '用 5 行 System.out.println 打印一个底边为 9 个 * 的等腰三角形',
          '每行前面的空格数要分别是 4、3、2、1、0',
          '最后再打印一行分隔线（用连续几个 - 拼出来）'
        ],
        starter: `public class Triangle {
          public static void main(String[] args) {
              // TODO: 打印 5 行三角形，注意每行前面的空格数量
          }
      }`,
        expectedOutput: `    *
         ***
        *****
       *******
      *********
      ---------`,
        keyPoints: [
          { label: '类名 Triangle，包含 main 方法', test: 'class\\s+Triangle[\\s\\S]*static\\s+void\\s+main' },
          { label: '至少有 5 条 println 语句', test: '(?:System\\.out\\.println[\\s\\S]*?){5}' },
          { label: '用 * 组成三角形', test: '\\*' },
          { label: '有分隔线（连续的 - 或 =）', test: '-{3,}|={3,}' }
        ],
        hints: [
          '每一行都是“若干空格 + 若干星号”，空格数依次是 4、3、2、1、0',
          '星号个数依次是 1、3、5、7、9',
          '数不清空格时，先在注释里写下“第 1 行 4 个空格”，再照着数'
        ],
        solution: `public class Triangle {
          public static void main(String[] args) {
              System.out.println("    *");
              System.out.println("   ***");
              System.out.println("  *****");
              System.out.println(" *******");
              System.out.println("*********");
              System.out.println("---------");
          }
      }`
      }
    ],
    checklist: ['装好 JDK 并成功执行 java -version', '用命令行跑通 HelloWorld', '写了 Me.java 并跑通', '故意删掉一个分号，看看报错长什么样']
  },
  {
    id: 'j2',
    title: '变量、数据类型与字符串',
    minutes: 60,
    tags: ['变量', '数据类型', 'String', '类型转换'],
    goals: [
      '记住 8 种基本数据类型及其取值范围',
      '会声明变量、常量，并按规范命名',
      '理解自动类型转换和强制类型转换的规则与风险',
      '会用 String 做拼接和比较'
    ],
    lessons: [
      { t: 'p', text: '变量就是内存中一块“带名字的盒子”，盒子里放什么类型的数据由**数据类型**决定。Java 是强类型语言：变量一旦声明了类型，就只能装这个类型的数据。' },
      { t: 'h', text: '1. 八种基本数据类型' },
      { t: 'table', head: ['类型', '字节', '取值范围 / 说明', '示例'], rows: [
        ['byte', '1', '-128 ~ 127', 'byte b = 100;'],
        ['short', '2', '-32768 ~ 32767', 'short s = 1000;'],
        ['int', '4', '约 ±21 亿（最常用）', 'int age = 18;'],
        ['long', '8', '很大，字面量后加 L', 'long money = 9999999999L;'],
        ['float', '4', '小数，字面量后加 F', 'float f = 3.14F;'],
        ['double', '8', '小数，默认类型（最常用）', 'double p = 3.14;'],
        ['char', '2', '单个字符，单引号', "char c = 'A';"],
        ['boolean', '1', 'true / false', 'boolean ok = true;']
      ]},
      { t: 'h', text: '2. 声明、赋值、常量' },
      { t: 'code', title: '变量与常量', code: `public class Variables {
    public static void main(String[] args) {
        // 声明 + 赋值
        int age = 18;
        double price = 19.9;
        String name = "小明";      // String 是引用类型，用双引号
        char level = 'A';          // char 用单引号，只能一个字符
        boolean isStudent = true;

        // 先声明后赋值
        int score;
        score = 95;

        // 常量：final 修饰，赋值后不能改，名字全大写
        final double PI = 3.14159;
        final int MAX_SCORE = 100;

        // 多个同类型变量一起声明（不推荐，可读性差）
        int a = 1, b = 2, c = 3;

        // Java 10+ 局部变量类型推断
        var city = "上海";         // 编译器自动推断为 String

        System.out.println(name + " 今年 " + age + " 岁，成绩 " + score);
        System.out.println(level + " " + isStudent + " " + price + " " + PI);
        System.out.println(a + b + c + " " + city);
    }
}` },
      { t: 'h', text: '3. 命名规范（团队协作的底线）' },
      { t: 'table', head: ['对象', '规范', '正确示例', '错误示例'], rows: [
        ['类名 / 接口名', '大驼峰 PascalCase', 'StudentManager', 'studentManager、student_manager'],
        ['变量 / 方法名', '小驼峰 camelCase', 'totalScore、getAge()', 'TotalScore、get_age'],
        ['常量', '全大写 + 下划线', 'MAX_COUNT', 'maxCount'],
        ['包名', '全小写，域名倒写', 'com.example.app', 'Com.Example']
      ]},
      { t: 'warn', text: '不能用的名字：数字开头（1abc）、含空格或连字符、Java 关键字（class、int、public…）、中文和拼音缩写（除非团队约定）。名字要能读出含义，x1、aaa 这种是技术债。' },
      { t: 'h', text: '4. 类型转换' },
      { t: 'code', title: '自动转换与强制转换', code: `// 自动（隐式）转换：小范围 → 大范围，无风险
int i = 100;
long l = i;          // int → long
double d = i;        // int → double
System.out.println(l + " " + d);   // 100 100.0

// 强制转换：大范围 → 小范围，可能丢精度或溢出
double pi = 3.99;
int n = (int) pi;                 // 3，小数被直接截断（不是四舍五入）
System.out.println(n);

long big = 300;
byte small = (byte) big;          // 溢出，结果不再是 300
System.out.println(small);

// 字符串 → 数字
String numStr = "123";
int parsed = Integer.parseInt(numStr);
double parsedD = Double.parseDouble("3.14");
System.out.println(parsed + 1);   // 124，注意不是字符串拼接

// 数字 → 字符串
String str = String.valueOf(456);
String str2 = 456 + "";` },
      { t: 'tip', text: '**整数除法陷阱**：5 / 2 的结果是 2 而不是 2.5。要小数必须至少一边是小数：5 / 2.0 或 5 / (double) 2。' },
      { t: 'h', text: '5. String 常用操作入门' },
      { t: 'code', title: '字符串基础', code: `String s = "Hello Java";

System.out.println(s.length());          // 10，字符个数
System.out.println(s.toUpperCase());     // HELLO JAVA
System.out.println(s.toLowerCase());     // hello java
System.out.println(s.contains("Java"));  // true
System.out.println(s.substring(0, 5));   // Hello（含头不含尾）
System.out.println(s.replace("Java", "World"));
System.out.println(s.charAt(0));         // H

// 拼接：+ 号
String msg = "你好，" + "世界" + "！";
System.out.println(msg);

// 比较：永远用 equals，不要用 ==
String a1 = "abc";
String a2 = new String("abc");
System.out.println(a1 == a2);          // false，比较的是地址
System.out.println(a1.equals(a2));     // true，比较的是内容

// 判空
String empty = "";
System.out.println(empty.isEmpty());   // true` },
      { t: 'warn', text: '`==` 对引用类型比较的是“是不是同一个对象”，`equals` 比较的是“内容是否相同”。比较字符串内容一律用 equals，这是面试和线上 bug 的高频考点。' }
    ],
    quiz: [
      { q: '下面哪一行有编译错误？', options: ["long x = 10000000000L;", "float f = 3.14;", "double d = 3.14;", "char c = 'A';"], answer: 1, explain: '小数字面量默认是 double，赋给 float 必须写 3.14F，或强制转换。' },
      { q: 'int a = 5 / 2; 则 a 的值是？', options: ['2.5', '2', '3', '编译错误'], answer: 1, explain: '整数除法结果还是整数，小数部分被丢弃。' },
      { q: 'String s1 = "hi"; String s2 = new String("hi"); 下列正确的是？', options: ['s1 == s2 为 true', 's1.equals(s2) 为 true', '两者都为 true', '两者都为 false'], answer: 1, explain: '== 比较地址，new 出来的对象地址不同；equals 比较内容，所以只有 equals 为 true。' },
      { q: 'final int MAX = 10; 之后执行 MAX = 20; 会怎样？', options: ['正常编译运行', '编译错误：不能给 final 变量重新赋值', '运行时抛出异常', 'MAX 变成 20'], answer: 1, explain: 'final 修饰的变量是常量，只能赋值一次。' }
    ],
    exercises: [
      {
        id: 'ex-j2-1',
        title: '练习 1：个人信息卡',
        level: '入门',
        brief: '编写 Profile.java，用合适的类型保存姓名、年龄、身高、是否学生，并按要求输出。',
        requirements: [
          '姓名为 String，年龄为 int，身高为 double，是否学生为 boolean',
          '声明一个 final 常量 YEAR 保存当前年份（2026）',
          '输出 4 行信息，其中身高保留整数部分展示即可（用强制转换）'
        ],
        starter: `public class Profile {
    public static void main(String[] args) {
        String name = "";
        int age = 0;
        double height = 0.0;
        boolean isStudent = false;
        final int YEAR = 2026;

        // TODO: 输出信息

    }
}`,
        expectedOutput: `姓名：小明
年龄：18（出生于 2008 年）
身高：175 cm
是学生：true`,
        keyPoints: [
          { label: '四种类型都用到', test: 'String[\\s\\S]*int[\\s\\S]*double[\\s\\S]*boolean' },
          { label: '有 final 常量 YEAR', test: 'final\\s+int\\s+YEAR\\s*=' },
          { label: '用 YEAR - age 计算出生年', test: 'YEAR\\s*-\\s*age' },
          { label: '有强制转换为 int 的写法', test: '\\(\\s*int\\s*\\)' }
        ],
        hints: [
          '出生年 = YEAR - age，可以写在字符串拼接里',
          '身高取整：(int) height',
          '拼接时注意括号：(YEAR - age) 否则会先拼字符串'
        ],
        solution: `public class Profile {
    public static void main(String[] args) {
        String name = "小明";
        int age = 18;
        double height = 175.6;
        boolean isStudent = true;
        final int YEAR = 2026;

        System.out.println("姓名：" + name);
        System.out.println("年龄：" + age + "（出生于 " + (YEAR - age) + " 年）");
        System.out.println("身高：" + (int) height + " cm");
        System.out.println("是学生：" + isStudent);
    }
}`
      },
      {
        id: 'ex-j2-2',
        title: '练习 2：秒数转时分秒',
        level: '简单',
        brief: '给定总秒数 3725，用除法和取模算出几小时几分几秒。',
        requirements: [
          '变量名 totalSeconds，值为 3725',
          '使用 / 和 % 运算，不能用 TimeUnit 之类现成工具',
          '输出：3725 秒 = 1 小时 2 分 5 秒'
        ],
        starter: `public class TimeConvert {
    public static void main(String[] args) {
        int totalSeconds = 3725;

        // TODO: 计算 hours / minutes / seconds

    }
}`,
        expectedOutput: `3725 秒 = 1 小时 2 分 5 秒`,
        keyPoints: [
          { label: '使用了 / 3600 得到小时', test: '3600' },
          { label: '使用了 % 取余', test: '%\\s*60' },
          { label: '有 minutes 和 seconds 变量', test: 'minutes[\\s\\S]*seconds' }
        ],
        hints: ['小时 = totalSeconds / 3600', '剩余秒数 = totalSeconds % 3600', '分钟 = 剩余秒数 / 60，秒 = 剩余秒数 % 60'],
        solution: `public class TimeConvert {
    public static void main(String[] args) {
        int totalSeconds = 3725;

        int hours = totalSeconds / 3600;
        int remainder = totalSeconds % 3600;
        int minutes = remainder / 60;
        int seconds = remainder % 60;

        System.out.println(totalSeconds + " 秒 = " + hours + " 小时 " + minutes + " 分 " + seconds + " 秒");
    }
}`
      }
    ],
    checklist: ['能默写 8 种基本类型', '说清 5/2 为什么等于 2', '说清 == 和 equals 的区别', '完成两个练习']
  },
  {
    id: 'j3',
    title: '运算符与键盘输入',
    minutes: 50,
    tags: ['运算符', 'Scanner', '输入'],
    goals: [
      '熟练使用算术、赋值、比较、逻辑运算符',
      '理解短路求值、自增自减的坑',
      '会用 Scanner 读取用户从键盘输入的数据'
    ],
    lessons: [
      { t: 'h', text: '1. 算术运算符' },
      { t: 'table', head: ['运算符', '含义', '示例', '结果'], rows: [
        ['+', '加 / 字符串拼接', '3 + 4', '7'],
        ['-', '减', '10 - 3', '7'],
        ['*', '乘', '3 * 4', '12'],
        ['/', '除', '7 / 2', '3（整数除法）'],
        ['%', '取余（模）', '7 % 2', '1'],
        ['++', '自增 1', 'i = 1; i++', 'i 变成 2'],
        ['--', '自减 1', 'i = 1; i--', 'i 变成 0']
      ]},
      { t: 'code', title: '算术运算的坑', code: `int a = 7, b = 2;                 // 一次声明两个 int 变量

System.out.println(a / b);        // 3：两个 int 相除，结果是整数（小数被丢掉）
System.out.println(a % b);        // 1：取余（模），7 = 2*3 余 1
System.out.println(a / 2.0);      // 3.5：只要有一边是小数，结果就是小数

// 自增/自减：单独一行时前后没区别，参与表达式时才有区别
int i = 5;
int x = i++;   // 先取值再自增：x = 5（取到的旧值），之后 i 变成 6
int y = ++i;   // 先自增再取值：i 变成 7，y = 7
System.out.println(x + " " + y + " " + i);   // 5 7 7

// 复合赋值：写法更短，含义是"先算再赋值"
int total = 10;
total += 5;    // 等价于 total = total + 5，此时 total = 15
total *= 2;    // 等价于 total = total * 2，此时 total = 30
System.out.println(total);

// 判断奇偶：用 % 2 的结果是不是 0
int n = 8;
System.out.println(n % 2 == 0 ? "偶数" : "奇数");   // 三元运算符：条件 ? 真值 : 假值` },
      { t: 'h', text: '2. 比较运算符与逻辑运算符' },
      { t: 'table', head: ['运算符', '含义', '示例', '结果'], rows: [
        ['> < >= <=', '大小比较', '3 >= 3', 'true'],
        ['==', '是否相等', '3 == 4', 'false'],
        ['!=', '是否不等', '3 != 4', 'true'],
        ['&&', '逻辑与（两边都真）', 'true && false', 'false'],
        ['||', '逻辑或（一边真即可）', 'true || false', 'true'],
        ['!', '取反', '!true', 'false']
      ]},
      { t: 'code', title: '短路求值与优先级', code: `int age = 20;
boolean hasCard = true;

// 逻辑与 &&：两边都为 true，结果才是 true
boolean canEnter = age >= 18 && hasCard;
System.out.println(canEnter);       // true

// 短路求值：左边已经能决定结果时，右边根本不会执行
int i = 0;
// 如果写成 &（不短路），10 / i 会被执行 → 抛 ArithmeticException
// 用 && 时左边 i != 0 已经是 false，右边直接跳过，所以这里安全
boolean r = (i != 0) && (10 / i > 2);
System.out.println(r);              // false

// 优先级：算术 > 比较 > 逻辑。记不住就加括号，可读性也更好
boolean b = (3 + 4) * 2 > 10;
System.out.println(b);              // true` },
      { t: 'h', text: '3. 三元运算符' },
      { t: 'code', title: '一行写 if-else', code: `int score = 82;

// 三元运算符：条件 ? 满足时的值 : 不满足时的值
String result = score >= 60 ? "及格" : "不及格";
System.out.println(result);              // 及格

// 常见用法：取两个数的较大值
int a = 10, b = 20;
int max = a > b ? a : b;
System.out.println(max);                 // 20

// 提示：三元适合"二选一"的简单判断；分支多了请用 if-else，否则可读性很差` },
      { t: 'h', text: '4. 从键盘读输入：Scanner' },
      { t: 'code', title: 'Scanner 用法', code: `import java.util.Scanner;   // 一定要导入

public class InputDemo {
    public static void main(String[] args) {
        // System.in 是键盘输入（字节流），Scanner 帮我们包装成"好用的读取工具"
        Scanner sc = new Scanner(System.in);

        System.out.print("请输入姓名：");     // print 不换行，光标停在提示后面，体验更好
        String name = sc.nextLine();       // 读一整行（可以包含空格）

        System.out.print("请输入年龄：");
        int age = sc.nextInt();            // 读一个整数（遇到非数字会抛异常）

        System.out.print("请输入身高（米）：");
        double height = sc.nextDouble();   // 读一个小数

        System.out.println("你好 " + name + "，你今年 " + age + " 岁，身高 " + height + " 米");

        sc.close();                        // 用完关闭，释放资源（好习惯）
    }
}` },
      { t: 'warn', text: 'nextInt() 之后紧接 nextLine() 会“吃掉回车”，读到空字符串。解决办法：nextInt() 后再加一句 sc.nextLine(); 把回车读掉。这是新手最常踩的输入坑。' }
    ],
    quiz: [
      { q: 'int i = 3; int j = i++ + 1; 则 i 和 j 分别是？', options: ['i=3, j=4', 'i=4, j=4', 'i=4, j=5', 'i=3, j=5'], answer: 1, explain: 'i++ 先取值 3 参与运算，j = 3+1 = 4，之后 i 自增为 4。' },
      { q: '17 % 5 的结果是？', options: ['3', '3.4', '2', '3.0'], answer: 2, explain: '17 = 5*3 + 2，余数是 2。' },
      { q: '读入一个整数应该用哪个方法？', options: ['sc.nextLine()', 'sc.nextInt()', 'sc.readInt()', 'sc.next()'], answer: 1, explain: 'nextInt 读取整数；next 读一个单词；nextLine 读一整行字符串。' }
    ],
    exercises: [
      {
        id: 'ex-j3-1',
        title: '练习 1：BMI 计算器',
        level: '简单',
        brief: '读取用户输入的体重（kg）和身高（m），计算 BMI 并输出。BMI = 体重 / 身高²。',
        requirements: [
          '使用 Scanner 读取两个 double',
          'BMI 保留一位小数（提示：Math.round(bmi * 10) / 10.0）',
          '根据 BMI 用三元运算符判断是否偏胖（BMI >= 24 输出“偏胖”，否则“正常”）'
        ],
        starter: `import java.util.Scanner;

public class Bmi {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);

        // TODO: 读取体重、身高，计算 BMI 并输出

        sc.close();
    }
}`,
        expectedOutput: `请输入体重(kg)：70
请输入身高(m)：1.75
你的 BMI 是 22.9，正常`,
        keyPoints: [
          { label: '导入了 Scanner 并创建对象', test: 'import\\s+java\\.util\\.Scanner[\\s\\S]*new\\s+Scanner\\s*\\(\\s*System\\.in\\s*\\)' },
          { label: '读取了两个 double', test: '(?:nextDouble[\\s\\S]*?){2}' },
          { label: 'BMI 公式使用了 height * height', test: 'height\\s*\\*\\s*height|Math\\.pow' },
          { label: '保留一位小数', test: 'Math\\.round|printf|String\\.format' },
          { label: '使用三元运算符', test: '\\?[\\s\\S]*:' }
        ],
        hints: ['BMI = weight / (height * height)', '保留一位小数：double bmi1 = Math.round(bmi * 10) / 10.0;', '输出用 + 拼接即可'],
        solution: `import java.util.Scanner;

public class Bmi {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);

        System.out.print("请输入体重(kg)：");
        double weight = sc.nextDouble();
        System.out.print("请输入身高(m)：");
        double height = sc.nextDouble();

        double bmi = weight / (height * height);
        double rounded = Math.round(bmi * 10) / 10.0;
        String tip = rounded >= 24 ? "偏胖" : "正常";

        System.out.println("你的 BMI 是 " + rounded + "，" + tip);
        sc.close();
    }
}`
      },
      {
        id: 'ex-j3-2',
        title: '练习 2：购物小票计算器（Scanner + 运算）',
        level: '简单',
        brief: '读入单价、数量、付款金额，计算总价；满 100 元打九折，最后算出找零。这道题把刚才学的输入、算术、三元运算符全用上了。',
        requirements: [
          '用 Scanner 依次读入：单价（double）、数量（int）、付款金额（double）',
          '总价 = 单价 × 数量',
          '总价满 100 元打九折（用三元运算符实现），否则不打折',
          '找零 = 付款金额 − 折后金额',
          '折后金额和找零都用 String.format("%.2f", ...) 保留两位小数输出',
          '最后关闭 Scanner'
        ],
        starter: `import java.util.Scanner;

      public class Receipt {
          public static void main(String[] args) {
              Scanner sc = new Scanner(System.in);

              // TODO: 读入单价、数量、付款金额
              // TODO: 计算总价、折后金额、找零并输出

              sc.close();
          }
      }`,
        expectedOutput: `总价：102.0
      折后：91.80
      找零：108.20`,
        keyPoints: [
          { label: '创建了 Scanner 并读取三个值', test: 'new\\s+Scanner\\s*\\([\\s\\S]*nextDouble[\\s\\S]*nextInt[\\s\\S]*nextDouble' },
          { label: '总价 = 单价 * 数量', test: 'price\\s*\\*\\s*count|count\\s*\\*\\s*price' },
          { label: '用三元运算符判断是否打折', test: '\\?[\\s\\S]*:' },
          { label: '使用 String.format 保留两位小数', test: 'String\\.format\\s*\\(\\s*"%\\.2f"' },
          { label: '计算了找零（用减法）', test: 'paid\\s*-\\s*' },
          { label: '关闭了 Scanner', test: 'sc\\.close\\s*\\(' }
        ],
        hints: [
          '读入顺序要和提示一致：先单价、再数量、最后付款金额',
          '打折写法：double discount = total >= 100 ? total * 0.9 : total;',
          '两位小数：String.format("%.2f", discount)，它返回的是字符串，可以直接拼接',
          '找零可能出现 -0.00 这种难看的结果，正式项目里要先判断付款够不够'
        ],
        solution: `import java.util.Scanner;

      public class Receipt {
          public static void main(String[] args) {
              Scanner sc = new Scanner(System.in);

              System.out.print("请输入单价：");
              double price = sc.nextDouble();
              System.out.print("请输入数量：");
              int count = sc.nextInt();
              System.out.print("请输入付款金额：");
              double paid = sc.nextDouble();

              double total = price * count;
              double discount = total >= 100 ? total * 0.9 : total;
              double change = paid - discount;

              System.out.println("总价：" + total);
              System.out.println("折后：" + String.format("%.2f", discount));
              System.out.println("找零：" + String.format("%.2f", change));

              sc.close();
          }
      }`
      }
    ],
    checklist: ['能说出 i++ 和 ++i 的区别', '理解 && 的短路特性', '会用 Scanner 读三种类型的数据']
  },
  {
    id: 'j4',
    title: '分支结构：让程序会做选择',
    minutes: 50,
    tags: ['if', 'switch', '判断'],
    goals: [
      '用 if / else if / else 处理多条件判断',
      '用 switch 处理等值判断，认识 Java 14 的箭头写法',
      '学会把复杂条件拆解成逻辑表达式'
    ],
    lessons: [
      { t: 'h', text: '1. if / else if / else' },
      { t: 'code', title: '成绩等级判断', code: `import java.util.Scanner;

public class Grade {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.print("请输入成绩(0-100)：");
        int score = sc.nextInt();

        // 多条分支：从上往下依次判断，命中一个就跳出整条链
        // 所以条件必须"从严格到宽松"排（先 >= 90，再 >= 80）
        if (score < 0 || score > 100) {          // 先做合法性校验，防止脏数据
            System.out.println("成绩不合法");
        } else if (score >= 90) {                // 90 ~ 100
            System.out.println("A 优秀");
        } else if (score >= 80) {                // 80 ~ 89（走到这里说明前面都 false，即 < 90）
            System.out.println("B 良好");
        } else if (score >= 70) {
            System.out.println("C 中等");
        } else if (score >= 60) {
            System.out.println("D 及格");
        } else {                                 // 剩下的情况：< 60
            System.out.println("F 不及格，需要补考");
        }
        sc.close();
    }
}` },
      { t: 'warn', text: 'if / else if 是从上往下依次判断，**满足一个就跳出**。所以条件要从严格到宽松排：先写 score >= 90，再写 score >= 80。如果顺序反了，90 分也会被 >= 80 先抓住。' },
      { t: 'h', text: '2. 嵌套与复杂条件' },
      { t: 'code', title: '判断闰年', code: `int year = 2024;

// 闰年规则：能被 4 整除、且不能被 100 整除；或者能被 400 整除
// 注意 && 的优先级高于 ||，所以 ( ) 最好加上，别人一眼就能看懂
boolean isLeap = (year % 4 == 0 && year % 100 != 0) || (year % 400 == 0);
System.out.println(year + " 是闰年吗？" + isLeap);

// 下面是"嵌套 if"的写法：逻辑一样，但层数多、可读性差
int age = 20;
boolean isMember = true;
if (age >= 18) {                 // 外层：是否成年
    if (isMember) {              // 内层：是否会员
        System.out.println("成年会员：享受会员价");
    } else {
        System.out.println("成年非会员：原价");
    }
} else {
    System.out.println("未成年：需要监护人陪同");
}` },
      { t: 'h', text: '3. switch 与 Java 14 箭头语法' },
      { t: 'code', title: '两种 switch 写法', code: `int day = 3;

// ---------- 写法一：传统 switch ----------
// 每个 case 后面必须写 break，否则会"穿透"继续执行下一个 case
switch (day) {
    case 1:
    case 2:
    case 3:                       // 1~3 共用同一段逻辑，可以连续写多个 case
        System.out.println("上半周");
        break;                    // 结束 switch，不加就会继续往下执行
    case 6:
    case 7:
        System.out.println("周末");
        break;
    default:                      // 以上都没匹配时执行
        System.out.println("其他");
}

// ---------- 写法二：Java 14+ 箭头 switch ----------
// 不用 break、不会穿透，还能直接把结果赋值给变量
String type = switch (day) {
    case 1, 2, 3 -> "上半周";      // 多个值写在一起，用逗号分隔
    case 4, 5 -> "下半周";
    case 6, 7 -> "周末";
    default -> "非法日期";
};
System.out.println(type);

// switch 支持的类型：byte short int char String 枚举（不支持 long、float、double）` },
      { t: 'tip', text: '选择建议：**等值判断**（判断某个变量等于哪些固定值）用 switch，**范围判断**（大于、小于、区间）用 if。代码里最忌讳的是 if 套 if 套 if，超过三层就该抽方法了。' }
    ],
    quiz: [
      { q: '以下代码输出什么？ int x = 95; if (x >= 80) System.out.print("B"); else if (x >= 90) System.out.print("A");', options: ['A', 'B', 'AB', '什么都不输出'], answer: 1, explain: '从上往下判断，x >= 80 先成立，输出 B。这题说明条件顺序很重要。' },
      { q: '判断闰年，正确写法是？', options: ['year % 4 == 0', 'year % 4 == 0 && year % 100 != 0 || year % 400 == 0', 'year % 4 == 0 && year % 400 == 0', 'year % 100 == 0'], answer: 1, explain: '还要注意 && 优先级高于 ||，稳妥写法是加括号。' },
      { q: '传统 switch 中漏写 break 会怎样？', options: ['编译报错', '什么都不执行', '继续执行后面的 case（穿透）', '自动跳出'], answer: 2, explain: '这就是 case 穿透，也是箭头 switch 被设计出来的原因之一。' }
    ],
    exercises: [
      {
        id: 'ex-j4-1',
        title: '练习 1：成绩等级 + 闰年判断',
        level: '简单',
        brief: '写一个类 Judge，先判断成绩等级，再判断输入的年份是否闰年。',
        requirements: [
          '用 if / else if 输出 A/B/C/D/F 五档',
          '成绩小于 0 或大于 100 时输出“成绩不合法”',
          '用一行逻辑表达式判断闰年并输出',
          '至少用一次 switch，根据等级输出一句鼓励语'
        ],
        starter: `public class Judge {
    public static void main(String[] args) {
        int score = 88;
        int year = 2024;

        // TODO: 1. 判断等级   2. 判断闰年   3. switch 输出鼓励语

    }
}`,
        expectedOutput: `成绩等级：B
2024 是闰年
继续加油，你离优秀只差一点`,
        keyPoints: [
          { label: '有 if / else if 多分支', test: 'else\\s+if' },
          { label: '判断成绩范围合法性', test: 'score\\s*<\\s*0|score\\s*>\\s*100' },
          { label: '闰年条件含 % 400', test: '400' },
          { label: '使用了 switch', test: 'switch\\s*\\(' }
        ],
        hints: ['等级用 char 或 String 存，例如 char level = \'B\';', 'switch 判断 char 时 case 要写 case \'A\':', '闰年：(year % 4 == 0 && year % 100 != 0) || year % 400 == 0'],
        solution: `public class Judge {
    public static void main(String[] args) {
        int score = 88;
        int year = 2024;

        char level;
        if (score < 0 || score > 100) {
            System.out.println("成绩不合法");
            return;
        } else if (score >= 90) {
            level = 'A';
        } else if (score >= 80) {
            level = 'B';
        } else if (score >= 70) {
            level = 'C';
        } else if (score >= 60) {
            level = 'D';
        } else {
            level = 'F';
        }
        System.out.println("成绩等级：" + level);

        boolean isLeap = (year % 4 == 0 && year % 100 != 0) || (year % 400 == 0);
        System.out.println(year + (isLeap ? " 是闰年" : " 不是闰年"));

        switch (level) {
            case 'A' -> System.out.println("太强了，保持住");
            case 'B' -> System.out.println("继续加油，你离优秀只差一点");
            case 'C' -> System.out.println("基础还行，多练题");
            default -> System.out.println("从今天开始，一切都来得及");
        }
    }
}`
      }
    ],
    checklist: ['理解 if 从上到下匹配的机制', '会用 switch 箭头语法', '能独立写出闰年判断']
  },
  {
    id: 'j5',
    title: '循环结构：让程序重复干活',
    minutes: 60,
    tags: ['for', 'while', '嵌套循环'],
    goals: [
      '掌握 for、while、do-while 三种循环的适用场景',
      '会用 break / continue 控制循环',
      '能写出嵌套循环解决图形与乘法表问题'
    ],
    lessons: [
      { t: 'h', text: '1. for 循环：次数已知时首选' },
      { t: 'code', title: 'for 的结构', code: `// for (初始化; 循环条件; 每次循环后执行) { 循环体 }
for (int i = 1; i <= 5; i++) {
    System.out.println("第 " + i + " 次循环");   // 会执行 5 次：i = 1,2,3,4,5
}

// 累加求和：1 + 2 + ... + 100
int sum = 0;                        // 累加器，必须初始化
for (int i = 1; i <= 100; i++) {
    sum += i;                       // 等价于 sum = sum + i
}
System.out.println("1~100 的和 = " + sum);     // 5050

// 遍历数组：用下标循环（i 从 0 到 length-1）
int[] scores = {90, 85, 77};
for (int i = 0; i < scores.length; i++) {      // 注意是 < 不是 <=
    System.out.println("第 " + (i + 1) + " 个成绩：" + scores[i]);
}

// 增强 for（for-each）：只关心元素值、不需要下标时更简洁
for (int s : scores) {
    System.out.println(s);
}

// 倒着循环：从 5 递减到 1
for (int i = 5; i >= 1; i--) {
    System.out.print(i + " ");      // print 不换行
}
System.out.println();               // 最后手动换行` },
      { t: 'h', text: '2. while 与 do-while：次数未知时用' },
      { t: 'code', title: '什么时候用 while', code: `// while：先判断条件，条件不成立时一次都不执行
int count = 0;
while (count < 3) {
    System.out.println("while 执行中 " + count);
    count++;                        // 千万别忘：否则条件永远成立 → 死循环
}

// do-while：先执行一次循环体，再判断条件；至少执行一次
int n = 10;
do {
    System.out.println("至少会执行一次，n = " + n);
    n++;
} while (n < 5);                    // 注意这里有分号

// 典型场景：不知道要循环几次，达到目标才结束
int answer = 43;      // 1 + 7*6 = 43，六次就猜中
int guess = 1;
int times = 0;
while (guess != answer) {           // 只要没猜中就一直循环
    guess += 7;
    times++;
}
System.out.println("猜了 " + times + " 次");   // 6` },
      { t: 'h', text: '3. break 与 continue' },
      { t: 'code', title: '打断与跳过', code: `// break：立即结束整个循环
for (int i = 1; i <= 10; i++) {
    if (i == 5) {
        break;      // 到 5 就整个结束，后面的 6~10 都不执行
    }
    System.out.print(i + " ");      // 输出：1 2 3 4
}
System.out.println();

// continue：跳过本次循环剩下的代码，直接进入下一次
for (int i = 1; i <= 10; i++) {
    if (i % 2 == 0) {
        continue;   // 偶数直接跳过，不执行下面的打印
    }
    System.out.print(i + " ");      // 输出：1 3 5 7 9
}
System.out.println();

// 记忆：break 是"整个循环不干了"，continue 是"这次不算，接着下一次"` },
      { t: 'h', text: '4. 嵌套循环：打印图形' },
      { t: 'code', title: '九九乘法表与星星金字塔', code: `// ---------- 九九乘法表 ----------
// 外层循环控制"行"（i 是第二个乘数），内层循环控制"列"（j 是第一个乘数）
for (int i = 1; i <= 9; i++) {
    for (int j = 1; j <= i; j++) {          // 第 i 行只打印 i 个算式，所以 j <= i
        System.out.print(j + "x" + i + "=" + (i * j) + "\\t");   // \\t 制表符对齐
    }
    System.out.println();                   // 一行打印完换行
}

// ---------- 星星金字塔 ----------
int rows = 5;
for (int i = 1; i <= rows; i++) {
    // 先打印空格：第 i 行需要 rows - i 个空格，让星星居中
    for (int space = 1; space <= rows - i; space++) {
        System.out.print(" ");
    }
    // 再打印星星：第 i 行有 2*i-1 个星（1、3、5、7、9）
    for (int star = 1; star <= 2 * i - 1; star++) {
        System.out.print("*");
    }
    System.out.println();                   // 这一行结束
}

// 嵌套循环口诀：外层管行，内层管列；先找规律，再写条件` },
      { t: 'tip', text: '写嵌套循环的诀窍：**外层控制行，内层控制列**。先在纸上画出前 3 行的样子，找出“第 i 行有几个符号”的规律，再写循环条件。' },
      { t: 'warn', text: '死循环警告：while (true) 里如果没有 break 条件，程序会一直跑。另外 for (int i = 0; i < 10; i--) 也是常见的写错方向。Ctrl + C 可以强制结束卡住的程序。' }
    ],
    quiz: [
      { q: 'for (int i = 0; i < 5; i++) 循环体会执行几次？', options: ['4 次', '5 次', '6 次', '无限次'], answer: 1, explain: 'i = 0,1,2,3,4，共 5 次。' },
      { q: 'do-while 和 while 的关键区别是？', options: ['do-while 执行更快', 'do-while 至少执行一次循环体', 'while 不能写 continue', '没有区别'], answer: 1, explain: 'do-while 先执行再判断，所以至少执行一次。' },
      { q: '在循环中用 continue 会怎样？', options: ['结束整个循环', '跳过本次剩余代码，进入下一次循环', '程序报错', '重新开始循环计数器'], answer: 1, explain: 'break 结束整个循环，continue 只是跳过本次。' }
    ],
    exercises: [
      {
        id: 'ex-j5-1',
        title: '练习 1：九九乘法表 + 统计',
        level: '中等',
        brief: '一个类 LoopPractice，完成三个小任务。',
        requirements: [
          '任务 1：用嵌套循环打印完整九九乘法表（9 行）',
          '任务 2：求 1~100 中所有能被 7 整除的数之和',
          '任务 3：统计 1~100 中有多少个素数（用 break 提前结束内层判断）'
        ],
        starter: `public class LoopPractice {
    public static void main(String[] args) {
        // 任务 1

        // 任务 2

        // 任务 3

    }
}`,
        expectedOutput: `1x1=1  1x2=2 2x2=4  ...（共 9 行）
1~100 中能被 7 整除的数之和 = 735
1~100 中的素数个数 = 25`,
        keyPoints: [
          { label: '有嵌套循环', test: 'for[\\s\\S]*\\{[\\s\\S]*for' },
          { label: '使用了 % 7 判断整除', test: '%\\s*7' },
          { label: '素数判断中使用了 break', test: 'break' },
          { label: '有计数器变量', test: 'count|\\+\\+' }
        ],
        hints: [
          '乘法表内层循环条件 j <= i，这样才是三角形',
          '能被 7 整除：i % 7 == 0',
          '素数：大于 1 且只能被 1 和自身整除。判断时从 2 循环到 i-1，一旦发现能整除就 break 并标记为不是素数'
        ],
        solution: `public class LoopPractice {
    public static void main(String[] args) {
        // 任务 1：九九乘法表
        for (int i = 1; i <= 9; i++) {
            for (int j = 1; j <= i; j++) {
                System.out.print(j + "x" + i + "=" + (i * j) + "\\t");
            }
            System.out.println();
        }

        // 任务 2：能被 7 整除的数之和
        int sum = 0;
        for (int i = 1; i <= 100; i++) {
            if (i % 7 == 0) {
                sum += i;
            }
        }
        System.out.println("1~100 中能被 7 整除的数之和 = " + sum);

        // 任务 3：统计素数个数
        int primeCount = 0;
        for (int i = 2; i <= 100; i++) {
            boolean isPrime = true;
            for (int j = 2; j < i; j++) {
                if (i % j == 0) {
                    isPrime = false;
                    break;
                }
            }
            if (isPrime) {
                primeCount++;
            }
        }
        System.out.println("1~100 中的素数个数 = " + primeCount);
    }
}`
      },
      {
        id: 'ex-j5-2',
        title: '练习 2：打印菱形 + 阶乘表',
        level: '中等',
        brief: '用嵌套循环画一个 7 行的菱形，再打印 1! 到 10! 的值。画图形最能训练“外层管行、内层管列”的思维。',
        requirements: [
          '第一段：用两层 for 循环打印菱形（上半 4 行 + 下半 3 行，共 7 行）',
          '第 i 行先打印 n - i 个空格，再打印 2 * i - 1 个星号',
          '打印完每一行要用 System.out.println() 换行',
          '第二段：用一层 for 循环计算并打印 1! 到 10!（用 long 保存结果）',
          '输出格式形如：5! = 120'
        ],
        starter: `public class DiamondAndFactorial {
          public static void main(String[] args) {
              int n = 4;

              // TODO: 上半部分（1~n 行）
              // TODO: 下半部分（n-1 ~ 1 行）
              // TODO: 打印 1! 到 10!
          }
      }`,
        expectedOutput: `   *
        ***
       *****
      *******
       *****
        ***
         *
      1! = 1
      2! = 2
      3! = 6
      4! = 24
      5! = 120
      6! = 720
      7! = 5040
      8! = 40320
      9! = 362880
      10! = 3628800`,
        keyPoints: [
          { label: '使用了嵌套循环（for 里面还有 for）', test: 'for[\\s\\S]*\\{[\\s\\S]*for' },
          { label: '用 Space/空格循环控制缩进', test: 'print\\s*\\(\\s*"\\s*"\\s*\\)' },
          { label: '用星号循环打印 *', test: 'print\\s*\\(\\s*"\\*"\\s*\\)' },
          { label: '有第二段循环打印阶乘', test: 'fact\\s*\\*=|\\*=\\s*i' },
          { label: '用 long 保存阶乘结果', test: 'long\\s+fact' }
        ],
        hints: [
          '上半部分：外层 i 从 1 到 n，内层两个循环分别打印空格和星号',
          '下半部分把外层改成 i 从 n-1 递减到 1 即可，内层逻辑完全一样',
          '阶乘：fact 初始为 1，循环里 fact *= i，然后打印 i + "! = " + fact'
        ],
        solution: `public class DiamondAndFactorial {
          public static void main(String[] args) {
              int n = 4;

              for (int i = 1; i <= n; i++) {
                  for (int s = 1; s <= n - i; s++) {
                      System.out.print(" ");
                  }
                  for (int k = 1; k <= 2 * i - 1; k++) {
                      System.out.print("*");
                  }
                  System.out.println();
              }

              for (int i = n - 1; i >= 1; i--) {
                  for (int s = 1; s <= n - i; s++) {
                      System.out.print(" ");
                  }
                  for (int k = 1; k <= 2 * i - 1; k++) {
                      System.out.print("*");
                  }
                  System.out.println();
              }

              long fact = 1;
              for (int i = 1; i <= 10; i++) {
                  fact *= i;
                  System.out.println(i + "! = " + fact);
              }
          }
      }`
      }
    ],
    checklist: ['能说清三种循环各自适合的场景', '会写嵌套循环打印三角形', '独立完成素数统计练习']
  },
  {
    id: 'j6',
    title: '数组与字符串处理',
    minutes: 70,
    tags: ['数组', '二维数组', '排序', 'String'],
    goals: [
      '创建、初始化、遍历一维和二维数组',
      '掌握求和、求最值、查找、排序等典型数组算法',
      '熟练使用 String 与 Arrays 的常用方法'
    ],
    lessons: [
      { t: 'h', text: '1. 数组：一排连续的盒子' },
      { t: 'code', title: '数组的声明与遍历', code: `// 方式一：先声明长度，元素用默认值填充（int 默认 0）
int[] scores = new int[5];

// 方式二：声明时直接给出元素（最常用）
int[] nums = {12, 5, 30, 8, 21};

// 方式三：写全 new 类型[]{...}，等价于方式二
String[] names = new String[]{"小明", "小红", "小刚"};

System.out.println(nums.length);      // 5：length 是"属性"，不是方法，不写括号
System.out.println(nums[0]);          // 12：下标从 0 开始，所以第一个是 [0]
System.out.println(nums[nums.length - 1]);  // 21：最后一个元素的标准写法

// 默认值：int/long 是 0、double 是 0.0、boolean 是 false、String 等引用类型是 null
System.out.println(scores[0]);        // 0

// 遍历方式一：普通 for，需要下标时用它
for (int i = 0; i < nums.length; i++) {
    System.out.println("nums[" + i + "] = " + nums[i]);
}

// 遍历方式二：增强 for（for-each），只关心元素值时更简洁
for (String n : names) {
    System.out.println(n);
}

// 修改元素：直接给下标赋值
nums[1] = 100;
System.out.println(nums[1]);          // 100` },
      { t: 'warn', text: '下标越界：数组长度是 5 时，合法下标是 0~4。访问 nums[5] 会抛 ArrayIndexOutOfBoundsException。循环条件写成 i <= nums.length 是最常见的错误。' },
      { t: 'h', text: '2. 数组的典型算法' },
      { t: 'code', title: '求和、平均、最值、查找', code: `int[] scores = {88, 92, 75, 96, 61, 85};

// ---------- 求和与平均 ----------
int sum = 0;                              // 累加器必须先初始化
for (int s : scores) {
    sum += s;                             // 每个元素累加进来
}
// 注意：(double) 不能省！否则 sum / 长度 会做整数除法，小数部分全丢
double average = (double) sum / scores.length;
System.out.println("总分 " + sum + "，平均 " + average);

// ---------- 最大值 / 最小值 ----------
// 关键技巧：用"第一个元素"初始化，而不是 0（否则数组全是负数时会得到错误结果）
int max = scores[0];
int min = scores[0];
for (int s : scores) {
    if (s > max) max = s;                 // 比当前最大还大 → 更新
    if (s < min) min = s;                 // 比当前最小还小 → 更新
}
System.out.println("最高分 " + max + "，最低分 " + min);

// ---------- 查找 ----------
int target = 96;
int index = -1;                           // 约定：找不到就返回 -1
for (int i = 0; i < scores.length; i++) {
    if (scores[i] == target) {
        index = i;                        // 记录下标
        break;                            // 已经找到，提前结束循环
    }
}
System.out.println(index >= 0 ? "找到了，下标 " + index : "没找到");` },
      { t: 'h', text: '3. 冒泡排序：理解算法的第一课' },
      { t: 'code', title: '手写冒泡排序', code: `int[] arr = {5, 2, 9, 1, 7};

// 冒泡排序：每一轮把"当前未排序部分里最大的数"冒到末尾
// 外层 i：一共需要 n-1 轮
for (int i = 0; i < arr.length - 1; i++) {
    // 内层 j：每一轮两两比较；末尾的 i 个已经排好，所以减 i 可以少比几次
    for (int j = 0; j < arr.length - 1 - i; j++) {
        if (arr[j] > arr[j + 1]) {        // 左边比右边大 → 交换（升序）
            int temp = arr[j];            // 交换三步曲：借助临时变量
            arr[j] = arr[j + 1];
            arr[j + 1] = temp;
        }
    }
}

// 排序后输出
for (int n : arr) {
    System.out.print(n + " ");            // 1 2 5 7 9
}` },
      { t: 'h', text: '4. 二维数组' },
      { t: 'code', title: '二维数组', code: `// 二维数组 = "数组的数组"：3 个学生，每人 3 门课成绩
int[][] table = {
    {90, 85, 88},      // 第 0 行：学生 1
    {70, 65, 80},      // 第 1 行：学生 2
    {100, 95, 99}      // 第 2 行：学生 3
};

System.out.println(table.length);       // 3：有几行
System.out.println(table[0].length);    // 3：第 0 行有几个元素（列数）
System.out.println(table[1][2]);        // 80：第 1 行第 2 列（先找行，再找列）

// 遍历：外层走行，内层走列
for (int i = 0; i < table.length; i++) {
    int rowSum = 0;                     // 这一行的总分
    for (int j = 0; j < table[i].length; j++) {
        rowSum += table[i][j];          // 累加当前行每个元素
    }
    System.out.println("第 " + (i + 1) + " 个学生总分：" + rowSum);
}` },
      { t: 'h', text: '5. Arrays 与 String 的常用方法' },
      { t: 'table', head: ['方法', '作用'], rows: [
        ['Arrays.toString(arr)', '把数组转成可读字符串'],
        ['Arrays.sort(arr)', '升序排序（原地修改）'],
        ['Arrays.copyOf(arr, n)', '复制数组到指定长度'],
        ['Arrays.fill(arr, 0)', '全部填充为 0'],
        ['Arrays.equals(a, b)', '判断两个数组内容是否一致'],
        ['Arrays.binarySearch(arr, x)', '二分查找（必须已排序）'],
        ['String.format("%.2f", d)', '格式化字符串，两位小数'],
        ['s.split(",")', '按分隔符拆成数组'],
        ['String.join("-", arr)', '把数组拼成字符串'],
        ['s.trim()', '去掉首尾空格'],
        ['s.indexOf("a")', '查找子串位置，没有返回 -1'],
        ['s.equals("abc")', '内容比较（区分大小写）'],
        ['s.equalsIgnoreCase("ABC")', '忽略大小写比较']
      ]},
      { t: 'code', title: 'Arrays 与 String 实战', code: `import java.util.Arrays;   // 数组工具类要导入

int[] arr = {5, 2, 9, 1};
Arrays.sort(arr);                                    // 原地升序排序，会修改原数组
System.out.println(Arrays.toString(arr));            // [1, 2, 5, 9]：打印数组必须用它

String csv = "小明,小红,小刚";
String[] users = csv.split(",");                     // 按逗号拆成字符串数组
System.out.println(users.length);                    // 3
System.out.println(String.join(" | ", users));        // 用 " | " 把数组拼回字符串

String raw = "   Hello World  ";
System.out.println(raw.trim());                      // Hello World：去掉首尾空格
System.out.println(raw.trim().toUpperCase());        // HELLO WORLD：链式调用（先 trim 再转大写）

double rate = 0.8567;
// %.1f 表示保留 1 位小数；%% 输出一个百分号（因为 % 是格式占位符的引导符）
System.out.println(String.format("通过率：%.1f%%", rate * 100));   // 通过率：85.7%` }
    ],
    quiz: [
      { q: 'int[] a = new int[3]; 则 a[0] 的值是？', options: ['null', '0', '编译错误', '随机值'], answer: 1, explain: 'int 是基本类型，数组元素默认值是 0。' },
      { q: '数组长度是 5，下列哪个下标访问会抛异常？', options: ['a[0]', 'a[4]', 'a[5]', 'a[a.length - 1]'], answer: 2, explain: '合法下标是 0~4，a[5] 越界。' },
      { q: '打印数组内容推荐用？', options: ['System.out.println(arr)', 'Arrays.toString(arr)', 'arr.toString()', 'String.valueOf(arr)'], answer: 1, explain: '直接打印数组得到的是类似 [I@1b6d3586 的地址信息。' },
      { q: '"a,b,c".split(",") 的结果长度是？', options: ['1', '2', '3', '4'], answer: 2, explain: '被两个逗号分成三段。' }
    ],
    exercises: [
      {
        id: 'ex-j6-1',
        title: '练习 1：班级成绩分析',
        level: '中等',
        brief: '给定一个班的成绩数组，完成统计并输出报告。',
        requirements: [
          '数组 scores = {88, 92, 75, 96, 61, 85, 78, 53, 90, 82}',
          '输出总分、平均分（保留一位小数）、最高分、最低分',
          '统计及格（>=60）人数和不及格人数',
          '用 Arrays.sort 升序排序后输出排序结果（Arrays.toString）'
        ],
        starter: `import java.util.Arrays;

public class ScoreReport {
    public static void main(String[] args) {
        int[] scores = {88, 92, 75, 96, 61, 85, 78, 53, 90, 82};

        // TODO: 统计并输出报告

    }
}`,
        expectedOutput: `总分：800
平均分：80.0
最高分：96，最低分：53
及格：9 人，不及格：1 人
排序后：[53, 61, 75, 78, 82, 85, 88, 90, 92, 96]`,
        keyPoints: [
          { label: '遍历求和', test: 'sum\\s*\\+=' },
          { label: '求最值逻辑', test: 'max|min' },
          { label: '统计及格人数', test: '>=\\s*60' },
          { label: '使用了 Arrays.sort 和 Arrays.toString', test: 'Arrays\\.sort[\\s\\S]*Arrays\\.toString' },
          { label: '平均分保留一位小数', test: 'Math\\.round|String\\.format|printf' }
        ],
        hints: [
          '平均分：(double) sum / scores.length，再用 Math.round(x*10)/10.0',
          '最值初始化用 scores[0]，不要用 0（否则全是负数时会出错）',
          '排序会改变原数组顺序，先统计再排序'
        ],
        solution: `import java.util.Arrays;

public class ScoreReport {
    public static void main(String[] args) {
        int[] scores = {88, 92, 75, 96, 61, 85, 78, 53, 90, 82};

        int sum = 0;
        int max = scores[0];
        int min = scores[0];
        int pass = 0;

        for (int s : scores) {
            sum += s;
            if (s > max) max = s;
            if (s < min) min = s;
            if (s >= 60) pass++;
        }

        double avg = Math.round((double) sum / scores.length * 10) / 10.0;
        System.out.println("总分：" + sum);
        System.out.println("平均分：" + avg);
        System.out.println("最高分：" + max + "，最低分：" + min);
        System.out.println("及格：" + pass + " 人，不及格：" + (scores.length - pass) + " 人");

        Arrays.sort(scores);
        System.out.println("排序后：" + Arrays.toString(scores));
    }
}`
      },
      {
        id: 'ex-j6-2',
        title: '练习 2：字符串分析器',
        level: '中等',
        brief: '读取一句英文句子，统计单词个数、最长单词、以及反转后的句子。',
        requirements: [
          '字符串 sentence = "Java is the foundation of Android development"',
          '用 split(" ") 拆分成数组，输出单词个数',
          '找出最长的单词并输出',
          '把单词顺序反转（development Android of ...）输出'
        ],
        starter: `public class WordAnalyzer {
    public static void main(String[] args) {
        String sentence = "Java is the foundation of Android development";

        // TODO: 分析这句英文

    }
}`,
        expectedOutput: `单词个数：7
最长的单词：development（11 个字母）
反转后：development Android of foundation the is Java`,
        keyPoints: [
          { label: '使用了 split 拆分', test: 'split\\s*\\(\\s*"' },
          { label: '用 length() 比较长度', test: '\\.length\\s*\\(\\s*\\)' },
          { label: '有倒序遍历', test: 'i--' }
        ],
        hints: ['words.length 是单词个数，words[i].length() 是单词长度', '最长单词：先假设 words[0]，再逐个比较长度', '倒序输出：for (int i = words.length - 1; i >= 0; i--)'],
        solution: `public class WordAnalyzer {
    public static void main(String[] args) {
        String sentence = "Java is the foundation of Android development";
        String[] words = sentence.split(" ");

        System.out.println("单词个数：" + words.length);

        String longest = words[0];
        for (String w : words) {
            if (w.length() > longest.length()) {
                longest = w;
            }
        }
        System.out.println("最长的单词：" + longest + "（" + longest.length() + " 个字母）");

        StringBuilder sb = new StringBuilder();
        for (int i = words.length - 1; i >= 0; i--) {
            sb.append(words[i]);
            if (i > 0) sb.append(" ");
        }
        System.out.println("反转后：" + sb);
    }
}`
      }
    ],
    checklist: ['能手写遍历求最值', '理解冒泡排序的两层循环', '会用 Arrays.toString 打印数组']
  },
  {
    id: 'j7',
    title: '方法：把代码变成积木',
    minutes: 60,
    tags: ['方法', '重载', '递归', '参数传递'],
    goals: [
      '会定义有参有返回值的方法，并正确调用',
      '理解值传递机制（基本类型 vs 引用类型）',
      '会用方法重载和递归解决常见问题'
    ],
    lessons: [
      { t: 'p', text: '方法是可复用的代码块：给它输入（参数），它给你输出（返回值）。把长代码拆成小方法，是专业程序员和初学者的最大区别。' },
      { t: 'h', text: '1. 方法的定义与调用' },
      { t: 'code', title: '方法四要素', code: `public class MethodDemo {

    // 方法四要素：① 修饰符 ② 返回类型 ③ 方法名 ④ 参数列表
    public static int add(int a, int b) {
        return a + b;              // return 把结果交还给调用者，类型必须是 int
    }

    // 没有返回值用 void
    public static void printLine(String msg) {
        System.out.println("==== " + msg + " ====");
    }

    // 没有参数的方法：参数列表写空括号
    public static double getPi() {
        return 3.14159;
    }

    // 多个 return：一执行到 return 方法立刻结束（所以下面的 return 不会执行）
    public static String checkScore(int score) {
        if (score < 0 || score > 100) {
            return "非法成绩";     // 提前结束
        }
        if (score >= 60) {
            return "及格";
        }
        return "不及格";           // 兜底：前面都不满足才会走到这里
    }

    public static void main(String[] args) {
        int result = add(10, 20);              // 用变量接住返回值
        System.out.println(result);            // 30
        printLine("开始学习");                  // void 方法直接调用
        System.out.println(getPi());           // 3.14159
        System.out.println(checkScore(59));    // 不及格
    }
}` },
      { t: 'tip', text: '方法命名用动词开头：calculateAverage、isPrime、printReport。一个方法最好只做一件事，超过 30 行就该思考怎么拆。' },
      { t: 'h', text: '2. 值传递：参数到底传了什么' },
      { t: 'code', title: '基本类型 vs 数组', code: `// 参数是基本类型：方法里改的是"副本"，外面的变量不受影响
public static void changeNumber(int n) {
    n = 100;          // 只改了副本
}

// 参数是数组（引用类型）：传进来的是"地址的副本"，但地址指向同一个数组对象
public static void changeArray(int[] arr) {
    arr[0] = 999;     // 改的是同一个数组里的元素，外面能看到
}

public static void main(String[] args) {
    int x = 5;
    changeNumber(x);
    System.out.println(x);       // 5：没变！因为基本类型传的是值的副本

    int[] nums = {1, 2, 3};
    changeArray(nums);
    System.out.println(nums[0]); // 999：变了！因为两个引用指向同一个数组

    // 记住结论：Java 只有值传递。
    // 引用类型传的是"地址的副本"，所以能改它指向的内容，但改不了外面的引用本身
}` },
      { t: 'warn', text: 'Java 只有值传递。基本类型传的是“值的副本”，引用类型传的是“地址的副本”——所以改地址指向的内容能看到，改引用本身（比如 arr = new int[3]）外面看不到。' },
      { t: 'h', text: '3. 方法重载：同名不同参' },
      { t: 'code', title: '重载与可变参数', code: `// 方法重载：同一个类中，方法名相同、参数列表不同（个数 / 类型 / 顺序）
public static int add(int a, int b) { return a + b; }
public static int add(int a, int b, int c) { return a + b + c; }        // 参数个数不同
public static double add(double a, double b) { return a + b; }          // 参数类型不同
public static String add(String a, String b) { return a + b; }          // 参数类型不同

// 可变参数：类型后面写三个点，表示"个数不定"，在方法内部当数组用
public static int sumAll(int... nums) {
    int total = 0;
    for (int n : nums) {          // 用法和数组一样
        total += n;
    }
    return total;
}

public static void main(String[] args) {
    System.out.println(add(1, 2));            // 3：按参数个数/类型自动挑对应方法
    System.out.println(add(1, 2, 3));         // 6
    System.out.println(add(1.5, 2.5));        // 4.0
    System.out.println(add("a", "b"));        // ab
    System.out.println(sumAll(1, 2, 3, 4, 5));// 15：想传几个就传几个
}` },
      { t: 'h', text: '4. 递归：方法自己调用自己' },
      { t: 'code', title: '递归的两个必备条件', code: `// 递归必须满足两点：① 有出口（结束条件）② 每次调用都在向出口靠近

// 阶乘：n! = n * (n-1)!
public static long factorial(int n) {
    if (n <= 1) {
        return 1;                  // 出口：1! 和 0! 都是 1
    }
    return n * factorial(n - 1);   // 把问题缩小一号，交给"自己"去算
}

// 斐波那契：1 1 2 3 5 8 ...（前两项是 1，后面每项等于前两项之和）
public static int fib(int n) {
    if (n <= 2) return 1;          // 出口
    return fib(n - 1) + fib(n - 2);
}

// 递归求数组和：用 index 表示"当前处理到第几个"
public static int sum(int[] arr, int index) {
    if (index == arr.length) return 0;              // 出口：越界说明没有元素了
    return arr[index] + sum(arr, index + 1);        // 当前元素 + 剩余元素的和
}

public static void main(String[] args) {
    System.out.println(factorial(5));           // 120 = 5*4*3*2*1
    System.out.println(fib(10));                // 55
    System.out.println(sum(new int[]{1,2,3,4}, 0));  // 10
}` },
      { t: 'tip', text: '递归能解决的问题，循环基本也能解决，而且循环通常更快。递归的价值在“结构清晰”，比如树形结构遍历。学习中先写出入口条件，再想“这一层该做什么、下一层交给自己”。' }
    ],
    quiz: [
      { q: '下面哪个不是合法的方法重载？', options: ['add(int a, int b) 与 add(int a, int b, int c)', 'add(int a) 与 add(double a)', 'add(int a) 与 add(int b)', 'add(int a, double b) 与 add(double a, int b)'], answer: 2, explain: '参数名不同不算重载，参数类型列表必须不同。' },
      { q: 'public static void test(int[] arr) { arr[0] = 9; } 调用后原数组会变吗？', options: ['不会变', '会变', '编译错误', '不确定'], answer: 1, explain: '数组是引用类型，方法内改元素能影响外部。' },
      { q: '递归方法必须具备什么？', options: ['循环', '至少两个参数', '结束条件（出口）', 'static 修饰'], answer: 2, explain: '没有出口就会栈溢出 StackOverflowError。' }
    ],
    exercises: [
      {
        id: 'ex-j7-1',
        title: '练习 1：打造自己的工具类 MyMath',
        level: '中等',
        brief: '写一个工具类，把常用数学功能封装成方法，然后在 main 里测试。',
        requirements: [
          'public static boolean isPrime(int n)：判断素数',
          'public static int gcd(int a, int b)：求最大公约数（用辗转相除法，循环实现）',
          'public static int max(int[] arr)：返回数组最大值',
          'public static long factorial(int n)：递归实现阶乘',
          '重载一个 max(double a, double b) 方法',
          'main 中至少调用 5 次并打印结果'
        ],
        starter: `public class MyMath {

    // TODO: 写 5 个方法

    public static void main(String[] args) {
        // TODO: 测试你的工具类
    }
}`,
        expectedOutput: `7 是素数吗？true
12 和 18 的最大公约数：6
数组最大值：96
5 的阶乘：120
两个小数的较大值：9.8`,
        keyPoints: [
          { label: 'isPrime 方法存在', test: 'boolean\\s+isPrime\\s*\\(\\s*int' },
          { label: 'gcd 方法存在', test: 'int\\s+gcd\\s*\\(' },
          { label: 'max(int[]) 方法存在', test: 'int\\s+max\\s*\\(\\s*int\\s*\\[\\s*\\]' },
          { label: 'factorial 递归调用自己', test: 'factorial\\s*\\(\\s*n\\s*-\\s*1\\s*\\)' },
          { label: 'max 方法重载', test: 'double\\s+max\\s*\\(\\s*double' },
          { label: 'main 中有多次调用', test: 'main[\\s\\S]*System\\.out\\.println' }
        ],
        hints: [
          '辗转相除法：while (b != 0) { int t = a % b; a = b; b = t; } return a;',
          'isPrime：n < 2 直接 false；否则从 2 循环到 n/2，能整除就返回 false',
          'max(int[]) 要用 arr[0] 初始化结果'
        ],
        solution: `public class MyMath {

    public static boolean isPrime(int n) {
        if (n < 2) return false;
        for (int i = 2; i <= n / 2; i++) {
            if (n % i == 0) return false;
        }
        return true;
    }

    public static int gcd(int a, int b) {
        while (b != 0) {
            int temp = a % b;
            a = b;
            b = temp;
        }
        return a;
    }

    public static int max(int[] arr) {
        int result = arr[0];
        for (int n : arr) {
            if (n > result) result = n;
        }
        return result;
    }

    public static long factorial(int n) {
        if (n <= 1) return 1;
        return n * factorial(n - 1);
    }

    public static double max(double a, double b) {
        return a > b ? a : b;
    }

    public static void main(String[] args) {
        System.out.println("7 是素数吗？" + isPrime(7));
        System.out.println("12 和 18 的最大公约数：" + gcd(12, 18));
        System.out.println("数组最大值：" + max(new int[]{88, 92, 96, 75}));
        System.out.println("5 的阶乘：" + factorial(5));
        System.out.println("两个小数的较大值：" + max(3.2, 9.8));
    }
}`
      },
      {
        id: 'ex-j7-2',
        title: '练习 2：做一套数字工具方法',
        level: '中等',
        brief: '写三个方法：反转整数、判断回文数、求各位数字之和。三个方法都会用到循环和取余，是练习“方法 + 循环”的经典组合。',
        requirements: [
          'public static int reverse(int n)：把整数反转，例如 123 → 321',
          'public static boolean isPalindrome(int n)：正着读和反着读一样就返回 true（例如 121、1001）',
          'public static int sumDigits(int n)：返回各位数字之和，例如 9876 → 30',
          'isPalindrome 里要调用 reverse，不要重复写一遍反转逻辑',
          'main 中用一个 int 数组存放 {121, 123, 505, 1001, 9876}，用增强 for 遍历并打印三个结果'
        ],
        starter: `public class NumberTools {

          // TODO: 三个方法

          public static void main(String[] args) {
              int[] nums = {121, 123, 505, 1001, 9876};
              // TODO: 遍历并输出
          }
      }`,
        expectedOutput: `121 反转=121 数位和=4 回文=true
      123 反转=321 数位和=6 回文=false
      505 反转=505 数位和=10 回文=true
      1001 反转=1001 数位和=2 回文=true
      9876 反转=6789 数位和=30 回文=false`,
        keyPoints: [
          { label: '有 reverse(int) 方法', test: 'int\\s+reverse\\s*\\(\\s*int' },
          { label: '反转用了 % 10 与 / 10', test: '%\\s*10[\\s\\S]*/\\s*10' },
          { label: 'isPalindrome 调用了 reverse', test: 'return\\s+n\\s*==\\s*reverse\\s*\\(' },
          { label: 'sumDigits 方法与累加逻辑', test: 'int\\s+sumDigits\\s*\\([\\s\\S]{0,200}\\+=' },
          { label: 'main 中使用增强 for 遍历数组', test: 'for\\s*\\(\\s*int\\s+\\w+\\s*:\\s*\\w+\\s*\\)' }
        ],
        hints: [
          '反转模板：int r = 0; while (n > 0) { r = r * 10 + n % 10; n = n / 10; } return r;',
          '回文判断就是一行：return n == reverse(n);',
          '数位和模板与反转很像，只是把“拼起来”改成“加起来”'
        ],
        solution: `public class NumberTools {

          public static int reverse(int n) {
              int r = 0;
              while (n > 0) {
                  r = r * 10 + n % 10;
                  n = n / 10;
              }
              return r;
          }

          public static boolean isPalindrome(int n) {
              return n == reverse(n);
          }

          public static int sumDigits(int n) {
              int sum = 0;
              while (n > 0) {
                  sum += n % 10;
                  n = n / 10;
              }
              return sum;
          }

          public static void main(String[] args) {
              int[] nums = {121, 123, 505, 1001, 9876};
              for (int x : nums) {
                  System.out.println(x + " 反转=" + reverse(x) + " 数位和=" + sumDigits(x) + " 回文=" + isPalindrome(x));
              }
          }
      }`
      }
    ],
    checklist: ['能说出方法四要素', '理解引用类型传参的坑', '完成 MyMath 工具类']
  }
];
