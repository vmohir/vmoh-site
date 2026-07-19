class: center, middle

# Git

_By: Vahid Mohammadi_

<div class="fz-14">
    <i>Created with: <a href="https://github.com/gnab/remark">RemarkJS</a></i>
</div>

---

## Install the latest version of git

<div data-termynal>
<div data-ty="input">
    <code class="language-bash">git <span class="c-yellow">--version</span></code>
</div>
<pre data-ty>
git version 2.17.1
</pre>
<div data-ty="input">
    <code class="language-bash">sudo apt-add-repository <span class="c-green">ppa:git-core/ppa</span> -y</code>
</div>
<div data-ty="input">
    <code class="language-bash">sudo apt update</code>
</div>
<div data-ty="input">
    <code class="language-bash">sudo apt install -y git</code>
</div>
<div data-ty="input">
    <code class="language-bash">git <span class="c-yellow">--version</span></code>
</div>
<pre data-ty>
git version <span class="c-green">2.25.0</span>
</pre>
</div>

---

<div class="doc-link">
    <a href="https://stackoverflow.com/a/292359/1889607">Fetch vs Pull</a>
</div>

### Init

Inits git in current directory.
Creates `.git` folder

<div data-termynal>
<div data-ty="input">
    <code class="language-bash">git init</code>
</div>
<div data-ty="input">
    <code class="language-bash">ls -a</code>
</div>
<pre data-ty>
<span class="c-green">.git</span> file.txt
</pre>
</div>

--

### Remove git

<div data-termynal>
<div data-ty="input">
    <code class="language-bash">rm -rf .git</code>
</div>
</div>

--

### Workflow

![alt](images/workflow.png)

---

## Branch

<div data-termynal>
<div data-ty="input">
    <code class="language-bash">git checkout <span class="c-green">-b</span> <span class="c-purple">other-branch</span></code>
</div>
<div data-ty="input">
    <code class="language-bash">git branch</code>
</div>
<pre data-ty>
  master
* <span class="c-green">other-branch</span>
</pre>
</div>

After changing some files, let's push them into origin/other-branch

<div data-termynal>
<div data-ty="input">
    <code class="language-bash"><div class="has-desc"><span>git push <span class="c-blue">-u</span> origin <span class="c-purple">other-branch</span></span><span class="c-blue"><- `-u` will connect the local branch with the remote branch</span></div></code>
</div>
<div data-ty="input">
    <code class="language-bash">git checkout <span class="c-purple">master</span></code>
</div>
<div data-ty="input">
    <code class="language-bash">git branch</code>
</div>
<pre data-ty>
* <span class="c-green">master</span>
  other-branch
</pre>
<div data-ty="input">
    <code class="language-bash">git merge <span class="c-purple">other-branch</span></code>
</div>
<div data-ty="input">
<code class="language-bash"><div class="has-desc"><span>git branch <span class="c-red">-d</span> <span class="c-purple">other-branch</span></span><span class="c-blue"><- Deletes the local branch</span></div></code>
</div>
<div data-ty="input">
<code class="language-bash"><div class="has-desc"><span>git push origin <span class="c-red">--delete</span> <span class="c-purple">other-branch</span></span><span class="c-blue"><- Deletes the remote branch</span></div></code>
</div>
</div>

---

## Remote

<div data-termynal data-ty-lineDelay="1000">
<div data-ty="input">
    <code class="language-bash">git remote -v</code>
</div>
<pre data-ty>
origin  https://github.com/gvmohzibat/vahid-slides.git
</pre>
<div data-ty="input">
    <code class="language-bash">git remote <span class="c-blue">add</span> gitlab-repo <span class="c-purple">https://gitlab.com/vmohir/vahid-slides.git</span></code>
</div>
<div data-ty="input">
    <code class="language-bash">git remote update</code>
</div>
<pre data-ty>
Fetching origin
Fetching gitlab-repo
</pre>
<div data-ty="input">
    <code class="language-bash">git branch -a</code>
