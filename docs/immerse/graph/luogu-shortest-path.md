---
title: "洛谷 最短路专题精选解题报告"
subtitle: "🛣️ 从 Floyd 到分层图的最短路建模主线"
order: 1
icon: "🛣️"
---

# 洛谷 最短路专题精选解题报告

这一组题从 Floyd 与闭包一路走到 Dijkstra、分层图和最小环，题面上有的是路网、有的是状态机、有的是限制条件，但底层都在问“距离”该怎样定义。最短路题的关键往往不是套哪种算法，而是先把额外条件并进状态，让图上的边重新变得诚实。

# 一、Floyd 算法

这一组围绕 Floyd 的判序、闭包、最小环与动态加点展开。

## 1. [P1347 \[ECNA 2001\] 排序](https://www.luogu.com.cn/problem/P1347)

`Floyd` `传递闭包`

### 题意

给出 $n$ 个字母和按顺序加入的若干比较关系 $A<B$，需要判断是在第几条关系后首次出现矛盾、首次能唯一确定完整序列，还是到最后仍无法确定。

### 分析

把大小关系看成有向边，布尔 Floyd 维护可达性。每加入一条边就闭包一次：若出现 `reach[i][i]` 说明矛盾；若任意两点都已可比较，再按每个点前面有多少点来还原唯一序列。

### 核心代码

```cpp
bool reach[26][26];
int pos[26];

int check(int n){
    for(int k=0;k<n;k++)
        for(int i=0;i<n;i++) if(reach[i][k])
            for(int j=0;j<n;j++) reach[i][j]|=reach[k][j];
    for(int i=0;i<n;i++) if(reach[i][i]) return -1;
    for(int i=0;i<n;i++) for(int j=i+1;j<n;j++)
        if(!reach[i][j]&&!reach[j][i]) return 0;
    for(int i=0;i<n;i++){
        pos[i]=0;
        for(int j=0;j<n;j++) pos[i]+=reach[j][i];
    }
    return 1;
}
```

### 复杂度

$O(mn^3)$。

---

## 2. [B3611 【模板】传递闭包](https://www.luogu.com.cn/problem/B3611)

`Floyd` `传递闭包` `bitset`

### 题意

给定一个有向图的邻接矩阵，输出任意点对之间是否可直接或间接到达的传递闭包矩阵。

### 分析

这是最标准的布尔 Floyd。若用 `bitset` 存每一行，可把一轮 `j` 枚举压成按机器字并行的按位或，模板实现更快也更稳定。

### 核心代码

```cpp
const int N=2005;
bitset<N> reach[N];

void floyd(int n){
    for(int k=1;k<=n;k++)
        for(int i=1;i<=n;i++)
            if(reach[i][k]) reach[i]|=reach[k];
    for(int i=1;i<=n;i++) reach[i][i]=1;
}
```

### 复杂度

$O(\frac{n^3}{\omega})$。

---

## 3. [P10927 \[CEOI 1999\] Sightseeing trip](https://www.luogu.com.cn/problem/P10927)

`Floyd` `最小环`

### 题意

给定一张带权无向图，要求找到一个至少包含 3 个点的最短简单环，并输出这条环上的点序列；如果不存在则输出无解。

### 分析

Floyd 的经典最小环做法是在用点 `k` 更新最短路之前，先枚举 `i<j<k`，用 `dis[i][j]+w[i][k]+w[k][j]` 尝试更新答案。因为此时 `dis[i][j]` 只经过编号小于 `k` 的点，所以得到的环一定简单。

### 核心代码

```cpp
int dis[N][N],pre[N][N],ans=INF;
vector<int> cyc;

for(int k=1;k<=n;k++){
    for(int i=1;i<k;i++) for(int j=i+1;j<k;j++)
        if(dis[i][j]+g[i][k]+g[k][j]<ans){
            ans=dis[i][j]+g[i][k]+g[k][j];
            cyc=get_path(i,j),cyc.push_back(k);
        }
    for(int i=1;i<=n;i++) for(int j=1;j<=n;j++)
        if(dis[i][k]+dis[k][j]<dis[i][j])
            dis[i][j]=dis[i][k]+dis[k][j],pre[i][j]=pre[k][j];
}
```

### 复杂度

$O(n^3)$。

---

## 4. [P7516 \[省选联考 2021 A/B 卷\] 图函数](https://www.luogu.com.cn/problem/P7516)

`Floyd` `bitset` `可达性`

### 题意

对一张有向图定义函数 `f(u,G)`：按编号从小到大扫描顶点，若当前图中 `u` 与该点互相可达，就计数并删除该点。题目要求输出删去前缀边后的所有图的 `h(G)=\sum f(u,G)`。

### 分析

删前缀边得到的是一系列后缀图，适合倒序加边。核心是用 `bitset` 维护传递闭包；每加入一条 `u\to v`，所有能到 `u` 的点都并上 `v` 的可达集，再据此按顶点顺序模拟 `f(u,G)` 的删除过程。

### 核心代码

```cpp
bitset<N> reach[N];

void add_edge(int u,int v,int n){
    if(reach[u][v]) return;
    vector<int> src;
    for(int i=1;i<=n;i++) if(i==u||reach[i][u]) src.push_back(i);
    bitset<N> add=reach[v]; add[v]=1;
    for(int x:src) reach[x]|=add;
}

long long calc(int s,int n){
    bitset<N> ban; long long cnt=0;
    for(int v=1;v<=n;v++) if(!ban[v]&&reach[s][v]&&reach[v][s])
        cnt++, ban|=(reach[v]&reach[s]), ban[v]=1;
    return cnt;
}
```

### 复杂度

$O(\frac{mn^2}{\omega})$。

---

## 5. [P1119 灾后重建](https://www.luogu.com.cn/problem/P1119)

`Floyd` `离线`

### 题意

给出每个村庄的重建完成时间和若干询问 `(x,y,t)`，需要回答在第 `t` 天时，只经过已经修好的村庄时从 `x` 到 `y` 的最短路长度，不可达则输出 `-1`。

### 分析

把村庄按重建时间排序，按时间从小到大逐步解锁点。每解锁一个点就把它作为新的中转点做一轮 Floyd，查询时只要保证端点已经解锁，再直接读当前距离矩阵即可。

### 核心代码

```cpp
int cur=0;
sort(ord+1,ord+n+1,cmp_time);
for(auto [t,x,y,id]:qry){
    while(cur<n&&tim[ord[cur+1]]<=t){
        int k=ord[++cur];
        for(int i=0;i<n;i++) for(int j=0;j<n;j++)
            dis[i][j]=min(dis[i][j],dis[i][k]+dis[k][j]);
    }
    ans[id]=(tim[x]<=t&&tim[y]<=t&&dis[x][y]<INF)?dis[x][y]:-1;
}
```

### 复杂度

$O(n^3+q\log q)$。

---

# 二、状态图最短路与 BFS 建模

当边权退化为 1，或者状态需要额外携带钥匙、路径限制与访问历史时，最稳的入口通常就是 BFS。

## 6. [P1266 \[BalticOI 2002\] 速度限制](https://www.luogu.com.cn/problem/P1266)

`Dijkstra` `状态图`

### 题意

道路是有向的，每条路长度已知，起点处可能挂有限速牌；若没有新牌子就继续沿用当前速度。要求求出从起点到终点的最短行驶时间。

### 分析

速度会影响下一条边的耗时，因此状态不能只记路口，还要记当前车速。把 `(u,s)` 看成一个点：经过一条边后若起点有新限速就切换到该速度，否则保持 `s`，再用 Dijkstra 求最短时间。

### 核心代码

