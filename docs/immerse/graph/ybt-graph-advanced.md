---
title: "一本通 图论提高专题精选解题报告"
subtitle: "🕸️ 从最短路、连通性到欧拉回路的图论进阶主线"
order: 7
icon: "🛰️"
---

# 一本通 图论提高专题精选解题报告

这一组题从最短路、生成树一路走到强连通、桥与欧拉回路，题面看着分散，真正反复出现的却是同一条主线：先把限制翻译成图上的结构，再决定是在原图上跑路径、在缩点图上做 DP，还是直接读度数与连通性的判定。前半段更偏“代价怎么定义”，后半段则转向“结构哪里脆弱”，最后落到一笔画与序列重构。

# 一、生成树与边权结构

这一章先从生成树出发，看怎样把“最省”进一步改写成计数、分组、次优与强制条件。关键不是会不会 Kruskal，而是会不会把额外限制翻成树边替换或权值调整。

## 1. [1486：【例题1】黑暗城堡](http://ybt.ssoier.cn:8088/problem_show.php?pid=1486)

`最短路` `方案计数`

### 题意

给定若干房间和可修建的双向通道，要求选出一棵树形城堡，使树上每个点到 `1` 号房间的距离都等于原图最短路，求不同修建方案数。

### 分析

先求出原图里 `1` 到每个点的最短距离 `dist`。若一棵树想保持这些最短路不变，那么对每个点 `v` 而言，它连向父亲的那条边必须满足 `dist[u]+w=dist[v]`，而且父亲一定更靠近根。

这样问题就被拆开了：每个点只需要从所有合法前驱里选一个父亲。因为距离严格递增，所有边都会从近层指向远层，不会形成环，所以答案就是每个点合法父亲个数的乘积。

### 核心代码

```cpp
const long long MOD=(1LL<<31)-1;
dijkstra(1);
long long ans=1;
for(int v=2;v<=n;v++){
    long long cnt=0;
    for(auto [u,w]:g[v])
        if(dist[u]+w==dist[v]&&dist[u]<dist[v]) cnt++;
    ans=ans*cnt%MOD;
}
```

### 复杂度

时间复杂度 $O(m\log n)$，空间复杂度 $O(n+m)$。

---

## 2. [1487：【例 2】北极通讯网络](http://ybt.ssoier.cn:8088/problem_show.php?pid=1487)

`最小生成树` `聚类`

### 题意

平面上有若干村庄和 `k` 台卫星。卫星之间可视为零代价连通，剩下村庄之间靠同型号无线电通信，要求让所需的最小通信半径尽量小。

### 分析

把村庄两两连边，边权取欧氏距离。若没有卫星，这就是标准的最小生成树：用最小的最大边权把所有点连起来。

有 `k` 台卫星时，本质是把所有村庄分成 `k` 个连通块，每块内部靠无线电连通。最优划分一定来自 MST，因为它已经把“瓶颈边尽量小”做到了极致。于是只要在 MST 上删去最大的 `k-1` 条边，剩下部分里的最大边权就是答案。

### 核心代码

```cpp
for(int i=1;i<=n;i++)
  for(int j=i+1;j<=n;j++) add(i,j,dist(i,j));
kruskal();
if(k>=n) puts("0.00");
else printf("%.2f\n", mst[n-k-1]);
```

### 复杂度

时间复杂度 $O(n^2\log n)$，空间复杂度 $O(n^2)$。

---

## 3. [1488：新的开始](http://ybt.ssoier.cn:8088/problem_show.php?pid=1488)

`最小生成树` `虚拟源点`

### 题意

每口矿井要么自建发电站，要么连到已经有电的矿井。要求让所有矿井都得到电力，且总费用最小。

### 分析

“自己建站”这条选择完全可以视作一条边：从一个超级源点连到矿井 `i`，边权就是 `v_i`。矿井之间已有的拉线方案也看成普通边。

这样题目就变成：让超级源点和所有矿井连通的最小总代价是多少。也就是说，在加入虚拟源点后的图上跑一次最小生成树即可。

### 核心代码

```cpp
for(int i=1;i<=n;i++) add(0,i,v[i]);
for(int i=1;i<=n;i++)
  for(int j=i+1;j<=n;j++) add(i,j,p[i][j]);
sort(e.begin(),e.end());
cout<<kruskal(n+1);
```

### 复杂度

时间复杂度 $O(n^2\log n)$，空间复杂度 $O(n^2)$。

---

## 4. [1489：构造完全图](http://ybt.ssoier.cn:8088/problem_show.php?pid=1489)

`最小生成树` `并查集`

### 题意

给定一棵树，要求给所有非树边补上权值，使得到的完全图恰好只有这一棵最小生成树，并且所有边权和最小。

### 分析

若两点在树上路径的最大边权是 `mx`，那它们之间补上的非树边必须严格大于 `mx`，否则 Kruskal 可能改走这条边，从而破坏“唯一最小生成树”。为了总和最小，显然取成 `mx+1` 最优。

于是问题转成：统计每一对点路径最大边是多少。把树边按权值从小到大加入并查集，当前边 `w` 连接大小为 `a,b` 的两个连通块时，这两个块里任意一对点的路径最大边第一次被确定为 `w`。把对应贡献一次加进去即可。

### 核心代码

```cpp
sort(tree.begin(),tree.end());
long long ans=0;
for(auto [w,u,v]:tree){
    int fu=find(u), fv=find(v);
    long long a=sz[fu], b=sz[fv];
    ans += a*b*(w+1)-1;
    fa[fu]=fv; sz[fv]+=sz[fu];
}
```

### 复杂度

时间复杂度 $O(n\log n)$，空间复杂度 $O(n)$。

---

## 5. [1490：秘密的牛奶运输](http://ybt.ssoier.cn:8088/problem_show.php?pid=1490)

`次小生成树` `LCA`

### 题意

要求从无向带权图中找出总长度第二小的运输方案，也就是另一棵尽量优的生成树。

### 分析

先用 Kruskal 求一棵最小生成树。之后枚举每条非树边 `u-v-w`：把它加回 MST，会在树上形成一个环。若想得到尽量小的新树，就应该删掉这个环里最重的一条边。

所以关键变成快速查询树上两点路径的最大边权。建好倍增 LCA 后，每条非树边都能得到一个候选值 `mst+w-maxEdge(u,v)`，在这些候选里取最小即可。

### 核心代码

```cpp
kruskal();
build_lca();
long long ans=INF;
for(auto [u,v,w,in]:edges) if(!in){
    long long mx=queryMax(u,v);
    ans=min(ans,mst+w-mx);
}
```

### 复杂度

时间复杂度 $O(m\log n)$，空间复杂度 $O(n\log n)$。

---

## 6. [1491：Tree](http://ybt.ssoier.cn:8088/problem_show.php?pid=1491)

`最小生成树` `WQS二分`

### 题意

无向图的边有黑白两色，要求求一棵权值最小、且恰好包含 `need` 条白边的生成树。

### 分析

“恰好有多少条白边”这种限制不适合直接套 MST，但很适合参数化。给每条白边额外加上参数 `x`，那么一次 Kruskal 求到的是“原边权 + x×白边数”最优的生成树。

随着 `x` 变小，白边会越来越划算，因此最优树中的白边数具有单调性。二分 `x` 找到白边数刚好跨过 `need` 的位置，再把参数部分减掉，就得到原问题答案。

