---
title: "一本通 基础算法提高专题精选解题报告"
subtitle: "🧰 从贪心、二分到搜索建模的基础算法进阶主线"
order: 2
icon: "🪛"
---

# 一本通 基础算法提高专题精选解题报告

这一组题从区间贪心一路走到状态搜索，跨度很大，但主线并不散：先把原题压成可排序、可判定、可剪枝的结构，再决定该用贪心、二分还是最短路。前半段练的是“当前最该处理谁”，后半段练的则是“状态该怎么定义，哪些分支可以提前砍掉”。

# 一、把区间先排成顺序

这一章先不急着二分或搜索，而是先把题目翻译成“按右端点、按截止时间、按局部收益排序”的决策序列。很多基础算法题表面题型不同，实质都在训练同一个动作：当前这一步，究竟该优先保住哪一个位置。

## 1. [1422：【例题1】活动安排](http://ybt.ssoier.cn:8088/problem_show.php?pid=1422)

`贪心` `区间调度`

### 题意

给出一批有起止时间的活动，同一时间只能安排一个。要求选出尽量多的互不冲突活动。

### 分析

这题最关键的不是“选哪个活动开始”，而是“留下多少后手”。一旦当前已经空出一个时间点，能给后面留出最大空间的，一定是结束得最早的那个活动，所以先按结束时间排序。

之后从前往后扫，只要当前活动的开始时间不早于上一个被选活动的结束时间，就把它接进答案。这个贪心成立的原因是：任何结束更晚的替代品，都只会让后面的可选空间更小，不可能更优。

### 核心代码

```cpp
sort(a+1,a+n+1,[](auto &x,auto &y){return x.r<y.r;});
int ans=0,last=-1;
for(int i=1;i<=n;i++) if(a[i].l>=last){
    ans++;
    last=a[i].r;
}
```

### 复杂度

时间复杂度 $O(n\log n)$，空间复杂度 $O(1)$。

---

## 2. [1429：线段](http://ybt.ssoier.cn:8088/problem_show.php?pid=1429)

`贪心` `区间选择`

### 题意

数轴上给出若干线段，要求尽量多选出互相没有重合部分的线段。

### 分析

它和活动安排是同一模型：一旦决定保留一条线段，就希望它尽快结束，好把右边的空间留给更多候选。于是仍然按右端点从小到大排序。

扫描时维护当前最后一条被选线段的右端点。新线段只要左端点不小于这个位置，就能安全接上。真正该形成的直觉是：区间个数最大化时，优先保住“结束早”的方案。

### 核心代码

```cpp
sort(seg+1,seg+n+1,[](auto &a,auto &b){return a.r<b.r;});
int ans=0,last=-INF;
for(int i=1;i<=n;i++) if(seg[i].l>=last){
    ans++;
    last=seg[i].r;
}
```

### 复杂度

时间复杂度 $O(n\log n)$，空间复杂度 $O(1)$。

---

## 3. [1423：【例题2】种树](http://ybt.ssoier.cn:8088/problem_show.php?pid=1423)

`贪心` `树状数组` `并查集`

### 题意

每个居民给出一个区间 $[B,E]$ 和下限 $T$，要求这个区间里至少种够 $T$ 棵树，每个位置最多种一棵，求最少总棵数。

### 分析

如果某个区间还差若干棵树，最优补法一定是从右往左种。原因很直接：这些新种的树不仅要满足当前区间，还应该尽量照顾以后右端点更靠后的区间，而靠右的位置可复用性最高。

所以先把所有要求按右端点排序。对每个区间，用树状数组查出已经种了多少棵；若还差 `need` 棵，就不断在当前区间里选择“最靠右且还没种过”的位置补上。为了快速找到这个位置，可以用并查集维护每个点左边最近的未种位置。

### 核心代码

```cpp
sort(q+1,q+m+1,[](auto &a,auto &b){return a.r<b.r;});
for(int i=0;i<=n;i++) fa[i]=i;
for(int i=1;i<=m;i++){
    int need=q[i].t-(sum(q[i].r)-sum(q[i].l-1));
    while(need--){
        int p=find(q[i].r);
        add(p,1);
        fa[p]=find(p-1);
    }
}
```

### 复杂度

时间复杂度 $O((n+m)\log n)$，空间复杂度 $O(n)$。

---

## 4. [1424：【例题3】喷水装置](http://ybt.ssoier.cn:8088/problem_show.php?pid=1424)

`贪心` `区间覆盖`

### 题意

喷头都在草坪中线上，已知位置和半径。要求用尽量少的喷头覆盖整段长度为 $L$、宽为 $W$ 的草坪。

### 分析

每个喷头真正有用的信息不是圆，而是它在草坪长度方向上能覆盖的投影区间。若半径不超过 $W/2$，它连整条宽度都够不着，直接丢掉；否则可算出左右端点 $[x-d,x+d]$。

转成区间后，题目就变成“最少区间覆盖整段 $[0,L]$”。做法是经典贪心：在所有左端点不超过当前覆盖边界的区间里，选右端点最远的那个，一次把边界推进得尽量远。若某一步根本推不动，就说明无解。

### 核心代码

```cpp
for(int i=1;i<=n;i++) if(r[i]*2>W){
    double d=sqrt(r[i]*r[i]-W*W/4.0);
    seg.push_back({x[i]-d,x[i]+d});
}
sort(seg.begin(),seg.end());
double cur=0; int i=0,ans=0;
while(cur<L){
    double far=cur;
    while(i<seg.size()&&seg[i].l<=cur) far=max(far,seg[i++].r);
    if(far==cur){ ans=-1; break; }
    cur=far; ans++;
}
```

### 复杂度

时间复杂度 $O(n\log n)$，空间复杂度 $O(n)$。

