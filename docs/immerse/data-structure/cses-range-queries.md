---
title: "CSES 区间查询专题精选解题报告"
subtitle: "🏗️ 从静态前缀到懒标记、可持久化和值域统计的区间主线"
order: 6
icon: "🏗️"
---

# CSES 区间查询专题精选解题报告

这一组题从静态前缀和一路走到懒标记、可持久化和值域查询，表面都在问区间，真正反复出现的是“把答案拆成可维护的信息”。有时拆成前缀，有时拆成节点摘要，有时连时间轴和值域都要一起塞进结构里。

# 一、静态预处理：前缀和、稀疏表与归并树

数组不改时，最强的武器不是维护，而是一次性把能回答的信息铺开。加法能拆成前缀，最值能做幂次覆盖，而带上二维坐标或值域条件时，就该改用更细的预处理结构。

## 1. [Static Range Sum Queries](https://cses.fi/problemset/task/1646)

`前缀和` `静态查询`

### 题意

给定一个固定数组，多次询问区间 $[a,b]$ 的元素和。

### 分析

数组完全静态时，区间和最自然的拆法就是两个前缀和之差。先记 $pre_i=\sum_{j=1}^i a_j$，那么任意询问都能直接写成 $pre_b-pre_{a-1}$。

这题没有任何技巧性的合并过程，真正要注意的是数值范围。单个元素可到 $10^9$，所以前缀数组和答案都要用 `long long` 保存。

### 核心代码

```cpp
vector<long long> pre(n + 1);
for(int i = 1; i <= n; ++i) pre[i] = pre[i - 1] + a[i];
auto ask = [&](int l, int r) {
    return pre[r] - pre[l - 1];
};
```

### 复杂度

预处理时间复杂度 $O(n)$，单次查询时间复杂度 $O(1)$，空间复杂度 $O(n)$。

---

## 2. [Static Range Minimum Queries](https://cses.fi/problemset/task/1647)

`稀疏表` `区间最小值`

### 题意

给定一个固定数组，多次询问区间 $[a,b]$ 中的最小值。

### 分析

最小值没有前缀可减，但它满足幂次区间合并的幂等性：一个长度为 $2^k$ 的区间最小值，可以由两个长度为 $2^{k-1}$ 的答案合并得到。

因此直接建 Sparse Table。查询时取 $k=\lfloor\log_2(r-l+1)\rfloor$，答案就是覆盖整个区间的两个长度 $2^k$ 的块的最小值。因为 `min` 可重复使用，重叠并不会出错。

### 核心代码

```cpp
for(int i = 1; i <= n; ++i) st[0][i] = a[i];
for(int k = 1; k <= K; ++k)
    for(int i = 1; i + (1 << k) - 1 <= n; ++i)
        st[k][i] = min(st[k - 1][i], st[k - 1][i + (1 << (k - 1))]);
auto ask = [&](int l, int r) {
    int k = lg[r - l + 1];
    return min(st[k][l], st[k][r - (1 << k) + 1]);
};
```

### 复杂度

预处理时间复杂度 $O(n\log n)$，单次查询时间复杂度 $O(1)$，空间复杂度 $O(n\log n)$。

---

## 3. [Range Xor Queries](https://cses.fi/problemset/task/1650)

`前缀异或` `静态查询`

### 题意

给定一个固定数组，多次询问区间 $[a,b]$ 的按位异或值。

### 分析

异或和加法一样，也有“前缀可消去”的性质。记 $px_i=a_1\oplus a_2\oplus\cdots\oplus a_i$，那么区间异或就是 $px_b\oplus px_{a-1}$。

关键原因在于同一个数异或两次会抵消，所以前缀重叠部分会全部消失，只剩下区间内部。写法和前缀和几乎完全一致。

### 核心代码

```cpp
vector<int> px(n + 1);
for(int i = 1; i <= n; ++i) px[i] = px[i - 1] ^ a[i];
auto ask = [&](int l, int r) {
    return px[r] ^ px[l - 1];
};
```

### 复杂度

预处理时间复杂度 $O(n)$，单次查询时间复杂度 $O(1)$，空间复杂度 $O(n)$。

---

## 4. [Forest Queries](https://cses.fi/problemset/task/1652)

`二维前缀和` `矩形计数`

### 题意

给定一张只包含空地和树的网格，多次询问某个矩形内有多少棵树。

### 分析