</div>
<pre data-ty>
<div class="d-inline-flex w-100 justify-content-between"><span>* <span class="c-green">master</span></span><span class="c-blue"><- The star shows the HEAD</span></div><span class="c-red">
  remotes/gitlab-repo/master
  remotes/origin/HEAD -> origin/master
  remotes/origin/master</span>
</pre>
<div data-ty="input">
    <code class="language-bash">git remote <span class="c-blue">remove</span> gitlab-repo</code>
</div>
</div>

--

#### HEAD

In <span class="c-green">local repos</span>, `HEAD` is the branch to move for new commits.

In <span class="c-green">remote repos</span>, `HEAD` is used to tell new clones which branch to use as their local `HEAD` (default branch).

<div data-termynal>
<div data-ty="input">
    <code class="language-bash">cat .git/HEAD</code>
</div>
<pre data-ty>
ref: refs/heads/master
</pre>
</div>

---

### Status

<div data-termynal>
<div data-ty="input">
    <code class="language-bash">git status</code>
</div>
<div data-ty="input">
    <code class="language-bash"><div class="has-desc"><span>git status <span class="c-green">-s</span></span><span class="c-blue"><- short output</span></div></code>
</div>
</div>

--

### Log

<div data-termynal>
<div data-ty="input">
    <code class="language-bash"><div class="has-desc"><span>git log <span class="c-purple">--oneline</span></span><span class="c-blue"><- Log commits each in one line</span></div></code>
</div>
<div data-ty="input">
    <code class="language-bash"><div class="has-desc"><span>git log <span class="c-purple">--no-merges</span></span><span class="c-blue"><- Hide merges</span></div></code>
</div>
<div data-ty="input">
    <code class="language-bash"><div class="has-desc"><span>git log <span class="c-purple">{branch}</span></span><span class="c-blue"><- Log commits of one branch</span></div></code>
</div>
<div data-ty="input">
    <code class="language-bash"><div class="has-desc"><span>git log <span class="c-purple">--stat</span></span><span class="c-blue"><- Show file changes</span></div></code>
</div>
</div>

--

### Reflog

Every action you perform inside of Git where data is stored, you can find it in reflog.

Options are same as `git log`

<div data-termynal>
<div data-ty="input">
    <code class="language-bash">git reflog</code>
</div>
</div>

---

class: center, middle

# Fix Mistakes

---

## Amend Commit

You did a commit and you want to change the **message** or the **staged files**

- Change a commit's message

<div data-termynal>
<div data-ty="input">
    <code class="language-bash">git commit -m "wrong message"</code>
</div>
<div data-ty="input">
  <code class="language-bash"><div class="has-desc"><span>git commit <span class="c-blue">--amend</span> -m "correct message"</span><span class="c-yellow"><- Or `git commit --amend` and change the message in the editor</span></div></code>
</div>
</div>

- Change a commit's staged files

<div data-termynal>
<div data-ty="input">
  <code class="language-bash">git add file-1.txt</code>
</div>
<div data-ty="input">
  <code class="language-bash">git commit -m 'added file-1</code>
</div>
<div data-ty="input">
  <code class="language-bash">git add file-2.txt</code>
</div>
<div data-ty="input">
  <code class="language-bash">git commit <span class="c-blue">--amend</span></code>
</div>
</div>

> Don't run amend on commits that you've pushed to remote

---

## Revert

Creates a new commit that reverts an older commit

<div data-termynal>
<div data-ty="input">
  <code class="language-bash">git log</code>
</div>
<pre data-ty>
<span class="c-yellow">dskj3bg</span> some commit
<span class="c-yellow">80827b2</span> unwanted commit
<span class="c-yellow">acfbec6</span> older commit
</pre>
<div data-ty="input">
  <code class="language-bash">git revert 80827b2</code>
</div>
<div data-ty="input">
  <code class="language-bash">git log</code>
</div>
<pre data-ty>
<span class="c-yellow">42g5471</span> Revert "unwanted commit"
<span class="c-yellow">dskj3bg</span> some commit
<span class="c-yellow">80827b2</span> unwanted commit
<span class="c-yellow">acfbec6</span> older commit
</pre>
</div>

