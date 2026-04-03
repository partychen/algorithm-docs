---
title: "洛谷 基础算法专题精选解题报告"
subtitle: "🧰 从贪心、前缀和到二分答案的基础算法主线"
order: 1
icon: "🧰"
---

# 洛谷 基础算法专题精选解题报告

这一组题从排序与反悔贪心一路走到树上差分和高精度，表面上像一堆零散模板，但真正的主线一直很清楚：把原问题压成可排序、可前缀化、可二分判定或可离线维护的结构。前半段训练基础手感，后半段则开始要求你把条件翻译成更稳定的数据表达。

# 一、贪心与排序基础

这一章先整理基础算法里最常见的贪心、排序和构造思路，很多题都在训练“局部最优怎样推出整体最优”。

## 1. [P2949 [USACO09OPEN] Work Scheduling G](https://www.luogu.com.cn/problem/P2949)

`贪心` `优先队列` `反悔贪心`

### 题意

每个工作耗时 `1`，并给定截止时间和报酬。只要在截止时间前做完就能获得报酬，求最大总收益。

### 分析

按截止时间升序处理，每遇到一个工作就先假设把它接下来。若当前选中的工作数已经超过这一天数上限，说明时间不够，就删掉已选工作里报酬最小的那个。

这样维护出来的集合，始终是“在当前截止时间约束下收益最大的若干个工作”，是最典型的反悔贪心。

### 核心代码

```cpp
sort(job + 1, job + n + 1, [](auto &a, auto &b) {
    return a.d < b.d;
});
priority_queue<int, vector<int>, greater<int>> pq;
long long ans = 0;
for (int i = 1; i <= n; i++) {
    pq.push(job[i].p);
    ans += job[i].p;
    if ((int)pq.size() > job[i].d) {
        ans -= pq.top();
        pq.pop();
    }
}
```

### 复杂度

时间复杂度 $O(n \log n)$，空间复杂度 $O(n)$。

---

## 2. [CF865D Buy Low Sell High](https://www.luogu.com.cn/problem/CF865D)

`贪心` `优先队列`

### 题意

给定每天的股价，可以进行多次买卖，要求最大化总利润。

### 分析

用小根堆维护“已经买入但还没有最终确定卖点的价格”。如果当前价格 `x` 大于堆顶最小买入价，就可以把这份最低成本的股票在今天卖出赚差价；卖完后再把 `x` 放回去，表示后续还可以把它作为新的买入基准继续反悔。

这种写法本质上是在把一段上涨趋势拆成若干段局部最优收益，再把它们拼成全局最优。

### 核心代码

```cpp
priority_queue<int, vector<int>, greater<int>> pq;
long long ans = 0;
for (int x : p) {
    if (!pq.empty() && pq.top() < x) {
        ans += x - pq.top();
        pq.pop();
        pq.push(x);
    }
    pq.push(x);
}
```

### 复杂度

时间复杂度 $O(n \log n)$，空间复杂度 $O(n)$。

---

## 3. [P4090 [USACO17DEC] Greedy Gift Takers P](https://www.luogu.com.cn/problem/P4090)

`贪心` `二分`

### 题意

奶牛按顺序领礼物，第 `i` 头奶牛领完后会插到队尾前面恰好 `c[i]` 头奶牛之前。问最终一定领不到礼物的奶牛有多少头。

### 分析

领不到礼物的奶牛一定构成队尾后缀，因此答案具有单调性。二分“最靠后的可领礼物奶牛位置”后，只需要判断它前面的奶牛能不能全部插到它后面。

判定时把这些 `c[i]` 从小到大排序最有利：当前若它后面已有 `behind` 头牛，只要 `c[i] <= behind` 就能成功插过去，并让 `behind++`。

### 核心代码

```cpp
bool check(int mid) {
    vector<int> b;
    for (int i = 1; i < mid; i++) b.push_back(c[i]);
    sort(b.begin(), b.end());
    int behind = n - mid;
    for (int x : b) {
        if (x > behind) return false;
        behind++;
    }
    return true;
}
```

### 复杂度

时间复杂度 $O(n \log^2 n)$，空间复杂度 $O(n)$。

---

## 4. [U77570 「USACO 2017.12 Platinum」 Greedy Gift Takers](https://www.luogu.com.cn/problem/U77570)

`贪心` `二分`

### 题意

和上一题同型，要求统计无论如何都拿不到礼物的奶牛数量。

### 分析

结论完全一样：不能领到礼物的牛构成后缀，所以只要判断某个前缀是否可行即可。判定时仍然是把前缀中的 `c[i]` 排序，尽量让它们依次插到目标牛后面。

真正的关键不是过程模拟，而是识别“可行前缀”的单调性。

### 核心代码

```cpp
bool check(int mid) {
    vector<int> b;
    for (int i = 1; i < mid; i++) b.push_back(c[i]);
    sort(b.begin(), b.end());
    int behind = n - mid;
    for (int x : b) {
        if (x > behind) return false;
        behind++;
    }
    return true;
}
```

### 复杂度

时间复杂度 $O(n \log^2 n)$，空间复杂度 $O(n)$。

---

## 5. [P1094 [NOIP 2007 普及组] 纪念品分组](https://www.luogu.com.cn/problem/P1094)

`排序` `双指针`

### 题意

每组最多放两件纪念品，且总重量不超过上限，求最少分组数。

### 分析

排序后，用最轻和最重尝试配对：如果这两件能放在一起，就一定应该配上；如果连最轻的都配不上，那么最重的只能单独成组。

每轮优先处理当前最重物品，就能保证组数最少。

### 核心代码

```cpp
sort(a + 1, a + n + 1);
int l = 1, r = n, ans = 0;
while (l <= r) {
    if (l == r) { ans++; break; }
    if (a[l] + a[r] <= w) l++;
    r--;
    ans++;
}
```

### 复杂度

时间复杂度 $O(n \log n)$，空间复杂度 $O(1)$。

---

## 6. [P5020 [NOIP 2018 提高组] 货币系统](https://www.luogu.com.cn/problem/P5020)

`贪心` `完全背包`

### 题意

给定若干种面值，求最少保留多少种面值，仍然能表示出原来能表示的所有金额。

### 分析

按面值从小到大处理。若当前面值已经能被之前保留的面值凑出来，它就是冗余的；否则它必须保留，并继续用完全背包更新可达状态。

也就是说，始终让小面值先覆盖能覆盖的范围，再判断大面值是否还有独立价值。

### 核心代码

```cpp
sort(a + 1, a + n + 1);
dp[0] = true;
int ans = 0;
for (int i = 1; i <= n; i++) {
    if (!dp[a[i]]) {
        ans++;
        for (int j = a[i]; j <= a[n]; j++)
            dp[j] |= dp[j - a[i]];
    }
}
```

### 复杂度

时间复杂度 $O(nV)$，空间复杂度 $O(V)$。

---

## 7. [P1969 [NOIP 2013 提高组] 积木大赛](https://www.luogu.com.cn/problem/P1969)

`贪心` `差分`

### 题意

初始高度全为 `0`，每次可以让一个连续区间整体 `+1`，求构造目标高度序列的最少操作次数。

### 分析

只有在高度相对前一位上升时，才需要额外新开若干次区间操作；下降部分可以由之前已经开启的区间自然结束。

因此答案就是所有正差分之和，也就是 `h[1] + Σmax(0, h[i]-h[i-1])`。

### 核心代码

```cpp
long long ans = 0;
h[0] = 0;
for (int i = 1; i <= n; i++)
    if (h[i] > h[i - 1]) ans += h[i] - h[i - 1];
```

### 复杂度

时间复杂度 $O(n)$，空间复杂度 $O(1)$。

---

## 8. [P5019 [NOIP 2018 提高组] 铺设道路](https://www.luogu.com.cn/problem/P5019)

`贪心` `差分`

### 题意

每次可以选一段深度都大于 `0` 的道路统一减一，求把整条路修平所需的最少天数。

### 分析

和上一题完全同构。真正增加答案的仍然只有“深度相对前一位上升”的部分，因为它们意味着必须新增这么多次覆盖。

所以直接累加正差分即可。

### 核心代码

```cpp
long long ans = 0;
d[0] = 0;
for (int i = 1; i <= n; i++)
    if (d[i] > d[i - 1]) ans += d[i] - d[i - 1];
```

### 复杂度

时间复杂度 $O(n)$，空间复杂度 $O(1)$。

---

## 9. [P4447 [AHOI2018初中组] 分组](https://www.luogu.com.cn/problem/P4447)

`贪心` `排序` `优先队列`

### 题意

把所有数分成若干组，每组内要求连续且不重复，目标是让最短那一组尽量长。

### 分析

排序后从小到大处理。当前值 `x` 只能接在某个以 `x-1` 结尾的组后面，因此应该优先接在这些组里“当前长度最短”的那一组上，否则短组会越来越吃亏。

这就是典型的“优先维护最弱者”的贪心。

### 核心代码

```cpp
map<int, priority_queue<int, vector<int>, greater<int>>> mp;
for (int x : a) {
    auto &q = mp[x - 1];
    if (!q.empty()) {
        int len = q.top(); q.pop();
        mp[x].push(len + 1);
    } else {
        mp[x].push(1);
    }
}
```

### 复杂度

时间复杂度 $O(n \log n)$，空间复杂度 $O(n)$。

---

## 10. [P4053 [JSOI2007] 建筑抢修](https://www.luogu.com.cn/problem/P4053)

`贪心` `优先队列` `反悔贪心`

### 题意

每个建筑有修复耗时和截止时间，问最多能修多少座建筑。

### 分析

按截止时间升序处理。先把当前建筑加入计划；如果总耗时超出当前截止时间，就删掉已选建筑里耗时最长的那个。

因为目标是最大化数量，所以被踢掉的应该是“最占时间”的任务。

### 核心代码

```cpp
sort(b + 1, b + n + 1, [](auto &x, auto &y) {
    return x.d < y.d;
});
priority_queue<int> pq;
long long cur = 0;
for (int i = 1; i <= n; i++) {
    cur += b[i].t;
    pq.push(b[i].t);
    if (cur > b[i].d) {
        cur -= pq.top();
        pq.pop();
    }
}
```

### 复杂度

时间复杂度 $O(n \log n)$，空间复杂度 $O(n)$。

---

## 11. [P1080 [NOIP 2012 提高组] 国王游戏](https://www.luogu.com.cn/problem/P1080)

`贪心` `排序` `高精度`

### 题意

调整大臣顺序，使整个过程中出现的最大金币数最小。

### 分析

相邻交换可推出排序关键字是 `a[i] * b[i]` 升序。顺序确定后，依次维护前缀左手乘积；当前大臣的金币数就是“前缀乘积除以自己的右手数”，整体取最大值。

由于前缀乘积可能非常大，所以实现上需要高精度乘法和高精度除以整数。

### 核心代码

```cpp
sort(m + 1, m + n + 1, [](auto &x, auto &y) {
    return 1LL * x.a * x.b < 1LL * y.a * y.b;
});
vector<int> prod = {king};
for (int i = 1; i <= n; i++) {
    ans = max(ans, divide(prod, m[i].b));
    multiply(prod, m[i].a);
}
```

### 复杂度

时间复杂度 $O(n \log n + n \cdot \text{高精度})$，空间复杂度 $O(n)$。

---

## 12. [P2512 [HAOI2008] 糖果传递](https://www.luogu.com.cn/problem/P2512)

`贪心` `前缀和` `中位数`

### 题意

若干个人围成一圈传糖果，每次只能向相邻位置传递，求最少传递次数。

### 分析

先减去平均值，得到每个位置的盈亏。再求前缀和后，问题转成“选一个基准值，使所有前缀和到它的距离和最小”，最优解就是中位数。

这是环形均分问题最经典的转化。

### 核心代码

