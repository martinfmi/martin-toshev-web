---
title: Brief architectural overview of several RDBMS
description: "   The following article provides brief architectural overview of several relational database management systems (Oracle 11g, Microsoft SQL Server, PostgreSQL, DB2 and MySQL) de..."
date: '2014-01-03'
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

<p>&nbsp; &nbsp;The following article provides brief architectural overview of several relational database management systems (Oracle 11g, Microsoft SQL Server, PostgreSQL, DB2 and MySQL) derived on the basis of different sources.</p>
<p>The subject of database system implementation can be divided roughly into three parts:</p>
<ul>
<li>Storage management: how secondary storage is used effectively to hold data and allow it to be accessed quickly;<br><br></li>
<li>Query processing: how queries expressed in a very high-level language such as SQL can be executed efficiently;<br><br></li>
<li>Transaction management: how to support transactions with the ACID properties.</li>
</ul>

<br>
<h1>Oracle 11g</h1>
<p><img src="/images/legacy/architecture/brief-architectural-overview-of-several-rdbms/oracle_architecture.png" width="650" height="356" alt="oracle architecture"></p>

<p><span>&nbsp; &nbsp;The client process establishes communication with the Oracle RDBMS instance and the instance stores session-specific information for the client in an area called PGA (Program Global Area).</span>An Oracle server instance is a complex set of memory structures and operating system processes and it is made up of:</p>
<ul>
<li><span>Oracle’s main memory structure called SGA (System Global Area</span>). The SGA is shared, which means that the multiple processes can access and modify the data contained in it in a synchronized manner.&nbsp; The SGA consists of the Shared Pool,&nbsp; Database buffer cache, Redo Log Buffer and Multithread server structures.<span> The <b>shared pool</b> caches the most recently used SQL statements that have been issued by database users. The <b>l</b></span><b>ibrary cache</b> <span>s</span>tores the text, parsed format, and execution plan of SQL statements that have been submitted to the RDBMS, as well as the headers of PL/SQL packages and procedures that have been executed. For each SQL statement the server first checks the library cache to see if an identical statement has already been submitted and cached. If it has, then the server uses the stored parse tree and execution path for the statement, rather than building these structures from scratch. <span>The <b>D</b></span><b>ictionary cache</b><span> s</span>tores data dictionary rows that have been used to parse SQL statements. Information such as segment information, security and access privileges, and available free storage space is held in this area. The <b><span>database</span></b><b>buffer cache</b> is composed of memory blocks. All data manipulated y Oracle server is first loaded into the buffer cache before being used. All data updates are performed in the buffer blocks<span>.</span> The data movement (swapping and loading) between buffer and disk or other parts of RAM is by least recently Used (LRU) algorithm. The LRU list keeps track of what data blocks are accessed and how often.&nbsp;Buffer blocks that have been modified are called dirty and are placed on the dirty list. The dirty list keeps track of all data modifications made to the cache data that have not been flushed to disk. When Oracle receives a request to change data, the data change is made to the blocks in the buffer cache and written to the redo log, and then the block is put on the dirty list. Subsequent access to this data reads the new value from the changed data in the buffer cache. Dirty data from the dirty list are written to the disk database under deferred update policy. The <b>redo log buffer</b> is used to store redo information in memory before it is flushed to the redo log files on the disk. It is circular buffer.<span> Optional SGA components include: the Java Pool (Cache the most recently used Java objects and application code when Oracle’s JVM option is used), the Large Pool (caches data for large operations such as the Recovery Manager (RMAN) backup and restore activities and Shared Server components and Streams Pool – caches the data associated with queued message requests when Oracle’s advanced queuing option is used;</span></li>
</ul>
<ul>
<li>The Oracle background processes. The Oracle server processes transactions concurrently. Thus, at any time there may be hundreds of simultaneous users performing a number of different operations. To accomplish these tasks, the server divides the entire workload between a number of programs, each of which operates largely independently of one another and has a specific role to play.&nbsp; These programs are referred to as the Oracle background processes.&nbsp;&nbsp;<span>They are:</span></li>
</ul>
<ul>
<li>SMON (System Monitor) -&nbsp; mandatory processperforms instance recovery following an instance crash, coalesces free space in the database, and manages space used for sorting;<br><br></li>
<li>PMON (Process Monitor) – mandatory process that cleans up failed user database connections monitor;<br><br></li>
<li>Database Writer (DBWn) – mandatory process that writes modified database blocks from the SGA’s Database Buffer Cache to the datafiles on disk;<br><br></li>
<li>Log Writer (LGWR) – mandatory process that writes transaction recovery information from the SGA’s Redo Log Buffer to the online Redo Log files on disk;<br><br></li>
<li>Checkpoint (CKPT) – mandatory process that updates the database files following a Checkpoint Event;<br><br></li>
<li>Dispatcher processes (Dnnn) – a dispatcher process passes user requests to the SGA request queue and returns the server responses back to the correct user process;<br><br></li>
<li>Shared Server Processes (Snnn) – serve multiple client requests in the shared server configuration; Applications and utilities access the RDBMS through a user process. The user process connects to a server process, which can be dedicated to one user process or shared among many. The server process parses and executes SQL statements that are submitted to it and returns the result sets back to the user process. It is also the process that reads data blocks from the data files into the database buffer cache. Each process is allocated a section of memory referred to asProcess Global Area&nbsp;(PGA).&nbsp;The contents of the PGA differ depending on what type of connection is made to the database. When a user process connects to the database via a dedicated server process, user session data, stack space, and cursor state information is stored in the PGA. The user session data consists of security and resource usage information; the stack space contains local variables specific to the user session; and the cursor state area contains runtime information for the cursor, including rows returned and cursor return codes. If, however, the user process connects through a shared server process, the session and cursor state information is stored within the SGA;<br><br></li>
<li>Archiver (ARCn) – optional process that copies the transaction recovery information written to disk by LGWR (log writer) to the online Redo Log files and to a secondary location in case it is needed for recovery. Nearly all production databases use this optional process;<br><br></li>
<li>Recoverer (RECO) – optional process that recovers failed transactions that are distributed across multiple databases when using Oracle’s distributed database feature;<br><br></li>
<li>Job Queue Monitor (CJQn) – assigns jobs to the Job Queue processes when using Oracle’s job scheduling feature;<br><br></li>
<li>Memory Manager (MMAN) – Manages the size of each individual SGA component when Oracle’s Automatic Shared Memory Management Feature is used.</li>
</ul>
<br>

<h1>Microsoft SQL Server</h1>
<p><img src="/images/legacy/architecture/brief-architectural-overview-of-several-rdbms/microsoft_sql_server_architecture.png" width="650" height="410" alt="microsoft sql server architecture"></p>
<p><span>&nbsp; &nbsp;When an application communicates with the SQL Server Database Engine, the application programming interfaces (APIs) exposed by the protocol layer formats the communication using a Microsoft-defined format called a tabular data stream (TDS) packet. There are Net-Libraries on both the server and client computers that encapsulate the TDS packet inside a standard communication protocol, such as TCP/IP or Named Pipes. On the server side of the communication, the Net-Libraries are part of the Database Engine, and that protocol layer</span><span>.</span></p>
<p>&nbsp; &nbsp;The database engine component has two subcomponents:</p>
<ul>
<li><span>Storage Engine &nbsp;- responsible for storage and retrieval of data;</span></li>
</ul>
<ul>
<li><span>Query Processor – includes the components of SQL Server that determine what your query needs to do and the best way to do it. It manages the execution of queries as it requests data from the storage engine and processes the results returned.</span></li>
</ul>
<p><span>&nbsp; &nbsp;The SQLOS layer lies between the host machine (Windows OS) and SQL Server. All the activities performed on database engine are taken care of by the SQL OS. It is a highly configurable operating system with powerful API (application programming interface). It enables automatic locality and advanced parallelism. SQL OS provides various operating system services.</span></p>
<p><span>&nbsp; &nbsp;The query processor components are:</span></p>
<ul>
<li><span>Command Parser</span><span> - </span><span>handles Transact-SQL language events sent to SQL Server. It checks for proper syntax and translates Transact-SQL commands into an internal format that can be operated on.</span><span>T</span><span>his internal format is known as a query tree</span><span>;</span></li>
</ul>
<ul>
<li><span>Query Optimizer</span><span> - </span><span>takes the query tree from the command parser and prepares it for execution. Statements that can’t be optimized, such as flow-of-control and DDL commands, are compiled into an internal form. The statements that are optimizable are marked as such and then passed to the optimizer. The optimizer is mainly concerned with the DML statement SELECT, INSERT, UPDATE, and DELETE, which can be processed in more than one way, and it is the optimizer’s job to determine which of the many possible ways is the best. It compiles an entire command batch, optimizes queries that are optimizable, and checks security. The query optimization and compilation result in an execution plan</span><span>;<br><br></span></li>
<li><span> SQL Manager</span><span> - </span><span>responsible for everything related to managing stored procedures and their plans. It determines when a stored procedure needs recompilation, and it manages the caching of procedure plans so that other processes can reuse them.</span><span><br> The SQL manager also handles auto parameterization of queries. In SQL Server 2008, certain kinds of ad hoc queries are treated as if they were parameterized stored procedures, and query plans are generated and saved for them</span><span>;<br><br></span></li>
<li><span> Database Manager</span><span> - </span><span>handles access to the metadata needed for query compilation and optimization, making it clear that none of these separate modules can be run completely separately from the others. The metadata is stored as data and is managed by the storage engine, but metadata elements such as the data types of columns and the available indexes on a table must be available during the query compilation and optimization phase, before actual query execution starts</span><span>;<br><br></span></li>
<li><span>The Query Executor</span><span> - </span><span>runs the execution plan that the optimizer produced, acting as a dispatcher for all the commands in the execution plan. This module steps through each command of the execution plan until the batch is complete. Most of the commands require interaction with the storage engine to modify or retrieve data and to manage</span><span><span>transactions and locking.</span></span></li>
</ul>
<br>
<p><span></span></p>
<h1>IBM DB2</h1>
<p><img src="/images/legacy/architecture/brief-architectural-overview-of-several-rdbms/db2_architecture.png" width="650" height="400" alt="db2 architecture"></p>

<p>&nbsp; &nbsp;On the client side, either local or remote applications, or both, are linked with the DB2 client library. Local clients communicate using shared memory and semaphores; remote clients use a protocol such as Named Pipes (NPIPE), or TCP⁄IP.</p>
<p>&nbsp; &nbsp;On the server side, activity is controlled by engine dispatchable units (EDUs). EDUs are implemented as threads in a single process on Windows-based platforms and as processes on UNIX<sup>®</sup>. DB2 agents are the most common type of EDUs. These agents perform most of the SQL and XQuery processing on behalf of applications. Prefetchers and page cleaners are other common EDUs.</p>
<p>&nbsp; &nbsp;A set of subagents might be assigned to process the client application requests. Multiple subagents can be assigned if the machine where the server resides has multiple processors or is part of a partitioned database. For example, in a symmetric multiprocessing (SMP) environment, multiple SMP subagents can exploit the many processors. All agents and subagents are managed using a pooling algorithm that minimizes the creation and destruction of EDUs.</p>
<p>&nbsp; &nbsp;Buffer pools are areas of database server memory where database pages of user table data, index data, and catalog data are temporarily moved and can be modified. Buffer pools are a key determinant of database performance because data can be accessed much faster from memory than from disk. If more of the data needed by applications is present in a buffer pool, less time is required to access the data than to find it on disk.</p>
<p>&nbsp; &nbsp;The configuration of the buffer pools, as well as prefetcher and page cleaner EDUs, controls how quickly data can be accessed and how readily available it is to applications:</p>
<ul>
<li><b>Prefetchers</b>&nbsp;retrieve data from disk and move it into the buffer pool before applications need the data. For example, applications needing to scan through large volumes of data would have to wait for data to be moved from disk into the buffer pool if there were no data prefetchers. Agents of the application send asynchronous read-ahead requests to a common prefetch queue. As prefetchers become available, they implement those requests by using big-block or scatter-read input operations to bring the requested pages from disk to the buffer pool. If you have multiple disks for storage of the database data, the data can be striped across the disks. Striping data lets the prefetchers use multiple disks at the same time to retrieve data<span>;</span></li>
</ul>
<ul>
<li><b>Page cleaners</b>&nbsp;move data from the buffer pool back out to disk. Page cleaners are background EDUs that are independent of the application agents. They look for pages from the buffer pool that are no longer needed and write the pages to disk. Page cleaners ensure that there is room in the buffer pool for the pages being retrieved by the prefetchers.</li>
</ul>
<p>&nbsp; &nbsp;Without the independent prefetchers and the page cleaner EDUs, the application agents would have to do all of the reading and writing of data between the buffer pool and disk storage.</p>
<br>

<h1>PostgreSQL</h1>
<p><img src="/images/legacy/architecture/brief-architectural-overview-of-several-rdbms/postgresql_architecture.png" width="650" height="400" alt="postgresql architecture"></p>

<p>&nbsp; &nbsp;A PostgreSQL session consists of several main processes:</p>
<ul>
<li>A postmaster process serves as a supervisory process that spawns other processes and listens for user connections<span>;</span></li>
</ul>
<ul>
<li>A user process such as psql is used for interactive SQL querie<span>s;</span></li>
</ul>
<ul>
<li>One or more server processes named postgres are spawned by postmaster to handle users' requests for data<span>;</span></li>
</ul>
<ul>
<li>The server processes communicate with each other through semaphores and shared memory.</li>
</ul>
<br>
<h1>MySQL</h1>
<p><img src="/images/legacy/architecture/brief-architectural-overview-of-several-rdbms/mysql_architecture.png" width="650" height="396" alt="mysql architecture"></p>
<p>&nbsp; &nbsp;A MySQL server process (mysqld) can create a number of threads:</p>
<ul>
<li>A global thread (per server process) is responsible for creating and managing each user connection thread<span>;</span></li>
</ul>
<ul>
<li>A thread is created to handle each new user connection<span>;</span></li>
</ul>
<ul>
<li>Each connection thread also performs authentication and query execution<span>;</span></li>
</ul>
<ul>
<li>On Windows, there is a named pipe handler thread that does the same work as the connection thread for named pipe connection requests;</li>
</ul>
<ul>
<li>A signal thread handles alarms and forces timeouts on connections that have been idle too long<span>;</span></li>
</ul>
<ul>
<li>A thread is allocated to handle shutdown events<span>;</span></li>
</ul>
<ul>
<li>There are threads for handling synchronization of master and slave servers for replication<span>;</span></li>
</ul>
<ul>
<li>Threads are used for table flushing, maintenance tasks, and so on.</li>
</ul>
<h1>References</h1>
<p><span>1) Oracle Process Architecture<br></span><a href="https://martin-toshev.com/index.php/software-engineering/architectures/83-oracle-mssql-postgre-mysql-db2#CNCPT008">http://docs.oracle.com/cd/B28359_01/server.111/b28318/process.htm#CNCPT008</a></p>
<p><span>2) Architecture of Oracle Database Management System<br></span><a href="http://k.web.umkc.edu/kumarv/cs471/oracle-arch.htm">http://k.web.umkc.edu/kumarv/cs471/oracle-arch.htm</a></p>
<p><span>3) Microsoft SQL Server architecture<br></span><a href="http://msdn.microsoft.com/en-us/library/aa933154(v=sql.80).aspx">http://msdn.microsoft.com/en-us/library/aa933154(v=sql.80).aspx</a></p>
<p><span>4)&nbsp;</span>SQL Server Database Architecture<br><a href="http://social.msdn.microsoft.com/Forums/sqlserver/en-US/63485c89-40e1-4347-9cd8-a6547e81aba8/database-architecture?forum=sqlgetstarted">http://social.msdn.microsoft.com/Forums/sqlserver/en-US/63485c89-40e1-4347-9cd8-a6547e81aba8/database-architecture?forum=sqlgetstarted</a></p>
<p><span>5) SQL tutorial: SQLOS<br> </span><a href="http://1hw.in/sql-tutorial-sqlos/"></a><a href="http://1hw.in/sql-tutorial-sqlos/">http://1hw.in/sql-tutorial-sqlos/</a></p>
<p><span>6) SQL Server 2011 architecture<br></span><a href="https://4sqldba.blogspot.com/2011/01/sql-server-2008-architecture.html">http://4sqldba.blogspot.com/2011/01/sql-server-2008-architecture.html</a></p>
<p><span>7)&nbsp;</span>DB2 Architecture and process overview<br><a href="http://publib.boulder.ibm.com/infocenter/db2luw/v9/index.jsp?topic=%2Fcom.ibm.db2.udb.admin.doc%2Fdoc%2Fc0005418.htm">http://publib.boulder.ibm.com/infocenter/db2luw/v9/index.jsp?topic=%2Fcom.ibm.db2.udb.admin.doc%2Fdoc%2Fc0005418.htm</a></p>
<p><span>8)&nbsp;</span>Migrate from MySQL or PostgreSQL to DB2<br><a href="http://www.ibm.com/developerworks/data/library/techarticle/dm-0606khatri/">http://www.ibm.com/developerworks/data/library/techarticle/dm-0606khatri/</a></p>
<p><span>9)&nbsp;</span>MySQL 5.1 Reference Manual<br><a href="http://www.cs.duke.edu/csl/docs/mysql-refman/storage-engines.html">http://www.cs.duke.edu/csl/docs/mysql-refman/storage-engines.html</a><a href="http://www.cs.duke.edu/csl/docs/mysql-refman/storage-engines.html"></a></p>
