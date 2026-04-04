---
title: "CSES 构造专题精选解题报告"
subtitle: "🧩 从排列设计到网格铺放的构造主线"
order: 5
icon: "🧩"
---

# CSES 构造专题精选解题报告

这一组题几乎都不奖励“套模板”，而是逼着你先回答一个更本质的问题：什么样的局部安排一旦成立，就能沿着整串排列、整张图或整块网格继续扩展开去。把这一点抓稳，输出答案反而只是收尾。

# 一、排列里的顺序控制

先看最典型的构造对象——排列。这里每道题都在控制一种“相对顺序”：逆序对、单调子序列长度，或者禁止落点。

## 1. [Inverse Inversions](https://cses.fi/problemset/task/2214)

`构造` `贪心`

### 题意

构造一个 $1..n$ 的排列，使逆序对数恰好等于 $k$。

### 分析

从大数往小数放最顺手，因为当前数字放到最前面会新增尽可能多的逆序对，放到最后则一个也不加。每次让新元素尽量贡献 `min(k, 当前可贡献上限)` 个逆序对，再扣掉这部分需求，双端收缩就行。

### 核心代码

```cpp
deque<int> ans;
for (int x = n; x >= 1; --x) {
  long long add = min<long long>(k, ans.size());
  if (add == ans.size()) ans.push_front(x);
  else ans.push_back(x);
  k -= add;
}
```

### 复杂度

时间复杂度 $O(n)$，空间复杂度 $O(n)$。

---

## 2. [Monotone Subsequences](https://cses.fi/problemset/task/2215)

`构造` `Erdos-Szekeres`

### 题意

构造一个排列，使它的最长单调子序列长度正好为 $k$；若无解则输出 `IMPOSSIBLE`。

### 分析

Erdős–Szekeres 告诉我们：长度超过 $k^2$ 的排列一定存在长度至少 $k+1$ 的单调子序列，所以 $n>k^2$ 时必无解。可行时把序列切成若干块，每块长度不超过 $k$，并把每块内部倒序；这样最长下降子序列由单块控制，最长上升子序列由块数控制，两者都被压在 $k$ 以内，而只要存在一块或块数达到 $k$，最大值就正好是 $k$。

### 核心代码

```cpp
if (1LL * k * k < n) cout << "IMPOSSIBLE";
else {
  for (int l = 1; l <= n; l += k) {
    int r = min(n, l + k - 1);
    for (int x = r; x >= l; --x) cout << x << ' ';
  }
}
```

### 复杂度

单组测试时间复杂度 $O(n)$，空间复杂度 $O(1)$。

---

## 3. [Third Permutation](https://cses.fi/problemset/task/3422)

`排列` `环分解`

### 题意

给定两个排列 $a,b$，并且每个位置都有 $a_i \ne b_i$。要求构造第三个排列 $c$，使得对所有位置都有 $c_i$ 同时不同于 $a_i,b_i$。

### 分析

把值看成点，位置看成限制：值 $v$ 不能放在 `posA[v]` 和 `posB[v]`。把置换 $p=posA^{-1}\circ posB$ 分解成若干环，长度至少为 $3$ 的环整体平移一格即可让每个点避开两个禁位；长度为 $2$ 的小环要和别的环拼在一起处理，若最后只剩孤立二环就无解。

### 核心代码

```cpp
vector<vector<int>> cyc = get_cycles(posA, posB);
vector<int> ord;
for (auto &c : cyc) for (int v : c) ord.push_back(v);
if (ord.size() == 2) cout << "IMPOSSIBLE";
else {
  rotate(ord.begin(), ord.begin() + 1, ord.end());
  for (int i = 0; i < (int)ord.size(); ++i) c[posA[ord[i]]] = ord[(i + 1) % ord.size()];
}
```

### 复杂度

时间复杂度 $O(n)$，空间复杂度 $O(n)$。

---

# 二、配对、素数与度数实现

这一章的共同点是把抽象条件翻成“谁和谁配对”。和为素数、比赛场次、错位避让，本质上都是边的安排。

## 4. [Permutation Prime Sums](https://cses.fi/problemset/task/3423)

`构造` `素数`

### 题意

构造两个长度为 $n$ 的排列 $a,b$，使每个位置上的和 $a_i+b_i$ 都是素数。

### 分析

经典做法是递归配对。对当前最大值区间 $[1,n]$，先找一个不小于 $n+1$ 的素数 $p$，那么所有满足 $i+(p-i)=p$ 的位置都能一一配对；把这段区间处理掉，剩下前缀继续递归，最后自然得到两组排列。

