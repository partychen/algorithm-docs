---
title: "洛谷 树状数组专题精选解题报告"
subtitle: "🌲 从前缀维护到高维偏序的树状数组专题"
order: 3
icon: "🌲"
---

# 洛谷 树状数组专题精选解题报告

这一组题从最基础的前缀和维护一路走到二维偏序与离线统计，核心始终是把复杂关系改写成“若干次前缀加、前缀查”的组合。树状数组本身很轻，但一旦坐标、时间或值域能被重新排序，它就能接住很多原本看似不该由它解决的问题。

# 一、树状数组基础模板

这一章先把单点、区间和逆序类问题打牢，后面的离线和偏序都建立在同一套前缀维护思维上。

## 1. [P3374 【模板】树状数组 1](https://www.luogu.com.cn/problem/P3374)
`树状数组` `单点修改` `区间查询`

### 题意

维护一个数组，支持单点加和区间求和两种操作。

### 分析

树状数组专门维护前缀和。单点修改时沿着 `lowbit` 向上跳，前缀查询时沿着 `lowbit` 向下跳，两个操作都能在 `log n` 完成。

### 核心代码

```cpp
const int N = 500010;
int n, tr[N];

void add(int x, int v) {
    for (; x <= n; x += x & -x) tr[x] += v;
}

int sum(int x) {
    int s = 0;
    for (; x; x -= x & -x) s += tr[x];
    return s;
}
```

### 复杂度

单次修改和查询都是 `O(log n)`。

---

## 2. [P3368 【模板】树状数组 2](https://www.luogu.com.cn/problem/P3368)
`树状数组` `差分` `区间修改`

### 题意

支持区间加法，并查询某个位置的当前值。

### 分析

把原数组差分后，区间加就变成两个端点的单点修改。树状数组维护差分数组的前缀和，就能把区间修改转成单点修改，把位置查询转成前缀查询。

### 核心代码

```cpp
const int N = 500010;
int n, tr[N];

void add(int x, int v) {
    for (; x <= n; x += x & -x) tr[x] += v;
}

void range_add(int l, int r, int v) {
    add(l, v);
    add(r + 1, -v);
}

int ask(int x) {
    int s = 0;
    for (; x; x -= x & -x) s += tr[x];
    return s;
}
```

### 复杂度

单次操作都是 `O(log n)`。

---

## 3. [P1908 逆序对](https://www.luogu.com.cn/problem/P1908)
`树状数组` `逆序对` `离散化`

### 题意

给定一个序列，求满足 `i < j` 且 `a[i] > a[j]` 的数对数量。

### 分析

先离散化，再从左到右扫描。当前数的逆序贡献，就是前面已经出现且比它大的数的个数；这正好能用树状数组维护频次前缀和。

### 核心代码

```cpp
const int N = 500010;
int n, tr[N];
long long ans;

void add(int x) {
    for (; x <= n; x += x & -x) tr[x]++;
}

int sum(int x) {
    int s = 0;
    for (; x; x -= x & -x) s += tr[x];
    return s;
}
```

### 复杂度

时间复杂度 `O(n log n)`，空间复杂度 `O(n)`。

---

## 4. [P1966 [NOIP 2013 提高组] 火柴排队](https://www.luogu.com.cn/problem/P1966)
`树状数组` `逆序对` `排序映射`

### 题意

两排火柴长度分别给定，允许交换相邻位置，求把两排火柴按对应关系排齐的最少交换次数。

### 分析

先把两排火柴分别排序，再把第一排每个元素映射到第二排对应的位置。这样原问题就变成了一个排列的逆序对计数，答案就是最少相邻交换次数。

### 核心代码

```cpp
const int N = 200010;
int n, tr[N], rk[N];
long long ans;

void add(int x) {
    for (; x <= n; x += x & -x) tr[x]++;
}

int sum(int x) {
    int s = 0;
    for (; x; x -= x & -x) s += tr[x];
    return s;
}
```

### 复杂度

时间复杂度 `O(n log n)`。

---

## 5. [P1774 最接近神的人](https://www.luogu.com.cn/problem/P1774)
`树状数组` `逆序对` `稳定排序`

### 题意

给定一个序列，求把它变成非降序时所需的最少相邻交换次数。

### 分析

