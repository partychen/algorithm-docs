# AtCoder Educational DP Contest 题目整理

> 来源：[AtCoder DP Contest](https://atcoder.jp/contests/dp/tasks)
>
> 这套题目是学习动态规划的经典题集，从基础到进阶覆盖了几乎所有常见 DP 类型，共 26 题 (A-Z)。

## 题目列表

| # | 题目 | DP 类型 | 链接 |
|---|------|---------|------|
| A | Frog 1 | 线性 DP | [dp_a](https://atcoder.jp/contests/dp/tasks/dp_a) |
| B | Frog 2 | 线性 DP | [dp_b](https://atcoder.jp/contests/dp/tasks/dp_b) |
| C | Vacation | 线性 DP（多状态） | [dp_c](https://atcoder.jp/contests/dp/tasks/dp_c) |
| D | Knapsack 1 | 0/1 背包 | [dp_d](https://atcoder.jp/contests/dp/tasks/dp_d) |
| E | Knapsack 2 | 0/1 背包（值域优化） | [dp_e](https://atcoder.jp/contests/dp/tasks/dp_e) |
| F | LCS | 最长公共子序列 | [dp_f](https://atcoder.jp/contests/dp/tasks/dp_f) |
| G | Longest Path | DAG 上 DP | [dp_g](https://atcoder.jp/contests/dp/tasks/dp_g) |
| H | Grid 1 | 网格路径 DP | [dp_h](https://atcoder.jp/contests/dp/tasks/dp_h) |
| I | Coins | 概率 DP | [dp_i](https://atcoder.jp/contests/dp/tasks/dp_i) |
| J | Sushi | 期望 DP | [dp_j](https://atcoder.jp/contests/dp/tasks/dp_j) |
| K | Stones | 博弈 DP | [dp_k](https://atcoder.jp/contests/dp/tasks/dp_k) |
| L | Deque | 博弈 DP（区间） | [dp_l](https://atcoder.jp/contests/dp/tasks/dp_l) |
| M | Candies | 前缀和优化 DP | [dp_m](https://atcoder.jp/contests/dp/tasks/dp_m) |
| N | Slimes | 区间 DP | [dp_n](https://atcoder.jp/contests/dp/tasks/dp_n) |
| O | Matching | 状压 DP | [dp_o](https://atcoder.jp/contests/dp/tasks/dp_o) |
| P | Independent Set | 树形 DP | [dp_p](https://atcoder.jp/contests/dp/tasks/dp_p) |
| Q | Flowers | DP + 数据结构优化（BIT/线段树） | [dp_q](https://atcoder.jp/contests/dp/tasks/dp_q) |
| R | Walk | 矩阵快速幂 | [dp_r](https://atcoder.jp/contests/dp/tasks/dp_r) |
| S | Digit Sum | 数位 DP | [dp_s](https://atcoder.jp/contests/dp/tasks/dp_s) |
| T | Permutation | 排列 DP | [dp_t](https://atcoder.jp/contests/dp/tasks/dp_t) |
| U | Grouping | 子集枚举 DP（状压） | [dp_u](https://atcoder.jp/contests/dp/tasks/dp_u) |
| V | Subtree | 换根 DP | [dp_v](https://atcoder.jp/contests/dp/tasks/dp_v) |
| W | Intervals | 线段树优化 DP | [dp_w](https://atcoder.jp/contests/dp/tasks/dp_w) |
| X | Tower | 贪心排序 + 背包 DP | [dp_x](https://atcoder.jp/contests/dp/tasks/dp_x) |
| Y | Grid 2 | 容斥 + DP | [dp_y](https://atcoder.jp/contests/dp/tasks/dp_y) |
| Z | Frog 3 | 斜率优化 DP (CHT) | [dp_z](https://atcoder.jp/contests/dp/tasks/dp_z) |

## 按 DP 类型分类

### 线性 DP

| 题目 | 关键点 |
|------|--------|
| A - Frog 1 | 最基础的线性 DP，只能跳 1 或 2 步 |
| B - Frog 2 | Frog 1 的扩展，可以跳 1~K 步 |
| C - Vacation | 多维状态的线性 DP，每天选三种活动之一 |

### 背包 DP

| 题目 | 关键点 |
|------|--------|
| D - Knapsack 1 | 经典 0/1 背包，重量小值大 |
| E - Knapsack 2 | 0/1 背包值域优化，重量大值小，交换 DP 维度 |
| X - Tower | 贪心排序确定顺序后做背包 |

### 区间 DP

| 题目 | 关键点 |
|------|--------|
| N - Slimes | 经典区间 DP，合并石子问题 |
| L - Deque | 区间博弈 DP，两端取数 |

### 树形 DP

| 题目 | 关键点 |
|------|--------|
| P - Independent Set | 树上独立集计数，黑白染色 |
| V - Subtree | 换根 DP，需要前后缀积技巧 |

### 数位 DP

| 题目 | 关键点 |
|------|--------|
| S - Digit Sum | 经典数位 DP，统计数位和被 D 整除的数 |

### 状压 DP

| 题目 | 关键点 |
|------|--------|
| O - Matching | 状压 DP 做二分图完美匹配计数 |
| U - Grouping | 子集枚举，枚举子集的子集 $O(3^n)$ |

### 概率 / 期望 DP

| 题目 | 关键点 |
|------|--------|
| I - Coins | 概率 DP，正面朝上超过一半的概率 |
| J - Sushi | 期望 DP，状态压缩 + 推公式消除循环依赖 |

### 博弈 DP

| 题目 | 关键点 |
|------|--------|
| K - Stones | Nim 类博弈，先手必胜/必败判断 |
| L - Deque | 区间博弈，最优策略下的分差 |

### 图上 DP

| 题目 | 关键点 |
|------|--------|
| G - Longest Path | DAG 最长路，拓扑排序 + DP |
| R - Walk | 邻接矩阵快速幂，统计长度为 K 的路径数 |

### 网格 DP

| 题目 | 关键点 |
|------|--------|
| H - Grid 1 | 基础网格路径计数，有障碍物 |
| Y - Grid 2 | 网格路径计数 + 容斥原理，障碍物数量少 |

### 数据结构优化 DP

| 题目 | 关键点 |
|------|--------|
| M - Candies | 前缀和优化，将 $O(n \cdot m \cdot k)$ 降为 $O(n \cdot m)$ |
| Q - Flowers | BIT / 线段树维护前缀最大值，LIS 变体 |
| W - Intervals | 线段树优化转移，区间加 + 查询最大值 |

### 斜率优化 DP

| 题目 | 关键点 |
|------|--------|
| Z - Frog 3 | 凸包技巧 (Convex Hull Trick)，将 $O(n^2)$ 优化为 $O(n)$ |

### 其他经典

| 题目 | 关键点 |
|------|--------|
| F - LCS | 最长公共子序列，需要回溯输出方案 |
| T - Permutation | 排列计数 DP，前缀和优化 |

## 推荐刷题顺序

**入门 (线性 DP + 背包)**：A → B → C → D → E → F

**基础进阶 (网格 + 区间 + 图)**：H → G → N → K → L

**中级 (概率/期望 + 树形 + 数位)**：I → J → P → S → T

**高级 (状压 + 数据结构优化)**：O → U → M → Q → W

**进阶 (综合技巧)**：R → V → X → Y → Z