```cpp
struct State{int u,s; double d; bool operator<(const State& o)const{return d>o.d;}};
double dist[N][MAXS];

void dijkstra(int S){
    priority_queue<State> pq;
    dist[S][70]=0; pq.push({S,70,0});
    while(!pq.empty()){
        auto [u,s,d]=pq.top(); pq.pop();
        if(d!=dist[u][s]) continue;
        for(auto [v,len,lim]:g[u]){
            int ns=lim?lim:s;
            double nd=d+1.0*len/ns;
            if(nd<dist[v][ns]) dist[v][ns]=nd,pq.push({v,ns,nd});
        }
    }
}
```

### 复杂度

$O((nk+mk)\log(nk))$。

---

## 7. [P4011 孤岛营救问题](https://www.luogu.com.cn/problem/P4011)

`BFS` `状压` `最短路`

### 题意

迷宫是一个 `N\times M` 网格，相邻格子之间可能是通路、墙或不同颜色的锁门，部分格子能拾取钥匙。每次移动耗时 1，要求从左上角最短时间到右下角。

### 分析

钥匙集合会改变可走边，因此直接在格子上 BFS 不够。把状态扩成 `(位置,钥匙集合)`，进入格子时先并上该格钥匙，再检查门是否可开，普通 BFS 就是最短路。

### 核心代码

```cpp
queue<pair<int,int>> q;
dist[s][init]=0; q.push({s,init});
while(!q.empty()){
    auto [u,mask]=q.front(); q.pop();
    int nmask=mask|key[u];
    for(auto [v,col]:adj[u]){
        if(col&&!(nmask&(1<<(col-1)))) continue;
        if(dist[v][nmask]==-1){
            dist[v][nmask]=dist[u][mask]+1;
            q.push({v,nmask});
        }
    }
}
```

### 复杂度

$O(nm2^p)$。

---

## 8. [P8817 \[CSP-S 2022\] 假期计划](https://www.luogu.com.cn/problem/P8817)

`BFS` `折半搜索` `最短路`

### 题意

从家 `1` 出发，需要按 `1\to A\to B\to C\to D\to 1` 走 5 段行程，每段至多转车 `k` 次，四个景点互不相同。给定每个景点分数，求最大得分和。

### 分析

先从家和每个景点做 BFS，求出“是否能在 `k+1` 条边内到达”。接着对每个点保留若干个既能从家到达、又能再到它的最高分候选，最后枚举中间两个点 `B,C` 做双端拼接。

### 核心代码

```cpp
for(int s=1;s<=n;s++) bfs(s);
for(int v=2;v<=n;v++)
    for(int u=2;u<=n;u++)
        if(ok[1][u]&&ok[u][v]) upd(best[v],u,val[u]);

long long ans=0;
for(int b=2;b<=n;b++) for(int c=2;c<=n;c++){
    if(b==c||!ok[b][c]) continue;
    for(auto [sa,a]:best[b]) for(auto [sd,d]:best[c])
        if(a&&d&&a!=b&&a!=c&&d!=a&&d!=b&&d!=c)
            ans=max(ans,sa+val[b]+val[c]+sd);
}
```

### 复杂度

$O(n(n+m)+n^2)$。

---

## 9. [P5683 \[CSP-J 2019 江西\] 道路拆除](https://www.luogu.com.cn/problem/P5683)

`BFS` `最短路` `建模`

### 题意

首都为 `1`，拆路后仍要保证从 `1` 到 `s_1`、`s_2` 的最短时间分别不超过 `t_1`、`t_2`。图是无权无向图，要求最多能拆掉多少条边。

### 分析

保留下来的边只需要支撑两条从 `1` 出发的路径，最优结构一定是先共用一段，再从某个分叉点分开。预处理任意两点最短路后，枚举分叉点 `x`，保留边数就是 `dis[1][x]+dis[x][s1]+dis[x][s2]`。

### 核心代码

```cpp
for(int s=1;s<=n;s++) bfs_all(s);
int keep=INF;
for(int x=1;x<=n;x++){
    int d1=dis[1][x]+dis[x][s1];
    int d2=dis[1][x]+dis[x][s2];
    if(d1<=t1&&d2<=t2) keep=min(keep,dis[1][x]+dis[x][s1]+dis[x][s2]);
}
ans=(keep==INF?-1:m-keep);
```

### 复杂度

$O(n(n+m))$。

---

## 10. [P5663 \[CSP-J 2019\] 加工零件](https://www.luogu.com.cn/problem/P5663)

`BFS` `奇偶性`

### 题意

每张工单给出工人 `a` 和阶段 `L`，询问 1 号工人是否会在这次递归加工中承担“提供原材料”的角色。

### 分析

工序每往外扩一层就沿一条传送带多走一步，所以问题等价于：是否存在一条从 `1` 到 `a` 的长度与 `L` 同奇偶且不超过 `L` 的路径。把每个点拆成奇偶两层做 BFS，就能回答全部询问。

### 核心代码

```cpp
queue<pair<int,int>> q;
dist[1][0]=0; q.push({1,0});
while(!q.empty()){
    auto [u,p]=q.front(); q.pop();
    for(int v:adj[u]) if(dist[v][p^1]==-1){
        dist[v][p^1]=dist[u][p]+1;
        q.push({v,p^1});
    }
}
bool ok(int a,int L){
    int d=dist[a][L&1];
    return d!=-1&&d<=L;
}
```

### 复杂度

$O(n+m+q)$。

---

## 11. [P5767 \[NOI1997\] 最优乘车](https://www.luogu.com.cn/problem/P5767)

`BFS` `图论建模`

### 题意

给出若干条单向巴士线路，每条线路会依次经过多个站点。旅客从 `1` 号站出发到 `N` 号站，要求换车次数最少。

### 分析

乘坐同一条巴士在线路上的任意后继站下车都不算换乘，所以可以把同一线路上前面的站向后面的站连一条“乘一次车”边。之后在站点图上做 BFS，得到最少乘车次数，再减一就是换乘次数。

### 核心代码

```cpp
for(auto &line:lines)
    for(int i=0;i<(int)line.size();i++)
        for(int j=i+1;j<(int)line.size();j++)
            g[line[i]].push_back(line[j]);

queue<int> q; dist[1]=1; q.push(1);
while(!q.empty()){
    int u=q.front(); q.pop();
    for(int v:g[u]) if(!dist[v]){
        dist[v]=dist[u]+1;
        q.push(v);
    }
}
```

### 复杂度

$O(\sum |route|^2)$。

---

## 12. [P1811 最短路](https://www.luogu.com.cn/problem/P1811)

`BFS` `状态图` `最短路`

### 题意

无权无向图上给出若干有序禁忌三元组 `(A,B,C)`，表示走到 `B` 且上一步来自 `A` 时不能继续走向 `C`。要求求出从 `1` 到 `N` 的最短合法路径并输出路径。

### 分析

限制依赖“前一个点”，因此把状态设为 `(pre,u)`。从 `(pre,u)` 扩展到 `(u,v)` 时，只要三元组 `(pre,u,v)` 不在禁集里即可，BFS 首次到达任何 `(*,N)` 就得到最短路。

### 核心代码

```cpp
queue<pair<int,int>> q;
q.push({0,1}); dist[0][1]=0;
while(!q.empty()){
    auto [pre,u]=q.front(); q.pop();
    for(int v:adj[u]){
        if(bad.count({pre,u,v})||dist[u][v]!=-1) continue;
        dist[u][v]=dist[pre][u]+1;
        from[u][v]={pre,u};
        q.push({u,v});
    }
}
```

### 复杂度

$O(n^2+m\Delta+k)$。

---

## 13. [CF59E Shortest Path](https://www.luogu.com.cn/problem/CF59E)

`BFS` `状态图` `最短路`

### 题意

城市之间道路长度全为 1，同时给出若干有序诅咒三元组 `(a,b,c)`，要求从 `1` 走到 `n` 时不能出现任意被禁止的连续三城访问顺序，并输出最短路线。

### 分析

和带前驱限制的最短路完全一致，状态必须记录“当前点 + 上一个点”。把所有禁用三元组放进哈希表，BFS 搜索 `(pre,u)` 到 `(u,v)` 的转移并保留前驱即可还原路线。

