---
title: "一本通 数学基础高阶专题精选解题报告"
subtitle: "∑ 从快速幂、同余构造到矩阵递推与组合博弈的进阶主线"
order: 8
icon: "∫"
---

# 一本通 数学基础高阶专题精选解题报告

这一组题从快速幂一路走到组合博弈，看上去横跨数论、矩阵、计数与博弈，但真正反复出现的动作很统一：先把题目里的叙述关系压成模方程、递推矩阵、组合系数或必败态，再在那个稳定结构里做快速计算与分类讨论。前半段偏数论工具和模意义构造，后半段逐步转向矩阵递推、Catalan 计数与博弈不变量，阅读时最值得抓住的是“题面条件怎样翻译成可以批量运算的结构”。

# 一、快速幂、筛法与约数结构

这一章先用几道题把快速幂这件“基础运算”打牢，再把筛法放进质数与倍数统计里，最后一路走到约数计数、GCD 和乘法函数的结构拆解。题面跨度不小，但主线很清楚：先把幂算快，再把数的质因子结构看清，很多结论就都能顺着式子落下来。

## 1. [1615：【例 1】序列的第 k 个数](http://ybt.ssoier.cn:8088/problem_show.php?pid=1615)

`快速幂` `等差数列` `等比数列`

### 题意

给出一个序列的前三项 $a,b,c$，已知它只可能是等差数列或等比数列。对每组数据求第 $k$ 项，并且答案对 $200907$ 取模。

### 分析

判断数列类型只看前三项即可：若 $b-a=c-b$，它就是等差数列；否则就是等比数列。题目保证输入合法，所以不需要担心别的情况。

等差数列直接套 $a+(k-1)d$。真正需要加速的是等比数列，因为 $k$ 很大，第 $k$ 项是 $a\times q^{k-1}$，这里的 $q=b/a$。指数上到 $10^9$，必须用快速幂把 $q^{k-1}\bmod 200907$ 在对数时间内算出来。

### 核心代码

```cpp
const long long MOD = 200907;
long long qpow(long long a,long long b){
    long long r=1%MOD;
    for(a%=MOD;b;b>>=1,a=a*a%MOD) if(b&1) r=r*a%MOD;
    return r;
}
long long solve(long long a,long long b,long long c,long long k){
    if(b-a==c-b) return (a%MOD+(k-1)%MOD*((b-a)%MOD)%MOD)%MOD;
    return a%MOD*qpow(b/a,k-1)%MOD;
}
```

### 复杂度

每组数据时间复杂度 $O(\log k)$，空间复杂度 $O(1)$。

---

## 2. [1616：A 的 B 次方](http://ybt.ssoier.cn:8088/problem_show.php?pid=1616)

`快速幂` `取模运算`

### 题意

给出 $a,b,m$，要求计算 $a^b\bmod m$。

### 分析

这是快速幂的标准模板题。直接连乘会做 $b$ 次乘法，$b$ 上到 $10^9$ 显然不可行。

把指数按二进制拆开：若当前位为 $1$，就把当前底数乘进答案；每轮把底数平方、指数右移一位。这样总共只需要处理 $O(\log b)$ 个二进制位。

### 核心代码

```cpp
long long qpow(long long a,long long b,long long mod){
    long long r=1%mod;
    for(a%=mod;b;b>>=1,a=a*a%mod) if(b&1) r=r*a%mod;
    return r;
}
```

### 复杂度

时间复杂度 $O(\log b)$，空间复杂度 $O(1)$。

---

## 3. [1617：转圈游戏](http://ybt.ssoier.cn:8088/problem_show.php?pid=1617)

`快速幂` `循环位移` `同余`

### 题意

$n$ 个小伙伴围成一圈，每轮所有人都会整体顺时针平移 $m$ 个位置。现在一共进行 $10^k$ 轮，问编号为 $x$ 的小伙伴最后在哪个位置。

### 分析

每一轮的变化本质上都是“位置加上 $m$ 再对 $n$ 取模”。做一轮是 $x\to x+m$，做两轮是 $x\to x+2m$，所以做 $t$ 轮后就是 $x+t\times m\pmod n$。

这里的难点只在 $t=10^k$ 太大，不能先算出完整的 $10^k$。但因为最后只看模 $n$ 的结果，所以先用快速幂求 $10^k\bmod n$，再乘上 $m$ 即可。

### 核心代码

```cpp
long long qpow(long long a,long long b,long long mod){
    long long r=1%mod;
    for(a%=mod;b;b>>=1,a=a*a%mod) if(b&1) r=r*a%mod;
    return r;
}
long long solve(long long n,long long m,long long k,long long x){
    long long step=qpow(10,k,n);
    return (x+m*step)%n;
}
```

### 复杂度

时间复杂度 $O(\log k)$，空间复杂度 $O(1)$。

---

## 4. [1618：越狱](http://ybt.ssoier.cn:8088/problem_show.php?pid=1618)

`快速幂` `计数` `补集`

### 题意

有 $n$ 个连续房间，每个房间的犯人从 $m$ 种宗教里任选一种信仰。只要存在一对相邻房间信仰相同，就算“可能越狱”。求这样的状态数，对 $100003$ 取模。

### 分析

直接数“会越狱”的状态不太好做，但它的补集很好数。总状态数是 $m^n$；如果要求相邻房间都不同，那么第一个房间有 $m$ 种选法，后面每个房间都只能避开前一个，共有 $m\times(m-1)^{n-1}$ 种。

于是答案就是：
$$m^n-m\times(m-1)^{n-1}$$
因为 $n$ 最多到 $10^{12}$，两个幂都必须用快速幂来算。

### 核心代码

```cpp
const long long MOD = 100003;
long long qpow(long long a,long long b){
    long long r=1%MOD;
    for(a%=MOD;b;b>>=1,a=a*a%MOD) if(b&1) r=r*a%MOD;
    return r;
}
long long solve(long long m,long long n){
    long long all=qpow(m,n);
    long long safe=m%MOD*qpow(m-1,n-1)%MOD;
    return (all-safe+MOD)%MOD;
}
```

### 复杂度

时间复杂度 $O(\log n)$，空间复杂度 $O(1)$。

---

## 5. [1619：【例 1】Prime Distance](http://ybt.ssoier.cn:8088/problem_show.php?pid=1619)

`质数` `区间筛` `筛法`

### 题意

多组询问给出区间 $[L,R]$，要求找出其中相邻质数差值最小的一对，以及差值最大的一对；如果有多组并列，就取更靠前的那一对。

### 分析

区间右端点可以到 $2^{31}$，但区间长度只有 $10^6$。这说明不能把 $1$ 到 $R$ 全部筛掉，而要用“先筛小质数，再筛区间”的分段筛。

先用普通筛法把不超过 $\sqrt R$ 的质数求出来。对于每个小质数 $p$，从区间内第一个 $p$ 的倍数开始标记，就能把 $[L,R]$ 中的合数全部删掉。最后把剩下的质数按顺序收集起来，扫一遍相邻差值即可同时得到最小间隔和最大间隔。因为我们是从左往右扫描，所以天然满足“并列取靠前”。

### 核心代码

```cpp
vector<int> base = sieve((int)sqrt(R));
vector<bool> isp(R-L+1,true);
for(int p:base){
    long long st=max(1LL*p*p,(L+p-1)/p*1LL*p);
    for(long long x=st;x<=R;x+=p) isp[x-L]=false;
}
if(L==1) isp[0]=false;
vector<long long> pr;
for(long long x=L;x<=R;x++) if(isp[x-L]) pr.push_back(x);
for(int i=1;i<(int)pr.size();i++){
    long long d=pr[i]-pr[i-1];
    // 更新最近对和最远对
}
```

### 复杂度

单次询问时间复杂度约为 $O((R-L+1)\log\log R+\sqrt R\log\log\sqrt R)$，空间复杂度 $O(R-L+1)$。

---

## 6. [1620：质因数分解](http://ybt.ssoier.cn:8088/problem_show.php?pid=1620)

`质因数分解` `试除法`

### 题意

已知正整数 $n$ 恰好是两个不同质数的乘积，要求输出其中较大的那个质数。

### 分析

既然 $n=pq$ 且 $p,q$ 都是质数，那么较小的那个质因子一定不超过 $\sqrt n$。所以从 $2$ 开始试除，第一次找到能整除 $n$ 的数 $i$，它就是较小质因子，答案自然是 $n/i$。

题目已经保证 $n$ 的结构合法，因此不需要再判断是不是有更多质因子，找到第一个因子就能结束。

### 核心代码

```cpp
long long solve(long long n){
    for(long long i=2;i*i<=n;i++)
        if(n%i==0) return n/i;
    return 1;
}
```

### 复杂度

时间复杂度 $O(\sqrt n)$，空间复杂度 $O(1)$。

---

## 7. [1621：轻拍牛头](http://ybt.ssoier.cn:8088/problem_show.php?pid=1621)

`筛法` `倍数统计` `约数`

### 题意

每头牛拿到一个数字 $A_i$。第 $i$ 头牛会拍打所有满足“对方手里的数字是 $A_i$ 的因数”的牛。要求输出每头牛需要拍打多少头牛。

### 分析

如果直接对每头牛枚举所有别的牛，复杂度会到 $O(N^2)$。题目里的值域不超过 $10^6$，更自然的想法是先按数值统计频率，再做一遍“倍数筛”。

设 `cnt[v]` 表示有多少头牛拿到 $v$。如果某个数 $d$ 出现了 `cnt[d]` 次，那么它会作为“因数”给所有 $d$ 的倍数贡献这 `cnt[d]` 头牛。于是对每个 $d$，把 `cnt[d]` 加到所有倍数的位置上，得到 `sum[x]` 表示有多少头牛的数字整除 $x$。最后第 $i$ 头牛的答案就是 `sum[A_i]-1`，减去它自己。

### 核心代码

```cpp
for(int i=1;i<=N;i++) cin>>a[i],cnt[a[i]]++;
for(int d=1;d<=MAXA;d++) if(cnt[d])
    for(int x=d;x<=MAXA;x+=d) sum[x]+=cnt[d];
for(int i=1;i<=N;i++)
    cout<<sum[a[i]]-1<<'\n';
```

### 复杂度

时间复杂度约为 $O(M\log M+N)$，其中 $M$ 是值域上界，空间复杂度 $O(M)$。

---

## 8. [1622：Goldbach’s Conjecture](http://ybt.ssoier.cn:8088/problem_show.php?pid=1622)

