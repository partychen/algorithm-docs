---
title: "一本通 数学基础高阶专题精选解题报告"
subtitle: "∑ 从矩乘递推、数论构造到组合博弈的高手训练主线"
order: 8
icon: "∞"
---

# 一本通 数学基础高阶专题精选解题报告

这一组题从矩阵快速幂一路走到组合博弈，题型跨度很大，但真正反复出现的动作其实很一致：先把原问题压成一个更稳定的结构，再在那个结构里做计数、判定或最优决策。前半段偏递推与数论，后半段逐步转向组合构造与博弈分析，读的时候最值得抓住的是“题面语言怎样翻译成模型语言”。

# 一、矩阵快速幂与递推压缩

这一章先把“大步数”压成小状态：有的题把位置转成矩阵，有的题把分式递推压成射影变换，还有的题表面是高维求和，实质却只剩一个 $2\times2$ 的斐波那契核。

## 1. [1795：散步](http://ybt.ssoier.cn:8088/problem_show.php?pid=1795)

`高手训练` `高手(六)数学基础` `第1章 快速幂矩乘`

### 题意

人在数轴原点出发，每一步只能向左或向右走一个单位，而且任意时刻离家的距离都不能超过 $m$。问走了 $n$ 步以后恰好回到原点的方案数，答案对 $10^9+7$ 取模。

### 分析

题目一眼看上去像计数 DP，但真正卡人的地方是 $n$ 非常大，而可达位置只有 $[-m,m]$ 这 $2m+1$ 个。于是先把“走了多少步”从显式循环里拿掉，只保留“当前位置”这个有限状态，转移就是相邻位置之间的连边。

这样一来，长度为 $n$ 的散步方案数，就是转移矩阵做 $n$ 次之后，从原点状态回到原点状态的系数。矩阵大小只和 $m$ 有关，恰好适合用矩阵快速幂把 $n$ 这条长时间轴压缩掉。

### 核心代码

```cpp
const int MOD = 1000000007;
using Mat = vector<vector<long long>>;
Mat mul(Mat a, Mat b){
  int n = a.size(); Mat c(n, vector<long long>(n));
  for(int i = 0; i < n; i++) for(int k = 0; k < n; k++) if(a[i][k])
    for(int j = 0; j < n; j++) c[i][j] = (c[i][j] + a[i][k] * b[k][j]) % MOD;
  return c;
}
long long solve(long long n, int m){
  int S = 2 * m + 1, o = m; Mat A(S, vector<long long>(S));
  for(int i = 0; i < S; i++){
    if(i) A[i][i - 1] = 1;
    if(i + 1 < S) A[i][i + 1] = 1;
  }
  Mat R(S, vector<long long>(S));
  for(int i = 0; i < S; i++) R[i][i] = 1;
  for(; n; n >>= 1, A = mul(A, A)) if(n & 1) R = mul(R, A);
  return R[o][o];
}
```

### 复杂度

时间复杂度 $O(m^3 \log n)$，空间复杂度 $O(m^2)$。

---

## 2. [1796：斐波那契串](http://ybt.ssoier.cn:8088/problem_show.php?pid=1796)

`高手训练` `高手(六)数学基础` `第1章 快速幂矩乘`

### 题意

给出递推串 $S_0="0",S_1="0",S_i=S_{i-2}S_{i-1}$，再给定一个 $0/1$ 串 $T$，要求统计 $T$ 在 $S_N$ 中出现多少次，答案对 $P$ 取模。

### 分析

先别急着上 KMP。按题面递推把前几项写出来：$S_0,S_1,S_2,S_3,\dots$ 全都是若干个字符 `0` 的拼接，长度满足斐波那契式增长。这一步识别出来以后，原题就从“斐波那契串匹配”瞬间降成了“全零串里匹配一个给定模式串”。

因此只有两种情况：如果 $T$ 中出现过 `1`，答案直接为 $0$；如果 $T$ 也是全零串，那么出现次数就是 $|S_N|-|T|+1$，前提是长度够长。长度本身只需要一个斐波那契型快速幂求出即可，再额外做一份饱和计算判断是否已经达到 $|T|$。

### 核心代码

```cpp
pair<long long,long long> fib(long long n, long long mod){
  if(!n) return {0, 1};
  auto [a, b] = fib(n >> 1, mod);
  long long c = a * ((2 * b % mod - a + mod) % mod) % mod;
  long long d = (a * a + b * b) % mod;
  if(n & 1) return {d, (c + d) % mod};
  return {c, d};
}
long long solve(long long N, string T, long long P){
  if(T.find('1') != string::npos) return 0;
  auto [lenMod, _] = fib(N + 2, P);      // |S_N| = F_{N+1}
  long long lenSat = min<long long>(fib(N + 2, (long long)4e18).first, (long long)T.size());
  if(lenSat < (long long)T.size()) return 0;
  return (lenMod - (long long)T.size() + 1 + P) % P;
}
```

### 复杂度

时间复杂度 $O(\log N)$，空间复杂度 $O(\log N)$。

---

## 3. [1797：K维斐波那契](http://ybt.ssoier.cn:8088/problem_show.php?pid=1797)

`高手训练` `高手(六)数学基础` `第1章 快速幂矩乘`

### 题意

构造一个边长都是 $n$ 的 $k$ 维超立方体，位置 $(i_1,\dots,i_k)$ 的值是 $F(i_1+\cdots+i_k-k+1)$，要求所有元素之和，答案对 $10^9+7$ 取模。

### 分析

