---
title: "一本通 基础算法高阶专题精选解题报告"
subtitle: "🚀 从资源分配、图上搜索到综合构造的高手训练主线"
order: 3
icon: "🛡️"
---

# 一本通 基础算法高阶专题精选解题报告

这一组题从补牌、排任务这种局部选择，一路走到状态图双向广搜和复杂构造，题型跨度很大，但真正反复出现的动作其实很统一：先把限制翻成“还能选多少、还能走到哪、这一段是否合法”，再决定是贪心地取、二分地判，还是把整道题搬到搜索图上去做。前半段练的是资源怎么分，后半段练的是状态怎么压。

# 一、资源分配与局部最优

这一章先把“看起来很散”的条件压回到一个可维护的量上：有的题是在补缺口，有的题是在维护当前最划算的集合，还有的题是在枚举外层框架后，把剩下的资源用贪心一次吃干净。

## 1. [1671：扑克牌](http://ybt.ssoier.cn:8088/problem_show.php?pid=1671)

`贪心` `二分答案` `缺口统计`

### 题意

有 $n$ 种普通牌，第 $i$ 种现在有 $a_i$ 张，另外还有 $b$ 张万能的特殊牌。每整理出一副牌，需要每种普通牌各一张；也允许缺一种普通牌时，用一张特殊牌补上。求最多能整理出多少副牌。

### 分析

这题最关键的一步，是把“特殊牌能代替什么”翻成“为了凑出 $x$ 副牌，我一共还差多少张”。如果目标是整理出 $x$ 副，那么第 $i$ 种牌至少要有 $x$ 张，不够的部分就是 $\max(0,x-a_i)$，这些缺口只能由特殊牌来填。

于是判定就非常直接：若 $\sum \max(0,x-a_i)\le b$，说明 $x$ 副可行；反之不可行。可行性随着 $x$ 增大单调变差，所以直接二分答案即可。特殊牌不是单独参与组合，而是统一拿来补总缺口，这就是这题的建模核心。

### 核心代码

```cpp
bool check(int x){
    long long need=0;
    for(int i=1;i<=n;i++){
        if(a[i]<x) need+=x-a[i];
        if(need>b) return false;
    }
    return need<=b;
}
int l=0,r=(sum+b)/n;
while(l<r){
    int mid=(l+r+1)>>1;
    if(check(mid)) l=mid;
    else r=mid-1;
}
```

### 复杂度

时间复杂度 $O(n\log V)$，空间复杂度 $O(1)$，其中 $V$ 是答案上界。

---

## 2. [1672：游戏通关](http://ybt.ssoier.cn:8088/problem_show.php?pid=1672)

`反悔贪心` `优先队列` `任务调度`

### 题意

有 $N$ 个任务，每个任务都只需要 $1$ 个单位时间，完成截止时间为 $T_i$，奖励为 $W_i$。只能在各自截止时间前完成才拿到奖励，求最大总奖励。

### 分析

既然每个任务耗时都一样，真正重要的就不是“具体哪一分钟做谁”，而是“到了当前这个截止时间之前，最多只能保留多少个任务”。因此先按截止时间从小到大排序，边扫边把任务奖励放进一个小根堆里，表示“我暂时决定做这些任务”。

如果当前已选任务数超过了当前截止时间，说明时间槽不够用了。这时删掉奖励最小的那个一定最优，因为留下来的任务数相同，但总奖励最大。也就是说，这题不是一次性选好，而是不断“先收下，再反悔删掉最亏的”。

### 核心代码

```cpp
sort(a+1,a+n+1,[](auto &x,auto &y){ return x.t<y.t; });
priority_queue<int,vector<int>,greater<int>> pq;
long long ans=0;
for(int i=1;i<=n;i++){
    pq.push(a[i].w);
    ans+=a[i].w;
    if((int)pq.size()>a[i].t){
        ans-=pq.top();
        pq.pop();
    }
}
```

### 复杂度

时间复杂度 $O(n\log n)$，空间复杂度 $O(n)$。

---

## 3. [1673：楼间跳跃](http://ybt.ssoier.cn:8088/problem_show.php?pid=1673)

`贪心` `优先队列` `资源分配`

### 题意

一排楼中，第 $i$ 栋楼有 $h_i$ 层，每层都有价值 $v_i$ 的物品。起点在第一栋顶层，总共有 $m$ 单位移动时间，可以上下楼、顶层坐滑梯到一楼、以及在相邻楼间按同层跳跃。每件物品拿取不耗时且只能拿一次，求最多能取得的总价值。

### 分析