询问对象从一维区间变成了二维矩形，但本质还是“把答案拆成前缀”。令 $pre_{i,j}$ 表示左上角到 $(i,j)$ 的树木数量，那么任意矩形都能用四块前缀做容斥。

这题的难点只有坐标别写反：输入按 $(y,x)$ 描述，容斥公式要始终保持行列一致。由于没有修改，二维前缀和已经足够。

### 核心代码

```cpp
for(int i = 1; i <= n; ++i)
    for(int j = 1; j <= n; ++j)
        pre[i][j] = pre[i - 1][j] + pre[i][j - 1] - pre[i - 1][j - 1] + (g[i][j] == '*');
auto ask = [&](int y1, int x1, int y2, int x2) {
    return pre[y2][x2] - pre[y1 - 1][x2] - pre[y2][x1 - 1] + pre[y1 - 1][x1 - 1];
};
```

### 复杂度

预处理时间复杂度 $O(n^2)$，单次查询时间复杂度 $O(1)$，空间复杂度 $O(n^2)$。

---

## 5. [Range Interval Queries](https://cses.fi/problemset/task/3163)

`归并树` `二维偏序`

### 题意

给定数组，多次询问下标在 $[a,b]$ 且数值在 $[c,d]$ 的元素个数。

### 分析

题目同时卡下标范围和值域范围，本质是二维偏序计数。按下标建线段树，每个节点存这一段的有序值表，就能把“位置落在区间内”交给线段树，把“值不超过某个上界”交给二分。

于是答案可以写成 $count(\le d)-count(\le c-1)$。这正是归并树最典型的使用方式：结构按位置分治，统计在节点内部二分完成。

### 核心代码

```cpp
void build(int x, int l, int r){
    if(l == r){ t[x] = {a[l]}; return; }
    int m = (l + r) >> 1;
    build(x << 1, l, m); build(x << 1 | 1, m + 1, r);
    merge(t[x << 1].begin(), t[x << 1].end(), t[x << 1 | 1].begin(), t[x << 1 | 1].end(), back_inserter(t[x]));
}
int leq(int x, int l, int r, int L, int R, int v){
    if(R < l || r < L) return 0;
    if(L <= l && r <= R) return upper_bound(t[x].begin(), t[x].end(), v) - t[x].begin();
    int m = (l + r) >> 1;
    return leq(x << 1, l, m, L, R, v) + leq(x << 1 | 1, m + 1, r, L, R, v);
}
```

### 复杂度

建树时间复杂度 $O(n\log n)$，单次查询时间复杂度 $O(\log^2 n)$，空间复杂度 $O(n\log n)$。

---

# 二、基础动态维护：树状数组、二维树状数组与顺序统计

一旦区间里开始掺进修改，静态预处理就不够了。这一章都在练最基本的对数级维护：单点改、区间加、二维翻转，以及“第 $k$ 个还活着的位置”这类顺序统计。

## 6. [Dynamic Range Sum Queries](https://cses.fi/problemset/task/1648)

`树状数组` `单点修改`

### 题意

数组支持单点赋值，同时需要回答区间 $[a,b]$ 的和。

### 分析

这里的修改只发生在单个位置，查询又是最标准的区间和，所以直接用树状数组维护前缀和即可。赋值操作先算出增量 $u-a_k$，再把增量加到树状数组里。

之所以不必上更重的结构，是因为树状数组刚好覆盖了“单点改、前缀和”这组操作，常数更小，写法也更紧。

### 核心代码

```cpp
void add(int i, long long v){ for(; i <= n; i += i & -i) bit[i] += v; }
long long sum(int i){ long long r = 0; for(; i; i -= i & -i) r += bit[i]; return r; }
void assign(int k, long long u){ add(k, u - a[k]); a[k] = u; }
long long ask(int l, int r){ return sum(r) - sum(l - 1); }
```

### 复杂度

建树时间复杂度 $O(n\log n)$，单次修改和查询时间复杂度都是 $O(\log n)$，空间复杂度 $O(n)$。

---

## 7. [Dynamic Range Minimum Queries](https://cses.fi/problemset/task/1649)

`线段树` `区间最小值`

### 题意

数组支持单点赋值，同时需要回答区间 $[a,b]$ 的最小值。

### 分析

最小值不能像和那样做差，但它可以在线段树上稳定合并。每个节点只存本段最小值，单点修改后沿着根路径回推即可。

