---
title: "洛谷 数论专题精选解题报告"
subtitle: "🧮 从反演统计到同余、筛法与矩阵加速"
order: 1
icon: "🔢"
---

# 洛谷 数论专题精选解题报告

这一组题从整除分块与莫比乌斯反演一路走到同余方程、逆元、筛法、矩阵快速幂与线性代数，工具看起来很多，但主线很统一：把数论条件拆成可枚举的块、可反演的函数或可快速幂加速的线性转移。前半段偏恒等式与计数，后半段则更强调模板联动。

# 一、反演统计与整除分块

这一章先处理数论里最典型的“把 gcd、约数和整除条件拆开”的题。主线是莫比乌斯反演、线性筛与整除分块：先把难统计的条件翻译成积性函数或前缀和，再利用商值分段把查询压到可接受的复杂度。

## 1. [P2257 YY的GCD](https://www.luogu.com.cn/problem/P2257)

`莫比乌斯反演` `线性筛` `整除分块`

### 题意

多组给定 `N,M`，统计 `1<=x<=N,1<=y<=M` 中满足 `gcd(x,y)` 是质数的有序数对个数。

### 分析

把 `gcd(x,y)=p` 改写成 `x=p*a,y=p*b,gcd(a,b)=1`，于是答案变成对所有质数 `p`，累加 `a<=N/p,b<=M/p` 的互质数对数。互质数对可以用莫比乌斯反演写成 `sum mu(d)*floor(n/d)*floor(m/d)`，再把“质数作为 gcd”这一层预处理成函数 `f` 的前缀和，查询时只做整除分块。

### 核心代码

```cpp
const int N = 10000005;
int mu[N], f[N], sf[N], prime[N], pcnt;
bool vis[N];

void init(int n){
  mu[1] = 1;
  for(int i = 2; i <= n; i++){
    if(!vis[i]) prime[++pcnt] = i, mu[i] = -1, f[i] = 1;
    for(int j = 1; j <= pcnt && 1LL * i * prime[j] <= n; j++){
      int p = prime[j], x = i * p;
      vis[x] = 1;
      if(i % p == 0){ mu[x] = 0, f[x] = mu[i]; break; }
      mu[x] = -mu[i], f[x] = mu[i] - f[i];
    }
  }
  for(int i = 1; i <= n; i++) sf[i] = sf[i - 1] + f[i];
}
long long calc(int n, int m){
  if(n > m) swap(n, m);
  long long ans = 0;
  for(int l = 1, r; l <= n; l = r + 1){
    r = min(n / (n / l), m / (m / l));
    ans += 1LL * (sf[r] - sf[l - 1]) * (n / l) * (m / l);
  }
  return ans;
}
```

### 复杂度

预处理 `O(V)`，单次询问 `O(sqrt(min(N,M)))`。

---

## 2. [P3327 [SDOI2015] 约数个数和](https://www.luogu.com.cn/problem/P3327)

`莫比乌斯反演` `约数函数` `整除分块`

### 题意

多组给定 `n,m`，求 $sum_{i=1..n} sum_{j=1..m} d(i*j)$，其中 `d(x)` 是约数个数函数。

### 分析

把 `d(ij)` 拆成“选出 `i` 的一个约数、再选出 `j` 的一个约数”，中间的互质条件用莫比乌斯反演消掉，可得答案是 `sum mu(t) * G(n/t) * G(m/t)`，这里 $G(x)=sum_{k=1..x} d(k)$。`d(k)` 可以线性筛，`G` 做前缀和；查询时按 `n/l`、`m/l` 相同的区间整除分块即可。

### 核心代码

```cpp
const int N = 50005;
int mu[N], d[N], c[N], prime[N], pcnt;
long long smu[N], gd[N];
bool vis[N];

void init(int n){
  mu[1] = d[1] = 1;
  for(int i = 2; i <= n; i++){
    if(!vis[i]) prime[++pcnt] = i, mu[i] = -1, d[i] = 2, c[i] = 1;
    for(int j = 1; j <= pcnt && i * prime[j] <= n; j++){
      int p = prime[j], x = i * p;
      vis[x] = 1;
      if(i % p == 0){ c[x] = c[i] + 1, d[x] = d[i] / (c[i] + 1) * (c[x] + 1), mu[x] = 0; break; }
      c[x] = 1, d[x] = d[i] * 2, mu[x] = -mu[i];
    }
  }
  for(int i = 1; i <= n; i++) smu[i] = smu[i - 1] + mu[i], gd[i] = gd[i - 1] + d[i];
}
long long solve(int n, int m){
  if(n > m) swap(n, m);
  long long ans = 0;
  for(int l = 1, r; l <= n; l = r + 1){
    r = min(n / (n / l), m / (m / l));
    ans += (smu[r] - smu[l - 1]) * gd[n / l] * gd[m / l];
  }
  return ans;
}
```

### 复杂度

预处理 `O(V)`，单次询问 `O(sqrt(min(n,m)))`。

---

# 二、线性代数与高斯消元模板

这一章从矩阵求逆和线性方程组出发，把数论专题里常见的线性代数工具单独拎出来。它们看似和前面的反演题关系不大，但本质同样是在把原问题改写成一种结构稳定、可以按列消元的代数对象。

## 3. [P4783 【模板】矩阵求逆](https://www.luogu.com.cn/problem/P4783)

`高斯消元` `矩阵求逆` `模意义`

### 题意

给定一个 `N*N` 矩阵，在模 `1e9+7` 意义下求逆矩阵；如果不可逆，输出 `No Solution`。

### 分析