`质数` `筛法` `哥德巴赫猜想`

### 题意

对每个给定的偶数 $n$，要把它写成两个奇素数之和。如果有多组可行解，输出 $b-a$ 最大的那一组；若无解则输出题目要求的提示语。

### 分析

要让 $b-a$ 尽量大，在 $a+b=n$ 固定时，就等价于让较小的那个素数 $a$ 尽量小。所以预处理出 $10^6$ 以内所有素数后，从小到大枚举奇素数 $a$，第一次遇到 $n-a$ 也是素数时，这一组就是答案。

预处理用普通筛法即可，后面的每个询问只是在素数表上做线性扫描和常数时间判定。

### 核心代码

```cpp
for(int i=2;i<=1000000;i++) if(!np[i]){
    for(long long j=1LL*i*i;j<=1000000;j+=i) np[j]=1;
}
for(int n;cin>>n&&n;){
    bool ok=false;
    for(int a=3;a<=n/2;a+=2) if(!np[a]&&!np[n-a]){
        cout<<n<<" = "<<a<<" + "<<n-a<<'\n';
        ok=true; break;
    }
    if(!ok) cout<<"Goldbach’s conjecture is wrong."<<'\n';
}
```

### 复杂度

预处理时间复杂度 $O(V\log\log V)$，单次询问时间复杂度最坏 $O(n)$，空间复杂度 $O(V)$。

---

## 9. [1623：Sherlock and His Girlfriend](http://ybt.ssoier.cn:8088/problem_show.php?pid=1623)

`质数` `染色` `筛法`

### 题意

要给价值为 $2,3,4,\dots,n+1$ 的珠宝染色。若一件珠宝的价格是另一件珠宝的质因子，那么这两件珠宝颜色必须不同。要求使用的颜色数最少，并给出一种染色方案。

### 分析

关系的关键在“质因子”三个字：只有质数会作为别人的质因子出现。所以把所有质数染成一种颜色，所有合数染成另一种颜色，就一定满足限制，因为任意一条冲突边的一个端点必然是质数，另一个端点必然是它的倍数，也就是合数。

最少颜色数也很好判断：当 $n\le 2$ 时，集合里只有 $2$ 或 $2,3$，全是质数，没有冲突，答案是 $1$；当 $n\ge 3$ 时，$2$ 和 $4$ 一定冲突，因此至少要两种颜色，而上面的方案恰好用两种。

### 核心代码

```cpp
int k = (n<=2 ? 1 : 2);
for(int i=2;i<=n+1;i++) if(!np[i])
    for(int j=i+i;j<=n+1;j+=i) np[j]=1;
cout<<k<<'\n';
for(int i=2;i<=n+1;i++)
    cout<<(!np[i]?1:2)<<' ';
```

### 复杂度

时间复杂度 $O(n\log\log n)$，空间复杂度 $O(n)$。

---

## 10. [1624：樱花](http://ybt.ssoier.cn:8088/problem_show.php?pid=1624)

`约数个数` `质因数分解` `勒让德公式`

### 题意

求不定方程
$$\frac{1}{x}+\frac{1}{y}=\frac{1}{n!}$$
的正整数解 $(x,y)$ 个数，答案对 $10^9+7$ 取模。

### 分析

把等式通分整理：
$$\frac{x+y}{xy}=\frac{1}{n!}\Longrightarrow xy-n!x-n!y=0$$
再配方得到：
$$(x-n!)(y-n!)=(n!)^2$$
所以每取 $(n!)^2$ 的一个正约数 $d$，都对应一组
$$x=n!+d,\quad y=n!+\frac{(n!)^2}{d}$$
于是答案就是 $(n!)^2$ 的正约数个数。

如果 $n!=\prod p_i^{e_i}$，那么 $(n!)^2=\prod p_i^{2e_i}$，约数个数就是 $\prod (2e_i+1)$。剩下只要用筛法求素数，再用勒让德公式算出每个质数在 $n!$ 中的指数 $e_i$。

### 核心代码

```cpp
const long long MOD = 1000000007;
vector<int> p = sieve(n);
long long ans = 1;
for(int x:p){
    long long e=0,t=n;
    while(t) t/=x,e+=t;
    ans=ans*(2*e+1)%MOD;
}
cout<<ans<<'\n';
```

### 复杂度

时间复杂度约为 $O(n\log\log n+\pi(n)\log n)$，空间复杂度 $O(n)$。

---

## 11. [1625：【例 1】反素数 Antiprime](http://ybt.ssoier.cn:8088/problem_show.php?pid=1625)

`约数个数` `DFS` `反素数`

### 题意

给定上界 $n$，求不超过 $n$ 的最大反素数。

### 分析

反素数的本质是“在当前位置刷新了约数个数纪录”的数。设一个数分解为
$$x=2^{a_1}3^{a_2}5^{a_3}\cdots$$
它的约数个数是 $(a_1+1)(a_2+1)(a_3+1)\cdots$。为了让数值尽量小而约数尽量多，指数一定满足从前往后单调不增；否则把较大的指数挪到更小的质数上，数会更小、约数个数不变。

所以可以只在前几个小质数上做 DFS，枚举一组单调不增的指数。搜索过程中同时维护当前乘积和约数个数，遇到“约数更多”或“约数相同但数更小”的解就更新答案。最终得到的正是 $n$ 以内最后一个刷新纪录的数，也就是最大反素数。

### 核心代码

```cpp
int pr[10]={2,3,5,7,11,13,17,19,23,29};
void dfs(int id,int lim,long long cur,int divs){
    if(divs>bestDiv||(divs==bestDiv&&cur<best)) bestDiv=divs,best=cur;
    if(id==10) return;
    long long x=cur;
    for(int e=1;e<=lim;e++){
        if(x>n/pr[id]) break;
        x*=pr[id];
        dfs(id+1,e,x,divs*(e+1));
    }
}
```

### 复杂度

搜索状态数很少，实际复杂度远小于暴力枚举；空间复杂度为 DFS 深度 $O(1)$。

---

## 12. [1626：【例 2】Hankson 的趣味题](http://ybt.ssoier.cn:8088/problem_show.php?pid=1626)

`最大公约数` `最小公倍数` `约数枚举`

### 题意

对每组数据，给出 $a_0,a_1,b_0,b_1$，要求统计满足
$$\gcd(x,a_0)=a_1,\quad \mathrm{lcm}(x,b_0)=b_1$$
的正整数 $x$ 的个数。

### 分析

第二个条件已经把 $x$ 卡得很死：既然 $\mathrm{lcm}(x,b_0)=b_1$，那么 $x$ 一定是 $b_1$ 的约数。于是问题就从“在正整数里找”变成了“在 $b_1$ 的所有约数里筛”。

做法很直接：枚举 $b_1$ 的每个约数 $d$，检查它是否同时满足这两个式子。由于 $b_1\le 2\times10^9$，用试除法枚举约数就够了；每找到一个因子 $d$，连同配对因子 $b_1/d$ 一起判断。

### 核心代码

```cpp
long long lcmll(long long a,long long b){ return a/std::gcd(a,b)*b; }
bool ok(long long x,long long a0,long long a1,long long b0,long long b1){
    return std::gcd(x,a0)==a1 && lcmll(x,b0)==b1;
}
int solve(long long a0,long long a1,long long b0,long long b1){
    int ans=0;
    for(long long d=1;d*d<=b1;d++) if(b1%d==0){
        ans+=ok(d,a0,a1,b0,b1);
        if(d*d!=b1) ans+=ok(b1/d,a0,a1,b0,b1);
    }
    return ans;
}
```

### 复杂度

每组数据时间复杂度 $O(\sqrt{b_1}\log V)$，空间复杂度 $O(1)$。

---

## 13. [1627：【例 3】最大公约数](http://ybt.ssoier.cn:8088/problem_show.php?pid=1627)

`高精度` `欧几里得算法`

### 题意

给出两个最多 $3000$ 位的正整数 $A,B$，求它们的最大公约数。

### 分析

普通整数类型装不下这么大的数，但算法本身并没有变：最大公约数还是用欧几里得算法。也就是说不断做
$$\gcd(a,b)=\gcd(b,a\bmod b)$$
直到余数变成 $0$。

难点只是“高精度取模”。如果语言支持高精整数类型，那么直接套欧几里得算法即可；这题更重要的是意识到数据变大了，方法却还是那个最经典的辗转相除法。

### 核心代码

```cpp
using boost::multiprecision::cpp_int;
cpp_int gcd_big(cpp_int a,cpp_int b){
    while(b){
        cpp_int r=a%b;
        a=b; b=r;
    }
    return a;
}
```

### 复杂度

设输入位数为 $L$，欧几里得算法迭代次数为 $O(\log V)$，总时间复杂度取决于高精度取模代价，空间复杂度与数字位数同阶。

---

## 14. [1628：X-factor Chain](http://ybt.ssoier.cn:8088/problem_show.php?pid=1628)

`质因数分解` `组合计数` `约数`

### 题意

给定正整数 $x$，考虑一类由大于 $1$ 的因子组成的序列，要求前一项都整除后一项。求这种序列的最大长度，以及达到最大长度的序列个数。

### 分析

设
$$x=\prod p_i^{e_i}$$
想让链尽量长，就应该每次只“补进去”一个质因子。这样总共能补的次数就是所有指数之和 $e_1+e_2+\cdots+e_k$，这就是最大长度。

至于方案数，本质上是在这 $\sum e_i$ 个位置里安排哪些位置放质因子 $p_1$，哪些位置放 $p_2$，……。同一种质因子内部不可区分，所以答案就是多重排列数：
$$\frac{(e_1+e_2+\cdots+e_k)!}{e_1!e_2!\cdots e_k!}$$
因此先分解质因数，再做一个组合计数即可。

### 核心代码

```cpp
vector<int> e;
for(int i=2;i*i<=x;i++) if(x%i==0){
    int c=0; while(x%i==0) x/=i,c++;
    e.push_back(c);
}
if(x>1) e.push_back(1);
int len=0; for(int c:e) len+=c;
long long ways=fact[len];
for(int c:e) ways/=fact[c];
cout<<len<<' '<<ways<<'\n';
```

### 复杂度

单次询问时间复杂度 $O(\sqrt x)$，空间复杂度 $O(1)$ 或 $O(k)$（$k$ 为不同质因子个数）。

---

## 15. [1629：聪明的燕姿](http://ybt.ssoier.cn:8088/problem_show.php?pid=1629)

`约数和` `DFS` `质因数分解`

