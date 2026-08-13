---
title: Dissecting the Java Virtual Machine
description:    The Hotspot JVM is a pretty complex piece of software and this detailed article aims to provide a good starting point and lower the barrier for developers willing to contribu...
date: '2013-12-28'
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

<p>&nbsp; &nbsp;The Hotspot JVM is a pretty complex piece of software and this detailed article aims to provide a good starting point and lower the barrier for developers willing to contribute to Hotspot (and related) projects or even build their own cutomized Java virtual machine from the Hotspot codebase. It is the result of digging through a number of resources over the internet, the Java Virtual Machine Specification (7th edition), a number of research document written on the JVM and a decent amount of digging through and experimenting with the codebase. Content is simplified as much as possible. In order to be able to try out the tips in this guide you should have a development environment for the Hotspot JVM - see <a href="https://martin-toshev.com/index.php/software-engineering/tips-and-tricks/79-building-openjdk-under-ubuntu-and-window-7-8">this article</a> for details on how to do it.</p>
<p>&nbsp; &nbsp;The source code is all there! One of the great aspects of open source software. You just have to understand how to deal with it :- )) First we will provide an overview of the architecture and data structures used by the Hotspot JVM, then we will provide an overview of how such a stack-based approach works in terms of Hotspot, give an&nbsp;overview of the Hotpost codebase and how it maps to the concrete components and at the end we will give guidelines on how to debug the Hotspot JVM.&nbsp;</p>
<p>&nbsp; &nbsp;Throughout the article we will refer to &lt;OpenJDK_repo&gt; which is the local clone of the root OpenJDK repository (currently&nbsp;<a href="http://hg.openjdk.java.net/jdk8/tl">http://hg.openjdk.java.net/jdk8/tl</a>) along with its child repositories.</p>
<p>&nbsp; &nbsp;Let's get started :- ))</p>

<h2>Virtual Machine Basics</h2>
<p>There are basically two types of virtual machines for interpreted programming languages - stack-based (like the Hotspot JVM) and register-based (like the Dalvik JVM) that basically provides the same set of features:</p>
<p>&nbsp; &nbsp;- compilation of source language into VM specific bytecode;<br>&nbsp; &nbsp;- data structures to contains instructions and operands (the data the instructions process);<br>&nbsp; &nbsp;- a call stack for function call operations;<br>&nbsp; &nbsp;- an ‘Instruction Pointer’ (IP) pointing to the next instruction to execute;<br>&nbsp; &nbsp;- a virtual ‘CPU’ – the instruction dispatcher that:<br>&nbsp; &nbsp; &nbsp; - fetches the next instruction (addressed by the instruction pointer);<br>&nbsp; &nbsp; &nbsp; - decodes the operands;<br>&nbsp; &nbsp; &nbsp; - executes the instruction.</p>
<p>&nbsp; &nbsp;The difference between the two approaches is in the mechanism used for storing and retrieving operands and their results.</p>
<p><i>Note: The information above is derived from a blog post by Mark Sinnathamby that provides a great comparison between stack-based and register-based virtual machines - see references at the end.</i></p>
<p>&nbsp; &nbsp;Traditionally, most virtual machines intended for actual execution are stack-based, a trend that started with Pascal's Pmachine and continues today with Java's JVM and Microsoft's .Net environment.</p>
<br>
<h2>Architecture<br></h2>
<p>&nbsp; &nbsp;Before you can start experimenting with the Hotspot source code (or any other project in the OpenJDK ecosystem) to not forget to issue the three holy-grail commands to get the latest sources and build the JRE/JDK images (example for Linux - for Windows you need to provide additional arguments to some of the commands as specified in the article for building under Windows):</p>
<table>
<tbody>
<tr>
<td>
<p><strong>./get_source.sh</strong> - get sources from the root and the child repositories<br><strong>bash configure</strong> - run configure script to configure your environment after update of sources<br><strong>make images</strong> - perform an incremental build of the JRE/JDK images using the latest changes in the sources&nbsp;(or "<strong>make clean images</strong>" to perform a full build)</p>
</td>
</tr>
</tbody>
</table>

<p><i>Note: You can use JDK8 build instructions for more options during build - see references.</i></p>
<p>&nbsp; &nbsp;The following diagram describes the high level architecture of a typical Java Virtual Machine implementation (image provided by the JVM architecture article on artima.com - see references):</p>
<p><img src="/images/legacy/architecture/dissecting-the-java-virtual-machine/hotspot_architecture.gif" width="628" height="471" alt="hotspot architecture">&nbsp; &nbsp; &nbsp;</p>
<p>&nbsp; &nbsp;Before we see how a Java application is executed and how it makes use of the memory structures of the JVM the JVM must be started and initialized. If you don't have the source code and you just want to understand the overall architecture without bothering to look into the sources you can just skip this section (and continue from the next section in this article) - but you are not encouraged to do so.</p>
<p>&nbsp; &nbsp;So it all starts with the &lt;OpenJDK_root&gt;/dev/jdk8_tl/jdk/src/share/bin/main.c file (the java/javaw launcher).</p>
<p><i>Note: don't get confused that this is in the 'jdk' project - you can think of the 'jdk' as a superset of the 'jre' - the JRE image is created from source code in the 'jdk' project - in case you are wondering what exactly enters the JDK and JRE images you can inspect the following build chain: &lt;OpenJDK_root&gt;/Makefile -&gt; &lt;OpenJDK_root&gt;/make/Main.gmk -&gt; &lt;OpenJDK_root&gt;/jdk/make/BuildJdk.gmk -&gt; &lt;OpenJDK_root&gt;/jdk/make/Images.gmk - the Images.gmk file provides the logic for building the JDK/JRE images from the build output)</i></p>
<p>&nbsp; &nbsp;The first thing you will notice is that some of the methods called in the various sections (such as JLI_CmdToArgs() which is used to parse command line arguments in windows and is defined in &lt;OpenJDK_root&gt;/jdk/src/windows/bin/cmdtoargs.c) are scattered throughout different files - the reason is because logic specific for building the JDK on a particular platform might be different and the specific details are extracted to different source files that are included at build time - in that matter compilation output varies from platform to platform and output units for one platform do not pollute the build output for another platform.</p>
<p>&nbsp; &nbsp;So the main.c file calls the JLI_Launch() method defined in &lt;OpenJDK_root&gt;/dev/jdk8_tl/jdk/src/share/bin/java.c with a number of parameters. In the implementation of JLI_Launch() you can see that some of methods are not defined in the same file - the reason is again because they might be specific for the target platform and are determined at build time. To see a particular implementation of a method look at the particular java_md*.c file (e.g. java_md_solinux.c for Solaris/Linux) - I guess 'md' stays for 'machine dependent'. The invocation of CreateExecutionEnvironment() performs preparation of the execution environment (e.g. checks whether the JVM library path is valid) and then the LoadJavaVM() method is called to load the JVM library (e.g. jvm.dll for Windows or libjvm.so for Linux) and assign the addresses of library methods to a handle (of type InvocationFunctions) that is used later to create a new JVM instance (by invoking the JNI_CreateJavaVM method). The JVMInit() method is called that performs the actual creation of a separate native thread (other than the one used to invoke the Java program) - it calls the ContinueInNewThread() method that delegates the creation of the particular VM thread to ContinueInNewThread0() method (again - specific for the target platform).</p>
<p>&nbsp; &nbsp;When the JavaMain() method is called in a separate thread it calls the JNI_CreateJavaVM() method from the JVM library using the InitializeJVM() method. The JNI_CreateJavaVM() method is defined in &lt;OpenJDK_root&gt;/hotspot/src/share/vm/prims/jni.cpp. The first thing the JNI_CreateJavaVM() method does is to use an atomic lock (provided by an inline assembly call for the specific platform with Atomic::xchg that uses a variant of the 'xchg' instruction on the particular platform) for locking the process that tries to create an instance of the VM - this is done in order to ensure that only one JVM instance is created per process - multiple JVM instances are not allowed per process because the JVM uses global variables. To create the VM instance the JNI_CreateJavaVM() calls the create_vm() method defined in &lt;OpenJDK_root&gt;/hotspot/src/share/vm/runtime/thread.cpp that is about 400 lines of code and performs a number of activities - some of the most important are the initializations of the memory structures as specified in the architecture diagram above. Here is what happens:</p>
<p>&nbsp; &nbsp;- the output stream module is initialized - it provides utilities from dumping formatted output to the tty (terminal) - this includes standard output of the JVM, GC log and others (depending on the particular options provided to the JVM);</p>
<p>&nbsp; &nbsp;- the java launcher properties are processed (such as '-server' or '-client' that specify the type of the JVM - client JVM provides&nbsp;faster start-up type and less runtime optimizations beforehand while the server JVM has slower start-up time and provides more optimization beforehand - it is more suited for server applications);</p>
<p>&nbsp; &nbsp;- operating system specific settings are initialized;</p>
<p>&nbsp; &nbsp;- default system properties are initialized;</p>
<p>&nbsp; &nbsp;- command line arguments are parsed and aditional OS-specific initializations are performed based on the arguments;</p>
<p>&nbsp; &nbsp;- TLS (thread local storage) is initialized. Each JVM thread has its own storage space that can be addressed from a so called TLS index that points to the TLS. Each thread has its own TLS index that can be used by other threads if they need to access thread-local data of another thread;</p>
<p>&nbsp; &nbsp;- agent libraries (provided by the '-agentlib', '-agentpath' and '-Xrun' options) are launched. One notorius example of such a library agent is jdb debugging library&nbsp;that can be attached to a JVM instance and used by remote debugging clients. In short - agent libraries provide instrumentation capabilities for the applications. For more information on Java agents you can read the 'Introduction to Java Agents' article on JavaBeat - see references at the end or check out the JADE (Java Agent Development Framework) project;</p>
<p>&nbsp; &nbsp;- global data structures are initialized by calling vm_init_globals() - basic type checking is provided (useful when porting to a JVM to a different platform that has specifics regarding the sizes of basic types - they must be adjusted accordingly to the Java type system), heap object sizes are initialized, event log, OS synchronization primitives, perfMemory (performance memory) and chunkPool (memory allocator);</p>
<p>&nbsp; &nbsp;- the Java version of the main thread (instance of JavaThread) is created and attached to the OS thread. If you open the implementation of JavaThread you will see that it has an 'oop' field that points the a Java Thread instance in the heap (in terms of Hotspot an 'oop' is just an object pointer that points to a Java object on the heap from C++ code). At this point we can create Java threads;</p>
<p>&nbsp; &nbsp;- the Java-Level synchronization subsystem is initialized by calling ObjectMonitor::Initialize();</p>
<p>&nbsp; &nbsp;- the other global subsystems and structures are initialized - various counters for the JMX management subsystem (embedded JMX server with default MBeans for managing and monitoring the JVM), for the runtime, thread and classloading systems are initialized, the bytecode template maps are initialized (the interpreters uses these template mappings to match against the currently executing bytecode), the libzip library is loaded so that it can be used to load JAR (esentially ZIP) files, the bootstrap classpath entries are loaded (such as the ones from rt.jar), the code cache is initialized - it is used to store the output from JIT (Just-In-Time) compilation (in short JIT compilation is an optimization technique that compiles methods or loop blocks to native code at runtime to speed up the execution of the target method/loop - but more on that later), the Universe is initialized (basically - memory for heap, the method area and other metadata),&nbsp;the interpreter is initialized (along with the template table for bytecodes), the method counter is initialized (used to support JIT compilation - method invocation counts can be used to determine "hot spots" or regularly called methods);</p>
<p>&nbsp; &nbsp;- various system classes are loaded (such as java.lang.String, java.lang.System, java.lang.Thread, java.lang.ThreadGroup, java.lang.reflect.Method, java.lang.ref.Finalizer, java.lang.Class, and the rest of the System classes);</p>
<p>&nbsp; &nbsp;- the signal dispatcher is initialized (used to propagate OS-level events to appropriate event handlers in the JVM);</p>
<p>&nbsp; &nbsp;- the JIT compilers are initialized (client/server/shark - the shark JIT compiler uses the LLVM compiler infrastructure to JIT compile Java methods without introducing system-specific code; it is used along with the 'Zero' interpreter-only port of Hotspot);</p>
<p>&nbsp; &nbsp;- the JMX server agent is created and started;</p>
<p>&nbsp; &nbsp;- system classes that make use of the new 'invokedynamic' instructions (such as java.lang.invoke.MethodHandle) are initialized;</p>
<p>&nbsp; &nbsp;- biased locking is initialized (this is an optimization technique for synchronization that allows a thread to become "biased" towards an object <br>thus eliminating the overhead in releasing/reacquiring the lock each time the same thread tries to lock/unlock the object - this is useful in case there is no&nbsp;regular lock switching between threads).</p>
<p>&nbsp; &nbsp;Throughout the whole process of starting the JVM various JVMTI (Java Virtual Machine Tooling Interface) events are triggered to notify listener tools <br>for events related to the state of the JVM.</p>
<p>&nbsp; &nbsp;Now that the JVM is initialized along with the memory structures we can invoke the Main class of our application where the lifecycle of our application starts. This is happening when the invocation of JNI_CreateJavaVM() returns and execution continues in the JavaMain() method from &lt;OpenJDK_root&gt;/jdk/src/share/bin/java.c. The loading of the Main class (either <span>provided</span>&nbsp;directly or from a jar file) is performed by the LoadMainClass() method which loads the sun.launcher.LauncherHelper class and calls the static checkAndLoadMain() method that loads the Main class of the application using the system classloader. The static main() method is called from the Main class.<br>At the end the main application thread is detached so that it appear's to the user that the program finishes execution when the main() method finishes. However this is the point where uncaught exceptions are handled by the launcher. At the end the launcher passes control back to the JVM by calling jni_DestroyJavaVM() from &lt;OpenJDK_root&gt;/hotspot/src/share/vm/prims/jni.cpp.&nbsp;You may have noticed that the source structure of the JVM is very self-descriptive:</p>
<p><img src="/images/legacy/architecture/dissecting-the-java-virtual-machine/hotspot_directory_structure.gif" width="650" height="440" alt="hotspot directory structure"></p>
<p><br><i>Note: The share/vm/adlc directory provides an architectural language description compiler that compiles an ADL language used to describe&nbsp;the architecture of a processor. The compiler compiles an ADL file into code which is incorporated into the&nbsp;Optimizing Just In Time Compiler (OJIT) to generate efficient and correct code&nbsp;for the target architecture. The ADL describes three basic different types&nbsp;of architectural features: the instruction set (and associated&nbsp;</i><i>operands) of the target architecture, the register set of the&nbsp;target architecture along with relevant information for the register allocator and the architecture's pipeline for scheduling purposes.&nbsp;The architecture description file along with some additional target specific oracles, written in C++, represent the principal effort in porting the OJIT to a new target architecture.</i><br><i>Note: Native methods (output from JIT compilation) are also called 'nmethods' in terms of the JVM.</i></p>
<br>
<p>&nbsp; &nbsp;Lets get back to the basic archictural diagram and see what happens in little more detail:</p>
<p><img src="/images/legacy/architecture/dissecting-the-java-virtual-machine/hotspot_architecture_diagram_1.png" width="628" height="446" alt="hotspot architecture diagram 1"></p>
<p>&nbsp; &nbsp;Class files are loaded from a particular resource - the file system, JAR archives, over the network etc. For that reason the class loader subsystem is being used. As most you already know there are three standard <br>classloaders used by the JVM:</p>
<p>&nbsp; &nbsp;- the bootstrap classloader that loads the core Java libraries located in the &lt;JAVA_HOME&gt;/jre/lib. It is implemented in&nbsp;&lt;OpenJDK_root&gt;/jdk/src/share/native/java/lang/ClassLoader.c;</p>
<p>&nbsp; &nbsp;- the extensions class loader that loads classes from the JVM extension directories (&lt;JAVA_HOME&gt;/jre/lib/ext or any other directory specified by the java.ext.dirs system property). It is implemented in &lt;OpenJDK_root&gt;/jdk/src/share/classes/sun/misc/Launcher.java <br>(sun.misc.Launcher$ExtClassLoader);</p>
<p>&nbsp; &nbsp;- the system class loader that loads code found on java.class.path, which maps to the CLASSPATH environment variable. It is implemented in &lt;OpenJDK_root&gt;/jdk/src/share/classes/sun/misc/Launcher.java (sun.misc.Launcher$AppClassLoader)</p>
<p>&nbsp; &nbsp;The structure of a class file is desribed by the following diagram:</p>
<p><img src="/images/legacy/architecture/dissecting-the-java-virtual-machine/classfile_structure.gif" width="583" height="317" alt="classfile structure"></p>
<p>&nbsp; &nbsp;The fields are:</p>
<p>&nbsp; &nbsp;- <strong>magic</strong> -&nbsp;The magic item supplies the magic number identifying the class file format; it has the value 0xCAFEBABE;</p>
<p>&nbsp; &nbsp;- <strong>minor_version</strong>, <strong>major_version - </strong>the values of the minor_version and major_version items are the minor and&nbsp;major version numbers of this class file;</p>
<p>&nbsp; &nbsp;- <strong>constant_pool_count</strong> - the value of the constant_pool_count item is equal to the number of entries&nbsp;in the constant_pool table plus one;</p>
<p>&nbsp; &nbsp;- <strong>constant_pool[] - </strong>the constant_pool is a table of structures representing various string&nbsp;constants, class and interface names, field names, and other constants that are&nbsp;referred to within the ClassFile structure and its substructures.access_flags. The value of the access_flags item is a mask of flags used to denote access permissions to and properties of this class or interface;</p>
<p>&nbsp; &nbsp;- <strong>this_class -&nbsp;</strong>The value of the this_class item must be a valid index into the<br>constant_pool table;</p>
<p>&nbsp; &nbsp;- <strong>super_class</strong> - for a class, the value of the super_class item either must be zero or&nbsp;must be a valid index into the constant_pool table;</p>
<p>&nbsp; &nbsp;- <strong>interfaces_count</strong> - the value of the interfaces_count item gives the number of direct&nbsp;superinterfaces of this class or interface type;</p>
<p>&nbsp; &nbsp;- <strong>interfaces[]</strong> - each value in the interfaces array must be a valid index into<br>the constant_pool table;</p>
<p>&nbsp; &nbsp;- <strong>fields_count </strong>- the value of the fields_count item gives the number of field_info&nbsp;structures in the fields table. The field_info structures represent all<br>fields, both class variables and instance variables, declared by this class or<br>interface type;</p>
<p>&nbsp; &nbsp;- <strong>fields[]</strong> - each value in the fields table must be a field_info structure giving<br>a complete description of a field in this class or interface;</p>
<p>&nbsp; &nbsp;- <strong>methods_count</strong> - the value of the methods_count item gives the number of method_info&nbsp;structures in the methods table;</p>
<p>&nbsp; &nbsp;- <strong>methods[]</strong> - each value in the methods table must be a method_info structure giving&nbsp;a complete description of a method in this class or interface;</p>
<p>&nbsp; &nbsp;- <strong>attributes_count</strong> - the value of the attributes_count item gives the number of attributes in the attributes table of this class;</p>
<p>&nbsp; &nbsp;- <strong>attributes[]</strong> - each value of the attributes table must be an attribute_info&nbsp;structure.</p>
<p>So during classloading we have three separate phases:<br>&nbsp; &nbsp;- loading: finding and importing the binary data for a type;<br>&nbsp; &nbsp;- linking: performing verification, preparation, and (optionally) resolution;<br>&nbsp; &nbsp;- verification: ensuring the correctness of the imported type; there are three subphases of of the verification phase;<br>&nbsp; &nbsp; &nbsp; - preparation: memory for class variables is allocated and initialized to default values;<br>&nbsp; &nbsp; &nbsp; - resolution: transforming symbolic references from the type into direct references;<br>&nbsp; &nbsp; &nbsp; - initialization: Java code is invoked that initializes class variables to their proper starting values.</p>
<p>&nbsp; &nbsp;During classloading you should differentiate between class format checking (that checks for the validity of the class file structure during the loading phase) and the bytecode verification phase - that verifies that the bytecode does not have important violations (such as uninitialized variables, method calls that do not match the type of object references, violations of rules regarding data access rules, local variable access violations or stack overflow).&nbsp;</p>
<br>
<p>&nbsp; &nbsp;Of course classloading and program execution make use of the JVM data structures as noted in the following diagram:</p>
<p><img src="/images/legacy/architecture/dissecting-the-java-virtual-machine/hotspot_architecture_diagram_2.png" width="628" height="445" alt="hotspot architecture diagram 2"></p>
<p>&nbsp; &nbsp;The Java Virtual Machine defines various run-time data areas that are used during&nbsp;execution of a program. Some of these data areas are created on Java Virtual&nbsp;Machine start-up and are destroyed only when the Java Virtual Machine exits as we already saw in the short code walk-through at the beginning of the article.<br>&nbsp; &nbsp;Other data areas are per thread. Per-thread data areas are created when a thread is created and destroyed when the thread exits. The following diagram provides an overview of these data structures:</p>

<p><img src="/images/legacy/architecture/dissecting-the-java-virtual-machine/thread_diagram.png" width="300" height="396" alt="thread diagram"></p>
<p>&nbsp; &nbsp;Each Java Virtual Machine thread has its own pc (program counter) register.&nbsp;At any point, each Java Virtual Machine thread is executing the code of a single&nbsp;method, namely the current method for that thread. If that method is not&nbsp;native, the pc register contains the address of the Java Virtual Machine instruction&nbsp;currently being executed. If the method currently being executed by the thread is&nbsp;native, the value of the Java Virtual Machine's pc register is undefined. The Java&nbsp;Virtual Machine's pc register is wide enough to hold a return address or a native&nbsp;pointer on the specific platform. Each thread also has its own stack used to store stack frames for the currently executing method - once new method is entered new stack frame is pushed on the stack and once a method returns - a stack frame is popped. The following diagram provides an overview of a stack frame:</p>

<p><img src="/images/legacy/architecture/dissecting-the-java-virtual-machine/stack_frame.png" width="400" height="103" alt="stack frame"></p>
<p>Each frame contains:</p>
<p>&nbsp; &nbsp;- local variables array;<br>&nbsp; &nbsp;- return value;<br>&nbsp; &nbsp;- operand stack;<br>&nbsp; &nbsp;- reference to runtime constant pool for class of the current method.</p>
<p>&nbsp; &nbsp;As the the JVM is a stack-based JVM the operand stack is used to provide the stack for holding bytecode instruction operands. Here is a simple example:</p>
<p><img src="/images/legacy/architecture/dissecting-the-java-virtual-machine/bytecode_sample.png" width="500" height="215" alt="bytecode sample"></p>
<p>&nbsp; &nbsp;The class data for the loaded Java class is stored in the following structure:</p>

<p><img src="/images/legacy/architecture/dissecting-the-java-virtual-machine/class_data.png" width="300" height="306" alt="class data"></p>
<p>&nbsp; &nbsp;It contains a runtime constant pool that holds constants (or when resolved later some of them become references) to various parts of the class and <br>the bytecode for the methods of the class (the method code).</p>
<p>&nbsp; &nbsp;This class data items are stored in a non-heap memory (also called PermGen or permanent generation) along with the code cache (for storing machine code from JIT-compiled source code) and the string pool (pool of Java strings) as shown in the following diagram:</p>

<p><img src="/images/legacy/architecture/dissecting-the-java-virtual-machine/non_heap_memory.png" width="300" height="306" alt="non heap memory"></p>
<p>&nbsp; &nbsp;The heap is used to allocate class instances and arrays at runtime. Arrays and objects can never be stored on the stack because a frame is not designed to change in size after it has been created. The frame only stores references that point to objects or arrays on the heap. Unlike primitive variables and references in the local variable array (in each frame) objects are always stored on the heap so they are not removed when a method ends. Instead objects are only removed by the garbage collector.&nbsp;To support garbage collection the heap is divided into generations:</p>
<p>&nbsp; &nbsp;- young generation - often split between Eden and Survivor spaces - stores short living objects;</p>
<p>&nbsp; &nbsp;- old Generation&nbsp;(also called Tenured Generation) - stores longer living objects.</p>
<p>&nbsp; &nbsp;The reason why generational garbage collection is very efficient is because typically most Java objects are short lived (e.g. allocated and used only in a particular method) and this allows garbage collection to clean them quickly. Longer living object are more difficult to clean up and for them safepointing is required - safepointing is a mechanism in the JVM that stops executing threads until an operation occurs (such as garbage collection in this case). Such operations (also called "Stop-The-World" or STW) are typically slow.&nbsp;Safepointing works by polling - VM thread poisons/un-poisons polling page and threads "poll" at particular stages in order to check whether a safepoint is triggered. At a safepoint threads cannot modify the Java heap or stack. Other reasons for using safepoints are deoptimization (returning a JIT-compiled bytecode to normal bytecode in case the JVM desides at some point that the JIT-compiled code does not provide optimization at all or when a new class&nbsp;is introduced in the class hierarchy of the class of the JIT-compiled bytecode), Java thread suspension, JVM Tool Interface operations (e.g. heap dumps).<br>Each thread has its own thread allocation buffer (TLAB) that stores objects allocated by the thread and in this regards we have different strategies for garbage collection of objects from the heap spaces are:</p>
<p>&nbsp; &nbsp;- serial - performed by a single thread sequentially over all application threads;<br> &nbsp; - concurrent - performed while applications threads are executing (without safepointing);<br> &nbsp; - parallel - performed in parallel over all application threads.</p>
<p>&nbsp; &nbsp;In this manner we can have combinations for a garbage collector (such as concurrent only, parallel only or both concurrent and parallel).&nbsp;Inside the heap objects have the following structure:</p>
<p><img src="/images/legacy/architecture/dissecting-the-java-virtual-machine/heap_memory_data.png" width="500" height="246" alt="heap memory data"></p>
<p>&nbsp; &nbsp;The field "klass" (a term for the internal of a Java class in JVM) refers to a pointer to the metadata of the object’s class.&nbsp;The field "vtable" is a virtual dispatch table with the methods of the class instances.&nbsp;The "mark word" is the object's header that contains the following fields:</p>
<p>&nbsp; &nbsp;- identity hash code;<br>&nbsp; &nbsp;- age of the object;<br>&nbsp; &nbsp;- lock record address (lock records track objects locked by currently executing methods);<br>&nbsp; &nbsp;- monitor address (address of the object's wait queue);<br>&nbsp; &nbsp;- state (unlocked, light-weight locked, heavy-weight locked, marked for GC);<br>&nbsp; &nbsp;- biased / biasable (includes other fields such as thread ID).</p>
<br>
<p>&nbsp; The last of stage is the actual execution of the loaded Main class starting from the static main() method. This is performed by the execution engine as outlined in the following diagram:</p>
<p><img src="/images/legacy/architecture/dissecting-the-java-virtual-machine/hotspot_architecture_diagram_3.png" width="628" height="445" alt="hotspot architecture diagram 3">&nbsp; &nbsp;Ignoring exceptions, the inner loop of a Java Virtual Machine interpreter is effectively:</p>
<table>
<tbody>
<tr>
<td><span>do {</span><br><span>&nbsp; &nbsp; // atomically calculate pc and fetch opcode at pc;</span><br><span>&nbsp; &nbsp; if (operands) fetch operands;</span><br><span>&nbsp; &nbsp; // execute the action for the opcode;</span><br><span>} while (&lt;there_is_more_to_do&gt;);</span></td>
</tr>
</tbody>
</table>

<p>&nbsp; &nbsp;However we can have different execution techniques:</p>
<p>&nbsp; &nbsp;- interpreting - standard bytecode execution - bytecode instructions are mapped to assembly code that is executed;</p>
<p>&nbsp; &nbsp;- just-in-time (JIT) compilation - compiles bytecode of methods/loops to native code - methods/loops that are to be JIT-compiled are determined either statically or dynamically during program execution;</p>
<p>&nbsp; &nbsp;- adaptive optimization (determines "hot spots" by monitoring execution) - can trigger JIT compilation dynamically during program execution.</p>
<p>&nbsp; &nbsp;Additionally JIT compiled methods can be "deoptimized" as described earlier. To support this a mechanism called "On-Stack Replacement" is triggered that&nbsp;can be used to transfer control back and forth between bytecode and native code execution. JIT compilation is triggered asynchronously by counter overflow for a method/loop (interpreted counts method entries and loopback branches). It also produces relocation info (transferred on next method entry) apart from generated code. In case JIT-compiled code calls not-yet-JIT-compiled code control is transferred to the interpreter.&nbsp;The nmethods (remember? the structure that contains the machine code for JIT-compiled method/loop) produced by the JIT compiler contain also per-safepoint oopmaps (called "GC maps" if considering GC-related safepoints) that contain description of the locations (in registers or on stack) of object pointers (native machine addresses) that point to the safepoint.</p>
<p>&nbsp; &nbsp;Here is how JIT compilation works in general:</p>
<p>&nbsp; &nbsp;1) bytecode is turned into a graph;<br>&nbsp; &nbsp;2) the graph is turned into a linear sequence of operations that manipulate an infinite loop of virtual registers (each node places its result in a virtual register);<br>&nbsp; &nbsp;3) physical registers are allocated for virtual registers (the program stack might be used in case virtual registers exceed physical registers) - e.g. the C1 client JIT compiler uses the Chaitin-Briggs graph-coloring algorithm to achieve correct mapping between virtual and physical registers;<br>&nbsp; &nbsp;4) code for each operation is generated using its allocated registers.</p>
<p>&nbsp; &nbsp;An important point is that in many programming languages, the programmer has the illusion of allocating arbitrarily many variables. However, during compilation, the compiler must decide how to allocate these variables to a small, finite set of registers.In compiler optimization, register allocation is the process of assigning a large number of target program variables onto a small number of CPU registers. Register allocation can happen over a basic block (local register allocation), over a whole function/procedure (global register allocation), or across function boundaries traversed via call-graph (interprocedural register allocation). When done per function/procedure the calling convention may require insertion of save/restore around each call-site.&nbsp;The compiler can construct a graph such that every vertex represents a unique variable in the program. Interference edges connect pairs of vertices which are live at the same time, and preference edges connect pairs of vertices which are involved in move instructions. Register allocation can then be reduced to the problem of K-coloring the resulting graph, where K is the number of registers available on the target architecture.&nbsp;No two vertices sharing an interference edge may be assigned the same color, and vertices sharing a preference edge should be assigned the same color if possible. Some of the vertices may be precolored to begin with, representing variables which must be kept in certain registers due to calling conventions or communication between modules. As graph coloring in general is NP-complete, so is register allocation.</p>
<br>
<h2>Debugging Hotspot</h2>
<p>This section only scratches the surface by providing insights on how to debug the Hotspot codebase. Here are several techniques:</p>
<p>&nbsp; &nbsp;- using JVM flags to dump debugging information;<br>&nbsp; &nbsp;- using various existing tools (or writing your own depending on what you want to debug) - the existing tools are in the &lt;OpenJDK_root&gt;/hotspot/src/share/tools directory;<br>&nbsp; &nbsp;- debugging a sample Java application (with jdb) that encompasses the JVM feature you want to debug - inspecting the application behaviour will allow to debug the targeted JVM feature itself;<br>&nbsp; &nbsp;- using the JVMTI and other seviceability utilities - for inspecting JVM behaviour;<br>&nbsp; &nbsp;- building a debug version of the JVM that will unlock additional JVM flags (see "HotSpot Internals: Explore and Debug the VM at the OS Level" in the references);<br>&nbsp; &nbsp;- dumping debug information on the standard output - of course, dummiest but iron-proof method :- ))).</p>
<h3>Using JVM flags</h3>
<p>&nbsp; &nbsp;To build a debug version of the JVM you may use a separate Hotspot target (the latest JDK image must be already build unless you use an official build from Oracle - it is used for bootstrapping the debug build). This is is an example using 64 bit Windows (with 64 bit Cygwin):</p>
<table>
<tbody>
<tr>
<td><code><span>ALT_BOOTDIR=/cygdrive/d/projects/OpenJDK/dev/jdk8_tl/build/windows-x86_64-normal-server-release/jdk LP64=1 STRIP_POLICY=no_strip make debug</span></code></td>
</tr>
</tbody>
</table>