把原矩阵和单位矩阵拼成增广矩阵 `[A|I]`，对左半部分做模意义下的高斯消元。每一列先找非零主元，交换到当前行，再把主元归一并消掉其余行该列，最后左半部分化成单位阵，右半部分就是 $A^{-1}$。如果某一列找不到主元，说明行列式为零，矩阵不可逆。

### 核心代码

```cpp
const int MOD = 1000000007;
long long a[405][805];

long long qpow(long long x, long long k){
  long long r = 1;
  while(k){ if(k & 1) r = r * x % MOD; x = x * x % MOD; k >>= 1; }
  return r;
}
bool inverse(int n){
  for(int i = 1; i <= n; i++){
    int p = i;
    while(p <= n && !a[p][i]) p++;
    if(p > n) return false;
    if(p != i) for(int j = i; j <= 2 * n; j++) swap(a[i][j], a[p][j]);
    long long iv = qpow((a[i][i] + MOD) % MOD, MOD - 2);
    for(int j = i; j <= 2 * n; j++) a[i][j] = a[i][j] * iv % MOD;
    for(int k = 1; k <= n; k++) if(k != i && a[k][i]){
      long long t = a[k][i];
      for(int j = i; j <= 2 * n; j++) a[k][j] = (a[k][j] - t * a[i][j]) % MOD;
    }
  }
  return true;
}
```

### 复杂度

时间 `O(N^3)`，空间 `O(N^2)`。

---

## 4. [P3389 【模板】高斯消元法](https://www.luogu.com.cn/problem/P3389)

`高斯消元` `线性方程组` `浮点数`

### 题意

给定 `n` 元一次方程组，求唯一实数解；若无唯一解则输出 `No Solution`。

### 分析

高斯消元真正要做的，不是“解方程组”，而是不断把当前矩阵化成更容易读答案的上三角形。对第 `i` 列来说，先选一个主元，把它所在行换到第 `i` 行，然后利用这行去消掉下面各行的这一列。

为什么常选绝对值最大的主元？因为实数运算会有误差，主元太小会把误差放大。当前题只要求唯一解，所以如果某一列连一个足够大的主元都找不到，就说明这一列无法提供新的独立约束，本题直接判成没有唯一解。

所以这题别只记三重循环，要记住高斯消元的核心节奏：**选主元 → 换上来 → 消下面 → 最后回代。**

### 核心代码

```cpp
const double EPS = 1e-8;
double a[105][105];

bool gauss(int n){
  for(int i = 1; i <= n; i++){
    int p = i;
    for(int j = i + 1; j <= n; j++) if(fabs(a[j][i]) > fabs(a[p][i])) p = j;
    if(fabs(a[p][i]) < EPS) return false;
    for(int j = i; j <= n + 1; j++) swap(a[i][j], a[p][j]);
    for(int j = i + 1; j <= n; j++){
      double t = a[j][i] / a[i][i];
      for(int k = i; k <= n + 1; k++) a[j][k] -= t * a[i][k];
    }
  }
  for(int i = n; i >= 1; i--){
    for(int j = i + 1; j <= n; j++) a[i][n + 1] -= a[i][j] * a[j][n + 1];
    a[i][n + 1] /= a[i][i];
  }
  return true;
}
```

### 复杂度

时间 `O(n^3)`，空间 `O(n^2)`。

---

# 三、同余方程、CRT 与离散对数

这一章的核心是模意义下的方程求解：有的要合并多个模数，有的要把指数未知量还原出来。共同难点都在“先把方程变形成标准模型”，然后再决定该用 CRT、扩展欧几里得还是 BSGS / exBSGS。

## 5. [P4195 【模板】扩展 BSGS / exBSGS](https://www.luogu.com.cn/problem/P4195)

`exBSGS` `离散对数` `gcd 分层`

### 题意

多组给定 `a,p,b`，求最小自然数 `x` 使 `a^x ≡ b (mod p)`，无解输出 `No Solution`。

### 分析

普通 BSGS 要求 `gcd(a,p)=1`，这里不满足时要先不断提出 `g=gcd(a,p)`。若 `b` 不能被 `g` 整除则无解；否则把方程约掉一层，同时累计答案偏移量。直到模数与底数互质后，再对剩余方程做 BSGS。真正难点不在 hash，而在“约掉若干层 gcd 后，当前乘子 `k` 也要带进方程”。

### 核心代码

```cpp
long long bsgs(long long a, long long b, long long p){
  unordered_map<long long,int> mp;
  int m = (int)ceil(sqrt((double)p));
  long long e = 1;
  for(int j = 0; j < m; j++) mp[b * e % p] = j, e = e * a % p;
  long long step = qpow(a, m, p), cur = 1;
  for(int i = 1; i <= m + 1; i++){
    cur = cur * step % p;
    if(mp.count(cur)) return 1LL * i * m - mp[cur];
  }
  return -1;
}
long long exbsgs(long long a, long long b, long long p){
  a %= p; b %= p;
  if(b == 1 % p) return 0;
  long long k = 1, add = 0, g;
  while((g = gcd(a, p)) > 1){
    if(b % g) return -1;
    p /= g, b /= g, k = k * (a / g) % p, add++;
    if(k == b) return add;
  }
  long long t = bsgs(a, b * inv(k, p) % p, p);
  return t == -1 ? -1 : t + add;
}
```

### 复杂度

单组时间 `O(sqrt(p))`，额外哈希空间 `O(sqrt(p))`。

---

## 6. [P3846 【模板】BSGS / [TJOI2007] 可爱的质数](https://www.luogu.com.cn/problem/P3846)

`BSGS` `离散对数` `哈希`

### 题意

给定质数 `p` 与整数 `b,n`，求最小非负整数 `l`，满足 `b^l ≡ n (mod p)`，无解输出 `no solution`。

### 分析

