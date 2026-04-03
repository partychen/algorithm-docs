---
title: "洛谷 组合数学专题精选解题报告"
subtitle: "🎲 从排列计数到卷积反演与经典组合模型"
order: 2
icon: "🎲"
---

# 洛谷 组合数学专题精选解题报告

这一组题从错排、Stirling 和 Lucas 一路走到 FFT/NTT、莫比乌斯反演与杜教筛，看起来像组合和数论混在一起，但共通点非常明确：都在把原计数问题改写成生成函数、卷积或积性函数上的代数操作。前半段偏公式识别，后半段更强调把恒等式落进模板。

# 一、错排、可见排列与组合计数

## 1. [P1595 信封问题](https://www.luogu.com.cn/problem/P1595)

`错排` `递推`

### 题意

给定 $n$ 封信和 $n$ 个信封，要求每封信都不能装进自己的信封，求这种“全错位”方案数。

### 分析

这是标准错排。设 $d_n$ 为前 $n$ 封信全部装错的方案数，考虑第 $1$ 封信被塞进哪个信封：任选一个目标信封后，有两种后续情况。

若那封信原本对应的信封恰好装第 $1$ 封信，就把这两个位置配成一对，剩下是 $d_{n-2}$；否则把第 $1$ 封信和被占用位置合并考虑，剩下是 $d_{n-1}$。于是得到 $d_n=(n-1)(d_{n-1}+d_{n-2})$。

### 核心代码

```cpp
long long d[25];

void init(int n) {
    d[0] = 1;
    d[1] = 0;
    for (int i = 2; i <= n; i++) {
        d[i] = 1LL * (i - 1) * (d[i - 1] + d[i - 2]);
    }
}
```

### 复杂度

时间复杂度 $O(n)$，空间复杂度 $O(n)$。

---

## 2. [P4859 已经没有什么好害怕的了](https://www.luogu.com.cn/problem/P4859)

`Ferrers board` `容斥` `组合计数`

### 题意

有 $n$ 个糖果和 $n$ 个药片，能量值两两不同。要把它们一一配对，统计满足“糖果能量大于药片能量的配对数”比反过来多 $k$ 组的方案数。

### 分析

因为题目保证能量值互不相同，每一组配对不是赢就是输，所以若胜场数为 $s$，就有 $s-(n-s)=k$，即 $s=(n+k)/2$。若 $n+k$ 为奇数，答案直接为 $0$。

把糖果和药片都升序排序，记 `c[i]` 为比第 `i` 个糖果小的药片个数。于是所有“可赢边”形成一个 Ferrers board。先做 rook DP：`dp[i][j]` 表示前 `i` 行恰好选 `j` 条互不冲突赢边的方案数，转移为 `dp[i-1][j-1] * (c[i]-j+1)`。这只是选出若干条必胜边；要让最终恰好有 `s` 组获胜，再对“至少选了多少条赢边”做一次容斥：

`ans = Σ (-1)^(t-s) * dp[n][t] * C(t,s) * (n-t)!`。

### 核心代码

```cpp
sort(a + 1, a + n + 1);
sort(b + 1, b + n + 1);
for (int i = 1; i <= n; i++) {
    c[i] = lower_bound(b + 1, b + n + 1, a[i]) - b - 1;
}
dp[0][0] = 1;
for (int i = 1; i <= n; i++) {
    dp[i][0] = 1;
    for (int j = 1; j <= i; j++) {
        dp[i][j] = dp[i - 1][j];
        if (c[i] >= j) {
            dp[i][j] = (dp[i][j] + 1LL * dp[i - 1][j - 1] * (c[i] - j + 1)) % mod;
        }
    }
}
int s = (n + k) >> 1;
for (int t = s; t <= n; t++) {
    long long cur = 1LL * dp[n][t] * C[t][s] % mod * fac[n - t] % mod;
    ans = (ans + ((t - s) & 1 ? -cur : cur)) % mod;
}
```

### 复杂度

时间复杂度 $O(n^2)$，空间复杂度 $O(n^2)$。

---

## 3. [P6620 [省选联考 2020 A 卷] 组合数问题](https://www.luogu.com.cn/problem/P6620)

`Stirling 第二类` `二项式型生成函数`

### 题意

