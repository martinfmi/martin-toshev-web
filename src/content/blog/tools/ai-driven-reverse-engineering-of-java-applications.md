---
title: AI-driven reverse engineering of Java applications
description: "It is not an uncommon task to understand the innerworkings of an existing Java project, whether it is proprietary or open source. This can range from a simple task such as decom..."
date: '2025-07-03'
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

<h2>Traditional reverse engineering</h2>

<p>It is not an uncommon task to understand the innerworkings of an existing Java project, whether it is proprietary or open source. This can range from a simple task such as decompiling and reviewing the source code of an existing library to understanding how a large codebase is architected, built and deployed. In many cases developers are looking for proper documentation that describes in details and with examples the concepts implemented in the target project but quite often such a documentation is simply missing. In the case of decompilation there are tools like JD or IDE-specific decompiler plugins that do the job straight away. However if we consider the case a completely new and unknown code repository there a number of things we typically start with to understand how it is structured:</p>

<ul>
<li>What build tools do we use ? Are there any build tool-specific plugins and configuration we should consider during build ? In this case we need to review the build-specific configuration files i.e. like pom.xml or build.gradle to understand the build process.<br><br></li>
 
<li>How is the code structured ? What is the relationship between the different packages and classes ? In this case we can generate UML class diagrams to visually analyse and comprehend how is the code structured.<br><br></li>
 
<li>How do the difference objects interact with each other ? In this case we can generate UML sequence diagrams to visually analyse and comprehend this information.</li>
 
<li>What propriety and open source libraries do we use ? How do they work in general and where are they used in the project ? This information requires typically a bit of digging and research if we haven't used the particular library and what to understand at least at a very basic level how it works.<br><br></li>
 
<li>Describe certain patterns and code smells found in the code. This requires good understanding of design patterns and general bad coding practices specifically related to Java applications.<br><br></li>
 
<li>What application specific configuration do we use and for what purpose ? This requires understanding and reviewing how does the application store configuration: whether it is via plain Spring application.yml, generated via Kubernetes configmaps, using a config server like Spring cloud config to give a few examples.<br><br></li>
 
<li>What external systems do we interact with and via what protocols ? In many cases this boils down to the previous point whereby this information is stored in application configuration but it can come from other places like i.e. an external database the application interacts with.<br><br></li>
 
<li>Understand how the application is initialized upon startup. This typically requires starting manuallying from the <strong>main()</strong> method and diving into the initialization process.</li>
</ul>

<p>And this is not a complete list of all the reverse engineering activities you may need to do when understanding an existing Java project ... Certain tools simplify many of these activities:</p>

<ul>
<li>Tools generating UML diagrams from existing code such as propriety frameworks like Sparx Enterprise Architect or IDE-specific plugins.<br><br></li>
 
<li>Static analysis tools that provide pattern mining and analysis of code smells or potential vulnerabilities like PMD, FindBugs and SonarQube.<br><br></li>
 
<li>Dynamic code analysis tools that, for example, scan for potential vulnerabilities such as Burp and Veracode.</li>
</ul>

<p>But it is 21st century and everyone is talking about AI ... So can AI help further in the process of reverse engineering apart from the code analysis tools we already mentioned ?</p>

<h2>AI-assisted reverse engineering</h2>

<p>Not only AI can help in that area but it is even defined as a distinct area of research called <a href="https://en.wikipedia.org/wiki/AI-assisted_reverse_engineering" data-type="link" data-id="https://en.wikipedia.org/wiki/AI-assisted_reverse_engineering">AI-assisted reverse engineering (AIARE)</a>. While in essence certain AI techniques like deep learning and specifically LLMs build using these techniques overlap in terms of what can be achieved simply by static analysis tools, there are certain activities that AI can achieve way better in order to "comprehend" how a system behaves compared to traditional code analysis tools:</p>

<ul>
<li>provide an analysis of the interaction of components in a system and give answers such as "class A is used as a wrapper for the communication with the Kafka message bus";<br><br></li>
 
<li>provide an in-depth vulnerability and malware analysis based on recognized patterns by the LLM;<br><br></li>
 
<li>provide information about calls to external systems such as "system X is called by first retriving configuration from Postgres database and making an API call to it from class A";<br><br></li>
 
<li>reconstucting high-level code constructs from binary and obfuscated code.</li>
</ul>

<p>At present many of these capabilities and built on top of existing reverse engineering tools like Ghidra (with plugins like RevEng.AI or ReVa), Radare2 (with plugins like r2ai and decai) or IDA Pro (with a third part MCP server to facilitate reverse engineering during decompilation). You can think of these as a step further on top of dissasemblers where the LLM is used to refine decompiled code and provide a higher-level code construct.</p>

<p>On the other hand certain AI code assstants provide features that can facilitate the reverse engineering process of an existing codebase. This is for example the case with Github Copilot that provides a feature to explain existing code or Claude Code that provides the possibility to answer questions about the architecture and logic of a codebase.</p>

<h2>A case study: Understanding third-party libraries used by a Java project</h2>

<p>Let's take a look at a particular use case: describing briefly Java libraries used by an application. Tradionally when we look at an existing repository we identify third-party dependencies and if we see an unfamiliar library used in the project we typically do a search for official documentation or blogs to do some basic research on how this library works. LLMs make this task straight-forward if we craft the proper prompt for the purpose. Let's assume we have a tool that parses the build filies (Maven or Gradle) and identifies we are using the <strong>org.apache.pdfbox</strong>&nbsp;to generate PDFs. If we ask ChatGPT to give as an example we can try the following prompt:</p>

<pre><code>As a professional software developer
Give me a code example of the org.apache.pdfbox:pdfbox:3.0.5 Maven library</code></pre>

<p>What the model gives is a detailed explanation and not only the code example as we wish:</p>

<figure><img src="/images/legacy/tools/ai-driven-reverse-engineering-of-java-applications/ScreenHunter-25-1024x478.png" alt=""></figure>

<p>If we refine our prompt a bit and use the following one instead:</p>

<pre><code>As a professional software developer
Give me a code example of the org.apache.pdfbox:pdfbox:3.0.5 Maven library. 
Reply only with code sample.</code></pre>

<p>Then we get just a code sample:</p>

<figure><img src="/images/legacy/tools/ai-driven-reverse-engineering-of-java-applications/ScreenHunter-26-1024x537.png" alt=""></figure>

<p>As you can see using the proper prompts or even code (even decompiled if need be) the model can be used to facilitate a number of activities that we typi</p>