---

## 5. [1425：【例题4】加工生产调度](http://ybt.ssoier.cn:8088/problem_show.php?pid=1425)

`贪心` `Johnson 调度`

### 题意

每个产品都必须先在 A 车间加工，再去 B 车间加工。要求安排顺序，使全部产品完成的总时间最短。

### 分析

这题的门槛在于先把“两台机器串行加工”翻译成 Johnson 规则。对于两个作业 $x,y$，比较 `x` 在前还是 `y` 在前，真正影响总时长的是中间那段等待时间，因此会得到经典结论：若某作业在 A 上更快，就应该尽量往前；若它在 B 上更快，就应该尽量往后。

于是把作业分成两类：$A_i<B_i$ 的按 $A_i$ 升序放前面，其他的按 $B_i$ 降序放后面。最后按这个顺序模拟两台机器的完成时间即可。

### 核心代码

```cpp
vector<int> L,R;
for(int i=1;i<=n;i++)
    (A[i]<B[i]?L:R).push_back(i);
sort(L.begin(),L.end(),[](int x,int y){return A[x]<A[y];});
sort(R.begin(),R.end(),[](int x,int y){return B[x]>B[y];});
long long ta=0,tb=0;
for(int id: L){ ta+=A[id]; tb=max(tb,ta)+B[id]; }
for(int id: R){ ta+=A[id]; tb=max(tb,ta)+B[id]; }
```

### 复杂度

时间复杂度 $O(n\log n)$，空间复杂度 $O(n)$。

---

## 6. [1426：【例题5】智力大冲浪](http://ybt.ssoier.cn:8088/problem_show.php?pid=1426)

`贪心` `并查集` `任务调度`

### 题意

每个小游戏都占一个时段，必须在截止时间前完成，否则会被扣掉对应金额。初始奖金固定，要求安排顺序让最后拿到的钱最多。

### 分析

把“少扣钱”倒过来看，就是“尽量保住扣得最狠的项目”。因此先按扣款从大到小排序，越贵的失败越不能接受。

处理某个游戏时，如果它的截止时间之前还有空位，就把它放到“最靠后的那个空位”上。为什么一定要尽量靠后？因为这样才不会挤掉后面截止时间更早的游戏。并查集正好可以维护“某一天左边最近的空闲时段”。最后用总扣款减去成功保住的部分，就得到最小损失。

### 核心代码

```cpp
sort(job+1,job+n+1,[](auto &a,auto &b){return a.w>b.w;});
for(int i=0;i<=n;i++) fa[i]=i;
int save=0,sumw=0;
for(int i=1;i<=n;i++) sumw+=job[i].w;
for(int i=1;i<=n;i++){
    int p=find(job[i].d);
    if(p) save+=job[i].w, fa[p]=find(p-1);
}
cout<<m-(sumw-save);
```

### 复杂度

时间复杂度 $O(n\log n)$（或并查集均摊近似线性），空间复杂度 $O(n)$。

---

## 7. [1430：家庭作业](http://ybt.ssoier.cn:8088/problem_show.php?pid=1430)

`贪心` `并查集` `任务调度`

### 题意

每份作业都需要一天，有截止日期和学分。要求选择并安排若干作业，让最后拿到的总学分最大。

### 分析

和上一题完全是同一层建模：真正要保住的是高学分作业，因此先按学分从大到小处理。

每遇到一份作业，就把它塞进截止日之前最晚的空闲天数。这样做的作用，是把前面的早期位置留给那些“必须更早完成”的作业。并查集维护最晚空位后，这个贪心就能写得很顺。

### 核心代码

```cpp
sort(hw+1,hw+n+1,[](auto &a,auto &b){return a.w>b.w;});
for(int i=0;i<=n;i++) fa[i]=i;
int ans=0;
for(int i=1;i<=n;i++){
    int p=find(hw[i].d);
    if(p) ans+=hw[i].w, fa[p]=find(p-1);
}
cout<<ans;
```

### 复杂度

时间复杂度 $O(n\log n)$，空间复杂度 $O(n)$。

---

# 二、把过程压成可维护的量

从这一章开始，题目不再只靠排序就结束，而是要先造出一个稳定的中间量：有时是前缀失衡量，有时是当前段和，有时则是“答案固定后能否判定”。读这一章时，最该盯住的就是判定函数究竟从哪一步长出来。

## 8. [1427：数列极差](http://ybt.ssoier.cn:8088/problem_show.php?pid=1427)

`贪心` `优先队列`

### 题意

不断从数列里取两个数 $a,b$，把它们替换成 $ab+1$，直到只剩一个数。要求求出最后结果的最大值与最小值之差。

### 分析

真正影响答案的不是“这一步变成多少”，而是“这个新数以后还会继续被乘多少次”。越早合并出来的数，会在后续步骤里被反复放大，所以顺序才是关键。

想让结果尽量大，就该让小数尽早合并，把“大数”留到后面去乘；想让结果尽量小，反过来让大数先合并。于是最大值用小根堆不断取最小两个，最小值用大根堆不断取最大两个。

### 核心代码

```cpp
auto workMax=[&](){
    priority_queue<long long,vector<long long>,greater<long long>> q(a.begin(),a.end());
    while(q.size()>1){ long long x=q.top(); q.pop(); long long y=q.top(); q.pop(); q.push(x*y+1); }
    return q.top();
};
auto workMin=[&](){
    priority_queue<long long> q(a.begin(),a.end());
    while(q.size()>1){ long long x=q.top(); q.pop(); long long y=q.top(); q.pop(); q.push(x*y+1); }
    return q.top();
};
cout<<workMax()-workMin();
```

### 复杂度

时间复杂度 $O(n\log n)$，空间复杂度 $O(n)$。

