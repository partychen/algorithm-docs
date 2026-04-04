---
title: "CSES 综合进阶专题精选解题报告"
subtitle: "🧭 从公式化查询到高阶 DP 与流模型的进阶主线"
order: 9
icon: "🧪"
---

# CSES 综合进阶专题精选解题报告

这一组题从会写闭式答案的反射轨迹出发，很快就拐进了组合枚举、流模型、凸性优化和数位贪心。读的时候不要把它们看成零散题型：几乎每一题都在做同一件事——先把原问题压成更稳定的状态，再决定该用公式、堆、流还是状态递推去接住它。

# 一、反射运动与棋盘公式

这一章的四题都不靠大搜索，关键是先把轨迹或递推翻到更稳定的坐标里。镜像展开、同余类和异或结构一旦写对，答案就会从模拟题直接变成闭式题。

## 1. [Bouncing Ball Steps](https://cses.fi/problemset/task/3215)

`镜像展开` `周期计数`

### 题意

给定 $n \times m$ 棋盘，一颗球从左上角出发，初始沿右下对角线移动。每走一步遇边界就反弹，要求输出走了 $k$ 步后所在的格子，以及一共发生了多少次方向改变。

### 分析

横纵两个坐标可以完全拆开看。对长度为 $L$ 的一维线段，反弹后的坐标等价于在长度 $2(L-1)$ 的环上做直线运动，所以令 $p=2(L-1)$、$t=k \bmod p$，当前位置就是 $1+\min(t,p-t)$。

方向改变只会发生在某一步恰好落到某条边界上。落到上下边的步数是 $(n-1)$ 的倍数，落到左右边的步数是 $(m-1)$ 的倍数；如果刚好到角上，只算一次改变，因此用容斥统计 $\lfloor k/(n-1)\rfloor+\lfloor k/(m-1)\rfloor-\lfloor k/\mathrm{lcm}(n-1,m-1)\rfloor$ 即可。

### 核心代码

```cpp
long long pos(long long len, long long k){
    long long p = 2 * (len - 1), t = k % p;
    return 1 + min(t, p - t);
}
void solve(long long n, long long m, long long k){
    long long x = pos(n, k), y = pos(m, k);
    long long a = n - 1, b = m - 1;
    long long c = lcm(a, b);
    long long turns = k / a + k / b - k / c;
    cout << x << ' ' << y << ' ' << turns << '\n';
}
```

### 复杂度

时间复杂度 $O(1)$，空间复杂度 $O(1)$。

---

## 2. [Bouncing Ball Cycle](https://cses.fi/problemset/task/3216)

`反射周期` `同余计数`

### 题意

同样的反弹模型下，要求回答两件事：球第一次回到初始格子的时间，以及整个周期里访问过多少个不同格子。

### 分析

回到左上角等价于横坐标和纵坐标同时回到 $1$。一维反射周期分别是 $2(n-1)$ 和 $2(m-1)$，所以总周期就是它们的最小公倍数。

不同格子的计数不能直接用周期长度除以什么常数，因为路径会在中途自交。设 $a=n-1,b=m-1,g=\gcd(a,b)$，再写成 $a=gp,b=gq$。镜像展开后，可达格子恰好对应坐标满足 $x \equiv \pm y \pmod{2g}$ 的点；把余数类分成 $0$、$g$ 和中间的 $g-1$ 组后，可以直接化成闭式：$\left(\lfloor p/2 \rfloor+1\right)\left(\lfloor q/2 \rfloor+1\right)+\left(\lfloor (p+1)/2 \rfloor\right)\left(\lfloor (q+1)/2 \rfloor\right)+(g-1)pq$。

### 核心代码

```cpp
void solve(long long n, long long m){
    long long a = n - 1, b = m - 1;
    long long steps = lcm(2 * a, 2 * b);
    long long g = gcd(a, b), p = a / g, q = b / g;
    long long cells = 1LL * (p / 2 + 1) * (q / 2 + 1)
                    + 1LL * ((p + 1) / 2) * ((q + 1) / 2)
                    + 1LL * (g - 1) * p * q;
    cout << steps << ' ' << cells << '\n';
}
```

### 复杂度

时间复杂度 $O(1)$，空间复杂度 $O(1)$。

---

## 3. [Knight Moves Queries](https://cses.fi/problemset/task/3218)

`骑士距离` `闭式分类`

### 题意

无限棋盘上给出若干个位置 $(x,y)$，每次询问从该点走骑士步到左上角 $(1,1)$ 的最少步数。

### 分析

先把问题平移到原点：令 $u=|x-1|,v=|y-1|$，再交换成 $u \ge v$。无限棋盘骑士距离的核心约束只有两个：一步最多让 $u$ 减少 $2$，三步总共最多让 $u+v$ 减少 $6$，因此答案下界是 $\max(\lceil u/2 \rceil,\lceil (u+v)/3 \rceil)$。

除了两个经典小例外 $(1,0)$ 和 $(2,2)$，把这个下界向上调到与 $u+v$ 同奇偶即可得到精确答案。原因是骑士每走一步都会翻转格子颜色，所以步数奇偶被终点颜色固定住了。

### 核心代码

```cpp
long long dist(long long x, long long y){
    x = llabs(x - 1), y = llabs(y - 1);
    if (x < y) swap(x, y);
    if (x == 1 && y == 0) return 3;
    if (x == 2 && y == 2) return 4;
    long long d = max((x + 1) / 2, (x + y + 2) / 3);
    if ((d ^ x ^ y) & 1) ++d;
    return d;
}
```

### 复杂度

每次询问时间复杂度 $O(1)$，空间复杂度 $O(1)$。

---

## 4. [Mex Grid Queries](https://cses.fi/problemset/task/1157)

`mex` `异或`

### 题意

二维网格按行列顺序定义：每个格子的值等于本行左侧和本列上方没有出现过的最小非负整数。输入 $(y,x)$，要求输出该位置的值。

