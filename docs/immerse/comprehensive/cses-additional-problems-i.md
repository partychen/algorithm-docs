---
title: "CSES 综合补充专题精选解题报告"
subtitle: "🧭 从字符串观察到数组、几何与状态重建的补充主线"
order: 8
icon: "🧭"
---

# CSES 综合补充专题精选解题报告

这一组题从局部观察一路走到整体重建：有的题盯住一个字符、一段前缀、一个边界点，先把最小信息抽出来；有的题则要把这些信息重新拼成排序过程、几何距离、可行状态，最后把答案完整还原出来。

阅读时很适合顺着“模型怎么落地”这条线往前推。前半段多是把原问题压成更容易维护的计数、边界或单调结构，后半段则越来越强调状态空间、可达性与构造细节，题面跨度很大，解法节奏却很统一。

# 一、字符串、位串与数字构造

这一章的共同点是“先看局部缺什么”。有的题要找最短缺失子序列，有的题要把频次压成等价状态，有的题只在翻转点上维护答案，还有的题把十进制书写量变成一类数位计数问题。

## 1. [Shortest Subsequence](https://cses.fi/problemset/task/1087)

`字符串` `贪心`

### 题意

给出一个只含 `A`、`C`、`G`、`T` 的 DNA 串。需要构造一个最短的新串，使它不是原串的子序列；若答案不唯一，输出任意一个即可。

### 分析

如果从左到右扫描原串，并把四种字符是否都出现过记成一个集合，那么每凑齐一轮四种字符，就说明任意长度为当前轮数的候选串都还能继续在后面找下去。真正让子序列匹配断掉的时刻，一定出现在某一轮没有凑满四种字符的尾段。

于是可以把原串切成若干个“完整轮次”。每次某个字符让当前轮次第一次凑齐四种字符，就把这个字符写进答案并重置状态；最后扫描结束时，尾段里总有至少一种字符没有出现，把它补到答案末尾，这个串就一定无法作为子序列被匹配完，而且长度最短。

### 核心代码

```cpp
std::string ans;
int mask = 0;
for (char c : s) {
    mask |= 1 << id(c);
    if (mask == 15) {
        ans += c;
        mask = 0;
    }
}
for (char c : std::string("ACGT")) {
    if (!(mask & (1 << id(c)))) {
        ans += c;
        break;
    }
}
```

### 复杂度

时间复杂度 $O(n)$，空间复杂度 $O(1)$。

---

## 2. [Special Substrings](https://cses.fi/problemset/task/2186)

`前缀和` `哈希`

### 题意

给定一个小写字母串。若某个子串中所有出现过的字符出现次数都相同，则称它为特殊子串。求特殊子串总数。

### 分析

只需要关心整串里真正出现过的字符。设这些字符的前缀计数向量是 $c$，如果两个前缀之间形成的子串是特殊的，那么这个差分向量里所有非零分量必须完全相等。

把一个前缀向量减去其中的最小值后得到“归一化状态”。这样一来，某段子串的所有非零出现次数相等，当且仅当它两端前缀的归一化状态相同。于是问题就变成统计同一状态出现了多少次，用哈希表累加即可。

### 核心代码

```cpp
std::vector<int> cnt(sig), key(sig);
std::map<std::vector<int>, long long> mp;
long long ans = 0;
mp[key] = 1;
for (char ch : s) {
    ++cnt[pos[ch]];
    int mn = *std::min_element(cnt.begin(), cnt.end());
    for (int i = 0; i < sig; ++i) key[i] = cnt[i] - mn;
    ans += mp[key];
    ++mp[key];
}
```

### 复杂度

时间复杂度 $O(n\sigma)$，空间复杂度 $O(n\sigma)$，其中 $\sigma$ 是整串实际出现的字符种类数。

---

## 3. [Bit Inversions](https://cses.fi/problemset/task/1188)

`平衡树` `维护区间`

### 题意

给定一个位串，并依次执行若干次单点翻转。每次翻转后，需要输出当前最长同字符连续段的长度。

### 分析

真正影响答案的不是整段内容，而是“相邻字符是否发生变化”的分界点。若我们把所有分界点存进有序集合，那么任意两个相邻分界点之间就是一段完全相同的区间；再用一个多重集合维护这些区间长度，最大值就是答案。

翻转位置 $x$ 时，只会影响边界 $(x-1,x)$ 和 $(x,x+1)$。对每条边界，若原本存在就删除，不存在就插入；每次改动边界时顺带把左右两段长度从多重集合中拆开或合并，整次操作只改常数个位置。

### 核心代码

```cpp
auto cut = [&](int p) {
    auto it = cuts.find(p), r = std::next(it), l = std::prev(it);
    lens.erase(lens.find(*r - *l));
    lens.insert(p - *l);
    lens.insert(*r - p);
};
auto join = [&](int p) {
    auto it = cuts.find(p), r = std::next(it), l = std::prev(it);
    lens.erase(lens.find(p - *l));
    lens.erase(lens.find(*r - p));
    lens.insert(*r - *l);
};
auto flip_edge = [&](int p) {
    if (p <= 0 || p >= n) return;
    if (cuts.count(p)) join(p), cuts.erase(p);
    else cuts.insert(p), cut(p);
};
flip_edge(x - 1);
flip_edge(x);
```

### 复杂度

单次修改时间复杂度 $O(\log n)$，空间复杂度 $O(n)$。

---

## 4. [Writing Numbers](https://cses.fi/problemset/task/1086)

`数位统计` `二分答案`

### 题意