```cpp
for (int i = 1; i <= n; i++) s[i] = s[i - 1] + a[i] - ave;
sort(s + 1, s + n + 1);
long long mid = s[(n + 1) / 2], ans = 0;
for (int i = 1; i <= n; i++) ans += llabs(s[i] - mid);
```

### 复杂度

时间复杂度 $O(n \log n)$，空间复杂度 $O(n)$。

---

## 13. [P1031 [NOIP 2002 提高组] 均分纸牌](https://www.luogu.com.cn/problem/P1031)

`贪心` `模拟`

### 题意

若干堆纸牌排成一行，每次可以把一堆中的若干张移到相邻一堆，求使每堆数量相等的最少操作次数。

### 分析

从左到右扫。若第 `i` 堆当前不等于平均值，那么无论如何都必须把多余或缺少的部分传给下一堆，这一步一定省不掉，所以操作数加一。

关键不是累加转移量，而是统计有多少个位置真的需要发生一次“向右调整”。

### 核心代码

```cpp
int avg = sum / n, ans = 0;
for (int i = 1; i < n; i++) {
    if (a[i] == avg) continue;
    a[i + 1] += a[i] - avg;
    ans++;
}
```

### 复杂度

时间复杂度 $O(n)$，空间复杂度 $O(1)$。

---

## 14. [P1803 凌乱的yyy / 线段覆盖](https://www.luogu.com.cn/problem/P1803)

`贪心` `区间调度`

### 题意

给出若干线段，求最多能选多少条互不重叠的线段。

### 分析

按右端点升序排序，每次选当前最早结束且与已选集合不冲突的线段。因为结束得越早，给后面留下的选择空间就越大。

这是区间调度最标准的贪心结论。

### 核心代码

```cpp
sort(seg + 1, seg + n + 1, [](auto &a, auto &b) {
    return a.r < b.r;
});
int ans = 0, last = -1;
for (int i = 1; i <= n; i++) {
    if (seg[i].l >= last) {
        ans++;
        last = seg[i].r;
    }
}
```

### 复杂度

时间复杂度 $O(n \log n)$，空间复杂度 $O(1)$。

---

## 15. [P1843 奶牛晒衣服](https://www.luogu.com.cn/problem/P1843)

`二分` `贪心`

### 题意

每秒所有衣服都会自然变干 `a` 点湿度，同时烘干机每秒还能额外处理一件衣服 `b` 点湿度，问全部晒干的最少时间。

### 分析

答案具有单调性，可以二分总时间 `T`。在 `T` 秒内，每件衣服先自然减少 `T*a`；若仍未晒干，就必须占用若干秒烘干机。

把所有衣服需要的烘干机时间加起来，如果总和不超过 `T`，说明这个时间可行。

### 核心代码

```cpp
bool check(long long T) {
    long long need = 0;
    for (int i = 1; i <= n; i++) {
        if (w[i] > T * a) {
            long long rest = w[i] - T * a;
            need += (rest + b - 1) / b;
        }
    }
    return need <= T;
}
```

### 复杂度

单次检查时间复杂度 $O(n)$，总复杂度 $O(n \log V)$。

---

## 16. [P1209 [USACO1.3] 修理牛棚 Barn Repair](https://www.luogu.com.cn/problem/P1209)

`贪心` `排序`

### 题意

用不超过给定块数的木板覆盖所有有牛的牛棚，求最短总覆盖长度。

### 分析

先排序所有有牛的位置，再计算相邻牛棚之间的空隙。若允许用多块木板，就应该把最大的若干个空隙“断开”，等价于少覆盖这些空白段。

所以答案是整体跨度减去最大的 `m-1` 个空隙。

### 核心代码

```cpp
sort(pos + 1, pos + c + 1);
for (int i = 1; i < c; i++) gap[i] = pos[i + 1] - pos[i] - 1;
sort(gap + 1, gap + c, greater<int>());
int ans = pos[c] - pos[1] + 1;
for (int i = 1; i < m; i++) ans -= gap[i];
```

### 复杂度

时间复杂度 $O(c \log c)$，空间复杂度 $O(c)$。

---

## 17. [P1190 [NOIP 2010 普及组] 接水问题](https://www.luogu.com.cn/problem/P1190)

`贪心` `优先队列`

### 题意

有若干个水龙头和一列等待接水的人，按顺序安排每个人使用水龙头，求全部接完的最早时间。

### 分析

每次都把下一个人分配给“最早空出来”的水龙头最优。用小根堆维护各个水龙头当前的结束时间即可。

这类题本质是多机调度的基础模型。

### 核心代码

```cpp
priority_queue<int, vector<int>, greater<int>> pq;
for (int i = 1; i <= m; i++) pq.push(t[i]);
for (int i = m + 1; i <= n; i++) {
    int x = pq.top(); pq.pop();
    pq.push(x + t[i]);
}
while (pq.size() > 1) pq.pop();
cout << pq.top();
```

### 复杂度

时间复杂度 $O(n \log m)$，空间复杂度 $O(m)$。

---

## 18. [P1376 [USACO05MAR] Yogurt factory 机器工厂](https://www.luogu.com.cn/problem/P1376)

`贪心`

### 题意

每周生产成本不同，同时保存库存需要额外花费，求满足每周需求的最小总成本。

### 分析

维护“到当前周为止的最低有效单价”。它要么来自历史最低价格加上一周库存费，要么直接是本周现产现用。

因此每周只要更新一次最优单价，然后乘上该周需求量累加即可。

### 核心代码

```cpp
long long best = c[1], ans = 1LL * c[1] * y[1];
for (int i = 2; i <= n; i++) {
    best = min(best + s, 1LL * c[i]);
    ans += best * y[i];
}
```

### 复杂度

时间复杂度 $O(n)$，空间复杂度 $O(1)$。

---

## 19. [P1223 排队接水](https://www.luogu.com.cn/problem/P1223)

`贪心` `排序`

### 题意

若干人依次接水，求使平均等待时间最小的排队顺序。

### 分析

显然应该让接水时间短的人先接，这样后面所有人的等待都会更少。因此按接水时间升序排序即可。

排序后再扫一遍前缀和，就能算出总等待时间。

### 核心代码

```cpp
sort(id + 1, id + n + 1, [](int x, int y) {
    return t[x] < t[y];
});
long long cur = 0, sum = 0;
for (int i = 1; i <= n; i++) {
    sum += cur;
    cur += t[id[i]];
}
```

### 复杂度

时间复杂度 $O(n \log n)$，空间复杂度 $O(n)$。

---

## 20. [P1842 [USACO05NOV] 奶牛玩杂技](https://www.luogu.com.cn/problem/P1842)

`贪心` `排序`

### 题意

每头奶牛有体重和力量，要把它们叠起来，使整个过程中最大的风险值最小。

### 分析

相邻交换可以推出排序关键字是 `w+s` 升序。顺序确定后，当前奶牛的风险值就是“上方总重量减去它的力量”，整体取最大值即可。

这是“按风险值排序”一类题最经典的结论。

### 核心代码

```cpp
sort(c + 1, c + n + 1, [](auto &x, auto &y) {
    return x.w + x.s < y.w + y.s;
});
long long sum = 0, ans = -(1LL << 60);
for (int i = 1; i <= n; i++) {
    ans = max(ans, sum - c[i].s);
    sum += c[i].w;
}
```

### 复杂度

时间复杂度 $O(n \log n)$，空间复杂度 $O(1)$。

# 二、堆、优先队列与中位数维护

这组题目围绕优先队列、对顶堆和多路归并，重点是动态维护当前最优元素或第 k 小元素。

## 21. [P1090 [NOIP 2004 提高组] 合并果子](https://www.luogu.com.cn/problem/P1090)

`最小堆` `贪心`

### 题意

每次从若干堆果子里取出两堆合并，代价为两堆大小之和，求最小总代价。

### 分析

每一步都应合并当前最小的两堆，这就是经典的 Huffman 合并。因为较早产生的大权值会在后续被重复计算，所以必须让它尽量小。

实现上直接用小根堆维护当前所有堆即可。

### 核心代码

```cpp
priority_queue<int, vector<int>, greater<int>> q;
for (int x : a) q.push(x);

long long ans = 0;
while (q.size() > 1) {
    int x = q.top(); q.pop();
    int y = q.top(); q.pop();
    ans += x + y;
    q.push(x + y);
}
```

### 复杂度

时间复杂度 $O(n \log n)$，空间复杂度 $O(n)$。

---

## 22. [P2168 [NOI2015] 荷马史诗](https://www.luogu.com.cn/problem/P2168)

`k叉Huffman` `最小堆`

### 题意

给定若干权值和进制 `k`，要求构造最优 `k` 叉 Huffman 树，输出最短总长度，以及在总长度最短前提下最小的最长编码长度。

### 分析

主做法仍是 `k` 叉 Huffman。若 `(n-1) % (k-1) != 0`，先补若干个权值为 `0` 的虚点，再每次取出 `k` 个最小权值合并。

为了同时得到第二问，可以在堆里维护 `(权值, 深度)`。每次合并后的深度是子节点最大深度再加一，最后根节点的深度就是答案要求的最小最长编码长度。

### 核心代码

```cpp
struct Node {
    long long w;
    int dep;
    bool operator>(const Node& o) const {
        if (w != o.w) return w > o.w;
        return dep > o.dep;
    }
};

priority_queue<Node, vector<Node>, greater<Node>> q;
while ((q.size() - 1) % (k - 1)) q.push({0, 0});

long long ans = 0;
while (q.size() > 1) {
    long long sum = 0;
    int dep = 0;
    for (int i = 0; i < k; i++) {
        auto t = q.top(); q.pop();
        sum += t.w;
        dep = max(dep, t.dep + 1);
    }
    ans += sum;
    q.push({sum, dep});
}
```

### 复杂度

时间复杂度 $O(n \log n)$，空间复杂度 $O(n)$。

---

## 23. [P2827 [NOIP 2016 提高组] 蚯蚓](https://www.luogu.com.cn/problem/P2827)

`三队列` `模拟` `贪心`

### 题意

每秒取出当前最长蚯蚓切成两段，剩余蚯蚓整体增长 `q`，按要求输出若干次操作中的长度。

### 分析

把初始蚯蚓降序排序，再维护三个有序来源：原数组、切出来的前半段、后半段。每轮只需要从这三处取最大值。

同时用一个全局偏移量 `add` 记录“所有蚯蚓统一增长了多少”，避免真的去改动所有元素。

### 核心代码

```cpp
auto topv = [&](queue<long long>& q) {
    return q.empty() ? -(1LL << 60) : q.front();
};

auto pop_max = [&]() {
    long long x = max({topv(q1), topv(q2), topv(q3)});
    if (!q1.empty() && q1.front() == x) q1.pop();
    else if (!q2.empty() && q2.front() == x) q2.pop();
    else q3.pop();
    return x + add;
};

for (int i = 1; i <= m; i++) {
    long long x = pop_max();
    long long a = x * u / v, b = x - a;
    q2.push(a - add - q);
    q3.push(b - add - q);
    add += q;
}
```

### 复杂度

时间复杂度 $O(n \log n + m)$，空间复杂度 $O(n)$。

---

## 24. [P1631 序列合并](https://www.luogu.com.cn/problem/P1631)

`最小堆` `多路归并`

### 题意

给定两个非降序列，求它们两两相加后的前 `n` 小值。

### 分析

固定每个 `a[i]` 后，`a[i]+b[1], a[i]+b[2], ...` 本身就是一条递增链。答案就是对这 `n` 条链做多路归并。

每次弹出 `(i,j)` 后，只需要把 `(i,j+1)` 放回堆即可。

### 核心代码