### 分析

这张表不是普通的递推表，而是标准的异或表。设 $f(y,x)$ 为答案，把坐标都改成从 $0$ 开始之后，结论是 $f(y,x)=y\oplus x$。

证明可以按最高位归纳：若 $y$ 与 $x$ 的最高不同位在第 $k$ 位，那么左边一整段和上边一整段会恰好覆盖掉所有比 $y\oplus x$ 更小、且高位结构兼容的数，最后剩下的最小缺失值就是异或值本身。这和同类 mex 递推表的结构完全一致。

### 核心代码

```cpp
long long y, x;
cin >> y >> x;
cout << ((y - 1) ^ (x - 1)) << '\n';
```

### 复杂度

时间复杂度 $O(1)$，空间复杂度 $O(1)$。

---

# 二、子集和、背包与组合计数

这一章开始从“公式题”转向“状态题”。共同主线是：先把原问题改写成更适合枚举的增量，再用堆、背包、折半搜索或计数递推去控制状态爆炸。

## 5. [K Subset Sums I](https://cses.fi/problemset/task/3108)

`最小子集和` `堆上枚举`

### 题意

数组元素可正可负，需要输出所有 $2^n$ 个子集和里最小的前 $k$ 个，按从小到大排列。

### 分析

负数会让和变小，所以先把所有负数全部选上，得到一个基准值 $base$。之后每个元素只剩两种“反悔代价”：正数从不选改成选，代价是自身；负数从已选改成不选，代价也是绝对值。于是题目被改写成：给定一个非负数组，求最小的前 $k$ 个子集增量。

把代价排序后，可以用经典的小根堆枚举法。状态 $(sum,i)$ 表示当前增量和里最后一次考虑的是 $w_i$，从它扩展到 $w_{i+1}$ 时，一种是继续追加，另一种是把 $w_i$ 换成 $w_{i+1}$。这个生成树没有重复，且天然按答案顺序弹出。

### 核心代码

```cpp
long long base = 0;
vector<long long> w;
for (long long x : a){
    if (x < 0) base += x, w.push_back(-x);
    else w.push_back(x);
}
sort(w.begin(), w.end());
vector<long long> ans = {base};
priority_queue<pair<long long,int>, vector<pair<long long,int>>, greater<pair<long long,int>>> pq;
if (!w.empty()) pq.push({base + w[0], 0});
while ((int)ans.size() < k){
    auto [s, i] = pq.top(); pq.pop();
    ans.push_back(s);
    if (i + 1 < (int)w.size()){
        pq.push({s + w[i + 1], i + 1});
        pq.push({s - w[i] + w[i + 1], i + 1});
    }
}
```

### 复杂度

排序是 $O(n \log n)$，堆枚举是 $O(k \log k)$，空间复杂度 $O(n+k)$。

---

## 6. [K Subset Sums II](https://cses.fi/problemset/task/3109)

`定长子集和` `最佳优先搜索`

### 题意

这次必须恰好选 $m$ 个数，要求输出最小的前 $k$ 个 $m$ 元子集和。

### 分析

先把数组升序排序，最小的 $m$ 元组显然是前 $m$ 个。之后任何别的方案，都可以看成把某个后缀整体向右平移：如果第 $j$ 个选中的位置右移一格，那么它后面的选中位置为了保持严格递增，也必须一起右移。

因此可以把每个组合放进一棵“后缀右移树”里。根是 $[0,1,\dots,m-1]$，孩子是选择某个后缀整体 $+1$。把“最后一个被右移的后缀起点”当成状态的一部分，就能得到无重的标准树，再用小根堆做最佳优先搜索，前 $k$ 次出堆就是前 $k$ 小答案。

### 核心代码

```cpp
a.resize(min<int>(n, m + k));
sort(a.begin(), a.end());
priority_queue<Node, vector<Node>, Cmp> pq;
pq.push(root_state(a, m));
while ((int)ans.size() < k){
    Node u = pq.top(); pq.pop();
    ans.push_back(u.sum);
    if (auto v = next_sibling(u, a, m)) pq.push(*v);
    if (auto v = first_child(u, a, m)) pq.push(*v);
}
```

### 复杂度

排序复杂度 $O(n \log n)$，堆上枚举前 $k$ 个答案是 $O(k \log k)$，额外空间复杂度 $O(k)$。

---

## 7. [Binary Subsequences](https://cses.fi/problemset/task/2430)

`欧几里得构造` `最短字符串`

### 题意

构造一个尽量短的二进制串，使它恰好拥有 $n$ 个不同的非空子序列。

### 分析

设不同子序列中，以 $0$ 结尾和以 $1$ 结尾的个数分别是 $a,b$。把它们平移成 $u=a+1,v=b+1$ 后，追加 $0$ 会把状态变成 $(u+v,v)$，追加 $1$ 会变成 $(u,u+v)$；最终不同非空子序列个数就是 $u+v-2$。

所以我们要找一对互质正整数 $u+v=n+2$，使得从 $(1,1)$ 走到它的步数最少。反着看正好是欧几里得减法：若 $u>v$，就连续做若干次 $u\leftarrow u-v$，这些减法对应字符串末尾的一段 $0$。枚举所有互质拆分，挑欧几里得步数最少的那一对，再逆向还原即可。

### 核心代码

```cpp
int best_u = 1, best_v = n + 1, best = INT_MAX;
auto cost = [&](int u, int v){
    int c = 0;
    while (u > 1 || v > 1){
        if (u > v){ int t = (u - 1) / v; u -= t * v; c += t; }
        else { int t = (v - 1) / u; v -= t * u; c += t; }
    }
    return c;
};
for (int u = 1; u <= n + 1; ++u){
    int v = n + 2 - u;
    if (gcd(u, v) == 1 && cost(u, v) < best) best = cost(u, v), best_u = u, best_v = v;
}
string s;
for (int u = best_u, v = best_v; u > 1 || v > 1; )
    if (u > v){ int t = (u - 1) / v; s.append(t, '0'); u -= t * v; }
    else { int t = (v - 1) / u; s.append(t, '1'); v -= t * u; }
reverse(s.begin(), s.end());
```

