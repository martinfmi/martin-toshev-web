---
title: GraalVM at a glance
description: GraalVM is an Oracle research project that aims to provide a polyglot runtime for JVM languages while bringing the performance of Java to those languages and simplifying the imp...
date: '2018-03-04'
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

<p><span>GraalVM is an Oracle research project that aims to provide a polyglot runtime for JVM languages while bringing the performance of Java to those languages and simplifying the implementation effort at the same time. For that purpose GraalVM provides a new JIT compiler and a Truffle API which describes the structure of the language out of which an AST (Abstract Syntax Tree) is generated for programs written in that language. The generated AST might be further rewritten and optimized before execution by the Graal AST interpreter. Parts of the interpreted AST (also called Graal IR or Graal Intermediate Representation) are dynamically compiled to machine compiled to machine code by the Graal JIT compiler and might be deoptimized back at some point. Graal also provides a bytecode interpreter. The following diagram provides a high-level overview of Graal VM:</span></p>

<p><img src="/images/legacy/tools/graalvm-at-a-glance/graalvm.png" width="600" height="204" alt="graalvm"></p>

<p>To get started developing with GraalVM you need to identify first what purpose are you following:</p>
<p>- You want to experiment with the new Graal JIT compiler and see how is the performance of your application affected using this new dynamic compiler;</p>
<p>- You want to build a performant JVM language or provide a performant implementation of an existing language that runs on the JVM.</p>
<p>For the first case you need to have JDK 9 installed and enable JVMCI (JVM compiler interface) which is an experimental feature in JDK 9. Graal JIT uses JVMCI to interact with the Hotspot VM for the purpose of dynamic compilation without patching the JVM runtime. The Graal JIT compiler is also available on a patched version of the JDK 8 runtime which however you need to download and install separately. In this article Chris Seaton from the Graal team describes how to compile Graal JIT compiler from sources using the MX tool and use it as the JIT compiler for your application under JDK 9: <a href="http://chrisseaton.com/rubytruffle/jokerconf17/">http://chrisseaton.com/rubytruffle/jokerconf17/</a>.</p>
<p>For the second use case a good starting point are the research papers and presentation tutorials from the Graal team available at <a href="https://wiki.openjdk.java.net/display/Graal/Publications+and+Presentations">https://wiki.openjdk.java.net/display/Graal/Publications+and+Presentations</a> However if you want to get started implementing your Truffle language right away a good place to start with is the SimpleLanguage implementation <a href="https://github.com/graalvm/simplelanguage">https://github.com/graalvm/simplelanguage</a> which provides an overview of the main Truffle features. It is a Javascript-like language from which you can derive already knowledge on how to implement popular language constructs for your Truffle language.</p>