给定多项式 $f(k)=a_0+a_1k+\\cdots+a_mk^m$，要求计算
$\sum_{k=0}^{n} f(k)x^k\binom{n}{k} \bmod p$，其中 $n$ 很大，但 $m\le 1000$。

### 分析

难点不在组合数，而在 $f(k)$ 这个多项式。把幂次基底改写成下降幂：
$k^t=\sum_{j=0}^t S(t,j)k^{\underline j}$，其中 $S(t,j)$ 是第二类 Stirling 数。

而下降幂与二项式系数正好匹配：
$\sum_{k=0}^{n} k^{\underline j} x^k \binom{n}{k}=n^{\underline j}x^j(1+x)^{n-j}$。
所以先用 Stirling 数把 $f(k)$ 变成下降幂线性组合，再逐个 $j$ 计算 `fall[j] * x^j * (1+x)^(n-j)` 累加即可，不需要枚举 $k$。

### 核心代码

```cpp
S[0][0] = 1;
for (int i = 1; i <= m; i++) {
    for (int j = 1; j <= i; j++) {
        S[i][j] = (S[i - 1][j - 1] + 1LL * j * S[i - 1][j]) % p;
    }
}
for (int j = 0; j <= m; j++) {
    for (int t = j; t <= m; t++) {
        coef[j] = (coef[j] + 1LL * a[t] * S[t][j]) % p;
    }
}
fall[0] = 1;
pwx[0] = 1;
for (int j = 1; j <= m; j++) {
    fall[j] = 1LL * fall[j - 1] * ((n - j + 1) % p) % p;
    pwx[j] = 1LL * pwx[j - 1] * x % p;
}
for (int j = 0; j <= m; j++) {
    long long term = 1LL * coef[j] * fall[j] % p * pwx[j] % p;
    term = term * qpow((x + 1) % p, n - j, p) % p;
    ans = (ans + term) % p;
}
```

### 复杂度

时间复杂度 $O(m^2+m\log n)$，空间复杂度 $O(m^2)$。

---

## 4. [P3904 三只小猪](https://www.luogu.com.cn/problem/P3904)

`Stirling 第二类` `满射计数`

### 题意

有 $n$ 只互不相同的小猪和 $m$ 间房子，要求每只猪住进一间房，且每间房都至少有一只猪，求方案数。

### 分析

本质是把 $n$ 个有标号元素映射到 $m$ 个有标号盒子且没有空盒。先把猪划分成 $m$ 个非空无序集合，方案数是第二类 Stirling 数 $S(n,m)$；再把这 $m$ 个集合对应到具体房子上，还要乘一个 $m!$。

由于 $n,m\le 50$，直接用递推 `S(i,j)=S(i-1,j-1)+j*S(i-1,j)` 即可。最后输出 `S(n,m)*m!`。

### 核心代码

```cpp
f[0][0] = 1;
for (int i = 1; i <= n; i++) {
    for (int j = 1; j <= min(i, m); j++) {
        f[i][j] = f[i - 1][j - 1] + f[i - 1][j] * j;
    }
}
long long ans = f[n][m];
for (int i = 1; i <= m; i++) ans *= i;
```

### 复杂度

时间复杂度 $O(nm)$，空间复杂度 $O(nm)$。

---

## 5. [P4609 [FJOI2016] 建筑师](https://www.luogu.com.cn/problem/P4609)

`Stirling 第一类` `排列可见性`

### 题意

在 $1\sim n$ 这 $n$ 个不同高度里排成一列，要求从左边能看到恰好 $A$ 栋、从右边能看到恰好 $B$ 栋，求方案数。

### 分析

最高的建筑一定同时被左右两边看到。把最高建筑固定后，左边需要再贡献 $A-1$ 个“从左看的新高点”，右边需要再贡献 $B-1$ 个“从右看的新高点”。

剩下 $n-1$ 个数的排列，只需要关心一共形成多少个“前缀极大值块”。这正是 unsigned Stirling 第一类数的经典模型：`s[i][j]` 表示 `i` 个数排成若干轮换块的方案数，递推为 `s[i][j]=s[i-1][j-1]+(i-1)s[i-1][j]`。先用它算出总共有 `A+B-2` 个块的方案数，再从这些块里选 `A-1` 个放在最高建筑左边，即乘 `C(A+B-2,A-1)`。

### 核心代码

