-- Adatbázis kiválasztása
CREATE DATABASE IF NOT EXISTS presentations
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE presentations;

-- USERS
CREATE TABLE IF NOT EXISTS users (
    id CHAR(36) PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- PRESENTATIONS
CREATE TABLE IF NOT EXISTS presentations (
    id CHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    owner_id CHAR(36) NOT NULL,
    image_folder_path TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME DEFAULT NULL,
    CONSTRAINT fk_presentations_owner FOREIGN KEY (owner_id)
      REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- PERMISSIONS
CREATE TABLE IF NOT EXISTS presentation_permissions (
    presentation_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    permission ENUM('read', 'edit') NOT NULL,
    PRIMARY KEY (presentation_id, user_id),
    CONSTRAINT fk_perm_pres FOREIGN KEY (presentation_id)
      REFERENCES presentations(id) ON DELETE CASCADE,
    CONSTRAINT fk_perm_user FOREIGN KEY (user_id)
      REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- SLIDES
CREATE TABLE IF NOT EXISTS slides (
    id CHAR(36) PRIMARY KEY,
    presentation_id CHAR(36) NOT NULL,
    content TEXT,
    imagePath MEDIUMTEXT,
    videoPath TEXT,
    CONSTRAINT fk_slides_pres FOREIGN KEY (presentation_id)
      REFERENCES presentations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- COMMENTS
CREATE TABLE IF NOT EXISTS presentation_comments (
    id CHAR(36) PRIMARY KEY,
    presentation_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_comment_pres FOREIGN KEY (presentation_id)
      REFERENCES presentations(id) ON DELETE CASCADE,
    CONSTRAINT fk_comment_user FOREIGN KEY (user_id)
      REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- MINTA FELHASZNÁLÓK
INSERT INTO users (id, username, email, password_hash) VALUES
('11111111-1111-1111-1111-111111111111', 'testuser', 'test@example.com', 'hashedpassword')
ON DUPLICATE KEY UPDATE username = VALUES(username);

INSERT INTO users (id, username, email, password_hash) VALUES
('2b7d0eaf-842f-4cf0-8456-bd2cf0b3659e', 'tesztfelhasznalo2', 'teszt2@example.com', 'hashedpassword2')
ON DUPLICATE KEY UPDATE username = VALUES(username);

-- MINTA PREZENTÁCIÓ
INSERT INTO presentations (id, title, owner_id)
VALUES (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'Minta prezentacio',
  '11111111-1111-1111-1111-111111111111'
)
ON DUPLICATE KEY UPDATE title = VALUES(title);

-- MINTA DIA
INSERT INTO slides (id, presentation_id, content)
VALUES (
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '# Udvozlo dia\n\nEz egy minta tartalom.'
)
ON DUPLICATE KEY UPDATE content = VALUES(content);

-- MINTA JOGOSULTSÁG (2. user olvasó)
INSERT INTO presentation_permissions (presentation_id, user_id, permission)
VALUES (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '2b7d0eaf-842f-4cf0-8456-bd2cf0b3659e',
  'read'
)
ON DUPLICATE KEY UPDATE permission = VALUES(permission);

-- MINTA KOMMENT
INSERT INTO presentation_comments (id, presentation_id, user_id, content)
VALUES (
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '2b7d0eaf-842f-4cf0-8456-bd2cf0b3659e',
  'Ez egy minta komment a szakdolgozat demohoz.'
)
ON DUPLICATE KEY UPDATE content = VALUES(content);

ALTER TABLE slides
  ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

SET GLOBAL event_scheduler = ON;

CREATE EVENT IF NOT EXISTS delete_old_presentations
ON SCHEDULE EVERY 1 MINUTE
DO
  DELETE FROM presentations
  WHERE deleted_at IS NOT NULL
    AND deleted_at < NOW() - INTERVAL 1 MINUTE;