---

## Reset

There are 3 kinds of reset:

![alt](images/reset.jpg)

> #### Note:
>
> - mixed reset will also reset files in staging area
> - hard reset will also reset files in staging area & files in working directory
> - hard reset won't delete untracked files

---

<div data-termynal>
<div data-ty="input">
  <code class="language-bash">git log</code>
</div>
<pre data-ty>
<span class="c-yellow">80827b2</span> unwanted commit
<span class="c-yellow">acfbec6</span> older commit
</pre>
</div>

--

<div class="row flex-nowrap align-items-baseline">
    <div class="col-auto flex-basis-small"> <h4> Soft </h4> </div>

<div class="col min-width-0">
    <div data-termynal>
    <div data-ty="input">
      <code class="language-bash">git <span class="c-blue">reset --soft</span> acfbec6</code>
    </div>
    <div data-ty="input">
      <code class="language-bash">git log</code>
    </div>
<pre data-ty>
<span class="c-yellow">acfbec6</span> older commit
</pre>
    <div data-ty="input">
      <code class="language-bash">git status</code>
    </div>
<pre data-ty>
<div class="d-inline-flex w-100 justify-content-between"><span><span class="c-green">M</span>  file.txt</span><span class="c-blue"><- File is in staging area</span></div>
</pre>
</div>
</div>
</div>

--

<div class="row flex-nowrap align-items-baseline">
    <div class="col-auto flex-basis-small"> <h4> Mixed </h4> </div>
    
<div class="col min-width-0">
    <div data-termynal>
    <div data-ty="input">
        <code class="language-bash"><div class="has-desc"><span>git <span class="c-blue">reset</span> acfbec6</span><span class="c-blue"><- Default is mixed</span></div></code>
    </div>
    <div data-ty="input">
        <code class="language-bash">git log</code>
    </div>
<pre data-ty>
<span class="c-yellow">acfbec6</span> older commit
</pre>
    <div data-ty="input">
        <code class="language-bash">git status</code>
    </div>
<pre data-ty>
<div class="d-inline-flex w-100 justify-content-between"><span> <span class="c-red">M</span> file.txt</span><span class="c-blue"><- File is in working directory</span></div>
</pre>
    </div>
</div>
</div>

--

<div class="row flex-nowrap align-items-baseline">
    <div class="col-auto flex-basis-small"> <h4> Hard </h4> </div>
    
<div class="col min-width-0">
    <div data-termynal>
    <div data-ty="input">
    git <span class="c-blue">reset --hard</span> acfbec6
    </div>
    <div data-ty="input">
        <code class="language-bash">git log</code>
    </div>
<pre data-ty>
<span class="c-yellow">acfbec6</span> older commit
</pre>
    <div data-ty="input">
        <code class="language-bash">git status</code>
    </div>
    </div>
</div>
</div>

---

## Clean

`git reset --hard` won't get rid of **untracked** files.

<div data-termynal>
<div data-ty="input">
    <code class="language-bash">git status</code>
</div>
<pre data-ty>
<div class="d-inline-flex w-100 justify-content-between"><span><span class="c-red">??</span> an-untracked-file.txt</span><span class="c-blue"><- Untracked File</span></div>
<div class="d-inline-flex w-100 justify-content-between"><span> <span class="c-red">M</span> a-modified-file.txt</span><span class="c-blue"><- Modified File</span></div>
</pre>
<div data-ty="input">
    <code class="language-bash">git reset --hard HEAD</code>
</div>
<div data-ty="input">
    <code class="language-bash">git status</code>
</div>
<pre data-ty>
<div class="d-inline-flex w-100 justify-content-between"><span><span class="c-red">??</span> an-untracked-file.txt</span><span class="c-blue"><- The untracked file isn't removed</span></div>
</pre>

<div data-ty="input">
    <code class="language-bash"><div class="has-desc"><span>git clean -df</span><span class="c-blue"><- `-d` will also delete untracked directories</span></div></code>
</div>
<div data-ty="input">
    <code class="language-bash">git status</code>