---

## 9. [1428：数列分段](http://ybt.ssoier.cn:8088/problem_show.php?pid=1428)

`贪心` `序列分段`

### 题意

给定一个正整数序列和上限 $M$，要求把它切成尽量少的连续段，并保证每段和都不超过 $M$。

### 分析

因为所有数都是正的，所以当前这一段一旦还能继续往后装，就没有理由提前截断：你现在切开，只会让后面多出一段，不会让任何一段更省。

于是直接从左到右贪心扩展当前段。若加入下一个数后会超过 $M$，就必须在这里断开并新开一段。这种“能延就延”的写法，恰好也是在正数条件下使用段数最少的方案。

### 核心代码

```cpp
int ans=1,sum=0;
for(int i=1;i<=n;i++){
    if(sum+a[i]<=M) sum+=a[i];
    else ans++,sum=a[i];
}
cout<<ans;
```

### 复杂度

时间复杂度 $O(n)$，空间复杂度 $O(1)$。

---

## 10. [1431：钓鱼](http://ybt.ssoier.cn:8088/problem_show.php?pid=1431)

`贪心` `优先队列` `枚举`

### 题意

有若干个湖，向右走会消耗时间，每个湖每过一个 $5$ 分钟鱼量都会下降。要求在总时间限制内，决定最后停在哪个湖，并安排各湖钓鱼时间，使总鱼数最大。

### 分析

最后停在哪个湖必须枚举，因为一旦决定只走到第 `k` 个湖，后面的湖就彻底没资格参与，问题才会固定下来。

固定终点后，剩下的是一个“每过 5 分钟挑当前收益最大的湖”模型。因为同一个湖的收益只会递减，当前最值决策不会破坏未来结构，所以用大根堆反复取当前鱼最多的湖钓一个时间片，再把该湖的下一次收益压回去即可。

### 核心代码

```cpp
for(int ed=1;ed<=n;ed++){
    int t=H*12-pre[ed];
    priority_queue<Node> q;
    for(int i=1;i<=ed;i++) q.push({f[i],d[i]});
    int cur=0;
    while(t--){
        auto u=q.top(); q.pop();
        cur+=u.f;
        q.push({max(0,u.f-u.d),u.d});
    }
    ans=max(ans,cur);
}
```

### 复杂度

时间复杂度 $O(n\cdot H\log n)$，空间复杂度 $O(n)$。

---

## 11. [1432：糖果传递](http://ybt.ssoier.cn:8088/problem_show.php?pid=1432)

`贪心` `前缀和` `中位数`

### 题意

$n$ 个小朋友围成一圈，每人有 $a_i$ 个糖果，每次只能向左右相邻的人传一个，代价为 $1$。要求让每个人糖果数相同，总代价最小。

### 分析

圆环上传糖果时，真正该看的不是每个人手里剩多少，而是“前缀净流量”有多少。设平均值为 `avg`，令 `c[i]=sum_{j<=i}(a[j]-avg)`，它表示前 `i` 个人要向后面净送出去多少糖果。

环和链的区别在于整体还差一个基准位移 `x`，总代价会变成 `sum |c[i]-x|`。这一下题目就落成了“选一个数，让到它的绝对距离和最小”，答案自然是取所有 `c[i]` 的中位数。

### 核心代码

```cpp
int avg=sum/n;
for(int i=1;i<=n;i++) c[i]=c[i-1]+a[i]-avg;
sort(c+1,c+n+1);
long long mid=c[(n+1)/2],ans=0;
for(int i=1;i<=n;i++) ans+=llabs(c[i]-mid);
cout<<ans;
```

### 复杂度

时间复杂度 $O(n\log n)$，空间复杂度 $O(n)$。

---

## 12. [1433：【例题1】愤怒的牛](http://ybt.ssoier.cn:8088/problem_show.php?pid=1433)

`二分答案` `贪心`

### 题意

给出若干牛棚位置，要放下 $C$ 头牛，并让任意两头牛之间的最小距离尽量大。

### 分析

“最大化最小值”是最典型的二分触发器。固定一个候选距离 `d` 后，问题变成：能否放下至少 `C` 头牛，使相邻已放牛的距离都不小于 `d`。

判定时从左到右贪心放牛即可。每次都把下一头牛放在最靠左、但仍满足与上一头牛距离至少为 `d` 的位置，这样最省位置，也最有利于后续继续放更多牛。

### 核心代码

```cpp
bool check(int d){
    int cnt=1,last=x[1];
    for(int i=2;i<=n;i++) if(x[i]-last>=d){
        cnt++; last=x[i];
    }
    return cnt>=C;
}
```

### 复杂度

时间复杂度 $O(n\log V)$，空间复杂度 $O(1)$。

---

## 13. [1434：【例题2】Best Cow Fences](http://ybt.ssoier.cn:8088/problem_show.php?pid=1434)

`二分答案` `前缀和`

### 题意

给定正整数序列，要求找出长度至少为 $L$ 的连续子段，使平均值最大。

### 分析

平均值不好直接最大化，就把答案二分成“平均值至少为 `mid` 是否可行”。把每个数都减去 `mid` 以后，问题变成：是否存在长度至少为 `L` 的子段，和不小于 `0`。

这一层一旦写出来，前缀和就自然出现了。枚举右端点 `i`，只要知道 `i-L` 之前最小的前缀和，就能判断是否存在某个合法左端点使当前子段和非负。也就是说，二分真正依赖的，是把平均值判定改写成前缀和差值判定。

### 核心代码

```cpp
bool check(double mid){
    for(int i=1;i<=n;i++) s[i]=s[i-1]+a[i]-mid;
    double mn=0;
    for(int i=L;i<=n;i++){
        mn=min(mn,s[i-L]);
        if(s[i]-mn>=0) return true;
    }
    return false;
}
```