这题的核心不是状态设计，而是确认“节点信息足够少”。既然答案只依赖左右儿子的最小值，线段树节点就完全不需要再携带别的内容。

### 核心代码

```cpp
void upd(int x, int l, int r, int p, int v){
    if(l == r){ mn[x] = v; return; }
    int m = (l + r) >> 1;
    if(p <= m) upd(x << 1, l, m, p, v); else upd(x << 1 | 1, m + 1, r, p, v);
    mn[x] = min(mn[x << 1], mn[x << 1 | 1]);
}
int qry(int x, int l, int r, int L, int R){
    if(L <= l && r <= R) return mn[x];
    int m = (l + r) >> 1, ans = INT_MAX;
    if(L <= m) ans = min(ans, qry(x << 1, l, m, L, R));
    if(R > m) ans = min(ans, qry(x << 1 | 1, m + 1, r, L, R));
    return ans;
}
```

### 复杂度

建树时间复杂度 $O(n)$，单次修改和查询时间复杂度都是 $O(\log n)$，空间复杂度 $O(n)$。

---

## 8. [Range Update Queries](https://cses.fi/problemset/task/1651)

`差分` `树状数组`

### 题意

支持区间加法操作，并查询某个单点当前的值。

### 分析

区间加、单点查最适合从差分数组切入。若对差分数组在 $l$ 加 $u$、在 $r+1$ 减 $u$，那么原数组位置 $k$ 的真实增量就是差分前缀和。

因此把差分数组放进树状数组即可。查询时用初始值加上差分前缀和，整道题就从“区间维护”退化成了两次单点修改和一次前缀查询。

### 核心代码

```cpp
void add(int i, long long v){ for(; i <= n; i += i & -i) bit[i] += v; }
long long sum(int i){ long long r = 0; for(; i; i -= i & -i) r += bit[i]; return r; }
void range_add(int l, int r, long long v){ add(l, v); add(r + 1, -v); }
long long point(int k){ return a[k] + sum(k); }
```

### 复杂度

建树时间复杂度 $O(n\log n)$，单次区间修改和单点查询时间复杂度都是 $O(\log n)$，空间复杂度 $O(n)$。

---

## 9. [Forest Queries II](https://cses.fi/problemset/task/1739)

`二维树状数组` `动态矩形查询`

### 题意

森林网格支持单点翻转空地/树木，并查询任意矩形内的树木数量。

### 分析

静态版本能靠二维前缀和，但一旦允许翻转格子，就必须把“前缀统计”换成可动态更新的结构。二维树状数组正好支持单点加减和矩形求和。

翻转操作的关键是先知道当前格子的状态，再决定加入 $+1$ 还是 $-1$。矩形答案仍旧用四个前缀容斥，只是这些前缀现在由二维 BIT 提供。

### 核心代码

```cpp
void add(int y, int x, int v){
    for(int i = y; i <= n; i += i & -i)
        for(int j = x; j <= n; j += j & -j) bit[i][j] += v;
}
int sum(int y, int x){
    int r = 0;
    for(int i = y; i; i -= i & -i)
        for(int j = x; j; j -= j & -j) r += bit[i][j];
    return r;
}
int ask(int y1, int x1, int y2, int x2){
    return sum(y2, x2) - sum(y1 - 1, x2) - sum(y2, x1 - 1) + sum(y1 - 1, x1 - 1);
}
```

### 复杂度

初始化时间复杂度 $O(n^2\log^2 n)$，单次翻转和查询时间复杂度都是 $O(\log^2 n)$，空间复杂度 $O(n^2)$。

---

## 10. [Hotel Queries](https://cses.fi/problemset/task/1143)

`线段树` `二分下探`

### 题意

每次给来访团队分配最靠左且容量足够的酒店，并把该酒店剩余房间数减少。

### 分析

题目要求的不是“有没有”足够大的酒店，而是“最靠左”的那一个，所以光会求全局最大值还不够，还要能沿树往左优先地下探。

在线段树中维护每段的最大剩余房间数。查询某个需求 $x$ 时，若左儿子的最大值已经够，就继续进左边；否则只能去右边。这一步把“第一个满足条件的位置”直接从树结构里走出来。

### 核心代码

