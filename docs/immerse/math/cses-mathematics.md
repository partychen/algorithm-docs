---
title: "CSES 数学专题精选解题报告"
subtitle: "∑ 从整除、计数到博弈，把数学结构压成可编程的方法"
order: 4
icon: "∑"
---

# CSES 数学专题精选解题报告

这份笔记不按名词表排队，而按“怎样把数学结构变成算法”来重排。遇到题目时，先判断真正稳定的对象是什么：是同余类、约数贡献、群作用、概率分布，还是博弈状态的异或值。对象一旦找准，证明和实现都会明显变短。

# 一、递推压缩、快速幂与状态转移

这一章的共性是“不按步骤硬跑”。把一次操作写成可复用的变换之后，折半递归、快速幂和矩阵乘法都能把长过程压成对数级。

## 1. [Josephus Queries](https://cses.fi/problemset/task/2164)
`递推` `约瑟夫环` `编号映射`

### 题意

给定多组 $(n,k)$，圆环里有 $1\sim n$ 个孩子，每轮删去每隔一个的位置，询问第 $k$ 个出局的人是谁。

### 分析

第一轮先删掉所有偶数编号；当 $n$ 为奇数时，这一轮最后还会删到编号 $1$。如果 $k$ 落在这一批里，可以直接反推答案；否则只剩下大约一半的人，把幸存者重新编号后递归处理下一层。整个过程本质上是在做“删除顺序的编号映射”，所以每次都把规模缩到原来的一半。

### 核心代码

```cpp
long long kth(long long n, long long k) {
    if (n == 1) return 1;
    long long first = (n + 1) / 2;
    if (k <= first) {
        long long x = 2 * k;
        return x > n ? 1 : x;
    }
    long long x = kth(n / 2, k - first);
    return (n & 1) ? 2 * x + 1 : 2 * x - 1;
}
```

### 复杂度

时间复杂度 $O(\log n)$，空间复杂度 $O(\log n)$。

---

## 2. [Exponentiation](https://cses.fi/problemset/task/1095)
`快速幂` `模运算` `二进制拆分`

### 题意

多次计算 $a^b \bmod (10^9+7)$，并且题目约定 $0^0=1$。

### 分析

直接连乘会超时，关键是把指数 $b$ 写成二进制。若当前位为 $1$ 就把当前底数乘进答案，然后把底数平方、指数右移；因为每次都把指数减半，所以总步数只和二进制位数有关。初始化答案为 $1$，自然也兼容了 $b=0$ 的情况。

### 核心代码

```cpp
const long long MOD = 1000000007;

long long mod_pow(long long a, long long b) {
    long long r = 1;
    a %= MOD;
    while (b) {
        if (b & 1) r = r * a % MOD;
        a = a * a % MOD;
        b >>= 1;
    }
    return r;
}
```

### 复杂度

时间复杂度 $O(\log b)$，空间复杂度 $O(1)$。

---

## 3. [Exponentiation II](https://cses.fi/problemset/task/1712)
`快速幂` `费马小定理` `降幂`

### 题意

多次计算 $a^{b^c} \bmod (10^9+7)$，同样约定 $0^0=1$。

### 分析

外层依然是快速幂，难点在指数 $b^c$ 太大。模数 $M=10^9+7$ 是质数，因此指数可以先模掉 $M-1$：先算 $e=b^c \bmod (M-1)$，再算 $a^e \bmod M$。题目把 $0^0$ 定义成 $1$，所以两层快速幂都能直接复用同一套模板。

### 核心代码

```cpp
const long long MOD = 1000000007;

long long mod_pow(long long a, long long b, long long mod) {
    long long r = 1 % mod;
    a %= mod;
    while (b) {
        if (b & 1) r = r * a % mod;
        a = a * a % mod;
        b >>= 1;
    }
    return r;
}

long long solve(long long a, long long b, long long c) {
    long long e = mod_pow(b, c, MOD - 1);
    return mod_pow(a, e, MOD);
}
```

### 复杂度

时间复杂度 $O(\log c + \log MOD)$，空间复杂度 $O(1)$。

---

## 4. [Fibonacci Numbers](https://cses.fi/problemset/task/1722)
`递推` `倍增` `矩阵思想`

### 题意

给定 $n$，计算斐波那契数 $F_n \bmod (10^9+7)$，其中 $n$ 可达 $10^{18}$。

### 分析

线性递推不能顺着推到 $10^{18}$。快速倍增把 $(F_n,F_{n+1})$ 一起维护，利用
$F_{2m}=F_m(2F_{m+1}-F_m)$，
$F_{2m+1}=F_m^2+F_{m+1}^2$，
每次递归都把下标减半，因此和矩阵快速幂一样是对数级。

### 核心代码

```cpp
const long long MOD = 1000000007;

pair<long long, long long> fib(long long n) {
    if (n == 0) return {0, 1};
    auto [a, b] = fib(n >> 1);
    long long c = a * ((2 * b - a + MOD) % MOD) % MOD;
    long long d = (a * a + b * b) % MOD;
    if (n & 1) return {d, (c + d) % MOD};
    return {c, d};
}
```

### 复杂度

时间复杂度 $O(\log n)$，空间复杂度 $O(\log n)$。

---

## 5. [Throwing Dice](https://cses.fi/problemset/task/1096)
`线性递推` `矩阵快速幂` `状态压缩`

### 题意

求掷若干次六面骰子后，点数和恰好为 $n$ 的方案数，答案模 $10^9+7$，其中 $n$ 可达 $10^{18}$。

### 分析

设 $f_i$ 表示和为 $i$ 的方案数，则有 $f_i=f_{i-1}+\cdots+f_{i-6}$。这是一个固定阶数的线性递推，把状态写成 $(f_i,f_{i-1},\dots,f_{i-5})$ 后，一次转移就是一个 $6\times 6$ 矩阵；要求第 $n$ 项，就把这张转移矩阵做快速幂。

### 核心代码