和逆序对完全同模。唯一要注意的是相等元素要保持稳定次序，否则映射会被打乱。按值排序时把原下标作为第二关键字，就能把问题稳定地转成排列逆序对。

### 核心代码

```cpp
const int N = 500010;
int n, tr[N];
long long ans;

void add(int x) {
    for (; x <= n; x += x & -x) tr[x]++;
}

int sum(int x) {
    int s = 0;
    for (; x; x -= x & -x) s += tr[x];
    return s;
}
```

### 复杂度

时间复杂度 `O(n log n)`。

---

# 二、区间维护与二维树状数组

这一章从一维前缀扩展到二维矩阵，核心还是把“区间贡献”拆成若干个前缀贡献。

## 6. [P4514 上帝造题的七分钟](https://www.luogu.com.cn/problem/P4514)
`二维树状数组` `矩形加` `矩形求和`

### 题意

维护一个二维矩阵，支持矩形加法和矩形求和。

### 分析

二维区间操作可以做成二维差分。若再把差分展开成前缀和形式，就能用 4 棵二维树状数组把矩形加和矩形查都压到 `log^2`。

### 核心代码

```cpp
const int N = 2050;
long long t1[N][N], t2[N][N], t3[N][N], t4[N][N];
int n, m;

void add(long long t[][N], int x, int y, long long v) {
    for (int i = x; i <= n; i += i & -i)
        for (int j = y; j <= m; j += j & -j)
            t[i][j] += v;
}
```

### 复杂度

单次修改和查询都是 `O(log n log m)`。

---

## 7. [P4054 [JSOI2009] 计数问题](https://www.luogu.com.cn/problem/P4054)
`二维树状数组` `颜色计数` `离散值域`

### 题意

给定一个二维矩阵，支持单点修改，并查询某个子矩形里某个值出现了多少次。

### 分析

因为值域很小，可以给每个值各开一棵二维树状数组。修改时删掉旧值、加入新值；查询时直接去对应值的树状数组里做矩形求和。

### 核心代码

```cpp
const int V = 105;
int n, m;
int bit[V][305][305];

void add(int c, int x, int y, int v) {
    for (int i = x; i <= n; i += i & -i)
        for (int j = y; j <= m; j += j & -j)
            bit[c][i][j] += v;
}
```

### 复杂度

单次修改和查询都是 `O(log n log m)`，额外乘一个小值域常数。

---

## 8. [P2161 [SHOI2009] 会场预约](https://www.luogu.com.cn/problem/P2161)
`树状数组` `区间占用` `离散化`

### 题意

按时间顺序处理会场预约，判断某段时间是否还能被安排，或者当前时刻的占用情况。

### 分析

把时间轴离散化后，区间预约就能转成差分修改。树状数组维护每个时刻的覆盖次数，前缀和就表示当前时刻被占用了几次；如果还要找可行位置，再配合二分即可。

### 核心代码

```cpp
const int N = 200010;
int n, tr[N];

void add(int x, int v) {
    for (; x <= n; x += x & -x) tr[x] += v;
}

int ask(int x) {
    int s = 0;
    for (; x; x -= x & -x) s += tr[x];
    return s;
}
```

### 复杂度

单次操作通常是 `O(log n)`。

---

## 9. [P4113 [HEOI2012] 采花](https://www.luogu.com.cn/problem/P4113)
`树状数组` `离线查询` `前两次出现`

### 题意

给定花的颜色序列，查询区间内有多少种颜色至少出现两次。

### 分析

扫到某个颜色的新出现位置时，只需要维护它“倒数第二次出现”的位置。若某颜色在当前位置前已经出现两次，就把贡献从旧位置挪到新位置。这样每个颜色在树状数组里只保留一个有效贡献点，查询时直接做区间和即可。

### 核心代码

```cpp
const int N = 2000010;
int last[N], prelast[N];
long long tr[N];

void add(int x, int v) {
    for (; x < N; x += x & -x) tr[x] += v;
}

long long sum(int x) {
    long long s = 0;
    for (; x; x -= x & -x) s += tr[x];
    return s;
}
```

### 复杂度

时间复杂度 `O((n+m) log n)`。

---

## 10. [P3586 [POI 2015 R2] 物流 Logistics](https://www.luogu.com.cn/problem/P3586)
`树状数组` `值域统计` `动态维护`