```cpp
int first(int x, int l, int r, int need){
    if(mx[x] < need) return 0;
    if(l == r) return l;
    int m = (l + r) >> 1;
    if(mx[x << 1] >= need) return first(x << 1, l, m, need);
    return first(x << 1 | 1, m + 1, r, need);
}
void dec(int x, int l, int r, int p, int v){
    if(l == r){ mx[x] -= v; return; }
    int m = (l + r) >> 1;
    if(p <= m) dec(x << 1, l, m, p, v); else dec(x << 1 | 1, m + 1, r, p, v);
    mx[x] = max(mx[x << 1], mx[x << 1 | 1]);
}
```

### 复杂度

建树时间复杂度 $O(n)$，单次分配时间复杂度 $O(\log n)$，空间复杂度 $O(n)$。

---

## 11. [List Removals](https://cses.fi/problemset/task/1749)

`顺序统计` `线段树`

### 题意

给定初始序列和一串位置，每次删除当前序列中的第 $p_i$ 个元素，并输出它。

### 分析

位置是相对于“当前还活着的元素”定义的，所以不能真的用数组反复删除。更自然的做法是维护每个位置是否仍然存在，并支持查询第 $k$ 个存在的位置。

在线段树里存活跃计数后，求第 $k$ 个元素就等价于一棵顺序统计树：若左儿子有至少 $k$ 个活元素，就往左走，否则扣掉左侧数量去右边。找到真实下标后再把该点计数改成 $0$。

### 核心代码

```cpp
int kth(int x, int l, int r, int k){
    if(l == r) return l;
    int m = (l + r) >> 1;
    if(cnt[x << 1] >= k) return kth(x << 1, l, m, k);
    return kth(x << 1 | 1, m + 1, r, k - cnt[x << 1]);
}
void erase(int x, int l, int r, int p){
    if(l == r){ cnt[x] = 0; return; }
    int m = (l + r) >> 1;
    if(p <= m) erase(x << 1, l, m, p); else erase(x << 1 | 1, m + 1, r, p);
    cnt[x] = cnt[x << 1] + cnt[x << 1 | 1];
}
```

### 复杂度

建树时间复杂度 $O(n)$，每次删除时间复杂度 $O(\log n)$，空间复杂度 $O(n)$。

---

# 三、线段树节点设计：把答案压进摘要里

有些答案不是简单求和，而是前缀最优、子段最优、距离修正，甚至还带着复杂懒标记。关键在于想清楚一个节点必须保留哪些信息，合并时又该怎样完整还原。

## 12. [Prefix Sum Queries](https://cses.fi/problemset/task/2166)

`线段树` `最大前缀和`

### 题意

支持单点赋值，并查询区间 $[a,b]$ 内允许空前缀时的最大前缀和。

### 分析

一个区间的最大前缀和，只和两件事有关：整个区间总和，以及从左端开始最优能拿到多少。因此节点只需维护 `sum` 和 `pref` 两个量。

合并时，新的总和是左右总和之和；新的前缀最优要么全部在左边，要么吃完整个左区间再接右边前缀，即 $\max(pref_L,sum_L+pref_R)$。查询出来后再和 $0$ 取最大，就对应题目允许空前缀的条件。

### 核心代码

```cpp
struct Node{ long long sum, pref; };
Node merge(Node a, Node b){
    return {a.sum + b.sum, max(a.pref, a.sum + b.pref)};
}
Node make(long long v){ return {v, max(0LL, v)}; }
```

### 复杂度

建树时间复杂度 $O(n)$，单次修改和查询时间复杂度都是 $O(\log n)$，空间复杂度 $O(n)$。

---

## 13. [Pizzeria Queries](https://cses.fi/problemset/task/2206)

`线段树` `绝对值拆分`

### 题意

每个位置都有披萨价格，支持单点修改，并询问在位置 $k$ 订餐的最小总价 $p_i+|i-k|$。

### 分析

绝对值是这题真正的切口。把式子拆成两边：若 $i\le k$，答案是 $(p_i-i)+k$；若 $i\ge k$，答案是 $(p_i+i)-k$。这样区间最小值就能独立维护。

因此准备两棵线段树或两个最小值数组，分别维护 $p_i-i$ 和 $p_i+i$。查询时从左侧区间取一个最小值、右侧区间再取一个最小值，最后拼回去即可。

### 核心代码

```cpp
void upd(int p, long long v){
    segL.upd(p, v - p);
    segR.upd(p, v + p);
}
long long ask(int k){
    return min(segL.qry(1, k) + k, segR.qry(k, n) - k);
}
```

### 复杂度

建树时间复杂度 $O(n)$，单次修改和查询时间复杂度都是 $O(\log n)$，空间复杂度 $O(n)$。

