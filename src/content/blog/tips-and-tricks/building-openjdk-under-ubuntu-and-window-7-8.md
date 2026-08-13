---
title: Building OpenJDK under Ubuntu and Window 7/8
description:    There are a lot of resources for building OpenJDK under various operating systems (see Resources section). I will provide some details around the development environment setu...
date: '2013-11-27'
draft: false
showHeroImage: false
tags: [Tips and Tricks]
categories: [Tips and Tricks]
comments: false
sidebar:
  enable: true
  toc: true
  relatedPosts: true
---

<p>&nbsp; &nbsp;There are a lot of resources for building OpenJDK under various operating systems (see <strong><span>Resources</span></strong> section). I will provide some details around the development environment setup process in regard to Ubuntu 12.04 and Windows 7/8. I have also prepared a VirtualBox VM with development environment for Ubuntu which you can download from GitHub (see link in <strong>Resources</strong> section). Let's get started.</p>
<h1>Setting up for Ubuntu 12.04</h1>
<p>&nbsp; &nbsp;The process for setting up under Ubuntu (and similar Linux distros) is pretty straightforward - you can follow the instructions from the Adopt OpenJDK wiki (see references). Here is a typical directory structure for an OpenJDK development environment:</p>
<p><strong>&nbsp; &nbsp;/home/openjdk/dev/jdk8_tl</strong> -&gt; the root Mercurial repository for the OpenJDK 8 project</p>
<p><strong>&nbsp; &nbsp;/home/openjdk/dev/jdk8_tl/corba</strong> -&gt; child repository for the CORBA (Common Object Request Broker Architecture) project</p>
<p><span><strong>&nbsp; &nbsp;/home/openjdk/dev/jdk8_tl/langtools</strong> -&gt; child repository for the JDK-related tools (the <strong>javac</strong> compiler, the <strong>javap</strong> tool for byte code inspection, the <strong>javadoc</strong> tool and others)</span></p>
<p><span><span><strong>&nbsp; &nbsp;/home/openjdk/dev/jdk8_tl/hotspot</strong> -&gt; the child repository for the Hotspot JVM project (contains C/C++ source code of the JVM including assembly code for the particular combination of operating system and CPU architecture)</span></span></p>
<p><span><span><strong>&nbsp; &nbsp;/home/openjdk/dev/jdk8_tl/jdk</strong> -&gt; the child repository for the JDK core classes and libraries</span></span></p>
<p><span><span><strong>&nbsp; &nbsp;/home/openjdk/dev/jdk8_tl/jaxp</strong> -&gt; the child repository for the JAXP (Java Architecture for XML processing) project</span></span></p>
<p><span><span><strong>&nbsp; &nbsp;/home/openjdk/dev/jdk8_tl/jaxws</strong> -&gt; the child repository for the JAX-WS core classes</span></span></p>
<p><strong>&nbsp; &nbsp;/home/openjdk/dev/workspace</strong>&nbsp;-&gt; this the Eclipse workspace for the OpenJDK projects</p>
<p><span><strong>&nbsp; &nbsp;/home/openjdk/dev/tools&nbsp;</strong><span>-&gt; contains the various tools needed for OpenJDK development<br></span></span><strong></strong></p>
<p><strong>&nbsp; &nbsp;/home/openjdk/dev/tools/jtreg&nbsp;</strong>-&gt; contains the JTReg tool for executing OpenJDK tests<br><strong></strong></p>
<p><strong>&nbsp; &nbsp;/home/openjdk/dev/tools/jcheck.py&nbsp;</strong><span>-&gt; the jcheck Mercurial extensions that provides validation for Mercurial changesets (may be refered from .hg/hgrc Mercurial configuration in the jdk8_tl root repository but is optional)&nbsp;</span></p>

<p><span><span>Regarding the import in Eclipse there are several options:</span></span></p>
<p><span><span>&nbsp; &nbsp;- import projects from Ant scripts as specified in the Adopt OpenJDK wiki - I found this not to be very convenient because you may have to manually provide <strong>javac</strong> targets for some of the projects in the Ant scripts if you want to be able to import and link to source directories;</span></span></p>
<p><span><span>&nbsp; &nbsp;- creating new projects in the corresponding project folders from the OpenJDK repository - Eclipse will try to automatically find source folder and will create <strong>.classpath</strong> and <strong>.project</strong> files in the corresponding folders - this is the preferred option since it is easier to customize you project configuration from within Eclipse.</span></span></p>
<p>&nbsp; &nbsp;In both cases you might have to manually modify the <strong>.classpath</strong> and/or <strong>.project</strong> files in order to include additional source/test folders in your projects. In both cases if you want to build with Ant you have to modify the <strong>build.properties</strong> files and link them to the corresponding <strong>build.xml</strong> file as noted by the AdoptOpenJDK wiki. However the latest build instructions for OpenJDK specify that building from Ant is deprecated (and no longer supported) so it is most convenient to link appropriate external tool configurations for running the corresponding <strong>make</strong> targets when building the projects from Eclipse.</p>

