/* 课程内容 · Java 基础（第 12 章 集合框架与泛型） */
window.COURSE_JAVA_PART4 = [
  {
    id: 'j12',
    title: '集合框架与泛型',
    minutes: 80,
    tags: ['List', 'Map', 'Set', '泛型', '排序'],
    goals: [
      '根据场景选择 List / Set / Map',
      '熟练使用 ArrayList 与 HashMap 的常用方法',
      '会用泛型、Comparator 排序，理解自动装箱'
    ],
    lessons: [
      { t: 'p', text: '数组长度固定，增删元素很麻烦。集合框架（Collection）就是可以动态增删的数据容器，是实际开发中使用频率最高的工具。Android 里列表数据、接口返回、缓存，几乎都用集合装。' },
      { t: 'h', text: '1. 集合家族全貌' },
      { t: 'table', head: ['接口', '常用实现', '特点', '适用场景'], rows: [
        ['List', 'ArrayList / LinkedList', '有序、可重复、有下标', '列表、排行榜、待办清单'],
        ['Set', 'HashSet / TreeSet', '不重复；TreeSet 自动排序', '去重、标签集合'],
        ['Map', 'HashMap / TreeMap', '键值对，key 不重复', '统计次数、缓存、配置表'],
        ['Queue / Deque', 'ArrayDeque / LinkedList', '队列，先进先出', '任务队列、消息处理']
      ]},
      { t: 'h', text: '2. ArrayList：最常用的集合' },
      { t: 'code', title: 'List 常用操作', code: `import java.util.ArrayList;
import java.util.List;

public class ListDemo {
    public static void main(String[] args) {
        // 泛型 <String> 限定只能放 String；接口声明 + 实现类创建是主流写法
        List<String> todos = new ArrayList<>();

        // ---------- 增 ----------
        todos.add("学 Java 基础");          // 追加到末尾
        todos.add("做练习题");
        todos.add("写控制台项目");
        System.out.println(todos);

        todos.add(1, "复习变量");            // 插到下标 1（后面的元素整体后移）
        System.out.println(todos.get(1));    // 复习变量
        System.out.println(todos.size());    // 4

        // ---------- 查 ----------
        System.out.println(todos.contains("做练习题"));   // true
        System.out.println(todos.indexOf("写控制台项目")); // 3

        // ---------- 改 / 删 ----------
        todos.set(0, "学 Java 基础（已完成）");   // set 是替换
        todos.remove("复习变量");                 // 按元素删（会调用 equals 比较）
        todos.remove(0);                          // 按下标删
        System.out.println(todos);

        // ---------- 三种遍历方式 ----------
        for (int i = 0; i < todos.size(); i++) {          // ① 需要下标时用
            System.out.println(i + ": " + todos.get(i));
        }
        for (String t : todos) {                          // ② 增强 for，最常用
            System.out.println(t);
        }
        todos.forEach(t -> System.out.println("lambda: " + t));   // ③ Java 8+ lambda

        // List.of 创建的是"不可变集合"：不能 add/remove/set
        List<String> week = List.of("周一", "周二", "周三");
        System.out.println(week.size());
    }
}` },
      { t: 'warn', text: 'ArrayList 与数组互转：list.toArray(new String[0]) 和 Arrays.asList(arr)。注意 Arrays.asList 返回的是**固定长度**的列表，add 会抛 UnsupportedOperationException。' },
      { t: 'h', text: '3. HashSet 与 TreeSet' },
      { t: 'code', title: 'Set 去重', code: `import java.util.HashSet;
import java.util.Set;
import java.util.TreeSet;

Set<String> tags = new HashSet<>();
tags.add("java");
tags.add("android");
tags.add("java");          // 重复元素：加不进去（Set 自动去重）
System.out.println(tags.size());     // 2
System.out.println(tags.contains("java"));   // true

// HashSet 无序；TreeSet 会自动按大小排序（元素必须可比较）
Set<Integer> nums = new TreeSet<>();
nums.add(5);
nums.add(1);
nums.add(3);
System.out.println(nums);            // [1, 3, 5]：自动升序

// 提示：想让自定义对象在 Set 里去重，必须同时重写 equals 和 hashCode` },
      { t: 'h', text: '4. HashMap：键值对，统计利器' },
      { t: 'code', title: 'Map 常用操作', code: `import java.util.HashMap;
import java.util.Map;

public class MapDemo {
    public static void main(String[] args) {
        Map<String, Integer> scoreMap = new HashMap<>();

        // ---------- 存：key 相同会覆盖旧值 ----------
        scoreMap.put("小明", 88);
        scoreMap.put("小红", 95);
        scoreMap.put("小刚", 77);
        scoreMap.put("小明", 92);        // 覆盖上面的 88

        // ---------- 查 ----------
        System.out.println(scoreMap.get("小明"));             // 92
        // getOrDefault：key 不存在时返回默认值，避免拿到 null
        System.out.println(scoreMap.getOrDefault("小李", 0)); // 0
        System.out.println(scoreMap.containsKey("小红"));     // true
        System.out.println(scoreMap.size());                  // 3

        scoreMap.remove("小刚");

        // ---------- 遍历一：entrySet（推荐，一次拿到 key 和 value） ----------
        for (Map.Entry<String, Integer> entry : scoreMap.entrySet()) {
            System.out.println(entry.getKey() + " = " + entry.getValue());
        }

        // ---------- 遍历二：keySet（先拿 key，再回表查 value） ----------
        for (String name : scoreMap.keySet()) {
            System.out.println(name + " -> " + scoreMap.get(name));
        }

        // ---------- 遍历三：forEach + lambda ----------
        scoreMap.forEach((k, v) -> System.out.println(k + ":" + v));

        // ---------- 经典场景：统计每个字符出现的次数 ----------
        String text = "hello world";
        Map<Character, Integer> counter = new HashMap<>();
        for (char c : text.toCharArray()) {
            if (c == ' ') continue;      // 跳过空格
            // 取旧次数 +1 再放回去；没有就按 0 算
            counter.put(c, counter.getOrDefault(c, 0) + 1);
        }
        System.out.println(counter);
    }
}` },
      { t: 'h', text: '5. 泛型与排序' },
      { t: 'code', title: '泛型、Comparator、自动装箱', code: `import java.util.*;

// 泛型类：T 是类型参数，用的时候再指定具体类型（这里分别用了 String 和 Integer）
class Box<T> {
    private T value;
    public void set(T value) { this.value = value; }
    public T get() { return value; }
}

// 泛型方法：<T> 写在返回值前面，编译器根据实参推断类型
class ArrayUtil {
    public static <T> void printAll(T[] arr) {
        for (T item : arr) System.out.print(item + " ");
        System.out.println();
    }
}

public class GenericDemo {
    public static void main(String[] args) {
        // 使用泛型类：编译期就能检查类型，取出时也不用强转
        Box<String> b1 = new Box<>();
        b1.set("hello");
        Box<Integer> b2 = new Box<>();
        b2.set(123);
        System.out.println(b1.get() + " " + b2.get());
        ArrayUtil.printAll(new String[]{"a", "b", "c"});

        // 自动装箱：int 5 自动变成 Integer，才能放进集合
        List<Integer> nums = new ArrayList<>(Arrays.asList(5, 2, 9, 1));
        Collections.sort(nums);                        // 升序：[1, 2, 5, 9]
        System.out.println(nums);
        nums.sort(Comparator.reverseOrder());          // 降序：[9, 5, 2, 1]
        System.out.println(nums);

        // 对象排序：先按分数降序，分数相同再按姓名升序
        List<Student> students = new ArrayList<>(Arrays.asList(
            new Student("小明", 88),
            new Student("小红", 95),
            new Student("小刚", 88)
        ));
        students.sort(
            Comparator.comparingInt(Student::getScore).reversed()   // 主规则：分数降序
                      .thenComparing(Student::getName)              // 次规则：姓名升序
        );
        students.forEach(System.out::println);                      // 方法引用：等价于 s -> System.out.println(s)
    }
}

// 实现 Comparable 表示"这个类自带一种自然排序规则"
class Student implements Comparable<Student> {
    private final String name;
    private final int score;

    public Student(String name, int score) {
        this.name = name;
        this.score = score;
    }

    public String getName() { return name; }
    public int getScore() { return score; }

    @Override
    public int compareTo(Student o) {
        return Integer.compare(o.score, this.score);   // 分数高的排前面
    }

    @Override
    public String toString() {
        return name + ":" + score;
    }
}` },
      { t: 'tip', text: '选择口诀：**要顺序要下标用 List，要去重用 Set，要按 key 查值用 Map**。看到“统计次数”“查表”“缓存”，条件反射就该想到 HashMap。' },
      { t: 'warn', text: '不要在 for 循环里对集合做 add/remove，会抛 ConcurrentModificationException。需要删除时用迭代器 iterator.remove()，或先收集要删的元素再统一删。' }
    ],
    quiz: [
      { q: '需要保证元素不重复，应该用？', options: ['ArrayList', 'HashSet', 'HashMap', '数组'], answer: 1, explain: 'Set 的特性就是不重复。' },
      { q: 'Map 中遍历并同时拿到 key 和 value 推荐用？', options: ['keySet()', 'entrySet()', 'values()', 'get()'], answer: 1, explain: 'entrySet 一次拿到键值对，效率更高。' },
      { q: 'List<String> list = new ArrayList<>(); list.add(1); 会怎样？', options: ['正常，自动转成字符串', '编译错误，泛型限定了类型', '运行时抛异常', '得到 ["1"]'], answer: 1, explain: '泛型在编译期就做了类型检查。' },
      { q: 'Map 的 get() 方法，当 key 不存在时返回？', options: ['抛异常', 'null', '0', '空字符串'], answer: 1, explain: '返回 null，所以推荐用 getOrDefault。' }
    ],
    exercises: [
      {
        id: 'ex-j12-1',
        title: '练习 1：词频统计 + 成绩排名',
        level: '较难',
        brief: '用集合完成两个实战任务：统计单词出现次数，给学生排序输出。',
        requirements: [
          '任务 1：给定字符串 "java android java kotlin android java"，用 split 拆分，用 HashMap 统计每个单词出现次数并输出',
          '任务 2：定义 Student 类（name、score），放在 ArrayList 中',
          '按分数从高到低排序（用 Comparator），分数相同按姓名排序',
          '输出排名表：第 1 名 小红 95 分',
          '计算平均分（保留一位小数）并输出',
          '用 Set 统计一共有多少种不同的分数'
        ],
        starter: `import java.util.*;

public class CollectionPractice {
    public static void main(String[] args) {
        String text = "java android java kotlin android java";
        // TODO: 任务 1 词频统计

        // TODO: 任务 2 成绩排名
    }
}

// TODO: Student 类（含构造器、getter、toString）`,
        expectedOutput: `java = 3
android = 2
kotlin = 1
第 1 名 小红 95 分
第 2 名 小明 88 分
第 3 名 小刚 77 分
平均分：86.7
不同分数共 3 种`,
        keyPoints: [
          { label: '使用 HashMap 统计', test: 'new\\s+HashMap|Map<\\s*String\\s*,\\s*Integer' },
          { label: '使用 getOrDefault 累加', test: 'getOrDefault' },
          { label: '使用 ArrayList 存学生', test: 'new\\s+ArrayList' },
          { label: '使用 Comparator 排序', test: 'Comparator\\.comparing|sort\\s*\\(' },
          { label: '使用 Set 统计不同分数', test: 'new\\s+HashSet|Set<\\s*Integer' },
          { label: '平均分保留一位小数', test: 'Math\\.round|String\\.format|printf' }
        ],
        hints: [
          '词频：for (String w : text.split(" ")) map.put(w, map.getOrDefault(w, 0) + 1);',
          '排序：students.sort(Comparator.comparingInt(Student::getScore).reversed().thenComparing(Student::getName));',
          '不同分数：Set<Integer> scores = new HashSet<>(); 遍历学生 add，最后 size()'
        ],
        solution: `import java.util.*;

public class CollectionPractice {
    public static void main(String[] args) {
        // 任务 1：词频统计
        String text = "java android java kotlin android java";
        Map<String, Integer> counter = new HashMap<>();
        for (String word : text.split(" ")) {
            counter.put(word, counter.getOrDefault(word, 0) + 1);
        }
        for (Map.Entry<String, Integer> e : counter.entrySet()) {
            System.out.println(e.getKey() + " = " + e.getValue());
        }

        // 任务 2：成绩排名
        List<Student> students = new ArrayList<>();
        students.add(new Student("小明", 88));
        students.add(new Student("小红", 95));
        students.add(new Student("小刚", 77));

        students.sort(
            Comparator.comparingInt(Student::getScore).reversed()
                      .thenComparing(Student::getName)
        );

        double sum = 0;
        Set<Integer> scoreKinds = new HashSet<>();
        for (int i = 0; i < students.size(); i++) {
            Student s = students.get(i);
            System.out.println("第 " + (i + 1) + " 名 " + s.getName() + " " + s.getScore() + " 分");
            sum += s.getScore();
            scoreKinds.add(s.getScore());
        }

        double avg = Math.round(sum / students.size() * 10) / 10.0;
        System.out.println("平均分：" + avg);
        System.out.println("不同分数共 " + scoreKinds.size() + " 种");
    }
}

class Student implements Comparable<Student> {
    private final String name;
    private final int score;

    public Student(String name, int score) {
        this.name = name;
        this.score = score;
    }

    public String getName() { return name; }
    public int getScore() { return score; }

    @Override
    public int compareTo(Student o) {
        return Integer.compare(o.score, this.score);
    }

    @Override
    public String toString() {
        return name + ":" + score;
    }
}`
      },
      {
        id: 'ex-j12-2',
        title: '练习 2：词频排行榜 Top 3（Map + 排序 + lambda）',
        level: '较难',
        brief: '给一句话做词频统计，再按出现次数从高到低排出前三名。这道题是集合三件套（Map、List、排序）的综合运用，也是面试常见的题型。',
        requirements: [
          '用 split(" ") 把句子拆成单词数组',
          '用 HashMap<String, Integer> 统计每个单词出现的次数（getOrDefault 累加）',
          '把 entrySet() 放进 ArrayList，再用 lambda 排序：list.sort((a, b) -> b.getValue() - a.getValue())',
          '输出不同单词的总数',
          '输出前 3 名，格式：第1名：java 出现 4 次',
          '当单词不足 3 个时用 Math.min(3, list.size()) 避免越界'
        ],
        starter: `import java.util.*;

      public class WordTop {
          public static void main(String[] args) {
              String text = "java android java kotlin java android python android java";

              // TODO: 1) 统计词频   2) 排序   3) 输出前三名
          }
      }`,
        expectedOutput: `不同单词数：4
      第1名：java 出现 4 次
      第2名：android 出现 3 次
      第3名：kotlin 出现 1 次`,
        keyPoints: [
          { label: '用 HashMap 统计词频', test: 'new\\s+HashMap' },
          { label: '使用 getOrDefault 累加', test: 'getOrDefault' },
          { label: '把 entrySet 放进 List', test: 'new\\s+ArrayList[\\s\\S]{0,40}entrySet' },
          { label: '用 lambda 排序（b - a 表示降序）', test: 'sort\\s*\\(\\s*\\(\\s*\\w+\\s*,\\s*\\w+\\s*\\)\\s*->' },
          { label: '输出不同单词总数', test: 'counter\\.size\\s*\\(|different|counter\\.keySet' },
          { label: '使用 Math.min 防止越界', test: 'Math\\.min\\s*\\(' }
        ],
        hints: [
          '词频统计：for (String w : text.split(" ")) counter.put(w, counter.getOrDefault(w, 0) + 1);',
          'lambda 排序里 a、b 是两个 Map.Entry，b.getValue() - a.getValue() 就是按次数降序',
          '取前三名时先算 int top = Math.min(3, list.size());，再循环 0..top-1',
          '想按“次数相同时按字母顺序”排，可以再写 thenComparing，但本题不要求'
        ],
        solution: `import java.util.*;

      public class WordTop {
          public static void main(String[] args) {
              String text = "java android java kotlin java android python android java";

              Map<String, Integer> counter = new HashMap<>();
              for (String w : text.split(" ")) {
                  counter.put(w, counter.getOrDefault(w, 0) + 1);
              }

              List<Map.Entry<String, Integer>> list = new ArrayList<>(counter.entrySet());
              list.sort((a, b) -> b.getValue() - a.getValue());

              System.out.println("不同单词数：" + counter.size());

              int top = Math.min(3, list.size());
              for (int i = 0; i < top; i++) {
                  Map.Entry<String, Integer> e = list.get(i);
                  System.out.println("第" + (i + 1) + "名：" + e.getKey() + " 出现 " + e.getValue() + " 次");
              }
          }
      }`
      }
    ],
    checklist: ['能说出 List/Set/Map 的区别与场景', '会写 HashMap 统计词频', '会用 Comparator 排序']
  }
];
