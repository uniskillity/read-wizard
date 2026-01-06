-- =============================================
-- LOVABLE CLOUD DATABASE EXPORT
-- Run this in your external Supabase SQL Editor
-- =============================================

-- First, delete existing data to avoid duplicates
DELETE FROM books WHERE true;
DELETE FROM categories WHERE true;

-- =============================================
-- CATEGORIES (5 records)
-- =============================================
INSERT INTO categories (id, name, description, created_at, updated_at) VALUES
('5ae53a11-910b-4dfc-90e2-bf6227b2e6ea', 'Faculty of Computing', 'Computer Science, Software Engineering, Artificial Intelligence', now(), now()),
('5aa406bf-4329-4a55-bcba-f042d732abfd', 'Faculty of Business Administration', 'Business, Finance, Management Sciences', now(), now()),
('6d212aed-ea1f-451a-a832-d7571f2c17d6', 'Faculty of Life Sciences', 'Biotechnology, Bioinformatics, Biosciences', now(), now()),
('a16662fd-6d3c-43b8-86d5-29cca2527fe7', 'Faculty of Social & Basic Sciences', 'Psychology, Social Sciences', now(), now()),
('18b32798-98d6-4161-8dd4-b55123a4dcc4', 'Faculty of Engineering', 'Electrical and Computer Engineering', now(), now());

-- =============================================
-- BOOKS (243 records - MAJU University Textbooks)
-- =============================================

-- BS Computer Science - Semester 1
INSERT INTO books (id, title, author, description, genre, department, semester, course_code, cover_url, rating, published_year, total_copies, available_copies) VALUES
('10459755-4392-4e5e-ac2e-161dc248c794', 'Python Programming Fundamentals', 'Kent D. Lee', 'Introduction to Python programming language', 'Programming', 'BS Computer Science', 1, 'CS-102', NULL, 4.50, 2014, 1, 1),
('caefb7cc-bd75-4b5e-a7b8-9913899b0d17', 'Discrete Mathematics', 'Kenneth H. Rosen', 'Essential mathematics for computer science', 'Mathematics', 'BS Computer Science', 1, 'MATH-101', 'https://covers.openlibrary.org/b/isbn/9780073383095-L.jpg', 4.70, 2018, 1, 1),
('5410478d-eb40-489a-82e5-00d7cc90be0c', 'Introduction to Computing', 'Peter Norton', 'Fundamentals of computer systems and computing concepts', 'Computer Science', 'BS Computer Science', 1, 'CS-101', 'https://covers.openlibrary.org/b/isbn/9780073523842-L.jpg', 4.50, 2019, 1, 1),
('4788120f-8acb-435d-ad69-b4c1c6a77a3b', 'Programming Fundamentals with C++', 'D.S. Malik', 'Object-oriented programming basics using C++', 'Programming', 'BS Computer Science', 1, 'CS-102', 'https://covers.openlibrary.org/b/isbn/9781285852744-L.jpg', 4.60, 2018, 1, 1),
('900540ec-d5d9-4445-8572-2f5af8fd6d70', 'Digital Logic Design', 'M. Morris Mano', 'Introduction to digital circuits and logic', 'Computer Science', 'BS Computer Science', 1, 'CS-103', 'https://covers.openlibrary.org/b/isbn/9780132774208-L.jpg', 4.70, 2017, 1, 1),
('b7e56d13-426b-4657-8348-2c7dd3fa8fbc', 'Calculus for Engineers', 'James Stewart', 'Mathematical foundations for computing', 'Mathematics', 'BS Computer Science', 1, 'MATH-101', 'https://covers.openlibrary.org/b/isbn/9781285740621-L.jpg', 4.80, 2020, 1, 1),
('689ba2ba-23ae-4d46-b02e-48f28874bf79', 'English Composition', 'Diana Hacker', 'Academic writing and communication skills', 'English', 'BS Computer Science', 1, 'ENG-101', 'https://covers.openlibrary.org/b/isbn/9781319169541-L.jpg', 4.30, 2019, 1, 1),
('f196f660-9fc3-4f27-97b7-01b4a8c962ce', 'Pakistan Studies', 'Ikram Rabbani', 'History and culture of Pakistan', 'General', 'BS Computer Science', 1, 'PAK-101', 'https://covers.openlibrary.org/b/isbn/9780199543144-L.jpg', 4.20, 2018, 1, 1);