真正该抓住的是斐波那契数列的矩阵表示。记 $Q=\begin{pmatrix}1&1\\1&0\end{pmatrix}$，则 $F_t$ 可以从 $Q^{t-1}$ 的首分量读出。把每一维的下标求和拆开后，所有位置的贡献会自然变成

$$(I+Q+Q^2+\cdots+Q^{n-1})^k$$

作用在初始向量上的结果。也就是说，这道题不是在高维数组上做 DP，而是在一个 $2\times2$ 的矩阵环里做“几何级数 + 幂”。维度再高，核心状态也始终只有两维。

### 核心代码

```cpp
struct Mat{ long long a[2][2]; };
Mat mul(Mat x, Mat y){
  Mat z{}; for(int i=0;i<2;i++) for(int k=0;k<2;k++) for(int j=0;j<2;j++)
    z.a[i][j]=(z.a[i][j]+x.a[i][k]*y.a[k][j])%MOD; return z;
}
pair<Mat,Mat> calc(long long n, Mat Q){
  if(n==1){ Mat I{{1,0,0,1}}; return {Q,I}; }
  auto [p,s]=calc(n>>1,Q); Mat pp=mul(p,p), ss=mul(s,mul(p,s));
  if(n&1) return {mul(pp,Q), add(ss, pp)};
  return {pp, add(s, mul(p,s))};
}
long long solve(long long n,long long k){
  Mat Q{{1,1,1,0}}, v{{1,0,0,0}};
  Mat S = sumPow(Q, n), A = qpow(S, k);
  return A.a[0][0];
}
```

### 复杂度

时间复杂度 $O(\log n+\log k)$，空间复杂度 $O(\log n+\log k)$。

---

## 4. [1798：递推数列](http://ybt.ssoier.cn:8088/problem_show.php?pid=1798)

`高手训练` `高手(六)数学基础` `第1章 快速幂矩乘`

### 题意

递推式为 $f(i)=\dfrac{af(i-1)+b}{cf(i-1)+d}\bmod p$，给出初值和 $n$，求第 $n$ 项。

### 分析

看到分式线性变换，最自然的转身就是把它当成射影变换。矩阵
$\begin{pmatrix}a&b\\c&d\end{pmatrix}$
作用在列向量 $\binom{x}{1}$ 上，得到的新比值恰好就是 $\dfrac{ax+b}{cx+d}$。

于是连续做 $n$ 次递推，不再是反复代公式，而是同一个 $2\times2$ 矩阵连乘 $n$ 次。最后把矩阵幂乘到初始向量上，再用分子乘分母逆元还原成数值即可。这题的关键不是模逆，而是先把递推认成“矩阵反复作用”。

### 核心代码

```cpp
struct Mat{ long long a[2][2]; };
Mat mul(Mat x, Mat y, long long p){
  Mat z{}; for(int i=0;i<2;i++) for(int k=0;k<2;k++) for(int j=0;j<2;j++)
    z.a[i][j]=(z.a[i][j]+x.a[i][k]*y.a[k][j])%p; return z;
}
long long solve(long long f0,long long a,long long b,long long c,long long d,long long n,long long p){
  Mat A{{a,b,c,d}}, R{{1,0,0,1}};
  for(;n;n>>=1,A=mul(A,A,p)) if(n&1) R=mul(R,A,p);
  long long x=(R.a[0][0]*f0+R.a[0][1])%p;
  long long y=(R.a[1][0]*f0+R.a[1][1])%p;
  return x*qpow(y,p-2,p)%p;
}
```

### 复杂度

时间复杂度 $O(\log n)$，空间复杂度 $O(1)$。

---

## 5. [1799：数列](http://ybt.ssoier.cn:8088/problem_show.php?pid=1799)

`高手训练` `高手(六)数学基础` `第1章 快速幂矩乘`

### 题意

长度至少为 $3$，元素都在 $1\sim n$ 内，并满足 $(a_k-a_{k-2})(a_{k-1}-a_{k-2})<0$。问这样的序列一共有多少个，$n$ 是一个可能有五千位的十进制整数。

### 分析

先别被巨大的 $n$ 吓到，先看条件本身。它要求 $a_{k-1}$ 和 $a_k$ 分别落在 $a_{k-2}$ 的两侧，所以一旦前两个数确定，后面每一步都只能在“当前已选值集合”的另一侧接着摆。把若干不同的值按大小排好以后，会发现：任取一个大小至少为 $3$ 的子集，合法排列恰好只有两种——从中间向左右交替扩，或者反过来交替扩。

于是计数一下就变成了选子集：答案是 $2\sum_{m=3}^{n} \binom{n}{m}=2\left(2^n-1-n-\binom{n}{2}\right)$。剩下的工作只是在模数意义下处理一个超大十进制整数的幂与取模。

### 核心代码

```cpp
const long long MOD = 1000000007, INV2 = 500000004;
long long modPow2(string s){
  long long ans = 1;
  for(char ch : s) ans = qpow(ans, 10) * qpow(2, ch - '0') % MOD;
  return ans;
}
long long solve(string n){
  long long x = 0;
  for(char ch : n) x = (x * 10 + ch - '0') % MOD;
  long long p2 = modPow2(n);
  long long c2 = x * ((x - 1 + MOD) % MOD) % MOD * INV2 % MOD;
  return 2 * ((p2 - 1 - x - c2) % MOD + MOD) % MOD;
}
```

### 复杂度

时间复杂度 $O(|n|\log MOD)$，空间复杂度 $O(1)$。

---

# 二、素数、约数与结构拆分

这一组题开始从递推转向数论结构。重点不在公式多，而在先把对象拆干净：总和拆成质数和、异或条件拆成差值与按位约束、互质限制拆成质因子掩码。