因为 `p` 是质数且 `2<=b<p`，底数在模 `p` 下可逆，直接用 BSGS。把 `l=i*m-j`，整理成 $b^{im} ≡ n*b^j$，先把所有 baby step `n*b^j` 放进哈希，再枚举 giant step $b^{im}$ 查碰撞。输出最小解时要注意哈希里保留最小的 `j`。

### 核心代码

```cpp
int bsgs(int p, int b, int n){
  unordered_map<int,int> mp;
  int m = (int)ceil(sqrt((double)p));
  long long cur = n % p;
  for(int j = 0; j < m; j++){
    if(!mp.count(cur)) mp[cur] = j;
    cur = cur * b % p;
  }
  long long step = qpow(b, m, p), now = 1;
  for(int i = 1; i <= m + 1; i++){
    now = now * step % p;
    if(mp.count(now)) return i * m - mp[now];
  }
  return -1;
}
```

### 复杂度

时间 `O(sqrt(p))`，空间 `O(sqrt(p))`。

---

## 7. [P4777 【模板】扩展中国剩余定理（EXCRT）](https://www.luogu.com.cn/problem/P4777)

`EXCRT` `扩展欧几里得` `合并同余`

### 题意

给定 `n` 组方程 `x ≡ b_i (mod a_i)`，模数不一定互质，保证有解，求最小非负解。

### 分析

顺次合并两条同余式。把 `x ≡ r (mod m)` 和 `x ≡ b (mod a)` 改写成 `m*k ≡ b-r (mod a)`，再用扩展欧几里得求一组解。这里真正要处理的是 `m`、`a` 可达 `1e12`，合并过程中还会继续变大，所以乘法必须用 `__int128` 或安全乘法。

### 核心代码

```cpp
using i128 = __int128_t;
long long exgcd(long long a, long long b, long long &x, long long &y){
  if(!b){ x = 1, y = 0; return a; }
  long long g = exgcd(b, a % b, y, x);
  y -= a / b * x;
  return g;
}
bool merge(long long &m, long long &r, long long a, long long b){
  long long x, y, c = b - r;
  long long g = exgcd(m, a, x, y);
  if(c % g) return false;
  long long mod = a / g;
  x = (i128)x * (c / g) % mod;
  r += (i128)m * ((x + mod) % mod);
  m = m / g * a;
  r = (r % m + m) % m;
  return true;
}
```

### 复杂度

合并 `n` 个方程总时间 `O(n log V)`。

---

## 8. [P1495 【模板】中国剩余定理（CRT）/ 曹冲养猪](https://www.luogu.com.cn/problem/P1495)

`CRT` `乘法逆元` `互质模数`

### 题意

给定若干两两互质的模数 `a_i` 与余数 `b_i`，求满足全部同余式的最小非负整数。

### 分析

模数互质时不用逐个合并，直接套 CRT 总式即可。设总模数 `M=prod a_i`，对每一项令 `M_i=M/a_i`，再求 `M_i` 在模 `a_i` 下的逆元 `inv_i`，该项贡献就是 `b_i*M_i*inv_i`。最后把和对 `M` 取模。

### 核心代码

```cpp
using i128 = __int128_t;
long long exgcd(long long a, long long b, long long &x, long long &y){
  if(!b){ x = 1, y = 0; return a; }
  long long g = exgcd(b, a % b, y, x);
  y -= a / b * x;
  return g;
}
long long crt(int n){
  long long M = 1, ans = 0;
  for(int i = 1; i <= n; i++) M *= a[i];
  for(int i = 1; i <= n; i++){
    long long Mi = M / a[i], x, y;
    exgcd(Mi, a[i], x, y);
    ans = (ans + (i128)b[i] * Mi % M * ((x % a[i] + a[i]) % a[i])) % M;
  }
  return (ans + M) % M;
}
```

### 复杂度

时间 `O(n log V)`，空间 `O(1)`（不计输入存储）。

---

## 9. [P1082 [NOIP 2012 提高组] 同余方程](https://www.luogu.com.cn/problem/P1082)

`扩展欧几里得` `逆元` `一次同余`

### 题意

求方程 `a*x ≡ 1 (mod b)` 的最小正整数解，题目保证有解。

### 分析

同余方程 `a*x ≡ 1 (mod b)` 的本质，就是在问 `a` 在模 `b` 意义下有没有乘法逆元，以及逆元是多少。

把它改写成整数方程就是 `a*x + b*y = 1`。扩展欧几里得正是专门求这类贝祖等式系数的：只要 `gcd(a,b)=1`，它就能给出一组 `x,y`，其中这个 `x` 对 `b` 取模后就是我们要的逆元。

所以这题非常适合作为扩欧的第一层应用模板：**乘法逆元 = 一次特殊的线性不定方程。**

### 核心代码

```cpp
long long exgcd(long long a, long long b, long long &x, long long &y){
  if(!b){ x = 1, y = 0; return a; }
  long long g = exgcd(b, a % b, y, x);
  y -= a / b * x;
  return g;
}
long long inv(long long a, long long mod){
  long long x, y;
  exgcd(a, mod, x, y);
  return (x % mod + mod) % mod;
}
```

### 复杂度

时间 `O(log b)`，空间 `O(log b)`。

---

## 10. [U553464 扩展欧几里得](https://www.luogu.com.cn/problem/U553464)

`扩展欧几里得` `贝祖等式` `多组询问`

### 题意

给定多组 `a_i,b_i`，对每组输出一组整数 `x_i,y_i`，满足 `a_i*x_i+b_i*y_i=gcd(a_i,b_i)`。

### 分析

普通欧几里得算法只会告诉你 `gcd(a,b)` 是多少，而扩展欧几里得更进一步：它要把这个 gcd 写成 `a*x+b*y` 的形式。