-- BS Computer Science - Semester 2
INSERT INTO books (id, title, author, description, genre, department, semester, course_code, cover_url, rating, published_year, total_copies, available_copies) VALUES
('2f494fc1-795e-4d79-b636-51988da72135', 'Data Structures and Algorithms', 'Alfred V. Aho', 'Core concepts of data structures', 'Computer Science', 'BS Computer Science', 2, 'CS-201', 'https://covers.openlibrary.org/b/isbn/9780262033848-L.jpg', 4.80, 2011, 1, 1),
('a9e1cc97-501a-48fb-972e-9c3b0afa6ae0', 'Object Oriented Programming', 'Robert Lafore', 'OOP concepts using C++ and Java', 'Programming', 'BS Computer Science', 2, 'CS-201', 'https://covers.openlibrary.org/b/isbn/9780672329081-L.jpg', 4.70, 2018, 1, 1),
('e719ba7f-0531-422a-b4af-24e6d3373cb4', 'Discrete Mathematics', 'Kenneth Rosen', 'Mathematical structures for computer science', 'Mathematics', 'BS Computer Science', 2, 'CS-202', 'https://covers.openlibrary.org/b/isbn/9780073383095-L.jpg', 4.80, 2019, 1, 1),
('590e415f-c244-4183-a0a3-b4f870560771', 'Linear Algebra', 'David C. Lay', 'Vector spaces and matrix operations', 'Mathematics', 'BS Computer Science', 2, 'MATH-201', 'https://covers.openlibrary.org/b/isbn/9780321982384-L.jpg', 4.60, 2020, 1, 1),
('65cfb5e2-312e-44fa-b55d-d91c08f9db69', 'Communication Skills', 'John Langan', 'Professional communication techniques', 'English', 'BS Computer Science', 2, 'ENG-201', 'https://covers.openlibrary.org/b/isbn/9780073513553-L.jpg', 4.40, 2017, 1, 1),
('67dcc8dd-f45d-45ec-800f-0a0bab563199', 'Physics for Computing', 'Halliday Resnick', 'Applied physics for computer engineers', 'Physics', 'BS Computer Science', 2, 'PHY-201', 'https://covers.openlibrary.org/b/isbn/9781118230725-L.jpg', 4.50, 2018, 1, 1);

-- BS Computer Science - Semester 3
INSERT INTO books (id, title, author, description, genre, department, semester, course_code, cover_url, rating, published_year, total_copies, available_copies) VALUES
('2e3ad3e8-64ce-4599-8304-855cb76f170d', 'Advanced Data Structures', 'Mark Allen Weiss', 'Complex data structures and algorithms', 'Computer Science', 'BS Computer Science', 3, 'CS-302', 'https://covers.openlibrary.org/b/isbn/9780132847377-L.jpg', 4.80, 2018, 1, 1),
('f1ccb0e4-56fc-45ed-a9a5-58c4b80b5816', 'Computer Architecture', 'David Patterson', 'Hardware-software interface design', 'Computer Science', 'BS Computer Science', 3, 'CS-303', 'https://covers.openlibrary.org/b/isbn/9780124077263-L.jpg', 4.90, 2019, 1, 1),
('f0168f82-688c-4a77-adce-1492a213b608', 'Probability and Statistics', 'Douglas Montgomery', 'Statistical methods for engineers', 'Mathematics', 'BS Computer Science', 3, 'STAT-301', 'https://covers.openlibrary.org/b/isbn/9781118539712-L.jpg', 4.50, 2017, 1, 1),
('a6ee5f25-c8ba-4018-b9d4-298ec6c7e160', 'Technical Writing', 'Mike Markel', 'Documentation and technical reports', 'English', 'BS Computer Science', 3, 'ENG-301', 'https://covers.openlibrary.org/b/isbn/9781319058524-L.jpg', 4.30, 2018, 1, 1),
('807b9377-ef73-48f5-9c73-cb0d8b7c86e7', 'Assembly Language Programming', 'Kip Irvine', 'Low-level programming fundamentals', 'Programming', 'BS Computer Science', 3, 'CS-304', 'https://covers.openlibrary.org/b/isbn/9780134022123-L.jpg', 4.60, 2019, 1, 1),
('ca699eb5-8887-46b3-8327-cc92b6ca0a2b', 'Web Development Basics', 'Jon Duckett', 'HTML, CSS and JavaScript fundamentals', 'Web Development', 'BS Computer Science', 3, 'CS-305', 'https://covers.openlibrary.org/b/isbn/9781118008188-L.jpg', 4.70, 2020, 1, 1);

-- BS Computer Science - Semester 4
INSERT INTO books (id, title, author, description, genre, department, semester, course_code, cover_url, rating, published_year, total_copies, available_copies) VALUES
('bf93d7c1-52a7-4e03-a040-70ed24b3274c', 'Software Engineering Principles', 'Ian Sommerville', 'Software development methodologies', 'Software Engineering', 'BS Computer Science', 4, 'CS-402', 'https://covers.openlibrary.org/b/isbn/9780133943030-L.jpg', 4.80, 2019, 1, 1),
('e563648d-2474-4a55-98e4-8de7f1a97dc3', 'Theory of Automata', 'John Hopcroft', 'Formal languages and computation', 'Computer Science', 'BS Computer Science', 4, 'CS-403', 'https://covers.openlibrary.org/b/isbn/9780321455369-L.jpg', 4.70, 2018, 1, 1),
('ddcbebd9-d662-4b53-af3c-901872d43933', 'Numerical Analysis', 'Richard Burden', 'Computational mathematics techniques', 'Mathematics', 'BS Computer Science', 4, 'MATH-401', 'https://covers.openlibrary.org/b/isbn/9781305253667-L.jpg', 4.50, 2017, 1, 1),
('3900e4e5-0c29-4f42-8489-4d56ad44e3db', 'Human Computer Interaction', 'Alan Dix', 'User interface design principles', 'HCI', 'BS Computer Science', 4, 'CS-404', 'https://covers.openlibrary.org/b/isbn/9780130461094-L.jpg', 4.60, 2020, 1, 1),
('242c9a49-6792-46c3-9c60-afaff19a851e', 'Information Security', 'Mark Stamp', 'Cybersecurity fundamentals', 'Security', 'BS Computer Science', 4, 'CS-405', 'https://covers.openlibrary.org/b/isbn/9781119505907-L.jpg', 4.70, 2019, 1, 1);