---

## 14. [Subarray Sum Queries](https://cses.fi/problemset/task/1190)

`线段树` `最大子段和`

### 题意

数组会被单点修改，每次修改后都要输出整个数组的最大子段和，空子段也允许。

### 分析

最大子段和在线段树上是经典四元组：区间总和、最大前缀和、最大后缀和、最大子段和。修改只影响一条根路径，回溯时用左右儿子的摘要重新合并。

其中跨越中点的最优子段只能写成“左后缀 + 右前缀”，所以合并公式非常固定。由于允许空子段，叶子节点的三种最优值都要和 $0$ 取最大。

### 核心代码

```cpp
struct Node{ long long sum, pref, suff, best; };
Node merge(Node a, Node b){
    return {
        a.sum + b.sum,
        max(a.pref, a.sum + b.pref),
        max(b.suff, b.sum + a.suff),
        max({a.best, b.best, a.suff + b.pref})
    };
}
Node make(long long v){ long long w = max(0LL, v); return {v, w, w, w}; }
```

### 复杂度

建树时间复杂度 $O(n)$，单次修改时间复杂度 $O(\log n)$，空间复杂度 $O(n)$。

---

## 15. [Subarray Sum Queries II](https://cses.fi/problemset/task/3226)

`线段树` `区间最大子段和`

### 题意

给定静态数组，多次询问区间 $[a,b]$ 内的最大子段和，空子段也允许。

### 分析

这题沿用最大子段和的四元组，但难点从“修改”变成“区间查询”。只要查询函数也返回同样的四元组，两个部分区间的答案就还能按同一公式合并。

于是线段树不再只是为了维护，而是为了把查询区间拆成若干块后重新组装。最终取返回节点的 `best`，就是该询问的最大子段和。

### 核心代码

```cpp
Node qry(int x, int l, int r, int L, int R){
    if(L <= l && r <= R) return tr[x];
    int m = (l + r) >> 1;
    if(R <= m) return qry(x << 1, l, m, L, R);
    if(L > m) return qry(x << 1 | 1, m + 1, r, L, R);
    return merge(qry(x << 1, l, m, L, R), qry(x << 1 | 1, m + 1, r, L, R));
}
```

### 复杂度

建树时间复杂度 $O(n)$，单次查询时间复杂度 $O(\log n)$，空间复杂度 $O(n)$。

---

## 16. [Range Updates and Sums](https://cses.fi/problemset/task/1735)

`懒标记` `区间赋值`

### 题意

数组支持区间加、区间赋值和区间求和三种操作。

### 分析

这题难的不是求和，而是两种更新如何共存。区间赋值会彻底覆盖旧值，因此它的优先级必须高于区间加；如果先有赋值再加法，加法其实应该叠到新的常数上。

在线段树中给每个节点维护 `sum`，懒标记里同时记录“是否存在赋值标记”和“额外加了多少”。下传时先处理赋值，再处理加法，顺序一乱答案就会错。

### 核心代码

```cpp
void applySet(int x, int l, int r, long long v){
    sum[x] = 1LL * (r - l + 1) * v;
    hasSet[x] = 1; setv[x] = v; addv[x] = 0;
}
void applyAdd(int x, int l, int r, long long v){
    sum[x] += 1LL * (r - l + 1) * v;
    if(hasSet[x]) setv[x] += v; else addv[x] += v;
}
void push(int x, int l, int r){
    int m = (l + r) >> 1;
    if(hasSet[x]) applySet(x << 1, l, m, setv[x]), applySet(x << 1 | 1, m + 1, r, setv[x]), hasSet[x] = 0;
    if(addv[x]) applyAdd(x << 1, l, m, addv[x]), applyAdd(x << 1 | 1, m + 1, r, addv[x]), addv[x] = 0;
}
```

### 复杂度

建树时间复杂度 $O(n)$，单次操作时间复杂度 $O(\log n)$，空间复杂度 $O(n)$。

---

## 17. [Polynomial Queries](https://cses.fi/problemset/task/1736)

`懒标记` `等差数列`

### 题意

支持对区间 $[a,b]$ 加上 $1,2,3,\dots$ 这样的递增序列，并查询区间和。

### 分析

这道题的更新不是常数，而是一段等差数列。把区间 $[a,b]$ 中位置 $i$ 的增量写成 $i-a+1$ 后，可以发现对任意线段节点来说，它依旧是“首项 + 公差”的形式。

