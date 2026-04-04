---
title: 一本通 NOIP 2005赛题解题报告
subtitle: 🏁 从基础模拟与背包起步，逐层走到压缩状态、图结构与表达式判等
order: 6
icon: "2005"
---

# 一本通 NOIP 2005赛题解题报告

# 一、普及组赛题

普及组四题的推进顺序很自然：先从“把条件直接翻译成判断”开始，再学会处理区间重叠，随后进入最经典的背包模型，最后把问题提升到模意义下的循环与数论结构。读这部分时，建议始终追问三件事：状态是什么、什么量在扫描过程中保持不变、最后从哪里把答案读出来。

## 1. [【05NOIP普及组】陶陶摘苹果](http://ybt.ssoier.cn:8088/problem_show.php?pid=1930)
`NOIP 2005` `普及组`

### 题意
已知 10 个苹果的高度，以及陶陶手伸直后的高度。她还可以踩上 30 厘米高的板凳，问最终能摘到多少个苹果。

### 分析
这道题最重要的不是“会不会写循环”，而是先把条件翻译准确：真正决定能不能摘到的高度上界是 `手能达到的高度 + 30`。一旦这个上界确定下来，每个苹果之间就完全独立，不存在“先摘哪个会影响后摘哪个”的关系，因此不需要排序，也不需要贪心。

扫描 10 个苹果时，可以维护一个很简单的不变量：**变量 `ans` 始终表示前面已经看过的苹果里，能够摘到的个数**。遇到一个苹果，只要它的高度不超过可达上界，就把 `ans` 加一；否则跳过。全部扫描结束后，不变量自然把答案带到了最后。

答案提取也很直接：把 10 个苹果都判断完以后，`ans` 就是能摘到的总数。

### 核心代码
```cpp
int ans = 0;
int reach = h + 30;
for (int i = 0; i < 10; i++) {
    if (a[i] <= reach) ans++;
}
```

### 复杂度
时间复杂度 `O(10)`，空间复杂度 `O(1)`。

---

## 2. [【05NOIP普及组】校门外的树](http://ybt.ssoier.cn:8088/problem_show.php?pid=1931)
`NOIP 2005` `普及组`

### 题意
数轴上从 `0` 到 `L` 的每个整数点都有一棵树。给出 `M` 个闭区间，表示要移走这些区间中的树，问最后剩下多少棵树。

### 分析
如果区间互不重叠，直接用总树数减去每段长度就行；但题目明确说区间可能重叠，所以“逐段相减”会重复删除。看到这种“很多区间共同覆盖一条线段、还要问某些位置是否被覆盖”的场景，就要想到把每个位置的覆盖次数统计出来。

由于 `L <= 10000`，可以直接在整数点上做差分。对区间 `[l, r]`，让 `diff[l]++`、`diff[r + 1]--`，随后从 `0` 扫到 `L` 做前缀和。扫描到位置 `x` 时，变量 `cover` 的不变量是：**当前有多少个施工区间覆盖点 `x`**。若 `cover > 0`，说明这棵树已经被移走；若 `cover == 0`，说明这棵树仍然保留。

这样做的关键好处是：重叠区间会在前缀和里自然叠加，不会出现重复统计。最后把所有 `cover == 0` 的位置数出来，就是答案。

### 核心代码
```cpp
const int MAXL = 10005;
int diff[MAXL] = {0};

for (int i = 0; i < M; i++) {
    diff[seg[i].l]++;
    diff[seg[i].r + 1]--;
}

int ans = 0, cover = 0;
for (int x = 0; x <= L; x++) {
    cover += diff[x];
    if (cover == 0) ans++;
}
```

### 复杂度
时间复杂度 `O(L + M)`，空间复杂度 `O(L)`。

---

## 3. [【05NOIP普及组】采药](http://ybt.ssoier.cn:8088/problem_show.php?pid=1932)
`NOIP 2005` `普及组`

### 题意
总时间为 `T`，每株草药有采摘时间和价值，每株最多采一次。问在不超过总时间的前提下，能得到的最大总价值。

### 分析
题目里有三个非常明显的建模信号：**总容量受限、每件物品只能选或不选、目标是最大化价值**。这就是标准的 `0/1` 背包。

把状态定义成 `dp[j]`：在总时间不超过 `j` 的条件下，当前已经处理过的草药能取得的最大价值。处理一株耗时 `t`、价值 `v` 的草药时，只有两种选择：
- 不采它，价值还是 `dp[j]`；
- 采它，那么前一部分必须来自容量 `j - t` 的最优解，价值变成 `dp[j - t] + v`。

