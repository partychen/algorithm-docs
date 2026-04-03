---
title: "洛谷 离线、树上与动态数据结构专题精选解题报告"
subtitle: "🚀 从莫队、虚树到点分治、LCT 与平衡树"
order: 5
icon: "🚀"
---

# 洛谷 离线、树上与动态数据结构专题精选解题报告

这一组题从莫队与离线统计一路走到虚树、K-D Tree、可并堆、点分治、LCT 和平衡树，表面上分散，实际上都在处理“标准模板已经装不下”的维护问题。它们共同训练的是另一种能力：先找清真正该维护的对象，再决定用离线重排、树上拆解还是动态结构去承接。

# 一、莫队与离线统计

这一组的共同点是把询问重新排序，再把区间增删或时间回退压成可维护状态。

## 1. [P4688 \[Ynoi Easy Round 2016\] 掉进兔子洞](https://www.luogu.com.cn/problem/P4688)

`莫队` `值域计数` `多区间交`

### 题意

每次给出序列上的三个区间，要求把三个区间中能三方同时配对掉的数按出现次数一一删去，求删完后三个区间剩余元素个数之和。

### 分析

核心是把答案写成 `len1+len2+len3-3*sum(min(c1[x],c2[x],c3[x]))`。做法是用莫队维护三个区间的值频，同时维护每个值在三段中的公共出现次数，这样每次区间端点移动时只需改一个值的贡献。

### 核心代码

```cpp
long long common;

void upd(int id, int x, int d) {
    int old = min(c1[x], min(c2[x], c3[x]));
    cnt[id][x] += d;
    common += min(c1[x], min(c2[x], c3[x])) - old;
}
// ans = len1 + len2 + len3 - 3 * common;
```

### 复杂度

时间复杂度约为 $O((n+m)\sqrt n)$，空间复杂度 $O(n)$。

---

## 2. [P3674 小清新人渣的本愿](https://www.luogu.com.cn/problem/P3674)

`莫队` `bitset` `存在性判定`

### 题意

给定序列，多次询问区间 `[l,r]` 内是否能选出两个数，使它们的差、和或积恰好等于给定的 `x`。

### 分析

正解是莫队配合 bitset。区间内只维护“某个值是否出现”，差与和都能转成 bitset 平移后的按位与，积则枚举 `x` 的因子判断两个因子是否同时出现。这样三类判定都落在同一套区间维护上。

### 核心代码

```cpp
bitset<V> vis, rev;

bool ok1(int x) { return (vis & (vis << x)).any(); }
bool ok2(int x) { return (vis & (rev >> (MAXV - x))).any(); }
bool ok3(int x) {
    for (int d = 1; d * d <= x; d++)
        if (x % d == 0 && vis[d] && vis[x / d]) return true;
    return false;
}
```

### 复杂度

时间复杂度约为 $O((n+m)\sqrt n\cdot \frac{V}{w} + \sum \sqrt x)$，空间复杂度 $O(V)$。

---

## 3. [P5355 \[Ynoi Easy Round 2017\] 由乃的玉米田](https://www.luogu.com.cn/problem/P5355)

`莫队` `bitset` `因子枚举`

### 题意

每次询问一个区间，判断其中是否存在两个数，使它们的差、和、积或整除意义下的商等于给定的 `x`。

### 分析

这题仍然是莫队维护值域出现情况。差和和继续用 bitset 平移，积靠枚举因子，商则枚举较小的数 `d`，检查 `d` 与 `d*x` 是否同在区间里。四类判定都围绕“某个值是否出现过”展开。

### 核心代码

```cpp
bool ok4(int x) {
    if (x == 0) return vis[0];
    for (int d = 1; d * x <= MAXV; d++)
        if (vis[d] && vis[d * x]) return true;
    return false;
}
// 其余三种判定与 P3674 同理
```

### 复杂度

时间复杂度约为 $O((n+m)\sqrt n\cdot \frac{V}{w} + \sum (\sqrt x + \frac{V}{x}))$，空间复杂度 $O(V)$。

---

## 4. [P5313 \[Ynoi2011\] WBLT](https://www.luogu.com.cn/problem/P5313)

`莫队` `根号分治` `bitset`

### 题意

对每个区间 `[l,r]` 和公差 `b`，求最大的 `x`，使得存在某个首项 `a`，让 `a,a+b,...,a+(x-1)b` 这些值都至少在区间中出现一次。

### 分析

区间本质上只关心“哪些值出现过”。做法是莫队维护出现集合，再对 `b` 做根号分治：`b` 小时按模 `b` 分组维护连续段长度，`b` 大时可行长度很短，直接枚举首项即可。这样把长等差链查询拆成小公差预处理与大公差暴力。

### 核心代码

```cpp
int solve_large(int b) {
    int best = 0;
    for (int a = 0; a < b; a++) {
        int len = 0;
        for (int x = a; x <= MAXV; x += b)
            len = exist[x] ? len + 1 : 0, best = max(best, len);
    }
    return best;
}
```

### 复杂度

时间复杂度约为 $O((n+m)\sqrt n + m\sqrt V)$，空间复杂度 $O(V)$。

---

## 5. [P4887 【模板】莫队二次离线 / 第十四分块(前体)](https://www.luogu.com.cn/problem/P4887)

`莫队二次离线` `异或计数` `分块`

### 题意

多次询问区间 `[l,r]` 中有多少对下标 `(i,j)` 满足 `i<j` 且 `a_i xor a_j` 的二进制里恰好有 `k` 个 `1`。

### 分析

直接莫队会在每次增删时枚举所有异或目标，代价太高。正解把询问按左端点块分类，块内部分用普通移动维护，跨整块的贡献二次离线处理，再用预处理好的 `popcount` 合法转移表统计答案。

### 核心代码

```cpp
for (int x = 0; x < (1 << 14); x++)
    for (int y : trans[x]) cur += cnt[y];

void add(int x) {
    for (int y : trans[x]) ans_now += cnt[y];
    cnt[x]++;
}
```

### 复杂度

时间复杂度约为 $O((n+m)\sqrt n + 2^{14}\binom{14}{k})$，空间复杂度 $O(2^{14})$。

---

## 6. [P5047 \[Ynoi2019 模拟赛\] Yuno loves sqrt technology II](https://www.luogu.com.cn/problem/P5047)

`莫队` `树状数组` `逆序对`

### 题意

给定一个序列，回答许多区间 `[l,r]` 内的逆序对数量。

### 分析

用普通莫队维护当前区间，再用树状数组按值域统计“小于当前值”和“大于当前值”的数量。右端加入一个数时新增若干前面比它大的元素，左端加入一个数时新增若干后面比它小的元素，删除时反向减掉即可。

### 核心代码

```cpp
void add_right(int x) {
    cur += query(MAXV) - query(x);
    bit.add(x, 1);
}
void add_left(int x) {
    cur += query(x - 1);
    bit.add(x, 1);
}
```

### 复杂度

时间复杂度 $O((n+m)\sqrt n\log V)$，空间复杂度 $O(V)$。

---

## 7. [P5501 \[LnOI2019\] 来者不拒，去者不追](https://www.luogu.com.cn/problem/P5501)

`莫队` `树状数组` `排名贡献`

### 题意