### 核心代码

```cpp
queue<pair<int,int>> q;
q.push({0,1}); dist[0][1]=0;
while(!q.empty()){
    auto [pre,u]=q.front(); q.pop();
    for(int v:g[u]){
        if(forbid.count({pre,u,v})||dist[u][v]!=-1) continue;
        dist[u][v]=dist[pre][u]+1;
        prv[u][v]={pre,u};
        q.push({u,v});
    }
}
```

### 复杂度

$O(n^2+m\Delta+k)$。

---

## 14. [P1608 路径统计](https://www.luogu.com.cn/problem/P1608)

`Dijkstra` `最短路计数`

### 题意

给定一张带权有向图，要求同时输出从 `1` 到 `N` 的最短距离以及这样的最短路径条数。

### 分析

跑 Dijkstra 时同时维护 `cnt[v]`。如果通过 `u` 找到更短路就直接覆盖距离和方案数；如果找到等长路，就把 `cnt[u]` 累加到 `cnt[v]` 上。

### 核心代码

```cpp
priority_queue<Node> pq;
dist[1]=0; cnt[1]=1; pq.push({1,0});
while(!pq.empty()){
    auto [u,d]=pq.top(); pq.pop();
    if(d!=dist[u]) continue;
    for(auto [v,w]:g[u]){
        if(dist[v]>d+w){
            dist[v]=d+w; cnt[v]=cnt[u];
            pq.push({v,dist[v]});
        }else if(dist[v]==d+w){
            cnt[v]+=cnt[u];
        }
    }
}
```

### 复杂度

$O(m\log n)$。

---

## 15. [P1144 最短路计数](https://www.luogu.com.cn/problem/P1144)

`BFS` `最短路计数`

### 题意

给定无向无权图，要求输出从 `1` 号点到每个点的最短路条数，答案对 `100003` 取模。

### 分析

无权图最短路就是 BFS 分层。首次到达某点时记录距离并继承方案数；之后如果再从上一层走到它，就把方案数继续累加。

### 核心代码

```cpp
queue<int> q;
dist[1]=0; ways[1]=1; q.push(1);
while(!q.empty()){
    int u=q.front(); q.pop();
    for(int v:adj[u]){
        if(dist[v]==-1){
            dist[v]=dist[u]+1;
            ways[v]=ways[u];
            q.push(v);
        }else if(dist[v]==dist[u]+1){
            ways[v]=(ways[v]+ways[u])%100003;
        }
    }
}
```

### 复杂度

$O(n+m)$。

---

## 16. [P2934 \[USACO09JAN\] Safe Travel G](https://www.luogu.com.cn/problem/P2934)

`Dijkstra` `最短路树` `替代路径`

### 题意

对每个牧场 `i`，原来的最短路最后一条边上会有小妖精埋伏。要求求出每头牛避开自己那条“最后一条树边”后，从 `1` 到 `i` 的最短通行时间。

### 分析

先从 `1` 跑 Dijkstra 选出一棵最短路树。每条非树边 `(u,v)` 都能为树上 `u` 到 `v` 路径上的若干点提供一条绕开最后一条树边的备选答案，把这些候选值沿树路径打到节点上即可。

### 核心代码

```cpp
run_dijkstra();
for(auto e:edges) if(!in_tree[e.id]){
    int u=e.u,v=e.v;
    long long cand=dist[u]+dist[v]+e.w;
    upd_path(u,v,cand);
}
void upd_path(int u,int v,long long cand){
    while(find(u)!=find(v)){
        if(dep[find(u)]<dep[find(v)]) swap(u,v);
        int x=find(u); ans[x]=min(ans[x],cand-dist[x]);
        fa[x]=par[x];
    }
}
```

### 复杂度

$O((n+m)\log n)$。

---

## 17. [P2149 \[SDOI2009\] Elaxia的路线](https://www.luogu.com.cn/problem/P2149)

`Dijkstra` `最短路 DAG` `拓扑 DP`

### 题意

给定两个人各自的宿舍与实验室，要求在两人都走最短路的前提下，让两条路线的公共路径长度尽量长，方向相反也允许。

### 分析

分别从四个端点跑最短路，筛出同时属于某一对最短路的边，就得到一张有向无环的最短路交集图。公共路径长度就是这张 DAG 上的最长路，再把两种方向组合都算一遍取最大值。

### 核心代码

```cpp
auto build=[&](int s1,int t1,int s2,int t2){
    vector<int> indeg(n+1); vector<vector<pair<int,int>>> dag(n+1);
    for(auto [u,v,w]:edges){
        if(d1[u]+w+r1[v]==d1[t1]&&d2[u]+w+r2[v]==d2[t2])
            dag[u].push_back({v,w}), indeg[v]++;
    }
    queue<int> q; for(int i=1;i<=n;i++) if(!indeg[i]) q.push(i);
    while(!q.empty()){ int u=q.front(); q.pop();
        for(auto [v,w]:dag[u]) dp[v]=max(dp[v],dp[u]+w),--indeg[v]||q.push(v);
    }
};
```

### 复杂度

$O(m\log n)$。

---

## 18. [P2505 \[HAOI2012\] 道路](https://www.luogu.com.cn/problem/P2505)

`Dijkstra` `最短路 DAG` `计数`

### 题意

对一张带权有向图，需要对每条边统计：有多少条不同的最短路径会经过这条边。

### 分析

固定一个源点 `s` 时，满足 `dis[u]+w=dis[v]` 的边构成最短路 DAG。拓扑序上向前统计从 `s` 到每点的最短路条数，反向再统计从每点出发的条数，二者乘积就是该源点对边的贡献。

### 核心代码

```cpp
for(int s=1;s<=n;s++){
    dijkstra(s);
    build_dag();
    topo_forward(); topo_backward();
    for(auto [u,v,id]:dag_edges)
        ans[id]+=1LL*f[u]*g[v];
}
```

### 复杂度

$O(n(m\log n+m))$。

---

## 19. [CF1163F Indecisive Taxi Fee](https://www.luogu.com.cn/problem/CF1163F)

`Dijkstra` `线段树` `最短路`

### 题意

原图是带权无向图，`q` 个询问各自独立地把某一条边的权值改成 `x`，要求输出修改后从 `1` 到 `n` 的最短路长度。

### 分析

先求出原图从两端出发的最短路，并选定一条原最短路径 `P`。不在 `P` 上的边会形成一条绕过 `P` 某段区间的备选方案，用线段树对这段区间做 `chmin`；而在 `P` 上的边改权时，则比较“仍走原路径”与“被备选方案替代”两类答案。

### 核心代码

```cpp
for(auto e:edges) if(!on_path[e.id]){
    int l=pos[belL(e.u,e.v)], r=pos[belR(e.u,e.v)];
    long long cand=min(du[e.u]+e.w+dv[e.v],du[e.v]+e.w+dv[e.u]);
    if(l<r) seg.chmin(l+1,r,cand);
}
for(auto [id,x]:qry){
    if(!on_path[id]) ans=min(base,du[u[id]]+x+dv[v[id]]);
    else ans=min(base-path_w[id]+x, seg.query(pos_edge[id]));
}
```

### 复杂度

$O((m+q)\log n)$。

---

## 20. [CF1005F Berland and the Shortest Paths](https://www.luogu.com.cn/problem/CF1005F)

`BFS` `最短路树` `构造`

### 题意

无权无向图中要构造最多 `k` 棵以 `1` 为根的最短路树：每个点都选一个来自上一层的父边，并输出对应边集。

### 分析

先 BFS 出层次，收集每个点所有可能的最短路父边。之后按点编号 DFS 枚举每个点选择哪条父边，搜索树大小等于各点可选父边数的乘积，枚举时截断到 `k` 棵即可。

### 核心代码