```cpp
const long long MOD = 1000000007;
using Mat = array<array<long long, 6>, 6>;

Mat mul(const Mat& a, const Mat& b) {
    Mat c{};
    for (int i = 0; i < 6; i++)
        for (int k = 0; k < 6; k++) if (a[i][k])
            for (int j = 0; j < 6; j++)
                c[i][j] = (c[i][j] + a[i][k] * b[k][j]) % MOD;
    return c;
}

Mat mpow(Mat a, long long e) {
    Mat r{};
    for (int i = 0; i < 6; i++) r[i][i] = 1;
    while (e) {
        if (e & 1) r = mul(r, a);
        a = mul(a, a);
        e >>= 1;
    }
    return r;
}

long long solve(long long n) {
    static long long f[7] = {0, 1, 2, 4, 8, 16, 32};
    if (n <= 6) return f[n];
    Mat t = {{{1,1,1,1,1,1},{1,0,0,0,0,0},{0,1,0,0,0,0},{0,0,1,0,0,0},{0,0,0,1,0,0},{0,0,0,0,1,0}}};
    auto p = mpow(t, n - 6);
    long long ans = 0;
    for (int i = 0; i < 6; i++) ans = (ans + p[0][i] * f[6 - i]) % MOD;
    return ans;
}
```

### 复杂度

时间复杂度 $O(6^3\log n)$，空间复杂度 $O(6^2)$。

---

## 6. [Graph Paths I](https://cses.fi/problemset/task/1723)
`邻接矩阵` `路径计数` `快速幂`

### 题意

给定有向图，统计从点 $1$ 到点 $n$ 恰好经过 $k$ 条边的路径条数，答案模 $10^9+7$。

### 分析

邻接矩阵 $A$ 的 $(i,j)$ 元表示一步从 $i$ 到 $j$ 的方案数，那么 $A^k$ 的 $(i,j)$ 元恰好就是走 $k$ 步的方案数。因为 $n\le 100$，矩阵乘法可以直接做，真正的大数只出现在指数 $k$ 上，所以依然是快速幂模型。

### 核心代码

```cpp
const long long MOD = 1000000007;
using Mat = vector<vector<long long>>;

Mat mul(const Mat& a, const Mat& b) {
    int n = a.size();
    Mat c(n, vector<long long>(n));
    for (int i = 0; i < n; i++)
        for (int k = 0; k < n; k++) if (a[i][k])
            for (int j = 0; j < n; j++)
                c[i][j] = (c[i][j] + a[i][k] * b[k][j]) % MOD;
    return c;
}

Mat mpow(Mat a, long long e) {
    int n = a.size();
    Mat r(n, vector<long long>(n));
    for (int i = 0; i < n; i++) r[i][i] = 1;
    while (e) {
        if (e & 1) r = mul(r, a);
        a = mul(a, a);
        e >>= 1;
    }
    return r;
}
```

### 复杂度

时间复杂度 $O(n^3\log k)$，空间复杂度 $O(n^2)$。

---

## 7. [Graph Paths II](https://cses.fi/problemset/task/1724)
`最短路` `最小加法乘法` `矩阵快速幂`

### 题意

给定带权有向图，求从点 $1$ 到点 $n$ 恰好经过 $k$ 条边的最短路；若不存在则输出 $-1$。

### 分析

把普通矩阵乘法里的“加法与乘法”换成“取最小与加法”，就得到 min-plus 矩阵乘法。若 $A$ 记录一步转移的边权，$A^k$ 在这个半环里的结果就表示恰走 $k$ 步的最短路。思路和上一题完全同构，只是运算规则改了。

### 核心代码

```cpp
const long long INF = (1LL << 62);
using Mat = vector<vector<long long>>;

Mat mul(const Mat& a, const Mat& b) {
    int n = a.size();
    Mat c(n, vector<long long>(n, INF));
    for (int i = 0; i < n; i++)
        for (int k = 0; k < n; k++) if (a[i][k] < INF)
            for (int j = 0; j < n; j++) if (b[k][j] < INF)
                c[i][j] = min(c[i][j], a[i][k] + b[k][j]);
    return c;
}

Mat mpow(Mat a, long long e) {
    int n = a.size();
    Mat r(n, vector<long long>(n, INF));
    for (int i = 0; i < n; i++) r[i][i] = 0;
    while (e) {
        if (e & 1) r = mul(r, a);
        a = mul(a, a);
        e >>= 1;
    }
    return r;
}
```

### 复杂度

时间复杂度 $O(n^3\log k)$，空间复杂度 $O(n^2)$。

# 二、约数计数、筛法与乘法性函数

这一章最常见的动作不是“枚举答案”，而是“按约数或质因子倒推贡献”。一旦把对象改写成整除关系，很多看似全局的问题都会落成调和级数、容斥或反演。

## 8. [Counting Divisors](https://cses.fi/problemset/task/1713)
`质因数分解` `约数函数` `筛法`

### 题意

对每个给定的 $x\le 10^6$，输出它的约数个数。

### 分析

若 $x=\prod p_i^{e_i}$，则约数个数是 $\prod (e_i+1)$。因为所有查询里的 $x$ 都不大，先筛出最小质因子，再用它快速分解每个数即可；这样就把“逐个试除到 $\sqrt x$”变成了顺着分解链跳。

### 核心代码

```cpp
const int A = 1000000;
vector<int> spf(A + 1);

void build_spf() {
    for (int i = 2; i <= A; i++) if (!spf[i])
        for (int j = i; j <= A; j += i) if (!spf[j]) spf[j] = i;
}

int tau(int x) {
    int ans = 1;
    while (x > 1) {
        int p = spf[x], e = 0;
        while (x % p == 0) x /= p, e++;
        ans *= e + 1;
    }
    return ans;
}
```

### 复杂度

预处理时间复杂度 $O(A\log\log A)$，单次查询时间复杂度 $O(\log x)$，空间复杂度 $O(A)$。

---

## 9. [Common Divisors](https://cses.fi/problemset/task/1081)
`倍数统计` `筛法` `最大公约数`

### 题意

给定数组，找出某一对数的最大可能 $\gcd$。

### 分析

与其枚举两两配对，不如反过来枚举公约数 $d$：如果数组里至少有两个数是 $d$ 的倍数，那么就能找到一对数的 gcd 至少是 $d$。于是从大到小扫 $d$，统计有多少个元素落在它的倍数链上，第一次满足计数至少为 $2$ 的 $d$ 就是答案。

### 核心代码

```cpp
const int A = 1000000;
vector<int> freq(A + 1);

int solve() {
    for (int d = A; d >= 1; d--) {
        int cnt = 0;
        for (int x = d; x <= A; x += d) cnt += freq[x];
        if (cnt >= 2) return d;
    }
    return 1;
}
```

### 复杂度