### 核心代码

```cpp
function<void(int)> solve = [&](int n) {
  if (!n) return;
  int p = nextPrime(n + 1), l = p - n;
  for (int i = l; i <= n; ++i) {
    a[i] = i;
    b[i] = p - i;
  }
  solve(l - 1);
};
```

### 复杂度

时间复杂度约为 $O(n\log\log n)$，空间复杂度 $O(n)$。

---

## 5. [Chess Tournament](https://cses.fi/problemset/task/1697)

`图构造` `Havel-Hakimi`

### 题意

每位棋手报出自己想下的场次数，要求安排比赛对阵，使每个人都恰好满足要求。

### 分析

这就是一个简单图度数序列构造问题。每次取当前需求最大的点，把它连向另外若干个需求仍为正的点，并把这些点的需求减一；如果某一步需要的边数超过可连接的人数，或者最后残留正需求，就说明无解。

### 核心代码

```cpp
priority_queue<pair<int,int>> pq;
for (int i = 1; i <= n; ++i) if (deg[i]) pq.push({deg[i], i});
while (!pq.empty()) {
  auto [d, u] = pq.top(); pq.pop();
  vector<pair<int,int>> take;
  while (d--) { auto cur = pq.top(); pq.pop(); ans.push_back({u, cur.second}); --cur.first; take.push_back(cur); }
  for (auto [x, v] : take) if (x) pq.push({x, v});
}
```

### 复杂度

时间复杂度 $O((n+m)\log n)$，空间复杂度 $O(n+m)$。

---

# 三、表格与网格构造

当答案变成一整张表时，就不能只看单点合法性，还要同时维护频次、行列和、连通铺放或整条 Hamilton 路径。

## 6. [Distinct Sums Grid](https://cses.fi/problemset/task/3424)

`网格构造` `计数`

### 题意

构造一个 $n\times n$ 网格，使数字 $1..n$ 各出现恰好 $n$ 次，并且所有行和与列和一共得到 $2n$ 个互不相同的值。

### 分析

这题的难点不是“每个数出现 $n$ 次”，而是同时把行和列和拉开。可行构造通常从循环填充出发，再在若干条对角线和尾行尾列上做受控扰动：频次守恒靠成对交换保持，行和递增靠每行拿到不同的大数配额，列和则放到另一段数值区间避免撞车。

### 核心代码

```cpp
for (int i = 0; i < n; ++i)
  for (int j = 0; j < n; ++j)
    g[i][j] = base_pattern(i, j, n);
fix_diagonals(g);
print(g);
```

### 复杂度

构造时间复杂度 $O(n^2)$，空间复杂度 $O(n^2)$。

---

## 7. [Filling Trominos](https://cses.fi/problemset/task/2423)

`铺砖` `构造`

### 题意

用 L 形三格骨牌恰好铺满 $n\times m$ 网格，并给出一种染色表示方案。

### 分析

面积必须能被 $3$ 整除，这是第一道门槛。真正的构造靠若干小模板拼接：$2\times 3$、$3\times 2$ 是基本块，较大的偶数行列都可以不断剥掉这种块；剩下的边角再用 $3\times 4$、$4\times 3$ 模板收尾，只有少数小尺寸会卡死。

### 核心代码

```cpp
if (n * m % 3) return no();
while (n >= 2 && m >= 3) place_2x3_block();
while (n >= 3 && m >= 2) place_3x2_block();
solve_remaining_by_templates();
```

### 复杂度

构造时间复杂度 $O(nm)$，空间复杂度 $O(nm)$。

---

## 8. [Grid Path Construction](https://cses.fi/problemset/task/2418)

`Hamilton 路径` `构造`

### 题意

在 $n\times m$ 网格中，从给定起点走到给定终点，并且每个格子恰好访问一次。

### 分析

网格 Hamilton 路径最关键的是奇偶性：黑白染色后，相邻步必然换色，所以起终点颜色与总格子奇偶要匹配。构造时通常先处理一维、两行两列等特例，再把大网格分成若干蛇形条带，逐步把起终点接入主蛇路径。

### 核心代码

```cpp
if (!parity_ok(a, b, n, m)) return no();
if (n == 1 || m == 1) return solve_line();
if (n % 2 == 0) return snake_by_rows();
if (m % 2 == 0) return snake_by_cols();
return peel_border_and_recurse();
```

### 复杂度

构造时间复杂度 $O(nm)$，空间复杂度 $O(nm)$。