### 复杂度

枚举拆分是 $O(n \log n)$，还原字符串是 $O(|s|)$，空间复杂度 $O(|s|)$。

---

## 8. [Book Shop II](https://cses.fi/problemset/task/1159)

`多重背包` `二进制拆分`

### 题意

每种书有价格、页数和库存，预算不超过 $x$，要求最大化购买到的总页数。

### 分析

这是标准多重背包。难点不在状态，而在库存 $k_i$ 不能直接一件一件拆。

把每种书的库存按 $1,2,4,\dots$ 拆成若干个二进制组，每组都变成一件“价格与页数同时乘组大小”的 $0/1$ 物品。这样总物品数从 $\sum k_i$ 压到 $O(n \log k_i)$，再跑一维倒序背包就行。

### 核心代码

```cpp
vector<int> dp(x + 1, 0);
for (int i = 0; i < n; ++i){
    for (int c = 1, left = k[i]; left; c <<= 1){
        int take = min(c, left); left -= take;
        int w = take * h[i], val = take * s[i];
        for (int j = x; j >= w; --j)
            dp[j] = max(dp[j], dp[j - w] + val);
    }
}
cout << *max_element(dp.begin(), dp.end()) << '\n';
```

### 复杂度

时间复杂度 $O\left(x \sum_i \log k_i\right)$，空间复杂度 $O(x)$。

---

## 9. [GCD Subsets](https://cses.fi/problemset/task/3161)

`倍数计数` `容斥反演`

### 题意

对每个 $k=1,2,\dots,n$，求数组中 gcd 恰好等于 $k$ 的非空子集个数。

### 分析

先数出每个 $d$ 的倍数个数 $cnt_d$。所有元素都能被 $d$ 整除的非空子集有 $2^{cnt_d}-1$ 个，但这些子集的 gcd 可能是 $d,2d,3d,\dots$。

于是从大到小做容斥：$f[d]$ 表示 gcd 恰为 $d$ 的答案，那么 $f[d]=(2^{cnt_d}-1)-\sum_{t\ge2} f[td]$。由于值域本身就是 $1..n$，按倍数枚举即可。

### 核心代码

```cpp
vector<int> freq(n + 1), cnt(n + 1), ans(n + 1), pw(n + 1, 1);
for (int x : a) ++freq[x];
for (int i = 1; i <= n; ++i) pw[i] = 2LL * pw[i - 1] % MOD;
for (int d = 1; d <= n; ++d)
    for (int x = d; x <= n; x += d) cnt[d] += freq[x];
for (int d = n; d >= 1; --d){
    ans[d] = (pw[cnt[d]] - 1 + MOD) % MOD;
    for (int x = d + d; x <= n; x += d)
        ans[d] = (ans[d] - ans[x] + MOD) % MOD;
}
```

### 复杂度

时间复杂度 $O(n \log n)$，空间复杂度 $O(n)$。

---

## 10. [Same Sum Subsets](https://cses.fi/problemset/task/3425)

`折半搜索` `存在性构造`

### 题意

给定一个正整数集合，要求找出两个不相交且和相等的子集；若不存在则输出 IMPOSSIBLE。

### 分析

把数组升序后，寻找第一个能被前面若干数凑出来的元素 $x_i$。一旦找到，前缀里那个子集和单独的 $x_i$ 就是一组合法答案，而且显然互不相交。

为什么一定能找到？如果每个 $x_i$ 都不能由前缀表示，那么必须有 $x_i>\sum_{j<i}x_j$，否则它会落进已有子集和的覆盖区间。递推下去会得到总和至少是 $2^n-1$，与题目给出的 $\sum x_i\le2^n-2$ 矛盾。于是只要对每个前缀做一次折半搜索子集和即可。

### 核心代码

```cpp
auto find_mask = [&](vector<int> v, int target){
    int m = v.size(), L = m / 2;
    vector<pair<long long,int>> left;
    for (int s = 0; s < (1 << L); ++s){
        long long sum = 0; for (int i = 0; i < L; ++i) if (s >> i & 1) sum += v[i];
        left.push_back({sum, s});
    }
    sort(left.begin(), left.end());
    for (int s = 0; s < (1 << (m - L)); ++s){
        long long sum = 0; for (int i = 0; i < m - L; ++i) if (s >> i & 1) sum += v[L + i];
        auto it = lower_bound(left.begin(), left.end(), pair<long long,int>{target - sum, -1});
        if (it != left.end() && it->first == target - sum) return make_pair(it->second, s);
    }
    return make_pair(-1, -1);
};
```

### 复杂度

时间复杂度 $O(n2^{n/2})$，空间复杂度 $O(2^{n/2})$。

---

## 11. [Coding Company](https://cses.fi/problemset/task/1665)

`打开团队` `计数递推`

### 题意

把若干程序员划分成若干队，每支队伍的罚分是队内最大值减最小值，要求统计总罚分不超过 $x$ 的分组方案数。

### 分析

先按能力排序。扫描到第 $i$ 个人时，所有“尚未封口”的队伍都会因为新的能力差而统一增加同样的代价，这正是把队伍状态压成“当前有多少支打开的队伍”的原因。

设 $dp[i][j][c]$ 表示前 $i$ 个人处理完、有 $j$ 支打开队伍、总代价为 $c$ 的方案数。转移分四类：单人成队、加入某个打开队伍但不封口、新开一队、加入某个打开队伍并封口。因为代价增长只和 $j$ 有关，所以这一维状态可以滚动。

### 核心代码

