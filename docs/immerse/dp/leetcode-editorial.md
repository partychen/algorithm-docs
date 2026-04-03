---
title: "LeetCode 经典DP专题精选解题报告"
subtitle: "💡 36 道 LeetCode 经典 DP 题目的分析方法、解题思路与核心代码"
order: 3
icon: "💡"
---

# LeetCode 经典DP专题精选解题报告

> 来源：[LeetCode](https://leetcode.com/)
>
> 本报告针对 LeetCode 经典 DP 36 题，逐题给出**题意概述 → 分析方法 → 状态设计 → 转移方程 → 核心代码 → 复杂度**，最后做整体总结。

---

## 1. LC 70 - Climbing Stairs（线性 DP 入门）

### 题意

$N$ 阶楼梯，每次爬 1 或 2 阶。求到达顶部的方案数。

### 分析

最经典的线性 DP / 斐波那契数列。

### 状态与转移

- **状态**：$dp[i]$ = 到达第 $i$ 阶的方案数
- **转移**：$dp[i] = dp[i-1] + dp[i-2]$
- **初始**：$dp[0] = 1,\; dp[1] = 1$

### 核心代码

```cpp
int climbStairs(int n) {
    if (n <= 1) return 1;
    int a = 1, b = 1;
    for (int i = 2; i <= n; i++) { int c = a + b; a = b; b = c; }
    return b;
}
```

### 复杂度

$O(N)$ 时间，$O(1)$ 空间。

---

## 2. LC 198 - House Robber（不相邻取数）

### 题意

一排房屋，每间有金额 $a_i$。不能偷相邻两间。求最大金额。

### 分析

经典"不相邻取数"模型。

### 状态与转移

- **状态**：$dp[i]$ = 前 $i$ 间的最大金额
- **转移**：$dp[i] = \max(dp[i-1],\; dp[i-2] + a[i])$

### 核心代码

```cpp
int rob(vector<int>& nums) {
    int prev2 = 0, prev1 = 0;
    for (int x : nums) { int cur = max(prev1, prev2 + x); prev2 = prev1; prev1 = cur; }
    return prev1;
}
```

### 复杂度

$O(N)$。

---

## 3. LC 213 - House Robber II（环形不相邻取数）

### 题意

同上，但房屋围成环。

### 分析

首尾不能同时偷。分两种情况：偷 $[0, N-2]$ 或 $[1, N-1]$，取最大值。

### 状态与转移

- 两次 House Robber I，取 $\max$

### 核心代码

```cpp
int rob(vector<int>& nums) {
    int n = nums.size();
    if (n == 1) return nums[0];
    return max(robRange(nums, 0, n-2), robRange(nums, 1, n-1));
}
```

### 复杂度

$O(N)$。

---

## 4. LC 139 - Word Break（完全背包变形）

### 题意

字符串 $s$ 和单词字典 $\text{wordDict}$。判断 $s$ 是否能被拆分为字典中的单词。

### 分析

$dp[i]$ = $s[0..i-1]$ 能否被拆分。

### 状态与转移

- **状态**：$dp[i]$ = $s[0..i-1]$ 是否可拆
- **转移**：$dp[i] = \bigvee_{w \in \text{dict}} (dp[i - |w|]$ 且 $s[i-|w|..i-1] = w)$

### 核心代码

```cpp
bool wordBreak(string s, vector<string>& wordDict) {
    int n = s.size();
    vector<bool> dp(n + 1, false);
    dp[0] = true;
    set<string> dict(wordDict.begin(), wordDict.end());
    for (int i = 1; i <= n; i++)
        for (int j = 0; j < i; j++)
            if (dp[j] && dict.count(s.substr(j, i - j)))
                { dp[i] = true; break; }
    return dp[n];
}
```

### 复杂度

$O(N^2 \cdot L)$，$L$ = 最大单词长度。

---

## 5. LC 300 - Longest Increasing Subsequence（LIS）

### 题意

给数组，求最长严格递增子序列长度。

### 分析

耐心排序（贪心 + 二分）可达 $O(N \log N)$。

### 状态与转移

- **贪心**：$\text{tails}[i]$ = 长度为 $i+1$ 的 LIS 末尾最小值
- **更新**：二分查找插入位置

### 核心代码

```cpp
int lengthOfLIS(vector<int>& nums) {
    vector<int> tails;
    for (int x : nums) {
        auto it = lower_bound(tails.begin(), tails.end(), x);
        if (it == tails.end()) tails.push_back(x);
        else *it = x;
    }
    return tails.size();
}
```

### 复杂度

$O(N \log N)$。

---

## 6. LC 152 - Maximum Product Subarray（双状态线性 DP）

### 题意

给整数数组，求连续子数组的最大乘积。

### 分析

由于负数可翻转符号，需同时维护最大值和最小值。

### 状态与转移

- **状态**：$\text{mx}[i]$ = 以 $i$ 结尾的最大乘积，$\text{mn}[i]$ = 最小乘积
- **转移**：$\text{mx}[i] = \max(a[i],\; a[i] \cdot \text{mx}[i-1],\; a[i] \cdot \text{mn}[i-1])$

### 核心代码

```cpp
int maxProduct(vector<int>& nums) {
    int mx = nums[0], mn = nums[0], ans = nums[0];
    for (int i = 1; i < (int)nums.size(); i++) {
        int a = mx * nums[i], b = mn * nums[i];
        mx = max({nums[i], a, b});
        mn = min({nums[i], a, b});
        ans = max(ans, mx);
    }
    return ans;
}
```

### 复杂度

$O(N)$。

---

## 7. LC 62 - Unique Paths（网格路径计数）

### 题意

$m \times n$ 网格，从左上到右下，只能向右或向下。求路径数。

### 分析

$dp[i][j] = dp[i-1][j] + dp[i][j-1]$。也可组合数 $\binom{m+n-2}{m-1}$。

### 状态与转移

- **状态**：$dp[i][j]$ = 到 $(i, j)$ 的路径数
- **转移**：$dp[i][j] = dp[i-1][j] + dp[i][j-1]$

### 核心代码

```cpp
int uniquePaths(int m, int n) {
    vector<int> dp(n, 1);
    for (int i = 1; i < m; i++)
        for (int j = 1; j < n; j++)
            dp[j] += dp[j-1];
    return dp[n-1];
}
```

### 复杂度

$O(mn)$。

---

## 8. LC 63 - Unique Paths II（带障碍网格）

### 题意

同上，但某些格子有障碍。

### 分析

遇到障碍置 0。

### 状态与转移

- 同 LC 62，$\text{grid}[i][j] = 1$ 时 $dp[i][j] = 0$

### 核心代码

```cpp
int uniquePathsWithObstacles(vector<vector<int>>& grid) {
    int n = grid[0].size();
    vector<long long> dp(n, 0);
    dp[0] = 1;
    for (auto& row : grid) {
        for (int j = 0; j < n; j++) {
            if (row[j]) dp[j] = 0;
            else if (j > 0) dp[j] += dp[j-1];
        }
    }
    return dp[n-1];
}
```

### 复杂度

$O(mn)$。

---

## 9. LC 64 - Minimum Path Sum（最短路径和）

### 题意

$m \times n$ 网格，每格有非负值。从左上到右下（向右/下），求最小路径和。

### 分析

基础网格 DP。

### 状态与转移

- $dp[i][j] = \min(dp[i-1][j],\; dp[i][j-1]) + \text{grid}[i][j]$

### 核心代码

```cpp
int minPathSum(vector<vector<int>>& grid) {
    int m = grid.size(), n = grid[0].size();
    for (int i = 0; i < m; i++)
        for (int j = 0; j < n; j++) {
            if (i == 0 && j == 0) continue;
            int top = i > 0 ? grid[i-1][j] : INT_MAX;
            int left = j > 0 ? grid[i][j-1] : INT_MAX;
            grid[i][j] += min(top, left);
        }
    return grid[m-1][n-1];
}
```

### 复杂度

$O(mn)$。

---

## 10. LC 120 - Triangle（三角形最短路径）

### 题意

三角形数组，从顶到底，每步移动到下一行相邻节点。求最小路径和。

### 分析

从底向上 DP。

### 状态与转移

- $dp[j] = \min(dp[j], dp[j+1]) + \text{tri}[i][j]$（从底向上）

### 核心代码

```cpp
int minimumTotal(vector<vector<int>>& tri) {
    vector<int> dp = tri.back();
    for (int i = tri.size() - 2; i >= 0; i--)
        for (int j = 0; j <= i; j++)
            dp[j] = min(dp[j], dp[j+1]) + tri[i][j];
    return dp[0];
}
```

### 复杂度

$O(N^2)$。

---

## 11. LC 221 - Maximal Square（最大正方形）

### 题意

0/1 矩阵中找最大全 1 正方形的面积。

### 分析

$dp[i][j]$ = 以 $(i,j)$ 为右下角的最大正方形边长。

### 状态与转移

- $dp[i][j] = \min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]) + 1$（当 $\text{grid}[i][j] = 1$）

