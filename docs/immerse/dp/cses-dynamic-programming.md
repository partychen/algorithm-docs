---
title: "CSES 动态规划专题精选解题报告"
subtitle: "🧩 从线性转移到状压、轮廓与数位限制的 DP 主线"
order: 2
icon: "🪜"
---

# CSES 动态规划专题精选解题报告

这一组题从掷骰子、背包计数一路推到区间博弈、轮廓转移、数位限制与数据结构优化，表面模型差异很大，但真正稳定的主线始终是：先把“最后一步”或“当前边界”抽成状态，再判断转移是局部枚举、区间决策，还是需要借助单调结构、树状数组与位掩码来压缩复杂度。

# 一、线性转移与背包原型

这一章先把最常见的一维 DP 手感搭起来：有的题按最后一步分类，有的题按“是否选当前物品”推进，区别往往不在公式本身，而在循环顺序到底是在保留顺序、去重组合，还是在维护最优值。

## 1. [Dice Combinations](https://cses.fi/problemset/task/1633)

`线性 DP` `计数`

### 题意

不断掷出 $1$ 到 $6$ 的点数，要求总和恰好为 $n$，求所有可行序列的数量，答案对 $10^9+7$ 取模。

### 分析

这题最自然的切法就是看“最后一次掷出了几点”。如果最后一步是 $d$，那前面必须已经凑出了 $n-d$，于是每个状态都只会从前面最多 $6$ 个位置转移过来。

因此令 `dp[s]` 表示和为 $s$ 的方案数，转移就是把 `dp[s-1]` 到 `dp[s-6]` 中合法的项加起来。它本质上是一个固定窗口的一维计数 DP，和爬楼梯题只有步长集合不同。

这题最值得迁移的是识别方式：只要答案真的只和“最后一步走了多少”有关，而且前面的顺序已经被状态完整概括，就应该优先尝试这种一维前缀型 DP，而不是把整条过程重新展开。

### 核心代码

```cpp
const int MOD = 1000000007;
vector<int> dp(n + 1, 0);
dp[0] = 1;
for (int s = 1; s <= n; ++s) {
    for (int d = 1; d <= 6 && d <= s; ++d) {
        dp[s] = (dp[s] + dp[s - d]) % MOD;
    }
}
int ans = dp[n];
```

### 复杂度

时间复杂度 $O(6n)$，空间复杂度 $O(n)$。

---

## 2. [Minimizing Coins](https://cses.fi/problemset/task/1634)

`完全背包` `最少硬币`

### 题意

给定 $n$ 种硬币面值，每种硬币可以使用任意次，要求凑出总和 $x$ 所需的最少硬币数；若无法凑出则输出 $-1$。

### 分析

这里问的是最小值而不是方案数，所以状态里要存“最优答案”。设 `dp[s]` 表示凑出和为 $s$ 的最少硬币数，那么最后放入一枚面值为 $c$ 的硬币后，问题就回到 `dp[s-c]`。

由于每种硬币都能重复使用，转移时不需要区分第几枚硬币，只需在每个总和上枚举最后一枚的面值即可。唯一要小心的是不可达状态，不能直接参与取最小值。

### 核心代码

```cpp
const int INF = 1e9;
vector<int> dp(x + 1, INF);
dp[0] = 0;
for (int s = 1; s <= x; ++s) {
    for (int c : coin) {
        if (c <= s && dp[s - c] != INF) {
            dp[s] = min(dp[s], dp[s - c] + 1);
        }
    }
}
int ans = (dp[x] == INF ? -1 : dp[x]);
```

### 复杂度

时间复杂度 $O(nx)$，空间复杂度 $O(x)$。

---

## 3. [Coin Combinations I](https://cses.fi/problemset/task/1635)

`完全背包` `有序计数`

### 题意

给定若干种硬币面值，每种面值可无限使用，要求统计凑出总和 $x$ 的方案数；从样例可见，不同的取币顺序算作不同方案。

### 分析

这题和掷骰子题几乎同构，只是可走的“步长集合”从固定的 $1$ 到 $6$ 变成了给定面值。若最后一枚硬币取的是 $c$，前面就必须先凑出 $s-c$，因此 `dp[s]` 可以从所有 `dp[s-c]` 累加得到。

关键在循环顺序：这里顺序要计入答案，所以外层必须枚举当前总和，内层再枚举最后一枚硬币。这样 `dp[s]` 会把所有不同的末尾选择都统计进去，本质上就是“每一步都允许重新选择任意一种硬币作为结尾”。

### 核心代码