```cpp
struct Node {
    long long sum;
    int i, j;
    bool operator<(const Node& o) const { return sum > o.sum; }
};

priority_queue<Node> q;
for (int i = 1; i <= n; i++) q.push({a[i] + b[1], i, 1});

for (int k = 1; k <= n; k++) {
    auto t = q.top(); q.pop();
    cout << t.sum << ' ';
    if (t.j < n) q.push({a[t.i] + b[t.j + 1], t.i, t.j + 1});
}
```

### 复杂度

时间复杂度 $O(n \log n)$，空间复杂度 $O(n)$。

---

## 25. [P2085 最小函数值](https://www.luogu.com.cn/problem/P2085)

`最小堆` `多路归并`

### 题意

给定若干个二次函数，要求输出所有函数值中的前 `m` 小。

### 分析

每个函数在正整数位置形成一条单调链，因此仍然可以做多路归并。堆里维护“某个函数当前取到的最小值”，弹出后把这个函数的下一个位置放回去。

这题和序列合并本质是同一个模型。

### 核心代码

```cpp
struct Node {
    long long val;
    int id, x;
    bool operator<(const Node& o) const { return val > o.val; }
};

priority_queue<Node> q;
for (int i = 1; i <= n; i++) q.push({f(i, 1), i, 1});

for (int i = 1; i <= m; i++) {
    auto t = q.top(); q.pop();
    cout << t.val << ' ';
    q.push({f(t.id, t.x + 1), t.id, t.x + 1});
}
```

### 复杂度

时间复杂度 $O((n+m)\log n)$，空间复杂度 $O(n)$。

---

## 26. [P3378 【模板】堆](https://www.luogu.com.cn/problem/P3378)

`堆模板` `优先队列`

### 题意

实现最小堆的插入、查询堆顶和删除堆顶操作。

### 分析

直接用 `priority_queue` 包一层小根堆就是最自然的实现，主要是熟悉模板。

### 核心代码

```cpp
priority_queue<int, vector<int>, greater<int>> q;

if (op == 1) q.push(x);
else if (op == 2) cout << q.top() << '\n';
else q.pop();
```

### 复杂度

单次操作时间复杂度 $O(\log n)$，空间复杂度 $O(n)$。

---

## 27. [SP16254 RMID2 - Running Median Again](https://www.luogu.com.cn/problem/SP16254)

`双堆` `中位数维护`

### 题意

动态插入正整数；遇到 `-1` 时输出并删除当前中位数，若元素个数为偶数则取较小的那个。

### 分析

用大根堆存较小的一半，小根堆存较大的一半，并保持大根堆大小始终不少于小根堆且至多多一个。这样当前中位数就是大根堆堆顶。

插入和删除后都只需要做一次平衡。

### 核心代码

```cpp
priority_queue<int> L;
priority_queue<int, vector<int>, greater<int>> R;

auto rebalance = [&]() {
    while (L.size() < R.size()) L.push(R.top()), R.pop();
    while (L.size() > R.size() + 1) R.push(L.top()), L.pop();
};

if (x > 0) {
    if (L.empty() || x <= L.top()) L.push(x);
    else R.push(x);
    rebalance();
} else {
    cout << L.top() << '\n';
    L.pop();
    rebalance();
}
```

### 复杂度

时间复杂度 $O(n \log n)$，空间复杂度 $O(n)$。

---

## 28. [P1168 中位数](https://www.luogu.com.cn/problem/P1168)

`双堆` `中位数`

### 题意

依次加入数字，在奇数次插入后输出当前中位数。

### 分析

做法和上一题一样，还是两个堆维护左右两半。由于只在奇数时输出，所以平衡完后直接输出大根堆堆顶即可。

### 核心代码

```cpp
if (L.empty() || x <= L.top()) L.push(x);
else R.push(x);
while (L.size() < R.size()) L.push(R.top()), R.pop();
while (L.size() > R.size() + 1) R.push(L.top()), L.pop();
if (i & 1) cout << L.top() << '\n';
```

### 复杂度

时间复杂度 $O(n \log n)$，空间复杂度 $O(n)$。

---

## 29. [P1801 黑匣子](https://www.luogu.com.cn/problem/P1801)

`双堆` `第k小`

### 题意

按顺序插入元素，并在若干次询问时输出当前前缀中的第 `k` 小值。

### 分析

因为第 `k` 小的 `k` 会随着询问顺序单调增加，所以只要让大根堆始终保存当前最小的 `k` 个数，堆顶就是答案。

每次新增元素后再把两堆调整到目标大小即可。

### 核心代码

```cpp
priority_queue<int> L;
priority_queue<int, vector<int>, greater<int>> R;

auto push_val = [&](int x) {
    if (L.empty() || x <= L.top()) L.push(x);
    else R.push(x);
};

for (int i = 1, p = 1; i <= m; i++) {
    while (p <= u[i]) push_val(a[p++]);
    while (L.size() < i) L.push(R.top()), R.pop();
    while (L.size() > i) R.push(L.top()), L.pop();
    cout << L.top() << '\n';
}
```

### 复杂度

时间复杂度 $O((m+n)\log n)$，空间复杂度 $O(n)$。

---

## 30. [P1177 【模板】排序](https://www.luogu.com.cn/problem/P1177)

`排序`

### 题意

给定一个序列，输出升序排列结果。

### 分析

直接调用标准排序即可，是最基础的模板题。

### 核心代码

```cpp
sort(a + 1, a + n + 1);
for (int i = 1; i <= n; i++) cout << a[i] << ' ';
```

### 复杂度

时间复杂度 $O(n \log n)$，空间复杂度视实现而定。

---

## 31. [P1908 逆序对](https://www.luogu.com.cn/problem/P1908)

`归并排序` `逆序对`

### 题意

求一个序列中的逆序对数量。

### 分析

归并排序时，若右半当前元素先于左半元素被取出，那么左半剩余所有元素都和它构成逆序对。把这部分贡献顺手统计即可。

### 核心代码

```cpp
long long merge_sort(int l, int r) {
    if (l >= r) return 0;
    int mid = (l + r) >> 1;
    long long ans = merge_sort(l, mid) + merge_sort(mid + 1, r);
    int i = l, j = mid + 1, k = 0;
    while (i <= mid && j <= r) {
        if (a[i] <= a[j]) t[k++] = a[i++];
        else ans += mid - i + 1, t[k++] = a[j++];
    }
    return ans;
}
```

### 复杂度

时间复杂度 $O(n \log n)$，空间复杂度 $O(n)$。

---

## 32. [P1966 [NOIP 2013 提高组] 火柴排队](https://www.luogu.com.cn/problem/P1966)

`排序` `逆序对`

### 题意

两排火柴经过相邻交换后要达到最优对应顺序，求最少交换次数。

### 分析

先分别按长度排序，建立两排火柴的最优对应关系，再把这个对应关系写成一个排列。问题就转成“这个排列的逆序对数量”。

因此仍然可以用归并排序或树状数组解决。

### 核心代码

```cpp
sort(a + 1, a + n + 1, cmp);
sort(b + 1, b + n + 1, cmp);
for (int i = 1; i <= n; i++) pos[a[i].id] = b[i].id;
cout << merge_sort(1, n);
```

### 复杂度

时间复杂度 $O(n \log n)$，空间复杂度 $O(n)$。

---

## 33. [P1923 【深基9.例4】求第 k 小的数](https://www.luogu.com.cn/problem/P1923)

`nth_element` `第k小`

### 题意

给定 `n` 个数，输出第 `k` 小的数。

### 分析

直接使用 `nth_element` 最方便，它能在线性期望时间内把第 `k` 小元素放到正确位置。

### 核心代码

```cpp
nth_element(a, a + k, a + n);
cout << a[k];
```

### 复杂度

平均时间复杂度 $O(n)$，空间复杂度 $O(1)$。

---

## 34. [P10452 货仓选址](https://www.luogu.com.cn/problem/P10452)

`中位数`

### 题意

在数轴上选一个仓库位置，使得到所有点的距离和最小。

### 分析

一维绝对值距离和的最优位置就是中位数。排序后取中间位置即可，偶数时取任意中位数都能达到最优。

### 核心代码

```cpp
sort(a + 1, a + n + 1);
int mid = a[(n + 1) / 2];
long long ans = 0;
for (int i = 1; i <= n; i++) ans += llabs(a[i] - mid);
```

### 复杂度

时间复杂度 $O(n \log n)$，空间复杂度 $O(1)$ 到 $O(n)$。

---

## 35. [CF1486B Eastern Exhibition](https://www.luogu.com.cn/problem/CF1486B)

`中位数` `曼哈顿距离`

### 题意

给定若干平面点，求使曼哈顿距离总和最小的整数点个数。

### 分析

横纵坐标可以拆开独立考虑。若 `n` 为奇数，两个方向最优值都唯一；若 `n` 为偶数，则最优横坐标和纵坐标分别构成一个闭区间。

答案就是这两个区间长度的乘积。

### 核心代码

```cpp
sort(x + 1, x + n + 1);
sort(y + 1, y + n + 1);
if (n & 1) cout << 1 << '\n';
else {
    long long cx = x[n / 2 + 1] - x[n / 2] + 1;
    long long cy = y[n / 2 + 1] - y[n / 2] + 1;
    cout << cx * cy << '\n';
}
```

### 复杂度

时间复杂度 $O(n \log n)$，空间复杂度 $O(n)$。

---

## 36. [P7072 [CSP-J 2020] 直播获奖](https://www.luogu.com.cn/problem/P7072)

`桶计数` `排名维护`

### 题意

每输入一个分数，就输出当前前 `max(1, floor(i*w/100))` 名中的最低分。

### 分析

分数范围只有 `0..600`，直接开桶计数即可。每次新增一个分数后，从高到低累加人数，第一次达到目标名次的位置就是当前分数线。

这题的重点是利用值域小，把“动态排名”压成常数级扫描。

### 核心代码

```cpp
int cnt[601] = {};
for (int i = 1; i <= n; i++) {
    int s; cin >> s;
    cnt[s]++;
    int need = max(1, i * w / 100), sum = 0;
    for (int v = 600; v >= 0; v--) {
        sum += cnt[v];
        if (sum >= need) {
            cout << v << '\n';
            break;
        }
    }
}
```

### 复杂度

时间复杂度 $O(n)$，空间复杂度 $O(1)$。

# 三、前缀和、差分、双指针与滑窗

这一章处理最常见的线性扫描技巧：前缀和负责快速聚合，差分负责批量修改，双指针和滑窗负责在线维护区间。

## 37. [P3397 地毯](https://www.luogu.com.cn/problem/P3397)

`二维差分` `前缀和`

### 题意

给定一个 `n x n` 的地毯和若干次矩形覆盖操作，要求输出每个格子最终被覆盖多少次。

### 分析

这是二维差分模板。对每个矩形 `(x1,y1)-(x2,y2)`，只在四个角上打标记：左上加一、右下右侧和下侧减一、右下对角再加一。

最后做两次前缀和还原矩阵，就能得到每个位置的真实覆盖次数。

### 核心代码

```cpp
diff[x1][y1]++;
diff[x2 + 1][y1]--;
diff[x1][y2 + 1]--;
diff[x2 + 1][y2 + 1]++;

for (int i = 1; i <= n; i++)
    for (int j = 1; j <= n; j++)
        diff[i][j] += diff[i - 1][j] + diff[i][j - 1] - diff[i - 1][j - 1];
```

### 复杂度

时间复杂度 $O(n^2 + m)$，空间复杂度 $O(n^2)$。

---

## 38. [P2879 [USACO07JAN] Tallest Cow S](https://www.luogu.com.cn/problem/P2879)

`差分` `去重`

### 题意

初始所有奶牛身高都是 `H`。若两头奶牛能互相看见，则它们之间的奶牛身高都必须减一。问最终每头奶牛的身高。

### 分析

对于一对 `(a,b)`，真正受影响的是中间区间 `(a,b)`，即 `[a+1,b-1]` 全部减一。这就是一维区间加减问题，可以直接用差分。

不过同一对关系可能重复出现，需要先去重，否则会重复扣高度。