因此转移是 `dp[j] = max(dp[j], dp[j - t] + v)`。这里最关键的是 **容量要倒着枚举**。倒序的含义是：当我们更新当前这株草药时，用到的 `dp[j - t]` 仍然是“上一层”的结果，保证同一株草药不会被重复选多次。这正是 `0/1` 背包与完全背包的分界线。

答案读取也很稳定：`dp[T]` 表示总时间不超过 `T` 时的最优值，正好就是题目所求。

### 核心代码
```cpp
for (int i = 1; i <= M; i++) {
    for (int j = T; j >= herb[i].t; j--) {
        dp[j] = max(dp[j], dp[j - herb[i].t] + herb[i].v);
    }
}
```

### 复杂度
时间复杂度 `O(MT)`，空间复杂度 `O(T)`。

---

## 4. [【05NOIP普及组】循环](http://ybt.ssoier.cn:8088/problem_show.php?pid=1933)
`NOIP 2005` `普及组`

### 题意
给定一个很大的整数 `n` 和一个位数 `k`，研究序列 `n^1, n^2, n^3, ...` 的后 `k` 位是否从一开始就循环；如果循环，求最小循环长度，否则输出 `-1`。

### 分析
“后 `k` 位”这句话要立刻翻译成模运算：我们真正研究的是序列 `a_i = n^i mod 10^k`。题目要求存在最小正整数 `L`，使得对任意 `a >= 1` 都有 `n^a` 与 `n^(a+L)` 的后 `k` 位相同，也就是

$$
n^{a+L} \equiv n^a \pmod{10^k}
$$

对所有 `a` 都成立。把公共因子 `n^a` 提出来，可以看成“这个循环必须从第一项就开始”，而不是先走一段再进入环。于是先检查最根本的结构：`10^k = 2^k * 5^k`，问题可以拆成模 `2^k` 与模 `5^k` 两部分分别讨论。

设 `v_p(n)` 表示 `n` 中质因子 `p` 的个数。对某个 `p^k` 来说，只有三种情况：
- `v_p(n) = 0`：说明 `n` 与 `p^k` 互质，此时循环长度就是 `n` 在模 `p^k` 下的**乘法阶**；
- `v_p(n) >= k`：说明 `n ≡ 0 (mod p^k)`，从第一项开始这一侧就已经稳定为 `0`，循环长度贡献 `1`；
- `0 < v_p(n) < k`：这是最关键的坏情况。因为再多乘一次 `n` 只会让这一侧含有更多的 `p`，不可能回到第一项对应的余数，所以题目要求的“从一开始就循环”根本不存在，直接输出 `-1`。

因此，先判断 `2` 和 `5` 的次数是否落在坏区间；若没有坏区间，再分别求模 `2^k`、模 `5^k` 的循环长度，最后取最小公倍数。求乘法阶时，利用“阶一定整除群的阶”这个事实，不必暴力枚举：
- 模 `2^k` 的可能答案整除 `2^(k-2)`；
- 模 `5^k` 的可能答案整除 `4 * 5^(k-1)`。

把候选答案不断尝试除以质因子 `2` 或 `5`，只要快速幂验证仍然等于 `1`，就继续缩小，最后留下来的就是最小循环长度。最终答案提取为两侧循环长度的 `lcm`；若前面的坏情况出现，则答案就是 `-1`。

### 核心代码
```cpp
using boost::multiprecision::cpp_int;

cpp_int qpow(cpp_int a, cpp_int e, const cpp_int& mod) {
    cpp_int r = 1;
    while (e > 0) {
        if (e & 1) r = r * a % mod;
        a = a * a % mod;
        e >>= 1;
    }
    return r;
}

cpp_int gcd(cpp_int a, cpp_int b) {
    while (b != 0) {
        cpp_int t = a % b;
        a = b;
        b = t;
    }
    return a;
}

cpp_int pwr(int p, int k) {
    cpp_int r = 1;
    while (k--) r *= p;
    return r;
}

int vp(cpp_int x, int p, int k) {
    int c = 0;
    while (c < k && x % p == 0) {
        x /= p;
        c++;
    }
    return c;
}

cpp_int ord(cpp_int a, cpp_int mod, cpp_int lim, int prime) {
    while (lim % prime == 0 && qpow(a, lim / prime, mod) == 1) lim /= prime;
    return lim;
}

string solve(string s, int k) {
    cpp_int n = 0;
    for (char c : s) n = n * 10 + (c - '0');
    int c2 = vp(n, 2, k), c5 = vp(n, 5, k);
    if ((0 < c2 && c2 < k) || (0 < c5 && c5 < k)) return "-1";

    cpp_int o2 = 1, o5 = 1;
    if (c2 == 0) {
        cpp_int mod2 = pwr(2, k), lim2 = (k <= 2 ? 1 : pwr(2, k - 2));
        o2 = ord(n % mod2, mod2, lim2, 2);
    }
    if (c5 == 0) {
        cpp_int mod5 = pwr(5, k), lim5 = pwr(5, k - 1) * 4;
        lim5 = ord(n % mod5, mod5, lim5, 2);
        o5 = ord(n % mod5, mod5, lim5, 5);
    }

    cpp_int ans = o2 / gcd(o2, o5) * o5;
    return ans.convert_to<string>();
}
```