</div>
</div>

---

## Cherry-pick

Move a commit to another branch

<div data-termynal>
<div data-ty="input">
  <code class="language-bash">git log</code>
</div>
<pre data-ty>
<span class="c-yellow">80827b2</span> commit in the wrong branch
<span class="c-yellow">acfbec6</span> older commit
</pre>
<div data-ty="input">
  <code class="language-bash">git branch</code>
</div>
<pre data-ty>
* <span class="c-green">master</span>
  dest-branch
</pre>
<div data-ty="input">
  <code class="language-bash">git checkout <span class="c-yellow">dest-branch</span></code>
</div>
<div data-ty="input">
  <code class="language-bash"><div class="has-desc"><span>git <span class="c-blue">cherry-pick</span> 80827b2</span><span class="c-blue"><- Copy the commit to current branch</span></div></code>
</div>
</div>

Now the commit is copied, we should go back and remove the wrong commit.

<div data-termynal>
<div data-ty="input">
  <code class="language-bash">git checkout <span class="c-purple">master</span></code>
</div>
<div data-ty="input">
  <code class="language-bash">git reset --hard <span class="c-purple">origin/master</span></code>
</div>
</div>

---

## Undo Almost Anything

Move a commit to another branch

<div data-termynal>
<div data-ty="input">
    <code class="language-bash">git log</code>
</div>
<pre data-ty>
<span class="c-yellow">fbe82b2</span> <span class="c-green">(HEAD -> master)</span> test
</pre>
<div data-ty="input">
<code class="language-bash"><div class="has-desc"><span>git reset --hard origin/master</span><span class="c-blue"><- We accidentally removed file.txt</span></div></code>
</div>
<div data-ty="input">
    <code class="language-bash">git reflog</code>
</div>
<pre data-ty>
<span class="c-yellow">80827b2</span> HEAD@{0}: reset: moving to origin/master
<span class="c-yellow">acfbec6</span> HEAD@{0}: commit: test
</pre>
<div data-ty="input">
  <code class="language-bash">git checkout 80827b2</code>
</div>
</div>

Now we are in a detached state

<div data-termynal>
<div data-ty="input">
<code class="language-bash"><div class="has-desc"><span>git checkout -b <span class="c-purple">backup-from-reflog</span></span><span class="c-blue"><- Create a branch from the detached state</span></div></code>
</div>
</div>

Now we can merge the `backup-from-reflog` branch into the `master` branch

---

class: center, middle

# Other git commands

---

## Stash

Stash is a "Stack" structure for temporary cutting and pasting changes. For example you've made some changes and you understand you're in a wrong branch:

<div data-termynal>
<div data-ty="input">
  <code class="language-bash">git status</code>
</div>
<pre data-ty>
 <span class="c-red">M</span> file.txt
