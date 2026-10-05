/* 课程内容 · Java 基础（第 13 章 常用 API 与文件读写） */
window.COURSE_JAVA_PART5 = [
  {
    id: 'j13',
    title: '常用 API 与文件读写',
    minutes: 70,
    tags: ['String', '日期时间', 'File', 'IO', 'JSON'],
    goals: [
      '熟练使用 StringBuilder、String.format、Math 与日期时间 API',
      '会用 IO 流读写文本文件，做到“数据持久化”',
      '了解 JSON 格式，为 Android 数据解析打基础'
    ],
    lessons: [
      { t: 'h', text: '1. StringBuilder：大量拼接用这个' },
      { t: 'code', title: 'String vs StringBuilder', code: `// String 是不可变的：每次拼接都会创建一个新字符串对象，循环里非常浪费
String part = "";
for (int i = 0; i < 5; i++) {
    part += i;               // 这里其实创建了 5 个临时对象
}
System.out.println(part);    // 01234

// StringBuilder 是可变的：在同一个对象上追加内容，循环拼接首选
StringBuilder sb = new StringBuilder();
for (int i = 0; i < 5; i++) {
    sb.append(i).append(",");     // append 返回自身，可以链式调用
}
sb.deleteCharAt(sb.length() - 1);     // 删掉最后一个逗号
System.out.println(sb.toString());    // 0,1,2,3,4（需要字符串时才 toString）

// 常用方法
StringBuilder b = new StringBuilder("Hello");
b.append(" World");     // 追加
b.insert(0, "前缀 ");   // 在下标 0 处插入
b.replace(3, 8, "X");   // 用 "X" 替换 [3, 8) 区间
b.reverse();            // 反转内容` },
      { t: 'h', text: '2. String.format 与 Math' },
      { t: 'code', title: '格式化与数学工具', code: `// ---------- String.format：按占位符生成字符串 ----------
// %s 字符串  %d 整数  %.1f 保留 1 位小数  %b 布尔  %% 百分号本身
String info = String.format("姓名：%s，成绩：%d，平均：%.1f", "小明", 88, 88.5);
System.out.println(info);

// printf 直接输出（不返回字符串）；%-10s 表示左对齐占 10 个字符宽度，%5d 表示右对齐占 5 位
System.out.printf("左对齐：|%-10s|%5d|%n", "分数", 42);

// ---------- Math 常用方法（都是 static，直接用类名调用） ----------
System.out.println(Math.abs(-5));       // 5：绝对值
System.out.println(Math.max(3, 7));     // 7：较大值
System.out.println(Math.min(3, 7));     // 3：较小值
System.out.println(Math.pow(2, 10));    // 1024.0：2 的 10 次方
System.out.println(Math.sqrt(16));      // 4.0：平方根
System.out.println(Math.round(3.6));    // 4：四舍五入到整数
System.out.println(Math.ceil(3.1));     // 4.0：向上取整
System.out.println(Math.floor(3.9));    // 3.0：向下取整

// ---------- 随机数 ----------
int r = (int) (Math.random() * 100) + 1;      // Math.random() 返回 [0,1)，*100 再 +1 → 1~100
System.out.println(r);

// Random 类更灵活：nextInt(bound) 返回 [0, bound)
java.util.Random random = new java.util.Random();
int dice = random.nextInt(6) + 1;             // 1~6，掷骰子
System.out.println(dice);` },
      { t: 'h', text: '3. 日期时间 API（Java 8+）' },
      { t: 'code', title: 'LocalDate 常用操作', code: `import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;

// now()：取当前日期
LocalDate today = LocalDate.now();
System.out.println(today);                     // 2026-09-24

// of()：手动构造一个日期（注意月份是 1~12，不是从 0 开始）
LocalDate birthday = LocalDate.of(2008, 5, 20);
System.out.println(birthday);                  // 2008-05-20

// 日期计算：LocalDate 是"不可变"的，运算结果必须用变量接住，原对象不会变
LocalDate nextWeek = today.plusWeeks(1);       // 一周后
LocalDate lastDay = today.minusDays(1);        // 昨天
System.out.println(nextWeek + " " + lastDay);

// 计算两个日期相差多少天
long days = ChronoUnit.DAYS.between(birthday, today);
System.out.println("活了 " + days + " 天");

// 格式化与解析
DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy年MM月dd日");
System.out.println(today.format(fmt));         // 2026年09月24日
LocalDate parsed = LocalDate.parse("2026-01-01");   // 默认格式 yyyy-MM-dd
System.out.println(parsed.getYear() + " " + parsed.getMonthValue());` },
      { t: 'tip', text: '日期时间对象是**不可变**的：today.plusDays(1) 不会改变 today 本身，必须接住返回值。' },
      { t: 'h', text: '4. 文件读写：让数据活过下一次运行' },
      { t: 'code', title: '写文件与读文件', code: `import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

public class FileDemo {
    public static void main(String[] args) {
        String filePath = "students.txt";

        // ---------- 写：BufferedWriter 提高性能，try-with-resources 自动 close ----------
        try (BufferedWriter writer = new BufferedWriter(new FileWriter(filePath))) {
            writer.write("小明,88");     // 注意：默认是"覆盖"，会清空原文件
            writer.newLine();           // 换行（跨平台安全）
            writer.write("小红,95");
            writer.newLine();
            writer.write("小刚,77");
            System.out.println("写入完成");
        } catch (IOException e) {       // 磁盘满、没有权限、路径不存在等
            System.out.println("写文件失败：" + e.getMessage());
        }

        // ---------- 读：按行读取，每行按逗号拆成字段 ----------
        try (BufferedReader reader = new BufferedReader(new FileReader(filePath))) {
            String line;
            while ((line = reader.readLine()) != null) {   // 读到末尾返回 null
                String[] parts = line.split(",");           // 拆成 ["小明", "88"]
                System.out.println(parts[0] + " -> " + Integer.parseInt(parts[1]));
            }
        } catch (IOException e) {
            System.out.println("读文件失败：" + e.getMessage());
        }

        // ---------- 追加写：FileWriter 第二个参数传 true ----------
        try (BufferedWriter writer = new BufferedWriter(new FileWriter(filePath, true))) {
            writer.newLine();
            writer.write("小美,91");
        } catch (IOException e) {
            e.printStackTrace();        // 打印完整异常堆栈，便于定位问题
        }

        // ---------- NIO.2：一行读写，代码更短（推荐新代码使用） ----------
        try {
            Path path = Path.of(filePath);
            if (Files.exists(path)) {                        // 先判断文件存在
                List<String> lines = Files.readAllLines(path);   // 一次性读成 List
                System.out.println("总行数：" + lines.size());
                Files.writeString(Path.of("summary.txt"), "共 " + lines.size() + " 条记录");
                System.out.println("文件大小：" + Files.size(path) + " 字节");
            }
        } catch (IOException e) {
            System.out.println("NIO 操作失败：" + e.getMessage());
        }
    }
}` },
      { t: 'warn', text: '写文件时路径是**相对于运行目录**的，不是相对于 .java 文件。文件不存在时 FileReader 会抛 FileNotFoundException，先判断 Files.exists 或捕获异常。' },
      { t: 'h', text: '5. JSON：和服务器交换数据的格式' },
      { t: 'code', title: 'JSON 长什么样', code: `// 服务器返回的 JSON 通常长这样：外层是对象 {}，里面可以嵌套对象和数组 []
{
  "code": 0,                          // 状态码：0 表示成功（业务约定，不是 HTTP 状态码）
  "message": "success",               // 提示信息
  "data": {                           // 真正的数据体
    "userId": 1001,                   // 数字
    "nickname": "小明",                // 字符串必须用双引号
    "tags": ["Java", "Android"],      // 数组用 []
    "vip": false                      // 布尔值
  }
}

// 在 Java 里手动解析最简单的方式（Android 内置 org.json）
// String json = "...";
// JSONObject root = new JSONObject(json);           // 把字符串变成对象
// String message = root.getString("message");       // 按 key 取值
// JSONObject data = root.getJSONObject("data");     // 取嵌套对象
// String nickname = data.getString("nickname");
// JSONArray tags = data.getJSONArray("tags");       // 取数组

// 更工程化的做法是用 Gson / Moshi 自动映射成对象：
// User user = new Gson().fromJson(json, User.class);
// class User { int userId; String nickname; List<String> tags; boolean vip; }` },
      { t: 'list', items: [
        'JSON 的三种结构：对象 `{}`、数组 `[]`、键值对 `"key": value`',
        '值的类型：字符串（双引号）、数字、布尔、null、对象、数组',
        'Android 请求网络拿到的基本都是 JSON，所以这一节是为移动端做铺垫',
        '练习方法：找任意公开 API（天气、汇率、新闻），用浏览器打开看返回的 JSON 结构'
      ]},
      { t: 'tip', text: '到这里 Java 的“日常使用”部分就通关了：你已经有能力写出命令行工具、带文件持久化的小系统、面向对象的业务代码。接下来第 14~16 章会继续深挖 IO 流、集合框架和多线程这三块硬骨头（也是面试重点），再往后第 17 章开始进入 Android 移动开发。' }
    ],
    quiz: [
      { q: '循环里大量拼接字符串，推荐用？', options: ['String 的 + 号', 'StringBuilder', 'String.concat', 'printf'], answer: 1, explain: 'String 不可变，+ 会不断创建新对象；StringBuilder 才是循环拼接的首选。' },
      { q: 'String.format("%.2f", 3.14159) 的结果是？', options: ['3.14', '3.142', '3.1', '3'], answer: 0, explain: '%.2f 表示保留两位小数。' },
      { q: '读取文件时判断读到末尾的方式是？', options: ['line.isEmpty()', 'readLine 返回 null', 'line.equals("EOF")', 'line.length() == 0'], answer: 1, explain: 'readLine() 读到文件末尾返回 null。' },
      { q: 'JSON 中表示数组的符号是？', options: ['{}', '[]', '()', '<>'], answer: 1, explain: '对象用 {}，数组用 []。' }
    ],
    exercises: [
      {
        id: 'ex-j13-1',
        title: '练习 1：记事本 + 数据持久化',
        level: '较难',
        brief: '结合集合、IO、日期时间，做一个可以把待办事项保存到文件的小程序。',
        requirements: [
          '定义 Todo 类：id、content、done（是否完成）、createdDate（LocalDate）',
          '用 List<Todo> 管理所有事项，id 用 static 自增生成',
          'addTodo(String content)：新增事项，自动记录当天日期',
          'listTodos()：用 String.format 输出整齐的列表（状态 [x]/[ ]、内容、日期）',
          'completeTodo(int id)：把指定 id 标记为完成，找不到时输出提示',
          'saveToFile()：用 BufferedWriter 把事项写入 todos.txt，每行格式 id|content|done|date',
          'loadFromFile()：用 BufferedReader 读回来解析成对象（文件不存在时不要崩）',
          'main 中走完整流程：新增 3 条 → 完成 1 条 → 打印 → 保存 → 清空列表 → 重新读回来 → 再打印'
        ],
        starter: `import java.io.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class TodoApp {
    private static final String FILE = "todos.txt";
    private static final List<Todo> todos = new ArrayList<>();
    private static int nextId = 1;

    // TODO: Todo 类 / addTodo / listTodos / completeTodo / saveToFile / loadFromFile

    public static void main(String[] args) {
        // TODO: 演示完整流程
    }
}`,
        expectedOutput: `已添加：1 学完 Java 集合
已添加：2 写控制台项目
已添加：3 开始 Android
已完成：1 学完 Java 集合
=== 待办清单 ===
[x] 1. 学完 Java 集合  (2026-09-24)
[ ] 2. 写控制台项目  (2026-09-24)
[ ] 3. 开始 Android  (2026-09-24)
已保存 3 条到文件
=== 重新读取后 ===
已读取 3 条记录
[x] 1. 学完 Java 集合  (2026-09-24)
...`,
        keyPoints: [
          { label: '使用了 LocalDate 记录日期', test: 'LocalDate' },
          { label: '有 List<Todo> 集合', test: 'List<\\s*Todo\\s*>|ArrayList<\\s*Todo\\s*>' },
          { label: '用 BufferedWriter 写文件', test: 'BufferedWriter|Files\\.write' },
          { label: '用 BufferedReader 按行读', test: 'BufferedReader|readLine|Files\\.readAllLines' },
          { label: '解析时使用 split 拆分', test: 'split\\s*\\(' },
          { label: '用 String.format 格式化输出', test: 'String\\.format' },
          { label: '处理了 IOException', test: 'catch\\s*\\(\\s*IOException' }
        ],
        hints: [
          '写入一行：writer.write(t.id + "|" + t.content + "|" + t.done + "|" + t.createdDate);',
          '读取时用 line.split 按竖线拆分，注意竖线在正则里需要转义',
          '流程演示技巧：保存后先 todos.clear() 模拟“程序重启”，再 loadFromFile() 看数据是否还在'
        ],
        solution: `import java.io.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class TodoApp {
    private static final String FILE = "todos.txt";
    private static final List<Todo> todos = new ArrayList<>();
    private static int nextId = 1;

    static class Todo {
        int id;
        String content;
        boolean done;
        LocalDate createdDate;

        Todo(int id, String content, boolean done, LocalDate createdDate) {
            this.id = id;
            this.content = content;
            this.done = done;
            this.createdDate = createdDate;
        }
    }

    static void addTodo(String content) {
        Todo t = new Todo(nextId++, content, false, LocalDate.now());
        todos.add(t);
        System.out.println("已添加：" + t.id + " " + t.content);
    }

    static void listTodos() {
        System.out.println("=== 待办清单 ===");
        for (Todo t : todos) {
            System.out.println(String.format("[%s] %d. %s  (%s)",
                t.done ? "x" : " ", t.id, t.content, t.createdDate));
        }
    }

    static void completeTodo(int id) {
        for (Todo t : todos) {
            if (t.id == id) {
                t.done = true;
                System.out.println("已完成：" + t.id + " " + t.content);
                return;
            }
        }
        System.out.println("找不到 id = " + id + " 的事项");
    }

    static void saveToFile() {
        try (BufferedWriter writer = new BufferedWriter(new FileWriter(FILE))) {
            for (Todo t : todos) {
                writer.write(t.id + "|" + t.content + "|" + t.done + "|" + t.createdDate);
                writer.newLine();
            }
            System.out.println("已保存 " + todos.size() + " 条到文件");
        } catch (IOException e) {
            System.out.println("保存失败：" + e.getMessage());
        }
    }

    static void loadFromFile() {
        File file = new File(FILE);
        if (!file.exists()) {
            System.out.println("暂无历史记录");
            return;
        }
        try (BufferedReader reader = new BufferedReader(new FileReader(file))) {
            String line;
            while ((line = reader.readLine()) != null) {
                if (line.trim().isEmpty()) continue;
                String[] p = line.split("\\\\|");
                todos.add(new Todo(
                    Integer.parseInt(p[0]),
                    p[1],
                    Boolean.parseBoolean(p[2]),
                    LocalDate.parse(p[3])
                ));
                nextId = Math.max(nextId, Integer.parseInt(p[0]) + 1);
            }
            System.out.println("已读取 " + todos.size() + " 条记录");
        } catch (IOException e) {
            System.out.println("读取失败：" + e.getMessage());
        }
    }

    public static void main(String[] args) {
        addTodo("学完 Java 集合");
        addTodo("写控制台项目");
        addTodo("开始 Android");
        completeTodo(1);
        listTodos();
        saveToFile();

        todos.clear();
        System.out.println("=== 重新读取后 ===");
        loadFromFile();
        listTodos();
    }
}`
      }
    ],
    checklist: ['会用 StringBuilder 和 String.format', '能读写文本文件', '看得懂 JSON 结构', '完成了记事本练习']
  }
];