```cpp
bfs();
for(auto [u,v,id]:edges){
    if(dis[u]+1==dis[v]) par[v].push_back(id);
    if(dis[v]+1==dis[u]) par[u].push_back(id);
}
void dfs(int x){
    if(ans.size()==k) return;
    if(x>n){ ans.push_back(cur); return; }
    for(int id:par[x]){
        cur.push_back(id); dfs(x+1); cur.pop_back();
    }
}
```

### 复杂度

$O(n+m+kn)$。

---

## 21. [P10929 黑暗城堡](https://www.luogu.com.cn/problem/P10929)

`Dijkstra` `最短路 DAG` `计数`

### 题意

城堡房间与通道构成带权无向图，要求统计从 `1` 号房间出发的所有最短路生成树数量。

### 分析

先求出每个点的最短距离。除起点外，每个点在最短路 DAG 中任选一个前驱都不会破坏其他点的最短距离，因此答案就是所有点“合法前驱数”的乘积。

### 核心代码

```cpp
dijkstra(1);
long long ans=1;
for(int v=2;v<=n;v++){
    int cnt=0;
    for(auto [u,w]:g[v]) if(dist[u]+w==dist[v]) cnt++;
    ans=ans*cnt%MOD;
}
```

### 复杂度

$O(m\log n)$。

---

# 三、Dijkstra 最短路

这一章先处理最标准的堆优化 Dijkstra、最短路树与最短路计数。

## 22. [CF1076D Edge Deletion](https://www.luogu.com.cn/problem/CF1076D)

`Dijkstra` `最短路树`

### 题意

删边后最多保留 `k` 条边，要求让尽可能多的点仍然保持与 `1` 号点相同的最短距离，并输出保留边编号。

### 分析

任何保距离的点都必须通过某棵最短路树与根相连，所以先 Dijkstra 选出一棵最短路树。然后从根开始按层遍历树边，取前 `k` 条即可让对应子树中的点继续保持原最短路。

### 核心代码

```cpp
dijkstra();
queue<int> q; q.push(1);
while(!q.empty()&&ans.size()<k){
    int u=q.front(); q.pop();
    for(auto [v,id]:tree[u]){
        ans.push_back(id);
        if(ans.size()==k) break;
        q.push(v);
    }
}
```

### 复杂度

$O(m\log n)$。

---

## 23. [CF545E Paths and Trees](https://www.luogu.com.cn/problem/CF545E)

`Dijkstra` `最短路树`

### 题意

给定带权无向图和根 `s`，需要构造一棵最短路树，使所有点到 `s` 的距离保持最短，同时所选树边权值总和最小。

### 分析

先求出最短距离。对每个点 `v\neq s`，只要从所有满足 `dis[u]+w=dis[v]` 的入边中选一条最轻的边作为父边，就能独立地最小化总边权和。

### 核心代码

```cpp
dijkstra(s);
for(int v=1;v<=n;v++) if(v!=s){
    for(auto [u,w,id]:g[v])
        if(dist[u]+w==dist[v]&&w<best[v])
            best[v]=w,pre[v]=id;
    sum+=best[v];
}
```

### 复杂度

$O(m\log n)$。

---

## 24. [P5304 \[GXOI/GZOI2019\] 旅行者](https://www.luogu.com.cn/problem/P5304)

`Dijkstra` `多源最短路` `二进制分组`

### 题意

在有向图中给出 `k` 个特殊城市，要求求出任意两个不同特殊城市之间最短路长度的最小值。

### 分析

直接枚举特殊点对会炸掉。把特殊点按二进制位分成两组，每一轮把某一组接到虚拟源跑一次正图、另一轮跑一次反图，这样每对特殊点总会在某一位上被分开并被统计到。

### 核心代码

```cpp
for(int b=0;(1<<b)<k;b++){
    build_source(b,0); dijkstra(src,g);
    for(int x:spec) ans=min(ans,dist[x]);
    build_source(b,1); dijkstra(src,rg);
    for(int x:spec) ans=min(ans,dist[x]);
}
```

### 复杂度

$O(\log k\cdot m\log n)$。

---

## 25. [P4366 \[Code+#4\] 最短路](https://www.luogu.com.cn/problem/P4366)

`Dijkstra` `特殊建图` `位运算`

### 题意

城市之间默认可以按代价 `(i xor j)\times C` 互达，另外还有若干条单向快捷通道。要求求出从起点到终点的最短路。

### 分析

完全图边数太大，关键是把 `xor` 代价拆成按位选择。建立一张按二进制分层的辅助图，从一个编号走到另一个编号的每一位翻转都会对应一条固定代价边，再和原有快捷通道一起跑 Dijkstra。

### 核心代码

```cpp
for(int x=1;x<=n;x++) link_number_to_trie(x);
for(int bit=0;bit<LOG;bit++)
    add_trie_edges(bit,1LL*c*(1<<bit));
for(auto [u,v,w]:extra) add_edge(id[u],id[v],w);
dijkstra(id[S]);
```

### 复杂度

$O((n\log n+m)\log(n\log n))$。

---

## 26. [UVA1048 Low Cost Air Travel](https://www.luogu.com.cn/problem/UVA1048)

`Dijkstra` `建图`

### 题意

每张联票都规定了一条固定飞行序列和价格，必须从首站开始乘坐，但可以在序列中任意后继城市下机。对每个询问，求到达目标城市的最小票价与方案。

### 分析

把一张联票从首站到后继各站都视作一条同价有向边，整道题就变成普通最短路。跑 Dijkstra 时记录前驱，就能把买票顺序一并恢复出来。

### 核心代码

```cpp
for(auto &ticket:tickets)
    for(int i=1;i<(int)ticket.path.size();i++)
        g[ticket.path[0]].push_back({ticket.path[i],ticket.cost});
dijkstra(S);
while(t) route.push_back(t), t=pre[t];
reverse(route.begin(),route.end());
```

### 复杂度

$O(E\log V)$。

---

## 27. [UVA1078 Steam Roller](https://www.luogu.com.cn/problem/UVA1078)

`Dijkstra` `状态图`

### 题意

压路机在网格道路上行驶，转向与继续前进的代价不同，还要记录当前滚动方向与状态。要求求出起点到终点的最小时间。

### 分析

位置相同但朝向不同，后续可行决策完全不同，所以必须把方向一起放进状态。把 `(x,y,dir,state)` 看成图点，按题意连出直行、转弯与停机重启的转移后跑 Dijkstra 即可。

### 核心代码

```cpp
struct Node{int x,y,d,s; long long dis;};
priority_queue<Node> pq;
dist[sx][sy][4][2]=0; pq.push({sx,sy,4,0,0});
while(!pq.empty()){
    auto cur=pq.top(); pq.pop();
    if(cur.dis!=dist[cur.x][cur.y][cur.d][cur.s]) continue;
    relax_turn(cur); relax_go(cur);
}
```

### 复杂度

$O(nm\log(nm))$。

---

# 四、分层图与多状态最短路

一旦路径上同时受“优惠次数、货币、边数、最大值”这类状态约束，就把状态拆进点集，转成多层最短路。

## 28. [P13271 \[NOI2025\] 机器人](https://www.luogu.com.cn/problem/P13271)

`分层图` `Dijkstra` `状态图`

### 题意

机器人在路口 `x` 时，若当前参数为 `p`，就只能走 `x` 的第 `p` 条出边；参数可在 `1\sim k` 间上下调整并支付代价。要求求出从仓库到礼堂的最小总代价。

### 分析

把 `(路口,参数)` 看成分层图节点：同一层之间按第 `p` 条出边连道路长度，竖向边表示把参数 `p` 调成 `p\pm1` 的修改费用。这样所有操作都变成普通边权，直接 Dijkstra。

### 核心代码