### 复杂度

时间复杂度 $O(n\log V)$，空间复杂度 $O(n)$。

---

## 14. [1436：数列分段II](http://ybt.ssoier.cn:8088/problem_show.php?pid=1436)

`二分答案` `贪心`

### 题意

把正整数序列切成恰好 $M$ 段连续子段，希望这些段和中的最大值尽量小。

### 分析

这题和“数列分段”刚好是一正一反。直接求最优最大段和很难，但若固定上界 `mid`，判断就简单了：从左到右尽量往当前段里塞，塞不下时再开新段。

为什么这个判定是对的？因为数都是正的，当前段提前断开只会让段数更多，不会让后面更省。所以这种贪心恰好会得到“在段和上限为 `mid` 时所需的最少段数”。只要这个段数不超过 `M`，当前答案就可行。

### 核心代码

```cpp
bool check(long long mid){
    int cnt=1; long long sum=0;
    for(int i=1;i<=n;i++){
        if(a[i]>mid) return false;
        if(sum+a[i]<=mid) sum+=a[i];
        else cnt++,sum=a[i];
    }
    return cnt<=M;
}
```

### 复杂度

时间复杂度 $O(n\log S)$，空间复杂度 $O(1)$。

---

## 15. [1437：扩散](http://ybt.ssoier.cn:8088/problem_show.php?pid=1437)

`二分答案` `并查集` `图连通`

### 题意

平面上若干点会按曼哈顿距离同时向四周扩散，两个点的扩散区域一旦相交就视为连通。要求最早什么时候所有点属于同一连通块。

### 分析

在时刻 `t`，每个点对应一个菱形区域。两个菱形相交，当且仅当两点的曼哈顿距离不超过 `2t`。于是固定时刻以后，整题就变成了一个普通的图连通性判断：把满足这个条件的点对连边，看整张图是否联通。

时刻越大，可连的边只会越来越多，连通性具有单调性，所以可以二分最早时刻。判定函数里直接枚举点对并查集合并即可，数据范围很小，完全够用。

### 核心代码

```cpp
bool check(long long t){
    for(int i=1;i<=n;i++) fa[i]=i;
    for(int i=1;i<=n;i++) for(int j=i+1;j<=n;j++)
        if(llabs(x[i]-x[j])+llabs(y[i]-y[j])<=2*t) unite(i,j);
    int rt=find(1);
    for(int i=2;i<=n;i++) if(find(i)!=rt) return false;
    return true;
}
```

### 复杂度

时间复杂度 $O(n^2\log V)$，空间复杂度 $O(n)$。

---

# 三、连续空间上的最优化

离散决策走熟以后，变量开始跑到实数轴上。这几题的共同点不在公式有多复杂，而在于你得先把路径、影长或函数值写成真正的一元目标函数，然后才能放心地把三分落下去。

## 16. [1435：【例题3】曲线](http://ybt.ssoier.cn:8088/problem_show.php?pid=1435)

`三分` `函数最优化`

### 题意

给出若干二次函数 $S_i(x)$，定义 $F(x)=\max S_i(x)$，要求求出它在区间 $[0,1000]$ 上的最小值。

### 分析

题目真正要看的不是某一条抛物线，而是所有抛物线的上包络。只要认出这个目标函数在区间上是单峰的，后面就是标准三分：不断比较两个三等分点的函数值，把不可能包含最优点的一侧丢掉。

每次算 `F(x)` 时，只要把所有二次函数在 `x` 处的值扫一遍，取最大即可。所以三分只是外壳，核心建模是把“最小化一堆函数里的最大值”理解成对上包络找最低点。

### 核心代码

```cpp
double calc(double x){
    double v=-1e100;
    for(int i=1;i<=n;i++) v=max(v,a[i]*x*x+b[i]*x+c[i]);
    return v;
}
for(int it=0;it<100;it++){
    double m1=(l*2+r)/3,m2=(l+r*2)/3;
    if(calc(m1)<calc(m2)) r=m2;
    else l=m1;
}
```

### 复杂度

时间复杂度 $O(n\cdot T)$，空间复杂度 $O(1)$，其中 $T$ 为三分迭代次数。

---

## 17. [1438：灯泡](http://ybt.ssoier.cn:8088/problem_show.php?pid=1438)

`三分` `解析几何`

### 题意

已知灯泡高度、人的身高和灯泡到墙的距离，人在两者之间移动。要求求出影子的最大长度。

### 分析

先别急着三分，先把长度公式写出来。设人离灯泡的水平距离为 `x`。若光线先打到地面，影长只是一段地面投影；若阴影已经爬到墙上，总长度就等于“地面剩余长度 + 墙上的高度”。

把两段情况分别写成函数后，会发现整体是一个先增后减的单峰函数，于是三分就有了根据。也就是说，三分不是凭感觉乱套，而是建立在把几何关系彻底化成一元函数之后。

### 核心代码

```cpp
double calc(double x){
    double lim=D*(H-h)/H;
    if(x<=lim) return x*h/(H-h);
    double y=H-(H-h)*D/x;
    return (D-x)+y;
}
for(int it=0;it<100;it++){
    double m1=(l*2+r)/3,m2=(l+r*2)/3;
    if(calc(m1)<calc(m2)) l=m1;
    else r=m2;
}
```

### 复杂度

时间复杂度 $O(T)$，空间复杂度 $O(1)$，其中 $T$ 为三分迭代次数。

---

## 18. [1439：【SCOI2010】传送带](http://ybt.ssoier.cn:8088/problem_show.php?pid=1439)

`三分` `计算几何`

### 题意