```cpp
s[0][0] = 1;
for (int i = 1; i < N; i++) {
    for (int j = 1; j <= 100; j++) {
        s[i][j] = (s[i - 1][j - 1] + 1LL * (i - 1) * s[i - 1][j]) % mod;
    }
}
long long solve(int n, int A, int B) {
    if (A + B - 2 > n - 1) return 0;
    return 1LL * s[n - 1][A + B - 2] * C[A + B - 2][A - 1] % mod;
}
```

### 复杂度

预处理时间复杂度 $O(NK)$，单次查询时间复杂度 $O(1)$，空间复杂度 $O(NK)$。

---

# 二、多项式卷积与大整数乘法

## 6. [P3803 【模板】多项式乘法（FFT）](https://www.luogu.com.cn/problem/P3803)

`FFT` `卷积`

### 题意

给定两个多项式的系数，要求输出它们乘积多项式的全部系数，次数规模可达 $10^6$。

### 分析

朴素卷积要枚举所有系数对，复杂度是 $O(nm)$，在这里完全不可做。FFT 把系数序列看成点值表示：先补齐到二次幂长度，做离散傅里叶变换，点值逐项相乘，再逆变换取回系数。

这题系数非负且不取模，用复数 FFT 最直接。关键实现点只有三个：位逆序重排、按层长递推单位根、逆变换后除以长度并四舍五入。

### 核心代码

```cpp
void fft(vector<complex<double>>& a, int inv) {
    for (int i = 0; i < lim; i++) if (i < rev[i]) swap(a[i], a[rev[i]]);
    for (int len = 2; len <= lim; len <<= 1) {
        double ang = 2 * PI / len * inv;
        complex<double> wn(cos(ang), sin(ang));
        for (int l = 0; l < lim; l += len) {
            complex<double> w(1, 0);
            for (int i = 0; i < (len >> 1); i++, w *= wn) {
                auto x = a[l + i], y = w * a[l + i + (len >> 1)];
                a[l + i] = x + y;
                a[l + i + (len >> 1)] = x - y;
            }
        }
    }
    if (inv == -1) for (auto& x : a) x /= lim;
}
```

### 复杂度

时间复杂度 $O(L\log L)$，空间复杂度 $O(L)$，其中 $L$ 是补齐后的长度。

---

## 7. [P1919 【模板】高精度乘法 / A*B Problem 升级版](https://www.luogu.com.cn/problem/P1919)

`FFT` `高精度乘法`

### 题意

输入两个长度可达 $10^6$ 位的十进制正整数，要求输出它们的乘积。

### 分析

把每个大整数倒序拆成十进制数组后，乘法本质就是一维卷积：第 `i+j` 位的贡献来自 `a[i]*b[j]`。因此与多项式乘法完全同构，只是在 FFT 得到卷积结果后，还要逐位处理十进制进位。

这题的数据上限足以把普通高精乘法卡死，FFT 是唯一主流做法。实现时直接以十进制为基底即可，代码最短，最后从高位向低位跳过前导零输出。

### 核心代码

```cpp
for (int i = 0; i < n; i++) A[i] = complex<double>(sa[n - 1 - i] - '0', 0);
for (int i = 0; i < m; i++) B[i] = complex<double>(sb[m - 1 - i] - '0', 0);
fft(A, 1), fft(B, 1);
for (int i = 0; i < lim; i++) A[i] *= B[i];
fft(A, -1);
for (int i = 0; i < lim; i++) c[i] = (int)(A[i].real() + 0.5);
for (int i = 0; i < lim; i++) {
    c[i + 1] += c[i] / 10;
    c[i] %= 10;
}
while (lim > 0 && c[lim] == 0) lim--;
```

### 复杂度

时间复杂度 $O(L\log L)$，空间复杂度 $O(L)$。

---

# 三、莫比乌斯反演、杜教筛与整除分块

## 8. [P4213 【模板】杜教筛](https://www.luogu.com.cn/problem/P4213)

`杜教筛` `欧拉函数前缀和` `莫比乌斯函数前缀和`

### 题意

多组询问，每次给定 $n$，要求同时求出 $\sum_{i=1}^n\varphi(i)$ 与 $\sum_{i=1}^n\mu(i)$。

### 分析