```cpp
const int MOD = 1000000007;
vector<int> dp(x + 1, 0);
dp[0] = 1;
for (int s = 1; s <= x; ++s) {
    for (int c : coin) {
        if (c <= s) dp[s] = (dp[s] + dp[s - c]) % MOD;
    }
}
int ans = dp[x];
```

### 复杂度

时间复杂度 $O(nx)$，空间复杂度 $O(x)$。

---

## 4. [Coin Combinations II](https://cses.fi/problemset/task/1636)

`完全背包` `无序计数`

### 题意

给定若干种硬币面值，每种面值可无限使用，要求统计凑出总和 $x$ 的方案数；从样例可见，只按选出的硬币多重集合计数，顺序不同不重复计算。

### 分析

这题和上一题的差别只在“顺序是否算不同”，但循环顺序会完全改变含义。若先枚举硬币，再从小到大更新总和，那么每种组合都会按“最后一次引入某种面值”的时刻恰好统计一次，不会因为排列顺序反复出现。

因此仍然是完全背包计数，只是状态语义变成：处理到当前这几种硬币时，凑出和为 $s$ 的组合数。这个去重方式本质上是把每个组合强制按面值出现顺序生成。

把这一题和上一题并排看，会更容易记住循环顺序的意义：若外层是总和，内层是硬币，那么“最后一步是谁”会被完整区分，得到的是排列数；若外层是硬币，内层是总和，那么每种面值只会在它首次被纳入时贡献一次，得到的就是组合数。

### 核心代码

```cpp
const int MOD = 1000000007;
vector<int> dp(x + 1, 0);
dp[0] = 1;
for (int c : coin) {
    for (int s = c; s <= x; ++s) {
        dp[s] = (dp[s] + dp[s - c]) % MOD;
    }
}
int ans = dp[x];
```

### 复杂度

时间复杂度 $O(nx)$，空间复杂度 $O(x)$。

---

## 5. [Removing Digits](https://cses.fi/problemset/task/1637)

`数位拆分` `最短步数`

### 题意

给定一个整数 $n$。每一步可以从当前数中选择一个数字并减去它，要求最少经过多少步把这个数变成 $0$。

### 分析

每次操作都会把当前值减小，所以天然可以按数值从小到大做 DP。设 `dp[i]` 表示把 $i$ 变成 $0$ 的最少步数，那么最后一步若减去的是当前十进制表示中的某个数字 $d$，就有 `dp[i] = dp[i-d] + 1`。

这题看起来也可以建图做 BFS，但由于操作一定让数值单调减小，状态之间天然已经按拓扑顺序排好了，所以直接线性 DP 更干净。真正的难点不在状态，而在转移集合是“$i$ 自己的十进制数字”，因此每个状态都要把当前数拆位，枚举所有非零数字去更新最优值。

这类题的共性也值得记住：只要操作会让某个数值指标严格下降，且每个状态的后继数量不多，很多“最短步数”问题都能直接改写成一维 DP。

### 核心代码

```cpp
const int INF = 1e9;
vector<int> dp(n + 1, INF);
dp[0] = 0;
for (int i = 1; i <= n; ++i) {
    for (int x = i; x > 0; x /= 10) {
        int d = x % 10;
        if (d != 0) dp[i] = min(dp[i], dp[i - d] + 1);
    }
}
int ans = dp[n];
```

### 复杂度

时间复杂度 $O(n\log_{10} n)$，空间复杂度 $O(n)$。

---

## 6. [Book Shop](https://cses.fi/problemset/task/1158)

`0/1 背包` `价值最大化`

### 题意

有 $n$ 本书，每本书有价格和页数，每本最多买一次。在总花费不超过 $x$ 的前提下，求最多能买到多少页。

### 分析

这是最标准的 0/1 背包：每本书只有“买”或“不买”两种选择。令 `dp[c]` 表示总花费不超过 $c$ 时能得到的最大页数，那么处理一本价格为 `h[i]`、页数为 `s[i]` 的书时，只需考虑是否用它去更新 `dp[c]`。

因为每本书最多选一次，容量必须倒序枚举。这样 `dp[c-h[i]]` 仍然是上一轮的状态，不会把同一本书重复算进来。

### 核心代码

```cpp
vector<int> dp(x + 1, 0);
for (int i = 0; i < n; ++i) {
    for (int c = x; c >= price[i]; --c) {
        dp[c] = max(dp[c], dp[c - price[i]] + pages[i]);
    }
}
int ans = dp[x];
```

### 复杂度

时间复杂度 $O(nx)$，空间复杂度 $O(x)$。

---

## 7. [Money Sums](https://cses.fi/problemset/task/1745)

`0/1 背包` `可达性`

### 题意