这题难点不在单步转移，而在先把“路线”压成一个容易统计的框架。假设我们最终最远走到第 $i$ 栋楼，那么前 $i$ 栋楼的顶层都会在第一次到达时顺手拿到，这是固定收益；为了走到第 $i$ 栋，还要花掉 $i-1$ 次横跳，所以剩下的时间才能拿来补更多楼层。

去掉这些“必拿的顶层”以后，第 $j$ 栋楼还剩下 $h_j-1$ 层、每层价值都等于 $v_j$。此时问题就变成：在前 $i$ 栋楼里，最多还能选出 $m+1-i$ 个额外楼层，总价值最大是多少。于是枚举最远楼号 $i$，把每栋楼剩余的楼层数当成一大批权值相同的物品，用小根堆维护当前保留的额外楼层；一旦数量超限，就删掉价值最低的那部分。

### 核心代码

```cpp
struct Node{int cnt,v;bool operator<(const Node& o)const{return v>o.v;}};
priority_queue<Node> pq;
long long sum=0,extra=0,ans=0;
for(int i=1;i<=n&&i<=m+1;i++){
    sum+=v[i];
    if(h[i]>1){
        pq.push({h[i]-1,v[i]});
        sum+=1LL*(h[i]-1)*v[i];
        extra+=h[i]-1;
    }
    long long lim=m+1-i;
    while(extra>lim){
        auto t=pq.top(); pq.pop();
        long long cut=min<long long>(t.cnt,extra-lim);
        sum-=cut*t.v;
        extra-=cut;
        t.cnt-=cut;
        if(t.cnt) pq.push(t);
    }
    ans=max(ans,sum);
}
```

### 复杂度

时间复杂度 $O(n\log n)$，空间复杂度 $O(n)$。

---

## 4. [1674：堆蛋糕](http://ybt.ssoier.cn:8088/problem_show.php?pid=1674)

`贪心` `计数` `构造`

### 题意

有 $n$ 个圆柱蛋糕，只看半径。要把它们尽量堆成三层蛋糕，并要求从上到下半径严格递增。每个蛋糕最多使用一次，问最多能堆出多少个三层蛋糕。

### 分析

把半径相同的蛋糕合并计数后，从小到大处理。此时真正要维护的不是具体哪三个蛋糕凑成一组，而是“当前有多少个已经堆到一层、多少个已经堆到两层的半成品”。

遇到一种新的半径时，最优策略一定是先去补那些已经堆到两层的蛋糕，因为它们离成品最近；再拿来补一层蛋糕；最后剩下的才新开一层蛋糕。因为更大的半径以后还会来，当前半径的价值就在于尽量把已有结构往前推进，而不是过早开新坑。

### 核心代码

```cpp
int one=0,two=0,ans=0;
for(int r=1;r<=mx;r++) if(cnt[r]){
    int c=cnt[r];
    int t=min(c,two);
    ans+=t; c-=t; two-=t;
    t=min(c,one);
    two+=t; c-=t; one-=t;
    one+=c;
}
```

### 复杂度

时间复杂度 $O(U)$，空间复杂度 $O(U)$，其中 $U$ 是半径值域。

# 二、分段合并、参数搜索与顺序规律

这一章开始，单纯的“眼前怎么选”已经不够了。你得先决定最后要切成哪些段、或者先猜一个答案，再问自己：如果这个答案是真的，整套约束能不能一起被消化掉。

## 5. [1675：塔](http://ybt.ssoier.cn:8088/problem_show.php?pid=1675)

`动态规划` `前缀和` `分段合并`

### 题意

一列塔有各自高度。每次可以把相邻两座塔合并成一座，新的高度为两者之和。要求用最少操作，使最终得到的一列塔高度从左到右不下降。

### 分析

合并若干次之后，最终结果其实就是把原数组切成若干连续段，每一段的和变成一座新塔。因此题目等价于：把序列划分成若干连续段，使这些段和不下降，同时段数尽量多。因为每段长度为 $len$ 时内部要做 $len-1$ 次合并，总操作数就是 $n-$段数。

设 `f[i]` 表示前 $i$ 个位置最少需要多少次合并，`last[i]` 表示在达到这个最优合并数时，最后一段段和能做到的最小值。转移时枚举最后一段从 `j+1` 到 `i`，只要这段和不小于 `last[j]`，就能接在前面。这里维护“最小的最后一段和”特别关键，因为它会给后续位置留下最大的继续空间。

### 核心代码

```cpp
for(int i=1;i<=n;i++) f[i]=1e9,last[i]=0;
for(int i=1;i<=n;i++){
    for(int j=i-1;j>=0;j--){
        int seg=pre[i]-pre[j];
        if(seg<last[j]) continue;
        int cost=f[j]+i-j-1;
        if(cost<f[i]||(cost==f[i]&&seg<last[i])){
            f[i]=cost;
            last[i]=seg;
        }
    }
}
```