### 题意

给出一个数 $S$，要求找出所有满足“其所有正约数之和等于 $S$”的正整数，并按升序输出。

### 分析

如果
$$n=\prod p_i^{a_i}$$
那么约数和函数满足乘法性：
$$\sigma(n)=\prod (1+p_i+p_i^2+\cdots+p_i^{a_i})$$
题目等价于：把 $S$ 拆成若干个几何级数和的乘积，并反推出对应的质因子幂。这个过程天然适合 DFS。

搜索时按质数从小到大枚举当前要放的质因子 $p$，再尝试它的指数 $a$，于是会得到一项 $1+p+\cdots+p^a$。如果这项能整除当前剩余的目标值，就递归处理剩下的部分。为了避免重复，后续只能继续放更大的质数。另一个很常见的剪枝是：若当前剩余值减一后本身就是一个更大的质数，那么它可以作为最后一个一次幂质因子直接收尾。

### 核心代码

```cpp
void dfs(long long rem,int last,long long cur){
    if(rem==1){ ans.push_back(cur); return; }
    if(rem-1>last && isPrime(rem-1)) ans.push_back(cur*(rem-1));
    for(int p:prime){
        if(p<=last || 1LL*p*p>rem) continue;
        long long pw=p,sum=1+p;
        for(int e=1;sum<=rem;e++){
            if(rem%sum==0) dfs(rem/sum,p,cur*pw);
            if(pw>rem/p) break;
            pw*=p; sum+=pw;
        }
    }
}
```

### 复杂度

预处理质数复杂度为 $O(\sqrt S\log\log S)$；单组搜索复杂度与可行分解和剪枝命中情况相关，实际远小于暴力枚举。

---

## 16. [1630：SuperGCD](http://ybt.ssoier.cn:8088/problem_show.php?pid=1630)

`高精度` `欧几里得算法`

### 题意

输入两个最多 $10000$ 位的正整数 $A,B$，输出它们的最大公约数。

### 分析

这题和前面的高精度 GCD 是同一条主线：数变得极大，但最大公约数仍然由欧几里得算法解决。只要能支持大整数取模，就能不断把问题缩成更小的一组数。

因此实现上还是反复做 $(a,b)\to(b,a\bmod b)$。真正的重点不是设计新算法，而是把经典算法搬到高精度整数环境里。

### 核心代码

```cpp
using boost::multiprecision::cpp_int;
cpp_int gcd_big(cpp_int a,cpp_int b){
    while(b){
        cpp_int r=a%b;
        a=b; b=r;
    }
    return a;
}
```

### 复杂度

设输入位数为 $L$，总时间复杂度取决于高精度取模的代价与欧几里得算法的迭代次数，空间复杂度与数字位数同阶。

# 二、同余方程与模意义构造

这一章开始，数轴上的追及、循环系统里的到达性、乃至多个条件同时成立，都会被翻译成同余方程。关键不是背模板，而是先把“若干次操作后到哪里”写成模意义下的等式，再决定该用扩展欧几里得、CRT 还是 BSGS 去解。

## 17. [1631：【例 1】青蛙的约会](http://ybt.ssoier.cn:8088/problem_show.php?pid=1631)

`扩展欧几里得` `线性同余`

### 题意

在长度为 $L$ 的环上，青蛙 A 从 $x$ 出发每次跳 $m$，青蛙 B 从 $y$ 出发每次跳 $n$，两者每次跳跃耗时相同且都只朝西。求最少经过多少次跳跃两者会同时落到同一点；若永远不会发生，就输出 `Impossible`。

### 分析

关键是把“同一时刻同一位置”翻成模意义。跳了 $k$ 次后，两者位置分别是 $x+km$ 和 $y+kn$，所以要求 $(m-n)k\equiv y-x\pmod L$，这已经是标准线性同余方程。

设 $d=\gcd(m-n,L)$。若 $d\nmid(y-x)$，方程无解；否则用扩展欧几里得求出一组解，再把它归一化到模 $L/d$ 的最小非负代表元，就是最早碰面的跳跃次数。

### 核心代码

```cpp
ll a = m - n, b = L, c = y - x, s, t;
ll d = exgcd(a, b, s, t);
if (c % d) puts("Impossible");
else {
    ll mod = b / d;
    ll ans = ((__int128)s * (c / d) % mod + mod) % mod;
    printf("%lld\n", ans);
}
```

### 复杂度

时间复杂度 $O(\log L)$，空间复杂度 $O(\log L)$。

---

## 18. [1632：【 例 2】[NOIP2012]同余方程](http://ybt.ssoier.cn:8088/problem_show.php?pid=1632)

`乘法逆元` `扩展欧几里得`

### 题意

求同余方程 $ax\equiv1\pmod b$ 的最小正整数解。题目保证一定有解。

### 分析

这题本质就是求 $a$ 在模 $b$ 下的乘法逆元。既然有解，就一定存在整数 $x,y$ 满足 $ax+by=1$。

扩展欧几里得直接给出这组贝祖等式里的 $x$，它对模 $b$ 取正就是所求逆元。最后把答案规范到 $(0,b)$ 中即可。

### 核心代码

```cpp
ll exgcd(ll a, ll b, ll &x, ll &y) {
    if (!b) return x = 1, y = 0, a;
    ll d = exgcd(b, a % b, y, x);
    y -= a / b * x;
    return d;
}
ll x, y;
exgcd(a, b, x, y);
printf("%lld\n", (x % b + b) % b);
```

### 复杂度

时间复杂度 $O(\log b)$，空间复杂度 $O(\log b)$。

---

## 19. [1633：【例 3】Sumdiv](http://ybt.ssoier.cn:8088/problem_show.php?pid=1633)

`质因数分解` `等比数列求和`

### 题意

给定 $A,B$，求 $A^B$ 的所有约数之和，对 $9901$ 取模。

### 分析

先把 $A$ 分解成 $A=\prod p_i^{c_i}$，那么 $A^B=\prod p_i^{c_iB}$。约数和按质因子独立展开，所以答案是 $\prod(1+p_i+\cdots+p_i^{c_iB})$。边界上，$B=0$ 时整体就是 $1$。

难点在于模数是 $9901$，不能直接写成 $\frac{p^{k+1}-1}{p-1}$ 去做除法，因为 $p-1$ 未必可逆。做法是递归求等比和：把前半段和后半段凑成一半规模的问题，再配合快速幂完成，这样既规避除法，也把复杂度压到对数级。

### 核心代码

```cpp
const int mod = 9901;
int qpow(int a, int b) {
    int r = 1;
    for (; b; b >>= 1, a = 1LL * a * a % mod) if (b & 1) r = 1LL * r * a % mod;
    return r;
}
int sum(int p, int k) {
    if (!k) return 1;
    if (k & 1) return 1LL * (1 + qpow(p, k / 2 + 1)) * sum(p, k / 2) % mod;
    return (1LL * (1 + qpow(p, k / 2)) * sum(p, k / 2 - 1) + qpow(p, k)) % mod;
}
if (!A) puts("0");
else if (!B) puts("1");
else {
    int ans = 1;
    for (int i = 2; 1LL * i * i <= A; i++) if (A % i == 0) {
        int c = 0;
        while (A % i == 0) A /= i, ++c;
        ans = 1LL * ans * sum(i, c * B) % mod;
    }
    if (A > 1) ans = 1LL * ans * sum(A, B) % mod;
    printf("%d\n", ans);
}
```

### 复杂度

时间复杂度为分解部分 $O(\sqrt A)$、每个质因子求和部分 $O(\log(Bc_i))$，空间复杂度 $O(\log(Bc_i))$。

---

## 20. [1634：【例 4】曹冲养猪](http://ybt.ssoier.cn:8088/problem_show.php?pid=1634)

`中国剩余定理` `CRT`

### 题意

给出若干条件“猪数除以 $a_i$ 余 $b_i$”，且所有 $a_i$ 两两互质。求满足全部条件的最小正整数。

### 分析

这就是最标准的中国剩余定理。把总模数记成 $M=\prod a_i$，第 $i$ 个条件只需要让 $M_i=M/a_i$ 在模 $a_i$ 下变成 $1$，其余模数下自然是 $0$。

于是只要用扩展欧几里得求出 $M_i$ 关于 $a_i$ 的逆元，再把各项 $b_iM_i\operatorname{inv}(M_i)$ 累加起来即可。最后对 $M$ 取模，并把 $0$ 调整成 $M$，就得到最小正整数解。

### 核心代码

```cpp
ll M = 1, ans = 0;
for (int i = 1; i <= n; i++) M *= a[i];
for (int i = 1; i <= n; i++) {
    ll Mi = M / a[i], x, y;
    exgcd(Mi, a[i], x, y);
    x = (x % a[i] + a[i]) % a[i];
    ans = (ans + (__int128)b[i] * Mi % M * x) % M;
}
ans = (ans % M + M) % M;
printf("%lld\n", ans ? ans : M);
```

### 复杂度

时间复杂度 $O(n\log \max a_i)$，空间复杂度 $O(1)$。

---

## 21. [1635：【例 5】Strange Way to Express Integers](http://ybt.ssoier.cn:8088/problem_show.php?pid=1635)

`扩展 CRT` `线性同余组`

### 题意

多组数据中，每组给出若干同余条件 $x\equiv a_i\pmod{m_i}$，模数不保证互质。要求输出最小非负解；如果无解输出 $-1$。

### 分析

模数不互质时，不能直接套普通 CRT，而要一条一条往上合并。假设当前已经合成成 $x\equiv a_1\pmod{m_1}$，再并入下一条 $x\equiv a_2\pmod{m_2}$，等价于求 $m_1k\equiv a_2-a_1\pmod{m_2}$。

这又回到了线性同余。设 $d=\gcd(m_1,m_2)$，若 $d\nmid(a_2-a_1)$ 就无解；否则求出一个 $k$，更新新的余数和新的模数 $\operatorname{lcm}(m_1,m_2)$。一路合并到最后，留下的就是整组方程的最小非负解。由于输入可到 64 位，乘法和取模过程最好用 `__int128` 承接。

### 核心代码

```cpp
using i128 = __int128_t;
i128 a1 = a[1], m1 = m[1];
for (int i = 2; i <= n; i++) {
    i128 x, y, A = m1, B = m[i], C = a[i] - a1;
    i128 d = exgcd(A, B, x, y);
    if (C % d) { puts("-1"); return; }
    i128 mod = B / d;
    x = (x * (C / d) % mod + mod) % mod;
    a1 += m1 * x;
    m1 = m1 / d * B;
    a1 = (a1 % m1 + m1) % m1;
}
print(a1);
```