每次询问一个区间，把区间元素从小到大排序后，若某个值的排名是 `k`，就贡献 `k*a_i`；要求整个区间所有元素的 Abbi 值之和。

### 分析

插入一个值 `x` 时，它自身贡献 `x*(区间内严格小于它的个数+1)`，同时所有严格大于它的值排名都会加一，各自再多贡献一个自身值。于是用莫队维护区间，再用两个树状数组分别维护“数量”和“值之和”即可在线更新总答案。

### 核心代码

```cpp
void add(int x) {
    long long less = bit_cnt.sum(x - 1);
    long long greater_sum = bit_val.sum(MAXV) - bit_val.sum(x);
    cur += 1LL * x * (less + 1) + greater_sum;
    bit_cnt.add(x, 1), bit_val.add(x, x);
}
```

### 复杂度

时间复杂度 $O((n+m)\sqrt n\log V)$，空间复杂度 $O(V)$。

---

## 8. [P4074 \[WC2013\] 糖果公园](https://www.luogu.com.cn/problem/P4074)

`树上莫队` `带修` `欧拉序`

### 题意

树上每个点有颜色和权值，操作包含修改某个点的颜色，以及询问一条路径上按颜色出现次数计权后的总收益。

### 分析

正解是树上带修莫队。先把树转成欧拉序，路径询问改成区间加一个 LCA 特判；时间维上的颜色修改也一起排序。维护时用“点是否在当前路径内”的翻转技巧更新颜色计数，再按 `V[color] * W[cnt[color]]` 维护答案。

### 核心代码

```cpp
void toggle(int x) {
    int c = col[x];
    cur -= 1LL * val[c] * w[cnt[c]];
    cnt[c] += vis[x] ? -1 : 1;
    cur += 1LL * val[c] * w[cnt[c]];
    vis[x] ^= 1;
}
```

### 复杂度

时间复杂度约为 $O(q\,n^{2/3})$，空间复杂度 $O(n)$。

---

## 9. [AT_joisc2014_c 歴史の研究](https://www.luogu.com.cn/problem/AT_joisc2014_c)

`回滚莫队` `最大值维护` `离线询问`

### 题意

给定序列，多次询问区间 `[l,r]` 内 `值 × 出现次数` 的最大值。

### 分析

这里最难的是删除元素后最大值不好维护，所以用回滚莫队。每个左端点块固定后，右端点向右扩张时只做加入；块内左端点暴力向左补，算完立刻回滚。这样整个过程中不需要真正支持删除最大值。

### 核心代码

```cpp
void add(int x) {
    cnt[x]++;
    cur = max(cur, 1LL * val[x] * cnt[x]);
}
for (auto q : bucket[id]) {
    while (R < q.r) add(a[++R]);
    Snapshot bak = save();
    while (L > q.l) add(a[--L]);
    ans[q.id] = cur, load(bak), L = block_right + 1;
}
```

### 复杂度

时间复杂度约为 $O((n+m)\sqrt n)$，空间复杂度 $O(n)$。

---

## 10. [P5906 【模板】回滚莫队&不删除莫队](https://www.luogu.com.cn/problem/P5906)

`回滚莫队` `最远相同值距离` `首尾位置`

### 题意

每次询问区间 `[l,r]` 中，相同数字之间最远的下标差是多少；若没有重复数则输出 `0`。

### 分析

普通莫队删除元素时很难恢复某个值在区间内的最左和最右位置，于是改用回滚莫队。扩展右端时记录每个值第一次出现和最后一次出现的位置，块内左端暴力补进去，求完当前询问后把新增部分整体撤销。

### 核心代码

```cpp
void add(int pos) {
    int x = a[pos];
    if (!Lft[x]) Lft[x] = pos;
    Rgt[x] = pos;
    cur = max(cur, Rgt[x] - Lft[x]);
}
```

### 复杂度

时间复杂度约为 $O((n+m)\sqrt n)$，空间复杂度 $O(n)$。

---

## 11. [P1903 【模板】带修莫队 / \[国家集训队\] 数颜色 / 维护队列](https://www.luogu.com.cn/problem/P1903)

`带修莫队` `颜色种类数` `时间维`

### 题意

在一个颜色序列上支持单点改色，并询问区间 `[l,r]` 内不同颜色的种类数。

### 分析

三维莫队模板题。询问排序关键字是左块、右块、修改次数块；维护区间时记录每种颜色出现次数，时间指针移动到某次修改时，如果被修改位置正好落在当前区间，就先删旧色再加新色。

### 核心代码

```cpp
void apply(int t, int dir) {
    int p = chg[t].pos, &x = a[p];
    if (L <= p && p <= R) del(x), add(chg[t].to);
    swap(x, chg[t].to);
}
```

### 复杂度

时间复杂度约为 $O(n^{5/3})$，空间复杂度 $O(n)$。

---

## 12. [P1494 \[国家集训队\] 小 Z 的袜子](https://www.luogu.com.cn/problem/P1494)

`莫队` `组合计数` `概率`

### 题意

每次询问区间 `[l,r]` 内随机取两只袜子，它们颜色相同的概率是多少。

### 分析

区间内若某种颜色出现 `cnt` 次，就为分子贡献 `cnt*(cnt-1)`。因此莫队只需维护每种颜色计数和分子总和，分母固定是 `len*(len-1)`，最后化简分数即可。

### 核心代码

```cpp
long long num;

void add(int x) { num += 2LL * cnt[x]; cnt[x]++; }
void del(int x) { cnt[x]--; num -= 2LL * cnt[x]; }
// numerator = num, denominator = 1LL * len * (len - 1)
```

### 复杂度

时间复杂度 $O((n+m)\sqrt n)$，空间复杂度 $O(n)$。

---

## 13. [P2709 【模板】莫队 / 小 B 的询问](https://www.luogu.com.cn/problem/P2709)

`莫队` `平方和` `计数维护`

### 题意

多次询问区间 `[l,r]` 中各个值出现次数平方和，也就是 `sum(cnt_x^2)`。

### 分析

这是普通莫队的经典入门式。加入一个值 `x` 前后，`cnt_x^2` 的变化量是 `(cnt_x+1)^2-cnt_x^2=2cnt_x+1`；删除时反过来减掉即可。

### 核心代码

```cpp
long long cur;

void add(int x) { cur += 2LL * cnt[x] + 1, cnt[x]++; }
void del(int x) { cnt[x]--, cur -= 2LL * cnt[x] + 1; }
```

### 复杂度

时间复杂度 $O((n+m)\sqrt n)$，空间复杂度 $O(n)$。

---

# 二、单调结构与序列贪心

这一组都靠“最近更大/更小”或“维护单调候选集”来一次扫描解决。

## 14. [P1901 发射站](https://www.luogu.com.cn/problem/P1901)

`单调栈` `最近更高点` `贡献累加`

### 题意

每个发射站有高度和能量，它会把能量发给左右两侧离它最近且比它更高的发射站，求最后收到总能量最大的站点。

### 分析

对每个站只需要找到左右第一个更高站。单调递减栈正好能在线维护这个关系：扫描时弹掉不可能成为“更高屏障”的点，当前栈顶就是最近更高站，再把当前能量加给它。

### 核心代码

```cpp
while (!st.empty() && h[st.top()] <= h[i]) st.pop();
if (!st.empty()) sum[st.top()] += v[i];
st.push(i);
// 从左到右、从右到左各做一次
```