<p>&nbsp; &nbsp;You should make sure that the proper Visual Studio variables are also provided on the PATH if you are building under Windows. For example (change paths accordingly on your Windows system):</p>
<table>
<tbody>
<tr>
<td><code><span>export PATH="/cygdrive/d/software/Microsoft Visual Studio 10.0/VC/bin/amd64":$PATH</span></code></td>
</tr>
</tbody>
</table>

<p>&nbsp; &nbsp;Also make sure that the LIB and INCLUDE varibles are set properly (look into the vcvars.exe/vcvars64.exe from the Visual Studio directories on how to set them properly).&nbsp;For example (change paths accordingly on your Windows system):</p>
<table>
<tbody>
<tr>
<td><code><span>export LIB=D:\software\Microsoft Visual Studio 10.0\VC\LIB\amd64;D:\software\Microsoft Visual Studio 10.0\VC\ATLMFC\LIB\amd64;C:\Program Files (x86)\Microsoft SDKs\Windows \v7.0A\lib\x64;C:\Program Files\SQLXML 4.0\bin;</span></code><code><span><br>export INCLUDE=D:\software\Microsoft Visual Studio 10.0\VC\INCLUDE;D:\software\Microsoft Visual Studio 10.0\VC\ATLMFC\INCLUDE;C:\Program Files (x86)\Microsoft SDKs\Windows\v7.0A\include;</span></code></td>
</tr>
</tbody>
</table>