所以懒标记不再是一个数，而是“该节点左端点对应的首项”和公差。整段求和用等差数列公式，下传到右儿子时，首项要平移左儿子的长度。

### 核心代码

```cpp
long long tri(long long n){ return n * (n - 1) / 2; }
void apply(int x, int l, int r, long long a0, long long d){
    long long len = r - l + 1;
    sum[x] += len * a0 + tri(len) * d;
    lazyA[x] += a0; lazyD[x] += d;
}
void push(int x, int l, int r){
    if(!lazyA[x] && !lazyD[x]) return;
    int m = (l + r) >> 1, len = m - l + 1;
    apply(x << 1, l, m, lazyA[x], lazyD[x]);
    apply(x << 1 | 1, m + 1, r, lazyA[x] + 1LL * len * lazyD[x], lazyD[x]);
    lazyA[x] = lazyD[x] = 0;
}
```

### 复杂度

建树时间复杂度 $O(n)$，单次更新和查询时间复杂度都是 $O(\log n)$，空间复杂度 $O(n)$。

---

## 18. [Range Queries and Copies](https://cses.fi/problemset/task/1737)

`可持久化线段树` `版本复制`

### 题意

维护多份数组版本，支持基于某一版本单点修改、区间求和，以及直接复制整个版本。

### 分析

“复制整份数组”若真做深拷贝，复杂度会直接爆炸。真正可行的做法是让不同版本共享绝大多数节点，只有被修改的那条根到叶路径才重新开点。

这正是可持久化线段树的场景。复制版本时只复制根指针；单点修改时一路克隆经过的节点；区间求和则始终在对应版本的根上查询。

### 核心代码

```cpp
struct Node{ long long sum; int lc, rc; } tr[8000000];
int clone(int p){ tr[++tot] = tr[p]; return tot; }
int upd(int p, int l, int r, int pos, int v){
    p = clone(p);
    if(l == r){ tr[p].sum = v; return p; }
    int m = (l + r) >> 1;
    if(pos <= m) tr[p].lc = upd(tr[p].lc, l, m, pos, v);
    else tr[p].rc = upd(tr[p].rc, m + 1, r, pos, v);
    tr[p].sum = tr[tr[p].lc].sum + tr[tr[p].rc].sum;
    return p;
}
```

### 复杂度

建树时间复杂度 $O(n)$，单次复制时间复杂度 $O(1)$，单次修改和查询时间复杂度都是 $O(\log n)$，空间复杂度 $O(n+q\log n)$。

---

# 四、离线扫描与值域视角

还有一些题并不适合正面做区间。把右端点扫过去、把数值压成坐标、把时间抽成跳跃函数，答案就能改写成更规整的计数问题。

## 19. [Salary Queries](https://cses.fi/problemset/task/1144)

`坐标压缩` `值域树状数组`

### 题意

员工工资会被单点修改，同时要统计工资落在区间 $[a,b]$ 内的人数。

### 分析

这里的区间不是下标区间，而是值域区间。把所有初始工资和所有修改后的工资一起离散化后，就能把“有多少工资落在某个值域里”变成树状数组上的频率前缀和。

查询 $[a,b]$ 的人数时，求不超过 $b$ 的人数减去小于 $a$ 的人数即可。因为所有可能出现的工资都提前加入了压缩表，后续修改不会碰到新坐标。

### 核心代码

```cpp
int id(long long x){ return lower_bound(vals.begin(), vals.end(), x) - vals.begin() + 1; }
void add(int i, int v){ for(; i <= m; i += i & -i) bit[i] += v; }
int sum(int i){ int r = 0; for(; i; i -= i & -i) r += bit[i]; return r; }
int ask(long long l, long long r){
    int R = upper_bound(vals.begin(), vals.end(), r) - vals.begin();
    int L = lower_bound(vals.begin(), vals.end(), l) - vals.begin();
    return sum(R) - sum(L);
}
```

### 复杂度

离散化和初始化时间复杂度 $O((n+q)\log (n+q))$，单次操作时间复杂度 $O(\log (n+q))$，空间复杂度 $O(n+q)$。

---

## 20. [Distinct Values Queries](https://cses.fi/problemset/task/1734)

`离线扫描` `不同值计数`

### 题意

给定静态数组，多次询问区间 $[a,b]$ 内不同数字的个数。

### 分析