### 核心代码

```cpp
if (!vis.count({l, r})) {
    vis.insert({l, r});
    diff[l + 1]--;
    diff[r]++;
}

for (int i = 1; i <= n; i++) {
    diff[i] += diff[i - 1];
    ans[i] = h + diff[i];
}
```

### 复杂度

时间复杂度 $O(n + m \log m)$，空间复杂度 $O(n + m)$。

---

## 39. [P4552 [Poetize6] IncDec Sequence](https://www.luogu.com.cn/problem/P4552)

`差分` `构造`

### 题意

给定一个序列，每次可以对一个连续区间同时加一或减一，要求把整个序列变成常数序列，求最少操作次数以及可行终值个数。

### 分析

把原序列转成差分数组后，区间加减只会影响两个端点。因此真正需要消除的是 `diff[2..n]` 中的正负波动。

设所有正差分之和为 `pos`，负差分绝对值之和为 `neg`，那么最少操作次数是 `max(pos, neg)`，最终可行常数有 `abs(pos-neg)+1` 个。

### 核心代码

```cpp
long long pos = 0, neg = 0;
for (int i = 2; i <= n; i++) {
    long long d = a[i] - a[i - 1];
    if (d > 0) pos += d;
    else neg -= d;
}
cout << max(pos, neg) << '\n' << abs(pos - neg) + 1 << '\n';
```

### 复杂度

时间复杂度 $O(n)$，空间复杂度 $O(1)$。

---

## 40. [P8218 【深进1.例1】求区间和](https://www.luogu.com.cn/problem/P8218)

`前缀和`

### 题意

给定一个数组和若干次询问，每次求区间 `[l,r]` 的元素和。

### 分析

这是前缀和最基础的模板题。预处理 `pre[i] = a[1] + ... + a[i]`，则任意区间和都能在常数时间内求出。

这种“多次静态区间求和”的场景，第一反应就应该是前缀和。

### 核心代码

```cpp
for (int i = 1; i <= n; i++) pre[i] = pre[i - 1] + a[i];
long long query(int l, int r) {
    return pre[r] - pre[l - 1];
}
```

### 复杂度

预处理时间复杂度 $O(n)$，单次查询 $O(1)$，空间复杂度 $O(n)$。

---

## 41. [P2280 [HNOI2003] 激光炸弹](https://www.luogu.com.cn/problem/P2280)

`二维前缀和`

### 题意

平面上有若干权值点，给定一个边长为 `R` 的正方形，问它能覆盖到的最大权值和是多少。

### 分析

把点权扔到二维网格上后，问题就变成“枚举所有 `R x R` 子矩阵的和”。这正是二维前缀和的标准用法。

预处理后，任意子矩阵权值都可以在 `O(1)` 内求出，再枚举左上角或右下角取最大值即可。

### 核心代码

```cpp
for (int i = 1; i <= mx; i++)
    for (int j = 1; j <= my; j++)
        s[i][j] += s[i - 1][j] + s[i][j - 1] - s[i - 1][j - 1];

int rect(int x1, int y1, int x2, int y2) {
    return s[x2][y2] - s[x1 - 1][y2] - s[x2][y1 - 1] + s[x1 - 1][y1 - 1];
}
```

### 复杂度

时间复杂度 $O(XY)$，空间复杂度 $O(XY)$。

---

## 42. [P1387 最大正方形](https://www.luogu.com.cn/problem/P1387)

`动态规划` `前缀和`

### 题意

给定一个只包含 `0/1` 的矩阵，求只由 `1` 组成的最大正方形边长。

### 分析

最常见做法是 DP：`dp[i][j]` 表示以 `(i,j)` 为右下角的最大全 `1` 正方形边长。若当前格为 `1`，就由左、上、左上三者最小值转移。

虽然标签里也有前缀和，但真正高效的主做法是这个经典 DP。

### 核心代码

```cpp
for (int i = 1; i <= n; i++)
    for (int j = 1; j <= m; j++) if (a[i][j]) {
        dp[i][j] = min({dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]}) + 1;
        ans = max(ans, dp[i][j]);
    }
```

### 复杂度

时间复杂度 $O(nm)$，空间复杂度 $O(nm)$。

---

## 43. [P1496 火烧赤壁](https://www.luogu.com.cn/problem/P1496)

`排序` `区间合并`

### 题意

给定若干线段，求它们在数轴上覆盖长度的总和。

### 分析

把所有区间按左端点排序后线性扫描即可。维护当前合并段 `[L,R]`，如果新区间与它相交就扩展右端点，否则先结算上一段再开启新区间。

这是最基本的区间并长度模板。

### 核心代码

```cpp
sort(seg.begin(), seg.end());
long long ans = 0, L = seg[0].l, R = seg[0].r;
for (int i = 1; i < (int)seg.size(); i++) {
    if (seg[i].l <= R) R = max(R, seg[i].r);
    else ans += R - L, L = seg[i].l, R = seg[i].r;
}
ans += R - L;
```

### 复杂度

时间复杂度 $O(n \log n)$，空间复杂度 $O(n)$。

---

## 44. [AT_arc098_b [ABC098D] Xor Sum 2](https://www.luogu.com.cn/problem/AT_arc098_b)

`双指针` `位运算`

### 题意

统计有多少个子数组满足“区间和等于区间异或和”。

### 分析

对于非负整数，区间和等于区间异或和，当且仅当每一位上都没有产生进位。也就是窗口内任意一位不能在两个数中同时出现。

因此可以用双指针维护一个合法窗口：若加入新数后 `sum + a[r] != (xorv ^ a[r])`，就不断移动左端点。对每个右端点，所有以它结尾的合法子数组个数都是 `r-l+1`。

### 核心代码

```cpp
long long ans = 0, sum = 0, xr = 0;
for (int l = 1, r = 1; r <= n; r++) {
    while (l < r && sum + a[r] != (xr ^ a[r])) {
        sum -= a[l];
        xr ^= a[l];
        l++;
    }
    sum += a[r];
    xr ^= a[r];
    ans += r - l + 1;
}
```

### 复杂度

时间复杂度 $O(n)$，空间复杂度 $O(1)$。

---

## 45. [P1381 单词背诵](https://www.luogu.com.cn/problem/P1381)

`双指针` `字符串`

### 题意

给定一篇文章和若干目标单词，先问文章中能记住多少种目标单词，再问覆盖这些单词的最短连续段长度。

### 分析

先把目标单词映射成编号，再把文章中过滤出的有效单词序列提出来。第一问就是统计出现过多少种编号。

第二问是标准最小覆盖子串：双指针维护当前窗口中每种单词出现次数，当窗口已经覆盖全部出现过的目标单词时，就尝试收缩左端点。

### 核心代码

```cpp
for (int r = 0; r < (int)b.size(); r++) {
    if (++cnt[b[r]] == 1) now++;
    while (now == need && l <= r) {
        ans = min(ans, r - l + 1);
        if (--cnt[b[l]] == 0) now--;
        l++;
    }
}
```

### 复杂度

时间复杂度 $O(n)$，空间复杂度 $O(n)$。

---

## 46. [P1147 连续正整数和](https://www.luogu.com.cn/problem/P1147)

`双指针` `前缀和`

### 题意

给定一个正整数 `m`，求所有和为 `m` 的连续正整数区间。

### 分析

因为序列固定为 `1,2,3,...`，窗口右移时区间和单调增加，左移时区间和单调减小，所以天然适合双指针。

维护当前区间 `[l,r]` 的和：若和太小就扩右端点，太大就缩左端点，等于 `m` 时输出后继续移动。

### 核心代码

```cpp
for (int l = 1, r = 1, sum = 1; l <= m / 2; ) {
    if (sum < m) sum += ++r;
    else if (sum > m) sum -= l++;
    else {
        print(l, r);
        sum -= l++;
    }
}
```

### 复杂度

时间复杂度 $O(m)$，空间复杂度 $O(1)$。

---

## 47. [P1102 A-B 数对](https://www.luogu.com.cn/problem/P1102)

`哈希` `排序` `双指针`

### 题意

给定一个序列和整数 `C`，统计满足 `a[j] - a[i] = C` 的数对个数。

### 分析

最直接的做法是哈希统计每个值出现次数。对于每个 `x`，答案增加 `cnt[x] * cnt[x+C]` 即可。

如果想练双指针，也可以排序后分组统计；但在这题里哈希写法最清晰。

### 核心代码

```cpp
for (int x : a) cnt[x]++;
long long ans = 0;
for (int x : a)
    ans += cnt[x + c];
```

### 复杂度

时间复杂度 $O(n)$，空间复杂度 $O(n)$。

---

## 48. [P1638 逛画展](https://www.luogu.com.cn/problem/P1638)

`双指针` `最小覆盖区间`

### 题意

给定画作序列，每种画家编号代表一个类别，要求找到一个最短区间，使其包含所有 `m` 种类别。

### 分析

这就是最标准的“最短覆盖全部颜色”问题。右端点不断向右扩张直到窗口覆盖全部类别，然后收缩左端点来更新最优答案。

判断窗口是否覆盖完全，只需要维护当前窗口中出现了多少种类别。

### 核心代码

```cpp
for (int r = 1; r <= n; r++) {
    if (++cnt[a[r]] == 1) kind++;
    while (kind == m) {
        if (r - l < ansr - ansl) ansl = l, ansr = r;
        if (--cnt[a[l]] == 0) kind--;
        l++;
    }
}
```

### 复杂度

时间复杂度 $O(n)$，空间复杂度 $O(m)$。

# 四、ST 表、RMQ 与基础数据结构

当问题变成静态区间查询时，ST 表、RMQ 和少量辅助结构往往能把复杂度压到常数或对数。

## 49. [P3865 【模板】ST 表 & RMQ 问题](https://www.luogu.com.cn/problem/P3865)

`ST 表` `RMQ`

### 题意

给定一个长度为 `N` 的数列和若干次询问，每次要求区间最大值。

### 分析

这是 ST 表最经典的模板题。由于序列静态不修改，可以预处理 `st[k][i]` 表示从 `i` 开始、长度为 `2^k` 的区间最值。

查询 `[l,r]` 时，只需取两个长度相同、覆盖整个区间的块：`[l, l+2^k-1]` 和 `[r-2^k+1, r]`，答案是两者最大值。

### 核心代码

```cpp
int st[20][N], lg[N];

void build(int n) {
    for (int i = 2; i <= n; i++) lg[i] = lg[i >> 1] + 1;
    for (int k = 1; (1 << k) <= n; k++)
        for (int i = 1; i + (1 << k) - 1 <= n; i++)
            st[k][i] = max(st[k - 1][i], st[k - 1][i + (1 << (k - 1))]);
}

int query(int l, int r) {
    int k = lg[r - l + 1];
    return max(st[k][l], st[k][r - (1 << k) + 1]);
}
```

### 复杂度

预处理时间复杂度 $O(n \log n)$，单次查询 $O(1)$，空间复杂度 $O(n \log n)$。

---

## 50. [P1440 求m区间内的最小值](https://www.luogu.com.cn/problem/P1440)

`单调队列` `滑动窗口最值`

### 题意

对序列中的每个位置 `i`，求它前面至多 `m` 个数里的最小值；如果前面没有数则输出 `0`。

### 分析

这题是滑动窗口最值模板。维护一个单调递增队列，队首始终是当前窗口最小值的位置。

每次右端点前进时，先弹掉已经滑出窗口的下标，再把队尾中不优于当前值的位置删掉，最后队首就是答案。

### 核心代码

```cpp
deque<int> q;

for (int i = 1; i <= n; i++) {
    while (!q.empty() && q.front() < i - m) q.pop_front();
    if (q.empty()) ans[i] = 0;
    else ans[i] = a[q.front()];
    while (!q.empty() && a[q.back()] >= a[i]) q.pop_back();
    q.push_back(i);
}
```