```cpp
sort(t.begin(), t.end());
vector<vector<int>> dp(n + 1, vector<int>(x + 1)), ndp;
dp[0][0] = 1;
for (int i = 0; i < n; ++i){
    int gap = i ? t[i] - t[i - 1] : 0;
    ndp.assign(n + 1, vector<int>(x + 1, 0));
    for (int open = 0; open <= i; ++open) for (int c = 0; c <= x; ++c) if (dp[open][c]){
        int nc = c + open * gap; if (nc > x) continue;
        add(ndp[open][nc], dp[open][c]);
        add(ndp[open + 1][nc], dp[open][c]);
        add(ndp[open][nc], 1LL * dp[open][c] * open % MOD);
        if (open) add(ndp[open - 1][nc], 1LL * dp[open][c] * open % MOD);
    }
    dp.swap(ndp);
}
cout << accumulate(dp[0].begin(), dp[0].end(), 0LL) % MOD << '\n';
```

### 复杂度

时间复杂度 $O(n^2x)$，空间复杂度 $O(nx)$。

---

# 三、调整、交换与排序过程

这一章看起来全是“操作题”，但真正起作用的不是模拟，而是把一次次局部操作改写成全局不变量：前缀流量、循环分解、罚函数凸性，或者一个必须二分图化的冲突关系。

## 12. [Increasing Array II](https://cses.fi/problemset/task/2132)

`L1 等距回归` `堆优化`

### 题意

可以对每个位置做加一或减一，目标是把整个数组改成非递减，求最少操作次数。

### 分析

这题本质是在找一个非递减序列 $b_1\le b_2\le\dots\le b_n$，最小化 $\sum |a_i-b_i|$。$L_1$ 等距回归的关键性质是：一旦某一段的代表值太大，后面遇到更小的数时，整段都应该一起往下压到某个中位数附近。

用一个大根堆维护当前块里的候选中位数。读入新值 $x$ 时先压进去；如果堆顶比 $x$ 还大，就说明前面的最优代表值不能高于 $x$，把堆顶弹掉并补回一个 $x$，这部分差值就是新增代价。

### 核心代码

```cpp
long long ans = 0;
priority_queue<long long> pq;
for (long long x : a){
    pq.push(x);
    if (pq.top() > x){
        ans += pq.top() - x;
        pq.pop();
        pq.push(x);
    }
}
cout << ans << '\n';
```

### 复杂度

时间复杂度 $O(n \log n)$，空间复杂度 $O(n)$。

---

## 13. [Food Division](https://cses.fi/problemset/task/1189)

`环上搬运` `前缀中位数`

### 题意

一圈小朋友各自有当前食物和目标食物，只能把一单位食物传给相邻的人，要求最少操作次数。

### 分析

令 $d_i=a_i-b_i$，再令 $s_i=\sum_{j=1}^i d_j$。在线性版本里，$s_i$ 就是第 $i$ 条边必须通过的净流量，总成本是 $\sum |s_i|$。环上多了一个自由变量：整圈可以统一平移一部分流量，所以答案变成 $\sum |s_i-t|$。

这个式子最小时，$t$ 取所有前缀和的中位数。于是做法非常直接：求前缀和，选中位数，再把绝对值和加起来。

### 核心代码

```cpp
vector<long long> pref(n);
long long cur = 0;
for (int i = 0; i < n; ++i){
    cur += a[i] - b[i];
    pref[i] = cur;
}
nth_element(pref.begin(), pref.begin() + n / 2, pref.end());
long long med = pref[n / 2], ans = 0;
for (long long x : pref) ans += llabs(x - med);
cout << ans << '\n';
```

### 复杂度

时间复杂度 $O(n)$ 到 $O(n \log n)$，空间复杂度 $O(n)$。

---

## 14. [Swap Round Sorting](https://cses.fi/problemset/task/1698)

`循环分解` `两轮交换`

### 题意

排列可以在一轮中做任意多次两两不相交交换。要求用最少轮数排好序，并给出每轮交换方案。

### 分析

一轮不相交交换对应一个对合置换，所以如果想一轮完成，原排列本身就必须由若干个长度不超过 $2$ 的环组成。只要存在长度至少为 $3$ 的环，一轮一定不够。

但两轮永远够用。把一个环 $c_0,c_1,\dots,c_{\ell-1}$ 看成环形数组，第一轮对整个环做一次翻转，第二轮对后缀 $[1,\ell-1]$ 再翻转一次；两次翻转的乘积恰好是把元素向前旋转一格，也就完成了这个环的纠正。不同环之间天然互不干扰。

### 核心代码

```cpp
for (auto &cyc : cycles){
    int m = cyc.size();
    if (m == 2) round1.push_back({cyc[0], cyc[1]});
    else if (m > 2){
        for (int i = 0; i < m - 1 - i; ++i)
            round1.push_back({cyc[i], cyc[m - 1 - i]});
        for (int i = 1; i < m - i; ++i)
            round2.push_back({cyc[i], cyc[m - i]});
    }
}
cout << (round2.empty() ? (!round1.empty()) : 2) << '\n';
```

### 复杂度

找环和输出方案都是 $O(n)$，空间复杂度 $O(n)$。

---

## 15. [Replace with Difference](https://cses.fi/problemset/task/3159)

`符号不变量` `等和划分`

### 题意

每次取出两个数 $a,b$，删掉它们并放回 $|a-b|$。要求构造一种操作顺序，使最后剩下的数是 $0$。

### 分析

连续做绝对值差，最后得到的数一定可以写成 $|\pm x_1 \pm x_2 \pm \dots \pm x_n|$。因此终点是 $0$ 的充要条件，就是能把原数组划成两个和相等的部分。

总和不大，可以先做一次子集和递推找出一半。随后把两边分别看成“正号堆”和“负号堆”：每次各取一个数做差，差值放回较大的一边。因为两边和始终相等，这个过程一定会一直走到 $0$。