### 核心代码

```cpp
int maximalSquare(vector<vector<char>>& matrix) {
    int m = matrix.size(), n = matrix[0].size(), maxSide = 0;
    vector<vector<int>> dp(m, vector<int>(n, 0));
    for (int i = 0; i < m; i++)
        for (int j = 0; j < n; j++) {
            if (matrix[i][j] == '0') continue;
            dp[i][j] = (i && j) ? min({dp[i-1][j], dp[i][j-1], dp[i-1][j-1]}) + 1 : 1;
            maxSide = max(maxSide, dp[i][j]);
        }
    return maxSide * maxSide;
}
```

### 复杂度

$O(mn)$。

---

## 12. LC 85 - Maximal Rectangle（最大矩形）

### 题意

0/1 矩阵中找最大全 1 矩形的面积。

### 分析

逐行构建直方图高度，每行用"柱状图最大矩形"（单调栈）求解。

### 状态与转移

- $\text{heights}[j] = $ 当前行上方连续 1 的高度
- 每行做一次 LC 84（Largest Rectangle in Histogram）

### 核心代码

```cpp
int maximalRectangle(vector<vector<char>>& matrix) {
    int m = matrix.size(), n = matrix[0].size(), ans = 0;
    vector<int> h(n, 0);
    for (int i = 0; i < m; i++) {
        for (int j = 0; j < n; j++)
            h[j] = matrix[i][j] == '1' ? h[j] + 1 : 0;
        ans = max(ans, largestRectangleInHistogram(h));
    }
    return ans;
}
```