<h1>Setting up for Windows 7/8</h1>
<p><span>&nbsp; &nbsp;The build process for Windows may use Cygwin as a Linux emulator for the build environment under Windows. The C++ compiler supplied by the Windows 7 SDK for .Net 4 and the FreeType library are also required for building under Windows. Depending on your CPU architecture (32 or 64 bit) you may have to use different versions of the applications and FreeType requires a separate step for compilation under 64 bit Windows (which is pretty simple and is described in most of the guides provided below). Another important thing to note here is that Cygwin uses separate format for the PATH entries (starting with <strong>/cygdrive/</strong>...) that emulates Windows format <strong>PATH</strong> entries. There are separate <strong>PATH</strong> entries that are being set when running the Windows 7 SDK and the latest version of the <strong>configure</strong> script for OpenJDK tries to automatically set these variables by finding and running an appropriate script from the Windows 7 SDK installation that sets them.</span></p>
<p>&nbsp; &nbsp;For setting up on Windows 7/8 I suggest following the steps from the the&nbsp;betoweb.com blog entry 1 by 1 (see references below) with several exceptions I encountered:</p>
<ul>
<li>the latest versions of the Cygwin have problem with OpenJDK regarding <strong>ccache</strong> and so it must be disabled by passing the <strong>--disable-ccache</strong> switch when running the <strong>configure</strong> script (or you can use a version of Cygwin lower than 1.7.9 as suggested in the mailing lists);<br><br></li>
<li>the configure script may file to find some of the Windows SDK 7 path entries so you must set by hand before running the <strong>configure</strong> script (in my case the <strong>LIB</strong> variable was not set by <strong>configure </strong>and I have to run <em>export LIB="D:\software\Microsoft Visual Studio 10.0\VC\LIB\amd64;D:\software\Microsoft Visual Studio 10.0\VC\ATLMFC\LIB\amd64;C:\Program Files (x86)\Microsoft SDKs\Windows\v7.0A\lib\x64;C:\Program Files\SQLXML 4.0\bin" </em>from the Cygwin bash console before running <strong>configure</strong>).</li>
</ul>
<p>&nbsp; &nbsp;After testing that you are able to successfully build from the command line - import of projects in your IDE is relatively straightforward using the same process for Ubuntu with several differences. When setting up an external tool configuration for make you have to set also a custom PATH and ALT_OUTPUTDIR variables as shown on the following diagram:</p>
<p><img src="/images/legacy/tips_and_tricks/building-openjdk-under-ubuntu-and-window-7-8/make_hotspot.gif" width="600" height="371"></p>
<p>&nbsp; &nbsp;Here ALT_OUTPUTDIR points to the output directory for the Hotpost build (in my case this is&nbsp;/cygdrive/d/projects/OpenJDK/dev/jdk8_tl/build/windows-x86_64-normal-server-release/hotspot specified as a Cygwin path).<br>&nbsp; &nbsp;The PATH variable overrides the one for the projects (in my case it is &nbsp;C:\Windows\System32;D:\software\cygwin64\bin;D:\software\Microsoft Visual Studio 10.0\VC\BIN\amd64\ - the first is reguired for the 'reg' command, the second is the Cygwin directory of packages and the third one is required for the 'nmake' utility).<br>&nbsp; &nbsp;As a <strong>Location</strong> from the <strong>Main</strong> tab you have to specify a bat file that first includes Visual Studio environment variables and then calls 'make' passing corresponding arguments. Here is the script I am using instead of directly pointing to make.exe:</p>
<table border="0">
<tbody>
<tr>
<td><span>@echo off</span><br><span>call "D:\software\Microsoft Visual Studio 10.0\VC\bin\amd64\vcvars64.bat"</span><br><span>D:\software\cygwin64\bin\make.exe %*</span></td>
</tr>
</tbody>
</table>

