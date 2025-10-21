-- Clean up existing test data
DELETE FROM games WHERE id LIKE 'test-%';
DELETE FROM users WHERE id LIKE 'test-%';

-- Create test users
INSERT INTO users (id, username, email, password_hash, rating, created_at) VALUES
('test-user-1', 'Alice', 'alice@test.com', '$2a$10$dummyhash1', 1420, datetime('now')),
('test-user-2', 'Bob', 'bob@test.com', '$2a$10$dummyhash2', 1550, datetime('now')),
('test-user-3', 'Charlie', 'charlie@test.com', '$2a$10$dummyhash3', 1380, datetime('now'));

-- Create 2 active games for test-user-1
INSERT INTO games (id, white_player_id, black_player_id, moves, total_moves, status, created_at, updated_at) VALUES
('test-active-1', 'test-user-1', 'test-user-2', '[{"from":"a1","to":"b2","timestamp":"2025-10-21T10:00:00Z"}]', 1, 'active', datetime('now', '-30 minutes'), datetime('now', '-5 minutes')),
('test-active-2', 'test-user-3', 'test-user-1', '[]', 0, 'active', datetime('now', '-1 hour'), datetime('now', '-45 minutes'));

-- Create 3 finished games for test-user-1
INSERT INTO games (id, white_player_id, black_player_id, moves, total_moves, status, winner_id, result, created_at, updated_at) VALUES
('test-finished-1', 'test-user-1', 'test-user-2', '[{"from":"a1","to":"b2"}]', 24, 'finished', 'test-user-1', 'white_wins', datetime('now', '-2 days'), datetime('now', '-2 days', '+30 minutes')),
('test-finished-2', 'test-user-2', 'test-user-1', '[{"from":"a1","to":"b2"}]', 18, 'finished', 'test-user-2', 'black_wins', datetime('now', '-1 day'), datetime('now', '-1 day', '+20 minutes')),
('test-finished-3', 'test-user-1', 'test-user-3', '[{"from":"a1","to":"b2"}]', 35, 'finished', 'test-user-1', 'white_wins', datetime('now', '-5 hours'), datetime('now', '-4 hours'));

-- Verify data created
SELECT '=== USERS CREATED ===' as info;
SELECT id, username, rating FROM users WHERE id LIKE 'test-%';

SELECT '=== ACTIVE GAMES ===' as info;
SELECT id, white_player_id, black_player_id, total_moves, status FROM games WHERE status = 'active' AND id LIKE 'test-%';

SELECT '=== FINISHED GAMES ===' as info;
SELECT id, white_player_id, black_player_id, winner_id, total_moves FROM games WHERE status = 'finished' AND id LIKE 'test-%';