```cpp
for(int u=1;u<=n;u++) for(int p=1;p<=k;p++){
    if(p<k) add(id(u,p),id(u,p+1),up[p]);
    if(p>1) add(id(u,p),id(u,p-1),down[p]);
    if(p<=(int)out[u].size())
        add(id(u,p),id(out[u][p-1].to,p),out[u][p-1].w);
}
dijkstra(id(S,1));
```

### 复杂度

$O((nk+m)\log(nk))$。

---

## 29. [P9751 \[CSP-J 2023\] 旅游巴士](https://www.luogu.com.cn/problem/P9751)

`分层图` `Dijkstra` `同余最短路`

### 题意

游客必须在时刻为 `k` 的倍数时进入景区，也必须在时刻为 `k` 的倍数时从 `n` 号点离开；每条边只能在开放时间 `a_i` 之后通过，且途中不能停留，求最早离开时间。

### 分析

时间是否能赶上巴士只和当前时刻对 `k` 取模有关，所以把节点扩成 `n\times k` 层。走一条边前若当前时刻早于 `a_i`，只能沿环多转若干圈补时间；计算好下一层编号后跑 Dijkstra 即可。

### 核心代码

```cpp
while(!pq.empty()){
    auto [u,r,d]=pq.top(); pq.pop();
    if(d!=dist[u][r]) continue;
    for(auto [v,a]:g[u]){
        long long t=d;
        if(t<a) t+=((a-t+k-1)/k)*k;
        long long nd=t+1;
        int nr=nd%k;
        if(nd<dist[v][nr]) dist[v][nr]=nd,pq.push({v,nr,nd});
    }
}
```

### 复杂度

$O(mk\log(nk))$。

---

## 30. [AT_abc164_e \[ABC164E\] Two Currencies](https://www.luogu.com.cn/problem/AT_abc164_e)

`分层图` `Dijkstra` `状态图`

### 题意

每条道路会消耗银币和时间，每个城市还能花金币兑换银币并消耗时间。给定初始银币数，要求求出从 `1` 出发到其余各城的最短时间。

### 分析

银币数量会影响能否走边，所以把状态设成 `(城市,当前银币)`。银币超过阈值以后没有区分意义，可以统一截断到上界，再把“兑换一次”和“走一条路”都当成边跑 Dijkstra。

### 核心代码

```cpp
const int LIM=2500;
priority_queue<Node> pq;
dist[1][min(S,LIM)]=0; pq.push({1,min(S,LIM),0});
while(!pq.empty()){
    auto [u,c,d]=pq.top(); pq.pop();
    if(d!=dist[u][c]) continue;
    int nc=min(LIM,c+add[u]);
    relax(u,nc,d+cost[u]);
    for(auto [v,need,t]:g[u]) if(c>=need)
        relax(v,c-need,d+t);
}
```

### 复杂度

$O(nLIM\log(nLIM)+mLIM\log(nLIM))$。

---

## 31. [CF1473E Minimum Path](https://www.luogu.com.cn/problem/CF1473E)

`分层图` `Dijkstra`

### 题意

对每个点 `v`，要求求一条从 `1` 到 `v` 的路径，使路径代价为“边权和减去最大边再加上最小边”的最小值。

### 分析

把“减去一条边”和“额外加上一条边”视作两次特殊操作，分别对应免费一次、双倍一次。四层状态 `(u,free_used,double_used)` 足以表示是否已经使用过这两次操作，转移时在当前边上决定是否使用。

### 核心代码

```cpp
for(auto [v,w]:g[u]){
    relax(v,a,b,d+w);
    if(!a) relax(v,1,b,d);
    if(!b) relax(v,a,1,d+2*w);
    if(!a&&!b) relax(v,1,1,d+w);
}
```

### 复杂度

$O(m\log n)$。

---

## 32. [CF1915G Bicycles](https://www.luogu.com.cn/problem/CF1915G)

`分层图` `Dijkstra` `状态图`

### 题意

每个城市都可以买一辆自行车，骑车经过长度为 `w` 的道路会花费 `w\times s`，其中 `s` 是当前所骑自行车的速度参数。允许在经过的城市换车，要求最小总代价。

### 分析

决定后续花费的不是历史路径本身，而是“迄今为止买过的最优车速”。因此把状态设为 `(城市,当前最小速度)`，走边时费用加 `w\times speed`，到新城市时可以把速度更新为 `min(speed,s[v])`。

### 核心代码

```cpp
priority_queue<Node> pq;
dist[1][bike[1]]=0; pq.push({1,bike[1],0});
while(!pq.empty()){
    auto [u,s,d]=pq.top(); pq.pop();
    if(d!=dist[u][s]) continue;
    for(auto [v,w]:g[u]){
        int ns=min(s,bike[v]);
        long long nd=d+1LL*w*s;
        if(nd<dist[v][ns]) dist[v][ns]=nd,pq.push({v,ns,nd});
    }
}
```

### 复杂度

$O(n^2\log n+m n\log n)$。

---

## 33. [P1948 \[USACO08JAN\] Telephone Lines S](https://www.luogu.com.cn/problem/P1948)

`分层图` `二分` `0-1 BFS`

### 题意

在电话线网络里可以容忍至多 `k` 条“很长”的边，要求找一条从 `1` 到 `n` 的路线，使其中最长的那批边尽量短，输出这个最小阈值。

### 分析

二分答案 `x` 后，把边长 `>x` 的边视为代价 1，否则代价 0。若 0-1 BFS 算出从 `1` 到 `n` 经过的“超长边”条数不超过 `k`，说明阈值 `x` 可行。

### 核心代码

```cpp
bool check(int lim){
    deque<int> q; fill(cnt,cnt+n+1,INF);
    cnt[1]=0; q.push_back(1);
    while(!q.empty()){
        int u=q.front(); q.pop_front();
        for(auto [v,w]:g[u]){
            int c=cnt[u]+(w>lim);
            if(c<cnt[v]){
                cnt[v]=c;
                (w>lim)?q.push_back(v):q.push_front(v);
            }
        }
    }
    return cnt[n]<=k;
}
```

### 复杂度

$O((n+m)\log W)$。

---

## 34. [P4568 \[JLOI2011\] 飞行路线](https://www.luogu.com.cn/problem/P4568)

`分层图` `Dijkstra`

### 题意

城市之间有带权航线，旅途中至多可以把 `k` 段航线免费坐掉。要求求出从起点到终点的最小花费。

### 分析

把每个城市拆成 `k+1` 层，表示已经用掉了多少次免费机会。走普通边可以留在本层花费 `w`，也可以在还有次数时走到下一层并花费 `0`，层图上的最短路就是答案。

### 核心代码

```cpp
for(int u=0;u<n;u++) for(int t=0;t<=k;t++)
    for(auto [v,w]:g[u]){
        add(id(u,t),id(v,t),w);
        if(t<k) add(id(u,t),id(v,t+1),0);
    }
dijkstra(id(s,0));
```

### 复杂度

$O(km\log(kn))$。

---

## 35. [P2939 \[USACO09FEB\] Revamping Trails G](https://www.luogu.com.cn/problem/P2939)

`分层图` `Dijkstra`

### 题意

从 `1` 到 `N` 的路上可以把至多 `K` 条小径整修成长度 `0`，要求求出整修后的最短路径长度。

### 分析

这题和“最多免费走 `K` 条边”完全一样。每个点拆成 `K+1` 层，普通走边不变，使用一次整修机会就跨到下一层并支付 `0` 代价。

### 核心代码

```cpp
priority_queue<Node> pq;
dist[1][0]=0; pq.push({1,0,0});
while(!pq.empty()){
    auto [u,t,d]=pq.top(); pq.pop();
    if(d!=dist[u][t]) continue;
    for(auto [v,w]:g[u]){
        relax(v,t,d+w);
        if(t<k) relax(v,t+1,d);
    }
}
```

### 复杂度

$O(km\log(kn))$。

---

## 36. [P4822 \[BJWC2012\] 冻结](https://www.luogu.com.cn/problem/P4822)

`分层图` `Dijkstra`