给定 $n$ 枚硬币，每枚硬币只能使用一次。要求求出所有能够凑出的正整数和。

### 分析

这题不是求最值，也不是求方案数，而是求“哪些和可达”。设 `can[s]` 表示是否能凑出和为 $s$，那么加入一枚面值为 $v$ 的硬币后，所有原本可达的和都会把 `s+v` 也激活。

由于总和上界只有 $10^5$，直接做布尔 0/1 背包就够了；写成位集更直观：整体左移 `v` 位，就等价于把“选这枚硬币”造成的新可达状态一次性并进来。

### 核心代码

```cpp
const int MAXS = 100000;
bitset<MAXS + 1> can;
can[0] = 1;
for (int v : coin) {
    can |= (can << v);
}
vector<int> ans;
for (int s = 1; s <= MAXS; ++s) if (can[s]) ans.push_back(s);
```

### 复杂度

时间复杂度约为 $O(n \cdot \frac{S}{w})$，空间复杂度 $O(S)$，其中 $S$ 是总和上界。

---

## 8. [Two Sets II](https://cses.fi/problemset/task/1093)

`子集和 DP` `等和划分`

### 题意

把数字 $1,2,\dots,n$ 划分成两个和相等的集合，要求统计不同划分方案数，答案对 $10^9+7$ 取模。

### 分析

总和是 $\frac{n(n+1)}{2}$，若它为奇数就不可能平分。若总和为偶数，问题等价于从这些数里选出一个子集，使它的和恰好是一半。

直接统计所有子集会把一组划分算两次，因为选中集合和未选集合互为补集。这里更稳的写法是只考虑数字 $1$ 到 $n-1$，把数字 $n$ 固定留在另一边；这样每种合法划分只会对应一个子集，不必额外做“除以 $2$”。

### 核心代码

```cpp
const int MOD = 1000000007;
long long sum = 1LL * n * (n + 1) / 2;
if (sum & 1) ans = 0;
else {
    int target = sum / 2;
    vector<int> dp(target + 1, 0);
    dp[0] = 1;
    for (int x = 1; x < n; ++x) {
        for (int s = target; s >= x; --s) {
            dp[s] = (dp[s] + dp[s - x]) % MOD;
        }
    }
    ans = dp[target];
}
```

### 复杂度

时间复杂度 $O(n^3)$ 中的常数被压成了 $O(n\cdot \frac{n^2}{4})$，更准确地说是 $O(n\cdot target)$，空间复杂度 $O(target)$。

---

# 二、网格、双串与区间状态

进入这一章后，状态不再只靠一个数字描述。你会看到坐标、末尾取值、双串前缀和区间边界都开始进入状态定义，而难点也从“会不会写公式”转向“状态是否恰好覆盖了未来决策所需的信息”。

## 9. [Grid Paths I](https://cses.fi/problemset/task/1638)

`网格 DP` `路径计数`

### 题意

给定一个带障碍的 $n \times n$ 网格，只能向右或向下走。要求统计从左上角走到右下角的路径数，答案对 $10^9+7$ 取模。

### 分析

由于移动方向只有右和下，走到某个格子的最后一步只可能来自上方或左方，所以这是最直接的二维路径计数。若某格是陷阱，它的方案数就必须为 $0$。

障碍格可以理解成把这个状态从 DP 图里直接删掉，因此它既不能接收贡献，也不能继续向后转移。这样一来，这题真正应该形成的网格 DP 直觉就是：固定方向移动时，当前格答案只由所有合法前驱直接汇总。

写成一维滚动数组尤其顺手：按行扫描时，`dp[j]` 先承接“从上面走来”的旧值，再加上 `dp[j-1]` 这个“从左边走来”的新值，就等价于二维表里的标准转移。

### 核心代码

```cpp
const int MOD = 1000000007;
vector<int> dp(n, 0);
if (grid[0][0] == '.') dp[0] = 1;
for (int i = 0; i < n; ++i) {
    for (int j = 0; j < n; ++j) {
        if (grid[i][j] == '*') dp[j] = 0;
        else if (j > 0) dp[j] = (dp[j] + dp[j - 1]) % MOD;
    }
}
int ans = dp[n - 1];
```

### 复杂度

时间复杂度 $O(n^2)$，空间复杂度 $O(n)$。

---

## 10. [Array Description](https://cses.fi/problemset/task/1746)

`序列 DP` `邻接约束`

### 题意

数组长度为 $n$，每个位置的值在 $1$ 到 $m$ 之间，且相邻元素差的绝对值至多为 $1$。给定部分位置的固定值和若干个未知位置，要求统计满足条件的完整数组数量。

### 分析

