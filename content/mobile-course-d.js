/* 课程内容 · Android 移动开发（第 17 章 RecyclerView 列表） */
window.COURSE_MOBILE_PART4 = [
  {
    id: 'a4',
    title: 'RecyclerView：列表是 App 的主角',
    minutes: 80,
    tags: ['RecyclerView', 'Adapter', 'ViewHolder', '列表'],
    goals: [
      '理解 RecyclerView 的复用机制，说清 Adapter 与 ViewHolder 的分工',
      '能独立写出一个完整的列表（item 布局 + Adapter + 绑定数据）',
      '会处理列表点击事件、数据更新与多类型 item'
    ],
    lessons: [
      { t: 'p', text: '几乎每个 App 都有列表：微信的会话、淘宝的商品、待办清单。RecyclerView 是 Android 官方推荐的列表控件，核心思想是**回收复用**——屏幕只显示 8 个 item，但数据有 1000 条，滚动时把划出屏幕的 item 拿回来装新数据，而不是创建 1000 个控件。' },
      { t: 'h', text: '1. 三个角色，缺一不可' },
      { t: 'table', head: ['角色', '职责', '比喻'], rows: [
        ['RecyclerView', '负责滚动、复用 item 视图', '展示柜'],
        ['LayoutManager', '决定怎么排：竖排 / 网格 / 瀑布流', '摆放规则'],
        ['Adapter', '把数据翻译成界面，创建并填充 ViewHolder', '翻译官 + 装配工'],
        ['ViewHolder', '缓存一个 item 里所有控件的引用', '零件盒，避免反复 findViewById']
      ]},
      { t: 'h', text: '2. 第一步：加依赖并写 item 布局' },
      { t: 'code', title: 'app/build.gradle', code: `dependencies {
    implementation 'androidx.recyclerview:recyclerview:1.3.2'
    // 用 Material 组件还能顺手拿到 CardView、Snackbar 等
    implementation 'com.google.android.material:material:1.11.0'
}` },
      { t: 'code', title: 'res/layout/item_todo.xml', code: `<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:orientation="horizontal"
    android:gravity="center_vertical"
    android:padding="16dp">

    <TextView
        android:id="@+id/tvTitle"
        android:layout_width="0dp"
        android:layout_height="wrap_content"
        android:layout_weight="1"
        android:textSize="16sp"
        android:text="学 Java 集合" />

    <TextView
        android:id="@+id/tvDate"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:textColor="#888888"
        android:textSize="12sp"
        android:text="2026-09-24" />

</LinearLayout>` },
      { t: 'h', text: '3. 第二步：写数据类与 Adapter' },
      { t: 'code', title: 'Todo.java', code: `public class Todo {
    private final String title;
    private final String date;
    private boolean done;

    public Todo(String title, String date) {
        this.title = title;
        this.date = date;
    }

    public String getTitle() { return title; }
    public String getDate() { return date; }
    public boolean isDone() { return done; }
    public void setDone(boolean done) { this.done = done; }
}` },
      { t: 'code', title: 'TodoAdapter.java（核心）', code: `package com.example.todolist;

import android.graphics.Paint;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import java.util.List;

public class TodoAdapter extends RecyclerView.Adapter<TodoAdapter.TodoViewHolder> {

    // 点击回调：把“点了哪一项”这件事交给 Activity 决定
    public interface OnItemClickListener {
        void onItemClick(int position);
    }

    private final List<Todo> data;
    private final OnItemClickListener listener;

    public TodoAdapter(List<Todo> data, OnItemClickListener listener) {
        this.data = data;
        this.listener = listener;
    }

    // 1) 创建 ViewHolder：把一个 item 布局变成 View
    @NonNull
    @Override
    public TodoViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.item_todo, parent, false);
        return new TodoViewHolder(view);
    }

    // 2) 绑定数据：把第 position 条数据显示到控件上
    @Override
    public void onBindViewHolder(@NonNull TodoViewHolder holder, int position) {
        Todo todo = data.get(position);
        holder.tvTitle.setText(todo.getTitle());
        holder.tvDate.setText(todo.getDate());

        // 已完成的任务加删除线
        if (todo.isDone()) {
            holder.tvTitle.setPaintFlags(
                    holder.tvTitle.getPaintFlags() | Paint.STRIKE_THRU_TEXT_FLAG);
        } else {
            holder.tvTitle.setPaintFlags(
                    holder.tvTitle.getPaintFlags() & (~Paint.STRIKE_THRU_TEXT_FLAG));
        }

        holder.itemView.setOnClickListener(v -> listener.onItemClick(position));
    }

    // 3) 告诉 RecyclerView 一共有多少条数据
    @Override
    public int getItemCount() {
        return data.size();
    }

    // ViewHolder：缓存 item 里的控件
    static class TodoViewHolder extends RecyclerView.ViewHolder {
        final TextView tvTitle;
        final TextView tvDate;

        TodoViewHolder(@NonNull View itemView) {
            super(itemView);
            tvTitle = itemView.findViewById(R.id.tvTitle);
            tvDate = itemView.findViewById(R.id.tvDate);
        }
    }
}` },
      { t: 'h', text: '4. 第三步：在 Activity 里组装' },
      { t: 'code', title: 'MainActivity.java', code: `package com.example.todolist;

import android.os.Bundle;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.DividerItemDecoration;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import java.util.ArrayList;
import java.util.List;

public class MainActivity extends AppCompatActivity {

    private final List<Todo> todos = new ArrayList<>();
    private TodoAdapter adapter;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        // 准备数据
        todos.add(new Todo("学完 Java 集合", "2026-09-24"));
        todos.add(new Todo("写一个控制台项目", "2026-09-25"));
        todos.add(new Todo("开始学 Android", "2026-09-26"));

        RecyclerView rv = findViewById(R.id.rvTodo);
        rv.setLayoutManager(new LinearLayoutManager(this));      // 竖排列表
        rv.addItemDecoration(new DividerItemDecoration(this, DividerItemDecoration.VERTICAL));

        adapter = new TodoAdapter(todos, position -> {
            Todo todo = todos.get(position);
            todo.setDone(!todo.isDone());           // 点击切换完成状态
            adapter.notifyItemChanged(position);    // 只刷新这一项，性能更好
            Toast.makeText(this, todo.getTitle() + (todo.isDone() ? " 已完成" : " 待办"), Toast.LENGTH_SHORT).show();
        });

        rv.setAdapter(adapter);
    }
}` },
      { t: 'h', text: '5. 刷新列表的几种方式' },
      { t: 'table', head: ['方法', '作用', '说明'], rows: [
        ['notifyDataSetChanged()', '刷新全部', '最简单但性能最差，会有闪烁，慎用'],
        ['notifyItemInserted(pos)', '插入一项', '会播放插入动画，推荐'],
        ['notifyItemRemoved(pos)', '删除一项', '注意先删数据再通知，否则下标错位'],
        ['notifyItemChanged(pos)', '刷新一项', '修改单条数据后使用'],
        ['DiffUtil / ListAdapter', '自动算出差异', '数据量大、更新频繁时的标准做法']
      ]},
      { t: 'warn', text: '三个高频坑：① **数据变了但界面没变**——忘了调用 notify 系列方法；② **删除错位**——要先 data.remove(position) 再 notifyItemRemoved(position)；③ **item 点击拿到的 position 是旧的**——快速滑动时应该用 holder.getBindingAdapterPosition() 获取最新位置。' },
      { t: 'tip', text: '列表性能技巧：item 布局层级要浅（少嵌套）、图片加载用 Glide 并设置合适尺寸、onBindViewHolder 里不要做耗时操作（比如读数据库）也不要写复杂判断逻辑。' }
    ],
    quiz: [
      { q: 'RecyclerView 相比老控件 ListView 最大的优势是？', options: ['代码更短', '强制使用 ViewHolder 复用，滚动更流畅', '自带网络请求', '不用写 Adapter'], answer: 1, explain: 'RecyclerView 把“复用”做成了必选项，并解耦了布局方式（LayoutManager）。' },
      { q: 'Adapter 里 getItemCount() 返回什么？', options: ['屏幕可见的 item 数量', '数据总条数', '布局文件数量', '固定返回 10'], answer: 1, explain: '返回数据源的总条数，RecyclerView 据此决定滚动范围。' },
      { q: '删除了 list 中第 0 项后，正确的通知方式是？', options: ['notifyDataSetChanged() 之外别无他法', 'notifyItemRemoved(0)', 'notifyItemInserted(0)', '什么都不用做'], answer: 1, explain: '先 data.remove(0) 再 notifyItemRemoved(0)，界面会有删除动画。' },
      { q: 'ViewHolder 的作用是？', options: ['保存数据', '缓存 item 中的控件引用，避免重复 findViewById', '负责网络请求', '决定列表排布方式'], answer: 1, explain: 'ViewHolder 缓存的这个“盒子”会被复用，所以不要在里面存与 position 绑定的状态。' }
    ],
    exercises: [
      {
        id: 'ex-a4-1',
        title: '练习 1：待办清单列表（静态数据版）',
        level: '中等',
        brief: '用 RecyclerView 做一个待办清单：数据写死 5 条，点击可切换完成状态，长按可删除，顶部显示还剩多少条未完成。',
        requirements: [
          '数据类 Todo：title、date、done，提供 getter/setter',
          'item 布局：左侧标题 + 右侧日期，用一个 TextView 显示，标题已完成时加删除线',
          'TodoAdapter 继承 RecyclerView.Adapter，内部有 ViewHolder 与点击回调接口',
          '点击 item：切换完成状态并 notifyItemChanged(position)',
          '长按 item：删除该条并 notifyItemRemoved(position)（记得先删数据）',
          '界面上方有一个 TextView 显示“剩余 N 条未完成”，每次数据变化后更新',
          '使用 LinearLayoutManager 并加一条分割线'
        ],
        starter: `// activity_main.xml：一个统计 TextView + 一个 RecyclerView
// item_todo.xml：tvTitle + tvDate
// Todo.java：数据类
// TodoAdapter.java：继承 RecyclerView.Adapter
// MainActivity.java：准备数据 + 绑定 Adapter`,
        expectedOutput: `界面：
剩余 5 条未完成
学完 Java 集合            2026-09-24
写一个控制台项目           2026-09-25
开始学 Android            2026-09-26

点击第 1 条 → 标题出现删除线，顶部变成“剩余 4 条未完成”
长按第 2 条 → 该条从列表消失，并带删除动画`,
        keyPoints: [
          { label: 'Adapter 继承了 RecyclerView.Adapter', test: 'extends\\s+RecyclerView\\.Adapter' },
          { label: '实现了 onCreateViewHolder', test: 'onCreateViewHolder' },
          { label: '实现了 onBindViewHolder', test: 'onBindViewHolder' },
          { label: '实现了 getItemCount', test: 'getItemCount' },
          { label: '有 ViewHolder 内部类', test: 'class\\s+\\w+\\s+extends\\s+RecyclerView\\.ViewHolder' },
          { label: '设置了 LayoutManager', test: 'setLayoutManager' },
          { label: '使用了 notifyItemChanged 或 notifyItemRemoved', test: 'notifyItem(Changed|Removed)' },
          { label: '长按事件用 setOnLongClickListener', test: 'setOnLongClickListener' },
          { label: '统计未完成条数并刷新 TextView', test: 'setText\\s*\\([\\s\\S]{0,60}(剩余|未完成)' }
        ],
        hints: [
          '删除时要先 todos.remove(position) 再 adapter.notifyItemRemoved(position)，最后刷新统计文字',
          '长按：holder.itemView.setOnLongClickListener(v -> { listener.onItemLongClick(position); return true; });',
          '统计未完成数量：int count = 0; for (Todo t : todos) if (!t.isDone()) count++;',
          '删除线：setPaintFlags(paintFlags | Paint.STRIKE_THRU_TEXT_FLAG)'
        ],
        solution: `// TodoAdapter.java 关键片段
public class TodoAdapter extends RecyclerView.Adapter<TodoAdapter.VH> {

    public interface Listener {
        void onClick(int position);
        void onLongClick(int position);
    }

    private final List<Todo> data;
    private final Listener listener;

    public TodoAdapter(List<Todo> data, Listener listener) {
        this.data = data;
        this.listener = listener;
    }

    @NonNull
    @Override
    public VH onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View v = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.item_todo, parent, false);
        return new VH(v);
    }

    @Override
    public void onBindViewHolder(@NonNull VH holder, int position) {
        Todo todo = data.get(position);
        holder.tvTitle.setText(todo.getTitle());
        holder.tvDate.setText(todo.getDate());

        int flags = holder.tvTitle.getPaintFlags();
        if (todo.isDone()) {
            holder.tvTitle.setPaintFlags(flags | Paint.STRIKE_THRU_TEXT_FLAG);
        } else {
            holder.tvTitle.setPaintFlags(flags & ~Paint.STRIKE_THRU_TEXT_FLAG);
        }

        holder.itemView.setOnClickListener(v -> listener.onClick(position));
        holder.itemView.setOnLongClickListener(v -> {
            listener.onLongClick(position);
            return true;      // 返回 true 表示事件已消费
        });
    }

    @Override
    public int getItemCount() {
        return data.size();
    }

    static class VH extends RecyclerView.ViewHolder {
        final TextView tvTitle;
        final TextView tvDate;

        VH(@NonNull View itemView) {
            super(itemView);
            tvTitle = itemView.findViewById(R.id.tvTitle);
            tvDate = itemView.findViewById(R.id.tvDate);
        }
    }
}

// MainActivity.java 关键片段
// 在 onCreate 中绑定 RecyclerView
RecyclerView rv = findViewById(R.id.rvTodo);
rv.setLayoutManager(new LinearLayoutManager(this));
rv.addItemDecoration(new DividerItemDecoration(this, DividerItemDecoration.VERTICAL));
rv.setAdapter(adapter);

private void refreshCount() {
    int remain = 0;
    for (Todo t : todos) {
        if (!t.isDone()) remain++;
    }
    tvCount.setText("剩余 " + remain + " 条未完成");
}

adapter = new TodoAdapter(todos, new TodoAdapter.Listener() {
    @Override
    public void onClick(int position) {
        Todo todo = todos.get(position);
        todo.setDone(!todo.isDone());
        adapter.notifyItemChanged(position);
        refreshCount();
    }

    @Override
    public void onLongClick(int position) {
        todos.remove(position);
        adapter.notifyItemRemoved(position);
        refreshCount();
    }
});`
      }
    ],
    checklist: ['能说清 RecyclerView 的复用机制', '能独立写出 Adapter + ViewHolder', '会处理 item 点击事件', '知道四种刷新方式的区别']
  }
];



