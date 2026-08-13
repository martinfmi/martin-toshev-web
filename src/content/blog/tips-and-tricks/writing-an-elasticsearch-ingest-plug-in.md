---
title: Writing an Elasticsearch Ingest plug-in
description: Elasticsearch is written in Java and all the various modules are hooked up with Google Guice during startup of the Elasticsearch server. Apart from that a plug-in API is provide...
date: '2020-05-07'
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

<p><span><span>Elasticsearch is written in Java and all the various modules are hooked up with Google Guice during startup of the Elasticsearch server. Apart from that a plug-in API is provided whereby the functionality of Elasticsearch can further be extended. In this article we will demonstrate how to write an ingest plug-in for Elasticsearch that can filter a certain keyword from a document field before it is inidexed. The example plug-in is fairly simple but gives you enough knowledge to write a full-blown Elasticsearch ingest plug-in that is capable of processing documents before they are actually indexed.</span></span></p>
<h2>The Elasticsearch plug-in API</h2>
<p>&nbsp;Elasticsearch loads plug-in from the <strong>plugins</strong> directory of Elasticsearch. Each plug-in needs to provide a class that implements the <a href="https://github.com/elastic/elasticsearch/blob/633790fa99f30d8de02ab7d6af07dfb22332a8d8/server/src/main/java/org/elasticsearch/plugins/Plugin.java">org.elasticsearch.plugins.Plugin</a> interface. In addition the class may also implement a specific interface from the same org.elasticsearch.plugins package that determines the type of plug-in such as:&nbsp;</p>
<table cellspacing="5" cellpadding="5">
<thead>
<tr>
<td><span>ActionPlugin</span></td>
<td><span>Plug-ins that extend scripting functionality for e.g. updateByQuery or deleteByQuery requests</span></td>
</tr>
<tr>
<td><span>AnalysisPlugin</span></td>
<td><span>Plug-ins that provided additional analysers or extend Elasticsearch analysis functionality</span></td>
</tr>
<tr>
<td><span>ClusterPlugin</span></td>
<td><span>&nbsp;Plug-ins that add custom behavior to cluster management</span></td>
</tr>
<tr>
<td><span>DiscoveryPlugin</span></td>
<td><span>&nbsp;Plug-ins that extend the Elasticsearch discovery functionality</span></td>
</tr>
<tr>
<td><span>IngestPlugin</span></td>
<td><span>&nbsp;Ingest plug-ins</span></td>
</tr>
<tr>
<td><span>MapperPlugin</span></td>
<td><span>&nbsp;Plug-ins that provide custom mappers</span></td>
</tr>
<tr>
<td><span>NetworkPlugin</span></td>
<td><span>&nbsp;Plug-ins that extend network and transport related capabilities of Elasticsearch</span></td>
</tr>
<tr>
<td><span>RepositoryPlugin</span></td>
<td><span>&nbsp;Plug-ins that provided custom shapshot repositories</span></td>
</tr>
<tr>
<td><span>ScriptPlugin</span></td>
<td><span>&nbsp;Plug-ins that extend Elasticsearch scripting functionality such as a new scripting language</span></td>
</tr>
<tr>
<td><span>SearchPlugin</span></td>
<td><span>&nbsp;Plug-ins that extend search capabilities of Elasticsearch</span></td>
</tr>
<tr>
<td><span>ReloadablePlugin</span></td>
<td><span>&nbsp;Reloadable plug-ins</span></td>
</tr>
</thead>
<tbody></tbody>
</table>

<p>In addition to that each plug-in needs to supply plug-in metadata to elasticsearch in a <strong>plugin-descriptor.properties</strong> file and optionally a <strong>plugin-security.policy</strong> file with access control permissions required by the plug-in (as specified by the JDK security sandbox model).</p>