依次写下正整数 $1,2,3,\dots$。数字键 $0$ 到 $9$ 中的每一个都最多只能按 $n$ 次，问最多能完整写到哪个数。

### 分析

答案显然具有单调性：如果能写到 $m$，那么一定也能写到更小的数。因此可以二分最后一个数。关键在于判定写到 $m$ 时每个数字一共出现了多少次。

单个数字 $d$ 在 $1\sim m$ 中的出现次数可以按十进制位独立计算。枚举位权 $10^k$，把当前数拆成高位、当前位和低位三段，就能在 $O(\log m)$ 内求出任意一个数字的总出现次数。二分时检查十个数字是否都不超过限制即可。

### 核心代码

```cpp
long long occ(long long x, int d) {
    long long res = 0;
    for (long long p = 1; p <= x; p *= 10) {
        long long hi = x / (p * 10), cur = x / p % 10, lo = x % p;
        if (d) res += hi * p;
        else if (hi) res += (hi - 1) * p;
        if (cur > d) res += p;
        else if (cur == d) res += lo + 1;
    }
    return res;
}
auto ok = [&](long long x) {
    for (int d = 0; d < 10; ++d) if (occ(x, d) > n) return false;
    return true;
};
```

### 复杂度

单次判定时间复杂度 $O(10\log x)$，整体时间复杂度 $O(10\log^2 U)$，其中 $U$ 是二分上界；空间复杂度 $O(1)$。

# 二、去重、排序过程与环形数组

这一章更像是在看“过程的骨架”。有的题把不同值对答案的贡献拆开，有的题直接刻画冒泡排序每轮到底做了什么，有的题把环拆成链再用跳跃结构补回去，本质上都在抓那个最稳定的状态量。

## 5. [Distinct Values Sum](https://cses.fi/problemset/task/3150)

`贡献统计` `哈希`

### 题意

定义 $d(a,b)$ 为子数组 $[a,b]$ 中不同数值的个数。要求计算所有子数组的 $d(a,b)$ 之和。

### 分析

不妨反过来看每个位置对多少个子数组贡献了一个“新的不同值”。若 $x_i$ 的上一次出现位置是 $pre_i$，那么在所有左端点 $l>pre_i$ 且右端点 $r\ge i$ 的子数组中，$x_i$ 正好是该值在子数组里的第一次出现，因此它会为不同值个数贡献 $1$。

于是位置 $i$ 的贡献就是 $(i-pre_i)\times(n-i+1)$。把所有位置的贡献加起来即可，不需要真的枚举任何子数组。

### 核心代码

```cpp
std::unordered_map<long long, int> last;
long long ans = 0;
for (int i = 1; i <= n; ++i) {
    int pre = last.count(a[i]) ? last[a[i]] : 0;
    ans += 1LL * (i - pre) * (n - i + 1);
    last[a[i]] = i;
}
```

### 复杂度

时间复杂度 $O(n)$，空间复杂度 $O(n)$。

---

## 6. [Distinct Values Splits](https://cses.fi/problemset/task/3190)

`动态规划` `双指针`

### 题意

把数组划分成若干连续段，要求每一段内部都没有重复值。求合法划分方案数，答案对 $10^9+7$ 取模。

### 分析

设 $dp[i]$ 表示前 $i$ 个数的划分方案数。若最后一段是 $[j,i]$，它必须没有重复值，因此只有当 $j$ 不小于某个左边界 $L_i$ 时才合法。这个边界可以用双指针配合最近出现位置在线维护。

于是转移就是 $dp[i]=\sum_{j=L_i}^{i} dp[j-1]$。为了让区间求和变成 $O(1)$，再维护前缀和 $pre[i]=dp[0]+\cdots+dp[i]$，就能在线完成所有转移。

### 核心代码

```cpp
std::unordered_map<int, int> last;
dp[0] = pre[0] = 1;
int L = 1;
for (int i = 1; i <= n; ++i) {
    L = std::max(L, last[a[i]] + 1);
    dp[i] = (pre[i - 1] - (L >= 2 ? pre[L - 2] : 0) + MOD) % MOD;
    pre[i] = (pre[i - 1] + dp[i]) % MOD;
    last[a[i]] = i;
}
```

### 复杂度

时间复杂度 $O(n)$，空间复杂度 $O(n)$。

---

## 7. [Bubble Sort Rounds I](https://cses.fi/problemset/task/3151)

`排序过程` `稳定排序`

### 题意

对数组执行标准冒泡排序。每一轮从左到右交换逆序的相邻元素。求一共需要多少轮才能排好序。

### 分析

在冒泡排序里，一个元素每轮最多只能向左移动一格，所以真正决定轮数的是“谁需要向左走得最远”。把数组做一次稳定排序，得到每个元素最终应该去的位置，原位置减最终位置就是它需要左移的步数。

答案就是所有元素左移步数的最大值。由于有重复值，必须按“值 + 原下标”做稳定排序，否则相同元素之间的相对次序会被算错。

### 核心代码

```cpp
std::vector<std::pair<int, int>> v;
for (int i = 1; i <= n; ++i) v.push_back({a[i], i});
std::stable_sort(v.begin(), v.end());
int ans = 0;
for (int pos = 1; pos <= n; ++pos) {
    int from = v[pos - 1].second;
    ans = std::max(ans, from - pos);
}
```

### 复杂度

时间复杂度 $O(n\log n)$，空间复杂度 $O(n)$。

---

## 8. [Bubble Sort Rounds II](https://cses.fi/problemset/task/3152)

`贪心` `优先队列`

### 题意

给定数组以及轮数 $k$，要求输出执行 $k$ 轮冒泡排序后的数组内容。