相邻位置只和前一个数值有关，所以状态应当保留“前一位取了什么”。设 `dp[v]` 表示处理到当前位置时，且当前位置取值为 $v$ 的方案数，那么下一位只会从 $v-1,v,v+1$ 这三种前驱转移过来。

这题真正的限制来自题面中的部分固定值。若当前位置已经给定为某个数，只更新这一列；若是未知位，则把 $1$ 到 $m$ 全部枚举一遍。因为每层只依赖上一层，所以直接滚动数组即可。

### 核心代码

```cpp
const int MOD = 1000000007;
vector<int> dp(m + 2, 0), ndp(m + 2, 0);
if (a[0] == 0) for (int v = 1; v <= m; ++v) dp[v] = 1;
else dp[a[0]] = 1;
for (int i = 1; i < n; ++i) {
    fill(ndp.begin(), ndp.end(), 0);
    for (int v = 1; v <= m; ++v) {
        if (a[i] != 0 && a[i] != v) continue;
        ndp[v] = ((dp[v - 1] + dp[v]) % MOD + dp[v + 1]) % MOD;
    }
    dp.swap(ndp);
}
int ans = accumulate(dp.begin(), dp.end(), 0LL) % MOD;
```

### 复杂度

时间复杂度 $O(nm)$，空间复杂度 $O(m)$。

---

## 11. [Edit Distance](https://cses.fi/problemset/task/1639)

`双串 DP` `编辑距离`

### 题意

给定两个字符串，允许执行插入、删除、替换三种操作，求把第一个字符串变成第二个字符串所需的最少操作数。

### 分析

经典切法是按两个前缀来定义状态。设 `dp[i][j]` 表示把第一个串前 $i$ 个字符变成第二个串前 $j$ 个字符的最少操作数，那么最后一步只可能是删除 `a[i]`、插入 `b[j]`，或把 `a[i]` 替换成 `b[j]`。

若 `a[i] == b[j]`，最后一个字符可以不花代价直接对齐，问题退化成 `dp[i-1][j-1]`；否则就在三种操作里取最小值再加一。这题的难点不在实现，而在把三种操作完整且不重不漏地写进转移。

### 核心代码

```cpp
vector<vector<int>> dp(n + 1, vector<int>(m + 1, 0));
for (int i = 0; i <= n; ++i) dp[i][0] = i;
for (int j = 0; j <= m; ++j) dp[0][j] = j;
for (int i = 1; i <= n; ++i) {
    for (int j = 1; j <= m; ++j) {
        dp[i][j] = min(dp[i - 1][j], dp[i][j - 1]) + 1;
        dp[i][j] = min(dp[i][j], dp[i - 1][j - 1] + (s[i - 1] != t[j - 1]));
    }
}
int ans = dp[n][m];
```

### 复杂度

时间复杂度 $O(nm)$，空间复杂度 $O(nm)$。

---

## 12. [Longest Common Subsequence](https://cses.fi/problemset/task/3403)

`双串 DP` `路径还原`

### 题意

给定两个整数数组，要求求出它们的最长公共子序列长度，并输出任意一个这样的公共子序列。

### 分析

LCS 的核心仍是前缀 DP。设 `dp[i][j]` 表示第一个数组前 $i$ 个数与第二个数组前 $j$ 个数的最长公共子序列长度。如果 `a[i] == b[j]`，那这个元素就可以同时作为两个前缀的结尾，长度来自 `dp[i-1][j-1] + 1`；否则只能丢掉其中一边的末尾，在 `dp[i-1][j]` 和 `dp[i][j-1]` 里取更大者。

因为题目还要求输出一组方案，所以长度表建完后还要从右下角反推。若当前两个元素相等，就把它放进答案并同时左上走；否则沿着没有降值的方向回退。

### 核心代码

```cpp
vector<vector<int>> dp(n + 1, vector<int>(m + 1, 0));
for (int i = 1; i <= n; ++i) {
    for (int j = 1; j <= m; ++j) {
        if (a[i - 1] == b[j - 1]) dp[i][j] = dp[i - 1][j - 1] + 1;
        else dp[i][j] = max(dp[i - 1][j], dp[i][j - 1]);
    }
}
vector<int> seq;
for (int i = n, j = m; i > 0 && j > 0; ) {
    if (a[i - 1] == b[j - 1]) seq.push_back(a[--i]), --j;
    else if (dp[i - 1][j] >= dp[i][j - 1]) --i;
    else --j;
}
reverse(seq.begin(), seq.end());
```

### 复杂度

时间复杂度 $O(nm)$，空间复杂度 $O(nm)$。

---

## 13. [Rectangle Cutting](https://cses.fi/problemset/task/1744)

