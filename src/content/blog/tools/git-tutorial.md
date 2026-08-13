---
title: Git Tutorial
description: GIT is a distributed VCS (version control system) which targets speed amongst other improvements in regard to other VCS. It was developed by Linus Torvalds in order to provide a...
date: '2015-02-20'
draft: false
showHeroImage: false
tags: [Tools]
categories: [Tools]
comments: false
sidebar:
  enable: true
  toc: true
  relatedPosts: true
---

<h1>Description</h1>
<p>GIT is a distributed VCS (version control system) which targets speed amongst other improvements in regard to other VCS. It was developed by Linus Torvalds in order to provide a better VCS for development of Linux Kernel thus moving out form the proprietary BitKeeper. Git is more complex to learn that SVN but provides a number of improvements especially when working with distributed repositories. Among the major differences are that:</p>
<ul>
<li>GIT it is faster than SVN;</li>
<li>GIT repositories are smaller than SVN repositories (data in GIT repositories is represented by a highly compressed binary structure);</li>
<li>GIT metadata is stored in a single location in the root of the repository (in the .git folder) and the SVN metadata is scattered in each folder from the repository;</li>
<li>branching in GIT is simpler than branching in SVN.</li>
</ul>
<p>There are however drawbacks of Git compared to SVN not only in terms of the steep learning curve - for example IDE and tooling support for SVN is more mature and easier to use in most cases than the one provided for Git. One of the first things for new Git users (especially those that come from the world of SVN) is the fact that when switching between branches you work in the same directory structure - just the contents of files are switched.<br>Git is initially developed under Linux but has ports for multiple operating systems. The following picture provides a general overview of how a Git infrastructure looks like compared to an SVN infrastructure:</p>
<p><img title="GDO Public KB &gt; GIT &gt; git_svn_overview.png" src="/images/legacy/tools/git-tutorial/git_svn_overview.png" data-image-src="/download/attachments/270063818/git_svn_overview.png?version=1&amp;modificationDate=1424460412000&amp;api=v2" data-linked-resource-id="270243344" data-linked-resource-type="attachment" data-linked-resource-default-alias="git_svn_overview.png" data-base-url="https://kb.epam.com" data-linked-resource-container-id="270063818" data-location="GDO Public KB &gt; GIT &gt; git_svn_overview.png" width="732" height="347" alt="git svn overview"></p>
<p>Let's assume the rectangles are branches - then in red is the area that keeps files not under control of the VCS ("untracked files") and already tracked but modified files (only in case of Git), in green is the area that keeps files ready to be sent to the server (in case of SVN) or to another repository (in case of Git) and in yellow is the area that keeps files ready to be added to a single commit (also called "staging area") that goes to the green area. As you can see in SVN we don't have a staging area - in order to send files to server you have to follow a two step process of adding the files from the red area to the green area and then sending the files from the green area to the server in the form of a single commit. In Git however you first have to add any changes from the red area ("untracked" and modified files) to the yellow area (the staging area), then create a commit from the files in the yellow area and adding it to green area, and finally - pushing all commits from the green area to another Git repository. The process of retrieving modified files in SVN is also pretty simple - you just update your current branch with the latest changes from the SVN server. In Git however a separate "remote tracking branch" is first created when retrieving files from a remote repository branch - after that changes are applied (merged or rebased - this is clarified in the section with examples) from that remote tracking branch to the local repository branch - essentially meaning that in SVN this is a one-step process while in Git it is a two-step process. Moreover in Git you have to clone a full repository initially while in SVN you can checkout a separate folder from the SVN server.</p>
<p>There are many tools created to simplify usage of Git such as:</p>
<ul>
<li>gitk - a GUI client for viewing commit log history and changes (can be started directly from the command line by typing gitk);</li>
<li>git gui - a GUI client for working with files in the current repository (adding files to the staging area, creating commits, pushing files to a remote repository and others);</li>
<li>jGIT - Java library arround git;</li>
<li>eGIT (Eclipse GIT) - the Eclipse integration for GIT (IntelliJ and Netbeans also provide integration for Git);</li>
<li>Gerrit uses also JGit and incorporates a tool for source code reviews;</li>
<li>GitHub provides a custom platform for working with GIT;</li>
<li>GitLab also provides a custom platform for working with GIT;</li>
<li>Stash is a commercial product that provide code review capabilities and integration with JIRA.</li>
</ul>
<h1>Usage &amp; Configuration</h1>
<h2>Installing in Linux</h2>
<p>Depending on the Linux distribution and the package manager it has you can install git directly from the command line. For example in Ubuntu in could be as simple as:</p>
<table>
<tbody>
<tr><th>sudo apt-get install git</th></tr>
</tbody>
</table>
<h2>Installing in Windows</h2>
<p>In Windows-based operating systems one of the most widely use options is to install Msysgit which provides native support for Git in Windows along with a bash shell emulator (Git Bash). Another option is to use git preinstalled with a Linux emulator for Windows such as Cygwin.</p>
<h2>Basic configuration</h2>
<p>The git configuration for a repository is stored centrally either for all users and all repositories, for a particular user and all repositories for that user or in the .git/config file of a repository (depending on your OS). You can either modify manually the contents of any of these file or using a Git command for the purpose - the following example configures a user name and email globally for all users and all repositories that will be used when creating commits:</p>
<table>
<tbody>
<tr><th>
<pre>git config --global&nbsp;<a href="http://user.name/">user.name</a>&nbsp;"John Douglas"<br>git config --global user.email "John_Douglas@sample<a href="http://epam.com/">.com</a>"</pre>
</th></tr>
</tbody>
</table>
<p>You can also configure particular tools for two-way or three-way merge or for diff purposes. The following example configures KDiff3 as both a merge and diff tool for git (the&nbsp;<strong>mergetool</strong>&nbsp;and&nbsp;<strong>difftool</strong>&nbsp;commands will use KDiff3):</p>
<table>
<tbody>
<tr><th>
<blockquote>
<p>[diff]<br>tool = kdiff3</p>
<p>[merge]<br>tool = kdiff3</p>
<p>[mergetool "kdiff3"]<br>path = D:/software/KDiff3/kdiff3.exe<br>keepBackup = false<br>trustExitCode = false</p>
<p>[difftool "kdiff3"]<br>path = D:/software/KDiff3/kdiff3.exe<br>keepBackup = false<br>trustExitCode = false</p>
</blockquote>
</th></tr>
</tbody>
</table>
<h1>Basic Examples</h1>
<p>Creating a new repository is pretty simple - the following example creates the 'sample' Git repository:</p>
<table>
<tbody>
<tr><th>
<pre>mkdir sample<br>cd sample<br>git init&nbsp;</pre>
</th></tr>
</tbody>
</table>
<p>Cloning a remote repository (thus getting all the files and remote repository metadata to a local repository) is also pretty straightforward - the following example clones a remote repository indicated by a URL into the <b>equinox-rt&nbsp;</b>folder:</p>
<table>
<tbody>
<tr><th>
<pre>git clone&nbsp;<a href="git://git.eclipse.org/gitroot/equinox/rt.equinox.bundles.git">git://git.eclipse.org/gitroot/equinox/rt.equinox.bundles.git</a>&nbsp;equinox-rt</pre>
</th></tr>
</tbody>
</table>
<p>Once the remote repository is cloned to the&nbsp;<strong>equinox-rt&nbsp;</strong>folder an alias called&nbsp;<strong>origin</strong>&nbsp;is created that points to the URL of the remote repository - when fetching changes from that remote repository of pushing changes to that remote repository you can use the origin alias to point to that repository - by default each branch in the local repository uses the&nbsp;<strong>origin</strong>&nbsp;alias for determining the location of fetch/push target branches.</p>
<p>Fetching changes from a remote repository can be done in several steps - the following example is a four-step process for updating the current branch with changes from the remote&nbsp;<strong>origin</strong>&nbsp;branch:</p>
<table>
<tbody>
<tr><th>
<pre>git fetch<br>git stash save<br>git rebase<br>git stash pop</pre>
</th></tr>
</tbody>
</table>