### 题意

从 `1` 到 `N` 的最短路上可以使用 `K` 张冻结券，每张券可把一条边的花费减半一次。要求求出最小总代价。

### 分析

仍然是分层图，只是跨层转移的代价从 `0` 改成 `w/2`。状态 `(u,t)` 表示已经用了 `t` 张券，普通走边留在本层，用券就到下一层。

### 核心代码

```cpp
for(int u=1;u<=n;u++) for(int t=0;t<=k;t++)
    for(auto [v,w]:g[u]){
        relax(v,t,dist[u][t]+w);
        if(t<k) relax(v,t+1,dist[u][t]+w/2);
    }
```

### 复杂度

$O(km\log(kn))$。

---

# 五、最短路综合应用

这一章集中放 Dijkstra 建模题：问题外壳各不相同，但本质都是“构图 + 松弛 + 代价定义”。

## 37. [P10947 \[BAPC 2006 资格赛\] Sightseeing](https://www.luogu.com.cn/problem/P10947)

`Dijkstra` `最短路 DAG` `计数`

### 题意

从固定起点 `S` 到终点 `F`，旅游巴士只允许走长度为最短路或最短路加 1 的路线。要求统计这样的不同路线条数。

### 分析

先求出 `S` 和 `F` 两侧的最短路。对每条边计算它相对最短路的“额外代价”是否为 0 或 1，再在按最短路距离排序的 DAG 上做 `dp[点][是否已经多走 1]` 计数即可。

### 核心代码

```cpp
dijkstra(S,ds); dijkstra(F,dt);
dp[S][0]=1;
for(int u:ord) for(auto [v,w]:g[u]){
    int extra=ds[u]+w+dt[v]-ds[F];
    if(extra==0) dp[v][0]+=dp[u][0], dp[v][1]+=dp[u][1];
    if(extra==1) dp[v][1]+=dp[u][0];
}
```

### 复杂度

$O(m\log n)$。

---

## 38. [U262369 选择最佳线路](https://www.luogu.com.cn/problem/U262369)

`Dijkstra` `多源最短路`

### 题意

公交站之间存在单向线路，给出若干个允许上车的起点和一个目标站 `s`，要求求出从任意可选起点到 `s` 的最短时间。

### 分析

多个出发点的最短路可以统一成一个虚拟源。把虚拟源向所有允许上车的站点连权值为 0 的边，再跑一次 Dijkstra，`dist[s]` 就是答案。

### 核心代码

```cpp
int src=0;
for(int x:start) g[src].push_back({x,0});
dijkstra(src);
cout<<dist[s];
```

### 复杂度

$O(m\log n)$。

---

## 39. [T441226 选择最佳线路](https://www.luogu.com.cn/problem/T441226)

`Dijkstra` `多源最短路`

### 题意

题意与“选择最佳线路”相同：给定若干可选起点和一个终点 `s`，求从任意起点到 `s` 的最短路。

### 分析

依然把所有合法起点并到一个虚拟源即可。这样避免了对每个起点单独跑最短路，复杂度与单源 Dijkstra 相同。

### 核心代码

```cpp
int src=0;
for(int x:start) add_edge(src,x,0);
dijkstra(src);
answer=dist[s];
```

### 复杂度

$O(m\log n)$。

---

## 40. [P1462 通往奥格瑞玛的道路](https://www.luogu.com.cn/problem/P1462)

`二分` `Dijkstra` `最短路`

### 题意

每个城市有过路费，每条公路会损失血量。要求在总血量损失不超过 `b` 的前提下，从 `1` 到 `n` 的路径上最大过路费尽量小。

### 分析

把答案设成费用上限 `x`，只保留过路费 `\le x` 的城市，再在剩余图上跑一遍按血量损失计权的 Dijkstra。若最短损失不超过 `b`，说明这个上限可行，于是二分 `x`。

### 核心代码

```cpp
bool check(int lim){
    if(cost[1]>lim||cost[n]>lim) return false;
    fill(dist,dist+n+1,INF); dist[1]=0;
    priority_queue<Node> pq; pq.push({1,0});
    while(!pq.empty()){
        auto [u,d]=pq.top(); pq.pop();
        if(d!=dist[u]) continue;
        for(auto [v,w]:g[u]) if(cost[v]<=lim&&d+w<dist[v])
            dist[v]=d+w,pq.push({v,dist[v]});
    }
    return dist[n]<=b;
}
```

### 复杂度

$O(m\log n\log V)$。

---

## 41. [P5764 \[CQOI2005\] 新年好](https://www.luogu.com.cn/problem/P5764)

`Dijkstra` `枚举`

### 题意

从 `1` 号站出发，要拜访给定的 5 个亲戚所在站点，顺序任意，求总路程最短的方案。

### 分析

真正有意义的点只有家和 5 个亲戚。分别从这 6 个关键点跑 Dijkstra，得到两两最短路后，直接枚举 5! 种拜访顺序即可。

### 核心代码

```cpp
vector<int> key={1,a,b,c,d,e};
for(int i=0;i<6;i++) dijkstra(key[i],dis[i]);
sort(ord.begin(),ord.end());
do{
    long long cur=0,last=0;
    for(int x:ord) cur+=dis[last][x],last=x;
    ans=min(ans,cur);
}while(next_permutation(ord.begin(),ord.end()));
```

### 复杂度

$O(6m\log n+5!)$。

---

## 42. [P6822 \[PA 2012 Finals\] Tax](https://www.luogu.com.cn/problem/P6822)

`Dijkstra` `状态图`

### 题意

一条路径经过内部点的代价是进入边和离开边边权的较大值，起点只算第一条边，终点只算最后一条边。要求求出从 `1` 到 `n` 的最小总代价。

### 分析

代价取决于“上一条边的边权”，所以状态应放在有向边上。若当前是通过权值 `last` 的边来到 `u`，再走一条权值 `w` 的边去 `v`，新增代价就是 `max(last,w)`。

### 核心代码

```cpp
for(auto [v,w,id]:g[1]) dist[id]=w,pq.push({id,w});
while(!pq.empty()){
    auto [eid,d]=pq.top(); pq.pop();
    int u=to[eid], last=val[eid];
    for(auto [v,w,nid]:g[u]){
        long long nd=d+max(last,w);
        if(nd<dist[nid]) dist[nid]=nd,pq.push({nid,nd});
    }
}
```

### 复杂度

$O(m\log m)$。

---

## 43. [P11860 \[CCC 2025 Senior\] 熔岩路 / Floor is Lava](https://www.luogu.com.cn/problem/P11860)

`Dijkstra` `状态图` `建模`

### 题意

通过温度为 `c` 的隧道时，靴子的冷却等级必须恰好等于 `c`；在房间里可以花金币把冷却等级加减。要求求出从 `1` 到 `n` 的最小金币花费。

### 分析

真正有用的冷却等级只有各条隧道的温度。把每个房间与其 incident 隧道温度构成状态，房间内不同温度状态之间按差值连边，沿温度为 `c` 的隧道则在两端的 `c` 状态之间零代价转移。

### 核心代码

```cpp
for(int u=1;u<=n;u++){
    sort(tmp[u].begin(),tmp[u].end());
    for(int i=1;i<(int)tmp[u].size();i++){
        int a=id(u,i-1), b=id(u,i), d=tmp[u][i]-tmp[u][i-1];
        add(a,b,d), add(b,a,d);
    }
}
for(auto [u,v,c]:edges) add(pos[u][c],pos[v][c],0), add(pos[v][c],pos[u][c],0);
dijkstra(pos[1][0]);
```

### 复杂度

$O(m\log m)$。

---

## 44. [U262078 昂贵的聘礼](https://www.luogu.com.cn/problem/U262078)

`Dijkstra` `枚举` `最短路`

### 题意

每件物品可以直接用金币买，也可以先换来别的物品再降低价格；但所有交易对象的等级必须落在某个宽度受限的区间内。要求求出娶到酋长女儿所需的最少金币。

