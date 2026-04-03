---
title: "洛谷 线性DP专题精选解题报告"
subtitle: "📈 从路径转移到状态机建模的线性 DP 主线"
order: 10
icon: "📈"
---

# 洛谷 线性DP专题精选解题报告

这一组题从数字三角形一路走到编辑距离和状态机 DP，虽然题面横跨路径、序列、字符串和股票交易，但主线一直很清楚：状态按自然顺序推进，转移只依赖前面一小段信息。线性 DP 的核心从来不是“线性”二字，而是能否抓住那个最稳定的推进方向。

# 一、数字三角形与路径 DP

数字三角形是线性 DP 的入门经典，既能用记忆化搜索自顶向下做，也能用递推自底向上做。方格取数和传纸条则在此基础上扩展到"两人同步走"的多维状态，是路径 DP 的典型进阶题。

## 1. [P1216 数字三角形](https://www.luogu.com.cn/problem/P1216)

`数字三角形` `线性DP` `递推`

### 题意

给定一个 $n$ 行的数字三角形，从顶部出发，每步可以向下走到相邻的左下或右下位置，求到达底部时路径上数字之和的最大值。

### 分析

自底向上递推。定义 $f[i][j]$ 为从底部出发走到 $(i,j)$ 的最大路径和（也可正向定义为从 $(i,j)$ 到底部）。从最后一行向上逐层更新：$f[i][j] = \max(f[i+1][j], f[i+1][j+1]) + a[i][j]$。最终 $f[1][1]$ 即为答案。自底向上不需要记忆化也不需要显式边界处理，代码非常简洁。

### 核心代码

```cpp
const int N = 1005;
int n, a[N][N], f[N][N];

for (int i = 1; i <= n; i++)
    for (int j = 1; j <= i; j++) cin >> a[i][j];

for (int j = 1; j <= n; j++) f[n][j] = a[n][j];

for (int i = n - 1; i >= 1; i--)
    for (int j = 1; j <= i; j++)
        f[i][j] = max(f[i+1][j], f[i+1][j+1]) + a[i][j];

cout << f[1][1] << endl;
```

### 复杂度

$O(n^2)$。

---

## 2. [P1004 方格取数](https://www.luogu.com.cn/problem/P1004)

`线性DP` `方格取数` `两路同步` `降维优化`

### 题意

在一个 $N \times N$ 的方格图中，某些格子有正整数，其余为 0。两人都从 $(1,1)$ 出发，只能向右或向下走，到达 $(N,N)$。两人走过同一格时该格数值只取一次，求两人路径数字之和的最大值。

### 分析

同步枚举两路。关键观察：两条路径总步数相同，第 $k$ 步时两人都在满足 $i + j - 1 = k$ 的位置。令步数 $k$ 从 2 到 $2N$，枚举两人各自所在的行 $i_1, i_2$，列则由 $j = k - i$ 推出。状态 $f[k][i_1][i_2]$ 表示共走 $k$ 步、第一人在第 $i_1$ 行时的最大取数和。转移时从四种前驱中取最大，若 $i_1 = i_2$ 则同格只计一次。

### 核心代码

```cpp
const int N = 15;
int n, a[N][N], f[N+N][N][N];

for (int k = 2; k <= 2*n; k++)
    for (int i1 = 1; i1 <= n; i1++)
    for (int i2 = 1; i2 <= n; i2++) {
        int j1 = k - i1, j2 = k - i2;
        if (j1 < 1 || j1 > n || j2 < 1 || j2 > n) continue;
        int val = a[i1][j1] + (i1 != i2 ? a[i2][j2] : 0);
        f[k][i1][i2] = max({f[k-1][i1-1][i2-1], f[k-1][i1-1][i2],
                            f[k-1][i1][i2-1],   f[k-1][i1][i2]}) + val;
    }
cout << f[2*n][n][n] << endl;
```

### 复杂度

$O(n^3)$。

---

## 3. [P1006 传纸条](https://www.luogu.com.cn/problem/P1006)

`线性DP` `两路不重叠路径` `同步走`

### 题意

$m \times n$ 矩阵，小渊在左上角，小轩在右下角，双向各传一张纸条，路径只能向下或向右（反向则向上或向左）。每位同学只帮一次忙，两条路径不能经过同一格（起终点除外）。每位同学有好感度值，求两条路径好感度之和的最大值。

### 分析

与 P1004 方格取数本质相同，但要求路径严格不重叠（起终点 $(1,1)$ 和 $(m,n)$ 除外，好感度为 0 所以不影响）。同样用"同步两路"思路：$f[k][i_1][i_2]$ 表示共走了 $k$ 步时第一路在第 $i_1$ 行的最优解，通过约束 $i_1 \ne i_2$（步数相同时两人行号不同即列号不同，格子不重叠）保证合法性。

### 核心代码

```cpp
const int N = 55;
int m, n, a[N][N], f[N+N][N][N];

for (int k = 2; k < m + n; k++)        // 起终点 k=1 和 k=m+n 不枚举
    for (int i1 = 1; i1 <= m; i1++)
    for (int i2 = 1; i2 <= m; i2++) {
        if (i1 == i2) continue;         // 两路不得重叠（同步时同行必同列）
        int j1 = k - i1, j2 = k - i2;
        if (j1 < 1 || j1 > n || j2 < 1 || j2 > n) continue;
        f[k][i1][i2] = max({f[k-1][i1-1][i2-1], f[k-1][i1-1][i2],
                            f[k-1][i1][i2-1],   f[k-1][i1][i2]})
                       + a[i1][j1] + a[i2][j2];
    }
cout << f[m+n-1][m][m-1] + f[m+n-1][m-1][m] << endl; // 枚举倒数第二步
```

### 复杂度

$O(mn \cdot \min(m,n))$，实际为 $O(n^3)$（$m,n \le 50$）。

---

# 二、最长上升子序列（LIS）