`区间划分` `二维 DP`

### 题意

给定一个 $a \times b$ 的矩形，每次可以沿整数边界把某个矩形切成两个更小的矩形。要求最少切多少次才能把它完全切成若干个正方形。

### 分析

只要当前矩形不是正方形，就必须做第一刀，而第一刀要么横切，要么竖切。于是设 `dp[x][y]` 表示把 $x \times y$ 矩形切成正方形的最少次数，枚举第一刀的位置即可。

这题的关键是把“切割顺序很复杂”压成“第一刀分治”。因为切完之后两个子问题完全独立，所以总次数就是左右两块答案之和再加这一刀本身。

它也给了二维区间 DP 一个很典型的识别信号：当前图形一旦能被一刀拆成两个同类子图形，就往往可以把“最后一刀”或“第一刀”当作决策点，枚举切割线完成转移。

### 核心代码

```cpp
const int INF = 1e9;
vector<vector<int>> dp(a + 1, vector<int>(b + 1, INF));
for (int x = 1; x <= a; ++x) {
    for (int y = 1; y <= b; ++y) {
        if (x == y) dp[x][y] = 0;
        else {
            for (int k = 1; k < x; ++k) dp[x][y] = min(dp[x][y], dp[k][y] + dp[x - k][y] + 1);
            for (int k = 1; k < y; ++k) dp[x][y] = min(dp[x][y], dp[x][k] + dp[x][y - k] + 1);
        }
    }
}
int ans = dp[a][b];
```

### 复杂度

时间复杂度 $O(ab(a+b))$，空间复杂度 $O(ab)$。

---

## 14. [Minimal Grid Path](https://cses.fi/problemset/task/3359)

`字典序 DP` `前沿筛选`

### 题意

给定一个字符网格，从左上角走到右下角，只能向右或向下移动。要求输出路径上字符拼成的字典序最小字符串。

### 分析

如果直接对每个格子维护一整条最优字符串，状态会非常重。更好的观察是：走到同一条反对角线上的所有位置时，前缀长度相同，真正重要的是“这一层能保住全局最小前缀的哪些位置”。

因此可以逐层推进。当前前沿上的所有位置各自向右或向下扩展，先找出下一层能达到的最小字符 `best`，再只保留字符等于 `best` 的那些位置进入下一轮。这样每一层都只维护“最优前缀仍然可能停留的格子集合”，最后拼出的就是全局字典序最小路径串。

### 核心代码

```cpp
string ans(1, grid[0][0]);
vector<pair<int, int>> cur{{0, 0}}, nxt;
vector<vector<int>> seen(n, vector<int>(n, -1));
for (int step = 1; step < 2 * n - 1; ++step) {
    char best = 'Z';
    for (auto [x, y] : cur) {
        if (x + 1 < n) best = min(best, grid[x + 1][y]);
        if (y + 1 < n) best = min(best, grid[x][y + 1]);
    }
    nxt.clear();
    auto push = [&](int x, int y) {
        if (x < n && y < n && grid[x][y] == best && seen[x][y] != step) {
            seen[x][y] = step;
            nxt.push_back({x, y});
        }
    };
    for (auto [x, y] : cur) {
        push(x + 1, y);
        push(x, y + 1);
    }
    ans.push_back(best);
    cur.swap(nxt);
}
```

### 复杂度

时间复杂度 $O(n^2)$，空间复杂度 $O(n^2)$。

---

## 15. [Removal Game](https://cses.fi/problemset/task/1097)

`区间 DP` `博弈`

### 题意

有一个数字序列，两名玩家轮流从序列两端取数，双方都希望自己的总得分最大。要求求出先手最终能够得到的最大分数。

### 分析

这类双人最优博弈，直接维护“先手能拿多少分”常常不如维护“当前玩家相对对手能领先多少”。设 `dp[l][r]` 表示面对区间 $[l,r]$ 时，轮到当前玩家操作，他最终能比对手多拿多少分。

若当前玩家取左端 `a[l]`，接下来对手在区间 $[l+1,r]$ 中会获得 `dp[l+1][r]` 的领先优势，所以当前局面的净收益是 `a[l] - dp[l+1][r]`；取右端同理。这样区间 DP 直接写成取两者最大值，最后再用总和把“净胜分”还原成先手总分。

### 核心代码

```cpp
vector<vector<long long>> dp(n, vector<long long>(n, 0));
for (int i = 0; i < n; ++i) dp[i][i] = a[i];
for (int len = 2; len <= n; ++len) {
    for (int l = 0; l + len - 1 < n; ++l) {
        int r = l + len - 1;
        dp[l][r] = max(a[l] - dp[l + 1][r], a[r] - dp[l][r - 1]);
    }
}
long long sum = accumulate(a.begin(), a.end(), 0LL);
long long ans = (sum + dp[0][n - 1]) / 2;
```