递归里先求出 `b` 和 `a mod b` 的系数，再把 `a mod b = a - floor(a/b)*b` 代回去，就能把新一层的系数推出来。这也是为什么扩欧代码看起来只比 gcd 多了两行交换和回代。

所以这题真正该记住的不是模板名字，而是这个恒等式回代过程：**先求小问题的系数，再把余数表达式展开回原变量。**

### 核心代码

```cpp
long long exgcd(long long a, long long b, long long &x, long long &y){
  if(!b){ x = 1, y = 0; return a; }
  long long g = exgcd(b, a % b, y, x);
  y -= a / b * x;
  return g;
}
```

### 复杂度

单组时间 `O(log min(a,b))`。

---

## 11. [CF7C Line](https://www.luogu.com.cn/problem/CF7C)

`二元一次方程` `扩展欧几里得` `整数解`

### 题意

给定直线 `A*x+B*y+C=0`，要求输出一个整数点 `(x,y)`；若不存在整数解则输出 `-1`。

### 分析

把方程改写成 `A*x+B*y=-C`。线性不定方程有解当且仅当 `gcd(A,B)` 整除 `-C`，所以先对 `A,B` 做扩欧拿到 `A*x0+B*y0=g`，再把两边同时乘上 `(-C)/g` 即可得到一组整数点。本题只要任意一组解，不需要继续平移参数解。

### 核心代码

```cpp
long long exgcd(long long a, long long b, long long &x, long long &y){
  if(!b){ x = 1, y = 0; return a; }
  long long g = exgcd(b, a % b, y, x);
  y -= a / b * x;
  return g;
}
bool solve(long long A, long long B, long long C, long long &x, long long &y){
  long long g = exgcd(abs(A), abs(B), x, y);
  if((-C) % g) return false;
  x *= (-C) / g, y *= (-C) / g;
  if(A < 0) x = -x;
  if(B < 0) y = -y;
  return true;
}
```

### 复杂度

时间 `O(log max(|A|,|B|))`。

---

## 12. [P1516 青蛙的约会](https://www.luogu.com.cn/problem/P1516)

`线性同余方程` `扩展欧几里得` `最小非负解`

### 题意

两只青蛙分别从 `x,y` 出发，每次跳 `m,n`，在环长为 `L` 的圆环上同向跳。求它们经过多少次会在同一时刻落到同一点，无解输出 `Impossible`。

### 分析

第 `t` 次后位置分别是 `x+t*m`、`y+t*n`，同点条件是 `(m-n)*t ≡ y-x (mod L)`。于是题目化成一次线性同余方程。先判 `gcd(m-n,L)` 是否整除 `y-x`，有解时用扩欧求出一组解，再对 `L/g` 取最小非负值。

### 核心代码

```cpp
long long exgcd(long long a, long long b, long long &x, long long &y){
  if(!b){ x = 1, y = 0; return a; }
  long long g = exgcd(b, a % b, y, x);
  y -= a / b * x;
  return g;
}
long long meet(long long x, long long y, long long m, long long n, long long L){
  long long a = m - n, c = y - x, u, v;
  long long g = exgcd(abs(a), L, u, v);
  if(c % g) return -1;
  long long mod = L / g;
  u *= c / g;
  if(a < 0) u = -u;
  return (u % mod + mod) % mod;
}
```

### 复杂度

时间 `O(log L)`。

---

# 四、裴蜀、欧拉与逆元

这一章收拢最常用的数论基础工具：扩展欧几里得、欧拉函数、逆元与同余可解性。它们往往不是整题的全部，但经常决定一个模型到底能不能往下化简，因此必须单独形成稳定手感。

## 13. [P3951 [NOIP 2017 提高组] 小凯的疑惑](https://www.luogu.com.cn/problem/P3951)

`Frobenius` `互质` `结论题`

### 题意

给定两种互质面值 `a,b`，每种金币无限，问无法凑出的最大金额是多少。

### 分析

这就是两变量 Frobenius 问题。对互质的 `a,b`，所有大于 `a*b-a-b` 的数都能表示，且 `a*b-a-b` 本身不能表示，所以答案直接是闭式 `a*b-a-b`。这题关键不在推导代码，而在识别模型。

### 核心代码

```cpp
long long solve(long long a, long long b){
  return a * b - a - b;
}
```

### 复杂度

时间 `O(1)`，空间 `O(1)`。

---

## 14. [P4549 【模板】裴蜀定理](https://www.luogu.com.cn/problem/P4549)

`裴蜀定理` `gcd` `线性组合`

### 题意

给定整数序列 `A`，任选整数系数 `X_i` 使 `S=sum A_i*X_i > 0` 且尽量小，求这个最小值。

### 分析

题目看起来像在做最优化，但真正该先识别的模型是“整数线性组合能取到哪些值”。裴蜀定理告诉我们：若只看两数，所有形如 `ax+by` 的整数值，恰好就是 `gcd(a,b)` 的倍数；推广到整组数也是一样。

因此题目问“能取到的最小正整数”，其实就是在这些可达值里找最小正倍数，也就是整组数绝对值的 gcd。包装虽然复杂，核心却只剩一遍 gcd 累积。

这题最值得迁移的是模型识别：**一看到“整数系数线性组合”，优先想裴蜀和 gcd。**

### 核心代码

```cpp
long long ans = 0;
for(int i = 1; i <= n; i++) ans = gcd(ans, llabs(a[i]));
```

### 复杂度

时间 `O(n log V)`。

---

## 15. [P5091 【模板】扩展欧拉定理](https://www.luogu.com.cn/problem/P5091)

`扩展欧拉定理` `大整数指数` `快速幂`

### 题意

