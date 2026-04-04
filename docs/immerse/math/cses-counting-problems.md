---
title: "CSES 计数专题精选解题报告"
subtitle: "🎯 从子矩形统计到图分布递推的组合建模主线"
order: 6
icon: "🎯"
---

# CSES 计数专题精选解题报告

这一组题从网格子结构计数一路走到排列、容斥与图分布，表面上对象差异很大，真正反复出现的是“把局部限制翻成可累加的状态或可卷积的结构”：前面先练二维窗口与边界判定，中段转到区间 DP、棋盘摆放和排列计数，最后再把答案压成强连通块、轮数分布或函数图组件的递推。

# 一、子矩形与子正方形统计

这一章都在处理二维网格里的“局部纯色”与“覆盖全部字母”两类条件。核心不是暴力枚举子块，而是先把每个格子能向四周延伸多远预处理出来，再把正方形、矩形和边框条件改写成可单调统计的量。

## 1. [Filled Subgrid Count I](https://cses.fi/problemset/task/3413)

`二维动态规划` `同色正方形`

### 题意
给定一个 $n \times n$ 字母网格，字母只会出现在前 $k$ 个大写字母里。对于每个字母，都要统计所有元素完全相同的正方形子网格个数。

### 分析
设 $dp[i][j]$ 表示以 $(i,j)$ 为右下角、且所有字符都等于 $g_{i,j}$ 的最大同色正方形边长。若当前位置和上、左、左上三个格子的字母都相同，那么它可以在三者最短边长基础上继续扩一层；否则只能单独形成边长 $1$ 的正方形。

这个状态的好处是：右下角固定后，边长从 $1$ 到 $dp[i][j]$ 的所有正方形都合法，所以把 $dp[i][j]$ 直接累加到对应字母答案里即可。整个过程只扫一遍网格。

### 核心代码
```cpp
for (int i = 1; i <= n; i++) {
  for (int j = 1; j <= n; j++) {
    dp[i][j] = 1;
    if (i > 1 && j > 1 && g[i][j] == g[i - 1][j] && g[i][j] == g[i][j - 1] && g[i][j] == g[i - 1][j - 1]) {
      dp[i][j] = min({dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]}) + 1;
    }
    ans[g[i][j] - 'A'] += dp[i][j];
  }
}
```

### 复杂度
时间复杂度 $O(n^2)$，空间复杂度 $O(n^2)$。

---

## 2. [Filled Subgrid Count II](https://cses.fi/problemset/task/3414)

`单调栈` `同色矩形`

### 题意
同样给定一个 $n \times n$ 字母网格。现在要对每个字母统计所有元素完全相同的矩形子网格个数。

### 分析
把每一行当成直方图底边。设 $h[j]$ 为第 $j$ 列向上连续等于当前格子字母的高度，那么“以当前行为下边界的同色矩形”就等价于：在同字母连续段内，对所有子区间求高度最小值之和。

因此可以按行扫描，把当前行分成若干个“字母相同的连续段”，在每一段内用单调栈维护“以当前位置结尾的所有子区间最小高度和”。这个和正是当前列新增的同色矩形数量，累加到该字母答案里即可。

### 核心代码
```cpp
for (int i = 1; i <= n; i++) {
  for (int j = 1; j <= n; j++) {
    h[j] = (i > 1 && g[i][j] == g[i - 1][j]) ? h[j] + 1 : 1;
  }
  for (int l = 1, r; l <= n; l = r + 1) {
    r = l;
    while (r < n && g[i][r + 1] == g[i][l]) r++;
    long long sum = 0;
    vector<pair<int,int>> st;
    for (int j = l; j <= r; j++) {
      int cnt = 1;
      while (!st.empty() && st.back().first >= h[j]) {
        sum -= 1LL * st.back().first * st.back().second;
        cnt += st.back().second;
        st.pop_back();
      }
      st.push_back({h[j], cnt});
      sum += 1LL * h[j] * cnt;
      ans[g[i][l] - 'A'] += sum;
    }
  }
}
```