LIS 是线性 DP 中最重要的单序列模型之一。$O(n^2)$ 版本是基础，$O(n \log n)$ 版本需要结合贪心与二分，在此基础上还可以扩展出路径重建、通配符、动态插入等各类变体。

## 4. [B3637 最长上升子序列](https://www.luogu.com.cn/problem/B3637)

`线性DP` `LIS` `$O(n^2)$`

### 题意

给定长度为 $n$（$n \le 5000$）的正整数序列，求其最长严格上升子序列的长度。

### 分析

经典 $O(n^2)$ LIS。定义 $f[i]$ 为以 $a[i]$ 结尾的最长上升子序列长度，初始为 1。对每个 $i$，枚举所有 $j < i$：若 $a[j] < a[i]$，则 $f[i] = \max(f[i], f[j]+1)$。最终答案为 $\max_i f[i]$。

### 核心代码

```cpp
const int N = 5010;
int n, a[N], f[N], ans = 1;

for (int i = 1; i <= n; i++) {
    f[i] = 1;
    for (int j = 1; j < i; j++)
        if (a[j] < a[i]) f[i] = max(f[i], f[j] + 1);
    ans = max(ans, f[i]);
}
cout << ans << endl;
```

### 复杂度

$O(n^2)$。

---

## 5. [T386911 最长上升子序列输出解](https://www.luogu.com.cn/problem/T386911)

`LIS` `路径回溯` `$O(n \log n)$`

### 题意

求最长严格上升子序列，同时输出方案（即具体是哪些数字）。

### 分析

贪心 + 二分求 LIS 长度，同时记录每个元素在辅助数组 $b$ 中的位置 $pos[i]$。LIS 长度求出后，从后向前扫描：若 $pos[i] = j$（当前要找的长度），则 $a[i]$ 是方案中长度为 $j$ 的那个元素，将其记录后令 $j \leftarrow j-1$，直到 $j = 0$。

### 核心代码

```cpp
const int N = 100010;
int n, a[N], b[N], pos[N], ans[N];
int len = 0;
b[0] = -2e9;  // 哨兵

for (int i = 1; i <= n; i++) {
    if (b[len] < a[i]) { b[++len] = a[i]; pos[i] = len; }
    else {
        int j = (int)(lower_bound(b+1, b+len+1, a[i]) - b);
        b[j] = a[i]; pos[i] = j;
    }
}
for (int i = n, j = len; i >= 1 && j >= 1; i--)
    if (pos[i] == j) ans[j--] = a[i];
for (int i = 1; i <= len; i++) cout << ans[i] << " \n"[i==len];
```

### 复杂度

$O(n \log n)$。

---

## 6. [U245788 最长上升子序列（含通配符）](https://www.luogu.com.cn/problem/U245788)

`LIS` `通配符` `贪心`

### 题意

序列中某些位置的值为 0，表示可以替换为任意非负整数。求所有可能方案中最长严格上升子序列的最大长度。

### 分析

0 是万能匹配符，可以视为"占位符"插入到任何位置。使用贪心 + 二分维护辅助数组 $b$（$b[k]$ 为当前长度 $k$ 的 LIS 末尾最小值）。遇到非零元素正常处理；遇到 0 时，直接在 $b$ 末尾追加一个极小值（如 $-\infty$），表示这个 0 可以让 LIS 无条件延长 1（因为它能取任意比当前末尾大的值）。

### 核心代码

```cpp
const int N = 100010;
int n, a[N], b[N];
int len = 0;
b[0] = -2e9;

for (int i = 1; i <= n; i++) {
    if (a[i] == 0) {
        b[++len] = -1e9 + len;  // 0 可取任意值，直接追加极小占位符
    } else if (b[len] < a[i]) {
        b[++len] = a[i];
    } else {
        int j = (int)(lower_bound(b+1, b+len+1, a[i]) - b);
        b[j] = a[i];
    }
}
cout << len << endl;
```

### 复杂度

$O(n \log n)$。

---

## 7. [P4309 最长上升子序列（动态插入）](https://www.luogu.com.cn/problem/P4309)

`LIS` `线段树` `动态序列`

### 题意

初始序列为空，依次将 $1 \sim N$ 插入到指定位置，每次插入后输出当前序列的 LIS 长度。

### 分析

关键观察：插入的是 $1 \sim N$ 的一个排列，且每次插入的数值递减（最后一次插入 1，倒数第二次插入 2，……）。倒过来考虑：从插入顺序的最后一个元素（值最小）开始，依次"添加"，此时添加的元素值递增。每次添加一个值为 $v$ 且位于序列第 $pos$ 位的元素，计算以它结尾的 LIS 长度：需要找位置在 $pos$ 之前、值小于 $v$ 的已添加元素中 $f$ 的最大值（= 位置在 $pos$ 之前的已添加元素的 $f$ 最大值，因值本身递增保证严格上升），用线段树维护区间最大值。每插入一个元素后从后往前更新答案数组。

### 核心代码

```cpp
// 线段树维护区间 f 最大值
int tree[N * 4];
void update(int node, int l, int r, int pos, int val) {
    if (l == r) { tree[node] = max(tree[node], val); return; }
    int mid = (l + r) / 2;
    if (pos <= mid) update(2*node, l, mid, pos, val);
    else            update(2*node+1, mid+1, r, pos, val);
    tree[node] = max(tree[2*node], tree[2*node+1]);
}
int query(int node, int l, int r, int ql, int qr) {
    if (ql > qr) return 0;
    if (ql <= l && r <= qr) return tree[node];
    int mid = (l + r) / 2, res = 0;
    if (ql <= mid) res = max(res, query(2*node, l, mid, ql, qr));
    if (qr > mid)  res = max(res, query(2*node+1, mid+1, r, ql, qr));
    return res;
}
// 倒序处理，ans[i] 为第 i 次插入后的 LIS 长度
for (int i = n; i >= 1; i--) {
    int p = insertPos[i];  // 第 i 次插入的位置
    f[i] = query(1, 1, n, 1, p - 1) + 1;
    update(1, 1, n, p, f[i]);
    ans[i] = max(ans[i+1], f[i]);
}
```