### 核心代码

```cpp
auto calc = [&](int x){
    for(auto &e:edges) e.key=e.w+(e.white?x:0);
    sort(edges.begin(),edges.end());
    return kruskal_with_white_count();
};
int x=binary_search();
auto [sum,cnt]=calc(x);
cout<<sum-1LL*need*x;
```

### 复杂度

时间复杂度 $O(m\log n\log V)$，空间复杂度 $O(n)$。

---

## 7. [1492：最小生成树计数](http://ybt.ssoier.cn:8088/problem_show.php?pid=1492)

`最小生成树` `计数`

### 题意

要求统计一张简单无向加权图中，不同最小生成树的数量，答案对 `31011` 取模。

### 分析

Kruskal 的不确定性只发生在同权边内部，所以计数也必须按权值分组。对某一组同权边，先看它们连通了当前并查集里的哪些块，并算出这一组最终必须贡献多少条边。

因为题目保证同权边不超过 `10` 条，所以这一步完全可以暴力枚举子集：只保留那些恰好能把连通块数减少到目标值的选法。各组之间相互独立，把方案数连乘即可。

### 核心代码

```cpp
for(each weight group g){
    int need = merged_count(g);
    int ways = 0;
    for(int s=0;s<(1<<g.size());s++)
        if(valid_subset(g,s,need)) ways++;
    ans = ans * ways % 31011;
    unite_all_edges_in_group(g);
}
```

### 复杂度

时间复杂度约为 $O(m\log m + \sum 2^{k_i}k_i)$，空间复杂度 $O(n)$。

---

## 8. [1493：次小生成树](http://ybt.ssoier.cn:8088/problem_show.php?pid=1493)

`严格次小生成树` `LCA`

### 题意

要求求出严格次小生成树，也就是总权值必须严格大于 MST，且尽量小的那棵生成树。

### 分析

思路仍然是“枚举一条非树边，把它加回 MST，再删去环上一条边”。区别在于这里必须严格更大，所以当非树边权恰好等于路径最大边时，不能再删这条同权最大边，否则新树权值不会变大。

因此树上查询不能只维护最大边，还要维护严格次大边。若 `w>mx` 就替掉最大边；若 `w==mx`，只能退而删掉次大边。这样枚举出的候选才都是真正的严格次小生成树。

### 核心代码

```cpp
build_lca_with_two_max();
long long ans=INF;
for(auto [u,v,w,in]:edges) if(!in){
    auto [mx,se]=query(u,v);
    if(w>mx) ans=min(ans,mst+w-mx);
    else if(w>se) ans=min(ans,mst+w-se);
}
```

### 复杂度

时间复杂度 $O(m\log n)$，空间复杂度 $O(n\log n)$。

---

# 二、最短路与状态扩张

这里开始进入路径问题：有的直接比距离，有的要把钥匙、油量、免费次数一起并进状态，有的则要先把图缩成更适合跑最短路的层次。

## 9. [1494：【例 1】Sightseeing Trip](http://ybt.ssoier.cn:8088/problem_show.php?pid=1494)

`Floyd` `最小环`

### 题意

在无向带权图中找一个总权值最小的简单环，并输出对应的观光路线。

### 分析

Floyd 的经典用法是求最短路，但这里更重要的是它的中转点顺序。处理到 `k` 时，`dist[i][j]` 表示只允许经过 `1..k-1` 的最短路；此时若再接上边 `i-k` 和 `k-j`，就得到一条经过 `k` 的新环。

所以每次在更新 `dist` 之前，先枚举 `i<j<k`，用 `dist[i][j]+w[i][k]+w[k][j]` 更新答案。为了输出路径，再用 `pre` 数组还原 `i` 到 `j` 的最短路即可。

### 核心代码

```cpp
for(int k=1;k<=n;k++){
    for(int i=1;i<k;i++)
      for(int j=i+1;j<k;j++)
        relax_cycle(dist[i][j]+w[i][k]+w[k][j],i,j,k);
    for(int i=1;i<=n;i++)
      for(int j=1;j<=n;j++)
        if(dist[i][j]>dist[i][k]+dist[k][j]){
            dist[i][j]=dist[i][k]+dist[k][j];
            pre[i][j]=k;
        }
}
```

### 复杂度

时间复杂度 $O(n^3)$，空间复杂度 $O(n^2)$。

---

## 10. [1495：【例 2】孤岛营救问题](http://ybt.ssoier.cn:8088/problem_show.php?pid=1495)

`状态压缩` `BFS`

### 题意

迷宫里有门、墙和多种钥匙，走一步耗时 `1`，拿钥匙和开门不耗时，要求从左上角最快到右下角。

### 分析

同一个格子在“有没有某把钥匙”时可走性可能完全不同，所以位置并不能单独构成状态。自然的做法是把状态扩成 `(x,y,mask)`，其中 `mask` 表示已经拿到的钥匙集合。

边权全为 `1`，因此直接在状态图上 BFS。转移时先判断相邻边是墙、普通通路还是某一类门；若门对应的钥匙位已经在 `mask` 里，就可以走过去，同时把新格子的钥匙并入状态。

### 核心代码

```cpp
queue<State> q;
dist[sx][sy][startMask]=0;
q.push({sx,sy,startMask});
while(!q.empty()){
    auto [x,y,s]=q.front(); q.pop();
    int ns=s|key[x][y];
    for(auto [nx,ny,t]:adj[x][y])
        if(can_go(t,ns)&&dist[nx][ny][ns]==-1){
            dist[nx][ny][ns]=dist[x][y][s]+1;
            q.push({nx,ny,ns});
        }
}
```

### 复杂度

时间复杂度 $O(nm2^p)$，空间复杂度 $O(nm2^p)$。

---

## 11. [1496：【例 3】架设电话线](http://ybt.ssoier.cn:8088/problem_show.php?pid=1496)

`二分答案` `0-1 BFS`

### 题意

从 `1` 到 `N` 选一条路径，路径上最多有 `K` 条线缆可以免费升级，目标是让剩下线缆里最贵的那条尽量小。

### 分析

题目真正要最小化的是“路径上第 `K+1` 大的边权”。这类目标通常先猜答案 `lim`：把权值大于 `lim` 的边记成代价 `1`，其余边记成 `0`。

如果从 `1` 到 `N` 的最少 `1` 边数不超过 `K`，就说明这些昂贵边都能免费掉，当前 `lim` 可行。于是对 `lim` 二分，判定时用 0-1 BFS 即可。

### 核心代码

```cpp
auto ok = [&](int lim){
    deque<int> q;
    fill(d.begin(),d.end(),INF); d[1]=0; q.push_back(1);
    while(!q.empty()){
        int u=q.front(); q.pop_front();
        for(auto [v,w]:g[u]) if(d[v]>d[u]+(w>lim)){
            d[v]=d[u]+(w>lim);
            (w>lim)?q.push_back(v):q.push_front(v);
        }
    }
    return d[n]<=K;
};
```

### 复杂度

时间复杂度 $O((n+m)\log W)$，空间复杂度 $O(n+m)$。

---

## 12. [1497：农场派对](http://ybt.ssoier.cn:8088/problem_show.php?pid=1497)

`最短路` `反图`

### 题意

每头牛都要去 `X` 号农场参加派对再回家，要求所有牛往返最短路中的最大值。

### 分析

