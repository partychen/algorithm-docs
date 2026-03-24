---
title: "Codeforces 经典 DP 解题报告"
subtitle: "⚡ 36 道 Codeforces 经典 DP 题目的分析方法、解题思路与核心代码"
order: 5
icon: "⚡"
---

# Codeforces 经典 DP 解题报告

> 来源：[Codeforces](https://codeforces.com/)
>
> 本报告针对 Codeforces 经典 DP 36 题，逐题给出**题意概述 → 分析方法 → 状态设计 → 转移方程 → 核心代码 → 复杂度**，最后做整体总结。

---

## 1. CF 455A - Boredom（线性 DP）

### 题意

给 $N$ 个整数，选一个数 $x$ 可获得 $x$ 分，但须删除所有 $x-1$ 和 $x+1$。求最大得分。

### 分析

统计每个值的总和，转化为"不相邻取数"问题（House Robber 模型）。

### 状态与转移

- **状态**：$dp[i]$ = 考虑值 $\le i$ 的最大得分
- **转移**：$dp[i] = \max(dp[i-1],\; dp[i-2] + i \cdot \text{cnt}[i])$

### 核心代码

```cpp
for (int i = 0; i < n; i++) cnt[a[i]]++;
dp[1] = cnt[1];
for (int i = 2; i <= MAXV; i++)
    dp[i] = max(dp[i-1], dp[i-2] + (long long)i * cnt[i]);
```

### 复杂度

$O(N + V)$，$V$ 为值域。

---

## 2. CF 466C - Number of Ways（前缀和）

### 题意

将长度 $N$ 的数组分成 3 段使每段和相等。求方案数。

### 分析

总和必须是 3 的倍数。令 $S = \text{sum}/3$，从左到右统计前缀和为 $S$ 的位置数，在前缀和为 $2S$ 时累加。

### 状态与转移

- 非典型 DP，前缀和 + 计数

### 核心代码

```cpp
long long total = 0;
for (int i = 0; i < n; i++) total += a[i];
if (total % 3 != 0) { puts("0"); return; }
long long target = total / 3, sum = 0, cnt = 0, ans = 0;
for (int i = 0; i < n - 1; i++) {
    sum += a[i];
    if (i > 0 && sum == 2 * target) ans += cnt;
    if (sum == target) cnt++;
}
```

### 复杂度

$O(N)$。

---

## 3. CF 1353E - K-periodic Garland（线性 DP）

### 题意

长度 $N$ 的 01 串，使其变为"$K$-周期"（所有 1 的位置间距都是 $K$ 的倍数）的最小翻转次数。

### 分析

将位置按 $\bmod K$ 分组，每组独立求最优的连续 1 段（类似最大子段和的变形）。

### 状态与转移

- 对每组（如位置 $r, r+K, r+2K, \ldots$），设 $dp[i]$ = 以第 $i$ 个位置结尾的最大"$1 \to 1$ 的净收益"
- 翻转代价：若原为 1 则收益 $+1$（不翻），原为 0 则代价 $-1$（需翻为 1）
- 最终答案 = 总 1 的个数 - 最大净收益

### 核心代码

```cpp
int ones = count(s.begin(), s.end(), '1');
int bestSave = 0;
for (int r = 0; r < k; r++) {
    int cur = 0;
    for (int i = r; i < n; i += k) {
        int val = (s[i] == '1') ? 1 : -1;
        cur = max(val, cur + val);
        bestSave = max(bestSave, cur);
    }
}
printf("%d\n", ones - bestSave);
```

### 复杂度

$O(N)$。

---

## 4. CF 189A - Cut Ribbon（完全背包变形）

### 题意

长度为 $N$ 的丝带，只能切成长度 $a$、$b$、$c$ 的段。求最大段数。

### 分析

完全背包，求最大"个数"。$dp[j]$ = 长度恰为 $j$ 时的最大段数。

### 状态与转移

- **状态**：$dp[j]$ = 长度恰为 $j$ 的最大段数
- **转移**：$dp[j] = \max(dp[j - a], dp[j - b], dp[j - c]) + 1$
- **初始**：$dp[0] = 0$，其余 $-\infty$

### 核心代码

```cpp
fill(dp, dp + N + 1, -1e9);
dp[0] = 0;
int cuts[] = {a, b, c};
for (int j = 1; j <= N; j++)
    for (int k = 0; k < 3; k++)
        if (j >= cuts[k] && dp[j - cuts[k]] >= 0)
            dp[j] = max(dp[j], dp[j - cuts[k]] + 1);
```

### 复杂度

$O(3N)$。

---

## 5. CF 1373D - Maximum Sum on Even Positions（分段 DP / 贪心）

### 题意

长度 $N$ 的数组，可以翻转一个连续子段。使偶数位的元素之和最大。

### 分析

翻转 $[l, r]$ 后，偶数位和奇数位的元素被交换。分两种情况讨论：$l$ 为偶数或 $l$ 为奇数，每种情况下求连续交换的最大收益（Kadane 变形）。

### 状态与转移

- 对相邻偶奇对 $(a[2i+1] - a[2i])$ 或 $(a[2i] - a[2i+1])$ 求最大子段和
- 两种情况取最大

### 核心代码

```cpp
long long base = 0;
for (int i = 0; i < n; i += 2) base += a[i];
long long best = 0;
// Case 1: l 为偶数，交换 (a[2i], a[2i+1]) 对
long long cur = 0;
for (int i = 0; i + 1 < n; i += 2) {
    cur += a[i+1] - a[i];
    cur = max(cur, 0LL);
    best = max(best, cur);
}
// Case 2: l 为奇数，交换 (a[2i+1], a[2i+2]) 对
cur = 0;
for (int i = 1; i + 1 < n; i += 2) {
    cur += a[i] - a[i+1];
    cur = max(cur, 0LL);
    best = max(best, cur);
}
printf("%lld\n", base + best);
```

### 复杂度

$O(N)$。

---

## 6. CF 1195C - Basketball Exercise（多状态线性 DP）

### 题意

两列各 $N$ 个球员（身高 $a_i, b_i$），交替从两列选人（不能连续从同一列选），可以跳过。求身高之和最大。

### 分析

类似"不相邻取数"的两列版本。$dp[i][0/1/2]$ 分别表示第 $i$ 个位置不选 / 选第一列 / 选第二列。

### 状态与转移

- **状态**：$dp[i][j]$，$j = 0$ 不选，$j = 1$ 选 $a_i$，$j = 2$ 选 $b_i$
- **转移**：
  - $dp[i][0] = \max(dp[i-1][0], dp[i-1][1], dp[i-1][2])$
  - $dp[i][1] = \max(dp[i-1][0], dp[i-1][2]) + a[i]$
  - $dp[i][2] = \max(dp[i-1][0], dp[i-1][1]) + b[i]$

### 核心代码

```cpp
for (int i = 1; i <= n; i++) {
    dp[i][0] = max({dp[i-1][0], dp[i-1][1], dp[i-1][2]});
    dp[i][1] = max(dp[i-1][0], dp[i-1][2]) + a[i];
    dp[i][2] = max(dp[i-1][0], dp[i-1][1]) + b[i];
}
```

### 复杂度

$O(N)$。

---

## 7. CF 1324E - Sleeping Schedule（线性 DP）

### 题意

$N$ 天，每天入睡要加 $a_i$ 小时，可选择提前 1 小时（减 1）或不提前。一天有 $H$ 小时。若入睡时刻 $\in [L, R]$ 则为"好"。求最多好天数。

### 分析

$dp[i][t]$ = 前 $i$ 天、当前时刻 $t$ 的最多好天数。第 $i$ 天可从 $t - a_i$ 或 $t - a_i + 1$ 转移。

### 状态与转移

- **状态**：$dp[i][t]$，$0 \le t < H$
- **转移**：$dp[i][t] = \max(dp[i-1][(t - a_i + H) \% H],\; dp[i-1][(t - a_i + 1 + H) \% H]) + \text{good}(t)$

### 核心代码

```cpp
memset(dp, -1, sizeof(dp));
dp[0][(a[1]) % H] = (L <= a[1] % H && a[1] % H <= R);
dp[0][(a[1] - 1 + H) % H] = (L <= (a[1]-1+H)%H && (a[1]-1+H)%H <= R);
for (int i = 2; i <= n; i++)
    for (int t = 0; t < H; t++) {
        int t1 = (t - a[i] + 100*H) % H;
        int t2 = (t - a[i] + 1 + 100*H) % H;
        int best = -1;
        if (dp[i-1][t1] >= 0) best = max(best, dp[i-1][t1]);
        if (dp[i-1][t2] >= 0) best = max(best, dp[i-1][t2]);
        if (best >= 0) dp[i][t] = best + (L <= t && t <= R);
    }
```

### 复杂度

$O(NH)$。

---

## 8. CF 1472E - Correct Placement（排序 + LIS 变形）

### 题意

$N$ 个人各有宽 $w_i$ 和高 $h_i$。人 $j$ 可站在人 $i$ 前面当且仅当 $w_j < w_i$ 且 $h_j < h_i$（或旋转 90°）。对每个人求一个可以站在他前面的人。

### 分析

将每人调整为 $(\min(w,h), \max(w,h))$，按第一维排序后在第二维找严格更小的。

### 状态与转移

- 排序后扫描，维护第二维最小值及其索引

### 核心代码

```cpp
for (int i = 0; i < n; i++) {
    if (a[i].first > a[i].second) swap(a[i].first, a[i].second);
}
sort by (first asc, second desc);
// 分组处理 first 相同的，在转移时取前一组的最优
int bestH = INF, bestIdx = -1;
for (int i = 0; i < n; ) {
    int j = i;
    while (j < n && a[j].first == a[i].first) j++;
    for (int k = i; k < j; k++)
        if (bestH < a[k].second) ans[a[k].id] = bestIdx;
    for (int k = i; k < j; k++)
        if (a[k].second < bestH) { bestH = a[k].second; bestIdx = a[k].id; }
    i = j;
}
```

### 复杂度

$O(N \log N)$。

---

## 9. CF 1077F - Pictures with Kittens（滑动窗口最大值 DP）

### 题意

$N$ 张图片，美丽值 $a_i$，恰好选 $x$ 张，且任意连续 $k$ 张中至少选一张。求最大美丽值之和。

### 分析

$dp[i][j]$ = 前 $i$ 张选了 $j$ 张、第 $i$ 张必选的最大和。转移时需要 $[i-k, i-1]$ 范围内 $dp[\cdot][j-1]$ 的最大值，用单调队列优化。

### 状态与转移

- **状态**：$dp[i][j]$ = 第 $j$ 张选的是第 $i$ 张时的最大和
- **转移**：$dp[i][j] = a[i] + \max_{i-k \le t < i} dp[t][j-1]$

### 核心代码

```cpp
for (int j = 1; j <= x; j++) {
    deque<int> dq;
    for (int i = 1; i <= n; i++) {
        while (!dq.empty() && dq.front() < i - k) dq.pop_front();
        if (i >= j) {
            while (!dq.empty() && dp[dq.back()][j-1] <= dp[i-1][j-1])
                dq.pop_back();
            dq.push_back(i - 1);
        }
        if (!dq.empty() && dp[dq.front()][j-1] > -INF)
            dp[i][j] = dp[dq.front()][j-1] + a[i];
    }
}
```

### 复杂度

$O(Nx)$。

---

## 10. CF 977F - Consecutive Subsequence（LIS 变形）

### 题意

给长度 $N$ 的数组，求最长子序列使得相邻元素差恰好为 1（严格连续递增）。

### 分析

用 map 维护以值 $v$ 结尾的最长连续递增子序列长度。

### 状态与转移

- **状态**：$dp[v]$ = 以值 $v$ 结尾的最长长度
- **转移**：$dp[a[i]] = dp[a[i] - 1] + 1$

### 核心代码

```cpp
map<int, int> dp;
int bestLen = 0, bestEnd = -1;
for (int i = 0; i < n; i++) {
    dp[a[i]] = dp[a[i] - 1] + 1;
    if (dp[a[i]] > bestLen) { bestLen = dp[a[i]]; bestEnd = a[i]; }
}
```

### 复杂度

$O(N \log N)$。

---

## 11. CF 1249E - By Elevator or Stairs?（多状态 DP）

### 题意

$N$ 层楼，从 1 层到 $N$ 层。楼梯耗时 $a_i$，电梯耗时 $b_i$。每次进入电梯需额外 $c$ 秒。求到每层的最短时间。

### 分析

$dp[i][0]$ = 到第 $i$ 层用楼梯的最短时间，$dp[i][1]$ = 用电梯的最短时间。

### 状态与转移

- $dp[i][0] = \min(dp[i-1][0] + a[i],\; dp[i-1][1] + a[i])$
- $dp[i][1] = \min(dp[i-1][0] + b[i] + c,\; dp[i-1][1] + b[i])$

### 核心代码

```cpp
dp[1][0] = 0; dp[1][1] = c;
for (int i = 2; i <= n; i++) {
    dp[i][0] = min(dp[i-1][0], dp[i-1][1]) + a[i-1];
    dp[i][1] = min(dp[i-1][0] + c, dp[i-1][1]) + b[i-1];
}
```

### 复杂度

$O(N)$。

---

## 12. CF 1066F - Yet another 2D Walking（排序 + DP）

### 题意

二维平面上 $N$ 个点，每个点有级别 $l_i$（对角线编号）。必须按级别不降的顺序访问。同级别内可任意排序。求最短切比雪夫距离路径。

### 分析

按级别分组，同级别内按某坐标排序。组间转移只需考虑上一组的首末元素和当前组的首末元素。

### 状态与转移

- 每组排序后只需考虑首尾两个极端点到下一组首尾的转移

### 核心代码

```cpp
// 按 level 分组，组内按 (x - y) 排序
// dp[0] = 到当前组首元素最短, dp[1] = 到末元素最短
for (each group) {
    sort group by (x - y);
    long long nd0 = min(dp[0] + dist(prev_first, cur_first),
                        dp[1] + dist(prev_last, cur_first));
    long long nd1 = min(dp[0] + dist(prev_first, cur_last),
                        dp[1] + dist(prev_last, cur_last));
    dp[0] = nd0; dp[1] = nd1;
}
```

### 复杂度

$O(N \log N)$。

---

## 13. CF 687C - The Values You Can Make（双维背包）

### 题意

$N$ 个硬币面值 $c_i$，从中选若干凑出 $k$。对每种凑法，选出的硬币再分成两组，其中一组的和为 $x$。求所有可能的 $x$。

### 分析

$dp[j][s]$ = 能否选出总和 $j$、其中一个子集和为 $s$ 的方案。

### 状态与转移

- **状态**：$dp[j][s]$ = bool
- **转移**：对每枚硬币 $c$，$dp[j][s] \mathrel{|}= dp[j - c][s - c]$（放入子集）或 $dp[j - c][s]$（不放入子集）

### 核心代码

```cpp
dp[0][0] = true;
for (int i = 0; i < n; i++)
    for (int j = k; j >= c[i]; j--)
        for (int s = j; s >= 0; s--) {
            if (s >= c[i] && dp[j - c[i]][s - c[i]]) dp[j][s] = true;
            if (dp[j - c[i]][s]) dp[j][s] = true;
        }
// 输出所有 s 使得 dp[k][s] = true
```

### 复杂度

$O(Nk^2)$。

---

## 14. CF 1105C - Ayoub and Lost Array（背包计数 DP）

### 题意

构造长度 $N$ 的数组，每个元素在 $[l_i, r_i]$ 范围内，要求所有元素之和是 3 的倍数。求方案数（模 $10^9 + 7$）。

### 分析

$dp[i][r]$ = 前 $i$ 个元素之和模 3 为 $r$ 的方案数。对每个位置统计 $[l_i, r_i]$ 中余数为 0/1/2 的数各有多少个。

### 状态与转移

- **状态**：$dp[i][r]$，$r \in \{0, 1, 2\}$
- **转移**：$dp[i][(r + k) \% 3] \mathrel{+}= dp[i-1][r] \times \text{cnt}_i[k]$
- **答案**：$dp[N][0]$

### 核心代码

```cpp
// cnt[k] = [l, r] 中模 3 余 k 的数的个数
auto count = [](long long l, long long r, int k) -> long long {
    auto f = [&](long long x, int k) { return x < 0 ? 0 : x / 3 + (x % 3 >= k ? 1 : 0); };
    return f(r, k) - f(l - 1, k);
};
dp[0][0] = 1;
for (int i = 1; i <= n; i++)
    for (int r = 0; r < 3; r++)
        for (int k = 0; k < 3; k++)
            dp[i][(r + k) % 3] = (dp[i][(r + k) % 3] + dp[i-1][r] % MOD * count(l[i], r_[i], k)) % MOD;
```

### 复杂度

$O(9N) = O(N)$。

---

## 15. CF 3B - Lorry（贪心/背包变形）

### 题意

卡车载重 $V$。有两种物品：重 1 和重 2。选物品使总重 $\le V$、总价值最大。

### 分析

将重 2 的物品按价值降序排列。枚举选几个重 2 的（$0 \sim \lfloor V/2 \rfloor$），剩余容量用重 1 的填充（也按价值降序）。

### 状态与转移

- 贪心枚举 + 前缀和

### 核心代码

```cpp
sort(type1.rbegin(), type1.rend());
sort(type2.rbegin(), type2.rend());
// 前缀和
for (int i = 0; i < type1.size(); i++) pre1[i+1] = pre1[i] + type1[i];
for (int i = 0; i < type2.size(); i++) pre2[i+1] = pre2[i] + type2[i];
long long ans = 0;
for (int t2 = 0; t2 <= min((long long)type2.size(), V/2); t2++) {
    int rem = V - 2 * t2;
    int t1 = min(rem, (int)type1.size());
    ans = max(ans, pre2[t2] + pre1[t1]);
}
```

### 复杂度

$O(N \log N)$。

---

## 16. CF 730J - Bottles（背包 DP）

### 题意

$N$ 个瓶子，当前水量 $a_i$、容量 $b_i$。将所有水集中到尽可能少的瓶子中。在瓶子数最少的前提下，最小化总倒水量。

### 分析

总水量 $S = \sum a_i$。选出最少的瓶子使容量和 $\ge S$。然后在这些瓶子中最大化已有水量（减少倒水量）。

### 状态与转移

- 按容量降序排序找最少瓶子数 $k$
- $dp[j]$ = 选 $k$ 个瓶子、容量和为 $j$ 时的最大已有水量

### 核心代码

```cpp
// 先确定最少瓶子数 k
sort(b desc); long long cap = 0;
for (k = 0; k < n; k++) { cap += b[k]; if (cap >= S) break; }
k++;
// 然后做 01 背包：从 n 个瓶子中选 k 个，容量和 >= S，最大化 sum(a)
// dp[j][cnt] 或用按容量降序 + 值为 a[i] 的背包
```

### 复杂度

$O(Nk \cdot \sum b)$ 或 $O(N^2)$ 取决于实现。

---

## 17. CF 543A - Writing Code（背包 DP）

### 题意

$N$ 个程序员写 $M$ 行代码，第 $i$ 个每行产生 $a_i$ 个 bug。总 bug $\le B$。求方案数（模 $10^9 + 7$）。

### 分析

完全背包（每个程序员可写多行）。$dp[j][b]$ = 写了 $j$ 行、$b$ 个 bug 的方案数。

### 状态与转移

- **状态**：$dp[j][b]$ = 写 $j$ 行、$b$ 个 bug 的方案数
- **转移**：$dp[j][b] \mathrel{+}= dp[j-1][b - a_i]$

### 核心代码

```cpp
dp[0][0] = 1;
for (int i = 0; i < n; i++)
    for (int j = 1; j <= m; j++)
        for (int b = a[i]; b <= B; b++)
            dp[j][b] = (dp[j][b] + dp[j-1][b - a[i]]) % MOD;
long long ans = 0;
for (int b = 0; b <= B; b++) ans = (ans + dp[m][b]) % MOD;
```

### 复杂度

$O(NMB)$。

---

## 18. CF 755F - PolandBall and Gifts（贪心 + DP）

### 题意

排列 $p$，$k$ 个人不带礼物。求最小和最大的"没收到礼物"的人数。

### 分析

排列分解为若干环。
- **最大化**：贪心选择小环整体不带。
- **最小化**：每个环中合理分配不带的位置，使得"没收到"的人最少（背包选环大小凑 $k$）。

### 状态与转移

- 最大化：按环大小升序选，直到选满 $k$
- 最小化：01 背包选环，使得 $\sum \lceil c_i/2 \rceil$ 对应的覆盖最大

### 核心代码

```cpp
// 分解环
vector<int> cycles;
for (int i = 0; i < n; i++) {
    if (!vis[i]) {
        int len = 0, j = i;
        while (!vis[j]) { vis[j] = true; j = p[j]; len++; }
        cycles.push_back(len);
    }
}
// 最大化：贪心
sort(cycles.begin(), cycles.end());
int maxAns = 0, rem = k;
for (int c : cycles) {
    if (rem >= c) { maxAns += c; rem -= c; }
    else { maxAns += rem; break; }
}
// 最小化：背包（bitset 优化）
```

### 复杂度

$O(N \log N)$ 或 $O(N \sqrt{N} / 64)$（bitset 背包）。

---

## 19. CF 607B - Zuma（区间 DP）

### 题意

给长度 $N$ 的数组，每次操作可删除一个回文子段。求删除整个数组的最少操作次数。

### 分析

区间 DP。$dp[l][r]$ = 删除 $[l, r]$ 的最少次数。

### 状态与转移

- **状态**：$dp[l][r]$ = 删除区间 $[l, r]$ 的最少次数
- **转移**：
  - 若 $a[l] = a[r]$：$dp[l][r] = dp[l+1][r-1]$（$l, r$ 可跟着中间一起删）
  - $dp[l][r] = \min_{l \le k < r} (dp[l][k] + dp[k+1][r])$

### 核心代码

```cpp
for (int i = 0; i < n; i++) dp[i][i] = 1;
for (int len = 2; len <= n; len++)
    for (int l = 0; l + len - 1 < n; l++) {
        int r = l + len - 1;
        dp[l][r] = dp[l+1][r] + 1;
        if (a[l] == a[r])
            dp[l][r] = min(dp[l][r], l+1 <= r-1 ? dp[l+1][r-1] : 1);
        for (int k = l; k < r; k++)
            dp[l][r] = min(dp[l][r], dp[l][k] + dp[k+1][r]);
    }
```

### 复杂度

$O(N^3)$。

---

## 20. CF 149D - Coloring Brackets（区间 DP + 状态）

### 题意

合法括号序列，给每个括号涂红/蓝/不涂。约束：每对匹配括号中至少一个有颜色；相邻括号不能同色。求方案数。

### 分析

按括号匹配结构做区间 DP。状态包含左右端点的颜色。

### 状态与转移

- **状态**：$dp[l][r][c_l][c_r]$ = 区间 $[l, r]$ 左端涂色 $c_l$、右端涂色 $c_r$ 的方案数
- **转移**：根据区间分割和匹配关系递推

### 核心代码

```cpp
// match[i] = i 的匹配位置
void solve(int l, int r) {
    if (l + 1 == r) { // 最内层匹配
        for (int a = 0; a < 3; a++)
            for (int b = 0; b < 3; b++)
                if ((a || b) && !(a && b && a == b))
                    dp[l][r][a][b] = 1;
        return;
    }
    if (match[l] == r) { // (l, r) 是匹配对
        solve(l + 1, r - 1);
        for (int a = 0; a < 3; a++)
            for (int b = 0; b < 3; b++) {
                if (!a && !b) continue; // 至少一个有色
                for (int c = 0; c < 3; c++)
                    for (int d = 0; d < 3; d++) {
                        if (a && c && a == c) continue;
                        if (b && d && b == d) continue;
                        dp[l][r][a][b] = (dp[l][r][a][b] + dp[l+1][r-1][c][d]) % MOD;
                    }
            }
    } else { // 拼接
        int mid = match[l];
        solve(l, mid); solve(mid + 1, r);
        // 合并，注意 mid 和 mid+1 的颜色约束
    }
}
```

### 复杂度

$O(N \cdot 3^4)$。

---

## 21. CF 245H - Queries for Number of Palindromes（区间 DP）

### 题意

给字符串 $s$（长 $\le 5000$），多次查询区间 $[l, r]$ 中回文子串个数。

### 分析

预处理 $\text{isPalin}[l][r]$ 和 $dp[l][r]$ = $[l, r]$ 中回文子串数。

### 状态与转移

- **预处理**：$\text{isPalin}[l][r] = (s[l] = s[r]$ 且 $\text{isPalin}[l+1][r-1])$
- **DP**：$dp[l][r] = dp[l+1][r] + dp[l][r-1] - dp[l+1][r-1] + \text{isPalin}[l][r]$

### 核心代码

```cpp
for (int len = 1; len <= n; len++)
    for (int l = 0; l + len - 1 < n; l++) {
        int r = l + len - 1;
        isPalin[l][r] = (s[l] == s[r]) && (len <= 2 || isPalin[l+1][r-1]);
        dp[l][r] = dp[l+1][r] + dp[l][r-1] - dp[l+1][r-1] + isPalin[l][r];
    }
```

### 复杂度

预处理 $O(N^2)$，查询 $O(1)$。

---

## 22. CF 161D - Distance in Tree（树形 DP）

### 题意

$N$ 个节点的树，求距离恰好为 $K$ 的无序点对数。

### 分析

树形 DP。$dp[v][d]$ = $v$ 子树中到 $v$ 距离为 $d$ 的节点数。合并子树时统计答案。

### 状态与转移

- **状态**：$dp[v][d]$ = 子树中距 $v$ 为 $d$ 的节点数
- **答案累加**：合并子节点 $u$ 时，$\text{ans} += \sum_d dp[v][d] \cdot dp[u][K - 1 - d]$

### 核心代码

```cpp
void dfs(int v, int par) {
    dp[v][0] = 1;
    for (int u : adj[v]) {
        if (u == par) continue;
        dfs(u, v);
        for (int d = 0; d < K; d++)
            ans += dp[v][d] * dp[u][K - 1 - d];
        for (int d = 0; d < K; d++)
            dp[v][d + 1] += dp[u][d];
    }
}
```

### 复杂度

$O(NK)$。

---

## 23. CF 337D - Book of Evil（树的直径思想）

### 题意

树上有 $m$ 个受影响节点，"恶魔"位于某节点影响半径 $d$ 内的所有受影响节点。求哪些节点可能是恶魔位置。

### 分析

恶魔必须在所有受影响节点的 $d$ 距离内。等价于：离所有受影响节点的最远距离 $\le d$。

两遍 BFS：从最远的受影响节点出发，求每个节点到受影响节点中最远的两个的距离。

### 状态与转移

- BFS 两遍（从最远受影响节点），取 $\max(d_1, d_2) \le d$ 的节点

### 核心代码

```cpp
// BFS from affected node farthest in one direction
// BFS from affected node farthest in other direction
int ans = 0;
for (int v = 1; v <= n; v++)
    if (dist1[v] <= d && dist2[v] <= d) ans++;
```

### 复杂度

$O(N)$。

---

## 24. CF 1187E - Tree Painting（换根 DP）

### 题意

$N$ 个节点的树。每次选一个与已涂色区域相邻的白色节点涂黑，得分为该节点所在剩余白色连通块的大小。第一次可选任意节点。求最大总得分。

### 分析

第一个涂色的节点为根，后续等价于从根开始 DFS 涂色。总得分 = $\sum_{v} sz[v]$（$sz[v]$ 为以 $v$ 为根时 $v$ 子树大小）。换根 DP 求最优根。

### 状态与转移

- **自底向上**：$f[1] = \sum sz[v]$（以 1 为根）
- **换根**：$f[u] = f[v] - sz[u] + (N - sz[u])$

### 核心代码

```cpp
void dfs1(int v, int par) {
    sz[v] = 1;
    for (int u : adj[v]) {
        if (u == par) continue;
        dfs1(u, v);
        sz[v] += sz[u];
    }
}
void dfs2(int v, int par) {
    for (int u : adj[v]) {
        if (u == par) continue;
        f[u] = f[v] - sz[u] + (n - sz[u]);
        dfs2(u, v);
    }
}
// f[1] = sum of sz[v] for all v (rooted at 1)
```

### 复杂度

$O(N)$。

---

## 25. CF 1083A - The Fair Nut and the Best Path（树形 DP）

### 题意

树上每个节点有权值 $w_v$，每条边有费用 $c_e$。选一条路径使得路径上节点权值和 - 边费用和最大，且路径上任意前缀和非负。

### 分析

树形 DP。对每个节点维护从该节点向下延伸的最大"净收益"链。合并两条链得路径。

### 状态与转移

- **状态**：$dp[v]$ = 从 $v$ 向下延伸的最大净收益（保证非负前缀）
- **答案更新**：合并 $v$ 的两条最优子链

### 核心代码

```cpp
long long ans = 0;
void dfs(int v, int par) {
    dp[v] = w[v];
    ans = max(ans, dp[v]);
    long long best1 = 0; // 最优子链
    for (auto [u, c] : adj[v]) {
        if (u == par) continue;
        dfs(u, v);
        long long val = dp[u] - c;
        if (val < 0) val = 0;
        ans = max(ans, best1 + val + w[v]);
        best1 = max(best1, val);
    }
    dp[v] = max(dp[v], best1 + w[v]);
}
```

### 复杂度

$O(N)$。

---

## 26. CF 1092F - Tree with Maximum Cost（换根 DP）

### 题意

$N$ 个节点的树，每个节点有值 $a_v$。选一个根 $r$，最大化 $\sum_v a_v \cdot \text{depth}(v, r)$。

### 分析

换根 DP。先以 1 为根算出答案，然后换根传递。

### 状态与转移

- **自底向上**：$sz[v] = \sum_{u \in \text{subtree}(v)} a_u$，$f[1] = \sum a_v \cdot \text{depth}(v)$
- **换根**：$f[u] = f[v] - sz[u] + (\text{totalSum} - sz[u])$

### 核心代码

```cpp
// dfs1: compute sz[v] and f[1]
void dfs1(int v, int par, int depth) {
    sz[v] = a[v];
    f1 += (long long)a[v] * depth;
    for (int u : adj[v]) {
        if (u == par) continue;
        dfs1(u, v, depth + 1);
        sz[v] += sz[u];
    }
}
void dfs2(int v, int par) {
    for (int u : adj[v]) {
        if (u == par) continue;
        f[u] = f[v] - sz[u] + (totalSum - sz[u]);
        dfs2(u, v);
    }
}
```

### 复杂度

$O(N)$。

---

## 27. CF 628D - Magic Numbers（数位 DP）

### 题意

给 $d$ 和 $m$，求 $[a, b]$ 中满足：偶数位恰好是 $d$、奇数位不是 $d$、且整体被 $m$ 整除的数的个数。

### 分析

数位 DP，维护位置奇偶性和余数。

### 状态与转移

- **状态**：$dp[pos][rem][tight]$
- **转移**：根据位置奇偶决定当前位是否必须/不能为 $d$

### 核心代码

```cpp
long long dfs(int pos, int rem, bool tight) {
    if (pos == n) return rem == 0 ? 1 : 0;
    if (memo[pos][rem][tight] != -1) return memo[pos][rem][tight];
    int limit = tight ? (num[pos] - '0') : 9;
    long long res = 0;
    for (int dig = 0; dig <= limit; dig++) {
        if (pos % 2 == 1 && dig != d) continue; // 偶数位（1-indexed）必须是 d
        if (pos % 2 == 0 && dig == d) continue; // 奇数位不能是 d
        res += dfs(pos + 1, (rem * 10 + dig) % m, tight && dig == limit);
    }
    return memo[pos][rem][tight] = res % MOD;
}
```

### 复杂度

$O(|b| \cdot m \cdot 10)$。

---

## 28. CF 55D - Beautiful Numbers（数位 DP）

### 题意

求 $[l, r]$ 中能被自身所有非零数位整除的数的个数。

### 分析

数位 DP。关键：需维护当前数对 $\text{lcm}$ 的余数和当前 $\text{lcm}$。$\text{lcm}(1..9)$ 的因子只有 $2520$，余数对 2520 取模。$\text{lcm}$ 的可能值只有 48 种。

### 状态与转移

- **状态**：$dp[pos][\text{lcm\_id}][\text{rem}][tight]$
- **转移**：枚举当前位 $d$，更新 $\text{lcm}$ 和 $\text{rem}$

### 核心代码

```cpp
long long dfs(int pos, int lcm_id, int rem, bool tight) {
    if (pos < 0) return rem % lcm_val[lcm_id] == 0 ? 1 : 0;
    if (memo[pos][lcm_id][rem][tight] != -1) return memo[pos][lcm_id][rem][tight];
    int limit = tight ? digits[pos] : 9;
    long long res = 0;
    for (int d = 0; d <= limit; d++) {
        int nlcm = d == 0 ? lcm_id : lcm_map[lcm(lcm_val[lcm_id], d)];
        res += dfs(pos - 1, nlcm, (rem * 10 + d) % 2520, tight && d == limit);
    }
    return memo[pos][lcm_id][rem][tight] = res;
}
```

### 复杂度

$O(\text{digits} \times 48 \times 2520 \times 10)$。

---

## 29. CF 855B - Marvolo Gaunt's Ring（DP / 前缀后缀）

### 题意

长度 $N$ 的数组和三个系数 $p, q, r$。求 $\max(p \cdot a_i + q \cdot a_j + r \cdot a_k)$（$i \le j \le k$）。

### 分析

预处理前缀最大 $p \cdot a_i$ 和后缀最大 $r \cdot a_k$，然后枚举 $j$。

### 状态与转移

- **前缀**：$L[j] = \max_{i \le j} p \cdot a_i$
- **后缀**：$R[j] = \max_{k \ge j} r \cdot a_k$
- **答案**：$\max_j (L[j] + q \cdot a_j + R[j])$

### 核心代码

```cpp
L[0] = p * a[0];
for (int i = 1; i < n; i++) L[i] = max(L[i-1], p * a[i]);
R[n-1] = r * a[n-1];
for (int i = n-2; i >= 0; i--) R[i] = max(R[i+1], r * a[i]);
long long ans = LLONG_MIN;
for (int j = 0; j < n; j++)
    ans = max(ans, L[j] + q * a[j] + R[j]);
```

### 复杂度

$O(N)$。

---

## 30. CF 580D - Kefa and Dishes（状压 DP）

### 题意

$N$ 道菜（$N \le 18$），每道满意度 $a_i$。选 $m$ 道按顺序吃。某些 $(x, y)$ 组合连续吃有额外加分。求最大满意度。

### 分析

状压 DP。$dp[S][i]$ = 已吃集合 $S$、最后一道为 $i$ 的最大满意度。

### 状态与转移

- **状态**：$dp[S][i]$，$|S| \le m$
- **转移**：枚举下一道 $j \notin S$，$dp[S \cup \{j\}][j] = \max(dp[S][i] + a[j] + \text{bonus}(i, j))$

### 核心代码

```cpp
for (int i = 0; i < n; i++) dp[1 << i][i] = a[i];
for (int S = 1; S < (1 << n); S++) {
    if (__builtin_popcount(S) > m) continue;
    for (int i = 0; i < n; i++) {
        if (!(S >> i & 1) || dp[S][i] < 0) continue;
        if (__builtin_popcount(S) == m) { ans = max(ans, dp[S][i]); continue; }
        for (int j = 0; j < n; j++) {
            if (S >> j & 1) continue;
            dp[S | (1 << j)][j] = max(dp[S | (1 << j)][j],
                dp[S][i] + a[j] + bonus[i][j]);
        }
    }
}
```

### 复杂度

$O(N^2 \cdot 2^N)$。

---

## 31. CF 453B - Little Pony and Harmony Chest（状压 DP）

### 题意

用正整数数组 $b$ 替换数组 $a$（长 $N \le 100$），要求 $b$ 中任意两个元素互质。最小化 $\sum |a_i - b_i|$。

### 分析

$b_i \le 58$（因为 $a_i \le 30$）。将 $\le 58$ 的素数（共 16 个）状压，$dp[i][S]$ = 前 $i$ 个、已用素因子集合 $S$ 的最小代价。

### 状态与转移

- **状态**：$dp[i][S]$ = 前 $i$ 个元素、素因子集合 $S$ 的代价
- **转移**：枚举 $b_i$（$1 \sim 58$），若其素因子集 $\cap\ S = \emptyset$，则转移

### 核心代码

```cpp
for (int i = 1; i <= n; i++)
    for (int S = 0; S < (1 << 16); S++) {
        if (dp[i-1][S] == INF) continue;
        for (int v = 1; v <= 58; v++) {
            if (prime_mask[v] & S) continue;
            int nS = S | prime_mask[v];
            int cost = abs(a[i] - v);
            dp[i][nS] = min(dp[i][nS], dp[i-1][S] + cost);
        }
    }
```

### 复杂度

$O(N \cdot 58 \cdot 2^{16})$。

---

## 32. CF 1238E - Keyboard Purchase（SOS DP / 子集求和）

### 题意

给字符串 $s$（只含前 $m$ 种小写字母），设计键盘排列使相邻字符在键盘上的距离之和最小。

### 分析

$\text{cnt}[a][b]$ = 相邻字符对 $(a,b)$ 出现次数。枚举字母子集 $S$ 的排列代价，用 SOS DP（子集和 DP）优化。

### 状态与转移

- $dp[S]$ = 已放置集合 $S$ 的最小代价
- 利用贡献函数的可分解性，用子集求和优化

### 核心代码

```cpp
// cost[S] = sum of cnt[a][b] where exactly one of a,b is in S
// dp[S] = min over all last added element
for (int S = 1; S < (1 << m); S++) {
    dp[S] = INF;
    int pc = __builtin_popcount(S);
    for (int i = 0; i < m; i++) {
        if (!(S >> i & 1)) continue;
        dp[S] = min(dp[S], dp[S ^ (1 << i)] + contribution(S, i, pc));
    }
}
```

### 复杂度

$O(m \cdot 2^m)$。

---

## 33. CF 235B - Let's Play Osu!（期望 DP）

### 题意

$N$ 次点击，第 $i$ 次成功概率 $p_i$。连续 $x$ 次成功得 $x^2$ 分。求期望总分。

### 分析

$x^2 - (x-1)^2 = 2x - 1$，即连续第 $x$ 次成功新增 $2x - 1$ 分。维护"连续成功长度"的期望即可。

### 状态与转移

- **状态**：$E[i]$ = 第 $i$ 次结束时连续成功长度的期望
- **转移**：$E[i] = (E[i-1] + 1) \cdot p_i$
- **期望分数增量**：$(2 \cdot E[i-1] + 1) \cdot p_i$

### 核心代码

```cpp
double e = 0, ans = 0;
for (int i = 0; i < n; i++) {
    ans += (2 * e + 1) * p[i];
    e = (e + 1) * p[i];
}
```

### 复杂度

$O(N)$。

---

## 34. CF 518D - Ilya and Escalator（概率 DP）

### 题意

$N$ 人排队，每秒队首以概率 $p$ 进入电梯，$1-p$ 不动。电梯容量无限。$T$ 秒后期望多少人进入电梯。

### 分析

$dp[t][k]$ = $t$ 秒后恰好 $k$ 人进入的概率。

### 状态与转移

- **状态**：$dp[t][k]$ = 概率
- **转移**：
  - $k < N$：$dp[t][k] = dp[t-1][k] \cdot (1-p) + dp[t-1][k-1] \cdot p$
  - $k = N$：$dp[t][N] = dp[t-1][N] + dp[t-1][N-1] \cdot p$

### 核心代码

```cpp
dp[0][0] = 1.0;
for (int t = 1; t <= T; t++) {
    dp[t][0] = dp[t-1][0] * (1 - p);
    for (int k = 1; k < n; k++)
        dp[t][k] = dp[t-1][k] * (1 - p) + dp[t-1][k-1] * p;
    dp[t][n] = dp[t-1][n] + dp[t-1][n-1] * p;
}
double ans = 0;
for (int k = 0; k <= n; k++) ans += k * dp[T][k];
```

### 复杂度

$O(NT)$。

---

## 35. CF 1312E - Array Shrinking（区间 DP）

### 题意

数组操作：相邻两个相等的元素 $x, x$ 可合并为 $x+1$。求最短最终数组长度。

### 分析

区间 DP。$val[l][r]$ = 区间 $[l, r]$ 若能合并为单个值则是该值，否则为 $-1$。$dp[i]$ = 前 $i$ 个元素的最短长度。

### 状态与转移

- **预处理**：$val[l][r]$：若 $\exists k$ 使 $val[l][k] = val[k+1][r]$，则 $val[l][r] = val[l][k] + 1$
- **DP**：$dp[i] = \min_{val[j+1][i] \neq -1} dp[j] + 1$

### 核心代码

```cpp
for (int i = 0; i < n; i++) val[i][i] = a[i];
for (int len = 2; len <= n; len++)
    for (int l = 0; l + len - 1 < n; l++) {
        int r = l + len - 1;
        for (int k = l; k < r; k++)
            if (val[l][k] != -1 && val[l][k] == val[k+1][r])
                val[l][r] = val[l][k] + 1;
    }
dp[0] = 0;
for (int i = 1; i <= n; i++) {
    dp[i] = dp[i-1] + 1;
    for (int j = 0; j < i; j++)
        if (val[j][i-1] != -1)
            dp[i] = min(dp[i], dp[j] + 1);
}
```

### 复杂度

$O(N^3)$。

---

## 36. CF 1155D - Beautiful Array（分段 DP）

### 题意

数组 $a$，可选连续子段全部乘以 $x$（至多一次，也可不乘）。求最大子段和。

### 分析

分三段考虑：乘之前、乘的段、乘之后。$dp[i][0/1/2]$：第 $i$ 位处于 未乘/正在乘/已乘完 阶段的最大子段和。

### 状态与转移

- $dp[i][0] = \max(0, dp[i-1][0]) + a[i]$
- $dp[i][1] = \max(a[i] \cdot x, \max(dp[i-1][0], dp[i-1][1]) + a[i] \cdot x)$
- $dp[i][2] = \max(a[i], \max(dp[i-1][1], dp[i-1][2]) + a[i])$

### 核心代码

```cpp
long long ans = a[0]; // 至少一个元素
long long d0 = 0, d1 = 0, d2 = 0;
for (int i = 0; i < n; i++) {
    d2 = max((long long)a[i], max(d1, d2) + a[i]);
    d1 = max((long long)a[i] * x, max(d0, d1) + (long long)a[i] * x);
    d0 = max(0LL, d0) + a[i];
    ans = max(ans, max({d0, d1, d2}));
}
```

### 复杂度

$O(N)$。

---

# 总结

## 知识点全景图

| 类别 | 题目 | 核心技术 |
|------|------|----------|
| **入门线性 DP** | 1, 3, 4, 5, 6 | House Robber 模型、周期DP、完全背包、分段Kadane、多状态 |
| **前缀和/计数** | 2, 14 | 前缀和分段、模3计数DP |
| **线性/序列 DP** | 7, 8, 9, 10, 11, 12, 36 | 时刻 DP、排序+扫描、单调队列、连续 LIS、分段 DP |
| **背包 DP** | 13, 15, 16, 17, 18 | 双维背包、贪心背包、完全背包、环分解 |
| **区间 DP** | 19, 20, 21, 35 | 回文删除、括号涂色、回文计数、合并操作 |
| **树形 DP** | 22, 23, 24, 25, 26 | 距离计数、直径思想、换根 DP、路径收益 |
| **数位 DP** | 27, 28 | 约束数位、LCM 状压 |
| **状压 DP** | 30, 31, 32 | TSP 变形、素因子状压、SOS DP |
| **概率/期望** | 29, 33, 34 | 前缀后缀DP、期望线性化、概率 DP |

## 学习路线建议

```
入门（1200-1500）：1 → 3 → 4 → 5 → 6 → 2
    ↓
线性/序列（1500-1800）：10 → 11 → 7 → 8 → 9 → 12
    ↓
背包/子集：13 → 14 → 17 → 15 → 16 → 18
    ↓
区间 DP：19 → 21 → 20 → 35
    ↓
树形 DP：22 → 24 → 26 → 25 → 23
    ↓
数位 DP：27 → 28
    ↓
状压 DP：30 → 31 → 32
    ↓
概率/期望：29 → 33 → 34
    ↓
高级综合：36 → 14
```

## 解题方法论

1. **模型识别**：Codeforces 题目往往需要先识别出经典模型（House Robber、背包、区间合并等），然后添加特定约束。
2. **多状态设计**：遇到"可以做一次特殊操作"或"有多种选择模式"的题目，考虑为每种状态/阶段设计独立的 DP 状态（如题 36 的分段 DP）。
3. **换根 DP 是高频考点**：树上"对每个节点求最优"几乎一定是换根 DP（题 24, 26）。
4. **数位 DP 状态压缩**：CF 的数位 DP 往往需要巧妙压缩状态（如用 LCM 只有 48 种值来压缩 Beautiful Numbers）。
5. **概率/期望 DP 的线性化**：$x^2$ 类期望可以用增量分解 $2x - 1$ 转化为维护期望长度（题 33）。

> **记住**：Codeforces 题目跨度大（1200 到 2400+），同一种 DP 类型在不同难度下有本质不同的挑战。掌握从简单模型到复杂优化的渐进过程是提高的关键。
