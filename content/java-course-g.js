/* 课程内容 · Java 深挖（第 15 章 集合框架与底层原理） */
window.COURSE_JAVA_PART7 = [
  {
    id: 'j15',
    title: '集合框架与底层原理（深入）',
    minutes: 120,
    tags: ['集合', 'ArrayList', 'HashMap', 'HashSet', 'equals', '排序'],
    goals: [
      '画出 Collection 与 Map 两条继承线，说清每种实现的底层结构',
      '知道 ArrayList 与 LinkedList 的差别，能在真实场景里选对',
      '理解 HashMap 的哈希、扩容、链表转红黑树，并会用 Map 做统计',
      '能背下 equals 与 hashCode 的契约，并正确重写',
      '会用 Comparable / Comparator 完成多字段排序',
      '会正确地在遍历中删除元素，知道 fail-fast 是什么'
    ],
    lessons: [
      { t: 'p', text: '集合是 Java 里使用频率最高的工具：只要数据多于一个、数量还会变，就该用集合。这一章不只讲“怎么用”，更要讲“**为什么这样设计**”——底层结构决定了什么时候快、什么时候慢，这也是面试最爱问的部分。' },
      { t: 'h', text: '1. 一张表看完整个集合体系' },
      { t: 'table', head: ['接口', '常用实现', '底层结构', '有序性', '允许重复', '线程安全', '查/增删特点'], rows: [
        ['List', 'ArrayList', '动态数组', '按插入顺序', '允许', '否', '查快（下标 O(1)），中间增删 O(n)'],
        ['List', 'LinkedList', '双向链表', '按插入顺序', '允许', '否', '头尾增删 O(1)，按下标查 O(n)'],
        ['Set', 'HashSet', '哈希表', '不保证顺序', '不允许', '否', '增删查平均 O(1)'],
        ['Set', 'LinkedHashSet', '哈希表 + 链表', '保持插入顺序', '不允许', '否', '比 HashSet 略慢'],
        ['Set', 'TreeSet', '红黑树', '自动升序', '不允许', '否', '增删查 O(log n)'],
        ['Map', 'HashMap', '数组 + 链表 + 红黑树', '不保证顺序', 'key 不重复', '否', '增删查平均 O(1)'],
        ['Map', 'LinkedHashMap', '哈希表 + 链表', '保持插入顺序', 'key 不重复', '否', '常用于 LRU 缓存'],
        ['Map', 'TreeMap', '红黑树', '按 key 排序', 'key 不重复', '否', '可做排行榜、范围查询'],
        ['Queue', 'ArrayDeque', '循环数组', '先进先出', '允许', '否', '做栈/队列都比 LinkedList 快'],
        ['并发', 'ConcurrentHashMap / CopyOnWriteArrayList', '分段/CAS 或写时复制', '不保证', '视实现', '**是**', '多线程环境专用']
      ]},
      { t: 'tip', text: '记忆法：**List 看下标、Set 去重、Map 查表**。三者底层分别是数组、哈希表、哈希表；需要排序就用带 Tree 的版本。' },
      { t: 'h', text: '2. List：ArrayList 与 LinkedList 的真正区别' },
      { t: 'code', title: 'ArrayList 常用操作', code: `import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * 演示：ArrayList 的增删改查。
 * 记住两点：① 下标从 0 开始；② List 有序、可重复，按下标访问最快（O(1)）。
 */
public class ArrayListDemo {
    public static void main(String[] args) {
        // 声明用接口 List，创建用实现类 ArrayList —— 这是最常见的写法
        List<String> list = new ArrayList<>();

        // ---------- 增 ----------
        list.add("Java");                      // 追加到末尾
        list.add("Android");
        list.add(1, "Kotlin");                 // 插到下标 1（后面的元素整体后移）
        System.out.println(list);              // [Java, Kotlin, Android]

        // ---------- 查 ----------
        System.out.println("大小：" + list.size() + "，第 0 个：" + list.get(0));
        System.out.println("包含 Kotlin？" + list.contains("Kotlin") + "，位置：" + list.indexOf("Kotlin"));

        // ---------- 改 ----------
        list.set(0, "Java 基础");               // set 是替换，不是插入
        System.out.println("替换后：" + list);

        // ---------- 删 ----------
        // 注意：remove(下标) 和 remove(元素) 是两个不同的重载！
        list.remove("Android");                // 按元素删
        list.remove(0);                        // 按下标删
        System.out.println("删除后：" + list);

        // ---------- 批量操作：并集 / 交集 / 差集 ----------
        List<String> a = new ArrayList<>(Arrays.asList("x", "y", "z"));
        List<String> b = new ArrayList<>(Arrays.asList("y", "z", "w"));

        List<String> union = new ArrayList<>(a);   // 先复制一份，避免改动原集合
        union.addAll(b);                           // 并集：把 b 的所有元素加进来
        System.out.println("并集：" + union);

        List<String> same = new ArrayList<>(a);
        same.retainAll(b);                         // 交集：只保留 b 里也有的元素
        System.out.println("交集：" + same);

        List<String> diff = new ArrayList<>(a);
        diff.removeAll(b);                         // 差集：删掉 b 里出现过的元素
        System.out.println("差集：" + diff);
    }
}` },
      { t: 'table', head: ['操作', 'ArrayList', 'LinkedList', '结论'], rows: [
        ['get(i) 随机访问', 'O(1) 直接算地址', 'O(n) 从头遍历', 'ArrayList 快'],
        ['add(e) 末尾追加', 'O(1) 均摊', 'O(1)', '差不多'],
        ['add(0, e) 头部插入', 'O(n) 后面元素全部后移', 'O(1) 只改指针', 'LinkedList 快'],
        ['remove(0)', 'O(n) 后面元素前移', 'O(1)', 'LinkedList 快'],
        ['内存占用', '少（只有数组 + 少量冗余）', '多（每个元素多两个指针）', 'ArrayList 省'],
        ['缓存友好度', '高（连续内存）', '低（节点分散）', 'ArrayList 实际更快']
      ]},
      { t: 'code', title: 'ArrayList 的扩容机制（为什么建议预设容量）', code: `import java.util.ArrayList;

/**
 * 演示：ArrayList 的容量与扩容。
 * 1) 默认容量是 10，装满了会扩容成原来的 1.5 倍，并把旧数组整体复制过去；
 * 2) 扩容是"隐性成本"，能预估数量时直接指定容量可以避免反复复制；
 * 3) size() 是"元素个数"，容量是"内部数组长度"，两者不是一回事。
 */
public class GrowDemo {
    public static void main(String[] args) {
        // 默认容量 10：不写参数时内部数组先给一个空数组，第一次 add 才扩到 10
        ArrayList<Integer> list = new ArrayList<>();
        for (int i = 1; i <= 3; i++) {
            list.add(i);        // 每次 add 都可能触发扩容（元素超过 容量 × 1 时）
        }
        System.out.println("依次添加后：" + list + "，大小 " + list.size());

        // 已知要放很多元素时，直接指定初始容量，避免反复扩容复制
        ArrayList<Integer> big = new ArrayList<>(1000000);
        // 注意：容量 ≠ 元素个数，这里还没有放任何元素，所以大小是 0
        System.out.println("预设容量后大小还是：" + big.size() + "（容量不等于元素个数）");
    }
}` },
      { t: 'warn', text: '**ArrayList 扩容是 1.5 倍**（`oldCapacity + (oldCapacity >> 1)`），每次扩容都要复制整个数组，所以能预估大小时一定用 `new ArrayList<>(预计容量)`。另外，`List.of(...)` 创建的是**不可变集合**，add/remove 会抛 UnsupportedOperationException。' },
      { t: 'h', text: '3. Set：去重与顺序的三兄弟' },
      { t: 'code', title: 'HashSet / LinkedHashSet / TreeSet 输出顺序对比', code: `import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.TreeSet;

/**
 * 演示：三种 Set 的唯一区别是"顺序"。
 * HashSet       —— 按哈希值存放，不保证顺序，性能最好；
 * LinkedHashSet —— 额外维护一条链表，保持"插入顺序"；
 * TreeSet       —— 底层红黑树，自动按大小排序（元素必须可比较）。
 * 三者都会自动去重（重复元素加不进去）。
 */
public class SetDemo {
    public static void main(String[] args) {
        // 故意让 "apple" 重复出现，验证去重效果
        List<String> data = List.of("banana", "apple", "cherry", "apple");

        Set<String> hash = new HashSet<>(data);          // 构造器可以直接接收一个集合来初始化
        Set<String> linked = new LinkedHashSet<>(data);
        Set<String> tree = new TreeSet<>(data);

        System.out.println("HashSet: " + hash);
        System.out.println("LinkedHashSet: " + linked);
        System.out.println("TreeSet: " + tree);
        System.out.println("去重后个数都是：" + hash.size());

        // ---------- 集合运算：并集 / 交集 / 差集 ----------
        Set<String> a = new HashSet<>(List.of("x", "y", "z"));
        Set<String> b = new HashSet<>(List.of("y", "z", "w"));

        Set<String> union = new HashSet<>(a);   // 复制 a
        union.addAll(b);                        // 并集
        Set<String> inter = new HashSet<>(a);
        inter.retainAll(b);                     // 交集：只留两边都有的
        Set<String> diff = new HashSet<>(a);
        diff.removeAll(b);                      // 差集：a 有 b 没有

        // 用 TreeSet 再包一层，是为了让输出有固定顺序，方便对比
        System.out.println("并集：" + new TreeSet<>(union));
        System.out.println("交集：" + new TreeSet<>(inter));
        System.out.println("差集：" + new TreeSet<>(diff));
    }
}` },
      { t: 'tip', text: 'Set 去重的本质是**哈希表**：往里放元素时先算 hashCode 找到桶，再用 equals 判断是否已存在。所以自定义对象要参与去重，必须**同时重写 equals 和 hashCode**。' },
      { t: 'h', text: '4. Map：哈希表到底怎么工作' },
      { t: 'p', text: 'HashMap 的内部结构可以这样理解：外层是一个**数组**（叫 table，长度总是 2 的幂），数组每个格子里挂一条**链表**；当一个格子里的链表太长（长度 ≥ 8）并且数组长度 ≥ 64 时，链表会转成**红黑树**，把查找从 O(n) 优化到 O(log n)。' },
      { t: 'code', title: '存一个 key 发生了什么（哈希计算过程）', code: `import java.util.HashMap;
import java.util.Map;

/**
 * 演示：HashMap 存一个 key 时内部做了什么。
 * 三步走：① 取 key 的 hashCode；② 做扰动运算让低位更随机；③ 用 (n-1) & hash 定位数组下标。
 * 为什么要扰动：数组下标只取低位，如果 hashCode 本身低位重复率高，就会大量冲突。
 */
public class HashDemo {
    public static void main(String[] args) {
        Map<String, Integer> map = new HashMap<>();
        map.put("apple", 10);

        // ① 计算 key 的 hashCode（String 的哈希是按字符累加算出来的）
        int h = "apple".hashCode();
        System.out.println("hashCode：" + h);

        // ② 扰动运算：高 16 位与低 16 位异或，让低位包含高位信息
        int spread = h ^ (h >>> 16);
        System.out.println("扰动后：" + spread);

        // ③ 定位数组下标：n 是数组长度（默认 16，且永远是 2 的幂）
        // 因为 n 是 2 的幂，(n-1) & hash 等价于 hash % n，但位运算更快
        int n = 16;
        System.out.println("数组下标：" + ((n - 1) & spread));

        // 最后验证数据确实存进去了
        System.out.println("map 里存了：" + map.get("apple"));
    }
}` },
      { t: 'code', title: 'Map 常用 API 与三种遍历方式', code: `import java.util.HashMap;
import java.util.Map;

/**
 * 演示：HashMap 的常用方法与三种遍历方式。
 * 核心特点：key 不能重复，重复 put 会覆盖旧值；key 和 value 都必须用引用类型（基本类型要装箱）。
 */
public class MapDemo {
    public static void main(String[] args) {
        Map<String, Integer> score = new HashMap<>();

        // ---------- 增 / 改：put ----------
        score.put("小明", 88);
        score.put("小红", 95);
        score.put("小刚", 77);
        score.put("小明", 92);                  // key 已存在 → 覆盖旧值
        score.putIfAbsent("小李", 60);           // 只有 key 不存在时才放（Java 8+）

        // ---------- 查 ----------
        System.out.println("小明的分数：" + score.get("小明"));
        // getOrDefault：key 不存在时返回默认值，比 get + 判空更简洁
        System.out.println("小张的分数（默认 0）：" + score.getOrDefault("小张", 0));
        System.out.println("是否包含小红：" + score.containsKey("小红") + "，大小：" + score.size());

        // ---------- 遍历一：entrySet（推荐，一次拿到 key 和 value） ----------
        for (Map.Entry<String, Integer> e : score.entrySet()) {
            System.out.println(e.getKey() + " => " + e.getValue());
        }

        // ---------- 遍历二：keySet（先拿 key，再回表查 value） ----------
        for (String name : score.keySet()) {
            System.out.println(name + "：" + score.get(name));
        }

        // ---------- 遍历三：forEach + lambda（Java 8+，最简洁） ----------
        score.forEach((name, s) -> System.out.println("lambda: " + name + "=" + s));
    }
}` },
      { t: 'code', title: '经典用法：词频统计 + 按次数排行榜', code: `import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 演示：Map 最经典的两个用途 —— 统计频率、按值排序。
 * 统计套路：counter.put(w, counter.getOrDefault(w, 0) + 1)
 * 排序套路：把 entrySet 装进 List，再按 value 排序（Map 本身不能排序）。
 */
public class WordCount {
    public static void main(String[] args) {
        String text = "java android java kotlin java android python";
        Map<String, Integer> counter = new HashMap<>();

        // ---------- 一、统计词频 ----------
        for (String w : text.split(" ")) {                    // 按空格拆成单词
            // 取旧值，没有就当 0，再 +1 放回去 —— 计数场景的标准写法
            counter.put(w, counter.getOrDefault(w, 0) + 1);
            // 等价写法（Java 8+）：counter.merge(w, 1, (oldV, newV) -> oldV + newV);
        }
        System.out.println("不同单词数：" + counter.size());

        // ---------- 二、按出现次数从高到低排序 ----------
        // Map 本身无序，所以先把它转成 List<Map.Entry>，再用 sort 排序
        List<Map.Entry<String, Integer>> list = new ArrayList<>(counter.entrySet());
        // 比较器：b.getValue() - a.getValue() 表示降序；返回负数表示 a 排前面
        list.sort((a, b) -> b.getValue() - a.getValue());

        // ---------- 三、输出排行榜 ----------
        list.forEach(e -> System.out.println(e.getKey() + " 出现 " + e.getValue() + " 次"));
    }
}` },
      { t: 'table', head: ['问题', '答案'], rows: [
        ['HashMap 默认容量和负载因子', '16 和 0.75（元素超过 容量×0.75 就扩容）'],
        ['为什么容量必须是 2 的幂', '这样 (n-1) & hash 等价于取模，但位运算更快，且分布均匀'],
        ['什么时候链表转红黑树', '单个桶链表长度 ≥ 8，且数组长度 ≥ 64（否则先扩容）'],
        ['为什么先扩容后转树', '扩容能让元素重新分布，往往先把长链表拆开'],
        ['扩容后怎么迁移', 'JDK 8 用高低位拆分，不需要重新计算 hash，快很多'],
        ['HashMap 线程安全吗', '**不安全**。多线程扩容可能形成死循环（JDK 7）/数据丢失，用 ConcurrentHashMap'],
        ['key 可以用可变对象吗', '不推荐。key 的 hashCode 变了就再也找不到它']
      ]},
      { t: 'h', text: '5. equals 与 hashCode 契约（面试必考）' },
      { t: 'code', title: '只重写 equals 的后果：HashSet 去重失效', code: `import java.util.HashSet;
import java.util.Set;

/**
 * 反例演示：只重写 equals、不重写 hashCode 会怎样？
 * 结果：两个"内容相同"的对象都被放进去了 —— 因为哈希表先看 hashCode 找桶，
 * 桶不一样就根本不会去调用 equals 比较。
 * 记住：equals 和 hashCode 必须成对重写。
 */
class User {
    String id;

    User(String id) {
        this.id = id;
    }

    // 只重写了 equals：内容相同就认为相等
    public boolean equals(Object o) {
        if (!(o instanceof User)) {
            return false;                       // 类型不对
        }
        return id.equals(((User) o).id);        // 比较业务主键 id
    }

    // 故意不写 hashCode —— 于是每个对象用的是 Object 默认的"地址哈希"
}

public class BadEquals {
    public static void main(String[] args) {
        Set<User> set = new HashSet<>();
        set.add(new User("U001"));
        set.add(new User("U001"));   // 本以为会被去重，实际上没有

        System.out.println("只重写 equals，集合大小：" + set.size() + "（期望 1，实际 2）");
    }
}` },
      { t: 'code', title: '正确重写：equals + hashCode 一起写', code: `import java.util.HashSet;
import java.util.Set;

/**
 * 正例演示：成对重写 equals 与 hashCode。
 * 契约关键点：equals 为 true 的两个对象，hashCode 必须相同（否则哈希表会找不到它）。
 * 做法：hashCode 用与 equals 相同的字段算出来（这里只有 id）。
 */
class User {
    String id;

    User(String id) {
        this.id = id;
    }

    public boolean equals(Object o) {
        if (this == o) {
            return true;                        // 同一个对象，直接相等
        }
        if (o == null || getClass() != o.getClass()) {
            return false;                       // 为 null 或类型不同
        }
        return id.equals(((User) o).id);        // 按业务主键比较
    }

    public int hashCode() {
        return id.hashCode();                   // 与 equals 用同一字段
    }
}

public class GoodEquals {
    public static void main(String[] args) {
        Set<User> set = new HashSet<>();
        set.add(new User("U001"));
        set.add(new User("U001"));   // hashCode 相同 → 落到同一个桶 → equals 判定重复 → 加不进去

        System.out.println("两个都重写，集合大小：" + set.size() + "（正确）");
    }
}` },
      { t: 'table', head: ['契约', '要求'], rows: [
        ['① 一致性', 'equals 返回 true 的两个对象，hashCode 必须相同'],
        ['② 相反不成立', 'hashCode 相同，equals 不一定为 true（这叫哈希冲突）'],
        ['③ 自反/对称/传递', 'a.equals(a) 为 true；a.equals(b) 则 b.equals(a)；a=b、b=c 则 a=c'],
        ['④ 与 null', 'a.equals(null) 必须返回 false，且不能抛异常'],
        ['实践', '用 IDE 自动生成，或 Objects.equals + Objects.hash；参与比较的字段要与 hashCode 一致']
      ]},
      { t: 'h', text: '6. 排序：Comparable 与 Comparator' },
      { t: 'code', title: '多字段排序：分数降序，同分按姓名升序', code: `import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

/** 学生实体：只提供 getter，排序规则交给外部 Comparator */
class Student {
    private final String name;
    private final int score;

    Student(String name, int score) {
        this.name = name;
        this.score = score;
    }

    public String getName() { return name; }
    public int getScore() { return score; }

    public String toString() {                 // 打印时看得懂
        return name + "(" + score + ")";
    }
}

public class SortDemo {
    public static void main(String[] args) {
        List<Student> list = new ArrayList<>();
        list.add(new Student("小明", 88));
        list.add(new Student("小红", 95));
        list.add(new Student("小刚", 88));

        // ---------- 多字段排序：分数降序 → 同分按姓名升序 ----------
        // comparingInt(取分数字段) 升序 → reversed() 变降序 → thenComparing(姓名) 处理并列
        list.sort(Comparator.comparingInt(Student::getScore)
                .reversed()
                .thenComparing(Student::getName));
        System.out.println("排序后：" + list);

        // ---------- 只按分数升序 ----------
        List<Student> copy = new ArrayList<>(list);          // 复制一份，保留上一份的顺序
        copy.sort(Comparator.comparingInt(Student::getScore));
        System.out.println("分数升序：" + copy);

        // ---------- 只取最高分（不需要排序也能拿） ----------
        Student top = Collections.max(list, Comparator.comparingInt(Student::getScore));
        System.out.println("最高分：" + top);
    }
}` },
      { t: 'table', head: ['对比', 'Comparable', 'Comparator'], rows: [
        ['包', 'java.lang', 'java.util'],
        ['方法', 'int compareTo(T o)', 'int compare(T a, T b)'],
        ['写在哪', '写在实体类里（类自己会排序）', '写在外部（谁调用谁传规则）'],
        ['数量', '一个类只能有一个自然排序', '可以写无数种排序规则'],
        ['使用', 'Collections.sort(list)', 'list.sort(comparator)'],
        ['选择', '该类只有一种“天然顺序”（如按 id）', '**更多时候用 Comparator**，不污染实体类']
      ]},
      { t: 'h', text: '7. Collections 工具类与不可变集合' },
      { t: 'code', title: 'Collections 常用方法与不可变集合', code: `import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

/**
 * 演示：Collections 工具类（注意是复数，操作集合的静态方法）与不可变集合。
 * 区分：Collection 是接口，Collections 是工具类 —— 就像 Array 与 Arrays。
 */
public class CollectionsDemo {
    public static void main(String[] args) {
        // Arrays.asList(...) 返回"固定长度"的列表，所以再包一层 new ArrayList<> 才能自由增删
        List<Integer> nums = new ArrayList<>(Arrays.asList(5, 2, 9, 1, 9));

        Collections.sort(nums);                                       // 升序排序（原地修改）
        System.out.println("排序：" + nums);

        System.out.println("最大：" + Collections.max(nums) + "，最小：" + Collections.min(nums));
        System.out.println("9 出现了 " + Collections.frequency(nums, 9) + " 次");

        Collections.reverse(nums);
        System.out.println("反转：" + nums);

        Collections.swap(nums, 0, 4);                                 // 交换下标 0 和 4 两个元素
        System.out.println("交换首尾：" + nums);

        // 不可变视图：之后任何修改都会抛 UnsupportedOperationException
        List<Integer> readOnly = Collections.unmodifiableList(nums);
        System.out.println("只读视图：" + readOnly);

        // List.of(...)：直接创建不可变集合，且不允许放 null
        List<String> fixed = List.of("a", "b", "c");
        System.out.println("不可变集合：" + fixed + "，大小 " + fixed.size());

        // 单元素集合与空集合（返回不可变对象，常用于返回"没有结果"的情况）
        System.out.println("单元素：" + Collections.singletonList("only"));
        System.out.println("空集合：" + Collections.emptyList());
    }
}` },
      { t: 'warn', text: '`Arrays.asList(...)` 返回的是**固定长度**的列表：可以 set，但不能 add/remove；`List.of(...)`、`Collections.unmodifiableList(...)` 连 set 都不允许。需要可变列表时记得再包一层：`new ArrayList<>(List.of("a","b"))`。' },
      { t: 'h', text: '8. 迭代器与 fail-fast：遍历中删除元素的坑' },
      { t: 'code', title: '错误示范：遍历中直接删除会抛异常（这段在页面里不跑）', noRun: true, code: `import java.util.ArrayList;
import java.util.List;

/**
 * 反例演示：for-each 是本例中的"有问题的写法"。
 * 原因：for-each 底层用的是 Iterator，它记录了集合的修改次数（modCount）。
 * 你在循环体里直接 list.remove(...) 改变了 modCount，
 * 下一次 next() 时迭代器发现"有人偷偷改了集合"，就抛 ConcurrentModificationException（fail-fast）。
 */
public class FailFastBad {
    public static void main(String[] args) {
        List<String> list = new ArrayList<>(List.of("a", "b", "c"));

        for (String s : list) {             // 这里创建了一个 Iterator
            if (s.equals("b")) {
                list.remove(s);             // 抛 ConcurrentModificationException
            }
        }
    }
}` },
      { t: 'p', text: '为什么？因为 for-each 底层用的是 **Iterator**。Iterator 在创建时记住了一个“修改次数”（modCount），每次 next() 都会检查修改次数是否变过；你在循环体里直接 `list.remove()` 会让 modCount 变化，下一次 next() 就抛 `ConcurrentModificationException`，这就是 **fail-fast（快速失败）** 机制——宁可立刻报错，也不要给你一个错误的结果。' },
      { t: 'code', title: '三种正确写法', code: `import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

/**
 * 演示：遍历中删除元素的三种正确做法。
 * ① 用迭代器自己的 remove()：它会同步修改次数，最"正统"；
 * ② removeIf(条件)：Java 8+ 最简洁，内部就是迭代器实现；
 * ③ 倒序遍历按下标删：不会因为元素前移而跳过元素。
 */
public class SafeRemove {
    public static void main(String[] args) {
        // ---------- 写法一：Iterator.remove() ----------
        List<String> list1 = new ArrayList<>(List.of("a", "b", "c", "b"));
        Iterator<String> it = list1.iterator();
        while (it.hasNext()) {                     // 先用 hasNext 判断
            if (it.next().equals("b")) {           // next() 取出当前元素
                it.remove();                       // 用迭代器删除，而不是 list.remove()
            }
        }
        System.out.println("迭代器删除：" + list1);

        // ---------- 写法二：removeIf（推荐，最简洁） ----------
        List<String> list2 = new ArrayList<>(List.of("a", "b", "c", "b"));
        list2.removeIf(s -> s.equals("b"));        // 传入"要删除的条件"
        System.out.println("removeIf 删除：" + list2);

        // ---------- 写法三：倒序遍历按下标删 ----------
        List<String> list3 = new ArrayList<>(List.of("a", "b", "c", "b"));
        for (int i = list3.size() - 1; i >= 0; i--) {   // 从后往前走
            if (list3.get(i).equals("b")) {
                list3.remove(i);                        // 删掉后不影响前面的下标
            }
        }
        System.out.println("倒序删除：" + list3);
    }
}` },
      { t: 'tip', text: '对比一下：**fail-fast**（ArrayList / HashMap）遍历时修改会立刻抛异常；**fail-safe**（ConcurrentHashMap、CopyOnWriteArrayList）遍历的是快照，修改不会抛异常但也看不到最新数据。面试常问这个区别。' },
      { t: 'h', text: '9. 选型决策表与高频面试题' },
      { t: 'table', head: ['需求', '选择', '原因'], rows: [
        ['按顺序存一批数据、经常按下标取', '**ArrayList**', '随机访问 O(1)，最常用'],
        ['频繁在头部插入/删除', 'LinkedList 或 ArrayDeque', '链表的头尾操作是 O(1)'],
        ['去重，不关心顺序', 'HashSet', '哈希表平均 O(1)'],
        ['去重且要保留添加顺序', 'LinkedHashSet', '哈希 + 链表'],
        ['去重且要排序', 'TreeSet', '红黑树自动排序'],
        ['根据 key 快速查 value', '**HashMap**', '哈希表平均 O(1)'],
        ['要按 key 排序 / 范围查询', 'TreeMap', '红黑树，可 firstKey/subMap'],
        ['要保留插入顺序的 Map', 'LinkedHashMap', '做 LRU 缓存的基础'],
        ['先进先出 / 后进先出', 'ArrayDeque', '比 LinkedList 做队列更快'],
        ['多线程共享', 'ConcurrentHashMap / CopyOnWriteArrayList', '线程安全且性能好'],
        ['只想返回不可修改的数据', 'List.copyOf / Collections.unmodifiableList', '防御性编程']
      ]},
      { t: 'list', items: [
        '**HashMap 的 put 过程**：算 hash → 扰动 → 定位下标 → 桶为空直接放 → 不为空则比较 hash 和 equals → 相同就覆盖，不同就挂到链表/树后面 → 判断是否需要扩容',
        '**为什么容量是 2 的幂**：`(n-1) & hash` 只有 n 是 2 的幂时才等价于取模且分布均匀；扩容时元素要么留在原位，要么移动“原容量”个位置，迁移很快',
        '**为什么链表长度 8 才转红黑树**：根据泊松分布，正常情况下桶里超过 8 个元素的概率极低（约千万分之六），所以阈值 8 是“既能防攻击又不太早转换”的折中',
        '**ArrayList 与 LinkedList 谁快**：理论上 LinkedList 增删快，但实际因为 CPU 缓存友好，ArrayList 在大多数场景更快；除了频繁头插，优先 ArrayList',
        '**fail-fast 与 fail-safe**：前者立刻抛异常（ArrayList/HashMap），后者基于快照（ConcurrentHashMap/CopyOnWriteArrayList）',
        '**面试高频**：HashMap 扩容机制、hash 扰动函数、为什么重写 equals 必须重写 hashCode、ArrayList 扩容 1.5 倍、ConcurrentHashMap 在 JDK 8 为什么用 CAS + synchronized'
      ]},
      { t: 'tip', text: '到这里，你已经掌握了“数据怎么放在内存里”的核心知识。下一章进入多线程——让程序同时做几件事，这也是从“会写代码”走向“能写好程序”的分水岭。' }
    ],
    quiz: [
      { q: '需要按插入顺序保存一组可重复的数据，并经常用下标访问，应该选？', options: ['HashSet', 'ArrayList', 'TreeMap', 'LinkedList'], answer: 1, explain: 'ArrayList 按插入顺序保存、允许重复、随机访问 O(1)，是 List 场景的首选。' },
      { q: 'ArrayList 的自动扩容是原来的多少倍？', options: ['1.5 倍', '2 倍', '3 倍', '不扩容'], answer: 0, explain: 'JDK 8 里是 oldCapacity + (oldCapacity >> 1)，也就是 1.5 倍，并把旧数组复制过去。' },
      { q: '把自定义对象放进 HashSet 去重，必须重写哪两个方法？', options: ['toString 和 getClass', 'equals 和 hashCode', 'compareTo 和 toString', '只需要重写 equals'], answer: 1, explain: '哈希表先用 hashCode 找桶，再用 equals 判断是否相同；只重写一个会导致去重失效或找不到元素。' },
      { q: 'HashMap 的默认初始容量和负载因子是？', options: ['10 和 0.75', '16 和 0.75', '16 和 1.0', '8 和 0.5'], answer: 1, explain: '默认容量 16、负载因子 0.75；元素个数超过 容量×0.75 就扩容为两倍。' },
      { q: '在 for-each 遍历 List 的过程中直接 list.remove(x) 会？', options: ['正常删除', '抛 ConcurrentModificationException', '删除最后一个元素', '编译报错'], answer: 1, explain: '这是 fail-fast 机制。正确做法是用 Iterator.remove()、removeIf() 或倒序遍历删除。' },
      { q: 'HashMap 中单个桶的链表长度达到多少时，会考虑转成红黑树？', options: ['4', '6', '8', '16'], answer: 2, explain: '链表长度 ≥ 8 且数组长度 ≥ 64 才转红黑树；数组太小会先扩容。' },
      { q: '需要让 Map 按 key 自动排序，应该选？', options: ['HashMap', 'LinkedHashMap', 'TreeMap', 'Hashtable'], answer: 2, explain: 'TreeMap 底层是红黑树，会按 key 的自然顺序（或自定义 Comparator）排序。' },
      { q: 'List.of("a", "b") 得到的集合可以做什么？', options: ['随意 add/remove', '可以 set 但不能 add', '只能读，修改会抛 UnsupportedOperationException', '和 ArrayList 完全一样'], answer: 2, explain: 'List.of 返回不可变集合，任何修改操作都会抛 UnsupportedOperationException；需要可变就 new ArrayList<>(List.of(...))。' }
    ],
    exercises: [
      {
        id: 'ex-j15-1',
        title: '练习 1：学生成绩分析系统（集合综合）',
        level: '较难',
        brief: '用 ArrayList 存学生、用 Comparator 排序、用 HashMap 建姓名索引、用 TreeMap 统计分数段，最后打印一份完整报表。',
        requirements: [
          'Student 类：name、score，提供 getter 和 toString（输出 姓名 分数）',
          '用 ArrayList<Student> 存 4 个学生：小明 88、小红 95、小刚 77、小美 61',
          '用 Comparator 按分数降序排序并打印，每人后面用 getGrade 输出等级（90+ A / 80+ B / 70+ C / 60+ D / 其他 F）',
          '用 HashMap<String, Integer> 建姓名到分数的索引，并打印其中两个',
          '用 TreeMap<String, Integer> 统计各等级人数（key 是等级）',
          '计算平均分并保留一位小数打印'
        ],
        starter: `import java.util.*;

class Student {
    // TODO: name、score、getter、toString
}

public class ScoreReport {
    public static void main(String[] args) {
        // TODO: 建列表 → 排序 → 索引 → 分数段统计 → 打印
    }
}`,
        expectedOutput: `按分数降序：
小红 95 A
小明 88 B
小刚 77 C
小美 61 D
姓名索引：小刚=77，小红=95
各等级人数：A=1，B=1，C=1，D=1
平均分：80.3`,
        keyPoints: [
          { label: 'Student 类有 name 和 score 字段', test: 'class\\s+Student[\\s\\S]{0,200}String\\s+name[\\s\\S]{0,120}int\\s+score' },
          { label: '用 ArrayList 存学生', test: 'new\\s+ArrayList' },
          { label: '排序用 Comparator 且分数降序', test: 'Comparator\\.comparingInt[\\s\\S]{0,80}reversed' },
          { label: '用 HashMap 建姓名索引', test: 'new\\s+HashMap' },
          { label: '用 TreeMap 统计等级', test: 'new\\s+TreeMap' },
          { label: '平均分保留一位小数', test: 'Math\\.round\\s*\\([\\s\\S]{0,90}/\\s*10\\.0' }
        ],
        hints: [
          '排序：students.sort(Comparator.comparingInt(Student::getScore).reversed());',
          '等级：用 if-else 或返回 char 的 getGrade 方法',
          'TreeMap 的 key 会自动排序，所以输出顺序是 A、B、C、D',
          '平均分：double avg = Math.round(total * 10.0 / students.size()) / 10.0;'
        ],
        solution: `import java.util.*;

class Student {
    private final String name;
    private final int score;

    Student(String name, int score) {
        this.name = name;
        this.score = score;
    }

    public String getName() { return name; }
    public int getScore() { return score; }

    public String toString() {
        return name + " " + score;
    }
}

public class ScoreReport {

    static String grade(int score) {
        if (score >= 90) return "A";
        if (score >= 80) return "B";
        if (score >= 70) return "C";
        if (score >= 60) return "D";
        return "F";
    }

    public static void main(String[] args) {
        List<Student> students = new ArrayList<>();
        students.add(new Student("小明", 88));
        students.add(new Student("小红", 95));
        students.add(new Student("小刚", 77));
        students.add(new Student("小美", 61));

        students.sort(Comparator.comparingInt(Student::getScore).reversed());

        System.out.println("按分数降序：");
        for (Student s : students) {
            System.out.println(s + " " + grade(s.getScore()));
        }

        Map<String, Integer> index = new HashMap<>();
        for (Student s : students) {
            index.put(s.getName(), s.getScore());
        }
        System.out.println("姓名索引：小刚=" + index.get("小刚") + "，小红=" + index.get("小红"));

        Map<String, Integer> gradeCount = new TreeMap<>();
        int total = 0;
        for (Student s : students) {
            String g = grade(s.getScore());
            gradeCount.put(g, gradeCount.getOrDefault(g, 0) + 1);
            total += s.getScore();
        }
        System.out.println("各等级人数：A=" + gradeCount.get("A")
                + "，B=" + gradeCount.get("B") + "，C=" + gradeCount.get("C") + "，D=" + gradeCount.get("D"));

        double avg = Math.round(total * 10.0 / students.size()) / 10.0;
        System.out.println("平均分：" + avg);
    }
}`
      },
      {
        id: 'ex-j15-2',
        title: '练习 2：词频 Top3 与集合运算',
        level: '中等',
        brief: '统计一段文本的词频并排序，再用 Set 求两段文本的并集、交集、差集，最后按字母顺序输出。',
        requirements: [
          '文本 A = "java android java kotlin"，文本 B = "java kotlin python"',
          '用 HashMap 统计 A 中每个单词出现次数，按次数降序、次数相同按字母升序，输出前 3 名，格式 java=2',
          '用 HashSet 分别装 A、B 的单词（去重）',
          '求并集、交集、差集（A 有 B 没有），并集用 TreeSet 排序后输出',
          '输出格式参考：A 与 B 的并集：[android, java, kotlin, python]'
        ],
        starter: `import java.util.*;

public class WordSet {
    public static void main(String[] args) {
        String textA = "java android java kotlin";
        String textB = "java kotlin python";

        // TODO: 词频 Top3 → 集合运算
    }
}`,
        expectedOutput: `词频 Top3：
java=2
android=1
kotlin=1
A 与 B 的并集：[android, java, kotlin, python]
交集：[java, kotlin]
A 有 B 没有：[android]`,
        keyPoints: [
          { label: '用 split 拆分文本', test: 'split\\s*\\(\\s*"' },
          { label: '用 HashMap 统计词频', test: 'new\\s+HashMap' },
          { label: '用 getOrDefault 累加', test: 'getOrDefault' },
          { label: '词频排序用了 Comparator 或 lambda', test: 'sort\\s*\\(\\s*\\(|Comparator\\.' },
          { label: '用 HashSet 建立单词集合', test: 'new\\s+HashSet' },
          { label: '并集用 TreeSet 排序输出', test: 'new\\s+TreeSet' },
          { label: '求交集用 retainAll', test: 'retainAll' },
          { label: '求差集用 removeAll', test: 'removeAll' }
        ],
        hints: [
          '词频：for (String w : textA.split(" ")) counter.put(w, counter.getOrDefault(w, 0) + 1);',
          '排序：list.sort((a, b) -> a.getValue() != b.getValue() ? b.getValue() - a.getValue() : a.getKey().compareTo(b.getKey()));',
          '集合运算：Set<String> setA = new HashSet<>(Arrays.asList(textA.split(" ")));',
          '并集：new TreeSet<>(setA) 再 addAll(setB)；交集 copy 一份再 retainAll；差集 copy 一份再 removeAll'
        ],
        solution: `import java.util.*;

public class WordSet {
    public static void main(String[] args) {
        String textA = "java android java kotlin";
        String textB = "java kotlin python";

        Map<String, Integer> counter = new HashMap<>();
        for (String w : textA.split(" ")) {
            counter.put(w, counter.getOrDefault(w, 0) + 1);
        }
        List<String> words = new ArrayList<>(counter.keySet());
        words.sort((a, b) -> counter.get(a) != counter.get(b)
                ? counter.get(b) - counter.get(a)
                : a.compareTo(b));

        System.out.println("词频 Top3：");
        for (int i = 0; i < 3 && i < words.size(); i++) {
            System.out.println(words.get(i) + "=" + counter.get(words.get(i)));
        }

        Set<String> setA = new HashSet<>(Arrays.asList(textA.split(" ")));
        Set<String> setB = new HashSet<>(Arrays.asList(textB.split(" ")));

        Set<String> union = new TreeSet<>(setA);
        union.addAll(setB);
        System.out.println("A 与 B 的并集：" + union);

        Set<String> inter = new HashSet<>(setA);
        inter.retainAll(setB);
        System.out.println("交集：" + new TreeSet<>(inter));

        Set<String> diff = new HashSet<>(setA);
        diff.removeAll(setB);
        System.out.println("A 有 B 没有：" + new TreeSet<>(diff));
    }
}`
      },
      {
        id: 'ex-j15-3',
        title: '练习 3：多文件 + 集合——自定义类拆成独立文件',
        level: '中等',
        brief: '把「学生」这个自定义类放到独立的 Student.java 文件里，你在 Main 里用集合装一堆学生对象，排序后打印排行榜。这就是真实项目里最常见的组织方式：一种东西一个类，一个类一个文件。',
        files: [
          {
            name: 'Student.java',
            code: [
              'public class Student {',
              '    // 属性用 private 封装起来，外部只能通过 getter 读取',
              '    private final String name;   // 姓名',
              '    private final int score;     // 分数',
              '',
              '    // 构造器：创建对象时一次性把姓名和分数传进来',
              '    public Student(String name, int score) {',
              '        this.name = name;',
              '        this.score = score;',
              '    }',
              '',
              '    // 读取姓名',
              '    public String getName() {',
              '        return name;',
              '    }',
              '',
              '    // 读取分数',
              '    public int getScore() {',
              '        return score;',
              '    }',
              '',
              '    // 打印对象时显示成 “小明(96分)”，调试时更直观',
              '    @Override',
              '    public String toString() {',
              '        return name + "(" + score + "分)";',
              '    }',
              '}'
            ].join('\n')
          }
        ],
        requirements: [
          '在 Main 里用 List<Student> 装 5 个学生对象（用 new Student(姓名, 分数) 创建）',
          '通过 Student 的 getName()、getScore() 读取数据（属性是私有的，只能通过方法访问）',
          '用 list.sort((a, b) -> b.getScore() - a.getScore()) 按分数从高到低排序',
          '遍历 list，按「第 n 名：姓名 分数 分」的格式打印',
          '计算并打印平均分（总分 ÷ 人数，取整数），最后打印第一名的姓名'
        ],
        starter: 'import java.util.*;\n\n    public class Main {\n        public static void main(String[] args) {\n            // Student 类在旁边的依赖文件 Student.java 里，直接用 new Student(...) 创建对象\n            List<Student> list = new ArrayList<>();\n            list.add(new Student("小明", 96));\n            list.add(new Student("小红", 88));\n            // TODO 1：再添加 3 个学生——小刚 92、小美 79、小强 85\n\n            // TODO 2：按分数从高到低排序（提示：list.sort((a, b) -> b.getScore() - a.getScore());）\n\n            // TODO 3：遍历 list，打印「第 n 名：姓名 分数 分」\n\n            // TODO 4：打印平均分（总分 / 人数）和第一名姓名\n        }\n    }',
        expectedOutput: '第 1 名：小明 96 分\n第 2 名：小刚 92 分\n第 3 名：小红 88 分\n第 4 名：小强 85 分\n第 5 名：小美 79 分\n平均分：88\n第一名：小明',
        keyPoints: [
          { label: '用 new Student(...) 创建学生对象', test: 'new\\s+Student\\s*\\(' },
          { label: '用 getScore() / getName() 读取私有属性', test: '\\.get(?:Score|Name)\\s*\\(' },
          { label: '对集合排序', test: '\\.sort\\s*\\(' },
          { label: '遍历集合并打印', test: 'for\\s*\\(' },
          { label: '把结果打印出来', test: 'System\\.out\\.print' }
        ],
        hints: [
          '添加对象：list.add(new Student("小刚", 92));，注意姓名和分数要和题目一致，输出才对得上。',
          '降序排序就是「后面的减前面的」：list.sort((a, b) -> b.getScore() - a.getScore());',
          '遍历时用 list.get(i) 取出第 i 个学生，再调用 s.getName()、s.getScore()。',
          '平均分用整数除法就行：sum / list.size()，总分可以用循环里的 sum += s.getScore() 累加。'
        ],
        solution: 'import java.util.*;\n\n    public class Main {\n        public static void main(String[] args) {\n            // Student 在另一个文件 Student.java 里，这里直接 new 出来就能用\n            List<Student> list = new ArrayList<>();\n            list.add(new Student("小明", 96));\n            list.add(new Student("小红", 88));\n            list.add(new Student("小刚", 92));\n            list.add(new Student("小美", 79));\n            list.add(new Student("小强", 85));\n\n            // 按分数从高到低排序：b - a 就是降序\n            list.sort((a, b) -> b.getScore() - a.getScore());\n\n            int sum = 0;\n            for (int i = 0; i < list.size(); i++) {\n                Student s = list.get(i);\n                System.out.println("第 " + (i + 1) + " 名：" + s.getName() + " " + s.getScore() + " 分");\n                sum += s.getScore();   // 顺便把分数累加起来\n            }\n\n            System.out.println("平均分：" + (sum / list.size()));\n            System.out.println("第一名：" + list.get(0).getName());\n        }\n    }'
      },

    ],
    checklist: ['能画出集合体系并说出每种实现的结构', '知道 ArrayList 扩容机制', '能背出 equals/hashCode 契约', '会用 Map 做统计与排序', '知道遍历中删除元素的正确写法']
  }
];