## 6. [1800：质数](http://ybt.ssoier.cn:8088/problem_show.php?pid=1800)

`高手训练` `高手(六)数学基础` `第2章 素数约数`

### 题意

把 $1\sim n$ 分成尽量少的若干集合，使每个集合元素和都是质数；如果存在方案，还要给出一种划分。

### 分析

这里要先把“划分”与“质数和”拆开看。设总和 $S=\dfrac{n(n+1)}2$，如果 $S$ 本身是质数，显然一组就够；如果不是，就尽量把 $S$ 拆成少量质数之和。因为 $1\sim n$ 可以凑出任意不超过 $S$ 的目标和，所以一旦质数分拆确定，具体拿哪些数可以用贪心子集和去回填。

于是问题主体就退化成数论判定：优先判断 $S$ 是否为质数，再检查是否能写成两个质数之和，否则用三质数兜底。构造时每次从大到小贪心拿数填满某个目标和，剩下的数自动归到最后一组。

### 核心代码

```cpp
vector<int> take(long long need, vector<int>& rest, int id, vector<int>& col){
  for(int i = rest.size() - 1; i >= 0 && need; i--)
    if(rest[i] <= need) need -= rest[i], col[rest[i]] = id, rest.erase(rest.begin() + i);
  return rest;
}
void solve(int n){
  long long S = 1LL * n * (n + 1) / 2;
  vector<long long> primeParts = decomposeIntoPrimes(S); // 1/2/3 个质数
  vector<int> rest(n); iota(rest.begin(), rest.end(), 1);
  vector<int> col(n + 1, primeParts.size());
  for(int i = 0; i + 1 < (int)primeParts.size(); i++) take(primeParts[i], rest, i + 1, col);
  output(col, primeParts.size());
}
```

### 复杂度

筛法和判素数部分时间复杂度 $O(S\log\log S)$，构造部分时间复杂度 $O(n)$，空间复杂度 $O(S)$。

---

## 7. [1801：异或](http://ybt.ssoier.cn:8088/problem_show.php?pid=1801)

`高手训练` `高手(六)数学基础` `第2章 素数约数`

### 题意

在 $[1,n]$ 中统计无序数对 $(a,b)$，满足 $\gcd(a,b)=a\operatorname{xor} b$。

### 分析

这题的入口不是暴力枚举，而是先把等式里同时出现的 `gcd`、`xor` 和两个数的差拆开。设公共值为 $d$，因为 $a\oplus b=d$，而异或等于差值时必须没有进位，所以可写成 $b=a+d$ 且 $a\&d=0$。另一方面 $\gcd(a,b)=\gcd(a,a+d)=d$，于是又得到 $d\mid a$。

这样一来，合法数对被完全刻画成：枚举差值 $d$，枚举它的倍数 $a$，若同时满足 $a+d\le n$ 和 $(a\&d)=0$，那么 $(a,a+d)$ 就是一组答案。式子一旦化到这里，整题就只剩一个调和级数规模的枚举。

### 核心代码

```cpp
long long solve(int n){
  long long ans = 0;
  for(int d = 1; d <= n; d++){
    for(int a = d; a + d <= n; a += d){
      if((a & d) == 0) ans++;
    }
  }
  return ans;
}
```

### 复杂度

时间复杂度约为 $O(n\log n)$，空间复杂度 $O(1)$。

---

## 8. [1802：寿司晚宴](http://ybt.ssoier.cn:8088/problem_show.php?pid=1802)

`高手训练` `高手(六)数学基础` `第2章 素数约数`

### 题意

美味度从 $2$ 到 $n$ 的寿司可以分给两个人吃，要求两边选中的所有数两两互质，问和谐方案数模 $p$。

### 分析

“两边任取两个数不能有公因子”这句话，要先翻译成质因子冲突。$n\le 500$ 时，大于 $19$ 的质因子不可能在一个数里出现两次以上，于是每个数都可以拆成两部分：小质因子集合压成一个 $8$ 位掩码，大质因子只剩一个“尾巴”。

接下来就能做典型的双集合状态 DP：用两个掩码分别表示已经分给两个人的小质因子集合，转移时要求新数的掩码与对方不冲突。为了处理大质因子相同的一批数，按大尾巴分组，组内用两份临时 DP 独立转移，最后再合并回去，就能避免同组元素互相影响。

### 核心代码

```cpp
for(auto &grp : groups){
  auto f0 = f, f1 = f;
  for(auto [msk, way] : grp){
    for(int a = FULL; a >= 0; a--) for(int b = FULL; b >= 0; b--){
      if(msk & b) continue;
      add(f0[a | msk][b], f[a][b]);
      if(msk & a) continue;
      add(f1[a][b | msk], f[a][b]);
    }
  }
  for(int a = 0; a <= FULL; a++) for(int b = 0; b <= FULL; b++)
    f[a][b] = (f0[a][b] + f1[a][b] - f[a][b]) % mod;
}
```

### 复杂度

时间复杂度 $O(n\cdot 2^{2\pi(19)})$，空间复杂度 $O(2^{2\pi(19)})$。

---

## 9. [1803：列数字](http://ybt.ssoier.cn:8088/problem_show.php?pid=1803)

`高手训练` `高手(六)数学基础` `第2章 素数约数`

### 题意

对一个 $1\sim N$ 的排列反复施加自身映射，直到重新回到恒等排列。问所有可能的排数有多少种。

### 分析

排列反复作用后何时回到原样，只由它的循环分解决定。若循环长度分别为 $c_1,c_2,\dots$，回到初始排列的最小步数就是 $\operatorname{lcm}(c_1,c_2,\dots)$，题目里的排数则再加一。