人在两条传送带和地面上移动，三种介质速度不同。要求从点 $A$ 到点 $D$ 的最短时间。

### 分析

路径一旦确定，真正自由的只有两个着陆点：在 `AB` 上哪里下带，在 `CD` 上哪里上带。固定第一条传送带上的点以后，第二个点的最优位置是一个单峰函数；而把这个最优值再看成第一点的位置函数，它同样仍是单峰的。

所以这题是典型的两层连续优化：内层三分第二个点，外层三分第一个点。思考重点不是代码套娃，而是先把最短时间写成“点在线段上的参数”的函数。

### 核心代码

```cpp
Point on(Point a,Point b,double t){ return a+(b-a)*t; }
double g(double t1){
    Point p=on(A,B,t1);
    double l=0,r=1;
    for(int it=0;it<80;it++){
        double m1=(l*2+r)/3,m2=(l+r*2)/3;
        Point q1=on(C,D,m1),q2=on(C,D,m2);
        if(time(A,p,q1,D)<time(A,p,q2,D)) r=m2; else l=m1;
    }
    return time(A,p,on(C,D,(l+r)/2),D);
}
for(int it=0;it<80;it++){
    double m1=(l*2+r)/3,m2=(l+r*2)/3;
    if(g(m1)<g(m2)) r=m2; else l=m1;
}
```

### 复杂度

时间复杂度 $O(T^2)$，空间复杂度 $O(1)$，其中 $T$ 为三分迭代次数。

---

# 四、搜索不是硬搜，而是不断砍枝

这一章全部和 DFS 打交道，但真正决定能不能做出来的，从来都不是“会不会递归”，而是你有没有找到下界、顺序和可行性检查。只要剪枝理由站住脚，原本看起来要爆炸的状态树会一下子收回来。

## 19. [1440：【例题1】数的划分](http://ybt.ssoier.cn:8088/problem_show.php?pid=1440)

`DFS` `搜索剪枝`

### 题意

把整数 $n$ 划分成恰好 $k$ 份，顺序不计，同一种划分的不同排列视为同一方案，要求统计方案数。

### 分析

这题如果直接搜“下一份取多少”，重复会非常多。解决方法是强制分出来的各份按非降序出现，也就是下一份不能比上一份更小，这样同一组数只会被搜到一次。

状态写成 `dfs(rest,last,cnt)`：还剩 `rest`，下一份至少从 `last` 开始，还要放 `cnt` 份。由于后面至少还要留出 `cnt-1` 份，每份都不小于当前值，所以枚举上界也能顺手剪出来。

### 核心代码

```cpp
int dfs(int rest,int last,int cnt){
    if(cnt==1) return rest>=last;
    int ans=0;
    for(int x=last;x*cnt<=rest;x++)
        ans+=dfs(rest-x,x,cnt-1);
    return ans;
}
```

### 复杂度

时间复杂度取决于搜索树规模，最坏为指数级，空间复杂度 $O(k)$。

---

## 20. [1441：【例题2】生日蛋糕](http://ybt.ssoier.cn:8088/problem_show.php?pid=1441)

`DFS` `剪枝优化`

### 题意

要做出体积为 $N\pi$ 的 $M$ 层生日蛋糕，每层是半径和高度都严格递减的圆柱，要求总表面积最小。

### 分析

搜索当然要枚举每层的半径和高度，但若不剪枝，状态树会立刻爆炸。真正的做法是先给剩余层数准备两个下界：最小可能体积 `minv[k]` 和最小可能侧面积 `mins[k]`。只要当前剩余体积已经装不下、或者当前面积加上下界也不可能优于答案，就立刻回退。

此外还可以用“剩余体积在当前最大半径下至少还要贡献多少侧面积”继续卡一刀。也就是说，这题的核心不是搜索顺序本身，而是连续不断地用几何下界砍掉不可能更优的分支。

### 核心代码

```cpp
void dfs(int dep,int v,int s,int R,int H){
    if(!dep){ if(!v) ans=min(ans,s); return; }
    if(v<minv[dep]||s+mins[dep]>=ans) return;
    if(s+2*v/R>=ans) return;
    for(int r=min(R-1,(int)sqrt(v-minv[dep-1]));r>=dep;r--)
        for(int h=min(H-1,(v-minv[dep-1])/(r*r));h>=dep;h--)
            dfs(dep-1,v-r*r*h,s+2*r*h+(dep==M?r*r:0),r,h);
}
```

### 复杂度

时间复杂度取决于剪枝后的搜索树规模，最坏为指数级，空间复杂度 $O(M)$。

---

## 21. [1442：【例题3】小木棍](http://ybt.ssoier.cn:8088/problem_show.php?pid=1442)

`DFS` `搜索剪枝`

### 题意

给出被打散后的小木棍长度，要求拼回若干根原始木棍，并求原始木棍的最小可能长度。

### 分析

最外层先枚举原始长度 `len`，只考虑能整除总长度且不小于最长木棍的候选。固定 `len` 后，问题变成能否把所有碎段分成若干组，每组和都恰好为 `len`。

组装时把木棍按长度从大到小排序，优先放长段，能极大减少分支。常用的几个剪枝也都很关键：同长度碎段只试一次；新的一根原棍若第一段都失败，后面也不用试；某段正好补满仍失败，换别的同层选择也没意义。

### 核心代码

```cpp
bool dfs(int cur,int done,int start){
    if(done*len==sum) return true;
    if(cur==len) return dfs(0,done+1,1);
    int last=-1;
    for(int i=start;i<=n;i++) if(!vis[i]&&cur+a[i]<=len&&a[i]!=last){
        vis[i]=1;
        if(dfs(cur+a[i],done,i+1)) return true;
        vis[i]=0; last=a[i];
        if(!cur||cur+a[i]==len) return false;
    }
    return false;
}
```