### 复杂度

$O(mn)$。

---

## 13. LC 322 - Coin Change（完全背包 - 最少硬币）

### 题意

硬币面额集合，凑出金额 $\text{amount}$ 的最少硬币数。

### 分析

完全背包求最小值。

### 状态与转移

- **状态**：$dp[j]$ = 凑出金额 $j$ 的最少硬币数
- **转移**：$dp[j] = \min_{c \in \text{coins}} dp[j - c] + 1$

### 核心代码

```cpp
int coinChange(vector<int>& coins, int amount) {
    vector<int> dp(amount + 1, amount + 1);
    dp[0] = 0;
    for (int j = 1; j <= amount; j++)
        for (int c : coins)
            if (j >= c) dp[j] = min(dp[j], dp[j - c] + 1);
    return dp[amount] > amount ? -1 : dp[amount];
}
```

### 复杂度

$O(\text{amount} \cdot |\text{coins}|)$。

---

## 14. LC 518 - Coin Change II（完全背包 - 方案数）

### 题意

同上，但求方案数。

### 分析

完全背包计数。注意枚举顺序：外层物品、内层金额。

### 状态与转移

- $dp[j] \mathrel{+}= dp[j - c]$

### 核心代码

```cpp
int change(int amount, vector<int>& coins) {
    vector<int> dp(amount + 1, 0);
    dp[0] = 1;
    for (int c : coins)
        for (int j = c; j <= amount; j++)
            dp[j] += dp[j - c];
    return dp[amount];
}
```

### 复杂度

$O(\text{amount} \cdot |\text{coins}|)$。

---

## 15. LC 416 - Partition Equal Subset Sum（01 背包可达性）

### 题意

数组能否分成两个子集使和相等。

### 分析

总和为奇数则不可能。否则 01 背包判断能否凑出 $\text{sum}/2$。

### 状态与转移

- $dp[j] = dp[j] \lor dp[j - \text{nums}[i]]$

### 核心代码

```cpp
bool canPartition(vector<int>& nums) {
    int sum = accumulate(nums.begin(), nums.end(), 0);
    if (sum & 1) return false;
    int target = sum / 2;
    vector<bool> dp(target + 1, false);
    dp[0] = true;
    for (int x : nums)
        for (int j = target; j >= x; j--)
            dp[j] = dp[j] || dp[j - x];
    return dp[target];
}
```

### 复杂度

$O(N \cdot \text{sum})$。

---

## 16. LC 494 - Target Sum（01 背包变形）

### 题意

数组每个元素前加 $+$ 或 $-$，求结果等于 $\text{target}$ 的方案数。

### 分析

设正子集和 $P$，则 $P = (\text{sum} + \text{target}) / 2$。转为 01 背包计数。

### 状态与转移