所以本质问题是：把 $N$ 拆成若干循环长度后，最小公倍数一共可能取到多少种不同的值。对一个给定的公倍数，只需要保留每个质数的最高次幂，于是可以把“选若干循环长度”压成“选若干个质数幂，总代价不超过 $N$”的背包。不同的乘积对应不同的公倍数，DP 统计即可。

### 核心代码

```cpp
vector<int> pp;
for(int p : primes){
  long long x = p;
  while(x <= N) pp.push_back(x), x *= p;
}
bitset<MAXS> can; can[0] = 1;
for(int v : pp) can |= (can << v);
int ans = 0;
for(int s = 0; s <= N; s++) if(can[s]) ans++;
cout << ans; // 最后排数还要再加 1

```

### 复杂度

时间复杂度约为 $O(N\log N / w)$，空间复杂度 $O(N / w)$。

---

## 10. [1804：最大真因数](http://ybt.ssoier.cn:8088/problem_show.php?pid=1804)

`高手训练` `高手(六)数学基础` `第2章 素数约数`

### 题意

求区间 $[l,r]$ 内所有合数的最大真因数之和。

### 分析

合数 $x$ 的最大真因数其实非常好写：它等于 $\dfrac{x}{\operatorname{spf}(x)}$，其中 $\operatorname{spf}(x)$ 是最小质因子。因为最小质因子越小，除出来的真因数就越大。

区间很大但长度不超过 $10^6$，正是分段筛的工作区间。先用普通筛法拿到 $\sqrt r$ 以内的质数，再在 $[l,r]$ 上标记每个数的最小质因子；最后对所有还大于 $1$ 且不是质数的数加上 $x/\operatorname{spf}(x)$ 即可。

### 核心代码

```cpp
long long solve(long long L, long long R){
  vector<long long> val(R - L + 1), spf(R - L + 1, 0);
  for(long long i = L; i <= R; i++) val[i - L] = i;
  for(long long p : primesUpTo(sqrt(R))){
    long long s = max(p * p, (L + p - 1) / p * p);
    for(long long x = s; x <= R; x += p){
      if(!spf[x - L]) spf[x - L] = p;
      while(val[x - L] % p == 0) val[x - L] /= p;
    }
  }
  long long ans = 0;
  for(long long i = L; i <= R; i++) if(spf[i - L]) ans += i / spf[i - L];
  return ans;
}
```

### 复杂度

时间复杂度约为 $O((r-l+1)\log\log r)$，空间复杂度 $O(r-l+1)$。

---

# 三、同余、周期与模意义计数

这里的共性是“模环里看问题”。逐位统计、离散对数、数位根同余、线性递推周期，本质上都在有限状态或有限群里计数，只是外衣不同。

## 11. [1805：数数](http://ybt.ssoier.cn:8088/problem_show.php?pid=1805)

`高手训练` `高手(六)数学基础` `第3章 同余问题`

### 题意

对等差数列 $B+A,B+2A,\dots,B+NA$ 的每一项写成二进制，求所有数里一共出现了多少个 `1`。

### 分析

统计二进制位贡献时，最稳的套路永远是逐位考虑。对第 $k$ 位来说，它只和模 $2^{k+1}$ 的结果有关，于是我们只需要统计有多少个 $t$ 使得 $B+tA$ 落在这一位为 $1$ 的那段剩余类里。

这一步的关键是把等差数列放进模环：序列 $(B+tA)\bmod 2^{k+1}$ 本身也是一个循环节很短的等差序列。设 $g=\gcd(A,2^{k+1})$，就能把问题化成一个长度为 $2^{k+1}/g$ 的周期计数，再用整除分块或 `floor_sum` 把完整周期和残段一起算出来。

### 核心代码

```cpp
long long countBit(long long A,long long B,long long N,int k){
  long long mod = 1LL << (k + 1), g = gcd(A, mod), per = mod / g;
  long long full = N / per, rem = N % per;
  auto calc = [&](long long len){
    return floor_sum(len, mod, A % mod, B % mod + (1LL << k))
         - floor_sum(len, mod, A % mod, B % mod);
  };
  return full * calc(per) + calc(rem);
}
long long solve(long long A,long long B,long long N){
  long long ans = 0;
  for(int k = 0; k < 63; k++) ans += countBit(A, B + A, N, k);
  return ans;
}
```

### 复杂度

时间复杂度 $O(\log V\cdot \log V)$，空间复杂度 $O(1)$。

---

## 12. [1806：计算器](http://ybt.ssoier.cn:8088/problem_show.php?pid=1806)

`高手训练` `高手(六)数学基础` `第3章 同余问题`

### 题意

三类询问分别是快速幂、离散对数和组合数模合数。

### 分析

这题不是三问混在一起做，而是先识别出三套成熟工具：类型一直接快速幂；类型二是离散对数，模数不一定是质数，所以要用扩展 BSGS；类型三是组合数模合数，要把模数分解成若干质数幂，在每个质数幂模数下算出 $C_z^y$，再用 CRT 合并。

真正的思路主线是“按题型拆工具箱”。题面把三种运算摆在一起，并不是要找统一公式，而是考你能否迅速把它们送到各自最稳的模板里。

### 核心代码

```cpp
long long solve(int type,long long y,long long z,long long P){
  if(type == 1) return qpow(y, z, P);
  if(type == 2) return exbsgs(y, z, P);          // 无解返回 -1
  vector<long long> mod, rem;
  for(auto [pk, p, a] : factorPrimePowers(P)){
    mod.push_back(pk);
    rem.push_back(C_mod_prime_power(z, y, p, a, pk));
  }
  return crt(rem, mod);
}
```

