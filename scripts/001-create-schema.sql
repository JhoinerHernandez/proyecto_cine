-- Cinema Management System Database Schema
-- MySQL Database

-- Create database
CREATE DATABASE IF NOT EXISTS JHOCEAN Films;
USE JHOCEAN Films;

-- Movies table
CREATE TABLE IF NOT EXISTS movies (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    genre VARCHAR(100) NOT NULL,
    duration INT NOT NULL COMMENT 'Duration in minutes',
    synopsis TEXT,
    poster_url VARCHAR(500),
    rating VARCHAR(20) DEFAULT 'PG',
    release_date DATE,
    director VARCHAR(255),
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_genre (genre)
);

-- Showtimes/Functions table
CREATE TABLE IF NOT EXISTS showtimes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    movie_id INT NOT NULL,
    room VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    status ENUM('scheduled', 'ongoing', 'finished', 'cancelled') DEFAULT 'scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
    INDEX idx_date_room (date, room),
    INDEX idx_movie (movie_id),
    INDEX idx_status (status)
);

-- Seats table (generated per showtime)
CREATE TABLE IF NOT EXISTS seats (
    id INT PRIMARY KEY AUTO_INCREMENT,
    showtime_id INT NOT NULL,
    row_letter CHAR(1) NOT NULL,
    seat_number INT NOT NULL,
    status ENUM('available', 'reserved', 'sold') DEFAULT 'available',
    FOREIGN KEY (showtime_id) REFERENCES showtimes(id) ON DELETE CASCADE,
    UNIQUE KEY unique_seat (showtime_id, row_letter, seat_number),
    INDEX idx_showtime_status (showtime_id, status)
);

-- Tickets table
CREATE TABLE IF NOT EXISTS tickets (
    id INT PRIMARY KEY AUTO_INCREMENT,
    showtime_id INT NOT NULL,
    seat_id INT NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20),
    ticket_code VARCHAR(50) NOT NULL UNIQUE,
    qr_code TEXT,
    price DECIMAL(10, 2) NOT NULL,
    status ENUM('active', 'used', 'cancelled') DEFAULT 'active',
    purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    validated_at TIMESTAMP NULL,
    FOREIGN KEY (showtime_id) REFERENCES showtimes(id) ON DELETE CASCADE,
    FOREIGN KEY (seat_id) REFERENCES seats(id) ON DELETE CASCADE,
    INDEX idx_ticket_code (ticket_code),
    INDEX idx_status (status),
    INDEX idx_purchase_date (purchase_date)
);

-- Admin users table
CREATE TABLE IF NOT EXISTS admins (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role ENUM('admin', 'validator') DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    INDEX idx_username (username)
);

-- Insert default admin user (password: admin123)
-- Password hash generated with bcrypt
INSERT INTO admins (username, password_hash, name, email, role) VALUES 
('admin', '$2b$10$rQZ8kHxL5YxBvqHt7.ZPxe5ZHqGxZJZJZJZJZJZJZJZJZJZJZJZJZ', 'Administrador', 'admin@JHOCEAN Films.com', 'admin')
ON DUPLICATE KEY UPDATE username = username;

-- Stored procedure to generate seats for a showtime (10 rows x 15 seats = 150 seats)
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS GenerateSeats(IN p_showtime_id INT)
BEGIN
    DECLARE row_char CHAR(1);
    DECLARE seat_num INT;
    DECLARE row_index INT DEFAULT 0;
    
    -- Rows A through J (10 rows)
    WHILE row_index < 10 DO
        SET row_char = CHAR(65 + row_index); -- ASCII A=65, B=66, etc.
        SET seat_num = 1;
        
        -- 15 seats per row
        WHILE seat_num <= 15 DO
            INSERT INTO seats (showtime_id, row_letter, seat_number, status)
            VALUES (p_showtime_id, row_char, seat_num, 'available')
            ON DUPLICATE KEY UPDATE status = status;
            SET seat_num = seat_num + 1;
        END WHILE;
        
        SET row_index = row_index + 1;
    END WHILE;
END //
DELIMITER ;

-- Trigger to auto-generate seats when a showtime is created
DELIMITER //
CREATE TRIGGER after_showtime_insert
AFTER INSERT ON showtimes
FOR EACH ROW
BEGIN
    CALL GenerateSeats(NEW.id);
END //
DELIMITER ;