<h2><span>Creating the filter ingest plug-in</span></h2>
<p>We are going to create the Elasticsearch plug-in as a Maven project using Eclipse. Create a new Maven project from <strong>New</strong> -&gt; <strong>Maven Project</strong> and in the archetype selection window type elasticsearch and select the <strong>elasticsearch-plugin-archetype</strong> from <strong>org.codelibs</strong>. The archetype provides a good starting point that generates pom.xml file with necessary dependencies, assemblies.xml file that bundles the plug-in as a zip archive, plug-in metadata and initial Java classes for the plug-in.</p>
<p><img src="/images/legacy/tips_and_tricks/writing-an-elasticsearch-ingest-plug-in/es_plugin_maven_archetype.jpg" width="600" height="554" alt="es plugin maven archetype"></p>
<p>Specify proper Maven configuration for the plug-in along with properties specific for the Maven archetype. For <strong>elasticsearchVersion</strong> we are going to specify 7.6.0 as the version of Elasticsearch against which the plug-in is being developed.</p>
<p><img src="/images/legacy/tips_and_tricks/writing-an-elasticsearch-ingest-plug-in/es_maven_plugin_configuration.jpg" width="600" height="548" alt="es maven plugin configuration"></p>
<p>We need to rename the generated package accordingly, we our case we are using&nbsp;<strong>com.martin_toshev.elasticsearch.plugin.filter</strong> and also the generated plug-in class to&nbsp;<strong>FilterIngestPlugin</strong>. The rest of the generated classes are not needed and may be removed. The FilterIngestPlugin class has the following logic:</p>
<table>
<tbody>
<tr>
<td>
<p>package com.martin_toshev.elasticsearch.plugin.filter;</p>

<p>import java.util.HashMap;<br>import java.util.Map;</p>
<p>import org.elasticsearch.ingest.Processor;<br>import org.elasticsearch.plugins.IngestPlugin;<br>import org.elasticsearch.plugins.Plugin;</p>
<p>public class FilterIngestPlugin extends Plugin implements IngestPlugin {</p>
<p>@Override<br> public Map&lt;String, Processor.Factory&gt; getProcessors(Processor.Parameters parameters) {<br>&nbsp; &nbsp; &nbsp; Map&lt;String, Processor.Factory&gt; processors = new HashMap&lt;&gt;();<br>&nbsp; &nbsp; &nbsp; processors.put(FilterWordProcessor.TYPE, new FilterWordProcessor.Factory());<br>&nbsp; &nbsp; &nbsp; return processors;<br>&nbsp; &nbsp;}<br>}</p>
</td>
</tr>
</tbody>
</table>

<p>&nbsp;The <strong>getProcessors</strong> method returns one or more ingest processors that can be used by Elasticsearch once the plug-in is installed. In this case we are registering one processor provided by the <strong>FilterWordProcess</strong> class with the following implementation:<span><br></span></p>
<table>
<tbody>
<tr>
<td>
<p>package com.martin_toshev.elasticsearch.plugin.filter;</p>
<p>import java.util.Map;</p>
<p>import org.elasticsearch.ingest.AbstractProcessor;<br>import org.elasticsearch.ingest.ConfigurationUtils;<br>import org.elasticsearch.ingest.IngestDocument;<br>import org.elasticsearch.ingest.Processor;</p>
<p>public class FilterWordProcessor extends AbstractProcessor {</p>
<p>&nbsp; &nbsp;public static final String TYPE = "filter_word";</p>
<p>&nbsp; &nbsp;private String filterWord;</p>
<p>&nbsp; &nbsp;private String field;</p>
<p>&nbsp; &nbsp;public FilterWordProcessor(String tag, String filterWord, String field) {<br>&nbsp; &nbsp; &nbsp; super(tag);<br>&nbsp; &nbsp; &nbsp; this.filterWord = filterWord;<br>&nbsp; &nbsp; &nbsp; this.field = field;<br>&nbsp; &nbsp;}</p>
<p>&nbsp; &nbsp;@Override<br>&nbsp; &nbsp;public IngestDocument execute(IngestDocument ingestDocument) throws Exception {<br>&nbsp; &nbsp; &nbsp; IngestDocument document = ingestDocument;<br>&nbsp; &nbsp; &nbsp; String value = document.getFieldValue(field, String.class);<br>&nbsp; &nbsp; &nbsp; String clearedValue = value.replace(filterWord, "");<br>&nbsp; &nbsp; &nbsp; document.setFieldValue(field, clearedValue);<br>&nbsp; &nbsp; &nbsp; return document;<br>&nbsp; &nbsp;}</p>
<p>&nbsp; &nbsp;@Override<br>&nbsp; &nbsp;public String getType() {<br>&nbsp; &nbsp; &nbsp; return TYPE;<br>&nbsp; &nbsp;}</p>
<p>&nbsp; &nbsp;public static final class Factory implements Processor.Factory {</p>
<p>&nbsp; &nbsp; &nbsp; @Override<br>&nbsp; &nbsp; &nbsp; public Processor create(Map&lt;String, Processor.Factory&gt; registry, String processorTag,<br>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; Map&lt;String, Object&gt; config) throws Exception {</p>
<p>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp;String field = ConfigurationUtils.readStringProperty(TYPE, processorTag, config, "field");<br>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp;String filterWord = ConfigurationUtils.readStringProperty(TYPE, processorTag, config, "filterWord");</p>
<p>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp;return new FilterWordProcessor(processorTag, filterWord, field);<br>&nbsp; &nbsp; &nbsp; }<br>&nbsp; &nbsp;}</p>
<p>}</p>
</td>
</tr>
</tbody>
</table>