直接线性筛到 $2^{31}$ 不现实，题目考的就是“前缀和递归”。对于欧拉函数，利用恒等式 $\sum_{d\mid n}\varphi(d)=n$，累加后得到
$\sum_{i=1}^n \varphi(i)\lfloor n/i\rfloor = n(n+1)/2$；对莫比乌斯函数有 $\sum_{d\mid n}\mu(d)=[n=1]$，于是
$\sum_{i=1}^n \mu(i)\lfloor n/i\rfloor = 1$。

把相同的 `n / l` 合并成一段，就能写出分块递归，再用哈希表记忆化。小范围前缀和由线性筛预处理，大范围由杜教筛递归补齐。

### 核心代码

```cpp
long long Sphi(long long n) {
    if (n <= LIM) return pre_phi[n];
    if (mp_phi.count(n)) return mp_phi[n];
    long long ans = n * (n + 1) / 2;
    for (long long l = 2, r; l <= n; l = r + 1) {
        r = n / (n / l);
        ans -= (r - l + 1) * Sphi(n / l);
    }
    return mp_phi[n] = ans;
}
long long Smu(long long n) {
    if (n <= LIM) return pre_mu[n];
    if (mp_mu.count(n)) return mp_mu[n];
    long long ans = 1;
    for (long long l = 2, r; l <= n; l = r + 1) {
        r = n / (n / l);
        ans -= (r - l + 1) * Smu(n / l);
    }
    return mp_mu[n] = ans;
}
```

### 复杂度

单次询问时间复杂度约为 $O(n^{2/3})$，空间复杂度为记忆化状态数。

---

## 9. [P3768 简单的数学题](https://www.luogu.com.cn/problem/P3768)

`杜教筛` `带权欧拉函数前缀和` `整除分块`

### 题意

给定 $n,p$，要求计算
$\sum_{i=1}^n\sum_{j=1}^n ij\gcd(i,j) \bmod p$。

### 分析

把 `i=d*x, j=d*y, gcd(x,y)=1`，原式变成
$\sum d^3xy$ 的互质求和。对“互质”用莫比乌斯反演展开，再按 `k=d*t` 合并，可化成
$\sum_{k=1}^n k^2\varphi(k)\,T(\lfloor n/k\rfloor)^2$，其中 $T(m)=m(m+1)/2$。

于是问题只剩前缀和 $H(n)=\sum_{i=1}^n i^2\varphi(i)$。因为 `(id^2·φ) * id^2 = id^3`，可以继续套杜教筛：
`H(n)=sum_{i=1}^n i^3 - Σ (sum i^2) * H(n/l)`。最后外层再做一次整除分块即可。

### 核心代码

```cpp
long long H(long long n) {
    if (n <= LIM) return pre_h[n];
    if (memo.count(n)) return memo[n];
    long long ans = sum_cube(n);
    for (long long l = 2, r; l <= n; l = r + 1) {
        r = n / (n / l);
        ans = (ans - (sum_sq(r) - sum_sq(l - 1)) * H(n / l)) % mod;
    }
    return memo[n] = (ans + mod) % mod;
}
for (long long l = 1, r; l <= n; l = r + 1) {
    r = n / (n / l);
    long long seg = (H(r) - H(l - 1) + mod) % mod;
    long long t = sum1(n / l);
    ans = (ans + seg * t % mod * t) % mod;
}
```

### 复杂度

时间复杂度约为 $O(n^{2/3})$，空间复杂度为记忆化状态数。

---

## 10. [P1829 [国家集训队] Crash的数字表格 / JZPTAB](https://www.luogu.com.cn/problem/P1829)

`莫比乌斯反演` `欧拉函数` `整除分块`

### 题意

在一个 $n\times m$ 表格里，第 $(i,j)$ 个位置写的是 $\operatorname{lcm}(i,j)$，要求求出整张表的数值总和。

### 分析

利用 $\operatorname{lcm}(i,j)=ij/\gcd(i,j)$，同样令 `i=d*x, j=d*y, gcd(x,y)=1`。拆开后可把答案整理成
$\sum_{k=1}^{\min(n,m)} k\varphi(k)\,T(\lfloor n/k\rfloor)T(\lfloor m/k\rfloor)$。

因此只要预处理前缀和 $G(n)=\sum_{i=1}^n i\varphi(i)$，再对 `n / l` 与 `m / l` 同时分块即可。这里上界只有 $10^7$，直接线性筛欧拉函数比杜教筛更稳。