### 分析

等级限制意味着我们要先选定一个合法等级窗口。枚举所有包含目标物品等级的区间 `[L,L+m]`，仅保留窗口内的交易边，再从“金币源点”到目标物品跑最短路，取最小值。

### 核心代码

```cpp
for(int low=lv[1]-m;low<=lv[1];low++){
    int high=low+m;
    fill(dist,dist+n+1,INF); dist[0]=0;
    priority_queue<Node> pq; pq.push({0,0});
    while(!pq.empty()){
        auto [u,d]=pq.top(); pq.pop();
        if(d!=dist[u]) continue;
        for(auto [v,w]:g[u]) if(low<=lv[v]&&lv[v]<=high&&d+w<dist[v])
            dist[v]=d+w,pq.push({v,dist[v]});
    }
    ans=min(ans,dist[1]);
}
```

### 复杂度

$O(nm\log n)$。

---

## 45. [P1629 邮递员送信](https://www.luogu.com.cn/problem/P1629)

`Dijkstra` `反图` `最短路`

### 题意

邮递员要从 `1` 出发把邮件分别送到 `2\sim n`，并且每送完一件都要回到 `1`。给定单向道路，要求总耗时最小。

### 分析

总答案就是 `1` 到每个点的最短路之和，再加上每个点回到 `1` 的最短路之和。前者在原图上跑一次 Dijkstra，后者在反图上再跑一次即可。

### 核心代码

```cpp
dijkstra(1,g,dis1);
dijkstra(1,rg,dis2);
long long ans=0;
for(int i=2;i<=n;i++) ans+=dis1[i]+dis2[i];
```

### 复杂度

$O(m\log n)$。

---

## 46. [P1576 最小花费](https://www.luogu.com.cn/problem/P1576)

`Dijkstra` `乘法最短路`

### 题意

每条转账边都会扣掉一定百分比的手续费，要求计算最少需要转出多少钱，才能让终点账户实际收到 100 元。

### 分析

如果边的保留比例是 `p`，整条路径的到账比例就是若干 `p` 的乘积。于是问题变成最大化从 `A` 到 `B` 的乘积比例，可以直接跑“最大乘积版 Dijkstra”，最后输出 `100 / best[B]`。

### 核心代码

```cpp
priority_queue<pair<double,int>> pq;
best[A]=1.0; pq.push({1.0,A});
while(!pq.empty()){
    auto [r,u]=pq.top(); pq.pop();
    if(r<best[u]) continue;
    for(auto [v,p]:g[u]) if(best[v]<best[u]*p){
        best[v]=best[u]*p;
        pq.push({best[v],v});
    }
}
```

### 复杂度

$O(m\log n)$。

---

## 47. [P2886 \[USACO07NOV\] Cow Relays G](https://www.luogu.com.cn/problem/P2886)

`矩阵快速幂` `Floyd` `最短路`

### 题意

给定一张无向图，要求求出从 `S` 到 `E` 恰好经过 `N` 条边的最短路径长度。

### 分析

“恰好走 `N` 条边”非常适合 min-plus 矩阵快速幂。把邻接矩阵里的边权当成乘法半环的基础矩阵，做一次最小加法意义下的快速幂后读取 `S,E` 项即可。

### 核心代码

```cpp
Matrix mul(Matrix A,Matrix B){
    Matrix C(INF);
    for(int i=1;i<=tot;i++) for(int k=1;k<=tot;k++) if(A[i][k]<INF)
        for(int j=1;j<=tot;j++)
            C[i][j]=min(C[i][j],A[i][k]+B[k][j]);
    return C;
}
while(N){ if(N&1) ans=mul(ans,base); base=mul(base,base); N>>=1; }
```

### 复杂度

$O(tot^3\log N)$。

---

## 48. [P1522 \[USACO2.4\] 牛的旅行 Cow Tours](https://www.luogu.com.cn/problem/P1522)

`Floyd` `直径` `枚举`

### 题意

若干牧场构成多个连通块，现在允许额外连一条边。要求使新图的直径尽量小，并输出这个最小直径。

### 分析

先 Floyd 求每个连通块内部任意两点最短路，再求每个点的离心率与每个块的原直径。若连接不同连通块中的 `i,j`，新直径就是 `max(原直径, ecc[i]+|ij|+ecc[j])`，枚举取最小即可。

### 核心代码

```cpp
floyd();
for(int i=1;i<=n;i++) for(int j=1;j<=n;j++) if(dis[i][j]<INF)
    ecc[i]=max(ecc[i],dis[i][j]),dia[bel[i]]=max(dia[bel[i]],dis[i][j]);
for(int i=1;i<=n;i++) for(int j=1;j<=n;j++) if(dis[i][j]==INF)
    ans=min(ans,max({mx_dia,ecc[i]+calc(i,j)+ecc[j]}));
```

### 复杂度

$O(n^3)$。

---

## 49. [P4306 \[JSOI2010\] 连通数](https://www.luogu.com.cn/problem/P4306)

`Floyd` `bitset` `传递闭包`

### 题意

连通数定义为有向图中可达点对 `(u,v)` 的个数（包含 `u=v`）。给定图后要求输出它的连通数。

### 分析

本质就是求传递闭包后统计 1 的个数。由于点数不大但边数可能密，直接用 `bitset` 做布尔 Floyd，再把每一行的 `popcount` 累加即可。

### 核心代码

```cpp
for(int i=1;i<=n;i++) reach[i][i]=1;
for(int k=1;k<=n;k++)
    for(int i=1;i<=n;i++)
        if(reach[i][k]) reach[i]|=reach[k];
long long ans=0;
for(int i=1;i<=n;i++) ans+=reach[i].count();
```

### 复杂度

$O(\frac{n^3}{\omega})$。

---

## 50. [P1828 \[USACO3.2\] 香甜的黄油 Sweet Butter](https://www.luogu.com.cn/problem/P1828)

`Dijkstra` `最短路` `枚举`

### 题意

多头奶牛分布在不同牧场，要求选择一个牧场放糖，使所有奶牛走到那里所需的总距离最小。

### 分析

固定糖放在哪个牧场时，总成本就是所有奶牛到该点的最短路和。由于图是带权图，可以从每个候选牧场各跑一次 Dijkstra，并按奶牛出现次数累加贡献。

### 核心代码

```cpp
for(int s=1;s<=P;s++){
    dijkstra(s);
    long long cur=0;
    for(int i=1;i<=P;i++) cur+=1LL*cow_cnt[i]*dist[i];
    ans=min(ans,cur);
}
```

### 复杂度

$O(P(C+N)\log P)$。

---

## 51. [T478723 信使](https://www.luogu.com.cn/problem/T478723)

`Floyd` `最短路`

### 题意

指挥部在 `1` 号哨所，同时可以派出任意多名信使沿边传令。要求求出所有哨所都收到命令所需的最短时间。

### 分析

并行传播后，总时间就是 `1` 号点到所有点最短路中的最大值。点数较小时直接 Floyd，若存在不可达点则答案为 `-1`。

### 核心代码

```cpp
for(int k=1;k<=n;k++)
    for(int i=1;i<=n;i++)
        for(int j=1;j<=n;j++)
            dis[i][j]=min(dis[i][j],dis[i][k]+dis[k][j]);
int ans=0;
for(int i=1;i<=n;i++) ans=max(ans,dis[1][i]);
```

### 复杂度

$O(n^3)$。

---

## 52. [U167571 信使](https://www.luogu.com.cn/problem/U167571)

`Floyd` `最短路`

### 题意

题意与“信使”相同：指挥部在 `1` 号哨所，可以同时并行派信使，求最短多久能把命令传遍所有哨所。

### 分析

并行发送不会改变单个点收到信息的最短时间，所以答案仍是 `1` 到所有点最短路的最大值。直接 Floyd 或 Dijkstra 都可以，这里保留 Floyd 模板。