每个点都要算“去 `X`”和“从 `X` 回来”两段最短路。如果对每个点分别跑最短路，会做很多重复工作。

把有向图反过来跑一次，就能把“每个点到 `X` 的最短路”转成“`X` 到每个点”的问题。因此只需两次 Dijkstra：一次在原图上求 `X->i`，一次在反图上求 `i->X`，最后枚举两者之和的最大值。

### 核心代码

```cpp
dijkstra(X,g,go);
dijkstra(X,rg,back);
for(int i=1;i<=n;i++)
    ans=max(ans,go[i]+back[i]);
```

### 复杂度

时间复杂度 $O(m\log n)$，空间复杂度 $O(n+m)$。

---

## 13. [1498：Roadblocks](http://ybt.ssoier.cn:8088/problem_show.php?pid=1498)

`次短路` `Dijkstra`

### 题意

要求求出从 `1` 到 `N` 的严格第二短路长度，路径允许重复经过边。

### 分析

允许重复经过边时，就不能只在最短路树外做一次替换，而应直接在最短路过程中同时维护“最短”和“次短”两个值。

从堆里取出状态后，沿边尝试得到新距离 `nd`。若 `nd` 比最短还小，就把原最短挤到次短；若它介于最短和次短之间，就更新次短。这样每个点只保留两个候选，最终 `dist2[N]` 就是答案。

### 核心代码

```cpp
priority_queue<Node> pq;
d1[1]=0; pq.push({0,1});
while(!pq.empty()){
    auto [d,u]=pq.top(); pq.pop();
    for(auto [v,w]:g[u]){
        int nd=d+w;
        if(nd<d1[v]) swap(nd,d1[v]), pq.push({d1[v],v});
        if(nd>d1[v]&&nd<d2[v]) d2[v]=nd, pq.push({d2[v],v});
    }
}
```

### 复杂度

时间复杂度 $O(m\log n)$，空间复杂度 $O(n+m)$。

---

## 14. [1499：最短路计数](http://ybt.ssoier.cn:8088/problem_show.php?pid=1499)

`BFS` `最短路计数`

### 题意

无权无向图中，要求输出从 `1` 到每个点的最短路条数，答案对 `100003` 取模。

### 分析

无权图最短路天然按层推进，BFS 第一次到达某点时，就已经确定了它的最短距离。之后如果还能从上一层再走到这个点，就说明又找到了一条不同的最短路。

因此在 BFS 过程中一边维护 `dist`，一边维护 `ways`：第一次到达时直接继承父亲的方案数；再次以同层最短距离到达时把方案数累加。

### 核心代码

```cpp
queue<int> q; dist[1]=0; ways[1]=1; q.push(1);
while(!q.empty()){
    int u=q.front(); q.pop();
    for(int v:g[u]){
        if(dist[v]==-1) dist[v]=dist[u]+1, ways[v]=ways[u], q.push(v);
        else if(dist[v]==dist[u]+1) ways[v]=(ways[v]+ways[u])%100003;
    }
}
```

### 复杂度

时间复杂度 $O(n+m)$，空间复杂度 $O(n+m)$。

---

## 15. [1500：新年好](http://ybt.ssoier.cn:8088/problem_show.php?pid=1500)

`最短路` `排列枚举`

### 题意

从 `1` 号车站出发，要拜访五位亲戚且顺序任意，求最少总时间。

### 分析

虽然整张图很大，但最终答案只会用到 `6` 个关键点：自己家和五位亲戚。只要先从这 `6` 个点分别跑最短路，就能得到它们两两之间的真实代价。

之后问题就完全退化成小规模排列：枚举五位亲戚的访问顺序，把相邻关键点间的最短距离加起来即可。图论部分负责把原图压缩成一个小完全图，排列部分只是在这个小图上枚举路径。

### 核心代码

```cpp
vector<int> key={1,a,b,c,d,e};
for(int s:key) dijkstra(s);
sort(key.begin()+1,key.end());
do{
    long long cur=dis[1][key[1]];
    for(int i=1;i<5;i++) cur+=dis[key[i]][key[i+1]];
    ans=min(ans,cur);
}while(next_permutation(key.begin()+1,key.end()));
```

### 复杂度

时间复杂度 $O(6m\log n + 5!)$，空间复杂度 $O(n+m)$。

---

## 16. [1501：最优贸易](http://ybt.ssoier.cn:8088/problem_show.php?pid=1501)

`SCC` `缩点DP`

### 题意

城市有买卖价格和单双向道路，要求从 `1` 走到 `n` 的过程中先买后卖，求最大利润。

### 分析

在同一个强连通分量里可以任意往返，所以“在哪里买、在哪里卖”不必在原图层面想，而应先缩点。缩点后每个点都代表一大块可自由游走的城市，可以预处理出这块里的最小价格和最大价格。

随后在 DAG 上做两次传递：正向维护从起点走到当前分量途中见过的最低买价，反向维护从当前分量到终点还能遇到的最高卖价。两者一减，就得到在这一块完成买卖时的最好利润。

### 核心代码

```cpp
tarjan(); build_dag();
for(int x:topo){
    mn[x]=min(mn[x],valMin[x]);
    for(int y:dag[x]) mn[y]=min(mn[y],mn[x]);
}
for(int x:rtopo){
    mx[x]=max(mx[x],valMax[x]);
    for(int y:rdag[x]) mx[y]=max(mx[y],mx[x]);
}
```

### 复杂度

时间复杂度 $O(n+m)$，空间复杂度 $O(n+m)$。

---

## 17. [1502：汽车加油行驶问题](http://ybt.ssoier.cn:8088/problem_show.php?pid=1502)

`最短路` `分层图`

### 题意

汽车在网格上从左上开到右下，油箱最多跑 `K` 步。经过油库必须加满并付费，也可以临时新建油库，求最小总代价。

### 分析

这里决定后续选择的，不只是坐标，还有剩余油量，所以最自然的状态就是 `(x,y,f)`。从一个状态走向相邻格子时油量减一；若方向向左或向上，还要额外付回退费用 `B`。

到达有油库的格子会强制加满并支付 `A`；若在普通格子想补给，则可以付 `A+C` 新建油库再加满。所有转移费用都非负，于是直接在状态图上跑 Dijkstra 即可。

### 核心代码

```cpp
priority_queue<Node> pq;
dist[1][1][K]=0; pq.push({0,1,1,K});
while(!pq.empty()){
    auto [d,x,y,f]=pq.top(); pq.pop();
    for(auto [nx,ny,cost]:move(x,y)) if(f) relax(nx,ny,f-1,d+cost);
    if(station[x][y]) relax(x,y,K,d+A);
    else relax(x,y,K,d+A+C);
}
```

### 复杂度

时间复杂度 $O(n^2K\log(n^2K))$，空间复杂度 $O(n^2K)$。

---

## 18. [1503：道路和航线](http://ybt.ssoier.cn:8088/problem_show.php?pid=1503)

`最短路` `拓扑排序`

### 题意

图里有双向非负道路和单向可能为负的航线，并保证航线方向上不会形成能绕回来的环。要求求源点到所有城镇的最短路。

### 分析

负边一出现，普通 Dijkstra 就不够用了；但题目又给出一条很关键的结构：从某条航线走出去后，不可能再借助道路和航线回到出发块。于是先把所有道路连通块缩起来。