### 复杂度
时间复杂度 $O(n^2)$，空间复杂度 $O(n)$。

---

## 3. [All Letter Subgrid Count I](https://cses.fi/problemset/task/3415)

`二维前缀和` `二分答案`

### 题意
给定一个 $n \times n$ 字母网格，要求统计有多少个正方形子网格同时包含前 $k$ 个字母中的每一种。

### 分析
对每个字母各做一张二维前缀和表，这样就能在 $O(k)$ 时间判断任意一个正方形里某个字母是否出现过。对固定左上角 $(x,y)$ 来说，边长越大，包含的字母集合只会增不会减，所以“是否已经覆盖全部字母”具有单调性。

于是可以对每个左上角二分最小合法边长 $len$。如果这个最小值存在，那么所有边长在 $[len,\,n-\max(x,y)+1]$ 内的正方形都合法，直接整段计数即可。

### 核心代码
```cpp
auto hasAll = [&](int x, int y, int len) {
  int x2 = x + len - 1, y2 = y + len - 1;
  for (int c = 0; c < k; c++) {
    if (sum(c, x, y, x2, y2) == 0) return false;
  }
  return true;
};
for (int x = 1; x <= n; x++) {
  for (int y = 1; y <= n; y++) {
    int hi = n - max(x, y) + 1, l = 1, r = hi, pos = 0;
    while (l <= r) {
      int mid = (l + r) >> 1;
      if (hasAll(x, y, mid)) pos = mid, r = mid - 1;
      else l = mid + 1;
    }
    if (pos) ans += hi - pos + 1;
  }
}
```

### 复杂度
时间复杂度 $O(k n^2 \log n)$，空间复杂度 $O(k n^2)$。

---

## 4. [All Letter Subgrid Count II](https://cses.fi/problemset/task/3416)

`双指针` `矩形覆盖`

### 题意
仍然是同一张字母网格，但现在要求统计包含全部 $k$ 个字母的矩形子网格数量。

### 分析
固定上边界 `top` 和下边界 `bot` 之后，每一列都可以压成一个字母集合 `mask[col]`，表示这一列在行区间 $[top,bot]$ 内出现过哪些字母。问题就变成：有多少个列区间的并集等于“全部字母”。

这个条件适合双指针。右端点向右扩时，把 `mask[r]` 里的字母加入窗口；一旦窗口已经覆盖全部字母，就不断右移左端点，并把当前左端点对应的所有区间贡献计入答案。外层枚举行对，内层做一次线性滑窗。

### 核心代码
```cpp
for (int top = 1; top <= n; top++) {
  fill(mask + 1, mask + n + 1, 0);
  for (int bot = top; bot <= n; bot++) {
    for (int col = 1; col <= n; col++) mask[col] |= 1 << (g[bot][col] - 'A');
    vector<int> cnt(k, 0);
    int cover = 0, l = 1;
    for (int r = 1; r <= n; r++) {
      for (int c = 0; c < k; c++) if (mask[r] >> c & 1) cover += (++cnt[c] == 1);
      while (l <= r && cover == k) {
        ans += n - r + 1;
        for (int c = 0; c < k; c++) if (mask[l] >> c & 1) cover -= (--cnt[c] == 0);
        l++;
      }
    }
  }
}
```

### 复杂度
时间复杂度 $O(k n^3)$，空间复杂度 $O(n + k)$。

---

## 5. [Border Subgrid Count I](https://cses.fi/problemset/task/3417)

`对角线扫描` `树状数组`

### 题意
给定一个字母网格。对每个字母，统计边框全部由该字母组成的正方形子网格个数，内部可以是任意字符。