### 核心代码

```cpp
for (int i = 2; i <= N; i++) {
    if (!vis[i]) primes.push_back(i), phi[i] = i - 1;
    for (int p : primes) {
        if (1LL * i * p > N) break;
        vis[i * p] = true;
        if (i % p == 0) { phi[i * p] = phi[i] * p; break; }
        phi[i * p] = phi[i] * (p - 1);
    }
}
for (int i = 1; i <= N; i++) pre[i] = (pre[i - 1] + 1LL * i * phi[i]) % mod;
for (int l = 1, r; l <= min(n, m); l = r + 1) {
    r = min(n / (n / l), m / (m / l));
    long long seg = (pre[r] - pre[l - 1] + mod) % mod;
    ans = (ans + seg * S(n / l) % mod * S(m / l)) % mod;
}
```

### 复杂度

预处理时间复杂度 $O(N)$，单次查询时间复杂度 $O(\sqrt{\min(n,m)})$，空间复杂度 $O(N)$。

---

## 11. [P3704 [SDOI2017] 数字表格](https://www.luogu.com.cn/problem/P3704)

`莫比乌斯反演` `前缀积` `整除分块`

### 题意

给定多个 $n,m$，表格第 $(i,j)$ 项是 $F_{\gcd(i,j)}$，其中 $F$ 为 Fibonacci 数列，要求整张表所有数的乘积对 $10^9+7$ 取模。

### 分析

和求和题不同，这里是按 `gcd` 分类后的乘积。设
$g(t)=\prod_{d\mid t}F_d^{\mu(t/d)}$，则由莫比乌斯反演可得
$F_k=\prod_{t\mid k} g(t)$。因此整张表的答案就变成
$\prod_{t=1}^{\min(n,m)} g(t)^{\lfloor n/t\rfloor\lfloor m/t\rfloor}$。

核心预处理是把每个 Fibonacci 值按其倍数散到 `g` 上；由于 $\mu$ 可能为负，需要同时准备逆元。查询时再把 `g` 做成前缀积，按相同商值分块快速乘幂。

### 核心代码

```cpp
for (int i = 1; i <= N; i++) g[i] = 1;
for (int d = 1; d <= N; d++) {
    for (int k = d, t = 1; k <= N; k += d, t++) {
        if (mu[t] == 1) g[k] = 1LL * g[k] * fib[d] % mod;
        if (mu[t] == -1) g[k] = 1LL * g[k] * invfib[d] % mod;
    }
}
for (int i = 1; i <= N; i++) pre[i] = 1LL * pre[i - 1] * g[i] % mod;
for (int l = 1, r; l <= lim; l = r + 1) {
    r = min(n / (n / l), m / (m / l));
    long long seg = 1LL * pre[r] * qpow(pre[l - 1], mod - 2) % mod;
    ans = 1LL * ans * qpow(seg, 1LL * (n / l) * (m / l) % (mod - 1)) % mod;
}
```

### 复杂度

预处理时间复杂度 $O(N\log N)$，单次查询时间复杂度 $O(\sqrt{\min(n,m)}\log mod)$，空间复杂度 $O(N)$。

---

## 12. [P3455 [POI 2007] ZAP-Queries](https://www.luogu.com.cn/problem/P3455)

`莫比乌斯反演` `互质计数`

### 题意

多次询问，每次给出 $a,b,d$，要求统计满足 $1\le x\le a,1\le y\le b,\gcd(x,y)=d$ 的数对个数。

### 分析

先把公因子 $d$ 提掉，问题变成统计
$1\le x\le a/d,1\le y\le b/d$ 且互质的数对数量。互质计数是莫比乌斯反演最标准的结论：
$\sum_{k=1}^{\min(n,m)} \mu(k)\lfloor n/k\rfloor\lfloor m/k\rfloor$。

为了应对 $5\times 10^4$ 次询问，需要把前缀和 `pre_mu` 预处理出来，再按相同的整除结果分块，单次询问降到 $O(\sqrt n)$。

### 核心代码

```cpp
long long calc(int n, int m) {
    long long ans = 0;
    for (int l = 1, r; l <= min(n, m); l = r + 1) {
        r = min(n / (n / l), m / (m / l));
        ans += 1LL * (pre_mu[r] - pre_mu[l - 1]) * (n / l) * (m / l);
    }
    return ans;
}
long long solve(int a, int b, int d) {
    return calc(a / d, b / d);
}
```