### 复杂度

$O(n \log n)$。

---

# 三、最长公共子序列与子串（LCS / 最长公共子串）

LCS 与最长公共子串是双序列线性 DP 的两大基础模型，区别在于子序列可以不连续而子串必须连续。在此基础上可以扩展到方案计数、转化为 LIS、后缀自动机（SAM）优化多字符串等各类变体。

## 8. [U197280 最长公共子序列](https://www.luogu.com.cn/problem/U197280)

`线性DP` `LCS` `双序列`

### 题意

给定两个序列 $X$ 和 $Y$，求它们的最长公共子序列（不要求连续）的长度。

### 分析

标准 $O(nm)$ LCS。定义 $f[i][j]$ 为 $X$ 的前 $i$ 个字符与 $Y$ 的前 $j$ 个字符的最长公共子序列长度。若 $X[i] = Y[j]$，则 $f[i][j] = f[i-1][j-1] + 1$；否则 $f[i][j] = \max(f[i-1][j], f[i][j-1])$。边界 $f[i][0] = f[0][j] = 0$。

### 核心代码

```cpp
const int N = 1010;
char a[N], b[N];
int n, m, f[N][N];

scanf("%s%s", a+1, b+1);
n = strlen(a+1); m = strlen(b+1);

for (int i = 1; i <= n; i++)
    for (int j = 1; j <= m; j++) {
        if (a[i] == b[j]) f[i][j] = f[i-1][j-1] + 1;
        else              f[i][j] = max(f[i-1][j], f[i][j-1]);
    }
cout << f[n][m] << endl;
```

### 复杂度

$O(nm)$。

---

## 9. [P2516 最长公共子序列（含计数）](https://www.luogu.com.cn/problem/P2516)

`线性DP` `LCS` `方案计数`

### 题意

给定两个字符序列，求最长公共子序列的长度，以及所有长度达到最大值的不同公共子序列的个数（对 $10^8$ 取模）。

### 分析

在标准 LCS 的 $f[i][j]$ 基础上，增加方案数数组 $g[i][j]$。初始化 $g[i][0] = g[0][j] = 1$（空序列只有 1 种方案）。转移时：若 $a[i] = b[j]$，则 $g[i][j] = g[i-1][j-1]$；否则若 $f[i-1][j] > f[i][j-1]$，则 $g[i][j] = g[i-1][j]$；若 $f[i-1][j] < f[i][j-1]$，则 $g[i][j] = g[i][j-1]$；若相等，则 $g[i][j] = g[i-1][j] + g[i][j-1] - g[i-1][j-1]$（容斥去除重复计数）。

### 核心代码

```cpp
const int N = 510, MOD = 1e8;
char a[N], b[N];
int n, m, f[N][N], g[N][N];

for (int i = 0; i <= n; i++) g[i][0] = 1;
for (int j = 0; j <= m; j++) g[0][j] = 1;

for (int i = 1; i <= n; i++)
    for (int j = 1; j <= m; j++) {
        if (a[i] == b[j]) { f[i][j] = f[i-1][j-1]+1; g[i][j] = g[i-1][j-1]; }
        else if (f[i-1][j] > f[i][j-1]) { f[i][j] = f[i-1][j]; g[i][j] = g[i-1][j]; }
        else if (f[i-1][j] < f[i][j-1]) { f[i][j] = f[i][j-1]; g[i][j] = g[i][j-1]; }
        else { f[i][j] = f[i-1][j]; g[i][j] = (g[i-1][j]+g[i][j-1]-g[i-1][j-1]+MOD)%MOD; }
    }
cout << f[n][m] << "\n" << g[n][m] << endl;
```

### 复杂度

$O(nm)$。

---

## 10. [P1439 两个排列的 LCS](https://www.luogu.com.cn/problem/P1439)

`LCS` `转化为LIS` `$O(n \log n)$`

### 题意

给出 $1 \sim n$ 的两个排列 $P_1$ 和 $P_2$，求它们的最长公共子序列。$n \le 10^5$，要求 $O(n \log n)$。

### 分析

利用排列的特殊性将 LCS 转化为 LIS。建立映射数组 $pos$：$pos[P_1[i]] = i$（记录 $P_1$ 中每个数字的位置）。然后将 $P_2$ 中每个数字替换为其在 $P_1$ 中的位置，得到数组 $c$。$c[i] = pos[P_2[i]]$。$P_1$ 和 $P_2$ 的 LCS 等价于 $c$ 的 LIS：若公共子序列在 $P_1$ 中位置单调递增，则在 $c$ 中体现为严格上升。

### 核心代码

```cpp
const int N = 100010;
int n, p1[N], p2[N], pos[N], c[N], b[N];
int len = 0;

for (int i = 1; i <= n; i++) pos[p1[i]] = i;
for (int i = 1; i <= n; i++) c[i] = pos[p2[i]];

b[0] = -1;
for (int i = 1; i <= n; i++) {
    if (c[i] > b[len]) b[++len] = c[i];
    else {
        int j = (int)(lower_bound(b+1, b+len+1, c[i]) - b);
        b[j] = c[i];
    }
}
cout << len << endl;
```

### 复杂度

$O(n \log n)$。

---

## 11. [T493246 最长公共子串](https://www.luogu.com.cn/problem/T493246)

`线性DP` `最长公共子串` `连续`

### 题意

给定两个字符串，输出它们的最长公共子串（必须连续）的长度。

### 分析

与 LCS 类似但要求连续。定义 $f[i][j]$ 为以 $A[i]$ 和 $B[j]$ 结尾的最长公共子串长度。若 $A[i] = B[j]$，则 $f[i][j] = f[i-1][j-1] + 1$；否则 $f[i][j] = 0$（子串断开）。遍历过程中维护全局最大值作为答案。