### 核心代码

```cpp
if (sum & 1 || !pick_half(sum / 2)) return cout << -1 << '\n', void();
queue<int> P, N;
for (int x : left_part) P.push(x);
for (int x : right_part) N.push(x);
while (!P.empty() && !N.empty()){
    int a = P.front(); P.pop();
    int b = N.front(); N.pop();
    cout << a << ' ' << b << '\n';
    if (a > b) P.push(a - b);
    else if (b > a) N.push(b - a);
}
```

### 复杂度

判定与重构的时间复杂度是 $O(nS)$，其中 $S=\sum a_i/2$；额外空间复杂度也是 $O(S)$。

---

## 16. [Bit Substrings](https://cses.fi/problemset/task/2115)

`卷积` `按 1 个数计数`

### 题意

给定一个二进制串，要求对每个 $k=0,1,\dots,n$ 输出恰好含 $k$ 个 $1$ 的非空子串数量。

### 分析

若 $k=0$，答案就是每段连续 $0$ 的子串数之和。困难在 $k>0$。设所有 $1$ 的位置为 $p_1,p_2,\dots,p_m$，并补上哨兵 $p_0=0,p_{m+1}=n+1$。

恰好含 $k$ 个 $1$ 的子串，等价于选定一段连续的 $k$ 个 $1$：左端点有 $p_i-p_{i-1}$ 种放法，右端点有 $p_{i+k}-p_{i+k-1}$ 种放法。所以 $ans_k=\sum_i L_iR_{i+k-1}$，这是一个标准互相关，可以把左间隔数组和右间隔数组反过来做一次快速卷积。

### 核心代码

```cpp
vector<long long> ans(n + 1, 0), pos = {0};
for (int i = 0; i < n; ++i) if (s[i] == '1') pos.push_back(i + 1);
pos.push_back(n + 1);
for (int i = 0, j; i < n; i = j){
    j = i; while (j < n && s[j] == '0') ++j;
    long long len = j - i; ans[0] += len * (len + 1) / 2;
}
vector<long long> A, B;
for (int i = 1; i + 1 < (int)pos.size(); ++i) A.push_back(pos[i] - pos[i - 1]);
for (int i = 1; i + 1 < (int)pos.size(); ++i) B.push_back(pos[i + 1] - pos[i]);
reverse(B.begin(), B.end());
auto C = convolution(A, B);
for (int k = 1, m = A.size(); k <= m; ++k) ans[k] = C[m - k];
```

### 复杂度

时间复杂度 $O(n \log n)$，空间复杂度 $O(n)$。

---

## 17. [Reversal Sorting](https://cses.fi/problemset/task/2075)

`区间翻转` `隐式平衡树`

### 题意

排列允许执行至多 $n$ 次区间翻转，要求构造一种排好序的方案。

### 分析

最自然的贪心是：从左到右处理位置 $i$，把值 $i$ 当前所在的位置整段翻到前面。这样每次至少固定一个位置，总共不超过 $n$ 次。

瓶颈在于区间翻转后，元素位置会不停变化，不能拿普通数组暴力维护。用隐式平衡树存序列，支持按排名分裂、整段打翻转标记、查询某个值当前排名，就能把贪心降到 $O(n \log n)$。

### 核心代码

```cpp
for (int need = 1; need <= n; ++need){
    int p = get_pos(root, need);
    if (p == need) continue;
    auto [a, bc] = split(root, need - 1);
    auto [b, c] = split(bc, p - need + 1);
    tag_rev(b);
    root = merge(a, merge(b, c));
    ops.push_back({need, p});
}
```

### 复杂度

时间复杂度 $O(n \log n)$，空间复杂度 $O(n)$。

---

## 18. [Minimum Cost Pairs](https://cses.fi/problemset/task/3402)

`路径匹配` `罚值分治`

### 题意

数组中选出 $k$ 对互不相交的数，单对代价是绝对差，要求对所有 $k=1,2,\dots,\lfloor n/2\rfloor$ 输出最小总代价。

### 分析

排序后，最优配对一定不会交叉，所以问题退化成一条路径上的带权匹配：只能在相邻位置之间选边，边权是相邻差值 $w_i=a_{i+1}-a_i$。

如果只问某个固定 $k$，就是经典“选 $k$ 条互不相邻边最小化权值和”。想把所有 $k$ 一次性做出来，可以给每条选中的边减去一个罚值 $\lambda$，跑 $dp[i]=\min(dp[i-1],dp[i-2]+w_{i-1}-\lambda)$，同时记录选边数。随着 $\lambda$ 变化，最优选边数单调，就能用罚值分治反推出所有 $k$ 的真实答案。

### 核心代码

```cpp
auto solve = [&](long long lam){
    vector<pair<long long,int>> dp(n + 1, {0, 0});
    for (int i = 2; i <= n; ++i){
        auto a = dp[i - 1];
        auto b = dp[i - 2];
        b.first += w[i - 1] - lam; ++b.second;
        dp[i] = better(a, b);
    }
    return dp[n];
};
void work(long long L, long long R, int cL, int cR){
    long long mid = (L + R) >> 1;
    auto [val, cnt] = solve(mid);
    ans[cnt] = val + mid * cnt;
    if (cL < cnt) work(L, mid - 1, cL, cnt - 1);
    if (cnt < cR) work(mid + 1, R, cnt + 1, cR);
}
```

### 复杂度

单次递推是 $O(n)$，整套分治罚值的总复杂度是 $O(n \log V)$，空间复杂度 $O(n)$。

---

## 19. [Two Stacks Sorting](https://cses.fi/problemset/task/2402)

`二分图着色` `在线模拟`

### 题意

输入是一个排列，只能把前端元素压入两只栈中的某一只，再从某个栈顶弹出到输出，要求最终得到升序输出；若可行，输出每个数进的是哪只栈。

