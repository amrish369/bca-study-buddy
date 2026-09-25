// Lesson / unit level syllabus for IGNOU BCA subjects.
// Used to fetch a targeted YouTube lecture for every lesson of a subject.

import { findSubject } from "./data";

export interface Lesson {
  /** Display number, e.g. "Unit 1" */
  unit: number;
  title: string;
  block?: string;
}

/** Block-wise unit titles for the subjects with a well known IGNOU syllabus. */
const lessonsByCourse: Record<string, Lesson[]> = {
  "BCS-011": [
    { block: "Block 1: Basics of Computer Hardware", unit: 1, title: "Basic Computer Organisation" },
    { block: "Block 1: Basics of Computer Hardware", unit: 2, title: "Input Output and Storage Devices" },
    { block: "Block 1: Basics of Computer Hardware", unit: 3, title: "Computer Memory and Number System" },
    { block: "Block 2: Operating System and Windows", unit: 4, title: "Introduction to Operating Systems" },
    { block: "Block 2: Operating System and Windows", unit: 5, title: "Working with Windows" },
    { block: "Block 2: Operating System and Windows", unit: 6, title: "Introduction to Linux" },
    { block: "Block 3: PC Software", unit: 7, title: "Word Processing with MS Word" },
    { block: "Block 3: PC Software", unit: 8, title: "Spreadsheets with MS Excel" },
    { block: "Block 3: PC Software", unit: 9, title: "Presentations with MS PowerPoint" },
    { block: "Block 4: Internet and Networking", unit: 10, title: "Data Communication and Networks" },
    { block: "Block 4: Internet and Networking", unit: 11, title: "Internet, Email and Web Browsing" },
    { block: "Block 4: Internet and Networking", unit: 12, title: "Computer Security and Viruses" },
  ],
  "BCS-111": [
    { block: "Block 1: Computer Fundamentals", unit: 1, title: "Basic Computer Organisation" },
    { block: "Block 1: Computer Fundamentals", unit: 2, title: "Number System and Data Representation" },
    { block: "Block 1: Computer Fundamentals", unit: 3, title: "Input Output and Storage Devices" },
    { block: "Block 2: Operating Systems", unit: 4, title: "Introduction to Operating Systems" },
    { block: "Block 2: Operating Systems", unit: 5, title: "Windows Operating System" },
    { block: "Block 2: Operating Systems", unit: 6, title: "Linux Basics and Commands" },
    { block: "Block 3: PC Software", unit: 7, title: "Word Processing" },
    { block: "Block 3: PC Software", unit: 8, title: "Electronic Spreadsheets" },
    { block: "Block 3: PC Software", unit: 9, title: "Presentation Software" },
    { block: "Block 4: Internet Basics", unit: 10, title: "Computer Networks and Internet" },
    { block: "Block 4: Internet Basics", unit: 11, title: "Web Browsing, Email and Cloud Tools" },
    { block: "Block 4: Internet Basics", unit: 12, title: "Computer Security Basics" },
  ],
  "BCS-012": [
    { block: "Block 1: Algebra", unit: 1, title: "Determinants" },
    { block: "Block 1: Algebra", unit: 2, title: "Matrices and Inverse of a Matrix" },
    { block: "Block 1: Algebra", unit: 3, title: "Solution of Linear Equations" },
    { block: "Block 2: Sequences and Series", unit: 4, title: "Arithmetic and Geometric Progression" },
    { block: "Block 2: Sequences and Series", unit: 5, title: "Complex Numbers and Quadratic Equations" },
    { block: "Block 3: Calculus", unit: 6, title: "Limits and Continuity" },
    { block: "Block 3: Calculus", unit: 7, title: "Differentiation and Its Applications" },
    { block: "Block 3: Calculus", unit: 8, title: "Integration and Definite Integrals" },
    { block: "Block 4: Vectors and 3D Geometry", unit: 9, title: "Vector Algebra and Dot/Cross Product" },
    { block: "Block 4: Vectors and 3D Geometry", unit: 10, title: "Straight Lines and Planes in 3D" },
  ],
  "MCS-011": [
    { block: "Block 1: Problem Solving", unit: 1, title: "Problem Solving, Algorithms and Flowcharts" },
    { block: "Block 1: Problem Solving", unit: 2, title: "Basics of C: Data Types and Operators" },
    { block: "Block 2: Control Structures", unit: 3, title: "Decision Making and Loops" },
    { block: "Block 2: Control Structures", unit: 4, title: "Arrays and Strings" },
    { block: "Block 3: Functions and Pointers", unit: 5, title: "Functions and Recursion" },
    { block: "Block 3: Functions and Pointers", unit: 6, title: "Pointers and Dynamic Memory" },
    { block: "Block 4: Advanced C", unit: 7, title: "Structures and Unions" },
    { block: "Block 4: Advanced C", unit: 8, title: "File Handling in C" },
  ],
  "MCS-201": [
    { block: "Block 1: C Programming", unit: 1, title: "Problem Solving, Algorithms and Flowcharts" },
    { block: "Block 1: C Programming", unit: 2, title: "C Basics, Operators and Control Statements" },
    { block: "Block 1: C Programming", unit: 3, title: "Arrays, Strings and Functions" },
    { block: "Block 2: Advanced C", unit: 4, title: "Pointers and Dynamic Memory" },
    { block: "Block 2: Advanced C", unit: 5, title: "Structures, Unions and File Handling" },
    { block: "Block 3: Python Basics", unit: 6, title: "Python Introduction and Data Types" },
    { block: "Block 3: Python Basics", unit: 7, title: "Control Flow, Lists, Tuples and Dictionaries" },
    { block: "Block 4: Advanced Python", unit: 8, title: "Functions, Modules and Exception Handling" },
    { block: "Block 4: Advanced Python", unit: 9, title: "File Handling and Object Oriented Python" },
  ],
  "MCS-202": [
    { block: "Block 1: Digital Logic", unit: 1, title: "Number Systems and Codes" },
    { block: "Block 1: Digital Logic", unit: 2, title: "Boolean Algebra and Logic Gates" },
    { block: "Block 1: Digital Logic", unit: 3, title: "Combinational and Sequential Circuits" },
    { block: "Block 2: CPU Organisation", unit: 4, title: "Register Organisation and ALU Design" },
    { block: "Block 2: CPU Organisation", unit: 5, title: "Instruction Set and Addressing Modes" },
    { block: "Block 2: CPU Organisation", unit: 6, title: "Instruction Cycle and Micro-operations" },
    { block: "Block 3: Memory and I/O", unit: 7, title: "Memory Hierarchy and Cache Memory" },
    { block: "Block 3: Memory and I/O", unit: 8, title: "Input Output Organisation and DMA" },
  ],
  "MCS-012": [
    { block: "Block 1: Digital Logic", unit: 1, title: "Number Systems and Codes" },
    { block: "Block 1: Digital Logic", unit: 2, title: "Boolean Algebra and Logic Gates" },
    { block: "Block 1: Digital Logic", unit: 3, title: "Combinational and Sequential Circuits" },
    { block: "Block 2: CPU", unit: 4, title: "Register Organisation and ALU" },
    { block: "Block 2: CPU", unit: 5, title: "Instruction Set and Addressing Modes" },
    { block: "Block 3: Memory and I/O", unit: 6, title: "Memory Organisation and Cache" },
    { block: "Block 3: Memory and I/O", unit: 7, title: "I/O Organisation, Interrupts and DMA" },
    { block: "Block 4: Assembly Language", unit: 8, title: "8086 Assembly Language Programming" },
  ],
  "MCS-203": [
    { block: "Block 1: Introduction", unit: 1, title: "Operating System Concepts and Types" },
    { block: "Block 1: Introduction", unit: 2, title: "Processes and Threads" },
    { block: "Block 2: Process Management", unit: 3, title: "CPU Scheduling Algorithms" },
    { block: "Block 2: Process Management", unit: 4, title: "Process Synchronisation and Semaphores" },
    { block: "Block 2: Process Management", unit: 5, title: "Deadlocks: Detection, Avoidance, Prevention" },
    { block: "Block 3: Memory Management", unit: 6, title: "Contiguous and Paged Memory Management" },
    { block: "Block 3: Memory Management", unit: 7, title: "Virtual Memory and Page Replacement" },
    { block: "Block 4: Storage and Security", unit: 8, title: "File Systems and Disk Scheduling" },
    { block: "Block 4: Storage and Security", unit: 9, title: "OS Security and Protection" },
  ],
  "MCS-022": [
    { block: "Block 1: OS Fundamentals", unit: 1, title: "Operating System Concepts" },
    { block: "Block 1: OS Fundamentals", unit: 2, title: "Process Management and Scheduling" },
    { block: "Block 2: Memory and Deadlocks", unit: 3, title: "Deadlocks and Synchronisation" },
    { block: "Block 2: Memory and Deadlocks", unit: 4, title: "Memory Management and Virtual Memory" },
    { block: "Block 3: Windows and Linux", unit: 5, title: "Windows Administration" },
    { block: "Block 3: Windows and Linux", unit: 6, title: "Linux Administration and Shell" },
    { block: "Block 4: Networking", unit: 7, title: "Network Basics and TCP/IP Configuration" },
    { block: "Block 4: Networking", unit: 8, title: "Network Services and Security" },
  ],
  "MCS-207": [
    { block: "Block 1: DBMS Basics", unit: 1, title: "Database System Concepts and Architecture" },
    { block: "Block 1: DBMS Basics", unit: 2, title: "ER Model and ER Diagrams" },
    { block: "Block 2: Relational Model", unit: 3, title: "Relational Model and Relational Algebra" },
    { block: "Block 2: Relational Model", unit: 4, title: "SQL: DDL, DML and Joins" },
    { block: "Block 2: Relational Model", unit: 5, title: "Advanced SQL, Views and PL/SQL" },
    { block: "Block 3: Design", unit: 6, title: "Functional Dependency and Normalization" },
    { block: "Block 4: Transactions", unit: 7, title: "Transaction Management and Concurrency Control" },
    { block: "Block 4: Transactions", unit: 8, title: "Recovery, Backup and Database Security" },
  ],
  "MCS-023": [
    { block: "Block 1: DBMS Basics", unit: 1, title: "Database Concepts and Architecture" },
    { block: "Block 1: DBMS Basics", unit: 2, title: "ER Model and Relational Model" },
    { block: "Block 2: SQL", unit: 3, title: "SQL Queries and Joins" },
    { block: "Block 2: SQL", unit: 4, title: "Normalization and Database Design" },
    { block: "Block 3: Transactions", unit: 5, title: "Transactions and Concurrency Control" },
    { block: "Block 3: Transactions", unit: 6, title: "Recovery and Security" },
  ],
  "MCS-208": [
    { block: "Block 1: Introduction", unit: 1, title: "Algorithm Analysis and Complexity" },
    { block: "Block 1: Introduction", unit: 2, title: "Arrays, Linked Lists and Their Operations" },
    { block: "Block 2: Linear Structures", unit: 3, title: "Stacks and Their Applications" },
    { block: "Block 2: Linear Structures", unit: 4, title: "Queues and Circular Queues" },
    { block: "Block 3: Non-linear Structures", unit: 5, title: "Trees, Binary Trees and Traversals" },
    { block: "Block 3: Non-linear Structures", unit: 6, title: "Binary Search Trees, AVL and B-Trees" },
    { block: "Block 3: Non-linear Structures", unit: 7, title: "Graphs, BFS, DFS and Shortest Paths" },
    { block: "Block 4: Searching and Sorting", unit: 8, title: "Searching and Hashing" },
    { block: "Block 4: Searching and Sorting", unit: 9, title: "Sorting Algorithms" },
  ],
  "MCS-021": [
    { block: "Block 1: Basics", unit: 1, title: "Algorithm Analysis and Complexity" },
    { block: "Block 1: Basics", unit: 2, title: "Arrays and Linked Lists" },
    { block: "Block 2: Linear Structures", unit: 3, title: "Stacks and Queues" },
    { block: "Block 3: Trees and Graphs", unit: 4, title: "Trees and Tree Traversal" },
    { block: "Block 3: Trees and Graphs", unit: 5, title: "Graphs and Graph Algorithms" },
    { block: "Block 4: Searching and Files", unit: 6, title: "Searching, Sorting and Hashing" },
    { block: "Block 4: Searching and Files", unit: 7, title: "File Organisation and Indexing" },
  ],
  "BCS-131": [
    { block: "Block 1: OOP Basics", unit: 1, title: "Object Oriented Concepts and C++ Basics" },
    { block: "Block 1: OOP Basics", unit: 2, title: "Classes, Objects and Constructors" },
    { block: "Block 2: Overloading", unit: 3, title: "Function and Operator Overloading" },
    { block: "Block 2: Overloading", unit: 4, title: "Friend Functions and Static Members" },
    { block: "Block 3: Inheritance", unit: 5, title: "Inheritance and Its Types" },
    { block: "Block 3: Inheritance", unit: 6, title: "Virtual Functions and Polymorphism" },
    { block: "Block 4: Advanced C++", unit: 7, title: "Templates and Exception Handling" },
    { block: "Block 4: Advanced C++", unit: 8, title: "File Handling and Streams in C++" },
  ],
  "BCS-031": [
    { block: "Block 1: OOP Basics", unit: 1, title: "Object Oriented Concepts and C++ Basics" },
    { block: "Block 1: OOP Basics", unit: 2, title: "Classes, Objects and Constructors" },
    { block: "Block 2: Overloading", unit: 3, title: "Function and Operator Overloading" },
    { block: "Block 3: Inheritance", unit: 4, title: "Inheritance and Polymorphism" },
    { block: "Block 3: Inheritance", unit: 5, title: "Virtual Functions and Pointers to Objects" },
    { block: "Block 4: Advanced C++", unit: 6, title: "Templates, Exceptions and File Handling" },
  ],
  "MCS-206": [
    { block: "Block 1: Java Basics", unit: 1, title: "Java Introduction, JVM and Data Types" },
    { block: "Block 1: Java Basics", unit: 2, title: "Classes, Objects and Constructors" },
    { block: "Block 2: OOP in Java", unit: 3, title: "Inheritance, Interfaces and Packages" },
    { block: "Block 2: OOP in Java", unit: 4, title: "Exception Handling" },
    { block: "Block 3: Advanced Java", unit: 5, title: "Multithreading" },
    { block: "Block 3: Advanced Java", unit: 6, title: "Collections Framework and Generics" },
    { block: "Block 4: Applications", unit: 7, title: "File I/O and Streams" },
    { block: "Block 4: Applications", unit: 8, title: "GUI with Swing/JavaFX and JDBC" },
  ],
  "MCS-024": [
    { block: "Block 1: Java Basics", unit: 1, title: "Object Oriented Concepts and JVM" },
    { block: "Block 1: Java Basics", unit: 2, title: "Classes, Objects and Inheritance" },
    { block: "Block 2: Core Java", unit: 3, title: "Interfaces, Packages and Exception Handling" },
    { block: "Block 2: Core Java", unit: 4, title: "Multithreading and Synchronisation" },
    { block: "Block 3: Advanced", unit: 5, title: "Collections, I/O Streams and Applets" },
    { block: "Block 3: Advanced", unit: 6, title: "AWT/Swing GUI and JDBC" },
  ],
  "BCS-053": [
    { block: "Block 1: Web Basics", unit: 1, title: "Internet, WWW and Web Architecture" },
    { block: "Block 1: Web Basics", unit: 2, title: "HTML5 Tags, Tables and Forms" },
    { block: "Block 2: Styling", unit: 3, title: "CSS: Selectors, Box Model and Layout" },
    { block: "Block 3: Scripting", unit: 4, title: "JavaScript Basics and DOM" },
    { block: "Block 3: Scripting", unit: 5, title: "Form Validation and Events" },
    { block: "Block 4: Server Side", unit: 6, title: "PHP Basics and Database Connectivity" },
  ],
  "BCS-041": [
    { block: "Block 1: Network Basics", unit: 1, title: "Introduction to Computer Networks and Topologies" },
    { block: "Block 1: Network Basics", unit: 2, title: "OSI and TCP/IP Reference Models" },
    { block: "Block 2: Physical and Data Link", unit: 3, title: "Transmission Media and Encoding" },
    { block: "Block 2: Physical and Data Link", unit: 4, title: "Data Link Layer, Error Detection and MAC" },
    { block: "Block 3: Network Layer", unit: 5, title: "IP Addressing, Subnetting and Routing" },
    { block: "Block 4: Transport and Application", unit: 6, title: "TCP, UDP and Congestion Control" },
    { block: "Block 4: Transport and Application", unit: 7, title: "Application Layer Protocols and Network Security" },
  ],
  "BCS-052": [
    { block: "Block 1: Network Basics", unit: 1, title: "Network Models and TCP/IP" },
    { block: "Block 2: Socket Programming", unit: 2, title: "Sockets, TCP and UDP Programming" },
    { block: "Block 3: Services", unit: 3, title: "DNS, DHCP and Mail Services" },
    { block: "Block 4: Administration", unit: 4, title: "Routing, Firewalls and Network Administration" },
  ],
  "BCS-040": [
    { block: "Block 1: Data and Probability", unit: 1, title: "Data Collection and Presentation" },
    { block: "Block 1: Data and Probability", unit: 2, title: "Measures of Central Tendency and Dispersion" },
    { block: "Block 2: Probability", unit: 3, title: "Probability and Probability Distributions" },
    { block: "Block 3: Inference", unit: 4, title: "Sampling and Estimation" },
    { block: "Block 3: Inference", unit: 5, title: "Testing of Hypothesis and Chi-Square Test" },
    { block: "Block 4: Relationships", unit: 6, title: "Correlation and Regression Analysis" },
  ],
  "BCS-151": [
    { block: "Block 1: Introduction", unit: 1, title: "Software Engineering and Software Process Models" },
    { block: "Block 1: Introduction", unit: 2, title: "Requirement Analysis and SRS" },
    { block: "Block 2: Design", unit: 3, title: "Software Design: Modularity and Coupling" },
    { block: "Block 2: Design", unit: 4, title: "DFD, Data Dictionary and Structured Design" },
    { block: "Block 3: Testing", unit: 5, title: "Software Testing Techniques and Levels" },
    { block: "Block 4: Management", unit: 6, title: "Project Estimation, COCOMO and Risk Management" },
    { block: "Block 4: Management", unit: 7, title: "Software Quality, CMM and Maintenance" },
  ],
  "BCS-051": [
    { block: "Block 1: Introduction", unit: 1, title: "Software Engineering and Process Models" },
    { block: "Block 1: Introduction", unit: 2, title: "Requirement Analysis and SRS" },
    { block: "Block 2: Design", unit: 3, title: "Software Design and DFD" },
    { block: "Block 3: Testing", unit: 4, title: "Software Testing" },
    { block: "Block 4: Management", unit: 5, title: "Project Planning, Estimation and Quality" },
  ],
  "BCS-042": [
    { block: "Block 1: Basics", unit: 1, title: "Algorithms, Efficiency and Asymptotic Notation" },
    { block: "Block 2: Techniques", unit: 2, title: "Divide and Conquer" },
    { block: "Block 2: Techniques", unit: 3, title: "Greedy Algorithms" },
    { block: "Block 3: Advanced", unit: 4, title: "Dynamic Programming" },
    { block: "Block 3: Advanced", unit: 5, title: "Backtracking and Branch & Bound" },
    { block: "Block 4: Complexity", unit: 6, title: "NP-Completeness and Problem Classes" },
  ],
  "BCS-054": [
    { block: "Block 1: Errors", unit: 1, title: "Floating Point Arithmetic and Errors" },
    { block: "Block 2: Equations", unit: 2, title: "Solution of Non-linear Equations" },
    { block: "Block 2: Equations", unit: 3, title: "Solution of Linear Systems" },
    { block: "Block 3: Interpolation", unit: 4, title: "Interpolation: Newton and Lagrange" },
    { block: "Block 4: Integration", unit: 5, title: "Numerical Differentiation and Integration" },
    { block: "Block 4: Integration", unit: 6, title: "Numerical Solution of Differential Equations" },
  ],
  "MCS-013": [
    { block: "Block 1: Sets and Logic", unit: 1, title: "Sets, Relations and Functions" },
    { block: "Block 1: Sets and Logic", unit: 2, title: "Propositional Logic and Proof Techniques" },
    { block: "Block 2: Combinatorics", unit: 3, title: "Permutations, Combinations and Recurrence" },
    { block: "Block 3: Graph Theory", unit: 4, title: "Graphs, Trees and Graph Colouring" },
    { block: "Block 4: Boolean Algebra", unit: 5, title: "Boolean Algebra and Logic Circuits" },
  ],
  "MCS-014": [
    { block: "Block 1: Systems", unit: 1, title: "System Concepts and SDLC" },
    { block: "Block 2: Analysis", unit: 2, title: "Requirement Gathering and Feasibility Study" },
    { block: "Block 2: Analysis", unit: 3, title: "DFD, Data Dictionary and Decision Tables" },
    { block: "Block 3: Design", unit: 4, title: "System Design, ER Diagrams and Normalization" },
    { block: "Block 4: Implementation", unit: 5, title: "Testing, Implementation and Maintenance" },
  ],
  "MCS-015": [
    { block: "Block 1: Communication", unit: 1, title: "Communication Process and Barriers" },
    { block: "Block 2: Listening and Speaking", unit: 2, title: "Listening Skills and Oral Presentation" },
    { block: "Block 3: Writing", unit: 3, title: "Report Writing and Business Correspondence" },
    { block: "Block 4: Interviews", unit: 4, title: "Group Discussion and Interview Skills" },
  ],
  "BCS-062": [
    { block: "Block 1: E-Commerce Basics", unit: 1, title: "Introduction to E-Commerce and Business Models" },
    { block: "Block 2: Technology", unit: 2, title: "EDI and E-Commerce Infrastructure" },
    { block: "Block 3: Payments", unit: 3, title: "Electronic Payment Systems" },
    { block: "Block 4: Security", unit: 4, title: "E-Commerce Security and Cyber Law" },
  ],
  "BCOS-184": [
    { block: "Block 1: Introduction", unit: 1, title: "E-Commerce Concepts and Business Models" },
    { block: "Block 2: Technology", unit: 2, title: "E-Commerce Infrastructure and EDI" },
    { block: "Block 3: Payments", unit: 3, title: "Electronic Payment Systems and E-Banking" },
    { block: "Block 4: Security", unit: 4, title: "Security Issues, Privacy and IT Act" },
  ],
  "MSEI-023": [
    { block: "Block 1: Basics", unit: 1, title: "Information Security Concepts and Threats" },
    { block: "Block 2: Attacks", unit: 2, title: "Malware, Hacking and Network Attacks" },
    { block: "Block 3: Cryptography", unit: 3, title: "Cryptography: Symmetric and Asymmetric" },
    { block: "Block 3: Cryptography", unit: 4, title: "Digital Signature and PKI" },
    { block: "Block 4: Law", unit: 5, title: "Cyber Laws and IT Act 2000" },
  ],
  "MSEI-027": [
    { block: "Block 1: Basics", unit: 1, title: "Digital Forensics Fundamentals" },
    { block: "Block 2: Evidence", unit: 2, title: "Digital Evidence Collection and Handling" },
    { block: "Block 3: Analysis", unit: 3, title: "Disk, Network and Mobile Forensics" },
    { block: "Block 4: Law", unit: 4, title: "Cyber Law and Forensic Reporting" },
  ],
  "BECS-184": [
    { block: "Block 1: Data", unit: 1, title: "Data Types, Collection and Presentation" },
    { block: "Block 2: Descriptive Statistics", unit: 2, title: "Central Tendency and Dispersion" },
    { block: "Block 3: Relationships", unit: 3, title: "Correlation and Regression" },
    { block: "Block 4: Index Numbers", unit: 4, title: "Index Numbers and Time Series" },
  ],
  "BCOC-131": [
    { block: "Block 1: Basics", unit: 1, title: "Accounting Concepts and Principles" },
    { block: "Block 2: Recording", unit: 2, title: "Journal, Ledger and Trial Balance" },
    { block: "Block 3: Final Accounts", unit: 3, title: "Trading, Profit & Loss and Balance Sheet" },
    { block: "Block 4: Special Topics", unit: 4, title: "Depreciation, Provisions and Reserves" },
  ],
  "BCOS-185": [
    { block: "Block 1: Entrepreneurship", unit: 1, title: "Entrepreneurship Concepts and Types" },
    { block: "Block 2: Planning", unit: 2, title: "Business Idea, Opportunity and Business Plan" },
    { block: "Block 3: Finance", unit: 3, title: "Sources of Finance and Startup Funding" },
    { block: "Block 4: Support", unit: 4, title: "MSME Schemes and Institutional Support" },
  ],
  "BEVAE-181": [
    { block: "Block 1: Environment", unit: 1, title: "Environment and Ecosystems" },
    { block: "Block 2: Resources", unit: 2, title: "Natural Resources and Their Conservation" },
    { block: "Block 3: Biodiversity", unit: 3, title: "Biodiversity and Its Conservation" },
    { block: "Block 4: Pollution", unit: 4, title: "Environmental Pollution and Control" },
    { block: "Block 5: Issues", unit: 5, title: "Climate Change, Policies and Sustainable Development" },
  ],
  "BEGLA-136": [
    { block: "Block 1: Workplace English", unit: 1, title: "Communication at the Work Place" },
    { block: "Block 2: Speaking", unit: 2, title: "Telephonic Skills, Meetings and Presentations" },
    { block: "Block 3: Writing", unit: 3, title: "Emails, Letters and Report Writing" },
    { block: "Block 4: Grammar", unit: 4, title: "Grammar, Vocabulary and Sentence Structure" },
  ],
  "FEG-02": [
    { block: "Block 1: Reading", unit: 1, title: "Reading Comprehension Skills" },
    { block: "Block 2: Grammar", unit: 2, title: "Tenses, Articles and Prepositions" },
    { block: "Block 3: Writing", unit: 3, title: "Paragraph, Essay and Letter Writing" },
    { block: "Block 4: Speaking", unit: 4, title: "Listening and Speaking Skills" },
  ],
  "ECO-01": [
    { block: "Block 1: Business", unit: 1, title: "Nature and Scope of Business" },
    { block: "Block 2: Organisation", unit: 2, title: "Forms of Business Organisation" },
    { block: "Block 3: Finance", unit: 3, title: "Business Finance and Stock Exchange" },
    { block: "Block 4: Management", unit: 4, title: "Business Management and Environment" },
  ],
};