若把右端点从左到右扫过去，并且只在每个值的最后一次出现位置上保留一个 $1$，那么任意前缀里的 $1$ 的总数就恰好等于前缀不同值个数。

因此把询问按右端点分组。扫描到位置 $i$ 时，如果这个值以前出现过，就把旧位置的 $1$ 删掉，在新位置加上 $1$。这样区间 $[l,r]$ 的答案就是扫描到 $r$ 时树状数组上的区间和。

### 核心代码

```cpp
for(int i = 1; i <= n; ++i){
    if(last.count(a[i])) add(last[a[i]], -1);
    add(i, 1); last[a[i]] = i;
    for(auto [l, id] : qs[i]) ans[id] = sum(i) - sum(l - 1);
}
```

### 复杂度

排序分组后总时间复杂度 $O((n+q)\log n)$，空间复杂度 $O(n)$。

---

## 21. [Movie Festival Queries](https://cses.fi/problemset/task/1664)

`贪心` `倍增跳跃`

### 题意

给定若干部电影的起止时间，多次询问在到达时刻 $a$ 与离场时刻 $b$ 之间最多能完整看多少部电影。

### 分析

单次询问时，最优策略仍然是经典的“每一步都选当前能看的、结束最早的电影”。难点在于询问很多，不能每次都线性贪心。

把时间视作状态。预处理 `next[t]` 表示若当前时刻是 $t$，贪心能选到的第一部电影结束于何时；然后再对这个函数做倍增。这样一次询问就变成：从 $a$ 开始，不断沿着“下一部电影结束时刻”跳，统计最多能跳多少次且终点不超过 $b$。

### 核心代码

```cpp
for(int t = T; t >= 1; --t){
    best[t] = best[t + 1];
    for(int e : start[t]) best[t] = min(best[t], e);
    up[0][t] = best[t];
}
for(int k = 1; k < LOG; ++k)
    for(int t = 1; t <= T + 1; ++t) up[k][t] = up[k - 1][up[k - 1][t]];
int ask(int a, int b){
    int cur = a, ans = 0;
    for(int k = LOG - 1; k >= 0; --k) if(up[k][cur] && up[k][cur] <= b) ans += 1 << k, cur = up[k][cur];
    return ans;
}
```

### 复杂度

预处理时间复杂度 $O((T+n)\log T)$，单次查询时间复杂度 $O(\log T)$，空间复杂度 $O(T\log T)$。

---

## 22. [Distinct Values Queries II](https://cses.fi/problemset/task/3356)

`有序集合` `区间判重`

### 题意

数组支持单点修改，并询问区间 $[a,b]$ 内的所有值是否两两不同。

### 分析

区间里有重复值，当且仅当存在某个位置 $i\in[a,b]$，它的下一个相同值 `nxt[i]` 也落在区间里。于是问题就转成了：查询区间内最小的 `nxt[i]` 是否不大于 $b$。

对每个值维护一个有序位置集合，就能在插入或删除某个位置时只修改相邻位置的 `nxt`。再用线段树维护全局 `nxt` 最小值，询问只需判断 `min_nxt(a,b)>b` 是否成立。

### 核心代码

```cpp
void erase_pos(int p, set<int>& s){
    auto it = s.find(p), nx = next(it), pv = (it == s.begin() ? s.end() : prev(it));
    if(pv != s.end()) seg.upd(*pv, nx == s.end() ? INF : *nx);
    seg.upd(p, INF); s.erase(it);
}
void insert_pos(int p, set<int>& s){
    auto it = s.insert(p).first, nx = next(it), pv = (it == s.begin() ? s.end() : prev(it));
    seg.upd(p, nx == s.end() ? INF : *nx);
    if(pv != s.end()) seg.upd(*pv, p);
}
bool ok(int l, int r){ return seg.qry(l, r) > r; }
```

### 复杂度

单次修改时间复杂度 $O(\log n)$，单次查询时间复杂度 $O(\log n)$，空间复杂度 $O(n)$。

---

## 23. [Missing Coin Sum Queries](https://cses.fi/problemset/task/2184)

`可持久化值域树` `贪心`

### 题意

对每个区间 $[a,b]$，求只使用这段硬币时无法凑出的最小金额。

### 分析

正整数硬币的经典贪心是：若当前已经能凑出 $[1,reach]$，那么只要所有不超过 $reach+1$ 的硬币总和为 $S$，就能把可达范围扩到 $[1,S]$；一旦总和停在 $reach$，答案就是 $reach+1$。