<p>When fetching changes from the remote repository being tracked by default (the one referenced by the&nbsp;<strong>origin</strong>&nbsp;alias) - a remote tracking branch is used to hold the fetched changes - this is done as in the first step. In order to apply the changes from the remote repository to the local branch you should not have any uncommited changes (whether or not they are present in the staging area) - for that reason you can place them in a temporary area called a&nbsp;<strong>stash&nbsp;</strong>- this is done in the second step. In the third step you apply the changes from the remote repository in your local branch but before your local commits - they are applied sequentially at the end of the rebase based on the order in which they are commited in the local branch. In the third step you can also do a merge instead of a rebase. The following picture describes the difference between the two:</p>
<p><img title="GDO Public KB &gt; GIT &gt; git_merge_rebase.png" src="/images/legacy/tools/git-tutorial/git_merge_rebase.png" data-image-src="/download/attachments/270063818/git_merge_rebase.png?version=1&amp;modificationDate=1424511714679&amp;api=v2" data-linked-resource-id="270243415" data-linked-resource-type="attachment" data-linked-resource-default-alias="git_merge_rebase.png" data-base-url="https://kb.epam.com" data-linked-resource-container-id="270063818" data-location="GDO Public KB &gt; GIT &gt; git_merge_rebase.png" width="732" height="347" alt="git merge rebase"></p>
<p>During a rebase the commits from the remote repository (in this case C2 and C3) are applied from the remote tracking branch to the local branch after commit C1 - this is the last commit fetched from the remote branch. After the that the local commits (in this case C4 and C5 are applied after commits C4 and C5. As you can probably notice when applying commits C4 and C5 conflicts might occur (e.g. commit C4 conflicts with commit C2 from the remote branch). In that case Git stops the rebase process and gives you the opportunity to merge conflicting changes before continuing to apply local commits. After merge is performed you can either abort or continue with the rebase (using the --abort or --continue flags in a rebase command). If you do a merge then the commits are applied separately on top of commit C1 but at the end there is the so-called "merge" commit that combines the changes from both commit chains. You can also trigger merging of conflicting changes with the following command (note - a mergetool must be configured as specified in the previous section):</p>
<table>
<tbody>
<tr><th>
<pre>git mergetool</pre>
</th></tr>
</tbody>
</table>
<p>You can combine the fetching and rebasing from a remote repository by using the following command:</p>
<table>
<tbody>
<tr><th>
<pre>git pull --rebase</pre>
</th></tr>
</tbody>
</table>
<p>Pushing changes to a remote repository can be done in several steps:</p>
<table>
<tbody>
<tr><th>
<pre>git add .<br>git commit -m "&lt;some proper commit message&gt;"<br>git push origin HEAD</pre>
</th></tr>
</tbody>
</table>
<p>First we are adding all changes to files and untracked files to the staging area - you can also provide a list of files instead of a dot (.) which denotes all files (if you want to remove a file you have to use the&nbsp;<strong>rm</strong>&nbsp;command instead of the&nbsp;<strong>add</strong>&nbsp;command). After that we create a commit with a proper commit message from all files in the staging area - you can also list particular files from the staging area during the commit so that only a subset of the files in the staging area are included to the commit. At the end we push that commit (and possible any other commits not already pushed) from to&nbsp;<strong>origin</strong>&nbsp;repository (the default one) and the remote branch that corresponds to the local one - if you omit the repository and the branch reference then you will push all local commits to the default&nbsp;<strong>origin</strong>&nbsp;repository into the corresponding remote branches.<br>Reverting changes in Git can be done based on the state of your files in the version control system:</p>
<ul>
<li>when the file is untracked - in that case it outside of Git control and you don't have to revert anything;</li>
</ul>
<ul>
<li>when staged - the following example removes the changes from the hello.java file:</li>
</ul>
<table>
<tbody>
<tr><th>
<pre>git reset HEAD hello.java<br>git checkout hello.java</pre>
</th></tr>
</tbody>
</table>
<p>The first command removes the file from the staging area and the second one reverts the changes made to the file.</p>
<ul>
<li>when commited locally - in that case you have different options depending on what you want to achieve - whether you want to remove the commit and return the files to the stating area, whether you want to remove the commit and return the files as unstaged or whether you want to remove the commit and revert the changes made to the files - the three options can be achieved with the following commands:</li>
</ul>
<table>
<tbody>
<tr><th>
<pre>git reset&nbsp;–soft HEAD^<br>git reset HEAD^<br>git reset&nbsp;–hard HEAD^&nbsp;</pre>
</th></tr>
</tbody>
</table>
<p>You can view all branches using the following commands (the second one displays also remote tracking branches):</p>
<table>
<tbody>
<tr><th>
<pre>git branch<br>git branch -a</pre>
</th></tr>
</tbody>
</table>
<p>The following example creates a new branch called&nbsp;<strong>test&nbsp;</strong>that starts from the first commit in the current branch and then creates a remote tracking branch by specifying the branch in a remote repository that will be tracked (for pusing/fetching changes) - in that case&nbsp;<strong>origin/master</strong>:</p>
<table>
<tbody>
<tr><th>
<pre>git checkout -b test<br>git branch -a origin/master test&nbsp;</pre>
</th></tr>
</tbody>
</table>
<p>The above two steps can be combined with the following command:</p>
<table>
<tbody>
<tr><th>
<pre>git checkout origin/master -b test</pre>
</th></tr>
</tbody>
</table>
<p>Deleting a branch is done with the following command:</p>
<table>
<tbody>
<tr><th>
<pre>git branch -d test</pre>
</th></tr>
</tbody>
</table>
<p>In case you have any commits you have to force delete the branch:</p>
<table>
<tbody>
<tr><th>
<pre>git branch -D test</pre>
</th></tr>
</tbody>
</table>
<p>If you want to switch (let's say&nbsp;<strong>master</strong>) to another branch in your local repository you can use the following command:</p>
<table>
<tbody>
<tr><th>
<pre>git checkout master&nbsp;</pre>
</th></tr>
</tbody>
</table>
<p>Even shorter alternative:</p>
<table>
<tbody>
<tr><th>
<pre>git co master</pre>
</th></tr>
</tbody>
</table>
<p>Git stores references to remote repositories in the form of aliases - when you clone a repo a default alias called&nbsp;<strong>origin</strong>&nbsp;is created that points to the URL of the repo. In order to see all remotes in a repository you can use the following command:</p>
<table>
<tbody>
<tr><th>
<pre>git remote show</pre>
</th></tr>
</tbody>
</table>
<p>In order to see the URL of the origin repository you can use the following command:</p>
<table>
<tbody>
<tr><th>
<pre>git remote show origin</pre>
</th></tr>
</tbody>
</table>
<p>The following example adds a new remote repository with alias <b>equinox-rt&nbsp;</b>that points to the&nbsp;<a href="git://git.eclipse.org/gitroot/equinox/rt.equinox.bundles.git">git://git.eclipse.org/gitroot/equinox/rt.equinox.bundles.git</a>&nbsp;repository:</p>
<table>
<tbody>
<tr><th>
<pre>git remote add equinox-rt <a href="git://git.eclipse.org/gitroot/equinox/rt.equinox.bundles.git">git://git.eclipse.org/gitroot/equinox/rt.equinox.bundles.git</a></pre>
</th></tr>
</tbody>
</table>
<p>The following command removes the <b>equinox-rt&nbsp;</b>alias:</p>
<table>
<tbody>
<tr><th>
<pre>git remote remove equinox-rt</pre>
</th></tr>
</tbody>
</table>
<p>You can inspect the changes to files in the current branch with the following command:</p>
<table>
<tbody>
<tr><th>
<pre>git status</pre>
</th></tr>
</tbody>
</table>
<p>You can list all the files that have beed commited in the current branch (and that are both in the Git index and the working tree):</p>
<table>
<tbody>
<tr><th>
<pre>git ls-files</pre>
</th></tr>
</tbody>
</table>
<p>The following command displays the commit log history - each commit is identified by a unique hash:</p>
<table>
<tbody>
<tr><th>
<pre>git log</pre>
</th></tr>
</tbody>
</table>
<p>The following command displayes the commit log history along with the list of changed files for each commit:</p>
<table>
<tbody>
<tr><th>
<pre>git log --stat</pre>
</th></tr>
</tbody>
</table>
<p>The following command displays the changes made to the&nbsp;<strong>sample.txt</strong>&nbsp;file in the current branch:</p>
<table>
<tbody>
<tr><th>
<pre>git log -p sample.txt</pre>
</th></tr>
</tbody>
</table>
<p>The following command shows the changes made to a particular directory:</p>
<table>
<tbody>
<tr><th>
<pre>git log -p -10 test/</pre>
</th></tr>
</tbody>
</table>
<p>The following command shows the files changed for a commit that starts with as hash code of&nbsp;bd61ad98.</p>
<table>
<tbody>
<tr><th>
<pre>git show --pretty="format:" --name-only bd61ad98</pre>
</th></tr>
</tbody>
</table>
<p>The following command allows you to get help for the&nbsp;<strong>push</strong>&nbsp;command (help is available for basically all of the git commands):</p>
<table>
<tbody>
<tr><th>
<pre>git help push</pre>
</th></tr>
</tbody>
</table>
<p>The following command creates a patch (diff) with the changes made in the last commit and saves it to a file patch.diff:</p>
<table>
<tbody>
<tr><th>
<pre>git diff HEAD HEAD^ &gt; D:/patch.diff</pre>
</th></tr>
</tbody>
</table>
<p>The following command displayes the changes made in the last commit using the configured diff tool:</p>
<table>
<tbody>
<tr><th>
<pre>git difftool</pre>
</th></tr>
</tbody>
</table>
<p>The following example applies the patch.diff patch to the current branch:</p>
<table>
<tbody>
<tr><th>
<pre>git apply --reject D:/patch.diff</pre>
</th></tr>
</tbody>
</table>
<p>Once you have pushed your changes in your feature branch and pushed them to a remote repository (e.g. managed by Stash or GitHub) then you can create a pull request for a particular commit for addition to the master branch or another branch in possibly another repository.</p>
<h1>References</h1>
<p>Wikipedia's entry on Git<br><a href="https://en.wikipedia.org/wiki/Git_%28software%29"></a><a href="https://en.wikipedia.org/wiki/Git_%28software%29">http://en.wikipedia.org/wiki/Git_%28software%29</a>&nbsp;</p>
<p>Git tutorial (vogella.de)<br><a href="http://www.vogella.com/tutorials/Git/article.html"></a><a href="http://www.vogella.com/tutorials/Git/article.html">http://www.vogella.com/tutorials/Git/article.html</a></p>
<p>Git book<br><a href="http://git-scm.com/book/en/v2"></a><a href="http://git-scm.com/book/en/v2">http://git-scm.com/book/en/v2</a></p>
<p>Git/SVN comparison<a href="http://git-scm.com/book/en/v2"><br></a><a href="https://git.wiki.kernel.org/index.php/GitSvnComparison"></a><a href="https://git.wiki.kernel.org/index.php/GitSvnComparison">https://git.wiki.kernel.org/index.php/GitSvnComparison</a><a href="http://git-scm.com/book/en/v2">&nbsp;</a></p>
<p>MsysGit<a href="https://msysgit.github.io/"><br></a><a href="https://msysgit.github.io/">https://msysgit.github.io/</a></p>
<p>Cygwin<br><a href="https://www.cygwin.com/"></a><a href="https://www.cygwin.com/">https://www.cygwin.com/</a></p>
<p>Using pull requests in Git Stash<br><a href="https://confluence.atlassian.com/display/STASH/Using+pull+requests+in+Stash"></a><a href="https://confluence.atlassian.com/display/STASH/Using+pull+requests+in+Stash">https://confluence.atlassian.com/display/STASH/Using+pull+requests+in+Stash</a></p>
<p><a href="https://confluence.atlassian.com/display/STASH/Using+pull+requests+in+Stash">&nbsp;</a></p>
<p><a href="https://www.cygwin.com/">&nbsp;</a></p>