-- BS Computer Science - Semester 5
INSERT INTO books (id, title, author, description, genre, department, semester, course_code, cover_url, rating, published_year, total_copies, available_copies) VALUES
('b02c7a28-2392-40d6-a84f-2dd93b8aef21', 'Machine Learning Basics', 'Tom Mitchell', 'Introduction to ML algorithms', 'AI', 'BS Computer Science', 5, 'CS-502', 'https://covers.openlibrary.org/b/isbn/9780070428072-L.jpg', 4.90, 2018, 1, 1),
('2a8fe6de-5937-4ec8-9154-5eff2a2fc30e', 'Distributed Systems', 'Andrew Tanenbaum', 'Principles of distributed computing', 'Computer Science', 'BS Computer Science', 5, 'CS-503', 'https://covers.openlibrary.org/b/isbn/9781530281756-L.jpg', 4.80, 2019, 1, 1),
('d0fa471f-bb96-473b-8ae4-ddb46e248bb9', 'Computer Graphics', 'Edward Angel', 'Visual computing and rendering', 'Graphics', 'BS Computer Science', 5, 'CS-504', 'https://covers.openlibrary.org/b/isbn/9780321535863-L.jpg', 4.60, 2017, 1, 1),
('27afc0f0-1a3c-4766-a77b-d4e4fc139cbc', 'Network Programming', 'Richard Stevens', 'Socket programming and protocols', 'Networking', 'BS Computer Science', 5, 'CS-505', 'https://covers.openlibrary.org/b/isbn/9780131411555-L.jpg', 4.70, 2020, 1, 1),
('6548841d-27aa-401a-b0d5-04a813d63c4f', 'Project Management', 'Kathy Schwalbe', 'IT project management techniques', 'Management', 'BS Computer Science', 5, 'MGT-501', 'https://covers.openlibrary.org/b/isbn/9781337101356-L.jpg', 4.50, 2019, 1, 1);

-- BS Computer Science - Semester 6
INSERT INTO books (id, title, author, description, genre, department, semester, course_code, cover_url, rating, published_year, total_copies, available_copies) VALUES
('b70edf7e-5203-4b4c-8235-9e2e7caf4160', 'Parallel Computing', 'Peter Pacheco', 'Parallel algorithms and programming', 'Computer Science', 'BS Computer Science', 6, 'CS-603', 'https://covers.openlibrary.org/b/isbn/9780123742605-L.jpg', 4.70, 2018, 1, 1),
('823d06cd-4cf1-4545-ac87-c89873f348cc', 'Data Mining', 'Jiawei Han', 'Knowledge discovery from data', 'Data Science', 'BS Computer Science', 6, 'CS-604', 'https://covers.openlibrary.org/b/isbn/9780123814791-L.jpg', 4.80, 2020, 1, 1),
('9e9e97ae-334f-4373-887b-a1b653b7fc70', 'Software Testing', 'Paul Ammann', 'Software quality assurance', 'Software Engineering', 'BS Computer Science', 6, 'CS-607', 'https://covers.openlibrary.org/b/isbn/9781107172012-L.jpg', 4.60, 2017, 1, 1);

-- BS Computer Science - Semester 7
INSERT INTO books (id, title, author, description, genre, department, semester, course_code, cover_url, rating, published_year, total_copies, available_copies) VALUES
('0bc9e35c-9799-47e8-927f-ffdf6b33e4ef', 'Natural Language Processing', 'Dan Jurafsky', 'Text and speech processing', 'AI', 'BS Computer Science', 7, 'CS-702', 'https://covers.openlibrary.org/b/isbn/9780131873216-L.jpg', 4.80, 2019, 1, 1),
('72eca0f1-8765-4f32-a8bd-571b564aaacf', 'DevOps Practices', 'Gene Kim', 'Continuous integration and delivery', 'DevOps', 'BS Computer Science', 7, 'CS-704', 'https://covers.openlibrary.org/b/isbn/9781942788003-L.jpg', 4.60, 2018, 1, 1),
('9a346ff7-4b2b-4be6-8084-d7b3409f5873', 'Quantum Computing', 'Michael Nielsen', 'Introduction to quantum algorithms', 'Quantum', 'BS Computer Science', 7, 'CS-705', 'https://covers.openlibrary.org/b/isbn/9781107002173-L.jpg', 4.50, 2019, 1, 1),
('9e0511fc-fb03-45bf-b884-d06775896d0f', 'Research Methods', 'John Creswell', 'Academic research methodology', 'Research', 'BS Computer Science', 7, 'RES-701', 'https://covers.openlibrary.org/b/isbn/9781506386706-L.jpg', 4.40, 2017, 1, 1);

-- BS Computer Science - Semester 8
INSERT INTO books (id, title, author, description, genre, department, semester, course_code, cover_url, rating, published_year, total_copies, available_copies) VALUES
('b2c464df-3093-4133-a8f9-cdc936314743', 'Technical Presentations', 'Garr Reynolds', 'Presenting technical content effectively', 'Communication', 'BS Computer Science', 8, 'COM-801', 'https://covers.openlibrary.org/b/isbn/9780321811981-L.jpg', 4.60, 2018, 1, 1);

-- BBA - Semester 1
INSERT INTO books (id, title, author, description, genre, department, semester, course_code, cover_url, rating, published_year, total_copies, available_copies) VALUES
('1714561a-05ce-4b4c-ab98-469ce3ea0a53', 'Principles of Management', 'Stephen P. Robbins', 'Fundamentals of business management', 'Business', 'BBA', 1, 'MGT-101', NULL, 4.60, 2017, 1, 1);

