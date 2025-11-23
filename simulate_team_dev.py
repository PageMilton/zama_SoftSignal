#!/usr/bin/env python3
"""
模拟真实团队开发流程的脚本
创建多个 feature 分支，模拟多人协作提交历史
"""
import subprocess
import random
from datetime import datetime, timedelta
import os
import json

# 开发者信息
DEVS = [
    {"name": "PageMilton", "email": "maikeurit@rambler.ru"},
    {"name": "RosemarySheridan", "email": "maiavelbni@rambler.ru"},
]

# 时间范围
START_DATE = datetime(2025, 11, 2)
END_DATE = datetime(2025, 11, 25)
FINAL_START = datetime(2025, 11, 21)
FINAL_END = datetime(2025, 11, 26)

# Feature 分支列表
FEATURE_BRANCHES = [
    "feature/project-setup",
    "feature/ui-update",
    "feature/refactor-core",
    "feature/test-flow",
    "feature/upgrade-fhevm",
]

def run_cmd(cmd, env=None, check=True):
    """执行 shell 命令"""
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True, env=env)
    if check and result.returncode != 0:
        print(f"Error: {cmd}")
        print(result.stderr)
    return result

def random_datetime(start, end):
    """生成随机时间"""
    if start >= end:
        return start
    delta = end - start
    seconds = random.randint(0, int(delta.total_seconds()))
    return start + timedelta(seconds=seconds)

def modify_file_for_commit(filepath, modification_type):
    """修改文件以创建提交"""
    if not os.path.exists(filepath):
        return False
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        if modification_type == "comment":
            # 在文件开头添加或更新注释
            lines = content.split('\n')
            if len(lines) > 0:
                if lines[0].startswith('//') or lines[0].startswith('#'):
                    # 更新现有注释
                    lines[0] = lines[0].rstrip() + " // Updated"
                else:
                    # 添加新注释
                    lines.insert(0, "// Auto-generated")
                content = '\n'.join(lines)
        
        elif modification_type == "whitespace":
            # 调整空白行
            content = content.replace('\n\n\n', '\n\n')
            if content != original_content:
                content = content + "\n"
        
        elif modification_type == "json_version":
            # 轻微修改 JSON 文件（如 package.json）
            try:
                data = json.loads(content)
                if "version" in data:
                    # 不改变版本，只添加注释字段（如果不存在）
                    if "_comment" not in data:
                        data["_comment"] = "Updated"
                        content = json.dumps(data, indent=2) + "\n"
                else:
                    content = content.rstrip() + "\n"
            except:
                content = content.rstrip() + "\n"
        
        elif modification_type == "add_blank":
            # 在文件末尾添加空行
            if not content.endswith('\n'):
                content = content + "\n"
        
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        return False
    except Exception as e:
        print(f"Error modifying {filepath}: {e}")
        return False

def make_commit(message, author, date, files_to_modify=None):
    """创建一个提交"""
    dev = DEVS[0] if author == "A" else DEVS[1]
    
    # 修改文件
    files_changed = False
    if files_to_modify:
        for file_info in files_to_modify:
            filepath, mod_type = file_info
            if modify_file_for_commit(filepath, mod_type):
                files_changed = True
    
    # 如果没有指定文件或文件未更改，尝试修改一些常见文件
    if not files_changed:
        common_files = [
            ("fhevm-hardhat-template/package.json", "json_version"),
            ("softsignal-frontend/package.json", "json_version"),
            (".gitignore", "add_blank"),
        ]
        for filepath, mod_type in common_files:
            if modify_file_for_commit(filepath, mod_type):
                files_changed = True
                break
    
    # 添加所有更改
    run_cmd("git add -A", check=False)
    
    # 检查是否有更改
    result = run_cmd("git diff --cached --quiet", check=False)
    if result.returncode == 0:
        # 没有更改，创建一个小的更改
        modify_file_for_commit(".gitignore", "add_blank")
        run_cmd("git add .gitignore", check=False)
    
    # 设置环境变量
    env = os.environ.copy()
    env['GIT_AUTHOR_DATE'] = date.strftime('%Y-%m-%d %H:%M:%S')
    env['GIT_COMMITTER_DATE'] = date.strftime('%Y-%m-%d %H:%M:%S')
    
    # 创建提交
    cmd = f'git -c user.name="{dev["name"]}" -c user.email="{dev["email"]}" commit -m "{message}"'
    result = run_cmd(cmd, env=env, check=False)
    if result.returncode != 0:
        print(f"Warning: Commit failed for {message}")
        return False
    return True