<p><span>Resources</span></p>
<p><strong>OpenJDK 8 Development Environment</strong>&nbsp;(Virtual Box VM with Ubuntu 12.04 and Eclipse 4.3)<br><a href="https://github.com/martinfmi/openJDK_Ubuntu_12.04_Eclipse">https://github.com/martinfmi/openJDK_Ubuntu_12.04_Eclipse</a><a href="https://github.com/martinfmi/openJDK_Ubuntu_12.04_Eclipse"></a></p>
<p><strong>Adopt OpenJDK wiki entry on building your own environment</strong>&nbsp;(can be followed step by step - most suitable for setting up on Linux)<br><a href="https://java.net/projects/adoptopenjdk/pages/AdoptOpenJDKBuildInstructions"></a><a href="https://java.net/projects/adoptopenjdk/pages/AdoptOpenJDKBuildInstructions">https://java.net/projects/adoptopenjdk/pages/AdoptOpenJDKBuildInstructions</a></p>
<p><strong>Hacking Hotspot in Eclipse Juno under Ubuntu 12.04</strong>&nbsp;(provides additional detailes on running the Hotspot from Eclipse)&nbsp;<br><a href="http://neomatrix369.wordpress.com/2013/03/12/hotspot-is-in-focus-again-aka-hacking-hotspot-in-eclipse-juno-under-ubuntu-12-04/">http://neomatrix369.wordpress.com/2013/03/12/hotspot-is-in-focus-again-aka-hacking-hotspot-in-eclipse-juno-under-ubuntu-12-04/</a><a href="http://neomatrix369.wordpress.com/2013/03/12/hotspot-is-in-focus-again-aka-hacking-hotspot-in-eclipse-juno-under-ubuntu-12-04/"></a></p>
<p><strong>Building OpenJDK on Windows </strong>(one of the latest articles - refers to older build instructions for insights)<strong><br></strong><a href="http://www.royvanrijn.com/blog/2013/10/building-openjdk-on-windows/">http://www.royvanrijn.com/blog/2013/10/building-openjdk-on-windows/</a></p>
<p><strong>Building OpenJDK on Windows 8</strong> (one of the latests articles as of the time of this writing)<br><a href="http://betoweb.com.br/blog/2013/07/12/building-openjdk-on-ms-windows-8/"></a><a href="http://betoweb.com.br/blog/2013/07/12/building-openjdk-on-ms-windows-8/">http://betoweb.com.br/blog/2013/07/12/building-openjdk-on-ms-windows-8/</a></p>
<p><strong>Build Java 8 on Windows</strong> (another article that refers to the previous one)<br><a href="http://lhochet.blogspot.fr/2013/01/building-java-8-on-windows.html"></a><a href="http://lhochet.blogspot.fr/2013/01/building-java-8-on-windows.html">http://lhochet.blogspot.fr/2013/01/building-java-8-on-windows.html</a></p>
<p><strong>Building OpenJDK on Windows</strong> (little outdated but provides valid insights on some of the steps)<br><a href="https://stas-blogspot.blogspot.com/2012/09/building-openjdk-on-windows.html">http://stas-blogspot.blogspot.com/2012/09/building-openjdk-on-windows.html</a></p>
<p><strong>YAOJOWBI - Yet another OpenJDK on Windows Build Instruction </strong>(also a little outdated but provides good insights as well)<br> <a href="https://weblogs.java.net/blog/simonis/archive/2011/10/28/yaojowbi-yet-another-openjdk-windows-build-instruction">https://weblogs.java.net/blog/simonis/archive/2011/10/28/yaojowbi-yet-another-openjdk-windows-build-instruction</a>&nbsp;</p>
<p><strong>Build OpenJDK on Windows with NetBeans</strong><span>&nbsp;(outdated)</span><br><a href="https://blogs.oracle.com/poonam/entry/building_openjdk_on_windows"></a><a href="https://blogs.oracle.com/poonam/entry/building_openjdk_on_windows">https://blogs.oracle.com/poonam/entry/building_openjdk_on_windows</a></p>
<p><strong>Build instructions for the OpenJDK 7 project</strong> (outdated)<br><a href="http://hg.openjdk.java.net/jdk7/build/raw-file/tip/README-builds.html">http://hg.openjdk.java.net/jdk7/build/raw-file/tip/README-builds.html</a></p>
<p><strong>Build instructions for the&nbsp;</strong><strong>OpenJDK 8 project</strong> (the latest - provide very useful tips)<br> <a href="http://hg.openjdk.java.net/jdk8/build/raw-file/tip/README-builds.html">http://hg.openjdk.java.net/jdk8/build/raw-file/tip/README-builds.html</a></p>