### 复杂度
时间复杂度主要是若干次大整数快速幂检验，候选因子个数只与 `k` 的质因子分解有关；在本题范围内可视为远小于暴力找循环。额外空间复杂度 `O(1)`（不计大整数本身占用）。

---

# 二、提高组赛题

提高组四题开始明显强调“先看结构，再决定算法”：有的题要把规则拆成独立判定，有的题要先压缩坐标再做动态规划，有的题先要判断目标结构是否存在，还有的题根本不适合做代数化简，而应转成表达式求值与多点校验。

## 5. [【05NOIP提高组】谁拿了最多奖学金](http://ybt.ssoier.cn:8088/problem_show.php?pid=1839)
`NOIP 2005` `提高组`

### 题意
给出每个学生的姓名、成绩、干部情况、西部情况和论文数。每种奖学金有独立条件，符合就能叠加。要求输出奖金最多的学生、他的奖金数，以及所有学生奖金总和。

### 分析
这题的本质不是排序，而是**按规则精确结算**。五类奖学金之间互不冲突，因此最自然的做法就是写一个结算函数 `calc`，把一个学生的全部信息代进去，返回他应得的总奖金。

解题时要抓住两个独立目标：
1. **单人最大奖金**：扫描每个学生时，用 `best` 维护当前看到的最大奖金；
2. **全体奖金总和**：把每个人的奖金累加到 `sum`。

这里的细节陷阱在于并列处理。题目要求若最大奖金有多人并列，输出输入顺序最早的人。所以更新“最佳学生”时只能在 `cur > best` 时替换，绝不能在 `cur == best` 时覆盖。这个严格大于就是本题的关键不变量：**`best_name` 始终对应目前扫描范围内最早出现的最优解**。

扫描结束后，`best_name`、`best`、`sum` 三个量就是三行输出的答案。

### 核心代码
```cpp
int calc(int a, int b, bool leader, bool west, int paper) {
    int s = 0;
    if (a > 80 && paper > 0) s += 8000;
    if (a > 85 && b > 80) s += 4000;
    if (a > 90) s += 2000;
    if (a > 85 && west) s += 1000;
    if (b > 80 && leader) s += 850;
    return s;
}

int best = -1, sum = 0;
string best_name;
for (int i = 0; i < N; i++) {
    int cur = calc(stu[i].avg, stu[i].cls, stu[i].cadre, stu[i].west, stu[i].paper);
    sum += cur;
    if (cur > best) {
        best = cur;
        best_name = stu[i].name;
    }
}
```

### 复杂度
时间复杂度 `O(N)`，空间复杂度 `O(1)`。

---

## 6. [【05NOIP提高组】过河](http://ybt.ssoier.cn:8088/problem_show.php?pid=1840)
`NOIP 2005` `提高组`

### 题意
青蛙从 `0` 出发，每次跳跃长度在 `[S, T]` 之间，跳到或跳过 `L` 就算过河。桥上有若干石子，问最少踩到多少个石子。

### 分析
如果直接把桥上所有位置都当成状态，`L` 最多到 `10^9`，显然无法承受。所以先别急着写 DP，而是先看状态真正依赖什么。青蛙在意的只有两类位置：**有石子的点** 和 **这些点附近、可能作为跳板的少量空点**。当一段没有石子的空白区间特别长时，继续把它完整保留并不会产生新的决策价值。

原因在于跳长满足 `T <= 10`。对一段很长的纯空区间来说，DP 转移只会看前面至多 `T` 个位置；当空白长度已经远大于这个影响范围后，前面的细节就“洗掉”了。实际实现中，把每一段相邻关键点之间的距离压到最多 `100` 即可，这正是经典做法里的安全上界。压缩后，总长度只和石子数 `M` 有关，可以安心做线性 DP。