时间复杂度 $O(A\log A)$，空间复杂度 $O(A)$。

---

## 10. [Sum of Divisors](https://cses.fi/problemset/task/1082)
`整除分块` `调和级数` `约数贡献`

### 题意

求 $\sum_{i=1}^{n}\sigma(i) \bmod (10^9+7)$，其中 $n$ 可达 $10^{12}$。

### 分析

把求和顺序交换：每个正整数 $d$ 会作为约数贡献给所有 $d$ 的倍数，所以
$\sum_{i=1}^{n}\sigma(i)=\sum_{d=1}^{n} d\left\lfloor\frac{n}{d}\right\rfloor$。
关键是同一个商 $\left\lfloor\frac{n}{d}\right\rfloor$ 会在一整段区间内保持不变，于是可以整除分块，把一段连续的 $d$ 用等差数列求和一次算掉。

### 核心代码

```cpp
const long long MOD = 1000000007;
const long long INV2 = (MOD + 1) / 2;

long long pref(long long x) {
    x %= MOD;
    return x * ((x + 1) % MOD) % MOD * INV2 % MOD;
}

long long solve(long long n) {
    long long ans = 0;
    for (long long l = 1, r; l <= n; l = r + 1) {
        long long q = n / l;
        r = n / q;
        long long seg = (pref(r) - pref(l - 1) + MOD) % MOD;
        ans = (ans + (q % MOD) * seg) % MOD;
    }
    return ans;
}
```

### 复杂度

时间复杂度 $O(\sqrt n)$，空间复杂度 $O(1)$。

---

## 11. [Divisor Analysis](https://cses.fi/problemset/task/2182)
`乘法性函数` `等比数列` `指数运算`

### 题意

输入一个整数的质因数分解，要求输出它的约数个数、约数和、约数积，结果都对 $10^9+7$ 取模。

### 分析

若 $N=\prod p_i^{a_i}$，则约数个数是 $\prod(a_i+1)$，约数和是 $\prod\frac{p_i^{a_i+1}-1}{p_i-1}$。约数积可以理解成“所有旧约数都要和新质因子的每个幂次配对一次”，因此可在读入分解时迭代维护：旧结果整体被提升到 $a_i+1$ 次方，再补上新质因子的指数贡献。

### 核心代码

```cpp
const long long MOD = 1000000007;

long long mod_pow(long long a, long long b) {
    long long r = 1;
    while (b) {
        if (b & 1) r = r * a % MOD;
        a = a * a % MOD;
        b >>= 1;
    }
    return r;
}

long long mod_inv(long long x) { return mod_pow(x, MOD - 2); }

void push_factor(long long p, long long a, long long& cnt, long long& sum, long long& prod, long long& dc) {
    cnt = cnt * (a + 1) % MOD;
    long long geo = (mod_pow(p, a + 1) - 1 + MOD) % MOD * mod_inv(p - 1) % MOD;
    sum = sum * geo % MOD;
    long long add = a * (a + 1) / 2 % (MOD - 1);
    prod = mod_pow(prod, a + 1) * mod_pow(mod_pow(p, add), dc) % MOD;
    dc = dc * (a + 1) % (MOD - 1);
}
```

### 复杂度

时间复杂度 $O(n\log MOD)$，空间复杂度 $O(1)$。

---

## 12. [Prime Multiples](https://cses.fi/problemset/task/2185)
`容斥原理` `子集枚举` `整除`

### 题意

给定 $k\le 20$ 个不同质数和整数 $n$，统计 $1\sim n$ 中至少被其中一个质数整除的数有多少个。

### 分析

这是典型容斥：单个集合加上，两个集合交集减掉，三个集合交集再加回来。因为 $k$ 很小，可以直接枚举质数子集；对子集的交集，贡献就是 $\left\lfloor\frac{n}{\prod p_i}\right\rfloor$。唯一要注意的是乘积可能溢出，所以一旦乘积已经超过 $n$ 就可以提前停止。

### 核心代码

```cpp
long long solve(long long n, const vector<long long>& p) {
    int k = p.size();
    long long ans = 0;
    for (int mask = 1; mask < (1 << k); mask++) {
        __int128 mul = 1;
        int bits = 0;
        for (int i = 0; i < k; i++) if (mask >> i & 1) {
            bits++;
            if (mul > n / p[i]) { mul = n + 1; break; }
            mul *= p[i];
        }
        if (mul > n) continue;
        long long add = n / (long long)mul;
        ans += (bits & 1) ? add : -add;
    }
    return ans;
}
```

### 复杂度

时间复杂度 $O(2^k\cdot k)$，空间复杂度 $O(1)$。

---

## 13. [Counting Coprime Pairs](https://cses.fi/problemset/task/2417)
`莫比乌斯反演` `倍数计数` `筛法`

### 题意

给定数组，统计其中 gcd 为 $1$ 的数对数量。

### 分析

先记 $c_d$ 为数组中能被 $d$ 整除的元素个数，那么 gcd 是 $d$ 的数对数量和 $\binom{c_d}{2}$ 有天然关系。把“gcd 恰好等于 $1$”翻成反演式，就得到
$\sum_{d\ge 1}\mu(d)\binom{c_d}{2}$。因此问题分成两步：筛出莫比乌斯函数 $\mu$，再统计每个 $d$ 的倍数个数。

### 核心代码

```cpp
const int A = 1000000;
vector<int> mu(A + 1), lp(A + 1), prime;

void build_mu() {
    mu[1] = 1;
    for (int i = 2; i <= A; i++) {
        if (!lp[i]) lp[i] = i, prime.push_back(i), mu[i] = -1;
        for (int p : prime) {
            if (1LL * i * p > A) break;
            lp[i * p] = p;
            if (i % p == 0) { mu[i * p] = 0; break; }
            mu[i * p] = -mu[i];
        }
    }
}

long long solve(const vector<int>& freq) {
    long long ans = 0;
    for (int d = 1; d <= A; d++) {
        long long c = 0;
        for (int x = d; x <= A; x += d) c += freq[x];
        ans += 1LL * mu[d] * c * (c - 1) / 2;
    }
    return ans;
}
```

### 复杂度

预处理时间复杂度 $O(A)$，统计时间复杂度 $O(A\log A)$，空间复杂度 $O(A)$。

---

## 14. [Next Prime](https://cses.fi/problemset/task/3396)
`素性测试` `大整数` `构造`