### 分析

关键不是直接模拟，而是先判断哪些元素绝不能进同一只栈。若 $i<j$ 且存在某个 $k>j$ 满足 $p_k<p_i<p_j$，那么把 $p_i,p_j$ 放在同一栈里时，$p_j$ 会压在 $p_i$ 上方，而 $p_i$ 又必须在 $p_j$ 之前输出，必然冲突。于是得到一个冲突图，题目就变成能否二染色。

这个冲突条件可以写成 $p_i<p_j$ 且 $mn_{j+1}<p_i$，其中 $mn_i$ 是后缀最小值。按位置从左到右扫，值域上线段树分别维护两种颜色里已经出现过的点；查询区间 $(mn_{j+1},p_j)$ 是否同时出现两色即可在线完成染色。染色成功后，再按分配结果正常模拟两只栈。

### 核心代码

```cpp
for (int j = 1; j <= n; ++j){
    int L = mn[j + 1] + 1, R = p[j] - 1;
    bool has0 = query(seg0, L, R), has1 = query(seg1, L, R);
    if (has0 && has1) return cout << "IMPOSSIBLE\n", void();
    color[j] = has0 ? 1 : 0;
    add(color[j] ? seg1 : seg0, p[j], 1);
}
for (int i = 1, need = 1; i <= n; ++i){
    st[color[i]].push(p[i]);
    while ((!st[0].empty() && st[0].top() == need) || (!st[1].empty() && st[1].top() == need)){
        if (!st[0].empty() && st[0].top() == need) st[0].pop();
        else st[1].pop();
        ++need;
    }
}
```

### 复杂度

时间复杂度 $O(n \log n)$，空间复杂度 $O(n)$。

---

# 四、图论、匹配与资源分配

这一章的共同点是“选择”不再是独立的：连通块要整体去向同一边，行列删除要互相覆盖，人员分工要跨越一道最优分界。图论语言能把这些耦合关系一次讲清。

## 20. [School Excursion](https://cses.fi/problemset/task/1706)

`并查集` `位集背包`

### 题意

有些孩子成对要求去同一个景点，问动物园人数可能有哪些取值，输出长度为 $n$ 的可行性串。

### 分析

“必须同去”的关系会在图里形成若干连通块，一个连通块里的孩子只能整体去动物园或整体去游乐园。于是题目立刻变成：给定若干块大小，哪些和可以被选出来。

块大小总和是 $n$，直接做位集子集和即可。每加入一个连通块大小 $sz$，就把当前可达位集左移 $sz$ 再或回去。最后输出位置 $1..n$ 的可达情况。

### 核心代码

```cpp
DSU dsu(n);
for (auto [u, v] : edges) dsu.unite(u, v);
vector<int> comp;
for (int i = 1; i <= n; ++i) if (dsu.find(i) == i) comp.push_back(dsu.sz[i]);
bitset<100001> dp;
dp[0] = 1;
for (int s : comp) dp |= (dp << s);
for (int i = 1; i <= n; ++i) cout << dp[i];
cout << '\n';
```

### 复杂度

时间复杂度 $O((n+m)\alpha(n)+n^2/w)$，空间复杂度 $O(n)$。

---

## 21. [Coin Grid](https://cses.fi/problemset/task/1709)

`二分图最小点覆盖` `最大匹配`

### 题意

每次可以删掉一整行或一整列的所有硬币，要求最少多少次删空整张图，并输出这些行列。

### 分析

把每一行看成左部点、每一列看成右部点，有硬币的格子就在对应行列之间连一条边。选择一行或一列去删硬币，本质上就是选择一个端点覆盖这条边。

于是题目就是二分图最小点覆盖。由 König 定理，最小点覆盖大小等于最大匹配大小；求出最大匹配后，再从所有未匹配左点出发沿交错路搜索，得到标准的最小点覆盖：左侧未访问点加右侧已访问点。

### 核心代码

```cpp
HopcroftKarp hk(n, n);
for (int i = 1; i <= n; ++i) for (int j : coin_col[i]) hk.addEdge(i, j);
hk.max_matching();
vector<int> visL(n + 1), visR(n + 1);
for (int i = 1; i <= n; ++i) if (!hk.matchL[i]) dfs_alt(i, visL, visR, hk);
for (int i = 1; i <= n; ++i) if (!visL[i]) cout << 1 << ' ' << i << '\n';
for (int j = 1; j <= n; ++j) if (visR[j]) cout << 2 << ' ' << j << '\n';
```

### 复杂度

时间复杂度 $O(E\sqrt V)$，空间复杂度 $O(E)$。

---

## 22. [Programmers and Artists](https://cses.fi/problemset/task/2426)

`贪心分界` `前后缀堆`

### 题意

每个候选人既可以做程序员也可以做美术，要求正好选出 $a$ 个程序员和 $b$ 个美术，使技能总和最大。

### 分析

把候选人按差值 $x_i-y_i$ 从大到小排序。最优解里一定存在一道分界线：左边更适合当程序员，右边更适合当美术；如果有一个“右边程序员”和“左边美术”交叉出现，交换身份不会更差。

于是只需预处理两部分：前缀里恰好选 $a$ 个程序员的最大总技能，后缀里恰好选 $b$ 个美术的最大总技能。两边都可以用小根堆维护当前保留的 $a$ 个或 $b$ 个最大值，最后枚举分界线取最大和。

### 核心代码

```cpp
sort(v.begin(), v.end(), [](auto &a, auto &b){
    return a.x - a.y > b.x - b.y;
});
for (int i = 0; i < n; ++i){
    sum += v[i].x; pq.push(v[i].x);
    if ((int)pq.size() > a) sum -= pq.top(), pq.pop();
    if ((int)pq.size() == a) pre[i] = sum;
}
for (int i = n - 1; i >= 0; --i){
    sum += v[i].y; pq.push(v[i].y);
    if ((int)pq.size() > b) sum -= pq.top(), pq.pop();
    if ((int)pq.size() == b) suf[i] = sum;
}
for (int i = a - 1; i + b < n; ++i) ans = max(ans, pre[i] + suf[i + 1]);
```