- $dp[j] \mathrel{+}= dp[j - x]$

### 核心代码

```cpp
int findTargetSumWays(vector<int>& nums, int target) {
    int sum = accumulate(nums.begin(), nums.end(), 0);
    if ((sum + target) % 2 || abs(target) > sum) return 0;
    int P = (sum + target) / 2;
    vector<int> dp(P + 1, 0);
    dp[0] = 1;
    for (int x : nums)
        for (int j = P; j >= x; j--)
            dp[j] += dp[j - x];
    return dp[P];
}
```

### 复杂度

$O(N \cdot P)$。

---

## 17. LC 474 - Ones and Zeroes（二维 01 背包）

### 题意

字符串数组（每个由 0 和 1 组成），最多用 $m$ 个 0 和 $n$ 个 1，求最多能选几个字符串。

### 分析

二维费用的 01 背包。

### 状态与转移

- $dp[i][j] = \max(dp[i][j],\; dp[i - c_0][j - c_1] + 1)$

### 核心代码

```cpp
int findMaxForm(vector<string>& strs, int m, int n) {
    vector<vector<int>> dp(m + 1, vector<int>(n + 1, 0));
    for (auto& s : strs) {
        int c0 = count(s.begin(), s.end(), '0');
        int c1 = s.size() - c0;
        for (int i = m; i >= c0; i--)
            for (int j = n; j >= c1; j--)
                dp[i][j] = max(dp[i][j], dp[i - c0][j - c1] + 1);
    }
    return dp[m][n];
}
```

### 复杂度

$O(|S| \cdot mn)$。

---

## 18. LC 377 - Combination Sum IV（排列型完全背包）

### 题意

正整数数组，凑出目标值 $\text{target}$ 的排列方案数（顺序不同算不同）。

### 分析

外层枚举目标值、内层枚举物品（与 Coin Change II 枚举顺序相反）。

### 状态与转移

- $dp[j] = \sum_{x \in \text{nums}} dp[j - x]$

### 核心代码

```cpp
int combinationSum4(vector<int>& nums, int target) {
    vector<unsigned long long> dp(target + 1, 0);
    dp[0] = 1;
    for (int j = 1; j <= target; j++)
        for (int x : nums)
            if (j >= x) dp[j] += dp[j - x];
    return dp[target];
}
```

### 复杂度

$O(\text{target} \cdot |\text{nums}|)$。

---

## 19. LC 5 - Longest Palindromic Substring（回文子串）

### 题意

求字符串的最长回文子串。

### 分析

中心扩展法 $O(N^2)$ 或 Manacher $O(N)$。

### 状态与转移

- **中心扩展**：枚举每个中心点（奇偶长度），向两边扩展

### 核心代码

```cpp
string longestPalindrome(string s) {
    int n = s.size(), start = 0, maxLen = 1;
    auto expand = [&](int l, int r) {
        while (l >= 0 && r < n && s[l] == s[r]) { l--; r++; }
        if (r - l - 1 > maxLen) { maxLen = r - l - 1; start = l + 1; }
    };
    for (int i = 0; i < n; i++) { expand(i, i); expand(i, i + 1); }
    return s.substr(start, maxLen);
}
```

### 复杂度

$O(N^2)$。

---

## 20. LC 516 - Longest Palindromic Subsequence（最长回文子序列）

### 题意

求字符串的最长回文子序列长度。

### 分析

区间 DP。

### 状态与转移

- $dp[i][j]$ = $s[i..j]$ 的最长回文子序列
- $s[i] = s[j]$：$dp[i][j] = dp[i+1][j-1] + 2$
- 否则：$dp[i][j] = \max(dp[i+1][j], dp[i][j-1])$

### 核心代码

```cpp
int longestPalindromeSubseq(string s) {
    int n = s.size();
    vector<vector<int>> dp(n, vector<int>(n, 0));
    for (int i = n - 1; i >= 0; i--) {
        dp[i][i] = 1;
        for (int j = i + 1; j < n; j++)
            dp[i][j] = s[i] == s[j] ? dp[i+1][j-1] + 2 : max(dp[i+1][j], dp[i][j-1]);
    }
    return dp[0][n-1];
}
```

### 复杂度

$O(N^2)$。

---

## 21. LC 1143 - Longest Common Subsequence（LCS）

### 题意

两个字符串的 LCS 长度。

### 分析

经典 LCS。

### 状态与转移