### 题意

对每个 $n\le 10^{12}$，求严格大于 $n$ 的最小质数。

### 分析

答案与 $n$ 的距离通常不大，所以外层只需向上试探候选值；真正要快的是判质数。对 $10^{12}$ 量级，使用确定性的 Miller–Rabin 足够稳定：先剥掉 $n-1$ 里的 $2$ 的幂，再检验若干固定底数即可。

### 核心代码

```cpp
using u128 = __uint128_t;

long long mul_mod(long long a, long long b, long long mod) {
    return (u128)a * b % mod;
}

long long pow_mod(long long a, long long e, long long mod) {
    long long r = 1 % mod;
    while (e) {
        if (e & 1) r = mul_mod(r, a, mod);
        a = mul_mod(a, a, mod);
        e >>= 1;
    }
    return r;
}

bool is_prime(long long n) {
    if (n < 2) return false;
    for (long long p : {2,3,5,7,11,13,17,19,23,29,31,37})
        if (n % p == 0) return n == p;
    long long d = n - 1, s = 0;
    while ((d & 1) == 0) d >>= 1, s++;
    for (long long a : {2,3,5,7,11,13}) {
        if (a >= n) continue;
        long long x = pow_mod(a, d, n);
        if (x == 1 || x == n - 1) continue;
        bool ok = false;
        for (int r = 1; r < s; r++) {
            x = mul_mod(x, x, n);
            if (x == n - 1) { ok = true; break; }
        }
        if (!ok) return false;
    }
    return true;
}

long long next_prime(long long n) {
    if (n <= 1) return 2;
    for (long long x = n + 1 + (n & 1); ; x += 2)
        if (is_prime(x)) return x;
}
```

### 复杂度

单次候选检测时间复杂度 $O(\log n)$，空间复杂度 $O(1)$。

# 三、阶乘预处理、Catalan 公式与排列编码

这一章更像“组合式翻译”。题目表面讲字符串、礼物、括号或排列，本质上都在问：能否把对象精确改写成某个二项式、错排式、Catalan 数或者字典序编码。

## 15. [Binomial Coefficients](https://cses.fi/problemset/task/1079)
`组合数` `阶乘` `逆元`

### 题意

多次询问 $\binom{a}{b} \bmod (10^9+7)$，其中 $a\le 10^6$。

### 分析

模数是质数，可以把组合数写成
$\binom{a}{b}=a!\,(b!)^{-1}\,((a-b)!)^{-1}$。
因此只要一次性预处理到最大 $a$ 的阶乘和逆阶乘，后续每个询问就是三个数组值相乘。

### 核心代码

```cpp
const int A = 1000000;
const long long MOD = 1000000007;
vector<long long> fact(A + 1), invfact(A + 1);

long long mod_pow(long long a, long long b) {
    long long r = 1;
    while (b) {
        if (b & 1) r = r * a % MOD;
        a = a * a % MOD;
        b >>= 1;
    }
    return r;
}

void build() {
    fact[0] = 1;
    for (int i = 1; i <= A; i++) fact[i] = fact[i - 1] * i % MOD;
    invfact[A] = mod_pow(fact[A], MOD - 2);
    for (int i = A; i >= 1; i--) invfact[i - 1] = invfact[i] * i % MOD;
}

long long C(int n, int k) {
    if (k < 0 || k > n) return 0;
    return fact[n] * invfact[k] % MOD * invfact[n - k] % MOD;
}
```

### 复杂度

预处理时间复杂度 $O(A)$，单次查询时间复杂度 $O(1)$，空间复杂度 $O(A)$。

---

## 16. [Creating Strings II](https://cses.fi/problemset/task/1715)
`多重集排列` `组合计数` `逆元`

### 题意

给定一个只含小写字母的字符串，求用这些字符能组成多少个不同字符串，答案模 $10^9+7$。

### 分析

如果所有字符都不同，答案是 $n!$；重复字符会把相同排列重复计算。设每个字母出现次数为 $c_i$，那么不同排列数量就是
$\dfrac{n!}{\prod c_i!}$，直接用上一题的阶乘与逆阶乘即可。

### 核心代码

```cpp
long long solve(const string& s) {
    vector<int> cnt(26);
    for (char ch : s) cnt[ch - 'a']++;
    long long ans = fact[s.size()];
    for (int c : cnt) ans = ans * invfact[c] % MOD;
    return ans;
}
```

### 复杂度

时间复杂度 $O(n+\Sigma)$，空间复杂度 $O(\Sigma)$，其中 $\Sigma=26$。

---

## 17. [Distributing Apples](https://cses.fi/problemset/task/1716)
`隔板法` `组合数` `经典模型`

### 题意

有 $n$ 个孩子和 $m$ 个相同的苹果，问分配方案数，允许某些孩子得到 $0$ 个苹果。

### 分析

把 $m$ 个苹果排成一行，再插入 $n-1$ 块隔板，等价于从 $n+m-1$ 个位置里挑出 $m$ 个苹果位置，或挑出 $n-1$ 个隔板位置。于是答案是
$\binom{n+m-1}{m}$。

### 核心代码

```cpp
long long solve(int n, int m) {
    return C(n + m - 1, m);
}
```

### 复杂度

预处理后单次查询时间复杂度 $O(1)$，空间复杂度 $O(1)$。

---

## 18. [Christmas Party](https://cses.fi/problemset/task/1717)
`错排` `递推` `组合计数`

### 题意

$n$ 个孩子各自带来一份礼物，要求每个人都拿到别人带来的礼物，求方案数。

### 分析

这正是错排数 $D_n$。盯住编号 $1$ 的孩子：他把礼物交给某个孩子 $x$ 后，只会出现“$x$ 再把礼物还给 $1$”和“$x$ 不还给 $1$”两种结构，分别对应 $D_{n-2}$ 与 $D_{n-1}$，所以
$D_n=(n-1)(D_{n-1}+D_{n-2})$。

### 核心代码

```cpp
const long long MOD = 1000000007;
vector<long long> der(A + 1);

void build_der(int n) {
    der[1] = 0;
    if (n >= 2) der[2] = 1;
    for (int i = 3; i <= n; i++)
        der[i] = (i - 1) * (der[i - 1] + der[i - 2]) % MOD;
}
```

### 复杂度

时间复杂度 $O(n)$，空间复杂度 $O(n)$。

---