### 复杂度

时间复杂度 $O(n)$，空间复杂度 $O(m)$。

---

## 51. [P1816 忠诚](https://www.luogu.com.cn/problem/P1816)

`ST 表` `区间最值`

### 题意

给定一个账目序列和若干询问，每次问某个区间内最小的一笔是多少。

### 分析

本质就是静态 RMQ。与区间最大值模板完全一样，只需把合并函数从 `max` 换成 `min`。

这类题的重点通常不在算法本身，而在于建立“静态查询优先考虑 ST 表”的反射。

### 核心代码

```cpp
int st[20][N], lg[N];

void build(int n) {
    for (int i = 2; i <= n; i++) lg[i] = lg[i >> 1] + 1;
    for (int k = 1; (1 << k) <= n; k++)
        for (int i = 1; i + (1 << k) - 1 <= n; i++)
            st[k][i] = min(st[k - 1][i], st[k - 1][i + (1 << (k - 1))]);
}

int query(int l, int r) {
    int k = lg[r - l + 1];
    return min(st[k][l], st[k][r - (1 << k) + 1]);
}
```

### 复杂度

预处理时间复杂度 $O(n \log n)$，单次查询 $O(1)$，空间复杂度 $O(n \log n)$。

---

## 52. [P2251 质量检测](https://www.luogu.com.cn/problem/P2251)

`单调队列` `滑动窗口`

### 题意

给定一串产品质量分数，要求输出每个长度为 `M` 的连续区间中的最小值。

### 分析

和上一题一样，本质仍然是窗口最小值。若用 ST 表也能做，但单调队列能在线输出，并且常数更小。

维护一个单调递增下标队列，队首始终是当前窗口最小元素的位置。当窗口长度达到 `M` 后，就开始输出队首对应的值。

### 核心代码

```cpp
deque<int> q;

for (int i = 1; i <= n; i++) {
    while (!q.empty() && q.front() <= i - m) q.pop_front();
    while (!q.empty() && a[q.back()] >= a[i]) q.pop_back();
    q.push_back(i);
    if (i >= m) cout << a[q.front()] << '\n';
}
```

### 复杂度

时间复杂度 $O(n)$，空间复杂度 $O(m)$。

---

## 53. [P2880 [USACO07JAN] Balanced Lineup G](https://www.luogu.com.cn/problem/P2880)

`ST 表` `区间最大最小值`

### 题意

给定奶牛身高序列和若干区间，要求每次输出区间内最高与最低身高的差值。

### 分析

这题要求同时维护区间最大值和最小值，因此可以开两张 ST 表：一张做 `max`，一张做 `min`。查询时分别取出两个值，相减即可。

因为区间是静态的，所以这种“双 ST 表”是最自然的写法。

### 核心代码

```cpp
int mx[20][N], mn[20][N], lg[N];

int query_max(int l, int r) {
    int k = lg[r - l + 1];
    return max(mx[k][l], mx[k][r - (1 << k) + 1]);
}

int query_min(int l, int r) {
    int k = lg[r - l + 1];
    return min(mn[k][l], mn[k][r - (1 << k) + 1]);
}
```

### 复杂度

预处理时间复杂度 $O(n \log n)$，单次查询 $O(1)$，空间复杂度 $O(n \log n)$。

---

## 54. [P7333 [JRKSJ R1] JFCA](https://www.luogu.com.cn/problem/P7333)

`ST 表` `二分` `分块`

### 题意

给定一个环，每个点有两个属性 `a[i], b[i]`。对每个点 `i`，要求找到离它最近的另一个点 `j`，满足 `a[j] >= b[i]`。

### 分析

把环拆成链的常见做法是复制数组。之后对于每个点 `i`，可以二分答案“距离 `d` 是否可行”。

`check(d)` 的本质是区间最大值查询：看 `i` 左右距离不超过 `d` 的范围内，是否存在 `a[j] >= b[i]`。为了让 `check` 足够快，常见做法是用 ST 表做区间最大值，或者用分块维护块最大值。

### 核心代码

```cpp
int mx[20][N * 3], lg[N * 3];

int query(int l, int r) {
    int k = lg[r - l + 1];
    return max(mx[k][l], mx[k][r - (1 << k) + 1]);
}

int solve_one(int i) {
    if (query(i + 1, i + n - 1) < b[i]) return -1;
    int l = 1, r = n - 1;
    while (l < r) {
        int mid = (l + r) >> 1;
        int best = max(query(i - mid + n, i - 1 + n), query(i + 1 + n, i + mid + n));
        if (best >= b[i]) r = mid;
        else l = mid + 1;
    }
    return l;
}
```

### 复杂度

预处理时间复杂度 $O(n \log n)$，每个点二分查询 $O(\log^2 n)$，空间复杂度 $O(n \log n)$。

# 五、二分答案与分数规划

这一章集中整理“答案具有单调性”的题型：有的直接二分阈值，有的把比值最优化改写成分数规划。

## 55. [P4377 [USACO18OPEN] Talent Show G](https://www.luogu.com.cn/problem/P4377)

`二分答案` `01分数规划` `01背包`

### 题意

选若干头牛，总重量至少为 `W`，最大化 `talent / weight`，输出答案乘 `1000` 后的整数部分。

### 分析

典型 `01` 分数规划。二分比值 `x` 后，把每头牛的贡献改成 `talent - x * weight`，再做一次 `01` 背包。

如果存在总重量不少于 `W` 的方案，使改写后的总和 `>= 0`，说明这个 `x` 可行。

### 核心代码

```cpp
double dp[MAXW + 1];

bool check(double x) {
    fill(dp, dp + W + 1, -1e100);
    dp[0] = 0;
    for (int i = 1; i <= n; i++) {
        for (int j = W; j >= 0; j--) {
            int nj = min(W, j + w[i]);
            dp[nj] = max(dp[nj], dp[j] + t[i] - x * w[i]);
        }
    }
    return dp[W] >= 0;
}
```

### 复杂度

时间复杂度 $O(nW \log \varepsilon^{-1})$，空间复杂度 $O(W)$。

---

## 56. [P3199 [HNOI2009] 最小圈](https://www.luogu.com.cn/problem/P3199)

`分数规划` `最小平均环` `负环判定`

### 题意

给定一个有向图，求所有环中平均边权最小的那个。

### 分析

二分平均值 `x`，把每条边的权值改成 `w - x`。若图中存在负环，说明存在某个环的平均边权小于 `x`，因此 `x` 仍然可行。

判负环通常用 `SPFA` 或 Bellman-Ford 变形。

### 核心代码

```cpp
bool check(double x) {
    queue<int> q;
    for (int i = 1; i <= n; i++)
        dist[i] = 0, cnt[i] = 0, inq[i] = true, q.push(i);

    while (!q.empty()) {
        int u = q.front(); q.pop();
        inq[u] = false;
        for (auto [v, w] : g[u]) {
            if (dist[v] > dist[u] + w - x) {
                dist[v] = dist[u] + w - x;
                if (++cnt[v] >= n) return true;
                if (!inq[v]) inq[v] = true, q.push(v);
            }
        }
    }
    return false;
}
```

### 复杂度

时间复杂度 $O(nm \log \varepsilon^{-1})$，空间复杂度 $O(n+m)$。

---

## 57. [P4322 [JSOI2016] 最佳团体](https://www.luogu.com.cn/problem/P4322)

`二分答案` `树形DP` `分数规划`

### 题意

树上选出 `K+1` 个点，且若父亲未被选中则子树中的点不能被选，最大化 `∑P / ∑S`。

### 分析

二分答案 `x`，把每个点的权值改写成 `P - x * S`。随后做树形背包，`dp[u][j]` 表示在 `u` 子树中选 `j` 个点且 `u` 被选时的最大改写总和。

若根的 `dp[1][K+1] >= 0`，则 `x` 可行。

### 核心代码

```cpp
double dp[MAXN][MAXK];
int sz[MAXN];

void dfs(int u, int fa) {
    dp[u][1] = p[u] - mid * s[u];
    sz[u] = 1;
    for (int v : g[u]) if (v != fa) {
        dfs(v, u);
        for (int i = sz[u]; i >= 1; i--)
            for (int j = 1; j <= sz[v] && i + j <= K + 1; j++)
                dp[u][i + j] = max(dp[u][i + j], dp[u][i] + dp[v][j]);
        sz[u] += sz[v];
    }
}
```

### 复杂度

时间复杂度 $O(nK^2 \log \varepsilon^{-1})$，空间复杂度 $O(nK)$。

---

## 58. [P3705 [SDOI2017] 新生舞会](https://www.luogu.com.cn/problem/P3705)

`分数规划` `KM` `二分答案`

### 题意

男女生两两配对，每一对有收益 `a` 和代价 `b`，要求在完美匹配中最大化 `∑a / ∑b`。

### 分析

二分比值 `x`，把边权改成 `a - x * b`。然后在二分图上跑一次最大权完美匹配。

如果最大匹配权值 `>= 0`，就说明存在一个匹配使原分数至少为 `x`。

### 核心代码

```cpp
double w[MAXN][MAXN];

bool check(double x) {
    for (int i = 1; i <= n; i++)
        for (int j = 1; j <= n; j++)
            w[i][j] = a[i][j] - x * b[i][j];
    return km(n, w) >= 0;
}
```

### 复杂度

时间复杂度 $O(n^3 \log \varepsilon^{-1})$，空间复杂度 $O(n^2)$。

---

## 59. [P2494 [SDOI2011] 保密](https://www.luogu.com.cn/problem/P2494)

`分数规划` `最小割`

### 题意

图中每个出口都对应一条“时间 / 安全系数”的最优路径代价，若干空腔要求至少被一个相邻出口控制，求最小总代价。

### 分析

本题分两层。先对每个出口做一次分数规划：二分比值 `x`，把边权改成 `t - x * s`，求是否存在改写和 `<= 0` 的可行路径，从而得到该出口的最小危险系数。

之后把出口看成二分图顶点、空腔看成边，问题就变成“每条边至少选一个端点”的最小权点覆盖，可以直接转成最小割。

### 核心代码

```cpp
double solve_exit(int st) {
    auto check = [&](double x) {
        return shortest_path_on_transformed_graph(st, x) <= 0;
    };
    double l = 0, r = INF;
    while (r - l > 1e-8) {
        double mid = (l + r) / 2;
        if (check(mid)) r = mid;
        else l = mid;
    }
    return r;
}

build_min_cut(cost_of_exit);
double ans = dinic();
```

### 复杂度

时间复杂度取决于最短路与最小割实现，常见写法为 $O(\text{分数规划} + \text{MaxFlow})$。

---

## 60. [P3288 [SCOI2014] 方伯伯运椰子](https://www.luogu.com.cn/problem/P3288)

`01分数规划` `负环判定`

### 题意

对边的流量做单位调整，要求在总流量守恒的前提下，让平均调整代价最优。

### 分析

把一次“沿环增减一单位流量”的操作看成一个回路收益问题，目标本质上是最大化平均收益。二分答案 `x` 后，把每种调整方式的代价改成 `cost - x`。

这样问题就转成：图上是否存在一个总改写代价为负的环。若存在负环，说明当前 `x` 还可以继续增大。

### 核心代码

```cpp
bool check(double x) {
    queue<int> q;
    for (int i = 1; i <= n; i++)
        dis[i] = 0, cnt[i] = 0, inq[i] = 1, q.push(i);

    while (!q.empty()) {
        int u = q.front(); q.pop();
        inq[u] = 0;
        for (auto [v, cost] : g[u]) {
            if (dis[v] > dis[u] + cost - x) {
                dis[v] = dis[u] + cost - x;
                if (++cnt[v] >= n) return true;
                if (!inq[v]) inq[v] = 1, q.push(v);
            }
        }
    }
    return false;
}
```

### 复杂度