### 核心代码

```cpp
for(int k=1;k<=n;k++)
    for(int i=1;i<=n;i++)
        for(int j=1;j<=n;j++)
            dis[i][j]=min(dis[i][j],dis[i][k]+dis[k][j]);
for(int i=1;i<=n;i++) ans=max(ans,dis[1][i]);
```

### 复杂度

$O(n^3)$。

---

# 六、最短路模板与最小环

最后把 Johnson、SPFA、Floyd 模板和最小环问题收在一起，方便统一回看。

## 53. [P6175 无向图的最小环问题](https://www.luogu.com.cn/problem/P6175)

`Floyd` `最小环`

### 题意

给定一张无向带权图，要求输出最小简单环的长度；若图中不存在环则输出 `No solution.`。

### 分析

和前面的最小环题完全同模：枚举中转点 `k` 时，先用仅经过 `<k` 点的最短路 `dis[i][j]` 去更新 `i-j-k-i` 形成的环，再把 `k` 纳入 Floyd 转移。

### 核心代码

```cpp
int ans=INF;
for(int k=1;k<=n;k++){
    for(int i=1;i<k;i++) for(int j=i+1;j<k;j++)
        ans=min(ans,dis[i][j]+g[i][k]+g[k][j]);
    for(int i=1;i<=n;i++) for(int j=1;j<=n;j++)
        dis[i][j]=min(dis[i][j],dis[i][k]+dis[k][j]);
}
```

### 复杂度

$O(n^3)$。

---

## 54. [P5905 【模板】全源最短路（Johnson）](https://www.luogu.com.cn/problem/P5905)

`Johnson` `最短路模板`

### 题意

给定可能含负边但无负环的有向图，要求输出所有点对间的最短路长度。

### 分析

Johnson 先加超级源跑 Bellman-Ford / SPFA 求势能 `h`，把所有边重标成非负后，再从每个点出发跑一遍 Dijkstra。最后把结果减去势能差还原原图距离。

### 核心代码

```cpp
spfa(super);
for(auto &e:edges) e.w+=h[e.u]-h[e.v];
for(int s=1;s<=n;s++){
    dijkstra(s);
    for(int v=1;v<=n;v++)
        ans[s][v]=dis[v]-h[s]+h[v];
}
```

### 复杂度

$O(nm\log n)$。

---

## 55. [B3647 【模板】Floyd](https://www.luogu.com.cn/problem/B3647)

`Floyd` `模板`

### 题意

给定一张无向连通图，要求输出所有点对之间的最短路径长度。

### 分析

模板 Floyd：`dis[i][j]` 表示当前只允许经过前若干个点时的最短路，枚举中转点 `k` 做三重循环转移即可。

### 核心代码

```cpp
for(int k=1;k<=n;k++)
    for(int i=1;i<=n;i++)
        for(int j=1;j<=n;j++)
            dis[i][j]=min(dis[i][j],dis[i][k]+dis[k][j]);
```

### 复杂度

$O(n^3)$。

---

## 56. [P2910 \[USACO08OPEN\] Clear And Present Danger S](https://www.luogu.com.cn/problem/P2910)

`Floyd` `最短路`

### 题意

给定任意两岛之间直接航行的危险指数，以及必须按顺序经过的一串关键岛屿。要求求出满足顺序条件时的最小总危险指数。

### 分析

真正会影响答案的是关键岛屿之间的最短路距离。先 Floyd 求任意两点最短路，再把要求经过的序列按顺序相邻求和即可。

### 核心代码

```cpp
floyd();
long long ans=0;
for(int i=1;i<m;i++) ans+=dis[a[i]][a[i+1]];
cout<<ans;
```

### 复杂度

$O(n^3)$。

---

## 57. [P2888 \[USACO07NOV\] Cow Hurdles S](https://www.luogu.com.cn/problem/P2888)

`Floyd` `minimax`

### 题意

每条有向道路有一个栏杆高度，询问多次 `A\to B` 时，要求路径上最高栏杆尽量低，并输出这个最小可能高度。

### 分析

把最短路中的加法改成“路径最大边权”，转移改成 `dis[i][j]=min(dis[i][j],max(dis[i][k],dis[k][j]))`，就是 Floyd 的 minimax 版。

### 核心代码

```cpp
for(int k=1;k<=n;k++)
    for(int i=1;i<=n;i++)
        for(int j=1;j<=n;j++)
            dis[i][j]=min(dis[i][j],max(dis[i][k],dis[k][j]));
```

### 复杂度

$O(n^3)$。

---

## 58. [P2935 \[USACO09JAN\] Best Spot S](https://www.luogu.com.cn/problem/P2935)

`Floyd` `最短路` `枚举`

### 题意

给定若干头奶牛最喜欢的牧场，要求找一个牧场作为睡觉地点，使到所有这些喜欢牧场的平均路程最短。

### 分析

点数不大，先 Floyd 求出任意两点最短路。随后枚举每个候选牧场，累加到所有喜欢牧场的距离并取平均值最小的点即可。

### 核心代码

```cpp
floyd();
int ans=1, best=INF;
for(int i=1;i<=P;i++){
    int cur=0;
    for(int x:fav) cur+=dis[i][x];
    if(cur<best) best=cur,ans=i;
}
```

### 复杂度

$O(P^3)$。

---

## 59. [P3371 【模板】单源最短路径（弱化版）](https://www.luogu.com.cn/problem/P3371)

`SPFA` `最短路模板`

### 题意

给定一张有向图和源点，要求输出源点到每个点的最短路径长度（弱化版）。

### 分析

弱化版数据允许直接使用 SPFA 模板。队列里只放当前可能继续松弛其他点的节点，直到队列清空为止。

### 核心代码

```cpp
queue<int> q; q.push(s); inq[s]=1; dist[s]=0;
while(!q.empty()){
    int u=q.front(); q.pop(); inq[u]=0;
    for(auto [v,w]:g[u]) if(dist[v]>dist[u]+w){
        dist[v]=dist[u]+w;
        if(!inq[v]) inq[v]=1,q.push(v);
    }
}
```

### 复杂度

$O(km)$。

---

## 60. [P3385 【模板】负环](https://www.luogu.com.cn/problem/P3385)

`SPFA` `负环`

### 题意

给定带负边的图，要求判断图中是否存在可达负环。

### 分析

SPFA 判负环的关键是记录每个点被成功松弛的次数。若某个点入队次数达到 `n`，说明存在一条长度不少于 `n` 且还在继续变优的路径，也就等价于存在负环。

### 核心代码

```cpp
queue<int> q;
for(int i=1;i<=n;i++) q.push(i),inq[i]=1;
while(!q.empty()){
    int u=q.front(); q.pop(); inq[u]=0;
    for(auto [v,w]:g[u]) if(dist[v]>dist[u]+w){
        dist[v]=dist[u]+w; cnt[v]=cnt[u]+1;
        if(cnt[v]>=n) return puts("YES"),0;
        if(!inq[v]) inq[v]=1,q.push(v);
    }
}
```

### 复杂度

$O(km)$。

---

## 61. [P4779 【模板】单源最短路径（标准版）](https://www.luogu.com.cn/problem/P4779)

`Dijkstra` `模板`

### 题意

给定一张非负权有向图和源点，要求输出源点到所有点的最短路。

### 分析

标准堆优化 Dijkstra。优先队列中每次取出当前距离最小的未确定节点，用它去松弛所有出边即可。

### 核心代码

```cpp
priority_queue<Node> pq;
dist[s]=0; pq.push({s,0});
while(!pq.empty()){
    auto [u,d]=pq.top(); pq.pop();
    if(d!=dist[u]) continue;
    for(auto [v,w]:g[u]) if(dist[v]>d+w){
        dist[v]=d+w;
        pq.push({v,dist[v]});
    }
}
```

### 复杂度

$O(m\log n)$。

---