- $s[i] = t[j]$：$dp[i][j] = dp[i-1][j-1] + 1$
- 否则：$dp[i][j] = \max(dp[i-1][j], dp[i][j-1])$

### 核心代码

```cpp
int longestCommonSubsequence(string s, string t) {
    int m = s.size(), n = t.size();
    vector<vector<int>> dp(m + 1, vector<int>(n + 1, 0));
    for (int i = 1; i <= m; i++)
        for (int j = 1; j <= n; j++)
            dp[i][j] = s[i-1] == t[j-1] ? dp[i-1][j-1] + 1 : max(dp[i-1][j], dp[i][j-1]);
    return dp[m][n];
}
```

### 复杂度

$O(mn)$。

---

## 22. LC 72 - Edit Distance（编辑距离）

### 题意

两个字符串，通过插入/删除/替换操作变为相同。求最少操作数。

### 分析

经典编辑距离 DP。

### 状态与转移

- $s[i] = t[j]$：$dp[i][j] = dp[i-1][j-1]$
- 否则：$dp[i][j] = \min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]) + 1$

### 核心代码

```cpp
int minDistance(string s, string t) {
    int m = s.size(), n = t.size();
    vector<vector<int>> dp(m + 1, vector<int>(n + 1, 0));
    for (int i = 0; i <= m; i++) dp[i][0] = i;
    for (int j = 0; j <= n; j++) dp[0][j] = j;
    for (int i = 1; i <= m; i++)
        for (int j = 1; j <= n; j++)
            dp[i][j] = s[i-1] == t[j-1] ? dp[i-1][j-1]
                : min({dp[i-1][j], dp[i][j-1], dp[i-1][j-1]}) + 1;
    return dp[m][n];
}
```

### 复杂度

$O(mn)$。

---

## 23. LC 10 - Regular Expression Matching（正则匹配）

### 题意

实现 `.`（匹配任意字符）和 `*`（前一个字符零次或多次）的正则匹配。

### 分析

$dp[i][j]$ = $s[0..i-1]$ 是否匹配 $p[0..j-1]$。

### 状态与转移

- $p[j-1] \neq$ `*`：$dp[i][j] = dp[i-1][j-1] \land \text{match}(s[i-1], p[j-1])$
- $p[j-1] =$ `*`：
  - 零次：$dp[i][j] = dp[i][j-2]$
  - 多次：$dp[i][j] = dp[i-1][j] \land \text{match}(s[i-1], p[j-2])$

### 核心代码

```cpp
bool isMatch(string s, string p) {
    int m = s.size(), n = p.size();
    vector<vector<bool>> dp(m + 1, vector<bool>(n + 1, false));
    dp[0][0] = true;
    for (int j = 2; j <= n; j++)
        if (p[j-1] == '*') dp[0][j] = dp[0][j-2];
    for (int i = 1; i <= m; i++)
        for (int j = 1; j <= n; j++) {
            if (p[j-1] == '*') {
                dp[i][j] = dp[i][j-2];
                if (p[j-2] == '.' || p[j-2] == s[i-1])
                    dp[i][j] = dp[i][j] || dp[i-1][j];
            } else {
                dp[i][j] = dp[i-1][j-1] && (p[j-1] == '.' || p[j-1] == s[i-1]);
            }
        }
    return dp[m][n];
}
```

### 复杂度

$O(mn)$。

---

## 24. LC 44 - Wildcard Matching（通配符匹配）

### 题意

`?` 匹配任意单字符，`*` 匹配任意字符串（包括空）。

### 分析

类似正则匹配但更简单。`*` 不绑定前一字符。

### 状态与转移

- $p[j-1] =$ `*`：$dp[i][j] = dp[i][j-1] \lor dp[i-1][j]$
- 否则：$dp[i][j] = dp[i-1][j-1] \land (p[j-1] = $ `?` $\lor p[j-1] = s[i-1])$

### 核心代码

```cpp
bool isMatch(string s, string p) {
    int m = s.size(), n = p.size();
    vector<vector<bool>> dp(m + 1, vector<bool>(n + 1, false));
    dp[0][0] = true;
    for (int j = 1; j <= n; j++)
        dp[0][j] = p[j-1] == '*' && dp[0][j-1];
    for (int i = 1; i <= m; i++)
        for (int j = 1; j <= n; j++) {
            if (p[j-1] == '*') dp[i][j] = dp[i][j-1] || dp[i-1][j];
            else dp[i][j] = dp[i-1][j-1] && (p[j-1] == '?' || p[j-1] == s[i-1]);
        }
    return dp[m][n];
}
```