### 分析

做了 $k$ 轮之后，任何元素最多只能向左移动 $k$ 格，因此最终第 $pos$ 个位置只能从原数组前 $pos+k$ 个元素里挑。同时，冒泡排序是稳定的：在所有当前能被拉到这个位置的元素里，一定是值最小、下标最早的那个先落位。

于是从左到右构造答案。指针把原数组前缀逐步加入一个按“值、原下标”排序的小根堆，每次在允许范围内弹出最小元素放到当前位置。这个过程恰好还原了 $k$ 轮冒泡后留下的稳定序。

### 核心代码

```cpp
using P = std::pair<int, int>;
std::priority_queue<P, std::vector<P>, std::greater<P>> pq;
std::vector<int> ans;
for (int pos = 1, r = 0; pos <= n; ++pos) {
    while (r < std::min<long long>(n, pos + k - 1)) {
        ++r;
        pq.push({a[r], r});
    }
    ans.push_back(pq.top().first);
    pq.pop();
}
```

### 复杂度

时间复杂度 $O(n\log n)$，空间复杂度 $O(n)$。

---

## 9. [Sorting Methods](https://cses.fi/problemset/task/1162)

`排列` `LIS`

### 题意

数组是 $1\sim n$ 的一个排列。分别求四种操作下把它排成升序所需的最少步数：交换相邻元素、交换任意两个元素、把任意元素挪到任意位置、把任意元素挪到数组最前面。

### 分析

四问其实对应四个经典量。

第一问就是逆序对数；第二问是排列分解成若干环后，每个环要用“长度减一”次交换拆开，所以答案是 $n-$环数；第三问保留一个最长上升子序列不动，其余元素逐个插回，答案是 $n-\text{LIS}$；第四问则寻找一个已经可以留在后缀里的最长正确后缀，从后往前匹配 $n,n-1,\dots$，最终还没匹配上的那些元素都必须搬到前面。

### 核心代码

```cpp
long long adj = inversion_count(p);
int cyc = 0;
for (int i = 1; i <= n; ++i) if (!vis[i]) {
    ++cyc;
    for (int x = i; !vis[x]; x = p[x]) vis[x] = 1;
}
int any_swap = n - cyc;
int move_any = n - lis_length(p);
int need = n;
for (int i = n; i >= 1; --i) if (p[i] == need) --need;
int move_front = need;
```

### 复杂度

时间复杂度 $O(n\log n)$，空间复杂度 $O(n)$。

---

## 10. [Cyclic Array](https://cses.fi/problemset/task/1191)

`环转链` `倍增`

### 题意

数组是环形的，需要把整圈切成若干连续段，使每段元素和都不超过 $k$。求最少能切成多少段。

### 分析

先把数组复制一遍，环就变成长度 $2n$ 的链。对于每个起点 $i$，用双指针求出从 $i$ 出发一段最多能延伸到哪里，记为 `nxt[i]`，表示一刀切完后下一段的起点。

问题随即变成：从任意 $i\in[1,n]$ 出发，最少跳多少次 `nxt` 才能覆盖到 $i+n$。这是标准的函数跳跃问题，用倍增预处理 `up[t][i]` 表示连续切 $2^t$ 段后到达的位置，再对每个起点贪心试跳即可。

### 核心代码

```cpp
for (int i = 1, r = 0; i <= 2 * n; ++i) {
    while (r < 2 * n && sum[r + 1] - sum[i - 1] <= k) ++r;
    up[0][i] = r + 1;
}
for (int t = 1; t < LOG; ++t)
    for (int i = 1; i <= 2 * n + 1; ++i)
        up[t][i] = up[t - 1][up[t - 1][i]];
int ans = n;
for (int i = 1; i <= n; ++i) {
    int cur = i, cnt = 0;
    for (int t = LOG - 1; t >= 0; --t)
        if (up[t][cur] < i + n) cur = up[t][cur], cnt += 1 << t;
    ans = std::min(ans, cnt + 1);
}
```

### 复杂度

时间复杂度 $O(n\log n)$，空间复杂度 $O(n\log n)$。

# 三、几何、网格与矩形

这一章都是“形状题”，但落脚点并不一样。营地问题在曼哈顿距离下做最近点查询，后两题则把二维几何压回到直方图上的最大矩形，重点都在于怎样把空间结构改写成可以线性维护的序列结构。

## 11. [Nearest Campsites I](https://cses.fi/problemset/task/3306)

`曼哈顿距离` `扫描线`

### 题意

给出若干已被预订的营地和若干空闲营地。对每个空闲营地，考虑它到最近已预订营地的曼哈顿距离；题目要求这些距离中的最大值。

### 分析

对一个空闲点 $(x,y)$ 而言，最近点一定来自四个象限之一。若某个已预订点满足 $a\le x,b\le y$，那么距离就是 $(x+y)-(a+b)$，为了让这部分尽量小，只需要在这个象限里维护最大的 $a+b$。其余三个象限同理，分别对应 $a-b$、$-a+b$、$-a-b$ 的最大值。

因此可以做四次扫描线：按一个方向排序后，用树状数组维护另一维上的前缀最大值，求出每个空闲点从该象限得到的最优值。四次结果取最小就是该点到最近预订营地的距离，再在所有空闲点里取最大值。

### 核心代码

