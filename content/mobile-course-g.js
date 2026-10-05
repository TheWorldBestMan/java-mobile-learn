/* 课程内容 · Android 移动开发（第 20 章 网络请求与完整 App） */
window.COURSE_MOBILE_PART7 = [
  {
    id: 'a7',
    title: '网络请求、JSON 与完整 App',
    minutes: 90,
    tags: ['Retrofit', 'OkHttp', 'JSON', 'MVVM', '打包'],
    goals: [
      '会用 OkHttp / Retrofit 发起 GET、POST 请求',
      '会用 Gson 把 JSON 映射成 Java 对象',
      '能处理加载中、空数据、请求失败三种界面状态',
      '知道怎么打包签名 APK 并上架'
    ],
    lessons: [
      { t: 'p', text: '几乎所有真实 App 都要联网：拉天气、登录、下单、刷视频。这一章把网络请求串成一条完整链路：**申请权限 → 发请求 → 解析 JSON → 更新界面 → 处理异常与加载状态**。走通这条链路，你就能独立做出一个真正的 App。' },
      { t: 'h', text: '1. HTTP 基础：五分钟够用版' },
      { t: 'table', head: ['概念', '说明'], rows: [
        ['GET', '从服务器取数据，参数写在 URL 上'],
        ['POST', '提交数据，参数放在请求体里（登录、下单）'],
        ['状态码', '200 成功；400 参数错误；401 未授权；403 禁止；404 找不到；500 服务器错误'],
        ['请求头', 'Content-Type、Authorization（token）、User-Agent'],
        ['响应体', '通常是 JSON 文本']
      ]},
      { t: 'code', title: '一次 GET 请求的样子', code: `GET /v1/weather?city=hangzhou HTTP/1.1
Host: api.example.com
Authorization: Bearer eyJhbGciOi...
Accept: application/json

HTTP/1.1 200 OK
Content-Type: application/json

{
  "code": 0,
  "data": {
    "city": "杭州",
    "temp": 23,
    "desc": "多云"
  }
}` },
      { t: 'h', text: '2. 准备：权限与依赖' },
      { t: 'code', title: 'AndroidManifest 与 build.gradle', code: `<!-- AndroidManifest.xml：联网权限是普通权限，声明即可 -->
<uses-permission android:name="android.permission.INTERNET" />

<!-- 如果调试用 http 接口（正式项目必须 https）-->
<application android:usesCleartextTraffic="true" ... >

// app/build.gradle
dependencies {
    implementation 'com.squareup.retrofit2:retrofit:2.9.0'
    implementation 'com.squareup.retrofit2:converter-gson:2.9.0'
    implementation 'com.squareup.okhttp3:logging-interceptor:4.12.0'
    implementation 'com.github.bumptech.glide:glide:4.16.0'      // 图片加载
}` },
      { t: 'warn', text: 'Android 4.0 之后**不允许在主线程做网络请求**，否则抛 NetworkOnMainThreadException。所有网络调用必须放到子线程：Java 用 Executor / 线程池 + runOnUiThread，现代写法是 Retrofit + Kotlin 协程（或 Java 的 enqueue 异步回调）。' },
      { t: 'h', text: '3. Retrofit：三步写好网络层' },
      { t: 'code', title: '第一步：定义数据模型（和 JSON 结构一一对应）', code: `// GET /v1/weather?city=hangzhou 的响应
public class WeatherResponse {
    public int code;
    public String message;
    public Data data;

    public static class Data {
        public String city;
        public int temp;
        public String desc;
    }
}` },
      { t: 'code', title: '第二步：定义接口（用注解描述请求）', code: `import retrofit2.Call;
import retrofit2.http.GET;
import retrofit2.http.POST;
import retrofit2.http.Path;
import retrofit2.http.Query;
import retrofit2.http.Body;
import retrofit2.http.Header;

public interface ApiService {

    @GET("v1/weather")
    Call<WeatherResponse> getWeather(@Query("city") String city);

    @GET("v1/user/{id}")
    Call<UserResponse> getUser(@Path("id") int userId);

    @POST("v1/login")
    Call<LoginResponse> login(@Body LoginRequest request,
                             @Header("Authorization") String token);
}` },
      { t: 'code', title: '第三步：创建实例并发起请求', code: `public class ApiClient {

    private static final String BASE_URL = "https://api.example.com/";
    private static Retrofit retrofit;

    public static ApiService api() {
        if (retrofit == null) {
            HttpLoggingInterceptor logging = new HttpLoggingInterceptor();
            logging.setLevel(HttpLoggingInterceptor.Level.BODY);   // 打印请求与响应，调试神器

            OkHttpClient client = new OkHttpClient.Builder()
                    .connectTimeout(10, TimeUnit.SECONDS)
                    .readTimeout(15, TimeUnit.SECONDS)
                    .addInterceptor(logging)
                    .build();

            retrofit = new Retrofit.Builder()
                    .baseUrl(BASE_URL)
                    .client(client)
                    .addConverterFactory(GsonConverterFactory.create())   // JSON -> 对象
                    .build();
        }
        return retrofit.create(ApiService.class);
    }
}` },
      { t: 'code', title: '在 Activity 里调用（异步回调）', code: `ApiClient.api().getWeather("hangzhou").enqueue(new Callback<WeatherResponse>() {

    @Override
    public void onResponse(Call<WeatherResponse> call, Response<WeatherResponse> response) {
        // 注意：这个回调已经在主线程，可以直接更新 UI
        if (response.isSuccessful() && response.body() != null) {
            WeatherResponse.Data data = response.body().data;
            tvWeather.setText(data.city + " " + data.temp + "℃ " + data.desc);
        } else {
            tvWeather.setText("数据异常：" + response.code());
        }
    }

    @Override
    public void onFailure(Call<WeatherResponse> call, Throwable t) {
        tvWeather.setText("请求失败：" + t.getMessage() + "，请检查网络");
    }
});` },
      { t: 'tip', text: 'baseUrl 必须**以 / 结尾**，接口注解里的路径**开头不能有 /**，否则拼接结果会出错。这是 Retrofit 新手第一大坑。' },
      { t: 'h', text: '4. 界面三态：加载中 / 有数据 / 出错' },
      { t: 'code', title: '别只想着成功，把三种状态都做出来', code: `private void loadWeather(String city) {
    showLoading();                                  // 显示进度圈，隐藏错误页

    ApiClient.api().getWeather(city).enqueue(new Callback<WeatherResponse>() {
        @Override
        public void onResponse(Call<WeatherResponse> call, Response<WeatherResponse> response) {
            if (response.isSuccessful() && response.body() != null && response.body().code == 0) {
                showData(response.body().data);      // 有数据
            } else {
                showError("数据异常（" + response.code() + "），点我重试");
            }
        }

        @Override
        public void onFailure(Call<WeatherResponse> call, Throwable t) {
            if (t instanceof java.net.UnknownHostException) {
                showError("没有网络连接，点我重试");
            } else if (t instanceof java.net.SocketTimeoutException) {
                showError("请求超时，点我重试");
            } else {
                showError("请求失败，点我重试");
            }
        }
    });
}

// 错误页的“点我重试”就是再调一次 loadWeather(city)
btnRetry.setOnClickListener(v -> loadWeather(currentCity));` },
      { t: 'h', text: '5. MVVM：把数据逻辑从 Activity 里搬出去' },
      { t: 'list', items: [
        '问题：Activity 里又写界面、又写网络、又写数据库，改一处到处崩',
        '**View（Activity/Fragment）**：只负责显示和接收用户操作',
        '**ViewModel**：保存界面需要的数据，并在后台拉取数据；屏幕旋转不会丢数据',
        '**Repository**：统一管理数据来源（网络 + 本地缓存）',
        '**LiveData / StateFlow**：数据变化自动通知界面刷新，不用手写回调',
        '推荐学习顺序：先把这一章的网络请求写通，再学 ViewModel + LiveData，最后学 Kotlin 协程 + Compose'
      ]},
      { t: 'code', title: 'Kotlin 协程写法对照（了解即可）', code: `// 同样的接口，Kotlin 里用 suspend 声明
interface ApiService {
    @GET("v1/weather")
    suspend fun getWeather(@Query("city") city: String): WeatherResponse
}

// 在协程里调用，代码像是同步的，实际不会阻塞主线程
viewModelScope.launch {
    try {
        val weather = api.getWeather("hangzhou")
        _uiState.value = UiState.Success(weather)
    } catch (e: Exception) {
        _uiState.value = UiState.Error("网络异常")
    }
}` },
      { t: 'h', text: '6. 打包与发布' },
      { t: 'code', title: '生成正式 APK', code: `1. Build → Generate Signed Bundle / APK
2. 选 APK（小范围分发）或 AAB（上架 Google Play 必需）
3. Create new keystore：设置好密码与别名
   ★ keystore 文件和密码必须备份，丢了就永远无法更新同一个 App
4. 选 release 变体，勾选 V1 / V2 签名
5. 输出的 APK 在 app/release/ 目录下，可以发给别人安装

// build.gradle 里可以开启混淆，减小体积
buildTypes {
    release {
        minifyEnabled true
        proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
    }
}` },
      { t: 'h', text: '7. 学到这里，你的能力清单' },
      { t: 'list', items: [
        'Java：变量 / 流程控制 / 数组 / 方法 / 面向对象 / 异常 / 集合 / 泛型 / IO / JSON 基础',
        'Android：工程结构 / Activity 生命周期 / XML 布局 / 控件 / RecyclerView / Intent / SharedPreferences / Room / Retrofit',
        '能独立完成：待办清单、天气查询、记账本、简单资讯类 App',
        '下一步建议：① 把 Kotlin 语法过一遍（约 3～5 天）② 学 Jetpack（ViewModel、Room、Navigation、Compose）③ 学 Git 与团队协作 ④ 做一个能写进简历的完整项目（有登录、列表、详情、缓存、搜索）'
      ]},
      { t: 'tip', text: '面试与求职建议：把做过的 App 写成项目介绍（解决了什么问题、用了什么技术、遇到什么坑、怎么解决），比堆 10 个“跟着教程敲的 Demo”有用得多。手机上装一个自己的 App，面试时直接演示，效果非常好。' }
    ],
    quiz: [
      { q: 'Android 中发起网络请求，正确的做法是？', options: ['直接在 onCreate 里请求', '放到子线程 / Retrofit 异步回调，再回到主线程更新 UI', '用 System.out 打印', '必须先申请相机权限'], answer: 1, explain: '主线程不能做网络请求，否则抛 NetworkOnMainThreadException。' },
      { q: 'Retrofit 的 baseUrl 与接口路径，正确写法是？', options: ['baseUrl 以 / 结尾，接口路径开头不写 /', 'baseUrl 不写 /，接口路径以 / 开头', '两边都写 /', '都不写 /'], answer: 0, explain: '例如 baseUrl = "https://api.example.com/" + @GET("v1/weather")，两边都带斜杠会拼错。' },
      { q: '把 JSON 转换成 Java 对象，Retrofit 里需要配置？', options: ['OkHttpClient', 'GsonConverterFactory', 'LoggingInterceptor', 'LayoutManager'], answer: 1, explain: 'addConverterFactory(GsonConverterFactory.create()) 负责 JSON 与对象互转。' },
      { q: '请求失败时只弹出“请求失败”，最大的问题是？', options: ['代码太长', '无法区分没网、超时、服务器错误，用户不知道怎么办', '不影响用户体验', '必须重新安装 App'], answer: 1, explain: '要按异常类型给出可理解的提示，并提供重试入口。' }
    ],
    exercises: [
      {
        id: 'ex-a7-1',
        title: '练习 1：天气查询 App（毕业作品雏形）',
        level: '挑战',
        brief: '用 Retrofit 请求一个公开天气接口（或任意公开 JSON 接口），把结果显示到界面上，并完整处理三种状态。',
        requirements: [
          'AndroidManifest 声明 INTERNET 权限',
          '引入 Retrofit、Gson converter、logging-interceptor 依赖',
          '定义数据模型类（字段名与 JSON 一致）与 ApiService 接口（至少一个 @GET 方法，带 @Query 参数）',
          '创建 ApiClient 单例，带 10 秒连接超时与日志拦截器',
          '界面：输入框（城市名）+ 查询按钮 + 结果 TextView + ProgressBar + 错误提示 TextView',
          '状态处理：点击查询先显示加载圈并隐藏错误；成功显示数据；失败显示具体原因（无网络/超时/服务器错误）',
          '错误提示可点击重试（用上一次查询的城市重新请求）',
          '在 Logcat 中能看到请求 URL 与响应 JSON（说明拦截器生效）'
        ],
        starter: `// 需要新建：WeatherResponse.java、ApiService.java、ApiClient.java
// activity_main.xml：etCity + btnSearch + tvResult + progress + tvError

// MainActivity 关键骨架
private void loadWeather(String city) {
    // TODO: 显示加载中
    // TODO: 调接口，onResponse / onFailure 分别处理
}`,
        expectedOutput: `输入“hangzhou”点查询 → 转圈 → 显示“杭州 23℃ 多云”
输入不存在的城市 → 显示“数据异常（404），点我重试”
断网后点查询 → 显示“没有网络连接，点我重试”
Logcat 输出：
D/OkHttp: --> GET https://api.example.com/v1/weather?city=hangzhou
D/OkHttp: <-- 200 OK (320ms)
D/OkHttp: {"code":0,"data":{"city":"杭州","temp":23,"desc":"多云"}}`,
        keyPoints: [
          { label: '声明了 INTERNET 权限', test: 'android\\.permission\\.INTERNET' },
          { label: '接口用 @GET 注解', test: '@GET\\s*\\(' },
          { label: '使用了 @Query 参数', test: '@Query' },
          { label: '创建了 Retrofit 实例并 addConverterFactory', test: 'new\\s+Retrofit\\.Builder[\\s\\S]*addConverterFactory' },
          { label: '使用了 GsonConverterFactory', test: 'GsonConverterFactory' },
          { label: '添加了日志拦截器', test: 'HttpLoggingInterceptor' },
          { label: '用 enqueue 异步请求', test: 'enqueue\\s*\\(' },
          { label: '分别实现了 onResponse 与 onFailure', test: 'onResponse[\\s\\S]*onFailure' },
          { label: '有进度圈显示与隐藏', test: 'ProgressBar|setVisibility' },
          { label: '重试按钮会重新请求', test: 'setOnClickListener[\\s\\S]{0,80}loadWeather|Retry' }
        ],
        hints: [
          '找不到合适的天气接口时，可以用任意公开 JSON 接口练手，例如 https://api.github.com/users/octocat 或自己写一个静态 JSON 文件放在服务器上',
          'Gson 解析嵌套对象：data 字段直接声明为一个内部类，字段名要和 JSON 的 key 完全一致（大小写敏感）',
          '错误统一处理：写一个 showError(String msg) 方法，把 tvError 设为可见、progress 设为 GONE',
          '查不到城市等业务错误通常返回 code != 0，要在 onResponse 里判断业务码，不能只看 HTTP 是否成功'
        ],
        solution: `// WeatherResponse.java
// AndroidManifest.xml 里需要声明：<uses-permission android:name="android.permission.INTERNET" />

public class WeatherResponse {
    public int code;
    public String message;
    public Data data;

    public static class Data {
        public String city;
        public int temp;
        public String desc;
    }
}

// ApiService.java
public interface ApiService {
    @GET("v1/weather")
    Call<WeatherResponse> getWeather(@Query("city") String city);
}

// ApiClient.java
public class ApiClient {
    private static final String BASE_URL = "https://api.example.com/";
    private static Retrofit retrofit;

    public static ApiService api() {
        if (retrofit == null) {
            HttpLoggingInterceptor logging = new HttpLoggingInterceptor();
            logging.setLevel(HttpLoggingInterceptor.Level.BODY);

            OkHttpClient client = new OkHttpClient.Builder()
                    .connectTimeout(10, TimeUnit.SECONDS)
                    .readTimeout(15, TimeUnit.SECONDS)
                    .addInterceptor(logging)
                    .build();

            retrofit = new Retrofit.Builder()
                    .baseUrl(BASE_URL)
                    .client(client)
                    .addConverterFactory(GsonConverterFactory.create())
                    .build();
        }
        return retrofit.create(ApiService.class);
    }
}

// MainActivity.java 关键片段
private String lastCity = "";

private void loadWeather(String city) {
    lastCity = city;
    progress.setVisibility(View.VISIBLE);
    tvError.setVisibility(View.GONE);
    tvResult.setText("");

    ApiClient.api().getWeather(city).enqueue(new Callback<WeatherResponse>() {
        @Override
        public void onResponse(Call<WeatherResponse> call, Response<WeatherResponse> response) {
            progress.setVisibility(View.GONE);
            if (response.isSuccessful() && response.body() != null && response.body().code == 0) {
                WeatherResponse.Data data = response.body().data;
                tvResult.setText(data.city + " " + data.temp + "℃ " + data.desc);
            } else {
                showError("数据异常（" + response.code() + "），点我重试");
            }
        }

        @Override
        public void onFailure(Call<WeatherResponse> call, Throwable t) {
            progress.setVisibility(View.GONE);
            if (t instanceof UnknownHostException) {
                showError("没有网络连接，点我重试");
            } else if (t instanceof SocketTimeoutException) {
                showError("请求超时，点我重试");
            } else {
                showError("请求失败：" + t.getMessage() + "，点我重试");
            }
        }
    });
}

private void showError(String msg) {
    tvError.setText(msg);
    tvError.setVisibility(View.VISIBLE);
}

// onCreate 中
btnSearch.setOnClickListener(v -> {
    String city = etCity.getText().toString().trim();
    if (city.isEmpty()) {
        etCity.setError("请输入城市");
        return;
    }
    loadWeather(city);
});

tvError.setOnClickListener(v -> {
    if (!lastCity.isEmpty()) loadWeather(lastCity);
});`
      }
    ],
    checklist: ['能说出 GET 与 POST 的区别', '会写 Retrofit 接口并处理回调', '会做加载中/有数据/出错三态', '成功打包出签名 APK', '知道 MVVM 三层各自职责']
  }
];