### 复杂度

时间复杂度 $O(n\log M)$，空间复杂度 $O(1)$。

---

## 22. [1636：【例 6】计算器](http://ybt.ssoier.cn:8088/problem_show.php?pid=1636)

`快速幂` `扩展欧几里得` `BSGS`

### 题意

同一组数据里的询问类型固定为 $K$：要么求 $y^z\bmod p$，要么解 $xy\equiv z\pmod p$，要么解 $y^x\equiv z\pmod p$ 的最小非负整数 $x$。不存在时输出固定字符串。

### 分析

三问其实对应三种经典模运算。`K=1` 直接快速幂；`K=2` 把它当成线性同余 $yx\equiv z\pmod p$，用扩展欧几里得解；`K=3` 则是离散对数，指数在模意义里不能直接“除下来”，要改用 baby-step giant-step。

`BSGS` 的想法是把 $x$ 拆成 $im-j$。先把所有 $z\cdot y^j$ 的值哈希起来，再枚举 $y^{im}$ 去碰撞，就把指数搜索从线性降到了 $\sqrt p$。题目保证 $p$ 是质数，这一层建模会干净很多。

### 核心代码

```cpp
ll qpow(ll a, ll b, ll mod) {
    ll r = 1;
    for (; b; b >>= 1, a = a * a % mod) if (b & 1) r = r * a % mod;
    return r;
}
ll bsgs(ll a, ll b, ll p) {
    unordered_map<ll, ll> mp;
    ll m = ceil(sqrt(p)), cur = b % p;
    for (ll j = 0; j < m; j++) mp.emplace(cur, j), cur = cur * a % p;
    ll step = qpow(a, m, p), now = 1;
    for (ll i = 1; i <= m; i++) {
        now = now * step % p;
        if (mp.count(now)) return i * m - mp[now];
    }
    return -1;
}
if (K == 1) printf("%lld\n", qpow(y, z, p));
if (K == 2) {
    ll x, t, d = exgcd(y, p, x, t);
    if (z % d) puts("Orz,I cannot find x!");
    else printf("%lld\n", ((__int128)x * (z / d) % (p / d) + p / d) % (p / d));
}
if (K == 3) {
    ll ans = (z % p == 1 ? 0 : bsgs(y, z, p));
    if (ans == -1) puts("Orz,I cannot find x!");
    else printf("%lld\n", ans);
}
```

### 复杂度

`K=1` 为 $O(\log z)$，`K=2` 为 $O(\log p)$，`K=3` 为 $O(\sqrt p)$；额外空间复杂度在 `K=3` 时为 $O(\sqrt p)$。

---

## 23. [1637：荒岛野人](http://ybt.ssoier.cn:8088/problem_show.php?pid=1637)

`枚举答案` `线性同余`

### 题意

有 $N$ 个野人住在一个环形山洞系统里，第 $i$ 个野人初始在 $C_i$，每年顺时针前进 $P_i$ 个洞，只活 $L_i$ 年。要求最小的山洞数 $M$，使得任意两人在共同生存期间都不会出现在同一山洞。

### 分析

答案上界只有 $10^6$，而 $N\le15$，所以主策略是从小到大枚举 $M$。一旦固定了某个 $M$，判断它是否合法时，只需要检查每一对野人会不会在某一年相撞。

对一对 $(i,j)$ 来说，碰面年份 $t$ 必须满足 $(P_i-P_j)t\equiv C_j-C_i\pmod M$。这还是线性同余方程。解出来的最小正整数解如果不超过 $\min(L_i,L_j)$，说明两人会在寿命重叠期内相遇，这个 $M$ 就不能用；所有 pair 都安全时，当前枚举到的第一个 $M$ 就是答案。

### 核心代码

```cpp
bool hit(int i, int j, int M) {
    ll a = P[i] - P[j], b = M, c = C[j] - C[i], x, y;
    ll d = exgcd(abs(a), b, x, y);
    if (c % d) return false;
    if (a < 0) x = -x;
    ll mod = b / d;
    ll t = ((__int128)x * (c / d) % mod + mod) % mod;
    if (t == 0) t += mod;
    return t <= min(L[i], L[j]);
}
for (int M = mxC; ; M++) {
    bool ok = true;
    for (int i = 1; i <= n && ok; i++)
        for (int j = i + 1; j <= n && ok; j++)
            if (hit(i, j, M)) ok = false;
    if (ok) { printf("%d\n", M); break; }
}
```

### 复杂度

时间复杂度约为 $O(\text{答案}\cdot N^2\log M)$，空间复杂度 $O(1)$。

---

## 24. [1638：五指山](http://ybt.ssoier.cn:8088/problem_show.php?pid=1638)

`扩展欧几里得` `同余方程`

### 题意

圆圈长度为 $n$，孙悟空从位置 $x$ 出发，每次只能逆时针前进 $d$，问至少翻多少次能到达 $y$；若永远到不了，输出 `Impossible`。

### 分析

翻了 $t$ 次之后的位置是 $x+td$（对 $n$ 取模），所以条件直接写成 $dt\equiv y-x\pmod n$。

这和前面的追及题完全同型：设 $g=\gcd(d,n)$，若 $g\nmid(y-x)$ 就无解；否则用扩展欧几里得先求出一组解，再把它化成模 $n/g$ 的最小非负解，就是最少筋斗数。

### 核心代码

```cpp
ll a = d, b = n, c = y - x, s, t;
ll g = exgcd(a, b, s, t);
if (c % g) puts("Impossible");
else {
    ll mod = b / g;
    ll ans = ((__int128)s * (c / g) % mod + mod) % mod;
    printf("%lld\n", ans);
}
```

### 复杂度

时间复杂度 $O(\log n)$，空间复杂度 $O(\log n)$。

---

## 25. [1639：Biorhythms](http://ybt.ssoier.cn:8088/problem_show.php?pid=1639)

`中国剩余定理` `CRT`

### 题意

给出体力、情感、智力三个高峰日在当年中的位置 $p,e,i$，以及当前天数 $d$。求严格晚于 $d$ 的下一次三峰同日还要再等多少天。

### 分析

三个周期分别是 $23,28,33$，而且两两互质，所以这是一个固定模数的 CRT。我们要求的是某个绝对天数 $x$，满足 $x\equiv p\pmod{23},x\equiv e\pmod{28},x\equiv i\pmod{33}$。

总模数固定为 $21252$，因此系数可以一次性写死：每个分量乘上对应的 $M_i$ 和逆元后相加即可。得到一个模 $21252$ 的代表元后，再减去 $d$ 并取到严格正的同余类，就是题目要的等待天数。

### 核心代码

```cpp
const int MOD = 21252;
int crt(int p, int e, int i) {
    return (5544LL * p + 14421LL * e + 1288LL * i) % MOD;
}
for (int tc = 1; ; tc++) {
    if (p == -1 && e == -1 && i == -1 && d == -1) break;
    int ans = (crt(p, e, i) - d) % MOD;
    if (ans <= 0) ans += MOD;
    printf("Case %d: the next triple peak occurs in %d days.\n", tc, ans);
}
```

### 复杂度

每组数据时间复杂度 $O(1)$，空间复杂度 $O(1)$。

---

## 26. [1640：C Looooops](http://ybt.ssoier.cn:8088/problem_show.php?pid=1640)

`线性同余` `扩展欧几里得`

### 题意

在 $k$ 位存储系统里，变量每次执行 `variable += C` 都等价于模 $2^k$ 加法。问从初值 $A$ 出发，经过多少次循环变量会第一次变成 $B$；如果永远不会到达，就输出 `FOREVER`。

### 分析

做了 $n$ 次之后，变量值就是 $A+nC\bmod 2^k$，所以问题变成 $Cn\equiv B-A\pmod{2^k}$。这是一道标准线性同余。

设 $d=\gcd(C,2^k)$。若 $d\nmid(B-A)$，说明这条等差轨道永远碰不到 $B$，循环就是死的；否则扩展欧几里得可以给出一个解，把它归一化到模 $2^k/d$ 的最小非负值，就是循环结束前会执行的次数。

### 核心代码

```cpp
ll mod = 1LL << k, a = C, b = mod, c = B - A, x, y;
ll d = exgcd(a, b, x, y);
if (c % d) puts("FOREVER");
else {
    ll m = b / d;
    ll ans = ((__int128)x * (c / d) % m + m) % m;
    printf("%lld\n", ans);
}
```

### 复杂度

时间复杂度 $O(k)$，空间复杂度 $O(\log 2^k)$。

# 三、矩阵递推与组合计数

这一章前半段把 Fibonacci、自动机和带权路径都压进矩阵快速幂里，练的是“把线性转移写成固定矩阵”；后半段则回到组合计数，核心是把题目条件翻成组合式、Catalan 或 Lucas / CRT 这样的标准工具。

## 27. [1641：【例 1】矩阵 A×B](http://ybt.ssoier.cn:8088/problem_show.php?pid=1641)

`算法提高篇` `提高(六)数学基础` `第5章 矩阵乘法`

### 题意
给出一个 $n\times m$ 的矩阵 $A$ 和一个 $m\times p$ 的矩阵 $B$，按矩阵乘法定义求出结果矩阵 $C=A\times B$。数据范围不大，直接把每个位置 $c_{ij}$ 的贡献累加出来即可。

### 分析
这题就是把定义翻成代码：固定结果矩阵的行 $i$ 和列 $j$，枚举中间维度 $k$，把 $a_{ik}b_{kj}$ 加到 $c_{ij}$ 上。

实现时把三重循环写成 $i,k,j$ 的顺序更顺手，因为先取到 $a_{ik}$ 后，可以一次性更新这一项对整行结果的贡献。元素绝对值不小，乘法和累加最好用 `long long`。

### 核心代码
```cpp
for(int i=1;i<=n;i++)
  for(int k=1;k<=m;k++)
    for(int j=1;j<=p;j++)
      c[i][j]+=1LL*a[i][k]*b[k][j];
```

### 复杂度
时间复杂度 $O(nmp)$，空间复杂度 $O(np)$。

---

## 28. [1642：【例 2】Fibonacci 第 n 项](http://ybt.ssoier.cn:8088/problem_show.php?pid=1642)

`算法提高篇` `提高(六)数学基础` `第5章 矩阵乘法`