### 复杂度

时间复杂度取决于搜索树规模，最坏为指数级，空间复杂度 $O(n)$。

---

## 22. [1443：【例题4】Addition Chains](http://ybt.ssoier.cn:8088/problem_show.php?pid=1443)

`迭代加深` `DFS`

### 题意

要求构造一条最短加法链，从 $1$ 出发，每一项都由前面两项相加得到，最后到达给定的 $n$。

### 分析

链长最短，天然就适合迭代加深。先猜答案长度 `dep`，只判断是否能在这么多步里到达 `n`；不行再把深度加一。

搜索时最重要的剪枝是“即使后面每一步都翻倍，也追不上 `n`”，这种分支可以直接砍掉。再配合从大到小生成新值、以及同层去重，就能让搜索明显收缩。

### 核心代码

```cpp
bool dfs(int u){
    if(u==dep) return a[u]==n;
    if((a[u]<<(dep-u))<n) return false;
    bool used[1000]={0};
    for(int i=u;i>=0;i--) for(int j=i;j>=0;j--){
        int x=a[i]+a[j];
        if(x<=a[u]||x>n||used[x]) continue;
        used[x]=1; a[u+1]=x;
        if(dfs(u+1)) return true;
    }
    return false;
}
```

### 复杂度

时间复杂度取决于迭代加深后的搜索树规模，空间复杂度 $O(dep)$。

---

## 23. [1444：埃及分数](http://ybt.ssoier.cn:8088/problem_show.php?pid=1444)

`迭代加深` `DFS` `分数`

### 题意

把分数 $a/b$ 拆成若干个互不相同的单位分数之和，优先让项数最少；若项数相同，再让最小的单位分数尽量大。

### 分析

这题还是先从答案深度下手：枚举用多少项来拆。固定项数后，按分母递增做 DFS，每次选择下一项 `1/d`，把剩余分数继续往下拆。

真正能让它跑起来的是两个下界。第一，下一项分母不可能小于 `ceil(b/a)`；第二，若剩余项数全都取成当前能取到的最大单位分数，仍然凑不满剩余分数，这条分支就没希望。等找到同深度解时，再按题目要求比较分母序列优劣即可。

### 核心代码

```cpp
bool dfs(int dep,long long a,long long b,long long last){
    if(dep==maxd){
        if(b%a) return false;
        path[dep]=b/a;
        return update();
    }
    long long st=max(last+1,(b+a-1)/a);
    for(long long d=st;;d++){
        if((maxd-dep+1)*b<=a*d) break;
        long long na=a*d-b, nb=b*d, g=gcd(na,nb);
        path[dep]=d;
        if(na>0&&dfs(dep+1,na/g,nb/g,d)) ok=true;
    }
    return ok;
}
```

### 复杂度

时间复杂度取决于迭代加深后的搜索树规模，空间复杂度 $O(maxd)$。

---

## 24. [1445：平板涂色](http://ybt.ssoier.cn:8088/problem_show.php?pid=1445)

`状态压缩` `DFS` `依赖图`

### 题意

若干矩形要按“上方遮挡关系”依次涂色，每次拿起一把刷子只能刷一种颜色，要求最少拿起刷子的次数。

### 分析

先把几何关系抽象成依赖：如果矩形 `j` 紧贴在 `i` 的上方并挡住了它，那么 `i` 的前置集合里就要包含 `j`。这样题目就从几何过程变成了一个有依赖约束的状态压缩问题。

设 `dp[S]` 表示已经涂完集合 `S` 的最少刷子次数。若现在选择颜色 `c`，显然应该把“当前已经满足前置条件、且颜色为 `c` 的所有矩形”一口气都刷掉；而这些新刷完的矩形还可能继续解锁同色矩形，所以需要做一轮闭包扩展。一次拿刷子，就是一次从 `S` 走到 `expand(S,c)` 的转移。

### 核心代码

```cpp
int expand(int S,int c){
    bool changed=true;
    while(changed){
        changed=false;
        for(int i=0;i<n;i++)
            if(!(S>>i&1)&&col[i]==c&&(pre[i]&S)==pre[i])
                S|=1<<i,changed=true;
    }
    return S;
}
for(int S=0;S<1<<n;S++) if(dp[S]<INF)
    for(int c=1;c<=20;c++)
        dp[expand(S,c)]=min(dp[expand(S,c)],dp[S]+1);
```

### 复杂度

时间复杂度 $O(2^n\cdot C\cdot n)$，空间复杂度 $O(2^n)$。

---

## 25. [1446：素数方阵](http://ybt.ssoier.cn:8088/problem_show.php?pid=1446)

`DFS` `前缀剪枝` `素数筛`

### 题意

构造一个 $5\times5$ 的数字方阵，使每行、每列以及两条对角线组成的五位数都是素数，且这些素数的各位数字和都相同，左上角数字已知。

### 分析

暴力填 $25$ 个格子当然不现实，真正该抓的是“前缀也必须有机会延伸成合法素数”。先预处理所有满足位和条件的五位素数，把它们的每个前缀都记下来；这样当某一行、某一列或某条对角线刚填到前几位时，就能立刻判断这个前缀还有没有继续长成合法素数的可能。

搜索时按能同时约束多条线的位置优先填，比如先顾对角线和前几行前几列。每落一个数字，就检查对应的行前缀、列前缀和对角线前缀是否合法。靠这层前缀剪枝，搜索树会被砍得非常狠。

### 核心代码

```cpp
bool okLine(int len,int val){ return pref[len].count(val); }
void dfs(int p){
    if(p==25){ output(); return; }
    auto [x,y]=ord[p];
    for(int d=0;d<=9;d++){
        if((x==0||y==0)&&d==0) continue;
        g[x][y]=d;
        if(checkRow(x)&&checkCol(y)&&checkDiag(x,y)) dfs(p+1);
    }
    g[x][y]=0;
}
```