## 19. [Permutation Order](https://cses.fi/problemset/task/3397)
`字典序` `康托展开` `树状数组`

### 题意

有两类查询：给定 $(n,k)$ 求第 $k$ 个字典序排列；或给定一个排列，求它在字典序中的排名。

### 分析

字典序的本质是“当前位之前还有多少可选数比它小”。这正是阶乘数位系统：第一个位置每跳过一种开头，就整块跨过 $(n-1)!$ 个排列。用树状数组维护尚未使用的数，就能同时支持按序号找第 $k$ 小元素和统计某个值前面还剩几个数。

### 核心代码

```cpp
struct BIT {
    vector<int> t;
    BIT(int n) : t(n + 1) {}
    void add(int i, int v) { for (; i < (int)t.size(); i += i & -i) t[i] += v; }
    int sum(int i) const { int r = 0; for (; i; i -= i & -i) r += t[i]; return r; }
    int kth(int k) const {
        int x = 0;
        for (int b = 1 << 20; b; b >>= 1) {
            int y = x + b;
            if (y < (int)t.size() && t[y] < k) k -= t[y], x = y;
        }
        return x + 1;
    }
};

vector<long long> fac(21, 1);

vector<int> unrank(int n, long long k) {
    BIT bit(n);
    for (int i = 1; i <= n; i++) bit.add(i, 1);
    vector<int> p;
    k--;
    for (int len = n; len >= 1; len--) {
        long long block = fac[len - 1];
        int ord = k / block + 1;
        int x = bit.kth(ord);
        p.push_back(x);
        bit.add(x, -1);
        k %= block;
    }
    return p;
}

long long rank_of(const vector<int>& p) {
    int n = p.size();
    BIT bit(n);
    for (int i = 1; i <= n; i++) bit.add(i, 1);
    long long ans = 1;
    for (int i = 0; i < n; i++) {
        ans += 1LL * (bit.sum(p[i]) - 1) * fac[n - 1 - i];
        bit.add(p[i], -1);
    }
    return ans;
}
```

### 复杂度

单次查询时间复杂度 $O(n\log n)$，空间复杂度 $O(n)$。

---

## 20. [Permutation Rounds](https://cses.fi/problemset/task/3398)
`置换环` `最小公倍数` `质因数分解`

### 题意

一个排列反复作用在数组位置上，问经过多少轮后数组第一次回到初始有序状态，答案对 $10^9+7$ 取模。

### 分析

置换的每个环独立转动，长度为 $\ell$ 的环需要恰好 $\ell$ 轮才会复原，因此整体答案就是所有环长的最小公倍数。因为直接求 lcm 可能爆掉，要把每个环长分解质因子，记录每个质数出现的最大指数，最后再把这些最高幂乘起来。

### 核心代码

```cpp
const long long MOD = 1000000007;

long long solve(const vector<int>& p) {
    int n = (int)p.size() - 1;
    vector<int> spf(n + 1), vis(n + 1), mx(n + 1);
    for (int i = 2; i <= n; i++) if (!spf[i])
        for (int j = i; j <= n; j += i) if (!spf[j]) spf[j] = i;
    for (int i = 1; i <= n; i++) if (!vis[i]) {
        int u = i, len = 0;
        while (!vis[u]) vis[u] = 1, u = p[u], len++;
        while (len > 1) {
            int q = spf[len], e = 0;
            while (len % q == 0) len /= q, e++;
            mx[q] = max(mx[q], e);
        }
    }
    long long ans = 1;
    for (int q = 2; q <= n; q++) while (mx[q]--) ans = ans * q % MOD;
    return ans;
}
```

### 复杂度

时间复杂度 $O(n\log\log n)$，空间复杂度 $O(n)$。

---

## 21. [Bracket Sequences I](https://cses.fi/problemset/task/2064)
`Catalan 数` `合法括号` `组合数`

### 题意

求长度为 $n$ 的合法括号序列个数，答案模 $10^9+7$。

### 分析

若 $n$ 为奇数，显然无解。令 $n=2m$，合法括号序列数量就是第 $m$ 个 Catalan 数：
$C_m=\dfrac{1}{m+1}\binom{2m}{m}$。它本质上是在所有 $m$ 个左括号、$m$ 个右括号的排列里，剔除前缀中某处右括号过多的坏路径。

### 核心代码

```cpp
long long solve(int n) {
    if (n & 1) return 0;
    int m = n / 2;
    return C(2 * m, m) * mod_pow(m + 1, MOD - 2) % MOD;
}
```

### 复杂度

预处理后单次查询时间复杂度 $O(1)$，空间复杂度 $O(1)$。

---

## 22. [Bracket Sequences II](https://cses.fi/problemset/task/2187)
`Catalan 数` `反射原理` `前缀约束`

### 题意

给定总长度 $n$ 和一个已经确定的前缀，求能补成多少个合法括号序列，答案模 $10^9+7$。

### 分析

先扫描前缀：只要某一步平衡值变成负数，或者左括号数量已经超过 $n/2$，答案立刻是 $0$。设当前平衡为 $h$，还需要补 $x$ 个左括号、$y$ 个右括号，其中 $y=x+h$。忽略前缀约束时共有 $\binom{x+y}{x}$ 种补法，再用反射原理减掉那些途中跌到负值以下的坏序列，得到
$\binom{r}{x}-\binom{r}{x+h+1}$。

### 核心代码

```cpp
long long solve(int n, const string& s) {
    if (n & 1) return 0;
    int bal = 0, open = 0;
    for (char ch : s) {
        bal += (ch == '(' ? 1 : -1);
        open += (ch == '(');
        if (bal < 0) return 0;
    }
    int half = n / 2;
    if (open > half || bal > half) return 0;
    int x = half - open;
    int r = n - (int)s.size();
    return (C(r, x) - C(r, x + bal + 1) + MOD) % MOD;
}
```

### 复杂度

预处理后单次查询时间复杂度 $O(|s|)$，空间复杂度 $O(1)$。

# 四、对称计数、模域线性代数与结构性构造

这一章依靠的不是单纯公式，而是“先认结构，再写算法”。有的题把旋转看成群作用，有的题把方程组看成模域上的消元，有的题直接调用表示定理，把存在性结论变成构造过程。

## 23. [Counting Necklaces](https://cses.fi/problemset/task/2209)
`Burnside 引理` `循环群` `对称计数`

### 题意