### 分析
先预处理每个格子向左、向右、向上、向下连续相同字母的长度。若把某个格子看成正方形左上角，它最多能提供的边长上界是 $tl=\min(\text{right},\text{down})$；若把某个格子看成右下角，对应上界是 $br=\min(\text{left},\text{up})$。

正方形的左上角和右下角一定落在同一条主对角线上。沿对角线从左上往右下扫描时，把每个位置作为左上角能覆盖的右下角区间 $[i,\,i+tl-1]$ 加入数据结构；当扫到某个右下角 $j$ 时，只需统计同字母、且起点 $i \ge j-br+1$ 的活跃左上角个数。这样就把四条边同时合法的判定压成了一次区间激活和一次后缀查询。

### 核心代码
```cpp
for (auto &diag : diagonals) {
  resetBIT(diag.size());
  vector<vector<pair<int,int>>> del(diag.size() + 2);
  for (int i = 1; i <= (int)diag.size(); i++) {
    auto [x, y] = diag[i - 1];
    int c = g[x][y] - 'A';
    add(c, i, 1);
    int out = min((int)diag.size(), i + tl[x][y] - 1) + 1;
    del[out].push_back({c, i});
    for (auto [cc, pos] : del[i]) add(cc, pos, -1);
    int L = max(1, i - br[x][y] + 1);
    ans[c] += query(c, i) - query(c, L - 1);
  }
}
```

### 复杂度
时间复杂度 $O(k n^2 \log n)$，空间复杂度 $O(k n)$。

---

## 6. [Border Subgrid Count II](https://cses.fi/problemset/task/3418)

`行对枚举` `边框矩形`

### 题意
现在要对每个字母统计边框全部由该字母组成的矩形子网格数量。

### 分析
固定上边界 `top` 和下边界 `bot` 后，矩形高度已经确定。对于某个字母 $c$，一列能够成为左右边界，当且仅当这一列从 `top` 到 `bot` 全是 $c$；而一段连续列能够作为矩形的上下边界，当且仅当这段上边和下边全是 $c$。

所以对每一对行，我们按列扫描：在“上边和下边都是 $c$”的连续段里，统计其中有多少列还能作为合法竖边。若某一段里这样的列有 $t$ 个，那么任选左右边界就得到 $\frac{t(t+1)}{2}$ 个矩形，宽度为 $1$ 的情况也自然包含在内。

### 核心代码
```cpp
for (int top = 1; top <= n; top++) {
  for (int bot = top; bot <= n; bot++) {
    int h = bot - top + 1;
    for (int c = 0; c < k; c++) {
      long long good = 0;
      for (int col = 1; col <= n; col++) {
        bool hor = g[top][col] - 'A' == c && g[bot][col] - 'A' == c;
        bool ver = hor && down[top][col] >= h;
        if (!hor) ans[c] += good * (good + 1) / 2, good = 0;
        else if (ver) good++;
      }
      ans[c] += good * (good + 1) / 2;
    }
  }
}
```

### 复杂度
时间复杂度 $O(k n^3)$，空间复杂度 $O(n^2)$。

# 二、区间 DP 与棋盘摆放

这一章的共同点是“对象本身带有顺序”。字符串删除要保留区间嵌套关系，逆序数和漂亮排列都在排列长度上递推，主教放置则把棋盘颜色拆成两组互不干扰的对角线问题。

## 7. [Empty String](https://cses.fi/problemset/task/1080)

`区间动态规划` `组合数`

### 题意
给定一个只含小写字母的字符串。每次可以删除一对相邻且相同的字符，问把整个串删空的方案数。

### 分析
区间 DP 的关键是固定左端点 $l$ 的配对位置。若 $s_l$ 最终和 $s_m$ 配成一对，那么区间 $(l,m)$ 必须先被完全删空，才能让这两个字符相邻；删掉这一对之后，右侧 $(m,r]$ 还要继续独立删空。

