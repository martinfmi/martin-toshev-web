---
title: Running javascript from Eclipse
description: "   In this article I will demonstrate how to easily run javascript files from within the Eclipse IDE using Mozilla's Rhino javascript engine.     First off download the latest v..."
date: '2012-08-17'
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

<p><span>&nbsp; &nbsp;In this article I will demonstrate how to easily run javascript files from within the Eclipse IDE using Mozilla's Rhino javascript engine.&nbsp;<br>&nbsp; &nbsp;First off download the latest version of the&nbsp;<a href="https://developer.mozilla.org/en-US/docs/Rhino/Downloads_archive?redirectlocale=en-US&amp;redirectslug=Rhino_downloads_archive">Rhino downloads archive</a>&nbsp;(for this demonstration I will be using&nbsp;<strong>Rhino 1.7R4&nbsp;</strong>and&nbsp;<strong>Eclipse 4.2 - Juno</strong>).&nbsp;Unzip the downloaded archive to an appropriate location. From the Eclipse IDE create a new external configuration&nbsp;(<strong>Run</strong>&nbsp;-&gt;&nbsp;<strong>External Tools</strong>&nbsp;-&gt;&nbsp;<strong>External Tools Configurations</strong>)&nbsp;as follows:&nbsp;<span><br></span></span></p>
<p><span>&nbsp;<img src="/images/legacy/tips_and_tricks/running-javascript-from-eclipse/running_javascript_under_eclipse.gif" alt=""></span></p>
<p><span>&nbsp;<strong>1.</strong>&nbsp;Click on the&nbsp;<strong>Program</strong>&nbsp;button.<br>&nbsp;<strong>2.</strong>&nbsp;Click on the&nbsp;<strong>New launch configuration</strong>&nbsp;button.<br>&nbsp;<strong>3.</strong>&nbsp;Give a sample name on the run configuration (e.g.&nbsp;<strong>rhino_javascript</strong>).&nbsp;<br>&nbsp;<strong>4.</strong>&nbsp;Specify the path to java.exe from the java runtime installation directory (assuming java 6 is &nbsp;already installed on your machine)<br>&nbsp;<strong>5.</strong>&nbsp;For the working directory specify the directory where the Rhino installation arhive is unzipped (it should contain the&nbsp;<strong>js.jar</strong>&nbsp;file)<br>&nbsp;<strong>6.&nbsp;</strong>For the program arguments specify:</span></p>
<p><span>&nbsp; &nbsp; &nbsp; &nbsp;jar -js ${resource_loc}</span></p>
<p><span>&nbsp; &nbsp; This means that we will be executing the Rhino console against the currently selected file in Eclipse (should be a javascript file).<br>Now when you have selected a javascript file (e.g. from the Package explorer) you can execute it by running the already created external configuration:</span></p>
<p><span><img src="/images/legacy/tips_and_tricks/running-javascript-from-eclipse/running_javascript_under_eclipse2.gif" alt=""></span></p>
<p><span face="tahoma, arial, helvetica, sans-serif">That's it! Have a nice javascripting under Eclipse :)</span></p>
