/* 课程内容 · Android 移动开发（第 16 章 布局与常用控件） */
window.COURSE_MOBILE_PART3 = [
  {
    id: 'a3',
    title: '布局与常用控件',
    minutes: 75,
    tags: ['XML 布局', '控件', 'ConstraintLayout', '点击事件'],
    goals: [
      '掌握 LinearLayout、ConstraintLayout、FrameLayout 的适用场景',
      '熟练使用 TextView / EditText / Button / ImageView / Switch / ProgressBar',
      '会写点击事件，并学会读取用户输入、校验输入'
    ],
    lessons: [
      { t: 'p', text: 'Android 界面 = XML 描述结构 + Java 控制行为。控件（View）负责显示，布局（ViewGroup）负责排列。新手最常见的抱怨是“界面看起来很乱”，根源通常是没理解**宽高设置的三种取值**和**约束关系**。' },
      { t: 'h', text: '1. 宽高与单位' },
      { t: 'table', head: ['取值', '含义'], rows: [
        ['match_parent', '填满父容器（旧写法 fill_parent 已废弃）'],
        ['wrap_content', '刚好包住自己的内容'],
        ['具体数值 + 单位', '例如 120dp、24sp'],
        ['dp（dip）', '密度无关像素，用于**尺寸**：宽度、间距、圆角'],
        ['sp', '缩放无关像素，用于**文字大小**，会跟随系统字体缩放'],
        ['px', '物理像素，几乎不用（不同屏幕 dpi 不同会变形）']
      ]},
      { t: 'warn', text: '尺寸一律用 dp，字号一律用 sp。用 px 会导致不同分辨率的手机显示大小完全不一致；字号用 dp 则用户调大系统字体时不会跟着变大，无障碍体验很差。' },
      { t: 'h', text: '2. 三种常用布局' },
      { t: 'code', title: 'LinearLayout：一行或一列依次排列', code: `<LinearLayout
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:orientation="vertical"
    android:padding="16dp">

    <TextView
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="用户名" />

    <EditText
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:hint="请输入用户名"
        android:layout_marginTop="8dp" />

</LinearLayout>

说明：orientation 控制竖排 vertical 或横排 horizontal；
padding 是内边距，layout_margin 是外边距。` },
      { t: 'code', title: 'ConstraintLayout：靠约束定位（推荐）', code: `<androidx.constraintlayout.widget.ConstraintLayout
    android:layout_width="match_parent"
    android:layout_height="match_parent">

    <TextView
        android:id="@+id/tvTitle"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="登录"
        android:textSize="28sp"
        app:layout_constraintTop_toTopOf="parent"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintEnd_toEndOf="parent" />

    <EditText
        android:id="@+id/etUser"
        android:layout_width="0dp"
        android:layout_height="wrap_content"
        android:layout_marginHorizontal="24dp"
        android:hint="用户名"
        app:layout_constraintTop_toBottomOf="@id/tvTitle"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintEnd_toEndOf="parent" />

    <Button
        android:id="@+id/btnLogin"
        android:layout_width="0dp"
        android:layout_height="wrap_content"
        android:text="登录"
        app:layout_constraintTop_toBottomOf="@id/etUser"
        app:layout_constraintStart_toStartOf="@id/etUser"
        app:layout_constraintEnd_toEndOf="@id/etUser" />

</androidx.constraintlayout.widget.ConstraintLayout>

要点：layout_width 写成 0dp 表示宽度由左右约束决定；
layout_constraintXxx_toXxxOf 就是“我的某一边对齐到另一个控件的某一边”。` },
      { t: 'table', head: ['布局', '特点', '什么时候用'], rows: [
        ['LinearLayout', '线性排列，可用权重 weight 分配剩余空间', '简单的表单、一行图标加文字'],
        ['ConstraintLayout', '约束定位，层级扁平，渲染性能好', '复杂界面首选，官方推荐'],
        ['FrameLayout', '层叠摆放，后加的盖在上面', 'Fragment 容器、加载中遮罩'],
        ['RelativeLayout', '相对定位（老项目常见）', '了解即可，新项目用 ConstraintLayout']
      ]},
      { t: 'h', text: '3. 常用控件速查' },
      { t: 'table', head: ['控件', '作用', '关键属性 / 方法'], rows: [
        ['TextView', '显示文字', 'setText、textSize、textColor、setVisibility'],
        ['EditText', '输入文字', 'hint、inputType（textPassword / number）、getText().toString()'],
        ['Button', '按钮', 'setOnClickListener、setEnabled'],
        ['ImageView', '显示图片', 'src、scaleType、setImageResource'],
        ['CheckBox', '多选框', 'isChecked、setOnCheckedChangeListener'],
        ['Switch', '开关', 'isChecked、setOnCheckedChangeListener'],
        ['RadioGroup + RadioButton', '单选框', 'getCheckedRadioButtonId()'],
        ['ProgressBar', '进度条 / 加载圈', 'setVisibility(View.VISIBLE)、setProgress'],
        ['ScrollView', '内容超出一屏时滚动', '只能有一个直接子 View'],
        ['SeekBar', '拖动条', 'setOnSeekBarChangeListener、getProgress']
      ]},
      { t: 'h', text: '4. 读取与校验用户输入' },
      { t: 'code', title: '登录表单：读取、校验、提示', code: `package com.example.form;

import android.os.Bundle;
import android.text.TextUtils;
import android.widget.Button;
import android.widget.CheckBox;
import android.widget.EditText;
import android.widget.ProgressBar;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        EditText etUser = findViewById(R.id.etUser);
        EditText etPwd = findViewById(R.id.etPwd);
        CheckBox cbAgree = findViewById(R.id.cbAgree);
        Button btnLogin = findViewById(R.id.btnLogin);
        ProgressBar loading = findViewById(R.id.loading);

        btnLogin.setOnClickListener(v -> {
            String user = etUser.getText().toString().trim();
            String pwd = etPwd.getText().toString().trim();

            // 校验顺序：先判空，再判格式，最后判勾选
            if (TextUtils.isEmpty(user)) {
                etUser.setError("用户名不能为空");
                return;
            }
            if (pwd.length() < 6) {
                etPwd.setError("密码至少 6 位");
                return;
            }
            if (!cbAgree.isChecked()) {
                Toast.makeText(this, "请先同意用户协议", Toast.LENGTH_SHORT).show();
                return;
            }

            loading.setVisibility(ProgressBar.VISIBLE);   // 显示加载圈
            Toast.makeText(this, "登录中：" + user, Toast.LENGTH_SHORT).show();
            // 真实项目这里会调用网络接口，成功后跳转下一页
        });
    }
}` },
      { t: 'code', title: 'strings.xml 与圆角按钮背景', code: `<!-- res/values/strings.xml -->
<resources>
    <string name="app_name">表单练习</string>
    <string name="hint_user">用户名</string>
    <string name="hint_pwd">密码（至少 6 位）</string>
    <string name="btn_login">登录</string>
</resources>

<!-- res/drawable/bg_button.xml：圆角按钮背景 -->
<shape xmlns:android="http://schemas.android.com/apk/res/android"
    android:shape="rectangle">
    <solid android:color="#3F51B5" />
    <corners android:radius="24dp" />
</shape>

用法：在按钮上写 android:background="@drawable/bg_button"` },
      { t: 'tip', text: '写界面时的自查清单：① 控件有没有设 id？② 单位是不是 dp/sp？③ 文字有没有抽到 strings.xml？④ 需要滚动的内容有没有放进 ScrollView？⑤ 输入框有没有设 inputType（否则密码会明文显示）？' }
    ],
    quiz: [
      { q: 'Android 中设置间距、宽度应该用什么单位？', options: ['px', 'dp', 'sp', 'pt'], answer: 1, explain: '尺寸用 dp；文字大小用 sp。' },
      { q: '在 ConstraintLayout 中，让控件宽度由左右约束决定，layout_width 应该写？', options: ['match_parent', 'wrap_content', '0dp', '100dp'], answer: 2, explain: '0dp 表示 match_constraint，尺寸由约束决定。' },
      { q: '获取 EditText 里的文字应该怎么写？', options: ['getText()', 'getText().toString()', 'toString()', 'getValue()'], answer: 1, explain: 'getText() 返回 Editable，需要 toString() 转成 String。' },
      { q: '密码输入框应该加什么属性？', options: ['android:password="true"', 'android:inputType="textPassword"', 'android:type="pwd"', '不需要设置'], answer: 1, explain: 'inputType 决定软键盘类型与显示方式，密码必须用 textPassword。' }
    ],
    exercises: [
      {
        id: 'ex-a3-1',
        title: '练习 1：注册表单页',
        level: '中等',
        brief: '用 ConstraintLayout 做一张注册表单，包含完整校验逻辑和一个可以动态显示的加载圈。',
        requirements: [
          '使用 ConstraintLayout，包含：标题 TextView、用户名 EditText、密码 EditText（textPassword）、确认密码 EditText、Switch 同意协议、注册 Button、ProgressBar',
          '所有文案放进 strings.xml，尺寸用 dp/sp',
          '点击注册时依次校验：用户名非空 → 密码至少 6 位 → 两次密码一致 → 必须勾选协议；每项失败用 setError 或 Toast 给出具体提示',
          '用户名和密码都合法时，ProgressBar 变为可见（VISIBLE），并 Toast “注册中...”',
          '用 TextWatcher 监听用户名输入：长度达到 3 时按钮才可用（setEnabled），否则按钮置灰'
        ],
        starter: `<!-- activity_main.xml：ConstraintLayout 骨架 -->
<androidx.constraintlayout.widget.ConstraintLayout ...>
    <!-- TODO: 放 7 个控件并设置约束 -->
</androidx.constraintlayout.widget.ConstraintLayout>

public class MainActivity extends AppCompatActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        // TODO: 校验逻辑 + TextWatcher
    }
}`,
        expectedOutput: `场景 1：用户名为空 → 用户名输入框提示“用户名不能为空”
场景 2：密码 5 位 → 提示“密码至少 6 位”
场景 3：两次密码不一致 → Toast“两次密码输入不一致”
场景 4：未勾选协议 → Toast“请先同意用户协议”
场景 5：全部合法 → 显示加载圈，Toast“注册中...”
用户名输入 2 个字符时“注册”按钮不可点击；输入满 3 个字符后按钮可点击`,
        keyPoints: [
          { label: '通过 R.id 引用布局里的控件', test: 'R\\.id\\.\\w+' },
          { label: '用 findViewById 初始化控件', test: 'findViewById\\s*\\(\\s*R\\.id' },
          { label: '校验了两次密码是否一致', test: 'pwd2|equals\\s*\\(\\s*pwd' },
          { label: '使用 setError 做字段校验', test: 'setError\\s*\\(' },
          { label: '用 Switch 或 CheckBox 判断协议', test: 'isChecked' },
          { label: 'ProgressBar 使用 setVisibility', test: 'setVisibility' },
          { label: '用 TextWatcher 监听输入', test: 'TextWatcher|addTextChangedListener' },
          { label: '按钮 setEnabled 控制可用状态', test: 'setEnabled' }
        ],
        hints: [
          'TextWatcher 有三个方法：beforeTextChanged、onTextChanged、afterTextChanged，通常只写 afterTextChanged',
          '监听写法：etUser.addTextChangedListener(new TextWatcher() { ... public void afterTextChanged(Editable s) { btnRegister.setEnabled(s.toString().trim().length() >= 3); } });',
          '加载圈初始要 android:visibility="gone"，点击注册时才改成 VISIBLE'
        ],
        solution: `package com.example.signup;

import android.os.Bundle;
import android.text.Editable;
import android.text.TextUtils;
import android.text.TextWatcher;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ProgressBar;
import android.widget.Switch;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {

    private EditText etUser;
    private EditText etPwd;
    private EditText etPwd2;
    private Switch swAgree;
    private Button btnRegister;
    private ProgressBar loading;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        etUser = findViewById(R.id.etUser);
        etPwd = findViewById(R.id.etPwd);
        etPwd2 = findViewById(R.id.etPwd2);
        swAgree = findViewById(R.id.swAgree);
        btnRegister = findViewById(R.id.btnRegister);
        loading = findViewById(R.id.loading);

        btnRegister.setEnabled(false);
        loading.setVisibility(View.GONE);

        etUser.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {
            }

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {
            }

            @Override
            public void afterTextChanged(Editable s) {
                btnRegister.setEnabled(s.toString().trim().length() >= 3);
            }
        });

        btnRegister.setOnClickListener(v -> {
            String user = etUser.getText().toString().trim();
            String pwd = etPwd.getText().toString().trim();
            String pwd2 = etPwd2.getText().toString().trim();

            if (TextUtils.isEmpty(user)) {
                etUser.setError("用户名不能为空");
                return;
            }
            if (pwd.length() < 6) {
                etPwd.setError("密码至少 6 位");
                return;
            }
            if (!pwd.equals(pwd2)) {
                Toast.makeText(this, "两次密码输入不一致", Toast.LENGTH_SHORT).show();
                return;
            }
            if (!swAgree.isChecked()) {
                Toast.makeText(this, "请先同意用户协议", Toast.LENGTH_SHORT).show();
                return;
            }

            loading.setVisibility(View.VISIBLE);
            btnRegister.setEnabled(false);
            Toast.makeText(this, "注册中...", Toast.LENGTH_SHORT).show();
        });
    }
}`
      }
    ],
    checklist: ['分清 dp 与 sp 的用途', '会用 ConstraintLayout 写约束', '会读 EditText 并做输入校验', '完成注册表单练习']
  }
];


