/* 课程内容 · Android 移动开发（第 15 章 Activity 与生命周期） */
window.COURSE_MOBILE_PART2 = [
  {
    id: 'a2',
    title: 'Activity 与生命周期',
    minutes: 60,
    tags: ['Activity', '生命周期', 'Logcat', '状态保存'],
    goals: [
      '理解 Activity 是“一个屏幕”，掌握 7 个生命周期回调',
      '会用 Log 与 Logcat 观察生命周期执行顺序',
      '会用 onSaveInstanceState 处理旋转屏幕与状态丢失'
    ],
    lessons: [
      { t: 'p', text: '一个 Activity 通常就是一个屏幕。用户打开 App、切到后台、接电话、旋转屏幕、按返回键，系统都会回调 Activity 的不同方法。**没搞清生命周期，状态丢失、内存泄漏、崩溃都找不到原因**。' },
      { t: 'h', text: '1. 七个生命周期方法' },
      { t: 'table', head: ['方法', '触发时机', '典型用途'], rows: [
        ['onCreate', 'Activity 被创建，只调用一次', 'setContentView 绑定布局、初始化控件与数据'],
        ['onStart', '界面即将可见', '注册广播、准备动画'],
        ['onResume', '界面可交互（获得焦点）', '启动传感器、恢复计时、刷新数据'],
        ['onPause', '被部分遮挡或即将失去焦点', '暂停动画、保存未提交数据、停止传感器'],
        ['onStop', '完全不可见（比如切到桌面）', '释放耗时资源、注销广播'],
        ['onRestart', '从 onStop 重新回到前台', '重新初始化只在可见时才需要的东西'],
        ['onDestroy', 'Activity 销毁（退出或系统回收）', '解绑监听、释放资源，避免内存泄漏']
      ]},
      { t: 'code', title: '完整生命周期演示', code: `package com.example.lifecycle;

import android.os.Bundle;
import android.util.Log;
import android.widget.EditText;
import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {

    private static final String TAG = "LifeCycle";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        Log.d(TAG, "onCreate：界面创建");

        // 旋转屏幕或系统回收后，恢复用户输入
        if (savedInstanceState != null) {
            String text = savedInstanceState.getString("input");
            EditText et = findViewById(R.id.etInput);
            et.setText(text);
            Log.d(TAG, "恢复输入内容：" + text);
        }
    }

    @Override
    protected void onStart() {
        super.onStart();
        Log.d(TAG, "onStart：界面即将可见");
    }

    @Override
    protected void onResume() {
        super.onResume();
        Log.d(TAG, "onResume：界面可交互");
    }

    @Override
    protected void onPause() {
        super.onPause();
        Log.d(TAG, "onPause：界面失去焦点");
    }

    @Override
    protected void onStop() {
        super.onStop();
        Log.d(TAG, "onStop：界面不可见");
    }

    @Override
    protected void onRestart() {
        super.onRestart();
        Log.d(TAG, "onRestart：从后台回到前台");
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        Log.d(TAG, "onDestroy：Activity 销毁");
    }

    // 系统回收或旋转屏幕前，保存临时状态
    @Override
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        EditText et = findViewById(R.id.etInput);
        outState.putString("input", et.getText().toString());
        Log.d(TAG, "onSaveInstanceState：保存输入");
    }
}` },
      { t: 'h', text: '2. 典型场景的调用顺序' },
      { t: 'code', title: '在 Logcat 里你会看到', code: `// 打开 App
onCreate → onStart → onResume

// 按 Home 键回到桌面
onPause → onStop

// 从最近任务切回来
onRestart → onStart → onResume

// 按返回键退出
onPause → onStop → onDestroy

// 旋转屏幕（默认会销毁重建）
onPause → onStop → onDestroy → onCreate → onStart → onResume

// 被电话界面部分遮挡
onPause（不会调用 onStop）` },
      { t: 'tip', text: 'Log 分 5 级：Log.v 冗余、Log.d 调试、Log.i 信息、Log.w 警告、Log.e 错误。Logcat 窗口可以按 TAG 过滤，用 Log.d("TAG", "消息") 比 System.out.println 更好用（带类名行号、可过滤）。' },
      { t: 'h', text: '3. 状态保存的三种手段' },
      { t: 'table', head: ['方式', '适用场景', '注意'], rows: [
        ['onSaveInstanceState', '旋转屏幕、临时输入、临时选中项', '只适合少量数据，不能放图片等大对象'],
        ['ViewModel', '大数据、列表、网络结果、跨旋转保留', '需要引入 Jetpack 依赖，官方推荐'],
        ['SharedPreferences / 数据库', '真正持久化，重开 App 也要保留', '大量写入不要放在主线程']
      ]},
      { t: 'warn', text: '两个高频坑：① **内存泄漏**——把 Activity 引用交给静态变量或长耗时任务，Activity 销毁后无法回收。② **销毁后更新 UI**——网络回调回来时页面可能已经关闭，先判断 isFinishing() 再更新。' },
      { t: 'h', text: '4. 返回栈：Activity 之间的父子关系' },
      { t: 'list', items: [
        'App 打开 MainActivity，再跳到 DetailActivity，两者都在任务栈里：Main 在下，Detail 在上',
        '按返回键：栈顶 Activity 出栈销毁，露出下面的 Main（触发 onRestart → onStart → onResume）',
        '连续返回直到栈空，App 回到桌面',
        'Manifest 里给 Activity 加 android:launchMode="singleTop" 可以避免重复打开同一个页面'
      ]}
    ],
    quiz: [
      { q: '哪个方法在 Activity 创建时只执行一次？', options: ['onStart', 'onResume', 'onCreate', 'onRestart'], answer: 2, explain: 'onCreate 在创建时调用一次；旋转屏幕重建时会再调用一次。' },
      { q: '按 Home 键回到桌面，会依次调用？', options: ['onPause → onStop', 'onStop → onDestroy', 'onPause → onDestroy', '什么都不调用'], answer: 0, explain: '失去焦点调 onPause，完全不可见调 onStop，没有销毁所以不走 onDestroy。' },
      { q: '旋转屏幕后输入框内容丢失，最直接的处理是？', options: ['在 onSaveInstanceState 保存、onCreate 恢复', '把输入框设为不可见', '禁止屏幕旋转', '重开 App'], answer: 0, explain: '旋转会销毁重建，需要用 onSaveInstanceState 保存临时状态。' },
      { q: '把 Activity 引用放进静态变量，最可能造成？', options: ['编译错误', '内存泄漏', '界面卡顿', '数据丢失'], answer: 1, explain: '静态变量生命周期长于 Activity，会导致 Activity 无法被回收。' }
    ],
    exercises: [
      {
        id: 'ex-a2-1',
        title: '练习 1：生命周期观察器',
        level: '简单',
        brief: '给生命周期方法加日志，用 Logcat 验证切后台、旋转屏幕、返回键三种场景的调用顺序。',
        requirements: [
          '重写 7 个生命周期方法，每个都打一条 Log.d 日志（带方法名和说明）',
          '布局里放一个 EditText 输入框和一个显示点击次数的 TextView',
          '用 onSaveInstanceState 保存 EditText 内容与点击次数，旋转屏幕后都不能丢',
          '在 Logcat 中依次验证：打开 App、按 Home、切回来、旋转屏幕、按返回键，把日志顺序抄到笔记里'
        ],
        starter: `public class MainActivity extends AppCompatActivity {
    private static final String TAG = "LifeCycle";
    private int clickCount = 0;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        // TODO: 初始化控件、恢复状态、绑定点击事件
    }

    // TODO: 重写其余生命周期方法 + onSaveInstanceState
}`,
        expectedOutput: `Logcat 输出示例：
D/LifeCycle: onCreate：界面创建
D/LifeCycle: onStart：界面即将可见
D/LifeCycle: onResume：界面可交互
D/LifeCycle: onPause：界面失去焦点
D/LifeCycle: onStop：界面不可见
D/LifeCycle: onRestart：从后台回到前台
D/LifeCycle: onSaveInstanceState：保存状态
D/LifeCycle: onDestroy：Activity 销毁
旋转后：输入框内容和点击次数都还在`,
        keyPoints: [
          { label: '重写了 onCreate / onStart / onResume', test: 'onCreate[\\s\\S]*onStart[\\s\\S]*onResume' },
          { label: '重写了 onStop 与 onRestart', test: 'onStop[\\s\\S]*onRestart|onRestart[\\s\\S]*onStop' },
          { label: '重写了 onSaveInstanceState', test: 'onSaveInstanceState' },
          { label: '使用了 Log.d', test: 'Log\\.d\\s*\\(' },
          { label: '保存并恢复了点击次数', test: 'putInt|getInt' },
          { label: '恢复时判断 savedInstanceState 是否为空', test: 'savedInstanceState\\s*!=\\s*null' }
        ],
        hints: [
          '保存：outState.putInt("count", clickCount); 恢复：clickCount = savedInstanceState.getInt("count", 0);',
          '每个重写方法第一行都要写 super.xxx(); 否则父类逻辑丢失',
          'Logcat 筛选：在搜索框输入 tag:LifeCycle'
        ],
        solution: `// 只列关键部分，其余生命周期方法照此格式各加一条 Log.d 即可
public class MainActivity extends AppCompatActivity {

    private static final String TAG = "LifeCycle";
    private static final String KEY_COUNT = "count";
    private static final String KEY_INPUT = "input";

    private int clickCount = 0;
    private TextView tvCount;
    private EditText etInput;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        Log.d(TAG, "onCreate：界面创建");

        tvCount = findViewById(R.id.tvCount);
        etInput = findViewById(R.id.etInput);
        Button btnClick = findViewById(R.id.btnClick);

        // 恢复旋转屏幕前保存的数据
        if (savedInstanceState != null) {
            clickCount = savedInstanceState.getInt(KEY_COUNT, 0);
            etInput.setText(savedInstanceState.getString(KEY_INPUT, ""));
            Log.d(TAG, "恢复状态：count=" + clickCount);
        }
        tvCount.setText("点击次数：" + clickCount);

        btnClick.setOnClickListener(v -> {
            clickCount++;
            tvCount.setText("点击次数：" + clickCount);
        });
    }

    @Override
    protected void onStart() {
        super.onStart();
        Log.d(TAG, "onStart：界面即将可见");
    }

    @Override
    protected void onResume() {
        super.onResume();
        Log.d(TAG, "onResume：界面可交互");
    }

    @Override
    protected void onPause() {
        super.onPause();
        Log.d(TAG, "onPause：界面失去焦点");
    }

    @Override
    protected void onStop() {
        super.onStop();
        Log.d(TAG, "onStop：界面不可见");
    }

    @Override
    protected void onRestart() {
        super.onRestart();
        Log.d(TAG, "onRestart：从后台回到前台");
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        Log.d(TAG, "onDestroy：Activity 销毁");
    }

    // 旋转屏幕 / 系统回收前保存状态
    @Override
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        outState.putInt(KEY_COUNT, clickCount);
        outState.putString(KEY_INPUT, etInput.getText().toString());
        Log.d(TAG, "onSaveInstanceState：保存状态");
    }
}`
      }
    ],
    checklist: ['能背出 7 个生命周期方法及顺序', '会用 Logcat 按 TAG 过滤日志', '旋转屏幕后数据不丢失', '理解什么是内存泄漏']
  }
];