给定 `a,m,b`，其中指数 `b` 极大，以十进制串形式给出，求 `a^b mod m`。

### 分析

若 `gcd(a,m)=1`，可直接把指数对 `phi(m)` 取模；若不互质，指数过大时要改用扩展欧拉定理，取成 `b mod phi(m) + phi(m)`。因此先分解 `m` 求 `phi(m)`，再一边读指数串一边求模并判断它是否已经达到 `phi(m)` 以上，最后做一次快速幂。

### 核心代码

```cpp
long long phi(long long n){
  long long r = n;
  for(long long i = 2; i * i <= n; i++) if(n % i == 0){
    while(n % i == 0) n /= i;
    r = r / i * (i - 1);
  }
  if(n > 1) r = r / n * (n - 1);
  return r;
}
long long read_exp(const string &s, long long mod, bool &big){
  long long x = 0;
  for(char ch : s){
    x = x * 10 + ch - '0';
    if(x >= mod) big = true, x %= mod;
  }
  return x;
}
long long solve(long long a, long long m, const string &b){
  long long ph = phi(m); bool big = false;
  long long e = read_exp(b, ph, big);
  if(gcd(a, m) != 1 && big) e += ph;
  return qpow(a, e, m);
}
```

### 复杂度

分解模数 `O(sqrt(m))`，读指数 `O(|b|)`。

---

## 16. [P3811 【模板】模意义下的乘法逆元](https://www.luogu.com.cn/problem/P3811)

`逆元递推` `线性预处理` `质数模`

### 题意

给定 `n,p`，其中 `p` 为质数，要求输出 `1..n` 每个数在模 `p` 下的逆元。

### 分析

逐个用快速幂会超时，这题用经典递推式 `inv[i]=(p-p/i)*inv[p%i] mod p`。它来自欧几里得除法 `p=(p/i)*i+p%i`，在模 `p` 下整理即可。因为 `n<p` 且 `p` 为质数，`1..n` 都可逆。

### 核心代码

```cpp
inv[1] = 1;
for(int i = 2; i <= n; i++)
  inv[i] = 1LL * (p - p / i) * inv[p % i] % p;
```

### 复杂度

时间 `O(n)`，空间 `O(n)`。

---

## 17. [P5431 【模板】模意义下的乘法逆元 2](https://www.luogu.com.cn/problem/P5431)

`前后缀积` `批量逆元` `快速幂`

### 题意

给定 `a_1...a_n` 与常数 `k`，要求计算 `sum k^i / a_i (mod p)`，其中 `p` 为质数，`n` 很大。

### 分析

不能对每个 `a_i` 各做一次快速幂。先做前缀积 `pre` 和后缀积 `suf`，只求一次总积 `pre[n]` 的逆元，就能得到 `inv(a_i)=pre[i-1]*suf[i+1]*inv(pre[n])`。随后顺手维护 `k` 的幂，把每项贡献累加起来。

### 核心代码

```cpp
pre[0] = suf[n + 1] = 1;
for(int i = 1; i <= n; i++) pre[i] = 1LL * pre[i - 1] * a[i] % p;
for(int i = n; i >= 1; i--) suf[i] = 1LL * suf[i + 1] * a[i] % p;
long long all = qpow(pre[n], p - 2, p), pw = k, ans = 0;
for(int i = 1; i <= n; i++){
  long long iv = 1LL * pre[i - 1] * suf[i + 1] % p * all % p;
  ans = (ans + pw * iv) % p;
  pw = pw * k % p;
}
```

### 复杂度

时间 `O(n)` 加一次 `O(log p)` 快速幂，空间 `O(n)`。

---

## 18. [T320132 线性筛法求莫比乌斯函数](https://www.luogu.com.cn/problem/T320132)

`线性筛` `莫比乌斯函数` `积性函数`

### 题意

给定 `n`，依次输出 `mu(1)` 到 `mu(n)`。

### 分析

莫比乌斯函数的定义很容易背，但真正写筛法时，关键是抓住它只和质因数结构有关：没有平方因子时，`mu(n)` 只看不同质因子个数的奇偶；一旦出现平方因子，值立刻变成 `0`。

在线性筛里，当一个新质数第一次乘到 `i` 时，说明只是多了一个新的不同质因子，所以 `mu` 直接变号；若 `prime[j]` 本来就整除 `i`，那么新数已经含有平方因子，`mu` 直接置零并停止往后筛。

所以这题真正要学会的是“定义如何落到筛法转移上”：**新增不同质因子就变号，重复乘同一质数就归零。**

### 核心代码

```cpp
mu[1] = 1;
for(int i = 2; i <= n; i++){
  if(!vis[i]) prime[++pcnt] = i, mu[i] = -1;
  for(int j = 1; j <= pcnt && i * prime[j] <= n; j++){
    int x = i * prime[j];
    vis[x] = 1;
    if(i % prime[j] == 0){ mu[x] = 0; break; }
    mu[x] = -mu[i];
  }
}
```

### 复杂度

时间 `O(n)`，空间 `O(n)`。

---

# 五、筛法、欧拉函数与质数统计

这一章回到筛法主线，把质数分布、欧拉函数和整除性质的预处理集中起来。很多题的关键并不是在线回答，而是在预处理阶段先把“每个数的某种数论属性”批量算出来。

## 19. [P1403 [AHOI2005] 约数研究](https://www.luogu.com.cn/problem/P1403)

`约数个数和` `调和级数` `整除分块`

### 题意

给定 `n`，求 $sum_{i=1..n} f(i)$，其中 `f(i)` 是 `i` 的约数个数。

### 分析

这题最漂亮的地方在于“反着数”。直接去求每个 `i` 的约数个数再求和当然可以，但更自然的是换个视角：对于固定的 `k`，它会成为哪些数的约数？答案正是所有 `k` 的倍数。

