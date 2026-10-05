/* 课程内容 · Android 移动开发（第 14 章） */
window.COURSE_MOBILE_PART1 = [
  {
    id: 'a1',
    title: '移动开发全景与第一个 Android 工程',
    minutes: 60,
    tags: ['Android', 'Android Studio', 'Gradle', '工程结构'],
    goals: [
      '说清原生开发、跨平台开发的差别与选择',
      '装好 Android Studio，创建并跑通第一个 App',
      '读懂 Android 工程目录结构，知道每个文件干什么'
    ],
    lessons: [
      { t: 'p', text: '移动开发主要分两条路：**原生开发**（Android 用 Kotlin/Java，iOS 用 Swift）和**跨平台开发**（Flutter、React Native、鸿蒙 ArkTS 等一套代码多端跑）。原生性能最好、系统能力最全；跨平台开发速度快、人力省。作为入门，从 Android 原生开始最稳，学完再学 Flutter 会很快。' },
      { t: 'h', text: '1. Android 技术栈地图' },
      { t: 'table', head: ['层次', '内容', '你要学到什么程度'], rows: [
        ['开发语言', 'Kotlin（官方首选）、Java（大量存量项目）', '先 Java 打基础，再补 Kotlin 语法糖'],
        ['UI 层', 'XML 布局 + View 体系；新项目用 Jetpack Compose', '先学 XML + View，看懂老项目，再学 Compose'],
        ['架构', 'Activity/Fragment、ViewModel、MVVM', '掌握生命周期 + 界面与数据分离'],
        ['数据', 'SharedPreferences、Room、文件', '能本地增删改查'],
        ['网络', 'Retrofit + OkHttp + Gson/Moshi + 协程', '能拉接口、解析 JSON、处理加载与错误'],
        ['工具', 'Android Studio、Gradle、Git、Logcat', '会调试、会打包 APK']
      ]},
      { t: 'tip', text: 'Kotlin 和 Java 的关系：Kotlin 编译成同样的字节码，可以和 Java 代码互相调用。你已学的面向对象、集合、异常、接口回调，在 Kotlin 里全都能用，只是写法更短。' },
      { t: 'h', text: '2. 安装 Android Studio' },
      { t: 'list', items: [
        '去 developer.android.com/studio 下载安装包（约 1GB，安装后还要下载 SDK）',
        '安装时勾选 Android SDK、Android SDK Platform、Android Virtual Device（AVD）',
        '第一次启动会下载组件，网络慢可以配置国内镜像（阿里云 maven 镜像）',
        '创建模拟器：Device Manager → Create Device → 选 Pixel 8 → 下载系统镜像（推荐 API 34/35）'
      ]},
      { t: 'warn', text: '模拟器卡顿的话优先用**真机调试**：手机开启“开发者选项 → USB 调试”，用数据线连电脑，设备列表里就会出现你的手机。让电脑和手机连同一个 WiFi 还能无线调试（Android 11+）。' },
      { t: 'h', text: '3. 创建第一个工程' },
      { t: 'list', items: [
        'New Project → Empty Views Activity（这就是 Java + XML 的模板）',
        'Name：MyFirstApp；Package name：com.example.myfirstapp（后面不建议改）',
        'Language 选 **Java**；Minimum SDK 选 API 24（覆盖绝大多数设备）',
        'Build configuration language：Kotlin DSL 或 Groovy 都行',
        '点 Run（绿色三角），第一次编译比较慢，之后每次改代码点 Run 即可'
      ]},
      { t: 'h', text: '4. 工程目录结构（重点，务必看懂）' },
      { t: 'code', title: '目录速查', code: `MyFirstApp/
├─ app/                              ← 你的应用模块
│  ├─ src/main/java/com/example/myfirstapp/
│  │     MainActivity.java            ← 界面逻辑代码（Java）
│  ├─ src/main/res/                   ← 资源目录（r = resource）
│  │     layout/activity_main.xml      ← 界面布局
│  │     values/strings.xml            ← 文案（方便做多语言）
│  │     values/colors.xml             ← 颜色
│  │     values/themes.xml             ← 主题
│  │     drawable/                     ← 图片、图标、形状
│  │     mipmap/                       ← 应用图标
│  ├─ src/main/AndroidManifest.xml     ← 应用清单（注册 Activity、权限）
│  └─ build.gradle                     ← 模块依赖与配置
├─ build.gradle                        ← 工程级配置
├─ gradle/                             ← Gradle Wrapper
└─ local.properties                    ← SDK 路径（不要提交到 Git）` },
      { t: 'h', text: '5. 第一个界面：XML 管长相，Java 管行为' },
      { t: 'code', title: 'res/layout/activity_main.xml', code: `<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical"
    android:gravity="center"
    android:padding="24dp">

    <TextView
        android:id="@+id/tvHello"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="你好，Android！"
        android:textSize="24sp" />

    <Button
        android:id="@+id/btnClick"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_marginTop="16dp"
        android:text="点我" />

</LinearLayout>` },
      { t: 'code', title: 'MainActivity.java', code: `package com.example.myfirstapp;

import android.os.Bundle;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);      // 绑定布局文件

        TextView tvHello = findViewById(R.id.tvHello);   // 通过 id 找到控件
        Button btnClick = findViewById(R.id.btnClick);

        btnClick.setOnClickListener(v -> {
            tvHello.setText("你已经点了按钮");
            Toast.makeText(this, "按钮生效了", Toast.LENGTH_SHORT).show();
        });
    }
}` },
      { t: 'table', head: ['关键字', '含义'], rows: [
        ['setContentView(R.layout.activity_main)', '把 XML 布局挂到当前 Activity 上显示'],
        ['findViewById(R.id.tvHello)', '根据 XML 里的 android:id 找到控件对象'],
        ['R.id / R.layout / R.string', '编译时自动生成的资源索引类，不要手写'],
        ['setOnClickListener', '给控件注册点击回调（就是 Java 里的接口 + lambda）'],
        ['@Override onCreate', 'Activity 创建时的入口方法']
      ]},
      { t: 'h', text: '6. AndroidManifest.xml：应用的身份证' },
      { t: 'code', title: 'AndroidManifest.xml 关键部分', code: `<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <!-- 申请权限，例如联网 -->
    <uses-permission android:name="android.permission.INTERNET" />

    <application
        android:label="@string/app_name"
        android:icon="@mipmap/ic_launcher"
        android:theme="@style/Theme.MyFirstApp">

        <!-- 每个 Activity 都要在这里注册；启动页要写 MAIN / LAUNCHER -->
        <activity
            android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

    </application>
</manifest>` },
      { t: 'tip', text: 'Android 9 以后默认禁止明文 HTTP 请求。如果接口是 http:// 而不是 https://，需要在 application 标签里加 android:usesCleartextTraffic="true"（仅调试用，正式项目必须用 https）。' }
    ],
    quiz: [
      { q: 'Android 官方推荐的开发语言是？', options: ['Java', 'Kotlin', 'C++', 'Python'], answer: 1, explain: 'Kotlin 是官方首选语言，Java 仍被完整支持，两者可以互相调用。' },
      { q: '界面布局文件一般放在哪个目录？', options: ['res/layout', 'res/values', 'src/main/java', 'assets'], answer: 0, explain: 'res/layout 放 XML 布局文件。' },
      { q: '代码里 findViewById 的作用是？', options: ['加载布局文件', '根据 id 找到 XML 中定义的控件', '注册点击事件', '申请权限'], answer: 1, explain: 'findViewById 通过 R.id.xxx 拿到控件对象，再设置属性或监听。' },
      { q: '启动页 Activity 需要在 Manifest 里声明哪种 intent-filter？', options: ['MAIN + LAUNCHER', 'MAIN + DEFAULT', 'VIEW + BROWSABLE', '不需要声明'], answer: 0, explain: 'MAIN + LAUNCHER 表示这是应用启动入口，桌面会显示图标。' }
    ],
    exercises: [
      {
        id: 'ex-a1-1',
        title: '练习 1：自我介绍 App',
        level: '入门',
        brief: '用刚学的 XML + Java 做一个单页 App：显示你的信息，点按钮后文字变化。',
        requirements: [
          '新建工程 MyFirstApp（Java 语言，minSdk 24）',
          '布局用 LinearLayout 垂直排列：两个 TextView + 两个 Button',
          '第一个 TextView 显示你的名字和方向（例如“张三 · Android 学徒”）',
          '第二个 TextView 初始显示“点击下方按钮开始学习”',
          '按钮 1（开始学习）：把第二个 TextView 改成“第 1 天：环境搭建完成”',
          '按钮 2（重置）：把第二个 TextView 改回初始文案，并用 Toast 提示“已重置”',
          '所有中文文案放进 strings.xml，用 @string/xxx 引用，不要硬编码在布局里'
        ],
        starter: `<!-- res/layout/activity_main.xml 骨架 -->
<LinearLayout ... android:orientation="vertical" android:gravity="center">
    <TextView android:id="@+id/tvName" ... />
    <TextView android:id="@+id/tvStatus" ... />
    <Button android:id="@+id/btnStart" ... />
    <Button android:id="@+id/btnReset" ... />
</LinearLayout>

// MainActivity.java 骨架
public class MainActivity extends AppCompatActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        // TODO: findViewById + setOnClickListener
    }
}`,
        expectedOutput: `界面初始状态：
张三 · Android 学徒
点击下方按钮开始学习
[开始学习]  [重置]

点击“开始学习”后第二行变成：第 1 天：环境搭建完成
点击“重置”后第二行还原，底部弹出 Toast：已重置`,
        keyPoints: [
          { label: '布局里有 2 个 TextView 和 2 个 Button', test: 'TextView[\\s\\S]*TextView[\\s\\S]*Button[\\s\\S]*Button' },
          { label: '通过 R.id 引用布局里的控件', test: 'R\\.id\\.\\w+' },
          { label: '文案取自 strings.xml（R.string 或 @string）', test: 'R\\.string\\.|@string/' },
          { label: 'Java 里用了 findViewById', test: 'findViewById\\s*\\(\\s*R\\.id' },
          { label: '注册了点击事件', test: 'setOnClickListener' },
          { label: '使用了 Toast', test: 'Toast\\.makeText' },
          { label: '用 setText 修改文本', test: 'setText\\s*\\(' }
        ],
        hints: [
          'findViewById 返回 View，Java 里通常直接写成 TextView tv = findViewById(R.id.tvStatus);',
          '中文文案写在 res/values/strings.xml：<string name="btn_start">开始学习</string>，布局里用 android:text="@string/btn_start"',
          '两个按钮可以分别写两个 lambda，也可以共用一个监听器再判断 id'
        ],
        solution: `// res/values/strings.xml
<resources>
    <string name="app_name">我的第一个应用</string>
    <string name="name_line">张三 · Android 学徒</string>
    <string name="status_init">点击下方按钮开始学习</string>
    <string name="status_day1">第 1 天：环境搭建完成</string>
    <string name="btn_start">开始学习</string>
    <string name="btn_reset">重置</string>
    <string name="toast_reset">已重置</string>
</resources>

// MainActivity.java
package com.example.myfirstapp;

import android.os.Bundle;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        TextView tvName = findViewById(R.id.tvName);
        TextView tvStatus = findViewById(R.id.tvStatus);
        Button btnStart = findViewById(R.id.btnStart);
        Button btnReset = findViewById(R.id.btnReset);

        tvName.setText(R.string.name_line);
        tvStatus.setText(R.string.status_init);

        btnStart.setOnClickListener(v -> tvStatus.setText(R.string.status_day1));

        btnReset.setOnClickListener(v -> {
            tvStatus.setText(R.string.status_init);
            Toast.makeText(this, R.string.toast_reset, Toast.LENGTH_SHORT).show();
        });
    }
}`
      }
    ],
    checklist: ['装好 Android Studio 和模拟器（或真机）', '跑通 Empty Views Activity 模板', '说清 res/layout、R.id、AndroidManifest 的作用', '完成自我介绍 App']
  }
];