### 复杂度

单次询问时间复杂度取决于题型：快速幂为 $O(\log z)$，扩展 BSGS 约为 $O(\sqrt P)$，扩展 Lucas 与 CRT 约为 $O(\sum p^a\log P)$。

---

## 13. [1807：区间计数](http://ybt.ssoier.cn:8088/problem_show.php?pid=1807)

`高手训练` `高手(六)数学基础` `第3章 同余问题`

### 题意

设 $D(x)$ 为数位根，若一个数能写成 $x\times D(x)$ 的形式，就称它是喜欢的数。多次询问区间内喜欢的数个数。

### 分析

数位根只有 $1\sim 9$ 这九种可能，这就是突破口。若 $D(x)=r$，则 $x\equiv r\pmod 9$，于是喜欢的数一定能写成 $n=r\cdot x$，并满足 $n\equiv r^2\pmod{9r}$。对每个 $r$，这都会生成一条明确的等差数列。

麻烦在于不同的 $r$ 生成的集合会重叠，所以不能直接把九条数列的答案相加。既然集合只有九个，最自然的处理就是对这九个同余类做容斥：对任意子集，用 CRT 合并对应的同余条件，算出区间内这一交集里有多少个数，最后带符号相加。

### 核心代码

```cpp
long long F(long long X){
  long long ans = 0;
  for(int s = 1; s < (1 << 9); s++){
    vector<long long> a, m;
    for(int i = 0; i < 9; i++) if(s >> i & 1){
      int r = i + 1;
      a.push_back(1LL * r * r % (9LL * r));
      m.push_back(9LL * r);
    }
    auto [x0, lcm, ok] = crt_general(a, m);
    if(ok) ans += (__builtin_popcount(s) & 1 ? 1 : -1) * countAP(X, x0, lcm);
  }
  return ans;
}

```

### 复杂度

单次区间询问时间复杂度 $O(2^9\log V)$，空间复杂度 $O(1)$。

---

## 14. [1808：斐波那契数列](http://ybt.ssoier.cn:8088/problem_show.php?pid=1808)

`高手训练` `高手(六)数学基础` `第3章 同余问题`

### 题意

给定模 $10^{13}$ 的值 $a$，求它第一次在模 $10^{13}$ 的斐波那契数列中出现的位置；若不存在则输出 $-1$。

### 分析

模数很大，但结构非常特殊：$10^{13}=2^{13}\cdot 5^{13}$。因此第一步不是直接在模 $10^{13}$ 上硬做，而是先用 CRT 把问题拆到两个质数幂模数上。

在每个质数幂模数下，斐波那契数列都能借助矩阵快速幂与二次扩域写成乘法群里的离散对数问题，再用 BSGS 找到所有可能的位置同余类。最后把两个模数下的解用 CRT 合并，并在一个 Pisano 周期里取最小的合法位置。整题的建模关键，就是把“找斐波那契第几项”转成“矩阵特征根上的对数方程”。

### 核心代码

```cpp
vector<long long> solvePrimePower(long long a, long long pk){
  auto ext = buildFibExtension(pk);          // 在扩域里构造特征根
  return bsgs_on_fib(ext, a, pk);            // 返回该模数下所有可能的下标同余类
}
long long solve(long long a){
  auto v2 = solvePrimePower(a % POW2, POW2);
  auto v5 = solvePrimePower(a % POW5, POW5);
  long long ans = -1;
  for(long long x : v2) for(long long y : v5)
    ans = updMin(ans, crt_index(x, PER2, y, PER5));
  return ans;
}
```

### 复杂度

主过程由若干次 BSGS 和 CRT 组成，时间复杂度约为 $O(\sqrt{\pi(10^{13})})$ 量级，空间复杂度与哈希表大小同阶。

---

## 15. [1809：日食](http://ybt.ssoier.cn:8088/problem_show.php?pid=1809)

`高手训练` `高手(六)数学基础` `第3章 同余问题`

### 题意

二阶线性递推 $S_i=(XS_{i-1}+YS_{i-2}+Z)\bmod P$ 中，多次询问区间 $[L,R]$ 内有多少个位置满足 $S_i=C$。

### 分析

询问区间很大，但模数 $P$ 很小，于是该从“状态空间”入手。把状态写成二元组 $(S_{i-1},S_i)$，下一步状态唯一确定，因此这是一条在有限状态图上的函数链。状态总数至多 $P^2$，所以序列一定先走一段前缀，再进入循环。

一旦把整条序列拆成“前缀 + 周期”，区间计数就变成前缀和：预处理每个位置是否等于 $C$，同时记录周期段内的总出现次数。之后每个 $[L,R]$ 询问都可以用整周期贡献加两段残余快速回答。

### 核心代码

```cpp
int id(int a,int b){ return a * P + b; }
void build(){
  vector<int> vis(P * P, -1), seq;
  int u = A, v = B;
  while(vis[id(u, v)] == -1){
    vis[id(u, v)] = seq.size(); seq.push_back(u);
    int w = (1LL * X * v + 1LL * Y * u + Z) % P;
    u = v; v = w;
  }
  splitPrefixAndCycle(seq, vis[id(u, v)]);
  buildPrefixSum(seq, C);
}

```

### 复杂度

预处理时间复杂度 $O(P^2)$，单次询问时间复杂度 $O(1)$，空间复杂度 $O(P^2)$。

---

# 四、组合计数与构造型计数

这一章更像是在练“把组合对象翻译成可数的结构”。有的是障碍 Catalan 路径，有的是按方向枚举直线，有的是先把期望展开成子集事件，再逐项求概率。