时间复杂度 $O(VE \log \varepsilon^{-1})$，空间复杂度 $O(V+E)$。

---

## 61. [P6087 [JSOI2015] 送礼物](https://www.luogu.com.cn/problem/P6087)

`二分答案` `单调队列` `分数规划`

### 题意

在区间长度限制 `[L,R]` 内，最大化某个区间的 `（最大值 - 最小值） / （长度 + K）`。

### 分析

二分答案 `x` 后，不等式可以改写成 `max - min >= x * (len + K)`。进一步整理后，就变成维护若干个形如 `a[i] - x*i` 与 `a[i] + x*i` 的前缀极值比较。

因此 `check(x)` 可以用单调队列在线维护长度在 `[L,R]` 内的候选位置，判断是否存在可行区间。

### 核心代码

```cpp
bool check(double x) {
    for (int i = 1; i <= n; i++) {
        b[i] = a[i] - x * i;
        c[i] = a[i] + x * i;
    }
    deque<int> q1, q2;
    for (int i = 1; i <= n; i++) {
        push_candidate(q1, q2, i - L);
        pop_expired(q1, q2, i - R);
        if (ok_with_current_window(i, x, q1, q2)) return true;
    }
    return false;
}
```

### 复杂度

时间复杂度 $O(n \log \varepsilon^{-1})$，空间复杂度 $O(n)$。

---

## 62. [UVA1389 Hard Life](https://www.luogu.com.cn/problem/UVA1389)

`分数规划` `最大密度子图` `最小割`

### 题意

在无向图中选一个点集，使得 `边数 / 点数` 尽量大。

### 分析

这是最大密度子图的经典模型。二分密度 `x`，判断是否存在子图满足 `E - xV > 0`。

判定通常转成最小割：点和边分别映射到网络中的容量，跑一次最大流即可判断当前密度是否可行。

### 核心代码

```cpp
bool check(double x) {
    build_flow_network(x);
    return dinic() < total_edge_capacity;
}
```

### 复杂度

时间复杂度通常为 $O(\log \varepsilon^{-1} \cdot \text{MaxFlow})$，空间复杂度 $O(V+E)$。

---

## 63. [P2440 木材加工](https://www.luogu.com.cn/problem/P2440)

`二分答案` `贪心`

### 题意

给一批木材，切成长度相同的小段，至少得到 `k` 段，求最长可切长度。

### 分析

二分切割长度 `x`，统计每根木材能切出多少段 `a[i] / x`。若总段数 `>= k`，说明 `x` 可行。

### 核心代码

```cpp
bool check(int x) {
    long long cnt = 0;
    for (int i = 1; i <= n; i++) cnt += a[i] / x;
    return cnt >= k;
}
```

### 复杂度

时间复杂度 $O(n \log V)$，空间复杂度 $O(1)$。

---

## 64. [P2678 [NOIP 2015 提高组] 跳石头](https://www.luogu.com.cn/problem/P2678)

`二分答案` `贪心`

### 题意

删除最多 `m` 块石头，使相邻保留石头的最小距离尽量大。

### 分析

二分最小距离 `x`。从左到右扫描，如果当前石头和上一个保留石头距离 `< x`，就只能删掉它；否则把它保留下来。

若删除数量不超过 `m`，说明这个 `x` 可行。

### 核心代码

```cpp
bool check(int x) {
    int last = 0, del = 0;
    for (int i = 1; i <= n + 1; i++) {
        if (d[i] - d[last] < x) del++;
        else last = i;
    }
    return del <= m;
}
```

### 复杂度

时间复杂度 $O(n \log V)$，空间复杂度 $O(1)$。

---

## 65. [P1314 [NOIP 2011 提高组] 聪明的质监员](https://www.luogu.com.cn/problem/P1314)

`二分答案` `前缀和`

### 题意

选定一个重量阈值 `W`，对每个询问区间统计“重量不小于 `W` 的矿石数量和价值和”，得到总值 `y`，要求让 `|y-S|` 最小。

### 分析

阈值 `W` 越大，被统计进去的矿石越少，因此 `y` 单调变化。于是可以二分 `W`。

每次检查时开两个前缀和：一个统计个数，一个统计价值，区间贡献就是 `count * value_sum`。

### 核心代码

```cpp
long long calc(int W) {
    for (int i = 1; i <= n; i++) {
        cnt[i] = cnt[i - 1] + (w[i] >= W);
        sum[i] = sum[i - 1] + (w[i] >= W ? v[i] : 0);
    }
    long long y = 0;
    for (auto [l, r] : qs) {
        long long c = cnt[r] - cnt[l - 1];
        long long s = sum[r] - sum[l - 1];
        y += c * s;
    }
    return y;
}
```

### 复杂度

时间复杂度 $O((n+m)\log V)$，空间复杂度 $O(n)$。

---

## 66. [P1083 [NOIP 2012 提高组] 借教室](https://www.luogu.com.cn/problem/P1083)

`二分答案` `差分`

### 题意

给定每天可用教室数和若干借用请求，求第一个无法满足的请求编号。

### 分析

前 `k` 个请求是否可行显然具有单调性，因此二分第一个失败位置。`check(k)` 时把前 `k` 个区间请求做差分叠加，再扫一遍前缀和判断是否有某天超出容量。

### 核心代码

```cpp
bool check(int k) {
    memset(diff, 0, sizeof(diff));
    for (int i = 1; i <= k; i++) {
        diff[s[i]] += d[i];
        diff[t[i] + 1] -= d[i];
    }
    long long cur = 0;
    for (int i = 1; i <= n; i++) {
        cur += diff[i];
        if (cur > room[i]) return false;
    }
    return true;
}
```

### 复杂度

时间复杂度 $O(n \log m)$，空间复杂度 $O(n)$。

---

## 67. [P1902 刺杀大使](https://www.luogu.com.cn/problem/P1902)

`二分答案` `BFS`

### 题意

在网格上从第一行走到最后一行，希望经过路径上的最大代价尽量小。

### 分析

二分答案 `x`，只允许经过代价 `<= x` 的格子。随后从第一行所有合法起点出发做 BFS。

若最后一行存在任意一个格子可达，就说明 `x` 可行。

### 核心代码

```cpp
bool check(int x) {
    queue<pair<int,int>> q;
    memset(vis, 0, sizeof(vis));
    for (int j = 1; j <= m; j++)
        if (a[1][j] <= x) vis[1][j] = 1, q.push({1, j});

    while (!q.empty()) {
        auto [u, v] = q.front(); q.pop();
        for (int k = 0; k < 4; k++) {
            int nx = u + dx[k], ny = v + dy[k];
            if (ok(nx, ny) && !vis[nx][ny] && a[nx][ny] <= x) {
                vis[nx][ny] = 1;
                q.push({nx, ny});
            }
        }
    }
    for (int j = 1; j <= m; j++) if (vis[n][j]) return true;
    return false;
}
```

### 复杂度

时间复杂度 $O(nm \log V)$，空间复杂度 $O(nm)$。

---

## 68. [P1163 银行贷款](https://www.luogu.com.cn/problem/P1163)

`二分答案` `浮点`

### 题意

给定贷款额、每月还款额和还款月数，求月利率。

### 分析

利率越大，最终剩余欠款越多，因此具有单调性。二分月利率 `x`，模拟 `k` 个月的还款过程即可。

如果最后仍然欠钱，说明利率猜大了。

### 核心代码

```cpp
bool check(double x) {
    double sum = n;
    for (int i = 1; i <= k; i++) sum = sum * (1 + x) - m;
    return sum > 0;
}
```

### 复杂度

时间复杂度 $O(k \log \varepsilon^{-1})$，空间复杂度 $O(1)$。

---

## 69. [P1873 [COCI 2011/2012 #5] EKO / 砍树](https://www.luogu.com.cn/problem/P1873)

`二分答案` `贪心`

### 题意

设定锯木机高度，要求砍下来的总木材长度至少为 `m`，求最高可行高度。

### 分析

二分锯木高度 `x`，统计 `sum(max(0, h[i]-x))`。若总和仍然不少于 `m`，说明还能继续提高锯木机。

### 核心代码

```cpp
bool check(int x) {
    long long sum = 0;
    for (int i = 1; i <= n; i++) if (h[i] > x) sum += h[i] - x;
    return sum >= m;
}
```

### 复杂度

时间复杂度 $O(n \log V)$，空间复杂度 $O(1)$。

---

## 70. [P1577 切绳子](https://www.luogu.com.cn/problem/P1577)

`二分答案` `浮点`

### 题意

把若干根绳子切成至少 `k` 段等长小绳，求每段的最大长度。

### 分析

二分段长 `x`，统计每根绳子能切出 `floor(len[i]/x)` 段。若总段数足够，就说明这个长度可行。

### 核心代码

```cpp
bool check(double x) {
    int cnt = 0;
    for (int i = 1; i <= n; i++) cnt += int(len[i] / x);
    return cnt >= k;
}
```

### 复杂度

时间复杂度 $O(n \log \varepsilon^{-1})$，空间复杂度 $O(1)$。

---

## 71. [P1824 [USACO05FEB] 进击的奶牛 Aggressive Cows G](https://www.luogu.com.cn/problem/P1824)

`二分答案` `贪心`

### 题意

在若干牛舍中放 `c` 头牛，使最近两头牛之间的距离尽量大。

### 分析

二分最小距离 `x`，从左到右贪心放牛：每次尽量把下一头牛放到最靠左、且与上一头牛间距至少为 `x` 的位置。

若能放下 `c` 头，说明 `x` 可行。

### 核心代码

```cpp
bool check(int x) {
    int cnt = 1, last = a[1];
    for (int i = 2; i <= n; i++) {
        if (a[i] - last >= x) {
            cnt++;
            last = a[i];
        }
    }
    return cnt >= c;
}
```

### 复杂度

时间复杂度 $O(n \log V)$，空间复杂度 $O(1)$。

---

## 72. [P1182 数列分段 Section II](https://www.luogu.com.cn/problem/P1182)

`二分答案` `贪心`

### 题意

把数组分成 `m` 段，最小化最大的段和。

### 分析

二分最大段和 `x`。从左到右贪心分段：当前段再加入一个数若会超过 `x`，就必须开新段。

若最后分出的段数不超过 `m`，说明 `x` 可行。

### 核心代码

```cpp
bool check(long long x) {
    long long sum = 0;
    int cnt = 1;
    for (int i = 1; i <= n; i++) {
        if (sum + a[i] > x) cnt++, sum = a[i];
        else sum += a[i];
    }
    return cnt <= m;
}
```

### 复杂度

时间复杂度 $O(n \log V)$，空间复杂度 $O(1)$。

---

## 73. [P1404 平均数](https://www.luogu.com.cn/problem/P1404)

`二分答案` `前缀和` `分数规划`

### 题意

求长度至少为 `m` 的连续子段中的最大平均数。

### 分析

二分平均数 `x`，把每个数减去 `x`，问题就转成：是否存在长度至少为 `m` 的子段和 `>= 0`。

用前缀和维护历史最小前缀，就能在线性时间判断。

### 核心代码

```cpp
bool check(double x) {
    s[0] = 0;
    for (int i = 1; i <= n; i++) s[i] = s[i - 1] + a[i] - x;
    double mn = 0;
    for (int i = m; i <= n; i++) {
        mn = min(mn, s[i - m]);
        if (s[i] - mn >= 0) return true;
    }
    return false;
}
```

### 复杂度

时间复杂度 $O(n \log \varepsilon^{-1})$，空间复杂度 $O(n)$。

---

## 74. [P8088 『JROI-5』Autumn](https://www.luogu.com.cn/problem/P8088)

`二分答案` `排序` `计数`

### 题意

通过不超过 `x` 次交换，使每一行的第 `k` 大值都不超过某个阈值，求这个阈值的最小可能值。

### 分析