### 复杂度

$O(mn)$。

---

## 25. LC 312 - Burst Balloons（区间 DP）

### 题意

$N$ 个气球，戳破第 $i$ 个得 $\text{nums}[l] \times \text{nums}[i] \times \text{nums}[r]$（$l, r$ 为相邻的未戳破气球）。求最大得分。

### 分析

经典区间 DP。$dp[l][r]$ = 戳破 $(l, r)$ 开区间内所有气球的最大得分。枚举最后一个戳破的。

### 状态与转移

- **状态**：$dp[l][r]$ = 开区间 $(l, r)$ 的最大得分
- **转移**：$dp[l][r] = \max_{l < k < r} (dp[l][k] + dp[k][r] + a[l] \cdot a[k] \cdot a[r])$

### 核心代码

```cpp
int maxCoins(vector<int>& nums) {
    int n = nums.size();
    vector<int> a = {1};
    for (int x : nums) a.push_back(x);
    a.push_back(1);
    vector<vector<int>> dp(n + 2, vector<int>(n + 2, 0));
    for (int len = 2; len <= n + 1; len++)
        for (int l = 0; l + len <= n + 1; l++) {
            int r = l + len;
            for (int k = l + 1; k < r; k++)
                dp[l][r] = max(dp[l][r], dp[l][k] + dp[k][r] + a[l]*a[k]*a[r]);
        }
    return dp[0][n + 1];
}
```

### 复杂度

$O(N^3)$。

---

## 26. LC 1039 - Minimum Score Triangulation（三角剖分）

### 题意

凸多边形 $N$ 个顶点，三角剖分使三角形顶点值之积的总和最小。

### 分析

区间 DP。$dp[i][j]$ = 从顶点 $i$ 到 $j$ 的多边形三角剖分最小代价。

### 状态与转移

- $dp[i][j] = \min_{i < k < j} (dp[i][k] + dp[k][j] + v[i] \cdot v[k] \cdot v[j])$

### 核心代码

```cpp
int minScoreTriangulation(vector<int>& v) {
    int n = v.size();
    vector<vector<int>> dp(n, vector<int>(n, 0));
    for (int len = 3; len <= n; len++)
        for (int i = 0; i + len - 1 < n; i++) {
            int j = i + len - 1;
            dp[i][j] = INT_MAX;
            for (int k = i + 1; k < j; k++)
                dp[i][j] = min(dp[i][j], dp[i][k] + dp[k][j] + v[i]*v[k]*v[j]);
        }
    return dp[0][n-1];
}
```

### 复杂度

$O(N^3)$。

---

## 27. LC 87 - Scramble String（区间 DP / 记忆化）

### 题意

判断 $s_2$ 是否是 $s_1$ 的 Scramble String（可递归切分交换子串）。

### 分析

记忆化搜索。对每种切割位置，判断两段是否对应匹配或交叉匹配。

### 状态与转移

- $\text{solve}(s_1, s_2)$：枚举切割点 $k$，检查 $(s_1[:k], s_2[:k])$ 和 $(s_1[k:], s_2[k:])$，或交叉匹配

### 核心代码

```cpp
unordered_map<string, bool> memo;
bool isScramble(string s1, string s2) {
    if (s1 == s2) return true;
    string key = s1 + "#" + s2;
    if (memo.count(key)) return memo[key];
    int n = s1.size();
    // 字符计数剪枝
    for (int i = 1; i < n; i++) {
        if (isScramble(s1.substr(0,i), s2.substr(0,i))
         && isScramble(s1.substr(i), s2.substr(i))) return memo[key] = true;
        if (isScramble(s1.substr(0,i), s2.substr(n-i))
         && isScramble(s1.substr(i), s2.substr(0,n-i))) return memo[key] = true;
    }
    return memo[key] = false;
}
```

### 复杂度

$O(N^4)$。

---

## 28. LC 121 - Best Time to Buy and Sell Stock（单次交易）

### 题意

一次买卖股票的最大利润。

### 分析

维护前缀最小值。

### 状态与转移

- $\text{ans} = \max(\text{price}[i] - \text{minPrice})$

### 核心代码

```cpp
int maxProfit(vector<int>& prices) {
    int minP = INT_MAX, ans = 0;
    for (int p : prices) { minP = min(minP, p); ans = max(ans, p - minP); }
    return ans;
}
```

### 复杂度

$O(N)$。

---

## 29. LC 122 - Best Time to Buy and Sell Stock II（多次交易）