长度为 $n$ 的项链，每个位置可选 $m$ 种颜色，旋转后相同的视为同一种，求不同项链数量。

### 分析

旋转 $i$ 格后不变的染色数，取决于这次旋转把位置分成了多少个环，其数量正是 $\gcd(i,n)$，因此固定染色数为 $m^{\gcd(i,n)}$。对所有旋转求平均，直接得到 Burnside 公式：
$\dfrac{1}{n}\sum_{i=0}^{n-1} m^{\gcd(i,n)}$。把相同 gcd 的项合并，还能改写成按约数枚举的形式。

### 核心代码

```cpp
const long long MOD = 1000000007;

long long phi(long long x) {
    long long r = x;
    for (long long p = 2; p * p <= x; p++) if (x % p == 0) {
        while (x % p == 0) x /= p;
        r = r / p * (p - 1);
    }
    if (x > 1) r = r / x * (x - 1);
    return r;
}

long long solve(long long n, long long m) {
    long long ans = 0;
    for (long long d = 1; d * d <= n; d++) if (n % d == 0) {
        ans = (ans + phi(d) % MOD * mod_pow(m, n / d)) % MOD;
        if (d * d != n) ans = (ans + phi(n / d) % MOD * mod_pow(m, d)) % MOD;
    }
    return ans * mod_pow(n, MOD - 2) % MOD;
}
```

### 复杂度

时间复杂度 $O(\sqrt n\log MOD)$，空间复杂度 $O(1)$。

---

## 24. [Counting Grids](https://cses.fi/problemset/task/2210)
`Burnside 引理` `方阵旋转` `轨道计数`

### 题意

统计 $n\times n$ 黑白网格在旋转意义下的不同方案数。

### 分析

旋转群只有四个元素：$0^\circ,90^\circ,180^\circ,270^\circ$。恒等旋转固定全部 $2^{n^2}$ 个网格；$180^\circ$ 旋转把格子按成对位置捆在一起，固定数是 $2^{\lceil n^2/2\rceil}$；$90^\circ$ 与 $270^\circ$ 都把格子压成长度为 $4$ 的轨道，固定数是 $2^{\lceil n^2/4\rceil}$。按 Burnside 取平均即可。

### 核心代码

```cpp
const long long MOD = 1000000007;
const long long INV4 = 250000002;

long long solve(long long n) {
    long long a = n * n;
    long long fix0 = mod_pow(2, a);
    long long fix2 = mod_pow(2, (a + 1) / 2);
    long long fix1 = mod_pow(2, (a + 3) / 4);
    return (fix0 + fix2 + 2 * fix1) % MOD * INV4 % MOD;
}
```

### 复杂度

时间复杂度 $O(\log n)$，空间复杂度 $O(1)$。

---

## 25. [System of Linear Equations](https://cses.fi/problemset/task/3154)
`高斯消元` `有限域` `线性代数`

### 题意

给定模 $10^9+7$ 意义下的线性方程组，要求输出任意一组解；若无解则输出 $-1$。

### 分析

模数是质数，所以所有非零系数都有逆元，这就允许在有限域里做和实数域几乎一样的高斯消元。逐列选主元、把主元行归一化，再消掉这一列的其他元素；消元完成后，只要出现“左边全零、右边非零”的行，就是无解。自由变量可以直接赋成 $0$。

### 核心代码

```cpp
const long long MOD = 1000000007;

vector<long long> gauss(vector<vector<long long>> a, int n, int m) {
    int row = 0;
    vector<int> where(m, -1);
    for (int col = 0; col < m && row < n; col++) {
        int sel = row;
        while (sel < n && a[sel][col] == 0) sel++;
        if (sel == n) continue;
        swap(a[sel], a[row]);
        where[col] = row;
        long long inv = mod_pow(a[row][col], MOD - 2);
        for (int j = col; j <= m; j++) a[row][j] = a[row][j] * inv % MOD;
        for (int i = 0; i < n; i++) if (i != row && a[i][col]) {
            long long f = a[i][col];
            for (int j = col; j <= m; j++) {
                a[i][j] = (a[i][j] - f * a[row][j]) % MOD;
                if (a[i][j] < 0) a[i][j] += MOD;
            }
        }
        row++;
    }
    for (int i = 0; i < n; i++) {
        bool all0 = true;
        for (int j = 0; j < m; j++) all0 &= (a[i][j] == 0);
        if (all0 && a[i][m]) return {};
    }
    vector<long long> x(m);
    for (int j = 0; j < m; j++) if (where[j] != -1) x[j] = a[where[j]][m];
    return x;
}
```

### 复杂度

时间复杂度 $O(nm\min(n,m))$，空间复杂度 $O(nm)$。

---

## 26. [Sum of Four Squares](https://cses.fi/problemset/task/3355)
`平方和` `构造` `预处理`

### 题意

对每个非负整数 $n$，构造四个非负整数 $a,b,c,d$，使得 $n=a^2+b^2+c^2+d^2$。

### 分析

题面已经给出了“四平方和表示总存在”。算法上不必暴力四重枚举：先把所有不超过最大值的“两平方和”预处理出来，记下任意一组表示；之后对每个询问只枚举前两个平方，剩余值若也是两平方和，就立刻拼成答案。因为所有测试里的 $n$ 总和受控，这种预处理加查表非常稳。

### 核心代码

```cpp
int M;
vector<pair<short, short>> two;

void build_two_square(int lim) {
    M = lim;
    two.assign(M + 1, {-1, -1});
    for (int a = 0; 1LL * a * a <= M; a++)
        for (int b = 0; 1LL * a * a + 1LL * b * b <= M; b++) {
            int s = a * a + b * b;
            if (two[s].first == -1) two[s] = {(short)a, (short)b};
        }
}

array<int, 4> solve(int n) {
    for (int a = 0; 1LL * a * a <= n; a++)
        for (int b = 0; 1LL * a * a + 1LL * b * b <= n; b++) {
            int rem = n - a * a - b * b;
            if (two[rem].first != -1) {
                auto [c, d] = two[rem];
                return {a, b, c, d};
            }
        }
    return {0, 0, 0, 0};
}
```

### 复杂度

设 $M=\max n$，预处理时间复杂度 $O(M)$，全部询问总时间复杂度 $O(M)$，空间复杂度 $O(M)$。

---

## 27. [Triangle Number Sums](https://cses.fi/problemset/task/3406)
`三角数` `判定` `构造性定理`

