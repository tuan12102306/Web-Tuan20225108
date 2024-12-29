CREATE DATABASE library_management;
USE library_management;

-- Bảng Users
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    fullName VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user',
    phone VARCHAR(15),
    address TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng Books
CREATE TABLE books (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    coverImage VARCHAR(255),
    quantity INT DEFAULT 1,
    available INT DEFAULT 1,
    location VARCHAR(50),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng Borrows
CREATE TABLE borrows (
    id INT PRIMARY KEY AUTO_INCREMENT,
    userId INT,
    bookId INT,
    borrowDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dueDate TIMESTAMP NOT NULL,
    returnDate TIMESTAMP NULL,
    status ENUM('borrowed', 'returned', 'overdue') DEFAULT 'borrowed',
    FOREIGN KEY (userId) REFERENCES users(id),
    FOREIGN KEY (bookId) REFERENCES books(id)
);

-- Bảng News
CREATE TABLE news (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    image VARCHAR(255),
    author INT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author) REFERENCES users(id)
);

-- Bảng Services
CREATE TABLE services (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    type ENUM('reading_room', 'printing', 'training', 'digital_library') NOT NULL,
    status ENUM('active', 'inactive') DEFAULT 'active'
);

-- Bảng Contacts
CREATE TABLE contacts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status ENUM('new', 'processing', 'completed') DEFAULT 'new',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng Reading Room Bookings
CREATE TABLE room_bookings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    userId INT,
    roomId VARCHAR(50),
    bookingDate DATE,
    timeSlot VARCHAR(50),
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id)
);

-- Bảng Print Services
CREATE TABLE print_services (
    id INT PRIMARY KEY AUTO_INCREMENT,
    userId INT,
    documentName VARCHAR(255),
    pageCount INT,
    copies INT DEFAULT 1,
    status ENUM('pending', 'completed', 'cancelled') DEFAULT 'pending',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id)
);
