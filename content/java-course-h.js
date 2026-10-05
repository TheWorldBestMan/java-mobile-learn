/* 课程内容 · Java 深挖（第 16 章 多线程与并发） */
window.COURSE_JAVA_PART8 = [
  {
    id: 'j16',
    title: '多线程与并发（深入）',
    minutes: 130,
    tags: ['线程', '并发', 'synchronized', '线程池', 'CAS', '阻塞队列'],
    goals: [
      '说清进程与线程、并发与并行的区别',
      '会用三种方式创建线程，并掌握 sleep/join/interrupt',
      '理解竞态条件，能用 synchronized 与原子类保证线程安全',
      '知道 volatile 能做什么、不能做什么',
      '会用 ReentrantLock、阻塞队列、线程池，并能说出线程池的参数',
      '认识常见的并发容器与工具类，避开死锁与线程池配置的坑'
    ],
    lessons: [
      { t: 'p', text: '多线程让程序“同时做几件事”：下载图片的同时还能滑动列表、后台算数据的同时界面不卡。但多线程也是 bug 的重灾区——**同一份数据被多个线程同时修改，就可能出错**。这一章从“怎么创建线程”讲到“怎么保证线程安全”，最后落到工程上最常用的线程池。' },
      { t: 'warn', text: '**关于页面里的运行：**浏览器是单线程环境，本课程的运行器把线程做成了“**按创建顺序依次执行完**”的模拟。所以你看到的输出是**理想化、确定性的**，不会出现真实的交错、抢锁和竞态。想观察真实并发行为（比如交替打印、丢更新），请把代码复制到 IDEA 里运行——这一点在下面每个示例里也会提示。' },
      { t: 'h', text: '1. 进程、线程、并发与并行' },
      { t: 'table', head: ['概念', '说明', '例子'], rows: [
        ['进程', '操作系统分配资源的最小单位，一个程序至少一个进程', '打开微信 = 一个进程'],
        ['线程', 'CPU 调度的最小单位，一个进程可以有多个线程，共享进程内存', '微信里收消息、下载文件、刷新界面各一个线程'],
        ['并发', '多个任务**交替**执行（单核也能并发，靠快速切换）', '一个人轮流接两个电话'],
        ['并行', '多个任务**同时**执行（需要多核）', '两个人各接一个电话'],
        ['上下文切换', 'CPU 从一个线程切到另一个线程要保存/恢复状态，有开销', '线程不是越多越好'],
        ['主线程', 'Java 程序启动时执行 main 的那个线程；Android 里它负责界面', '主线程做耗时操作 = 界面卡死']
      ]},
      { t: 'tip', text: '为什么需要多线程？两类场景：① **等待型任务**（网络、文件、数据库）——线程阻塞时 CPU 闲着，不如去干别的；② **计算型任务**——把大任务切成几块并行算（需要多核才有收益）。' },
      { t: 'h', text: '2. 创建线程的三种方式' },
      { t: 'code', title: '方式一：继承 Thread（不推荐）', code: `/**
 * 创建线程方式一：继承 Thread 并重写 run()。
 * 缺点：Java 只能单继承，继承 Thread 后就不能再继承别的类；而且"任务"和"线程"绑死了。
 * 注意：启动必须调用 start()，它才会开新线程并回调 run()；直接调 run() 只是普通方法调用。
 */
public class ByThread {
    public static void main(String[] args) {
        // 创建两个线程对象（此时只是对象，还没有真正的线程）
        Thread t1 = new MyThread("线程A");
        Thread t2 = new MyThread("线程B");

        t1.start();     // 启动线程 A：由 JVM 新开一个线程去执行 run()
        t2.start();     // 启动线程 B
        System.out.println("main 线程结束");   // main 不会等 t1/t2，所以这行可能先打印
    }
}

class MyThread extends Thread {

    MyThread(String name) {
        super(name);               // 调用父类 Thread 的构造器设置线程名
    }

    @Override
    public void run() {            // 线程要执行的任务写在这里，方法签名必须完全一致
        for (int i = 1; i <= 2; i++) {
            // getName() 是 Thread 提供的方法，返回线程名；日志里带上线程名非常利于排查
            System.out.println(getName() + " 执行第 " + i + " 次");
        }
    }
}` },
      { t: 'code', title: '方式二：实现 Runnable（推荐）', code: `/**
 * 创建线程方式二：实现 Runnable 接口。
 * 好处：任务（Runnable）与线程（Thread）解耦，同一个任务可以交给多个线程执行，
 * 而且类还可以继续继承别的父类。
 */
public class ByRunnable {
    public static void main(String[] args) {
        Runnable task = new PrintTask();       // 任务对象：只描述"要做什么"

        // 把同一个任务交给两个线程执行：两个线程各跑一遍 run()
        Thread t1 = new Thread(task, "线程A");   // 第二个参数是线程名
        Thread t2 = new Thread(task, "线程B");
        t1.start();
        t2.start();
        System.out.println("main 线程结束");
    }
}

class PrintTask implements Runnable {
    @Override
    public void run() {
        for (int i = 1; i <= 2; i++) {
            // Runnable 里没有 getName()，要先用 Thread.currentThread() 拿到当前线程
            System.out.println(Thread.currentThread().getName() + " 执行第 " + i + " 次");
        }
    }
}` },
      { t: 'code', title: '方式三：lambda（最简洁，Java 8+）', code: `/**
 * 创建线程方式三：lambda 表达式（实际项目最常用）。
 * 原理：Runnable 只有一个抽象方法 run()，属于"函数式接口"，
 * 所以可以用 lambda 直接写成"参数 -> 方法体"，省掉类定义。
 */
public class ByLambda {
    public static void main(String[] args) {
        // () 表示 run() 没有参数；-> 后面是方法体
        Runnable task = () -> {
            for (int i = 1; i <= 2; i++) {
                System.out.println(Thread.currentThread().getName() + " 执行第 " + i + " 次");
            }
        };

        // new Thread(Runnable, 线程名)：一行创建 + 启动
        new Thread(task, "线程A").start();
        new Thread(task, "线程B").start();
        System.out.println("main 线程结束");
    }
}` },
      { t: 'table', head: ['对比', '继承 Thread', '实现 Runnable', 'lambda'], rows: [
        ['代码量', '多', '中', '最少'],
        ['能否再继承别的类', '不能（Java 单继承）', '可以', '可以'],
        ['任务与线程是否解耦', '否（任务和线程绑死）', '是', '是'],
        ['推荐度', '不推荐', '推荐', '**最推荐**']
      ]},
      { t: 'warn', text: '两个新手必踩的坑：① 调用 `run()` 只是**普通方法调用**，还在当前线程里执行，必须调 `start()` 才会开新线程；② 同一个 Thread 对象**只能 start 一次**，第二次会抛 IllegalThreadStateException。' },
      { t: 'h', text: '3. 线程的常用方法与生命周期' },
      { t: 'table', head: ['状态', '含义', '怎么进入'], rows: [
        ['NEW', '已创建未启动', 'new Thread(...)'],
        ['RUNNABLE', '可运行（含正在运行和等待 CPU）', 'start()'],
        ['BLOCKED', '等待锁', '争抢 synchronized 锁失败'],
        ['WAITING', '无限等待', 'wait()、join() 无参'],
        ['TIMED_WAITING', '限时等待', 'sleep(ms)、wait(ms)、join(ms)'],
        ['TERMINATED', '已结束', 'run() 执行完']
      ]},
      { t: 'code', title: 'sleep / join / 线程名 / 当前线程', code: `/**
 * 演示：线程的常用方法与状态。
 * join()：让当前线程"插队等待"目标线程结束 —— 主线程汇总结果前经常要用。
 * getState()：查看线程状态（NEW / RUNNABLE / BLOCKED / WAITING / TIMED_WAITING / TERMINATED）。
 * sleep(ms)：让当前线程休眠指定毫秒，会抛 InterruptedException，必须处理。
 */
public class ThreadMethodDemo {
    public static void main(String[] args) throws Exception {
        // 用 lambda 定义任务，并给线程起名字（起名字是为了日志好排查）
        Thread worker = new Thread(() -> {
            for (int i = 1; i <= 3; i++) {
                System.out.println("工作线程第 " + i + " 步（线程名：" + Thread.currentThread().getName() + "）");
            }
        }, "工作线程");

        // 还没 start()：状态是 NEW
        System.out.println("启动前状态：" + worker.getState());

        worker.start();          // 启动：状态变为 RUNNABLE
        worker.join();           // main 在这里等待，直到 worker 执行完才继续
        // 已经执行完：状态是 TERMINATED
        System.out.println("结束后状态：" + worker.getState());

        // 当前线程就是 main
        System.out.println("当前线程：" + Thread.currentThread().getName());
    }
}` },
      { t: 'table', head: ['方法', '作用', '注意'], rows: [
        ['start()', '启动新线程', '最终会调用 run()'],
        ['run()', '线程任务体', '直接调用不会开新线程'],
        ['sleep(ms)', '让当前线程休眠', '会抛 InterruptedException，并释放 CPU 但不释放锁'],
        ['join()', '等待该线程结束', '常用于“等所有子任务做完再汇总”'],
        ['interrupt()', '打断线程', '只是设置标记，需要目标线程自己响应（如捕获异常后退出）'],
        ['setName/getName', '设置/获取线程名', '日志里非常有用，一定要起有意义的名字'],
        ['setDaemon(true)', '设为守护线程', '主线程结束就跟着结束，适合后台心跳'],
        ['yield()', '让出 CPU', '不保证生效，实际很少用']
      ]},
      { t: 'h', text: '4. 线程安全问题：竞态条件' },
      { t: 'code', title: '看似正确的自增，在多线程下会丢更新（这段请在 IDEA 里跑）', noRun: true, code: `/**
 * 反例演示：竞态条件（race condition）。
 * count++ 看起来是一步，实际是三步：读取 count → 加 1 → 写回 count。
 * 两个线程可能都读到旧值 100，各自算出 101 再写回，结果只加了 1 次 —— 这就叫"丢更新"。
 * 为什么会丢：这三个步骤之间可能被 CPU 切走，不是原子操作。
 */
public class RaceCondition {
    static int count = 0;      // 共享的可变数据（三个条件同时满足，就必须做同步）

    public static void main(String[] args) throws Exception {
        Runnable task = () -> {
            for (int i = 0; i < 100000; i++) {
                count++;       // 非原子操作，多线程下会丢更新
            }
        };

        Thread t1 = new Thread(task);
        Thread t2 = new Thread(task);
        t1.start();
        t2.start();
        t1.join();                 // 等两个线程都跑完，再读结果
        t2.join();

        // 期望 200000，实际往往小于它，而且每次运行的数字都不一样
        System.out.println("最终结果：" + count);
    }
}` },
      { t: 'p', text: '为什么 `count++` 会丢更新？它其实是三步：**读取 count → 加 1 → 写回 count**。两个线程可能都读到 100，各自算出 101 再写回，结果只加了 1 次。这就是**竞态条件**（race condition）。' },
      { t: 'warn', text: '判断一段代码是否线程安全，看三个条件是否同时成立：**多个线程**、**共享同一份数据**、**至少一个线程在修改它**。三者齐了就必须做同步。局部变量（在每个线程自己的栈里）天然安全。' },
      { t: 'h', text: '5. synchronized：最常用的同步手段' },
      { t: 'code', title: '售票窗口：用同步代码块保证不超卖', code: `/**
 * 演示：用 synchronized 同步代码块解决竞态条件。
 * 关键点：多个线程必须争抢"同一把锁"，这里用的是类锁 TicketSystem.class。
 * 把"判断余票 + 卖票"这两步放进同一个同步块，保证不会被别的线程插进来。
 */
public class TicketSystem {
    private static int tickets = 5;      // 共享资源：余票

    public static void main(String[] args) throws Exception {
        Runnable seller = () -> {
            while (true) {
                // synchronized (锁对象) { ... }：同一时刻只有一个线程能进入这段代码
                // 注意：锁对象必须是所有线程共享的同一个对象，这里用类锁最直观
                synchronized (TicketSystem.class) {
                    if (tickets <= 0) {
                        break;               // 没票了：结束这个线程的循环
                    }
                    // 先打印再用 tickets--（先取值再自减），保证输出的票号不重复
                    System.out.println(Thread.currentThread().getName() + " 卖出第 " + tickets-- + " 张票");
                }   // 出了大括号自动释放锁
            }
        };

        Thread t1 = new Thread(seller, "窗口A");
        Thread t2 = new Thread(seller, "窗口B");
        t1.start();
        t2.start();
        t1.join();      // 等两个窗口都卖完
        t2.join();
        System.out.println("售票结束，剩余：" + tickets);   // 一定是 0，不会是负数
    }
}` },
      { t: 'table', head: ['写法', '锁对象是谁', '说明'], rows: [
        ['synchronized 实例方法', 'this（当前对象）', '同一个对象的多个同步方法互斥'],
        ['synchronized 静态方法', 'Class 对象（如 TicketSystem.class）', '所有对象共享这一把锁'],
        ['synchronized (obj) { }', '括号里的对象', '粒度最灵活，推荐用它保护具体数据'],
        ['同步代码块里的 this', '当前对象', '等价于同步实例方法']
      ]},
      { t: 'warn', text: '三个常见错误：① **锁的对象不一致**（一个线程锁 `this`，另一个锁 `TicketSystem.class`，等于没锁）；② **锁粒度太大**把整个方法都锁住，性能很差；③ 锁字符串常量、Integer 等共享对象，可能被别人也锁着。原则是：**只锁真正共享的那份数据，并且所有修改它的地方用同一把锁**。' },
      { t: 'h', text: '6. volatile、原子类与 JMM' },
      { t: 'table', head: ['特性', '含义', '谁来保证'], rows: [
        ['原子性', '一个操作要么全做完、要么完全没做', 'synchronized、原子类、Lock'],
        ['可见性', '一个线程改了值，别的线程能立刻看到', 'volatile、synchronized、Lock'],
        ['有序性', '禁止指令重排（对多线程产生意外顺序）', 'volatile、synchronized']
      ]},
      { t: 'code', title: 'AtomicInteger：用 CAS 做无锁自增', code: `import java.util.concurrent.atomic.AtomicInteger;

/**
 * 演示：用原子类替代锁来保证计数安全。
 * 原理：CAS（Compare And Swap）—— "如果当前值还是我看到的旧值，就更新成新值，否则重试"。
 * 优点：不加锁，性能好；缺点：只能做单个变量的原子操作，不适合"一组操作要整体互斥"的场景。
 */
public class AtomicDemo {
    static AtomicInteger count = new AtomicInteger(0);   // 原子计数器，初值 0

    public static void main(String[] args) throws Exception {
        Runnable task = () -> {
            for (int i = 0; i < 3; i++) {
                count.incrementAndGet();   // 安全版 count++：先加 1，返回新值
            }
        };

        Thread t1 = new Thread(task);
        Thread t2 = new Thread(task);
        t1.start();
        t2.start();
        t1.join();
        t2.join();

        System.out.println("两个线程各加 3 次，结果：" + count.get());   // 一定是 6

        // getAndAdd：返回旧值，再加；addAndGet 则是先加再返回新值（顺序差别很容易考）
        System.out.println("getAndAdd(10) 返回旧值：" + count.getAndAdd(10) + "，之后是 " + count.get());

        // compareAndSet(期望值, 新值)：只有当前值等于期望值时才更新，成功返回 true
        boolean ok = count.compareAndSet(16, 100);
        System.out.println("CAS 是否成功：" + ok + "，当前值：" + count.get());
    }
}` },
      { t: 'warn', text: '**volatile 只保证可见性和有序性，不保证原子性**。`volatile int count; count++;` 依然是不安全的！volatile 的典型用途是“一个线程改标记、另一个线程看到就退出”，而不是计数。' },
      { t: 'table', head: ['需求', '选择'], rows: [
        ['简单计数、累加', 'AtomicInteger / AtomicLong'],
        ['一组操作要整体互斥', 'synchronized 或 Lock'],
        ['只做状态标记、开关', 'volatile'],
        ['高并发下的计数（如统计 QPS）', 'LongAdder（比 AtomicLong 更快）']
      ]},
      { t: 'h', text: '7. Lock、死锁与避免' },
      { t: 'code', title: 'ReentrantLock：更灵活的锁（记得 finally 解锁）', code: `import java.util.concurrent.locks.ReentrantLock;

/**
 * 演示：用 ReentrantLock 手动加锁。
 * 与 synchronized 的区别：需要自己 lock() 和 unlock()，但支持 tryLock 超时、可中断、公平锁、多个 Condition。
 * 铁律：unlock() 一定要写在 finally 里，否则一旦抛异常，锁就永远不会释放（其他线程全部卡死）。
 */
public class LockDemo {
    // 锁对象：所有线程必须用同一把锁，所以声明成 static final
    private static final ReentrantLock lock = new ReentrantLock();
    private static int balance = 100;      // 共享资源：余额

    public static void main(String[] args) throws Exception {
        Runnable withdraw = () -> {
            lock.lock();                   // 加锁：拿不到就在这里等待
            try {
                // 临界区：判断和修改余额必须一起完成，否则会出现超取
                if (balance >= 30) {
                    balance -= 30;
                    System.out.println(Thread.currentThread().getName() + " 取款成功，余额 " + balance);
                } else {
                    System.out.println(Thread.currentThread().getName() + " 余额不足，余额 " + balance);
                }
            } finally {
                lock.unlock();             // 必须解锁，且必须放在 finally 里
            }
        };

        new Thread(withdraw, "线程A").start();
        new Thread(withdraw, "线程B").start();
        Thread.sleep(10);                  // 等两个线程跑完再看结果
        System.out.println("最终余额：" + balance);
    }
}` },
      { t: 'table', head: ['对比', 'synchronized', 'ReentrantLock'], rows: [
        ['使用难度', '简单，自动加锁解锁', '需要手动 lock/unlock，别忘了 finally'],
        ['是否可中断等待', '不可以', 'lockInterruptibly() 可以'],
        ['能否尝试获取锁', '不能', 'tryLock() 可以，拿不到就去做别的事'],
        ['能否公平锁', '只能非公平', 'new ReentrantLock(true) 支持公平'],
        ['条件变量', 'wait/notify', 'Condition，可以有多个等待队列'],
        ['选择', '日常够用，优先它', '需要超时/中断/多条件时用']
      ]},
      { t: 'list', items: [
        '**死锁的四个必要条件**：互斥、持有并等待、不可剥夺、循环等待——四个全满足才会死锁',
        '**最实用的避免办法**：让所有线程**按同一顺序**获取多把锁（比如都先锁 A 再锁 B，不要一个先 B）',
        '其他手段：用 `tryLock(timeout)` 拿不到就放弃重试；缩小锁范围；尽量只锁一个资源',
        '发现死锁怎么办：`jstack <pid>` 或 IDE 的线程转储会明确打印 “Found one Java-level deadlock”'
      ]},
      { t: 'h', text: '8. 生产者消费者：wait/notify 与阻塞队列' },
      { t: 'code', title: 'wait/notify 版本（请在 IDEA 里运行）', noRun: true, code: `/**
 * 演示：用 wait/notify 实现生产者消费者（经典写法，但代码容易写错）。
 * 三条规则：
 * ① wait/notify 必须在 synchronized 块里调用（否则抛 IllegalMonitorStateException）；
 * ② 判断条件必须用 while 而不是 if —— 防止"虚假唤醒"；
 * ③ 改完共享状态后要 notifyAll() 唤醒对方。
 */
public class WaitNotifyDemo {
    private static final Object lock = new Object();   // 锁对象：生产和消费都用它
    private static int item = 0;                       // 共享数据
    private static boolean hasItem = false;            // 是否已有产品

    public static void main(String[] args) {
        Thread producer = new Thread(() -> {
            for (int i = 1; i <= 5; i++) {
                synchronized (lock) {
                    // 用 while 反复检查：被唤醒后条件可能又变了，不能只判断一次
                    while (hasItem) {
                        try {
                            lock.wait();          // 放弃锁并等待，直到有人 notify
                        } catch (InterruptedException e) {
                            Thread.currentThread().interrupt();   // 恢复中断标记，最佳实践
                        }
                    }
                    item = i;                     // 生产
                    hasItem = true;
                    System.out.println("生产：" + item);
                    lock.notifyAll();             // 唤醒等待的消费者
                }
            }
        });

        Thread consumer = new Thread(() -> {
            for (int i = 1; i <= 5; i++) {
                synchronized (lock) {
                    while (!hasItem) {            // 没有产品就等
                        try {
                            lock.wait();
                        } catch (InterruptedException e) {
                            Thread.currentThread().interrupt();
                        }
                    }
                    System.out.println("消费：" + item);
                    hasItem = false;              // 消费完清标记
                    lock.notifyAll();             // 唤醒生产者
                }
            }
        });

        producer.start();
        consumer.start();
    }
}` },
      { t: 'code', title: 'BlockingQueue 版本：工程上更推荐', code: `import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;

/**
 * 演示：用阻塞队列实现生产者消费者（工程上的首选写法）。
 * 阻塞队列自带"队列满就等、队列空就等"的能力，所以不需要手写 wait/notify，
 * 代码量少、也不会写出虚假唤醒之类的 bug。
 */
public class BlockingQueueDemo {
    public static void main(String[] args) throws Exception {
        // 容量 3：满了生产者会阻塞，空了消费者会阻塞
        BlockingQueue<Integer> queue = new LinkedBlockingQueue<>(3);

        Thread producer = new Thread(() -> {
            try {
                for (int i = 1; i <= 3; i++) {
                    queue.put(i);                       // 队列满时自动阻塞等待
                    System.out.println("生产：" + i + "，队列大小 " + queue.size());
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();     // 被中断就恢复标记，让上层知道
            }
        }, "生产者");

        Thread consumer = new Thread(() -> {
            try {
                for (int i = 1; i <= 3; i++) {
                    Integer v = queue.take();           // 队列空时自动阻塞等待
                    System.out.println("消费：" + v + "，队列大小 " + queue.size());
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }, "消费者");

        producer.start();
        consumer.start();
        producer.join();     // 等生产者结束
        consumer.join();     // 等消费者结束
        System.out.println("结束，队列剩余：" + queue.size());   // 一定是 0
    }
}` },
      { t: 'table', head: ['对比', 'wait/notify', 'BlockingQueue'], rows: [
        ['代码量', '多，容易写错', '少，put/take 自动处理等待'],
        ['等待唤醒', '手动 wait/notifyAll', '内部实现，无需关心'],
        ['常见错误', '用 if 代替 while、唤醒错对象、忘记在同步块里调用', '几乎没有'],
        ['推荐度', '理解原理即可', '**生产环境首选**']
      ]},
      { t: 'warn', text: '两版都用了阻塞队列/等待唤醒，所以在**真实运行**时，生产者和消费者会交替执行。页面里的运行器是单线程模拟，会先跑完生产者再跑消费者，队列大小也不会超过容量——这正是模拟与真实的区别。' },
      { t: 'h', text: '9. 线程池：不要自己 new Thread' },
      { t: 'p', text: '每次 `new Thread()` 都要向操作系统申请资源，用完销毁，高频创建线程会非常慢、也容易把内存吃光。**线程池**的思路是：预先创建一批线程，任务来了就交给空闲线程，用完归还，任务多了就排队。' },
      { t: 'table', head: ['参数', '含义', '经验值'], rows: [
        ['corePoolSize', '核心线程数，即使空闲也保留', 'CPU 密集：核数+1；IO 密集：核数×2 起（按压测调）'],
        ['maximumPoolSize', '最大线程数', '一般比核心数大一些，别无限大'],
        ['keepAliveTime', '超出核心数的线程空闲多久被回收', '几十秒到几分钟'],
        ['workQueue', '任务队列', '**必须用有界队列**，无界队列会攒到 OOM'],
        ['threadFactory', '创建线程的工厂', '一定要给线程起有意义的名字'],
        ['handler', '拒绝策略（队列满且线程满时）', 'AbortPolicy 抛异常 / CallerRunsPolicy 让提交者自己执行'],
        ['unit / 时间单位', '存活时间的单位', 'TimeUnit.SECONDS 等']
      ]},
      { t: 'code', title: 'Executors 快速创建 + Future 收集结果', code: `import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;

/**
 * 演示：线程池的基本用法。
 * execute(Runnable)  —— 提交无返回值任务；
 * submit(Callable)   —— 提交有返回值任务，返回 Future，用 get() 取结果（会阻塞到任务完成）；
 * shutdown()         —— 不再接收新任务，已提交的会执行完；awaitTermination 等待全部结束。
 */
public class PoolBasic {
    public static void main(String[] args) throws Exception {
        // 固定 2 个线程的线程池：一次最多并行 2 个任务，其余排队
        ExecutorService pool = Executors.newFixedThreadPool(2);
        List<Future<Integer>> results = new ArrayList<>();   // 收集每个任务的"提货单"

        for (int i = 1; i <= 4; i++) {
            final int n = i;      // lambda 里要用循环变量，必须先复制成 final 局部变量
            // submit 接收 Callable（有返回值），这里 lambda 的返回值是 n * n
            Future<Integer> f = pool.submit(() -> n * n);
            results.add(f);
        }

        int sum = 0;
        for (Future<Integer> f : results) {
            sum += f.get();       // get() 会阻塞直到该任务完成，所以这里能安全拿到结果
        }
        System.out.println("1~4 的平方和：" + sum);

        // execute：提交没有返回值的任务
        pool.execute(() -> System.out.println("execute 提交的任务（无返回值）"));

        pool.shutdown();          // 平缓关闭：不再收新任务
        System.out.println("是否已关闭：" + pool.isShutdown());
        // awaitTermination：最多等 1 秒，返回 true 表示所有任务都执行完了
        System.out.println("是否全部结束：" + pool.awaitTermination(1, TimeUnit.SECONDS));
    }
}` },
      { t: 'code', title: '手动创建线程池（工程规范写法）', code: `import java.util.concurrent.Executors;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;

/**
 * 演示：按工程规范手动创建线程池（阿里开发手册推荐写法）。
 * 为什么不直接用 Executors？因为它内部用的是"无界队列"，任务堆积会把内存吃爆（OOM）。
 * 七个参数依次是：核心线程数、最大线程数、空闲存活时间、时间单位、任务队列、线程工厂、拒绝策略。
 */
public class PoolAdvanced {
    public static void main(String[] args) throws Exception {
        ThreadPoolExecutor pool = new ThreadPoolExecutor(
                2,                                            // 核心线程数：常驻线程
                4,                                            // 最大线程数：队列满时可以扩到 4
                60, TimeUnit.SECONDS,                         // 超出核心数的线程空闲 60 秒后回收
                new LinkedBlockingQueue<>(10),                // 有界队列：最多排 10 个任务，防止 OOM
                Executors.defaultThreadFactory(),             // 线程工厂：负责创建线程（可自定义线程名）
                new ThreadPoolExecutor.CallerRunsPolicy()     // 拒绝策略：队列和线程都满了，就让提交者自己执行
        );

        // 任务处理顺序：① 核心线程 → ② 队列 → ③ 扩到最大线程 → ④ 触发拒绝策略
        for (int i = 1; i <= 3; i++) {
            final int taskId = i;
            pool.execute(() -> System.out.println("执行任务 " + taskId));
        }

        pool.shutdown();                                       // 关闭：不再接收新任务
        System.out.println("已提交任务数：" + pool.getTaskCount());
        System.out.println("已关闭：" + pool.isShutdown());
    }
}` },
      { t: 'warn', text: '**阿里 Java 开发手册明确禁止**用 `Executors.newFixedThreadPool` / `newCachedThreadPool` 直接创建线程池，因为它们用的是**无界队列**（最大 Integer.MAX_VALUE），任务堆积会导致 OOM。正确做法就是上面的 `new ThreadPoolExecutor(...)` 手动指定参数。' },
      { t: 'list', items: [
        '**提交方式**：`execute(Runnable)` 无返回值；`submit(Runnable/Callable)` 返回 Future，可以 get() 拿结果或捕获异常',
        '**关闭方式**：`shutdown()` 平缓关闭（执行完已提交任务）；`shutdownNow()` 尝试中断；关闭后提交任务会抛 RejectedExecutionException',
        '**线程数怎么定**：CPU 密集 ≈ CPU 核数 + 1；IO 密集 ≈ 核数 × 2 或更高；最终一定要压测',
        '**监控**：`getPoolSize()`、`getActiveCount()`、`getQueue().size()`、`getCompletedTaskCount()`，线上要看队列是否堆积',
        '**不要在主线程 get() 前做耗时等待**：如果提交了 10 个任务、线程池只有 2 个线程，先 get 第一个不会死锁，但如果任务之间相互等待对方的 Future，就可能死锁'
      ]},
      { t: 'h', text: '10. 并发容器与工具类' },
      { t: 'table', head: ['工具', '作用', '典型场景'], rows: [
        ['ConcurrentHashMap', '线程安全的 Map，读不加锁、写细化到桶', '缓存、计数器、共享配置'],
        ['CopyOnWriteArrayList', '写时复制，读多写少时性能好', '监听器列表、白名单'],
        ['BlockingQueue', '线程安全的阻塞队列', '生产者消费者、任务队列'],
        ['CountDownLatch', '倒计时门闩，等 N 个任务都完成', '并发任务汇总、主线程等初始化'],
        ['CyclicBarrier', '循环栅栏，等 N 个线程都到齐再一起走', '分阶段并发计算'],
        ['Semaphore', '信号量，控制同时访问的线程数', '限流、连接池'],
        ['AtomicInteger / LongAdder', '原子计数', '统计、序列号'],
        ['ThreadLocal', '每个线程一份自己的副本', '用户上下文、日期格式化器（用完要 remove）']
      ]},
      { t: 'code', title: 'CountDownLatch + ConcurrentHashMap 实战', code: `import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CountDownLatch;

/**
 * 演示：两个最常用的并发工具。
 * CountDownLatch：倒计时门闩 —— 主线程 await() 等待，子线程每完成一个就 countDown()。
 * ConcurrentHashMap：线程安全的 Map，读几乎不加锁，写只锁单个桶，比 synchronizedMap 快得多。
 */
public class ConcurrentToolsDemo {
    public static void main(String[] args) throws Exception {
        ConcurrentHashMap<String, Integer> counter = new ConcurrentHashMap<>();   // 线程安全的计数器
        CountDownLatch latch = new CountDownLatch(3);      // 计数 3：要等 3 个线程完成

        String[] workers = {"worker-1", "worker-2", "worker-3"};
        for (String name : workers) {
            new Thread(() -> {
                // merge：key 不存在就放 1，存在就把旧值和新值交给函数合并 —— 并发累加的推荐写法
                counter.merge("任务完成数", 1, (oldV, newV) -> oldV + newV);
                System.out.println(name + " 完成");
                latch.countDown();                          // 完成一个，倒计时减一
            }, name).start();
        }

        latch.await();                                      // 主线程在这里等待，直到计数归零
        System.out.println("全部完成，剩余门闩计数：" + latch.getCount());
        System.out.println("统计结果：" + counter.get("任务完成数"));
    }
}` },
      { t: 'tip', text: '为什么不用 `Collections.synchronizedMap`？它给整张表加一把锁，并发量一大就排队。ConcurrentHashMap 在 JDK 8 里用 **CAS + synchronized 锁单个桶**，并发度高得多，是并发场景的标准选择。' },
      { t: 'h', text: '11. 高频面试题与检查清单' },
      { t: 'list', items: [
        '**创建线程的方式**：继承 Thread / 实现 Runnable / 实现 Callable + 线程池；实际项目几乎只用线程池',
        '**start 与 run 的区别**：start 会开新线程并最终回调 run；直接调 run 就是普通方法调用',
        '**synchronized 与 Lock 的区别**：前者自动释放、写法简单；后者可中断、可超时、支持公平锁和多 Condition',
        '**volatile 的作用**：保证可见性和禁止指令重排，但不保证原子性，不能替代锁',
        '**怎么保证线程安全**：① 不共享（ThreadLocal、局部变量）② 只读 ③ 用同步（synchronized / Lock）④ 用并发容器和原子类',
        '**线程池参数与拒绝策略**：核心/最大/队列/存活时间/工厂/拒绝策略，以及四个拒绝策略的区别',
        '**死锁**：四个必要条件、怎么用 jstack 排查、怎么按顺序加锁避免',
        '**CAS 与 ABA 问题**：CAS 是乐观锁，ABA 用版本号（AtomicStampedReference）解决',
        '**ThreadLocal 内存泄漏**：key 是弱引用、value 是强引用，用完必须 remove()'
      ]},
      { t: 'warn', text: '**最重要的一句提醒**：并发 bug 的特点是“很难复现、上线才炸”。学完这一章，请一定把上面几个例子复制到 IDEA 里，把循环次数调大、把线程数调多，亲眼看看不加锁时结果会少多少——这种“亲眼见过”的印象，比背结论有用得多。' },
      { t: 'tip', text: '到这里，Java 语言的核心知识就补齐了：语法 → 面向对象 → 异常 → 集合 → IO → 并发。接下来回到 Android 部分，你会发现这些知识在移动端到处都是：网络请求要放子线程、列表数据用集合装、本地缓存用文件或数据库保存。' }
    ],
    quiz: [
      { q: '调用线程的 run() 和调用 start() 的区别是？', options: ['没有区别', 'start() 会启动新线程并最终回调 run()，直接调 run() 只是普通方法调用', 'run() 会启动新线程', 'start() 会执行两次 run()'], answer: 1, explain: '只有 start() 才会让 JVM 创建新线程；直接调 run() 仍在当前线程里同步执行。' },
      { q: 'count++ 在多线程下会丢更新，根本原因是？', options: ['int 类型太小', 'count++ 不是原子操作（读取、加一、写回三步可能被打断）', 'CPU 太慢', '没有用 volatile'], answer: 1, explain: '两个线程可能读到同一个旧值，各自加一后写回，等于只加了一次。' },
      { q: 'volatile 能保证下面哪一项？', options: ['原子性', '可见性和有序性', '线程安全的自增', '锁的互斥'], answer: 1, explain: 'volatile 保证一个线程改了值其他线程立刻可见，并禁止指令重排，但不保证复合操作的原子性。' },
      { q: '两个线程分别锁 this 和 TicketSystem.class，会发生什么？', options: ['正常互斥', '等于没锁，因为用的是两把不同的锁', '编译报错', '只有一个线程能运行'], answer: 1, explain: 'synchronized 的互斥只看“锁对象是不是同一个”。要互斥，所有线程必须争抢同一把锁。' },
      { q: '为什么阿里规范禁止用 Executors.newFixedThreadPool？', options: ['性能差', '它的任务队列是无界的，任务堆积时会 OOM', '不支持自定义线程名', '不能用 lambda'], answer: 1, explain: '无界队列最大长度是 Integer.MAX_VALUE，任务积压会耗尽内存；应手动 new ThreadPoolExecutor 并用有界队列。' },
      { q: 'synchronized 与 ReentrantLock 相比，正确的是？', options: ['synchronized 可以中断等待', 'ReentrantLock 支持 tryLock 超时和公平锁', 'ReentrantLock 不需要解锁', '两者完全一样'], answer: 1, explain: 'ReentrantLock 更灵活：可中断、可超时、可公平、可有多个 Condition；但必须手动 unlock。' },
      { q: '用线程池提交任务并想拿到返回值，应该用？', options: ['execute(Runnable)', 'submit(Callable) 拿到 Future 再 get()', 'start()', 'run()'], answer: 1, explain: 'submit 返回 Future，get() 会阻塞直到任务完成并返回结果；execute 只能提交无返回值任务。' },
      { q: '避免死锁最实用的做法是？', options: ['多开线程', '让所有线程按相同顺序获取多把锁', '把锁去掉', '用 volatile 代替锁'], answer: 1, explain: '死锁四个必要条件里有“循环等待”，按统一顺序加锁就能破坏它。' }
    ],
    exercises: [
      {
        id: 'ex-j16-1',
        title: '练习 1：多窗口售票（synchronized 防超卖）',
        level: '中等',
        brief: '两个窗口同时卖 10 张票：用同步代码块保证同一张票不会被卖两次、也不会卖出负数。',
        requirements: [
          'static 变量 tickets 初始为 10，作为共享资源',
          '用 lambda 写一个卖票任务：循环里用 synchronized (TicketSystem.class) 保护“判断余票 + 卖票”两步',
          '余票为 0 时用 break 退出循环',
          '创建两个线程（窗口A、窗口B），启动并用 join 等它们结束',
          '最后打印剩余票数，必须是 0，不能出现负数或重复票号'
        ],
        starter: `public class TicketSystem {
    private static int tickets = 10;

    public static void main(String[] args) throws Exception {
        // TODO: 卖票任务 + 两个线程 + join + 打印剩余票数
    }
}`,
        expectedOutput: `窗口A 卖出第 10 张票
窗口A 卖出第 9 张票
窗口A 卖出第 8 张票
窗口A 卖出第 7 张票
窗口A 卖出第 6 张票
窗口A 卖出第 5 张票
窗口A 卖出第 4 张票
窗口A 卖出第 3 张票
窗口A 卖出第 2 张票
窗口A 卖出第 1 张票
售票结束，剩余：0`,
        keyPoints: [
          { label: '共享变量 tickets', test: 'static\\s+int\\s+tickets' },
          { label: '卖票任务用 lambda 或 Runnable', test: '->|Runnable' },
          { label: '用 synchronized 同步代码块', test: 'synchronized\\s*\\(' },
          { label: '锁的是同一个对象（类锁或静态对象）', test: 'synchronized\\s*\\(\\s*TicketSystem\\.class|synchronized\\s*\\(\\s*LOCK' },
          { label: '余票为 0 时退出循环', test: 'tickets\\s*<=\\s*0[\\s\\S]{0,40}break' },
          { label: '启动并 join 两个线程', test: 'join\\s*\\(\\s*\\)' },
          { label: '打印剩余票数', test: 'System\\.out\\.println\\s*\\(\\s*"[^"]*剩余' }
        ],
        hints: [
          '任务体：while (true) { synchronized (TicketSystem.class) { if (tickets <= 0) break; ... } }',
          '线程名在构造时传：new Thread(task, "窗口A")',
          'join() 用来等线程结束，不 join 的话 main 可能在卖完之前就打印剩余票数',
          '注意：页面里的运行器是单线程模拟，会看到窗口A 卖完再看窗口B；在 IDEA 里运行才会看到两个窗口交替卖票'
        ],
        solution: `public class TicketSystem {
    private static int tickets = 10;

    public static void main(String[] args) throws Exception {
        Runnable seller = () -> {
            while (true) {
                synchronized (TicketSystem.class) {
                    if (tickets <= 0) {
                        break;
                    }
                    System.out.println(Thread.currentThread().getName() + " 卖出第 " + tickets-- + " 张票");
                }
            }
        };

        Thread t1 = new Thread(seller, "窗口A");
        Thread t2 = new Thread(seller, "窗口B");
        t1.start();
        t2.start();
        t1.join();
        t2.join();

        System.out.println("售票结束，剩余：" + tickets);
    }
}`
      },
      {
        id: 'ex-j16-2',
        title: '练习 2：线程池批量计算（ExecutorService + Future）',
        level: '中等',
        brief: '用固定大小线程池并行计算 1~5 的平方，收集所有 Future 的结果再汇总。',
        requirements: [
          '用 Executors.newFixedThreadPool(3) 创建线程池',
          '提交 5 个任务，每个任务是 Callable，返回 n * n（用 lambda 写法）',
          '把返回的 Future<Integer> 装进 List',
          '遍历 Future 调 get() 累加结果，打印平方和',
          '调用 shutdown()，并打印 isShutdown() 和 awaitTermination(1, TimeUnit.SECONDS) 的结果'
        ],
        starter: `import java.util.*;
import java.util.concurrent.*;

public class PoolSquare {
    public static void main(String[] args) throws Exception {
        // TODO: 创建线程池 → 提交 5 个任务 → 汇总 → 关闭
    }
}`,
        expectedOutput: `平方和：55
是否已关闭：true
是否已全部结束：true`,
        keyPoints: [
          { label: '用 Executors 创建固定大小线程池', test: 'Executors\\.newFixedThreadPool' },
          { label: '提交任务用 submit 并接收 Future', test: 'Future<[\\s\\S]{0,40}>\\s*\\w+\\s*=|submit\\s*\\(' },
          { label: '用 List 收集 Future', test: 'new\\s+ArrayList' },
          { label: '用 get() 取出结果', test: '\\.get\\s*\\(\\s*\\)' },
          { label: '调用 shutdown', test: 'shutdown\\s*\\(\\s*\\)' },
          { label: '调用 awaitTermination', test: 'awaitTermination' }
        ],
        hints: [
          'lambda 里要用循环变量时先复制一份：final int n = i;',
          'submit 返回 Future<Integer>：Future<Integer> f = pool.submit(() -> n * n);',
          'get() 会阻塞直到任务结束，所以汇总循环直接 f.get() 累加即可',
          '关闭：pool.shutdown(); 之后 pool.isShutdown() 为 true，awaitTermination 返回 true 表示任务都结束了'
        ],
        solution: `import java.util.*;
import java.util.concurrent.*;

public class PoolSquare {
    public static void main(String[] args) throws Exception {
        ExecutorService pool = Executors.newFixedThreadPool(3);
        List<Future<Integer>> results = new ArrayList<>();

        for (int i = 1; i <= 5; i++) {
            final int n = i;
            results.add(pool.submit(() -> n * n));
        }

        int sum = 0;
        for (Future<Integer> f : results) {
            sum += f.get();
        }
        System.out.println("平方和：" + sum);

        pool.shutdown();
        System.out.println("是否已关闭：" + pool.isShutdown());
        System.out.println("是否已全部结束：" + pool.awaitTermination(1, TimeUnit.SECONDS));
    }
}`
      },
      {
        id: 'ex-j16-3',
        title: '练习 3：生产者消费者（BlockingQueue）',
        level: '较难',
        brief: '用容量为 3 的阻塞队列实现生产者与消费者：生产者放 3 个商品，消费者取 3 个，最后队列为空。',
        requirements: [
          '用 LinkedBlockingQueue<Integer>(3) 创建容量为 3 的队列',
          '生产者线程：循环 3 次，put 进队列并打印「生产：x，队列大小 n」',
          '消费者线程：循环 3 次，take 出来并打印「消费：x，队列大小 n」',
          '两个线程都要 try-catch InterruptedException（或方法声明 throws，用 lambda 时必须 try-catch）',
          '启动两个线程并 join，最后打印队列剩余大小',
          '给两个线程起名字（生产者 / 消费者）'
        ],
        starter: `import java.util.concurrent.*;

public class ProducerConsumer {
    public static void main(String[] args) throws Exception {
        BlockingQueue<Integer> queue = new LinkedBlockingQueue<>(3);
        // TODO: 生产者线程、消费者线程、join、打印剩余
    }
}`,
        expectedOutput: `生产：1，队列大小 1
生产：2，队列大小 2
生产：3，队列大小 3
消费：1，队列大小 2
消费：2，队列大小 1
消费：3，队列大小 0
结束，队列剩余：0`,
        keyPoints: [
          { label: '用 LinkedBlockingQueue 并指定容量', test: 'new\\s+LinkedBlockingQueue\\s*<[^>]*>\\s*\\(\\s*3\\s*\\)|new\\s+LinkedBlockingQueue[\\s\\S]{0,20}\\(\\s*3\\s*\\)' },
          { label: '生产者用 put 放入', test: '\\.put\\s*\\(' },
          { label: '消费者用 take 取出', test: '\\.take\\s*\\(' },
          { label: '处理了 InterruptedException', test: 'InterruptedException' },
          { label: '创建并启动两个线程', test: 'new\\s+Thread\\s*\\(' },
          { label: 'join 等待两个线程结束', test: '\\.join\\s*\\(\\s*\\)' },
          { label: '打印队列剩余大小', test: 'queue\\.size\\s*\\(\\s*\\)' }
        ],
        hints: [
          '生产者：for (int i = 1; i <= 3; i++) { queue.put(i); System.out.println("生产：" + i + "，队列大小 " + queue.size()); }',
          'lambda 里不能直接抛出检查型异常，所以要 try { ... } catch (InterruptedException e) { Thread.currentThread().interrupt(); }',
          '消费者同理，用 Integer v = queue.take(); 再打印',
          '页面里是单线程模拟，会先打印 3 行生产再打印 3 行消费；真实运行时两者会交替执行'
        ],
        solution: `import java.util.concurrent.*;

public class ProducerConsumer {
    public static void main(String[] args) throws Exception {
        BlockingQueue<Integer> queue = new LinkedBlockingQueue<>(3);

        Thread producer = new Thread(() -> {
            try {
                for (int i = 1; i <= 3; i++) {
                    queue.put(i);
                    System.out.println("生产：" + i + "，队列大小 " + queue.size());
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }, "生产者");

        Thread consumer = new Thread(() -> {
            try {
                for (int i = 1; i <= 3; i++) {
                    Integer v = queue.take();
                    System.out.println("消费：" + v + "，队列大小 " + queue.size());
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }, "消费者");

        producer.start();
        consumer.start();
        producer.join();
        consumer.join();

        System.out.println("结束，队列剩余：" + queue.size());
    }
}`
      }
    ],
    checklist: ['能说出进程与线程的区别', '会用三种方式创建线程', '理解竞态条件与 synchronized 锁对象', '知道 volatile 不能保证原子性', '会配置并使用线程池', '知道死锁怎么避免']
  }
];
