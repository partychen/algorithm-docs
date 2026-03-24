---
title: "LeetCode 搜索专题精选解题报告"
subtitle: "🟢 36 道经典搜索题目的分析方法、解题思路与核心代码"
order: 3
icon: "🟢"
---

# LeetCode 搜索专题精选解题报告

> 来源：[LeetCode](https://leetcode.com/)。精选 36 道覆盖 DFS/回溯、BFS/最短路、Flood Fill、记忆化搜索、搜索剪枝及双向搜索的经典题目，按专题分类、难度递进编排，配合完整分析与核心代码。

---

## 1 - LeetCode 46 Permutations（DFS/回溯）

### 题意

给定一个**不含重复**数字的整数数组 `nums`，返回其所有可能的全排列。

### 分析

经典回溯模板题。每层递归从候选集中选一个未使用的数放入当前排列，当排列长度等于 $n$ 时收集答案。

### 搜索策略

- **状态**：当前排列 `path`、已使用标记 `used[]`
- **搜索方式**：DFS 回溯，每层遍历所有未使用元素
- **剪枝**：`used[i] == true` 时跳过
- **答案**：`path.size() == n` 时加入结果集

### 核心代码

```cpp
class Solution {
public:
    vector<vector<int>> res;
    void dfs(vector<int>& nums, vector<int>& path, vector<bool>& used) {
        if (path.size() == nums.size()) { res.push_back(path); return; }
        for (int i = 0; i < nums.size(); i++) {
            if (used[i]) continue;
            used[i] = true;
            path.push_back(nums[i]);
            dfs(nums, path, used);
            path.pop_back();
            used[i] = false;
        }
    }
    vector<vector<int>> permute(vector<int>& nums) {
        vector<int> path;
        vector<bool> used(nums.size(), false);
        dfs(nums, path, used);
        return res;
    }
};
```

### 复杂度

$O(n! \cdot n)$ 时间，$O(n)$ 递归栈空间。

---

## 2 - LeetCode 47 Permutations II（DFS/回溯）

### 题意

给定一个**可能含重复**数字的整数数组 `nums`，返回所有**不重复**的全排列。

### 分析

在 46 题基础上增加去重逻辑。先排序，使相同元素相邻；对于同一层递归中，若当前元素与前一个相同，且前一个在本层未被使用（即已回溯），则跳过，避免重复排列。

### 搜索策略

- **状态**：当前排列 `path`、已使用标记 `used[]`
- **搜索方式**：DFS 回溯，排序后逐位枚举
- **剪枝**：① `used[i] == true` 跳过 ② `nums[i] == nums[i-1] && !used[i-1]` 同层去重
- **答案**：`path.size() == n` 时加入结果集

### 核心代码

```cpp
class Solution {
public:
    vector<vector<int>> res;
    void dfs(vector<int>& nums, vector<int>& path, vector<bool>& used) {
        if (path.size() == nums.size()) { res.push_back(path); return; }
        for (int i = 0; i < nums.size(); i++) {
            if (used[i]) continue;
            if (i > 0 && nums[i] == nums[i - 1] && !used[i - 1]) continue;
            used[i] = true;
            path.push_back(nums[i]);
            dfs(nums, path, used);
            path.pop_back();
            used[i] = false;
        }
    }
    vector<vector<int>> permuteUnique(vector<int>& nums) {
        sort(nums.begin(), nums.end());
        vector<int> path;
        vector<bool> used(nums.size(), false);
        dfs(nums, path, used);
        return res;
    }
};
```

### 复杂度

$O(n! \cdot n)$ 时间，$O(n)$ 空间。

---

## 3 - LeetCode 78 Subsets（DFS/回溯）

### 题意

给定一个**不含重复**元素的整数数组 `nums`，返回其所有子集（幂集）。

### 分析

子集枚举的经典回溯写法。每个元素有"选"或"不选"两种决策，等价于从索引 `start` 开始依次选取后续元素。每次递归调用时，当前 `path` 即为一个合法子集。

### 搜索策略

- **状态**：当前子集 `path`、起始索引 `start`
- **搜索方式**：DFS 回溯，`for i in [start, n)` 选取元素
- **剪枝**：通过 `start` 保证只选后续元素，避免重复
- **答案**：每个递归节点的 `path` 都是一个子集

### 核心代码

```cpp
class Solution {
public:
    vector<vector<int>> res;
    void dfs(vector<int>& nums, int start, vector<int>& path) {
        res.push_back(path);
        for (int i = start; i < nums.size(); i++) {
            path.push_back(nums[i]);
            dfs(nums, i + 1, path);
            path.pop_back();
        }
    }
    vector<vector<int>> subsets(vector<int>& nums) {
        vector<int> path;
        dfs(nums, 0, path);
        return res;
    }
};
```

### 复杂度

$O(2^n \cdot n)$ 时间，$O(n)$ 递归栈空间。

---

## 4 - LeetCode 90 Subsets II（DFS/回溯）

### 题意

给定一个**可能含重复**元素的整数数组 `nums`，返回所有**不重复**的子集。

### 分析

在 78 题基础上加去重。排序后，在同一层循环中跳过与前一个相同的元素，保证同一层不会选取两次相同值。

### 搜索策略

- **状态**：当前子集 `path`、起始索引 `start`
- **搜索方式**：DFS 回溯，排序后依次枚举
- **剪枝**：`i > start && nums[i] == nums[i-1]` 跳过同层重复
- **答案**：每个递归节点的 `path` 都是一个子集

### 核心代码

```cpp
class Solution {
public:
    vector<vector<int>> res;
    void dfs(vector<int>& nums, int start, vector<int>& path) {
        res.push_back(path);
        for (int i = start; i < nums.size(); i++) {
            if (i > start && nums[i] == nums[i - 1]) continue;
            path.push_back(nums[i]);
            dfs(nums, i + 1, path);
            path.pop_back();
        }
    }
    vector<vector<int>> subsetsWithDup(vector<int>& nums) {
        sort(nums.begin(), nums.end());
        vector<int> path;
        dfs(nums, 0, path);
        return res;
    }
};
```

### 复杂度

$O(2^n \cdot n)$ 时间，$O(n)$ 空间。

---

## 5 - LeetCode 39 Combination Sum（DFS/回溯）

### 题意

给定一个**无重复**正整数数组 `candidates` 和目标值 `target`，找出所有和为 `target` 的组合。**同一个数字可以被无限次选取**。

### 分析

与子集枚举类似，但每个元素可重复使用。递归时从当前索引 `i`（而非 `i+1`）继续选取，保证可重复选且组合不重复。当剩余目标值为 0 时收集答案。

### 搜索策略

- **状态**：当前组合 `path`、剩余目标 `remain`、起始索引 `start`
- **搜索方式**：DFS 回溯，允许重复选取当前元素
- **剪枝**：`remain < 0` 时回溯；排序后 `candidates[i] > remain` 可提前退出循环
- **答案**：`remain == 0` 时加入结果集

### 核心代码

```cpp
class Solution {
public:
    vector<vector<int>> res;
    void dfs(vector<int>& cand, int start, int remain, vector<int>& path) {
        if (remain == 0) { res.push_back(path); return; }
        for (int i = start; i < cand.size(); i++) {
            if (cand[i] > remain) break;
            path.push_back(cand[i]);
            dfs(cand, i, remain - cand[i], path);
            path.pop_back();
        }
    }
    vector<vector<int>> combinationSum(vector<int>& candidates, int target) {
        sort(candidates.begin(), candidates.end());
        vector<int> path;
        dfs(candidates, 0, target, path);
        return res;
    }
};
```

### 复杂度

时间复杂度取决于搜索树节点数，最坏 $O(n^{T/\min})$；$O(T/\min)$ 递归栈空间，其中 $T$ 为 `target`，$\min$ 为最小候选值。

---

## 6 - LeetCode 40 Combination Sum II（DFS/回溯）

### 题意

给定一个**可能含重复**数字的候选数组 `candidates` 和目标值 `target`，找出所有和为 `target` 的组合。**每个数字只能使用一次**。

### 分析

39 题 + 去重。排序后递归下一层从 `i+1` 开始（不可重复选取），同层中相同值跳过。

### 搜索策略

- **状态**：当前组合 `path`、剩余目标 `remain`、起始索引 `start`
- **搜索方式**：DFS 回溯，每个元素至多选一次
- **剪枝**：① `cand[i] > remain` 提前退出 ② `i > start && cand[i] == cand[i-1]` 同层去重
- **答案**：`remain == 0` 时加入结果集

### 核心代码

```cpp
class Solution {
public:
    vector<vector<int>> res;
    void dfs(vector<int>& cand, int start, int remain, vector<int>& path) {
        if (remain == 0) { res.push_back(path); return; }
        for (int i = start; i < cand.size(); i++) {
            if (cand[i] > remain) break;
            if (i > start && cand[i] == cand[i - 1]) continue;
            path.push_back(cand[i]);
            dfs(cand, i + 1, remain - cand[i], path);
            path.pop_back();
        }
    }
    vector<vector<int>> combinationSum2(vector<int>& candidates, int target) {
        sort(candidates.begin(), candidates.end());
        vector<int> path;
        dfs(candidates, 0, target, path);
        return res;
    }
};
```

### 复杂度

$O(2^n \cdot n)$ 时间，$O(n)$ 空间。

---

## 7 - LeetCode 77 Combinations（DFS/回溯）

### 题意

给定 $n$ 和 $k$，返回 $[1, n]$ 中所有大小为 $k$ 的组合。

### 分析

标准组合枚举。从 `start` 开始依次选数，当已选 $k$ 个时收集答案。可以利用剩余元素不足的条件提前剪枝。

### 搜索策略

- **状态**：当前组合 `path`、起始值 `start`
- **搜索方式**：DFS 回溯，`for i in [start, n]`
- **剪枝**：`n - i + 1 < k - path.size()` 时剩余元素不够，提前返回
- **答案**：`path.size() == k` 时加入结果集

### 核心代码

```cpp
class Solution {
public:
    vector<vector<int>> res;
    void dfs(int n, int k, int start, vector<int>& path) {
        if ((int)path.size() == k) { res.push_back(path); return; }
        for (int i = start; i <= n - (k - (int)path.size()) + 1; i++) {
            path.push_back(i);
            dfs(n, k, i + 1, path);
            path.pop_back();
        }
    }
    vector<vector<int>> combine(int n, int k) {
        vector<int> path;
        dfs(n, k, 1, path);
        return res;
    }
};
```

### 复杂度

$O(\binom{n}{k} \cdot k)$ 时间，$O(k)$ 递归栈空间。

---

## 8 - LeetCode 17 Letter Combinations of a Phone Number（DFS/回溯）

### 题意

给定一个仅包含 `2-9` 的数字字符串 `digits`，返回所有可能的字母组合（按电话键盘映射）。

### 分析

逐位枚举当前数字对应的所有字母，DFS 拼接。每层递归处理一个数字，分支数为该数字对应的字母数（3 或 4）。

### 搜索策略

- **状态**：当前构造的字符串 `path`、处理到第 `idx` 个数字
- **搜索方式**：DFS 回溯，对每个数字尝试其对应的全部字母
- **剪枝**：无特别剪枝
- **答案**：`idx == digits.size()` 时加入结果集

### 核心代码

```cpp
class Solution {
public:
    const string mapping[10] = {"","","abc","def","ghi","jkl","mno","pqrs","tuv","wxyz"};
    vector<string> res;
    void dfs(string& digits, int idx, string& path) {
        if (idx == digits.size()) { res.push_back(path); return; }
        for (char c : mapping[digits[idx] - '0']) {
            path.push_back(c);
            dfs(digits, idx + 1, path);
            path.pop_back();
        }
    }
    vector<string> letterCombinations(string digits) {
        if (digits.empty()) return {};
        string path;
        dfs(digits, 0, path);
        return res;
    }
};
```

### 复杂度

$O(4^n \cdot n)$ 时间（$n$ 为数字个数），$O(n)$ 递归栈空间。

---

## 9 - LeetCode 22 Generate Parentheses（DFS/回溯）

### 题意

给定 $n$，生成所有由 $n$ 对括号组成的合法组合。

### 分析

DFS 逐字符构造。维护已使用的左括号数 `open` 和右括号数 `close`，合法条件为：任意前缀中左括号数 $\ge$ 右括号数。当 `open < n` 时可加左括号，当 `close < open` 时可加右括号。

### 搜索策略

- **状态**：当前字符串 `path`、已用左括号数 `open`、已用右括号数 `close`
- **搜索方式**：DFS 回溯，两个分支（加左或加右）
- **剪枝**：只在合法条件下递归
- **答案**：`path.size() == 2n` 时加入结果集

### 核心代码

```cpp
class Solution {
public:
    vector<string> res;
    void dfs(int n, int open, int close, string& path) {
        if ((int)path.size() == 2 * n) { res.push_back(path); return; }
        if (open < n) {
            path.push_back('(');
            dfs(n, open + 1, close, path);
            path.pop_back();
        }
        if (close < open) {
            path.push_back(')');
            dfs(n, open, close + 1, path);
            path.pop_back();
        }
    }
    vector<string> generateParenthesis(int n) {
        string path;
        dfs(n, 0, 0, path);
        return res;
    }
};
```

### 复杂度

$O\!\left(\frac{4^n}{\sqrt{n}}\right)$ 时间（第 $n$ 个卡特兰数），$O(n)$ 空间。

---

## 10 - LeetCode 51 N-Queens（DFS/回溯）

### 题意

将 $n$ 个皇后放在 $n \times n$ 棋盘上，使得彼此不能互相攻击（不同行、不同列、不同对角线）。返回所有不同的解。

### 分析

逐行放置皇后。第 $r$ 行尝试每一列 $c$，检查列冲突和两条对角线冲突。使用三个集合分别记录已占用的列、主对角线 $(r-c)$ 和副对角线 $(r+c)$。

### 搜索策略

- **状态**：当前行 `row`、已放置皇后的列集合 `cols`、主对角线集合 `diag1`、副对角线集合 `diag2`
- **搜索方式**：DFS 逐行枚举列
- **剪枝**：列/对角线冲突时跳过
- **答案**：`row == n` 时构造棋盘字符串加入结果集

### 核心代码

```cpp
class Solution {
public:
    vector<vector<string>> res;
    void dfs(int n, int row, vector<int>& queens,
             vector<bool>& cols, vector<bool>& d1, vector<bool>& d2) {
        if (row == n) {
            vector<string> board(n, string(n, '.'));
            for (int i = 0; i < n; i++) board[i][queens[i]] = 'Q';
            res.push_back(board);
            return;
        }
        for (int c = 0; c < n; c++) {
            if (cols[c] || d1[row - c + n - 1] || d2[row + c]) continue;
            queens[row] = c;
            cols[c] = d1[row - c + n - 1] = d2[row + c] = true;
            dfs(n, row + 1, queens, cols, d1, d2);
            cols[c] = d1[row - c + n - 1] = d2[row + c] = false;
        }
    }
    vector<vector<string>> solveNQueens(int n) {
        vector<int> queens(n);
        vector<bool> cols(n, false), d1(2 * n - 1, false), d2(2 * n - 1, false);
        dfs(n, 0, queens, cols, d1, d2);
        return res;
    }
};
```

### 复杂度

$O(n!)$ 时间，$O(n^2)$ 空间（输出棋盘）。

---

## 11 - LeetCode 37 Sudoku Solver（DFS/回溯）

### 题意

填充一个 $9 \times 9$ 数独，使得每行、每列和每个 $3 \times 3$ 宫格内数字 $1$–$9$ 各出现恰好一次。`.` 表示空格。

### 分析

逐格枚举空位，尝试 $1$–$9$，利用行/列/宫格约束剪枝。找到第一个合法解后立即停止。

### 搜索策略

- **状态**：当前填充位置 $(r, c)$、行/列/宫格的数字占用记录
- **搜索方式**：DFS 逐格填写，找到下一个空格递归
- **剪枝**：行/列/宫格已存在该数字时跳过
- **答案**：所有空格填满即为解

### 核心代码

```cpp
class Solution {
public:
    bool row[9][9], col[9][9], box[9][9];
    bool dfs(vector<vector<char>>& board) {
        for (int i = 0; i < 9; i++)
            for (int j = 0; j < 9; j++) {
                if (board[i][j] != '.') continue;
                for (int d = 0; d < 9; d++) {
                    if (row[i][d] || col[j][d] || box[i/3*3+j/3][d]) continue;
                    board[i][j] = '1' + d;
                    row[i][d] = col[j][d] = box[i/3*3+j/3][d] = true;
                    if (dfs(board)) return true;
                    board[i][j] = '.';
                    row[i][d] = col[j][d] = box[i/3*3+j/3][d] = false;
                }
                return false;
            }
        return true;
    }
    void solveSudoku(vector<vector<char>>& board) {
        memset(row, false, sizeof row);
        memset(col, false, sizeof col);
        memset(box, false, sizeof box);
        for (int i = 0; i < 9; i++)
            for (int j = 0; j < 9; j++)
                if (board[i][j] != '.') {
                    int d = board[i][j] - '1';
                    row[i][d] = col[j][d] = box[i/3*3+j/3][d] = true;
                }
        dfs(board);
    }
};
```

### 复杂度

最坏 $O(9^{81})$，实际约束剪枝后极快；$O(81)$ 空间。

---

## 12 - LeetCode 79 Word Search（DFS/回溯）

### 题意

给定 $m \times n$ 字符网格 `board` 和一个单词 `word`，判断 `word` 是否存在于网格中。字母必须通过水平或垂直相邻的格子连成，且同一格子不能重复使用。

### 分析

以每个格子为起点进行 DFS。逐字符匹配，四方向扩展，通过标记已访问防止重复使用同一格。

### 搜索策略

- **状态**：当前位置 $(r, c)$、匹配到单词第 `idx` 个字符
- **搜索方式**：DFS 四方向回溯
- **剪枝**：越界 / 已访问 / 字符不匹配时回溯
- **答案**：`idx == word.size()` 时返回 `true`

### 核心代码

```cpp
class Solution {
public:
    int dx[4] = {0,0,1,-1}, dy[4] = {1,-1,0,0};
    bool dfs(vector<vector<char>>& board, string& word, int r, int c, int idx) {
        if (idx == (int)word.size()) return true;
        if (r < 0 || r >= (int)board.size() || c < 0 || c >= (int)board[0].size()) return false;
        if (board[r][c] != word[idx]) return false;
        char tmp = board[r][c];
        board[r][c] = '#';
        for (int d = 0; d < 4; d++)
            if (dfs(board, word, r + dx[d], c + dy[d], idx + 1)) return true;
        board[r][c] = tmp;
        return false;
    }
    bool exist(vector<vector<char>>& board, string word) {
        for (int i = 0; i < (int)board.size(); i++)
            for (int j = 0; j < (int)board[0].size(); j++)
                if (dfs(board, word, i, j, 0)) return true;
        return false;
    }
};
```

### 复杂度

$O(m \cdot n \cdot 3^L)$ 时间（$L$ 为单词长度，每步最多 3 个方向），$O(L)$ 递归栈空间。

---

## 13 - LeetCode 127 Word Ladder（BFS/最短路）

### 题意

给定 `beginWord`、`endWord` 和单词列表 `wordList`，每次只能改变一个字母，求从 `beginWord` 到 `endWord` 的最短转换序列的**长度**。所有中间单词必须在 `wordList` 中。

### 分析

将每个单词视为图中节点，相差一个字母的单词之间连边。BFS 求从 `beginWord` 到 `endWord` 的最短路径。为高效枚举邻居，对当前单词的每一位尝试替换为 `a`–`z`，检查是否在字典集合中。

### 搜索策略

- **状态**：当前单词
- **搜索方式**：BFS 逐层扩展
- **剪枝**：已访问单词从集合中移除
- **答案**：首次到达 `endWord` 时的层数

### 核心代码

```cpp
class Solution {
public:
    int ladderLength(string beginWord, string endWord, vector<string>& wordList) {
        unordered_set<string> dict(wordList.begin(), wordList.end());
        if (!dict.count(endWord)) return 0;
        queue<string> q;
        q.push(beginWord);
        dict.erase(beginWord);
        int steps = 1;
        while (!q.empty()) {
            int sz = q.size();
            while (sz--) {
                string cur = q.front(); q.pop();
                if (cur == endWord) return steps;
                for (int i = 0; i < (int)cur.size(); i++) {
                    char orig = cur[i];
                    for (char c = 'a'; c <= 'z'; c++) {
                        cur[i] = c;
                        if (dict.count(cur)) {
                            dict.erase(cur);
                            q.push(cur);
                        }
                    }
                    cur[i] = orig;
                }
            }
            steps++;
        }
        return 0;
    }
};
```

### 复杂度

$O(N \cdot L \cdot 26)$ 时间，$O(N \cdot L)$ 空间，其中 $N$ 为单词数，$L$ 为单词长度。

---

## 14 - LeetCode 542 01 Matrix（BFS/最短路）

### 题意

给定一个 $m \times n$ 的 0-1 矩阵 `mat`，求每个格子到最近的 `0` 的距离。

### 分析

**多源 BFS**。将所有值为 `0` 的格子同时作为源点入队，逐层向外扩展。首次到达值为 `1` 的格子时记录的层数即为其到最近 `0` 的距离。

### 搜索策略

- **状态**：$(r, c)$ — 当前格子
- **搜索方式**：多源 BFS，四方向扩展
- **剪枝**：`dist[r][c] != -1` 时跳过（已计算）
- **答案**：`dist` 矩阵

### 核心代码

```cpp
class Solution {
public:
    vector<vector<int>> updateMatrix(vector<vector<int>>& mat) {
        int m = mat.size(), n = mat[0].size();
        vector<vector<int>> dist(m, vector<int>(n, -1));
        queue<pair<int,int>> q;
        for (int i = 0; i < m; i++)
            for (int j = 0; j < n; j++)
                if (mat[i][j] == 0) { dist[i][j] = 0; q.push({i, j}); }
        int dx[] = {0,0,1,-1}, dy[] = {1,-1,0,0};
        while (!q.empty()) {
            auto [r, c] = q.front(); q.pop();
            for (int d = 0; d < 4; d++) {
                int nr = r + dx[d], nc = c + dy[d];
                if (nr < 0 || nr >= m || nc < 0 || nc >= n) continue;
                if (dist[nr][nc] != -1) continue;
                dist[nr][nc] = dist[r][c] + 1;
                q.push({nr, nc});
            }
        }
        return dist;
    }
};
```

### 复杂度

$O(mn)$ 时间，$O(mn)$ 空间。

---

## 15 - LeetCode 994 Rotting Oranges（BFS/最短路）

### 题意

$m \times n$ 网格中，`0` 为空，`1` 为新鲜橘子，`2` 为腐烂橘子。每分钟腐烂橘子的四邻居新鲜橘子会腐烂。求所有橘子腐烂的最少分钟数，若无法全部腐烂则返回 $-1$。

### 分析

多源 BFS。所有初始腐烂橘子同时入队，逐层扩展（每层为一分钟）。BFS 结束后检查是否还有新鲜橘子。

### 搜索策略

- **状态**：$(r, c)$ — 当前格子
- **搜索方式**：多源 BFS，四方向扩展
- **剪枝**：只向值为 `1` 的格子扩展
- **答案**：BFS 层数即为时间，最后检查残余新鲜橘子

### 核心代码

```cpp
class Solution {
public:
    int orangesRotting(vector<vector<int>>& grid) {
        int m = grid.size(), n = grid[0].size(), fresh = 0, time = 0;
        queue<pair<int,int>> q;
        for (int i = 0; i < m; i++)
            for (int j = 0; j < n; j++) {
                if (grid[i][j] == 2) q.push({i, j});
                else if (grid[i][j] == 1) fresh++;
            }
        int dx[] = {0,0,1,-1}, dy[] = {1,-1,0,0};
        while (!q.empty() && fresh > 0) {
            int sz = q.size();
            while (sz--) {
                auto [r, c] = q.front(); q.pop();
                for (int d = 0; d < 4; d++) {
                    int nr = r + dx[d], nc = c + dy[d];
                    if (nr < 0 || nr >= m || nc < 0 || nc >= n) continue;
                    if (grid[nr][nc] != 1) continue;
                    grid[nr][nc] = 2;
                    fresh--;
                    q.push({nr, nc});
                }
            }
            time++;
        }
        return fresh == 0 ? time : -1;
    }
};
```

### 复杂度

$O(mn)$ 时间，$O(mn)$ 空间。

---

## 16 - LeetCode 752 Open the Lock（BFS/最短路）

### 题意

四位密码锁初始为 `"0000"`，每次可将一位拨动 $\pm 1$（`0` 和 `9` 循环相连）。给定一组"死亡数字" `deadends`，求到达 `target` 的最少步数。若无法到达返回 $-1$。

### 分析

将每个四位状态视为图的节点，每步可转 8 个邻居。BFS 从 `"0000"` 出发求最短路，跳过死亡状态。

### 搜索策略

- **状态**：当前四位字符串
- **搜索方式**：BFS 逐层扩展，每层 8 个邻居
- **剪枝**：死亡状态和已访问状态跳过
- **答案**：首次到达 `target` 时的步数

### 核心代码

```cpp
class Solution {
public:
    int openLock(vector<string>& deadends, string target) {
        unordered_set<string> dead(deadends.begin(), deadends.end());
        if (dead.count("0000")) return -1;
        queue<string> q;
        unordered_set<string> visited;
        q.push("0000"); visited.insert("0000");
        int steps = 0;
        while (!q.empty()) {
            int sz = q.size();
            while (sz--) {
                string cur = q.front(); q.pop();
                if (cur == target) return steps;
                for (int i = 0; i < 4; i++) {
                    for (int delta : {1, -1}) {
                        string next = cur;
                        next[i] = (cur[i] - '0' + delta + 10) % 10 + '0';
                        if (!dead.count(next) && !visited.count(next)) {
                            visited.insert(next);
                            q.push(next);
                        }
                    }
                }
            }
            steps++;
        }
        return -1;
    }
};
```

### 复杂度

$O(10^4 \cdot 4)$ 时间，$O(10^4)$ 空间。

---

## 17 - LeetCode 773 Sliding Puzzle（BFS/最短路）

### 题意

$2 \times 3$ 滑动拼图，初始给定棋盘，目标状态为 `[[1,2,3],[4,5,0]]`。每次可以将 `0`（空格）与上下左右相邻格子交换。求最少移动次数到达目标状态，不可达返回 $-1$。

### 分析

状态空间有限（$6! = 720$ 种），将棋盘序列化为字符串后 BFS 搜索。每步枚举空格与邻居的交换。

### 搜索策略

- **状态**：棋盘序列化字符串
- **搜索方式**：BFS 逐层扩展
- **剪枝**：已访问状态跳过
- **答案**：首次到达目标状态的层数

### 核心代码

```cpp
class Solution {
public:
    int slidingPuzzle(vector<vector<int>>& board) {
        string start, target = "123450";
        for (auto& row : board) for (int x : row) start += to_string(x);
        if (start == target) return 0;
        // 一维索引的邻接表
        vector<vector<int>> neighbors = {{1,3},{0,2,4},{1,5},{0,4},{1,3,5},{2,4}};
        queue<string> q;
        unordered_set<string> visited;
        q.push(start); visited.insert(start);
        int steps = 0;
        while (!q.empty()) {
            steps++;
            int sz = q.size();
            while (sz--) {
                string cur = q.front(); q.pop();
                int pos = cur.find('0');
                for (int nb : neighbors[pos]) {
                    string next = cur;
                    swap(next[pos], next[nb]);
                    if (next == target) return steps;
                    if (!visited.count(next)) {
                        visited.insert(next);
                        q.push(next);
                    }
                }
            }
        }
        return -1;
    }
};
```

### 复杂度

$O(6! \cdot 6)$ 时间，$O(6!)$ 空间。

---

## 18 - LeetCode 1091 Shortest Path in Binary Matrix（BFS/最短路）

### 题意

$n \times n$ 的 0-1 网格，`0` 为通路，`1` 为障碍。求从左上角 $(0,0)$ 到右下角 $(n-1,n-1)$ 的最短路径长度，可以八方向移动。路径长度以格子数计。不可达返回 $-1$。

### 分析

BFS 求八方向无权图最短路。从左上角出发逐层扩展，首次到达右下角时返回层数 $+1$。

### 搜索策略

- **状态**：$(r, c)$ — 当前格子
- **搜索方式**：BFS 八方向扩展
- **剪枝**：越界 / 值为 `1` / 已访问 时跳过
- **答案**：首次到达 $(n-1, n-1)$ 的路径长度

### 核心代码

```cpp
class Solution {
public:
    int shortestPathBinaryMatrix(vector<vector<int>>& grid) {
        int n = grid.size();
        if (grid[0][0] || grid[n-1][n-1]) return -1;
        queue<pair<int,int>> q;
        q.push({0, 0}); grid[0][0] = 1;
        int len = 1;
        while (!q.empty()) {
            int sz = q.size();
            while (sz--) {
                auto [r, c] = q.front(); q.pop();
                if (r == n - 1 && c == n - 1) return len;
                for (int dr = -1; dr <= 1; dr++)
                    for (int dc = -1; dc <= 1; dc++) {
                        if (dr == 0 && dc == 0) continue;
                        int nr = r + dr, nc = c + dc;
                        if (nr < 0 || nr >= n || nc < 0 || nc >= n) continue;
                        if (grid[nr][nc]) continue;
                        grid[nr][nc] = 1;
                        q.push({nr, nc});
                    }
            }
            len++;
        }
        return -1;
    }
};
```

### 复杂度

$O(n^2)$ 时间，$O(n^2)$ 空间。

---

## 19 - LeetCode 934 Shortest Bridge（BFS/最短路）

### 题意

$n \times n$ 的 0-1 网格中恰好有两个岛（`1` 的连通区域）。求连接两个岛所需翻转的最少 `0` 的数目（即两岛之间的最短距离）。

### 分析

先用 DFS/BFS 找到第一个岛并标记，将其所有边界格子入队；然后从这些边界格子出发做 BFS 向外扩展，首次触碰到第二个岛时的层数就是答案。

### 搜索策略

- **状态**：$(r, c)$ — 当前格子
- **搜索方式**：① DFS 标记第一个岛 ② 多源 BFS 扩展求最短距离
- **剪枝**：已标记格子跳过
- **答案**：BFS 首次触碰第二个岛的层数

### 核心代码

```cpp
class Solution {
public:
    int dx[4] = {0,0,1,-1}, dy[4] = {1,-1,0,0};
    void dfs(vector<vector<int>>& grid, int r, int c, queue<pair<int,int>>& q) {
        int n = grid.size();
        if (r < 0 || r >= n || c < 0 || c >= n || grid[r][c] != 1) return;
        grid[r][c] = 2;
        q.push({r, c});
        for (int d = 0; d < 4; d++) dfs(grid, r + dx[d], c + dy[d], q);
    }
    int shortestBridge(vector<vector<int>>& grid) {
        int n = grid.size();
        queue<pair<int,int>> q;
        bool found = false;
        for (int i = 0; i < n && !found; i++)
            for (int j = 0; j < n && !found; j++)
                if (grid[i][j] == 1) { dfs(grid, i, j, q); found = true; }
        int steps = 0;
        while (!q.empty()) {
            int sz = q.size();
            while (sz--) {
                auto [r, c] = q.front(); q.pop();
                for (int d = 0; d < 4; d++) {
                    int nr = r + dx[d], nc = c + dy[d];
                    if (nr < 0 || nr >= n || nc < 0 || nc >= n || grid[nr][nc] == 2) continue;
                    if (grid[nr][nc] == 1) return steps;
                    grid[nr][nc] = 2;
                    q.push({nr, nc});
                }
            }
            steps++;
        }
        return -1;
    }
};
```

### 复杂度

$O(n^2)$ 时间，$O(n^2)$ 空间。

---

## 20 - LeetCode 200 Number of Islands（Flood Fill/连通性）

### 题意

给定 $m \times n$ 的字符网格 `grid`，`'1'` 为陆地，`'0'` 为水域。计算岛屿数量（水平/垂直相邻的陆地连成一个岛）。

### 分析

遍历网格，遇到 `'1'` 时答案加一，并用 DFS/BFS 将与之相连的所有陆地标记为已访问（如改为 `'0'`），避免重复计数。

### 搜索策略

- **状态**：$(r, c)$ — 当前格子
- **搜索方式**：DFS / BFS Flood Fill
- **剪枝**：越界 / 已标记 / 水域 跳过
- **答案**：触发 Flood Fill 的次数

### 核心代码

```cpp
class Solution {
public:
    void dfs(vector<vector<char>>& grid, int r, int c) {
        if (r < 0 || r >= (int)grid.size() || c < 0 || c >= (int)grid[0].size()) return;
        if (grid[r][c] != '1') return;
        grid[r][c] = '0';
        dfs(grid, r+1, c); dfs(grid, r-1, c);
        dfs(grid, r, c+1); dfs(grid, r, c-1);
    }
    int numIslands(vector<vector<char>>& grid) {
        int cnt = 0;
        for (int i = 0; i < (int)grid.size(); i++)
            for (int j = 0; j < (int)grid[0].size(); j++)
                if (grid[i][j] == '1') { cnt++; dfs(grid, i, j); }
        return cnt;
    }
};
```

### 复杂度

$O(mn)$ 时间，$O(mn)$ 递归栈空间（最坏情况）。

---

## 21 - LeetCode 130 Surrounded Regions（Flood Fill/连通性）

### 题意

$m \times n$ 的矩阵中包含 `'X'` 和 `'O'`。将所有被 `'X'` 完全包围的 `'O'` 区域翻转为 `'X'`。边界上的 `'O'` 不会被翻转。

### 分析

反向思维：从边界上的 `'O'` 出发做 DFS/BFS 标记所有与边界相连的 `'O'`（安全区域），然后将未标记的 `'O'` 翻转为 `'X'`。

### 搜索策略

- **状态**：$(r, c)$ — 当前格子
- **搜索方式**：从四条边界的 `'O'` 出发 DFS Flood Fill
- **剪枝**：越界 / 非 `'O'` 跳过
- **答案**：最后遍历矩阵，标记过的恢复为 `'O'`，其余 `'O'` 变为 `'X'`

### 核心代码

```cpp
class Solution {
public:
    void dfs(vector<vector<char>>& board, int r, int c) {
        int m = board.size(), n = board[0].size();
        if (r < 0 || r >= m || c < 0 || c >= n || board[r][c] != 'O') return;
        board[r][c] = '#';
        dfs(board, r+1, c); dfs(board, r-1, c);
        dfs(board, r, c+1); dfs(board, r, c-1);
    }
    void solve(vector<vector<char>>& board) {
        int m = board.size(), n = board[0].size();
        for (int i = 0; i < m; i++) { dfs(board, i, 0); dfs(board, i, n-1); }
        for (int j = 0; j < n; j++) { dfs(board, 0, j); dfs(board, m-1, j); }
        for (int i = 0; i < m; i++)
            for (int j = 0; j < n; j++) {
                if (board[i][j] == '#') board[i][j] = 'O';
                else if (board[i][j] == 'O') board[i][j] = 'X';
            }
    }
};
```

### 复杂度

$O(mn)$ 时间，$O(mn)$ 空间。

---

## 22 - LeetCode 417 Pacific Atlantic Water Flow（Flood Fill/连通性）

### 题意

$m \times n$ 矩阵表示每个格子的海拔高度。水可以从高处流向相邻（四方向）的等高或更低处。左边界和上边界连接太平洋，右边界和下边界连接大西洋。求所有同时能流向两个大洋的格子坐标。

### 分析

正向搜索（从每个格子出发看能否到边界）太慢。**反向搜索**：从太平洋边界出发做 DFS/BFS，标记所有能被太平洋"倒流"到达的格子（向高处走）；同理从大西洋边界出发。两个标记都有的格子即为答案。

### 搜索策略

- **状态**：$(r, c)$ — 当前格子
- **搜索方式**：两次 DFS/BFS，从边界向内逆流（只走 $\ge$ 当前值的邻居）
- **剪枝**：已标记 / 邻居高度不足 跳过
- **答案**：两次标记的交集

### 核心代码

```cpp
class Solution {
public:
    int m, n;
    void dfs(vector<vector<int>>& heights, vector<vector<bool>>& vis, int r, int c) {
        vis[r][c] = true;
        int dx[] = {0,0,1,-1}, dy[] = {1,-1,0,0};
        for (int d = 0; d < 4; d++) {
            int nr = r + dx[d], nc = c + dy[d];
            if (nr < 0 || nr >= m || nc < 0 || nc >= n) continue;
            if (vis[nr][nc] || heights[nr][nc] < heights[r][c]) continue;
            dfs(heights, vis, nr, nc);
        }
    }
    vector<vector<int>> pacificAtlantic(vector<vector<int>>& heights) {
        m = heights.size(); n = heights[0].size();
        vector<vector<bool>> pac(m, vector<bool>(n)), atl(m, vector<bool>(n));
        for (int i = 0; i < m; i++) { dfs(heights, pac, i, 0); dfs(heights, atl, i, n-1); }
        for (int j = 0; j < n; j++) { dfs(heights, pac, 0, j); dfs(heights, atl, m-1, j); }
        vector<vector<int>> res;
        for (int i = 0; i < m; i++)
            for (int j = 0; j < n; j++)
                if (pac[i][j] && atl[i][j]) res.push_back({i, j});
        return res;
    }
};
```

### 复杂度

$O(mn)$ 时间，$O(mn)$ 空间。

---

## 23 - LeetCode 695 Max Area of Island（Flood Fill/连通性）

### 题意

$m \times n$ 的 0-1 网格，`1` 为陆地，`0` 为水。求最大岛屿面积（四方向连通的 `1` 的个数）。

### 分析

遍历网格，遇到 `1` 时做 DFS/BFS 计算该连通分量大小，取最大值。

### 搜索策略

- **状态**：$(r, c)$ — 当前格子
- **搜索方式**：DFS Flood Fill，返回连通分量大小
- **剪枝**：越界 / 水域 / 已标记 跳过
- **答案**：所有连通分量大小的最大值

### 核心代码

```cpp
class Solution {
public:
    int dfs(vector<vector<int>>& grid, int r, int c) {
        if (r < 0 || r >= (int)grid.size() || c < 0 || c >= (int)grid[0].size()) return 0;
        if (grid[r][c] != 1) return 0;
        grid[r][c] = 0;
        return 1 + dfs(grid,r+1,c) + dfs(grid,r-1,c) + dfs(grid,r,c+1) + dfs(grid,r,c-1);
    }
    int maxAreaOfIsland(vector<vector<int>>& grid) {
        int ans = 0;
        for (int i = 0; i < (int)grid.size(); i++)
            for (int j = 0; j < (int)grid[0].size(); j++)
                if (grid[i][j]) ans = max(ans, dfs(grid, i, j));
        return ans;
    }
};
```

### 复杂度

$O(mn)$ 时间，$O(mn)$ 递归栈空间。

---

## 24 - LeetCode 733 Flood Fill（Flood Fill/连通性）

### 题意

给定 $m \times n$ 图像矩阵 `image`、起点 $(sr, sc)$ 和新颜色 `color`。从起点出发，将所有四方向连通的同色格子染成新颜色。

### 分析

从起点出发做 DFS，将所有与起点颜色相同的连通格子改为新颜色。注意若起始颜色与新颜色相同则无需操作。

### 搜索策略

- **状态**：$(r, c)$ — 当前格子
- **搜索方式**：DFS Flood Fill
- **剪枝**：越界 / 颜色不匹配 跳过；起始颜色 == 新颜色时直接返回
- **答案**：修改后的 `image`

### 核心代码

```cpp
class Solution {
public:
    void dfs(vector<vector<int>>& image, int r, int c, int oldColor, int newColor) {
        if (r < 0 || r >= (int)image.size() || c < 0 || c >= (int)image[0].size()) return;
        if (image[r][c] != oldColor) return;
        image[r][c] = newColor;
        dfs(image, r+1, c, oldColor, newColor);
        dfs(image, r-1, c, oldColor, newColor);
        dfs(image, r, c+1, oldColor, newColor);
        dfs(image, r, c-1, oldColor, newColor);
    }
    vector<vector<int>> floodFill(vector<vector<int>>& image, int sr, int sc, int color) {
        if (image[sr][sc] == color) return image;
        dfs(image, sr, sc, image[sr][sc], color);
        return image;
    }
};
```

### 复杂度

$O(mn)$ 时间，$O(mn)$ 递归栈空间。

---

## 25 - LeetCode 827 Making A Large Island（Flood Fill/连通性）

### 题意

$n \times n$ 的 0-1 网格，最多可将**一个** `0` 翻转为 `1`。求翻转后最大岛屿面积。

### 分析

两步走：

1. **预处理**：DFS 为每个岛分配编号并记录面积。
2. **枚举翻转**：对每个值为 `0` 的格子，检查其四邻居所属的不同岛，将这些岛面积加上 $1$（翻转的格子本身），取最大值。

### 搜索策略

- **状态**：$(r, c)$ — 当前格子、岛编号
- **搜索方式**：① DFS 标记每个岛并记录面积 ② 枚举 `0` 格子检查四邻居
- **剪枝**：用 set 去重同一岛编号
- **答案**：所有候选值的最大值

### 核心代码

```cpp
class Solution {
public:
    int n;
    int dx[4] = {0,0,1,-1}, dy[4] = {1,-1,0,0};
    int dfs(vector<vector<int>>& grid, int r, int c, int id) {
        if (r < 0 || r >= n || c < 0 || c >= n || grid[r][c] != 1) return 0;
        grid[r][c] = id;
        int area = 1;
        for (int d = 0; d < 4; d++) area += dfs(grid, r+dx[d], c+dy[d], id);
        return area;
    }
    int largestIsland(vector<vector<int>>& grid) {
        n = grid.size();
        unordered_map<int,int> area;
        int id = 2, ans = 0;
        for (int i = 0; i < n; i++)
            for (int j = 0; j < n; j++)
                if (grid[i][j] == 1) {
                    area[id] = dfs(grid, i, j, id);
                    ans = max(ans, area[id]);
                    id++;
                }
        for (int i = 0; i < n; i++)
            for (int j = 0; j < n; j++) {
                if (grid[i][j] != 0) continue;
                unordered_set<int> seen;
                int total = 1;
                for (int d = 0; d < 4; d++) {
                    int ni = i+dx[d], nj = j+dy[d];
                    if (ni < 0 || ni >= n || nj < 0 || nj >= n) continue;
                    int nid = grid[ni][nj];
                    if (nid > 1 && !seen.count(nid)) {
                        seen.insert(nid);
                        total += area[nid];
                    }
                }
                ans = max(ans, total);
            }
        return ans;
    }
};
```

### 复杂度

$O(n^2)$ 时间，$O(n^2)$ 空间。

---

## 26 - LeetCode 329 Longest Increasing Path in a Matrix（记忆化搜索）

### 题意

$m \times n$ 整数矩阵，求最长严格递增路径的长度（四方向移动）。

### 分析

以每个格子为起点 DFS，走向严格更大的邻居。由于路径是严格递增的不存在环，可以用记忆化（`memo[r][c]`）避免重复计算。

### 搜索策略

- **状态**：$(r, c)$ — 当前格子
- **搜索方式**：DFS + 记忆化，四方向扩展到严格更大的邻居
- **剪枝**：`memo[r][c] > 0` 时直接返回缓存值
- **答案**：所有格子 `memo[r][c]` 的最大值

### 核心代码

```cpp
class Solution {
public:
    int m, n;
    int dx[4] = {0,0,1,-1}, dy[4] = {1,-1,0,0};
    int dfs(vector<vector<int>>& matrix, vector<vector<int>>& memo, int r, int c) {
        if (memo[r][c]) return memo[r][c];
        memo[r][c] = 1;
        for (int d = 0; d < 4; d++) {
            int nr = r + dx[d], nc = c + dy[d];
            if (nr < 0 || nr >= m || nc < 0 || nc >= n) continue;
            if (matrix[nr][nc] <= matrix[r][c]) continue;
            memo[r][c] = max(memo[r][c], 1 + dfs(matrix, memo, nr, nc));
        }
        return memo[r][c];
    }
    int longestIncreasingPath(vector<vector<int>>& matrix) {
        m = matrix.size(); n = matrix[0].size();
        vector<vector<int>> memo(m, vector<int>(n, 0));
        int ans = 0;
        for (int i = 0; i < m; i++)
            for (int j = 0; j < n; j++)
                ans = max(ans, dfs(matrix, memo, i, j));
        return ans;
    }
};
```

### 复杂度

$O(mn)$ 时间，$O(mn)$ 空间。

---

## 27 - LeetCode 1553 Minimum Number of Days to Eat N Oranges（记忆化搜索）

### 题意

有 $n$ 个橘子。每天可以选择以下操作之一：① 吃 $1$ 个；② 若 $n$ 是 $2$ 的倍数，吃 $n/2$ 个；③ 若 $n$ 是 $3$ 的倍数，吃 $2n/3$ 个。求吃完所有橘子的最少天数。

### 分析

暴力 DP 从 $n$ 到 $0$ 会超时（$n \le 2 \times 10^9$）。关键观察：最优策略一定是尽量使用操作 ② 或 ③，操作 ① 仅用于将 $n$ 调整为 $2$ 或 $3$ 的倍数。因此 $dp(n) = 1 + \min(n \% 2 + dp(n/2),\; n \% 3 + dp(n/3))$。用哈希表记忆化，状态数 $O(\log^2 n)$。

### 搜索策略

- **状态**：剩余橘子数 $n$
- **搜索方式**：DFS + 哈希表记忆化
- **剪枝**：$n \le 1$ 时直接返回 $n$
- **答案**：$dp(n)$

### 核心代码

```cpp
class Solution {
public:
    unordered_map<int, int> memo;
    int minDays(int n) {
        if (n <= 1) return n;
        if (memo.count(n)) return memo[n];
        int res = 1 + min(n % 2 + minDays(n / 2), n % 3 + minDays(n / 3));
        return memo[n] = res;
    }
};
```

### 复杂度

$O(\log^2 n)$ 时间和空间。

---

## 28 - LeetCode 403 Frog Jump（记忆化搜索）

### 题意

一只青蛙过河。河中有若干石头，位置存在有序数组 `stones` 中。青蛙从第一块石头（位置 `0`）出发，上一次跳了 $k$ 步，则下一次可跳 $k-1$、$k$ 或 $k+1$ 步。判断青蛙能否到达最后一块石头。

### 分析

状态为 (当前石头索引, 上一跳步数)。用记忆化搜索或动态规划。石头位置用 set/map 快速查找。

### 搜索策略

- **状态**：`(pos, k)` — 当前石头位置、上次跳跃步数
- **搜索方式**：DFS + 记忆化，对每种合法跳跃距离递归
- **剪枝**：目标位置不存在于石头集合 / 已计算过 / $k \le 0$（不含 $k=0$ 的首次跳跃）时跳过
- **答案**：能否到达 `stones.back()`

### 核心代码

```cpp
class Solution {
public:
    unordered_set<int> stoneSet;
    unordered_map<long long, bool> memo;
    int last;
    bool dfs(int pos, int k) {
        if (pos == last) return true;
        long long key = (long long)pos * 100001 + k;
        if (memo.count(key)) return memo[key];
        bool res = false;
        for (int dk = -1; dk <= 1; dk++) {
            int nk = k + dk;
            if (nk <= 0) continue;
            int npos = pos + nk;
            if (stoneSet.count(npos) && dfs(npos, nk)) { res = true; break; }
        }
        return memo[key] = res;
    }
    bool canCross(vector<int>& stones) {
        last = stones.back();
        stoneSet = unordered_set<int>(stones.begin(), stones.end());
        return dfs(0, 0);
    }
};
```

### 复杂度

$O(n^2)$ 时间和空间（$n$ 为石头数，每个石头最多 $n$ 种步长）。

---

## 29 - LeetCode 52 N-Queens II（搜索剪枝）

### 题意

求 $n$ 皇后问题的解的**数目**。

### 分析

与 51 题相同的回溯框架，但只需计数不需构造棋盘。可以使用位运算优化列/对角线冲突检测，大幅加速。

### 搜索策略

- **状态**：当前行 `row`、列/对角线占用掩码
- **搜索方式**：DFS 逐行枚举列
- **剪枝**：列和两条对角线冲突时跳过（位运算一步判断）
- **答案**：`row == n` 时计数 $+1$

### 核心代码

```cpp
class Solution {
public:
    int ans = 0;
    void dfs(int n, int row, int cols, int d1, int d2) {
        if (row == n) { ans++; return; }
        int avail = ((1 << n) - 1) & ~(cols | d1 | d2);
        while (avail) {
            int pick = avail & (-avail); // lowest bit
            avail -= pick;
            dfs(n, row + 1, cols | pick, (d1 | pick) << 1, (d2 | pick) >> 1);
        }
    }
    int totalNQueens(int n) {
        dfs(n, 0, 0, 0, 0);
        return ans;
    }
};
```

### 复杂度

$O(n!)$ 时间，$O(n)$ 空间。

---

## 30 - LeetCode 473 Matchsticks to Square（搜索剪枝）

### 题意

给定一组火柴的长度数组 `matchsticks`，判断能否将所有火柴恰好拼成一个正方形（四条边等长）。

### 分析

正方形每条边长 $= \text{sum} / 4$。回溯搜索将每根火柴分配到四条边之一。关键剪枝：① 总和不是 $4$ 的倍数直接返回 ② 从大到小排序优先放长火柴 ③ 当前边超出目标长度剪枝 ④ 同值火柴去重。

### 搜索策略

- **状态**：当前火柴索引 `idx`、四条边当前长度 `sides[4]`
- **搜索方式**：DFS 回溯，对每根火柴尝试放入四条边
- **剪枝**：① 超长 ② 降序排列 ③ 相同边长去重
- **答案**：所有火柴放完且四边相等

### 核心代码

```cpp
class Solution {
public:
    bool dfs(vector<int>& ms, int idx, vector<int>& sides, int target) {
        if (idx == (int)ms.size())
            return sides[0] == target && sides[1] == target && sides[2] == target;
        for (int i = 0; i < 4; i++) {
            if (sides[i] + ms[idx] > target) continue;
            if (i > 0 && sides[i] == sides[i - 1]) continue; // 去重
            sides[i] += ms[idx];
            if (dfs(ms, idx + 1, sides, target)) return true;
            sides[i] -= ms[idx];
        }
        return false;
    }
    bool makesquare(vector<int>& matchsticks) {
        int sum = accumulate(matchsticks.begin(), matchsticks.end(), 0);
        if (sum % 4 != 0) return false;
        sort(matchsticks.rbegin(), matchsticks.rend());
        vector<int> sides(4, 0);
        return dfs(matchsticks, 0, sides, sum / 4);
    }
};
```

### 复杂度

最坏 $O(4^n)$，但剪枝后实际极快；$O(n)$ 空间。

---

## 31 - LeetCode 698 Partition to K Equal Sum Subsets（搜索剪枝）

### 题意

给定整数数组 `nums` 和正整数 $k$，判断能否将数组分成 $k$ 个非空子集，使得每个子集的元素和相等。

### 分析

473 的推广（$k=4$ → 一般 $k$）。回溯搜索将每个元素分配到 $k$ 个桶之一，目标桶和为 $\text{sum}/k$。相同的剪枝策略适用。

### 搜索策略

- **状态**：当前元素索引 `idx`、$k$ 个桶当前和 `buckets[k]`
- **搜索方式**：DFS 回溯，每个元素尝试放入 $k$ 个桶
- **剪枝**：① 总和不整除 $k$ ② 超出目标 ③ 降序排序 ④ 相同桶值去重
- **答案**：所有元素放完且每个桶恰好等于目标

### 核心代码

```cpp
class Solution {
public:
    bool dfs(vector<int>& nums, vector<int>& buckets, int idx, int target) {
        if (idx == (int)nums.size()) return true;
        for (int i = 0; i < (int)buckets.size(); i++) {
            if (buckets[i] + nums[idx] > target) continue;
            if (i > 0 && buckets[i] == buckets[i - 1]) continue;
            buckets[i] += nums[idx];
            if (dfs(nums, buckets, idx + 1, target)) return true;
            buckets[i] -= nums[idx];
        }
        return false;
    }
    bool canPartitionKSubsets(vector<int>& nums, int k) {
        int sum = accumulate(nums.begin(), nums.end(), 0);
        if (sum % k != 0) return false;
        sort(nums.rbegin(), nums.rend());
        if (nums[0] > sum / k) return false;
        vector<int> buckets(k, 0);
        return dfs(nums, buckets, 0, sum / k);
    }
};
```

### 复杂度

最坏 $O(k^n)$，剪枝后实际可行；$O(n + k)$ 空间。

---

## 32 - LeetCode 131 Palindrome Partitioning（搜索剪枝）

### 题意

给定字符串 `s`，将其分割为若干子串，使每个子串都是回文。返回所有可能的分割方案。

### 分析

回溯搜索。从索引 `start` 开始枚举分割点 `end`，若 `s[start..end]` 是回文则加入当前路径并继续递归。可以预处理所有子串是否为回文以加速判断。

### 搜索策略

- **状态**：当前起始索引 `start`、当前分割路径 `path`
- **搜索方式**：DFS 回溯，枚举右端点
- **剪枝**：子串不是回文时跳过
- **答案**：`start == s.size()` 时加入结果集

### 核心代码

```cpp
class Solution {
public:
    vector<vector<string>> res;
    vector<vector<bool>> isPalin;
    void dfs(string& s, int start, vector<string>& path) {
        if (start == (int)s.size()) { res.push_back(path); return; }
        for (int end = start; end < (int)s.size(); end++) {
            if (!isPalin[start][end]) continue;
            path.push_back(s.substr(start, end - start + 1));
            dfs(s, end + 1, path);
            path.pop_back();
        }
    }
    vector<vector<string>> partition(string s) {
        int n = s.size();
        isPalin.assign(n, vector<bool>(n, false));
        for (int i = n - 1; i >= 0; i--)
            for (int j = i; j < n; j++)
                isPalin[i][j] = (s[i] == s[j]) && (j - i <= 2 || isPalin[i+1][j-1]);
        vector<string> path;
        dfs(s, 0, path);
        return res;
    }
};
```

### 复杂度

$O(n \cdot 2^n)$ 时间，$O(n^2)$ 预处理空间 + $O(n)$ 递归栈。

---

## 33 - LeetCode 126 Word Ladder II（双向搜索/综合）

### 题意

给定 `beginWord`、`endWord` 和 `wordList`，找出所有从 `beginWord` 到 `endWord` 的**最短**转换序列。

### 分析

127 题的升级版，需返回所有最短路径。

1. **BFS 建图**：先做 BFS 记录每个单词的最短距离（层数），同时记录从哪些前驱到达它。
2. **DFS 回溯路径**：从 `endWord` 沿前驱反向 DFS 构造所有最短路径。

### 搜索策略

- **状态**：当前单词
- **搜索方式**：BFS 建分层图 + DFS 回溯路径
- **剪枝**：BFS 到达 `endWord` 后停止；DFS 只走距离递减的前驱
- **答案**：所有最短路径

### 核心代码

```cpp
class Solution {
public:
    vector<vector<string>> findLadders(string beginWord, string endWord,
                                       vector<string>& wordList) {
        unordered_set<string> dict(wordList.begin(), wordList.end());
        if (!dict.count(endWord)) return {};
        unordered_map<string, int> dist;
        unordered_map<string, vector<string>> parents;
        queue<string> q;
        q.push(beginWord); dist[beginWord] = 0;
        bool found = false;
        while (!q.empty() && !found) {
            int sz = q.size();
            while (sz--) {
                string cur = q.front(); q.pop();
                int d = dist[cur];
                for (int i = 0; i < (int)cur.size(); i++) {
                    string next = cur;
                    for (char c = 'a'; c <= 'z'; c++) {
                        next[i] = c;
                        if (!dict.count(next)) continue;
                        if (!dist.count(next)) {
                            dist[next] = d + 1;
                            if (next == endWord) found = true;
                            q.push(next);
                            parents[next].push_back(cur);
                        } else if (dist[next] == d + 1) {
                            parents[next].push_back(cur);
                        }
                    }
                }
            }
        }
        vector<vector<string>> res;
        if (!found) return res;
        vector<string> path = {endWord};
        function<void(const string&)> dfs = [&](const string& word) {
            if (word == beginWord) {
                res.push_back(vector<string>(path.rbegin(), path.rend()));
                return;
            }
            for (auto& p : parents[word]) {
                path.push_back(p);
                dfs(p);
                path.pop_back();
            }
        };
        dfs(endWord);
        return res;
    }
};
```

### 复杂度

$O(N \cdot L \cdot 26 + P)$ 时间，其中 $P$ 为所有最短路径的总长度；$O(N \cdot L)$ 空间。

---

## 34 - LeetCode 433 Minimum Genetic Mutation（双向搜索/综合）

### 题意

基因序列由 8 个字符组成，每个字符为 `A`/`C`/`G`/`T`。给定起始基因 `startGene`、目标基因 `endGene` 和合法基因库 `bank`，每次变异只能改变一个字符且结果必须在基因库中。求最少变异次数，不可达返回 $-1$。

### 分析

与 127 Word Ladder 几乎相同的 BFS 模型，只是字母表为 `{A, C, G, T}`，序列长度固定为 $8$。

### 搜索策略

- **状态**：当前基因字符串
- **搜索方式**：BFS 逐层扩展，每步改变一个字符为四种碱基之一
- **剪枝**：不在基因库中 / 已访问 跳过
- **答案**：首次到达 `endGene` 的层数

### 核心代码

```cpp
class Solution {
public:
    int minMutation(string startGene, string endGene, vector<string>& bank) {
        unordered_set<string> dict(bank.begin(), bank.end());
        if (!dict.count(endGene)) return -1;
        unordered_set<string> visited;
        queue<string> q;
        q.push(startGene); visited.insert(startGene);
        int steps = 0;
        string genes = "ACGT";
        while (!q.empty()) {
            int sz = q.size();
            while (sz--) {
                string cur = q.front(); q.pop();
                if (cur == endGene) return steps;
                for (int i = 0; i < 8; i++) {
                    char orig = cur[i];
                    for (char c : genes) {
                        cur[i] = c;
                        if (dict.count(cur) && !visited.count(cur)) {
                            visited.insert(cur);
                            q.push(cur);
                        }
                    }
                    cur[i] = orig;
                }
            }
            steps++;
        }
        return -1;
    }
};
```

### 复杂度

$O(N \cdot 8 \cdot 4)$ 时间，$O(N)$ 空间。

---

## 35 - LeetCode 854 K-Similar Strings（双向搜索/综合）

### 题意

两个字符串 `s1` 和 `s2` 是字母异位词。每次操作可交换 `s1` 中任意两个位置的字符。求使 `s1` 变为 `s2` 的最少交换次数（即 K-相似度）。

### 分析

BFS 搜索状态空间。每步找到 `s1` 中第一个与 `s2` 不同的位置 `i`，然后尝试与后面某个位置 `j`（满足 `s1[j] == s2[i]`）交换。为减少分支，只在 `s1[j] == s2[i]` 时交换，优先选择 `s1[j] != s2[j]` 的位置（两端都修复的交换最优）。

### 搜索策略

- **状态**：当前字符串
- **搜索方式**：BFS 逐层扩展
- **剪枝**：① 只交换能修复至少一个错位的位置对 ② 已访问跳过
- **答案**：首次变为 `s2` 的步数

### 核心代码

```cpp
class Solution {
public:
    int kSimilarity(string s1, string s2) {
        if (s1 == s2) return 0;
        unordered_set<string> visited;
        queue<string> q;
        q.push(s1); visited.insert(s1);
        int steps = 0;
        while (!q.empty()) {
            steps++;
            int sz = q.size();
            while (sz--) {
                string cur = q.front(); q.pop();
                int i = 0;
                while (cur[i] == s2[i]) i++;
                for (int j = i + 1; j < (int)cur.size(); j++) {
                    if (cur[j] != s2[i] || cur[j] == s2[j]) continue;
                    swap(cur[i], cur[j]);
                    if (cur == s2) return steps;
                    if (!visited.count(cur)) { visited.insert(cur); q.push(cur); }
                    swap(cur[i], cur[j]);
                }
            }
        }
        return steps;
    }
};
```

### 复杂度

状态数有限；时间/空间取决于实际搜索树大小，最坏指数级但剪枝后实际可接受。

---

## 36 - LeetCode 1284 Minimum Number of Flips to Convert Binary Matrix to Zero Matrix（双向搜索/综合）

### 题意

$m \times n$ 的 0-1 矩阵，每次操作选择一个格子，翻转它及其四方向邻居（0 变 1、1 变 0）。求将整个矩阵变为全零的最少操作次数。不可能则返回 $-1$。

### 分析

矩阵最大 $3 \times 3$，总共最多 $9$ 个格子，状态可用位掩码表示（$2^9 = 512$ 种状态）。预计算每个格子翻转的掩码，然后从初始状态 BFS 到全零状态。

### 搜索策略

- **状态**：位掩码表示矩阵当前状态
- **搜索方式**：BFS，每步尝试翻转 $m \times n$ 个位置之一
- **剪枝**：已访问状态跳过
- **答案**：首次到达状态 $0$ 的步数

### 核心代码

```cpp
class Solution {
public:
    int minFlips(vector<vector<int>>& mat) {
        int m = mat.size(), n = mat[0].size();
        int start = 0;
        for (int i = 0; i < m; i++)
            for (int j = 0; j < n; j++)
                if (mat[i][j]) start |= 1 << (i * n + j);
        if (start == 0) return 0;
        // 预计算每个位置的翻转掩码
        vector<int> flip(m * n, 0);
        int dx[] = {0,0,0,1,-1}, dy[] = {0,1,-1,0,0};
        for (int i = 0; i < m; i++)
            for (int j = 0; j < n; j++)
                for (int d = 0; d < 5; d++) {
                    int ni = i + dx[d], nj = j + dy[d];
                    if (ni >= 0 && ni < m && nj >= 0 && nj < n)
                        flip[i * n + j] |= 1 << (ni * n + nj);
                }
        vector<bool> visited(1 << (m * n), false);
        queue<int> q;
        q.push(start); visited[start] = true;
        int steps = 0;
        while (!q.empty()) {
            steps++;
            int sz = q.size();
            while (sz--) {
                int cur = q.front(); q.pop();
                for (int k = 0; k < m * n; k++) {
                    int next = cur ^ flip[k];
                    if (next == 0) return steps;
                    if (!visited[next]) { visited[next] = true; q.push(next); }
                }
            }
        }
        return -1;
    }
};
```

### 复杂度

$O(2^{mn} \cdot mn)$ 时间，$O(2^{mn})$ 空间。$mn \le 9$ 时完全可行。

---

# 总结

## 知识点全景图

| 分类 | 题号 | 核心技巧 |
|------|------|----------|
| DFS/回溯 | 46, 47, 78, 90, 39, 40, 77 | 排列/组合/子集模板、排序去重 |
| DFS/回溯 | 17, 22 | 逐位构造、合法性约束 |
| DFS/回溯 | 51, 37, 79 | 棋盘搜索、约束传播 |
| BFS/最短路 | 127, 433 | 单词/基因变换图 BFS |
| BFS/最短路 | 542, 994 | 多源 BFS |
| BFS/最短路 | 752, 773, 1091 | 状态空间 BFS |
| BFS/最短路 | 934 | DFS 标记 + 多源 BFS |
| Flood Fill | 200, 695, 733 | 连通分量基础 |
| Flood Fill | 130, 417 | 边界反向搜索 |
| Flood Fill | 827 | 预处理岛编号 + 枚举翻转 |
| 记忆化搜索 | 329, 1553, 403 | DFS + 缓存消除重叠子问题 |
| 搜索剪枝 | 52, 473, 698, 131 | 位运算/排序/去重/回文预处理 |
| 双向/综合 | 126, 854, 1284 | BFS 建图 + DFS 回溯 / 状态压缩 BFS |

## 学习路线建议

```
基础 Flood Fill (733, 200, 695)
       │
       ├──▶ 边界搜索 (130, 417, 827)
       │
       ▼
排列/组合/子集模板 (46, 78, 77, 39)
       │
       ├──▶ 去重变体 (47, 90, 40)
       │
       ├──▶ 构造搜索 (17, 22)
       │
       ▼
约束回溯 (51, 37, 79)
       │
       ├──▶ 搜索剪枝 (52, 473, 698, 131)
       │
       ▼
BFS 最短路 (127, 542, 994)
       │
       ├──▶ 状态空间 BFS (752, 773, 1091, 1284)
       │
       ├──▶ 多源/混合 (934, 854)
       │
       ▼
记忆化搜索 (329, 403, 1553)
       │
       ▼
综合进阶 (126, 433, 827, 854)
```

## 解题方法论

1. **识别搜索类型**：排列/组合/子集 → DFS 回溯模板；最短路 → BFS；连通性 → Flood Fill；重叠子问题 → 记忆化。
2. **定义状态**：明确"当前在哪、已做了什么选择"，状态越精简搜索越快。
3. **设计剪枝**：排序去重、约束传播、可行性提前判断是三大核心剪枝手段。
4. **选择数据结构**：visited 集合（哈希/数组）、队列（BFS）、递归栈（DFS）、位掩码（状态压缩）。
5. **分析复杂度**：搜索树的分支因子 $b$ 和深度 $d$ 决定时间 $O(b^d)$，剪枝的目标是降低有效分支因子。

💡 搜索题的核心在于**状态定义**和**剪枝设计**。掌握回溯三件套（选择 → 递归 → 撤销）和 BFS 逐层扩展模板后，绝大多数搜索题都能高效解决。