因此总贡献就是 `floor(n/k)`，总答案自然写成 `sum floor(n/k)`。再往下看会发现，这个商值在很多连续区间里都相同，于是可以整除分块，把相同的商一次性求完。

所以这题很适合建立一个数论常用思维：**直接数对象很难时，尝试按“谁给谁贡献了一次”倒过来统计。**

### 核心代码

```cpp
long long solve(int n){
  long long ans = 0;
  for(int l = 1, r; l <= n; l = r + 1){
    r = n / (n / l);
    ans += 1LL * (r - l + 1) * (n / l);
  }
  return ans;
}
```

### 复杂度

时间 `O(sqrt(n))`，空间 `O(1)`。

---

## 20. [T349752 筛法求欧拉函数](https://www.luogu.com.cn/problem/T349752)

`欧拉函数` `线性筛` `前缀和`

### 题意

给定 `n`，求 `1..n` 每个数的欧拉函数之和。

### 分析

先线性筛出 `phi(i)`，再顺手做前缀和。筛法转移有两种情况：若 `p|i`，则 `phi(i*p)=phi(i)*p`；否则 `phi(i*p)=phi(i)*(p-1)`。题目问总和，不必逐个输出时直接累加即可。

### 核心代码

```cpp
phi[1] = 1;
for(int i = 2; i <= n; i++){
  if(!vis[i]) prime[++pcnt] = i, phi[i] = i - 1;
  for(int j = 1; j <= pcnt && i * prime[j] <= n; j++){
    int p = prime[j], x = i * p;
    vis[x] = 1;
    if(i % p == 0){ phi[x] = phi[i] * p; break; }
    phi[x] = phi[i] * (p - 1);
  }
}
for(int i = 1; i <= n; i++) sum += phi[i];
```

### 复杂度

时间 `O(n)`，空间 `O(n)`。

---

## 21. [U629802 【模板】欧拉函数筛法](https://www.luogu.com.cn/problem/U629802)

`欧拉函数` `线性筛` `模板`

### 题意

给定 `n`，输出 `phi(1)` 到 `phi(n)`。

### 分析

欧拉函数筛法的重点，不是记结论，而是理解它为什么能在线性筛里顺便算出来。若 `p` 是新质因子且 `p` 不整除 `i`，那么 `phi(i*p)=phi(i)*(p-1)`；若 `p|i`，则 `phi(i*p)=phi(i)*p`。

这两种转移刚好和线性筛遍历质因子的过程完全对齐，所以可以在筛素数的同时把整张 `phi` 表一起推出来。边界 `phi(1)=1` 则是整套递推的起点。

所以这类题最重要的是把筛法和函数性质连起来：**先分清“新增一个不同质因子”和“重复乘已有质因子”两种情况。**

### 核心代码

```cpp
phi[1] = 1;
for(int i = 2; i <= n; i++){
  if(!vis[i]) prime[++pcnt] = i, phi[i] = i - 1;
  for(int j = 1; j <= pcnt && i * prime[j] <= n; j++){
    int p = prime[j], x = i * p;
    vis[x] = 1;
    if(i % p == 0){ phi[x] = phi[i] * p; break; }
    phi[x] = phi[i] * (p - 1);
  }
}
```

### 复杂度

时间 `O(n)`，空间 `O(n)`。

---

## 22. [P2568 GCD](https://www.luogu.com.cn/problem/P2568)

`欧拉函数` `质数统计` `互质对数`

### 题意

给定 `n`，统计 `1<=x,y<=n` 中满足 `gcd(x,y)` 为素数的有序数对个数。

### 分析

若 `gcd(x,y)=p` 为素数，则写成 `x=p*a,y=p*b`，其中 `gcd(a,b)=1` 且 `a,b<=n/p`。长度为 `m` 的区间内有序互质对个数是 $1+2*sum_{i=2..m} phi(i)$，所以只要先筛出 `phi` 前缀和，再对每个质数 `p` 累加 `2*S[n/p]-1`。这题和 P2257 同题型，只是变成单组并且可以直接按质数枚举。

### 核心代码

```cpp
phi[1] = 1;
for(int i = 2; i <= n; i++){
  if(!vis[i]) prime[++pcnt] = i, phi[i] = i - 1;
  for(int j = 1; j <= pcnt && i * prime[j] <= n; j++){
    int p = prime[j], x = i * p;
    vis[x] = 1;
    if(i % p == 0){ phi[x] = phi[i] * p; break; }
    phi[x] = phi[i] * (p - 1);
  }
}
for(int i = 1; i <= n; i++) pre[i] = pre[i - 1] + phi[i];
for(int i = 1; i <= pcnt; i++) ans += 2LL * pre[n / prime[i]] - 1;
```

### 复杂度

预处理 `O(n)`，统计 `O(pi(n))`。

---

## 23. [P3383 【模板】线性筛素数](https://www.luogu.com.cn/problem/P3383)

`线性筛` `第 k 小质数` `离线查询`

### 题意

先给定上界 `n`，再有若干询问，每次输出不超过 `n` 的第 `k` 小质数。

### 分析

这题不是在线判素数，而是典型的“先一次性预处理，再回答很多静态询问”。既然上界 `n` 先给出，最自然的做法当然不是对每次询问重新判，而是把 `1..n` 的素数整张筛出来。

线性筛的优势在于每个合数只会被自己的最小质因子筛到一次，因此总复杂度是线性的。筛完以后，质数已经天然按升序存进 `prime[]`，第 `k` 小素数查询就退化成数组访问。

所以这题的核心不是“会筛”，而是先做出那个决策：**多次静态查询优先整体预处理，而不是逐问求解。**