状态设为 $dp[l][r]$ 表示把子串 $[l,r]$ 删空的方案数。转移时枚举与 $l$ 配对的 $m$，把“中间部分的删除操作”和“右边部分的删除操作”按组合数交错插入，因此会多出一个二项式系数。

### 核心代码
```cpp
for (int i = 1; i <= n + 1; i++) dp[i][i - 1] = 1;
for (int len = 2; len <= n; len += 2) {
  for (int l = 1; l + len - 1 <= n; l++) {
    int r = l + len - 1;
    for (int m = l + 1; m <= r; m += 2) {
      if (s[l] != s[m]) continue;
      long long cur = 1LL * dp[l + 1][m - 1] * dp[m + 1][r] % MOD;
      cur = cur * C[len / 2][(m - l + 1) / 2] % MOD;
      dp[l][r] = (dp[l][r] + cur) % MOD;
    }
  }
}
```

### 复杂度
时间复杂度 $O(n^3)$，空间复杂度 $O(n^2)$。

---

## 8. [Permutation Inversions](https://cses.fi/problemset/task/2229)

`动态规划` `前缀和优化`

### 题意
给定 $n$ 和 $k$，求长度为 $n$ 的排列里，逆序对数量恰好等于 $k$ 的方案数。

### 分析
把最大值 $i$ 插入到长度 $i-1$ 的排列中，它可以放在最右侧到最左侧的任意位置，于是会新增 $0$ 到 $i-1$ 个逆序对。设 $dp[i][j]$ 为长度为 $i$、逆序数为 $j$ 的排列个数，就有
$dp[i][j]=\sum_{t=0}^{\min(j,i-1)} dp[i-1][j-t]$。

这个转移是一个滑动窗口求和，直接前缀和优化即可把每层从 $O(i k)$ 压到 $O(k)$。题目本质上是在数“每一层可新增多少逆序”的分配方式。

### 核心代码
```cpp
vector<int> dp(k + 1, 0);
dp[0] = 1;
for (int i = 1; i <= n; i++) {
  vector<int> pre(k + 1), ndp(k + 1, 0);
  pre[0] = dp[0];
  for (int j = 1; j <= k; j++) pre[j] = (pre[j - 1] + dp[j]) % MOD;
  for (int j = 0; j <= k; j++) {
    int L = max(0, j - (i - 1));
    ndp[j] = (pre[j] - (L ? pre[L - 1] : 0) + MOD) % MOD;
  }
  dp.swap(ndp);
}
```

### 复杂度
时间复杂度 $O(nk)$，空间复杂度 $O(k)$。

---

## 9. [Counting Bishops](https://cses.fi/problemset/task/2176)

`棋盘计数` `对角线动态规划`

### 题意
给定一个 $n \times n$ 棋盘和一个整数 $k$，要求统计放置 $k$ 个主教且任意两枚主教互不攻击的方案数。

### 分析
主教只会攻击同一颜色格子上的棋子，所以先把棋盘按黑白格拆成两个互不影响的子问题。对某一种颜色，把同向对角线按长度排序后依次处理：新对角线长度为 $len$ 时，如果已经放了 $j$ 个主教，那么被占掉的反对角线也正好有 $j$ 条，可选位置数就是 $len-j$。

于是可以对黑格和白格各做一次 DP，得到“放 $t$ 个主教”的方案数，最后再把两种颜色的结果做一次卷积，合并成总答案。

### 核心代码
```cpp
vector<int> solve(vector<int> len) {
  vector<int> dp(k + 1, 0), ndp(k + 1, 0);
  dp[0] = 1;
  for (int d : len) {
    fill(ndp.begin(), ndp.end(), 0);
    for (int j = 0; j <= k; j++) {
      ndp[j] = (ndp[j] + dp[j]) % MOD;
      if (j < k && d > j) ndp[j + 1] = (ndp[j + 1] + 1LL * dp[j] * (d - j)) % MOD;
    }
    dp.swap(ndp);
  }
  return dp;
}
auto black = solve(blackLen), white = solve(whiteLen);
for (int t = 0; t <= k; t++) ans = (ans + 1LL * black[t] * white[k - t]) % MOD;
```