### 复杂度

时间复杂度 $O(n^2)$，空间复杂度 $O(n^2)$。

---

# 三、结构化状态与数据结构优化

从这里开始，光有朴素状态已经不够了。你会看到有些题先把庞大的摆放情况压成两个小轮廓，有些题要把 DP 转移改写成二分、树状数组、线段树或单调栈上的查询，本质都是在为“大状态空间”寻找更紧凑的表示。

## 16. [Counting Towers](https://cses.fi/problemset/task/2413)

`小状态 DP` `递推`

### 题意

构造宽度固定为 $2$、高度为 $n$ 的塔，允许使用长宽都是整数的矩形块。问一共有多少种不同的搭法，答案对 $10^9+7$ 取模。

### 分析

宽度只有 $2$，真正影响后续拼法的不是整座塔的具体切分，而是顶端轮廓长成哪一类。把高度从下往上推进后，顶端实际上只需要区分两种状态：两列齐平，以及顶端存在一个跨列的连接结构。

设 `same[i]` 和 `cross[i]` 分别表示高度为 $i$ 时这两类轮廓的方案数。把第 $i$ 层能补上的几种块形逐一枚举后，就会得到固定递推：齐平状态既能由前一层齐平扩展，也能由连通状态收口；连通状态也只会从这两类轮廓演化而来。

### 核心代码

```cpp
const int MOD = 1000000007;
vector<long long> same(maxN + 1), cross(maxN + 1);
same[1] = cross[1] = 1;
for (int i = 2; i <= maxN; ++i) {
    same[i] = (4 * same[i - 1] + cross[i - 1]) % MOD;
    cross[i] = (same[i - 1] + 2 * cross[i - 1]) % MOD;
}
long long ans = (same[n] + cross[n]) % MOD;
```

### 复杂度

预处理时间复杂度 $O(maxN)$，单次查询 $O(1)$，空间复杂度 $O(maxN)$。

---

## 17. [Increasing Subsequence](https://cses.fi/problemset/task/1145)

`LIS` `贪心`

### 题意

给定一个整数数组，求最长严格上升子序列的长度。

### 分析

朴素 DP 会写成 `dp[i]` 表示以 `a[i]` 结尾的 LIS 长度，但在 $n$ 达到 $2\cdot 10^5$ 时，$O(n^2)$ 已经不够。这里要换一个维护方式：记录每个长度的上升子序列所能取得的最小结尾值。

数组 `tail[len]` 越小，后面就越容易接新元素，因此每读到一个数 `x`，就在 `tail` 里找第一个大于等于 `x` 的位置替换。替换不会破坏已有长度，却能让这一长度的结尾尽量小，最终 `tail` 的长度就是答案。

### 核心代码

```cpp
vector<int> tail;
for (int x : a) {
    auto it = lower_bound(tail.begin(), tail.end(), x);
    if (it == tail.end()) tail.push_back(x);
    else *it = x;
}
int ans = tail.size();
```

### 复杂度

时间复杂度 $O(n\log n)$，空间复杂度 $O(n)$。

---

## 18. [Projects](https://cses.fi/problemset/task/1140)

`加权区间 DP` `二分`

### 题意

有若干个项目，每个项目给出开始时间、结束时间和报酬。每天最多参与一个项目，要求最大化总报酬。

### 分析

这是典型的带权区间选择。把项目按结束时间排序后，设 `dp[i]` 表示前 $i$ 个项目中能获得的最大报酬。对于第 $i$ 个项目，只存在两种决策：不选它，答案就是 `dp[i-1]`；选它，就要接上最后一个结束时间严格早于它开始时间的项目。

因此关键步骤是给每个项目找到兼容前驱 `pre[i]`。排序后，这个前驱可以在结束时间数组里二分得到，于是整体就从“全局冲突”变成了单调序列上的一维 DP。换句话说，排序负责把冲突关系压成前缀，二分负责把“能接在哪”变成一次局部查询。

### 核心代码

```cpp
sort(p.begin(), p.end(), [](auto &a, auto &b) { return a.r < b.r; });
vector<long long> dp(n + 1, 0), ends;
for (auto &e : p) ends.push_back(e.r);
for (int i = 1; i <= n; ++i) {
    int j = upper_bound(ends.begin(), ends.end(), p[i - 1].l - 1) - ends.begin();
    dp[i] = max(dp[i - 1], dp[j] + p[i - 1].w);
}
long long ans = dp[n];
```