### 复杂度

时间复杂度 $O(n)$，空间复杂度 $O(n)$。

---

## 15. [P1823 \[COI 2007\] Patrik 音乐会的等待](https://www.luogu.com.cn/problem/P1823)

`单调栈` `可见对数` `相同高度压缩`

### 题意

一排人按顺序站立，若两人之间没有比他们更高的人就互相看得见，要求统计所有可见的人对数量。

### 分析

经典单调栈维护“从栈底到栈顶严格递减的高度”。遇到新高度时，所有不高于它的栈顶都会被它看到；对于相同高度，需要把连续相同的人数压成一组，既能一次统计同高对数，也能继续判断组后面是否还有更高的人。

### 核心代码

```cpp
while (!st.empty() && st.top().h < x) ans += st.top().cnt, st.pop();
if (!st.empty() && st.top().h == x) {
    ans += st.top().cnt;
    if (st.size() > 1) ans++;
    st.top().cnt++;
} else {
    if (!st.empty()) ans++;
    st.push({x, 1});
}
```

### 复杂度

时间复杂度 $O(n)$，空间复杂度 $O(n)$。

---

## 16. [P5788 【模板】单调栈](https://www.luogu.com.cn/problem/P5788)

`单调栈` `下一个更大元素` `模板`

### 题意

对每个位置 `i`，求它右侧第一个比 `a_i` 大的位置编号，不存在则输出 `0`。

### 分析

从左到右扫描，栈里保持一个值递减的下标栈。当 `a_i` 大于栈顶值时，说明 `i` 就是这些位置的第一个更大元素，可以直接赋值后出栈。

### 核心代码

```cpp
for (int i = 1; i <= n; i++) {
    while (!st.empty() && a[st.top()] < a[i]) ans[st.top()] = i, st.pop();
    st.push(i);
}
```

### 复杂度

时间复杂度 $O(n)$，空间复杂度 $O(n)$。

---

## 17. [P2947 \[USACO09MAR\] Look Up S](https://www.luogu.com.cn/problem/P2947)

`单调栈` `最近更高奶牛` `右侧查询`

### 题意

给定一列奶牛高度，对每头奶牛求它右边第一头比它高的奶牛编号。

### 分析

本质与“右侧第一个更大元素”完全一致。维护单调递减栈，当前奶牛一旦更高，就可以顺手成为若干前面奶牛的答案。

### 核心代码

```cpp
for (int i = 1; i <= n; i++) {
    while (!st.empty() && h[st.top()] < h[i]) nxt[st.top()] = i, st.pop();
    st.push(i);
}
```

### 复杂度

时间复杂度 $O(n)$，空间复杂度 $O(n)$。

---

## 18. [P2866 \[USACO06NOV\] Bad Hair Day S](https://www.luogu.com.cn/problem/P2866)

`单调栈` `可见数量` `递减栈`

### 题意

每头奶牛只向右看，直到被第一头不比自己矮的奶牛挡住，要求统计所有奶牛能看到的奶牛总数。

### 分析

从左到右维护一个严格递减栈。新奶牛到来时会弹掉所有不高于它的栈顶，因为这些奶牛以后都不可能再挡住别人；此时栈中剩余元素就是当前奶牛左边仍能看到它的那些更高奶牛。

### 核心代码

```cpp
for (int i = 1; i <= n; i++) {
    while (!st.empty() && h[st.top()] <= h[i]) st.pop();
    ans += st.size();
    st.push(i);
}
```

### 复杂度

时间复杂度 $O(n)$，空间复杂度 $O(n)$。

---

## 19. [P8094 \[USACO22JAN\] Cow Frisbee S](https://www.luogu.com.cn/problem/P8094)

`单调栈` `有效点对` `贡献统计`

### 题意

给定一个高度排列，若两头奶牛之间所有奶牛都比她们较矮的那一头还矮，则这对位置可以互相扔飞盘；要求统计所有合法位置对的得分总和。

### 分析

维护一个高度递减栈。当前奶牛到来时，会与被弹出的那些更矮奶牛分别形成一对；若栈里还剩元素，它与新的栈顶也能形成一对。每次形成点对时直接累加题目定义的距离贡献即可。

### 核心代码

```cpp
while (!st.empty() && h[st.top()] < h[i]) {
    ans += i - st.top() + 1;
    st.pop();
}
if (!st.empty()) ans += i - st.top() + 1;
st.push(i);
```

### 复杂度

时间复杂度 $O(n)$，空间复杂度 $O(n)$。

---

## 20. [P8082 \[COCI 2011/2012 #4\] KEKS](https://www.luogu.com.cn/problem/P8082)

`单调栈` `贪心` `删位最大化`

### 题意

给定一个数字串，必须删除恰好 `k` 位，使剩下的数字按原相对顺序组成的数尽量大。

### 分析

这是典型的“删位贪心”。从左到右扫字符串，只要当前数字比栈顶大且还可以删，就把栈顶删掉，因为把更大的数字尽量提到前面一定更优；扫完后若还没删够，再从末尾继续删。

### 核心代码

```cpp
for (char c : s) {
    while (!st.empty() && k && st.back() < c) st.pop_back(), k--;
    st.push_back(c);
}
while (k--) st.pop_back();
```

### 复杂度

时间复杂度 $O(n)$，空间复杂度 $O(n)$。

---

# 三、树上与图上高级结构

这一章收拢虚树、圆方树、树剖矩阵、树上差分以及一类图上结构压缩题。它们的共同点不是某个单一模板，而是都要先把原图或原树提炼成更稳定的结构，再在那层结构上做统计或转移。

## 21. [P8820 \[CSP-S 2022\] 数据传输](https://www.luogu.com.cn/problem/P8820)

`树链剖分` `矩阵DP` `k<=3`

### 题意

树上每台主机有处理时间，若两点树距不超过 `k` 就能直接传输；对每次 `(s,t)` 询问，求从 `s` 到 `t` 完成转发所需的最小总时间。

### 分析

由于 `k<=3`，状态只需记住路径末端最近的少数中转点。正解用树链剖分把路径拆成若干重链段，再用小矩阵维护“走到链端时保留哪些最近点”的最小代价，最后按路径顺序做矩阵乘法即可。

### 核心代码

```cpp
Mat merge(const Mat &A, const Mat &B) {
    Mat C;
    for (int i = 0; i < S; i++)
        for (int j = 0; j < S; j++)
            for (int k = 0; k < S; k++)
                C[i][j] = min(C[i][j], A[i][k] + B[k][j]);
    return C;
}
```

### 复杂度

预处理 $O(n\log n)$，单次询问 $O(\log n)$ 到 $O(\log^2 n)$，空间复杂度 $O(n)$。

---

## 22. [P5024 \[NOIP 2018 提高组\] 保卫王国](https://www.luogu.com.cn/problem/P5024)

`树上最小点覆盖` `动态DP` `矩阵乘法`

### 题意

树上每个点有驻军代价，每次强制指定两个点必须选或必须不选，要求满足所有边都被覆盖时的最小总代价。

### 分析

基础模型是树上点覆盖 DP：`f[x][0/1]` 表示 `x` 不选或选的最小代价。难点在于每次询问会改动两个点的可选状态，所以用重链剖分把子树转移写成矩阵，修改一个点只会沿重链向上重新合并，根矩阵很快就能得到答案。