## 16. [1810：登山](http://ybt.ssoier.cn:8088/problem_show.php?pid=1810)

`高手训练` `高手(六)数学基础` `第4章 组合数学`

### 题意

在 $N\times N$ 格点图上从 $(0,0)$ 走到 $(N,N)$，只能向右或向上，并且始终不能走到对角线 $y=x$ 上方；部分点是障碍。问合法路径数。

### 分析

没有障碍时，这就是标准的 Catalan 路径：只能在主对角线下方行走。带障碍以后，最稳的办法是把“不过界”与“避开障碍”拆开处理。先用反射原理写出任意两点之间、不越过对角线的路径数公式，再把障碍点和终点按坐标排序，做一遍容斥式 DP。

具体地说，`dp[i]` 表示从起点走到第 $i$ 个关键点且中间不经过更早障碍的方案数。转移时只要减去所有能走到它的前驱障碍贡献，就把“禁经过这些点”和“禁越过对角线”同时处理干净了。

### 核心代码

```cpp
long long ways(Point a, Point b){
  int dx = b.x - a.x, dy = b.y - a.y;
  return (C(dx + dy, dx) - C(dx + dy, b.x - a.y + 1) + MOD) % MOD;
}
for(int i = 1; i <= m; i++){
  dp[i] = ways({0, 0}, p[i]);
  for(int j = 1; j < i; j++) if(p[j].y <= p[i].y)
    dp[i] = (dp[i] - dp[j] * ways(p[j], p[i])) % MOD;
}
cout << (dp[m] + MOD) % MOD;

```

### 复杂度

时间复杂度 $O(C^2)$，空间复杂度 $O(C)$。

---

## 17. [1811：多项式相乘](http://ybt.ssoier.cn:8088/problem_show.php?pid=1811)

`高手训练` `高手(六)数学基础` `第4章 组合数学`

### 题意

把 $(x+a_1)(x+a_2)\cdots(x+a_n)$ 完整展开，要求输出展开式总长度对 $10000$ 取模。

### 分析

直接展开当然不现实，但长度其实完全可以按“字符类别”分账。每一项对应选出一个下标集合，集合大小为 $k$ 时，会贡献一个 $x^{n-k}$ 和一个由 $k$ 个因子 $a_i$ 拼成的单项式；而这一层一共有 $\binom nk$ 个单项式。

所以关键不是列出每个单项式，而是统计三件事：所有层里一共出现了多少个 `a_i`，所有下标数字一共出现了多少次，所有 `+`、括号、指数数字一共出现了多少次。前两项可以用组合恒等式 $\sum \binom nk=2^n$ 与每个下标出现 $2^{n-1}$ 次直接压掉，后两项再按十进制位数分块统计即可。

### 核心代码

```cpp
int lenIdx(long long n){
  int s = 0;
  for(long long l = 1, d = 1; l <= n; l *= 10, d++){
    long long r = min(n, l * 10 - 1);
    s = (s + (r - l + 1) % MOD * d) % MOD;
  }
  return s;
}
int solve(long long n){
  int p2 = qpow(2, n - 1, MOD);
  int occA = 1LL * n % MOD * p2 % MOD;
  int occIdx = 1LL * lenIdx(n) * p2 % MOD;
  return (baseSyntax(n) + occA + occIdx + plusAndPower(n)) % MOD;
}

```

### 复杂度

时间复杂度 $O(\log n)$，空间复杂度 $O(1)$。

---

## 18. [1812：网格](http://ybt.ssoier.cn:8088/problem_show.php?pid=1812)

`高手训练` `高手(六)数学基础` `第4章 组合数学`

### 题意

在 $(W+1)\times(H+1)$ 个格点中选 $N$ 个不同点，要求它们共线且相邻两点距离不少于 $D$，统计方案数。

### 分析

共线格点题的第一件事永远是枚举方向。把直线方向写成原始向量 $(dx,dy)$，其中 $\gcd(dx,dy)=1$；若相邻选点之间隔了 $t$ 个原始步长，那么真实间距就是 $t\sqrt{dx^2+dy^2}$，只要满足它不小于 $D$ 即可。

对固定的步向量 $(t\,dx,t\,dy)$，每条线上的点列长度是确定的，能从中截出多少个长度为 $N$ 的连续子段也就确定了。于是整题变成：枚举原始方向与合法倍数，统计有多少条“起点前一格已经出界”的线段，然后按每条线可容纳的点数累加贡献。

### 核心代码

```cpp
for(int dx = 0; dx <= W; dx++) for(int dy = 0; dy <= H; dy++){
  if(dx == 0 && dy == 0) continue;
  if(gcd(dx, dy) != 1) continue;
  for(int t = firstStep(dx, dy, D); valid(dx, dy, t); t++){
    int sx = dx * t, sy = dy * t;
    long long lines = countStartPoints(sx, sy, W, H);
    long long len = countPointsOnLine(sx, sy, W, H);
    ans = (ans + lines * max(0LL, len - N + 1)) % MOD;
  }
}

```

### 复杂度

时间复杂度约为 $O(WH\log(WH))$，空间复杂度 $O(1)$。

---

## 19. [1813：图的计数](http://ybt.ssoier.cn:8088/problem_show.php?pid=1813)

`高手训练` `高手(六)数学基础` `第4章 组合数学`

### 题意

统计有多少个 $n$ 点 $m$ 边的有向图，使得从 $1$ 号点到 $n$ 号点需要经过至少 $n-1$ 条边；图允许重边和自环。

### 分析