/** Fallback lessons for lab / project courses and any course without a mapped syllabus. */
function fallbackLessons(courseCode: string): Lesson[] {
  const subject = findSubject(courseCode);
  if (!subject) return [];
  const topics = subject.importantTopics;
  if (!topics.length) return [];
  const isLab = /L-?\d|LAB/i.test(courseCode) || /Lab/i.test(subject.title);
  const isProject = /Project/i.test(subject.title);
  const block = isProject ? "Project work" : isLab ? "Practical sessions" : "Key study topics";
  return topics.map((t, i) => ({ unit: i + 1, title: t, block }));
}

/** All lessons / units of a subject, block-wise. */
export function lessonsForCourse(courseCode: string): Lesson[] {
  const key = courseCode.toUpperCase();
  return lessonsByCourse[key] ?? fallbackLessons(key);
}

/** Group lessons by their block heading, preserving order. */
export function lessonsByBlock(courseCode: string): { block: string; lessons: Lesson[] }[] {
  const groups: { block: string; lessons: Lesson[] }[] = [];
  for (const lesson of lessonsForCourse(courseCode)) {
    const block = lesson.block ?? "Syllabus";
    const last = groups[groups.length - 1];
    if (last && last.block === block) last.lessons.push(lesson);
    else groups.push({ block, lessons: [lesson] });
  }
  return groups;
}

/** Targeted YouTube search query for one lesson. */
export function lessonVideoQuery(courseCode: string, subjectTitle: string, lesson: Lesson) {
  return `IGNOU ${courseCode} ${lesson.title} lecture in hindi`.slice(0, 155) || subjectTitle;
}