### 复杂度
时间复杂度 $O(nk)$，空间复杂度 $O(k)$。

---

## 10. [Counting Permutations](https://cses.fi/problemset/task/1075)

`容斥` `排列统计`

### 题意
给定 $n$，求 $1,2,\dots,n$ 的排列中，有多少个排列满足任意相邻两个数的差都不等于 $1$。

### 分析
把“相邻差为 $1$”看成坏事件，对路径图上的 $n-1$ 条边做容斥。若选中若干条坏边，意味着这些相邻整数必须在排列里贴在一起；由于坏边来自一条链，它们会分解成若干段连续区间，每一段收缩后只有正反两种摆法，所以一共带来 $2^{\text{段数}}$ 的权值。

因此只要统计：在前若干条边里，选了 $j$ 条坏边且当前是否处在某一段内部的加权方案数。最后乘上收缩后块的排列数 $(n-j)!$，再按容斥符号求和即可。

### 核心代码
```cpp
vector<int> dp0(n + 1, 0), dp1(n + 1, 0), ndp0(n + 1), ndp1(n + 1);
dp0[0] = 1;
for (int i = 1; i <= n - 1; i++) {
  fill(ndp0.begin(), ndp0.end(), 0);
  fill(ndp1.begin(), ndp1.end(), 0);
  for (int j = 0; j <= i; j++) {
    ndp0[j] = (ndp0[j] + dp0[j] + dp1[j]) % MOD;
    if (j) ndp1[j] = (ndp1[j] + 2LL * dp0[j - 1] + dp1[j - 1]) % MOD;
  }
  dp0.swap(ndp0);
  dp1.swap(ndp1);
}
for (int j = 0; j <= n - 1; j++) {
  long long w = (dp0[j] + dp1[j]) % MOD;
  long long cur = w * fac[n - j] % MOD;
  ans = (ans + (j & 1 ? MOD - cur : cur)) % MOD;
}
```

### 复杂度
时间复杂度 $O(n^2)$，空间复杂度 $O(n)$。

# 三、容斥、组合与构造计数

这一章更强调“先把对象压成公式，再决定怎样把限制扣掉”。有的题直接上容斥，有的题靠组合数剔除障碍点，有的题则把局部冲突整理成匹配或欧拉数里的固定点条件。

## 11. [Counting Sequences](https://cses.fi/problemset/task/2228)

`容斥` `满射计数`

### 题意
要求统计长度为 $n$ 的序列个数，序列元素都在 $1\dots k$ 之间，并且每个值都至少出现一次。

### 分析
如果不管“每个值都出现”，总方案数是 $k^n$。真正麻烦的是哪些数字没有被用到，这正是最典型的容斥模型：枚举一个大小为 $i$ 的值集完全不出现，那么剩下的位置只有 $k-i$ 种选择。

于是答案直接写成
$\sum_{i=0}^{k} (-1)^i \binom{k}{i}(k-i)^n$。
这题没有额外结构，关键只是迅速认出“至少一次”就是在数满射。

### 核心代码
```cpp
long long ans = 0;
for (int i = 0; i <= k; i++) {
  long long cur = 1LL * C(k, i) * qpow(k - i, n) % MOD;
  ans = (ans + (i & 1 ? MOD - cur : cur)) % MOD;
}
```

### 复杂度
时间复杂度 $O(k \log n)$，空间复杂度 $O(k)$（若预处理组合数）。

---

## 12. [Grid Paths II](https://cses.fi/problemset/task/1078)

`组合计数` `障碍容斥`

### 题意
在一个 $n \times n$ 网格中，只能向右或向下走，从左上角走到右下角。给出若干陷阱格子，不能经过它们，要求统计合法路径数。

