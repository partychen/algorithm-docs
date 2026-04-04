---
title: "HDU 经典DP专题精选解题报告"
subtitle: "🔥 36 道 HDU 经典 DP 题目的分析方法、解题思路与核心代码"
order: 4
icon: "🔥"
---

# HDU 经典DP专题精选解题报告

> 来源：[HDU Online Judge](https://acm.hdu.edu.cn/)
>
> 本报告针对 HDU 经典 DP 36 题，逐题给出**题意概述 → 分析方法 → 状态设计 → 转移方程 → 核心代码 → 复杂度**，最后做整体总结。

---

## 1. HDU 2571 - 命运（网格 DP）

### 题意

$N \times M$ 网格，每格有值（可为负）。从 $(1,1)$ 走到 $(N,M)$，每步可以向下走一行，或向右走到当前列的倍数列。求路径上的最大价值和。

### 分析

基础网格 DP。与标准网格不同的是，向右的转移不是 $+1$ 而是跳到当前列的倍数位置。

### 状态与转移

- **状态**：$dp[i][j]$ = 到达 $(i, j)$ 的最大价值和
- **转移**：$dp[i][j] = \max(dp[i-1][j],\; \max_{k | j, k < j} dp[i][k]) + v[i][j]$
- **初始**：$dp[1][1] = v[1][1]$
- **答案**：$dp[N][M]$

### 核心代码

```cpp
memset(dp, -0x3f, sizeof(dp));
dp[1][1] = v[1][1];
for (int i = 1; i <= N; i++)
    for (int j = 1; j <= M; j++) {
        if (i > 1) dp[i][j] = max(dp[i][j], dp[i-1][j] + v[i][j]);
        for (int k = 2; k * j <= M; k++)
            dp[i][k * j] = max(dp[i][k * j], dp[i][j] + v[i][k * j]);
    }
```

### 复杂度

$O(NM \log M)$。

---

## 2. HDU 1003 - Max Sum（最大子段和）

### 题意

给定 $N$ 个整数的序列，求连续子段的最大和，并输出起止位置。

### 分析

经典最大子段和（Kadane 算法）。维护当前子段和，为负时重新开始。

### 状态与转移

- **状态**：$dp[i]$ = 以第 $i$ 个元素结尾的最大子段和
- **转移**：$dp[i] = \max(dp[i-1] + a[i],\; a[i])$
- **答案**：$\max_{i} dp[i]$

### 核心代码

```cpp
int maxSum = a[0], curSum = a[0], l = 0, r = 0, tl = 0;
for (int i = 1; i < n; i++) {
    if (curSum < 0) { curSum = a[i]; tl = i; }
    else curSum += a[i];
    if (curSum > maxSum) { maxSum = curSum; l = tl; r = i; }
}
```

### 复杂度

$O(N)$。

---

## 3. HDU 1024 - Max Sum Plus Plus（$m$ 段最大子段和）

### 题意

给定 $N$ 个整数和正整数 $m$，将序列分成 $m$ 段不相交的连续子段，使各段和之和最大。

### 分析

经典 $m$ 段最大子段和。$dp[i][j]$ 表示前 $j$ 个元素中选 $i$ 段的最大和。滚动数组 + 前缀最大值优化。

### 状态与转移

- **状态**：$dp[i][j]$ = 前 $j$ 个数选 $i$ 段、第 $i$ 段以 $j$ 结尾的最大和
- **转移**：$dp[i][j] = \max(dp[i][j-1],\; \max_{k<j} dp[i-1][k]) + a[j]$
- **答案**：$\max_{j \ge m} dp[m][j]$

### 核心代码

```cpp
memset(dp, 0, sizeof(dp));
for (int i = 1; i <= m; i++) {
    long long mx = -1e18;
    for (int j = i; j <= n; j++) {
        dp[j] = max(dp[j-1], pre[j-1]) + a[j];
        pre[j-1] = mx;  // pre 存上一轮的前缀最大值
        mx = max(mx, dp[j]);
    }
}
// 答案：mx（最后一轮结束时的 mx）
```

### 复杂度

$O(mN)$ 时间，$O(N)$ 空间。

---

## 4. HDU 1260 - Tickets（线性 DP）

### 题意

$N$ 个人排队买票，第 $i$ 个人单独买耗时 $a_i$ 秒，第 $i$ 和 $i+1$ 人一起买耗时 $b_i$ 秒。求服务完所有人的最短时间。

### 分析

经典线性 DP。每个人要么单独买票，要么和前一个人合买。

### 状态与转移

- **状态**：$dp[i]$ = 前 $i$ 个人的最短时间
- **转移**：$dp[i] = \min(dp[i-1] + a[i],\; dp[i-2] + b[i-1])$
- **初始**：$dp[1] = a[1]$
- **答案**：$dp[N]$

### 核心代码

```cpp
dp[1] = a[1];
for (int i = 2; i <= n; i++)
    dp[i] = min(dp[i-1] + a[i], dp[i-2] + b[i-1]);
```

### 复杂度

$O(N)$。

---

## 5. HDU 1069 - Monkey and Banana（LIS 变形 / DAG DP）

### 题意

$N$ 种长方体积木，每种无限个。叠起来要求上面的积木长严格小于下面的、宽也严格小于。每种积木有 3 种放法（三个面分别朝上）。求最大高度。

### 分析

每种积木生成 3 种摆放方式（$x, y, z$ 轮换），按长宽排序后做类似 LIS 的 DP。

### 状态与转移

- **状态**：$dp[i]$ = 以第 $i$ 个积木（排序后）为顶的最大高度
- **转移**：$dp[i] = \max_{j < i,\; l_j < l_i \land w_j < w_i} (dp[j]) + h_i$
- **答案**：$\max_i dp[i]$

### 核心代码

```cpp
// 生成所有放法后按 (l, w) 排序
for (int i = 0; i < tot; i++) {
    dp[i] = blocks[i].h;
    for (int j = 0; j < i; j++)
        if (blocks[j].l < blocks[i].l && blocks[j].w < blocks[i].w)
            dp[i] = max(dp[i], dp[j] + blocks[i].h);
    ans = max(ans, dp[i]);
}
```

### 复杂度

$O((3N)^2)$。

---

## 6. HDU 1074 - Doing Homework（状压 DP）

### 题意

$N$（$N \le 15$）门课程作业，每门有截止日期 $d_i$ 和完成天数 $c_i$，超期一天扣一分。求最小扣分方案（并输出完成顺序）。

### 分析

$N \le 15$，用**位掩码**表示已完成的作业集合。枚举下一门完成的课程，维护最小罚分。

### 状态与转移

- **状态**：$dp[S]$ = 完成集合 $S$ 中作业的最小扣分，$day[S]$ = 完成后经过的天数
- **转移**：枚举 $S$ 中每一位 $i$，$dp[S] = \min(dp[S \setminus \{i\}] + \max(0, day[S \setminus \{i\}] + c_i - d_i))$

### 核心代码

```cpp
for (int S = 1; S < (1 << n); S++) {
    dp[S] = INF;
    for (int i = 0; i < n; i++) {
        if (!(S >> i & 1)) continue;
        int prev = S ^ (1 << i);
        int finish = day[prev] + c[i];
        int penalty = max(0, finish - d[i]);
        if (dp[prev] + penalty < dp[S]) {
            dp[S] = dp[prev] + penalty;
            day[S] = finish;
            last[S] = i; // 用于回溯路径
        }
    }
}
```

### 复杂度

$O(N \cdot 2^N)$。

---

## 7. HDU 1087 - Super Jumping（最大递增子序列和）

### 题意

$N$ 个正整数，求最大递增子序列之和。

### 分析

类似 LIS，但求的是和而非长度。$dp[i]$ 表示以 $a[i]$ 结尾的最大递增子序列和。

### 状态与转移

- **状态**：$dp[i]$ = 以 $a[i]$ 结尾的最大递增子序列和
- **转移**：$dp[i] = \max_{j < i,\; a[j] < a[i]} dp[j] + a[i]$
- **初始**：$dp[i] = a[i]$
- **答案**：$\max_i dp[i]$

### 核心代码

```cpp
for (int i = 0; i < n; i++) {
    dp[i] = a[i];
    for (int j = 0; j < i; j++)
        if (a[j] < a[i])
            dp[i] = max(dp[i], dp[j] + a[i]);
    ans = max(ans, dp[i]);
}
```

### 复杂度

$O(N^2)$。

---

## 8. HDU 1203 - I NEED A OFFER!（概率背包）

### 题意

小明有 $n$ 元钱，可以申请 $m$ 所学校，第 $i$ 所花费 $a_i$、录取概率 $b_i$。求**至少收到一个 offer** 的最大概率。

### 分析

概率背包。"至少一个"等价于 $1 - \prod(1 - p_i)$。用 $dp[j]$ 维护花 $j$ 元时**全部被拒**的最小概率。

### 状态与转移

- **状态**：$dp[j]$ = 花费恰好 $j$ 元时全部被拒的最小概率
- **转移**：$dp[j] = \min(dp[j],\; dp[j - a_i] \times (1 - b_i))$（倒序枚举 $j$）
- **初始**：$dp[0] = 1$，其余为 $1$
- **答案**：$1 - \min_{j \le n} dp[j]$

### 核心代码

```cpp
for (int j = 0; j <= n; j++) dp[j] = 1.0;
for (int i = 0; i < m; i++)
    for (int j = n; j >= a[i]; j--)
        dp[j] = min(dp[j], dp[j - a[i]] * (1.0 - b[i]));
double ans = 0;
for (int j = 0; j <= n; j++) ans = max(ans, 1.0 - dp[j]);
```

### 复杂度

$O(mn)$。

---

## 9. HDU 1159 - Common Subsequence（LCS）

### 题意

给两个字符串，求最长公共子序列的长度。

### 分析

LCS 最自然的切入点不是整串，而是“两个前缀之间的最优答案”。因为公共子序列允许跳过字符，处理到 `s` 的前 `i` 个字符和 `t` 的前 `j` 个字符时，最后一个字符是否匹配，正好决定了状态怎么从更小前缀长出来。

若 `s[i-1]==t[j-1]`，那这两个字符可以一起接在某个公共子序列末尾，答案来自左上角再加一；若不等，说明至少要放弃一边的最后字符，于是比较“丢掉 `s` 的最后一个”与“丢掉 `t` 的最后一个”。

所以这题最值得形成的直觉是：**两个序列、允许删除但保持顺序时，优先把状态落在双前缀上。**

### 状态与转移

- **状态**：$dp[i][j]$ = $s[0..i-1]$ 与 $t[0..j-1]$ 的 LCS 长度
- **转移**：
  - $s_i = t_j$：$dp[i][j] = dp[i-1][j-1] + 1$
  - 否则：$dp[i][j] = \max(dp[i-1][j],\; dp[i][j-1])$

### 核心代码

```cpp
for (int i = 1; i <= n; i++)
    for (int j = 1; j <= m; j++)
        if (s[i-1] == t[j-1]) dp[i][j] = dp[i-1][j-1] + 1;
        else dp[i][j] = max(dp[i-1][j], dp[i][j-1]);
```

### 复杂度

$O(|s| \cdot |t|)$。

---

## 10. HDU 1160 - FatMouse's Speed（LIS 变形）

### 题意

$N$ 只老鼠，每只有体重 $w_i$ 和速度 $s_i$。选出最多的老鼠使得体重严格递增时速度严格递减。输出方案。

### 分析

按体重升序（体重相同按速度降序）排序后做 LIS（以速度递减为条件）。需要回溯路径。

### 状态与转移

- **状态**：$dp[i]$ = 以排序后第 $i$ 只为末尾的最长链长度
- **转移**：$dp[i] = \max_{j < i,\; w_j < w_i \land s_j > s_i} dp[j] + 1$

### 核心代码

```cpp
// 按体重升序、速度降序排序后
for (int i = 0; i < n; i++) {
    dp[i] = 1; pre[i] = -1;
    for (int j = 0; j < i; j++)
        if (mice[j].w < mice[i].w && mice[j].s > mice[i].s)
            if (dp[j] + 1 > dp[i]) {
                dp[i] = dp[j] + 1;
                pre[i] = j;
            }
}
// 找 dp 最大值位置后沿 pre 回溯
```

### 复杂度

$O(N^2)$。

---

## 11. HDU 3466 - Proud Merchants（排序 + 01 背包）

### 题意

$N$ 个物品，每个有价格 $p_i$、门槛 $q_i$（必须手中剩余 $\ge q_i$ 才能买）和价值 $v_i$。总预算 $M$，求最大价值。

### 分析

**关键**：购买顺序影响可行性。按 $q_i - p_i$ 升序排列后做 01 背包（贪心证明：交换相邻两物品不会更差）。

### 状态与转移

- **状态**：$dp[j]$ = 预算 $j$ 时的最大价值
- **排序**：按 $q_i - p_i$ 升序
- **转移**：$dp[j] = \max(dp[j],\; dp[j - p_i] + v_i)$（$j \ge q_i$）

### 核心代码

```cpp
sort(items, items + n, [](auto& a, auto& b) {
    return a.q - a.p < b.q - b.p;
});
for (int i = 0; i < n; i++)
    for (int j = M; j >= items[i].q; j--)
        dp[j] = max(dp[j], dp[j - items[i].p] + items[i].v);
```

### 复杂度

$O(NM)$。

---

## 12. HDU 2844 - Coins（多重背包）

### 题意

$N$ 种硬币，第 $i$ 种面值 $a_i$、数量 $c_i$。问 $[1, M]$ 中有多少值能被凑出。

### 分析

题目问的是“哪些金额可达”，本质是多重背包的布尔可达性版本。难点不在转移，而在每种硬币数量有限，不能像完全背包那样无限重复使用。

把每种数量 `c_i` 按 `1,2,4,...` 二进制拆开后，就能把“至多取 `c_i` 枚”转成若干组互不重复的 01 物品。这样每个金额只需判断能否由之前的可达状态转移而来。

因此这题要记住的是经典降维手法：**有限件数的重复物品，先二进制拆分，再做 01 背包。**

### 状态与转移

- **状态**：$dp[j]$ = 金额 $j$ 是否可达
- **转移**：将每种硬币按 $1, 2, 4, \ldots$ 拆分为 01 背包
- **答案**：$\sum_{j=1}^{M} dp[j]$

### 核心代码

```cpp
dp[0] = true;
for (int i = 0; i < n; i++) {
    int num = c[i];
    for (int k = 1; num > 0; k <<= 1) {
        int take = min(k, num);
        num -= take;
        int val = take * a[i];
        for (int j = M; j >= val; j--)
            dp[j] = dp[j] || dp[j - val];
    }
}
int ans = 0;
for (int j = 1; j <= M; j++) ans += dp[j];
```

### 复杂度

$O(NM \log C)$。

---

## 13. HDU 1171 - Big Event in HDU（背包均分）

### 题意

$N$ 种物品，第 $i$ 种价值 $v_i$、数量 $m_i$。将所有物品分成两堆，使两堆价值之差最小。输出：较大堆的价值和较小堆的价值。

### 分析

等价于多重背包：在总价值一半的容量下，能背到多少。二进制拆分优化。

### 状态与转移

- **状态**：$dp[j]$ = 容量 $j$ 下是否可达
- **答案**：满足 $dp[j] = \text{true}$ 的最大 $j$（$j \le \text{sum}/2$），两堆为 $j$ 和 $\text{sum} - j$

### 核心代码

```cpp
int sum = 0;
for (int i = 0; i < n; i++) sum += v[i] * m[i];
int half = sum / 2;
dp[0] = true;
for (int i = 0; i < n; i++) {
    int num = m[i];
    for (int k = 1; num > 0; k <<= 1) {
        int take = min(k, num); num -= take;
        int val = take * v[i];
        for (int j = half; j >= val; j--)
            dp[j] = dp[j] || dp[j - val];
    }
}
int best = 0;
for (int j = half; j >= 0; j--)
    if (dp[j]) { best = j; break; }
printf("%d %d\n", sum - best, best);
```

### 复杂度

$O(NM \log C)$，其中 $M = \text{sum}/2$。

---

## 14. HDU 2159 - FATE（二维费用背包）

### 题意

角色还需 $n$ 点经验升级，剩余忍耐值 $m$。有 $k$ 种怪物，第 $i$ 种给 $a_i$ 经验、消耗 $b_i$ 忍耐值，最多杀 $s$ 只怪（总数限制）。求升级后剩余最大忍耐值（不可能则 $-1$）。

### 分析

二维费用背包：维度为忍耐值和怪物总数。每种怪物等效于完全背包（但总数有上限 $s$）。

### 状态与转移

- **状态**：$dp[j][t]$ = 使用忍耐值 $j$、杀 $t$ 只怪获得的最大经验
- **转移**：$dp[j][t] = \max(dp[j][t],\; dp[j - b_i][t - 1] + a_i)$
- **答案**：满足 $dp[j][t] \ge n$ 的最小 $j$，则剩余忍耐值为 $m - j$

### 核心代码

```cpp
memset(dp, 0, sizeof(dp));
for (int i = 0; i < k; i++)
    for (int j = b[i]; j <= m; j++)       // 完全背包：正序
        for (int t = 1; t <= s; t++)
            dp[j][t] = max(dp[j][t], dp[j - b[i]][t - 1] + a[i]);
int ans = -1;
for (int j = 0; j <= m; j++)
    for (int t = 0; t <= s; t++)
        if (dp[j][t] >= n) { ans = m - j; goto done; }
done:
printf("%d\n", ans);
```

### 复杂度

$O(kmS)$。

---

## 15. HDU 2955 - Robberies（概率背包）

### 题意

$N$ 家银行，第 $i$ 家钱 $m_i$、被抓概率 $p_i$。在被抓总概率不超过 $P$ 的前提下，求最多能抢多少钱。

### 分析

**转化思路**：将"被抓概率"转为"安全概率"。以抢的总金额为背包容量，$dp[j]$ = 恰好抢 $j$ 元的最大安全概率。

### 状态与转移

- **状态**：$dp[j]$ = 恰好抢 $j$ 元时不被抓的最大概率
- **转移**：$dp[j] = \max(dp[j],\; dp[j - m_i] \times (1 - p_i))$
- **答案**：满足 $dp[j] \ge 1 - P$ 的最大 $j$

### 核心代码

```cpp
int total = 0;
for (int i = 0; i < n; i++) total += m[i];
dp[0] = 1.0;
for (int i = 0; i < n; i++)
    for (int j = total; j >= m[i]; j--)
        dp[j] = max(dp[j], dp[j - m[i]] * (1.0 - p[i]));
for (int j = total; j >= 0; j--)
    if (dp[j] >= 1.0 - P) { printf("%d\n", j); break; }
```

### 复杂度

$O(N \cdot \text{total})$。

---

## 16. HDU 1248 - 寒冰王座（完全背包）

### 题意

有三种物品价格分别为 150、200、350。给定预算 $n$，求最多能花多少钱（不超过 $n$）。

### 分析

因为三种物品都可以无限买，而目标是“花出去的钱尽量多但不超过预算”，这正是完全背包的容量视角：重量是花费，价值也就是花费本身。

于是 `dp[j]` 表示预算不超过 `j` 时最多能花多少钱。每加入一种价格 `w`，都可以从 `j-w` 的最优状态继续再买一个，因为同种物品允许重复使用，所以容量必须正序枚举。

这题虽然很短，但很适合作为模型识别题：**可重复购买、追求不超过上限的最大利用率，就是完全背包。**

### 状态与转移

- **状态**：$dp[j]$ = 预算 $j$ 时最多花的钱
- **转移**：$dp[j] = \max(dp[j],\; dp[j - w] + w)$（$w \in \{150, 200, 350\}$）

### 核心代码

```cpp
int w[] = {150, 200, 350};
for (int k = 0; k < 3; k++)
    for (int j = w[k]; j <= n; j++)
        dp[j] = max(dp[j], dp[j - w[k]] + w[k]);
// 答案：n - dp[n] 为找零，或直接输出 dp[n]
```

### 复杂度

$O(3N)$。

---

## 17. HDU 2191 - 悼念512汶川大地震（多重背包）

### 题意

预算 $n$ 元，$m$ 种大米，每种价格 $p_i$、重量 $h_i$、可买数量 $c_i$。求最大总重。

### 分析

每种大米都有价格、重量和购买上限，所以它不是 01 背包，也不是完全背包，而是标准多重背包。朴素地把每袋米都展开会太慢，因此要先处理“数量有限”这个瓶颈。

二进制拆分的意义是把 `c_i` 袋同种大米压成若干组数量为 `1,2,4,...` 的打包物品，每组的总价格和总重量都能直接算出。这样原问题就被翻译成一组 01 物品的最大价值背包。

所以这题真正该学的是：**多重背包优化的关键，是先把“件数限制”改写成少量 01 物品。**

### 状态与转移

- **状态**：$dp[j]$ = 花费 $j$ 元能买到的最大重量
- **转移**：二进制拆分后做 01 背包

### 核心代码

```cpp
for (int i = 0; i < m; i++) {
    int num = c[i];
    for (int k = 1; num > 0; k <<= 1) {
        int take = min(k, num); num -= take;
        int cost = take * p[i], val = take * h[i];
        for (int j = n; j >= cost; j--)
            dp[j] = max(dp[j], dp[j - cost] + val);
    }
}
```

### 复杂度

$O(nm\log C)$。

---

## 18. HDU 1176 - 免费馅饼（网格 DP）

### 题意

一个人站在数轴位置 5，$[0, 10]$ 范围内。$T$ 秒内有馅饼在 $(x_i, t_i)$ 落下。每秒可移动 $\pm 1$ 或不动。求最多接多少馅饼。

### 分析

把时间-位置看作网格。从最后一秒向第 0 秒递推，$dp[t][x]$ 从 $dp[t+1][x-1], dp[t+1][x], dp[t+1][x+1]$ 转移。

### 状态与转移

- **状态**：$dp[t][x]$ = 在时刻 $t$、位置 $x$ 起能接到的最多馅饼
- **转移**：$dp[t][x] = \text{cnt}[t][x] + \max(dp[t+1][x-1],\; dp[t+1][x],\; dp[t+1][x+1])$
- **答案**：$dp[0][5]$

### 核心代码

```cpp
for (int t = T; t >= 0; t--)
    for (int x = 0; x <= 10; x++) {
        dp[t][x] = cnt[t][x];
        int best = dp[t+1][x];
        if (x > 0) best = max(best, dp[t+1][x-1]);
        if (x < 10) best = max(best, dp[t+1][x+1]);
        dp[t][x] += best;
    }
```

### 复杂度

$O(11T)$。

---

## 19. HDU 1257 - 最少拦截系统（LIS / Dilworth 定理）

### 题意

$N$ 枚导弹依次飞来，高度为 $h_i$。一套系统能拦截高度不增的子序列。问最少需要多少套系统。

### 分析

由 Dilworth 定理：最少不增子序列覆盖数 = 最长严格递增子序列长度。求 LIS 即可。

### 状态与转移

- 用耐心排序（贪心 + 二分）求 LIS 长度

### 核心代码

```cpp
vector<int> tails;
for (int i = 0; i < n; i++) {
    auto it = lower_bound(tails.begin(), tails.end(), h[i]);
    if (it == tails.end()) tails.push_back(h[i]);
    else *it = h[i];
}
printf("%d\n", (int)tails.size());
```

### 复杂度

$O(N \log N)$。

---

## 20. HDU 4283 - You Are the One（区间 DP）

### 题意

$N$ 个人排队，第 $i$ 个人愤怒值 $a_i$。有一个栈可以调整出场顺序。第 $k$ 个出场的人贡献 $(k-1) \times a_i$ 的不满意度。求最小总不满意度。

### 分析

区间 DP。$dp[i][j]$ 表示将原队列的区间 $[i, j]$ 按某种出栈顺序输出时的最小代价。枚举第 $i$ 个人是区间中第几个出场的。

### 状态与转移

- **状态**：$dp[i][j]$ = 区间 $[i, j]$ 的最小不满意度
- **转移**：枚举 $i$ 是第 $k$ 个出场（$k = 1, 2, \ldots, j-i+1$）：

$$dp[i][j] = \min_{k=1}^{j-i+1} \big(dp[i+1][i+k-1] + (k-1) \cdot a_i + dp[i+k][j] + k \cdot \text{sum}(i+k, j)\big)$$

### 核心代码

```cpp
for (int i = 0; i < n; i++) dp[i][i] = 0;
for (int len = 2; len <= n; len++)
    for (int i = 0; i + len - 1 < n; i++) {
        int j = i + len - 1;
        dp[i][j] = INF;
        for (int k = 1; k <= len; k++) {
            long long cost = dp[i+1][i+k-1] + (long long)(k-1) * a[i]
                           + dp[i+k][j] + (long long)k * (pre[j+1] - pre[i+k]);
            dp[i][j] = min(dp[i][j], cost);
        }
    }
```

### 复杂度

$O(N^3)$。

---

## 21. HDU 4745 - Two Rabbits（回文子序列 + 环）

### 题意

$N$ 个石头排成环，两只兔子从不同位置出发分别顺时针和逆时针跳。要求经过的石头形成对称序列。求最大跳跃次数之和。

### 分析

等价于：将环拆成链后，求最长回文子序列。环上问题需要枚举断开位置，取链长 $N$ 的最长回文子序列最大值。

### 状态与转移

- **状态**：$dp[i][j]$ = 链 $[i, j]$ 的最长回文子序列
- **转移**：
  - $a_i = a_j$：$dp[i][j] = dp[i+1][j-1] + 2$
  - 否则：$dp[i][j] = \max(dp[i+1][j],\; dp[i][j-1])$
- **答案**：对环上每个断点，$\max(dp[i][i+N-1])$

### 核心代码

```cpp
// 将序列复制一倍：a[0..2N-1]
for (int i = 0; i < 2 * n; i++) dp[i][i] = 1;
for (int len = 2; len <= n; len++)
    for (int i = 0; i + len - 1 < 2 * n; i++) {
        int j = i + len - 1;
        if (a[i % n] == a[j % n]) dp[i][j] = dp[i+1][j-1] + 2;
        else dp[i][j] = max(dp[i+1][j], dp[i][j-1]);
    }
int ans = 0;
for (int i = 0; i < n; i++) ans = max(ans, dp[i][i + n - 1]);
```

### 复杂度

$O(N^2)$。

---

## 22. HDU 2476 - String Painter（区间 DP）

### 题意

将字符串 $A$ 变成字符串 $B$，每次操作可将某区间 $[l, r]$ 全部染成同一字符。求最少操作次数。

### 分析

分两步：
1. 先求从空串变成 $B$ 的最小操作数 $f[l][r]$（纯区间 DP）
2. 再考虑 $A$ 的影响：$dp[i] = \min(dp[j-1] + f[j][i])$，若 $A[i] = B[i]$ 则 $dp[i] = dp[i-1]$

### 状态与转移

- **阶段一**：$f[i][j]$ = 空串变为 $B[i..j]$ 的最少操作
  - $f[i][i] = 1$
  - $B[i] = B[k]$ 时可合并：$f[i][j] = \min(f[i][j],\; f[i][k-1] + f[k+1][j])$（$k = i$ 时 $f[i][j] = f[i+1][j]$）
- **阶段二**：$dp[i] = \min_{0 \le j \le i}(dp[j-1] + f[j][i])$

### 核心代码

```cpp
// 阶段一：区间 DP
for (int i = 0; i < n; i++) f[i][i] = 1;
for (int len = 2; len <= n; len++)
    for (int i = 0; i + len - 1 < n; i++) {
        int j = i + len - 1;
        f[i][j] = f[i+1][j] + 1;
        for (int k = i + 1; k <= j; k++)
            if (B[i] == B[k])
                f[i][j] = min(f[i][j], f[i+1][k] + f[k+1][j]);
    }
// 阶段二：结合 A
for (int i = 0; i < n; i++) {
    dp[i] = f[0][i];
    if (A[i] == B[i]) dp[i] = (i > 0 ? dp[i-1] : 0);
    for (int j = 1; j <= i; j++)
        dp[i] = min(dp[i], dp[j-1] + f[j][i]);
}
```

### 复杂度

$O(N^3)$。

---

## 23. HDU 4632 - Palindrome subsequence（回文子序列计数）

### 题意

给字符串 $s$，求回文子序列的个数（模 $10007$）。

### 分析

和最长回文子序列不同，这题要数的是“有多少个回文子序列”，所以不能只看最长长度，而要处理不同区间里的计数重叠关系。

设 `dp[i][j]` 为区间 `s[i..j]` 内回文子序列个数。先把左端去掉、再把右端去掉，两部分会把中间 `dp[i+1][j-1]` 重复算一次，所以基础式是加两边减中间；若 `s[i]==s[j]`，再额外产生一批以这两个端点包起来的新回文子序列，因此还要补上 `dp[i+1][j-1]+1`。

这题最重要的是把“计数 + 去重”想清楚：**区间计数常先做容斥，再按特殊匹配关系补新增贡献。**

### 状态与转移

- **状态**：$dp[i][j]$ = $s[i..j]$ 中回文子序列数
- **转移**：
  - $dp[i][j] = dp[i+1][j] + dp[i][j-1] - dp[i+1][j-1]$
  - 若 $s[i] = s[j]$：$dp[i][j] += dp[i+1][j-1] + 1$
- **初始**：$dp[i][i] = 1$
- **答案**：$dp[0][n-1]$

### 核心代码

```cpp
for (int i = 0; i < n; i++) dp[i][i] = 1;
for (int len = 2; len <= n; len++)
    for (int i = 0; i + len - 1 < n; i++) {
        int j = i + len - 1;
        dp[i][j] = (dp[i+1][j] + dp[i][j-1] - dp[i+1][j-1] + MOD) % MOD;
        if (s[i] == s[j])
            dp[i][j] = (dp[i][j] + dp[i+1][j-1] + 1) % MOD;
    }
```

### 复杂度

$O(N^2)$。

---

## 24. HDU 2089 - 不要62（数位 DP）

### 题意

统计 $[n, m]$ 中不含 4 且不含连续 62 的数的个数。

### 分析

经典数位 DP 入门题。从高位到低位逐位填，维护前一位是否为 6。

### 状态与转移

- **状态**：$dp[pos][last6][tight]$
  - $pos$：当前位
  - $last6$：前一位是否为 6
  - $tight$：是否紧贴上界
- **转移**：枚举当前位 $d = 0 \sim 9$，跳过 $d = 4$ 和 $last6 \land d = 2$

### 核心代码

```cpp
int dfs(int pos, bool last6, bool tight) {
    if (pos < 0) return 1;
    if (memo[pos][last6][tight] != -1) return memo[pos][last6][tight];
    int limit = tight ? digits[pos] : 9;
    int res = 0;
    for (int d = 0; d <= limit; d++) {
        if (d == 4) continue;
        if (last6 && d == 2) continue;
        res += dfs(pos - 1, d == 6, tight && d == limit);
    }
    return memo[pos][last6][tight] = res;
}
// count(m) - count(n - 1)
```

### 复杂度

$O(\text{digits} \times 2 \times 2 \times 10)$。

---

## 25. HDU 3555 - Bomb（数位 DP）

### 题意

统计 $[1, N]$ 中包含连续 49 的数的个数。

### 分析

与"不要62"类似的数位 DP。维护前一位是否为 4，以及是否已出现 49。

### 状态与转移

- **状态**：$dp[pos][state][tight]$
  - $state$：0=正常，1=上一位是4，2=已出现49
- **转移**：根据当前 $d$ 和 $state$ 决定新状态

### 核心代码

```cpp
long long dfs(int pos, int state, bool tight) {
    if (pos < 0) return state == 2 ? 1 : 0;
    if (memo[pos][state][tight] != -1) return memo[pos][state][tight];
    int limit = tight ? digits[pos] : 9;
    long long res = 0;
    for (int d = 0; d <= limit; d++) {
        int ns = state;
        if (state == 0 && d == 4) ns = 1;
        else if (state == 1 && d == 9) ns = 2;
        else if (state == 1 && d != 4) ns = 0;
        res += dfs(pos - 1, ns, tight && d == limit);
    }
    return memo[pos][state][tight] = res;
}
```

### 复杂度

$O(\text{digits} \times 3 \times 2 \times 10)$。

---

## 26. HDU 4734 - F(x)（数位 DP）

### 题意

定义 $F(x) = \sum a_i \cdot 2^{n-i-1}$（$a_i$ 是 $x$ 的各位数字，$n$ 是位数）。给定 $A, B$，求 $[0, B]$ 中满足 $F(x) \le F(A)$ 的 $x$ 的个数。

### 分析

数位 DP，以"剩余额度"为状态。$F(A)$ 给定后，逐位扣减当前位的 $F$ 值贡献。

### 状态与转移

- **状态**：$dp[pos][remain][tight]$
  - $remain$：剩余可用的 $F$ 值
- **转移**：枚举当前位 $d$，新的 $remain = remain - d \cdot 2^{pos}$

### 核心代码

```cpp
int dfs(int pos, int remain, bool tight) {
    if (remain < 0) return 0;
    if (pos < 0) return 1;
    if (!tight && dp[pos][remain] != -1) return dp[pos][remain];
    int limit = tight ? digits[pos] : 9;
    int res = 0;
    for (int d = 0; d <= limit; d++)
        res += dfs(pos - 1, remain - d * (1 << pos), tight && d == limit);
    if (!tight) dp[pos][remain] = res;
    return res;
}
```

### 复杂度

$O(10 \times \text{digits} \times F_{\max})$。

---

## 27. HDU 2577 - How to Type（状态 DP）

### 题意

给一个字符串（含大小写字母），用键盘输入。Caps Lock 初始关闭。大写时可开 Caps Lock 直接打，或按住 Shift 打。求最少按键次数。

### 分析

这题的核心不是模拟打字过程，而是发现真正会影响后续代价的信息只有一个：当前 Caps Lock 是开还是关。

因此状态只需记 `dp[i][0/1]`，表示打完前 `i` 个字符且 Caps 处于关/开时的最小按键数。每来一个新字符，就在“直接敲”“按 Shift”“先切换 Caps 再敲”这些局部操作之间取最优。

这类题的迁移点很强：**如果历史操作很多，但未来只与某个很小的模式状态有关，就把那一点状态抽出来做 DP。**

### 状态与转移

- **状态**：$dp[i][0/1]$ = 打完前 $i$ 个字符后 Caps Lock 关/开的最少按键数
- **转移**：根据第 $i$ 个字符是大写还是小写分类讨论：
  - 小写字母：Caps 关时直接打（+1），Caps 开时可 Shift 打（+2）或先关 Caps（+2）
  - 大写字母：Caps 开时直接打（+1），Caps 关时可 Shift 打（+2）或先开 Caps（+2）

### 核心代码

```cpp
dp[0][0] = 0; dp[0][1] = 1; // 初始 Caps 关；开 Caps 需 1 次
for (int i = 1; i <= n; i++) {
    if (islower(s[i-1])) {
        dp[i][0] = min(dp[i-1][0] + 1, dp[i-1][1] + 2); // 关态打; 开态关Caps+打
        dp[i][1] = min(dp[i-1][1] + 2, dp[i-1][0] + 2); // 开态Shift打; 关态开Caps+打
    } else {
        dp[i][0] = min(dp[i-1][0] + 2, dp[i-1][1] + 2); // 关态Shift打; 开态关Caps+打
        dp[i][1] = min(dp[i-1][1] + 1, dp[i-1][0] + 2); // 开态打; 关态开Caps+打
    }
}
printf("%d\n", min(dp[n][0], dp[n][1]));
```

### 复杂度

$O(N)$。

---

## 28. HDU 2196 - Computer（树的最长路径 / 换根 DP）

### 题意

$N$ 个节点的树，求每个节点到最远节点的距离。

### 分析

经典换根 DP。两遍 DFS：
1. 第一遍求每个节点子树中的最远和次远距离
2. 第二遍换根，将父亲方向的最远距离传递下来

### 状态与转移

- **自底向上**：$d_1[v], d_2[v]$ = $v$ 子树中最远、次远距离
- **换根**：$ans[v] = \max(d_1[v],\; \text{from\_parent})$

### 核心代码

```cpp
void dfs1(int v, int par) {
    d1[v] = d2[v] = 0;
    for (auto [u, w] : adj[v]) {
        if (u == par) continue;
        dfs1(u, v);
        int val = d1[u] + w;
        if (val >= d1[v]) { d2[v] = d1[v]; d1[v] = val; ch1[v] = u; }
        else if (val > d2[v]) d2[v] = val;
    }
}

void dfs2(int v, int par, int fromPar) {
    ans[v] = max(d1[v], fromPar);
    for (auto [u, w] : adj[v]) {
        if (u == par) continue;
        int up = (ch1[v] == u) ? max(d2[v], fromPar) : max(d1[v], fromPar);
        dfs2(u, v, up + w);
    }
}
```

### 复杂度

$O(N)$。

---

## 29. HDU 1561 - The more, The Better（树形背包）

### 题意

$N$ 个城堡构成森林（加虚拟根 0 变成树），选 $m$ 个城堡（若选某城堡必须先选其父），求最大价值和。

### 分析

树形背包（依赖背包）。$dp[v][j]$ 表示 $v$ 的子树中选 $j$ 个的最大价值。

### 状态与转移

- **状态**：$dp[v][j]$ = $v$ 的子树中选 $j$ 个节点的最大价值
- **转移**：子树合并，类似分组背包

### 核心代码

```cpp
void dfs(int v) {
    dp[v][1] = val[v]; // 选 v 自身
    for (int u : children[v]) {
        dfs(u);
        for (int j = m; j >= 1; j--)
            for (int k = 1; k < j; k++)
                dp[v][j] = max(dp[v][j], dp[v][j - k] + dp[u][k]);
    }
}
// 加虚拟根 0 后调用 dfs(0)，答案为 dp[0][m+1]
```

### 复杂度

$O(Nm^2)$。

---

## 30. HDU 1565 - 方格取数(1)（状压 DP）

### 题意

$N \times N$（$N \le 20$）网格，选若干不相邻的格子，使数值之和最大。

### 分析

逐行状压，$dp[i][S]$ 表示前 $i$ 行、第 $i$ 行选取状态为 $S$ 的最大和。$S$ 需满足：无相邻位、且与上一行兼容。

### 状态与转移

- **状态**：$dp[i][S]$ = 前 $i$ 行、第 $i$ 行状态 $S$ 的最大和
- **合法性**：$(S \mathbin{\&} (S \ll 1)) = 0$（同行不相邻）且 $(S \mathbin{\&} S') = 0$（上下行不冲突）
- **转移**：$dp[i][S] = \max_{S'} dp[i-1][S'] + \text{sum}(i, S)$

### 核心代码

```cpp
// 预处理合法状态
for (int S = 0; S < (1 << n); S++)
    if (!(S & (S << 1))) valid.push_back(S);

for (int i = 0; i < n; i++)
    for (int S : valid) {
        int s = rowSum(i, S);
        if (i == 0) { dp[i][S] = s; continue; }
        for (int S2 : valid)
            if (!(S & S2))
                dp[i][S] = max(dp[i][S], dp[i-1][S2] + s);
    }
```

### 复杂度

$O(N \cdot V^2)$，$V$ 为合法状态数（斐波那契级别）。

---

## 31. HDU 1693 - Eat the Trees（插头 DP）

### 题意

$N \times M$（$N, M \le 12$）网格，部分格子是空地。用若干不相交的回路覆盖所有空地。求方案数。

### 分析

插头 DP 入门题。逐格转移，用位掩码表示轮廓线上的插头状态。由于允许多条回路，不需区分插头编号，只需记录有/无。

### 状态与转移

- **状态**：$dp[i][j][S]$ = 处理到 $(i, j)$ 时轮廓线状态 $S$ 的方案数
- $S$ 有 $M+1$ 位，每位表示对应边是否有插头
- **转移**：根据格子 $(i, j)$ 是否为空地，分类讨论左插头和上插头的有无

### 核心代码

```cpp
// 轮廓线上 M+1 个位置
dp[0] = 1; // 初始无插头
for (int i = 0; i < n; i++)
    for (int j = 0; j < m; j++) {
        map<int, long long> ndp;
        for (auto [S, ways] : dp) {
            int left = (S >> j) & 1;
            int up = (S >> (j + 1)) & 1;
            if (!grid[i][j]) { // 障碍
                if (!left && !up) ndp[S] += ways;
            } else {
                // 4 种组合讨论...
                // 详细转移省略，核心思想：左/上插头的连接与新建
            }
        }
        dp = ndp;
    }
```

### 复杂度

$O(NM \cdot 2^{M+1})$。

---

## 32. HDU 3001 - Travelling（三进制状压 DP）

### 题意

$N$（$N \le 10$）个城市，每个城市最多访问 2 次。求从任意城市出发访问所有城市的最小花费。

### 分析

TSP 变形。由于每城市可访问 $0/1/2$ 次，用**三进制**表示状态。

### 状态与转移

- **状态**：$dp[S][v]$ = 状态 $S$（三进制）下当前在 $v$ 的最小花费
- **转移**：$dp[S'][u] = \min(dp[S][v] + \text{dist}(v, u))$（$S'$ 是 $S$ 中 $u$ 位 +1）
- **初始**：$dp[\text{only\_v}][v] = 0$

### 核心代码

```cpp
// 预处理三进制的位操作
int pw3[11]; pw3[0] = 1;
for (int i = 1; i <= n; i++) pw3[i] = pw3[i-1] * 3;
int total = pw3[n];

memset(dp, 0x3f, sizeof(dp));
for (int v = 0; v < n; v++) dp[pw3[v]][v] = 0;

for (int S = 0; S < total; S++)
    for (int v = 0; v < n; v++) {
        if (dp[S][v] >= INF) continue;
        for (auto [u, w] : adj[v]) {
            int digit = (S / pw3[u]) % 3;
            if (digit >= 2) continue;
            int S2 = S + pw3[u];
            dp[S2][u] = min(dp[S2][u], dp[S][v] + w);
        }
    }
// 答案：min(dp[S][v]) 其中 S 的每一位 >= 1
```

### 复杂度

$O(3^N \cdot N \cdot E)$。

---

## 33. HDU 4405 - Aeroplane chess（期望 DP）

### 题意

$N$ 格棋盘（$0 \sim N$），从 0 出发，每次掷骰子走 $1 \sim 6$ 步。某些格子有传送门直接传到前方某格。求到达 $\ge N$ 的期望步数。

### 分析

期望题最怕顺着过程往前推，因为“下一步会去哪里”有很多随机分支；但若从终点往回看，状态定义就非常干净：`dp[i]` 表示从位置 `i` 走到终点还需要的期望步数。

若当前位置有传送门，那这一步没有决策，状态直接等于传送后的位置；否则掷骰子后会等概率去 `i+1...i+6`，所以当前期望就是“先花 1 步，再加上 6 个后继状态的平均值”。

这题要记住的不是公式，而是期望 DP 的常见起手式：**先定义“从当前状态到终点的期望代价”，再直接按全期望列方程。**

### 状态与转移

- **状态**：$dp[i]$ = 从格子 $i$ 到终点的期望步数
- **转移**：
  - 有传送门 $i \to j$：$dp[i] = dp[j]$
  - 无传送门：$dp[i] = 1 + \frac{1}{6}\sum_{k=1}^{6} dp[i+k]$
- **答案**：$dp[0]$

### 核心代码

```cpp
for (int i = n; i >= 0; i--) dp[i] = 0;
for (int i = n - 1; i >= 0; i--) {
    if (fly[i] > 0) { dp[i] = dp[fly[i]]; continue; }
    for (int k = 1; k <= 6; k++)
        dp[i] += dp[min(i + k, n)];
    dp[i] = dp[i] / 6.0 + 1.0;
}
```

### 复杂度

$O(6N)$。

---

## 34. HDU 4336 - Card Collector（期望 DP / 容斥）

### 题意

$N$ 种卡牌（$N \le 20$），每次购买获得第 $i$ 种的概率为 $p_i$（$\sum p_i \le 1$，可能什么都没得到）。求集齐所有卡牌的期望购买次数。

### 分析

**状压期望 DP**。$dp[S]$ = 已有集合 $S$ 到集齐的期望次数。也可用 min-max 容斥。

### 状态与转移

- **状态**：$dp[S]$ = 已有集合 $S$ 到全集的期望次数
- **转移**：$dp[S] = \frac{1 + (1 - \sum_{i \notin S} p_i) \cdot dp[S] + \sum_{i \notin S} p_i \cdot dp[S \cup \{i\}]}{}$

移项得：$dp[S] = \frac{1 + \sum_{i \notin S} p_i \cdot dp[S | (1 \ll i)]}{\sum_{i \notin S} p_i}$

### 核心代码

```cpp
int full = (1 << n) - 1;
dp[full] = 0;
for (int S = full - 1; S >= 0; S--) {
    double psum = 0;
    double val = 0;
    for (int i = 0; i < n; i++) {
        if (S >> i & 1) continue;
        psum += p[i];
        val += p[i] * dp[S | (1 << i)];
    }
    dp[S] = (1.0 + val) / psum;
}
// 答案：dp[0]
```

### 复杂度

$O(N \cdot 2^N)$。

---

## 35. HDU 1536 - S-Nim（Sprague-Grundy 定理）

### 题意

$K$ 个合法取石子数的集合 $S$，多轮游戏，每轮 $m$ 堆石子，两人轮流取（每堆取 $S$ 中数量）。判断先手是否必胜。

### 分析

Sprague-Grundy 定理：每堆的 SG 值异或。单堆 SG 值通过 BFS/枚举计算。

### 状态与转移

- **SG 值**：$sg[x] = \text{mex}\{sg[x - s] \mid s \in S, s \le x\}$
- **多堆**：答案 = $sg[n_1] \oplus sg[n_2] \oplus \cdots$

### 核心代码

```cpp
for (int x = 0; x <= MAXN; x++) {
    set<int> reachable;
    for (int s : S)
        if (s <= x) reachable.insert(sg[x - s]);
    int mex = 0;
    while (reachable.count(mex)) mex++;
    sg[x] = mex;
}
// 每局：xorSum = sg[n1] ^ sg[n2] ^ ...
// xorSum != 0 → W, else L
```

### 复杂度

$O(\max(n) \cdot |S|)$ 预处理。

---

## 36. HDU 4597 - Play Game（区间博弈 DP）

### 题意

两列牌各 $N$ 张，两人轮流取，每次从任一列的首或尾取一张。双方最优策略下，求先手得分最大值。

### 分析

四维区间 DP：$dp[l_1][r_1][l_2][r_2]$ 表示第一列剩 $[l_1, r_1]$、第二列剩 $[l_2, r_2]$ 时当前玩家的最大"自己 - 对手"得分差。

### 状态与转移

- **状态**：$dp[l_1][r_1][l_2][r_2]$ = 剩余状态下当前玩家的得分差最大值
- **转移**：取 4 种操作（两列各取首或尾）的最大值

$$dp[l_1][r_1][l_2][r_2] = \max\begin{cases} a[l_1] - dp[l_1+1][r_1][l_2][r_2] \\ a[r_1] - dp[l_1][r_1-1][l_2][r_2] \\ b[l_2] - dp[l_1][r_1][l_2+1][r_2] \\ b[r_2] - dp[l_1][r_1][l_2][r_2-1] \end{cases}$$

### 核心代码

```cpp
int solve(int l1, int r1, int l2, int r2) {
    if (l1 > r1 && l2 > r2) return 0;
    if (dp[l1][r1][l2][r2] != -INF) return dp[l1][r1][l2][r2];
    int &res = dp[l1][r1][l2][r2];
    res = -INF;
    if (l1 <= r1) {
        res = max(res, a[l1] - solve(l1+1, r1, l2, r2));
        res = max(res, a[r1] - solve(l1, r1-1, l2, r2));
    }
    if (l2 <= r2) {
        res = max(res, b[l2] - solve(l1, r1, l2+1, r2));
        res = max(res, b[r2] - solve(l1, r1, l2, r2-1));
    }
    return res;
}
// 先手得分 = (total + solve(0, n-1, 0, n-1)) / 2
```

### 复杂度

$O(N^4)$。

---

# 总结

## 知识点全景图

| 类别 | 题目 | 核心技术 |
|------|------|----------|
| **基础 DP** | 1, 2, 3, 4, 7 | 网格DP、最大子段和、$m$ 段子段和、线性DP、递增子序列和 |
| **背包 DP** | 8, 11, 12, 13, 14, 15, 16, 17 | 概率背包、排序+背包、多重背包、二维背包、完全背包 |
| **LIS 变形** | 5, 10, 19 | DAG DP、多条件 LIS、Dilworth 定理 |
| **区间 DP** | 20, 21, 22, 23 | 栈序区间DP、环上回文、两阶段区间DP、回文子序列计数 |
| **数位 DP** | 24, 25, 26 | 逐位枚举、状态标记、额度递减 |
| **树形 DP** | 28, 29 | 换根 DP、树形背包 |
| **状态 DP** | 27 | Caps Lock 开关状态 |
| **状压 DP** | 6, 30, 31, 32 | 位掩码最优化、逐行状压、插头 DP、三进制状压 |
| **概率/期望** | 33, 34 | 逆推期望、状压期望、min-max 容斥 |
| **博弈 DP** | 35, 36 | Sprague-Grundy、四维区间博弈 |
| **经典序列** | 9 | LCS |

## 学习路线建议

```
入门热身：1 → 4 → 2 → 7 → 9 → 16
    ↓
背包进阶：8 → 11 → 12 → 13 → 14 → 15 → 17
    ↓
序列 DP：5 → 10 → 19 → 3
    ↓
区间 DP：20 → 22 → 23 → 21
    ↓
数位 DP：24 → 25 → 26
    ↓
树形 DP：28 → 29 → 27
    ↓
状压 DP：6 → 30 → 32 → 31
    ↓
概率/博弈：33 → 34 → 35 → 36
    ↓
综合网格：18
```

## 解题方法论

1. **背包变形识别**：遇到"选若干物品在限制条件下最优化"，先判断是 01/完全/多重/分组背包，再看是否需要排序预处理（如 Proud Merchants）或概率转化（如 Robberies）。
2. **区间 DP 建模**：关键在于找到"最后一步"是什么——合并两段、选择分割点、确定某元素的出场位置等。
3. **数位 DP 三部曲**：确定需要维护的状态 → 确定当前位的限制 → 记忆化搜索。
4. **状压 DP 状态设计**：小 $N$（$\le 20$）时考虑位掩码；每元素有 $>2$ 种状态时考虑三进制或更高进制。
5. **期望 DP 逆推**：从终态向初态递推。遇到自环（停留原地）时移项处理。
6. **换根 DP 两遍 DFS**：第一遍求子树内信息，第二遍将父方向信息传递。需要"去掉某子节点贡献"时用最大/次大或前后缀积。

> **记住**：HDU 题目覆盖了 DP 的各个经典模型。掌握这 36 题，就能应对大部分 DP 类型的竞赛题目。