<p>&nbsp; &nbsp;Finally issue the following to copy the debug JVM (provided as library) on top of the existing Hotspot JVM library (again change paths accordingly - for Linux the JVM library is in the libjvm.so file):</p>
<table>
<tbody>
<tr>
<td><code><code><span>cd &lt;OpenJDK_root&gt;<br></span></code>cp hotspot/build/windows/windows_amd64_compiler2/debug/jvm.dll build/windows-x86_64-normal-server-release/jdk/bin/server/jvm.dll</code></td>
</tr>
</tbody>
</table>

<p>&nbsp; &nbsp;To verify that the debug build is working check the version of the JVM using &nbsp;the Java launcher:</p>
<table>
<tbody>
<tr>
<td><code><span>cd build/windows-x86_64-normal-server-release/jdk/bin/</span></code><code><span>./java.exe -version</span></code></td>
</tr>
</tbody>
</table>

<p>&nbsp; &nbsp;You should see output similar to the following:</p>
<table>
<tbody>
<tr>
<td>
<p><code><span>openjdk version "1.8.0-internal"<br></span></code><code><span>OpenJDK Runtime Environment (build 1.8.0-internal-martin_2013_12_23_16_13-b00)<br></span></code><code><span>OpenJDK 64-Bit Server VM (build 25.0-b63-internal-debug, mixed mode)</span></code></p>
</td>
</tr>
</tbody>
</table>