```cpp
auto work = [&](auto pts, auto ask) {
    std::sort(pts.begin(), pts.end());
    std::sort(ask.begin(), ask.end());
    Fenwick bit(Y);
    int j = 0;
    for (auto [x, y, id, val] : ask) {
        while (j < (int)pts.size() && pts[j].x <= x) {
            bit.add(pts[j].y, pts[j].x + pts[j].y);
            ++j;
        }
        best[id] = std::min(best[id], val - bit.query(y));
    }
};
work(reserved_sw1, free_sw1);
work(reserved_sw2, free_sw2);
work(reserved_sw3, free_sw3);
work(reserved_sw4, free_sw4);
```

### 复杂度

时间复杂度 $O((n+m)\log (n+m))$，空间复杂度 $O(n+m)$。

---

## 12. [Nearest Campsites II](https://cses.fi/problemset/task/3307)

`曼哈顿距离` `离线查询`

### 题意

与上一题相同，但这次要输出每个空闲营地到最近已预订营地的距离，而不是只求最大值。

### 分析

做法和上一题完全一致，区别只在答案的聚合方式。每次扫描线都会给每个空闲点提供一个来自某个象限的候选距离，把四个候选值取最小即可。

由于查询点很多，必须离线处理。把预订点与空闲点统一做坐标变换、排序和坐标压缩，四遍扫描就能把所有答案一次性求出，最后按输入顺序输出。

### 核心代码

```cpp
std::fill(ans.begin(), ans.end(), INF);
for (int dir = 0; dir < 4; ++dir) {
    build_points(dir, reserved, freep, rp, fq);
    std::sort(rp.begin(), rp.end());
    std::sort(fq.begin(), fq.end());
    Fenwick bit(Y);
    for (int i = 0, j = 0; i < (int)fq.size(); ++i) {
        while (j < (int)rp.size() && rp[j].x <= fq[i].x)
            bit.add(rp[j].y, rp[j].x + rp[j].y), ++j;
        ans[fq[i].id] = std::min(ans[fq[i].id], fq[i].x + fq[i].y - bit.query(fq[i].y));
    }
}
```

### 复杂度

时间复杂度 $O((n+m)\log (n+m))$，空间复杂度 $O(n+m)$。

---

## 13. [Advertisement](https://cses.fi/problemset/task/1142)

`单调栈` `最大矩形`

### 题意

给出一排宽度都为 $1$ 的竖板，高度各不相同。求能贴上的最大矩形广告面积。

### 分析

对每一块板子，若把它当成矩形的最矮板，就需要知道它向左、向右第一个比它矮的位置。这样矩形宽度就被唯一确定，面积也随之确定。

这正是单调栈的典型应用。维护一个高度递增的栈，遇到更矮的板子就不断弹栈；每次弹出时，当前下标给出右边界，新的栈顶给出左边界，于是可以立即更新以该高度为最小值的最大面积。

### 核心代码

```cpp
std::stack<int> st;
long long ans = 0;
for (int i = 1; i <= n + 1; ++i) {
    while (!st.empty() && h[st.top()] >= h[i]) {
        int mid = st.top(); st.pop();
        int l = st.empty() ? 0 : st.top();
        ans = std::max(ans, 1LL * h[mid] * (i - l - 1));
    }
    st.push(i);
}
```

### 复杂度

时间复杂度 $O(n)$，空间复杂度 $O(n)$。

---

## 14. [Maximum Building I](https://cses.fi/problemset/task/1147)

`矩阵转直方图` `单调栈`

### 题意

森林网格里 `.` 表示空地，`*` 表示树。要求找一个全由空地组成的最大矩形建筑面积。

### 分析

按行扫描网格，把每一列向上连续空地的高度记成直方图。这样每一行都对应一个“以这一行作为底边”的矩形最大面积问题，而那正好就是上一题的直方图最大矩形。

于是每处理完一行，就用一次单调栈计算当前直方图的最大矩形，拿全局最大值即可。二维问题被压成了 $n$ 次一维问题。

### 核心代码

```cpp
long long ans = 0;
for (int i = 1; i <= n; ++i) {
    for (int j = 1; j <= m; ++j)
        up[j] = (g[i][j] == '.' ? up[j] + 1 : 0);
    std::stack<int> st;
    for (int j = 1; j <= m + 1; ++j) {
        while (!st.empty() && up[st.top()] >= up[j]) {
            int mid = st.top(); st.pop();
            int l = st.empty() ? 0 : st.top();
            ans = std::max(ans, 1LL * up[mid] * (j - l - 1));
        }
        st.push(j);
    }
}
```

### 复杂度

时间复杂度 $O(nm)$，空间复杂度 $O(m)$。

# 四、数论、约束与可达性

这一章的味道最杂，却都绕不开“可行边界”四个字：乘法表中位数靠计数函数卡边界，LCM 与平方积靠代数结构压维，区间和约束变成势能图，水壶题则直接落到可达状态与最短路上。

## 15. [Multiplication Table](https://cses.fi/problemset/task/2422)

`二分答案` `计数`

### 题意

给定一个奇数 $n$，考虑 $n\times n$ 乘法表中所有数按升序排列后的中位数，要求输出这个值。

### 分析

设我们猜测答案为 $x$，那么乘法表中不超过 $x$ 的数有多少个？第 $i$ 行是 $i,2i,3i,\dots,ni$，其中不超过 $x$ 的元素个数就是 $\min(n,\lfloor x/i\rfloor)$。

把所有行加起来就得到计数函数，它随 $x$ 单调不减。于是对目标排名 $(n^2+1)/2$ 二分最小的可行 $x$ 即可。

### 核心代码

```cpp
auto cnt = [&](long long x) {
    long long res = 0;
    for (long long i = 1; i <= n; ++i)
        res += std::min(n, x / i);
    return res;
};
long long l = 1, r = 1LL * n * n;
while (l < r) {
    long long mid = (l + r) >> 1;
    if (cnt(mid) >= (1LL * n * n + 1) / 2) r = mid;
    else l = mid + 1;
}
```