缩点后，航线在这些块之间形成 DAG。按拓扑序处理每个块：先用来自前驱块的松弛值作为多源起点，再在块内跑一轮 Dijkstra，把道路的影响扩散开，最后通过航线把结果传给后继块。

### 核心代码

```cpp
build_road_components(); build_dag();
for(int c:topo){
    priority_queue<Node> pq = seeds[c];
    dijkstra_inside_component(c,pq);
    for(auto [u,v,w]:plane[c])
        if(dist[v]>dist[u]+w)
            dist[v]=dist[u]+w, push_seed(comp[v],v);
}
```

### 复杂度

时间复杂度 $O((n+m)\log n)$，空间复杂度 $O(n+m)$。

---

# 三、负环、差分约束与可行性系统

当边权允许为负，图论的重点就从“最短是多少”转向“系统是否可行”。平均值、区间选择、排班和不等式都能落到同一套势能与负环框架里。

## 19. [1504：【例 1】Word Rings](http://ybt.ssoier.cn:8088/problem_show.php?pid=1504)

`平均值最优` `负环判定`

### 题意

把若干单词首尾相接成一个环，要求环上单词平均长度最大。

### 分析

平均值最优化最常见的切入口是二分答案。设当前猜测平均长度为 `mid`，把每条边权改成 `len-mid`；若存在总权大于 `0` 的环，就说明真实平均值还能更大。

节点只和前后两个字母有关，所以把所有长度为 `2` 的字符串看成点，单词就是一条从前缀到后缀的有向边。之后只要在这张图上判正环即可，这正是 SPFA 类负环判定的老套路。

### 核心代码

```cpp
auto ok = [&](double mid){
    for(edge &e:edges) e.w = e.len - mid;
    memset(cnt,0,sizeof cnt);
    memset(inq,0,sizeof inq);
    for(int i=0;i<V;i++) if(spfa_positive_cycle(i)) return true;
    return false;
};
```

### 复杂度

时间复杂度约为 $O(VE\log L)$，空间复杂度 $O(V+E)$。

---

## 20. [1505：【例 2】双调路径](http://ybt.ssoier.cn:8088/problem_show.php?pid=1505)

`多目标最短路` `状态剪枝`

### 题意

每条路同时有时间和费用，两条路径按“更快且不更贵”或“更便宜且不更慢”比较优劣。要求统计从起点到终点所有不同的最小路径种类数。

### 分析

这里的“最小”不是单个数，而是二维向量 `(time,cost)` 的不可支配状态。真正要维护的不是每个点一个距离，而是每个点的一整个 Pareto 前沿。

因此做法是标签扩展：从起点出发不断把状态沿边推过去。新状态若被当前前沿里的某个标签支配，就没有继续扩展的价值；若能留下来，还要顺手删掉它所支配的旧标签。最终终点前沿里还活着的标签数，就是不同最小路径种类数。

### 核心代码

```cpp
queue<State> q;
insert(s,{0,0}); q.push({s,0,0});
while(!q.empty()){
    auto cur=q.front(); q.pop();
    for(auto [v,c,t]:g[cur.u]){
        Label nxt={cur.cost+c,cur.tim+t};
        if(insert(v,nxt)) q.push({v,nxt.cost,nxt.tim});
    }
}
cout<<frontier[e].size();
```

### 复杂度

时间复杂度与前沿规模有关，常记为 $O(M\cdot S)$，空间复杂度 $O(NS)$。

---

## 21. [1506：最小圈](http://ybt.ssoier.cn:8088/problem_show.php?pid=1506)

`最小平均环` `负环判定`

### 题意

给定有向带权图，要求求出所有有向环边权平均值的最小值。

### 分析

和最大平均环完全同理，只是方向反过来。猜一个平均值 `mid`，把每条边改成 `w-mid`，若图中出现总权小于 `0` 的环，就说明真实最小平均值还可以更小。

所以外层二分答案，内层做负环判定即可。这里最应该建立的直觉是：平均值问题并不是另起炉灶，而是把“比较均值”变成“某个环的总和是否为负”。

### 核心代码

```cpp
auto ok = [&](double mid){
    for(edge &e:edges) e.c = e.w - mid;
    fill(dist,dist+n+1,0);
    for(int i=1;i<=n;i++) if(spfa_neg_cycle(i)) return true;
    return false;
};
```

### 复杂度

时间复杂度约为 $O(VE\log W)$，空间复杂度 $O(V+E)$。

---

## 22. [1507：虫洞 Wormholes](http://ybt.ssoier.cn:8088/problem_show.php?pid=1507)

`SPFA` `负环`

### 题意

图中既有双向正边，也有单向负边虫洞。要求判断是否存在负权回路。

### 分析

题目根本不关心具体最短路，只问负环存不存在。最稳妥的做法是加一个超级源点向所有点连 `0` 边，让整张图都变成“可达”，再跑一次 SPFA 或 Bellman-Ford。

若某个点被成功松弛超过 `n` 次，就说明沿着某条回路可以让距离无限变小，也就是存在负环。负边问题里，这种“松弛次数是否爆掉”往往比距离值本身更重要。

### 核心代码

```cpp
for(int i=1;i<=n;i++) add(0,i,0);
queue<int> q; q.push(0); inq[0]=1;
while(!q.empty()){
    int u=q.front(); q.pop(); inq[u]=0;
    for(auto [v,w]:g[u]) if(dist[v]>dist[u]+w){
        dist[v]=dist[u]+w;
        if(!inq[v]&&++cnt[v]>n) return puts("YES"),0;
        if(!inq[v]) q.push(v),inq[v]=1;
    }
}
```

### 复杂度

时间复杂度最坏 $O(nm)$，空间复杂度 $O(n+m)$。

---

## 23. [1508：Easy SSSP](http://ybt.ssoier.cn:8088/problem_show.php?pid=1508)

`SPFA` `负环判定`

### 题意

先判断整张有向图中是否存在负环；若没有，再求源点 `S` 到所有点的最短路。

### 分析

这是典型的“两段式”负边题。第一步仍然是加超级源点，把全图都拉进可达范围，用 SPFA 检查是否有任意位置的负环。

如果不存在负环，再从真正源点 `S` 跑一遍单源最短路即可。由于仍然可能有负边，所以继续用 SPFA 最直接；没被更新到的点就是不可达。

### 核心代码

```cpp
if(has_negative_cycle()) return puts("-1"),0;
spfa(S);
for(int i=1;i<=n;i++)
    if(dist[i]==INF) puts("NoPath");
    else printf("%d\n",dist[i]);
```

### 复杂度

时间复杂度最坏 $O(nm)$，空间复杂度 $O(n+m)$。

---

## 24. [1509：【例 1】Intervals](http://ybt.ssoier.cn:8088/problem_show.php?pid=1509)

`差分约束` `最长路`

### 题意

从整数轴上选尽量少的整数，使每个区间 `[a_i,b_i]` 中至少有 `c_i` 个数被选中。

### 分析

设 `S(x)` 表示不超过 `x` 的被选数个数，那么区间条件就会变成 `S(b_i)-S(a_i-1)\ge c_i`。又因为每个位置最多只会多选一个数，所以还会有 `0\le S(i)-S(i-1)\le1`。

这正是一套差分约束。与其直接想“选哪些数”，不如把它改成前缀和之间的关系，再在图上求满足所有下界的最大前缀值。最终 `S(max)` 就是最少需要选出的数量。

### 核心代码