### 题意
要求 $f_n\bmod m$，但 $n$ 高达 $2\times 10^9$，显然不能线性递推。Fibonacci 的递推是线性的，适合直接写成 $2\times2$ 矩阵快速幂。

### 分析
把状态写成 $\begin{bmatrix}F_i\\F_{i-1}\end{bmatrix}$，就有
$$\begin{bmatrix}F_{i+1}\\F_i\end{bmatrix}=\begin{bmatrix}1&1\\1&0\end{bmatrix}\begin{bmatrix}F_i\\F_{i-1}\end{bmatrix}.$$
于是只要求出转移矩阵的高次幂，就能在对数时间内跳到第 $n$ 项。

由于模数 $m$ 也在输入里，矩阵乘法每一步都顺手取模即可。边界上 $n\le2$ 时答案直接是 $1\bmod m$。

### 核心代码
```cpp
struct Mat{long long a[2][2];};
Mat mul(Mat x,Mat y,long long mod){Mat c={0};for(int i=0;i<2;i++)for(int k=0;k<2;k++)for(int j=0;j<2;j++)c.a[i][j]=(c.a[i][j]+x.a[i][k]*y.a[k][j])%mod;return c;}
Mat qpow(Mat a,long long n,long long mod){Mat r={1,0,0,1};while(n){if(n&1)r=mul(r,a,mod);a=mul(a,a,mod);n>>=1;}return r;}
if(n<=2) cout<<1%m;
else{Mat t={1,1,1,0};Mat r=qpow(t,n-2,m);cout<<(r.a[0][0]+r.a[0][1])%m;}
```

### 复杂度
时间复杂度 $O(\log n)$，空间复杂度 $O(1)$。

---

## 29. [1643：【例 3】Fibonacci 前 n 项和](http://ybt.ssoier.cn:8088/problem_show.php?pid=1643)

`算法提高篇` `提高(六)数学基础` `第5章 矩阵乘法`

### 题意
要求 Fibonacci 前 $n$ 项和 $S_n\bmod m$。和单点值相比，只多了一个前缀和，但仍然能压回到求某一项 Fibonacci 上。

### 分析
利用恒等式 $S_n=F_{n+2}-1$，原问题立刻化成一次 Fibonacci 快速幂。这个式子可以由前几项展开后和递推式错位相减得到，本质上还是线性递推带来的前缀和关系。

因此只需求出 $F_{n+2}\bmod m$，最后减去 $1$ 再补模即可。这样状态最小，代码也比额外开三维矩阵更紧。

### 核心代码
```cpp
long long fib(long long n,long long mod){
  if(n==0) return 0;
  Mat t={1,1,1,0},r=qpow(t,n-1,mod);
  return r.a[0][0]%mod;
}
cout<<(fib(n+2,m)-1+m)%m;
```

### 复杂度
时间复杂度 $O(\log n)$，空间复杂度 $O(1)$。

---

## 30. [1644：【例 4】佳佳的 Fibonacci](http://ybt.ssoier.cn:8088/problem_show.php?pid=1644)

`算法提高篇` `提高(六)数学基础` `第5章 矩阵乘法`

### 题意
这里要算的是加权和 $T(n)=\sum_{i=1}^n iF_i\bmod m$。虽然看起来比普通前缀和更复杂，但它同样能化成若干个 Fibonacci 单点值。

### 分析
把前几项写开后归纳，可以得到常用恒等式
$$T(n)=nF_{n+2}-F_{n+3}+2.$$
于是问题从“加权前缀和”退回到“求两个 Fibonacci 单点”，仍然可以用矩阵快速幂解决。

最后计算时注意先对 $n$ 取模，再用 `__int128` 承接乘法，避免中间乘积贴着 `long long` 上界。

### 核心代码
```cpp
long long fn2=fib(n+2,m),fn3=fib(n+3,m);
long long ans=((__int128)(n%m)*fn2-fn3+2)%m;
cout<<(ans+m)%m;
```

### 复杂度
时间复杂度 $O(\log n)$，空间复杂度 $O(1)$。

---

## 31. [1645：Fibonacci](http://ybt.ssoier.cn:8088/problem_show.php?pid=1645)

`算法提高篇` `提高(六)数学基础` `第5章 矩阵乘法`

### 题意
这题还是求 Fibonacci，只是变成多组询问，直到读到 $-1$ 结束。单次 $n$ 仍然很大，所以每组独立做一次矩阵快速幂即可。

### 分析
递推和上一题完全一样：转移矩阵仍是 $\begin{bmatrix}1&1\\1&0\end{bmatrix}$，只不过这里要求的是 $F_0=0,F_1=1$ 这一版。

因为模数固定为 $10^4$，矩阵乘法直接在这个模数下进行。多组数据之间没有额外关联，顺序读入、顺序输出就是最自然的写法。

### 核心代码
```cpp
const int MOD=10000;
while(cin>>n&&n!=-1){
  if(n==0){cout<<0<<"\
";continue;}
  Mat t={1,1,1,0},r=qpow(t,n-1,MOD);
  cout<<r.a[0][0]%MOD<<"\
";
}
```

### 复杂度
单组时间复杂度 $O(\log n)$，空间复杂度 $O(1)$。

---

## 32. [1646：GT 考试](http://ybt.ssoier.cn:8088/problem_show.php?pid=1646)

`算法提高篇` `提高(六)数学基础` `第5章 矩阵乘法`

### 题意
要统计长度为 $n$ 的十进制串中，不包含某个长度为 $m$ 的禁串的方案数。$n$ 很大，直接做数位 DP 肯定不行，关键是把“匹配到哪里”抽成有限状态。

### 分析
先用 KMP 建出禁串的前缀函数，把状态定义成“当前已经匹配了禁串前缀的最长长度”，一共只有 $0\sim m-1$ 这 $m$ 个合法状态；一旦转移到长度 $m$，说明禁串出现，这条路直接舍弃。

这样每添一位数字，本质上都是在自动机上走一步。由于总长度是 $n$，而每一步的转移完全相同，所以再把这张自动机转移图写成矩阵，做一次矩阵快速幂即可。初始向量只有状态 $0$ 的计数为 $1$。

### 核心代码
```cpp
for(int i=1,j=0;i<m;i++){while(j&&s[i]!=s[j]) j=ne[j-1];if(s[i]==s[j]) j++;ne[i]=j;}
for(int i=0;i<m;i++) for(char ch='0';ch<='9';ch++){
  int j=i;
  while(j&&ch!=s[j]) j=ne[j-1];
  if(ch==s[j]) j++;
  if(j<m) tr.a[i][j]=(tr.a[i][j]+1)%K;
}
Mat r=qpow(tr,n,K);
for(int j=0;j<m;j++) ans=(ans+r.a[0][j])%K;
```

### 复杂度
建自动机时间复杂度 $O(10m)$，矩阵快速幂时间复杂度 $O(m^3\log n)$，空间复杂度 $O(m^2)$。

---

## 33. [1647：迷路](http://ybt.ssoier.cn:8088/problem_show.php?pid=1647)

`算法提高篇` `提高(六)数学基础` `第5章 矩阵乘法`

### 题意
有向边带时间，要求恰好在时刻 $T$ 从 $0$ 走到 $N-1$ 的路径数。边权在 $1\sim9$，这提示我们把“耗时边”拆成若干条单位时间边。

### 分析
把每个点拆成 $9$ 个状态，表示“距离真正到达该点还剩多少单位时间”。同一个原点内部连一条长度递减的链：剩 $9$、剩 $8$、…、剩 $1$。如果原图有一条 $u\to v$、耗时为 $w$ 的边，就从 $u$ 的主状态连到 $v$ 的“剩 $w$”状态。

这样一来，原问题就变成了扩点后图上的“恰好走 $T$ 步”的方案数。单位步长计数正是矩阵幂最擅长的场景，直接对扩展矩阵做快速幂即可。

### 核心代码
```cpp
auto id=[&](int u,int t){return u*9+t-1;};
for(int u=0;u<N;u++) for(int t=2;t<=9;t++) A[id(u,t)][id(u,t-1)]=1;
for(int u=0;u<N;u++) for(int v=0;v<N;v++) if(g[u][v]>'0')
  A[id(u,1)][id(v,g[u][v]-'0')]=(A[id(u,1)][id(v,g[u][v]-'0')]+1)%2009;
Mat r=qpow(A,T,2009);
cout<<r[id(0,1)][id(N-1,1)];
```

### 复杂度
设扩点后状态数为 $9N$，时间复杂度 $O((9N)^3\log T)$，空间复杂度 $O((9N)^2)$。

---

## 34. [1648：【例 1】「NOIP2011」计算系数](http://ybt.ssoier.cn:8088/problem_show.php?pid=1648)

`算法提高篇` `提高(六)数学基础` `第6章 组合数学`

### 题意
要求 $(ax+by)^k$ 中 $x^ny^m$ 项的系数。这里其实没有额外结构，直接套二项式定理就够了。

### 分析
展开后，取到 $x^ny^m$ 这一项，必须恰好从 $k$ 个因子里选出 $n$ 个贡献 $ax$，其余 $m$ 个贡献 $by$。所以系数就是
$$\binom{k}{n}a^nb^m.$$

模数 $10007$ 是质数，用快速幂算 $a^n,b^m$，组合数则用 Lucas 定理写成通用模板，这样无论 $k$ 大小如何都能稳过。

### 核心代码
```cpp
const int MOD=10007;
long long C(int n,int m){if(m>n) return 0;return fac[n]*ifac[m]%MOD*ifac[n-m]%MOD;}
long long lucas(long long n,long long m){return m?C(n%MOD,m%MOD)*lucas(n/MOD,m/MOD)%MOD:1;}
cout<<qpow(a,n,MOD)*qpow(b,m,MOD)%MOD*lucas(k,n)%MOD;
```

### 复杂度
预处理时间复杂度 $O(\text{MOD})$，单次计算时间复杂度 $O(\log k)$，空间复杂度 $O(\text{MOD})$。

---

## 35. [1649：【例 2】2^k 进制数](http://ybt.ssoier.cn:8088/problem_show.php?pid=1649)

`算法提高篇` `提高(六)数学基础` `第6章 组合数学`

### 题意
把进制固定为 $B=2^k$。一个合法的 $B$ 进制数从高到低严格递增，而且至少两位；再加上转成二进制后总长度不超过 $w$，本质上是在数满足位长限制的递增数字集合。

### 分析
对固定长度 `len` 来看，由于各位严格递增，高位一旦确定，后面的数字只需从更大的数里选，排列顺序已经被“递增”唯一确定。注意首位不能为 $0$，所以所有被选数字都来自 $1\sim B-1$。