<div class="d-inline-flex w-100 justify-content-between"><span><span class="c-red">??</span> untracked.txt</span><span class="c-blue"><- This file is untracked by git (It's just created)</span></div>
</pre>
<div data-ty="input">
<code class="language-bash"><div class="has-desc"><span>git stash -u</span><span class="c-blue"><- `-u` is for "Untracked files"</span></div></code>
</div>
<div data-ty="input">
  <code class="language-bash">git checkout <span class="c-purple">other-branch</span></code>
</div>
<div data-ty="input">
  <code class="language-bash">git stash pop</code>
</div>
</div>

Now the changes are in "other-branch"

#### Other stash commands:

<div data-termynal>
<div data-ty="input">
    <code class="language-bash"><div class="has-desc"><span>git stash list</span><span class="c-blue"><- shows all changes that are stashed</span></div></code>
</div>
<pre>
stash@{<span class="c-green">0</span>}: WIP on master: <span class="c-yellow">47ee12d1</span> COMMIT_MESSAGE
stash@{<span class="c-green">1</span>}: WIP on master: <span class="c-yellow">6671dgn3</span> OTHER_COMMIT_MESSAGE
</pre>
<div data-ty="input">
    <code class="language-bash"><div class="has-desc"><span>git stash save "name"</span><span class="c-blue"><- Stash with a name</span></div></code>
</div>
<div data-ty="input">
    <code class="language-bash"><div class="has-desc"><span>git stash drop stash@{1}</span><span class="c-blue"><- Gets rid of a stash</span></div></code>
</div>
<div data-ty="input">
    <code class="language-bash"><div class="has-desc"><span>git stash clear</span><span class="c-blue"><- Gets rid of all stashes</span></div></code>
</div>
<div data-ty="input">
    <code class="language-bash"><div class="has-desc"><span>git stash apply stash@{1}</span><span class="c-blue"><- It applies a stash but it doesn't drop it (unlike pop)</span></div></code>
</div>
</div>

---

## Tags

<div data-termynal>
<div data-ty="input">
  <code class="language-bash"><div class="has-desc"><span>git tag v1.0.0</span><span class="c-blue"><- Tag current commit</span></div></code>
</div>
<div data-ty="input">
  <code class="language-bash"><div class="has-desc"><span>git tag v1.0.0 -m "Message"</span><span class="c-blue"><- annotates the tag with a message</span></div></code>
</div>
<div data-ty="input">
  <code class="language-bash">git push --tags</code>
</div>
</div>

Now you can see tags in the "Branches" dropdown:

![Git tags](./images/gitlab-tags.png)

---

## Config

#### Useful configs

<div data-termynal>
<div data-ty="input">
    <code class="language-bash">git config --global <span class="c-purple">user.name</span> "Vahid Mohammadi"</code>
</div>
<div data-ty="input">
    <code class="language-bash">git config --global <span class="c-purple">user.email</span> "email@ex.com"</code>
</div>
<div data-ty="input">
<code class="language-bash"><div class="has-desc"><span>git config --global <span class="c-purple">credentials.helper</span> <span class="c-purple">store</span></span><span class="c-yellow"><- Store username & password in <span class="no-break">~/.git-credentials</span></span></div></code>
</div>
<div data-ty="input">
<code class="language-bash"><div class="has-desc"><span>git config --global <span class="c-purple">log.abbrevCommit</span> true</span><span class="c-yellow"><- `git log` shows short hashes</span></div></code>
</div>
<div data-ty="input">
<code class="language-bash"><div class="has-desc"><span>git config --global <span class="c-purple">status.short</span> true</span><span class="c-yellow"><- `git status` short mode</span></div></code>
</div>
<div data-ty="input">
<code class="language-bash"><div class="has-desc"><span>git config --global <span class="c-purple">clean.requireForce</span> false</span><span class="c-yellow"><- `-f` is no longer needed for `git clean`</span></div></code>
</div>
<div data-ty="input">
    <code class="language-bash">git config --global <span class="c-purple">http.proxy</span> 'http://username:password@server.com:port'</code>
</div>
<div data-ty="input">
    <code class="language-bash">git config --global <span class="c-purple">http.proxy</span> 'socks5://server.com:port'</code>
</div>
</div>

#### Aliases

<div data-termynal>
<div data-ty="input">
    <code class="language-bash">git config --global <span class="c-blue">alias</span>.<span class="c-green">st</span> status</code>
</div>
</div>

#### Unset and List

<div data-termynal>
<div data-ty="input">
<code class="language-bash"><div class="has-desc"><span>git config --global <span class="c-red">--unset</span> http.proxy</span><span class="c-yellow"><- use `--unset` to clear a config</span></div></code>
</div>
<div data-ty="input">
    <code class="language-bash">git config <span class="c-blue">--list</span> # List all configs</code>
</div>
</div>

---

## Git Ignore

Avoid some files to be tracked by git by `.gitignore`.

Prebuilt gitignore files: [gitignore.io](https://gitignore.io/)

### Syntax

- `*` matches any file
  - `src/folder/*` ignores all files inside `src/folder/`
- `**` matches any path
  - `src/**/folder` ignores every subfolder inside `src/`
  - `src/**/*` ignores all files and folders inside `src/`
- Comments start with `#`
- `!` negates the pattern
  - `!src` Will not ignore `src/`