### 复杂度

预处理复杂度 $O(P)$，其中 $P$ 为满足条件的五位素数个数；搜索复杂度取决于剪枝后的状态数，空间复杂度 $O(P)$。

---

## 26. [1447：靶形数独](http://ybt.ssoier.cn:8088/problem_show.php?pid=1447)

`DFS` `数独` `最优性剪枝`

### 题意

给定一个靶形数独，填数时既要满足普通数独约束，又要让按位置权值计算出的总分最大。

### 分析

因为目标是最大分，搜索时不能只看“能不能填完”，还得尽量让高分格子早拿到更大的数。基本框架仍然是数独常规做法：用行、列、九宫格的位掩码维护可选数字。

真正能压住复杂度的是选择下一个格子的策略。每次都挑候选数最少的空格，相当于先处理限制最紧的点，分支会少很多；再配合按数字从大到小尝试，就更容易尽早拿到高分上界。

### 核心代码

```cpp
int pick(){
    int p=-1,best=10;
    for(int i=0;i<81;i++) if(!a[i]){
        int c=__builtin_popcount(avail(i));
        if(c<best) best=c,p=i;
    }
    return p;
}
void dfs(int score){
    int p=pick();
    if(p==-1){ ans=max(ans,score); return; }
    for(int s=avail(p);s;s-=lowbit(s)){
        int d=bitnum(lowbit(s));
        place(p,d); dfs(score+w[p]*d); undo(p,d);
    }
}
```

### 复杂度

时间复杂度取决于剪枝后的搜索树规模，空间复杂度 $O(81)$。

---

# 五、把状态图建出来，最短步数自然就出来了

最后这一章把棋盘、机关和连通块统统翻成图。节点怎么定义、边什么时候存在、边权到底是 0、1 还是统一为 1，一旦这几个问题想清楚，后面的 0-1 BFS、普通 BFS、双向 BFS 其实都只是顺水推舟。

## 27. [1448：【例题1】电路维修](http://ybt.ssoier.cn:8088/problem_show.php?pid=1448)

`0-1 BFS` `最短路`

### 题意

电路板由若干带斜线连接的元件组成，可以修改元件方向。要求从左上角连到右下角，并使修改次数最少。

### 分析

真正的图节点不是元件本身，而是网格交点。穿过某个元件的一条对角线，相当于从一个角走到另一个角；如果方向和当前元件原本的连线一致，代价就是 `0`，否则就得翻转一次，代价为 `1`。

这样一建图，整题就成了边权只有 `0/1` 的最短路，直接 0-1 BFS。也就是说，难点完全在于先把“翻元件”翻译成“交点图上的 0/1 代价边”。

### 核心代码

```cpp
deque<pair<int,int>> q;
dist[0][0]=0; q.push_front({0,0});
while(!q.empty()){
    auto [x,y]=q.front(); q.pop_front();
    for(int k=0;k<4;k++){
        int nx=x+dx[k],ny=y+dy[k],cx=x+sx[k],cy=y+sy[k];
        int w=(g[cx][cy]!=need[k]);
        if(dist[nx][ny]>dist[x][y]+w){
            dist[nx][ny]=dist[x][y]+w;
            w?q.push_back({nx,ny}):q.push_front({nx,ny});
        }
    }
}
```

### 复杂度

时间复杂度 $O(nm)$，空间复杂度 $O(nm)$。

---

## 28. [1449：【例题2】魔板](http://ybt.ssoier.cn:8088/problem_show.php?pid=1449)

`BFS` `状态压缩`

### 题意

给定魔板初始状态和目标状态，允许做三种固定变换，要求求出最短操作序列。

### 分析

操作次数最少、边权一致，第一反应就是 BFS。每个棋盘状态是一个长度为 `8` 的排列，三种操作分别对应三条固定边。

搜索时除了判重，还要记录前驱状态和是由哪种操作转移过来的，这样抵达目标以后才能倒着还原出整条最短路径。因为 BFS 按层扩展，第一次到达目标时，路径长度就已经最短。

### 核心代码

```cpp
queue<string> q; q.push(st); dist[st]=0;
while(!q.empty()){
    string u=q.front(); q.pop();
    for(auto [op,v]:nextState(u)) if(!dist.count(v)){
        dist[v]=dist[u]+1;
        pre[v]={u,op};
        q.push(v);
    }
}
```

### 复杂度

时间复杂度 $O(8!\cdot 3)$，空间复杂度 $O(8!)$。

---

## 29. [1450：【例 3】Knight Moves](http://ybt.ssoier.cn:8088/problem_show.php?pid=1450)

`BFS` `最短路`

### 题意

在给定大小的棋盘上，求骑士从起点走到终点的最少步数。

### 分析

棋盘上每一步代价都相同，骑士的八种走法也固定，所以它就是最标准的无权图最短路。把每个格子看成一个点，合法骑士跳跃看成边，普通 BFS 一次到位。

这题真正要练的是“看到最少步数先想状态图”，而不是把棋子动作当成特判模拟。

### 核心代码

```cpp
queue<pair<int,int>> q;
q.push({sx,sy}); dist[sx][sy]=0;
while(!q.empty()){
    auto [x,y]=q.front(); q.pop();
    for(int k=0;k<8;k++){
        int nx=x+dx[k],ny=y+dy[k];
        if(in(nx,ny)&&dist[nx][ny]==-1)
            dist[nx][ny]=dist[x][y]+1,q.push({nx,ny});
    }
}
```

### 复杂度

时间复杂度 $O(n^2)$，空间复杂度 $O(n^2)$。