### 题意

动态修改若干数值，并询问把每个数截断到 `s` 之后的总和是否达到要求。

### 分析

核心量是 `sum(min(a[i], s))`。因此只要维护“数值个数”和“数值总和”两棵树状数组，就能在 `s` 上做前缀统计：小于等于 `s` 的部分直接累加，大于 `s` 的部分统一按 `s` 计算。

### 核心代码

```cpp
const int N = 2000010;
long long cnt[N], val[N];

void add(long long tr[], int x, long long v) {
    for (; x < N; x += x & -x) tr[x] += v;
}

long long sum(long long tr[], int x) {
    long long s = 0;
    for (; x; x -= x & -x) s += tr[x];
    return s;
}
```

### 复杂度

单次修改和查询都是 `O(log n)`。

---

# 三、离线统计与答案分治

这一章把答案放到值域或时间轴上整体二分，再借助树状数组批量判定。

## 11. [P3527 [POI 2011] MET-Meteors](https://www.luogu.com.cn/problem/P3527)
`整体二分` `树状数组` `区间加单点查`

### 题意

每次流星雨会给一段环形区间增加贡献。每个国家都有若干扇区，问最早经过多少次流星雨后，各国累计贡献能达到目标。

### 分析

答案对“前缀流星雨数量”具有单调性，所以可以整体二分。判定某个前缀时，用树状数组做区间加、单点查，统计每个国家当前拿到的总贡献，再决定答案落在左半还是右半。

### 核心代码

```cpp
const int N = 300010;
long long bit[N];

void add(int x, long long v) {
    for (; x < N; x += x & -x) bit[x] += v;
}

long long sum(int x) {
    long long s = 0;
    for (; x; x -= x & -x) s += bit[x];
    return s;
}
```

### 复杂度

整体二分配合树状数组，通常是 `O((n+m) log^2 m)`。

---

## 12. [P3332 [ZJOI2013] K 大数查询](https://www.luogu.com.cn/problem/P3332)
`整体二分` `树状数组` `区间加`

### 题意

维护若干位置上的数值插入，支持区间插入和区间第 `k` 大查询。

### 分析

把答案放到值域上整体二分。每轮把所有值大于等于 `mid` 的修改批量加到树状数组里，再对每个查询统计当前区间内有多少数被加到了，借此判断第 `k` 大落在哪一半。

### 核心代码

```cpp
const int N = 50010;
int bit[N];

void add(int x, int v) {
    for (; x < N; x += x & -x) bit[x] += v;
}

int sum(int x) {
    int s = 0;
    for (; x; x -= x & -x) s += bit[x];
    return s;
}
```

### 复杂度

时间复杂度通常是 `O(m log^2 V)`。

---

## 13. [P3605 [USACO17JAN] Promotion Counting P](https://www.luogu.com.cn/problem/P3605)
`树状数组` `欧拉序` `子树统计`

### 题意

给定一棵树和每个点的权值，求每个点子树中比它权值更大的点有多少个。

### 分析

先把树压成欧拉序，子树就变成区间。再按权值从大到小处理节点：当前批次先查询，再把这一批节点加入树状数组，这样就不会把相同权值算进去。

### 核心代码

```cpp
const int N = 100010;
int tin[N], tout[N], ord[N], idx;
long long bit[N];

void add(int x, int v) {
    for (; x <= idx; x += x & -x) bit[x] += v;
}

long long sum(int x) {
    long long s = 0;
    for (; x; x -= x & -x) s += bit[x];
    return s;
}
```

### 复杂度

时间复杂度 `O(n log n)`。

---

## 14. [P5677 [GZOI2017] 配对统计](https://www.luogu.com.cn/problem/P5677)
`树状数组` `离线排序` `区间计数`

### 题意

先预处理出所有“配对”关系，再回答很多区间询问：区间里有多少对端点都落在其中。

### 分析

先把每个元素能形成的候选配对找出来，再按配对右端点和询问右端点排序。树状数组只负责维护已经加入的配对左端点，这样每个询问就能用一个前缀和完成计数。

### 核心代码

```cpp
const int N = 200010;
int bit[N];

void add(int x, int v) {
    for (; x < N; x += x & -x) bit[x] += v;
}

int sum(int x) {
    int s = 0;
    for (; x; x -= x & -x) s += bit[x];
    return s;
}
```