<p>&nbsp; &nbsp;You can now see all available debug options by issuing:</p>
<table>
<tbody>
<tr>
<td><code><span>./java.exe -XX:+UnlockDiagnosticVMOptions -XX:+UnlockExperimentalVMOptions -Xprintflags</span></code></td>
</tr>
</tbody>
</table>

<p>&nbsp; &nbsp;or</p>
<table>
<tbody>
<tr>
<td><code><span>./java.exe -XX:+UnlockDiagnosticVMOptions -XX:+UnlockExperimentalVMOptions -XX:+PrintFlagsWithComments</span></code></td>
</tr>
</tbody>
</table>

<p>&nbsp; &nbsp;The -XX:+UnlockDiagnosticVMOptions option enables VM diagnostic options.<br><i>Note: you may need some time to understand some of the options based on your particular use case.</i></p>
<p>&nbsp; &nbsp;Examples (some of the options work only when -XX:+UnlockDiagnosticVMOptions is specified):</p>
<p>./java.exe -XX:+CountBytecodes &lt;program&gt; - prints the number of bytecodes executed by the JVM<br>./java.exe -XX:+PrintBytecodeHistogram &lt;program&gt; - prints statistics on the number of bytecode instructions executed for each type of instruction<br>./java.exe -XX:+LogCompilation &lt;program&gt; - can emit a structured XML log of compilation-related activity during a run of the JVM<br>./java.exe -XX:LogFile=/&lt;path_to_log&gt;/ &lt;program&gt; - prints logging information to a log file <br>./java.exe -XX:+TraceClassLoading &lt;program&gt; - print identities of loaded classes<br>./java.exe -XX:+TraceClassUnloading &lt;program&gt; - print identities of unloaded classes<br>./java.exe -XX:+PrintGCDetails &lt;program&gt; - tracks size of the perm gen<br>./java.exe -XX:+UseSerialGC &lt;program&gt; - Serial GC (Serial-young Serial-old) <br>./java.exe -XX:+UseParallelGC &lt;program&gt; - Parallel GC (Parallel-young Serial-old) <br>./java.exe -XX:+UseParallelOldGC &lt;program&gt; - Parallel Compacting (Parallel-young Parallel-old) <br>./java.exe -XX:+UseConcMarkSweepGC &lt;program&gt; - Concurrent Mark Sweep GC (Parallel-old CMS-old)<br>./java.exe -XX:+PrintAssembly &lt;program&gt; - print assembly code for bytecoded and native methods<br>./java.exe -XX:+PrintOptoAssembly &lt;program&gt; - (C2 only)<br>./java.exe -XX:+PrintNMethods &lt;program&gt; - print nmethods as they are generated<br>./java.exe -XX:+PrintNativeNMethods &lt;program&gt; - print native method wrappers as they are generated<br>./java.exe -XX:+PrintSignatureHandlers &lt;program&gt; - print native method signature handlers<br>./java.exe -XX:+PrintAdapterHandlers &lt;program&gt; - print adapters (i2c, c2i) as they are generated<br>./java.exe -XX:+PrintStubCode &lt;program&gt; print stubs: deopt, uncommon trap, exception, safepoint, runtime support<br>./java.exe -XX:+PrintCompilation &lt;program&gt; - lets you know if any methods are compiled by printing information about compiled methods<br>./java.exe -XX:+PrintInlining &lt;program&gt; - prints information about inlining decisions<br>./java.exe -XX:CompileCommand=... - controls compilation policy</p>
<p>&nbsp; &nbsp;You can print assembly code for each bytecode instruction generated by the template interpreter (decribed earlier in the article) by using the -XX:+PrintInterpreter option - however you will need to install a disassembler plug-in for the JVM (see the article on the PrintAssembly option from the <br>"Hotspot Internals" wiki - see references).</p>
<p>&nbsp; &nbsp;For more JVM flags and command line arguments you can look into the following files:</p>
<ul>
<li>&lt;OpenJDK_root&gt;/hotspot/src/share/vm/runtime/globals.hpp - global options;</li>
<li>&lt;OpenJDK_root&gt;/hotspot/src/share/vm/gc_implementation/g1/g1_globals.hpp - global options specific to the G1 (garbage-first) server garbage collector;</li>
<li>&lt;OpenJDK_root&gt;/hotspot/src/share/vm/runtime/arguments.hpp - global arguments.</li>
</ul>
<h3>Using Existing Tools</h3>
<p><strong>IdealGraphVisualizer tool</strong></p>
<p>&nbsp; &nbsp;The "ideal graph" visualizer is a tool developed to help examine the IR (intermediate representation) from the C2 JIT compiler (refered as "ideal graph"). The tool is located under the &lt;OpenJDK_root&gt;/hotspot/src/share/tools/IdealGraphVisualizer directory.</p>
<p>&nbsp; &nbsp;The JVM support is controlled by the flag -XX:PrintIdealGraphLevel=#<br>where # is:</p>
<p>&nbsp; &nbsp;0: no output, the default<br>&nbsp; &nbsp;1: dumps graph after parsing, before matching, and final code.<br> also dumps graph for failed compiles, if available<br>&nbsp; &nbsp;2: more detail, including after loop opts<br>&nbsp; &nbsp;3: even more detail<br>&nbsp; &nbsp;4: prints graph after parsing every bytecode (very slow)</p>
<p>&nbsp; &nbsp;By default the JVM expects that it will connect to a visualizer on the&nbsp;local host on port 4444. This can be configured using the options&nbsp;-XX:PrintIdealGraphAddress= and -XX:PrintIdealGraphPort=.&nbsp;PrintIdealGraphAddress can actually be a hostname.</p>
<p>&nbsp; &nbsp;Alternatively the output can be sent to a file using&nbsp;-XX:PrintIdealGraphFile=&lt;filename&gt;. Each compiler thread will get it's&nbsp;own file with unique names being generated by adding a number onto the&nbsp;provided file name.</p>
<p><strong>LogCompilation tool</strong></p>
<p>&nbsp; &nbsp;The log compilation tool can be used to parse the output of the -XX:+LogCompilation command switch that is used to log the output from the JIT compilation (and it is not very readable). It is located under the &nbsp;&lt;OpenJDK_root&gt;/hotspot/src/share/tool/LogCompilation directory.</p>
<p>&nbsp; &nbsp;It's main purpose is to recreate output similar to -XX:+PrintCompilation -XX:+PrintInlining output from a debug JVM. It requires a 1.5 JDK to build and simply typing make should build it.&nbsp;It produces a jar file, logc.jar, that can be run on the hotspot.log from LogCompilation output like this:</p>
<table>
<tbody>
<tr>
<td><code><span>java -jar logc.jar hotspot.log</span></code></td>
</tr>
</tbody>
</table>

