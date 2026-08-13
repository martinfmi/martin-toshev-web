---
title: Solving the JAR hell problem in Maven
description: "   How many times have you a developed a Java application that requires different (possibly incompatible) versions of the same library ? How many time have seen a NoSuchMethodEr..."
date: '2014-01-03'
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

<p>&nbsp; &nbsp;How many times have you a developed a Java application that requires different (possibly incompatible) versions of the same library ? How many time have seen a NoSuchMethodError or IllegalArgumentException thrown from a library method and wondering - what's wrong with my application ? Although the answer is simple (and not always realized) there is no clear solution to the JAR hell problem. Consider the following simple diagram:</p>
<p><img src="/images/legacy/tips_and_tricks/solving-the-jar-hell-problem-in-maven/JAR_hell.png" width="300" height="198" alt="JAR hell"></p>
<p>&nbsp; &nbsp;Clearly if you use Maven 2.0 (or above) you may declare only the dependencies to Library_A and Library_B - the Maven dependency mechanism will autoresolve the dependencies to Library_C by reading the Maven configuration of Library_A and Library_B (autoresolution of transitive dependencies was introduced in Maven 2.0):</p>
<table>
<tbody>
<tr>
<td><code>&lt;dependencies&gt;<br>&nbsp; &nbsp;&lt;dependency&gt;<br>&nbsp; &nbsp; &nbsp; &lt;groupId&gt;org.library_A.com&lt;/groupId&gt;<br>&nbsp; &nbsp; &nbsp;&nbsp;<span>&lt;artifactId&gt;Library_A&lt;/<span>artifactId</span>&gt;</span><br><span>&nbsp; &nbsp; &nbsp;&nbsp;<span>&lt;version&gt;1.0&lt;/version&gt;</span></span><br>&nbsp; &nbsp;&lt;/dependency&gt;<br>&nbsp; &lt;dependency&gt;<br>&nbsp; &nbsp; &nbsp;&lt;groupId&gt;org.library_B.com&lt;/groupId&gt;<br>&nbsp; &nbsp; &nbsp;&lt;artifactId&gt;Library_B&lt;/artifactId&gt;<br>&nbsp; &nbsp; &nbsp;&lt;version&gt;1.0&lt;/version&gt;<br>&nbsp; &lt;/dependency&gt;<br>&lt;/dependencies&gt;</code></td>
</tr>
</tbody>
</table>

<p>&nbsp; &nbsp;Obviously two different version of Library_C (1.1 and 1.3) will be included on the classpath. Here is when the fun comes (depending on whether the two libraries are compatible). Here are two scenarios when the two versions of Library_C on the classpath will not break the application:</p>
<ul>
<li>if Library_C 1.3 is backward compatible with Library_C 1.1 and Library_C 1.3 is first on the classpath;<br><br></li>
<li>if Library_C 1.3 is NOT backward compatible with Library_C 1.1 but Library_A 1.0 and Library_B 1.0 use only classes that are compatible in the two versions of Library_C;</li>
</ul>
<p>&nbsp; &nbsp;In many cases the above scenarios do not take place and different problems typically occur when running the application (exceptions, of course, may not even be thrown, but your application could observe unexpected behaviour). Typically you should avoid having two different versions of the same library on the classpath. How to detect this ? There are different ways - one is to use a Maven plugin (such as&nbsp;<strong>tattletale-maven</strong> or <strong>maven-duplicate-finder-plugin</strong> - see references) that will detect duplicate libraries at build time. But what to do when you hit such an issue ? Here are several options:</p>
<ul>
<li>if possible replace Library_A or Library_B with another library that does not use Library_C at all;<br><br></li>
<li>if versions of Library_C are backward-compatible that you can move the library that uses version 1.3 above the library that uses version 1.1 so that the greater version of Library_C is loaded;<br><br></li>
<li>you can try to find a version of the libraries that can be used by both Library_A and Library_B and declare it as a dependency before Library_A and Library_B - this is more of a "trial-and-error" approach;<br><br></li>
<li>if Library_C is open-source and the corresponding license allows it - you can build your own customized version of the library that allows usage from both Library_A and Library_C and&nbsp;<span>and declare it as a dependency before Library_A and Library_B - this requires additional time to get acquainted with the library;<br><br></span></li>
</ul>
<h1>References</h1>
<p>1) Escape from JAR hell<br><a href="http://praisethesoftware.com/2012/10/17/escape_from_the_jar_hell.html">http://praisethesoftware.com/2012/10/17/escape_from_the_jar_hell.html</a></p>
<p>2) Fight dependency hell in Maven<br><a href="http://cupofjava.de/blog/2013/02/01/fight-dependency-hell-in-maven/"></a><a href="http://cupofjava.de/blog/2013/02/01/fight-dependency-hell-in-maven/">http://cupofjava.de/blog/2013/02/01/fight-dependency-hell-in-maven/</a></p>
<p>3) Maven dependency hell<br><a href="http://olemortenamundsen.wordpress.com/2008/05/22/maven-dependency-hell/"></a><a href="http://olemortenamundsen.wordpress.com/2008/05/22/maven-dependency-hell/">http://olemortenamundsen.wordpress.com/2008/05/22/maven-dependency-hell/</a></p>