状态定义为 `dp[i]`：到达压缩后位置 `i` 时，最少踩到多少个石子。若位置 `i` 本身有石子，那么从前面某个 `i-j` 跳来时要额外加 `1`；否则只继承代价。转移为

$$
dp[i] = \min_{S \le j \le T} \left(dp[i-j] + stone[i]\right)
$$

这里的不变量是：**`dp[i]` 始终表示所有能恰好落在 `i` 的方案中的最优值**。最后并不一定刚好停在终点，而是跳到或跳过终点都算成功，因此答案要在区间 `[end, end + T]` 中取最小值。

还有一个必须单独处理的特例：若 `S == T`，那么跳法完全固定，青蛙只会落在 `S, 2S, 3S ...` 这些位置上，直接统计这些位置上的石子数即可，不需要压缩与 DP。

### 核心代码
```cpp
if (S == T) {
    int ans = 0;
    for (int x : pos) ans += (x % S == 0);
} else {
    const int LIM = 100, INF = 1e9;
    sort(pos.begin(), pos.end());
    vector<int> stone(LIM * (M + 2) + 5), dp(LIM * (M + 2) + LIM + T + 5, INF);

    int prev = 0, cur = 0;
    for (int x : pos) {
        cur += min(x - prev, LIM);
        stone[cur] = 1;
        prev = x;
    }
    int end = cur + min<long long>(L - prev, LIM);

    dp[0] = 0;
    for (int i = 1; i <= end + T; i++) {
        for (int j = S; j <= T; j++) {
            if (i >= j) dp[i] = min(dp[i], dp[i - j] + stone[i]);
        }
    }

    int ans = INF;
    for (int i = end; i <= end + T; i++) ans = min(ans, dp[i]);
}
```

### 复杂度
排序后时间复杂度 `O(M log M + MT \cdot 100)`，压缩后状态数是 `O(100M)`，空间复杂度 `O(100M)`。

---

## 7. [【05NOIP提高组】篝火晚会](http://ybt.ssoier.cn:8088/problem_show.php?pid=1841)
`NOIP 2005` `提高组`

### 题意
初始时学生按 `1,2,...,n` 围成一圈。每名学生都给出自己最希望相邻的两个人。一次操作可以对若干学生做一个循环置换，代价等于被移动的人数。要求用最小总代价实现所有人的相邻愿望；若无解输出 `-1`。

### 分析
这题要分成两个层次看。

第一层是**目标圈是否存在**。如果最终大家真的围成一个满足愿望的圈，那么每个人的两个邻居就被唯一确定了，于是整道题对应一张“每个点度数为 2”的图。要想形成一个合法圆圈，这张图必须满足两件事：
- 每条相邻关系必须是双向认可，也就是 `u` 想挨着 `v`，`v` 也必须把 `u` 列为愿望之一；
- 全图必须连成一个长度为 `n` 的单环，而不能分裂成多个小环。

只要这两条任意一条不满足，就不可能安排，答案直接是 `-1`。

第二层才是**从初始圈变到目标圈的最小代价**。假设目标环已经确定，那么顺时针和逆时针两个方向都合法，再考虑整圈旋转，实际上只有“若干个等价目标序列”。对于某个固定目标序列，当前座位到目标座位形成一个置换。置换分解成若干个不相交的环后，每个长度为 `m` 的环都可以用一次操作解决，代价正好是 `m`。所以最小总代价其实就是 **被移动的人数**，也就是

$$
\text{总代价} = n - \text{已经在正确位置上的人数}
$$

于是问题变成：在目标环的所有旋转、两个方向中，最多能留下多少个“不用动的人”。若目标顺序记为 `ord[i]`，那么学生 `ord[i]` 想在当前第 `i` 个座位上不动，就要求它们的编号差是同一个循环位移量。把每个人的偏移量 `(ord[i] - i) mod n` 统计频次，出现次数最多的那个偏移量，就对应最佳旋转下的不动人数。顺时针、逆时针各算一次，取较大者即可。

最终答案提取为 `n - max_keep`；若前面的单环检查失败，则输出 `-1`。