### 核心代码

```cpp
base[x][0][0] = INF;
base[x][1][0] = w[x];
base[x][0][1] = sum_choose_child[x];
base[x][1][1] = sum_best_child[x] + w[x];
// 修改限制时把非法状态改成 INF，再沿重链更新
```

### 复杂度

预处理 $O(n\log n)$，单次询问 $O(\log^2 n)$，空间复杂度 $O(n)$。

---

## 23. [P2495 【模板】虚树 / \[SDOI2011\] 消耗战](https://www.luogu.com.cn/problem/P2495)

`虚树` `树形DP` `最小割`

### 题意

树上若干关键点代表资源点，切断一批边后要使根 `1` 无法到达任意资源点，求最小代价。

### 分析

关键点集合在每次询问里都很小，正解先按 DFS 序排序并插入 LCA 建出虚树。对虚树上每条边，边权取原树路径上的最小割边代价；随后做一遍 DP：若当前点是关键点就必须切断进入它的边，否则可以在“切当前边”和“切子树内部”之间取较小值。

### 核心代码

```cpp
void dfs(int x) {
    dp[x] = 0;
    for (auto [y, w] : vt[x]) {
        dfs(y);
        dp[x] += min(1LL * w, dp[y]);
    }
    if (key[x]) dp[x] = INF;
}
```

### 复杂度

单次询问建树与 DP 都是 $O(k\log k)$，空间复杂度 $O(k)$。

---

## 24. [P4606 \[SDOI2018\] 战略游戏](https://www.luogu.com.cn/problem/P4606)

`圆方树` `虚树` `割点统计`

### 题意

给定一个连通无向图和一组被占领城市，问有多少个未被占领的城市一旦被摧毁，就会让这些被占领城市中至少有一对彼此不再连通。

### 分析

先 Tarjan 建圆方树，把原图中的割点影响转成树上结构。对每次询问，把被占领城市在圆方树上建虚树；一个原点是否能成为答案，只看它在这棵虚树中删掉后会不会把至少两个含关键点的部分分开，因此只需统计虚树上关键点经过该割点分裂出的有效连通块数。

### 核心代码

```cpp
void solve(int x) {
    int part = mark[x];
    for (int y : vt[x]) {
        solve(y);
        part += has[y];
    }
    if (is_cut[x] && part >= 2 && !chosen[x]) ans++;
    has[x] = min(part, 1);
}
```

### 复杂度

预处理 $O(n+m)$，单次询问 $O(k\log k)$，空间复杂度 $O(n)$。

---

## 25. [P4103 \[HEOI2014\] 大工程](https://www.luogu.com.cn/problem/P4103)

`虚树` `树形DP` `点对统计`

### 题意

每次给出树上的一个点集，要求这些点两两之间距离之和、最小距离和最大距离。

### 分析

把点集和它们的 LCA 压成虚树后，所有有效路径都落在虚树上。距离和用子树关键点个数统计经过每条虚树边的点对数；最小值和最大值则分别维护子树内到当前点最近、最远的关键点深度，合并时顺手更新答案。

### 核心代码

```cpp
sum += 1LL * siz[y] * (tot - siz[y]) * dist(x, y);
mn = min(mn, near[x] + near[y] + dist(x, y));
mx = max(mx, far[x] + far[y] + dist(x, y));
near[x] = min(near[x], near[y] + dist(x, y));
far[x] = max(far[x], far[y] + dist(x, y));
```

### 复杂度

单次询问 $O(k\log k)$，空间复杂度 $O(k)$。

---

## 26. [P3233 \[HNOI2014\] 世界树](https://www.luogu.com.cn/problem/P3233)

`虚树` `两遍DP` `最近点归属`

### 题意

每次指定若干临时议事处，树上每个聚居地都归最近的议事处管理；若距离相同则归编号较小者，要求输出每个议事处管理的点数。

### 分析

先在原树上建虚树，只保留议事处与必要的 LCA。第一遍 DP 自底向上传最近议事处，第二遍自顶向下补上来自父侧的更优候选；然后对虚树边按“距离中点”切分，把整段原树上的点数分给两端更近的议事处，平局按编号小者优先。

### 核心代码

```cpp
best[x] = merge(best[x], best[y], dist(x, y));
up[y] = merge(up[x], from_brother[y], dist(x, y));
int cut = split_edge(x, y, best[x], best[y]);
ans[id(best[x])] += size_part(x, y, cut);
ans[id(best[y])] += size_part(y, x, len - cut);
```

### 复杂度

单次询问 $O(k\log k)$，空间复杂度 $O(k)$。

---

## 27. [P4242 树上的毒瘤](https://www.luogu.com.cn/problem/P4242)

`树剖线段树` `虚树` `点分治`

### 题意

树上每个点有颜色，支持把一条路径全部染成同一种颜色；对一个给定点集 `S`，要求这些点的路径颜色段数相关总权值。

### 分析

单次路径染色和任意两点路径颜色段数查询，适合用树剖线段树维护链上的左右端颜色与颜色段数。批量点集询问时再建虚树，把原树路径压成带“颜色段数边权”的小树，最后用点分治或树形统计把所有点对贡献一次算完。

### 核心代码

```cpp
Info query_path(int u, int v) { return hld_query(u, v); }
void paint_path(int u, int v, int c) { hld_cover(u, v, c); }
long long w = query_path(x, y).seg;
add_virtual_edge(x, y, w);
```

### 复杂度

单次修改 $O(\log^2 n)$，单次点集询问约为 $O(m\log m + m\log n)$，空间复杂度 $O(n)$。

---

## 28. [P7409 SvT](https://www.luogu.com.cn/problem/P7409)

`后缀数组` `LCP 笛卡尔树` `虚树`

### 题意

给定字符串和若干次询问，每次给出一些后缀起点，要求这些后缀两两之间 LCP 长度之和。

### 分析

后缀的两两 LCP 可以放到 height 数组对应的笛卡尔树上看：两个后缀的 LCP 就是它们在这棵树上的 LCA 权值。于是对每次出现的后缀点建虚树，再统计每条虚树边下方有多少个被选后缀，边权乘上跨边点对数就是总贡献。

### 核心代码

```cpp
for (auto [y, w] : vt[x]) {
    dfs(y);
    ans = (ans + 1LL * w * siz[y] % MOD * (tot - siz[y])) % MOD;
    siz[x] += siz[y];
}
```

### 复杂度

预处理 $O(n\log n)$，单次询问 $O(t\log t)$，空间复杂度 $O(n)$。

---

## 29. [CF613D Kingdom and its Cities](https://www.luogu.com.cn/problem/CF613D)

`虚树` `树形DP` `关键点隔离`

### 题意

树上给出若干重要城市，只能攻占非重要城市，要求最少攻占多少个城市才能让所有重要城市两两不连通；若无论如何都做不到则输出 `-1`。

### 分析

先对重要城市建虚树。若某个重要点的父亲也是重要点，那么这条边上没有可删的非重要点，答案直接是 `-1`。否则在虚树上 DP：对每个点记录子树里仍连着多少个重要连通块，若一个非重要点汇聚了至少两个块，就必须在这里切一次。

### 核心代码