### 核心代码

```cpp
const int N = 1005;
char a[N], b[N];
int n, m, f[N][N], ans = 0;

scanf("%s%s", a+1, b+1);
n = strlen(a+1); m = strlen(b+1);

for (int i = 1; i <= n; i++)
    for (int j = 1; j <= m; j++) {
        if (a[i] == b[j]) f[i][j] = f[i-1][j-1] + 1;
        else              f[i][j] = 0;
        ans = max(ans, f[i][j]);
    }
cout << ans << endl;
```

### 复杂度

$O(nm)$。

---

## 12. [U396793 最长公共子串（输出方案）](https://www.luogu.com.cn/problem/U396793)

`线性DP` `最长公共子串` `路径输出`

### 题意

给定两个字符串（长度 $\le 1000$），输出它们最长公共子串的长度以及该子串本身。

### 分析

在 T493246 的基础上额外记录最优位置的结束下标 $endPos$。当 $f[i][j]$ 更新全局最大时，记录 $ans = f[i][j]$，$endPos = i$（在 $A$ 中的结束位置）。最后输出 $A[endPos - ans + 1 \ldots endPos]$ 即为最长公共子串。若字符串长度较大可用滚动数组优化空间，但 $\le 1000$ 时不必要。

### 核心代码

```cpp
const int N = 1005;
char a[N], b[N];
int n, m, f[N][N], ans = 0, endPos = 0;

for (int i = 1; i <= n; i++)
    for (int j = 1; j <= m; j++) {
        if (a[i] == b[j]) f[i][j] = f[i-1][j-1] + 1;
        else              f[i][j] = 0;
        if (f[i][j] > ans) { ans = f[i][j]; endPos = i; }
    }
cout << ans << "\n";
for (int i = endPos - ans + 1; i <= endPos; i++) cout << a[i];
cout << "\n";
```

### 复杂度

$O(nm)$。

---

## 13. [SP1811 LCS - Longest Common Substring（两串 SAM）](https://www.luogu.com.cn/problem/SP1811)

`后缀自动机 SAM` `最长公共子串` `$O(n+m)$`

### 题意

给定两个字符串，求最长公共子串的长度。字符串可能很长，需要线性算法。

### 分析

用字符串 $A$ 构建后缀自动机（SAM），然后用字符串 $B$ 在 SAM 上匹配。维护当前匹配长度 $cur$ 和当前所在状态 $st$。对 $B$ 的每个字符 $c$：若当前状态有 $c$ 的转移则直接走，$cur{+}{+}$；否则沿 link 链上跳，直到找到有 $c$ 的转移或回到根，然后走一步（若找到则 $cur = len[st] + 1$，否则 $cur = 0$，$st = $ 初始状态）。维护全局最大的 $cur$。

### 核心代码

```cpp
// SAM 节点结构（ch 为 26 叉，link 为后缀链接，len 为最长匹配长度）
int st = 0, cur = 0, ans = 0;
for (int i = 0; i < (int)B.size(); i++) {
    int c = B[i] - 'a';
    while (st && !sam.ch[st][c]) { st = sam.link[st]; cur = sam.len[st]; }
    if (sam.ch[st][c]) { st = sam.ch[st][c]; cur++; }
    ans = max(ans, cur);
}
cout << ans << endl;
```

### 复杂度

建 SAM $O(n)$，匹配 $O(m)$，总 $O(n+m)$。

---

## 14. [SP1812 LCS2 - Longest Common Substring II（多串 SAM）](https://www.luogu.com.cn/problem/SP1812)

`后缀自动机 SAM` `多字符串最长公共子串`

### 题意

给定若干个字符串，求它们的最长公共子串的长度。

### 分析

用第一个字符串建 SAM，为每个状态维护数组 $mn[v]$ 表示"用所有其他字符串在该状态上匹配时，能达到的最短匹配长度（在所有字符串中共有的最长子串长度上限）"。对每个其他字符串执行 SP1811 相同的匹配过程，得到每个状态的当前匹配长度 $tmp[v]$；匹配结束后将 $mn[v] = \min(mn[v], tmp[v])$。匹配时沿 link 链向上传播（父状态的 $tmp$ 取子状态中最大值）。最终答案为所有状态 $mn[v]$ 的最大值。

### 核心代码

```cpp
// 对每个非第一个字符串 B 执行：
fill(tmp, tmp+sz, 0);
int st = 0, cur = 0;
for (char c : B) {
    int ch = c - 'a';
    while (st && !sam.ch[st][ch]) { st = sam.link[st]; cur = sam.len[st]; }
    if (sam.ch[st][ch]) { st = sam.ch[st][ch]; cur++; }
    tmp[st] = max(tmp[st], cur);
}
// 沿 link 树从叶到根更新（拓扑序）
for (int v : topoOrder) tmp[sam.link[v]] = max(tmp[sam.link[v]], tmp[v]);
for (int v = 1; v < sz; v++) mn[v] = min(mn[v], tmp[v]);
// 最终答案
for (int v = 1; v < sz; v++) ans = max(ans, mn[v]);
```

### 复杂度

$O(\sum |S_i|)$。

---

## 15. [SP10570 LONGCS - K 字符串最长公共子串](https://www.luogu.com.cn/problem/SP10570)

`后缀自动机 SAM` `多字符串最长公共子串` `K 串`

### 题意

给定 $K$ 个字符串，求它们的最长公共子串的长度。

### 分析

与 SP1812 完全一致，对 $K$ 个字符串取第一个建 SAM，其余 $K-1$ 个在 SAM 上逐一匹配并更新 $mn$ 数组。本题与 SP1812 算法相同，唯一区别在于 $K$ 可能更大，需注意字符串总长度的内存与时间上限。代码框架与 SP1812 相同。

### 核心代码

```cpp
// 与 SP1812 相同框架，处理 K 个字符串
// 对第 1 个字符串建 SAM，对其余每个字符串执行匹配后更新 mn[]
// 最终 ans = max over all states v of mn[v]
for (int v = 1; v < sz; v++) ans = max(ans, mn[v]);
cout << ans << endl;
```