### 复杂度

排序后总复杂度 $O(n \log n)$，空间复杂度 $O(n)$。

---

# 五、网格选择与建筑统计

这一章的网格题都不是单纯地“扫一遍矩阵”。有的是把相邻限制翻成二元可满足性，有的是把行列指标变成流，有的是把直方图贡献摊平到整张答案表。

## 23. [Grid Coloring II](https://cses.fi/problemset/task/3312)

`二元可满足性` `邻接约束`

### 题意

每个格子原本是 $A,B,C$ 之一，现在必须改成另外两种之一，并且改完后相邻格子颜色不能相同；要求构造任意可行方案。

### 分析

每个格子虽然有三种颜色，但“新颜色不能等于旧颜色”后其实只剩恰好两种候选颜色，所以它天生就是一个布尔变量。

对于相邻的两个格子，只要它们的候选集合里存在同一种颜色 $c$，就禁止“二者同时选 $c$”这个赋值，这恰好是一条二元约束子句。把整张网格拆成变量、建立蕴含图、跑强连通分量判可行，再按拓扑序回填颜色即可。

### 核心代码

```cpp
for (int u = 0; u < N; ++u){
    auto [c0, c1] = choice[u];
    for (int v : adj[u]){
        auto [d0, d1] = choice[v];
        if (c0 == d0) add_or(id(u,1), id(v,1));
        if (c0 == d1) add_or(id(u,1), id(v,0));
        if (c1 == d0) add_or(id(u,0), id(v,1));
        if (c1 == d1) add_or(id(u,0), id(v,0));
    }
}
if (!sat()) cout << "IMPOSSIBLE\n";
else for (int u = 0; u < N; ++u) ans[u] = choice[u][value[u]];
```

### 复杂度

时间复杂度 $O(nm)$，空间复杂度 $O(nm)$。

---

## 24. [Grid Puzzle I](https://cses.fi/problemset/task/2432)

`网络流` `0-1 矩阵构造`

### 题意

要求构造一个 $0/1$ 矩阵，使每行恰好选 $a_i$ 个、每列恰好选 $b_j$ 个；若无解输出 $-1$。

### 分析

这是最典型的二分图流模型。源点连每一行、容量为 $a_i$；每一列连汇点、容量为 $b_j$；行到列的边容量设成 $1$，表示对应格子最多选一次。

若最大流等于 $\sum a_i$，就说明存在满足所有行列和的 $0/1$ 矩阵。此时只要看哪些“行到列”的边被流满了，就能直接恢复出整张棋盘。

### 核心代码

```cpp
Dinic dinic(S, T);
for (int i = 1; i <= n; ++i) dinic.addEdge(S, row(i), a[i]);
for (int j = 1; j <= n; ++j) dinic.addEdge(col(j), T, b[j]);
for (int i = 1; i <= n; ++i)
    for (int j = 1; j <= n; ++j) id[i][j] = dinic.addEdge(row(i), col(j), 1);
if (dinic.maxflow() != accumulate(a + 1, a + n + 1, 0)) cout << -1 << '\n';
else for (int i = 1; i <= n; ++i)
    for (int j = 1; j <= n; ++j) ans[i][j] = dinic.used(id[i][j]) ? 'X' : '.';
```

### 复杂度

点数和边数都在 $O(n^2)$，最大流的复杂度足够通过，空间复杂度也是 $O(n^2)$。

---

## 25. [Grid Puzzle II](https://cses.fi/problemset/task/2131)

`费用流` `带权二分图`

### 题意

同样是按行列各选固定个格子，但每个格子有收益，要求在满足行列数量的前提下让总收益最大，并输出方案。

### 分析

和上一题相比，结构完全没变，只是“行到列”的每条边现在带了一个收益 $c_{ij}$。

因此直接在同一个网络上跑最小费用最大流即可：把收益取反变成费用，要求总流量达到 $\sum a_i$。若流量不够则无解；否则负费用的相反数就是最大收益，而满流的行列边仍然对应被选中的格子。

### 核心代码

```cpp
MCMF g(S, T);
for (int i = 1; i <= n; ++i) g.addEdge(S, row(i), a[i], 0);
for (int j = 1; j <= n; ++j) g.addEdge(col(j), T, b[j], 0);
for (int i = 1; i <= n; ++i)
    for (int j = 1; j <= n; ++j) id[i][j] = g.addEdge(row(i), col(j), 1, -c[i][j]);
auto [flow, cost] = g.minCostMaxFlow();
if (flow != sumA) cout << -1 << '\n';
else cout << -cost << '\n';
```

### 复杂度

时间复杂度由费用流主导，在 $n\le50$ 的范围内完全可控；空间复杂度 $O(n^2)$。

---

## 26. [Maximum Building II](https://cses.fi/problemset/task/1148)

`直方图` `二维差分`

### 题意

森林里有空地和树。对每一种矩形大小 $(h,w)$，都要统计有多少个全空矩形恰好能放下这座建筑。

### 分析

把每一行当作矩形底边，维护向上连续空地高度 $h_j$，问题就变成“对当前直方图，统计所有宽度与高度的最小值贡献”。

单独枚举每个矩形会炸掉。正确做法是先用单调栈求出每根柱子作为最小高度时能向左右扩多远，再把它对所有宽度的贡献写成三段线性函数，通过差分数组批量加入。对每一行做完这件事后，再把高度方向做前缀和，就得到每个 $(h,w)$ 的精确次数。

### 核心代码

