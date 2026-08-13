---
title: "What must every Java developer know in order to be good ?"
description: "Recently many people started recently asking me \"What is required to start developing Java-based applications ?\". Apart from the fact many of the skills are gained during the wo..."
date: '2013-01-15'
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

<p>Recently many people started recently asking me "What is required to start developing Java-based applications ?". Apart from the fact many of the skills are gained during the working hours (many hours of overtime actually - most IT companies don't actually care about development of human resources - this is a myth - but rather push it to the limit unwilling to invest in developer trainings) many of them can be gained prior to starting your first job (or jumping to the next one for a better salary, new challenges and more skills). In this article I decided to outline a sample set of skills that are vital to the development of Java-based application and basic engineering skills in general and may serve as a starting point for people willing to get into the world of Java application development.&nbsp;</p>
<div>
<ul>
<li>At first place - fluent English (if, of course, you are not a native speaker) !&nbsp;</li>
</ul>
<ul>
<li><span>Core Java - two books I would strongly recommend are </span><a href="https://www.amazon.com/SCJP-Certified-Programmer-Java-310-065/dp/0071591060">SCJP Sun Certified Programmer for Java 6 Exam 310-065</a><span>&nbsp;and </span><a href="https://www.amazon.com/Effective-Java-2nd-Joshua-Bloch/dp/0321356683">Effective Java</a><span>&nbsp;- the first one covers all of the basic stuff in detail (apart from being the official certification guide for Java SE 6) and the second one goes into more details and good practices.</span></li>
</ul>
<ul>
<li>IDE - you should be comfortable with using at least one of the well-established Java IDEs. Myths like 'super-developer should use Notepad[++] to write their source code' are such a bullshit - only idiots do. My personal favourite is the Eclipse IDE because it is an entire platform with great plug-in architecture that can host many state-of-the art free plug-ins out there and there are development tools for a variety of other programming languages (these are just two of the great things about Eclipse). As a starting point I would recommend the <a href="http://www.vogella.com/eclipseide.html">tutorials</a>&nbsp;provided for free by Lars Vogel (top Eclipse contributor). A number of books is also present on the Eclipse site <a href="http://www.eclipse.org/resources/?type=book">here</a> (mostly related to plug-in development) but I would not recommend them for starters. Another IDEs I would recommend as secondary options are Netbeans and IntelliJ IDEA.<br><br></li>
<li>Unit testing - basic principles, basic JUnit understanding and knowing how to write a unit test, mocking frameworks - basic understanding and usage (e.g. JMock, Powermock, Mockito)<br><br></li>
<li>Integration and functional testing - basic principles and basic understanding in Selenium (at least how it works) and why is it so widely used to automate functional testing mostly for web-based applications<br><br></li>
<li>Basic understanding of CI (Continuous Integration) - its purpose and problems does in solve. It is nice to have basic understanding in at least one CI systems (such as Hudson, Jenkins or Cruise Control).</li>
</ul>
<ul>
<li><span>Basic data formats - you should have basic understanding on the structure of:<br></span><span>- JSON<br></span><span>- XML<br><br></span></li>
<li><span><span>Algorithms &amp; Data Structures - despite the fact that many programmers (especially people that have not taken a course in Design and Analysis of Algorithms) think that when need an algorithm they will simply download an modify a sample source from the net and modify it - VERY WRONG ! First of all studying algorithms does not mean learning algorithms and data structures by heart (e.g. by memorizing a piece of source code - although some algorithm contestants do) but rather study the basic principles behind the core algorithms and data structure in order to apply them in practice - the truth is that knowing those principles and practicing them by solving algorithmic problems allows the developer to think more logically and write cleaner and more optimized source code. There is a variety of online grading systems (online judges) such <a href="http://codeforces.com/">codeforces.com</a>, <a href="http://acm.timus.ru/">acm.timus.ru</a> and <a href="http://www.topcoder.com/">topcoder.com</a> that have many practice problems. Another training program I would strongly recommend is <a href="http://train.usaco.org/usacogate">usaco.com</a> (USA computing olympiads). As aditional study materials I would recommend the <a href="http://www.topcoder.com/tc?d1=tutorials&amp;d2=alg_index&amp;module=Static">topcoder algorithm tutorials</a> and the books <a href="https://www.amazon.com/Introduction-Algorithms-Includes-CD-Rom-Thomas/dp/0072970545">Introduction to Algorithms</a> (Cormen, Leiserson, Rivest), <a href="https://www.amazon.com/Algorithm-Design-Manual-Steve-Skiena/dp/0387948600">The Algorithm Design Manual</a> (Sikena) and <a href="https://www.amazon.com/Algorithms-4th-Robert-Sedgewick/dp/032157351X">Algorithms</a>, 4th edition (Sedgewick, Wayne). <a href="https://www.coursera.org/">coursera.org</a> has also some nice online Algorithm &amp; Data Structures courses provided by top-university lecturers.</span></span></li>
</ul>
<ul>
<li><span><span>Design patterns - although example are not in Java GoF (Gang of Four) <a href="https://www.amazon.com/Design-Patterns-Object-Oriented-Professional-Computing/dp/0201634988">Design Patterns - Elements of Reusable Object-Oriented Software</a> remains a reference guideline in the field of design pattern</span></span></li>
</ul>
<ul>
<li><span>Version control systems - CVS (the predecessor ot SVN), SVN and distributed ones - Git and Mercurial. Recent trends show that distributed VCSs are gaining more wide-spread usage. You should know at least what is the difference between regular (client-server)-based VCS and distributed VCS is and how each of them operates in general and manages file versions and branching</span></li>
</ul>
<ul>
<li>Build tools - Ant and Maven - basic understanding of both is a must. Latest trends show that Maven with its great dependency mechanism and build lifecycles is more preferable than Ant.<br><br></li>
<li>Databases - basic understanding on SQL (the query language of relational database systems) and basic understanding in NoSQL implementations and their use cases - JSON stores (MongoDB), in-memory key-value stores (memcached), graph stores (Neo4j), big data. Recents trends show that NoSQL implementations (that are lacking the heavy theory and constraints of relational databases) tend to be more light-weight and performant in variety of situations (such as storing activities in social networks) - basic understanding in emerging NoSQL techs is a must.<br><br></li>
<li>Web technologies - basic understanding on HTML, CSS and Javascript is also a must (not to say that Javascript finds more applications that only in browsers in technologies such as Node.js and MongoDB)<br><br></li>
<li>Operating Systems - basic understanding of how operating systems works is a necessity - processes and process management, memory management, &nbsp;types of instructions and instruction handling in the processor, basic kernel types and user modes, inter-process communication, basic scripting (batch for Windows and bash for Unix-based operating systems - basic knowledge is a must)<br><br></li>
<li>Network and distributed programming - basic understanding on sockets and client-server architectures using sockets, RPC (remove procedure calls) and messaging&nbsp;<br><br></li>
<li>Design and architecture - basic understanding of UML is a must (especially for the class, sequence and deployment types of diagrams) - no need to read through the entire spec (but you can use it as a reference). I would recommend a concise introduction to UML provided in Martin Fowler's UML Distilled: A Brief Guide on the Standard Object Modelling Language. Also you must have a basic understanding on the possible ways to organize a software design/architecture document or even specification - there is a number of templates for such documents throughout the net<br><br></li>
<li><span>Presentation skills - try to gain an much presentation skills as possible - this is vital to your proffessional development<br><br></span></li>
<li><span>Collaboration skills - do not preserve knowledge only for yourself - collaborate aggresively - blogging, knowledge sharing, organize study seminars of emerging technologies and stuff that will drive people toward new skills and motivation<br><br></span></li>
<li><span>Other technologies - do not ignore other technologies - keep your knowledge up to date with the newest trends in technology all the time. Do not be radical towards technologies and companies that you do not like but rather try to get the most out of the value they provide.<br><br></span></li>
</ul>
<p><span>Not all of the above skills can be gained in the university and not all of them can be gained from the daily job only - be self-motivated and use the learn-practice-teach lifecycle as a guidance when starting your career as a proffesional developer.</span></p>