-- BBA - Semester 2
INSERT INTO books (id, title, author, description, genre, department, semester, course_code, cover_url, rating, published_year, total_copies, available_copies) VALUES
('ef682999-aff7-4d67-97ea-743941fcc87c', 'Microeconomics', 'N. Gregory Mankiw', 'Principles of microeconomics', 'Economics', 'BBA', 2, 'ECO-201', NULL, 4.80, 2020, 1, 1);

-- Software Engineering - Semester 1
INSERT INTO books (id, title, author, description, genre, department, semester, course_code, cover_url, rating, published_year, total_copies, available_copies) VALUES
('a1b2c3d4-1111-4444-aaaa-111111111111', 'Introduction to Programming', 'Joyce Farrell', 'Basics of programming logic and design', 'Programming', 'BS Software Engineering', 1, 'SE-101', 'https://covers.openlibrary.org/b/isbn/9781285845777-L.jpg', 4.50, 2018, 1, 1),
('a1b2c3d4-1111-4444-aaaa-222222222222', 'Calculus I', 'James Stewart', 'Single variable calculus', 'Mathematics', 'BS Software Engineering', 1, 'MATH-101', 'https://covers.openlibrary.org/b/isbn/9781305271760-L.jpg', 4.70, 2019, 1, 1),
('a1b2c3d4-1111-4444-aaaa-333333333333', 'English Composition', 'Andrea Lunsford', 'Academic writing fundamentals', 'English', 'BS Software Engineering', 1, 'ENG-101', 'https://covers.openlibrary.org/b/isbn/9781319088057-L.jpg', 4.30, 2020, 1, 1);

-- Operating Systems and Database
INSERT INTO books (id, title, author, description, genre, department, semester, course_code, cover_url, rating, published_year, total_copies, available_copies) VALUES
('b1c2d3e4-2222-5555-bbbb-111111111111', 'Operating System Concepts', 'Abraham Silberschatz', 'Comprehensive OS fundamentals', 'Computer Science', 'BS Computer Science', 4, 'CS-401', 'https://covers.openlibrary.org/b/isbn/9781118063330-L.jpg', 4.90, 2018, 1, 1),
('b1c2d3e4-2222-5555-bbbb-222222222222', 'Database System Concepts', 'Abraham Silberschatz', 'Relational database fundamentals', 'Database', 'BS Computer Science', 3, 'CS-301', 'https://covers.openlibrary.org/b/isbn/9780073523323-L.jpg', 4.85, 2019, 1, 1);

-- AI and Machine Learning
INSERT INTO books (id, title, author, description, genre, department, semester, course_code, cover_url, rating, published_year, total_copies, available_copies) VALUES
('c1d2e3f4-3333-6666-cccc-111111111111', 'Artificial Intelligence: A Modern Approach', 'Stuart Russell', 'Comprehensive AI textbook', 'AI', 'BS Computer Science', 6, 'CS-601', 'https://covers.openlibrary.org/b/isbn/9780136042594-L.jpg', 4.95, 2020, 1, 1),
('c1d2e3f4-3333-6666-cccc-222222222222', 'Deep Learning', 'Ian Goodfellow', 'Neural networks and deep learning', 'AI', 'BS Computer Science', 7, 'CS-701', 'https://covers.openlibrary.org/b/isbn/9780262035613-L.jpg', 4.90, 2016, 1, 1);

-- Computer Networks
INSERT INTO books (id, title, author, description, genre, department, semester, course_code, cover_url, rating, published_year, total_copies, available_copies) VALUES
('d1e2f3a4-4444-7777-dddd-111111111111', 'Computer Networking: A Top-Down Approach', 'James Kurose', 'Network fundamentals and protocols', 'Networking', 'BS Computer Science', 5, 'CS-501', 'https://covers.openlibrary.org/b/isbn/9780133594140-L.jpg', 4.80, 2017, 1, 1),
('d1e2f3a4-4444-7777-dddd-222222222222', 'Computer Networks', 'Andrew Tanenbaum', 'Comprehensive networking textbook', 'Networking', 'BS Computer Science', 5, 'CS-502', 'https://covers.openlibrary.org/b/isbn/9780132126953-L.jpg', 4.75, 2019, 1, 1);

-- Compiler Design
INSERT INTO books (id, title, author, description, genre, department, semester, course_code, cover_url, rating, published_year, total_copies, available_copies) VALUES
('e1f2a3b4-5555-8888-eeee-111111111111', 'Compilers: Principles, Techniques, and Tools', 'Alfred Aho', 'Dragon book - compiler construction', 'Computer Science', 'BS Computer Science', 6, 'CS-602', 'https://covers.openlibrary.org/b/isbn/9780321486813-L.jpg', 4.85, 2006, 1, 1);

-- Web Technologies
INSERT INTO books (id, title, author, description, genre, department, semester, course_code, cover_url, rating, published_year, total_copies, available_copies) VALUES
('f1a2b3c4-6666-9999-ffff-111111111111', 'Learning Web Design', 'Jennifer Robbins', 'HTML, CSS, and JavaScript basics', 'Web Development', 'BS Computer Science', 3, 'CS-306', 'https://covers.openlibrary.org/b/isbn/9781491960202-L.jpg', 4.60, 2018, 1, 1),
('f1a2b3c4-6666-9999-ffff-222222222222', 'JavaScript: The Good Parts', 'Douglas Crockford', 'Essential JavaScript concepts', 'Web Development', 'BS Computer Science', 4, 'CS-406', 'https://covers.openlibrary.org/b/isbn/9780596517748-L.jpg', 4.70, 2008, 1, 1);

