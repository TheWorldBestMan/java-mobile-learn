/* 课程内容 · Java 基础（第 8~10 章） */
window.COURSE_JAVA_PART2 = [
  {
    id: 'j8',
    title: '类与对象：面向对象的第一课',
    minutes: 70,
    tags: ['类', '对象', '构造器', 'this'],
    goals: [
      '理解“类”是模板、“对象”是实例',
      '会写属性、方法、构造器，并用 new 创建对象',
      '理解对象数组和 toString 的作用'
    ],
    lessons: [
      { t: 'p', text: '前面写的代码都是“面向过程”：一步步做事情。面向对象是把现实中的事物抽象成**类**——它有哪些属性（数据）、能做什么事（方法）。类是图纸，对象是按图纸造出来的房子。' },
      { t: 'h', text: '1. 定义一个 Student 类' },
      { t: 'code', title: 'Student.java', code: `public class Student {
    // ===== 属性（成员变量）：描述这个类"有什么" =====
    String name;      // 引用类型默认值是 null
    int age;          // int 默认值是 0
    double score;     // double 默认值是 0.0

    // ===== 无参构造器：new 的时候被调用 =====
    public Student() {
        System.out.println("创建了一个空学生");
    }

    // ===== 有参构造器：一次性完成初始化 =====
    public Student(String name, int age, double score) {
        this.name = name;      // this 表示"当前对象"，用来区分同名的参数和属性
        this.age = age;
        this.score = score;
    }

    // ===== 方法：描述这个类"能做什么" =====
    public void introduce() {
        System.out.println("我叫 " + name + "，今年 " + age + " 岁，成绩 " + score);
    }

    public boolean isPassed() {
        return score >= 60;    // 返回 boolean
    }

    // 重写 Object 的 toString：这样打印对象时就不会输出 Student@1b6d3586
    @Override
    public String toString() {
        return "Student{name='" + name + "', age=" + age + ", score=" + score + "}";
    }
}` },
      { t: 'code', title: '使用对象：TestStudent.java', code: `public class TestStudent {
    public static void main(String[] args) {
        // ---------- 创建对象：先在堆里造对象，再让栈里的引用指向它 ----------
        Student s1 = new Student();      // 调用无参构造器
        s1.name = "小明";                 // 用 对象名.属性 访问属性
        s1.age = 18;
        s1.score = 88;

        Student s2 = new Student("小红", 19, 95.5);   // 调用有参构造器

        // ---------- 调用方法 ----------
        s1.introduce();                  // 输出：我叫 小明，今年 18 岁，成绩 88.0
        s2.introduce();
        System.out.println(s2.isPassed());     // true

        // 直接打印对象会调用它的 toString()
        System.out.println(s2);

        // ---------- 对象数组：把多个对象放在一起 ----------
        Student[] class1 = {s1, s2, new Student("小刚", 20, 55)};
        double sum = 0;
        for (Student s : class1) {              // 遍历每个学生对象
            sum += s.score;                     // 累加成绩
            System.out.println(s.name + " 是否及格：" + s.isPassed());
        }
        System.out.println("平均分：" + sum / class1.length);
    }
}` },
      { t: 'h', text: '2. this 到底是什么' },
      { t: 'list', items: [
        '`this.name = name;`：左边是当前对象的属性，右边是构造器传进来的参数，名字一样时必须用 this 区分',
        '`this()`：在一个构造器中调用另一个构造器，只能写在第一行',
        '`this` 不能用在 static 方法里，因为 static 属于类，不属于某个对象'
      ]},
      { t: 'code', title: 'this() 复用构造器', code: `public class Book {
    String title;
    double price;

    // 只传书名：给它一个默认价格，复用下面的构造器，避免写两遍赋值代码
    public Book(String title) {
        this(title, 39.9);      // this(...) 必须是构造器体的第一行
    }

    // 全参构造器：真正的初始化逻辑只写一处
    public Book(String title, double price) {
        this.title = title;     // this.属性 区分同名的参数
        this.price = price;
    }

    @Override
    public String toString() {
        return title + " ￥" + price;
    }

    public static void main(String[] args) {
        // 两种写法分别走两个构造器，但最终都执行了同一段初始化代码
        System.out.println(new Book("Java 入门"));
        System.out.println(new Book("Android 实战", 69.0));
    }
}` },
      { t: 'h', text: '3. 栈与堆：对象存在哪里' },
      { t: 'table', head: ['区域', '存放内容', '特点'], rows: [
        ['栈 Stack', '局部变量、对象的引用（地址）', '方法结束自动释放，速度快，空间小'],
        ['堆 Heap', 'new 出来的对象实体', '由垃圾回收器 GC 管理，空间大'],
        ['方法区', '类信息、static 变量、常量池', '类加载时产生，全局共享']
      ]},
      { t: 'code', title: '两个引用指向同一个对象', code: `// 创建对象 a
Student a = new Student("小明", 18, 80);

// 把 a 的地址复制给 b —— 没有 new，所以还是同一个对象
Student b = a;

b.score = 100;
System.out.println(a.score);      // 100：a 和 b 指向同一个对象，改 b 就是改 a

// 再 new 一个内容相同的对象：它和 a 不是同一个对象
Student c = new Student("小明", 18, 80);
System.out.println(a == c);       // false：== 比较的是"地址"，不是内容
System.out.println(a.name.equals(c.name));   // true：equals 比较内容（String 已重写）

// 结论：== 判断"是不是同一个对象"，equals 判断"内容是否相同"` },
            {
        t: 'h',
        text: '4. 一个类里到底能放哪些东西（类的完整构造）'
      },
      {
        t: 'p',
        text: '写类的时候脑子里要有一张清单：一个类**只能**放下面这几种成员。分不清某段代码该放哪，往往就是位置写错了。'
      },
      {
        t: 'table',
        head: ['成员', '写法骨架', '说明'],
        rows: [
          ['实例字段（属性）', 'private String name = "小明";', '每个对象各一份；不给初始值就按类型给默认值：对象 null、int 0、boolean false'],
          ['静态字段', 'private static int count = 0;', '全类共享一份，用 类名.字段 访问；第一次用到这个类时初始化'],
          ['常量', 'public static final int MAX = 100;', 'static + final，名字全大写，编译期就确定值'],
          ['静态代码块', 'static { System.out.println("加载"); }', '类第一次被加载时执行一次，常用来初始化静态资源'],
          ['实例代码块', '{ System.out.println("new 了"); }', '每 new 一个对象都执行一次，位置在构造器体之前；不常见但面试爱问'],
          ['构造器', 'public Student(String name) { this.name = name; }', '名字与类名相同、没有返回类型，只在 new 的时候被调用'],
          ['实例方法', 'public String getName() { return name; }', '属于对象，能读写实例字段和静态字段'],
          ['静态方法', 'public static int getCount() { return count; }', '属于类，用 类名.方法() 调用，方法体里没有 this'],
          ['静态嵌套类', 'static class Score { int math; }', '定义在类里面的类，常用来做「配套的小结构」，用 外层.内层 或直接内层名'],
          ['内部类（非静态）', 'class Inner { }', '每个外部对象一份，创建要写 outer.new Inner()；能用静态嵌套类就别用内部类'],
          ['枚举 / 记录 / 注解', 'enum Level { LOW, HIGH }　record Point(int x, int y) {}　@interface Author { String value(); }', 'JDK 5 / 16 起支持；枚举是固定常量集合，record 是只装数据的不可变类。页面里的运行器暂时不覆盖 enum / record，复制到 IDEA 里运行']
        ]
      },
      {
        t: 'code',
        title: '类的完整骨架：所有成员各来一份（可直接运行）',
        code: [
          'import java.util.ArrayList;',
          '',
          '/**',
          ' * 一个「完整」的类：把上面表格里的成员都写了一遍，运行看看执行顺序。',
          ' * 注意输出顺序：静态块 → 实例块 → 构造器体（每 new 一次，实例块和构造器就再跑一遍）',
          ' */',
          'public class Student {',
          '',
          '    // ① 实例字段：每个对象一份，可以在声明处给初始值',
          '    private String name;',
          '    private int score;',
          '',
          '    // ② 静态字段 + 常量：全类共享',
          '    private static int count = 0;',
          '    public static final int MAX_SCORE = 100;',
          '',
          '    // ③ 静态代码块：类第一次被加载时执行一次',
          '    static {',
          '        System.out.println("[静态块] Student 类被加载了");',
          '    }',
          '',
          '    // ④ 实例代码块：每次 new 都执行，且在构造器体之前',
          '    {',
          '        System.out.println("[实例块] 开始初始化一个学生对象");',
          '    }',
          '',
          '    // ⑤ 构造器：可以重载，也可以互相调用（this(...) 必须是第一行）',
          '    public Student() {',
          '        this("无名", 0);',
          '    }',
          '',
          '    public Student(String name, int score) {',
          '        this.name = name;',
          '        setScore(score);        // 构造器里调用方法做校验',
          '        count++;                // 每 new 一个对象，计数器 +1',
          '    }',
          '',
          '    // ⑥ 实例方法：getter / setter / 判断 / 计算',
          '    public String getName() {',
          '        return name;',
          '    }',
          '',
          '    public void setScore(int score) {',
          '        if (score < 0 || score > MAX_SCORE) {',
          '            System.out.println("分数不合法：" + score);',
          '            return;',
          '        }',
          '        this.score = score;',
          '    }',
          '',
          '    public int getScore() {',
          '        return score;',
          '    }',
          '',
          '    public boolean isPass() {',
          '        return score >= 60;',
          '    }',
          '',
          '    public String level() {',
          '        if (score >= 90) return "优秀";',
          '        if (score >= 75) return "良好";',
          '        if (score >= 60) return "及格";',
          '        return "不及格";',
          '    }',
          '',
          '    // ⑦ 重写 Object 的方法：打印对象时自动调用',
          '    @Override',
          '    public String toString() {',
          '        return name + "(" + score + "分)";',
          '    }',
          '',
          '    // ⑧ 静态方法：属于类',
          '    public static int getCount() {',
          '        return count;',
          '    }',
          '',
          '    // ⑨ 静态嵌套类：定义在类里面的小结构',
          '    static class Score {',
          '        int math;',
          '        int english;',
          '        Score(int math, int english) { this.math = math; this.english = english; }',
          '        int total() { return math + english; }',
          '    }',
          '',
          '    public static void main(String[] args) {',
          '        Student s = new Student("小明", 92);',
          '        System.out.println(s);                       // 自动调用 toString()',
          '        System.out.println(s.getName() + " 等级：" + s.level() + "，及格=" + s.isPass());',
          '',
          '        new Student();                               // 用无参构造器，看看实例块的输出',
          '        System.out.println("一共创建了 " + Student.getCount() + " 个学生对象");',
          '',
          '        // 静态嵌套类的用法：外层.内层',
          '        Student.Score sc = new Student.Score(95, 88);',
          '        System.out.println("两科总分：" + sc.total());',
          '    }',
          '}',
          '',
          '/* ============ 运行结果 ============',
          '[静态块] Student 类被加载了',
          '[实例块] 开始初始化一个学生对象',
          '小明(92分)',
          '小明 等级：优秀，及格=true',
          '[实例块] 开始初始化一个学生对象',
          '一共创建了 2 个学生对象',
          '两科总分：183',
          '================================== */'
        ].join('\n')
      },
      {
        t: 'code',
        title: '三种最常见的类「形状」（可直接运行）',
        code: [
          '// 形状一：工具类——全是 static，不需要创建对象',
          'class MathUtil {',
          '    private MathUtil() { }        // 私有构造器：禁止别人 new，这是工具类的习惯写法',
          '',
          '    public static int max(int a, int b) {',
          '        return a > b ? a : b;',
          '    }',
          '',
          '    public static int sum(int... nums) {',
          '        int total = 0;',
          '        for (int n : nums) total += n;',
          '        return total;',
          '    }',
          '}',
          '',
          '// 形状二：数据类——字段 + 构造器 + getter + toString',
          'class Book {',
          '    private final String title;   // final：一旦构造完成就不能改',
          '    private final double price;',
          '',
          '    public Book(String title, double price) {',
          '        this.title = title;',
          '        this.price = price;',
          '    }',
          '',
          '    public String getTitle() { return title; }',
          '    public double getPrice() { return price; }',
          '',
          '    @Override',
          '    public String toString() {',
          '        return title + " ￥" + price;',
          '    }',
          '}',
          '',
          '// 形状三：带行为的对象——字段 + 方法 + 静态计数器',
          'class Counter {',
          '    private static int total = 0;',
          '    private final String name;',
          '',
          '    public Counter(String name) {',
          '        this.name = name;',
          '        total++;',
          '    }',
          '',
          '    public String getName() { return name; }',
          '    public static int getTotal() { return total; }',
          '}',
          '',
          'public class ClassShapes {',
          '    public static void main(String[] args) {',
          '        // 工具类：直接用类名调用',
          '        System.out.println("max = " + MathUtil.max(3, 9) + "，sum = " + MathUtil.sum(1, 2, 3));',
          '',
          '        // 数据类：new 出来，打印时自动用 toString',
          '        Book b = new Book("Java 入门", 59.0);',
          '        System.out.println(b);',
          '',
          '        // 带行为的对象：对象自己有数据，类上面还有共享的统计',
          '        new Counter("A");',
          '        new Counter("B");',
          '        System.out.println("创建了 " + Counter.getTotal() + " 个计数器");',
          '    }',
          '}'
        ].join('\n')
      },
      {
        t: 'tip',
        text: '**怎么判断该不该写成类**：如果一组数据总是和一组操作一起出现（“订单 + 计算总价”“学生 + 算等级”），就值得封装成一个类。反过来，如果只是几个临时数值，用局部变量就好，别为了面向对象而面向对象。'
      },,
{ t: 'tip', text: '判断两个对象是否“相等”，默认的 == 比较地址。要按内容比较，需要在类里重写 equals（下一章的话题）。字符串之所以 equals 能用，是 String 已经帮你重写好了。' }
    ],
    quiz: [
      { q: 'Student s = new Student(); 这句话里 s 存在哪里？', options: ['堆里，和学生对象一起', '栈里，存放对象的地址', '方法区', '磁盘上'], answer: 1, explain: 's 是引用变量，存在栈里，值是指向堆中对象的地址。' },
      { q: 'this 不能用在什么地方？', options: ['构造器中', '实例方法中', 'static 方法中', '都可以用'], answer: 2, explain: 'static 属于类层级，此时可能还没有任何对象，所以不能用 this。' },
      { q: '打印一个对象，默认会调用哪个方法？', options: ['print()', 'toString()', 'equals()', 'hashCode()'], answer: 1, explain: '不重写 toString 就会打印 类名@十六进制地址。' }
    ],
    exercises: [
      {
        id: 'ex-j8-1',
        title: '练习 1：设计一个手机类 Phone',
        level: '中等',
        brief: '用面向对象的方式描述手机，并创建 3 台手机，找出“电池最大”的那台。',
        requirements: [
          '属性：brand（品牌）、model（型号）、price（价格）、battery（电池容量 mAh）',
          '无参构造器和全参构造器各一个，全参构造器用 this',
          '方法 showInfo()：输出“小米 14 ￥3999 电池 4600mAh”',
          '方法 isExpensive()：价格 >= 5000 返回 true',
          '重写 toString()',
          'main 中创建 3 台手机组成数组，遍历输出信息，并打印电池容量最大的型号'
        ],
        starter: `public class Phone {
    // TODO: 属性

    // TODO: 构造器

    // TODO: 方法

    public static void main(String[] args) {
        // TODO: 创建 3 台手机并分析
    }
}`,
        expectedOutput: `小米 14 ￥3999 电池 4600mAh
苹果 iPhone 16 ￥5999 电池 3561mAh
华为 Mate70 ￥5499 电池 5300mAh
电池最大的是：华为 Mate70（5300mAh）`,
        keyPoints: [
          { label: '有 4 个属性', test: 'String\\s+brand[\\s\\S]*model[\\s\\S]*double\\s+price[\\s\\S]*int\\s+battery' },
          { label: '全参构造器使用了 this', test: 'this\\.brand\\s*=' },
          { label: '有 showInfo 方法', test: 'void\\s+showInfo\\s*\\(' },
          { label: '有 isExpensive 方法', test: 'boolean\\s+isExpensive\\s*\\(' },
          { label: '重写了 toString', test: '@Override[\\s\\S]{0,40}String\\s+toString' },
          { label: 'main 中使用数组遍历', test: 'Phone\\s*\\[\\s*\\]|new\\s+Phone\\s*\\[|\\{\\s*new\\s+Phone' }
        ],
        hints: [
          '找电池最大：先假设 phones[0] 最大，遍历比较 battery',
          'showInfo 可以用字符串拼接输出，也可以用 printf',
          'isExpensive: return price >= 5000;'
        ],
        solution: `public class Phone {
    String brand;
    String model;
    double price;
    int battery;

    public Phone() {
    }

    public Phone(String brand, String model, double price, int battery) {
        this.brand = brand;
        this.model = model;
        this.price = price;
        this.battery = battery;
    }

    public void showInfo() {
        System.out.println(brand + " " + model + " ￥" + price + " 电池 " + battery + "mAh");
    }

    public boolean isExpensive() {
        return price >= 5000;
    }

    @Override
    public String toString() {
        return brand + " " + model;
    }

    public static void main(String[] args) {
        Phone[] phones = {
            new Phone("小米", "14", 3999, 4600),
            new Phone("苹果", "iPhone 16", 5999, 3561),
            new Phone("华为", "Mate70", 5499, 5300)
        };

        for (Phone p : phones) {
            p.showInfo();
        }

        Phone maxBattery = phones[0];
        for (Phone p : phones) {
            if (p.battery > maxBattery.battery) {
                maxBattery = p;
            }
        }
        System.out.println("电池最大的是：" + maxBattery + "（" + maxBattery.battery + "mAh）");
    }
}`
      }
    ],
    checklist: ['能解释类与对象的关系', '会说清 this 的含义', '完成 Phone 类练习']
  },
  {
    id: 'j9',
    title: '封装、static 与工具类',
    minutes: 60,
    tags: ['封装', 'private', 'static', '包'],
    goals: [
      '用 private + getter/setter 实现封装',
      '理解 static 变量与方法，会写工具类',
      '认识包（package）与 import 的作用'
    ],
    lessons: [
      { t: 'p', text: '上一章 Student 的属性是公开的，任何人可以写 s.age = -100; 程序不会报错但数据已经烂了。**封装**就是把属性藏起来（private），只通过方法访问，在方法里做校验。' },
      { t: 'h', text: '1. private + getter / setter' },
      { t: 'code', title: '封装后的 Account', code: `public class Account {
    private String owner;        // private：类外不能直接访问，只能通过方法
    private double balance;      // 余额这种关键数据必须保护起来

    public Account(String owner) {
        this.owner = owner;
        this.balance = 0;        // 新账户余额为 0
    }

    // 只提供 getter（读），不提供 setter（改）：余额只能在类内部被修改
    public String getOwner() {
        return owner;
    }

    public double getBalance() {
        return balance;
    }

    // 存钱：必须在方法里做参数校验，这就是封装的价值
    public void deposit(double amount) {
        if (amount <= 0) {
            System.out.println("存款金额必须大于 0");
            return;              // 校验不通过就提前结束
        }
        balance += amount;
        System.out.println("存入 " + amount + "，当前余额 " + balance);
    }

    // 取钱：金额非法、余额不足都要给出明确提示
    public void withdraw(double amount) {
        if (amount <= 0) {
            System.out.println("取款金额必须大于 0");
        } else if (amount > balance) {
            System.out.println("余额不足，当前余额 " + balance);
        } else {
            balance -= amount;
            System.out.println("取出 " + amount + "，当前余额 " + balance);
        }
    }

    public static void main(String[] args) {
        Account acc = new Account("小明");
        acc.deposit(1000);
        acc.withdraw(300);
        acc.withdraw(5000);      // 余额不足
        // acc.balance = 99999;  // 编译错误！私有属性不能直接改 —— 这就是封装
        System.out.println(acc.getOwner() + " 的余额：" + acc.getBalance());
    }
}` },
      { t: 'warn', text: 'setter 不是必须的。像“余额”“创建时间”这类需要保护的数据，只提供 getter 就够了。无脑给所有属性生成 getter/setter，等于没封装。' },
      { t: 'h', text: '2. static：属于类，不属于对象' },
      { t: 'code', title: 'static 变量、方法与代码块', code: `public class Counter {
    // 静态变量：全类共享一份，用 类名.变量 访问
    private static int count = 0;
    // 静态常量：全类共享且不可修改
    public static final String VERSION = "1.0.0";

    private final String name;      // 实例变量：每个对象各一份，final 表示只能赋值一次

    public Counter(String name) {
        this.name = name;
        count++;                    // 每 new 一个对象，静态计数器 +1
    }

    // 静态方法：属于类，不能访问实例变量、不能用 this
    public static int getCount() {
        return count;
    }

    // 静态代码块：类第一次被加载时执行一次，常用来初始化静态数据
    static {
        System.out.println("Counter 类被加载了");
    }

    public static void main(String[] args) {
        new Counter("a");
        new Counter("b");
        new Counter("c");
        System.out.println("创建了 " + Counter.getCount() + " 个对象");   // 3
        System.out.println(Counter.VERSION);
    }
}` },
      { t: 'table', head: ['对比项', '实例成员（无 static）', '静态成员（static）'], rows: [
        ['属于谁', '属于对象', '属于类'],
        ['怎么调用', '对象名.属性 / 对象名.方法()', '类名.属性 / 类名.方法()'],
        ['内存几份', '每个对象一份', '整个程序一份'],
        ['能否用 this', '可以', '不可以'],
        ['典型用途', '姓名、余额、状态', '工具方法、常量、计数器']
      ]},
      { t: 'h', text: '3. 工具类：只放静态方法' },
      { t: 'code', title: 'StringUtil.java', code: `// 工具类惯例：加 final 防止被继承，构造器设为 private 防止被 new
public final class StringUtil {

    private StringUtil() {
    }

    // 判断字符串是不是"空的或只有空白"
    public static boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();   // 先判 null，再判去空格后是否为空
    }

    // 首字母大写、其余小写
    public static String capitalize(String s) {
        if (isBlank(s)) return "";
        // substring(0, 1) 取首字母转大写，substring(1) 取剩余部分转小写
        return s.substring(0, 1).toUpperCase() + s.substring(1).toLowerCase();
    }

    // 字符串转 int，转换失败时返回默认值（调用方不用处理异常）
    public static int toInt(String s, int defaultValue) {
        try {
            return Integer.parseInt(s.trim());
        } catch (NumberFormatException e) {
            return defaultValue;       // 转换失败就用默认值，程序不会崩
        }
    }

    public static void main(String[] args) {
        System.out.println(StringUtil.isBlank("   "));          // true
        System.out.println(StringUtil.capitalize("hELLO"));     // Hello
        System.out.println(StringUtil.toInt("abc", -1));        // -1
        System.out.println(StringUtil.toInt("123", -1));        // 123
    }
}` },
      { t: 'h', text: '4. 包与 import' },
      { t: 'code', title: '包声明', code: `// 包声明必须是文件第一行；包名要和目录结构对应：
// 这个文件应该放在 src/com/example/school/model/Student.java
package com.example.school.model;

// 用别的包里的类必须先 import（java.lang 下的 String、System 会自动导入）
import java.util.ArrayList;
import java.util.Scanner;

// 同一个包里的类不用 import，可以直接用
// import java.util.*;   // 通配符导入：省事但不利于看清依赖，规范项目一般不推荐` },
            {
        t: 'h',
        text: '5. 字段与构造器的全部写法'
      },
      {
        t: 'p',
        text: '封装这一章的核心就两件事：**字段怎么声明**（谁能看、能不能改）和**构造器怎么写**（对象一出生就是合法的）。把下面两张表当清单过一遍，以后写类就照着挑。'
      },
      {
        t: 'table',
        head: ['字段写法', '骨架', '说明'],
        rows: [
          ['实例字段', 'private String name;', '每个对象一份；不给初始值就按类型给默认值：对象 null、int 0、boolean false'],
          ['声明时给初始值', 'private int age = 18;', '每次 new 对象都会执行这一行（在构造器体之前）'],
          ['final 字段', 'private final String id;', '只能赋值一次：要么声明处，要么构造器里；保证「创建后不再变」'],
          ['static 字段', 'private static int count = 0;', '全类共享一份，用 类名.字段 访问，适合做计数/缓存'],
          ['static final 常量', 'public static final int MAX = 100;', '编译期就确定值，名字习惯全大写加下划线'],
          ['只读集合字段', 'private final List<String> tags = new ArrayList<>();', 'final 只锁住「引用不变」，集合里的元素照样能 add / remove'],
          ['静态块里做复杂初始化', 'static { count = readFromFile(); }', '类第一次被加载时执行一次，适合不能一行写完的初始化'],
          ['访问修饰符', 'private → 包私有 → protected → public', '从最紧到最松；字段一律先写 private，需要对外再开 getter / setter']
        ]
      },
      {
        t: 'table',
        head: ['构造器写法', '骨架', '说明'],
        rows: [
          ['无参构造器', 'public Account() { }', '注意：只要写了别的构造器，编译器就不再送你默认无参构造器，需要时得自己补'],
          ['全参构造器', 'public Account(String id, String owner) { this.id = id; this.owner = owner; }', '最常见的写法：一次把需要的值都传进来'],
          ['构造器重载', 'Account() / Account(String) / Account(String, String)', '参数列表不同即可；让调用方按需要传最少的参数'],
          ['this(...) 复用', 'public Account() { this("匿名"); }', '调用本类另一个构造器，必须是第一行；避免初始化代码重复'],
          ['super(...) 调父类', 'public Dog(String name) { super(name); }', '必须是第一行；不写则隐式调用父类的无参构造器'],
          ['构造器里做校验', 'if (balance < 0) { balance = 0; }', '入口就把非法值处理掉，保证对象一出生就是合法的'],
          ['私有构造器', 'private Account() { }', '禁止外部 new，只能通过静态方法拿到对象（单例 / 工具类的经典写法）'],
          ['复制构造器', 'public Account(Account other) { this(other.id, other.owner); }', '用已有对象造一个新对象，常用来做「副本」'],
          ['静态工厂方法', 'public static Account of(String id) { return new Account(id); }', '方法名比 new 更能表达意图，还能顺便做缓存 / 校验']
        ]
      },
      {
        t: 'code',
        title: '构造器大全：从无参到私有构造器（可直接运行）',
        code: [
          'public class Account {',
          '    // 字段：final 表示「创建后不再指向别的值」',
          '    private final String id;',
          '    private String owner;',
          '    private double balance;',
          '',
          '    // 静态计数器 + 常量',
          '    private static int count = 0;',
          '    public static final double MIN_BALANCE = 0;',
          '',
          '    // ① 无参构造器：委托给别的构造器，避免重复写初始化',
          '    public Account() {',
          '        this("A000", "匿名");',
          '    }',
          '',
          '    // ② 两个参数的构造器：又委托给三个参数的',
          '    public Account(String id, String owner) {',
          '        this(id, owner, 0);',
          '    }',
          '',
          '    // ③ 真正干活的构造器：做校验 + 计数',
          '    public Account(String id, String owner, double balance) {',
          '        if (balance < MIN_BALANCE) {',
          '            System.out.println("余额不能为负，按 0 处理");',
          '            balance = 0;',
          '        }',
          '        this.id = id;',
          '        this.owner = owner;',
          '        this.balance = balance;',
          '        count++;',
          '    }',
          '',
          '    // ④ 复制构造器：拿另一个对象当模板',
          '    public Account(Account other) {',
          '        this(other.id, other.owner, other.balance);',
          '    }',
          '',
          '    // ⑤ 私有构造器 + 静态工厂：控制对象怎么被创建',
          '    private Account(String id) {',
          '        this(id, "系统账户");',
          '    }',
          '',
          '    public static Account systemAccount() {',
          '        return new Account("SYS");',
          '    }',
          '',
          '    public String getId() { return id; }',
          '    public String getOwner() { return owner; }',
          '    public double getBalance() { return balance; }',
          '    public static int getCount() { return count; }',
          '',
          '    @Override',
          '    public String toString() {',
          '        return "Account{" + id + ", " + owner + ", " + balance + "}";',
          '    }',
          '',
          '    public static void main(String[] args) {',
          '        Account a1 = new Account();                          // 无参 → 委托',
          '        Account a2 = new Account("A001", "小明", 1000);      // 全参',
          '        Account a3 = new Account(a2);                        // 复制构造器',
          '        Account a4 = Account.systemAccount();                // 静态工厂 + 私有构造器',
          '',
          '        System.out.println("a1 = " + a1);',
          '        System.out.println("a2 = " + a2);',
          '        System.out.println("a3 = " + a3);   // 和 a2 内容一样，但是两个不同对象',
          '        System.out.println("a4 = " + a4);',
          '',
          '        System.out.println("非法值测试：" + new Account("A002", "小红", -50));',
          '        System.out.println("一共创建 " + Account.getCount() + " 个账户");',
          '    }',
          '}'
        ].join('\n')
      },
      {
        t: 'code',
        title: 'static 的全部用法：常量、计数、静态块、静态方法、静态嵌套类（可直接运行）',
        code: [
          'public class StaticDemo {',
          '    // ① 静态常量：全类共享、不可修改（最常用的一种 static）',
          '    public static final String APP_NAME = "学习软件";',
          '',
          '    // ② 静态变量：全类共享一份，用来做计数或缓存',
          '    private static int visited = 0;',
          '',
          '    // ③ 静态代码块：类第一次被加载时执行一次',
          '    static {',
          '        System.out.println("[静态块] 类被加载，APP_NAME = " + APP_NAME);',
          '        visited = 100;        // 复杂一点的初始化放在这里',
          '    }',
          '',
          '    // ④ 静态方法：工具方法 / 工厂方法',
          '    public static int nextId() {',
          '        return ++visited;',
          '    }',
          '',
          '    public static StaticDemo create() {   // 静态工厂：名字比 new 更清楚',
          '        return new StaticDemo();',
          '    }',
          '',
          '    // ⑤ 静态嵌套类：定义在类里面的小结构，用 外层.内层 使用',
          '    static class Config {',
          '        String theme = "dark";',
          '    }',
          '',
          '    private final int id;',
          '',
          '    public StaticDemo() {',
          '        this.id = nextId();               // 实例构造器里可以放心调用静态方法',
          '    }',
          '',
          '    public int getId() { return id; }',
          '    public static int getVisited() { return visited; }',
          '',
          '    public static void main(String[] args) {',
          '        System.out.println("APP_NAME = " + APP_NAME);',
          '        System.out.println("刚加载时计数 = " + StaticDemo.getVisited());   // 静态块里改成了 100',
          '',
          '        StaticDemo a = StaticDemo.create();',
          '        StaticDemo b = new StaticDemo();',
          '        System.out.println("a.id = " + a.getId() + "，b.id = " + b.getId());',
          '        System.out.println("现在计数 = " + getVisited());   // 同一个类里可以省掉类名',
          '',
          '        Config c = new Config();',
          '        System.out.println("主题 = " + c.theme);',
          '    }',
          '}',
          '',
          '/* 记住一句话：静态成员属于类，用「类名.成员」访问；',
          '   实例成员属于对象，必须先 new 出来。静态方法里不能用 this。 */'
        ].join('\n')
      },
      {
        t: 'tip',
        text: '**封装的判断标准**：外部拿到一个对象后，能不能把它的状态改坏？如果字段是 public 的，别人可以写 `account.balance = -999`，你就没法保证数据正确；改成 private + 构造器校验 + 必要的 setter，才叫封装。至于 static：**只有当这个值/方法「和具体对象无关」时才用**（常量、计数、工具方法），否则很容易写出难测试的代码。'
      },,
{ t: 'tip', text: '命名建议：包名用域名倒写 + 模块名，例如 com.你的名字.todolist。类多了以后按功能分目录：model（数据类）、service（业务逻辑）、util（工具）、ui（界面）。' }
    ],
    quiz: [
      { q: '封装的核心做法是？', options: ['属性用 public，方法用 private', '属性用 private，通过方法访问', '所有东西都加 static', '把类拆成两个文件'], answer: 1, explain: '隐藏数据 + 暴露受控的访问方式，就是封装。' },
      { q: '静态方法里能用 this 吗？', options: ['能', '不能', '只有 main 能', '加 final 就能'], answer: 1, explain: 'static 方法属于类，调用时可能还没有对象。' },
      { q: 'public static final String VERSION = "1.0"; 这里 static 的作用是？', options: ['让常量每个对象各一份', '让常量全类共享一份', '让常量可修改', '没有作用'], answer: 1, explain: 'static 表示类级别，全程序只有一份。' }
    ],
    exercises: [
      {
        id: 'ex-j9-1',
        title: '练习 1：银行账户（完整封装版）',
        level: '中等',
        brief: '实现一个封装良好的银行账户类，包含校验、密码验证和开户数统计。',
        requirements: [
          'private 属性：owner、balance、password、id（id 用 static 自增生成）',
          '构造器：Account(String owner, String password)',
          'deposit(double amount)：金额 <= 0 时拒绝并提示',
          'withdraw(double amount, String password)：密码错误、金额非法、余额不足都要有对应提示',
          'getBalance()、getOwner()，不提供任何直接改余额的方法',
          '静态方法 getAccountCount() 返回开户总数',
          'main 中模拟：开户 2 个、存钱、密码错误取钱、正常取钱、超额取钱'
        ],
        starter: `public class Account {
    // TODO: 私有属性 + static 计数器

    // TODO: 构造器

    // TODO: 存取款方法（含各种校验）

    public static void main(String[] args) {
        // TODO: 模拟交易场景
    }
}`,
        expectedOutput: `开户成功：A001 小明
存入 1000.0，余额 1000.0
密码错误，取款失败
取出 200.0，余额 800.0
余额不足，当前余额 800.0
当前开户数：2`,
        keyPoints: [
          { label: '属性使用 private', test: 'private\\s+double\\s+balance|private\\s+String\\s+password' },
          { label: 'static 计数器', test: 'static\\s+int' },
          { label: '存款有金额校验', test: 'amount\\s*<=\\s*0' },
          { label: '取款校验密码', test: 'password\\.equals|!this\\.password' },
          { label: '余额不足判断', test: 'amount\\s*>\\s*balance|balance\\s*<\\s*amount' },
          { label: '有 getBalance 方法', test: 'getBalance\\s*\\(' }
        ],
        hints: [
          'id 生成：private static int count = 0; 构造器里 count++; this.id = String.format("A%03d", count);',
          '密码比较用 equals：if (!this.password.equals(password))',
          '校验顺序：先判断密码 → 再判断金额 → 最后判断余额'
        ],
        solution: `public class Account {
    private final String id;
    private final String owner;
    private final String password;
    private double balance;
    private static int count = 0;

    public Account(String owner, String password) {
        count++;
        this.id = String.format("A%03d", count);
        this.owner = owner;
        this.password = password;
        this.balance = 0;
        System.out.println("开户成功：" + id + " " + owner);
    }

    public void deposit(double amount) {
        if (amount <= 0) {
            System.out.println("存款金额必须大于 0");
            return;
        }
        balance += amount;
        System.out.println("存入 " + amount + "，余额 " + balance);
    }

    public void withdraw(double amount, String password) {
        if (!this.password.equals(password)) {
            System.out.println("密码错误，取款失败");
            return;
        }
        if (amount <= 0) {
            System.out.println("取款金额必须大于 0");
            return;
        }
        if (amount > balance) {
            System.out.println("余额不足，当前余额 " + balance);
            return;
        }
        balance -= amount;
        System.out.println("取出 " + amount + "，余额 " + balance);
    }

    public double getBalance() {
        return balance;
    }

    public String getOwner() {
        return owner;
    }

    public static int getAccountCount() {
        return count;
    }

    public static void main(String[] args) {
        Account a1 = new Account("小明", "1234");
        Account a2 = new Account("小红", "8888");

        a1.deposit(1000);
        a1.withdraw(100, "0000");
        a1.withdraw(200, "1234");
        a1.withdraw(5000, "1234");

        System.out.println("当前开户数：" + Account.getAccountCount());
    }
}`
      },
      {
        id: 'ex-j9-2',
        title: '练习 2：封装一个 Rectangle 类（含静态成员）',
        level: '中等',
        brief: '把矩形封装成类：属性私有、构造器校验、方法对外提供面积周长；再用静态变量统计创建了几个对象，用静态方法比较谁的面积更大。',
        requirements: [
          'private final 属性 width、height，只提供 getter，不提供 setter',
          '构造器校验：宽或高 ≤ 0 时打印警告，并按绝对值处理',
          '实例方法 area()、perimeter()、isSquare()',
          'private static int count 统计创建了多少个矩形，并提供 static getCount()',
          'static bigger(Rectangle a, Rectangle b) 返回面积更大的那个',
          '重写 toString()，输出形如 Rectangle(3.0x4.0)',
          'main 中创建 3 个矩形放进数组，遍历打印信息，最后打印总数与最大矩形'
        ],
        starter: `public class Rectangle {
          // TODO: 私有属性 + 静态计数器

          // TODO: 构造器（含校验）

          // TODO: area / perimeter / isSquare / getCount / bigger / toString

          public static void main(String[] args) {
              // TODO: 创建 3 个矩形并输出统计信息
          }
      }`,
        expectedOutput: `Rectangle(3.0x4.0) 面积=12.0 周长=14.0 正方形=false
      Rectangle(5.0x5.0) 面积=25.0 周长=20.0 正方形=true
      Rectangle(2.5x6.0) 面积=15.0 周长=17.0 正方形=false
      共创建：3 个
      最大的是：Rectangle(5.0x5.0)`,
        keyPoints: [
          { label: '属性使用 private', test: 'private\\s+(final\\s+)?double\\s+width' },
          { label: '有静态计数器 count', test: 'static\\s+int\\s+count' },
          { label: 'area 方法', test: 'double\\s+area\\s*\\(' },
          { label: 'perimeter 方法', test: 'double\\s+perimeter\\s*\\(' },
          { label: '静态方法 bigger 返回面积更大的矩形', test: 'static\\s+Rectangle\\s+bigger\\s*\\(' },
          { label: '重写了 toString', test: 'String\\s+toString\\s*\\(' },
          { label: '构造器里自增计数器', test: 'count\\s*\\+\\+|\\+\\+\\s*count' }
        ],
        hints: [
          '构造器里：this.width = width; this.height = height; count++;',
          'isSquare：return width == height;',
          'bigger 用三元运算符：return a.area() >= b.area() ? a : b;',
          '打印对象时会自动调用 toString()，所以拼接时直接写 r 就行'
        ],
        solution: `public class Rectangle {
          private final double width;
          private final double height;
          private static int count = 0;

          public Rectangle(double width, double height) {
              if (width <= 0 || height <= 0) {
                  System.out.println("警告：边长必须大于 0，已按绝对值处理");
                  width = Math.abs(width);
                  height = Math.abs(height);
              }
              this.width = width;
              this.height = height;
              count++;
          }

          public double getWidth() {
              return width;
          }

          public double getHeight() {
              return height;
          }

          public double area() {
              return width * height;
          }

          public double perimeter() {
              return 2 * (width + height);
          }

          public boolean isSquare() {
              return width == height;
          }

          public static int getCount() {
              return count;
          }

          public static Rectangle bigger(Rectangle a, Rectangle b) {
              return a.area() >= b.area() ? a : b;
          }

          @Override
          public String toString() {
              return "Rectangle(" + width + "x" + height + ")";
          }

          public static void main(String[] args) {
              Rectangle[] list = {
                  new Rectangle(3, 4),
                  new Rectangle(5, 5),
                  new Rectangle(2.5, 6)
              };

              for (Rectangle r : list) {
                  System.out.println(r + " 面积=" + r.area() + " 周长=" + r.perimeter() + " 正方形=" + r.isSquare());
              }
              System.out.println("共创建：" + Rectangle.getCount() + " 个");
              System.out.println("最大的是：" + Rectangle.bigger(list[0], list[1]));
          }
      }`
      },
      {
        id: 'ex-j9-3',
        title: '练习 3：多文件协作——把工具类拆成单独的文件',
        level: '中等',
        brief: '真实项目不会把代码全塞进一个文件。这个练习已经给你准备好一个独立的工具类文件 MathBox.java，你要做的只是在自己的 Main 里用「类名.方法名(...)」调用它。写完直接点“▶ 运行代码”，学习软件会把两个文件一起编译运行。',
        files: [
          {
            name: 'MathBox.java',
            code: [
              'public class MathBox {',
              '    // 求三个整数里的最大值',
              '    public static int max3(int a, int b, int c) {',
              '        int max = a;                  // 先假设第一个数最大',
              '        if (b > max) max = b;         // 谁更大就把 max 换成谁',
              '        if (c > max) max = c;',
              '        return max;                   // 返回最大值',
              '    }',
              '',
              '    // 判断一个整数是不是质数（只能被 1 和它自己整除）',
              '    public static boolean isPrime(int n) {',
              '        if (n < 2) return false;             // 0、1 和负数都不是质数',
              '        for (int i = 2; i * i <= n; i++) {   // 只需要试到平方根就够了',
              '            if (n % i == 0) return false;    // 能整除，说明不是质数',
              '        }',
              '        return true;',
              '    }',
              '',
              '    // 求 1 + 2 + ... + n 的和',
              '    public static int sumTo(int n) {',
              '        int sum = 0;',
              '        for (int i = 1; i <= n; i++) sum += i;   // 一个数一个数地累加',
              '        return sum;',
              '    }',
              '',
              '    // 把秒数格式化成 “x小时y分z秒”',
              '    public static String formatSeconds(int total) {',
              '        int h = total / 3600;        // 1 小时 = 3600 秒',
              '        int m = total % 3600 / 60;   // 余下的秒数换算成分钟',
              '        int s = total % 60;          // 最后剩下的就是秒',
              '        return h + "小时" + m + "分" + s + "秒";',
              '    }',
              '}'
            ].join('\n')
          }
        ],
        requirements: [
          '调用 MathBox.max3(3, 9, 5)，打印 3、9、5 中的最大值',
          '调用 MathBox.isPrime(97)，打印 97 是不是质数',
          '调用 MathBox.sumTo(100)，打印 1~100 的和',
          '调用 MathBox.formatSeconds(3725)，打印格式化后的时间',
          '不要复制 MathBox 的代码——它已经在依赖文件里，直接调用即可'
        ],
        starter: 'public class Main {\n        public static void main(String[] args) {\n            // MathBox 在旁边的依赖文件 MathBox.java 里，文件名叫什么、类就叫什么。\n            // 调用静态方法的格式是：类名.方法名(参数)，不需要 import，也不用复制代码。\n\n            // TODO 1：调用 MathBox.max3(3, 9, 5)，打印 3、9、5 中的最大值\n\n            // TODO 2：调用 MathBox.isPrime(97)，打印 97 是不是质数\n\n            // TODO 3：调用 MathBox.sumTo(100)，打印 1~100 的和\n\n            // TODO 4：调用 MathBox.formatSeconds(3725)，打印格式化后的时间\n        }\n    }',
        expectedOutput: '3、9、5 中最大的是：9\n97 是质数吗？true\n1~100 的和是：5050\n3725 秒 = 1小时2分5秒',
        keyPoints: [
          { label: '调用了 MathBox.max3(...)', test: 'MathBox\\.max3\\s*\\(' },
          { label: '调用了 MathBox.isPrime(...)', test: 'MathBox\\.isPrime\\s*\\(' },
          { label: '调用了 MathBox.sumTo(...)', test: 'MathBox\\.sumTo\\s*\\(' },
          { label: '调用了 MathBox.formatSeconds(...)', test: 'MathBox\\.formatSeconds\\s*\\(' },
          { label: '把结果打印出来', test: 'System\\.out\\.print' }
        ],
        hints: [
          '静态方法的调用格式：类名.方法名(参数)，例如 MathBox.max3(3, 9, 5)。',
          'MathBox 和你的 Main 都在默认包里，所以不需要写 import。',
          'isPrime 返回 boolean，直接和提示文字拼在一起打印，就会输出 true / false。',
          'formatSeconds 返回字符串，直接拼接打印即可，例如 System.out.println("3725 秒 = " + MathBox.formatSeconds(3725));'
        ],
        solution: 'public class Main {\n        public static void main(String[] args) {\n            // 调用“另一个文件里的类”：类名.静态方法名(...)\n            System.out.println("3、9、5 中最大的是：" + MathBox.max3(3, 9, 5));\n            System.out.println("97 是质数吗？" + MathBox.isPrime(97));\n            System.out.println("1~100 的和是：" + MathBox.sumTo(100));\n            System.out.println("3725 秒 = " + MathBox.formatSeconds(3725));\n        }\n    }'
      },

    ],
    checklist: ['能给属性加 private 并通过方法访问', '理解 static 与实例成员的区别', '完成银行账户练习']
  },
  {
    id: 'j10',
    title: '继承、多态与接口',
    minutes: 80,
    tags: ['继承', '多态', '接口', '抽象类'],
    goals: [
      '用 extends 建立继承关系，理解 super 与构造器顺序',
      '掌握方法重写与多态：父类引用指向子类对象',
      '区分抽象类和接口，知道各自该用在哪'
    ],
    lessons: [
      { t: 'p', text: '继承解决“共同代码重复写”的问题。比如 Dog 和 Cat 都有 name、age，都会 eat()，那就抽出一个父类 Animal，让它们各自继承。多态则让同一段代码能处理不同子类对象——这是 Android 里 View、Adapter、Listener 遍地都是的写法。' },
      { t: 'h', text: '1. extends 与 super' },
      { t: 'code', title: 'Animal 家族', code: `// ===== 父类：把 Dog、Cat 共同的部分抽取出来 =====
public class Animal {
    protected String name;      // protected：子类和同包都能访问
    protected int age;

    public Animal(String name, int age) {
        this.name = name;
        this.age = age;
        System.out.println("Animal 构造器执行");   // 验证：父类构造器先执行
    }

    public void eat() {
        System.out.println(name + " 在吃东西");
    }

    public void show() {
        System.out.println("动物：" + name + "，" + age + " 岁");
    }
}

// ===== 子类：extends 继承父类的属性和方法 =====
class Dog extends Animal {
    private String breed;      // 子类特有的属性

    public Dog(String name, int age, String breed) {
        super(name, age);      // 必须第一行调用父类构造器（子类初始化前先初始化父类）
        this.breed = breed;
        System.out.println("Dog 构造器执行");
    }

    @Override                  // 方法重写：方法名和参数完全相同，实现不同
    public void eat() {
        System.out.println(name + " 在啃骨头");
    }

    // 子类特有的方法：父类引用调不到
    public void bark() {
        System.out.println(name + " 汪汪叫（" + breed + "）");
    }
}

class Cat extends Animal {
    public Cat(String name, int age) {
        super(name, age);
    }

    @Override
    public void eat() {
        System.out.println(name + " 在吃小鱼");
    }

    @Override
    public void show() {
        super.show();          // super.方法()：先执行父类那一版逻辑
        System.out.println("（这是一只猫）");
    }
}` },
      { t: 'code', title: '测试多态', code: `public class TestAnimal {
    public static void main(String[] args) {
        Dog dog = new Dog("旺财", 3, "柴犬");
        Cat cat = new Cat("咪咪", 2);

        dog.eat();      // 旺财 在啃骨头（调用 Dog 重写后的版本）
        cat.eat();      // 咪咪 在吃小鱼（调用 Cat 重写后的版本）
        dog.bark();     // 子类特有方法，直接用子类引用调用
        cat.show();     // 先打印父类内容，再打印子类补充的内容

        // ===== 多态：父类引用指向子类对象 =====
        Animal[] animals = {dog, cat, new Dog("大黄", 5, "金毛")};
        for (Animal a : animals) {
            a.eat();               // 编译时看 Animal 类型，运行时执行子类重写后的实现
        }

        // 向上转型之后想用"子类特有方法"，要先判断类型再向下转型
        for (Animal a : animals) {
            if (a instanceof Dog d) {   // Java 16+ 模式匹配：判断 + 赋值一步完成
                d.bark();
            }
        }
    }
}` },
      { t: 'warn', text: '构造器执行顺序：**先父类后子类**。所以 new Dog(...) 会先打印 Animal 构造器，再打印 Dog 构造器。如果父类只写了有参构造器，子类必须用 super(...) 显式调用。' },
      { t: 'h', text: '2. 重写（Override）的规则' },
      { t: 'table', head: ['规则', '说明'], rows: [
        ['方法签名', '方法名、参数列表必须相同'],
        ['返回类型', '相同或是子类类型（协变返回）'],
        ['访问权限', '不能比父类更严格（父类 public，子类不能是 private）'],
        ['异常', '不能抛出比父类更宽的检查型异常'],
        ['static / final / private', '这三种方法不能被重写'],
        ['@Override', '强烈建议加，写错名字编译器会立刻报错']
      ]},
      { t: 'h', text: '3. 抽象类与接口' },
      { t: 'code', title: '抽象类：有共同属性 + 部分实现', code: `// 抽象类：不能 new，可以有属性、构造器、普通方法，也可以有抽象方法
public abstract class Shape {
    protected String color;

    public Shape(String color) {          // 抽象类可以有构造器，供子类 super() 调用
        this.color = color;
    }

    public abstract double area();        // 抽象方法：只声明不实现，子类必须实现

    public void describe() {              // 普通方法：子类可以直接继承使用
        // String.format("%.2f", ...) 保留两位小数，让输出更整齐
        System.out.println(color + " 图形，面积 " + String.format("%.2f", area()));
    }
}

class Circle extends Shape {
    private double r;

    public Circle(String color, double r) {
        super(color);                     // 先初始化父类部分
        this.r = r;
    }

    @Override
    public double area() {                // 必须实现父类的抽象方法
        return Math.PI * r * r;           // 圆面积 = πr²
    }
}

class Rectangle extends Shape {
    private double w, h;

    public Rectangle(String color, double w, double h) {
        super(color);
        this.w = w;
        this.h = h;
    }

    @Override
    public double area() {
        return w * h;                     // 矩形面积 = 长 × 宽
    }
}` },
      { t: 'code', title: '接口：定义“能做什么”', code: `// 接口：一组"能力"的规范。Java 8+ 允许有 default 方法和 static 方法
public interface Payable {
    double getPrice();                     // 抽象方法，默认是 public abstract

    default String payInfo() {             // default 方法：有默认实现，实现类可以不重写
        return "应付：" + getPrice() + " 元";
    }

    static boolean isValid(double price) { // static 方法：用接口名直接调用
        return price > 0;
    }
}

// 一个类可以实现多个接口，但只能继承一个父类
class Book implements Payable {
    private String title;
    private double price;

    public Book(String title, double price) {
        this.title = title;
        this.price = price;
    }

    @Override
    public double getPrice() {             // 必须实现接口的抽象方法
        return price;
    }

    @Override
    public String toString() {
        return title;                      // 打印书时只显示书名
    }
}` },
      { t: 'table', head: ['对比', '抽象类 abstract class', '接口 interface'], rows: [
        ['能否实例化', '不能', '不能'],
        ['成员变量', '任意类型', '默认 public static final 常量'],
        ['方法', '抽象方法 + 普通方法', '抽象方法 + default + static'],
        ['构造器', '有', '没有'],
        ['继承数量', '只能 extends 一个', '可以 implements 多个'],
        ['使用场景', 'is-a 关系，共享代码（狗是动物）', 'can-do 能力（可支付、可比较、可点击）']
      ]},
      { t: 'h', text: '4. equals / hashCode 与 lambda 入门' },
      { t: 'code', title: '重写 equals 与 lambda', code: `class User {
    private String id;                     // 业务主键

    public User(String id) { this.id = id; }

    // 重写 equals：定义"什么算同一个用户"（这里比较 id）
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;                                  // 同一个对象
        if (o == null || getClass() != o.getClass()) return false;   // 类型不同
        User other = (User) o;
        return id != null && id.equals(other.id);                    // 比较主键
    }

    // 重写 hashCode：必须与 equals 用同一批字段，否则 HashSet/HashMap 会找不到它
    @Override
    public int hashCode() {
        return id == null ? 0 : id.hashCode();
    }
}

// 只有一个抽象方法的接口叫"函数式接口"，可以用 lambda 简写
interface Greeting {
    void say(String name);
}

public class LambdaDemo {
    public static void main(String[] args) {
        // 原本要写 new Greeting() { public void say(String name) {...} }，lambda 把它压缩成一行
        Greeting g = name -> System.out.println("你好，" + name);
        g.say("小明");

        // Runnable 也是函数式接口，所以可以写成 lambda
        Runnable task = () -> System.out.println("任务执行了");
        task.run();
    }
}` },
            {
        t: 'h',
        text: '5. 类型声明的全部构造：类、抽象类、接口、枚举、记录、注解'
      },
      {
        t: 'p',
        text: 'Java 里「声明一个类型」不只 class 一种写法。下面这张表把常见的几种类型声明放一起对比，看到陌生写法时先认出它属于哪一种。'
      },
      {
        t: 'table',
        head: ['类型', '声明骨架', '特点 / 什么时候用'],
        rows: [
          ['普通类', 'public class Dog extends Animal implements Runnable { }', '能 new、能被继承；不想被继承就写 final class Dog'],
          ['抽象类', 'abstract class Shape { abstract double area(); }', '不能 new；有共同字段 + 部分实现，把没实现完的留给子类'],
          ['接口', 'interface Flyable { void fly(); default void land() { } static Flyable of() { } }', '描述「能做什么」，可以多实现；字段隐式是 public static final'],
          ['枚举', 'enum Level { LOW, MID, HIGH }', '固定常量集合（天然线程安全、可带字段和方法），switch 里最好用；页面运行器暂不覆盖，去 IDEA 里跑'],
          ['记录', 'record Point(int x, int y) { }', '只装数据的不可变类，自动生成构造器 / 访问器 / equals / hashCode / toString；页面运行器暂不覆盖'],
          ['注解类型', '@interface Author { String value(); }', '给代码贴标签，配合框架使用；入门阶段知道写法即可'],
          ['泛型类 / 泛型方法', 'class Box<T> { T value; }　static <T> T first(List<T> list)', '把类型参数化，写容器和工具方法时用'],
          ['嵌套类 / 内部类', 'static class Node { }　class Inner { }', '定义在类里面的类；静态嵌套类常用（用 外层.内层 创建），非静态内部类少见']
        ]
      },
      {
        t: 'table',
        head: ['对比项', '普通类', '抽象类', '接口'],
        rows: [
          ['能不能 new', '能', '不能', '不能'],
          ['有没有构造器', '有', '有（给子类调用）', '没有'],
          ['能不能放字段', '各种字段都行', '各种字段都行', '只能放 public static final 常量'],
          ['方法体的形式', '全都有方法体', '抽象方法 + 普通方法', '抽象方法 + default + static（JDK 9 起还能有 private）'],
          ['继承 / 实现', 'extends 一个父类', 'extends 一个父类', 'implements 可以写多个'],
          ['什么时候用它', '描述一个具体的东西', '「是一类」+ 想共享代码', '「能做某事」，而且需要多实现']
        ]
      },
      {
        t: 'list',
        items: [
          '**接口里能放什么**：常量（隐式 public static final）、抽象方法、default 方法（带方法体）、static 方法、JDK 9 起的 private 方法（给 default 方法复用）。',
          '**接口不能放什么**：实例字段、构造器。所以接口没法保存状态，状态要放在实现类里。',
          '**什么时候用接口**：当你关心「它能不能做某件事」而不是「它是什么」时——比如 Comparable（能不能比较）、Runnable（能不能跑）。',
          '**什么时候用抽象类**：多个类有共同的字段和部分共同实现，只想把一小部分留给子类时。'
        ]
      },
      {
        t: 'code',
        title: '继承 + 抽象类 + 接口 + 多态：完整骨架（可直接运行）',
        code: [
          '// ① 接口：定义「能做什么」，可以有抽象方法、default 方法、static 方法、常量',
          'interface Payable {',
          '    double RATE = 0.1;                        // 接口里的字段隐式是 public static final',
          '',
          '    double pay();                             // 抽象方法：实现类必须写',
          '',
          '    default String payInfo() {                // default 方法：带实现，子类可以直接用',
          '        return "应付 " + pay();',
          '    }',
          '',
          '    static Payable of(double amount) {        // static 方法：用 接口名.方法() 调用',
          '        return () -> amount * (1 + RATE);     // 返回一个 lambda 实现',
          '    }',
          '}',
          '',
          '// ② 抽象类：有共同字段和部分实现，剩下没实现的用 abstract 留给子类',
          'abstract class Employee {',
          '    private final String name;',
          '    private final double base;',
          '',
          '    Employee(String name, double base) {',
          '        this.name = name;',
          '        this.base = base;',
          '    }',
          '',
          '    public String getName() { return name; }',
          '    public double getBase() { return base; }',
          '',
          '    public abstract double salary();           // 抽象方法：只有声明，没有方法体',
          '',
          '    public String report() {                   // 普通方法里可以调用抽象方法（多态）',
          '        return name + " 本月工资 " + salary();',
          '    }',
          '}',
          '',
          '// ③ 子类：extends 继承父类 + implements 实现接口，两者可以同时写',
          'class FullTime extends Employee implements Payable {',
          '    FullTime(String name, double base) {',
          '        super(name, base);                     // 先构造父类部分，必须是第一行',
          '    }',
          '',
          '    @Override',
          '    public double salary() {                   // 重写父类的抽象方法',
          '        return getBase() + 2000;',
          '    }',
          '',
          '    @Override',
          '    public double pay() {                      // 实现接口里的抽象方法',
          '        return salary();',
          '    }',
          '}',
          '',
          'public class TypeDemo {',
          '    public static void main(String[] args) {',
          '        // 多态：父类引用指向子类对象，调用的永远是子类实现',
          '        Employee e = new FullTime("小明", 8000);',
          '        System.out.println(e.report());',
          '        System.out.println("名字 = " + e.getName());',
          '',
          '        // 换个「视角」看待同一个对象：用接口类型引用它',
          '        Payable p = new FullTime("小红", 5000);',
          '        System.out.println(p.payInfo());           // default 方法直接可用',
          '',
          '        // 接口的静态方法 + lambda',
          '        Payable bonus = Payable.of(1000);',
          '        System.out.println("奖金：" + bonus.pay());',
          '    }',
          '}'
        ].join('\n')
      },
      {
        t: 'code',
        title: '再加三种常见的高级构造：静态嵌套类、lambda、方法引用（可直接运行）',
        code: [
          'import java.util.ArrayList;',
          'import java.util.List;',
          '',
          'public class ExtraForms {',
          '    // ① 静态嵌套类：不需要外部对象就能创建，最常用',
          '    static class Score {',
          '        private final int math;',
          '        private final int english;',
          '',
          '        Score(int math, int english) {',
          '            this.math = math;',
          '            this.english = english;',
          '        }',
          '',
          '        int total() { return math + english; }',
          '    }',
          '',
          '    // ② 只有一个抽象方法的接口：可以直接用 lambda 实现',
          '    interface Action {',
          '        void doIt();',
          '    }',
          '',
          '    public static void main(String[] args) {',
          '        Score s = new Score(95, 88);',
          '        System.out.println("静态嵌套类：总分 = " + s.total());',
          '',
          '        // ③ lambda：接口 + 一行实现的简短写法',
          '        Action a = () -> System.out.println("lambda 实现接口");',
          '        a.doIt();',
          '',
          '        // ④ 方法引用：把已有方法直接当参数传，比 lambda 还短',
          '        List<String> names = new ArrayList<>();',
          '        names.add("bbb");',
          '        names.add("a");',
          '        names.sort(String::compareTo);        // 类型::实例方法',
          '        names.forEach(System.out::println);   // 对象::方法',
          '    }',
          '}',
          '',
          '/* 还有两种写法（页面里的运行器暂时不覆盖，复制到 IDEA 里运行）：',
          '   ⑤ 匿名内部类：new Action() { @Override public void doIt() { ... } };',
          '   ⑥ 非静态内部类：ExtraForms outer = new ExtraForms();',
          '                  ExtraForms.Inner in = outer.new Inner();',
          '   能用静态嵌套类或 lambda 解决时，优先用它们，代码更干净。 */'
        ].join('\n')
      },
      {
        t: 'tip',
        text: '**继承 vs 接口怎么选**：先问「它是不是一种 X」。是（狗是动物、圆是形状）→ 继承抽象类或普通类；只是「能做 X」（能比较、能跑、能保存）→ 用接口。**抽象类只能继承一个，接口可以 implements 多个**，所以需要组合多种能力时只能靠接口。'
      },,
{ t: 'tip', text: 'Android 里到处都是这套东西：Button 的点击监听、RecyclerView 的 Adapter 回调、Retrofit 的网络回调，本质都是接口 + 匿名实现（现在大多写成 lambda）。所以这一章务必练熟。' }
    ],
    quiz: [
      { q: 'new Dog(...) 时，构造器的执行顺序是？', options: ['先子类后父类', '先父类后子类', '只执行子类', '随机'], answer: 1, explain: '父类先初始化，子类再初始化。' },
      { q: '关于多态，正确的说法是？', options: ['父类引用可以调用子类特有方法', '编译看左边，运行看右边（调用重写后的方法）', '子类不能重写父类方法', '多态需要接口才能实现'], answer: 1, explain: '编译期按父类类型检查，运行期执行子类重写的方法。' },
      { q: '一个类最多能实现几个接口？', options: ['1 个', '2 个', '最多 5 个', '不限个数'], answer: 3, explain: 'Java 类单继承、多实现，接口可以实现多个。' },
      { q: '抽象类和接口的核心区别是？', options: ['抽象类不能被继承', '抽象类可以有构造器和属性，接口更像行为规范', '接口不能有方法', '没有区别'], answer: 1, explain: '抽共性用抽象类，定义能力用接口。' }
    ],
    exercises: [
      {
        id: 'ex-j10-1',
        title: '练习 1：员工薪资系统（多态实战）',
        level: '较难',
        brief: '用抽象类 + 多态实现一个公司薪资报表，包含全职员工和兼职员工两种类型。',
        requirements: [
          '抽象类 Employee：属性 name、id；抽象方法 calculateSalary()；普通方法 printInfo()',
          'FullTimeEmployee：属性 baseSalary、bonus，月薪 = 底薪 + 奖金',
          'PartTimeEmployee：属性 hourlyRate、hours，月薪 = 时薪 × 工时',
          '接口 Payable 定义 double getPayAmount()，两个子类都实现它',
          'main 中创建 Employee[] 数组（至少 4 人），遍历打印工资',
          '统计并打印公司总支出、最高工资员工的姓名'
        ],
        starter: `public abstract class Employee {
    // TODO: 属性、构造器、抽象方法、printInfo
}

// TODO: FullTimeEmployee、PartTimeEmployee、Payable 接口

// TODO: main 测试`,
        expectedOutput: `=== 薪资报表 ===
E001 张三（全职） 本月工资：12000.0
E002 李四（全职） 本月工资：9500.0
E003 王五（兼职） 本月工资：3200.0
E004 赵六（兼职） 本月工资：2400.0
公司总支出：27100.0
最高工资：张三 12000.0`,
        keyPoints: [
          { label: '抽象类 Employee 与抽象方法', test: 'abstract\\s+class\\s+Employee[\\s\\S]*abstract\\s+double\\s+calculateSalary' },
          { label: '两个子类都 extends Employee', test: 'class\\s+FullTimeEmployee\\s+extends\\s+Employee[\\s\\S]*class\\s+PartTimeEmployee\\s+extends\\s+Employee' },
          { label: '子类重写了 calculateSalary', test: '@Override[\\s\\S]{0,60}calculateSalary' },
          { label: '有接口 Payable', test: 'interface\\s+Payable' },
          { label: '使用 super 调用父类构造器', test: 'super\\s*\\(' },
          { label: '遍历数组统计总额', test: 'for\\s*\\(\\s*Employee' }
        ],
        hints: [
          '父类构造器：public Employee(String id, String name) { ... }，子类第一行 super(id, name);',
          'printInfo 里可以用一个抽象方法 getType() 让子类返回“全职/兼职”',
          '求最高工资：用一个 Employee 变量记录当前最高，遍历时比较 calculateSalary()'
        ],
        solution: `public abstract class Employee {
    protected String id;
    protected String name;

    public Employee(String id, String name) {
        this.id = id;
        this.name = name;
    }

    public abstract double calculateSalary();

    public abstract String getType();

    public void printInfo() {
        System.out.println(id + " " + name + "（" + getType() + "） 本月工资：" + calculateSalary());
    }

    public static void main(String[] args) {
        Employee[] staff = {
            new FullTimeEmployee("E001", "张三", 10000, 2000),
            new FullTimeEmployee("E002", "李四", 9000, 500),
            new PartTimeEmployee("E003", "王五", 40, 80),
            new PartTimeEmployee("E004", "赵六", 30, 80)
        };

        System.out.println("=== 薪资报表 ===");
        double total = 0;
        Employee top = staff[0];
        for (Employee e : staff) {
            e.printInfo();
            total += e.calculateSalary();
            if (e.calculateSalary() > top.calculateSalary()) {
                top = e;
            }
        }
        System.out.println("公司总支出：" + total);
        System.out.println("最高工资：" + top.name + " " + top.calculateSalary());

        Payable p = (Payable) staff[0];   // 向下转型后使用接口方法
        System.out.println("接口调用：" + p.getPayAmount());
    }
}

interface Payable {
    double getPayAmount();
}

class FullTimeEmployee extends Employee implements Payable {
    private final double baseSalary;
    private final double bonus;

    public FullTimeEmployee(String id, String name, double baseSalary, double bonus) {
        super(id, name);
        this.baseSalary = baseSalary;
        this.bonus = bonus;
    }

    @Override
    public double calculateSalary() {
        return baseSalary + bonus;
    }

    @Override
    public String getType() {
        return "全职";
    }

    @Override
    public double getPayAmount() {
        return calculateSalary();
    }
}

class PartTimeEmployee extends Employee implements Payable {
    private final double hourlyRate;
    private final int hours;

    public PartTimeEmployee(String id, String name, double hourlyRate, int hours) {
        super(id, name);
        this.hourlyRate = hourlyRate;
        this.hours = hours;
    }

    @Override
    public double calculateSalary() {
        return hourlyRate * hours;
    }

    @Override
    public String getType() {
        return "兼职";
    }

    @Override
    public double getPayAmount() {
        return calculateSalary();
    }
}`
      }
    ],
    checklist: ['理解构造器调用顺序', '能写出父类引用指向子类对象', '说清抽象类与接口的区别']
  }
];
