---
title: The OpenHAB (Open Home Automation Bus) project
description: "    Imagine that you open you email calendar and create a new event for let's say 19:00 that turns on your oven, turns on the smoke detector (just in case) and turns on the came..."
date: '2013-12-30'
draft: false
showHeroImage: false
tags: [Architecture]
categories: [Architecture]
comments: false
sidebar:
  enable: true
  toc: true
  relatedPosts: true
---

<p>&nbsp; &nbsp; Imagine that you open you email calendar and create a new event for let's say 19:00 that turns on your oven, turns on the smoke detector (just in case) and turns on the camera in the kitchen in case the smoke detector is triggered. You also create a new calendar event that at 19:30 turns off the oven and the smoke detector. When you are back home at 19:40 you have a hot meal waiting for you in the kitchen. Or in the more straight-forward scenario - you can use your smartphone or laptop to directly manipulate your home devices and link them in any possible way you can think of. The number of practical use cases is just enormous to list. Now imagine that you put these "home automation" in the more global context of "Internet of Things" where device interaction is not restricted only to the PAN (Personal Area Network) of your home. The number of use cases grows much larger.<br>&nbsp; &nbsp;Lack of standartization and rivalship among device vendors however still impede rapid developments in the field but this may proove not to be so bad after all - more time for polishing other aspects such as security, performance and resource consumption is available.&nbsp;<br>&nbsp; &nbsp;What mechanism should be used to implement such types of systems ?D<span>efinitely a highly modular and distributed approach is required f</span>or the implementation of a home automation system that provides an acceptable level of abstraction and allows for a seemless integration and remote control of devices.<br>&nbsp; &nbsp; In this article I will present you the architecture of the OpenHAB (Home Automation Bus) award-winning (Duke's Choice Award 2013) project that has the potential to become a de-facto standard for the integration of devices in a connected world. For a modular runtime system it uses the Equinox OSGi implementation. I also assume that the reader has basic understanding on the principles of OSGi (that are now being applied in a number of implementations adapted for the needs of many other industries such as car manufacturing, e-health, mobile applications and others).&nbsp;<br>&nbsp; &nbsp;In order to make full use of the article you should already have prepared a development environment as desribed in the project's wiki (see references).</p>
<h2>Architecture</h2>
<p>&nbsp; The architecture of OpenHAB is pretty clear and well-documented in the project's wiki (see references). However my focus will be to provide some more explanations on some of the concepts and an architectural review from the point of a developer willing to contribute or research the internals of the project. The following diagram is provided from the OpenHAB wiki and provides an overview of the high level architecture along with its components:</p>
<p>&nbsp;<img src="/images/legacy/architecture/the-openhab-open-home-automation-bus-project/architecture.png" width="650" height="464" alt="architecture"></p>
<p>Some important terms used throughout the project:&nbsp;</p>
<ul>
<li><strong>binding</strong>&nbsp;- a binding is an adapter OSGi bundle that allows you to connect to a device or a series of devices that can communicate via a particular protocol (and hence each binding may require particular configuration based on that protocol such as host name and port or any other protocol-specific configuration). If you look into the sources each binding is provided in a separate bundle project in the format:&nbsp;org.openhab.binding.&lt;binding_name&gt;. The bundle of the binding can be deployed to the OpenHAB runtime by copying it to the 'addons' folder;</li>
</ul>
<ul>
<li><strong>action</strong>&nbsp;- an action in terms of OpenHAB can be used to "plug" additional functionality in the OpenHAB system that can be manipulated via scripts in the automation engine or directly from the runtime. Each action is typically a separate Java class that provides simple methods that provide the particular functionality. This class is then registered as an OSGi service to the OpenHAB runtime and methods become available for execution from the script engine. Xbase is used to provide the scripting mechanism that allows execution of scripts at runtime and hence - has access to the registered actions and other internal OpenHAB data (such as items).&nbsp;<span>If you look into the sources each action is provided in a separate bundle project in the format:&nbsp;</span>org.openhab.action.&lt;action_name&gt;<span>. Current list of actions include sending of email, sending notification to an Android device, sending status updates to twitter and others. Action bundles are also deployed to the OpenHAB runtime in the "addons" directory.</span></li>
</ul>
<ul>
<li><strong>item</strong>&nbsp;- in terms of OpenHAB you can think of an item as some some particular particle that can be linked to a binding (such as colors, strings, numbers, switches (on/off) and others). Items can also be combined in groups (that are also a particular type of items). Items are declared using a specific DSL language in a separate file. The DSL is implemented by means of the XText library. The grammar is very easy to understand and is described in&nbsp;org.openhab.model.item/src/org/openhab/model/Items.xtext. This declaration of items allows for easy generation of UI from the item declarations thus saving effort in writing UI for each item and enforcing homogenous UI;</li>
</ul>
<ul>
<li><strong>sitemap</strong>&nbsp;- sitemaps allow to describe your UI declaratively using another DSL language that is created again with XText. The grammar is described in&nbsp;org.openhab.model.sitemap/src/org/openhab/model/Sitemap.xtext.</li>
</ul>
<p>&nbsp; &nbsp;All of the project components are also installed as OSGi bunbles in the Equinox runtime. Bundles are grouped into features - we have three features provided by the following projects:</p>
<ul>
<li>org.openhab.runtime.feature (groups OpenHAB runtime bundles)</li>
<li><span>org.openhab.runtime.feature (groups OpenHAB designer bundles)</span></li>
<li><span>org.openhab.dependencies.feature (groups common bundles used by both the runtime and the designer)</span></li>
</ul>
<p><i>Note: The OpenHAB designer is an Eclipse RCP application that is not listed in the above diagram but is provided by the org.openhab.designer.* projects. It serves to provide an interactive application for the configuration of the OpenHAB runtime.&nbsp;</i></p>
<p>&nbsp; &nbsp;Features are further grouped along with external features from the p2 repositories to define the two products (OpenHAB runtime and designer) that are provided by the&nbsp;org.openhab.runtime.product and the&nbsp;org.openhab.runtime.designer projects.</p>
<p>Other projects include:</p>
<ul>
<li>org.openhab.archetype.action - defines a Maven archetype for generating a stub action;<br><br></li>
<li>org.openhab.archetype.binding - defines a Maven archetype for generating a stub binding;<br><br></li>
<li>org.openhab.core.* - OpenHAB runtime core functionality (that builds on top of the Equinox container) - the <span>org.openhab.core&nbsp;</span>project provides the implementation of the OpenHAB event mechanishm (that uses the OSGi EventAdmin to produce/consume events), the item provider that provides the representation of an item, the internal item registry, internal types and the binding abstractions;<br><br></li>
<li>org.openhab.core.autoupdate - provides a mechanism for triggering updates for items upon reception of item commands;<br><br></li>
<li><span>org.openhab.core.library - provides the core library of items and item types;<br><br></span></li>
<li><span><span>org.openhab.core.persistence - provides the persistence mechanism for storing item states using different storage services - the concrete storage services should implement the&nbsp;org.openhab.core.persistence.PersistenceService interface and the various supported services are provided by the org.openhab.persistence.* projects;<br><br></span></span></li>
<li><span><span><span>org.openhab.core.scriptengine - provides the interface for the OpenHAB script engine. The only implementation of the script engine interface is currently provided by the&nbsp;<span>org.openhab.model.persistence project;<br><br></span></span></span></span></li>
<li><span><span><span><span>org.openhab.core.transform - provides a mechanism to transform an input according to various types of mechanisms (e.g. XPath expression over the input, XSLT transformation, JavaScript function executed over the input and others). Transformations must implement the&nbsp;org.openhab.core.transform.TransformationService interface and current implementations are available in the&nbsp;org.openhab.core.transform.internal.service package;<br><br></span></span></span></span></li>
<li><span><span><span><span><span>org.openhab.io.* - provide mechanisms for receiving input/sending output from/to external systems. This includes integration with the Equinox OSGi console (by registering the 'openhab' namespace for the OpenHAB commands), the RESTful web services exposes by the OpenHAB runtime (using Apache Jersey with embedded Jetty web server) and others - you can look into the various projects for more details;<br><br></span></span></span></span></span></li>
<li><span><span><span><span><span><span>org.openhab.model.* - provide common models for the various modules of the system that are that are declared by means of XText-provided DSL language configurations (such as the items, the persistence module, the rule engine, the script engine and the sitemaps module). The models are used by both the runtime and the designer - the projects org.openhab.model.*.ui provide model UI for use only by the designer. Moreover additional generation of sources and the EMF models of the OpenHAB modules is performed by means of the Modeling Worflow Engine 2 generator engine that is part of Xtext (generator logic for the various models is declared in *.mwe2 files in the corresponding projects - code is generated for both the module and the module UI projects);<br><br></span></span></span></span></span></span></li>
<li>org.openhab.ui.* - provide the web UI of OpenHAB that is also deployed as an OSGi bundle and makes use of the OSGi HTTP service in order to serve content from servlets;<br><br></li>
<li>targetplatform&nbsp;- provides various run configurations for the OpenHAB runtime and the designer;<br><br></li>
<li>distribution - the distribution project that provides the directory structure, additional configurations and scripts that are part of the deployment package.</li>
</ul>
<p>The build of the system is pretty straightfoward - Maven is used along with Tycho (that is used to align the OSGi dependency system with the one used by Maven) and the root of the OpenHAB repository is a parent project that builds its child modules in the following order:</p>
<ul>
<li>bundles - all projects are build in the proper order as specified in bundles/pom.xml<br><br></li>
<li>features - all feature projects are build in the proper order as specified in features/pom.xml<br><br></li>
<li>products - all product projects are build in the proper order as specified in products/pom.xml<br><br></li>
<li>targetplatform - the targetplatform project is being build as specified in &nbsp;targetplatform/pom.xml<br><br></li>
<li>distribution - the various deployment packages are being created based on the build output of the other projects and the contents of the distribution project as specified in distribution/pom.xml</li>
</ul>
<p>&nbsp; &nbsp;The GitHub repo is linked to a Jenkins CI server (see references) so that you can directly download and try out the latest build of the project without building it manually.&nbsp;</p>
<p>&nbsp; &nbsp;Other OSGi implementations (other then Equinox) that are more suited for embedded devices are also easy to experiment with. One of them is Eclipse Concierge which is a small-footprint OSGi container that is optimized for embedded devices.</p>
<h2>Contribution</h2>
<p><a href="http://eclipse.org/proposals/technology.smarthome/"></a><a href="http://eclipse.org/proposals/technology.smarthome/"></a>&nbsp; &nbsp;Based on the above information you can cantribute a number of things such as new bindings. At the time of writing of this article a new project under the name of Eclipse SmartHome (currently in "Proposal" phase - see references) is underway. Its initial contribution will be from the OpenHAB codebase. So if you want to contribute to project you may also consider SmartHome when it enters the Incubation phase and has the initial contribution. &nbsp;</p>
<h2>References</h2>
<p>1) OpenHAB GitHub project repository<br><a href="https://github.com/openhab/openhab/"></a><a href="https://github.com/openhab/openhab/"></a><a href="https://github.com/openhab/openhab/">https://github.com/openhab/openhab/</a></p>
<p>2) OpenHAB wiki<br><a href="https://github.com/openhab/openhab/wiki"></a><a href="https://github.com/openhab/openhab/wiki">https://github.com/openhab/openhab/wiki</a><a href="https://github.com/openhab/openhab/wiki"></a></p>
<p>3) OpenHAB 1.0 - Home Automation for Geeks<br><a href="https://kaikreuzer.blogspot.com/2012/08/openhab-1.html"></a><a href="https://kaikreuzer.blogspot.com/2012/08/openhab-1.html">http://kaikreuzer.blogspot.com/2012/08/openhab-1.html</a></p>
<p>4) Home Automation using OpenHAB, Geecon 2013<br><a href="https://vimeo.com/77279721"></a><a href="https://vimeo.com/77279721">http://vimeo.com/77279721</a><a href="https://vimeo.com/77279721"></a></p>
<p>5) Eclipse SmartHome project proposal<a href="http://eclipse.org/proposals/technology.smarthome/"><br></a><a href="http://eclipse.org/proposals/technology.smarthome/">http://eclipse.org/proposals/technology.smarthome/</a></p>
<p><span>6) Wikipedia's entry on Home Automation<br><a href="https://kaikreuzer.blogspot.com/2012/08/openhab-1.html"></a></span><a href="https://en.wikipedia.org/wiki/Home_automation"></a><a href="https://en.wikipedia.org/wiki/Home_automation">http://en.wikipedia.org/wiki/Home_automation</a></p>
<p>7) Wikipedia's entry on Internet of Things<br><a href="https://en.wikipedia.org/wiki/Internet_of_Things">http://en.wikipedia.org/wiki/Internet_of_Things</a><a href="https://en.wikipedia.org/wiki/Internet_of_Things"></a></p>
<p>8) Eclipse SmartHome project<br><a href="http://www.eclipse.org/smarthome/"></a><a href="http://www.eclipse.org/smarthome/">http://www.eclipse.org/smarthome/</a></p>