### 复杂度

时间复杂度 $O(n\log n)$，空间复杂度 $O(1)$。

---

## 16. [Counting LCM Arrays](https://cses.fi/problemset/task/3169)

`数论` `矩阵快速幂`

### 题意

对于每组 $(n,k)$，统计正整数数组 $a_1\dots a_n$ 的数量，使得相邻两项都满足 $\operatorname{lcm}(a_i,a_{i+1})=k$，答案对 $10^9+7$ 取模。

### 分析

先把 $k$ 质因数分解为 $\prod p^{e}$。任意 $a_i$ 都必须是 $k$ 的因子，于是对每个质因子可以单独看其指数序列 $t_i\in[0,e]$。条件 $\operatorname{lcm}(a_i,a_{i+1})=k$ 等价于每对相邻位置都满足 $\max(t_i,t_{i+1})=e$。

对单个质因子来说，只要区分“当前指数是否等于 $e$”。若不等于 $e$，具体有 $e$ 种取法，但相邻两个位置不能同时都小于 $e$。因此这是一个两状态线性递推：`E` 表示等于 $e$，`N` 表示小于 $e$。长度很大时直接用 $2\times2$ 矩阵快速幂，再把所有质因子的方案数相乘即可。

### 核心代码

```cpp
auto solve_prime = [&](long long n, int e) {
    Mat A{{1, 1}, {e, 0}};
    Vec v{1, e};
    v = qpow(A, n - 1) * v;
    return (v[0] + v[1]) % MOD;
};
long long ans = 1;
for (auto [p, e] : factor(k))
    ans = ans * solve_prime(n, e) % MOD;
```

### 复杂度

单组数据时间复杂度 $O(\sqrt{k}+\omega(k)\log n)$，空间复杂度 $O(1)$。

---

## 17. [Square Subsets](https://cses.fi/problemset/task/3193)

`线性基` `异或`

### 题意

给定一个数组，统计乘积是完全平方数的子集个数，空集也算一种方案，答案对 $10^9+7$ 取模。

### 分析

一个数是否会破坏“平方性”，只取决于它各个质因子的指数奇偶。把每个数分解质因数后，记录奇次幂对应的质数集合，就得到一个 $0/1$ 向量；若若干数的乘积是平方数，那么这些向量按位异或后的结果必须全为 $0$。

因此问题变成：有 $n$ 个二进制向量，问异或和为 $0$ 的子集有多少个。设这些向量在线性空间中的秩为 $r$，那么零空间维数就是 $n-r$，答案正好是 $2^{n-r}$。

### 核心代码

```cpp
int rank = 0;
for (auto v : masks) {
    for (int b = MAXP - 1; b >= 0; --b) if (v[b]) {
        if (!basis[b].any()) { basis[b] = v; ++rank; break; }
        v ^= basis[b];
    }
}
long long ans = 1;
for (int i = 0; i < n - rank; ++i) ans = ans * 2 % MOD;
```

### 复杂度

时间复杂度 $O(nP^2 / w)$，空间复杂度 $O(P^2 / w)$，其中 $P$ 是不超过 $5000$ 的质数个数，$w$ 是机器字长。

---

## 18. [Subarray Sum Constraints](https://cses.fi/problemset/task/3294)

`图论` `差分约束`

### 题意

需要构造一个长度为 $n$ 的整数数组，使若干条约束 $\sum_{i=l}^{r} x_i=s$ 全部成立；若无解输出 `NO`，否则输出任意一组解。

### 分析

设前缀和为 $p_i=x_1+\cdots+x_i$，并令 $p_0=0$。每条区间和约束都会变成一个等式 $p_r-p_{l-1}=s$，也就是 $p_r=p_{l-1}+s$。这已经是图上的势能关系：在点 $l-1$ 与点 $r$ 之间连一条权值为 $s$ 的边，同时反向边权为 $-s$。

如果同一连通块里沿不同路径推出的前缀和值不一致，就说明无解；否则任选一个点设为 $0$，整块点的势能都能唯一确定。最后再把 $x_i=p_i-p_{i-1}$ 还原出来即可。

### 核心代码

```cpp
bool ok = true;
for (int s = 0; s <= n; ++s) if (!vis[s]) {
    std::queue<int> q;
    q.push(s), vis[s] = 1, pref[s] = 0;
    while (!q.empty()) {
        int u = q.front(); q.pop();
        for (auto [v, w] : g[u]) {
            if (!vis[v]) pref[v] = pref[u] + w, vis[v] = 1, q.push(v);
            else if (pref[v] != pref[u] + w) ok = false;
        }
    }
}
for (int i = 1; i <= n; ++i) x[i] = pref[i] - pref[i - 1];
```

### 复杂度

时间复杂度 $O(n+m)$，空间复杂度 $O(n+m)$。

---

## 19. [Water Containers Moves](https://cses.fi/problemset/task/3213)

`最短路` `状态图`

### 题意

两个容量分别为 $a,b$ 的水壶初始为空。允许装满、倒空、互倒，要求最后壶 $A$ 中恰好有 $x$ 单位水，并让“总共移动的水量”最小；若无法做到则输出 `-1`。

### 分析

状态可以直接写成 $(u,v)$，分别表示两个壶当前的水量。六类操作都会把它转移到另一个状态，而且边权就是这次实际移动了多少水：装满需要补多少、倒空需要倒掉多少、互倒需要转移多少。