### 复杂度

时间复杂度 $O(n^2)$，空间复杂度 $O(n)$。

---

## 6. [1676：手机游戏](http://ybt.ssoier.cn:8088/problem_show.php?pid=1676)

`二分答案` `贪心` `差分`

### 题意

一排怪物有生命值 $m_i$。可以发射 $k$ 个火球，每个火球伤害为 $p$，打在第 $i$ 个怪物时，它自己受 $p$ 点伤害，左侧第 $j$ 个怪物会受到 $\max(0,p-(i-j)^2)$ 的溅射。求消灭全部怪物所需的最小 $p$。

### 分析

要求最小伤害值，先想二分是自然的。难点在 `check(p)`：怎么判断在伤害固定为 $p$ 时，$k$ 个火球够不够。因为溅射只往左扩散，所以从右往左处理最舒服：当我们扫到第 $i$ 个怪物时，之后再往左放火球已经帮不到它了；如果它还没死，就只能立刻补火球，而且最优位置就是把这些火球全打在 $i$ 上，因为这样既能杀掉当前怪，又能把影响尽量留给更左边。

一个火球对区间 $[i-\lfloor\sqrt p\rfloor,i]$ 的贡献是个二次函数，所以一口气补上 $t$ 个火球时，可以把它写成 $A+Bi+Ci^2$ 的形式做区间差分，扫到某个位置时再把三项系数累起来算当前总伤害。这样 `check` 才能做到线性或线性对数。

### 核心代码

```cpp
bool check(long long p){
    clear(d0,d1,d2);
    long long c0=0,c1=0,c2=0,used=0;
    for(int i=n;i>=1;i--){
        c0+=d0[i]; c1+=d1[i]; c2+=d2[i];
        long long dmg=c0+c1*i+c2*1LL*i*i;
        if(dmg>=hp[i]) continue;
        long long t=(hp[i]-dmg+p-1)/p;
        used+=t;
        if(used>k) return false;
        add_quad(max(1,i-(int)sqrt(p)),i,t,p);
    }
    return true;
}
```

### 复杂度

时间复杂度 $O(n\log V)$，空间复杂度 $O(n)$。

---

## 7. [1677：软件开发](http://ybt.ssoier.cn:8088/problem_show.php?pid=1677)

`二分答案` `动态规划` `任务分配`

### 题意

公司要同时完成两个软件，每个软件都有 $m$ 个模块。第 $i$ 个员工做软件一的一个模块需要 $d_{i,1}$ 天，做软件二的一个模块需要 $d_{i,2}$ 天；同一时刻只能做一个模块。求最早多少天可以把两个软件都交付。

### 分析

最早完成时间有明显单调性：$T$ 天能做完，$T+1$ 天当然也能，所以先二分总天数。固定一个候选时间 $T$ 以后，每个员工能做的事情不是一个点，而是一整条可行边界：如果他拿出 $x$ 个模块去做软件一，那么最多还能做 $\left\lfloor\frac{T-xd_{i,1}}{d_{i,2}}\right\rfloor$ 个软件二模块。

这就变成一个“前若干员工做完若干个软件一模块时，软件二最多能做多少”的二维资源分配。令 `dp[j]` 表示做完 `j` 个软件一模块时，软件二最多完成多少个，逐个员工做背包转移即可。最后只要 `dp[m] >= m`，说明当前时间可行。

### 核心代码

```cpp
bool check(int T){
    fill(dp,dp+m+1,-INF);
    dp[0]=0;
    for(int i=1;i<=n;i++){
        memcpy(ndp,dp,sizeof dp);
        for(int a=0;a<=min(m,T/d1[i]);a++){
            int b=(T-a*d1[i])/d2[i];
            for(int j=0;j+a<=m;j++)
                ndp[j+a]=max(ndp[j+a],min(m,dp[j]+b));
        }
        memcpy(dp,ndp,sizeof dp);
    }
    return dp[m]>=m;
}
```

### 复杂度

时间复杂度 $O(nm^2\log V)$，空间复杂度 $O(m)$。

---

## 8. [1678：独木桥](http://ybt.ssoier.cn:8088/problem_show.php?pid=1678)

`排序` `第k小` `碰撞等价`

### 题意

数轴上有 $n$ 个孩子，各自在整数点上并面向左或右，以速度 $1$ 匀速移动。两个孩子相遇时会同时掉头。多次询问给出编号 $k$ 和时刻 $t$，要求原始编号为 $k$ 的孩子在 $t$ 秒后的位置。

### 分析