```cpp
add(a-1,b,c);
add(i-1,i,0);
add(i,i-1,-1);
spfa_longest(minx,maxx);
cout<<dist[maxx];
```

### 复杂度

时间复杂度最坏 $O(VE)$，空间复杂度 $O(V+E)$。

---

## 25. [1510：【例 2】出纳员问题](http://ybt.ssoier.cn:8088/problem_show.php?pid=1510)

`差分约束` `枚举答案`

### 题意

一天有 24 个时段，每个时段有最低出纳员需求。每位应聘者从某个时刻开始连续工作 8 小时，要求录用人数最少。

### 分析

设 `S(i)` 表示前 `i` 个时刻开始上班的人数，排班覆盖条件都能改写成 `S` 之间的不等式。真正的麻烦在于一天是环状的，某些班次会跨过午夜。

处理环形最常见的办法，就是枚举 `S(24)`，也就是总录用人数 `x`。一旦 `x` 固定，所有约束都变成普通差分约束，只需检查可行性。从小到大枚举的第一个可行 `x` 就是最优答案。

### 核心代码

```cpp
bool check(int x){
    build_constraints(x);
    for(int i=0;i<=24;i++) add(0,i,0);
    return spfa_longest();
}
for(int x=0;x<=n;x++)
    if(check(x)){ cout<<x; break; }
```

### 复杂度

时间复杂度约为 $O(24E\cdot \text{answer})$，空间复杂度 $O(E)$。

---

## 26. [1511：【SCOI2011】糖果](http://ybt.ssoier.cn:8088/problem_show.php?pid=1511)

`差分约束` `最长路`

### 题意

给每个小朋友分糖果，每人至少一颗，还要满足若干“谁不少于谁”“谁至少多一颗”等关系，要求最少准备多少糖果。

### 分析

把第 `i` 个孩子拿到的糖果数记为 `x_i`，所有限制都能写成形如 `x_u-x_v\ge c` 的差分约束。每个人至少一颗，则可以让超级源点向每个点连一条权值 `1` 的边。

为了让总糖果数最小，本质上是在求每个变量的最小可行下界；放到差分约束图里，就是去求一组最长路。若出现正环说明约束自相矛盾，否则所有 `dist[i]` 之和就是最小总糖果数。

### 核心代码

```cpp
for(each relation) add(v,u,w);
for(int i=1;i<=n;i++) add(0,i,1);
if(!spfa_longest()) puts("-1");
else for(int i=1;i<=n;i++) ans+=dist[i];
```

### 复杂度

时间复杂度最坏 $O(nk)$，空间复杂度 $O(n+k)$。

---

## 27. [1512：排队布局](http://ybt.ssoier.cn:8088/problem_show.php?pid=1512)

`差分约束` `可行性判定`

### 题意

奶牛按编号顺序站在一条线上，朋友关系给出距离上界，敌对关系给出距离下界。要求判断是否无解、是否可无限大，否则求 `1` 到 `N` 的最大距离。

### 分析

设 `x_i` 是第 `i` 头牛的位置，顺序不变意味着 `x_i\le x_{i+1}`。朋友关系和敌对关系都只是 `x` 之间的上下界，所以完全可以翻成差分约束。

若约束系统本身有矛盾，就输出 `-1`；若从 `1` 到 `N` 的距离上方没有真正被卡住，答案可以无限大，输出 `-2`；其余情况再求对应最长路即可。图论在这里承担的是“可行、无界、有限最优”三种状态的统一判定。

### 核心代码

```cpp
build_constraints();
if(has_positive_cycle()) puts("-1");
else if(!reachable(1,n)) puts("-2");
else{
    spfa_longest(1);
    cout<<dist[n];
}
```

### 复杂度

时间复杂度最坏 $O(nm)$，空间复杂度 $O(n+m)$。

---

# 四、强连通分量与缩点决策

这一章的共同动作是先缩点。原图里能任意往返的部分先压成一个点，后面无论做可达性判断、DAG 上 DP，还是 2-SAT 选点，都会立刻清晰很多。

## 28. [1513：【 例 1】受欢迎的牛](http://ybt.ssoier.cn:8088/problem_show.php?pid=1513)

`SCC` `缩点`

### 题意

若一头牛能被所有牛间接到达，就称它受欢迎。要求输出这样的牛有多少头。

### 分析

在同一个 SCC 里，所有点彼此可达，因此受欢迎与否先看缩点图。若某个 SCC 在缩点 DAG 中是唯一的出度为 `0` 分量，那么其他分量都有可能一路走到它；若出度为 `0` 的分量不止一个，就不可能所有牛都到达同一个地方。

所以这题真正要找的不是某个具体点，而是“唯一的汇 SCC”。若它存在，答案就是这个 SCC 的大小，否则是 `0`。

### 核心代码

```cpp
tarjan();
for(auto [u,v]:edges) if(col[u]!=col[v]) out[col[u]]++;
int id=0,cnt=0;
for(int i=1;i<=scc;i++) if(!out[i]) id=i,cnt++;
cout<<(cnt==1?sz[id]:0);
```

### 复杂度

时间复杂度 $O(n+m)$，空间复杂度 $O(n+m)$。

---

## 29. [1514：【例 2】最大半连通子图](http://ybt.ssoier.cn:8088/problem_show.php?pid=1514)

`SCC` `DAG DP`

### 题意

要求求出最大的半连通导出子图大小，以及这种最大子图的方案数。

### 分析

半连通意味着任意两点总有一个方向可达。放到 SCC 层面看，真正能组成半连通子图的，是缩点 DAG 上能排成一条链的一组点。

因此 Tarjan 缩点后，在 DAG 上做最长路 DP。`f[x]` 记录以 `x` 结尾的最大点数，`g[x]` 记录达到这个最优值的方案数。由于平行边会造成重复转移，所以缩点图建好后要先去重。

### 核心代码

```cpp
tarjan(); build_dag_unique();
for(int x:topo){
    if(!f[x]) f[x]=siz[x], g[x]=1;
    for(int y:dag[x]){
        if(f[y]<f[x]+siz[y]) f[y]=f[x]+siz[y], g[y]=g[x];
        else if(f[y]==f[x]+siz[y]) g[y]=(g[y]+g[x])%MOD;
    }
}
```

### 复杂度

时间复杂度 $O(n+m)$，空间复杂度 $O(n+m)$。

---

## 30. [1515：网络协议](http://ybt.ssoier.cn:8088/problem_show.php?pid=1515)

`SCC` `缩点`

### 题意

第一问要求最少给多少所学校直接发软件，才能传遍全网；第二问要求最少补多少条支援关系，才能让从任意学校发软件都能传遍全网。

### 分析

这两问都只看缩点图。第一问里，每个入度为 `0` 的 SCC 都必须手动给一次，因为它不可能从别的分量收到软件。

第二问是经典结论：若把 DAG 补成强连通图，所需最少边数是 `max(源点个数, 汇点个数)`；若整图本来只有一个 SCC，则不需要补边。先缩点再数入度、出度，一次性把两问都解决掉。

### 核心代码

```cpp
tarjan();
for(auto [u,v]:edges) if(col[u]!=col[v]){
    in[col[v]]++;
    out[col[u]]++;
}
for(int i=1;i<=scc;i++) a+=!in[i], b+=!out[i];
cout<<a<<"\n"<<(scc==1?0:max(a,b));
```