<p>The ingest processor has type called <strong>filter_word</strong> which is used by Elasticsearch to manage it. The plug-in uses two properties that are specified when the processor is created: <strong>field</strong> that indicates which document field to filter and <strong>filterWord</strong> to indicate the word in the document field to filter out before the document is indexed. The <strong>execute</strong> method provides the logic of the processor which if fairly straight-forward.</p>
<p>We also need to modify the generated plugin-descriptor.properties file as follows:</p>
<table>
<tbody>
<tr>
<td>
<p>description=Filter ingest plug-in<br>version=${project.version}<br>name=filter-ingest-plugin<br>classname=${elasticsearch.plugin.classname}<br>elasticsearch.version=${elasticsearch.version}<br>java.version=${maven.compiler.target}</p>
</td>
</tr>
</tbody>
</table>

<p>In the <strong>pom.xml</strong> file&nbsp;elasticsearch.plugin.classname property to&nbsp;<strong>com.martin_toshev.elasticsearch.plugin.filter.FilterIngestPlugin</strong> (or a different one that is specified).</p>

<h2>Building the plug-in</h2>
<p>To build the plug-in navigate to the project directory from the command line and execute the following:</p>
<table>
<tbody>
<tr>
<td>
<p>mvn clean install</p>
</td>
</tr>
</tbody>
</table>

<p>After the build is finished successfully the plug-in archive is generated under target/releases:&nbsp;<strong>filter-ingest-plugin-1.0.0-SNAPSHOT.zip</strong></p>

<h2>Deploying the plug-in</h2>
<p>&nbsp;To install the plug-in the elasticsearch-plugin utility from the Elasticsearch installation can be used (change the path to the filter plug-in archive properly):</p>
<table>
<tbody>
<tr>
<td><span>elasticsearch-plugin.bat install&nbsp;</span>file:///D:\project\filter-ingest-plugin\target\releases\filter-ingest-plugin-1.0.0-SNAPSHOT.zip</td>
</tr>
</tbody>
</table>

<p>Once the plug-in is installed Elasticsearch needs to be restarted. Make sure that the plug-in archive is properly expanded under the <strong>plugins</strong> directory of Elasticsearch.</p>

<h2>Testing the plug-in</h2>
<p>&nbsp;To test the plug-in first start a Kibana developer console and create an ingest pipeline that uses the <strong>filter_word</strong> processor registered by the plug-in to filter the <strong>crap</strong> word from the <strong>description</strong> field of an indexed document:</p>
<table>
<tbody>
<tr>
<td>
<p>PUT /_ingest/pipeline/filter_crap<br>{<br>&nbsp; &nbsp;"processors": [<br>&nbsp; &nbsp; &nbsp; {<br>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "filter_word" :<br>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;{ "field" : "description", "filterWord" : "crap" }<br>&nbsp; &nbsp; &nbsp; }<br>&nbsp; &nbsp;]<br>}</p>
</td>
</tr>
</tbody>
</table>

<p><span>Then index a document in the <strong>order_data</strong> index using the created <strong>filter_crap</strong> ingest pipeline (we are not going to create an explicit mapping for the index):</span></p>
<table>
<tbody>
<tr>
<td>
<p>PUT /order_data/_doc/1?pipeline=filter_crap<br>{<br>&nbsp; &nbsp;"description": "crap ! Don't buy this."<br>}</p>
</td>
</tr>
</tbody>
</table>

<p><span>Now inspect the documents in the index and verify that the above indexed document <strong>description</strong> field has been properly filtered:</span></p>
<table>
<tbody>
<tr>
<td>
<p>GET /order_data/_search <br>{<br>&nbsp; &nbsp;"query": {<br>&nbsp; &nbsp; &nbsp; "match_all": {}<br>&nbsp; &nbsp;} <br>}</p>
</td>
</tr>
</tbody>
</table>