### 分析
如果没有陷阱，从 $(1,1)$ 到 $(x,y)$ 的路径数就是组合数 $\binom{x+y-2}{x-1}$。把所有陷阱和终点按坐标排序后，设 $dp[i]$ 为“到第 $i$ 个点且不经过更早障碍”的路径数，那么它先取所有路径，再减去经过某个更早可达障碍的方案。

因为移动只能向右下，排序后转移方向天然有序；每次减去的系数，仍然只是两点之间的组合数。于是整题变成一个典型的“排序后做一次障碍容斥”。

### 核心代码
```cpp
sort(p.begin(), p.end());
p.push_back({n, n});
for (int i = 0; i < (int)p.size(); i++) {
  dp[i] = comb(p[i].x + p[i].y - 2, p[i].x - 1);
  for (int j = 0; j < i; j++) {
    if (p[j].x > p[i].x || p[j].y > p[i].y) continue;
    int dx = p[i].x - p[j].x, dy = p[i].y - p[j].y;
    dp[i] = (dp[i] - 1LL * dp[j] * comb(dx + dy, dx)) % MOD;
  }
}
```

### 复杂度
时间复杂度 $O(m^2)$，空间复杂度 $O(m)$。

---

## 13. [Grid Completion](https://cses.fi/problemset/task/2429)

`容斥` `匹配计数` `Rook 多项式`

### 题意
要完成一个 $n \times n$ 网格，使得每一行、每一列都恰好有一个 `A` 和一个 `B`。部分格子已经填好，且保证每行每列至多已有一个 `A` 和一个 `B`，问补全方案数。

### 分析
把所有 `A` 的位置看成一组排列矩阵，把所有 `B` 的位置看成另一组排列矩阵。先做一致性检查：若某一行或某一列里同一种字母已经出现两次，或者同一格同时被两种字母占掉，那么答案立刻为 $0$。

删掉已经完全确定的行和列后，剩下的是两组要同时补全的匹配；它们真正的耦合只有一条：同一行里的 `A` 和 `B` 不能落在同一列。对这些禁位做容斥：选出若干个“允许撞车”的禁位后，两组匹配都只是普通排列补全；而禁位图因为每行每列最多牵涉一条约束，会分解成若干条链和环，可以先求每个组件的 rook 多项式，再把各组件卷起来。

### 核心代码
```cpp
vector<int> f(1, 1);
for (auto &comp : components) {
  vector<int> g = rookPolynomial(comp);
  vector<int> h(f.size() + g.size() - 1, 0);
  for (int i = 0; i < (int)f.size(); i++) {
    for (int j = 0; j < (int)g.size(); j++) {
      h[i + j] = (h[i + j] + 1LL * f[i] * g[j]) % MOD;
    }
  }
  f.swap(h);
}
for (int t = 0; t <= freeRows; t++) {
  long long cur = 1LL * f[t] * fac[freeRows - t] % MOD * fac[freeRows - t] % MOD;
  ans = (ans + (t & 1 ? MOD - cur : cur)) % MOD;
}
```

### 复杂度
时间复杂度 $O(n^2)$，空间复杂度 $O(n^2)$。

---

## 14. [Counting Reorders](https://cses.fi/problemset/task/2421)

`容斥` `多重集排列`

### 题意
给定一个字符串，可以任意重排它的字符。要求统计所有重排后相邻字符都不相同的方案数。

### 分析
设某个字母出现了 $c$ 次。若强行让其中 $t$ 对相邻位置“粘在一起”，就相当于把这 $c$ 个相同字母压成 $c-t$ 个块，选择粘法的数量是 $\binom{c-1}{t}$。对所有字母都做这个操作，再把所有块一起排列，就得到一个标准的容斥式：
$\displaystyle \sum (-1)^T \frac{(n-T)!}{\prod_i (c_i-t_i)!} \prod_i \binom{c_i-1}{t_i}$。