<p>&nbsp; &nbsp;For more details see the article on the LogCompilation tool in the Hotspot internals wiki.</p>
<p><strong><span>hsdis tool</span></strong></p>
<p>&nbsp; &nbsp;The hsdis tool is a dissasembler used by Hotspot for debugging purposes. For more details see: &lt;OpenJDK_root&gt;hotspot\src\share\tools\hsdis\README.txt</p>
<p><strong>C1visualizer</strong></p>
<p>&nbsp; &nbsp;The C1 visualizer tool is used to visualize work of the C1 JIT client compiler. For more details read the user guide from the c1visualizer project repository (see references).</p>
<p><strong>jmap</strong><br><br></p>
<p>&nbsp; &nbsp;JMAP prints shared object memory maps or heap memory details of a given process or core file or a remote debug server. You can see Oracle documentation for more details on the jmap utility.</p>
<p><strong>jconsole</strong></p>
<p>&nbsp; &nbsp;You can use the JConsole JMX client to connect to the default JMX agent running in the JVM to display various statistics on the running JVM instance.<br>You may need to specify -Dcom.sun.management.jmxremote when starting the application.</p>
<h3>Using serviceability utilities</h3>
<p>&nbsp; &nbsp;Yet another option for debugging the Hotspot JVM is to use serviceability utilities that allow observing JVM operations by other Java processes. Here is a list of the various utility implementations throughout the JVM codebase that you can inspect depending on your use case:</p>
<p>The Serviceability Agent(SA):<br>&nbsp; &nbsp;hotspot/agent/<br>&nbsp; &nbsp;hotspot/src/share/vm/runtime/vmStructs.hpp<br>&nbsp; &nbsp;hotspot/src/share/vm/runtime/vmStructs.cpp<br>&nbsp; &nbsp;jvmstat performance counters:<br>&nbsp; &nbsp;hotspot/src/share/vm/prims/perf.cpp<br>&nbsp; &nbsp;hotspot/src/share/runtime/perfMemory.cpp<br>&nbsp; &nbsp;hotspot/src/share/runtime/perfData.cpp<br>&nbsp; &nbsp;hotspot/src/share/runtime/statSampler.cpp<br>&nbsp; &nbsp;hotspot/src/share/vm/services/*Service.cpp<br>&nbsp; &nbsp;hotspot/src/os/solaris/vm/perfMemory_solaris.cpp<br>&nbsp; &nbsp;hotspot/src/os/linux/vm/perfMemory_linux.cpp<br>&nbsp; &nbsp;hotspot/src/os/win32/vm/perfMemory_win32.cpp</p>
<p>The Java Virtual Machine Tool Interface (JVMTI):<br>&nbsp; &nbsp;hotspot/src/share/vm/prims/jvmtiGen.java<br>&nbsp; &nbsp;hotspot/src/share/vm/prims/jvmtiGen.java<br>&nbsp; &nbsp;hotspot/src/share/vm/prims/jvmti.xml</p>
<p>The Monitoring and Management interface:<br>&nbsp; &nbsp;hotspot/src/share/vm/services/</p>
<p>Dynamic Attach:<br>&nbsp; &nbsp;hotspot/src/share/vm/services/attachListener.*<br>&nbsp; &nbsp;hotspot/src/os/linux/vm/attachListener_linux.cpp<br>&nbsp; &nbsp;hotspot/src/os/solaris/vm/attachListener_solaris.cpp<br>&nbsp; &nbsp;hotspot/src/os/win32/vm/attachListener_win32.cpp</p>
<p>DTrace:<br>&nbsp; &nbsp;hotspot/src/os/solaris/dtrace/<br>&nbsp; &nbsp;hotspot/build/solaris/makefiles/dtrace.make&nbsp;</p>
<p>pstack support:<br>&nbsp; &nbsp;hotspot/src/os/solaris/dtrace/</p>
<p>&nbsp; &nbsp;You can read more about the above utilities also from the Hotspot documentation - see references.</p>
<br>
<h2>Benchmarking your JVM implementation</h2>
<p>&nbsp; &nbsp;There are a number of standard benchmarks that can be used to test the performance of your JVM implementation:</p>
<p>&nbsp; &nbsp;- for client benchmarks you can use <a href="http://www.spec.org/jvm2008/">http://www.spec.org/jvm2008/</a><br>&nbsp; &nbsp;- for server benchmarks you can use <a href="http://www.spec.org/jbb2013/">http://www.spec.org/jbb2013/</a><br>&nbsp; &nbsp;- for numerical computations you can use <a href="http://math.nist.gov/scimark2/">http://math.nist.gov/scimark2/</a><a href="http://math.nist.gov/scimark2/"></a></p>
<p>You can also use the Caliper (<a href="https://code.google.com/p/caliper/"></a><a href="https://code.google.com/p/caliper/">https://code.google.com/p/caliper/</a>)&nbsp;to write your own microbenchmarks for testing the performance of small bits of java code on your JVM implementation.</p>
<h2>Conclusion &nbsp;</h2>
<p>&nbsp; &nbsp;I hope this article gives a decent introduction to the Hotspot codebase and can serve as a reference for understanding how the JVM works and even building your own JVM, tuning a JVM or debugging a JVM implementation. Any suggestions for improvement are more than welcome.</p>
<h2>References</h2>
<p>1) The Java Virtual Machine Specification (Java SE 7 Edition)<br><a href="http://docs.oracle.com/javase/specs/jvms/se7/html/">http://docs.oracle.com/javase/specs/jvms/se7/html/</a></p>
<p>2) The Architecture of the Java Virtual Machine<br><a href="http://www.artima.com/insidejvm/ed2/jvm2.html">http://www.artima.com/insidejvm/ed2/jvm2.html</a></p>
<p>3) JVM Internals<br><a href="http://blog.jamesdbloom.com/JVMInternals.html">http://blog.jamesdbloom.com/JVMInternals.html</a></p>
<p>4) Hotspot JVM tuning<br><a href="http://www.slideshare.net/giladgaron/hotspot-jvm-tuning">http://www.slideshare.net/giladgaron/hotspot-jvm-tuning</a></p>
<p>5) Java Hotspot Virtual Machine, FOSDEM 2007<br><a href="http://openjdk.java.net/groups/hotspot/docs/FOSDEM-2007-HotSpot.pdf">http://openjdk.java.net/groups/hotspot/docs/FOSDEM-2007-HotSpot.pdf</a></p>
<p>6) Learn about JVM internals - what does the JVM do?<br><a href="https://www.youtube.com/watch?v=UwB0OSmkOtQ&amp;list=PL1464F2747F1E66FA">http://www.youtube.com/watch?v=UwB0OSmkOtQ&amp;list=PL1464F2747F1E66FA</a></p>
<p>7) Hotspot group docs<br><a href="http://openjdk.java.net/groups/hotspot/">http://openjdk.java.net/groups/hotspot/</a></p>
<p>8) The Implementation of Lua 5.0<br><a href="http://www.lua.org/doc/jucs05.pdf">http://www.lua.org/doc/jucs05.pdf</a></p>
<p>9) Mani Sarkar's collection of Hotspot links<br><a href="https://gist.github.com/neomatrix369/5743225">https://gist.github.com/neomatrix369/5743225</a></p>
<p>10)&nbsp;Synopsis of articles &amp; videos on Performance tuning, JVM, GC in Java, Mechanical Sympathy, et al<br><a href="http://www.javaadvent.com/2013/12/part-1-of-3-synopsis-of-articles-videos.html"></a><a href="http://www.javaadvent.com/2013/12/part-1-of-3-synopsis-of-articles-videos.html">http://www.javaadvent.com/2013/12/part-1-of-3-synopsis-of-articles-videos.html</a><br><a href="http://www.javaadvent.com/2013/12/part-2-of-3-synopsis-of-articles-videos.html"></a><a href="http://www.javaadvent.com/2013/12/part-2-of-3-synopsis-of-articles-videos.html">http://www.javaadvent.com/2013/12/part-2-of-3-synopsis-of-articles-videos.html</a><br><a href="http://neomatrix369.wordpress.com/2013/12/23/part-3-of-3-synopsis-of-articles-videos-on-performance-tuning-jvm-gc-in-java-mechanical-sympathy-et-al/"></a><a href="http://neomatrix369.wordpress.com/2013/12/23/part-3-of-3-synopsis-of-articles-videos-on-performance-tuning-jvm-gc-in-java-mechanical-sympathy-et-al/"></a><a href="http://www.javaadvent.com/2013/12/part-3-of-3-synopsis-of-articles-videos.html"></a><a href="http://www.javaadvent.com/2013/12/part-3-of-3-synopsis-of-articles-videos.html">http://www.javaadvent.com/2013/12/part-3-of-3-synopsis-of-articles-videos.html</a></p>
<p>11) Dissecting the Hotspot JVM at java2days 2013<br><a href="http://nosoftskills.com/2013/12/dissecting-the-hotspot-vm-at-java2days/">http://nosoftskills.com/2013/12/dissecting-the-hotspot-vm-at-java2days/</a></p>
<p>12) Hacking Hotspot in Eclipse<br><a href="http://neomatrix369.wordpress.com/2013/03/12/hotspot-is-in-focus-again-aka-hacking-hotspot-in-eclipse-juno-under-ubuntu-12-04/">http://neomatrix369.wordpress.com/2013/03/12/hotspot-is-in-focus-again-aka-hacking-hotspot-in-eclipse-juno-under-ubuntu-12-04/</a></p>
<p>13) JVM research (Sun/Oracle labs)<br><a href="http://www.ssw.uni-linz.ac.at/Research/Projects/JVM/">http://www.ssw.uni-linz.ac.at/Research/Projects/JVM/</a><br><a href="https://digitalcollections.anu.edu.au/handle/1885/9053">https://digitalcollections.anu.edu.au/handle/1885/9053</a><br><a href="https://www.cs.tcd.ie/publications/tech-reports/reports.07/TCD-CS-2007-49.pdf">https://www.cs.tcd.ie/publications/tech-reports/reports.07/TCD-CS-2007-49.pdf</a></p>
<p>14) Stack based vs Register based Virtual Machine Architecture, and the Dalvik VM<br><a href="http://markfaction.wordpress.com/2012/07/15/stack-based-vs-register-based-virtual-machine-architecture-and-the-dalvik-vm/">http://markfaction.wordpress.com/2012/07/15/stack-based-vs-register-based-virtual-machine-architecture-and-the-dalvik-vm/</a></p>
<p>15) Hotspot Overview<br><a href="http://www.cs.princeton.edu/picasso/mats/HotspotOverview.pdf">http://www.cs.princeton.edu/picasso/mats/HotspotOverview.pdf</a></p>
<p>16) Hotspot Internals<br><a href="https://wikis.oracle.com/display/HotSpotInternals/Home">https://wikis.oracle.com/display/HotSpotInternals/Home</a></p>
<p>17) JDK8 build instruction (complete rewrite of instructions for JDK7)<br><a href="http://hg.openjdk.java.net/jdk8/build/raw-file/tip/README-builds.html">http://hg.openjdk.java.net/jdk8/build/raw-file/tip/README-builds.html</a></p>
<p>18) Design of the Java HotSpotTM Client Compiler for Java 6<br><a href="http://www.stanford.edu/class/cs343/resources/java-hotspot.pdf">http://www.stanford.edu/class/cs343/resources/java-hotspot.pdf</a></p>
<p>19) Register allocation<br><a href="https://en.wikipedia.org/wiki/Register_allocation">http://en.wikipedia.org/wiki/Register_allocation</a></p>
<p>20) How to JIT – an introduction (awesome post that gives insights on how is JIT-compiled executed at runtime)<br><a href="http://eli.thegreenplace.net/2013/11/05/how-to-jit-an-introduction/">http://eli.thegreenplace.net/2013/11/05/how-to-jit-an-introduction/</a></p>
<p>21) A brief history of Just-in-Time<br><a href="http://web.csie.cgu.edu.tw/~jhchen/course/PL2/A%20brief%20history%20of%20just-in-time.pdf">http://web.csie.cgu.edu.tw/~jhchen/course/PL2/A%20brief%20history%20of%20just-in-time.pdf</a></p>
<p>22) Runtime code generation with JVM and CLR<br><a href="http://www.cs.helsinki.fi/u/vihavain/k12/compiler_project/project/Runtime_Code_Generation_with_JVM_and_CLR.pdf">http://www.cs.helsinki.fi/u/vihavain/k12/compiler_project/project/Runtime_Code_Generation_with_JVM_and_CLR.pdf</a></p>
<p>23) Optimizing ML with Run-Time Code Generation<br><a href="http://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.43.8218&amp;rep=rep1&amp;type=pdf">http://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.43.8218&amp;rep=rep1&amp;type=pdf</a></p>
<p>24) GCC Inline Assembly HOWTO<br><a href="http://www.ibiblio.org/gferg/ldp/GCC-Inline-Assembly-HOWTO.html">http://www.ibiblio.org/gferg/ldp/GCC-Inline-Assembly-HOWTO.html</a></p>
<p>25) Introduction to Java Agents<br><a href="http://www.javabeat.net/introduction-to-java-agents">http://www.javabeat.net/introduction-to-java-agents</a></p>
<p>26) ZeroSharkFaq for IcedTea<br><a href="http://icedtea.classpath.org/wiki/ZeroSharkFaq">http://icedtea.classpath.org/wiki/ZeroSharkFaq</a></p>
<p>27) CrossCompileFaq for IcedTea<br><a href="http://icedtea.classpath.org/wiki/CrossCompileFaq">http://icedtea.classpath.org/wiki/CrossCompileFaq</a></p>
<p>28) The Java HotSpot Server Compiler, Proceedings of the Java Virtual Machine Research and Technology Symposium (JVM '01)<br><a href="https://www.usenix.org/legacy/events/jvm01/full_papers/paleczny/paleczny.pdf">https://www.usenix.org/legacy/events/jvm01/full_papers/paleczny/paleczny.pdf</a></p>
<p>29) HotSpot Internals: Explore and Debug the VM at the OS Level<br><a href="http://openjdkpower.osuosl.org/OpenJDK/JavaOne2013_HS/javaone2013_hs.html#(1)">http://openjdkpower.osuosl.org/OpenJDK/JavaOne2013_HS/javaone2013_hs.html#(1)</a></p>
<p>30) c1visualizer project<br><a href="https://java.net/projects/c1visualizer/">https://java.net/projects/c1visualizer/</a></p>