最短路长度至少 $n-1$，在 $n$ 个点的图里几乎已经逼到极限了：任何更短的跳跃边一旦出现，就会把路径长度压低。因此要先从“最短路层次”去理解图。把点按从 $1$ 出发的最短距离分层，想达到下界 $n-1$，就意味着这条层次链必须拉满，每一层至多放一个新点，而且不能出现把层差缩短的跨层边。

于是计数时可以按层递推：处理到第 $i$ 个点时，决定还要放多少条自环、重边，以及是否向下一层提供必须存在的连边。因为边数是主要约束，所以状态自然写成“已经放了多少点、多少边”的二维 DP。

### 核心代码

```cpp
dp[1][0] = 1;
for(int i = 1; i < n; i++){
  for(int e = 0; e <= m; e++) if(dp[i][e]){
    for(int add = needEdge(i); e + add <= m; add++){
      long long ways = chooseLegalEdges(i, add); // 不产生更短路径的边集个数
      dp[i + 1][e + add] = (dp[i + 1][e + add] + dp[i][e] * ways) % MOD;
    }
  }
}
cout << dp[n][m];

```

### 复杂度

时间复杂度约为 $O(nm)$，空间复杂度 $O(m)$。

---

## 20. [1814：方格染色](http://ybt.ssoier.cn:8088/problem_show.php?pid=1814)

`高手训练` `高手(六)数学基础` `第4章 组合数学`

### 题意

棋盘里放入 $n^2$ 个互不相同的数，再从 $1\sim m$ 中随机选出 $k$ 个数，出现于棋盘上的对应格子会被染黑。得分是 $2^{r+c}$，其中 $r,c$ 分别是全黑行列数，求期望。

### 分析

看到 $2^{r+c}$，最舒服的展开方式是把指数拆成子集求和：$2^r=\sum_R [R\text{ 中每一行都全黑}]$，列同理。两边一乘，期望就变成对所有行子集 $R$ 和列子集 $C$ 的概率求和。

固定 $R,C$ 之后，要求这些行列上的所有格子都被选中。它们涉及的格子数是 $|R|n+|C|n-|R||C|$，由于棋盘上的数本来就是从 $1\sim m$ 中均匀抽出的不同元素，被选中的概率只取决于这个并集大小，于是可以直接写成一个组合数比值。这样期望值就被压成了双重枚举行列数。

### 核心代码

```cpp
double solve(int n,int m,int k){
  double ans = 0;
  for(int r = 0; r <= n; r++) for(int c = 0; c <= n; c++){
    int need = r * n + c * n - r * c;
    if(need > k) continue;
    double ways = C(n, r) * C(n, c);
    double prob = C(m - need, k - need) / C(m, k);
    ans += ways * prob;
  }
  return min(ans, 1e99);
}

```

### 复杂度

时间复杂度 $O(n^2)$，空间复杂度 $O(1)$。

---

# 五、博弈论与最优决策

最后几题虽然题面各异，但主线非常统一：先把一步操作真正改变了什么抽出来，再决定是做 SG、做树上极小化极大化，还是只保留 win/lose 两类信息。

## 21. [1815：放石子](http://ybt.ssoier.cn:8088/problem_show.php?pid=1815)

`高手训练` `高手(六)数学基础` `第5章 博弈论`

### 题意

在 DAG 上，每次选一个有石子的点，拿走一颗石子，再选一个颜色集合，把对应颜色的所有出边终点各放上一颗石子。双方轮流操作，不能操作者负。

### 分析

题面虽然写着“会放出很多颗石子”，但动作依然是典型的无偏组合游戏：每次只操作一颗石子，所以总局面仍然能拆成各颗石子的 SG 异或和。真正要想的是单颗石子在一个点上的 SG 值怎么算。

把同一颜色的所有出边看成一个整体。如果当前点选择一个颜色集合 $S$，产生的新局面 SG 值就是这些颜色组 SG 异或值的再异或。于是从该点可达的所有 SG 值，正好是若干个数张成的线性空间；线性空间的 mex 非常整齐，等于 $2^{\text{rank}}$。所以自底向上求出每种颜色组的异或值，再做一遍线性基求秩即可。

### 核心代码

```cpp
for(int u : topo_rev){
  vector<int> val;
  for(auto &[col, vec] : byColor[u]){
    int x = 0;
    for(int v : vec) x ^= sg[v];
    val.push_back(x);
  }
  LinearBasis lb;
  for(int x : val) lb.insert(x);
  sg[u] = 1 << lb.rank();
}
int ans = 0;
for(int x : stones) ans ^= sg[x];
cout << (ans != 0);

```

### 复杂度

时间复杂度 $O((n+m)\cdot B^2)$，空间复杂度 $O(nB)$，其中 $B$ 为 SG 值二进制位数。

---

## 22. [1816：取石子](http://ybt.ssoier.cn:8088/problem_show.php?pid=1816)

`高手训练` `高手(六)数学基础` `第5章 博弈论`

### 题意

有若干堆石子，每次可以从一堆里取走 $[a,b]$ 个；如果某人恰好取完一堆，就立刻获胜。问先手还是后手必胜。

### 分析

这题和普通减法博弈最大的不同，是“取空一堆就直接结束”，所以不能把每一堆简单看成独立的普通 SG。正确的切入点是先研究单堆状态的周期：把一堆石子按模 $a+b$ 压缩后，哪些余数是立即必胜，哪些余数只能拖进下一轮，再把这些状态抽象成有限个局面类型。

当多堆放在一起时，真正有意义的是每堆距离“制造必杀点”还有几步，以及这些步数的奇偶配合。于是做法通常是先预处理单堆在一个周期里的胜负类，再把所有堆映到这个周期上，通过有限状态博弈或等价的 Nim 化规则判断总局面的先后手。