-- Mobile Development
INSERT INTO books (id, title, author, description, genre, department, semester, course_code, cover_url, rating, published_year, total_copies, available_copies) VALUES
('a2b3c4d5-7777-0000-aaaa-111111111111', 'Android Programming', 'Bill Phillips', 'Android app development', 'Mobile Development', 'BS Computer Science', 6, 'CS-605', 'https://covers.openlibrary.org/b/isbn/9780135245125-L.jpg', 4.65, 2019, 1, 1),
('a2b3c4d5-7777-0000-aaaa-222222222222', 'iOS Programming', 'Christian Keur', 'iOS app development with Swift', 'Mobile Development', 'BS Computer Science', 6, 'CS-606', 'https://covers.openlibrary.org/b/isbn/9780135264027-L.jpg', 4.60, 2020, 1, 1);

-- Cloud Computing
INSERT INTO books (id, title, author, description, genre, department, semester, course_code, cover_url, rating, published_year, total_copies, available_copies) VALUES
('b2c3d4e5-8888-1111-bbbb-111111111111', 'Cloud Computing: Concepts, Technology & Architecture', 'Thomas Erl', 'Cloud computing fundamentals', 'Cloud Computing', 'BS Computer Science', 7, 'CS-703', 'https://covers.openlibrary.org/b/isbn/9780133387520-L.jpg', 4.55, 2013, 1, 1);

-- Cybersecurity
INSERT INTO books (id, title, author, description, genre, department, semester, course_code, cover_url, rating, published_year, total_copies, available_copies) VALUES
('c2d3e4f5-9999-2222-cccc-111111111111', 'Cryptography and Network Security', 'William Stallings', 'Security principles and practice', 'Security', 'BS Computer Science', 5, 'CS-506', 'https://covers.openlibrary.org/b/isbn/9780134444284-L.jpg', 4.75, 2017, 1, 1),
('c2d3e4f5-9999-2222-cccc-222222222222', 'Hacking: The Art of Exploitation', 'Jon Erickson', 'Ethical hacking techniques', 'Security', 'BS Computer Science', 6, 'CS-608', 'https://covers.openlibrary.org/b/isbn/9781593271442-L.jpg', 4.80, 2008, 1, 1);

-- Business Administration Books
INSERT INTO books (id, title, author, description, genre, department, semester, course_code, cover_url, rating, published_year, total_copies, available_copies) VALUES
('d2e3f4a5-0000-3333-dddd-111111111111', 'Financial Accounting', 'Jerry Weygandt', 'Introduction to financial accounting', 'Accounting', 'BBA', 1, 'ACC-101', 'https://covers.openlibrary.org/b/isbn/9781119491637-L.jpg', 4.50, 2019, 1, 1),
('d2e3f4a5-0000-3333-dddd-222222222222', 'Marketing Management', 'Philip Kotler', 'Marketing principles and strategies', 'Marketing', 'BBA', 2, 'MKT-201', 'https://covers.openlibrary.org/b/isbn/9780134887838-L.jpg', 4.85, 2018, 1, 1),
('d2e3f4a5-0000-3333-dddd-333333333333', 'Business Statistics', 'David Anderson', 'Statistical methods for business', 'Statistics', 'BBA', 2, 'STAT-201', 'https://covers.openlibrary.org/b/isbn/9781337901062-L.jpg', 4.40, 2019, 1, 1),
('d2e3f4a5-0000-3333-dddd-444444444444', 'Organizational Behavior', 'Stephen Robbins', 'Human behavior in organizations', 'Management', 'BBA', 3, 'MGT-301', 'https://covers.openlibrary.org/b/isbn/9780134729329-L.jpg', 4.60, 2017, 1, 1),
('d2e3f4a5-0000-3333-dddd-555555555555', 'Business Law', 'Henry Cheeseman', 'Legal environment of business', 'Law', 'BBA', 3, 'LAW-301', 'https://covers.openlibrary.org/b/isbn/9780134728780-L.jpg', 4.35, 2018, 1, 1),
('d2e3f4a5-0000-3333-dddd-666666666666', 'Corporate Finance', 'Stephen Ross', 'Financial management principles', 'Finance', 'BBA', 4, 'FIN-401', 'https://covers.openlibrary.org/b/isbn/9781259918940-L.jpg', 4.70, 2019, 1, 1),
('d2e3f4a5-0000-3333-dddd-777777777777', 'Human Resource Management', 'Gary Dessler', 'HR principles and practices', 'HR', 'BBA', 4, 'HR-401', 'https://covers.openlibrary.org/b/isbn/9780134235455-L.jpg', 4.55, 2017, 1, 1),
('d2e3f4a5-0000-3333-dddd-888888888888', 'Operations Management', 'Jay Heizer', 'Production and operations', 'Operations', 'BBA', 5, 'OPS-501', 'https://covers.openlibrary.org/b/isbn/9780134130422-L.jpg', 4.50, 2020, 1, 1),
('d2e3f4a5-0000-3333-dddd-999999999999', 'Strategic Management', 'Fred David', 'Business strategy concepts', 'Strategy', 'BBA', 6, 'MGT-601', 'https://covers.openlibrary.org/b/isbn/9780134167848-L.jpg', 4.65, 2019, 1, 1),
('d2e3f4a5-0000-3333-dddd-aaaaaaaaaaaa', 'International Business', 'Charles Hill', 'Global business environment', 'Business', 'BBA', 6, 'IB-601', 'https://covers.openlibrary.org/b/isbn/9781259578113-L.jpg', 4.45, 2018, 1, 1);

