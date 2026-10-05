/* 课程内容 · Java 深挖（第 14 章 IO 流与文件处理） */
window.COURSE_JAVA_PART6 = [
  {
    id: 'j14',
    title: 'IO 流与文件处理（深入）',
    minutes: 120,
    tags: ['IO', '字节流', '字符流', '缓冲流', '序列化', 'NIO'],
    goals: [
      '说清字节流与字符流的区别，能根据场景选对',
      '掌握 FileInputStream/FileOutputStream、FileReader/FileWriter 的读写套路',
      '会用缓冲流按行处理大文件，并知道为什么要用缓冲',
      '能用转换流显式指定编码，从根源上解决中文乱码',
      '会用数据流与对象序列化保存结构化数据',
      '会用 File / Path / Files 完成文件管理，并说出常见坑'
    ],
    lessons: [
      { t: 'p', text: '**IO = Input / Output**，也就是程序与外部世界（文件、网络、键盘）交换数据。Java 把所有数据交换抽象成“流”：数据像水流一样从一端流向另一端。记住一个关键点：**输入流和输出流是相对你的程序而言的**——程序读文件叫输入，程序写文件叫输出。' },
      { t: 'h', text: '1. 四大基类：一张表看清 IO 体系' },
      { t: 'table', head: ['分类', '输入流（读）', '输出流（写）', '数据单位', '适合处理'], rows: [
        ['字节流', 'InputStream', 'OutputStream', 'byte（1 字节）', '图片、视频、压缩包、任何二进制文件'],
        ['字符流', 'Reader', 'Writer', 'char（1 字符）', '文本文件（.txt/.java/.csv），自动处理编码']
      ]},
      { t: 'p', text: '这四个都是**抽象类**，不能直接 new，实际用的是它们的子类。下面是必须记住的常用实现：' },
      { t: 'table', head: ['用途', '字节流', '字符流'], rows: [
        ['读写文件', 'FileInputStream / FileOutputStream', 'FileReader / FileWriter'],
        ['加缓冲（提速）', 'BufferedInputStream / BufferedOutputStream', 'BufferedReader / BufferedWriter'],
        ['字节 ↔ 字符转换', 'InputStreamReader / OutputStreamWriter', '（同左，用于指定编码）'],
        ['读写基本类型', 'DataInputStream / DataOutputStream', '—'],
        ['读写对象', 'ObjectInputStream / ObjectOutputStream', '—'],
        ['操作内存数组', 'ByteArrayInputStream / ByteArrayOutputStream', 'CharArrayReader / CharArrayWriter'],
        ['打印格式', 'PrintStream（System.out 就是它）', 'PrintWriter']
      ]},
      { t: 'tip', text: '**选择口诀**：能看懂内容的文本用**字符流**，看不懂的二进制用**字节流**。拿不准就用字节流——字节流对任何文件都安全；但如果你要按行读文本，用 BufferedReader 才方便。' },
      { t: 'h', text: '2. 字节流：最底层、最通用' },
      { t: 'code', title: '逐字节复制文件（能跑通，但很慢）', code: `import java.io.FileInputStream;
import java.io.FileOutputStream;

/**
 * 演示：最原始的字节流读写。
 * 核心 API：read() 每次读 1 个字节并返回它的数值，读到文件末尾返回 -1。
 * 结论：功能能实现，但一个字节一个字节地读写性能很差，真实项目请用缓冲区写法。
 */
public class CopyByByte {
    public static void main(String[] args) throws Exception {
        // ---------- 第一步：先造一个测试文件（写字节） ----------
        // try (资源) { } 是 try-with-resources：括号里的流会在代码块结束时自动 close()，
        // 即使中间抛异常也会关，避免文件被占用或数据没写出去
        try (FileOutputStream out = new FileOutputStream("copy1.txt")) {
            // "Hello 中文".getBytes()：把字符串按平台默认编码转成 byte[]
            // out.write(byte[])：一次性把这个字节数组写进文件
            out.write("Hello 中文".getBytes());
        }   // 走到这里自动执行 out.close()

        // ---------- 第二步：把它读回来（读字节） ----------
        try (FileInputStream in = new FileInputStream("copy1.txt")) {
            StringBuilder sb = new StringBuilder();   // 用来拼装读到的内容
            int b;                                    // 必须是 int：因为要用 -1 表示"读完了"
            // read() 每次读 1 个字节，返回 0~255 的数值；到达末尾返回 -1
            while ((b = in.read()) != -1) {
                sb.append((char) b);                  // 把字节数值还原成字符，逐个拼接
            }
            System.out.println("读回：" + sb);        // 检查读出来的内容和写进去的一致
        }
    }
}` },
      { t: 'code', title: '用缓冲区批量读写（真实项目都这样写）', code: `import java.io.FileInputStream;
import java.io.FileOutputStream;

/**
 * 演示：用 byte[] 缓冲区批量读写。
 * 为什么快：一次向操作系统要 8 个字节，比连续要 8 次少了 7 次系统调用。
 * 真实项目缓冲区一般用 8192（8KB），正好是磁盘块大小的整数倍。
 */
public class CopyByBuffer {
    public static void main(String[] args) throws Exception {
        // ---------- 第一步：写入三行测试内容 ----------
        try (FileOutputStream out = new FileOutputStream("copy2.txt")) {
            // "\\n" 是换行符；getBytes() 把字符串转成字节数组再写入
            out.write("第一行\\n第二行\\n第三行\\n".getBytes());
        }

        // ---------- 第二步：用缓冲区读回来 ----------
        try (FileInputStream in = new FileInputStream("copy2.txt")) {
            byte[] buf = new byte[8];     // 缓冲区：一次最多装 8 个字节（实际项目常用 8192）
            int len;                      // 本次真正读到了几个字节
            int total = 0;                // 累计读到的总字节数
            StringBuilder sb = new StringBuilder();
            // read(buf)：把读到的字节填进 buf，返回实际读到的个数；返回 -1 表示文件读完
            while ((len = in.read(buf)) != -1) {
                total += len;             // 累加本次长度
                // new String(buf, 0, len)：只把本次读到的 len 个字节转成字符串
                // 不能写成 new String(buf)，否则会把上一轮的残留数据也带进来
                sb.append(new String(buf, 0, len));
            }
            System.out.println("内容：\\n" + sb);
            System.out.println("共 " + total + " 字节");
        }
    }
}` },
      { t: 'warn', text: '**流必须关闭**。不关会占着文件句柄、缓冲区里的数据也不会写出去。用 `try (资源) { ... }`（try-with-resources）让 Java 自动关闭，异常时也会关，这是唯一推荐的写法。' },
      { t: 'h', text: '3. 字符流与编码：中文乱码的根源就在这里' },
      { t: 'code', title: 'FileWriter / FileReader 基本用法', code: `import java.io.FileReader;
import java.io.FileWriter;

/**
 * 演示：字符流读写文本文件。
 * 字符流按"字符"处理数据，写中文不用自己算字节，比字节流方便。
 * 注意：FileWriter / FileReader 使用平台默认编码，跨平台可能乱码（见下一个示例）。
 */
public class CharStreamDemo {
    public static void main(String[] args) throws Exception {
        // ---------- 写 ----------
        // new FileWriter("note.txt")：默认"覆盖"，文件不存在会自动创建
        try (FileWriter w = new FileWriter("note.txt")) {
            w.write("第一行：你好\\n");          // \\n 表示换行
            w.write("第二行：Java IO\\n");
        }   // 自动 close()，数据在这里真正落盘

        // ---------- 读 ----------
        try (FileReader r = new FileReader("note.txt")) {
            int c;                              // 同样用 int 接收，-1 表示读完
            StringBuilder sb = new StringBuilder();
            // read() 每次读 1 个字符，返回字符的编码值
            while ((c = r.read()) != -1) {
                sb.append((char) c);            // 编码值还原成字符
            }
            System.out.println(sb);
        }
    }
}` },
      { t: 'warn', text: 'FileWriter / FileReader 使用**系统默认编码**（Windows 中文环境常是 GBK，Linux/macOS 是 UTF-8）。同一份代码在别人电脑上就乱码，问题就出在这里。**解决办法：用转换流显式指定 UTF-8**。' },
      { t: 'code', title: '转换流：显式指定 UTF-8（跨平台不乱码）', code: `import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.nio.charset.StandardCharsets;

/**
 * 演示：用转换流显式指定 UTF-8，这是解决中文乱码的标准做法。
 * 结构：字节流（真正读写文件） → 转换流（负责编码解码） → 缓冲/字符流（方便按行处理）。
 * 记忆：InputStreamReader = 字节 → 字符；OutputStreamWriter = 字符 → 字节。
 */
public class CharsetDemo {
    public static void main(String[] args) throws Exception {
        // ---------- 写：字符串 → 转换流 → 字节流 → 文件 ----------
        try (OutputStreamWriter w = new OutputStreamWriter(
                new FileOutputStream("u8.txt"), StandardCharsets.UTF_8)) {
            w.write("中文不会乱码\\n");
            w.write("第二行\\n");
        }

        // ---------- 读：文件 → 字节流 → 转换流 → 字符串 ----------
        try (InputStreamReader r = new InputStreamReader(
                new FileInputStream("u8.txt"), StandardCharsets.UTF_8)) {
            String line;
            int n = 0;
            // readLine() 需要"按行读"的能力，所以这里用到了它的 readLine（也可换成 BufferedReader 包一层）
            while ((line = r.readLine()) != null) {   // 读到末尾返回 null（不是 -1）
                n++;
                System.out.println(n + ": " + line);
            }
        }
    }
}` },
      { t: 'table', head: ['乱码现象', '原因', '解决'], rows: [
        ['文件里是“锟斤拷”', '用 GBK 读 UTF-8 文件', '读写两端都用 StandardCharsets.UTF_8'],
        ['拷贝到别人电脑乱码', '依赖了系统默认编码', '永远显式指定编码，不要依赖默认值'],
        ['写文件后一半内容没了', '没关流/没 flush', '用 try-with-resources 自动关闭']
      ]},
      { t: 'h', text: '4. 缓冲流：按行处理文本的标准姿势' },
      { t: 'code', title: 'BufferedReader 按行读 / BufferedWriter 按行写', code: `import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.FileReader;
import java.io.FileWriter;

/**
 * 演示：文本文件的标准读写姿势 —— 缓冲流 + 按行处理。
 * 为什么用 BufferedWriter：内部有 8192 字符的缓冲区，攒够一块再写盘，减少系统调用。
 * 为什么用 BufferedReader：提供 readLine()，一次拿一整行，处理文本最方便。
 */
public class LineIODemo {
    public static void main(String[] args) throws Exception {
        // ================= 一、写文件 =================
        try (BufferedWriter w = new BufferedWriter(new FileWriter("lines.txt"))) {
            w.write("第一行");     // write 只写内容，不换行
            w.newLine();          // 想要换行就显式调用 newLine()，跨平台安全（Windows 是 \\r\\n）
            w.write("第二行");
            w.newLine();
            w.write("第三行");
        }

        // ================= 二、按行读 + 统计 =================
        int lineCount = 0;            // 行数
        int charCount = 0;            // 字符数（不含换行符）
        String longest = "";          // 最长的一行

        try (BufferedReader r = new BufferedReader(new FileReader("lines.txt"))) {
            String line;
            // readLine() 每次返回一行（不含换行符），读到文件末尾返回 null
            while ((line = r.readLine()) != null) {
                lineCount++;                                   // 统计行数
                charCount += line.length();                    // 累加这一行的字符数
                if (line.length() > longest.length()) {        // 更新最长行
                    longest = line;
                }
            }
        }

        // ================= 三、输出结果 =================
        System.out.println("行数：" + lineCount);
        System.out.println("字符数：" + charCount);
        System.out.println("最长的行：" + longest);
    }
}` },
      { t: 'p', text: '为什么缓冲能快这么多？因为每次向操作系统要数据都要“系统调用”，开销很大。BufferedReader 内部有一个 8192 字符的数组，一次读一大块放进内存，之后的 readLine 都从内存里取——把这个思想用在写文件上就是 BufferedWriter。' },
      { t: 'tip', text: '**处理大文件的标准套路**：BufferedReader + readLine 一行一行处理，**永远不要把整个大文件一次读进内存**（比如 `Files.readAllLines` 在几百 MB 的文件上会直接把内存吃满）。' },
      { t: 'h', text: '5. 数据流与对象序列化：把结构化数据存下来' },
      { t: 'code', title: 'DataOutputStream / DataInputStream：按类型存基本数据', code: `import java.io.DataInputStream;
import java.io.DataOutputStream;
import java.io.FileInputStream;
import java.io.FileOutputStream;

/**
 * 演示：数据流 —— 按基本类型读写，而不是按字符。
 * 特点：写进去是二进制格式（int 固定 4 字节），所以文件更小、读取更快。
 * 铁律：写的时候按什么顺序、什么类型写，读的时候必须按完全相同的顺序和类型读。
 */
public class DataStreamDemo {
    public static void main(String[] args) throws Exception {
        // ---------- 写：按类型依次写入四条数据 ----------
        try (DataOutputStream out = new DataOutputStream(new FileOutputStream("order.bin"))) {
            out.writeInt(1001);          // 4 字节整数：订单号
            out.writeDouble(99.5);       // 8 字节浮点：金额
            out.writeUTF("小明");         // 先写长度再写 UTF-8 字节：字符串
            out.writeBoolean(true);      // 1 字节布尔：是否已支付
        }

        // ---------- 读：必须和写入顺序、类型完全一致 ----------
        try (DataInputStream in = new DataInputStream(new FileInputStream("order.bin"))) {
            System.out.println("订单号：" + in.readInt());
            System.out.println("金额：" + in.readDouble());
            System.out.println("客户：" + in.readUTF());
            System.out.println("已支付：" + in.readBoolean());
        }
    }
}` },
      { t: 'code', title: 'ObjectOutputStream：直接把对象写进文件', code: `import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.io.Serializable;

/**
 * 演示：对象序列化 —— 把整个对象（包括它的字段）写进文件，再原样读回来。
 * 前提：类必须实现 Serializable 接口（它是一个"标记接口"，没有任何方法要实现）。
 */
class User implements Serializable {
    private static final long serialVersionUID = 1L;   // 版本号：类改了它不变，旧文件仍能读出来
    String name;
    int age;
    transient String password;                          // transient：这个字段不参与序列化（密码不该落盘）

    User(String name, int age, String password) {
        this.name = name;
        this.age = age;
        this.password = password;
    }

    // 重写 toString，方便打印对象时看内容
    public String toString() {
        return name + "，" + age + " 岁，密码=" + password;
    }
}

public class ObjectStreamDemo {
    public static void main(String[] args) throws Exception {
        // ---------- 写对象 ----------
        try (ObjectOutputStream out = new ObjectOutputStream(new FileOutputStream("user.obj"))) {
            out.writeObject(new User("小明", 18, "123456"));   // 整个对象一次性写出
        }

        // ---------- 读对象 ----------
        try (ObjectInputStream in = new ObjectInputStream(new FileInputStream("user.obj"))) {
            // readObject() 返回的是 Object，需要强制转换成具体类型
            User u = (User) in.readObject();
            // 注意：password 加了 transient，所以读出来是 null
            System.out.println("反序列化得到：" + u);
        }
    }
}` },
      { t: 'table', head: ['序列化要点', '说明'], rows: [
        ['前提', '类必须 implements Serializable，否则抛 NotSerializableException'],
        ['serialVersionUID', '版本号。不写的话编译器会自动生成，类一改动就会导致旧文件反序列化失败'],
        ['transient', '修饰的字段不参与序列化（密码、缓存、连接对象等）'],
        ['static 字段', '属于类不属于对象，天然不参与序列化'],
        ['父类', '父类也必须可序列化，否则父类字段不会被保存'],
        ['安全提醒', '反序列化会执行类的构造逻辑，**不要反序列化不可信的数据**；敏感字段一定要 transient']
      ]},
      { t: 'h', text: '6. File 与 NIO.2：管理文件而不只是读写内容' },
      { t: 'code', title: 'File：判断、创建、列目录、删除', code: `import java.io.File;

/**
 * 演示：File 类 —— 只负责"路径与文件的管理"，不负责读写内容。
 * 常用能力：判断存在、创建目录/文件、取名字和路径、看大小、删除。
 */
public class FileDemo {
    public static void main(String[] args) throws Exception {
        // ① 目录：exists() 判断，mkdirs() 创建（会一次性创建多级目录）
        File dir = new File("data");
        System.out.println("目录存在？" + dir.exists());
        System.out.println("创建成功？" + dir.mkdirs());

        // ② 文件：用父目录 + 文件名拼接，比手写字符串更安全
        File f = new File(dir, "hello.txt");
        System.out.println("新建文件？" + f.createNewFile());   // 已存在则返回 false
        System.out.println("是文件？" + f.isFile() + "，是目录？" + f.isDirectory());
        System.out.println("文件名：" + f.getName());
        System.out.println("完整路径：" + f.getAbsolutePath());  // 排查"找不到文件"时必看
        System.out.println("长度：" + f.length() + " 字节");

        // ③ 删除：删除成功返回 true；文件被别的流占用时会返回 false
        System.out.println("删除：" + f.delete());
        System.out.println("删除后还存在？" + f.exists());
    }
}` },
      { t: 'code', title: 'NIO.2（Java 7+）：读写文件一行搞定', code: `import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

/**
 * 演示：NIO.2 的 Files 工具类 —— 新代码优先用它，代码短且不容易出错。
 * Path.of("a/b.txt") 表示路径；Files.xxx(...) 提供各种"一行搞定"的文件操作。
 */
public class NioDemo {
    public static void main(String[] args) throws IOException {
        Path path = Path.of("nio.txt");

        // 一行写文件（默认 UTF-8，覆盖写入）
        Files.writeString(path, "第一行\\n第二行\\n第三行\\n");

        // 判断是否存在、查看大小（字节）
        System.out.println("存在？" + Files.exists(path) + "，大小：" + Files.size(path));

        // 一次性读成字符串；trim() 去掉末尾换行，replace 把换行替换成 " | " 便于单行显示
        System.out.println("全读：" + Files.readString(path).trim().replace("\\n", " | "));

        // 按行读成 List<String>（适合行数不多的场景；超大文件请用 BufferedReader 逐行处理）
        List<String> lines = Files.readAllLines(path);
        System.out.println("行数：" + lines.size());

        // 复制文件与删除文件，都有现成方法
        Files.copy(path, Path.of("nio-copy.txt"));
        System.out.println("复制成功，副本行数：" + Files.readAllLines(Path.of("nio-copy.txt")).size());
        System.out.println("删除副本：" + Files.deleteIfExists(Path.of("nio-copy.txt")));
    }
}` },
      { t: 'table', head: ['对比', '老 IO（java.io）', 'NIO.2（java.nio.file）'], rows: [
        ['文件路径', 'File', 'Path（Path.of("a/b.txt")）'],
        ['一行读文件', '得自己 new BufferedReader 再循环', 'Files.readString / readAllLines'],
        ['一行写文件', '得自己 new BufferedWriter', 'Files.writeString'],
        ['复制/删除', '自己写流 + delete()', 'Files.copy / Files.deleteIfExists'],
        ['异常', '多数抛 IOException（检查型）', '同样抛 IOException'],
        ['选择建议', '老项目、需要兼容 Java 6', '**新代码优先用 NIO.2**，代码短且不易出错']
      ]},
      { t: 'h', text: '7. 标准输入输出流' },
      { t: 'code', title: 'System.in / System.out / System.err', code: `import java.io.BufferedReader;
import java.io.InputStreamReader;

/**
 * 演示：三个标准流。
 * System.out  → 标准输出（正常信息），类型是 PrintStream
 * System.err  → 标准错误（异常信息），也输出到控制台，但可以单独重定向
 * System.in   → 标准输入（键盘），它是"字节流"，读文本要包一层转换流
 */
public class StandardIODemo {
    public static void main(String[] args) throws Exception {
        System.out.println("out：普通信息（标准输出）");
        System.err.println("err：错误信息（标准错误）");

        // System.in 是字节流，套一层 InputStreamReader 变成字符流，再套 BufferedReader 以支持按行读
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        System.out.println("（这个示例不需要输入，只是演示流的包装层次）");
        System.out.println("换行符长度：" + System.lineSeparator().length());

        // 用完要关闭：它同时会关闭底层的 System.in
        br.close();
    }
}` },
      { t: 'tip', text: '平时做控制台程序，用 `Scanner sc = new Scanner(System.in)` 最省事；要按行高效读取大量输入时，`BufferedReader + readLine` 更快。' },
      { t: 'h', text: '8. 实战：写一个文件工具类' },
      { t: 'code', title: 'FileUtil：复制、追加、读取、统计', code: `import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.FileReader;
import java.io.FileWriter;
import java.util.ArrayList;
import java.util.List;

/**
 * 实战：把常用文件操作封装成工具类。
 * 设计要点：
 * 1) 方法都是 static，直接 FileUtil.xxx() 调用；
 * 2) 每个方法内部 try-with-resources，保证流一定关闭；
 * 3) 捕获异常后打印提示，不让调用方因为 IO 问题直接崩掉。
 */
public class FileUtil {

    /** 追加一行（文件不存在会自动创建） */
    public static void appendLine(String path, String line) {
        // FileWriter 第二个参数 true 表示"追加"；不传就是覆盖
        try (BufferedWriter w = new BufferedWriter(new FileWriter(path, true))) {
            w.write(line);
            w.newLine();          // 换行，跨平台安全
        } catch (Exception e) {
            System.out.println("写入失败：" + e.getMessage());
        }
    }

    /** 读取所有行 */
    public static List<String> readLines(String path) {
        List<String> list = new ArrayList<>();
        try (BufferedReader r = new BufferedReader(new FileReader(path))) {
            String line;
            while ((line = r.readLine()) != null) {   // 读到末尾返回 null
                list.add(line);
            }
        } catch (Exception e) {
            System.out.println("读取失败：" + e.getMessage());
        }
        return list;
    }

    /** 统计：行数、字符数（不含空格）、单词数 */
    public static void statistics(String path) {
        List<String> lines = readLines(path);
        int chars = 0;
        int words = 0;
        for (String line : lines) {
            chars += line.replace(" ", "").length();          // 去掉空格再数长度
            if (!line.trim().isEmpty()) {                     // 空行不计入单词统计
                words += line.trim().split("\\\\s+").length;    // 按空白拆分，\\\\s+ 表示一个或多个空白
            }
        }
        System.out.println("行数：" + lines.size());
        System.out.println("字符数（不含空格）：" + chars);
        System.out.println("单词数：" + words);
    }

    public static void main(String[] args) {
        // 先写入三行测试数据
        appendLine("log.txt", "Java IO 第一行");
        appendLine("log.txt", "second line here");
        appendLine("log.txt", "第三行 also has words");

        // 再读出来打印
        System.out.println("读取到的内容：");
        for (String line : readLines("log.txt")) {
            System.out.println("  " + line);
        }

        // 最后做统计
        System.out.println("--- 统计 ---");
        statistics("log.txt");
    }
}` },
      { t: 'h', text: '9. 常见坑与排查表' },
      { t: 'table', head: ['现象', '原因', '解决'], rows: [
        ['FileNotFoundException', '路径写错、目录不存在、用了相对路径但工作目录不对', '先 Files.exists 判断，或打印 getAbsolutePath 看实际路径'],
        ['中文乱码', '读写两端编码不一致 / 依赖默认编码', '统一 StandardCharsets.UTF_8'],
        ['写了大半没写进去', '忘了 close/flush', '用 try-with-resources'],
        ['文件被覆盖了', 'FileWriter 默认覆盖；要追加得传 true', 'new FileWriter(path, true)'],
        ['OutOfMemoryError 读文件', 'readAllLines / readAllBytes 一次全读进内存', '改成 BufferedReader 按行处理'],
        ['Windows 上路径报错', '用了转义字符，如 "C:\\new"', '用 String path = "C:/new/a.txt" 或 Path.of("C:", "new", "a.txt")'],
        ['delete 返回 false', '文件被别的流占用（没关）、或没有权限', '确认所有流都已关闭，再删'],
        ['序列化报 NotSerializableException', '类没有实现 Serializable（或字段的类型不可序列化）', '实现 Serializable，给不可序列化的字段加 transient']
      ]},
      { t: 'list', items: [
        '**性能三条**：① 用缓冲流；② 大文件按行处理，不要全读进内存；③ 复制文件用 byte[8192] 缓冲区批量读写，不要一个字节一个字节读',
        '**安全两条**：① 不要反序列化不可信数据；② 密码等敏感字段加 transient',
        '**工程习惯**：所有流都用 try-with-resources；编码统一 UTF-8；路径用 Path.of 拼接，不要手写字符串拼接',
        '**调试技巧**：读写异常时，先打印 `file.getAbsolutePath()` 和 `Files.exists()`，多数“找不到文件”都是路径问题'
      ]},
      { t: 'tip', text: '学完这一章，你已经能写出“配置读写、日志、数据导入导出”这类真实功能了。下一章我们深入集合框架，把数据在内存里管得又快又清楚。' }
    ],
    quiz: [
      { q: '要按行读写一个 .txt 文本文件，最适合用？', options: ['FileInputStream / FileOutputStream', 'BufferedReader / BufferedWriter', 'DataInputStream', 'ObjectOutputStream'], answer: 1, explain: '字符流专门处理文本，BufferedReader 提供 readLine 按行读；字节流更适合图片、视频等二进制文件。' },
      { q: 'BufferedReader 的 readLine() 读到文件末尾时返回？', options: ['空字符串 ""', 'null', '-1', '抛出异常'], answer: 1, explain: '读到末尾返回 null，所以标准写法是 while ((line = r.readLine()) != null)。字节流的 read() 才是返回 -1。' },
      { q: 'try (BufferedWriter w = new BufferedWriter(new FileWriter("a.txt"))) { ... } 这种写法的好处是？', options: ['写得更快', '自动关闭资源，异常时也会关闭', '自动创建目录', '自动解决乱码'], answer: 1, explain: 'try-with-resources 会在代码块结束时（包括发生异常时）自动调用 close()，避免忘记关流导致数据没写出去或文件被占用。' },
      { q: '想让 FileWriter 追加内容而不是覆盖，构造器的第二个参数应该传？', options: ['false', 'true', '1', '"append"'], answer: 1, explain: 'new FileWriter(path, true) 表示追加；不传或传 false 会清空原文件。' },
      { q: '写出去的中文在别的电脑上变成乱码，最可能的原因是？', options: ['Java 不支持中文', '读写两端使用了不同的字符编码（例如依赖了系统默认编码）', '文件太大', '没有用缓冲流'], answer: 1, explain: '乱码几乎都是编码不匹配：写入用 UTF-8、读取用 GBK 就会乱。工程上一律显式指定 StandardCharsets.UTF_8。' },
      { q: '把一个对象写进文件（序列化）的前提是？', options: ['类必须实现 Serializable', '类必须是 public', '对象必须有 toString', '字段必须是 public'], answer: 0, explain: '类必须 implements Serializable，否则抛 NotSerializableException；不想被序列化的字段加 transient。' },
      { q: '复制一个 200MB 的文件，下面哪种写法最合适？', options: ['用 readAllBytes 一次读进内存再写出', '用 FileInputStream + byte[8192] 缓冲区循环读写', '用 readLine 一行行读', '用 ObjectOutputStream'], answer: 1, explain: '二进制用字节流 + 缓冲区；一次性读进内存容易 OOM，readLine 是给文本用的。' }
    ],
    exercises: [
      {
        id: 'ex-j14-1',
        title: '练习 1：日志工具 LogUtil（追加写 + 读取统计）',
        level: '中等',
        brief: '做一个迷你日志系统：写日志时追加到文件末尾，读日志时按行读回来，支持「查看最近 N 条」和统计总行数。',
        requirements: [
          'log(String level, String message)：追加写入 "[级别] 消息" 并换行，文件不存在要能自动创建',
          'readAll()：按行读取全部日志，返回 List<String>',
          'printLast(int n)：只打印最后 n 条（不足 n 条时全部打印）',
          'main 中先删除旧日志文件（保证多次运行结果一致），再写入 5 条：INFO/INFO/WARN/ERROR/INFO',
          '最后打印「最近 3 条日志」和「日志总行数」',
          '所有流都用 try-with-resources 关闭'
        ],
        starter: `import java.io.*;
import java.util.*;

public class LogUtil {
    private static final String FILE = "app.log";

    // TODO: log / readAll / printLast

    public static void main(String[] args) {
        // TODO: 删除旧文件 → 写 5 条 → 打印最近 3 条和总行数
    }
}`,
        expectedOutput: `最近 3 条日志：
[WARN] 磁盘空间不足 10%
[ERROR] 数据库连接失败
[INFO] 程序退出
日志总行数：5`,
        keyPoints: [
          { label: '追加写用了 FileWriter(path, true)', test: 'new\\s+FileWriter\\s*\\([^)]*,\\s*true' },
          { label: '用 BufferedWriter 写文件', test: 'BufferedWriter' },
          { label: 'readLine 循环读到 null', test: 'while\\s*\\(\\s*\\(\\s*\\w+\\s*=\\s*\\w+\\.readLine\\s*\\(\\s*\\)\\s*\\)\\s*!=\\s*null' },
          { label: '用 try-with-resources 关闭流', test: 'try\\s*\\(\\s*(BufferedWriter|BufferedReader)' },
          { label: 'printLast 用 Math.max 计算起点', test: 'Math\\.max\\s*\\(' },
          { label: 'main 中先删除旧文件', test: 'delete\\s*\\(\\s*\\)' }
        ],
        hints: [
          '追加写：new BufferedWriter(new FileWriter(FILE, true))；覆盖写就不传 true',
          '读全部：while ((line = r.readLine()) != null) list.add(line);',
          '最后 n 条：int start = Math.max(0, list.size() - n); 再从 start 循环到 size',
          '要保证每次运行结果一样，可以在 main 开头 new File(FILE).delete();'
        ],
        solution: `import java.io.*;
import java.util.*;

public class LogUtil {
    private static final String FILE = "app.log";

    public static void log(String level, String message) {
        try (BufferedWriter w = new BufferedWriter(new FileWriter(FILE, true))) {
            w.write("[" + level + "] " + message);
            w.newLine();
        } catch (IOException e) {
            System.out.println("写入失败：" + e.getMessage());
        }
    }

    public static List<String> readAll() {
        List<String> lines = new ArrayList<>();
        try (BufferedReader r = new BufferedReader(new FileReader(FILE))) {
            String line;
            while ((line = r.readLine()) != null) {
                lines.add(line);
            }
        } catch (IOException e) {
            System.out.println("读取失败：" + e.getMessage());
        }
        return lines;
    }

    public static void printLast(int n) {
        List<String> lines = readAll();
        int start = Math.max(0, lines.size() - n);
        for (int i = start; i < lines.size(); i++) {
            System.out.println(lines.get(i));
        }
    }

    public static void main(String[] args) {
        new File(FILE).delete();      // 清掉上次的记录，保证结果可复现

        log("INFO", "程序启动");
        log("INFO", "加载配置完成");
        log("WARN", "磁盘空间不足 10%");
        log("ERROR", "数据库连接失败");
        log("INFO", "程序退出");

        System.out.println("最近 3 条日志：");
        printLast(3);
        System.out.println("日志总行数：" + readAll().size());
    }
}`
      },
      {
        id: 'ex-j14-2',
        title: '练习 2：文本转换器（读 → 转换 → 写 → 统计）',
        level: '中等',
        brief: '把源文件按行读出来，转成大写写到新文件，再读回新文件做统计并打印。这是“数据导入 → 加工 → 导出”的最小完整流程。',
        requirements: [
          '用 Files.writeString 先造一个测试文件 input.txt，内容为三行：hello world / Java IO 很简单 / third line',
          '用 Files.readAllLines 按行读取，逐行转成大写，用 BufferedWriter 写到 output.txt（每行都要 newLine）',
          '读写都要显式使用 StandardCharsets.UTF_8',
          '再用 BufferedReader 读回 output.txt 统计：行数、字符数（不含空格）、单词数（按空白拆分，空行不计）',
          '先打印转换后的内容，再打印三行统计结果'
        ],
        starter: `import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;

public class TextProcessor {
    public static void main(String[] args) throws IOException {
        Path in = Path.of("input.txt");
        Path out = Path.of("output.txt");

        // TODO: 造数据 → 转换写文件 → 读回统计
    }
}`,
        expectedOutput: `转换后的内容：
HELLO WORLD
JAVA IO 很简单
THIRD LINE
行数：3
字符数（不含空格）：28
单词数：7`,
        keyPoints: [
          { label: '用 Files.writeString 造测试数据', test: 'Files\\.writeString' },
          { label: '用 Files.readAllLines 按行读', test: 'Files\\.readAllLines' },
          { label: '写文件用了 BufferedWriter 且每行 newLine', test: 'BufferedWriter[\\s\\S]*newLine' },
          { label: '显式指定了 UTF_8 编码', test: 'StandardCharsets\\.UTF_8' },
          { label: '用 toUpperCase 转换', test: 'toUpperCase\\s*\\(\\s*\\)' },
          { label: '统计时用 split 拆分单词', test: 'split\\s*\\(\\s*"' }
        ],
        hints: [
          '写：try (BufferedWriter w = Files.newBufferedWriter(out, StandardCharsets.UTF_8)) { ... }',
          '读：Files.readAllLines(in, StandardCharsets.UTF_8) 返回 List<String>',
          '统计字符数不要算空格：line.replace(" ", "").length()',
          '统计单词前先判断空行：if (!line.trim().isEmpty()) words += line.trim().split("\\\\s+").length;'
        ],
        solution: `import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;

public class TextProcessor {
    public static void main(String[] args) throws IOException {
        Path in = Path.of("input.txt");
        Path out = Path.of("output.txt");

        Files.writeString(in, "hello world\\nJava IO 很简单\\nthird line\\n", StandardCharsets.UTF_8);

        try (BufferedWriter w = Files.newBufferedWriter(out, StandardCharsets.UTF_8)) {
            for (String line : Files.readAllLines(in, StandardCharsets.UTF_8)) {
                w.write(line.toUpperCase());
                w.newLine();
            }
        }

        int lines = 0;
        int chars = 0;
        int words = 0;
        try (BufferedReader r = Files.newBufferedReader(out, StandardCharsets.UTF_8)) {
            String line;
            while ((line = r.readLine()) != null) {
                lines++;
                chars += line.replace(" ", "").length();
                if (!line.trim().isEmpty()) {
                    words += line.trim().split("\\\\s+").length;
                }
            }
        }

        System.out.println("转换后的内容：");
        System.out.println(Files.readString(out, StandardCharsets.UTF_8).trim());
        System.out.println("行数：" + lines);
        System.out.println("字符数（不含空格）：" + chars);
        System.out.println("单词数：" + words);
    }
}`
      }
    ],
    checklist: ['能说出字节流和字符流各自适合什么', '会写 try-with-resources 读写文件', '知道中文乱码怎么解决', '能按行读取大文件并统计', '会序列化对象到文件']
  }
];



