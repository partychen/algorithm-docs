# CSES Problem Set - Dynamic Programming 题目整理

> 来源：[CSES Problem Set](https://cses.fi/problemset/)
>
> CSES (Code Submission Evaluation System) 是芬兰的算法竞赛练习平台，其 DP 专题共 23 题，覆盖从基础到进阶的各类动态规划问题。

## 题目列表

| # | 题目 | DP 类型 | 链接 |
|---|------|---------|------|
| 1 | Dice Combinations | 线性 DP（计数） | [1633](https://cses.fi/problemset/task/1633) |
| 2 | Minimizing Coins | 完全背包（最小值） | [1634](https://cses.fi/problemset/task/1634) |
| 3 | Coin Combinations I | 完全背包（计数，无序） | [1635](https://cses.fi/problemset/task/1635) |
| 4 | Coin Combinations II | 完全背包（计数，有序） | [1636](https://cses.fi/problemset/task/1636) |
| 5 | Removing Digits | 线性 DP / 贪心 | [1637](https://cses.fi/problemset/task/1637) |
| 6 | Grid Paths I | 网格路径 DP | [1638](https://cses.fi/problemset/task/1638) |
| 7 | Book Shop | 0/1 背包 | [1158](https://cses.fi/problemset/task/1158) |
| 8 | Array Description | 线性 DP（多状态） | [1746](https://cses.fi/problemset/task/1746) |
| 9 | Counting Towers | 线性 DP（分类讨论） | [2413](https://cses.fi/problemset/task/2413) |
| 10 | Edit Distance | 经典编辑距离 | [1639](https://cses.fi/problemset/task/1639) |
| 11 | Longest Common Subsequence | 最长公共子序列 (LCS) | [3403](https://cses.fi/problemset/task/3403) |
| 12 | Rectangle Cutting | 区间 DP | [1744](https://cses.fi/problemset/task/1744) |
| 13 | Minimal Grid Path | 网格路径 DP（带权） | [3359](https://cses.fi/problemset/task/3359) |
| 14 | Money Sums | 0/1 背包（可行性） | [1745](https://cses.fi/problemset/task/1745) |
| 15 | Removal Game | 区间 DP / 博弈 | [1097](https://cses.fi/problemset/task/1097) |
| 16 | Two Sets II | 背包计数 | [1093](https://cses.fi/problemset/task/1093) |
| 17 | Mountain Range | DP（待定） | [3314](https://cses.fi/problemset/task/3314) |
| 18 | Increasing Subsequence | 最长递增子序列 (LIS) | [1145](https://cses.fi/problemset/task/1145) |
| 19 | Projects | 区间调度 + DP | [1140](https://cses.fi/problemset/task/1140) |
| 20 | Elevator Rides | 状压 DP | [1653](https://cses.fi/problemset/task/1653) |
| 21 | Counting Tilings | 状压 DP（轮廓线） | [2181](https://cses.fi/problemset/task/2181) |
| 22 | Counting Numbers | 数位 DP | [2220](https://cses.fi/problemset/task/2220) |
| 23 | Increasing Subsequence II | LIS + 数据结构优化 | [1748](https://cses.fi/problemset/task/1748) |

## 按 DP 类型分类

### 线性 DP

| 题目 | 关键点 |
|------|--------|
| Dice Combinations | 骰子方案数，类似爬楼梯，$dp[i] = \sum_{j=1}^{6} dp[i-j]$ |
| Removing Digits | 每次减去当前数的某一位，求最小步数 |
| Array Description | 相邻元素差 $\leq 1$，填充缺失值的方案数 |
| Counting Towers | 两列积木塔的搭建方案，分"合并/不合并"讨论 |

### 背包 DP

| 题目 | 关键点 |
|------|--------|
| Minimizing Coins | 完全背包求最小硬币数（经典零钱兑换） |
| Coin Combinations I | 完全背包方案数，排列（顺序无关） |
| Coin Combinations II | 完全背包方案数，组合（考虑顺序） |
| Book Shop | 经典 0/1 背包，选书使总页数最大 |
| Money Sums | 0/1 背包，输出所有可能达到的金额 |
| Two Sets II | 将 $1 \sim n$ 分为两个等和子集的方案数 |

### 网格 DP

| 题目 | 关键点 |
|------|--------|
| Grid Paths I | 网格从左上到右下的路径计数，有障碍 |
| Minimal Grid Path | 网格路径上权值和最小化 |

### 区间 DP

| 题目 | 关键点 |
|------|--------|
| Rectangle Cutting | 将矩形切割为正方形的最小刀数 |
| Removal Game | 两端取数博弈，区间 DP 求最优分数 |

### 字符串 DP

| 题目 | 关键点 |
|------|--------|
| Edit Distance | 经典编辑距离，插入/删除/替换操作 |
| Longest Common Subsequence | LCS，需要输出具体方案 |

### 子序列 DP

| 题目 | 关键点 |
|------|--------|
| Increasing Subsequence | 经典 LIS，$O(n \log n)$ 二分解法 |
| Increasing Subsequence II | LIS 计数，BIT/线段树优化 |

### 区间调度 DP

| 题目 | 关键点 |
|------|--------|
| Projects | 带权区间调度，排序 + 二分 + DP |

### 状压 DP

| 题目 | 关键点 |
|------|--------|
| Elevator Rides | 状压 DP，最小化电梯趟数，$O(2^n \cdot n)$ |
| Counting Tilings | 轮廓线 DP，用 $1 \times 2$ 骨牌铺满 $n \times m$ 网格 |

### 数位 DP

| 题目 | 关键点 |
|------|--------|
| Counting Numbers | 统计区间内无相邻相同数字的数的个数 |

### 其他

| 题目 | 关键点 |
|------|--------|
| Mountain Range | DP 类问题 |

## 推荐刷题顺序

**入门（线性 DP + 背包）**：Dice Combinations → Minimizing Coins → Coin Combinations I → Coin Combinations II → Removing Digits → Book Shop → Money Sums

**基础进阶（网格 + 字符串 + 区间）**：Grid Paths I → Edit Distance → Rectangle Cutting → Longest Common Subsequence

**中级（多状态 DP + 子序列）**：Array Description → Counting Towers → Two Sets II → Increasing Subsequence → Removal Game → Projects

**高级（状压 + 数位 + 数据结构优化）**：Elevator Rides → Counting Tilings → Counting Numbers → Increasing Subsequence II → Minimal Grid Path → Mountain Range