答案越大越容易满足，因此可以二分阈值 `mid`。对每一行排序后，统计前 `k` 个位置中有多少个数仍然 `> mid`，这是必须调出去的需求量；再统计后面位置中有多少个数 `<= mid`，这是可供调入的数量。

若全局需求量不超过交换次数且供给足够，就说明 `mid` 可行。

### 核心代码

```cpp
bool check(int mid) {
    long long need = 0, give = 0;
    for (int i = 1; i <= n; i++) {
        need += count_big_in_top_k(i, mid);
        give += count_small_in_suffix(i, mid);
    }
    return need <= x && need <= give;
}
```

### 复杂度

时间复杂度通常为 $O(nm \log V)$ 或 $O(n \log m \log V)$，视统计方式而定。

---

## 75. [P2824 [HEOI2016/TJOI2016] 排序](https://www.luogu.com.cn/problem/P2824)

`二分答案` `线段树`

### 题意

经历若干次区间升序/降序操作后，求某个位置上的数值。

### 分析

二分答案 `x`，把原数组映射成 `0/1`：大于等于 `x` 记为 `1`，否则记为 `0`。区间排序就变成了区间内 `0/1` 的重新摆放。

模拟所有操作后，看目标位置最终是 `1` 还是 `0`，就能判断这个 `x` 是否可行。

### 核心代码

```cpp
bool check(int x) {
    build01(x);
    for (auto [op, l, r] : qs) {
        int cnt = query(l, r);
        if (op == 0) {
            modify(l, r - cnt, 0);
            modify(r - cnt + 1, r, 1);
        } else {
            modify(l, l + cnt - 1, 1);
            modify(l + cnt, r, 0);
        }
    }
    return query(q, q);
}
```

### 复杂度

时间复杂度 $O(m \log n \log V)$，空间复杂度 $O(n)$。

---

## 76. [CF1486D Max Median](https://www.luogu.com.cn/problem/CF1486D)

`二分答案` `前缀和`

### 题意

求长度至少为 `k` 的子段中位数最大值。

### 分析

二分中位数 `x`，把 `>= x` 的数记作 `1`，否则记作 `-1`。若存在长度至少为 `k` 的子段和 `> 0`，说明这个子段里“大数”更多，因此中位数至少为 `x`。

判断时仍然是前缀和加最小前缀。

### 核心代码

```cpp
bool check(int x) {
    s[0] = 0;
    for (int i = 1; i <= n; i++) s[i] = s[i - 1] + (a[i] >= x ? 1 : -1);
    int mn = 0;
    for (int i = k; i <= n; i++) {
        mn = min(mn, s[i - k]);
        if (s[i] - mn > 0) return true;
    }
    return false;
}
```

### 复杂度

时间复杂度 $O(n \log V)$，空间复杂度 $O(n)$。

---

## 77. [P2249 【深基13.例1】查找](https://www.luogu.com.cn/problem/P2249)

`二分查找`

### 题意

对每个查询值，输出它在有序数组中第一次出现的位置；若不存在则输出 `-1`。

### 分析

这就是标准的左边界二分。用 `lower_bound` 找到第一个不小于 `x` 的位置，再判断这个位置是否真的等于 `x` 即可。

### 核心代码

```cpp
int pos = lower_bound(a + 1, a + n + 1, x) - a;
cout << ((pos <= n && a[pos] == x) ? pos : -1) << ' ';
```

### 复杂度

时间复杂度 $O(\log n)$，空间复杂度 $O(1)$。

---

## 78. [P1024 [NOIP 2001 提高组] 一元三次方程求解](https://www.luogu.com.cn/problem/P1024)

`二分答案` `浮点`

### 题意

求一元三次方程的所有实根，保留两位小数。

### 分析

函数连续，因此可以先粗扫区间，找到所有变号的小区间，再分别二分每个根。

每个根都在一个很短的变号区间里，二分到精度要求即可。

### 核心代码

```cpp
double f(double x) {
    return ((a * x + b) * x + c) * x + d;
}

double solve(double l, double r) {
    while (r - l > 1e-4) {
        double mid = (l + r) / 2;
        if (f(l) * f(mid) <= 0) r = mid;
        else l = mid;
    }
    return (l + r) / 2;
}
```

### 复杂度

时间复杂度为每个根 $O(\log \varepsilon^{-1})$，空间复杂度 $O(1)$。

# 六、树上差分、LCA 与树剖入门

树上路径统计往往离不开 LCA、树上差分和树剖；本章把这些最常见的树上基础套路集中起来讲。

## 79. [P3128 [USACO15DEC] Max Flow P](https://www.luogu.com.cn/problem/P3128)

`LCA` `树上差分`

### 题意

给定一棵树和若干条路径，每条路径上的所有点流量都加一，求最终流量最大的点。

### 分析

这是树上点差分模板。对于一条路径 `u-v`，令 `diff[u]++`、`diff[v]++`、`diff[lca]--`、`diff[parent(lca)]--`，然后自底向上累加。

累加后 `sum[x]` 就是经过点 `x` 的路径条数，因此扫一遍最大值即可。

### 核心代码

```cpp
void add_path(int u, int v) {
    int p = lca(u, v);
    diff[u]++, diff[v]++;
    diff[p]--;
    if (fa[p]) diff[fa[p]]--;
}

void dfs_sum(int u, int f) {
    for (int v : g[u]) if (v != f) {
        dfs_sum(v, u);
        diff[u] += diff[v];
    }
    ans = max(ans, diff[u]);
}
```

### 复杂度

预处理 LCA 时间复杂度 $O(n \log n)$，每次修改 $O(\log n)$，最后统计 $O(n)$。

---

## 80. [U143800 暗之连锁](https://www.luogu.com.cn/problem/U143800)

`LCA` `树上差分`

### 题意

给定一棵树和若干条附加边。先切断一条树边，再切断一条附加边，要求最终图不连通，问有多少种方案。

### 分析

把每条附加边看作树上的一条路径，它会“保护”路径上的所有树边。设 `cnt[e]` 为覆盖树边 `e` 的附加边数量，那么：

1. `cnt[e] = 0` 时，切掉这条树边后图已经断开，第二步可以任意切一条附加边，贡献 `m`。
2. `cnt[e] = 1` 时，必须再切掉唯一那条跨越该割的附加边，贡献 `1`。
3. `cnt[e] >= 2` 时，无论再切哪条附加边都仍然连通，贡献 `0`。

于是问题就转成树边被多少条路径覆盖，仍然是树上差分。

### 核心代码

```cpp
void add_extra(int u, int v) {
    int p = lca(u, v);
    diff[u]++, diff[v]++, diff[p] -= 2;
}

void dfs(int u, int f) {
    for (int v : g[u]) if (v != f) {
        dfs(v, u);
        diff[u] += diff[v];
        if (diff[v] == 0) ans += m;
        else if (diff[v] == 1) ans++;
    }
}
```

### 复杂度

预处理 LCA 时间复杂度 $O(n \log n)$，统计阶段 $O(n)$。

---

## 81. [P3258 [JLOI2014] 松鼠的新家](https://www.luogu.com.cn/problem/P3258)

`LCA` `树上差分`

### 题意

给定松鼠参观房间的顺序 `a1,a2,...,an`，每次都沿树上最短路移动。问每个房间至少要放多少糖，才能保证维尼每次经过都有糖可吃。

### 分析

把每一段 `a[i] -> a[i+1]` 看成一条路径，对路径上的点计数。这样仍然可以用点差分：路径两端加一，`lca` 和 `parent(lca)` 各减一。

不过序列是连续拼接的，中间点 `a[2]...a[n]` 会被相邻两段重复计算一次，所以最后要对这些点各减一；其中 `a[n]` 还对应终点不取糖的条件，正好也在这一步一起处理。

### 核心代码

```cpp
for (int i = 1; i < n; i++) {
    int u = a[i], v = a[i + 1], p = lca(u, v);
    diff[u]++, diff[v]++;
    diff[p]--;
    if (fa[p]) diff[fa[p]]--;
}
for (int i = 2; i <= n; i++) diff[a[i]]--;

void dfs(int u, int f) {
    for (int v : g[u]) if (v != f) {
        dfs(v, u);
        diff[u] += diff[v];
    }
    ans[u] = diff[u];
}
```

### 复杂度

预处理 LCA 时间复杂度 $O(n \log n)$，整体统计 $O(n)$。

---

## 82. [P2680 [NOIP 2015 提高组] 运输计划](https://www.luogu.com.cn/problem/P2680)

`二分` `LCA` `树上差分`

### 题意

树上有若干运输路径，可以把一条边改成长度 `0`。问所有运输同时完成时，最慢那条路径的最短可能时间。

### 分析

答案具有单调性，可以二分最终时间 `x`。若某条路径长度本来就不超过 `x`，不用管；对所有长度大于 `x` 的“坏路径”，它们必须共同经过某一条足够长的边，才能通过把这条边变成虫洞把总长度压到 `x`。

因此在 `check(x)` 中，把所有坏路径做树上边差分，统计每条边被多少条坏路径覆盖。如果存在一条边被全部坏路径覆盖，且它的长度至少为 `max_dist - x`，说明可行。

### 核心代码

```cpp
bool check(int lim) {
    fill(diff + 1, diff + n + 1, 0);
    int bad = 0, mx = 0;
    for (auto [u, v, d] : path) if (d > lim) {
        int p = lca(u, v);
        diff[u]++, diff[v]++, diff[p] -= 2;
        bad++, mx = max(mx, d);
    }
    int need = mx - lim, best = 0;
    dfs_sum(1, 0, bad, need, best);
    return best >= need;
}
```

### 复杂度

预处理时间复杂度 $O(n \log n)$，单次 `check` 为 $O(n+m)$，总复杂度 $O((n+m)\log V)$。

---

## 83. [P1600 [NOIP 2016 提高组] 天天爱跑步](https://www.luogu.com.cn/problem/P1600)

`LCA` `树上差分` `桶计数`

### 题意

每个玩家从 `s` 跑到 `t`，每秒走一条边。每个点 `x` 的观察员会在时刻 `w[x]` 观察，问能看到多少玩家。

### 分析

一个点 `x` 在路径 `s-t` 上被看到，分成两段讨论：

1. 若 `x` 在 `s -> lca` 这段上，则到达时间是 `dep[s] - dep[x]`，条件改写成 `dep[s] = w[x] + dep[x]`。
2. 若 `x` 在 `lca -> t` 这段上，则到达时间是 `dep[s] + dep[x] - 2dep[lca]`，条件改写成 `dep[s] - 2dep[lca] = w[x] - dep[x]`。

于是可以把每条路径拆成两类贡献，DFS 时用两个桶维护当前子树里满足这两个式子的路径数量，再配合 LCA 做增减。

### 核心代码

```cpp
void dfs(int u, int f) {
    int pre1 = bucket1[w[u] + dep[u]];
    int pre2 = bucket2[w[u] - dep[u] + OFF];
    for (auto x : add1[u]) bucket1[x]++;
    for (auto x : add2[u]) bucket2[x + OFF]++;
    for (int v : g[u]) if (v != f) dfs(v, u);
    ans[u] += bucket1[w[u] + dep[u]] - pre1;
    ans[u] += bucket2[w[u] - dep[u] + OFF] - pre2;
    for (auto x : del1[u]) bucket1[x]--;
    for (auto x : del2[u]) bucket2[x + OFF]--;
}
```

### 复杂度

预处理 LCA 时间复杂度 $O(n \log n)$，整棵树 DFS 统计 $O(n+m)$。

---

## 84. [P4556 【模板】线段树合并 / [Vani 有约会] 雨天的尾巴](https://www.luogu.com.cn/problem/P4556)

`线段树合并` `树上差分`

### 题意

有若干次操作 `(u,v,z)`，表示路径 `u-v` 上所有点颜色 `z` 的出现次数加一。对每个点，求出现次数最多的颜色编号。