### 复杂度

$O(\sum |S_i|)$。

---

## 16. [P5546 公共串（多字符串 LCS，SA 做法）](https://www.luogu.com.cn/problem/P5546)

`后缀数组 SA` `二分` `多字符串最长公共子串`

### 题意

给出若干由小写字母构成的单词，求它们最长公共子串的长度。（本题数据规模使得 SA 方法更为常见。）

### 分析

将所有字符串用不同分隔符拼接，构建后缀数组（SA）和 height 数组，对 height 数组二分答案 $x$：检查是否存在一段连续区间使得 height 序列均 $\ge x$，且这段区间内包含了所有字符串的后缀。单调队列或直接线性扫描验证即可。

### 核心代码

```cpp
// 将所有串拼接成 s，串间插入不同分隔符，建 SA 和 height 数组
// 二分 ans，check(x) 验证：
bool check(int x) {
    set<int> present;
    for (int i = 2; i <= n; i++) {
        if (height[i] >= x) { present.insert(id[sa[i]]); present.insert(id[sa[i-1]]); }
        else present.clear();
        if ((int)present.size() == k) return true;  // k 为字符串数
    }
    return false;
}
// 答案为满足 check(x) 的最大 x
```

### 复杂度

$O(n \log^2 n)$ 或 $O(n \log n)$（SA 建立 $O(n \log n)$，二分验证 $O(n \log n)$）。

---

## 17. [P12729 最长公共括号子串](https://www.luogu.com.cn/problem/P12729)

`线性DP` `最长公共子串` `合法括号序列`

### 题意

给定两个仅由 `(` 和 `)` 组成的字符串 $A$ 和 $B$，求同时是 $A$ 的子串、$B$ 的子串、且本身是合法括号序列的最长字符串的长度。若不存在则输出 0。

### 分析