### 核心代码

```cpp
for(int i = 2; i <= n; i++){
  if(!vis[i]) prime[++pcnt] = i;
  for(int j = 1; j <= pcnt && 1LL * i * prime[j] <= n; j++){
    vis[i * prime[j]] = 1;
    if(i % prime[j] == 0) break;
  }
}
```

### 复杂度

预处理 `O(n)`，单次询问 `O(1)`。

---

## 24. [P2043 质因子分解](https://www.luogu.com.cn/problem/P2043)

`Legendre` `阶乘质因数分解` `筛素数`

### 题意

对 `N!` 做质因数分解，输出每个质数 `p` 在分解中的指数。

### 分析

先筛出 `1..N` 的全部质数。对某个质数 `p`，它在 `N!` 中的次数是 `floor(N/p)+floor(N/p^2)+...`，这就是 Legendre 公式。因为 `N<=10000`，直接对每个质数做这一串整除就够了。

### 核心代码

```cpp
for(int p : primes){
  int x = n, cnt = 0;
  while(x) x /= p, cnt += x;
  if(cnt) print(p, cnt);
}
```

### 复杂度

筛法 `O(n)`，统计部分约为 `O(pi(n) log n)`。

---

## 25. [P5736 【深基7.例2】质数筛](https://www.luogu.com.cn/problem/P5736)

`筛法` `判素数` `数组过滤`

### 题意

给定 `n` 个不超过 `1e5` 的正整数，删除其中不是质数的数，按原顺序输出剩下的值。

### 分析

这题虽然很基础，但很适合作为筛法使用场景的入口：当很多数字都落在同一个不大的上界里时，最省事的往往不是逐个判素，而是先预处理一整张真假表。

筛完 `is_prime[x]` 以后，原题就变成最普通的数组过滤：顺序扫一遍输入，保留那些被标记为质数的值即可。也就是说，真正有价值的不是后半段遍历，而是前半段把“是否为质数”批量变成 `O(1)` 查询。

所以这题能帮助读者建立一个很实用的习惯：**范围小、查询多时，优先想预处理判定表。**

### 核心代码

```cpp
fill(is_prime, is_prime + M, true);
is_prime[0] = is_prime[1] = false;
for(int i = 2; i * i < M; i++) if(is_prime[i])
  for(int j = i * i; j < M; j += i) is_prime[j] = false;
for(int i = 1; i <= n; i++) if(is_prime[a[i]]) keep.push_back(a[i]);
```

### 复杂度

预处理 `O(M log log M)`，过滤 `O(n)`。

---

## 26. [P1029 [NOIP 2001 普及组] 最大公约数和最小公倍数问题](https://www.luogu.com.cn/problem/P1029)

`gcd` `lcm` `因子枚举`

### 题意

给定 `x0,y0`，统计有多少组正整数有序对 `(P,Q)` 满足 `gcd(P,Q)=x0` 且 `lcm(P,Q)=y0`。

### 分析

设 `P=x0*a,Q=x0*b`，则 `gcd(a,b)=1` 且 `a*b=y0/x0`。所以只要枚举 `t=y0/x0` 的因子对 `(d,t/d)`，检查二者是否互质。每一组互质因子对都对应一组合法的 `(a,b)`，因为题目是有序对，通常会成对贡献。

### 核心代码

```cpp
int solve(int x0, int y0){
  if(y0 % x0) return 0;
  int t = y0 / x0, ans = 0;
  for(int d = 1; d * d <= t; d++) if(t % d == 0){
    int e = t / d;
    if(gcd(d, e) == 1) ans += (d == e ? 1 : 2);
  }
  return ans;
}
```

### 复杂度

时间 `O(sqrt(y0/x0) log V)`。

---

# 六、矩阵快速幂与高精度幂

这一章处理“转移可以重复很多次”的题。无论是线性递推、模意义乘法还是超大指数，本质都是尽量把重复操作压成二进制拆分，再在矩阵或模乘结构上做快速合成。

## 27. [P1962 斐波那契数列](https://www.luogu.com.cn/problem/P1962)

`矩阵快速幂` `Fibonacci` `线性递推`

### 题意

给定很大的 `n`，求第 `n` 项 Fibonacci 数对 `1e9+7` 取模后的值。

### 分析

$F_n=F_{n-1}+F_{n-2}$ 是最标准的二阶线性递推，可写成矩阵 `[[1,1],[1,0]]`。把转移矩阵做 `n-1` 次幂后乘上初始列向量，就能在 `log n` 时间拿到答案。这里最容易错的是本题 `F_1=F_2=1`，因此 `n<=2` 要单独返回。

### 核心代码

```cpp
struct Mat{ long long a[2][2]; };
Mat mul(Mat x, Mat y){
  Mat r{};
  for(int i = 0; i < 2; i++)
    for(int k = 0; k < 2; k++)
      for(int j = 0; j < 2; j++)
        r.a[i][j] = (r.a[i][j] + x.a[i][k] * y.a[k][j]) % MOD;
  return r;
}
long long fib(long long n){
  if(n <= 2) return 1;
  Mat base = {{{1, 1}, {1, 0}}};
  Mat res = {{{1, 0}, {0, 1}}};
  for(long long k = n - 1; k; k >>= 1){ if(k & 1) res = mul(res, base); base = mul(base, base); }
  return res.a[0][0];
}
```

### 复杂度

时间 `O(log n)`，空间 `O(1)`。

---

## 28. [P1939 矩阵加速（数列）](https://www.luogu.com.cn/problem/P1939)

`矩阵快速幂` `三阶递推` `状态设计`

### 题意