---

## 30. [1451：棋盘游戏](http://ybt.ssoier.cn:8088/problem_show.php?pid=1451)

`BFS` `状态压缩`

### 题意

$4\times4$ 棋盘上有黑白棋，允许交换相邻两格中的棋子。要求把初始局面变成目标局面的最少步数。

### 分析

黑白棋只有两种颜色，所以状态最自然的压法就是一个 `16` 位二进制数：某位是 `1` 表示黑棋，是 `0` 表示白棋。一次交换相邻异色棋子，本质上就是把这两位同时翻转。

状态数其实只有组合数级别，远小于所有排列，所以直接在位压状态图上 BFS 就够了。每弹出一个状态，枚举所有相邻格子，如果颜色不同，就生成下一状态。

### 核心代码

```cpp
queue<int> q; q.push(S); dist[S]=0;
while(!q.empty()){
    int u=q.front(); q.pop();
    for(auto [x,y]:adj){
        if(((u>>x)&1)==((u>>y)&1)) continue;
        int v=u^(1<<x)^(1<<y);
        if(dist[v]==-1) dist[v]=dist[u]+1,q.push(v);
    }
}
```

### 复杂度

时间复杂度 $O(C_{16}^8\cdot E)$，空间复杂度 $O(C_{16}^8)$。

---

## 31. [1452：Keyboarding](http://ybt.ssoier.cn:8088/problem_show.php?pid=1452)

`BFS` `状态图` `预处理`

### 题意

虚拟键盘上，方向键会跳到该方向上第一个与当前位置字符不同的格子，选择键会输出当前字符。要求打印整段文本并在末尾额外打印换行符。

### 分析

难点在“移动规则”非常反直觉：你不是走到相邻格，而是直接跳到下一个不同字符的位置。所以第一步一定是预处理每个格子按上下左右移动后会落到哪里。

之后把状态定义成 `(位置, 已经打印了前多少个字符)`。四个方向键会改变位置但不推进文本指针；若当前位置字符正好等于下一个目标字符，就可以按一次选择键把指针加一。由于所有操作代价都是 `1`，整张分层状态图上跑 BFS 即可。

### 核心代码

```cpp
string t=s+"*";
queue<Node> q; q.push({0,0}); dist[0][0]=0;
while(!q.empty()){
    auto [u,k]=q.front(); q.pop();
    if(k==t.size()) break;
    for(int d=0;d<4;d++) relax(nxt[u][d],k,dist[u][k]+1);
    if(key[u]==t[k]) relax(u,k+1,dist[u][k]+1);
}
```

### 复杂度

时间复杂度 $O(rc\cdot |S|)$，空间复杂度 $O(rc\cdot |S|)$。

---

## 32. [1453：移动玩具](http://ybt.ssoier.cn:8088/problem_show.php?pid=1453)

`双向 BFS` `状态压缩`

### 题意

$4\times4$ 方格内有若干玩具，每次可以把一个玩具移到上下左右相邻的空格。要求用最少步数把初始状态变成目标状态。

### 分析

同样是位压状态：一个 `16` 位二进制数就能表示当前哪些格子有玩具。一次移动就是把某个 `1` 挪到相邻的 `0` 上，对应两位异或。

因为状态空间是 `2^{16}` 量级，而且起终点都已知，直接双向 BFS 会比单向更稳。两边同时向中间扩展，只要有一个状态在两侧都被访问到，总步数就是两边深度之和。

### 核心代码

```cpp
int expand(queue<int>& q,vector<int>& da,vector<int>& db){
    int u=q.front(); q.pop();
    for(int i=0;i<16;i++) if(u>>i&1) for(int v:to[i]) if(!(u>>v&1)){
        int s=u^(1<<i)^(1<<v);
        if(da[s]!=-1) continue;
        da[s]=da[u]+1;
        if(db[s]!=-1) return da[s]+db[s];
        q.push(s);
    }
    return -1;
}
```

### 复杂度

时间复杂度 $O(2^{16})$，空间复杂度 $O(2^{16})$。

---

## 33. [1454：山峰和山谷](http://ybt.ssoier.cn:8088/problem_show.php?pid=1454)

`BFS` `连通块`

### 题意

给定一个高度网格，若若干相同高度格子通过公共顶点连成一块，就形成一个平台。要求统计其中有多少个平台是山峰、有多少个平台是山谷。

### 分析

题目里的“山峰/山谷”判断对象不是单个格子，而是整块等高连通块。所以先用 BFS 或 DFS 把每个等高平台整块搜出来。

在搜索这整块的同时，顺手看它周围是否出现过更高的格子、是否出现过更低的格子。若没有更高邻居，它就是山峰；若没有更低邻居，它就是山谷。整题真正的关键，是别把高度相同的平台拆碎来判断。

### 核心代码

```cpp
for(int i=1;i<=n;i++) for(int j=1;j<=n;j++) if(!vis[i][j]){
    queue<pair<int,int>> q; q.push({i,j}); vis[i][j]=1;
    bool higher=false,lower=false;
    while(!q.empty()){
        auto [x,y]=q.front(); q.pop();
        for(int k=0;k<8;k++){
            int nx=x+dx[k],ny=y+dy[k];
            if(!in(nx,ny)) continue;
            if(h[nx][ny]==h[i][j]&&!vis[nx][ny]) vis[nx][ny]=1,q.push({nx,ny});
            else if(h[nx][ny]>h[i][j]) higher=true;
            else if(h[nx][ny]<h[i][j]) lower=true;
        }
    }
    if(!higher) peak++;
    if(!lower) valley++;
}
```

### 复杂度

时间复杂度 $O(n^2)$，空间复杂度 $O(n^2)$。

---