因为权值非负，最自然的做法就是在 $(a+1)(b+1)$ 个状态上跑 Dijkstra。终点是一切形如 $(x,\ast)$ 的状态，最短路不仅给出最小水量，还能通过前驱数组恢复完整操作序列。

### 核心代码

```cpp
using T = std::tuple<long long, int, int>;
std::priority_queue<T, std::vector<T>, std::greater<T>> pq;
dist[0][0] = 0; pq.push({0, 0, 0});
while (!pq.empty()) {
    auto [d, u, v] = pq.top(); pq.pop();
    if (d != dist[u][v]) continue;
    for (auto [nu, nv, w, op] : next_states(u, v)) {
        if (dist[nu][nv] > d + w) {
            dist[nu][nv] = d + w;
            pre[nu][nv] = {u, v, op};
            pq.push({dist[nu][nv], nu, nv});
        }
    }
}
```

### 复杂度

时间复杂度 $O(ab\log(ab))$，空间复杂度 $O(ab)$。

---

## 20. [Water Containers Queries](https://cses.fi/problemset/task/3214)

`数论` `可达性`

### 题意

同样是两个水壶量取问题，但这次有多组询问，只需判断是否存在一种操作方式使壶 $A$ 最终恰好有 $x$ 单位水。

### 分析

不停执行装满、倒空、互倒之后，任意时刻两个壶中的水量都一定是 $\gcd(a,b)$ 的倍数。另一方面，只要 $x\le a$ 且 $x$ 是这个最大公约数的倍数，就总能借助经典倒水过程把壶 $A$ 调到这个值。

所以判定条件非常干净：$x\le a$ 且 $x\equiv 0\pmod{\gcd(a,b)}$ 时输出 `YES`，否则输出 `NO`。

### 核心代码

```cpp
for (auto [a, b, x] : qs) {
    long long g = std::gcd(a, b);
    if (x <= a && x % g == 0) std::cout << "YES\n";
    else std::cout << "NO\n";
}
```

### 复杂度

单次询问时间复杂度 $O(\log \min(a,b))$，空间复杂度 $O(1)$。

# 五、平均值、前缀优化与序列结构

这几题都不直接问原数组本身，而是在问“从某种聚合视角看，哪一段、哪一组、哪一种排列最好”。平均值问题常常落到前缀几何，序列结构题则更像在维护一个不断收缩的骨架。

## 21. [Stack Weights](https://cses.fi/problemset/task/2425)

`线段树` `前缀判定`

### 题意

有 $n$ 枚重量严格递增但具体数值未知的硬币，依次被放入左右两个栈。每一步都要判断：左栈一定更重、右栈一定更重，还是目前还无法确定。

### 分析

令 $d_i$ 表示编号 $i$ 的硬币在左栈记 $+1$，在右栈记 $-1$，未出现记 $0$。若真实重量满足严格递增，那么总重量差可以写成若干“后缀和”乘正系数的线性组合，因此左栈必重，当且仅当所有这些后缀和都非负且至少一个为正。

把它改写成前缀形式更方便维护。每次加入一枚硬币，相当于让某个位置之后的所有前缀和整体加一或减一，所以在线段树上做区间加，维护全局前缀和的最小值、最大值以及最后一个前缀值，就能立刻判断答案符号。

### 核心代码

```cpp
auto add_coin = [&](int pos, int sgn) { seg.range_add(pos, n, sgn); };
add_coin(c, side == 1 ? 1 : -1);
long long total = seg.sum_all();
if (total > 0 && seg.max_pref() <= total) std::cout << ">\n";
else if (total < 0 && seg.min_pref() >= total) std::cout << "<\n";
else std::cout << "?\n";
```

### 复杂度

单次操作时间复杂度 $O(\log n)$，空间复杂度 $O(n)$。

---

## 22. [Maximum Average Subarrays](https://cses.fi/problemset/task/3301)

`凸包` `前缀和`

### 题意

对每个右端点 $i$，求一个以 $i$ 结尾、平均值最大的子数组；如果有多个平均值相同的最优解，取其中最长的长度。

### 分析

设前缀和为 $S_i$。子数组 $[j,i]$ 的平均值等于点 $(j-1,S_{j-1})$ 与 $(i,S_i)$ 连线的斜率，因此问题变成：对每个终点 $(i,S_i)$，在所有更早的前缀点里找一条斜率最大的连线；若斜率相同，还要选更靠左的点。

随着 $i$ 递增，候选前缀点形成一条下凸壳。用单调队列维护这个凸壳，并用叉积比较两条斜率大小，就能在线找到每个 $i$ 的最优起点。平斜率时保留更早的点，自然满足“最长”的要求。

### 核心代码

```cpp
auto bad = [&](int a, int b, int c) {
    return (s[b] - s[a]) * (c - b) >= (s[c] - s[b]) * (b - a);
};
auto better = [&](int a, int b, int i) {
    return (s[i] - s[a]) * (i - b) <= (s[i] - s[b]) * (i - a);
};
for (int i = 1, hh = 0, tt = -1; i <= n; ++i) {
    while (tt - hh + 1 >= 2 && better(q[hh], q[hh + 1], i)) ++hh;
    ans[i] = i - q[hh];
    while (tt - hh + 1 >= 2 && bad(q[tt - 1], q[tt], i)) --tt;
    q[++tt] = i;
}
```

### 复杂度

时间复杂度 $O(n)$，空间复杂度 $O(n)$。

---

## 23. [Subsets with Fixed Average](https://cses.fi/problemset/task/3302)

`背包` `平均值变形`

### 题意

给定数组和目标平均值 $a$，统计平均值恰好为 $a$ 的非空子集个数，答案对 $10^9+7$ 取模。