相遇掉头这一类题，先想“把孩子看成不可区分的小球”。两个同速小球对撞并掉头，与它们彼此直接穿过去、只是交换身份，位置集合是完全一样的。所以忽略碰撞以后，时刻 $t$ 的所有位置就是 `p_i±t`；真正变化的只有“编号附着在哪个位置上”。

而编号的附着方式也很稳定：从左到右的相对顺序始终不变。于是原编号为 $k$ 的孩子，只要先求出它在初始排序里的名次 `rk`，答案就是忽略碰撞后所有位置中的第 `rk` 小。左行位置数组整体减去 $t$，右行位置数组整体加上 $t$，两边内部仍然有序，因此每个询问都能转成“两段有序表里的第 $k$ 小”。

### 核心代码

```cpp
long long kth(int rk,long long t){
    int l=max(0,rk-(int)R.size()),r=min(rk,(int)L.size());
    while(l<r){
        int x=(l+r+1)>>1,y=rk-x;
        long long a=(x?L[x-1]-t:-(1LL<<60));
        long long b=(y<(int)R.size()?R[y]+t:(1LL<<60));
        if(a<=b) l=x;
        else r=x-1;
    }
    int x=l,y=rk-x;
    long long u=(x<(int)L.size()?L[x]-t:(1LL<<60));
    long long v=(y<(int)R.size()?R[y]+t:(1LL<<60));
    return min(u,v);
}
```

### 复杂度

预处理时间复杂度 $O(n\log n)$，单次询问时间复杂度 $O(\log n)$，空间复杂度 $O(n)$。

---

## 9. [1679：子集](http://ybt.ssoier.cn:8088/problem_show.php?pid=1679)

`排序` `前缀和` `三分`

### 题意

从给定的 $n$ 个数中选一个非空子集，使“子集平均数减去子集中位数”的值最大，输出最大值。

### 分析

先把数组排序。真正该问的是：如果我强行指定 `a[mid]` 作为中位数，最优子集会长什么样？要让平均数尽量大，中位数以下部分就应尽量选靠近 `a[mid]` 的大数；中位数以上部分则选最大的那些数。另一方面，偶数长度不会更优，因为把中间偏小的一边删掉只会让平均数更大、中位数不变或更有利，所以只需要考虑奇数长度 `2k+1`。

于是固定 `mid` 后，子集唯一地写成：左边取 `k` 个最大的，右边取 `k` 个最大的，再加上 `a[mid]` 自己。用前缀和可以 $O(1)$ 算出这个值。随着 `k` 增大，收益先上升后下降，可以用三分或邻域枚举找到最佳 `k`。

### 核心代码

```cpp
double calc(int mid,int k){
    long long left=pre[mid-1]-pre[mid-1-k];
    long long right=pre[n]-pre[n-k];
    return 1.0*(left+right+a[mid])/(2*k+1)-a[mid];
}
for(int mid=2;mid<n;mid++){
    int l=0,r=min(mid-1,n-mid);
    while(r-l>=3){
        int m1=l+(r-l)/3,m2=r-(r-l)/3;
        if(calc(mid,m1)<calc(mid,m2)) l=m1;
        else r=m2;
    }
    for(int k=l;k<=r;k++) ans=max(ans,calc(mid,k));
}
```

### 复杂度

时间复杂度 $O(n\log n)$，空间复杂度 $O(n)$。

---

## 10. [1680：序列](http://ybt.ssoier.cn:8088/problem_show.php?pid=1680)

`Golomb序列` `递推` `分块`

### 题意

序列初始为 $1,2,2$，从第三项开始，若第 $i$ 项是 $x$，就在序列末尾追加 $x$ 个数字 $i$。定义 `last(N)` 为数字 $N$ 最后一次出现的位置。多次询问要求输出 $last(last(N))\bmod (10^9+7)$。

### 分析