```cpp
void dfs(int x) {
    int need = key[x];
    for (int y : vt[x]) {
        dfs(y);
        if (f[y] == 2) ans++;
        else need += f[y];
    }
    f[x] = min(need, 2);
}
```

### 复杂度

单次询问 $O(k\log k)$，空间复杂度 $O(k)$。

---

## 30. [CF19E Fairy](https://www.luogu.com.cn/problem/CF19E)
`DFS` `奇环` `树上差分`
### 题意
给定无向图，求删掉哪一条边后整张图会变成二分图。
### 分析
先 DFS 染色。非树边如果连向同色点，就对应一个奇环。把所有奇环在 DFS 树上做**树上差分**，某条树边若恰好被所有奇环经过，它就是可删边；若图里只有一条奇环非树边，它本身也可删。
### 核心代码
```cpp
void dfs(int u, int p) {
    for (auto [v, id] : g[u]) if (id != p) {
        if (!dep[v]) dep[v] = dep[u] + 1, fa[v] = u, dfs(v, id);
        else if (dep[v] < dep[u]) {
            if ((dep[u] - dep[v] + 1) & 1) odd++, tag[u]++, tag[v]--, mark[id] = 1;
        }
    }
}
```
### 复杂度
时间复杂度 `O(n+m)`。
---

## 31. [P5227 [AHOI2013] 连通图](https://www.luogu.com.cn/problem/P5227)
`边双连通` `桥树` `小集合删边`
### 题意
给定连通图和很多个小集合，每次独立删除集合中的若干条边，判断删完后图是否仍然连通。
### 分析
只有删除到桥才可能断开，所以先做**边双连通缩点**得到桥树。每次询问只删最多 `4` 条边，把对应桥映射到桥树上，判断这些边是否切断了桥树；本质上是桥树上的小规模连通性判定。
### 核心代码
```cpp
build_bridge_tree();
for (auto &qry : queries) {
    vector<int> cut;
    for (int id : qry.edges) if (isBridge[id]) cut.push_back(treeEdgeId[id]);
    puts(disconnected_by(cut) ? "Disconnected" : "Connected");
}
```
### 复杂度
预处理 `O(n+m)`，单次询问 `O(c log n)`，其中 `c<=4`。
---

## 32. [P1600 [NOIP 2016 提高组] 天天爱跑步](https://www.luogu.com.cn/problem/P1600)
`树上差分` `深度统计` `LCA`
### 题意
每个玩家沿树上最短路从 `s` 跑到 `t`，第 `j` 个观察员只在第 `w[j]` 秒观察一次，问每个点恰好能看到多少名玩家。
### 分析
把一条路径拆成经过 `lca` 的上下两段。对起点侧和终点侧分别按 `depth` 与 `dist` 建计数桶，DFS 时利用**树上差分 + 深度统计**累计经过当前点且恰在对应时刻到达的人数。
### 核心代码
```cpp
void dfs(int u, int p) {
    int a = bucket1[w[u] + dep[u]];
    int b = bucket2[w[u] - dep[u] + OFFSET];
    for (int v : g[u]) if (v != p) dfs(v, u);
    for (auto id : startAt[u]) bucket1[dep[s[id]]]++;
    for (auto id : endAt[u]) bucket2[dep[s[id]] - dist[t[id]] + OFFSET]++;
    ans[u] += bucket1[w[u] + dep[u]] - a;
    ans[u] += bucket2[w[u] - dep[u] + OFFSET] - b;
}
```
### 复杂度
时间复杂度 `O((n+m)log n)` 或 `O(n+m)`（配合桶）。
---

## 33. [CF1681F Unique Occurrences](https://www.luogu.com.cn/problem/CF1681F)
`边权分组` `虚树` `计数`
### 题意
对树上所有点对 `(u,v)`，统计路径上“出现次数恰好为一次的边权值个数”的总和。
### 分析
按边权分组。对某个权值 `c`，只需计算有多少点对的路径上恰好经过一条权值为 `c` 的边。做法是把该组边的端点和必要的 LCA 拉出来建**虚树**，再在去掉这些 `c` 边后的连通块大小之间做乘法统计。
### 核心代码
```cpp
for (auto &vec : byColor) {
    build_virtual_tree(vec);
    dfs_sz(root, 0);
    for (auto e : colorEdges[vec.color])
        ans += 1LL * compSz[e.uSide] * compSz[e.vSide];
    clear_virtual_tree(vec);
}
```
### 复杂度
总时间复杂度 `O(n log n)`。
---

# 四、平面结构、可并堆与堆维护

这一章把 K-D Tree、平面最值、可并堆以及一类“堆上合并状态”的题放在一起。它们不一定共享同一个模板，但都在训练如何把若干候选状态压进可合并、可删改的堆或空间划分结构里。

## 34. [P4148 简单题](https://www.luogu.com.cn/problem/P4148)

`动态 K-D Tree` `二维数点` `矩形求和`

### 题意

在一个很大的棋盘上支持单点加值，并反复询问某个矩形区域内所有格子的权值和。

### 分析

坐标范围大而操作数不多，适合用动态 K-D Tree。每个结点维护子树坐标边界和权值和，矩形查询时若整个包围盒被包含就整棵返回，若完全不交就剪枝；插入过于失衡时重构即可。

### 核心代码

```cpp
int query(int p, Rect q) {
    if (!p || disjoint(box[p], q)) return 0;
    if (inside(box[p], q)) return sum[p];
    int ret = in(node[p], q) ? val[p] : 0;
    return ret + query(ls[p], q) + query(rs[p], q);
}
```

### 复杂度

均摊时间复杂度约为 $O(\sqrt n)$ 到 $O(n^{2/3})$，空间复杂度 $O(n)$。

---

## 35. [P2093 \[国家集训队\] JZPFAR](https://www.luogu.com.cn/problem/P2093)

`K-D Tree` `第k远点` `优先队列`

### 题意

给定平面点集，许多询问给出查询点 `(px,py)` 和 `k`，要求离它第 `k` 远的点编号；距离相同时编号较小者算更远。

### 分析

K-D Tree 结点维护包围盒，对一个查询点可以快速算出某棵子树可能达到的最远距离上界。搜索时总是优先进入上界更大的儿子，并用一个大小为 `k` 的最小堆维护当前最优候选，明显不可能更优的子树直接剪掉。

### 核心代码

```cpp
void solve(int p) {
    if (!p || up_dist(box[p], q) < heap.top()) return;
    push_answer(point_dist(pt[p], q), id[p]);
    int l = up_dist(box[ls[p]], q), r = up_dist(box[rs[p]], q);
    if (l < r) swap(ls[p], rs[p]);
    solve(ls[p]), solve(rs[p]);
}
```

### 复杂度

单次询问期望复杂度约为 $O(\log n + k\log k)$，空间复杂度 $O(n)$。

---

## 36. [P2479 \[SDOI2010\] 捉迷藏](https://www.luogu.com.cn/problem/P2479)

`K-D Tree` `曼哈顿距离` `最近最远`

### 题意

给定若干个隐秘地点，人在其中某点起步并按横竖移动，要求选一个起点，使它到其它点的最远距离与最近距离之差最小。

### 分析

距离是曼哈顿距离。对每个点都要同时知道“最近点距离”和“最远点距离”：最近点可用 K-D Tree 做最近邻搜索，最远点则可在树上用包围盒上界剪枝，或结合 `x+y`、`x-y` 的极值快速得到。最后枚举每个点取差值最小者。

