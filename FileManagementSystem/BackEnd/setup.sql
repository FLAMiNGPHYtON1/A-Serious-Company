-- Create the file_management database
CREATE DATABASE IF NOT EXISTS file_management;

-- Create the files table
CREATE TABLE IF NOT EXISTS files (
    id INT PRIMARY KEY AUTO_INCREMENT,
    filename VARCHAR(255),
    path VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FileSize INT
);
-- Insert sample data
INSERT INTO files (filename, path, FileSize) VALUES
    ('Ali_Zahid_CV.pdf', 'uploads/1729748290905.pdf', 94013),
    ('nicerecording.wav', 'uploads/17297484640144.wav', 92654);