### 核心代码

```cpp
vector<int> typ(a + b + 1);
for(int x = 1; x <= a + b; x++) typ[x] = classifySinglePile(x, a, b);
int state = 0;
for(long long x : piles){
  int r = x % (a + b);
  if(r == 0) r = a + b;
  state = mergeState(state, typ[r]);
}
cout << (winState(state) ? "Alice" : "Bob");

```

### 复杂度

预处理时间复杂度 $O((a+b)^2)$，每组数据判定时间复杂度 $O(n)$，空间复杂度 $O(a+b)$。

---

## 23. [1817：染色游戏](http://ybt.ssoier.cn:8088/problem_show.php?pid=1817)

`高手训练` `高手(六)数学基础` `第5章 博弈论`

### 题意

树上点被两人轮流染成红蓝色，最后分别统计红色连通块数与蓝色连通块数，双方都在最优策略下博弈 $K_A-K_B$。

### 分析

连通块数量在树上很好拆：若某种颜色占了若干点，那么它的连通块数等于“该颜色点数减去同色边数”。点数部分由轮次几乎固定，真正博弈的核心就在于：每条边最后是同色还是异色，会给差值带来怎样的变化。

因此这题适合做树形博弈 DP。把树根定下来以后，子树内部无论怎样对抗，最终都只会向父亲暴露很少几类信息：根点如果被当前玩家拿走，能给差值贡献多少；如果被对手牵制，又会损失多少。对子树贡献做大根堆式合并，就能在线性或线性对数时间内完成整棵树的极小化极大化。

### 核心代码

```cpp
void dfs(int u,int fa){
  dp[u] = {{1, 0}, {0, 1}};
  for(int v : g[u]) if(v != fa){
    dfs(v, u);
    dp[u] = merge(dp[u], dp[v]);   // 合并子树在红/蓝接边下的最优值
  }
  dp[u] = normalize(dp[u]);        // 轮到谁选、接到父边是否同色都压进常数状态
}
cout << extract(dp[1]);

```

### 复杂度

时间复杂度 $O(n\log n)$，空间复杂度 $O(n)$。

---

## 24. [1818：树上取石子](http://ybt.ssoier.cn:8088/problem_show.php?pid=1818)

`高手训练` `高手(六)数学基础` `第5章 博弈论`

### 题意

从根开始，轮流在当前结点取走整堆石子，然后只能走向它的某个儿子。Alice 优先让 Bob 尽量少，再让自己尽量多；Bob 反之。

### 分析

因为整局游戏始终沿着一条根到叶子的链走，所以不存在分支互相影响，天然就是树上的递归最优决策。设 $f(u)$ 表示从结点 $u$ 开始，在双方都最优时，最后 Alice 和 Bob 分别还能拿到多少石子。

轮到 Alice 的层，她会在所有儿子方案里先最小化 Bob 的总收益，再在这些方案里最大化自己的；Bob 的层反过来处理。题目强调“保证只存在一组解”，正好说明这种字典序比较不会遇到歧义。于是自底向上做一次树 DP 即可。

### 核心代码

```cpp
pair<int,int> dfs(int u,int dep){
  if(son[u].empty()) return dep & 1 ? make_pair(num[u], 0) : make_pair(0, num[u]);
  pair<int,int> best = dep & 1 ? make_pair(-1, INT_MAX) : make_pair(INT_MAX, -1);
  for(int v : son[u]){
    auto t = dfs(v, dep + 1);
    if(dep & 1) best = min(best, {t.second, -t.first}) == make_pair(t.second, -t.first) ? t : best;
    else best = min(best, {t.first, -t.second}) == make_pair(t.first, -t.second) ? t : best;
  }
  if(dep & 1) best.first += num[u]; else best.second += num[u];
  return best;
}

```

### 复杂度

时间复杂度 $O(n)$，空间复杂度 $O(n)$。

---

## 25. [1819：字符串游戏](http://ybt.ssoier.cn:8088/problem_show.php?pid=1819)

`高手训练` `高手(六)数学基础` `第5章 博弈论`

### 题意

在字典树前缀游戏上进行 $k$ 轮，对不能操作的一方判负，并且下一轮由上一轮的输家先手。问第一轮先手最终能否赢得整场比赛。

### 分析

这是典型的 Trie 博弈，但要同时关心“能不能逼赢”与“能不能逼输”。在字典树上做两类状态：`win[u]` 表示当前玩家从这里出发是否能赢这一轮，`lose[u]` 表示当前玩家是否能把这一轮拖成自己输。叶子结点两者都好算，向上递推也都是标准定义。

当根的 `win` 为假时，第一轮先手连一轮都赢不了；当 `win` 为真且 `lose` 也为真时，先手既能赢也能控轮次，整场一定能赢；只有 `win` 真但 `lose` 假时，才说明胜负取决于总轮数奇偶，这就是最后要看 $k$ 的地方。

### 核心代码

```cpp
void dfs(int u){
  win[u] = false; lose[u] = false;
  bool leaf = true;
  for(int c = 0; c < 26; c++) if(ch[u][c]){
    leaf = false; dfs(ch[u][c]);
    win[u] |= !win[ch[u][c]];
    lose[u] |= !lose[ch[u][c]];
  }
  if(leaf) lose[u] = true;
}
bool ans = win[0] && (lose[0] || (k & 1));

```

### 复杂度

时间复杂度 $O(\sum |S_i|)$，空间复杂度 $O(\sum |S_i|)$。

---