实现时可以按字母逐个做多项式卷积，`dp[T]` 维护“总共合并了 $T$ 次”时的带权系数，最后乘上对应的阶乘即可。它的本质是把“出现相邻相同”改写成若干同类块的收缩事件。

### 核心代码
```cpp
vector<int> dp(n + 1, 0), ndp(n + 1, 0);
dp[0] = 1;
for (int c : cnt) if (c) {
  fill(ndp.begin(), ndp.end(), 0);
  for (int used = 0; used <= n; used++) if (dp[used]) {
    for (int t = 0; t < c; t++) {
      long long w = 1LL * dp[used] * C(c - 1, t) % MOD * invfac[c - t] % MOD;
      if (t & 1) w = (MOD - w) % MOD;
      ndp[used + t] = (ndp[used + t] + w) % MOD;
    }
  }
  dp.swap(ndp);
}
for (int t = 0; t < n; t++) ans = (ans + 1LL * dp[t] * fac[n - t]) % MOD;
```

### 复杂度
时间复杂度 $O(26 n^2)$，空间复杂度 $O(n)$。

---

## 15. [Raab Game II](https://cses.fi/problemset/task/3400)

`欧拉数` `固定点容斥`

### 题意
两名玩家各自拥有 $1\dots n$ 的牌，每轮各出一张，大牌得一分，相同则无人得分。给定最终得分 $a,b$，要求统计这样的完整对局数。

### 分析
把第一名玩家的出牌顺序固定后，第二名玩家的出牌顺序就是一个排列 $\pi$。比较第 $i$ 轮时，若 $\pi_i>i$，则第二名玩家得分；若 $\pi_i<i$，则第一名玩家得分；若 $\pi_i=i$，则平局。所以问题等价于：统计“恰有 $b$ 个 excedance、$c=n-a-b$ 个固定点”的排列个数，再乘上第一名玩家顺序的 $n!$ 种选择。

欧拉数可以统计 excedance 数量，而固定点用容斥扣掉：先选出哪些位置固定，再在剩余位置上统计 excedance。这样每个询问都能在一层容斥后得到答案。

### 核心代码
```cpp
int c = n - a - b;
if (c < 0) return 0;
long long ways = 0;
for (int i = 0; i <= n - c; i++) {
  long long cur = 1LL * C(n - c, i) * euler[n - c - i][b] % MOD;
  ways = (ways + (i & 1 ? MOD - cur : cur)) % MOD;
}
ways = ways * C(n, c) % MOD;
return ways * fac[n] % MOD;
```

### 复杂度
预处理时间复杂度 $O(N^2)$，单次询问时间复杂度 $O(n)$，空间复杂度 $O(N^2)$。

# 四、分布型计数与图结构

最后这一章不再只求一个总数，而是要输出“恰好有 $k$ 个结构块”的整条分布。做法也很统一：先数单个连通块或单个强连通块的方案数，再把它们按照组件数卷成整张图的答案。

## 16. [Tournament Graph Distribution](https://cses.fi/problemset/task/3232)

`强连通分量` `组合动态规划`

### 题意
对每个 $k=1\dots n$，统计有多少个 $n$ 个点的 tournament graph 恰好有 $k$ 个强连通分量。

### 分析
锦标赛图的强连通分量缩点后一定形成一条全序链，所以先要数“大小为 $s$ 的标号锦标赛图里，强连通的有多少个”。设这个数为 $sc[s]$，它等于全部锦标赛数量 $2^{\binom{s}{2}}$，减去“首个强连通块大小为 $t$，后面部分任意”的所有非强连通情况。

有了 $sc[s]$ 之后，分布 DP 就很直接：枚举最后一个强连通块的大小 $s$，选出这 $s$ 个点形成强连通块，前面的 $n-s$ 个点再递推成 $k-1$ 个分量即可。缩点后的顺序已经唯一，所以不会重复计数。