### 题意

给定正整数 $n$，求最少需要多少个三角数之和才能表示它。

### 分析

题面已经说明任意正整数都能表示成若干三角数之和，而经典结论告诉我们上界其实是 $3$。因此答案只可能是 $1,2,3$：先判 $n$ 本身是否为三角数，再枚举一个三角数 $T_k$，检查 $n-T_k$ 是否仍为三角数；若都不行，答案就是 $3$。三角数判定可转成 $8x+1$ 是否为完全平方数。

### 核心代码

```cpp
bool is_square(long long x) {
    long long r = sqrtl((long double)x);
    while (r * r < x) r++;
    while (r * r > x) r--;
    return r * r == x;
}

bool is_tri(long long x) {
    return is_square(8 * x + 1);
}

int solve(long long n) {
    if (is_tri(n)) return 1;
    for (long long k = 1;; k++) {
        long long t = k * (k + 1) / 2;
        if (t > n) break;
        if (is_tri(n - t)) return 2;
    }
    return 3;
}
```

### 复杂度

时间复杂度 $O(\sqrt n)$，空间复杂度 $O(1)$。

# 五、概率分布、线性期望与随机过程

这几题都不该靠模拟。真正稳的做法，是把随机变量拆成“每个和值的概率”“每个格子为空的概率”或“每对位置形成逆序的概率”，然后直接在线性空间里求和。

## 28. [Dice Probability](https://cses.fi/problemset/task/1725)
`概率 DP` `分布卷积` `随机过程`

### 题意

掷 $n$ 次六面骰子，求点数和落在区间 $[a,b]$ 内的概率。

### 分析

设 $dp[i][s]$ 为掷完前 $i$ 次后和为 $s$ 的概率，则下一层只会从 $s-1\sim s-6$ 转移而来，每条边概率都是 $1/6$。因为 $n\le 100$，总状态规模只有 $600$ 左右，直接做分布 DP 即可，最后把区间内的概率加总。

### 核心代码

```cpp
double solve(int n, int a, int b) {
    vector<vector<double>> dp(n + 1, vector<double>(6 * n + 1));
    dp[0][0] = 1.0;
    for (int i = 1; i <= n; i++)
        for (int s = 0; s <= 6 * (i - 1); s++) if (dp[i - 1][s] > 0)
            for (int d = 1; d <= 6; d++)
                dp[i][s + d] += dp[i - 1][s] / 6.0;
    double ans = 0;
    for (int s = a; s <= b; s++) ans += dp[n][s];
    return ans;
}
```

### 复杂度

时间复杂度 $O(6n^2)$，空间复杂度 $O(n^2)$。

---

## 29. [Moving Robots](https://cses.fi/problemset/task/1726)
`期望` `马尔可夫链` `独立性`

### 题意

$8\times 8$ 棋盘每个格子初始各有一个机器人，每个机器人独立随机走 $k$ 步，问最终空格子的期望数量。

### 分析

直接跟踪 $64$ 个机器人的联合分布会爆炸，但“某个格子最终是否为空”可以独立拆开。对每个起点单独做一次 $k$ 步转移，得到这个机器人落在每个格子的概率；若某格子被该机器人占据的概率为 $p$，则它不占据该格子的概率是 $1-p$。不同机器人独立，所以该格子最终为空的概率是这些 $(1-p)$ 的乘积，再对 $64$ 个格子求和就是期望。

### 核心代码

```cpp
double solve(int k) {
    vector<vector<int>> adj(64);
    for (int x = 0; x < 8; x++) for (int y = 0; y < 8; y++) {
        int v = x * 8 + y;
        for (auto [dx, dy] : vector<pair<int,int>>{{1,0},{-1,0},{0,1},{0,-1}}) {
            int nx = x + dx, ny = y + dy;
            if (0 <= nx && nx < 8 && 0 <= ny && ny < 8) adj[v].push_back(nx * 8 + ny);
        }
    }
    vector<double> empty(64, 1.0);
    for (int s = 0; s < 64; s++) {
        vector<double> cur(64), nxt(64);
        cur[s] = 1.0;
        for (int step = 0; step < k; step++) {
            fill(nxt.begin(), nxt.end(), 0.0);
            for (int v = 0; v < 64; v++) if (cur[v] > 0)
                for (int u : adj[v]) nxt[u] += cur[v] / adj[v].size();
            swap(cur, nxt);
        }
        for (int v = 0; v < 64; v++) empty[v] *= 1.0 - cur[v];
    }
    return accumulate(empty.begin(), empty.end(), 0.0);
}
```

### 复杂度

时间复杂度 $O(64^2k)$，空间复杂度 $O(64)$。

---

## 30. [Candy Lottery](https://cses.fi/problemset/task/1727)
`期望` `分布函数` `最大值`

### 题意

有 $n$ 个孩子，各自独立且均匀地拿到 $1\sim k$ 之间的糖果数，求最大值的期望。

### 分析

设随机变量 $M$ 是最大值，则
$\Pr(M\le x)=\left(\frac{x}{k}\right)^n$，
因为每个孩子都要不超过 $x$。于是可以用分布函数直接求期望：
$\mathbb E[M]=\sum_{x=1}^{k}\Pr(M\ge x)$，
而 $\Pr(M\ge x)=1-\left(\frac{x-1}{k}\right)^n$。整题只剩一个长度为 $k$ 的求和。

### 核心代码

```cpp
double solve(int n, int k) {
    double ans = 0.0;
    for (int x = 1; x <= k; x++)
        ans += 1.0 - pow(1.0 * (x - 1) / k, n);
    return ans;
}
```

### 复杂度

时间复杂度 $O(k)$，空间复杂度 $O(1)$。

---

## 31. [Inversion Probability](https://cses.fi/problemset/task/1728)
`线性期望` `枚举对数` `概率`

### 题意

数组第 $i$ 个位置的值独立均匀分布在 $1\sim r_i$，求逆序对数量的期望。

### 分析

把总逆序对数写成所有二元组指示变量之和，再用期望的线性性拆开。对一对 $(i,j)$，只需求
$\Pr(x_i>x_j)=\dfrac{1}{r_ir_j}\sum_{x=1}^{r_i}\min(r_j,x-1)$。
因为 $r_i\le 100$，这个双层求和直接算就足够快。

### 核心代码