### 复杂度

时间复杂度 $O(n+m)$，空间复杂度 $O(n+m)$。

---

## 31. [1516：消息的传递](http://ybt.ssoier.cn:8088/problem_show.php?pid=1516)

`SCC` `缩点`

### 题意

消息可以沿给定关系不断传递，要求最少先告诉多少个奸细，才能让所有人都知道这条消息。

### 分析

若两名奸细互相之间总能绕一圈传回去，那他们处于同一个 SCC 里，只要先告诉其中一个，这整块都能收到消息。真正必须人工投放的，是那些没有任何外来边的源 SCC。

所以这题和“网络协议”第一问本质相同：先 Tarjan 缩点，再统计缩点图入度为 `0` 的分量个数即可。

### 核心代码

```cpp
tarjan();
for(auto [u,v]:edges) if(col[u]!=col[v]) indeg[col[v]]++;
for(int i=1;i<=scc;i++) ans+=indeg[i]==0;
cout<<ans;
```

### 复杂度

时间复杂度 $O(n^2)$（按矩阵读图）或 $O(n+m)$，空间复杂度 $O(n+m)$。

---

## 32. [1517：间谍网络](http://ybt.ssoier.cn:8088/problem_show.php?pid=1517)

`SCC` `贪心`

### 题意

部分间谍可以花钱收买，被控制的间谍会继续揭发别人。要求判断能否最终控制全部间谍；若能，求最小贿金，否则输出一个无法控制的间谍。

### 分析

把图缩成 SCC 后，同一分量里一旦控制住一个人，就能顺着证据链拿下整块。于是每个源 SCC 都必须至少有一个可收买的间谍。

若某个源 SCC 根本没人能买通，那整张网一定无解，而且这个分量里的任何人都无法被外部控制，按要求输出其中编号最小者。若所有源 SCC 都可买通，则每个源 SCC 只要取最便宜的那个人，答案求和即可。

### 核心代码

```cpp
tarjan();
for(int i=1;i<=scc;i++) cost[i]=INF;
for(int u=1;u<=n;u++) if(bribe[u]) cost[col[u]]=min(cost[col[u]],money[u]);
for(auto [u,v]:edges) if(col[u]!=col[v]) indeg[col[v]]++;
for(int i=1;i<=scc;i++) if(!indeg[i])
    if(cost[i]==INF) bad=min(bad,min_id_in_scc[i]);
    else ans+=cost[i];
```

### 复杂度

时间复杂度 $O(n+m)$，空间复杂度 $O(n+m)$。

---

## 33. [1518：抢掠计划](http://ybt.ssoier.cn:8088/problem_show.php?pid=1518)

`SCC` `缩点DP`

### 题意

从起点沿单向道路行动，可以重复经过路口和道路，但每个 ATM 只能抢一次，最后必须停在某个酒吧。要求最大总收益。

### 分析

允许重复经过某些路口，说明原图里的环应该先整体处理。对一个 SCC 而言，只要能进去，就能把这整个分量里的 ATM 全部拿完，所以可以直接把分量里的钱合并成一个点权。

缩点之后就得到 DAG。此时问题变成“从起点所在分量出发，走到某个酒吧分量时，点权和最大是多少”，直接做 DAG 上最长路 DP 即可。

### 核心代码

```cpp
tarjan(); build_dag();
dp[col[s]]=sum[col[s]];
for(int x:topo) if(dp[x])
    for(int y:dag[x])
        dp[y]=max(dp[y],dp[x]+sum[y]);
for(int x:barScc) ans=max(ans,dp[x]);
```

### 复杂度

时间复杂度 $O(n+m)$，空间复杂度 $O(n+m)$。

---

## 34. [1519：和平委员会](http://ybt.ssoier.cn:8088/problem_show.php?pid=1519)

`2-SAT` `SCC`

### 题意

每个党派有两名代表，委员会里必须恰选一人；若两名代表互相厌恶，则他们不能同时入选。要求判断是否可行并给出一组方案。

### 分析

“每组选一人”正是 2-SAT 的典型结构。把每个党派看成一个布尔变量，两位代表分别对应“选真”和“选假”。一对互相厌恶的代表 `a,b` 会转成两个蕴含：`a=>not b`，`b=>not a`。

建完蕴含图后跑 SCC。若某个变量与它的否定在同一 SCC 中，说明既要选它又不能选它，系统无解；否则按 SCC 拓扑序的逆序取值，就能构造出一个满足条件的委员会名单。

### 核心代码

```cpp
for(each hate a,b){ add(a,opp(b)); add(b,opp(a)); }
for(int i=1;i<=n;i++)
    if(col[2*i-1]==col[2*i]) return puts("NIE"),0;
for(int i=1;i<=n;i++)
    if(col[2*i-1]>col[2*i]) ans.push_back(2*i-1);
    else ans.push_back(2*i);
```

### 复杂度

时间复杂度 $O(n+m)$，空间复杂度 $O(n+m)$。

---

# 五、割点、桥与双连通结构

继续往结构层面走：删一条边会不会断，删一个点会不会裂，哪些块是必须单独照顾的，这些都要靠 `dfn/low` 把脆弱位置找出来。

## 35. [1520：【 例 1】分离的路径](http://ybt.ssoier.cn:8088/problem_show.php?pid=1520)

`桥` `缩点树`

### 题意

给定连通无向图，要求最少再加多少条边，才能让任意两点之间都有至少两条边不相交路径。

### 分析

边双连通正对应“删任意一条边都不断”。因此第一步是用 Tarjan 找出所有桥，再把原图按非桥边缩成若干边双连通分量，桥会在这些分量之间连成一棵树。

这棵桥树上的叶子最脆弱。每加一条新边，最多能同时把两个叶子补强，所以最少加边数就是 `ceil(leaf/2)`。问题看着在原图上补边，真正决定答案的却是缩点后的桥树形状。

### 核心代码

```cpp
tarjan_bridge();
shrink_by_nonbridge();
for(auto [u,v]:bridges) deg[col[u]]++,deg[col[v]]++;
for(int i=1;i<=bcc;i++) leaf+=deg[i]==1;
cout<<(leaf+1)/2;
```

### 复杂度

时间复杂度 $O(n+m)$，空间复杂度 $O(n+m)$。

---

## 36. [1521：【 例 2】矿场搭建](http://ybt.ssoier.cn:8088/problem_show.php?pid=1521)

`点双连通` `Tarjan`

### 题意

在煤矿图上设置尽量少的救援出口，使任意一个挖煤点坍塌后，其余点仍能到达至少一个出口，同时统计最少方案数。

### 分析

删掉任意一个点后仍能逃生，说明要按点双连通分量来理解结构。对于一个点双，如果它只通过一个割点与外界相连，那它就是一块“叶子区域”，这里至少要放一个出口，而且只能放在该块内部的非割点上。

若整张图根本没有割点，则整图就是一个点双，这时必须放两个出口，方案数是从所有点中任选两个。把所有叶子点双的需求和选择数乘起来，就得到答案。

### 核心代码

```cpp
tarjan_vbcc();
for(each component C){
    int cut = count_cut_vertices(C);
    if(cut==0) need+=2, ways*=1LL*sz(C)*(sz(C)-1)/2;
    else if(cut==1) need+=1, ways*=sz(C)-1;
}
cout<<need<<" "<<ways;
```

### 复杂度