### 复杂度

时间复杂度 $O(n\log n)$，空间复杂度 $O(n)$。

---

## 19. [Mountain Range](https://cses.fi/problemset/task/3314)

`单调栈` `线段树优化`

### 题意

一排山峰各有高度。你可以从某座更高的山滑翔到一座更低的山，且中间山峰不能挡住这次下滑。要求求出最多能依次经过多少座山峰。

### 分析

设 `dp[i]` 表示以第 $i$ 座山为起点时，最多还能走出多长的路线。题目的几何限制决定了：从 `i` 出发，真正能直接到达的山峰恰好落在它左右两边、直到遇见第一座高度不低于 `h[i]` 的山为止。也就是说，只要先找出左右最近的“挡板”，可转移目标就变成两个连续区间上的最大值查询。

因此先用单调栈求出每个位置左侧和右侧第一座高度不低于它的山，得到可滑翔区间边界。再按高度从小到大分组处理，用线段树维护已经算好的较低山峰 `dp` 最大值，就能在 $O(\log n)$ 时间求出当前山能接到的最长后缀路线。相同高度不能互相转移，所以要整组算完后再统一写回。

### 核心代码

```cpp
build_nearest_ge(leftBound, rightBound);
sort(ord.begin(), ord.end(), [&](int i, int j) { return h[i] < h[j]; });
for (int l = 0; l < n; ) {
    int r = l;
    while (r < n && h[ord[r]] == h[ord[l]]) ++r;
    for (int k = l; k < r; ++k) {
        int i = ord[k];
        int best = max(seg.query(leftBound[i] + 1, i - 1), seg.query(i + 1, rightBound[i] - 1));
        dp[i] = best + 1;
    }
    for (int k = l; k < r; ++k) seg.update(ord[k], dp[ord[k]]);
    l = r;
}
int ans = *max_element(dp.begin(), dp.end());
```

### 复杂度

时间复杂度 $O(n\log n)$，空间复杂度 $O(n)$。

---

## 20. [Increasing Subsequence II](https://cses.fi/problemset/task/1748)

`树状数组` `计数 DP`

### 题意

给定一个整数数组，要求统计其中严格上升子序列的数量；即使数值序列相同，只要取的位置不同，也要分别计数。

### 分析

若设 `dp[i]` 表示以 `a[i]` 结尾的上升子序列数，那么它等于所有 `a[j] < a[i]` 的 `dp[j]` 之和，再加上只选自己这一种长度为 $1$ 的子序列。朴素枚举前驱是 $O(n^2)$，瓶颈就在“前面所有更小值的总和”这一步。

因为转移只跟值域前缀有关，可以先做坐标压缩，再用树状数组维护“值不超过某个排名时的方案数总和”。每读到一个数，就查询所有更小值的贡献，然后把当前结果加回自己的位置。

### 核心代码

```cpp
const int MOD = 1000000007;
compress(a);
Fenwick bit(m);
for (int x : a) {
    int id = rk[x];
    int cur = (bit.query(id - 1) + 1) % MOD;
    bit.add(id, cur);
}
int ans = bit.query(m);
```

### 复杂度

时间复杂度 $O(n\log n)$，空间复杂度 $O(n)$。

---

# 四、状态压缩、轮廓与数位边界

最后这一章的共同点是“状态已经不能再按自然下标展开”。有的题要把一群人是否已安排进电梯压成位掩码，有的题要维护整列砖块的占用轮廓，还有的题必须把十进制前缀、前导零和相邻数字关系一起塞进数位状态里。

## 21. [Elevator Rides](https://cses.fi/problemset/task/1653)

`状态压缩 DP` `子集`

### 题意

有 $n$ 个人，每个人有重量，电梯单次载重上限为 $x$。要求把所有人都送上去所需的最少乘坐次数。

### 分析

人数只有 $20$，非常适合把“哪些人已经安排完”压成一个位掩码。设 `dp[mask] = {rides, last}`，表示处理完集合 `mask` 后，最少需要多少趟电梯，以及最后一趟已经装了多重；比较时先比趟数，再比最后一趟重量。

枚举新加入的人 `i` 时，如果他还能塞进当前最后一趟，就增加 `last`；否则只能新开一趟。这个状态设计的关键是：除了已用趟数，未来决策只会关心“当前最后一趟还剩多少空间”，因此保留最后一趟载重就够了。

### 核心代码

```cpp
vector<pair<int, long long>> dp(1 << n, {n + 1, 0});
dp[0] = {1, 0};
for (int mask = 1; mask < (1 << n); ++mask) {
    for (int i = 0; i < n; ++i) if (mask >> i & 1) {
        auto cur = dp[mask ^ (1 << i)];
        if (cur.second + w[i] <= x) cur.second += w[i];
        else cur = {cur.first + 1, w[i]};
        dp[mask] = min(dp[mask], cur);
    }
}
int ans = dp[(1 << n) - 1].first;
```