若 `rem=w-(len-1)k`，表示最高位还能占用的二进制位数。$rem\ge k$ 时，最高位没有额外限制，方案数就是 $\binom{B-1}{len}$；0<rem<k 时，最高位只能落在 $1\sim 2^{rem}-1$，把最高位枚举并用曲棍球杆恒等式合并，得到：

$$\binom{B-1}{\text{len}}-\binom{B-2^{\text{rem}}}{\text{len}}.$$

答案可能超过 $200$ 位，但 $B\le512$，直接用高精度组合数就够了。

### 核心代码
```cpp
int B=1<<k;
for(int i=0;i<=B;i++) C[i][0]=C[i][i]=1;
for(int i=1;i<=B;i++) for(int j=1;j<i;j++) C[i][j]=C[i-1][j-1]+C[i-1][j];
cpp_int ans=0;
for(int len=2;len<=B-1;len++){
  int rem=w-(len-1)*k;
  if(rem<=0) break;
  if(rem>=k) ans+=C[B-1][len];
  else ans+=C[B-1][len]-C[B-(1<<rem)][len];
}
cout<<ans;
```

### 复杂度
时间复杂度 $O(2^{2k})$，空间复杂度 $O(2^{2k})$。

---

## 36. [1650：【例 3】组合](http://ybt.ssoier.cn:8088/problem_show.php?pid=1650)

`算法提高篇` `提高(六)数学基础` `第6章 组合数学`

### 题意
要做的是多组 $C(n,m)\bmod p$，其中 $n$ 很大、$m\le10^4$，而且给了一个很关键的条件：$p$ 是素数且 $m<p$。

### 分析
因为 $m<p$，Lucas 定理在 $p$ 进制下只会用到 $m$ 的最低位，于是
$$\binom{n}{m}\equiv\binom{n\bmod p}{m}\pmod p.$$
如果 $n\bmod p<m$，答案直接为 $0$；否则只要用乘法公式算一个小组合数即可。

这样每组询问只需要做 $m$ 次乘法和一次逆元，完全不必上大规模预处理。

### 核心代码
```cpp
long long solve(long long n,int m,int p){
  if(m>n||n%p<m) return 0;
  long long num=1,den=1;
  for(int i=1;i<=m;i++){
    num=num*((n-m+i)%p)%p;
    den=den*i%p;
  }
  return num*qpow(den,p-2,p)%p;
}
```

### 复杂度
单组时间复杂度 $O(m+\log p)$，空间复杂度 $O(1)$。

---

## 37. [1651：【例 4】古代猪文](http://ybt.ssoier.cn:8088/problem_show.php?pid=1651)

`算法提高篇` `提高(六)数学基础` `第6章 组合数学`

### 题意
设指数 $P$ 为所有可能情况数之和。对每个 $N$ 的约数 $k$，保留下来的文字数是 $N/k$，对应方案数是 $\binom{N}{N/k}=\binom{N}{k}$，所以本题先要算一个“约数上的组合数求和”，再做一次幂模。

### 分析
最终答案是 $G^P\bmod 999911659$。因为 $999911659$ 是质数，可以先把指数模掉 $999911658$。而
$$999911658=2\times3\times4679\times35617,$$
可以分别在这四个质数模数下用 Lucas 求
$$P\equiv\sum_{d\mid N}\binom Nd,$$
再用 CRT 合并回模 $999911658$。

这样难点就被拆成两层：外层枚举约数，内层做四次小模数 Lucas。最后再做一次快速幂。若 $G\equiv0\pmod{999911659}$，由于指数恒正，答案直接就是 $0$。

### 核心代码
```cpp
const long long MOD=999911659,PHI=MOD-1;
int ps[4]={2,3,4679,35617};
long long calc(int p){long long s=0;for(long long d=1;d*d<=N;d++) if(N%d==0){s=(s+lucas(N,d,p))%p;if(d*d!=N) s=(s+lucas(N,N/d,p))%p;}return s;}
for(int i=0;i<4;i++) a[i]=calc(ps[i]);
long long e=CRT(a,ps,4);
cout<<(G%MOD==0?0:qpow(G,e,MOD));
```

### 复杂度
设 $\tau(N)$ 为约数个数，时间复杂度约为 $O(\tau(N)\log N)$，空间复杂度 $O(1)$（不计 Lucas 预处理）。

---

## 38. [1652：牡牛和牝牛](http://ybt.ssoier.cn:8088/problem_show.php?pid=1652)

`算法提高篇` `提高(六)数学基础` `第6章 组合数学`

### 题意
把牡牛看成 `1`，牝牛看成 `0`，题目就是统计长度为 $N$ 的 $01$ 串，其中任意两个 `1` 之间至少隔着 $K$ 个 `0`。

### 分析
设 $f[i]$ 表示长度为 $i$ 的合法方案数。看最后一个位置：
- 如果放牝牛，那么前 $i-1$ 个位置任意合法，贡献 $f[i-1]$；
- 如果放牡牛，那么它前面最近的牡牛必须在 $i-K-1$ 之前，所以前缀贡献是 $f[i-K-1]$。

当 $i\le K+1$ 时，末尾放一头牡牛只会产生一种新情况，所以直接额外加 $1$。整个递推是一维线性的。

### 核心代码
```cpp
const int MOD=5000011;
f[0]=1;
for(int i=1;i<=N;i++){
  f[i]=f[i-1];
  if(i<=K+1) f[i]=(f[i]+1)%MOD;
  else f[i]=(f[i]+f[i-K-1])%MOD;
}
cout<<f[N];
```

### 复杂度
时间复杂度 $O(N)$，空间复杂度 $O(N)$。

---

## 39. [1653：方程的解](http://ybt.ssoier.cn:8088/problem_show.php?pid=1653)

`算法提高篇` `提高(六)数学基础` `第6章 组合数学`

### 题意
方程右边是 $g(x)=x^x\bmod1000$，左边要求 $k$ 个正整数之和等于它。也就是说，先求出 $g(x)$，再数正整数拆分方案。

### 分析
把每个 $a_i$ 先减去 $1$，问题就变成
$$b_1+b_2+\cdots+b_k=g(x)-k,\quad b_i\ge0.$$
因此正整数解个数就是经典插板法答案
$$\binom{g(x)-1}{k-1}.$$

由于 $g(x)<1000$，组合数的参数并不大，但答案可能很长，所以用高精度乘法按乘法公式逐项累乘即可。$g(x)$ 本身用快速幂模 $1000$ 求。

### 核心代码
```cpp
int g=qpow(x,x,1000);
cpp_int ans=1;
for(int i=1;i<=k-1;i++) ans=ans*(g-i)/i;
cout<<ans;
```

### 复杂度
时间复杂度 $O(\log x+k)$，空间复杂度 $O(1)$（不计高精度位数）。

---

## 40. [1654：车的放置](http://ybt.ssoier.cn:8088/problem_show.php?pid=1654)

`算法提高篇` `提高(六)数学基础` `第6章 组合数学`

### 题意
这块棋盘可以看成“左上一个 $a\times b$ 的矩形”和“右侧一个高为 $a+c$、宽为 $d$ 的矩形”拼出来的 L 形。车互不攻击，最自然的切入点就是枚举左块里放了多少辆。

### 分析
设左上块放了 $i$ 辆车。它们需要占掉左块里的 $i$ 列和前 $a$ 行中的 $i$ 行，因此方案数为
$$\binom bi\cdot A(a,i).$$
剩下的 $k-i$ 辆必须全部放在右侧块里；由于前 $a$ 行中已经有 $i$ 行被左块占用，所以右块可用行数变成 $a+c-i$，再从右块的 $d$ 列里选出 $k-i$ 列，方案数是
$$\binom d{k-i}\cdot A(a+c-i,k-i).$$
把所有合法的 $i$ 累加即可。

### 核心代码
```cpp
auto C=[&](int n,int m){if(m<0||m>n) return 0LL;return fac[n]*ifac[m]%MOD*ifac[n-m]%MOD;};
auto A=[&](int n,int m){if(m<0||m>n) return 0LL;return fac[n]*ifac[n-m]%MOD;};
for(int i=0;i<=k;i++){
  if(i>a||i>b||k-i>d||k-i>a+c-i) continue;
  ans=(ans+C(b,i)*A(a,i)%MOD*C(d,k-i)%MOD*A(a+c-i,k-i))%MOD;
}
cout<<ans;
```

### 复杂度
预处理时间复杂度 $O(a+b+c+d)$，枚举时间复杂度 $O(k)$，空间复杂度 $O(a+b+c+d)$。

---

## 41. [1655：数三角形](http://ybt.ssoier.cn:8088/problem_show.php?pid=1655)

`算法提高篇` `提高(六)数学基础` `第6章 组合数学`

### 题意
在 $(n+1)(m+1)$ 个格点里任选三个点，再去掉三点共线的退化情况，就是答案。难点不在“选三点”，而在把所有共线三元组扣干净。

### 分析
总方案数是 $\binom{(n+1)(m+1)}3$。横线和竖线上的共线点最好单独扣掉：每条横线有 $m+1$ 个点，每条竖线有 $n+1$ 个点。

其余斜线部分，枚举一个线段方向 $(dx,dy)$。一段这样的格点线段上有 $\gcd(dx,dy)+1$ 个格点，因此会额外带来 $\gcd(dx,dy)-1$ 个内部点，形成退化三角形。这个方向的放置位置有 $2(n-dx+1)(m-dy+1)$ 个，乘起来累减即可。

### 核心代码
```cpp
long long p=1LL*(n+1)*(m+1);
long long ans=p*(p-1)*(p-2)/6;
ans-=1LL*(n+1)*(m+1)*m*(m-1)/6;
ans-=1LL*(m+1)*(n+1)*n*(n-1)/6;
for(int dx=1;dx<=n;dx++)
  for(int dy=1;dy<=m;dy++)
    ans-=2LL*(n-dx+1)*(m-dy+1)*(std::gcd(dx,dy)-1);
cout<<ans;
```

### 复杂度
时间复杂度 $O(nm\log \min(n,m))$，空间复杂度 $O(1)$。

---

## 42. [1656：Combination](http://ybt.ssoier.cn:8088/problem_show.php?pid=1656)

`算法提高篇` `提高(六)数学基础` `第6章 组合数学`

### 题意
固定模数变成了 $10007$，而 $n,m$ 很大、询问很多，这就是 Lucas 定理的标准使用场景。