难点在于硬币只能取子数组。把每个前缀建成一棵可持久化值域线段树，节点里存“这一值域内硬币总值”，就能在任意区间上询问“值不超过 $x$ 的硬币总和”。不断用当前的 $reach+1$ 去扩张，直到不再增长即可。

### 核心代码

```cpp
long long prefSum(int u, int v, int l, int r, int q){
    if(!q || l > q) return 0;
    if(r <= q) return tr[u].sum - tr[v].sum;
    int m = (l + r) >> 1;
    return prefSum(tr[u].lc, tr[v].lc, l, m, q) + prefSum(tr[u].rc, tr[v].rc, m + 1, r, q);
}
long long ask(int l, int r){
    long long reach = 0;
    while(true){
        int q = upper_bound(vals.begin(), vals.end(), reach + 1) - vals.begin();
        long long s = prefSum(root[r], root[l - 1], 1, M, q);
        if(s == reach) return reach + 1;
        reach = s;
    }
}
```

### 复杂度

建树时间复杂度 $O(n\log V)$，单次查询时间复杂度 $O(\log V\cdot\log_2 \text{答案})$，空间复杂度 $O(n\log V)$。

---

# 五、难维护区间：前缀最大化与可见性

最后这几题都在问“区间内部自己演化以后会怎样”。一题要跟踪前缀最大值一段一段接管后缀，另一题则要数出最高楼被刷新了多少次，维护对象都不再是普通和最值。

## 24. [Increasing Array Queries](https://cses.fi/problemset/task/2416)

`单调栈` `倍增跳跃`

### 题意

对每个子数组 $[a,b]$，求最少增加多少次，才能让这段数组变成非递减。

### 分析

子数组变成非递减后，每个位置都会被前面的最大值“抬高”，最终序列其实就是原序列的前缀最大值序列。于是代价等于“这些前缀最大值组成的分段常数函数面积”减去原数组和。

从右往左做单调栈，可以找到每个位置的下一个更大值，表示当前最大值还能统治到哪里。对这些分段再做倍增，询问时就能整块跳过完整统治区间，只在最后一段做一次部分计算。

### 核心代码

```cpp
while(!st.empty() && a[st.back()] <= a[i]) st.pop_back();
up[0][i] = st.empty() ? n + 1 : st.back();
addv[0][i] = 1LL * a[i] * (up[0][i] - i) - (pre[up[0][i] - 1] - pre[i - 1]);
long long ask(int l, int r){
    long long ans = 0; int p = l;
    for(int k = LOG - 1; k >= 0; --k) if(up[k][p] <= r) ans += addv[k][p], p = up[k][p];
    return ans + 1LL * a[p] * (r - p + 1) - (pre[r] - pre[p - 1]);
}
```

### 复杂度

预处理时间复杂度 $O(n\log n)$，单次查询时间复杂度 $O(\log n)$，空间复杂度 $O(n\log n)$。

---

## 25. [Visible Buildings Queries](https://cses.fi/problemset/task/3304)

`线段树` `可见性`

### 题意

站在区间左侧，只保留区间 $[a,b]$ 的建筑时，询问能看到多少栋楼。

### 分析

一栋楼可见，当且仅当它比左边所有楼都高。对一个固定区间来说，这就是在从左到右扫描时，最高值被刷新了多少次。

在线段树的每个节点中，预存该段从左往右的“前缀新高序列”。查询区间时按从左到右的顺序访问节点，维护当前最高高度 `cur`；对完整覆盖的节点，用二分数出其前缀新高序列里有多少个值大于 `cur`，然后把 `cur` 更新为该节点最大值。

### 核心代码

```cpp
void use(int x, int &cur, int &ans){
    ans += tr[x].inc.end() - upper_bound(tr[x].inc.begin(), tr[x].inc.end(), cur);
    cur = max(cur, tr[x].mx);
}
void qry(int x, int l, int r, int L, int R, int &cur, int &ans){
    if(R < l || r < L) return;
    if(L <= l && r <= R){ use(x, cur, ans); return; }
    int m = (l + r) >> 1;
    qry(x << 1, l, m, L, R, cur, ans);
    qry(x << 1 | 1, m + 1, r, L, R, cur, ans);
}
```

### 复杂度

建树时间复杂度 $O(n\log n)$，单次查询时间复杂度 $O(\log^2 n)$，空间复杂度 $O(n\log n)$。