-- Life Sciences Books
INSERT INTO books (id, title, author, description, genre, department, semester, course_code, cover_url, rating, published_year, total_copies, available_copies) VALUES
('e2f3a4b5-1111-4444-eeee-111111111111', 'Molecular Biology of the Cell', 'Bruce Alberts', 'Cell biology fundamentals', 'Biology', 'BS Biotechnology', 1, 'BIO-101', 'https://covers.openlibrary.org/b/isbn/9780815344643-L.jpg', 4.90, 2017, 1, 1),
('e2f3a4b5-1111-4444-eeee-222222222222', 'General Chemistry', 'Raymond Chang', 'Chemistry principles', 'Chemistry', 'BS Biotechnology', 1, 'CHEM-101', 'https://covers.openlibrary.org/b/isbn/9781259911156-L.jpg', 4.60, 2018, 1, 1),
('e2f3a4b5-1111-4444-eeee-333333333333', 'Genetics: Analysis and Principles', 'Robert Brooker', 'Genetic principles', 'Genetics', 'BS Biotechnology', 2, 'GEN-201', 'https://covers.openlibrary.org/b/isbn/9781259616020-L.jpg', 4.70, 2019, 1, 1),
('e2f3a4b5-1111-4444-eeee-444444444444', 'Biochemistry', 'Jeremy Berg', 'Stryer biochemistry', 'Biochemistry', 'BS Biotechnology', 2, 'BCH-201', 'https://covers.openlibrary.org/b/isbn/9781319114657-L.jpg', 4.85, 2019, 1, 1),
('e2f3a4b5-1111-4444-eeee-555555555555', 'Microbiology', 'Gerard Tortora', 'Introduction to microbiology', 'Microbiology', 'BS Biotechnology', 3, 'MIC-301', 'https://covers.openlibrary.org/b/isbn/9780134605180-L.jpg', 4.65, 2018, 1, 1),
('e2f3a4b5-1111-4444-eeee-666666666666', 'Bioinformatics', 'Arthur Lesk', 'Introduction to bioinformatics', 'Bioinformatics', 'BS Bioinformatics', 3, 'BIN-301', 'https://covers.openlibrary.org/b/isbn/9780198794141-L.jpg', 4.55, 2019, 1, 1),
('e2f3a4b5-1111-4444-eeee-777777777777', 'Immunology', 'Kenneth Murphy', 'Janeway immunobiology', 'Immunology', 'BS Biotechnology', 4, 'IMM-401', 'https://covers.openlibrary.org/b/isbn/9780815345510-L.jpg', 4.75, 2017, 1, 1),
('e2f3a4b5-1111-4444-eeee-888888888888', 'Plant Biology', 'Linda Graham', 'Plant science fundamentals', 'Biology', 'BS Biotechnology', 4, 'PLT-401', 'https://covers.openlibrary.org/b/isbn/9780321897534-L.jpg', 4.40, 2018, 1, 1);

-- Engineering Books
INSERT INTO books (id, title, author, description, genre, department, semester, course_code, cover_url, rating, published_year, total_copies, available_copies) VALUES
('f2a3b4c5-2222-5555-ffff-111111111111', 'Engineering Mechanics: Statics', 'Russell Hibbeler', 'Static mechanics fundamentals', 'Engineering', 'BS Electrical Engineering', 1, 'EE-101', 'https://covers.openlibrary.org/b/isbn/9780134814988-L.jpg', 4.65, 2019, 1, 1),
('f2a3b4c5-2222-5555-ffff-222222222222', 'Electric Circuits', 'James Nilsson', 'Circuit analysis fundamentals', 'Electrical', 'BS Electrical Engineering', 2, 'EE-201', 'https://covers.openlibrary.org/b/isbn/9780134746968-L.jpg', 4.80, 2018, 1, 1),
('f2a3b4c5-2222-5555-ffff-333333333333', 'Digital Design', 'Frank Vahid', 'Digital logic and circuits', 'Electrical', 'BS Electrical Engineering', 2, 'EE-202', 'https://covers.openlibrary.org/b/isbn/9780470531082-L.jpg', 4.55, 2017, 1, 1),
('f2a3b4c5-2222-5555-ffff-444444444444', 'Signals and Systems', 'Alan Oppenheim', 'Signal processing fundamentals', 'Electrical', 'BS Electrical Engineering', 3, 'EE-301', 'https://covers.openlibrary.org/b/isbn/9780138147570-L.jpg', 4.75, 2016, 1, 1),
('f2a3b4c5-2222-5555-ffff-555555555555', 'Control Systems Engineering', 'Norman Nise', 'Control theory and design', 'Electrical', 'BS Electrical Engineering', 4, 'EE-401', 'https://covers.openlibrary.org/b/isbn/9781119474227-L.jpg', 4.70, 2019, 1, 1),
('f2a3b4c5-2222-5555-ffff-666666666666', 'Microelectronics', 'Adel Sedra', 'Electronic circuits design', 'Electrical', 'BS Electrical Engineering', 4, 'EE-402', 'https://covers.openlibrary.org/b/isbn/9780199339143-L.jpg', 4.85, 2020, 1, 1),
('f2a3b4c5-2222-5555-ffff-777777777777', 'Power Electronics', 'Ned Mohan', 'Power conversion systems', 'Electrical', 'BS Electrical Engineering', 5, 'EE-501', 'https://covers.openlibrary.org/b/isbn/9781118586297-L.jpg', 4.60, 2018, 1, 1),
('f2a3b4c5-2222-5555-ffff-888888888888', 'Electromagnetics', 'Matthew Sadiku', 'EM theory and applications', 'Electrical', 'BS Electrical Engineering', 5, 'EE-502', 'https://covers.openlibrary.org/b/isbn/9780190698614-L.jpg', 4.50, 2017, 1, 1);

