/* 课程内容 · Android 移动开发（第 19 章 数据存储） */
window.COURSE_MOBILE_PART6 = [
  {
    id: 'a6',
    title: '数据存储：让 App 记住东西',
    minutes: 80,
    tags: ['SharedPreferences', 'Room', 'SQLite', '权限'],
    goals: [
      '根据数据量选择合适的存储方案',
      '会用 SharedPreferences 存简单配置',
      '会用 Room 完成增删改查（官方推荐的数据库方案）'
    ],
    lessons: [
      { t: 'p', text: 'App 关掉再打开，数据还在吗？这就是存储要解决的问题。Android 有四种常用方案：**SharedPreferences、文件、Room(SQLite)、网络**。选择标准很简单：少量键值对用 SharedPreferences，结构化数据（列表、表格）用 Room。' },
      { t: 'h', text: '1. 四种存储方案对比' },
      { t: 'table', head: ['方案', '适合存什么', '特点'], rows: [
        ['SharedPreferences', '开关状态、登录 token、用户偏好、上次打开的页面', '键值对，简单；不适合大量数据'],
        ['内部文件存储', '日志、导出的文本、缓存的 JSON', '用 File + IO 流；卸载 App 会删除'],
        ['Room（SQLite）', '列表数据、用户信息、聊天记录、待办事项', '官方推荐，支持查询、排序、关联，有编译期校验'],
        ['外部存储 / 相册', '用户自己的文件、图片、视频', '需要权限，Android 10+ 用分区存储']
      ]},
      { t: 'h', text: '2. SharedPreferences：三行代码读写' },
      { t: 'code', title: '保存与读取设置', code: `// 写入
SharedPreferences sp = getSharedPreferences("app_config", MODE_PRIVATE);
sp.edit()
  .putString("nickname", "小明")
  .putInt("loginCount", 3)
  .putBoolean("darkMode", true)
  .apply();          // apply 异步提交（推荐）；commit 同步并返回是否成功

// 读取
String nickname = sp.getString("nickname", "游客");
int count = sp.getInt("loginCount", 0);
boolean dark = sp.getBoolean("darkMode", false);

// 删除某个 key / 清空全部
sp.edit().remove("nickname").apply();
sp.edit().clear().apply();

// 小工具：记录 App 启动次数
int times = sp.getInt("launchTimes", 0) + 1;
sp.edit().putInt("launchTimes", times).apply();` },
      { t: 'warn', text: 'SharedPreferences 只适合**少量、非敏感**的数据。密码、身份证号不要明文存进去（Android 10+ 虽然文件被沙箱保护，但 root 设备可读）；敏感数据用 EncryptedSharedPreferences 或 Jetpack Security。另外别在循环里频繁调用 edit().apply()。' },
      { t: 'h', text: '3. Room：三个注解搞定数据库' },
      { t: 'p', text: 'Room 把 SQLite 包装成了面向对象的样子：**@Entity 定义表结构，@Dao 定义操作，@Database 声明数据库**。编译时就会检查 SQL 是否有错，比手写 SQLiteOpenHelper 安全太多。' },
      { t: 'code', title: '第一步：加依赖', code: `// app/build.gradle
dependencies {
    def room_version = "2.6.1"
    implementation "androidx.room:room-runtime:$room_version"
    annotationProcessor "androidx.room:room-compiler:$room_version"
}

// Java 项目用 annotationProcessor；Kotlin 项目用 kapt 或 ksp` },
      { t: 'code', title: '第二步：实体类（一张表）', code: `package com.example.todolist.db;

import androidx.room.Entity;
import androidx.room.PrimaryKey;

@Entity(tableName = "todo")
public class TodoEntity {

    @PrimaryKey(autoGenerate = true)      // 主键自增
    public int id;

    public String title;
    public boolean done;
    public long createdAt;

    public TodoEntity(String title, boolean done, long createdAt) {
        this.title = title;
        this.done = done;
        this.createdAt = createdAt;
    }
}` },
      { t: 'code', title: '第三步：DAO（操作接口）', code: `package com.example.todolist.db;

import androidx.room.Dao;
import androidx.room.Delete;
import androidx.room.Insert;
import androidx.room.Query;
import androidx.room.Update;
import java.util.List;

@Dao
public interface TodoDao {

    @Insert
    long insert(TodoEntity todo);

    @Update
    void update(TodoEntity todo);

    @Delete
    void delete(TodoEntity todo);

    @Query("SELECT * FROM todo ORDER BY done ASC, createdAt DESC")
    List<TodoEntity> getAll();

    @Query("DELETE FROM todo WHERE done = 1")
    void deleteAllDone();
}` },
      { t: 'code', title: '第四步：Database 与使用', code: `package com.example.todolist.db;

import android.content.Context;
import androidx.room.Database;
import androidx.room.Room;
import androidx.room.RoomDatabase;

@Database(entities = {TodoEntity.class}, version = 1, exportSchema = false)
public abstract class AppDatabase extends RoomDatabase {

    public abstract TodoDao todoDao();

    private static volatile AppDatabase instance;

    // 单例：整个 App 只创建一个数据库实例
    public static AppDatabase getInstance(Context context) {
        if (instance == null) {
            synchronized (AppDatabase.class) {
                if (instance == null) {
                    instance = Room.databaseBuilder(
                                    context.getApplicationContext(),
                                    AppDatabase.class,
                                    "todo.db")
                            .fallbackToDestructiveMigration()   // 版本升级时清库重建（学习阶段可接受）
                            .build();
                }
            }
        }
        return instance;
    }
}` },
      { t: 'code', title: '在 Activity 里使用（注意线程）', code: `TodoDao dao = AppDatabase.getInstance(this).todoDao();

// 数据库操作不能在主线程做！用线程池或 Executor
ExecutorService executor = Executors.newSingleThreadExecutor();

// 新增
btnAdd.setOnClickListener(v -> {
    String title = etTitle.getText().toString().trim();
    if (title.isEmpty()) return;
    executor.execute(() -> {
        dao.insert(new TodoEntity(title, false, System.currentTimeMillis()));
        List<TodoEntity> list = dao.getAll();
        runOnUiThread(() -> {          // 回到主线程更新 UI
            adapter.submit(list);
            etTitle.setText("");
        });
    });
});` },
      { t: 'h', text: '4. 权限：Android 6.0 起要运行时申请' },
      { t: 'table', head: ['权限类型', '例子', '申请方式'], rows: [
        ['普通权限', 'INTERNET、VIBRATE', 'AndroidManifest 声明即可，用户不用确认'],
        ['危险权限', 'CAMERA、READ_CONTACTS、ACCESS_FINE_LOCATION', 'Manifest 声明 + 运行时弹窗申请'],
        ['特殊权限', '读写所有文件、悬浮窗', '跳系统设置页手动授权']
      ]},
      { t: 'code', title: '运行时申请权限（现代写法）', code: `// 字段位置注册
private final ActivityResultLauncher<String> requestCamera =
        registerForActivityResult(new ActivityResultContracts.RequestPermission(), granted -> {
            if (granted) {
                Toast.makeText(this, "已获得相机权限", Toast.LENGTH_SHORT).show();
            } else {
                Toast.makeText(this, "没有权限无法拍照", Toast.LENGTH_SHORT).show();
            }
        });

// 需要时申请
if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA)
        != PackageManager.PERMISSION_GRANTED) {
    requestCamera.launch(Manifest.permission.CAMERA);
} else {
    Toast.makeText(this, "已有权限，直接拍照", Toast.LENGTH_SHORT).show();
}` },
      { t: 'tip', text: 'Room 的学习次序建议：先跑通“新增 + 查询列表”，再加“删除 + 修改”，最后加“搜索 + 排序”。每加一个功能就在界面上验证一次，比一次写完再调试效率高得多。' }
    ],
    quiz: [
      { q: '保存“夜间模式开关”这种简单设置，最适合用？', options: ['Room 数据库', 'SharedPreferences', '文件存储', '网络'], answer: 1, explain: '少量键值对用 SharedPreferences 最省事。' },
      { q: 'Room 中定义表结构的注解是？', options: ['@Table', '@Entity', '@Dao', '@Database'], answer: 1, explain: '@Entity 声明一张表；@Dao 声明操作；@Database 声明数据库。' },
      { q: '在 Activity 里直接执行数据库查询会怎样？', options: ['正常运行', '可能抛出在主线程做网络/数据库操作的异常，或造成界面卡顿', '自动切到子线程', '编译报错'], answer: 1, explain: '数据库与网络都属于耗时操作，必须放到子线程或线程池，再回主线程更新 UI。' },
      { q: 'Android 6.0 之后，使用相机需要？', options: ['只在 Manifest 里声明', '在 Manifest 声明并在运行时动态申请', '什么都不用做', '必须有 root 权限'], answer: 1, explain: '危险权限必须运行时申请，用户随时可以拒绝。' }
    ],
    exercises: [
      {
        id: 'ex-a6-1',
        title: '练习 1：待办清单加入数据持久化',
        level: '较难',
        brief: '用 Room 替换上一章的静态数据，让待办事项在关闭 App 后依然存在，并增加“清除已完成”功能。',
        requirements: [
          '创建 TodoEntity（id 自增主键、title、done、createdAt）',
          '创建 TodoDao：insert、update、delete、getAll、deleteAllDone 五个方法',
          '创建 AppDatabase 单例，数据库名 todo.db',
          'MainActivity 启动时从数据库读取列表并显示到 RecyclerView',
          '点击新建按钮：把输入框内容插入数据库，再重新查询刷新列表',
          '点击 item 切换完成状态：调用 dao.update 后刷新',
          '长按 item 删除：调用 dao.delete 后刷新',
          '顶部菜单或按钮“清除已完成”：调用 dao.deleteAllDone 后刷新',
          '所有数据库操作放在 ExecutorService 子线程，结果用 runOnUiThread 回到主线程更新界面'
        ],
        starter: `// 需要新建 3 个文件
// db/TodoEntity.java   —— @Entity
// db/TodoDao.java      —— @Dao 接口
// db/AppDatabase.java  —— @Database 抽象类

// MainActivity 中的关键流程
executor.execute(() -> {
    // TODO: 数据库操作
    runOnUiThread(() -> {
        // TODO: 更新 RecyclerView
    });
});`,
        expectedOutput: `第一次运行：空列表，提示“还没有待办事项”
新增“学 Room” → 列表出现该条
退出 App 再打开 → “学 Room”还在，说明已经持久化
点击该条 → 显示删除线，重新打开 App 依然是已完成状态
点“清除已完成” → 该条消失，再次打开 App 也不会回来`,
        keyPoints: [
          { label: 'Entity 类使用了 @PrimaryKey(autoGenerate = true)', test: '@PrimaryKey[\\s\\S]{0,40}autoGenerate' },
          { label: 'Dao 中有 @Insert 与 @Query', test: '@Insert[\\s\\S]*@Query|@Query[\\s\\S]*@Insert' },
          { label: 'Dao 中有 getAll 查询', test: 'getAll|SELECT\\s+\\*\\s+FROM' },
          { label: 'Database 抽象类声明了 entities', test: '@Database\\s*\\(\\s*entities' },
          { label: '使用 Room.databaseBuilder 创建实例', test: 'Room\\.databaseBuilder' },
          { label: '数据库操作放在 Executor 线程中', test: 'Executor|ExecutorService|newSingleThreadExecutor' },
          { label: '使用 runOnUiThread 回到主线程', test: 'runOnUiThread' },
          { label: '实现了删除已完成的方法', test: 'deleteAllDone|DELETE\\s+FROM[\\s\\S]{0,60}done' }
        ],
        hints: [
          '@Dao 必须是 interface 或 abstract class，方法只需要声明，Room 会自动生成实现',
          '插入后要重新查询 getAll() 再刷新适配器，这样排序规则（未完成在前）才会生效',
          '时间戳用 System.currentTimeMillis()，显示时用 new SimpleDateFormat("MM-dd HH:mm").format(new Date(createdAt))',
          '如果编译报错找不到 Room 生成的类，先 Build → Rebuild Project'
        ],
        solution: `// db/TodoEntity.java
@Entity(tableName = "todo")
public class TodoEntity {
    @PrimaryKey(autoGenerate = true)
    public int id;
    public String title;
    public boolean done;
    public long createdAt;

    public TodoEntity(String title, boolean done, long createdAt) {
        this.title = title;
        this.done = done;
        this.createdAt = createdAt;
    }
}

// db/TodoDao.java
@Dao
public interface TodoDao {
    @Insert
    long insert(TodoEntity todo);

    @Update
    void update(TodoEntity todo);

    @Delete
    void delete(TodoEntity todo);

    @Query("SELECT * FROM todo ORDER BY done ASC, createdAt DESC")
    List<TodoEntity> getAll();

    @Query("DELETE FROM todo WHERE done = 1")
    void deleteAllDone();
}

// db/AppDatabase.java
@Database(entities = {TodoEntity.class}, version = 1, exportSchema = false)
public abstract class AppDatabase extends RoomDatabase {
    public abstract TodoDao todoDao();

    private static volatile AppDatabase instance;

    public static AppDatabase getInstance(Context context) {
        if (instance == null) {
            synchronized (AppDatabase.class) {
                if (instance == null) {
                    instance = Room.databaseBuilder(
                            context.getApplicationContext(),
                            AppDatabase.class,
                            "todo.db"
                    ).fallbackToDestructiveMigration().build();
                }
            }
        }
        return instance;
    }
}

// MainActivity 关键片段
private TodoDao dao;
private final ExecutorService executor = Executors.newSingleThreadExecutor();

@Override
protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    setContentView(R.layout.activity_main);
    dao = AppDatabase.getInstance(this).todoDao();
    // 初始化 RecyclerView ... 略

    loadTodos();
}

private void loadTodos() {
    executor.execute(() -> {
        List<TodoEntity> list = dao.getAll();
        runOnUiThread(() -> {
            adapter.submit(list);
            tvEmpty.setVisibility(list.isEmpty() ? View.VISIBLE : View.GONE);
        });
    });
}

private void addTodo(String title) {
    executor.execute(() -> {
        dao.insert(new TodoEntity(title, false, System.currentTimeMillis()));
        List<TodoEntity> list = dao.getAll();
        runOnUiThread(() -> {
            adapter.submit(list);
            etTitle.setText("");
        });
    });
}

private void toggle(TodoEntity todo) {
    executor.execute(() -> {
        todo.done = !todo.done;
        dao.update(todo);
        List<TodoEntity> list = dao.getAll();
        runOnUiThread(() -> adapter.submit(list));
    });
}

private void clearDone() {
    executor.execute(() -> {
        dao.deleteAllDone();
        List<TodoEntity> list = dao.getAll();
        runOnUiThread(() -> adapter.submit(list));
    });
}`
      }
    ],
    checklist: ['能说出四种存储方案各自适合什么', '会读写 SharedPreferences', '能写出 Room 的 Entity / Dao / Database', '知道数据库操作不能放主线程']
  }
];