这串序列的关键性质是：数字 $i$ 出现的次数，恰好就是第 $i$ 项本身。把第 $i$ 项记成 `g[i]`，那么 `last(N)` 就是前缀和 $S(N)=\sum_{i=1}^N g[i]`。因此题目本质上是在问两次前缀位置函数。

难点在于 $N$ 很大，不能按“序列位置”硬推。真正有效的想法是把相同值出现的一整段压成块：先用 Golomb 递推 `g[i]=1+g[i-g[g[i-1]]]` 预处理前面一段，再用“值域块”去递归求 `S(x)`，每次不是走一个位置，而是整段整段跳过。也就是说，暴力推进的单位必须从“单个元素”升级成“同值区间”。

### 核心代码

```cpp
void init(int B){
    g[1]=1; g[2]=g[3]=2;
    for(int i=1;i<=3;i++) S[i]=S[i-1]+g[i];
    for(int i=4;i<=B;i++){
        g[i]=1+g[i-g[g[i-1]]];
        S[i]=S[i-1]+g[i];
    }
}
long long solve_last(long long x){
    if(x<=B) return S[x];
    if(mem.count(x)) return mem[x];
    long long cur=find_block(x), ans=S[cur];
    while(cur<x){
        long long v=value_of(cur+1);
        long long r=min(x,last_pos(v));
        ans+=(r-cur)*v;
        cur=r;
    }
    return mem[x]=ans;
}
```

### 复杂度

预处理时间复杂度约为 $O(B)$，单次询问复杂度取决于分块跳跃次数，空间复杂度 $O(B)$。

# 三、搜索剪枝与构造恢复

到了这一章，题目开始要求你把“合法”本身当成搜索条件去维护。有的是把答案拆成左右两半，有的是把冲突关系先建成图，还有的是依赖一个像样的估价函数，否则根本搜不动。

## 11. [1681：统计方案](http://ybt.ssoier.cn:8088/problem_show.php?pid=1681)

`折半搜索` `同余逆元` `哈希`

### 题意

给出 $n$ 个正整数，选出一个非空子集，使这些数的乘积模质数 $p$ 后等于 $c$。求方案数，结果对 $10^9+7$ 取模。

### 分析

$n\le 32$，看到乘积子集计数，第一反应就该把它拆成两半。把前一半所有子集的乘积模 $p$ 统计出来，记次数；再枚举后一半某个子集的乘积为 `x` 时，前一半只需要乘积等于 $c\cdot x^{-1}\bmod p` 即可。

这里 `p` 是质数，所以只要 `x\ne0`，逆元都能用快速幂求出。折半以后，原本指数级的组合就被压成了两个 $2^{16}$ 级别的枚举。最后别忘了去掉“两边都选空集”的非法情况。

### 核心代码

```cpp
for(int s=0;s<(1<<m1);s++){
    long long x=1;
    for(int i=0;i<m1;i++) if(s>>i&1) x=x*a[i]%p;
    cnt[x]++;
}
for(int s=0;s<(1<<m2);s++){
    long long x=1;
    for(int i=0;i<m2;i++) if(s>>i&1) x=x*b[i]%p;
    long long need=c*qpow(x,p-2)%p;
    ans=(ans+cnt[need])%MOD;
}
if(c==1) ans=(ans-1+MOD)%MOD;
```

### 复杂度

时间复杂度 $O(2^{n/2}\cdot n)$，空间复杂度 $O(2^{n/2})$。

---

## 12. [1682：最小字典序](http://ybt.ssoier.cn:8088/problem_show.php?pid=1682)

`DFS` `回溯` `字符串构造`

### 题意

给一个只含数字、逗号和问号的串。问号可以替换成数字或逗号。要求恢复出一个合法串：由正整数组成、数字之间以逗号分隔、没有前导零，并且数字序列严格递增。在所有合法恢复方案中，输出字典序最小的那个；无解输出 `impossible`。

### 分析

这题不是在填字符，而是在逐个恢复数字。因为“严格递增”“不能有前导零”都是围绕每个数来说的，所以搜索状态最好写成“当前扫到哪个位置、前一个数是什么”。到当前位置后，枚举下一个数字的长度和具体填法，只要它能和原串模式匹配，并且数值严格大于上一个数，就继续递归。

为什么这样写还能保证字典序最小？因为字典序比较本质上是在比最早的决策位，所以只要我们按照“更小的字符优先”去生成下一个数字和分隔位置，第一条搜到的合法路径就是答案。这里搜索的重点不是暴力，而是把合法性判断尽量前移，越早剪掉不可能的分支越稳。

### 核心代码

```cpp
bool dfs(int pos,string pre){
    if(pos==n) return true;
    for(string cur:gen_candidates(pos,s)){ 
        if((cur.size()>1&&cur[0]=='0')||!greater_than(cur,pre)) continue;
        int nxt=pos+cur.size();
        if(nxt<n&&!fit(s[nxt],',')) continue;
        if(dfs(nxt+(nxt<n),cur)){
            path.push_back(cur);
            return true;
        }
    }
    return false;
}
```

### 复杂度

最坏时间复杂度为指数级，实际依赖剪枝；空间复杂度为搜索栈深度 $O(|S|)$。

---

## 13. [1683：稗田阿求](http://ybt.ssoier.cn:8088/problem_show.php?pid=1683)

`状态压缩` `冲突图` `最大独立集`

### 题意

有 $N$ 个字符和 $N$ 个数字，需要建立一个全局一一对应关系。给出 $M$ 组“文字串 + 数列”配对，每组内部都合法。问最多能让多少组同时满足同一个全局映射。

### 分析

