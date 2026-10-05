/* 课程内容 · Java 基础（第 11 章 异常处理与调试） */
window.COURSE_JAVA_PART3 = [
  {
    id: 'j11',
    title: '异常处理与调试',
    minutes: 60,
    tags: ['异常', 'try-catch', '调试'],
    goals: [
      '理解异常体系：Error / Exception / RuntimeException',
      '会用 try-catch-finally、throws 和 try-with-resources',
      '会自定义异常，并能看懂异常堆栈定位问题'
    ],
    lessons: [
      { t: 'p', text: '程序出错有两种：编译错误（写错语法，IDE 直接标红）和运行异常（跑起来才炸）。异常处理的意义不是“消灭所有错误”，而是**让程序在出错时给出清晰提示、并且不崩溃**。' },
      { t: 'h', text: '1. 异常家族' },
      { t: 'table', head: ['类型', '举例', '特点'], rows: [
        ['Error', 'OutOfMemoryError、StackOverflowError', '系统级错误，程序无法处理'],
        ['Exception（检查型）', 'IOException、SQLException', '编译器强制你处理，不处理不能通过编译'],
        ['RuntimeException（非检查型）', 'NullPointerException、ArrayIndexOutOfBoundsException、NumberFormatException、ArithmeticException', '编译器不强制，通常是代码 bug']
      ]},
      { t: 'h', text: '2. try-catch-finally' },
      { t: 'code', title: '捕获异常', code: `public class ExceptionDemo {
    public static void main(String[] args) {
        // ---------- 基础写法：try 里放可能出错的代码，catch 里处理 ----------
        try {
            int a = 10;
            int b = 0;
            System.out.println(a / b);            // 除数为 0 → 抛 ArithmeticException
            System.out.println("这行不会执行");     // 上一行抛异常，这里直接被跳过
        } catch (ArithmeticException e) {          // 只捕获这一种异常
            System.out.println("出错了：" + e.getMessage());   // getMessage() 拿到 / by zero
        } finally {
            System.out.println("finally 一定会执行（常用于释放资源）");
        }

        // ---------- 多个 catch：从"具体"到"宽泛"排列 ----------
        String[] arr = {"12", "abc"};
        for (String s : arr) {
            try {
                int n = Integer.parseInt(s);       // "abc" 会抛 NumberFormatException
                System.out.println("解析成功：" + n);
            } catch (NumberFormatException e) {    // 先捕获更具体的类型
                System.out.println(s + " 不是合法数字");
            } catch (Exception e) {                // 兜底：所有异常的父类（必须放最后）
                System.out.println("其他异常：" + e);
            }
        }

        // ---------- JDK 7+ 多重捕获：多个类型用 | 连起来 ----------
        try {
            int[] nums = new int[2];
            nums[5] = 1;                           // 下标越界
        } catch (ArrayIndexOutOfBoundsException | NullPointerException e) {
            // getClass().getSimpleName() 可以拿到异常类名，方便日志区分
            System.out.println("数组或空指针问题：" + e.getClass().getSimpleName());
        }
    }
}` },
      { t: 'warn', text: '空的 catch 块（catch 后面什么都不写）是**最危险的代码**：错误被吞掉，线上出问题完全查不到。至少写 e.printStackTrace() 或日志。' },
      { t: 'h', text: '3. throws：把异常交给调用者处理' },
      { t: 'code', title: '方法声明抛出异常', code: `import java.io.IOException;

public class ThrowsDemo {

    // throws：声明"我这个方法可能抛这种异常，调用者必须处理"
    // 这样方法内部就不用写 try-catch，把处理责任交给上层
    public static void readFile(String path) throws IOException {
        if (path == null) {
            // 主动抛出参数异常，属于"防御性编程"
            throw new IllegalArgumentException("路径不能为空");
        }
        System.out.println("读取 " + path);     // 真实项目里这里会做文件读取
    }

    public static void main(String[] args) {
        try {
            readFile("data.txt");              // 正常调用
            readFile(null);                    // 会抛 IllegalArgumentException
        } catch (IOException e) {              // 处理检查型异常
            System.out.println("IO 异常：" + e.getMessage());
        } catch (IllegalArgumentException e) { // 处理非检查型异常
            System.out.println("参数异常：" + e.getMessage());
        }
        // 提示：catch 顺序也是"子类在前、父类在后"，否则编译报错
    }
}` },
      { t: 'code', title: 'try-with-resources：自动关闭资源', code: `import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;

public class ReadDemo {
    public static void main(String[] args) {
        // 在 try 的括号里创建资源（必须实现 AutoCloseable）：
        // 无论正常结束还是抛异常，Java 都会自动调用 close()，不用手写 finally
        try (BufferedReader br = new BufferedReader(new FileReader("scores.txt"))) {
            String line;
            // 一行一行读，直到 readLine() 返回 null（读到文件末尾）
            while ((line = br.readLine()) != null) {
                System.out.println(line);
            }
        } catch (IOException e) {              // 文件不存在、读失败等都会到这里
            System.out.println("读取失败：" + e.getMessage());
        }
    }
}` },
      { t: 'h', text: '4. 自定义异常' },
      { t: 'code', title: '业务异常', code: `// 自定义异常：继承 RuntimeException（非检查型，调用方可以不 try-catch）
public class InsufficientBalanceException extends RuntimeException {
    public InsufficientBalanceException(String message) {
        super(message);        // 把消息交给父类保存，之后 e.getMessage() 就能拿到
    }
}

class Wallet {
    private double balance = 100;

    public void pay(double amount) {
        // 业务规则不满足时抛自定义异常，比返回 false 更清晰
        if (amount > balance) {
            throw new InsufficientBalanceException("余额不足：需要 " + amount + "，当前 " + balance);
        }
        balance -= amount;
        System.out.println("支付成功，余额 " + balance);
    }

    public static void main(String[] args) {
        Wallet w = new Wallet();
        try {
            w.pay(500);        // 触发余额不足
        } catch (InsufficientBalanceException e) {
            System.out.println("支付失败：" + e.getMessage());
        }
    }
}` },
      { t: 'h', text: '5. 调试：学会读异常堆栈' },
      { t: 'code', title: '看懂堆栈信息', code: `Exception in thread "main" java.lang.NullPointerException: Cannot invoke "String.length()" because "name" is null
    at com.demo.User.check(User.java:12)      <-- 出错位置：User.java 第 12 行
    at com.demo.Main.main(Main.java:8)        <-- 调用链：Main 第 8 行调用的

// 读异常堆栈的三步法：
// 1. 看第一行：什么异常、什么原因（这里是 NullPointerException，原因是 name 为 null）
// 2. 往下找"你自己包名"出现的第一行（com.demo → User.java:12），那才是要改的代码
// 3. 从下往上读调用链，还原是"谁调用了谁"导致的

// 常见对照：
// NullPointerException        用之前没判空
// ArrayIndexOutOfBoundsException  下标越界（比如 i <= arr.length）
// ClassCastException          类型转错了
// NumberFormatException       字符串不是合法数字
// ConcurrentModificationException  遍历集合时增删了元素` },
      { t: 'list', items: [
        '断点调试：在 IDE 里点行号左侧打断点，用 Debug 模式运行，可以看变量实时值、单步执行（Step Over / Step Into）',
        'System.out.println 是最朴素的调试方式，但提交代码前要删掉或改用日志',
        '常见异常速查：NullPointerException（用之前没判空）、ArrayIndexOutOfBoundsException（下标越界）、ClassCastException（类型转错）、NumberFormatException（字符串不是数字）',
        '防御性编程：方法入口先校验参数，非法就抛 IllegalArgumentException'
      ]}
    ],
    quiz: [
      { q: '下面哪个是检查型异常（必须处理）？', options: ['NullPointerException', 'ArithmeticException', 'IOException', 'ArrayIndexOutOfBoundsException'], answer: 2, explain: 'IOException 是检查型，编译器强制 try-catch 或 throws。' },
      { q: 'finally 块什么时候执行？', options: ['只有正常结束时', '只有异常时', '无论是否异常都会执行', '从不执行'], answer: 2, explain: 'finally 通常用于释放资源。' },
      { q: '空指针异常最可能的原因是？', options: ['数组越界', '对象引用是 null 还调用它的方法', '类型转换失败', '除数为 0'], answer: 1, explain: 'NullPointerException 就是拿着 null 当对象用。' },
      { q: 'try-with-resources 的好处是？', options: ['让代码更短', '自动关闭资源，避免内存泄漏和文件占用', '自动忽略异常', '提高运行速度'], answer: 1, explain: '实现了 AutoCloseable 的资源会自动 close。' }
    ],
    exercises: [
      {
        id: 'ex-j11-1',
        title: '练习 1：安全计算器',
        level: '中等',
        brief: '写一个不会崩的除法计算器，处理各种非法输入。',
        requirements: [
          '方法 divide(String a, String b) 返回 double，声明 throws ArithmeticException',
          'a 或 b 不是数字时抛出自定义异常 InvalidInputException（继承 RuntimeException），消息为“输入不是合法数字：xxx”',
          'b 为 0 时抛出 ArithmeticException，消息为“除数不能为 0”',
          'main 中依次测试："10","2" → "10","abc" → "10","0" → null,"2"，每次都用 try-catch 捕获并友好提示',
          '使用 finally 输出一行“本次计算结束”'
        ],
        starter: `public class SafeCalculator {

    static class InvalidInputException extends RuntimeException {
        public InvalidInputException(String message) {
            super(message);
        }
    }

    // TODO: divide 方法

    public static void main(String[] args) {
        // TODO: 四种场景测试
    }
}`,
        expectedOutput: `10 / 2 = 5.0
本次计算结束
输入不是合法数字：abc
本次计算结束
出错：除数不能为 0
本次计算结束
输入不能为空
本次计算结束`,
        keyPoints: [
          { label: '自定义异常继承 RuntimeException', test: 'class\\s+InvalidInputException\\s+extends\\s+RuntimeException' },
          { label: 'divide 方法声明 throws', test: 'divide[\\s\\S]{0,160}throws' },
          { label: '捕获自定义异常', test: 'catch\\s*\\(\\s*InvalidInputException' },
          { label: '有 finally 块', test: 'finally' },
          { label: '除数 0 的处理', test: '除数不能为 0|b\\s*==\\s*0|y\\s*==\\s*0' },
          { label: '用循环遍历多个测试场景并调用 divide', test: 'for\\s*\\([\\s\\S]{0,160}divide\\s*\\(' }
        ],
        hints: [
          '解析：if (a == null || b == null) throw new InvalidInputException("输入不能为空");',
          '用 Double.parseDouble 转换，catch NumberFormatException 后抛出自己的异常',
          '每个场景用独立的 try-catch-finally，方便看出各自的输出'
        ],
        solution: `public class SafeCalculator {

    static class InvalidInputException extends RuntimeException {
        public InvalidInputException(String message) {
            super(message);
        }
    }

    public static double divide(String a, String b) throws ArithmeticException {
        if (a == null || b == null) {
            throw new InvalidInputException("输入不能为空");
        }
        double x;
        double y;
        try {
            x = Double.parseDouble(a.trim());
        } catch (NumberFormatException e) {
            throw new InvalidInputException("输入不是合法数字：" + a);
        }
        try {
            y = Double.parseDouble(b.trim());
        } catch (NumberFormatException e) {
            throw new InvalidInputException("输入不是合法数字：" + b);
        }
        if (y == 0) {
            throw new ArithmeticException("除数不能为 0");
        }
        return x / y;
    }

    public static void main(String[] args) {
        String[][] cases = {
            {"10", "2"}, {"10", "abc"}, {"10", "0"}, {null, "2"}
        };
        for (String[] c : cases) {
            try {
                double result = divide(c[0], c[1]);
                System.out.println(c[0] + " / " + c[1] + " = " + result);
            } catch (InvalidInputException e) {
                System.out.println(e.getMessage());
            } catch (ArithmeticException e) {
                System.out.println("出错：" + e.getMessage());
            } finally {
                System.out.println("本次计算结束");
            }
        }
    }
}`
      }
    ],
    checklist: ['能说清检查型与非检查型异常', '会用 try-with-resources', '能看懂异常堆栈并定位行号']
  }
];