### 分析
因为模数是小质数，先预处理 $0\sim10006$ 的阶乘和逆元，就能在 $O(1)$ 内算出一个“小组合数”。随后把 $n,m$ 写成 $10007$ 进制，递归套用
$$\binom nm\equiv\binom{n\bmod p}{m\bmod p}\binom{\lfloor n/p\rfloor}{\lfloor m/p\rfloor}\pmod p.$$

每组询问只会递归很少层，总代价非常稳定。

### 核心代码
```cpp
const int MOD=10007;
long long C(int n,int m){if(m>n) return 0;return fac[n]*ifac[m]%MOD*ifac[n-m]%MOD;}
long long lucas(long long n,long long m){return m?C(n%MOD,m%MOD)*lucas(n/MOD,m/MOD)%MOD:1;}
while(t--){cin>>n>>m;cout<<lucas(n,m)<<"\
";}
```

### 复杂度
预处理时间复杂度 $O(10007)$，单组时间复杂度 $O(\log_{10007} n)$，空间复杂度 $O(10007)$。

---

## 43. [1657：序列统计](http://ybt.ssoier.cn:8088/problem_show.php?pid=1657)

`算法提高篇` `提高(六)数学基础` `第6章 组合数学`

### 题意
值域是连续区间 $[L,R]$，长度在 $1\sim N$ 之间，要求单调不降。只要把“单调不降序列”换成“可重复选数”，组合结构就非常直接。

### 分析
设可选数字个数为 $k=R-L+1$。固定长度为 `len` 时，单调不降序列等价于从 $k$ 种数字里选 `len` 个，允许重复，答案是
$$\binom{k+len-1}{len}.$$
把 `len=1\sim N` 全部加起来，再用曲棍球杆恒等式，可以合成
$$\sum_{len=1}^N\binom{k+len-1}{len}=\binom{k+N}{N}-1.$$

模数 $10^6+3$ 是质数，所以最后只剩一个 Lucas 组合数。

### 核心代码
```cpp
const int MOD=1000003;
long long k=R-L+1;
cout<<(lucas(k+N,N)-1+MOD)%MOD;
```

### 复杂度
预处理时间复杂度 $O(10^6)$，单组时间复杂度 $O(\log_{10^6+3}(N+R-L))$，空间复杂度 $O(10^6)$。

---

## 44. [1658：超能粒子炮 · 改](http://ybt.ssoier.cn:8088/problem_show.php?pid=1658)

`算法提高篇` `提高(六)数学基础` `第6章 组合数学`

### 题意
要求的是 $\sum_{i=0}^k \binom ni\bmod2333$，而 $n,k$ 都能到 $10^{18}$，还带着海量询问。普通 Lucas 只能求单个组合数，这题要把“前缀和”也一起做成递归。

### 分析
记 $S(n,k)=\sum_{i=0}^k\binom ni\bmod2333$。当 $n,k<2333$ 时，可以直接用 Pascal 三角形和前缀和表预处理。

若把 $n=n_1p+n_0,k=k_1p+k_0$（$p=2333$），按最高位是否取满来拆分：
- 高位小于 $k_1$ 的部分，贡献 $S(n_1,k_1-1)\cdot S(n_0,p-1)$；
- 高位恰好等于 $k_1$ 的部分，贡献 $C(n_1,k_1)\cdot S(n_0,k_0)$。
于是得到和 Lucas 非常像的递归式，单次询问只需处理很少几层。

### 核心代码
```cpp
long long lucas(long long n,long long m){return m?C[n%MOD][m%MOD]*lucas(n/MOD,m/MOD)%MOD:1;}
long long solve(long long n,long long k){
  if(k<0) return 0;
  if(n<MOD&&k<MOD) return S[n][min<long long>(n,k)];
  return (solve(n/MOD,k/MOD-1)*S[n%MOD][MOD-1]+lucas(n/MOD,k/MOD)*solve(n%MOD,k%MOD))%MOD;
}
```

### 复杂度
预处理时间复杂度 $O(2333^2)$，单组时间复杂度 $O(\log_{2333} n)$，空间复杂度 $O(2333^2)$。

---

## 45. [1659：礼物](http://ybt.ssoier.cn:8088/problem_show.php?pid=1659)

`算法提高篇` `提高(六)数学基础` `第6章 组合数学`

### 题意
如果总需求 $\sum w_i$ 超过了礼物总数 $n$，显然无解；否则就是把 $n$ 个不同礼物分成若干个指定大小的有序组，答案是一个多项式系数。

### 分析
可行时，方案数为
$$\frac{n!}{(n-\sum w_i)!\prod w_i!}=\binom n{w_1}\binom{n-w_1}{w_2}\cdots.$$
难点在于模数 $P$ 不一定是质数，所以不能直接用费马逆元。标准做法是 exLucas：把 $P$ 分解成若干个质数幂 $p^c$，分别在每个模数下计算组合数，再用 CRT 合并。

在质数幂模下，组合数要把阶乘里 $p$ 的幂次和去掉 $p$ 因子的部分分开处理，这样就能兼容非互素的情况。由于 $m\le5$，把多项式系数拆成几次组合数相乘就足够了。

### 核心代码
```cpp
long long fac(long long n,int p,int pk){if(!n) return 1;long long r=1;for(int i=1;i<=pk;i++) if(i%p) r=r*i%pk;r=qpow(r,n/pk,pk);for(int i=1;i<=n%pk;i++) if(i%p) r=r*i%pk;return r*fac(n/p,p,pk)%pk;}
long long Cpk(long long n,long long m,int p,int pk){long long e=cnt(n,p)-cnt(m,p)-cnt(n-m,p);long long a=fac(n,p,pk),b=fac(m,p,pk),c=fac(n-m,p,pk);return a*inv(b,pk)%pk*inv(c,pk)%pk*qpow(p,e,pk)%pk;}
long long ans=1,rem=n;
for(int i=1;i<=m;i++) ans=ans*exLucas(rem,w[i],P)%P,rem-=w[i];
```

### 复杂度
设模数分解后共有若干个质数幂因子，时间复杂度约为 $O(m\cdot\text{因子数}\cdot\log P)$，空间复杂度 $O(\text{因子数})$。

---

## 46. [1660：网格](http://ybt.ssoier.cn:8088/problem_show.php?pid=1660)

`算法提高篇` `提高(六)数学基础` `第6章 组合数学`

### 题意
从 $(0,0)$ 走到 $(n,m)$ 的普通单调路径数是组合数，但这里额外限制全过程都要满足 $x\ge y$，也就是不能越过对角线。

### 分析
先不管限制，总路径数是 $\binom{n+m}m$。对越界路径做反射：第一次走到 $x<y$ 的那一步，等价于把此前路径映射到一条从 $(0,0)$ 走到 $(n,m)$、但多走了一次“向上领先”的路径，数量正好是 $\binom{n+m}{m-1}$。

所以合法路径数为
$$\binom{n+m}m-\binom{n+m}{m-1}=\frac{n-m+1}{n+1}\binom{n+m}m.$$
由于答案不取模，而且会很大，直接用高精度按乘法公式算组合数即可。

### 核心代码
```cpp
cpp_int C=1;
for(int i=1;i<=m;i++) C=C*(n+i)/i;
cout<<C*(n-m+1)/(n+1);
```

### 复杂度
时间复杂度 $O(m)$，空间复杂度 $O(1)$（不计高精度位数）。

---

## 47. [1661：有趣的数列](http://ybt.ssoier.cn:8088/problem_show.php?pid=1661)

`算法提高篇` `提高(六)数学基础` `第6章 组合数学`

### 题意
奇数位递增、偶数位递增、且每一对 $(a_{2i-1},a_{2i})$ 都满足前者更小，这其实就是在数一类标准 Catalan 结构。

### 分析
把奇数位看成“入栈顺序”，偶数位看成“出栈顺序”，条件恰好对应任意前缀里“已经出掉的元素不超过已经入进去的元素”。这和合法括号序列、二叉树、栈排列是同一个 Catalan 模型，所以答案就是
$$\mathrm{Cat}_n=\frac1{n+1}\binom{2n}n.$$

模数 $P$ 不一定是质数，最稳的办法不是求逆元，而是直接把 Catalan 的质因子指数拆出来：对每个质数 $p\le2n$，用 Legendre 公式算它在 $(2n)!/n!/(n+1)!$ 里的次数，再把 $p^{\text{次数}}\bmod P$ 乘回去。

### 核心代码
```cpp
auto cnt=[&](int N,int p){long long s=0;while(N) N/=p,s+=N;return s;};
for(int i=2;i<=2*n;i++) if(!vis[i]){
  primes.push_back(i);
  for(long long j=1LL*i*i;j<=2*n;j+=i) vis[j]=1;
}
long long ans=1%P;
for(int p:primes){
  long long e=cnt(2*n,p)-cnt(n,p)-cnt(n+1,p);
  ans=ans*qpow(p,e,P)%P;
}
cout<<ans;
```

### 复杂度
筛法与统计总时间复杂度 $O(n\log\log n)$，空间复杂度 $O(n)$。

---

## 48. [1662：树屋阶梯](http://ybt.ssoier.cn:8088/problem_show.php?pid=1662)

`算法提高篇` `提高(六)数学基础` `第6章 组合数学`

### 题意
每种搭法都对应一种“台阶逐步向上，同时下面被恰好填满”的嵌套结构，这和经典 Catalan 模型完全同构。

### 分析
把每一层钢材的开始看成一次“打开”，把它被更高一层封住看成一次“关闭”，整个搭建过程不能出现悬空，也不能把空心面朝上，于是恰好对应一条不下穿的括号路径。

因此答案就是第 $N$ 个 Catalan 数。这里不取模，且 $N\le500$，直接用递推
$$\mathrm{Cat}_i=\mathrm{Cat}_{i-1}\frac{4i-2}{i+1}$$
配合高精度整数逐项算到 $N$ 即可。

### 核心代码
```cpp
cpp_int cat=1;
for(int i=1;i<=N;i++) cat=cat*(4*i-2)/(i+1);
cout<<cat;
```

### 复杂度
时间复杂度 $O(N)$，空间复杂度 $O(1)$（不计高精度位数）。

# 四、博弈不变量与先后手判断
这一章集中看几类最常见的先后手判定：有的靠模数与奇偶不变量直接收束，有的要把局面拆成若干独立子游戏后看异或和。顺着这 8 题读下来，能把“什么时候直接找规律，什么时候上 SG 函数”这条主线捋顺。