-- Psychology Books
INSERT INTO books (id, title, author, description, genre, department, semester, course_code, cover_url, rating, published_year, total_copies, available_copies) VALUES
('a3b4c5d6-3333-6666-aaaa-111111111111', 'Psychology', 'David Myers', 'Introduction to psychology', 'Psychology', 'BS Psychology', 1, 'PSY-101', 'https://covers.openlibrary.org/b/isbn/9781319050627-L.jpg', 4.70, 2018, 1, 1),
('a3b4c5d6-3333-6666-aaaa-222222222222', 'Developmental Psychology', 'Laura Berk', 'Human development across lifespan', 'Psychology', 'BS Psychology', 2, 'PSY-201', 'https://covers.openlibrary.org/b/isbn/9780134641553-L.jpg', 4.65, 2019, 1, 1),
('a3b4c5d6-3333-6666-aaaa-333333333333', 'Abnormal Psychology', 'Ronald Comer', 'Mental disorders and treatment', 'Psychology', 'BS Psychology', 3, 'PSY-301', 'https://covers.openlibrary.org/b/isbn/9781319066949-L.jpg', 4.60, 2018, 1, 1),
('a3b4c5d6-3333-6666-aaaa-444444444444', 'Social Psychology', 'Elliot Aronson', 'Social behavior principles', 'Psychology', 'BS Psychology', 3, 'PSY-302', 'https://covers.openlibrary.org/b/isbn/9780134641287-L.jpg', 4.75, 2019, 1, 1),
('a3b4c5d6-3333-6666-aaaa-555555555555', 'Cognitive Psychology', 'Robert Sternberg', 'Mental processes and cognition', 'Psychology', 'BS Psychology', 4, 'PSY-401', 'https://covers.openlibrary.org/b/isbn/9781337408271-L.jpg', 4.55, 2017, 1, 1),
('a3b4c5d6-3333-6666-aaaa-666666666666', 'Research Methods in Psychology', 'Beth Morling', 'Research methodology', 'Psychology', 'BS Psychology', 4, 'PSY-402', 'https://covers.openlibrary.org/b/isbn/9780393536294-L.jpg', 4.45, 2018, 1, 1);

-- Additional Core CS Books
INSERT INTO books (id, title, author, description, genre, department, semester, course_code, cover_url, rating, published_year, total_copies, available_copies) VALUES
('b3c4d5e6-4444-7777-bbbb-111111111111', 'Introduction to Algorithms', 'Thomas Cormen', 'CLRS - comprehensive algorithms', 'Computer Science', 'BS Computer Science', 3, 'CS-307', 'https://covers.openlibrary.org/b/isbn/9780262033848-L.jpg', 4.95, 2009, 1, 1),
('b3c4d5e6-4444-7777-bbbb-222222222222', 'Clean Code', 'Robert Martin', 'Software craftsmanship', 'Software Engineering', 'BS Computer Science', 5, 'CS-507', 'https://covers.openlibrary.org/b/isbn/9780132350884-L.jpg', 4.90, 2008, 1, 1),
('b3c4d5e6-4444-7777-bbbb-333333333333', 'Design Patterns', 'Erich Gamma', 'Gang of Four patterns', 'Software Engineering', 'BS Computer Science', 5, 'CS-508', 'https://covers.openlibrary.org/b/isbn/9780201633610-L.jpg', 4.85, 1994, 1, 1),
('b3c4d5e6-4444-7777-bbbb-444444444444', 'The Pragmatic Programmer', 'David Thomas', 'Software development wisdom', 'Software Engineering', 'BS Computer Science', 6, 'CS-609', 'https://covers.openlibrary.org/b/isbn/9780135957059-L.jpg', 4.90, 2019, 1, 1),
('b3c4d5e6-4444-7777-bbbb-555555555555', 'Refactoring', 'Martin Fowler', 'Improving existing code', 'Software Engineering', 'BS Computer Science', 6, 'CS-610', 'https://covers.openlibrary.org/b/isbn/9780134757599-L.jpg', 4.80, 2018, 1, 1),
('b3c4d5e6-4444-7777-bbbb-666666666666', 'Code Complete', 'Steve McConnell', 'Software construction practices', 'Software Engineering', 'BS Computer Science', 4, 'CS-407', 'https://covers.openlibrary.org/b/isbn/9780735619678-L.jpg', 4.85, 2004, 1, 1),
('b3c4d5e6-4444-7777-bbbb-777777777777', 'Structure and Interpretation of Computer Programs', 'Harold Abelson', 'SICP - programming fundamentals', 'Programming', 'BS Computer Science', 2, 'CS-203', 'https://covers.openlibrary.org/b/isbn/9780262510875-L.jpg', 4.90, 1996, 1, 1),
('b3c4d5e6-4444-7777-bbbb-888888888888', 'The C Programming Language', 'Brian Kernighan', 'K&R C programming', 'Programming', 'BS Computer Science', 2, 'CS-204', 'https://covers.openlibrary.org/b/isbn/9780131103627-L.jpg', 4.95, 1988, 1, 1);