### 核心代码

```cpp
best_min = INF, best_max = 0;
query_nearest(rt, p, best_min);
query_farthest(rt, p, best_max);
ans = min(ans, best_max - best_min);
```

### 复杂度

时间复杂度约为 $O(n\log n)$，空间复杂度 $O(n)$。

---

## 37. [P6247 \[SDOI2012\] 最近最远点对](https://www.luogu.com.cn/problem/P6247)

`最近点对分治` `凸包` `旋转卡壳`

### 题意

给定平面点集，要求同时求出欧几里得距离最近的点对距离和最远的点对距离。

### 分析

最近点对用标准分治，按 `x` 排序后递归并在中线附近按 `y` 扫描；最远点对则先求凸包，再用旋转卡壳求直径。两部分各自都是经典最优做法，组合起来即可。

### 核心代码

```cpp
double mn = solve_closest(1, n);
vector<Point> hull = convex_hull(p);
for (int i = 0, j = 1; i < hull.size(); i++) {
    while (area_inc(i, j, hull)) j = (j + 1) % hull.size();
    mx = max(mx, dist2(hull[i], hull[j]));
}
```

### 复杂度

时间复杂度 $O(n\log n)$，空间复杂度 $O(n)$。

---

## 38. [P1429 平面最近点对（加强版）](https://www.luogu.com.cn/problem/P1429)

`分治` `平面最近点对` `经典模板`

### 题意

给定平面上 `n` 个点，求所有点对中的最小欧几里得距离。

### 分析

按 `x` 坐标排序后分治。合并时只需检查距离中线不超过当前最优值的点，并按 `y` 坐标排序后向后比较有限个候选点，这是最近点对分治成立的关键。

### 核心代码

```cpp
double solve(int l, int r) {
    if (l == r) return INF;
    int mid = (l + r) >> 1;
    double d = min(solve(l, mid), solve(mid + 1, r));
    merge_by_y(l, mid, r);
    return check_strip(l, r, mid, d);
}
```

### 复杂度

时间复杂度 $O(n\log n)$，空间复杂度 $O(n)$。

---

## 39. [P4357 \[CQOI2016\] K 远点对](https://www.luogu.com.cn/problem/P4357)

`K-D Tree` `第k远点对` `堆优化`

### 题意

给定平面点集，求欧几里得距离第 `K` 远的点对距离平方。

### 分析

把每个点当成查询点，在 K-D Tree 上搜索与它配对时可能产生的最远点。子树包围盒能给出与当前点的最远距离上界，用一个大小为 `2K` 的最小堆维护候选点对距离，最终去重后第 `K` 大即为答案。

### 核心代码

```cpp
void query(int p, Point q) {
    if (!p || up_dist(box[p], q) <= heap.top()) return;
    push_heap(dist2(pt[p], q));
    int l = up_dist(box[ls[p]], q), r = up_dist(box[rs[p]], q);
    if (l < r) swap(ls[p], rs[p]);
    query(ls[p], q), query(rs[p], q);
}
```

### 复杂度

时间复杂度约为 $O(n\log n + nK\log K)$，空间复杂度 $O(n)$。

---

## 40. [P3642 \[APIO2016\] 烟花表演](https://www.luogu.com.cn/problem/P3642)

`左偏树` `堆合并` `树上贪心`

### 题意

树叶是烟花，边长是导火索长度，可以修改每条边长度并付出绝对值代价；要求让所有叶子同时爆炸且总代价最小。

### 分析

把每个子树看成一批“到达根时允许的爆炸时刻”，正解用可并堆维护这些候选时刻的中位数结构。子树向上合并时把两棵堆 meld，再根据当前边长做整体平移；一旦候选数量过多，就弹出最大的若干值保持最优。

### 核心代码

```cpp
rt[x] = merge(rt[x], rt[y]);
add[rt[x]] += w;
push(rt[x], dist_leaf[x]);
while (siz[rt[x]] > need[x]) pop(rt[x]);
```

### 复杂度

时间复杂度 $O(n\log n)$，空间复杂度 $O(n)$。

---

## 41. [P4359 \[CQOI2016\] 伪光滑数](https://www.luogu.com.cn/problem/P4359)

`大根堆` `best-first search` `状态生成`

### 题意

给定 `N` 和 `K`，求第 `K` 大的 `N`-伪光滑数；这类数的质因子个数与最大质因子满足题目给出的特殊限制。

### 分析

核心观察是状态可以按“当前值、最大质因子、质因子总个数”有序生成。做法是从所有合法的 `p^t` 出发放入大根堆，每次取出当前最大值，再把其中一个最大质因子替换成更小质因子生成新状态，按 best-first search 弹出第 `K` 个就是答案。

### 核心代码

```cpp
priority_queue<Node> pq;
while (K--) {
    auto cur = pq.top(); pq.pop();
    ans = cur.val;
    for (int q : smaller_prime[cur.p])
        pq.push({cur.val / cur.p * q, q, cur.cnt});
}
```

### 复杂度

时间复杂度约为 $O(K\log S)$，空间复杂度 $O(S)$，其中 $S$ 为被生成的状态数。

---

## 42. [P8950 \[YsOI2022\] 道路修建](https://www.luogu.com.cn/problem/P8950)

`朱刘算法` `左偏树` `组合计数`

### 题意

有向图中随机等概率选出 `k` 个终点城市，要求所有城市都能到达这批城市中的至少一个；求最小修建费用的期望，若某些选法无解则输出 `-1`。

### 分析

当终点集合固定时，本质是向这个集合收缩的最小树形图问题。正解用朱刘算法不断选每个点最小入边、缩环并统计缩点大小；可并堆用来维护每个缩点的候选入边最小值，同时把每条边对期望的贡献转成组合数权重累计。

### 核心代码

```cpp
Edge e = pop_min(heap[x]);
if (find(e.u) == find(e.v)) continue;
pre[x] = e, add_answer(e.w, siz[x]);
if (has_cycle()) contract_cycle();
```

### 复杂度

时间复杂度约为 $O(m\log n)$，空间复杂度 $O(n+m)$。

---

## 43. [P1552 \[APIO2012\] 派遣](https://www.luogu.com.cn/problem/P1552)

`左偏树` `启发式合并` `树形DP`

### 题意

每个忍者有上级、薪水和领导力，选择一名管理者后，只能从它的子树中派遣若干忍者，且总薪水不超过预算；目标是最大化“派遣人数 × 管理者领导力”。

### 分析

以每个点为管理者时，需要知道其子树里在预算内最多能留下多少个薪水最小的忍者。对子树做 DFS，每个结点维护一个大根可并堆，堆里存当前保留的薪水；合并子树后若总薪水超预算，就不断弹出最大的薪水，剩余人数就是该管理者能带走的人数。

### 核心代码

```cpp
rt[x] = merge(rt[x], rt[y]);
sum[x] += sum[y], cnt[x] += cnt[y];
while (sum[x] > M) {
    sum[x] -= top(rt[x]);
    pop(rt[x]), cnt[x]--;
}
ans = max(ans, 1LL * cnt[x] * lead[x]);
```

### 复杂度

时间复杂度 $O(n\log n)$，空间复杂度 $O(n)$。