时间复杂度 $O(n+m)$，空间复杂度 $O(n+m)$。

---

## 37. [1522：网络](http://ybt.ssoier.cn:8088/problem_show.php?pid=1522)

`割点` `Tarjan`

### 题意

若某个地点断电会导致其他地点之间失去互通，就把它称为灾区。要求统计所有灾区数量。

### 分析

这就是割点的直接定义。Tarjan 中，若非根节点 `u` 存在某个儿子 `v` 使 `low[v]\ge dfn[u]`，说明 `v` 子树无法绕回 `u` 的祖先，删掉 `u` 后图会裂开；根节点则要看 DFS 儿子数是否至少为 `2`。

输入有多组数据，但每组的判断逻辑完全一样：建图、跑一遍 Tarjan、数被标记为割点的节点数即可。

### 核心代码

```cpp
void tarjan(int u,int fa){
    dfn[u]=low[u]=++idx; int child=0;
    for(int v:g[u]) if(!dfn[v]){
        tarjan(v,u); low[u]=min(low[u],low[v]);
        if(low[v]>=dfn[u]&&fa!=-1) cut[u]=1;
        child++;
    }else if(v!=fa) low[u]=min(low[u],dfn[v]);
    if(fa==-1&&child>1) cut[u]=1;
}
```

### 复杂度

时间复杂度 $O(n+m)$，空间复杂度 $O(n+m)$。

---

## 38. [1523：嗅探器](http://ybt.ssoier.cn:8088/problem_show.php?pid=1523)

`割点` `路径分离`

### 题意

给定两个信息中心 `a,b`，要求找一个中间服务器，使所有 `a` 到 `b` 的路径都必须经过它；若有多个，输出编号最小的。

### 分析

能截住所有 `a-b` 路径的点，本质上是 `a` 与 `b` 之间的必经割点。把 DFS 树根在 `a`，只要某个儿子子树里包含 `b`，且满足 `low[child]\ge dfn[u]`，删掉 `u` 后 `b` 就会和 `a` 断开。

因此 DFS 时除了常规的 `dfn/low`，还要顺手记录“这个子树里是否含有 `b`”。满足条件的点都能当嗅探器，最后取编号最小的即可。

### 核心代码

```cpp
void dfs(int u,int fa){
    contain[u]=(u==b);
    for(int v:g[u]) if(v!=fa&&tree_edge(u,v)){
        dfs(v,u); contain[u]|=contain[v];
        if(contain[v]&&low[v]>=dfn[u]&&u!=a)
            ans=min(ans,u);
    }
}
```

### 复杂度

时间复杂度 $O(n+m)$，空间复杂度 $O(n+m)$。

---

## 39. [1524：旅游航道](http://ybt.ssoier.cn:8088/problem_show.php?pid=1524)

`桥` `Tarjan`

### 题意

若删除一条航道会让一些星球无法互相到达，这条航道就叫主要航道。要求统计主要航道数量。

### 分析

“删边就断”就是桥的定义。对于无向图里的树边 `u-v`，若 `low[v]>dfn[u]`，说明 `v` 子树找不到返祖边绕回 `u` 或其祖先，删掉这条边后图一定断开。

所以每组数据只需跑一遍 Tarjan 找桥并统计个数。这里最关键的不是复杂实现，而是把“主要航道”这个题意词直接翻译成“桥”。

### 核心代码

```cpp
void tarjan(int u,int inEdge){
    dfn[u]=low[u]=++idx;
    for(int i=head[u];i;i=e[i].nxt){
        int v=e[i].to;
        if(!dfn[v]){
            tarjan(v,i); low[u]=min(low[u],low[v]);
            if(low[v]>dfn[u]) bridge++;
        }else if(i!=(inEdge^1)) low[u]=min(low[u],dfn[v]);
    }
}
```

### 复杂度

时间复杂度 $O(n+m)$，空间复杂度 $O(n+m)$。

---

## 40. [1525：电力](http://ybt.ssoier.cn:8088/problem_show.php?pid=1525)

`割点` `连通块计数`

### 题意

对每张图，求删掉一个点后，剩余图的连通块数最多是多少。

### 分析

Tarjan 不只是判断某点是不是割点，还能直接数出删掉它后会裂成几块。对非根节点，每出现一个满足 `low[v]\ge dfn[u]` 的儿子子树，就会单独分出一块；此外还有包含父亲方向的那一块。

根节点没有“父亲方向”，它删掉后的块数就是 DFS 儿子数。把所有点的结果都算出来，取最大值即可。

### 核心代码

```cpp
for(int u=0;u<n;u++){
    int part = (fa[u]==-1?child[u]:1);
    for(int v:son[u])
        if(low[v]>=dfn[u]) part++;
    ans=max(ans,part);
}
```

### 复杂度

时间复杂度 $O(n+m)$，空间复杂度 $O(n+m)$。

---

## 41. [1526：Blockade](http://ybt.ssoier.cn:8088/problem_show.php?pid=1526)

`割点` `贡献统计`

### 题意

对于每个点 `i`，求删去它之后会有多少对城镇无法互相到达。

### 分析

这题不能只判割点，还要精确统计每个被分裂出的连通块大小。若儿子子树 `v` 满足 `low[v]\ge dfn[u]`，那么删掉 `u` 后，这一整块大小为 `sz[v]`，它与之前已经分出的所有点之间都会互相断开。

把这些块按顺序累加贡献，再把“父亲方向”的剩余那一块也补进去，就能得到删掉 `u` 后剩余点之间断开的有序点对数。最后别忘了再加上所有涉及 `u` 本人的点对贡献。

### 核心代码

```cpp
ans[u]=2LL*(n-1); long long sum=0;
for(int v:treeSon[u]) if(low[v]>=dfn[u]){
    ans[u]+=1LL*sz[v]*sum;
    sum+=sz[v];
}
ans[u]+=1LL*(n-1-sum-1)*sum;
ans[u]+=n-1;
```

### 复杂度

时间复杂度 $O(n+m)$，空间复杂度 $O(n+m)$。

---

# 六、欧拉回路与序列重构

最后一章把注意力放回“边是否能一笔走完”。度数、连通性和 Hierholzer 串起了路径输出、字典序控制，以及 de Bruijn 这类序列构造。

## 42. [1527：【例 1】欧拉回路](http://ybt.ssoier.cn:8088/problem_show.php?pid=1527)

`欧拉回路` `Hierholzer`

### 题意

给一张有向图或无向图，要求输出一条恰好经过每条边一次的欧拉回路。

### 分析

先判存在条件。无向图要求所有非零度点连通且度数全偶；有向图要求所有有边点在同一连通块里，并且每个点入度等于出度。

判定通过后，用 Hierholzer 沿着未使用的边一路走到底，走不动就回溯。回溯顺序反过来就是最终答案。对无向图要用边编号控制“同一条边只走一次”。

### 核心代码

```cpp
void dfs(int u){
    for(int &i=it[u];i;i=e[i].nxt) if(!used[id(i)]){
        used[id(i)]=1;
        dfs(e[i].to);
        path.push_back(i);
    }
}
dfs(start);
reverse(path.begin(),path.end());
```

### 复杂度

时间复杂度 $O(n+m)$，空间复杂度 $O(n+m)$。

---

## 43. [1528：【例 2】单词游戏](http://ybt.ssoier.cn:8088/problem_show.php?pid=1528)