### 复杂度

时间复杂度 $O(n2^n)$，空间复杂度 $O(2^n)$。

---

## 22. [Counting Tilings](https://cses.fi/problemset/task/2181)

`轮廓 DP` `插头状态`

### 题意

用 $1\times 2$ 和 $2\times 1$ 骨牌铺满一个 $n \times m$ 的网格，要求统计铺法数量，答案对 $10^9+7$ 取模。

### 分析

由于 $n \le 10$ 而 $m$ 很大，显然不能把整个网格当二维状态展开。更合适的做法是按列推进，只保留当前列哪些格子已经被前一列伸过来的横骨牌占掉，也就是一个 $n$ 位二进制轮廓。

对于固定的当前轮廓 `mask`，要在这一列里从上到下递归填空：若当前位置已占用，直接看下一行；若未占用，则要么放一块横骨牌，把对应行在下一列标记为已占；要么在本列竖着放一块骨牌，占掉当前行和下一行。这样就把“整张网格铺法”拆成了列间状态转移。

轮廓 DP 最难的地方通常不是写递归，而是先接受这样一种状态观：未来并不关心左边整片区域是怎么铺出来的，只关心当前分界线上还有哪些格子处于“已被横骨牌占掉”的状态。

### 核心代码

```cpp
const int MOD = 1000000007;
vector<int> dp(1 << n, 0), ndp(1 << n, 0);
function<void(int, int, int, int)> gen = [&](int row, int cur, int nxt, int ways) {
    if (row == n) { ndp[nxt] = (ndp[nxt] + ways) % MOD; return; }
    if (cur >> row & 1) { gen(row + 1, cur, nxt, ways); return; }
    gen(row + 1, cur | (1 << row), nxt | (1 << row), ways);
    if (row + 1 < n && !(cur >> (row + 1) & 1)) {
        gen(row + 2, cur | (1 << row) | (1 << (row + 1)), nxt, ways);
    }
};
dp[0] = 1;
for (int col = 0; col < m; ++col) {
    fill(ndp.begin(), ndp.end(), 0);
    for (int mask = 0; mask < (1 << n); ++mask) if (dp[mask]) gen(0, mask, 0, dp[mask]);
    dp.swap(ndp);
}
int ans = dp[0];
```

### 复杂度

时间复杂度约为 $O(m\cdot 2^n \cdot n)$，空间复杂度 $O(2^n)$。

---

## 23. [Counting Numbers](https://cses.fi/problemset/task/2220)

`数位 DP` `记忆化搜索`

### 题意

给定区间 $[a,b]$，要求统计其中相邻数字不相等的整数个数。

### 分析

区间计数的标准转化是先求 `solve(x)`：统计 $0$ 到 $x$ 中满足条件的数，然后答案就是 `solve(b) - solve(a-1)`。而 `solve(x)` 不能逐个枚举，必须按十进制位从高到低做数位 DP。

状态里至少要记住四件事：当前处理到哪一位、上一位填了什么、当前前缀是否仍与上界贴合，以及前面是否已经出现过非前导零数字。最后一项很关键，因为前导零阶段不应触发“相邻数字相等”的限制；只有真正开始构造数字后，才需要禁止下一位与上一位相同。

数位 DP 经常容易卡在“前导零到底算不算上一位”这种细节上。这里把“是否已经开始构造数字”单独拆出来后，状态语义就会稳定很多：未开始时可以连续填零，开始之后才真正受相邻限制约束。

### 核心代码

```cpp
long long memo[20][11][2];
bool vis[20][11][2];
long long dfs(int pos, int last, bool tight, bool started) {
    if (pos == len) return 1;
    if (!tight && vis[pos][last][started]) return memo[pos][last][started];
    int up = digits[pos] - '0';
    long long res = 0;
    for (int d = 0; d <= up; ++d) {
        bool ns = started || d != 0;
        if (started && ns && d == last) continue;
        res += dfs(pos + 1, ns ? d : 10, tight && d == up, ns);
    }
    if (!tight) vis[pos][last][started] = true, memo[pos][last][started] = res;
    return res;
}
long long ans = solve(b) - solve(a - 1);
```

### 复杂度

时间复杂度为位数状态数乘上枚举数字，即 $O(19\cdot 11\cdot 2\cdot 2\cdot 10)$，空间复杂度 $O(19\cdot 11\cdot 2\cdot 2)$。
