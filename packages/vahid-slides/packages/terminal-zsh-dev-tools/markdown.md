class: center, middle

## Maximize Your Terminal Productivity

_By: Vahid Mohammadi_

<div class="fz-14">
    <i>Created with: <a href="https://github.com/gnab/remark">RemarkJS</a></i>
</div>

---

## Shells

### Bash Alternatives

*   ZSH:

    -   [Oh My Zsh](https://github.com/robbyrussell/oh-my-zsh)
    -   [Theme](https://github.com/robbyrussell/oh-my-zsh/wiki/Themes)
    -   [Plugins](https://github.com/robbyrussell/oh-my-zsh/tree/master/plugins)
        -   zsh-autosuggestions
        -   zsh-syntax-highlighting
        -   zsh-completions
        -   dirhistory
        -   command-not-found

--

*   FISH:

    -   Package managers: [Oh My Fish](https://github.com/oh-my-fish/oh-my-fish), Fisher, Fisherman, Fundle, etc.
    -   [Theme](https://github.com/oh-my-fish/oh-my-fish/blob/master/docs/Themes.md)
    -   Plugins: `omf search ...` 
        -   Bass: Run bash inside fish

---

## Write Your Own Plugins

Profile files: `.bashrc` , `.zshrc` 

[Bash Cheatsheet](https://devhints.io/bash)
<br>
<br>

### Alias

* `alias open="xdg-open"` 
* `alias -s {yml,yaml}=vim` 
* `alias gitlog = "git log --oneline --decorate --color"` 
* `alias lsize="du -sch *(D) | sort -rh"` 
* `alias ltree="ls -l --tree"` 

--

### Bookmarks

* [wd](https://github.com/mfaerevaag/wd): zsh only
* [to](https://github.com/joehillen/to-fish): fish only
* [autojump](https://github.com/wting/autojump): A cd command that learns
* [z](https://github.com/rupa/z): jump around
* [ProjectMan](https://dev.to/saurabhdaware/projectman-is-here-add-projects-to-favorites-and-open-them-from-command-line-5d7k): Quick access your projects

---

## Terminal Tools

*   Clipboard manager: [CopyQ](http://tipsonubuntu.com/2018/02/18/install-copyq-clipboard-manager-3-2-ubuntu-18-0416-04/), [gnome extention](https://extensions.gnome.org/extension/779/clipboard-indicator/), [paste (Mac)](https://pasteapp.me)
*   [Storm](https://github.com/emre/storm): Manage SSH Connections
*   [Mosh](https://mosh.org/): intermittent connectivity
*   [fd](https://github.com/sharkdp/fd): Forget Find
*   [Peco](https://github.com/peco/peco): Forget grep
    - `omf install peco` for FISH, **zsh-navigation-tools** for ZSH
*   [fzf](https://github.com/junegunn/fzf): Forget everything
    - [Examples](https://github.com/junegunn/fzf/wiki/examples)
*   [ColorLs](https://github.com/athityakumar/colorls): Rich ls
*   [translate-shell](https://github.com/soimort/translate-shell): Google translate in Terminal
*   [mackup](https://github.com/lra/mackup): Backup configuration files

---

## Emacs & Vim in Terminal

When using ZSH or FISH, Terminal is like emacs. Run `bindkey -L | fzf` to see the keybindings.[Emacs cheatsheet](https://gist.github.com/dherman/3238368)

You can change it to Vim: `bindkey -v` .[Vim documentation](https://devhints.io/vim)

--
<br>
<br>

## File Manager

*   [Get Terminal in Nautilus](https://www.linuxuprising.com/2018/09/get-terminal-embedded-in-nautilus-file.html)
*   [Ranger](https://github.com/ranger/ranger): File manager in terminal

--
<br>

## Terminal Alternatives

*   Terminator
*   iTerm (Mac)
*   Tmux
*   [More](https://terminalsare.sexy/#terminal-emulation-applications)

---

## Other Useful Tools

*   [Station](https://getstation.com): A single place for all web applications
*   [DevHints](https://devhints.io): Cheatsheets
*   [RepoZ (Mac)](https://github.com/awaescher/RepoZ/): Manage git repositories
*   [SurfingKeys](https://chrome.google.com/webstore/detail/gfbliohnnapiefjpjlpjnehglfpaknnc): Vim in Browser

<!-- --

<br>

### Music!

*   Use [Spotify](https://www.spotify.com/us/download/) app.[SoundNode](http://www.soundnodeapp.com) or [Auryo](https://auryo.com) apps for [SoundCloud](https://soundcloud.com)
*   Fix bluetooth problems with headphones:
    -   Upgrade bluez: [Medium link](https://medium.com/@overcode/fixing-bluetooth-in-ubuntu-pop-os-18-04-d4b8dbf7ddd6)
    -   Bluetooth quick connect: [Gnome extension](https://extensions.gnome.org/extension/1401/bluetooth-quick-connect/)
    -   Get bluetooth device battery charge: [Stackoverflow answer](https://askubuntu.com/a/216121/656685)
*   پراکسی شرکت واسه اسپاتیفای -->

---

## Text Manipulation

*   Online tools:

    -   [OnlineTextTools](https://onlinetexttools.com)
    -   [TextMechanic](https://textmechanic.com)
    -   [DiffChecker](https://www.diffchecker.com)

*   Terminal tools:

    -   [Sed](https://devhints.io/sed)

*   Sublime Text Editor:

---

## Sublime Text Manipulation Features

* `ctrl+shift+p` : All sublime commands
    - set syntax: For better syntax highlight
* `alt+{Arrow}` : For wordPart Navigation (Supports `alt+shift+{arrow}` )

*   Multiline Features:
    - `ctrl+d` : select words
        - `alt+f3` : select
        - `ctrl+k ctrl+d` : skip word and select next
        - `ctrl+u` : undo cursor
        - `ctrl+click` : multi cursor
        - `ctrl+double+click` : multi word select
        - `alt+drag` : partial select
        - `ctrl+shift+L` : Split selection to lines

* `ctrl+j` : Join lines (highlight everything before it)
* `ctrl+g` : Go to line
* `ctrl+f` : Find
    - `enter` & `shift+enter` & `alt+enter` (For multiline select)
* `ctrl+h` : Find & Replace
    - `ctrl+shift+h` & `ctrl+alt+enter` 