数列满足 `a_1=a_2=a_3=1`，$a_x=a_{x-1}+a_{x-3}$，多组询问第 `n` 项。

### 分析

递推依赖 `x-1` 和 `x-3`，所以状态要保留连续三项。设状态列向量是 $[a_n,a_{n-1},a_{n-2}]^T$，则转移矩阵为 `[[1,0,1],[1,0,0],[0,1,0]]`。每次询问把矩阵快速幂做到 `n-3` 即可。

### 核心代码

```cpp
struct Mat{ long long a[3][3]; };
Mat T = {{{1, 0, 1}, {1, 0, 0}, {0, 1, 0}}};
long long solve(long long n){
  if(n <= 3) return 1;
  Mat res = {{{1, 0, 0}, {0, 1, 0}, {0, 0, 1}}}, base = T;
  for(long long k = n - 3; k; k >>= 1){ if(k & 1) res = mul(res, base); base = mul(base, base); }
  return (res.a[0][0] + res.a[0][1] + res.a[0][2]) % MOD;
}
```

### 复杂度

单次询问时间 `O(log n)`。

---

## 29. [P3390 【模板】矩阵快速幂](https://www.luogu.com.cn/problem/P3390)

`矩阵快速幂` `通用模板` `二进制拆幂`

### 题意

给定 `n*n` 矩阵 `A` 和指数 `k`，求 `A^k mod 1e9+7`。

### 分析

矩阵快速幂本质上并不神秘，它只是把“快速幂依赖乘法满足结合律”这件事，从数推广到了矩阵。既然矩阵乘法也满足结合律，那么 `A^k` 一样可以按二进制拆幂。

因此做法完全平移：答案初始化为单位阵，表示乘法单位元；当前指数最低位是 `1`，就把当前底矩阵乘进答案；每轮把底矩阵平方，指数右移。和标量版本相比，唯一新增的只是矩阵乘法本身。

所以模板里真正该记住的不是三重循环，而是这句抽象：**只要运算满足结合律，二进制快速幂就能套上去。**

### 核心代码

```cpp
struct Mat{ long long a[105][105]; };
Mat mul(Mat x, Mat y, int n){
  Mat r{};
  for(int i = 1; i <= n; i++)
    for(int k = 1; k <= n; k++) if(x.a[i][k])
      for(int j = 1; j <= n; j++)
        r.a[i][j] = (r.a[i][j] + x.a[i][k] * y.a[k][j]) % MOD;
  return r;
}
Mat qpow(Mat a, long long k, int n){
  Mat r{}; for(int i = 1; i <= n; i++) r.a[i][i] = 1;
  while(k){ if(k & 1) r = mul(r, a, n); a = mul(a, a, n); k >>= 1; }
  return r;
}
```

### 复杂度

时间 `O(n^3 log k)`，空间 `O(n^2)`。

---

## 30. [P1045 [NOIP 2003 普及组] 麦森数](https://www.luogu.com.cn/problem/P1045)

`高精度` `快速幂` `截断乘法`

### 题意

给定 `P`，输出 `2^P-1` 的十进制位数，以及它的最后 `500` 位数字。

### 分析

位数直接用 `floor(P*log10(2))+1`。真正的主体是只保留后 `500` 位的大整数快速幂：把高精度数按十进制低位在前存入数组，乘法时仍做普通卷积，但每一步都把长度截到 `500` 位，这样复杂度足够。最后把结果减一并按每行 `50` 位输出。

### 核心代码

```cpp
const int L = 500;
void mul(int a[], int b[], int c[]){
  static int t[L + 5]; memset(t, 0, sizeof t);
  for(int i = 0; i < L; i++)
    for(int j = 0; i + j < L; j++) t[i + j] += a[i] * b[j];
  for(int i = 0; i < L - 1; i++) t[i + 1] += t[i] / 10, t[i] %= 10;
  memcpy(c, t, sizeof t);
}
void qpow(int p){
  int base[L] = {2}, res[L] = {1}, tmp[L];
  while(p){ if(p & 1) mul(res, base, tmp), memcpy(res, tmp, sizeof tmp); mul(base, base, tmp), memcpy(base, tmp, sizeof tmp); p >>= 1; }
  for(int i = 0; i < L; i++) if(res[i]){ res[i]--; break; } else res[i] = 9;
}
```

### 复杂度

时间约 `O(L^2 log P)`，其中 `L=500`，空间 `O(L)`。

---

# 七、幂运算模板收尾

最后这一章用一题把快速幂模板收束回来。它更像整个专题的收尾提醒：很多数论题最后落地时，并不需要再发明新工具，而是要把前面反复出现的幂、模和递推模板写得稳、写得准。

## 31. [P1226 【模板】快速幂](https://www.luogu.com.cn/problem/P1226)

`快速幂` `二进制拆分` `取模`

### 题意

给定 `a,b,p`，求 `a^b mod p`，并按题目规定格式输出。

### 分析

快速幂最核心的观察是：指数 `b` 可以写成若干个二进制位之和，因此 `a^b` 可以拆成若干个 $a^{2^k}$ 的乘积。

于是循环里只要维护当前底数代表哪一个 `2^k` 次幂：若当前位是 `1`，就把它乘进答案；无论这一位是否使用，底数都要平方，表示进入下一位。整个过程只需 `log b` 轮。

所以这道模板题真正要记住的是二进制拆分思想：**把重复乘法按“是否取这个二进制位”压成对数级。**

### 核心代码

```cpp
long long qpow(long long a, long long b, long long p){
  long long ans = 1 % p;
  while(b){
    if(b & 1) ans = ans * a % p;
    a = a * a % p;
    b >>= 1;
  }
  return ans;
}
```

### 复杂度

时间 `O(log b)`，空间 `O(1)`。

---