### 核心代码
```cpp
bool bad = false;
auto has = [&](int u, int v) {
    return wish[v][0] == u || wish[v][1] == u;
};
for (int u = 1; u <= n; u++) {
    if (!has(u, wish[u][0]) || !has(u, wish[u][1])) bad = true;
}

vector<int> cyc, vis(n + 1, 0);
for (int prev = 0, cur = 1; !bad; ) {
    cyc.push_back(cur);
    vis[cur] = 1;
    int nxt = (wish[cur][0] == prev ? wish[cur][1] : wish[cur][0]);
    prev = cur;
    cur = nxt;
    if (cur == 1) break;
    if (vis[cur]) bad = true;
}
if ((int)cyc.size() != n || count(vis.begin() + 1, vis.end(), 1) != n) bad = true;

auto best_keep = [&](const vector<int>& ord) {
    vector<int> cnt(n, 0);
    int best = 0;
    for (int i = 0; i < n; i++) {
        int d = (ord[i] - 1 - i + n) % n;
        best = max(best, ++cnt[d]);
    }
    return best;
};

vector<int> rev = {cyc[0]};
for (int i = n - 1; i >= 1; i--) rev.push_back(cyc[i]);
int ans = bad ? -1 : n - max(best_keep(cyc), best_keep(rev));
```

### 复杂度
时间复杂度 `O(n)`，空间复杂度 `O(n)`。

---

## 8. [【05NOIP提高组】等价表达式](http://ybt.ssoier.cn:8088/problem_show.php?pid=1842)
`NOIP 2005` `提高组`

### 题意
给出一个题干表达式和若干选项表达式，变量只有 `a`。需要找出哪些选项与题干表达式恒等。

### 分析
这题最容易走进的误区，是尝试把表达式真的“化简成标准式”。一旦有乘法、幂和括号，直接展开会非常麻烦，而且表达式长度虽短，展开结果却可能迅速膨胀。更自然的思路是：**如果两个表达式恒等，那么代入同一个 `a` 后，结果一定处处相同**。

于是可以把“恒等判定”转成“多点求值”。具体做法是：选若干个不同的 `a` 值，每次都按题目给定的运算优先级算出表达式值，并对一个大质数取模防止溢出。若某个选项在所有测试点上的值都与题干一致，就把它视作等价表达式。只要测试点足够多，误判概率就极低。

实现时真正考验的是解析过程。题目给出了明确的优先级：括号最高，其次是 `^`，再是 `*`，最后是 `+`、`-`，同优先级从左到右结合。因此可以写一个递归下降解析器：
- `atom` 负责读变量、数字或括号；
- `pw` 负责一段连续的乘幂，注意这里按题意是左结合；
- `mul` 负责乘法；
- `add` 负责加减。

每一层函数都维护一个不变量：**返回值就是从当前位置开始、在本层优先级规则下能够完整解析出的表达式值**。这样从最外层 `add()` 返回时，就得到了整条表达式的值。对题干和每个选项都生成一组“多点取值签名”，最后把签名完全一致的选项字母按顺序拼起来，就是答案。

### 核心代码
```cpp
const long long MOD = 1000000007;
string s;
int p;
long long A;

void skip() {
    while (p < (int)s.size() && s[p] == ' ') p++;
}

long long qpow(long long a, long long e) {
    long long r = 1;
    while (e) {
        if (e & 1) r = r * a % MOD;
        a = a * a % MOD;
        e >>= 1;
    }
    return r;
}

long long add();
long long atom() {
    skip();
    if (s[p] == 'a') return p++, A;
    if (s[p] == '(') {
        p++;
        long long v = add();
        skip();
        p++;
        return v;
    }
    long long v = 0;
    while (p < (int)s.size() && isdigit(s[p])) v = (v * 10 + s[p++] - '0') % MOD;
    return v;
}

long long pw() {
    long long v = atom();
    while (true) {
        skip();
        if (p == (int)s.size() || s[p] != '^') break;
        p++;
        v = qpow(v, atom());
    }
    return v;
}

long long mul() {
    long long v = pw();
    while (true) {
        skip();
        if (p == (int)s.size() || s[p] != '*') break;
        p++;
        v = v * pw() % MOD;
    }
    return v;
}

long long add() {
    long long v = mul();
    while (true) {
        skip();
        if (p == (int)s.size() || (s[p] != '+' && s[p] != '-')) break;
        char op = s[p++];
        long long t = mul();
        v = (v + (op == '+' ? t : MOD - t)) % MOD;
    }
    return v;
}

vector<long long> sign(const string& expr) {
    vector<int> xs = {2, 3, 5, 7, 11, 13, 17};
    vector<long long> h;
    for (int x : xs) {
        s = expr;
        p = 0;
        A = x;
        h.push_back(add());
    }
    return h;
}
```

### 复杂度
设单个表达式长度为 `m`，测试点个数为常数 `c`。则每个表达式求签名的时间复杂度为 `O(cm)`，空间复杂度为 `O(m)`。