### 复杂度

预处理时间复杂度 $O(N)$，单次询问时间复杂度 $O(\sqrt{\min(a,b)})$，空间复杂度 $O(N)$。

---

## 13. [P2522 [HAOI2011] Problem b](https://www.luogu.com.cn/problem/P2522)

`莫比乌斯反演` `二维容斥`

### 题意

多次询问矩形区域 $[a,b]\times[c,d]$ 内，满足 $\gcd(x,y)=k$ 的数对个数。

### 分析

和上一题完全同源，只是查询区域不再从 $1$ 开始。先除以 $k$，再对矩形做四次前缀容斥：

`ans = F(b,d) - F(a-1,d) - F(b,c-1) + F(a-1,c-1)`，
其中 `F(n,m)` 表示前缀矩形内互质数对个数。`F` 的求法仍然是莫比乌斯反演加整除分块，所以这题的关键只是把一维前缀思想换成二维前缀容斥。

### 核心代码

```cpp
long long pref(int n, int m) {
    long long ans = 0;
    for (int l = 1, r; l <= min(n, m); l = r + 1) {
        r = min(n / (n / l), m / (m / l));
        ans += 1LL * (sum_mu[r] - sum_mu[l - 1]) * (n / l) * (m / l);
    }
    return ans;
}
long long query(int a, int b, int c, int d, int k) {
    a = (a - 1) / k, b /= k;
    c = (c - 1) / k, d /= k;
    return pref(b, d) - pref(a, d) - pref(b, c) + pref(a, c);
}
```

### 复杂度

预处理时间复杂度 $O(N)$，单次询问时间复杂度 $O(\sqrt{\min(b,d)})$，空间复杂度 $O(N)$。

---

## 14. [P2261 [CQOI2007] 余数求和](https://www.luogu.com.cn/problem/P2261)

`整除分块` `等差数列求和`

### 题意

给定 $n,k$，要求计算 $\sum_{i=1}^n (k \bmod i)$。

### 分析

把余数写成 `k mod i = k - i * floor(k / i)`，则原式等于
`n*k - Σ i*floor(k/i)`。真正需要优化的是后半项，而 `floor(k/i)` 在一段连续区间内取值相同。

当商为 `q` 时，满足 `k / i = q` 的最大右端点是 `k / q`。因此可以用整除分块一次跳过整段，再用等差数列公式求出这段 `i` 的和。注意只需枚举到 `min(n,k)`，因为当 `i>k` 时余数恒为 `k`。

### 核心代码

```cpp
long long ans = 1LL * n * k;
for (long long l = 1, r, up = min(n, k); l <= up; l = r + 1) {
    long long q = k / l;
    r = min(up, k / q);
    long long sum = (l + r) * (r - l + 1) / 2;
    ans -= q * sum;
}
```

### 复杂度

时间复杂度 $O(\sqrt k)$，空间复杂度 $O(1)$。

---

# 四、Catalan、容斥与 Lucas 组合模板

## 15. [P1044 [NOIP 2003 普及组] 栈](https://www.luogu.com.cn/problem/P1044)

`Catalan 数` `合法出栈序列`

### 题意

输入顺序固定为 $1,2,\dots,n$，只允许按栈规则压入和弹出，求最终可能得到多少种输出序列。

### 分析

这是最典型的 Catalan 模型。每个元素都恰好入栈一次、出栈一次，把入栈记成左括号、出栈记成右括号，就转化为长度为 `2n` 的合法括号序列计数。

因此答案是第 `n` 个 Catalan 数：
$\mathrm{Cat}_n=\dfrac{1}{n+1}\binom{2n}{n}$。由于 $n\le 18$，直接递推或直接算组合数都能安全放进 `long long`。

### 核心代码

```cpp
long long cat[25];

void init(int n) {
    cat[0] = 1;
    for (int i = 1; i <= n; i++) {
        cat[i] = cat[i - 1] * (4LL * i - 2) / (i + 1);
    }
}
```

### 复杂度

时间复杂度 $O(n)$，空间复杂度 $O(n)$。

---

## 16. [P1450 [HAOI2008] 硬币购物](https://www.luogu.com.cn/problem/P1450)

`完全背包` `容斥`

### 题意