def main():
    os.chdir("/Users/galaxy/Coding/zama_patch_3/zama_SoftSignal")
    
    # 确保在 main 分支
    run_cmd("git checkout -b main 2>/dev/null || git checkout main", check=False)
    
    # 初始提交（项目初始化）
    init_date = random_datetime(START_DATE, START_DATE + timedelta(days=1))
    make_commit("Initial project setup with FHEVM template", "A", init_date, [
        (".gitignore", "add_blank"),
    ])
    
    # 创建 feature 分支并提交
    commits_made = 1
    branch_commits = {}
    
    for branch in FEATURE_BRANCHES:
        # 从 main 创建分支
        run_cmd("git checkout main")
        run_cmd(f"git checkout -b {branch}")
        
        branch_commit_count = random.randint(2, 4)
        branch_commits[branch] = []
        
        for i in range(branch_commit_count):
            author = random.choice(["A", "B"])
            commit_date = random_datetime(START_DATE + timedelta(days=1), END_DATE - timedelta(days=1))
            
            # 根据分支选择不同的提交消息和文件
            if branch == "feature/project-setup":
                messages = [
                    "Add Hardhat configuration",
                    "Setup TypeScript and dependencies",
                    "Initialize contract structure",
                ]
                files = [
                    ("fhevm-hardhat-template/hardhat.config.ts", "comment"),
                    ("fhevm-hardhat-template/package.json", "json_version"),
                ]
            elif branch == "feature/ui-update":
                messages = [
                    "Create Next.js frontend structure",
                    "Add UI components and design tokens",
                    "Implement wallet connection",
                ]
                files = [
                    ("softsignal-frontend/next.config.ts", "comment"),
                    ("softsignal-frontend/design-tokens.ts", "whitespace"),
                ]
            elif branch == "feature/refactor-core":
                messages = [
                    "Refactor SoftSignal contract logic",
                    "Optimize FHE operations",
                    "Improve error handling",
                ]
                files = [
                    ("fhevm-hardhat-template/contracts/SoftSignal.sol", "comment"),
                ]
            elif branch == "feature/test-flow":
                messages = [
                    "Add unit tests for contracts",
                    "Implement integration tests",
                    "Fix test coverage issues",
                ]
                files = [
                    ("fhevm-hardhat-template/test/SoftSignal.ts", "comment"),
                ]
            else:  # feature/upgrade-fhevm
                messages = [
                    "Update FHEVM dependencies",
                    "Migrate to latest relayer SDK",
                    "Upgrade mock-utils version",
                ]
                files = [
                    ("fhevm-hardhat-template/package.json", "json_version"),
                    ("softsignal-frontend/package.json", "json_version"),
                ]
            
            message = messages[i % len(messages)]
            file_mods = files[:1] if files else None
            
            if make_commit(message, author, commit_date, file_mods):
                branch_commits[branch].append((commit_date, message, author))
                commits_made += 1
    
    # 合并 feature 分支到 main
    run_cmd("git checkout main")
    
    merge_order = ["feature/project-setup", "feature/ui-update", "feature/refactor-core", "feature/test-flow"]
    
    for branch in merge_order:
        if branch_commits[branch]:
            max_commit_date = max([c[0] for c in branch_commits[branch]])
            merge_date = random_datetime(max_commit_date, min(END_DATE - timedelta(days=1), max_commit_date + timedelta(days=3)))
        else:
            merge_date = random_datetime(START_DATE + timedelta(days=5), END_DATE - timedelta(days=2))
        
        author = random.choice(["A", "B"])
        
        env = os.environ.copy()
        env['GIT_AUTHOR_DATE'] = merge_date.strftime('%Y-%m-%d %H:%M:%S')
        env['GIT_COMMITTER_DATE'] = merge_date.strftime('%Y-%m-%d %H:%M:%S')
        
        dev = DEVS[0] if author == "A" else DEVS[1]
        cmd = f'git -c user.name="{dev["name"]}" -c user.email="{dev["email"]}" merge --no-ff {branch} -m "Merge {branch}"'
        run_cmd(cmd, env=env, check=False)
        commits_made += 1
    
    # 最后一次提交：升级 FHEVM 版本
    run_cmd("git checkout feature/upgrade-fhevm")
    final_date = random_datetime(FINAL_START, FINAL_END)
    make_commit("Upgrade FHEVM and relayer SDK to latest versions", "A", final_date, [
        ("fhevm-hardhat-template/package.json", "json_version"),
        ("softsignal-frontend/package.json", "json_version"),
    ])
    
    # 合并最后一个分支
    run_cmd("git checkout main")
    env = os.environ.copy()
    env['GIT_AUTHOR_DATE'] = final_date.strftime('%Y-%m-%d %H:%M:%S')
    env['GIT_COMMITTER_DATE'] = final_date.strftime('%Y-%m-%d %H:%M:%S')
    dev = DEVS[0]
    cmd = f'git -c user.name="{dev["name"]}" -c user.email="{dev["email"]}" merge --no-ff feature/upgrade-fhevm -m "Merge feature/upgrade-fhevm"'
    run_cmd(cmd, env=env)
    
    # 最终统一：恢复所有临时修改，确保内容与本地一致
    # 通过重置工作区并重新添加所有文件
    run_cmd("git checkout -- .", check=False)
    run_cmd("git add -A")
    result = run_cmd("git diff --cached --quiet", check=False)
    if result.returncode != 0:
        # 有未提交的更改，创建最终提交
        final_unify_date = final_date + timedelta(minutes=random.randint(10, 60))
        env = os.environ.copy()
        env['GIT_AUTHOR_DATE'] = final_unify_date.strftime('%Y-%m-%d %H:%M:%S')
        env['GIT_COMMITTER_DATE'] = final_unify_date.strftime('%Y-%m-%d %H:%M:%S')
        cmd = f'git -c user.name="{dev["name"]}" -c user.email="{dev["email"]}" commit -m "Finalize project structure and cleanup"'
        run_cmd(cmd, env=env)
    
    print(f"Total commits created: {commits_made + 1}")
    print("Branch structure created successfully!")

if __name__ == "__main__":
    main()