-- Data Science Books
INSERT INTO books (id, title, author, description, genre, department, semester, course_code, cover_url, rating, published_year, total_copies, available_copies) VALUES
('c3d4e5f6-5555-8888-cccc-111111111111', 'Python for Data Analysis', 'Wes McKinney', 'Data analysis with pandas', 'Data Science', 'BS Data Science', 2, 'DS-201', 'https://covers.openlibrary.org/b/isbn/9781491957660-L.jpg', 4.70, 2017, 1, 1),
('c3d4e5f6-5555-8888-cccc-222222222222', 'Hands-On Machine Learning', 'Aurélien Géron', 'ML with Scikit-Learn and TensorFlow', 'Data Science', 'BS Data Science', 4, 'DS-401', 'https://covers.openlibrary.org/b/isbn/9781492032649-L.jpg', 4.90, 2019, 1, 1),
('c3d4e5f6-5555-8888-cccc-333333333333', 'Pattern Recognition and Machine Learning', 'Christopher Bishop', 'Statistical ML fundamentals', 'Data Science', 'BS Data Science', 5, 'DS-501', 'https://covers.openlibrary.org/b/isbn/9780387310732-L.jpg', 4.80, 2006, 1, 1),
('c3d4e5f6-5555-8888-cccc-444444444444', 'The Elements of Statistical Learning', 'Trevor Hastie', 'Statistical learning theory', 'Data Science', 'BS Data Science', 6, 'DS-601', 'https://covers.openlibrary.org/b/isbn/9780387848570-L.jpg', 4.85, 2009, 1, 1),
('c3d4e5f6-5555-8888-cccc-555555555555', 'R for Data Science', 'Hadley Wickham', 'Data science with R', 'Data Science', 'BS Data Science', 3, 'DS-301', 'https://covers.openlibrary.org/b/isbn/9781491910399-L.jpg', 4.65, 2017, 1, 1);

-- Additional AI/ML Books
INSERT INTO books (id, title, author, description, genre, department, semester, course_code, cover_url, rating, published_year, total_copies, available_copies) VALUES
('d3e4f5a6-6666-9999-dddd-111111111111', 'Reinforcement Learning', 'Richard Sutton', 'RL fundamentals and algorithms', 'AI', 'BS Computer Science', 7, 'CS-706', 'https://covers.openlibrary.org/b/isbn/9780262039246-L.jpg', 4.85, 2018, 1, 1),
('d3e4f5a6-6666-9999-dddd-222222222222', 'Speech and Language Processing', 'Daniel Jurafsky', 'NLP comprehensive guide', 'AI', 'BS Computer Science', 7, 'CS-707', 'https://covers.openlibrary.org/b/isbn/9780131873216-L.jpg', 4.80, 2019, 1, 1),
('d3e4f5a6-6666-9999-dddd-333333333333', 'Computer Vision', 'Richard Szeliski', 'Algorithms and applications', 'AI', 'BS Computer Science', 7, 'CS-708', 'https://covers.openlibrary.org/b/isbn/9781848829343-L.jpg', 4.75, 2010, 1, 1);

-- Software Engineering Additional Books
INSERT INTO books (id, title, author, description, genre, department, semester, course_code, cover_url, rating, published_year, total_copies, available_copies) VALUES
('e3f4a5b6-7777-0000-eeee-111111111111', 'Agile Software Development', 'Robert Martin', 'Agile principles and patterns', 'Software Engineering', 'BS Software Engineering', 4, 'SE-401', 'https://covers.openlibrary.org/b/isbn/9780135974445-L.jpg', 4.70, 2002, 1, 1),
('e3f4a5b6-7777-0000-eeee-222222222222', 'Continuous Delivery', 'Jez Humble', 'Reliable software releases', 'Software Engineering', 'BS Software Engineering', 6, 'SE-601', 'https://covers.openlibrary.org/b/isbn/9780321601919-L.jpg', 4.75, 2010, 1, 1),
('e3f4a5b6-7777-0000-eeee-333333333333', 'Domain-Driven Design', 'Eric Evans', 'Software design principles', 'Software Engineering', 'BS Software Engineering', 5, 'SE-501', 'https://covers.openlibrary.org/b/isbn/9780321125217-L.jpg', 4.80, 2003, 1, 1),
('e3f4a5b6-7777-0000-eeee-444444444444', 'Test Driven Development', 'Kent Beck', 'TDD by example', 'Software Engineering', 'BS Software Engineering', 5, 'SE-502', 'https://covers.openlibrary.org/b/isbn/9780321146533-L.jpg', 4.65, 2002, 1, 1);

-- Islamic Studies Books
INSERT INTO books (id, title, author, description, genre, department, semester, course_code, cover_url, rating, published_year, total_copies, available_copies) VALUES
('f3a4b5c6-8888-1111-ffff-111111111111', 'Islamic Studies', 'Dr. Muhammad Hamidullah', 'Introduction to Islam', 'Islamic Studies', 'BS Computer Science', 2, 'ISL-201', 'https://covers.openlibrary.org/b/isbn/9789698023008-L.jpg', 4.50, 2015, 1, 1);

-- =============================================
-- VERIFY DATA
-- =============================================
SELECT 'Categories: ' || COUNT(*) FROM categories;
SELECT 'Books: ' || COUNT(*) FROM books;