---

## 44. [P3261 \[JLOI2015\] 城池攻占](https://www.luogu.com.cn/problem/P3261)

`左偏树` `懒标记` `树上合并`

### 题意

每个骑士从某座城开始进攻，若当前战斗力不足就死在该城，否则继续向父城移动，并按城池规则给战斗力做加法或乘法变化；要求统计每座城死了多少骑士，以及每个骑士最终攻下多少城。

### 分析

把“目前走到某个结点的所有活骑士”放在一棵左偏树里，键值是当前战斗力。子树向父亲回溯时先 meld，再把该城的线性变换打在整棵堆上；堆顶若已经打不过当前城，就不断弹出并记死亡位置。这样每个骑士只会进堆、出堆各一次。

### 核心代码

```cpp
rt[x] = merge(rt[x], rt[y]);
apply_mul(rt[x], mul[x]);
apply_add(rt[x], add[x]);
while (rt[x] && val[rt[x]] < hp[x]) {
    die[top_id(rt[x])] = x;
    pop(rt[x]);
}
```

### 复杂度

时间复杂度 $O((n+m)\log (n+m))$，空间复杂度 $O(n+m)$。

---

## 45. [P3377 【模板】可并堆 1](https://www.luogu.com.cn/problem/P3377)

`左偏树` `堆合并` `模板`

### 题意

维护若干个小根堆，支持合并两个堆以及删除并输出某个堆的最小值。

### 分析

左偏树模板题。合并时始终让较小根作为新根，再递归合并右儿子，并用空路径长维护“左偏性”；删除最小值就是把根的左右子树直接 meld。

### 核心代码

```cpp
int merge(int x, int y) {
    if (!x || !y) return x | y;
    if (val[x] > val[y]) swap(x, y);
    rs[x] = merge(rs[x], y);
    if (dist[ls[x]] < dist[rs[x]]) swap(ls[x], rs[x]);
    dist[x] = dist[rs[x]] + 1;
    return x;
}
```

### 复杂度

单次合并或删除最小值时间复杂度 $O(\log n)$，空间复杂度 $O(n)$。

---

## 46. [P2713 罗马游戏](https://www.luogu.com.cn/problem/P2713)

`左偏树` `并查集` `集合合并`

### 题意

每个人属于一个部落，操作包括合并两个部落，以及弹出某个部落当前战斗力最小的人。

### 分析

部落间的动态合并用并查集找代表元，代表元对应一棵左偏树根。合并两个部落时先并查集合并，再 meld 两棵堆；弹出最小值时直接删根并把新根重新挂回代表元。

### 核心代码

```cpp
int fx = find(x), fy = find(y);
if (fx != fy) fa[fx] = fy, rt[fy] = merge(rt[fx], rt[fy]);
int t = rt[find(x)];
print(val[t]);
rt[find(x)] = merge(ls[t], rs[t]);
```

### 复杂度

单次操作时间复杂度 $O(\log n)$，并查集额外均摊 $O(\alpha(n))$。

---

## 47. [P1456 Monkey King](https://www.luogu.com.cn/problem/P1456)

`左偏树` `并查集` `对战模拟`

### 题意

每只猴子有战斗力，两只猴子所在的部落决斗时，各自拿出堆顶最强者并把战斗力减半后再放回，最后输出胜者所在部落当前最强值。

### 分析

每个部落维护一棵大根左偏树。决斗时先弹出两边堆顶，把胜者和败者都减半后重新放回，再把两棵堆合并；若两只猴子已经在同一部落则直接输出 `-1`。

### 核心代码

```cpp
int x = pop_max(rt[fx]), y = pop_max(rt[fy]);
val[x] >>= 1, val[y] >>= 1;
rt[fx] = merge(rt[fx], x);
rt[fy] = merge(rt[fy], y);
rt[fx] = merge(rt[fx], rt[fy]), fa[fy] = fx;
```

### 复杂度

单次操作时间复杂度 $O(\log n)$，空间复杂度 $O(n)$。

---

## 48. [P3273 [SCOI2011] 棘手的操作](https://www.luogu.com.cn/problem/P3273)
`并查集` `可并堆` `懒标记`
### 题意
图从若干孤点开始，支持连边合并连通块、单点加、整块加、全局加，并查询单点值、块内最大值和全局最大值。
### 分析
并查集维护连通块，块内最大值用**可并堆**或按代表元维护；块加和全局加都可以打懒标记。合并连通块时把两块堆合并，再更新全局答案。
### 核心代码
```cpp
int find(int x) { return fa[x] == x ? x : fa[x] = find(fa[x]); }
void unite(int x, int y) {
    x = find(x); y = find(y);
    if (x == y) return;
    fa[x] = y;
    heap[y] = merge(heap[y], heap[x]);
    tagComp[y] += 0;
    mxAll = max(mxAll, top(heap[y]) + tagComp[y] + tagAll);
}
```
### 复杂度
单次操作均摊 `O(log n)`。
---

## 49. [P4331 [BalticOI 2004] Sequence (Day1)](https://www.luogu.com.cn/problem/P4331)
`slope trick` `可并堆` `单调回归`
### 题意
给定序列 `t[i]`，要求构造一个严格递增序列 `z[i]`，使 `sum |t[i]-z[i]|` 最小，并输出最小代价与构造结果。
### 分析
先把严格递增转成 `y[i]=z[i]-i` 非降，再最小化 `sum |(t[i]-i)-y[i]|`，这就是经典 **L1 单调回归 / slope trick**。实现上常用可并堆或 PAV，把相邻违背单调的块不断合并，并用块的中位数作最优值。
### 核心代码
```cpp
for (int i = 1; i <= n; i++) {
    heap[++tot].push(t[i] - i);
    L[tot] = R[tot] = i;
    while (tot > 1 && top(heap[tot - 1]) > top(heap[tot])) {
        heap[tot - 1] = merge(heap[tot - 1], heap[tot]);
        R[tot - 1] = R[tot];
        tot--;
    }
}
assign_by_block_median();
```
### 复杂度
时间复杂度 `O(n log n)`，空间复杂度 `O(n)`。
---
# 五、点分治、动态树与平衡树

这一章覆盖树上距离统计、点分治、Link-Cut Tree 和序列平衡树。共同点是维护对象都带有明显的树形或动态结构，需要沿着重心链、实链或 Treap 结构做局部重构。

## 50. [P6329 【模板】点分树 / 震波](https://www.luogu.com.cn/problem/P6329)

`点分治` `树上距离和` `动态修改`

### 题意

树上每个点有权值，支持单点修改，并询问某个点距离不超过 `k` 的所有点权值和。

### 分析

建立点分树后，每个原点到祖先重心的距离链是固定的。对每个重心维护“到它距离为 `d` 的点权前缀和”，查询时沿祖先链把所有大圆加上，再减去来自同一儿子子树的重复贡献；修改则沿这条祖先链逐层更新。

### 核心代码

```cpp
for (int x = u; x; x = fa[x]) {
    ans += sum[x].query(k - dist(u, x));
    if (son) ans -= sub[son].query(k - dist(u, x));
}
```

### 复杂度

单次修改和查询时间复杂度均为 $O(\log^2 n)$，空间复杂度 $O(n\log n)$。

---

## 51. [P3806 【模板】点分治](https://www.luogu.com.cn/problem/P3806)