在最长公共子串 DP 的基础上，增加"合法括号序列"的约束。定义 $f[i][j]$ 为以 $A[i]$ 和 $B[j]$ 结尾的最长公共合法括号子串长度（必须 $\ge 2$ 且以 `)` 结尾才可能合法）。转移：若 $A[i] = B[j] = \text{`)'}`$，则需要找到对应的左括号。令 $pi = $ $A[1..i-1]$ 中与第 $i$ 个右括号匹配的左括号位置，$pj$ 同理。若 $A[pi] = B[pj] = \text{`('}$ 且 $f[i-1][j-1]$ 包含了 $[pi+1..i-1]$ 对应的合法部分，则 $f[i][j] = f[pi-1][pj-1] + f[i-1][j-1] + 2$ 需要小心处理内层与外层的嵌套关系。实际转移为 $f[i][j] = f[pi-1][pj-1] + (i - pi - 1) \cdot 2 + 2$，但需保证 $i - pi = j - pj$（两侧匹配括号对数相同）。

### 核心代码

```cpp
// match[i] 为字符串中第 i 个字符对应的匹配括号位置
// f[i][j]: 以 A[i],B[j] 结尾的最长公共合法括号子串
for (int i = 1; i <= n; i++)
    for (int j = 1; j <= m; j++) {
        if (A[i] != B[j] || A[i] != ')') { f[i][j] = 0; continue; }
        int pi = matchA[i], pj = matchB[j];
        if (pi == 0 || pj == 0) { f[i][j] = 0; continue; }
        if (i - pi != j - pj) { f[i][j] = 0; continue; }
        f[i][j] = (pi > 1 && pj > 1 ? f[pi-1][pj-1] : 0) + (i - pi + 1);
        ans = max(ans, f[i][j]);
    }
```

### 复杂度

$O(nm)$。

---

## 18. [P4112 最短不公共子串/子序列](https://www.luogu.com.cn/problem/P4112)

`后缀自动机 SAM` `BFS` `DP` `四问题`

### 题意

给定两个小写字符串 $a$、$b$，回答四个问题：
1. $a$ 的最短子串，不是 $b$ 的子串；
2. $a$ 的最短子串，不是 $b$ 的子序列；
3. $a$ 的最短子序列，不是 $b$ 的子串；
4. $a$ 的最短子序列，不是 $b$ 的子序列。

### 分析

**问题 1**（最短子串不是 $b$ 的子串）：用 $b$ 建 SAM，在 SAM 上做 BFS/DP：$d[u]$ 为从状态 $u$ 出发最少还需添加几个字符才能"走出" SAM（即无法继续匹配）。答案为用 $a$ 在 SAM 上逐字符匹配时遇到"无转移"情况的最短长度。**问题 2**（最短子串不是 $b$ 的子序列）：$f[i][j]$ 表示 $a$ 从位置 $i$ 开始的子串，在 $b[j+1..]$ 中不能匹配到的最短长度，反向 DP。**问题 3**（最短子序列不是 $b$ 的子串）：对 $b$ 建 SAM，用 BFS 求从 SAM 各状态"逃离"所需最短步数，再对 $a$ 做 DP。**问题 4**（最短子序列不是 $b$ 的子序列）：$f[i][j]$ 表示 $a[1..i]$ 中选出的最短子序列能"不被 $b[1..j]$ 匹配"，$nxt[j][c]$ 为 $b$ 中 $j$ 位置之后字符 $c$ 的下一个位置。

### 核心代码

```cpp
// 问题 4 核心（最短子序列不是 b 的子序列）
// dp[j] = a 中前若干字符选出子序列后，b 恰好匹配到位置 j 时的最小步数
// nxt[j][c] = b 中 j 之后 c 的下一个出现位置（m+1 代表不存在）
vector<int> dp(m+2, 1e9); dp[0] = 0;
for (int i = 1; i <= n; i++) {
    vector<int> ndp(m+2, 1e9);
    int c = a[i] - 'a';
    for (int j = 0; j <= m; j++) {
        if (dp[j] == (int)1e9) continue;
        int nx = nxt[j][c];
        if (nx > m) ndp[m+1] = min(ndp[m+1], dp[j]+1);  // 无法继续匹配
        else        ndp[nx]   = min(ndp[nx],   dp[j]+1);
    }
    for (int j = 0; j <= m+1; j++) dp[j] = min(dp[j], ndp[j]);
}
cout << dp[m+1] << "\n";
```

### 复杂度

各子问题均为 $O(nm)$ 或 $O((n+m) \cdot |\Sigma|)$。

---

# 四、最长公共上升子序列（LCIS）

LCIS 是 LCS 与 LIS 的综合，定义比较精巧，转移时需要同时维护"公共"和"严格上升"两个约束。$O(n^2 m)$ 暴力容易想到，优化为 $O(nm)$ 的核心是内层循环合并。

## 19. [U118717 最长公共上升子序列](https://www.luogu.com.cn/problem/U118717)

`线性DP` `LCIS` `$O(nm)$`

### 题意

给定两个整数序列 $A$、$B$，求它们的最长公共上升子序列（既是 $A$ 的子序列，也是 $B$ 的子序列，且严格递增）的长度。

### 分析

定义 $f[j]$ 为以 $B[j]$ 结尾的最长公共上升子序列长度（在处理完 $A[i]$ 之后）。外层枚举 $A[i]$，内层枚举 $B[j]$：若 $A[i] \ne B[j]$，跳过；若 $A[i] = B[j]$，则需要找所有 $B[k] < B[j]$（即 $k < j$，$B[k] < A[i]$）中 $f[k]$ 的最大值加 1。优化：维护辅助变量 $mx$ 随 $j$ 增大实时更新（当 $B[j] < A[i]$ 时 $mx = \max(mx, f[j])$），使总复杂度降为 $O(nm)$。

### 核心代码

```cpp
const int N = 3010;
int n, m, A[N], B[N], f[N], ans = 0;

for (int i = 1; i <= n; i++) {
    int mx = 0;
    for (int j = 1; j <= m; j++) {
        if (B[j] < A[i]) mx = max(mx, f[j]);
        if (A[i] == B[j]) f[j] = mx + 1;
        ans = max(ans, f[j]);
    }
}
cout << ans << endl;
```

### 复杂度

$O(nm)$。

---

## 20. [P10954 LCIS](https://www.luogu.com.cn/problem/P10954)

`线性DP` `LCIS` `$O(nm)$`

### 题意

与 U118717 完全相同，求两个整数序列的最长公共上升子序列的长度。

### 分析

与 U118717 相同，直接套用 $O(nm)$ 的 LCIS 模板即可。算法思路一致：外层枚举 $A[i]$，内层结合辅助变量 $mx$ 一趟完成转移，无需修改。

### 核心代码

```cpp
const int N = 3010;
int n, m, A[N], B[N], f[N], ans = 0;

for (int i = 1; i <= n; i++) {
    int mx = 0;
    for (int j = 1; j <= m; j++) {
        if (B[j] < A[i])  mx = max(mx, f[j]);
        if (A[i] == B[j]) f[j] = mx + 1;
        ans = max(ans, f[j]);
    }
}
cout << ans << endl;
```

### 复杂度

$O(nm)$。

---

## 21. [CF10D LCIS（输出方案）](https://www.luogu.com.cn/problem/CF10D)

`线性DP` `LCIS` `路径回溯`

### 题意

给定两个整数序列，求最长公共上升子序列，并输出其中一组方案。

### 分析

在 $O(nm)$ LCIS 的基础上增加路径回溯。用 $pre[j]$ 记录 $f[j]$ 更新时的前驱状态（在 $B$ 中的位置），即当前转移中让 $f[j]$ 最优的那个 $k$（$B[k] < B[j]$，$A[i] = B[j]$）。由于 $B$ 的长度可能变化，需同时记录每个 $j$ 的 $f[j]$ 值的更新时刻以便正确回溯。找到答案位置 $j^*$（$f[j^*]$ 最大），沿 $pre$ 链回溯输出。

### 核心代码

```cpp
const int N = 510;
int n, m, A[N], B[N], f[N], pre[N], ans = 0, ansJ = 0;

for (int i = 1; i <= n; i++) {
    int mx = 0, mxK = 0;
    for (int j = 1; j <= m; j++) {
        if (B[j] < A[i] && f[j] > mx) { mx = f[j]; mxK = j; }
        if (A[i] == B[j] && mx + 1 > f[j]) {
            f[j] = mx + 1; pre[j] = mxK;
            if (f[j] > ans) { ans = f[j]; ansJ = j; }
        }
    }
}
// 回溯输出
vector<int> path;
for (int j = ansJ; j; j = pre[j]) path.push_back(B[j]);
reverse(path.begin(), path.end());
cout << ans << "\n";
for (int x : path) cout << x << " ";
cout << "\n";
```

### 复杂度

$O(nm)$。

---

# 五、编辑距离

编辑距离（Levenshtein Distance）是 LCS 概念的自然延伸，将"是否匹配"推广到"三种操作的最小代价"，是字符串 DP 的核心模型，在拼写纠错、生物信息学等领域有广泛应用。

## 22. [P2758 编辑距离](https://www.luogu.com.cn/problem/P2758)

`线性DP` `编辑距离` `双序列`

### 题意

给定两个字符串 $A$ 和 $B$（仅含小写字母），可以对 $A$ 进行插入一个字符、删除一个字符、将一个字符改为另一个字符三种操作，求将 $A$ 变为 $B$ 的最少操作次数。

### 分析

定义 $f[i][j]$ 为将 $A$ 的前 $i$ 个字符变为 $B$ 的前 $j$ 个字符的最少操作次数。若 $A[i] = B[j]$，不需要操作：$f[i][j] = f[i-1][j-1]$。否则取三种操作的最小值：$f[i-1][j] + 1$（删去 $A[i]$），$f[i][j-1] + 1$（向 $A[i]$ 后插入 $B[j]$），$f[i-1][j-1] + 1$（替换 $A[i]$ 为 $B[j]$）。边界：$f[i][0] = i$，$f[0][j] = j$。

### 核心代码

```cpp
const int N = 2010;
char a[N], b[N];
int n, m, f[N][N];

scanf("%s%s", a+1, b+1);
n = strlen(a+1); m = strlen(b+1);
for (int i = 1; i <= n; i++) f[i][0] = i;
for (int j = 1; j <= m; j++) f[0][j] = j;

for (int i = 1; i <= n; i++)
    for (int j = 1; j <= m; j++) {
        if (a[i] == b[j]) f[i][j] = f[i-1][j-1];
        else f[i][j] = min({f[i-1][j], f[i][j-1], f[i-1][j-1]}) + 1;
    }
cout << f[n][m] << endl;
```

### 复杂度

$O(nm)$。

---

# 六、状态机 DP — 不相邻选取与股票买卖

这一章的核心思想是：把每个位置的"决策"（选或不选、持有或不持有）建模为状态机的节点，转移方程直接对应状态机的边。掌握画转移图的习惯是解决此类题目的关键。

## 23. [U224502 大盗阿福](https://www.luogu.com.cn/problem/U224502)

`线性DP` `不相邻选取` `状态机`

### 题意

一条街上有 $n$ 家店铺，第 $i$ 家有 $w[i]$ 元现金。不能同时抢相邻的两家店（会触发报警），求能抢到的最大金额。

### 分析

经典"不相邻选取"状态机模型。定义 $f[i][0]$ 为不选第 $i$ 家的最大收益，$f[i][1]$ 为选第 $i$ 家的最大收益。转移：不选时前一家选或不选均可，$f[i][0] = \max(f[i-1][0], f[i-1][1])$；选时前一家必须不选，$f[i][1] = f[i-1][0] + w[i]$。初始 $f[1][0] = 0$，$f[1][1] = w[1]$。

### 核心代码

```cpp
const int N = 100010;
int n, w[N], f[N][2];

f[1][0] = 0; f[1][1] = w[1];
for (int i = 2; i <= n; i++) {
    f[i][0] = max(f[i-1][0], f[i-1][1]);
    f[i][1] = f[i-1][0] + w[i];
}
cout << max(f[n][0], f[n][1]) << endl;
```

### 复杂度

$O(n)$。

---

## 24. [U574437 大盗阿福](https://www.luogu.com.cn/problem/U574437)

`线性DP` `不相邻选取` `状态机`

### 题意

与 U224502 完全相同：$n$ 家店铺，不能抢相邻两家，求最大收益。

### 分析

与 U224502 完全一致，直接套用相同模板。唯一注意多测试用例时要重置数组或滚动使用变量。可以将 $f$ 数组替换为滚动变量 $prev0, prev1$ 节省空间。

### 核心代码

```cpp
int T; scanf("%d", &T);
while (T--) {
    int n; scanf("%d", &n);
    int prev0 = 0, prev1 = 0;
    for (int i = 1; i <= n; i++) {
        int w; scanf("%d", &w);
        int cur0 = max(prev0, prev1);
        int cur1 = prev0 + w;
        prev0 = cur0; prev1 = cur1;
    }
    printf("%d\n", max(prev0, prev1));
}
```

### 复杂度

$O(n)$。

---

## 25. [T257379 股票买卖 II（无限次交易）](https://www.luogu.com.cn/problem/T257379)

`线性DP` `股票买卖` `状态机` `无限次`

### 题意

给定 $n$ 天的股票价格，可以多次买卖（同一天不能同时买卖，必须先卖出再买入），不限交易次数，求最大利润。

### 分析

两状态状态机。定义 $f[i][0]$ 为第 $i$ 天结束时不持有股票的最大利润，$f[i][1]$ 为持有股票的最大利润。不持有 = 前一天就不持有，或前一天持有今天卖出：$f[i][0] = \max(f[i-1][0], f[i-1][1] + w[i])$。持有 = 前一天就持有，或前一天不持有今天买入：$f[i][1] = \max(f[i-1][1], f[i-1][0] - w[i])$。初始 $f[0][0] = 0$，$f[0][1] = -\infty$。

### 核心代码

```cpp
const int N = 100010;
int n, w[N], f[N][2];

f[0][0] = 0; f[0][1] = -1e9;
for (int i = 1; i <= n; i++) {
    f[i][0] = max(f[i-1][0], f[i-1][1] + w[i]);
    f[i][1] = max(f[i-1][1], f[i-1][0] - w[i]);
}
cout << f[n][0] << endl;
```

### 复杂度

$O(n)$。

---

## 26. [U281153 股票交易（至多 K 笔）](https://www.luogu.com.cn/problem/U281153)

`线性DP` `股票买卖` `K 笔交易` `多维状态机`

### 题意

给定 $n$ 天股票价格，最多完成 $K$ 笔交易（一买一卖算一笔），求最大利润。

### 分析

在无限次交易的基础上增加交易次数维度 $j$（$0 \le j \le K$）。$f[j][0]$ 表示已完成 $j$ 笔、不持有的最大利润；$f[j][1]$ 表示已买入第 $j+1$ 笔（持有）、已完成 $j$ 笔的最大利润。卖出时完成一笔：$f[j][0] = \max(f[j][0], f[j][1] + w[i])$。买入时从上一笔的不持有转来：$f[j][1] = \max(f[j][1], f[j-1][0] - w[i])$。初始所有 $f[j][1] = -\infty$。

### 核心代码

```cpp
const int N = 100010, KMAX = 110;
int n, k, w[N], f[KMAX][2];

for (int j = 0; j <= k; j++) f[j][1] = -1e9;

for (int i = 1; i <= n; i++)
    for (int j = k; j >= 1; j--) {
        f[j][0] = max(f[j][0], f[j][1] + w[i]);    // 卖出完成第 j 笔
        f[j][1] = max(f[j][1], f[j-1][0] - w[i]);  // 买入开始第 j 笔
    }
int ans = 0;
for (int j = 0; j <= k; j++) ans = max(ans, f[j][0]);
cout << ans << endl;
```

### 复杂度

$O(nk)$。

---

## 27. [U298750 股票买卖 V（含冷冻期）](https://www.luogu.com.cn/problem/U298750)

`线性DP` `股票买卖` `冷冻期` `三状态机`

### 题意

给定 $n$ 天股票价格，不限交易次数，但卖出股票后的第二天不能买入（冷冻期为 1 天），求最大利润。

### 分析

冷冻期使"不持有"需要分成两个子状态。三状态机：$f[i][0]$（今天刚卖出，明天冷冻无法买入）、$f[i][1]$（今天持有股票）、$f[i][2]$（今天不持有且非刚卖出，明天可以买入）。转移：$f[i][1] = \max(f[i-1][1], f[i-1][2] - w[i])$（持有 = 昨天持有或从冷静状态买入）；$f[i][0] = f[i-1][1] + w[i]$（今天卖出）；$f[i][2] = \max(f[i-1][0], f[i-1][2])$（冷静 = 昨天刚卖出或昨天也冷静）。初始 $f[0][1] = -\infty$，$f[0][0] = -\infty$，$f[0][2] = 0$。

### 核心代码

```cpp
const int N = 100010;
int n, w[N], f[N][3];

f[0][0] = -1e9; f[0][1] = -1e9; f[0][2] = 0;
for (int i = 1; i <= n; i++) {
    f[i][1] = max(f[i-1][1], f[i-1][2] - w[i]);  // 持有
    f[i][0] = f[i-1][1] + w[i];                   // 今天卖出（冷冻明天）
    f[i][2] = max(f[i-1][0], f[i-1][2]);           // 冷静（昨天卖出或一直冷静）
}
cout << max(f[n][0], f[n][2]) << endl;
```

### 复杂度

$O(n)$。

---

# 总结

## 知识点全景图

| # | 题目 | 核心技巧 |
|---|---|---|
| 1 | P1216 数字三角形 | 自底向上递推 / 数字三角形 |
| 2 | P1004 方格取数 | 两路同步走 / 3D 降维 |
| 3 | P1006 传纸条 | 两路不重叠 / 同步 DP |
| 4 | B3637 最长上升子序列 | $O(n^2)$ LIS |
| 5 | T386911 LIS 输出解 | $O(n\log n)$ LIS + 路径回溯 |
| 6 | U245788 LIS 含通配符 | 贪心 + 逐位检查 |
| 7 | P4309 LIS 动态插入 | 线段树 + 倒序 LIS |
| 8 | U197280 标准 LCS | $O(nm)$ 双序列 DP |
| 9 | P2516 LCS 计数 | LCS + 方案数容斥 |
| 10 | P1439 排列 LCS | 转化为 LIS $O(n\log n)$ |
| 11 | T493246 最长公共子串 | 连续约束 DP |
| 12 | U396793 最长公共子串输出 | 连续 DP + 记录位置 |
| 13 | SP1811 LCS（SAM） | 后缀自动机在线匹配 |
| 14 | SP1812 多串最长公共子串 | SAM + 多串 $mn$ 更新 |
| 15 | SP10570 K 串最长公共子串 | SAM 多串推广 |
| 16 | P5546 多串公共串 | 后缀数组 SA + 二分 |
| 17 | P12729 最长公共括号子串 | 子串 DP + 括号匹配约束 |
| 18 | P4112 最短不公共子串/子序列 | SAM + BFS + 四问题 DP |
| 19 | U118717 LCIS | $O(nm)$ LCIS 模板 |
| 20 | P10954 LCIS | $O(nm)$ LCIS 模板 |
| 21 | CF10D LCIS 输出方案 | LCIS + $pre$ 回溯 |
| 22 | P2758 编辑距离 | 经典三操作 DP |
| 23 | U224502 大盗阿福 | 不相邻选取状态机 |
| 24 | U574437 大盗阿福 | 不相邻选取状态机 |
| 25 | T257379 股票买卖 II | 无限次两状态机 |
| 26 | U281153 股票交易 K 笔 | K 笔交易多维状态机 |
| 27 | U298750 股票买卖 V | 冷冻期三状态机 |

## 学习路线建议

建议先从 **数字三角形 → LIS → LCS → 编辑距离** 的顺序打牢双序列 DP 基础，理解"以什么结尾"与"前多少个"两种状态视角的区别；再进入 **最长公共子串 → LCIS** 系列，体会"连续"与"严格上升"给转移带来的变化；然后从 **SAM 优化多串子串** 问题感受字符串数据结构与 DP 的结合；最后学习 **状态机 DP 系列**，通过画转移图训练定义状态的直觉。

## 解题方法论

- **先画转移图再写方程**：状态机类 DP（大盗阿福、股票买卖）先把每种状态画成节点、操作画成有向边，方程自然就出来了。
- **LCS 的连续变体 = 不匹配归零**：最长公共子串与 LCS 唯一区别是 $a[i] \ne b[j]$ 时不取 $\max$ 而是直接置 0，因为子串必须连续。
- **LCIS 的 $O(nm)$ 优化来自合并内层循环**：将"找 $B[k] < B[j]$ 中 $f[k]$ 的最大值"的枚举 $k$ 合并进枚举 $j$ 的过程，用单个变量 $mx$ 实时维护。
- **两路同步走 = 步数作为外层**：方格取数、传纸条的关键在于"同步"消去一维，使两人始终处于相同步数，避免依赖关系混乱。
- **SAM 做多串子串问题**：建一个串的 SAM，其余串依次在上面匹配，对每个状态取"所有串的最短匹配长度"的最大值即为答案，时间复杂度 $O(\sum |S_i|)$。