### 题意

可多次买卖，求最大利润。

### 分析

贪心：只要 $\text{price}[i] > \text{price}[i-1]$ 就累加差值。

### 核心代码

```cpp
int maxProfit(vector<int>& prices) {
    int ans = 0;
    for (int i = 1; i < (int)prices.size(); i++)
        ans += max(0, prices[i] - prices[i-1]);
    return ans;
}
```

### 复杂度

$O(N)$。

---

## 30. LC 123 - Best Time to Buy and Sell Stock III（至多两次交易）

### 题意

至多 2 次交易，求最大利润。

### 分析

维护 4 个状态：第一次买/卖后、第二次买/卖后。

### 状态与转移

- $b_1 = \max(b_1, -p)$，$s_1 = \max(s_1, b_1 + p)$
- $b_2 = \max(b_2, s_1 - p)$，$s_2 = \max(s_2, b_2 + p)$

### 核心代码

```cpp
int maxProfit(vector<int>& prices) {
    int b1 = INT_MIN, s1 = 0, b2 = INT_MIN, s2 = 0;
    for (int p : prices) {
        b1 = max(b1, -p);
        s1 = max(s1, b1 + p);
        b2 = max(b2, s1 - p);
        s2 = max(s2, b2 + p);
    }
    return s2;
}
```

### 复杂度

$O(N)$。

---

## 31. LC 188 - Best Time to Buy and Sell Stock IV（至多 $k$ 次交易）

### 题意

至多 $k$ 次交易，求最大利润。

### 分析

推广 Stock III。当 $k \ge N/2$ 时退化为 Stock II。

### 状态与转移

- $dp[j][0]$ = 第 $j$ 次交易后不持股的最大利润
- $dp[j][1]$ = 第 $j$ 次交易持股的利润

### 核心代码

```cpp
int maxProfit(int k, vector<int>& prices) {
    int n = prices.size();
    if (k >= n / 2) { /* Stock II greedy */ }
    vector<int> buy(k + 1, INT_MIN), sell(k + 1, 0);
    for (int p : prices)
        for (int j = 1; j <= k; j++) {
            buy[j] = max(buy[j], sell[j-1] - p);
            sell[j] = max(sell[j], buy[j] + p);
        }
    return sell[k];
}
```

### 复杂度

$O(Nk)$。

---

## 32. LC 309 - Best Time with Cooldown（带冷却期）

### 题意

卖出后下一天不能买入（冷却 1 天）。求最大利润。

### 分析

三状态：持股、不持股（刚卖）、不持股（冷却后）。

### 状态与转移

- $\text{hold} = \max(\text{hold}, \text{rest} - p)$
- $\text{sold} = \text{hold} + p$
- $\text{rest} = \max(\text{rest}, \text{sold})$

### 核心代码

```cpp
int maxProfit(vector<int>& prices) {
    int hold = INT_MIN, sold = 0, rest = 0;
    for (int p : prices) {
        int prevSold = sold;
        sold = hold + p;
        hold = max(hold, rest - p);
        rest = max(rest, prevSold);
    }
    return max(sold, rest);
}
```

### 复杂度

$O(N)$。

---

## 33. LC 337 - House Robber III（树形 DP）

### 题意

二叉树结构的房屋，不能偷直接相连的两间。求最大金额。

### 分析

每个节点返回两个值：偷/不偷该节点的最大金额。

### 状态与转移

- 偷 $v$：$v.\text{val} + \text{notRob}(v.\text{left}) + \text{notRob}(v.\text{right})$
- 不偷 $v$：$\max(\text{rob}, \text{notRob})$ 对两个子节点分别取最优

### 核心代码

```cpp
pair<int,int> dfs(TreeNode* node) { // {rob, notRob}
    if (!node) return {0, 0};
    auto [lr, ln] = dfs(node->left);
    auto [rr, rn] = dfs(node->right);
    int rob = node->val + ln + rn;
    int notRob = max(lr, ln) + max(rr, rn);
    return {rob, notRob};
}
```

### 复杂度

$O(N)$。

---

## 34. LC 96 - Unique Binary Search Trees（卡特兰数）

### 题意

$N$ 个节点的不同 BST 个数。

### 分析

卡特兰数 $C_n = \sum_{i=0}^{n-1} C_i \cdot C_{n-1-i}$。

### 状态与转移

- $dp[n] = \sum_{i=1}^{n} dp[i-1] \cdot dp[n-i]$

### 核心代码