### 核心代码
```cpp
for (int n = 1; n <= N; n++) {
  sc[n] = all[n];
  for (int s = 1; s < n; s++) {
    sc[n] = (sc[n] - 1LL * C(n, s) * sc[s] % MOD * all[n - s]) % MOD;
  }
}
dp[0][0] = 1;
for (int n = 1; n <= N; n++) {
  for (int k = 1; k <= n; k++) {
    for (int s = 1; s <= n; s++) {
      dp[n][k] = (dp[n][k] + 1LL * C(n, s) * sc[s] % MOD * dp[n - s][k - 1]) % MOD;
    }
  }
}
```

### 复杂度
时间复杂度 $O(n^3)$，空间复杂度 $O(n^2)$。

---

## 17. [Collecting Numbers Distribution](https://cses.fi/problemset/task/3157)

`欧拉数` `排列分布`

### 题意
对每个 $k=1\dots n$，统计有多少个排列在按题意收集数字时恰好需要 $k$ 轮。

### 分析
设 `pos[x]` 是数字 $x$ 在排列中的位置。每当 $pos[x] > pos[x+1]$，从左到右的一次扫描就会在 $x$ 这里断开，所以总轮数正好是
$1 + |\{x : pos[x] > pos[x+1]\}|$。

这说明题目其实是在统计逆排列的 descent 数量，而 descent 的分布正是欧拉数。于是输出第 $k$ 项时，只需给出“恰有 $k-1$ 个 descent 的排列数”。

### 核心代码
```cpp
euler[1][0] = 1;
for (int n = 2; n <= N; n++) {
  for (int d = 0; d < n; d++) {
    euler[n][d] = 1LL * (d + 1) * euler[n - 1][d] % MOD;
    if (d) euler[n][d] = (euler[n][d] + 1LL * (n - d) * euler[n - 1][d - 1]) % MOD;
  }
}
for (int k = 1; k <= n; k++) cout << euler[n][k - 1] << '\n';
```

### 复杂度
时间复杂度 $O(n^2)$，空间复杂度 $O(n^2)$。

---

## 18. [Functional Graph Distribution](https://cses.fi/problemset/task/2415)

`函数图` `连通块计数`

### 题意
对每个 $k=1\dots n$，统计有多少个 $n$ 个点的 functional graph 恰好有 $k$ 个连通块。

### 分析
一个连通函数图一定是“一条有向环 + 若干棵向环汇入的有根树”。因此先数大小为 $s$ 的连通函数图数量 `conn[s]`：枚举环长 $c$，先选出并排成一个有向环，再把剩余点挂成以这些环点为根的森林。这里会用到广义 Cayley 公式来数“指定根集的有根森林”。

有了 `conn[s]`，再做组件分布 DP。为避免无序连通块带来的重复计数，每次都指定“包含当前最小标号点的那个连通块”大小为 $s$，这样选点方式就是 $\binom{n-1}{s-1}$，剩余部分递归处理成 $k-1$ 个连通块。

### 核心代码
```cpp
for (int s = 1; s <= N; s++) {
  for (int c = 1; c <= s; c++) {
    long long cyc = 1LL * C(s, c) * fac[c - 1] % MOD;
    long long forest = (c == s ? 1 : 1LL * c * qpow(s, s - c - 1) % MOD);
    conn[s] = (conn[s] + cyc * forest) % MOD;
  }
}
dp[0][0] = 1;
for (int n = 1; n <= N; n++) {
  for (int k = 1; k <= n; k++) {
    for (int s = 1; s <= n; s++) {
      dp[n][k] = (dp[n][k] + 1LL * C(n - 1, s - 1) * conn[s] % MOD * dp[n - s][k - 1]) % MOD;
    }
  }
}
```

### 复杂度
时间复杂度 $O(n^3)$，空间复杂度 $O(n^2)$。