### 分析

把每个数都减去 $a$，原问题就变成：统计和为 $0$ 的非空子集。这样平均值条件被完全吸收到一个子集和条件里，不需要再显式记录元素个数。

因为 $n\le 500$ 且数值范围也不大，所有变换后的数总和范围是可控的。做一个带偏移量的计数背包，逐个加入元素即可。最后取和为 $0$ 的方案数，再减掉空集这一种。

### 核心代码

```cpp
int OFF = 250000;
dp[OFF] = 1;
for (int x : a) {
    std::vector<int> ndp = dp;
    for (int s = 0; s <= 2 * OFF; ++s) if (dp[s])
        ndp[s + x] = (ndp[s + x] + dp[s]) % MOD;
    dp.swap(ndp);
}
int ans = (dp[OFF] - 1 + MOD) % MOD;
```

### 复杂度

时间复杂度 $O(nR)$，空间复杂度 $O(R)$，其中 $R$ 是可能的和域宽度。

---

## 24. [Two Array Average](https://cses.fi/problemset/task/3361)

`分数规划` `二分答案`

### 题意

从两个数组中各选一个非空前缀，把所有选中的数合在一起，要求平均值尽量大，并输出一组最优前缀长度。

### 分析

若猜测最优平均值至少为 $\lambda$，那么条件就等价于存在前缀 $i,j$ 使 $(A_i-\lambda i)+(B_j-\lambda j)\ge 0$，其中 $A_i,B_j$ 分别是两数组的前缀和。也就是说，只要各自取一个使“前缀和减去长度乘 $\lambda$”最大的前缀，再看两者之和是否非负即可。

这样便能对答案做实数二分。二分结束后，再用最终的 $\lambda$ 扫一遍两个数组，分别找出取值最大的非空前缀下标作为输出即可。

### 核心代码

```cpp
auto check = [&](double mid) {
    double ma = -1e100, mb = -1e100;
    for (int i = 1; i <= n; ++i) ma = std::max(ma, sa[i] - mid * i);
    for (int i = 1; i <= n; ++i) mb = std::max(mb, sb[i] - mid * i);
    return ma + mb >= 0;
};
double l = 0, r = 1e9;
for (int it = 0; it < 80; ++it) {
    double mid = (l + r) / 2;
    if (check(mid)) l = mid; else r = mid;
}
```

### 复杂度

时间复杂度 $O(n\log \varepsilon^{-1})$，空间复杂度 $O(1)$（不计前缀和数组）。

---

## 25. [Pyramid Array](https://cses.fi/problemset/task/1747)

`树状数组` `贪心`

### 题意

数组元素互不相同。每次可交换相邻元素，希望最终数组先严格递增再严格递减，问最少相邻交换次数。

### 分析

把数值按从小到大处理。当前最小的未处理元素在最终的“山形”里只能放在剩余位置的最左端或最右端：无论放哪边，都不会破坏将来更大的数形成峰顶。于是它的代价，就是把它移动到当前剩余区间左端或右端所需跨过的存活元素个数，取两者较小者。

用树状数组维护哪些位置还“活着”。处理一个元素时，查询它左边还剩多少元素、右边还剩多少元素，累加较小值后将该位置删除。这个局部最优会一直成立，因为小元素只负责铺两边，大元素才决定中间峰顶。

### 核心代码

```cpp
for (int i = 1; i <= n; ++i) bit.add(i, 1);
long long ans = 0;
for (int id : ord_by_value) {
    long long left = bit.sum(pos[id] - 1);
    long long right = bit.sum(n) - bit.sum(pos[id]);
    ans += std::min(left, right);
    bit.add(pos[id], -1);
}
```

### 复杂度

时间复杂度 $O(n\log n)$，空间复杂度 $O(n)$。

---

## 26. [Permutation Subsequence](https://cses.fi/problemset/task/3404)

`LCS 转 LIS` `路径恢复`

### 题意

给出两个排列，要求输出它们的最长公共子序列及其长度。

### 分析

因为两边都是排列，公共元素不会重复。把第一个排列中每个值出现的位置记下来，然后按第二个排列的顺序，把其中在第一个排列里出现过的值替换成对应位置，问题就转成了：在这个位置序列里找最长上升子序列。

LIS 的每个上升链都对应一组在两个排列中相对顺序一致的值，也就是公共子序列。用经典的 `tails + predecessor` 写法，不仅能求长度，还能把实际序列恢复出来。

### 核心代码

```cpp
for (int i = 1; i <= n; ++i) pos[a[i]] = i;
for (int x : b) if (x <= n) seq.push_back({pos[x], x});
for (int i = 0; i < (int)seq.size(); ++i) {
    int p = std::lower_bound(tail.begin(), tail.end(), seq[i].first) - tail.begin();
    if (p == (int)tail.size()) tail.push_back(seq[i].first), id.push_back(i);
    else tail[p] = seq[i].first, id[p] = i;
    pre[i] = (p ? id[p - 1] : -1);
}
```

### 复杂度

时间复杂度 $O((n+m)\log(n+m))$，空间复杂度 $O(n+m)$。

# 六、搜索、构造与重建

最后这一章更偏“把状态真正做出来”。有的题在小状态空间里直接最短路，有的题要构造字典序最小答案，有的题围着两个空位做局部搬运，还有一题干脆从两两和里把原数组倒推回来，读起来很像一组不同口味的重建练习。

## 27. [Swap Game](https://cses.fi/problemset/task/1670)

`BFS` `状态压缩`

### 题意