真正要做的不是直接搜一个 $26!$ 的映射，而是先看“哪些配对之间能共存”。每一组配对都会给若干个字符到数字的对应。如果两组中出现了“同一字符对应不同数字”或“同一数字对应不同字符”，那它们就不能同时被选中；反之可以共存。

于是整题立刻变成图论模型：每组配对是一个点，冲突就连边。我们要选出最多个两两不冲突的点，也就是在冲突图上求最大独立集。$M\le40$，非常适合用位运算做状态压缩，再配合 DFS 和上界剪枝去搜最优答案。

### 核心代码

```cpp
void dfs(unsigned long long can,int cnt){
    if(!can){ ans=max(ans,cnt); return; }
    if(cnt+__builtin_popcountll(can)<=ans) return;
    int v=__builtin_ctzll(can);
    dfs(can&~ban[v]&~(1ULL<<v),cnt+1);
    dfs(can&~(1ULL<<v),cnt);
}
for(int i=0;i<m;i++)
    for(int j=i+1;j<m;j++)
        if(conflict(i,j)) ban[i]|=1ULL<<j,ban[j]|=1ULL<<i;
```

### 复杂度

最坏时间复杂度为指数级，位运算剪枝后实际可过；空间复杂度 $O(M)$。

---

## 14. [1684：翻转序列](http://ybt.ssoier.cn:8088/problem_show.php?pid=1684)

`IDA*` `启发式搜索` `前缀翻转`

### 题意

给定一个 $1\sim n$ 的排列，每次可以翻转前缀 $x_1\sim x_i$。求把排列变成升序所需的最少操作次数。

### 分析

前缀翻转的分支很多，但答案通常不大，所以这题最自然的切入点是 IDA*。关键在估价函数。把排列末尾补一个 `n+1`，开头补一个 `0`，统计有多少相邻位置不是“连续数”关系，这些地方叫断点。一次前缀翻转最多只能消掉两个断点，因此 `ceil(断点数/2)` 就是一个合法下界。

有了这个下界以后，就可以做“当前深度 + 估价 > 限制深度就剪枝”的迭代加深搜索。真正难的不是翻哪一段，而是先想出一个足够紧、又绝不会高估的估价函数。

### 核心代码

```cpp
int h(){
    int cnt=0;
    for(int i=0;i<=n;i++)
        if(abs(a[i+1]-a[i])!=1) cnt++;
    return (cnt+1)>>1;
}
bool dfs(int dep,int lim){
    if(dep+h()>lim) return false;
    if(h()==0) return true;
    int b[25]; memcpy(b,a,sizeof a);
    for(int k=2;k<=n;k++){
        reverse(a+1,a+k+1);
        if(dfs(dep+1,lim)) return true;
        memcpy(a,b,sizeof a);
    }
    return false;
}
```

### 复杂度

时间复杂度依赖答案深度和剪枝效果，空间复杂度 $O(n)$。

---

## 15. [1685：新版方格取数](http://ybt.ssoier.cn:8088/problem_show.php?pid=1685)

`状态压缩` `记忆化搜索` `可达性`

### 题意

在一个不超过 $16$ 个格子的网格里，每次取一个格子的数。第一次必须从边缘进入；之后可以走到当前格子的上下左右未取格。若当前取到的是原棋盘边缘格，则下一步也可以重新离开后再从任意边缘格进入。第 $i$ 次取到数值 $x$ 的得分为 $i\times x$，求最大总得分。

### 分析

格子总数只有 $16$，所以最直接的方向就是状压。难点在状态里到底要记什么。这里不需要记录整条路径，只需要记录三件事：哪些格子已经取过、上一个取的是哪个格子、以及下一步是否允许“重新从边缘进入”。最后这个布尔量很关键，因为它决定下一步的候选集究竟是“相邻未取格”，还是“所有边缘未取格 + 相邻未取格”。

这样一来，搜索就是标准的记忆化 DFS：在状态 `(mask,last,free)` 下，枚举所有可走的下一个格子 `v`，它的贡献就是 `(popcount(mask)+1) * a[v]`，然后递归到新状态。把“路径合法性”压进状态以后，这题就从复杂规则变成了普通的状态转移。

### 核心代码

```cpp
long long dfs(int mask,int last,int free){
    if(mask==ALL) return 0;
    long long &res=dp[mask][last+1][free];
    if(res!=-1) return res;
    res=0; int step=__builtin_popcount(mask)+1;
    vector<int> cand;
    if(free) for(int v:border) if(!(mask>>v&1)) cand.push_back(v);
    if(last!=-1) for(int v:g[last]) if(!(mask>>v&1)) cand.push_back(v);
    sort(cand.begin(),cand.end()); cand.erase(unique(cand.begin(),cand.end()),cand.end());
    for(int v:cand)
        res=max(res,1LL*step*val[v]+dfs(mask|1<<v,v,isBorder[v]));
    return res;
}
```

