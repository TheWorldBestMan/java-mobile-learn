/* 课程内容 · Android 移动开发（第 18 章 Intent 与页面跳转） */
window.COURSE_MOBILE_PART5 = [
  {
    id: 'a5',
    title: 'Intent 与页面跳转',
    minutes: 65,
    tags: ['Intent', '传参', 'Activity 跳转', 'ActivityResult'],
    goals: [
      '会用显式 Intent 在页面之间跳转',
      '掌握传参与返回结果的正确写法（ActivityResultLauncher）',
      '了解隐式 Intent：打开浏览器、拨号、分享、拍照'
    ],
    lessons: [
      { t: 'p', text: '一个 App 通常有多个页面，Intent 就是页面之间的“信使”。它负责两件事：**去哪**（目标 Activity）和**带什么**（要传递的数据）。再结合上一章的列表，就能做出“列表页 → 详情页”这种最典型的 App 结构。' },
      { t: 'h', text: '1. 显式 Intent：明确指定目标' },
      { t: 'code', title: '跳转与传参', code: `// 从 MainActivity 跳到 DetailActivity，并带上数据
Intent intent = new Intent(MainActivity.this, DetailActivity.class);
intent.putExtra("title", "Android 入门");
intent.putExtra("id", 1001);
intent.putExtra("done", false);
startActivity(intent);

// DetailActivity 里取值
String title = getIntent().getStringExtra("title");
int id = getIntent().getIntExtra("id", -1);
boolean done = getIntent().getBooleanExtra("done", false);

// 传对象：让数据类实现 Serializable（简单）或 Parcelable（性能好，推荐）
intent.putExtra("todo", todo);          // Todo implements Serializable
Todo todo = (Todo) getIntent().getSerializableExtra("todo");` },
      { t: 'table', head: ['方法', '类型', '默认值写法'], rows: [
        ['putExtra / getStringExtra', 'String', 'getStringExtra("key")'],
        ['getIntExtra', 'int', 'getIntExtra("key", 0)'],
        ['getBooleanExtra', 'boolean', 'getBooleanExtra("key", false)'],
        ['getDoubleExtra', 'double', 'getDoubleExtra("key", 0.0)'],
        ['getSerializableExtra', '对象（Serializable）', '需要强转'],
        ['getParcelableExtra', '对象（Parcelable）', '推荐，性能更好']
      ]},
      { t: 'h', text: '2. 接收返回结果：ActivityResultLauncher（现代写法）' },
      { t: 'code', title: '跳过去、拿结果回来', code: `// 在列表页注册一个启动器（就放在字段位置）
private final ActivityResultLauncher<Intent> editLauncher = registerForActivityResult(
        new ActivityResultContracts.StartActivityForResult(),
        result -> {
            if (result.getResultCode() == RESULT_OK && result.getData() != null) {
                String newTitle = result.getData().getStringExtra("newTitle");
                tvTitle.setText(newTitle);
            }
        });

// 打开编辑页
Intent intent = new Intent(this, EditActivity.class);
intent.putExtra("oldTitle", tvTitle.getText().toString());
editLauncher.launch(intent);

// 编辑页里：用户点保存后回传数据
Intent back = new Intent();
back.putExtra("newTitle", etInput.getText().toString());
setResult(RESULT_OK, back);
finish();      // 关闭自己，回到上一页` },
      { t: 'warn', text: '老的 startActivityForResult + onActivityResult 已被废弃，新项目一律用 registerForActivityResult。这两个写法在面试里都会被问到，但要明确知道哪个是过时的。' },
      { t: 'h', text: '3. 隐式 Intent：让别的 App 干活' },
      { t: 'code', title: '常见隐式 Intent', code: `// 打开浏览器
startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse("https://developer.android.com")));

// 拨打电话（需要 CALL_PHONE 权限，或直接跳到拨号盘不需要权限）
startActivity(new Intent(Intent.ACTION_DIAL, Uri.parse("tel:10086")));

// 发送邮件
Intent mail = new Intent(Intent.ACTION_SENDTO, Uri.parse("mailto:hello@example.com"));
mail.putExtra(Intent.EXTRA_SUBJECT, "学习反馈");
startActivity(mail);

// 分享文本
Intent share = new Intent(Intent.ACTION_SEND);
share.setType("text/plain");
share.putExtra(Intent.EXTRA_TEXT, "我在学 Android 开发！");
startActivity(Intent.createChooser(share, "分享到"));

// 打开相机拍照（返回缩略图，正式项目用 FileProvider 存原图）
startActivity(new Intent(MediaStore.ACTION_IMAGE_CAPTURE));` },
      { t: 'tip', text: '隐式 Intent 可能找不到匹配的 App，直接 startActivity 会抛 ActivityNotFoundException 崩溃。稳妥写法：先 resolveActivity(getPackageManager()) != null 判断，或者用 try/catch 包起来。' },
      { t: 'h', text: '4. Fragment 与 Activity 的关系（了解）' },
      { t: 'list', items: [
        'Activity 是一个屏幕，Fragment 是屏幕里可复用的一块 UI（比如底部导航的四个页签）',
        '一个 Activity 可以承载多个 Fragment，Fragment 有自己的生命周期，且受宿主 Activity 影响',
        'Fragment 之间通信用 Fragment Result API：getParentFragmentManager().setFragmentResult(...)',
        '现在很多新项目用 Jetpack Compose + 单 Activity 架构，但 Fragment 在存量项目里极其常见，必须能看懂'
      ]}
    ],
    quiz: [
      { q: '在同一 App 内从 A 页面跳到 B 页面，应该用？', options: ['隐式 Intent', '显式 Intent（指定类名）', '广播', 'Service'], answer: 1, explain: '显式 Intent 通过 new Intent(this, TargetActivity.class) 明确指定目标。' },
      { q: 'getIntent().getIntExtra("id", -1) 里的 -1 是什么？', options: ['下标的起始值', '取不到数据时返回的默认值', '固定写法，没有意义', '最大长度'], answer: 1, explain: '必须提供默认值，否则 key 不存在时无法返回确定的类型。' },
      { q: '接收子页面返回的数据，现代写法是？', options: ['startActivityForResult + onActivityResult', 'registerForActivityResult + ActivityResultLauncher', '用静态变量传递', '用 SharedPreferences'], answer: 1, explain: '前一种已废弃，新项目用 ActivityResult API。' },
      { q: '打开浏览器访问网页属于哪类 Intent？', options: ['显式', '隐式（ACTION_VIEW + Uri）', '不属于 Intent', '必须自己写 WebView'], answer: 1, explain: '不指定具体 App，交给系统匹配能处理这个动作的应用，属于隐式 Intent。' }
    ],
    exercises: [
      {
        id: 'ex-a5-1',
        title: '练习 1：待办详情与编辑',
        level: '中等',
        brief: '给上一章的待办清单接上第二个页面：点条目进入详情页，在详情页编辑标题后返回，列表要同步更新。',
        requirements: [
          '新增 DetailActivity（继承 AppCompatActivity），布局含：显示标题的 TextView、编辑标题的 EditText、保存 Button',
          '列表页点击 item 时用显式 Intent 跳转，并把 position 与当前标题传过去',
          'DetailActivity 在 onCreate 中读取 Intent 数据并显示到界面上',
          '点击保存：用 setResult(RESULT_OK, intent) 把新标题回传，然后 finish()',
          '列表页用 registerForActivityResult 接收结果：用新标题替换原数据并 notifyItemChanged(position)',
          '在 AndroidManifest.xml 中注册 DetailActivity',
          '详情页点返回键（不保存）时列表数据不变'
        ],
        starter: `// MainActivity：注册 launcher + 跳转
private ActivityResultLauncher<Intent> editLauncher;

// DetailActivity：读数据 + 回传
public class DetailActivity extends AppCompatActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_detail);
        // TODO: 读 Intent、绑定保存按钮
    }
}`,
        expectedOutput: `点击列表第 2 条 → 进入详情页，输入框显示“写一个控制台项目”
修改为“写一个记账控制台项目” → 点保存 → 返回列表
列表第 2 条变成“写一个记账控制台项目”，其他条目不变
详情页直接按返回键 → 列表内容不变`,
        keyPoints: [
          { label: '用显式 Intent 跳转', test: 'new\\s+Intent\\s*\\(\\s*[\\w.]+\\.this\\s*,\\s*DetailActivity\\.class' },
          { label: '传参使用了 putExtra', test: 'putExtra\\s*\\(' },
          { label: '详情页用 getIntent 读取', test: 'getIntent\\s*\\(\\s*\\)' },
          { label: '用 registerForActivityResult 注册', test: 'registerForActivityResult' },
          { label: '回传数据用 setResult', test: 'setResult\\s*\\(\\s*RESULT_OK' },
          { label: '保存后调用 finish', test: 'finish\\s*\\(\\s*\\)' },
          { label: '用 launcher.launch 打开页面', test: '\\.launch\\s*\\(' },
          { label: 'Manifest 中注册了 DetailActivity', test: 'activity[\\s\\S]{0,80}DetailActivity|DetailActivity[\\s\\S]{0,80}activity' }
        ],
        hints: [
          '注册启动器要写在字段位置（不能在 onCreate 里注册）：private final ActivityResultLauncher<Intent> launcher = registerForActivityResult(...);',
          '回传：Intent data = new Intent(); data.putExtra("newTitle", text); setResult(RESULT_OK, data); finish();',
          '列表页收到结果后：todos.get(position).setTitle(newTitle); adapter.notifyItemChanged(position);'
        ],
        solution: `// MainActivity.java 关键片段
private final ActivityResultLauncher<Intent> editLauncher = registerForActivityResult(
        new ActivityResultContracts.StartActivityForResult(),
        result -> {
            if (result.getResultCode() == RESULT_OK && result.getData() != null) {
                String newTitle = result.getData().getStringExtra("newTitle");
                int position = result.getData().getIntExtra("position", -1);
                if (position >= 0 && newTitle != null) {
                    todos.get(position).setTitle(newTitle);
                    adapter.notifyItemChanged(position);
                }
            }
        });

// 点击 item 时
Intent intent = new Intent(MainActivity.this, DetailActivity.class);
intent.putExtra("title", todos.get(position).getTitle());
intent.putExtra("position", position);
editLauncher.launch(intent);

// DetailActivity.java
package com.example.todolist;

import android.content.Intent;
import android.os.Bundle;
import android.widget.Button;
import android.widget.EditText;
import androidx.appcompat.app.AppCompatActivity;

public class DetailActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_detail);

        String title = getIntent().getStringExtra("title");
        int position = getIntent().getIntExtra("position", -1);

        EditText etTitle = findViewById(R.id.etTitle);
        Button btnSave = findViewById(R.id.btnSave);
        etTitle.setText(title);
        etTitle.setSelection(etTitle.getText().length());   // 光标移到末尾

        btnSave.setOnClickListener(v -> {
            String newTitle = etTitle.getText().toString().trim();
            if (newTitle.isEmpty()) {
                etTitle.setError("标题不能为空");
                return;
            }
            Intent data = new Intent();
            data.putExtra("newTitle", newTitle);
            data.putExtra("position", position);
            setResult(RESULT_OK, data);
            finish();
        });
    }
}

// AndroidManifest.xml
<activity android:name=".DetailActivity"
    android:exported="false"
    android:label="待办详情" />`
      }
    ],
    checklist: ['会写显式 Intent 跳转与传参', '会用 registerForActivityResult 接收返回结果', '知道三个常见的隐式 Intent 用法']
  }
];