$3\times3$ 网格中放着 $1\sim9$，每次可以交换相邻两格。要求把它变成目标排列，输出最少交换次数。

### 分析

总状态数只有 $9!$，完全可以把每种排列都看作一个结点。任意一次合法操作就是沿着网格边交换两个位置，因此是一条单位边权。

最稳妥的做法是从目标状态出发做一遍 BFS，预处理所有排列到目标的最短距离。输入时只需把当前网格编码成一个排列编号，直接查询答案即可。

### 核心代码

```cpp
std::queue<std::string> q;
dist[goal] = 0; q.push(goal);
while (!q.empty()) {
    auto s = q.front(); q.pop();
    for (auto [u, v] : edges) {
        auto t = s;
        std::swap(t[u], t[v]);
        if (!dist.count(t)) {
            dist[t] = dist[s] + 1;
            q.push(t);
        }
    }
}
```

### 复杂度

预处理时间复杂度 $O(9!\cdot E)$，空间复杂度 $O(9!)$。

---

## 28. [Beautiful Permutation II](https://cses.fi/problemset/task/3175)

`构造` `贪心`

### 题意

构造字典序最小的排列，使任意相邻两项的差都不等于 $1$；若不存在则输出 `NO SOLUTION`。

### 分析

小规模先单独判：$n=1$ 时答案就是 $1$，$n=2,3$ 无解，$n=4$ 的最小解是 `2 4 1 3`。从 $n\ge5$ 开始，字典序最小的合法策略会把奇数尽量往前放：一旦开头放了 $1$，第二位只能从 $3$ 起跳；继续贪心时，保持奇数递增直到用完，始终不会制造相邻差 $1$。

奇数全部放完后，再接上所有偶数的递增序列即可。奇偶交界处差值至少为 $2$，同奇偶内部相邻也都是差 $2$，因此整个排列合法，而且前缀已经尽可能小。

### 核心代码

```cpp
if (n == 1) ans = {1};
else if (n == 4) ans = {2, 4, 1, 3};
else if (n <= 3) fail();
else {
    for (int i = 1; i <= n; i += 2) ans.push_back(i);
    for (int i = 2; i <= n; i += 2) ans.push_back(i);
}
```

### 复杂度

时间复杂度 $O(n)$，空间复杂度 $O(1)$（不计输出数组）。

---

## 29. [Letter Pair Move Game](https://cses.fi/problemset/task/2427)

`构造` `局部操作`

### 题意

长度为 $2n$ 的序列里有两个相邻空格，其余位置放着同样多的 `A` 和 `B`。每次可以把任意一对相邻字母整体搬到两个空格上，且顺序不变。目标是让所有 `A` 都出现在所有 `B` 之前；若无解输出 `-1`。

### 分析

真正要消掉的是所有形如 `BA` 的逆序断点。由于空格始终相邻，我们可以把它当成一个可移动的“窗口”：一旦把某段 `BA` 搬进窗口，空格就会跳到原来那段 `BA` 的位置，等价于把这个逆序块向正确方向推了一次。

构造时反复寻找最左侧的 `BA`。如果空格还没到合适位置，就先用附近的 `AA` 或 `BB` 把窗口平移过去；一旦形成 `BA..` 或 `..BA` 的局面，就执行一次搬运，把逆序数严格减小。若某一步再也找不到可供平移的同类块，而串中仍存在 `BA`，说明无法完成排序。

### 核心代码

```cpp
auto move_pair = [&](int i) {
    std::swap(s[gap], s[i]);
    std::swap(s[gap + 1], s[i + 1]);
    gap = i;
    ops.push_back(s);
};
while (true) {
    int p = s.find("BA");
    if (p == -1) break;
    if (!align_gap_to(p)) return fail();
    move_pair(p);
}
```

### 复杂度

时间复杂度 $O(n^2)$，空间复杂度 $O(n)$；在题目保证的构造范围内，操作次数不超过 $10n$。

---

## 30. [List of Sums](https://cses.fi/problemset/task/2414)

`构造` `多重集合`

### 题意

未知正整数数组 $A$ 的大小为 $n$，给出所有两两元素和组成的数组 $B$。保证存在至少一组合法的 $A$，要求恢复任意一组。

### 分析

把所有两两和排序后，最小的两个一定是 $a_1+a_2$ 与 $a_1+a_3$。再枚举第三个候选和 $a_2+a_3$，就能解出 $a_1=(s_0+s_1-s_t)/2$，进而得到 $a_2,a_3$。一旦前三个数确定，剩下的数就可以从当前最小未使用的和里不断反推出来。

验证时用多重集合维护尚未解释的两两和。每次确定一个新元素，就把它与所有已知元素形成的和从集合里删掉；若中途删不动，说明这次枚举的第三个和不成立，换下一个继续试即可。

### 核心代码

```cpp
for (int t = 2; t < (int)b.size(); ++t) {
    long long a1 = b[0] + b[1] - b[t];
    if (a1 & 1) continue;
    std::vector<long long> a = {a1 / 2, b[0] - a1 / 2, b[1] - a1 / 2};
    std::multiset<long long> ms(b.begin(), b.end());
    erase_sum(ms, a[0] + a[1]), erase_sum(ms, a[0] + a[2]), erase_sum(ms, a[1] + a[2]);
    while ((int)a.size() < n) {
        long long x = *ms.begin() - a[0];
        if (!insert_and_erase(ms, a, x)) break;
        a.push_back(x);
    }
    if ((int)a.size() == n) return output(a);
}
```

### 复杂度

时间复杂度 $O(n^3\log n)$，空间复杂度 $O(n^2)$。
