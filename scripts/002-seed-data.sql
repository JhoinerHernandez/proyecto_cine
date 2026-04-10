-- Seed data for Cinema Management System
USE JHOCEAN Films;

-- Insert sample movies
INSERT INTO movies (title, genre, duration, synopsis, poster_url, rating, release_date, director, status) VALUES
('El Viaje Interestelar', 'Ciencia Ficcion', 169, 'Un grupo de astronautas viaja a traves de un agujero de gusano en busca de un nuevo hogar para la humanidad. Una odisea epica que explora los limites del espacio y el tiempo.', '/posters/interstellar.jpg', 'PG-13', '2024-11-07', 'Christopher Nolan', 'active'),
('La Ultima Mision', 'Accion', 142, 'Un agente retirado es llamado para una ultima mision que pondra a prueba todos sus limites. Explosiva accion y giros inesperados.', '/posters/mission.jpg', 'R', '2024-10-15', 'Tom Cruise', 'active'),
('Amor en Paris', 'Romance', 118, 'Dos desconocidos se encuentran en la ciudad del amor y descubren que el destino tiene planes para ellos.', '/posters/paris.jpg', 'PG', '2024-09-20', 'Sofia Coppola', 'active'),
('Terror en la Mansion', 'Terror', 95, 'Una familia se muda a una antigua mansion sin saber que no estan solos. El terror acecha en cada rincon.', '/posters/mansion.jpg', 'R', '2024-10-31', 'James Wan', 'active'),
('Aventuras Animadas', 'Animacion', 105, 'Un grupo de amigos animales emprende un viaje epico para salvar su bosque. Diversion para toda la familia.', '/posters/animated.jpg', 'G', '2024-12-01', 'Pixar Studios', 'active'),
('El Codigo Secreto', 'Suspenso', 128, 'Un criptoanalista descubre un codigo que podria cambiar el curso de la historia. Cada segundo cuenta.', '/posters/code.jpg', 'PG-13', '2024-11-15', 'David Fincher', 'active');

-- Insert sample showtimes for today and upcoming days
INSERT INTO showtimes (movie_id, room, date, start_time, end_time, price, status) VALUES
-- Today
(1, 'Sala 1', CURDATE(), '14:00:00', '16:49:00', 12000, 'scheduled'),
(1, 'Sala 1', CURDATE(), '18:00:00', '20:49:00', 15000, 'scheduled'),
(2, 'Sala 2', CURDATE(), '15:00:00', '17:22:00', 12000, 'scheduled'),
(2, 'Sala 2', CURDATE(), '19:30:00', '21:52:00', 15000, 'scheduled'),
(3, 'Sala 3', CURDATE(), '16:00:00', '17:58:00', 10000, 'scheduled'),
(4, 'Sala 4', CURDATE(), '21:00:00', '22:35:00', 15000, 'scheduled'),

-- Tomorrow
(1, 'Sala 1', DATE_ADD(CURDATE(), INTERVAL 1 DAY), '14:00:00', '16:49:00', 12000, 'scheduled'),
(5, 'Sala 2', DATE_ADD(CURDATE(), INTERVAL 1 DAY), '11:00:00', '12:45:00', 8000, 'scheduled'),
(6, 'Sala 3', DATE_ADD(CURDATE(), INTERVAL 1 DAY), '17:00:00', '19:08:00', 12000, 'scheduled'),

-- Day after tomorrow
(3, 'Sala 1', DATE_ADD(CURDATE(), INTERVAL 2 DAY), '19:00:00', '20:58:00', 12000, 'scheduled'),
(4, 'Sala 4', DATE_ADD(CURDATE(), INTERVAL 2 DAY), '22:00:00', '23:35:00', 15000, 'scheduled');