固定四种硬币面值。每次询问给出四种硬币各自最多可用多少枚，以及目标金额 $s$，要求统计付款方案数。

### 分析

若不限制每种硬币数量，先做一次完全背包 `f[t]`，表示凑出金额 `t` 的方案数。真正的上限约束只出现在询问阶段，而且只有四种硬币，最适合对“超出上限”的情况做子集容斥。

若某一类硬币至少用了 `d_i+1` 枚，就先强行扣掉这部分金额，再用无限硬币方案数去补。四类硬币总共只有 $2^4=16$ 个子集，每个询问直接枚举即可。

### 核心代码

```cpp
f[0] = 1;
for (int i = 0; i < 4; i++) {
    for (int j = c[i]; j <= S; j++) {
        f[j] += f[j - c[i]];
    }
}
long long solve(int s) {
    long long ans = 0;
    for (int mask = 0; mask < 16; mask++) {
        int rest = s, bits = 0;
        for (int i = 0; i < 4; i++) if (mask >> i & 1) {
            rest -= (d[i] + 1) * c[i];
            bits++;
        }
        if (rest >= 0) ans += (bits & 1 ? -f[rest] : f[rest]);
    }
    return ans;
}
```

### 复杂度

预处理时间复杂度 $O(4S)$，单次询问时间复杂度 $O(16)$，空间复杂度 $O(S)$。

---

## 17. [P1771 方程的解](https://www.luogu.com.cn/problem/P1771)

`隔板法` `高精度组合数`

### 题意

要求正整数方程 $a_1+a_2+\dots+a_k=g(x)$ 的解组数，其中 $g(x)=x^x \bmod 1000$，给定 $k,x$。

### 分析

先用快速幂求出 `g = x^x mod 1000`。方程要求的是 $k$ 个正整数和为 `g` 的方案数，直接套隔板法：
$\binom{g-1}{k-1}$。

难点在于答案可能远超 `64` 位，但这里上界其实只来自 `g<1000`。因此可以把组合数按质因数分解：统计每个素数在 `(g-1)! / ((k-1)!(g-k)!)` 中出现多少次，再用高精度乘小整数把结果重建出来。

### 核心代码

```cpp
int g = qpow(x % 1000, x, 1000);
for (int p : primes) {
    cnt[p] = calc(g - 1, p) - calc(k - 1, p) - calc(g - k, p);
}
vector<int> ans(1, 1);
for (int p : primes) {
    while (cnt[p]--) {
        int carry = 0;
        for (int& d : ans) {
            int v = d * p + carry;
            d = v % 10;
            carry = v / 10;
        }
        while (carry) ans.push_back(carry % 10), carry /= 10;
    }
}
```

### 复杂度

时间复杂度 $O(\pi(g)\log g + L\cdot \pi(g))$，空间复杂度 $O(L)$，其中 $L$ 为答案位数。

---

## 18. [P3807 【模板】卢卡斯定理 / Lucas 定理](https://www.luogu.com.cn/problem/P3807)

`Lucas 定理` `组合数取模`

### 题意

多组询问，每次给定 $n,m,p$，其中 $p$ 为质数，要求计算 $\binom{n+m}{n} \bmod p$。

### 分析

直接用阶乘公式只适用于 $n+m < p$。Lucas 定理把大组合数拆成 $p$ 进制各位上的小组合数：
$C(n,m)\equiv C(n\bmod p,m\bmod p)C(\lfloor n/p\rfloor,\lfloor m/p\rfloor) \pmod p$。

所以先在 `0..p-1` 范围预处理阶乘和逆元阶乘，得到小组合数 `C(a,b)`；再递归处理高位即可。由于每次都把规模缩小为原来的 `1/p`，深度很浅。

### 核心代码

```cpp
long long C(long long n, long long m, int p) {
    if (m > n) return 0;
    return fac[n] * ifac[m] % p * ifac[n - m] % p;
}
long long lucas(long long n, long long m, int p) {
    if (m == 0) return 1;
    return C(n % p, m % p, p) * lucas(n / p, m / p, p) % p;
}
long long solve(long long n, long long m, int p) {
    init(p);
    return lucas(n + m, n, p);
}
```

### 复杂度

单组数据预处理时间复杂度 $O(p)$，递归时间复杂度 $O(\log_p(n+m))$，空间复杂度 $O(p)$。

---