```cpp
for (int i = 1; i <= n; ++i){
    for (int j = 1; j <= m; ++j) h[j] = (g[i][j] == '.' ? h[j] + 1 : 0);
    build_prev_less(h, pre);
    build_next_less_equal(h, nxt);
    for (int j = 1; j <= m; ++j){
        int L = j - pre[j], R = nxt[j] - j, H = h[j];
        add_width_piecewise(H, L, R);
    }
}
recover_by_prefix();
```

### 复杂度

时间复杂度 $O(nm)$，空间复杂度 $O(nm)$。

---

# 六、数位、搬运与切分优化

最后这一章把视角拉回“代价函数本身”。有的题把十进制贪心压成批处理，有的题把搬运写成凸函数流，有的题则把切割区间改写成可二分判定的可行性。

## 27. [Removing Digits II](https://cses.fi/problemset/task/2174)

`数位贪心` `批处理`

### 题意

每一步可以减去当前十进制表示中出现过的某个数字，要求最少多少步把一个至多 $10^{18}$ 的整数减到 $0$。

### 分析

这题的最优策略仍然是“每次减去当前最大数字”，但不能真的一步一步做，因为步数可能极大。观察到只要当前最大数字 $d$ 没变，连续减很多次的行为就是规则的十进制减法批处理。

因此把数写成字符串维护。每一轮先找最大数字 $d$，再算出在不改变“最大数字所在层级”的前提下最多能连续减多少次，把这 $t$ 次统一做完。真正变化的时刻只发生在某位借位或某个最大位被削平时，所以总轮数非常小。

### 核心代码

```cpp
string s; cin >> s;
long long ans = 0;
while (s != "0"){
    int d = max_digit(s);
    long long t = max_batch(s, d);
    ans += t;
    subtract_times(s, d, t);
    trim_zero(s);
}
cout << ans << '\n';
```

### 复杂度

把十进制长度记成 $L$，总复杂度约为 $O(9L^2)$，空间复杂度 $O(L)$。

---

## 28. [Coin Arrangement](https://cses.fi/problemset/task/2180)

`凸性递推` `斜率优化`

### 题意

在 $2 \times n$ 网格里移动硬币，使每个格子最后恰好有一枚，单步可以上下左右移动一格，求最小总代价。

### 分析

横向搬运和纵向搬运会互相影响，不能只看列总数。设第 $i$ 列左边界穿过上排的净流量是 $d_i$，那么下排的净流量就被列总盈亏强制决定；同时，第 $i$ 列内部还会发生一次竖向搬运，把这一列修正成上下各一枚。

把这些流量写开后，总成本会变成若干个绝对值之和，是一个关于 $d_i$ 的凸性递推。扫描列时，状态函数始终保持分段线性凸，可以用斜率技巧或双堆维护最小值位置，于是整题降成线性对数复杂度。

### 核心代码

```cpp
SlopeTrick dp;
for (int i = 1; i <= n; ++i){
    long long need = pref_all[i] - 2LL * i;
    long long top = pref_top[i] - i;
    dp.add_abs(top);
    dp.add_abs(need);
}
cout << dp.get_min() << '\n';
```

### 复杂度

时间复杂度 $O(n \log n)$，空间复杂度 $O(n)$。

---

## 29. [Stick Divisions](https://cses.fi/problemset/task/1161)

`哈夫曼` `贪心合并`

### 题意

一根长度为 $x$ 的木棍要切成若干指定长度。每次把一根木棍切成两段，代价等于被切木棍的长度，求最小总代价。

### 分析

反着看比正着切更自然：最终得到的若干段要不断合并回长度 $x$ 的整棍，而一次合并的代价和两段长度之和完全相同。

这就和哈夫曼编码一模一样。每次拿当前最短的两段合并，才能把大的代价尽量推迟，让长木棍少被重复计费。

### 核心代码

```cpp
priority_queue<long long, vector<long long>, greater<long long>> pq;
for (long long d : part) pq.push(d);
long long ans = 0;
while (pq.size() > 1){
    long long a = pq.top(); pq.pop();
    long long b = pq.top(); pq.pop();
    ans += a + b;
    pq.push(a + b);
}
cout << ans << '\n';
```

### 复杂度

时间复杂度 $O(n \log n)$，空间复杂度 $O(n)$。

---

## 30. [Stick Difference](https://cses.fi/problemset/task/3401)

`可行性判定` `并行二分`

### 题意

给出若干木棍长度。恰好做 $k$ 次切割后，总段数变成 $n+k$，要求最长段与最短段的差尽量小；对所有 $k=1,2,\dots,m$ 都要回答。

### 分析

固定答案差值 $D$ 时，问题是在问：是否存在某个下界 $L$，使所有切出来的段长都落在区间 $[L,L+D]$ 里。对于一根长度为 $a$ 的木棍，若每段都在这个区间内，那么可切出的段数范围是 $\left[\lceil a/(L+D)\rceil,\lfloor a/L\rfloor\right]$。

把所有木棍的上下界求和，就得到总段数可行区间 $[A(L),B(L)]$。因此只要能在某个 $L$ 上覆盖目标段数 $n+k$，这个 $D$ 就可行。关键是 $\lfloor a/L\rfloor$ 和 $\lceil a/(L+D)\rceil$ 只会在商变化处跳变，所以可以按整除分块扫描所有关键 $L$，再配合并行二分同时求出所有 $k$ 的最小可行 $D$。

### 核心代码

```cpp
bool ok(long long D, int pieces){
    for (auto [l, r] : critical_segments(D)){
        long long A = 0, B = 0;
        for (long long x : a){
            A += (x + l + D - 1) / (l + D);
            B += x / l;
        }
        if (A <= pieces && pieces <= B) return true;
    }
    return false;
}
parallel_binary_search(1, 1'000'000'000LL, ok);
```

### 复杂度

总体复杂度由并行二分乘上一次整除分块判定组成，能控制在接近线性的数量级；空间复杂度 $O(n+m)$。