### 复杂度

时间复杂度 $O(2^{mn}\cdot mn)$，空间复杂度 $O(2^{mn}\cdot mn)$。

# 四、图上搜索与层次扩张

这几题的共同点是：原题面看着各不相同，但最后都能落成一张“每次走一步”的状态图。区别只在于这张图是普通无权图、分层受限图，还是带着“当前最低水位”这种更像最短路的扩张方式。

## 16. [1686：最小操作次数](http://ybt.ssoier.cn:8088/problem_show.php?pid=1686)

`DP` `多源BFS` `状态图`

### 题意

给定一个字符矩阵，从左上角出发。每次操作要么选择当前格子的字符，要么向上下左右某方向一直移动，直到碰到第一个和当前字符不同的格子。要求最少操作次数，使依次选出的字符恰好等于字符串 `s` 后面再接一个 `*`。

### 分析

如果直接在三维状态 `(位置, 已匹配前缀长度)` 上 BFS，会很大，但这题有个很强的后缀结构：假设我们已经知道“从每个格子出发，完成后缀 `t[i+1..]` 的最少代价”，那么要求后缀 `t[i..]` 时，只需把所有字符等于 `t[i]` 的格子当成候选落点，代价为 `1 + dp[i+1][u]`，然后在移动图上反向做一次最短路即可。

换句话说，选择字符这一步只是若干个新的源点，而真正的传播仍然是无权图上的最短路。于是整题可以倒着做：从 `*` 开始一层层回推，每一层都是一次“多源 BFS 刷整张移动图”。

### 核心代码

```cpp
for(int i=L-1;i>=0;i--){
    queue<int> q;
    fill(dist,dist+tot,INF);
    for(int u:pos[t[i]]){
        dist[u]=dp[i+1][u]+1;
        q.push(u);
    }
    while(!q.empty()){
        int u=q.front(); q.pop();
        for(int v:rev[u]) if(dist[v]>dist[u]+1){
            dist[v]=dist[u]+1;
            q.push(v);
        }
    }
    for(int u=0;u<tot;u++) dp[i][u]=dist[u];
}
```

### 复杂度

时间复杂度 $O(|s|\cdot nm)$，空间复杂度 $O(nm)$。

---

## 17. [1688：最优路径](http://ybt.ssoier.cn:8088/problem_show.php?pid=1688)

`BFS` `字典序最小` `分层搜索`

### 题意

无向图中每条边长度都是 $1$，但有颜色。要求从点 $1$ 走到点 $n$，先使路径边数最少；在所有最短路径中，再让边颜色序列字典序最小。

### 分析

先把“最短”与“字典序最小”拆开。因为边权全为 $1$，先从终点做一次 BFS，求出每个点到终点的最短距离 `dist[u]`。这样一来，任意一条最短路上的下一步都必须满足 `dist[v]=dist[u]-1`。

随后从起点分层推进。当前层所有点往下一层扩展时，只看那些确实能离终点更近一层的边；在这些边里，颜色最小的那个就是这一层必须选定的字典序答案。确定这一位以后，再只沿着这种最小颜色的边进入下一层。字典序是一位一位决定的，所以这样贪心完全成立。

### 核心代码

```cpp
bfs_from_n();
vector<int> cur{1}, nxt, seq;
for(int step=dist[1];step;step--){
    int best=INF;
    for(int u:cur) for(auto [v,c]:g[u])
        if(dist[v]==dist[u]-1) best=min(best,c);
    seq.push_back(best);
    for(int u:cur) for(auto [v,c]:g[u])
        if(dist[v]==dist[u]-1&&c==best&&!vis[v])
            vis[v]=1,nxt.push_back(v);
    cur.swap(nxt); nxt.clear();
}
```

### 复杂度

时间复杂度 $O(n+m)$，空间复杂度 $O(n+m)$。

---

## 18. [1687：积水问题](http://ybt.ssoier.cn:8088/problem_show.php?pid=1687)

`优先队列BFS` `最短路思想` `模拟`

### 题意

给定一个高度矩阵，外侧视作高度为 $0$ 的无限区域。雨一直下，水能向四联通方向流动，求每个格子的最终积水高度。

### 分析

这题最容易错在把它想成“每个格子往外找最低出口”。更自然的视角其实是反过来：从外部往里灌水。外部水位永远先从当前最低的缺口进入，所以我们始终应该先处理“当前边界上最低的那个格子”，这就是典型的小根堆扩张。