`欧拉路径` `构造`

### 题意

给定若干单词，要求判断能否把它们排成一列，使前一个单词末字母等于后一个单词首字母；若能则给出一种顺序。

### 分析

把 `26` 个字母当成点，每个单词是一条从首字母指向尾字母的有向边。于是题目立刻变成：这张有向多重图是否存在覆盖全部边的一条欧拉路径或欧拉回路。

判断条件是所有有边点弱连通，且入度、出度之差要么全为 `0`，要么恰有一个点 `out=in+1`、一个点 `in=out+1`。若可行，再用 Hierholzer 输出边序，对应还原单词顺序即可。

### 核心代码

```cpp
for(string s:words) add(s.front()-'a',s.back()-'a',id);
if(!connected()||!degree_ok()) return puts("***"),0;
dfs(start);
for(int i=path.size()-1;i>=0;i--) print_word(path[i]);
```

### 复杂度

时间复杂度 $O(n\alpha+n)$，空间复杂度 $O(n)$。

---

## 44. [1529：欧拉回路](http://ybt.ssoier.cn:8088/problem_show.php?pid=1529)

`欧拉回路` `判定`

### 题意

多组无向图询问是否存在欧拉回路。

### 分析

无向图存在欧拉回路只看两件事：所有非零度点必须处在同一连通块里，且每个点度数都为偶数。这里只需要输出 `1/0`，所以甚至连路径都不必恢复。

实现上可以用 DFS 或并查集维护连通性，再顺手扫一遍度数即可。题目虽然叫“欧拉回路”，但真正核心是把名字准确翻译成判定条件。

### 核心代码

```cpp
for(int i=1;i<=n;i++) if(deg[i]&1) ok=0;
int rt=0;
for(int i=1;i<=n;i++) if(deg[i]){
    if(!rt) rt=find(i);
    else ok&=find(i)==rt;
}
puts(ok?"1":"0");
```

### 复杂度

时间复杂度 $O(n+m)$，空间复杂度 $O(n)$。

---

## 45. [1530：Ant Trip](http://ybt.ssoier.cn:8088/problem_show.php?pid=1530)

`欧拉路径` `连通块`

### 题意

无向图的所有边都要画到，允许分多笔，问最少需要几笔。

### 分析

在一个连通块里，若所有点度数都为偶数，就能一笔画完；否则每一笔最多同时消化两个奇点，所以至少需要 `odd/2` 笔。

因此每个含边连通块的贡献都是 `max(1, odd/2)`。把这些连通块的贡献加起来，就是整张图最少的笔数。

### 核心代码

```cpp
dfs_component(u);
int odd=0;
for(int x:comp) odd+=deg[x]&1;
ans+=max(1,odd/2);
```

### 复杂度

时间复杂度 $O(n+m)$，空间复杂度 $O(n+m)$。

---

## 46. [1531：John‘s Trip](http://ybt.ssoier.cn:8088/problem_show.php?pid=1531)

`欧拉回路` `字典序`

### 题意

每条街都有编号，要求从家出发走过每条街恰好一次并回到起点；若存在，输出街道编号字典序尽量小的路线。

### 分析

本质仍是欧拉回路，只不过边带编号，答案要求按编号尽量小。于是除了判欧拉回路存在外，还要让每个点的邻边按街道编号排序。

之后跑 Hierholzer 时始终优先走当前仍可用的最小编号边。由于边是在回溯时加入答案的，所以最终路径记得反转，这样得到的序列就是题目要求的最小字典序。

### 核心代码

```cpp
for(int u=1;u<=mx;u++) sort(g[u].begin(),g[u].end());
void dfs(int u){
    for(auto &e:g[u]) if(!used[e.id]){
        used[e.id]=1;
        dfs(e.to);
        path.push_back(e.id);
    }
}
```

### 复杂度

时间复杂度 $O(m\log m)$，空间复杂度 $O(m)$。

---

## 47. [1532：太鼓达人](http://ybt.ssoier.cn:8088/problem_show.php?pid=1532)

`欧拉回路` `de Bruijn`

### 题意

要构造一个环形 `01` 序列，使长度为 `K` 的连续片段全部互不相同且数量最大，并输出字典序最小的方案。

### 分析

长度为 `K` 的二进制串最多只有 `2^K` 种，因此最大数量必然是 `2^K`。把长度 `K-1` 的二进制串看成点，补一个 `0/1` 就得到一条边，对应一个长度 `K` 的片段。

这样题目就变成在二元 de Bruijn 图上找一条欧拉回路。若在 DFS 时总是优先走 `0` 再走 `1`，回溯得到的边标记序列恰好就是字典序最小的答案。

### 核心代码

```cpp
int S=1<<(K-1);
for(int u=0;u<S;u++)
  for(int b=0;b<2;b++) add(u,((u<<1)&(S-1))|b,b);
dfs(0);
cout<<(1<<K)<<" ";
for(int i=0;i<K-1;i++) putchar('0');
for(int i=path.size()-1;i>=0;i--) putchar('0'+path[i]);
```

### 复杂度

时间复杂度 $O(2^K)$，空间复杂度 $O(2^K)$。

---

## 48. [1533：相框](http://ybt.ssoier.cn:8088/problem_show.php?pid=1533)

`欧拉化` `贪心`

### 题意

导线和焊点组成一个作品，允许在焊点处分裂连线关系，也允许把两个自由端焊在一起。要求用最少操作把全部导线改造成一个环形相框。

### 分析

把作品看成带自由端的无向图。一次“烧熔”其实是在某个焊点重新给半边配对，把原本的支叉拆成若干条规整的链；一次“焊接”则是在两个自由端之间补上一条连接。

所以重点不是模拟操作顺序，而是先把每个连通块整理成尽量少的开链或闭环，再把这些链首尾接成一个大环。实现时统计每块的分叉点数与自由端数量：分叉点各需要一次烧熔，自由端每两条需要一次焊接，最后连通块之间再补边合并成单环。

### 核心代码

```cpp
for(each component C){
    split += count_branch_vertex(C);
    int end = free_end(C) + odd_degree(C);
    piece += max(1,end/2);
}
int ans = split + piece;
if(piece) ans--;
cout<<ans;
```

### 复杂度

时间复杂度 $O(n+m)$，空间复杂度 $O(n+m)$。

---

## 49. [1534：原始生物](http://ybt.ssoier.cn:8088/problem_show.php?pid=1534)

`欧拉覆盖` `最小轨迹覆盖`

### 题意

给出若干特征对 `(l,r)`，要求构造一个最短的数列，使每个特征对都至少作为一对相邻元素出现一次。

### 分析

把数值看成点，每个特征对看成一条有向边。如果某段遗传密码里相邻出现了 `l,r`，就等价于在图上走过了边 `l->r`。于是题目变成：用一条尽量短的序列覆盖所有边。

若某个弱连通块可以一笔走完，它对答案的贡献就是一条 trail；否则需要把边拆成尽量少的有向 trail，数量等于 `max(1,\sum\max(0,out-in))`。所有块的 trail 数相加后，总长度就是 `边数 + trail 数`。

### 核心代码

```cpp
for(each weak component C){
    int need=0;
    for(int u:C) need+=max(0,out[u]-in[u]);
    trail += max(1,need);
}
cout<<m+trail;
```

### 复杂度

时间复杂度 $O(n+m)$，空间复杂度 $O(n+m)$。