### 分析

仍然先做树上差分，不过差分数组不再是整数，而是一棵按颜色下标建立的动态线段树：在 `u,v` 位置对颜色 `z` 加一，在 `lca` 与 `parent(lca)` 对颜色 `z` 减一。

然后自底向上合并子树线段树。合并完后，每个点线段树的根节点就维护了“本点所有颜色的最大出现次数以及对应最小颜色编号”。

### 核心代码

```cpp
void add(int& p, int l, int r, int pos, int v);
int merge(int x, int y);

void path_add(int u, int v, int c) {
    int p = lca(u, v);
    add(rt[u], 1, C, c, 1);
    add(rt[v], 1, C, c, 1);
    add(rt[p], 1, C, c, -1);
    if (fa[p]) add(rt[fa[p]], 1, C, c, -1);
}

void dfs(int u, int f) {
    for (int v : g[u]) if (v != f) {
        dfs(v, u);
        rt[u] = merge(rt[u], rt[v]);
    }
    ans[u] = mx[rt[u]] ? id[rt[u]] : 0;
}
```

### 复杂度

时间复杂度约为 $O((n+m)\log C)$，空间复杂度约为 $O((n+m)\log C)$。

---

## 85. [P4427 [BJOI2018] 求和](https://www.luogu.com.cn/problem/P4427)

`LCA` `倍增` `前缀和`

### 题意

多次询问树上两点路径上所有节点深度的 `k` 次方和，其中 `k` 会变化。

### 分析

因为 `k` 的范围很小，可以预处理 `sum[u][k]` 表示根到 `u` 的路径上，所有节点深度 `k` 次方的和。这样查询就和普通路径和完全一样：

`sum[u][k] + sum[v][k] - sum[lca][k] - sum[parent(lca)][k]`。

核心仍是先用倍增求 LCA，再把树上路径问题转成两条根路径。

### 核心代码

```cpp
void dfs(int u, int f) {
    fa[u][0] = f;
    for (int k = 1; k <= 50; k++)
        sum[u][k] = (sum[f][k] + qpow(dep[u], k)) % mod;
    for (int v : g[u]) if (v != f) {
        dep[v] = dep[u] + 1;
        dfs(v, u);
    }
}

int query(int u, int v, int k) {
    int p = lca(u, v);
    return (sum[u][k] + sum[v][k] - sum[p][k] - sum[fa[p][0]][k]) % mod;
}
```

### 复杂度

预处理时间复杂度 $O(50n + n \log n)$，单次查询 $O(\log n)$。

---

## 86. [P5021 [NOIP 2018 提高组] 赛道修建](https://www.luogu.com.cn/problem/P5021)

`二分` `树形 DP` `贪心`

### 题意

在树上选出 `m` 条互不相交的路径，使这 `m` 条路径中的最短长度尽量大。

### 分析

典型的“二分答案 + 树上配对”问题。二分最短赛道长度 `x` 后，DFS 统计每个节点向上还能提供哪些未完成链。

对子节点返回的链长加上边权后排序，优先把两条能凑到至少 `x` 的链配成一条完整赛道；配不上的部分中，只保留最长的一条继续向父亲上传。

### 核心代码

```cpp
int dfs(int u, int f, int lim) {
    multiset<int> s;
    for (auto [v, w] : g[u]) if (v != f) {
        int t = dfs(v, u, lim) + w;
        if (t >= lim) cnt++;
        else s.insert(t);
    }
    while (s.size() >= 2) {
        auto it = s.begin();
        auto jt = s.lower_bound(lim - *it);
        if (jt == s.end() || jt == it) break;
        cnt++, s.erase(jt), s.erase(it);
    }
    return s.empty() ? 0 : *s.rbegin();
}
```

### 复杂度

单次 `check` 时间复杂度 $O(n \log n)$，总复杂度 $O(n \log n \log V)$。

---

## 87. [P1084 [NOIP 2012 提高组] 疫情控制](https://www.luogu.com.cn/problem/P1084)

`二分` `倍增` `贪心`

### 题意

树上部分节点驻扎军队，每支军队可以移动并在某点设卡。要求所有从根到叶子的路径都被至少一个检查点截断，问最少需要多少时间。

### 分析

答案显然可以二分。对于给定时间 `T`，先用倍增求出每支军队在 `T` 时间内最多能向上跳到哪里。

之后问题会转成“哪些根的儿子子树已经被内部军队覆盖，哪些还没有”。能爬到根附近的军队会变成一批可分配资源，再按剩余时间从小到大去贪心覆盖那些尚未被控制的子树。

### 核心代码

```cpp
int jump(int u, long long lim) {
    for (int k = LOG; k >= 0; k--)
        if (fa[u][k] && dist[u] - dist[fa[u][k]] <= lim)
            u = fa[u][k];
    return u;
}

bool check(long long lim) {
    reserve.clear();
    mark_uncovered_subtrees();
    for (int army : pos) {
        int top = jump(army, lim);
        collect_state(army, top, lim);
    }
    sort(reserve.begin(), reserve.end());
    sort(need.begin(), need.end());
    return greedy_match(reserve, need);
}
```

### 复杂度

预处理倍增时间复杂度 $O(n \log n)$，单次 `check` 约为 $O((n+m)\log n)$。

# 七、高精度与基础实现

最后收一组实现题：高精度加减乘除本身并不难，但很适合作为基础算法细节训练。

## 88. [P1480 A/B Problem（高精度除法Ⅰ）](https://www.luogu.com.cn/problem/P1480)

`高精度` `除法`

### 题意

给定两个很大的整数 `a,b`，要求输出它们的商。

### 分析

这是最标准的高精度除法模板。做法和手算长除法一致：从高位到低位维护当前余数 `rem`，每读入一位就尝试整除 `b`，得到当前商位。

关键细节有两个：一是前导零不能直接输出；二是如果最后一位都没产生有效商位，答案应当是 `0`。

### 核心代码

```cpp
string divmod(string a, int b) {
    string q;
    long long rem = 0;
    for (char c : a) {
        rem = rem * 10 + (c - '0');
        if (!q.empty() || rem / b) q.push_back(char(rem / b + '0'));
        rem %= b;
    }
    return q.empty() ? "0" : q;
}
```

### 复杂度

时间复杂度 $O(n)$，空间复杂度 $O(n)$。

---

## 89. [P2005 A/B Problem II](https://www.luogu.com.cn/problem/P2005)

`高精度` `整除`

### 题意

给定正整数 `N,M`，要求计算 $\lfloor M/N \rfloor$。

### 分析

本质仍然是高精度除法。若除数可以放进普通整型，就直接沿用长除法模板；如果两者都很大，则要先写高精度比较与高精度减法，再做按位试商。

在基础算法专题里，这题最值得记住的是“高精度除法不需要真的存二维过程”，只要顺着字符串扫一遍即可。

### 核心代码

```cpp
string div_string_int(const string& s, int d) {
    string q;
    long long rem = 0;
    for (char c : s) {
        rem = rem * 10 + (c - '0');
        if (!q.empty() || rem / d) q.push_back(char(rem / d + '0'));
        rem %= d;
    }
    return q.empty() ? "0" : q;
}
```

### 复杂度

时间复杂度 $O(n)$，空间复杂度 $O(n)$。

---

## 90. [P1932 A+B A-B A*B A/B A%B Problem](https://www.luogu.com.cn/problem/P1932)

`高精度` `综合运算`

### 题意

给定两个整数 `A,B`，要求输出它们的和、差、积、商和余数。

### 分析

这题本质是高精度四则运算的综合练习。实现时通常把正负号单独拆开，核心部分只处理绝对值的加减乘除。

比较麻烦的是减法与取模：减法要先比较大小再决定结果符号，除法和取模则可以在长除法过程中同时得到商和余数。

### 核心代码

```cpp
string add_abs(string a, string b);
string sub_abs(string a, string b);
string mul_abs(string a, string b);
pair<string, string> div_abs(string a, int b);

// 先拆符号，再按绝对值调用：
// 加法：同号做加法，异号转减法
// 减法：转成 a + (-b)
// 乘法：结果符号取异或
// 除法 / 取模：长除法同时返回商和余数
```

### 复杂度

加减法时间复杂度 $O(n)$，乘法 $O(nm)$，除法 $O(n)$。

---

## 91. [P1303 A*B Problem](https://www.luogu.com.cn/problem/P1303)

`高精度` `乘法`

### 题意

给定两个非负整数，要求输出它们的乘积。

### 分析

直接模拟竖式乘法即可：令 `c[i+j] += a[i] * b[j]`，最后统一处理进位。因为这里只是基础高精度，不需要 FFT 或 Karatsuba 之类的高级做法。

实现时通常把字符串倒序存进数组，便于从低位开始相乘。

### 核心代码

```cpp
string mul(string a, string b) {
    reverse(a.begin(), a.end());
    reverse(b.begin(), b.end());
    vector<int> c(a.size() + b.size() + 1, 0);
    for (int i = 0; i < (int)a.size(); i++)
        for (int j = 0; j < (int)b.size(); j++)
            c[i + j] += (a[i] - '0') * (b[j] - '0');
    for (int i = 0; i + 1 < (int)c.size(); i++) c[i + 1] += c[i] / 10, c[i] %= 10;
    while (c.size() > 1 && c.back() == 0) c.pop_back();
    string s;
    for (int i = (int)c.size() - 1; i >= 0; i--) s.push_back(char(c[i] + '0'));
    return s;
}
```

### 复杂度

时间复杂度 $O(nm)$，空间复杂度 $O(n+m)$。

---

## 92. [P2142 高精度减法](https://www.luogu.com.cn/problem/P2142)

`高精度` `减法`

### 题意

给定两个正整数 `a,b`，求 `a-b` 的值。

### 分析

高精度减法的核心是“先比较大小，再决定符号”。确定较大者减较小者后，逐位相减并处理借位即可。

最后别忘了去掉前导零。如果原本 `a < b`，就在结果前补一个负号。

### 核心代码

```cpp
string sub_abs(string a, string b) {
    reverse(a.begin(), a.end());
    reverse(b.begin(), b.end());
    vector<int> c(a.size(), 0);
    for (int i = 0; i < (int)a.size(); i++) {
        c[i] = a[i] - '0' - (i < (int)b.size() ? b[i] - '0' : 0);
        if (c[i] < 0) c[i] += 10, a[i + 1]--;
    }
    while (c.size() > 1 && c.back() == 0) c.pop_back();
    string s;
    for (int i = (int)c.size() - 1; i >= 0; i--) s.push_back(char(c[i] + '0'));
    return s;
}
```

### 复杂度

时间复杂度 $O(n)$，空间复杂度 $O(n)$。

---

## 93. [P1601 高精度加法](https://www.luogu.com.cn/problem/P1601)

`高精度` `加法`

### 题意

给定两个非负整数 `a,b`，求它们的和。

### 分析

这是高精度最基础的模板题。把两个数倒序后逐位相加，维护进位即可。

它虽然简单，但几乎是所有高精度题的起点：只有把加法、借位和进位写顺了，后面的减法、乘法和除法才容易不出错。

### 核心代码

```cpp
string add(string a, string b) {
    reverse(a.begin(), a.end());
    reverse(b.begin(), b.end());
    vector<int> c(max(a.size(), b.size()) + 1, 0);
    for (int i = 0; i < (int)c.size() - 1; i++) {
        if (i < (int)a.size()) c[i] += a[i] - '0';
        if (i < (int)b.size()) c[i] += b[i] - '0';
        c[i + 1] += c[i] / 10;
        c[i] %= 10;
    }
    if (c.back() == 0) c.pop_back();
    string s;
    for (int i = (int)c.size() - 1; i >= 0; i--) s.push_back(char(c[i] + '0'));
    return s;
}
```

### 复杂度

时间复杂度 $O(n)$，空间复杂度 $O(n)$。