### 复杂度

时间复杂度 `O((n+m) log n)`。

---

# 四、高维偏序与综合应用

这一章把树状数组放到更高维的分治框架里，用来处理偏序、矩阵和异或类问题。

## 15. [P1527 [国家集训队] 矩阵乘法](https://www.luogu.com.cn/problem/P1527)
`整体二分` `二维树状数组` `子矩形第 k 小`

### 题意

给定一个矩阵，很多询问要求子矩形中的第 `k` 小数。

### 分析

把矩阵元素和询问一起离线整体二分。判定某个值 `mid` 时，把所有 `<= mid` 的格子加入二维树状数组，再统计每个询问子矩形里有多少个数满足条件。若数量不足 `k`，答案就往右半边走。

### 核心代码

```cpp
const int N = 505;
int bit[N][N];

void add(int x, int y, int v) {
    for (int i = x; i < N; i += i & -i)
        for (int j = y; j < N; j += j & -j)
            bit[i][j] += v;
}

int sum(int x, int y) {
    int s = 0;
    for (int i = x; i; i -= i & -i)
        for (int j = y; j; j -= j & -j)
            s += bit[i][j];
    return s;
}
```

### 复杂度

时间复杂度通常是 `O(n^2 log^2 n)` 级别的离线判定。

---

## 16. [P3810 【模板】三维偏序 / 陌上花开](https://www.luogu.com.cn/problem/P3810)
`CDQ 分治` `树状数组` `三维偏序`

### 题意

给定三维点，统计每个点有多少个点在它的三维偏序范围内，然后按答案分组输出。

### 分析

先按第一维排序，CDQ 只负责把“左半边对右半边”的贡献拆出来；第二维在归并时排序，第三维交给树状数组做前缀统计。这样就把三维问题降成了“分治 + 一维前缀”。

### 核心代码

```cpp
struct Node {
    int a, b, c, cnt, ans;
} p[N], t[N];
int bit[N];

void add(int x, int v) {
    for (; x < N; x += x & -x) bit[x] += v;
}

int sum(int x) {
    int s = 0;
    for (; x; x -= x & -x) s += bit[x];
    return s;
}
```

### 复杂度

时间复杂度 `O(n log^2 n)`。

---

## 17. [P2487 [SDOI2011] 拦截导弹](https://www.luogu.com.cn/problem/P2487)
`CDQ 分治` `DP` `序列偏序`

### 题意

导弹有高度和速度两个属性，要求求出最优拦截链的长度，并统计每个导弹出现在最优方案中的概率。

### 分析

这是二维偏序上的最长链问题。先用 CDQ 优化动态规划，求出每个点的最优长度和方案数；再做一遍反向 DP，得到每个点作为中间点的贡献，最后按最优链总数算概率。

### 核心代码

```cpp
struct Node {
    int h, v, id;
} p[N];
int f[N], g[N], cnt1[N], cnt2[N];
int bit[N];

void add(int x, int v) {
    for (; x < N; x += x & -x) bit[x] = max(bit[x], v);
}
```

### 复杂度

时间复杂度一般是 `O(n log^2 n)`。

---

## 18. [CF341D Iahub and Xors](https://www.luogu.com.cn/problem/CF341D)
`二维树状数组` `异或` `矩形修改`

### 题意

维护一个二维矩阵，支持矩形异或修改和矩形异或查询。

### 分析

异或满足结合律和自反性，所以可以像二维差分一样做前缀维护。为了把矩形修改还原成前缀异或，通常要把下标奇偶拆开，分别维护四组二维树状数组，再用容斥还原答案。

### 核心代码

```cpp
const int N = 1010;
int bit[2][2][N][N];

void add(int x, int y, int v) {
    for (int i = x; i < N; i += i & -i)
        for (int j = y; j < N; j += j & -j)
            bit[x & 1][y & 1][i][j] ^= v;
}

int sum(int x, int y) {
    int s = 0;
    for (int i = x; i; i -= i & -i)
        for (int j = y; j; j -= j & -j)
            s ^= bit[x & 1][y & 1][i][j];
    return s;
}
```

### 复杂度

单次操作和查询都是 `O(log n log m)`。

---