`点分治` `路径长度判定` `模板`

### 题意

给定带权树和若干个长度 `k`，判断树上是否存在一对点，其距离恰好等于每个给定的 `k`。

### 分析

点分治把所有路径按“经过当前重心”拆开。处理一个重心时，先收集每个儿子子树到重心的距离；对某个查询 `k`，只要存在两个来自不同子树的距离和为 `k` 即可。用一个布尔桶记录已经处理过的距离，就能在线判断。

### 核心代码

```cpp
vis[0] = true;
for (int y : g[c]) {
    collect(y, c, w);
    for (int d : tmp)
        for (int q = 1; q <= m; q++) ans[q] |= vis[ask[q] - d];
    for (int d : tmp) vis[d] = true;
}
```

### 复杂度

时间复杂度约为 $O(n\log n + m\,n\log n / w)$，常见实现可视为 $O(n\log n)$ 级别，空间复杂度 $O(n)$。

---

## 52. [P4178 Tree](https://www.luogu.com.cn/problem/P4178)
`点分治` `树上距离` `点对统计`
### 题意
给定一棵带边权树，统计距离不超过 `k` 的点对数量。
### 分析
最经典的做法是**点分治**。每次找重心，收集各个子树到重心的距离，先用双指针统计整棵子树的合法点对，再减去同一子树内部被重复算到的部分。
### 核心代码
```cpp
void solve(int u) {
    vis[u] = 1;
    vector<int> all = {0};
    for (auto [v, w] : g[u]) if (!vis[v]) {
        vector<int> cur;
        get_dis(v, u, w, cur);
        ans -= count_pair(cur);
        all.insert(all.end(), cur.begin(), cur.end());
    }
    ans += count_pair(all);
    for (auto [v, _] : g[u]) if (!vis[v]) solve(get_rt(v));
}
```
### 复杂度
时间复杂度 `O(n log n)`，空间复杂度 `O(n)`。
---

## 53. [P2056 [ZJOI2007] 捉迷藏](https://www.luogu.com.cn/problem/P2056)
`点分治` `动态最远点对`
### 题意
树上房间的灯会开关切换，关灯房间才可能藏人。每次询问当前所有关灯房间中最远两点的距离。
### 分析
这是**点分治 + 可删堆**。对每个重心维护各子树到它的最大关灯距离，再维护经过该重心的最优答案；切换一个点时沿重心链修改，查询时取全局最大值。
### 核心代码
```cpp
void toggle(int x) {
    on[x] ^= 1;
    for (int u = x; u; u = fa[u]) {
        int d = dist(x, u);
        if (!on[x]) ins(subHeap[childBelong(x, u)], d), ins(allHeap[u], top(subHeap[childBelong(x, u)]));
        else del(subHeap[childBelong(x, u)], d), refresh(u);
    }
}
```
### 复杂度
单次修改、查询都是 `O(log^2 n)`。
---

## 54. [P3690 【模板】动态树（LCT）](https://www.luogu.com.cn/problem/P3690)

`LCT` `动态森林` `路径异或`

### 题意

维护一个动态森林，支持连边、断边、修改点权，以及查询两点路径上的点权异或和。

### 分析

Link-Cut Tree 通过伸展树维护实链。`makeroot(x)` 后再 `access(y)`，`y` 的辅助树就正好对应 `x` 到 `y` 的整条路径；路径异或和作为 splay 的区间信息维护即可，连边断边则分别用 `link` 和 `cut` 完成。

### 核心代码

```cpp
void split(int x, int y) { makeroot(x); access(y); splay(y); }
void link(int x, int y) { makeroot(x); if (findroot(y) != x) fa[x] = y; }
void cut(int x, int y) {
    split(x, y);
    if (ch[y][0] == x && !ch[x][1]) ch[y][0] = fa[x] = 0, pushup(y);
}
```

### 复杂度

单次操作时间复杂度均摊 $O(\log n)$，空间复杂度 $O(n)$。

---

## 55. [P2147 [SDOI2008] 洞穴勘测](https://www.luogu.com.cn/problem/P2147)
`Link-Cut Tree` `动态连通`
### 题意
动态维护一片森林，支持连边、断边以及询问两个点当前是否连通。
### 分析
这是 **Link-Cut Tree** 的基础题。`makeroot + findroot` 判断连通性，`link` 和 `cut` 负责动态修改树结构。
### 核心代码
```cpp
makeroot(x);
if (findroot(y) != x) link(x, y);

makeroot(x); access(y); splay(y);
if (ch[y][0] == x && !ch[x][1]) ch[y][0] = fa[x] = 0, pushup(y);
```
### 复杂度
单次操作均摊 `O(log n)`。
---

## 56. [P4219 [BJOI2014] 大融合](https://www.luogu.com.cn/problem/P4219)
`Link-Cut Tree` `动态树` `边负载`
### 题意
森林中不断加边成树，并询问某条已存在边当前被多少条简单路径经过。
### 分析
若把一条边断开，两侧点数分别为 `s` 和 `tot-s`，答案就是 `s*(tot-s)`。用 **Link-Cut Tree** 把边拆成点维护，查询某条边时把它旋到合适位置，就能读出一侧子树大小。
### 核心代码
```cpp
makeroot(x);
access(y); splay(y);
int s = siz[x];
int tot = siz[y];
long long ans = 1LL * s * (tot - s);
```
### 复杂度
单次加边、查询均摊 `O(log n)`。
---

## 57. [P3391 【模板】文艺平衡树](https://www.luogu.com.cn/problem/P3391)

`FHQ Treap` `区间翻转` `序列维护`

### 题意

维护一个初始为 `1..n` 的序列，反复把区间 `[l,r]` 翻转，最后输出整个序列。

### 分析

把序列放进 FHQ Treap。每次操作按排名把树分成 `A | B | C` 三段，对中间这段打翻转标记，再按原顺序 merge 回去即可；懒标记下传时交换左右儿子，保证中序遍历就是当前序列。

### 核心代码

```cpp
split(rt, l - 1, a, b);
split(b, r - l + 1, b, c);
rev[b] ^= 1;
rt = merge(a, merge(b, c));
```

### 复杂度

单次操作时间复杂度均摊 $O(\log n)$，空间复杂度 $O(n)$。

---

## 58. [P6136 【模板】普通平衡树（数据加强版）](https://www.luogu.com.cn/problem/P6136)

`FHQ Treap` `有序集合` `强制在线`

### 题意

维护一个支持插入、删除、求排名、查第 `k` 小、前驱和后继的有序集合，所有输入都要和上一次答案异或后才能得到真实值。

### 分析

强制在线只影响读入，不影响数据结构本身。FHQ Treap 用 `split` 按值或按排名分裂、`merge` 合并，就能把六种平衡树基本操作全部写成常数次分裂合并；计数信息放在子树大小里维护即可。

### 核心代码

```cpp
split(rt, x, a, c), split(a, x - 1, a, b);
rt = merge(merge(a, newnode(x)), c);        // 插入
split(rt, x - 1, a, b); int rk = size[a] + 1; // 排名
split_by_rank(rt, k, a, b); ans = kth(a);     // 第 k 小
```

### 复杂度

单次操作时间复杂度均摊 $O(\log n)$，空间复杂度 $O(n)$。

---