```cpp
int numTrees(int n) {
    vector<int> dp(n + 1, 0);
    dp[0] = dp[1] = 1;
    for (int i = 2; i <= n; i++)
        for (int j = 1; j <= i; j++)
            dp[i] += dp[j-1] * dp[i-j];
    return dp[n];
}
```

### 复杂度

$O(N^2)$。

---

## 35. LC 486 - Predict the Winner（区间博弈 DP）

### 题意

两人从数组两端轮流取数，判断先手能否不输。

### 分析

区间 DP：$dp[l][r]$ = 当前玩家在 $[l, r]$ 上能获得的最大差值。

### 状态与转移

- $dp[l][r] = \max(a[l] - dp[l+1][r],\; a[r] - dp[l][r-1])$

### 核心代码

```cpp
bool PredictTheWinner(vector<int>& nums) {
    int n = nums.size();
    vector<vector<int>> dp(n, vector<int>(n, 0));
    for (int i = 0; i < n; i++) dp[i][i] = nums[i];
    for (int len = 2; len <= n; len++)
        for (int l = 0; l + len - 1 < n; l++) {
            int r = l + len - 1;
            dp[l][r] = max(nums[l] - dp[l+1][r], nums[r] - dp[l][r-1]);
        }
    return dp[0][n-1] >= 0;
}
```

### 复杂度

$O(N^2)$。

---

## 36. LC 279 - Perfect Squares（完全背包）

### 题意

将正整数 $N$ 表示为最少个完全平方数之和。

### 分析

完全背包，物品为 $1^2, 2^2, 3^2, \ldots$。

### 状态与转移

- $dp[j] = \min_{k^2 \le j} dp[j - k^2] + 1$

### 核心代码

```cpp
int numSquares(int n) {
    vector<int> dp(n + 1, INT_MAX);
    dp[0] = 0;
    for (int j = 1; j <= n; j++)
        for (int k = 1; k * k <= j; k++)
            dp[j] = min(dp[j], dp[j - k*k] + 1);
    return dp[n];
}
```

### 复杂度

$O(N\sqrt{N})$。

---

# 总结

## 知识点全景图

| 类别 | 题目 | 核心技术 |
|------|------|----------|
| **一维线性 DP** | 1, 2, 3, 5, 6 | 斐波那契、不相邻取数、LIS、双状态 |
| **网格 DP** | 7, 8, 9, 10, 11, 12 | 路径计数、最短路径、最大正方形/矩形 |
| **背包 DP** | 4, 13, 14, 15, 16, 17, 18, 36 | 完全/01 背包、计数/最值、二维费用 |
| **字符串 DP** | 19, 20, 21, 22, 23, 24 | 回文、LCS、编辑距离、正则/通配符匹配 |
| **区间 DP** | 25, 26, 27 | 气球、三角剖分、Scramble String |
| **股票系列** | 28, 29, 30, 31, 32 | 状态机 DP、冷却期、$k$ 次交易 |
| **树形 DP** | 33, 34 | 树上取数、卡特兰数 |
| **博弈 DP** | 35 | 区间博弈 |

## 学习路线建议

```
入门线性：1 → 2 → 3 → 5 → 6
    ↓
网格 DP：7 → 8 → 9 → 10 → 11 → 12
    ↓
背包系列：13 → 14 → 15 → 16 → 17 → 18 → 36 → 4
    ↓
字符串 DP：19 → 20 → 21 → 22 → 23 → 24
    ↓
股票系列：28 → 29 → 32 → 30 → 31
    ↓
区间/博弈：25 → 26 → 35 → 27
    ↓
树形 DP：34 → 33
```

## 解题方法论

1. **LeetCode DP 分类清晰**：线性→网格→背包→字符串→区间→状态机，掌握每类模板后做变形。
2. **背包问题三要素**：物品遍历顺序（内/外层）决定是组合还是排列；倒序/正序决定是 01 还是完全背包。
3. **股票问题统一框架**：用状态机（持股、不持股、冷却）统一处理所有变形。
4. **字符串 DP 的核心**：两个串用二维 DP，单串用区间 DP。关键是处理"匹配"和"不匹配"的分支。
5. **区间 DP 找"最后一步"**：Burst Balloons 中不是找"第一个戳的"，而是找"最后一个戳的"，这是区间 DP 的思维特点。

> **记住**：LeetCode DP 题目是面试高频考点。掌握这 36 题涵盖了所有常见 DP 类型，足以应对绝大部分面试 DP 问题。