当一个边界格的当前水位是 `h` 时，它邻居的最终水面至少是 `max(h, ground[nei])`：如果邻居更高，水面上不去；如果邻居更低，水就会被这道边界抬到 `h`。这个过程和 Dijkstra 十分类似，堆里存的不是距离，而是“到达该格时的最低可行水位”。

### 核心代码

```cpp
priority_queue<Node> pq;
for(auto [x,y]:border) pq.push({x,y,h[x][y]}),vis[x][y]=1;
while(!pq.empty()){
    auto [x,y,w]=pq.top(); pq.pop();
    for(int d=0;d<4;d++){
        int nx=x+dx[d],ny=y+dy[d];
        if(out(nx,ny)||vis[nx][ny]) continue;
        vis[nx][ny]=1;
        lev[nx][ny]=max<long long>(h[nx][ny],w);
        pq.push({nx,ny,lev[nx][ny]});
    }
}
```

### 复杂度

时间复杂度 $O(nm\log(nm))$，空间复杂度 $O(nm)$。

# 五、状态图与综合构造

最后两题都不是在原题面上硬推，而是先把“交换一次”“走一步向量”翻成状态图上的一条边。边权一旦统一，答案就变成最短步数，只不过一个在排列状态里走，一个在坐标状态里走。

## 19. [1689：堆排问题](http://ybt.ssoier.cn:8088/problem_show.php?pid=1689)

`双向BFS` `状态压缩` `排列搜索`

### 题意

给定一棵二叉树，各点上有互不相同的权值。还给出若干允许交换权值的位置对，每次操作只能选其中一对交换。求最少多少次交换，能让整棵树满足大根堆性质。

### 分析

一旦注意到 $N$ 很小，这题就该立刻把“树 + 交换”改写成状态图：一个状态就是“当前每个结点上放着哪一个权值排名”，一条边就是做一次允许的交换。目标不是某个固定排列，而是所有满足堆序的排列，因此判断终点条件只需要检查每条父子边是否满足父亲更大。

接下来问题就纯粹了：所有边权都为 $1$，求初始状态到任意合法堆状态的最短路。实现时通常先把权值离散成 $1..N$ 的排名，再用压位或哈希压缩整个排列，配合 BFS 或双向 BFS 扩展。真正的建模转身在于：我们不再考虑“怎么局部调整堆”，而是把每次交换看成状态图上的一步。

### 核心代码

```cpp
queue<u64> q;
unordered_map<u64,int> dist;
dist[S]=0; q.push(S);
while(!q.empty()){
    u64 s=q.front(); q.pop();
    if(is_heap(s)) return dist[s];
    for(auto [u,v]:op){
        u64 t=swap_pos(s,u,v);
        if(dist.count(t)) continue;
        dist[t]=dist[s]+1;
        q.push(t);
    }
}
```

### 复杂度

时间复杂度取决于可达状态数，空间复杂度同样取决于搜索到的状态规模。

---

## 20. [1690：棋盘问题](http://ybt.ssoier.cn:8088/problem_show.php?pid=1690)

`BFS` `剪枝` `向量`

### 题意

无限棋盘上给定起点、终点，以及 $n$ 个可用向量。每一步可以任选一个向量加到当前位置上。求从起点到终点的最少步数；如果不能到达，输出 `IMPOSSIBLE`。

### 分析

题目看着在无限棋盘上，其实状态空间一点也不无限。因为所有给定向量的两个坐标都为正数，所以每走一步，横纵坐标都只会增加。把坐标整体平移后，我们只需要关心从 `(0,0)` 能不能走到 `(dx,dy)`；一旦某个状态的横坐标超过 `dx`，或纵坐标超过 `dy`，它就再也不可能回来了，可以直接剪掉。

这样以后，图就变成一个被矩形框住的无权状态图。若 `dx<0` 或 `dy<0`，直接无解；否则从 `(0,0)` 做 BFS，第一次到达 `(dx,dy)` 的层数就是最短步数。这里最重要的不是 BFS 本身，而是先看出“正向向量”带来的天然单调性。

### 核心代码

```cpp
if(dx<0||dy<0) puts("IMPOSSIBLE");
queue<pair<int,int>> q;
vis[0][0]=1; dist[0][0]=0; q.push({0,0});
while(!q.empty()){
    auto [x,y]=q.front(); q.pop();
    for(auto [vx,vy]:vec){
        int nx=x+vx,ny=y+vy;
        if(nx>dx||ny>dy||vis[nx][ny]) continue;
        vis[nx][ny]=1;
        dist[nx][ny]=dist[x][y]+1;
        q.push({nx,ny});
    }
}
```

### 复杂度

时间复杂度为 $O(\text{可达状态数}\times n)$，空间复杂度为 $O(\text{可达状态数})$。