```cpp
double solve(const vector<int>& r) {
    int n = r.size();
    double ans = 0.0;
    for (int i = 0; i < n; i++)
        for (int j = i + 1; j < n; j++) {
            double p = 0.0;
            for (int x = 1; x <= r[i]; x++)
                p += min(r[j], x - 1) / double(r[i] * r[j]);
            ans += p;
        }
    return ans;
}
```

### 复杂度

时间复杂度 $O(n^2\cdot \max r_i)$，空间复杂度 $O(1)$。

# 六、博弈状态、异或不变量与 Grundy 视角

这一章的读法最讲究“把操作改写成局面值”。有的题用必胜必败 DP 就够，有的题会直接掉进 Nim 异或，有的题则要先认出每堆石子的 Grundy 值再求和。

## 32. [Stick Game](https://cses.fi/problemset/task/1729)
`博弈 DP` `必胜态` `状态转移`

### 题意

有一堆木棍，允许移走的数量属于给定集合 $P$。对每个 $1\sim n$，判断先手是必胜还是必败。

### 分析

设 $win[i]$ 表示剩下 $i$ 根时先手能否取胜。若存在某个可行步长 $p\in P$ 使得 $win[i-p]=0$，那么当前就能一步走到对手的必败态，因此 $win[i]=1$；否则当前是必败态。题目要整段前缀答案，这种一维 DP 正好顺推。

### 核心代码

```cpp
string solve(int n, const vector<int>& p) {
    vector<char> win(n + 1);
    string ans;
    for (int i = 1; i <= n; i++) {
        for (int x : p) if (x <= i && !win[i - x]) win[i] = 1;
        ans += win[i] ? 'W' : 'L';
    }
    return ans;
}
```

### 复杂度

时间复杂度 $O(nk)$，空间复杂度 $O(n)$。

---

## 33. [Nim Game I](https://cses.fi/problemset/task/1730)
`Nim` `异或` `经典博弈`

### 题意

有若干堆石子，每次可以从任意一堆拿任意正数个，最后拿完者获胜，判断先后手胜负。

### 分析

这是标准 Nim。每堆石子的 Grundy 值就是它本身，整局游戏的值是所有堆大小的异或和；异或和非零则先手必胜，异或和为零则后手必胜。题目虽然有多组测试，但每组只需线性扫一遍。

### 核心代码

```cpp
string solve(const vector<int>& a) {
    int xr = 0;
    for (int x : a) xr ^= x;
    return xr ? "first" : "second";
}
```

### 复杂度

时间复杂度 $O(n)$，空间复杂度 $O(1)$。

---

## 34. [Nim Game II](https://cses.fi/problemset/task/1098)
`Nim` `Grundy 值` `取模规律`

### 题意

和普通 Nim 类似，但每次只能从一堆里拿走 $1,2,3$ 根，判断先后手胜负。

### 分析

单堆的可走步只有三种，于是 Grundy 值按 mex 递推会出现长度为 $4$ 的循环：$g(x)=x\bmod 4$。整局仍然把每堆 Grundy 值异或起来，异或和非零则先手赢。这一题的关键不是重学 Nim，而是先把“有限步长单堆游戏”压成一个短周期公式。

### 核心代码

```cpp
string solve(const vector<int>& a) {
    int xr = 0;
    for (int x : a) xr ^= (x % 4);
    return xr ? "first" : "second";
}
```

### 复杂度

时间复杂度 $O(n)$，空间复杂度 $O(1)$。

---

## 35. [Stair Game](https://cses.fi/problemset/task/1099)
`博弈拆分` `异或` `位置奇偶`

### 题意

楼梯第 $k$ 层上的球可以移动到第 $k-1$ 层，最后能行动者获胜，判断每组初始局面谁赢。

### 分析

把楼梯按相邻两层成对看：第 $2$ 层的球只能向第 $1$ 层倒，第 $4$ 层的球只能向第 $3$ 层倒，彼此互不干扰。最终真正像 Nim 堆一样独立贡献局面值的，是所有偶数层上的球数；奇数层只负责承接上一层的移动，不单独产生自由度。因此答案是所有偶数层球数的异或和是否为零。

### 核心代码

```cpp
string solve(const vector<int>& p) {
    int xr = 0;
    for (int i = 1; i < (int)p.size(); i += 2) xr ^= p[i];
    return xr ? "first" : "second";
}
```

### 复杂度

时间复杂度 $O(n)$，空间复杂度 $O(1)$。

---

## 36. [Grundy's Game](https://cses.fi/problemset/task/2207)
`Grundy` `拆堆博弈` `打表`

### 题意

有一堆硬币，每步必须把一堆拆成两个非空且大小不同的新堆，最后能操作者获胜，判断先后手胜负。

### 分析

这是一道标准的拆分型 impartial game，需要看每个堆大小的 Grundy 值。对小规模状态做 mex 递推后，可以得到全部必败态；这题在 $n\le 10^6$ 的范围内只需查一张很短的必败表，其他位置都能转移到其中某个必败态。实现层面只保留这张表即可。

### 核心代码

```cpp
static const vector<int> lose = {
    1,2,4,7,10,20,23,26,50,53,270,273,276,282,285,288,
    316,334,337,340,346,359,362,365,386,389,392,566,
    630,633,636,639,673,676,682,685,923,926,929,932,1222
};

string solve(int n) {
    return binary_search(lose.begin(), lose.end(), n) ? "second" : "first";
}
```

### 复杂度

单次查询时间复杂度 $O(\log 41)$，空间复杂度 $O(41)$。

---

## 37. [Another Game](https://cses.fi/problemset/task/2208)
`奇偶性` `镜像策略` `博弈`

### 题意

有若干堆硬币，每步可以选择任意一些非空堆，并从每一堆里各拿走一枚，最后拿完者获胜，判断先后手胜负。

### 分析

整题只看每堆的奇偶性。若所有堆都是偶数，后手始终可以模仿先手在同一批堆上再拿一次，把所有堆重新拉回偶数状态；若至少有一堆是奇数，先手可以先把所有奇数堆各拿一枚，瞬间把局面改造成“全偶”，把镜像权交给自己。因此答案等价于“是否存在奇数堆”。

### 核心代码

```cpp
string solve(const vector<long long>& a) {
    for (long long x : a) if (x & 1) return "first";
    return "second";
}
```

### 复杂度

时间复杂度 $O(n)$，空间复杂度 $O(1)$。