## 49. [1663：【 例 1】取石子游戏 1](http://ybt.ssoier.cn:8088/problem_show.php?pid=1663)
`博弈论` `取石子` `先后手判断`
### 题意
有 $N$ 颗石子，两名玩家轮流操作，每次必须从这一堆里取走 $1$ 到 $K$ 颗，谁拿到最后一颗谁获胜。题目只问在双方都最优时是先手赢还是后手赢。
### 分析
只有一堆石子时，最自然的不变量就是“每一轮两个人一共拿走多少”。如果能把石子总数控制在 $K+1$ 的倍数上，那么无论对手这一手拿多少，我都能补到这一轮合计拿走 $K+1$ 颗。

所以局面只看 $N\bmod (K+1)$。若余数为 $0$，先手一开始就站在必败态上，输出 $2$；否则先手第一步先拿掉这个余数，把局面送到 $(K+1)$ 的倍数，后面一直镜像跟进即可。

### 核心代码
```cpp
int winner(int n,int k){
    return n%(k+1)==0?2:1;
}
```

### 复杂度
时间复杂度 $O(1)$，空间复杂度 $O(1)$。

---

## 50. [1664：【例 2】取石子游戏 2](http://ybt.ssoier.cn:8088/problem_show.php?pid=1664)
`博弈论` `Nim` `异或和`
### 题意
现在有 $N$ 堆石子，每次操作任选一堆并取走至少一颗，不能操作者输。需要判断整局游戏在最优策略下是先手必胜还是先手必败。
### 分析
这就是最标准的 Nim 游戏。单堆大小为 $x$ 时，可以走到 $0,1,2,\dots,x-1$，它的 SG 值恰好就是 $x$ 本身；多个独立子游戏合并后，总 SG 值就是这些 SG 值的异或和。

因此遍历所有石子堆求异或和即可。异或和为 $0$ 时当前局面是必败态，输出 `lose`；异或和非零时，先手总能在某一堆上做一次调整，把总异或和改成 $0$，输出 `win`。

### 核心代码
```cpp
string solve(vector<int>& a){
    int xr=0;
    for(int x:a) xr^=x;
    return xr?"win":"lose";
}
```

### 复杂度
时间复杂度 $O(N)$，空间复杂度 $O(1)$。

---

## 51. [1665：【例 3】移棋子游戏](http://ybt.ssoier.cn:8088/problem_show.php?pid=1665)
`博弈论` `SG函数` `有向无环图`
### 题意
给一张有向无环图和若干颗棋子的初始位置。每次操作可以任选一颗棋子，沿一条有向边把它移动到后继节点；如果轮到某人时所有棋子都无法再动，这个人失败。
### 分析
单颗棋子在 DAG 上移动，是最典型的图上 SG。终点没有后继，SG 值为 $0$；其余点的 SG 值等于所有后继节点 SG 值集合的 $\operatorname{mex}$。因为图无环，所以可以记忆化搜索，也可以按拓扑逆序递推。

整局游戏里一次只会移动一颗棋子，所以多颗棋子的并存，本质上是若干独立子游戏的和。把所有初始位置的 SG 值异或起来即可：异或和非零先手必胜，否则先手必败。

### 核心代码
```cpp
int sg(int u){
    if(vis[u]) return f[u];
    vis[u]=1;
    unordered_set<int> s;
    for(int v:g[u]) s.insert(sg(v));
    while(s.count(f[u])) ++f[u];
    return f[u];
}
bool win(vector<int>& pos){
    int xr=0;
    for(int x:pos) xr^=sg(x);
    return xr!=0;
}
```

### 复杂度
时间复杂度 $O(N+M+K)$，空间复杂度 $O(N+M)$。

---

## 52. [1666：取石子游戏](http://ybt.ssoier.cn:8088/problem_show.php?pid=1666)
`博弈论` `SG函数` `必胜策略`
### 题意
有若干堆石子，每次只能从某一堆里取走集合 $B$ 中规定的一种数量。题目不仅要判断先手是否有必胜策略，还要在有解时输出字典序最小的第一步操作。
### 分析
每一堆都是一个“可取步数固定”的减法游戏。和普通 Nim 不同，单堆大小为 $x$ 时的 SG 值不再直接等于 $x$，而是要按 `sg[x]=mex(sg[x-b])` 递推出来，其中 $b\in B$。

等单堆 SG 值全部算好后，整体仍然按独立子游戏异或合并。若总异或和为 $0$，先手无必胜策略；否则枚举“从第几堆取多少个”，检查这一步之后的总异或和是否变成 $0$。按堆编号从小到大、取石数从小到大扫到的第一组可行解，就是题目要求的答案。

### 核心代码
```cpp
for(int x=1;x<=mx;++x){
    unordered_set<int> s;
    for(int b:step) if(x>=b) s.insert(sg[x-b]);
    while(s.count(sg[x])) ++sg[x];
}
int xr=0;
for(int x:a) xr^=sg[x];
for(int i=0;i<n;++i) for(int b:step) if(a[i]>=b){
    if((xr^sg[a[i]]^sg[a[i]-b])==0) return {i+1,b};
}
```

### 复杂度
预处理时间复杂度 $O(A_{max}M)$，找首步时间复杂度 $O(NM)$，空间复杂度 $O(A_{max})$。

---

## 53. [1667：巧克力棒](http://ybt.ssoier.cn:8088/problem_show.php?pid=1667)
`博弈论` `巧克力棒` `奇偶性`
### 题意
每轮给出若干根巧克力棒。一次操作可以直接取走整根巧克力棒，也可以对某根已经参与博弈的巧克力棒吃掉一段正整数长度；无法操作的人输。题目要求判断先手 TBL 是否会赢。
### 分析
这题的关键不是把每种操作都硬展开，而是先把长度很小的状态打表。顺着长度往上推，会发现单根巧克力棒对胜负的贡献只和长度奇偶有关：偶数长度与奇数长度会落在两类不同的等价局面里。

于是整局游戏最后只需要统计偶数长度巧克力棒的根数奇偶。若这个计数为奇数，先手有必胜策略；若为偶数，则先手必败。注意题目输出含义和常见写法相反：TBL 会赢时输出 `NO`，不会赢时输出 `YES`。

### 核心代码
```cpp
string solve(vector<long long>& a){
    int cnt=0;
    for(long long x:a) if(x%2==0) ++cnt;
    return cnt%2?"NO":"YES";
}
```

### 复杂度
每轮时间复杂度 $O(N)$，空间复杂度 $O(1)$。

---

## 54. [1668：取石子](http://ybt.ssoier.cn:8088/problem_show.php?pid=1668)
`博弈论` `不变量` `分类讨论`
### 题意
一排石子堆支持两种操作：从任意一堆中拿走一颗，或者把任意两堆合并成一堆。不能操作者输，需要判断 Alice 是否存在必胜策略。
### 分析
这题表面上有“减一”和“合并”两种动作，真正起作用的却是状态被不断压缩成更短的规范型。把小状态打表后可以发现：原始顺序并不重要，决定胜负的是大小为 $1$ 的堆有多少，其余堆按奇偶分层后落在哪一类局面。

所以做题时不需要保留完整过程，只要线性扫描一遍，统计若干关键计数，再按归纳好的分类直接判断即可。本题更像“先在小样本里找不变量，再把它整理成判定式”，而不是标准 SG 套板子。

### 核心代码
```cpp
bool solve(vector<int>& a){
    int c1=0,odd=0,even=0;
    for(int x:a) if(x==1) ++c1; else if(x&1) ++odd; else ++even;
    return judge(c1,odd,even);
}
```

### 复杂度
时间复杂度 $O(N)$，空间复杂度 $O(1)$。

---

## 55. [1669：S-Nim](http://ybt.ssoier.cn:8088/problem_show.php?pid=1669)
`博弈论` `SG函数` `减法游戏`
### 题意
给定一个可取步数集合 $S$，随后会询问多个局面。每个局面由若干堆石子组成，每次只能从一堆里取走属于 $S$ 的某个数，不能操作的人输，要对每个局面输出必胜还是必败。
### 分析
这一题和上一道“指定步长取石子”是同一模型，只是询问变成了批量。因为同一组数据里的步数集合 $S$ 不变，所以最划算的做法是先把单堆大小从 $0$ 到最大石子数的 SG 值全部预处理出来。

之后每个局面都只剩一遍异或：把所有堆对应的 SG 值异或起来，结果非零记为 `W`，结果为零记为 `L`。把每个局面的答案按顺序拼成字符串即可。

### 核心代码
```cpp
for(int x=1;x<=mx;++x){
    unordered_set<int> s;
    for(int d:step) if(x>=d) s.insert(sg[x-d]);
    while(s.count(sg[x])) ++sg[x];
}
for(auto &a:queries){
    int xr=0;
    for(int x:a) xr^=sg[x];
    ans.push_back(xr?'W':'L');
}
```

### 复杂度
单组预处理时间复杂度 $O(kA_{max})$，每个局面判断时间复杂度 $O(n)$，空间复杂度 $O(A_{max})$。

---

## 56. [1670：取石子游戏](http://ybt.ssoier.cn:8088/problem_show.php?pid=1670)
`博弈论` `区间博弈` `先后手判断`
### 题意
有一排石子堆，每次只能从最左端或最右端的一堆取走若干颗，也可以把这一整堆取空。不能操作的人输，题目询问每个初始局面是否存在先手必胜策略。
### 分析
端点堆可以被削成任意更小值，所以这题真正比的不是“这一手拿多少”，而是“两端谁先把局面送进对称核”。从两端往中间看，连续相等的端点可以先整体消去；真正决定胜负的是最外层第一对不相等的端点，以及此时剩余区间长度的奇偶。

实现时用双指针从外向内扫描即可：一路跳过相等端点；若整个序列始终完全对称，那么长度奇偶直接决定胜负；否则在找到第一对不同端点后，按当前剩余区间长度与层数奇偶做判定，就能在线性时间完成每组数据。

### 核心代码
```cpp
int solve(vector<long long>& a){
    int l=0,r=(int)a.size()-1,dep=0;
    while(l<r&&a[l]==a[r]) ++l,--r,++dep;
    if(l>=r) return a.size()&1;
    if((r-l+1)&1) return 1;
    return (dep&1)?(a[l]>a[r]):(a[l]<a[r]);
}
```

### 复杂度
每组时间复杂度 $O(n)$，空间复杂度 $O(1)$。

---
