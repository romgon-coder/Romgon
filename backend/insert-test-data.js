// Insert test data into database
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'config', 'romgon.db');
const db = new sqlite3.Database(dbPath);

console.log('📦 Inserting test data...\n');

// Wrap in a serialize to ensure sequential execution
db.serialize(() => {
    // Clean up existing test data
    db.run("DELETE FROM games WHERE id LIKE 'test-%'", (err) => {
        if (err) console.error('Error cleaning games:', err);
    });
    
    db.run("DELETE FROM users WHERE username IN ('TestAlice', 'TestBob', 'TestCharlie')", (err) => {
        if (err) console.error('Error cleaning users:', err);
        else console.log('✅ Cleaned up old test data');
    });

    // Create test users
    const users = [
        ['TestAlice', 'testalice@test.com', '$2a$10$dummyhash1', 1420],
        ['TestBob', 'testbob@test.com', '$2a$10$dummyhash2', 1550],
        ['TestCharlie', 'testcharlie@test.com', '$2a$10$dummyhash3', 1380]
    ];

    const userIds = {};
    const userStmt = db.prepare("INSERT INTO users (username, email, password_hash, rating) VALUES (?, ?, ?, ?)");
    
    let usersInserted = 0;
    users.forEach((user, index) => {
        userStmt.run(user, function(err) {
            if (err) console.error('Error inserting user:', err);
            else {
                usersInserted++;
                if (index === 0) userIds.alice = this.lastID;
                if (index === 1) userIds.bob = this.lastID;
                if (index === 2) userIds.charlie = this.lastID;
                
                if (usersInserted === users.length) {
                    console.log(`✅ Created 3 test users:`);
                    console.log(`   - TestAlice (ID: ${userIds.alice}, Rating: 1420)`);
                    console.log(`   - TestBob (ID: ${userIds.bob}, Rating: 1550)`);
                    console.log(`   - TestCharlie (ID: ${userIds.charlie}, Rating: 1380)\n`);
                    
                    // Now create games with the actual user IDs
                    createGames(userIds);
                }
            }
        });
    });
    userStmt.finalize();
    
    function createGames(userIds) {
        // Create active games
        const activeStmt = db.prepare(`
            INSERT INTO games (id, white_player_id, black_player_id, moves, total_moves, status, start_time) 
            VALUES (?, ?, ?, ?, ?, 'active', datetime('now', ?))
        `);
        
        activeStmt.run(['test-active-1', userIds.alice, userIds.bob, '[{"from":"a1","to":"b2","timestamp":"2025-10-21T10:00:00Z"}]', 1, '-30 minutes']);
        activeStmt.run(['test-active-2', userIds.charlie, userIds.alice, '[]', 0, '-1 hour']);
        
        activeStmt.finalize(() => {
            console.log('✅ Created 2 active games for TestAlice');
        });

        // Create finished games
        const finishedStmt = db.prepare(`
            INSERT INTO games (id, white_player_id, black_player_id, moves, total_moves, status, winner_id, reason, start_time, end_time) 
            VALUES (?, ?, ?, ?, ?, 'finished', ?, ?, datetime('now', ?), datetime('now', ?))
        `);
        
        finishedStmt.run(['test-finished-1', userIds.alice, userIds.bob, '[{"from":"a1","to":"b2"}]', 24, userIds.alice, 'white_wins', '-2 days', '-2 days +30 minutes']);
        finishedStmt.run(['test-finished-2', userIds.bob, userIds.alice, '[{"from":"a1","to":"b2"}]', 18, userIds.bob, 'black_wins', '-1 day', '-1 day +20 minutes']);
        finishedStmt.run(['test-finished-3', userIds.alice, userIds.charlie, '[{"from":"a1","to":"b2"}]', 35, userIds.alice, 'white_wins', '-5 hours', '-4 hours']);
        
        finishedStmt.finalize(() => {
            console.log('✅ Created 3 finished games for TestAlice\n');
            
            // Verify data
            setTimeout(() => {
                verifyData(userIds);
            }, 500);
        });
    }
    
    function verifyData(userIds) {
        console.log('📊 Verifying test data:\n');
        
        db.all("SELECT id, username, rating FROM users WHERE username LIKE 'Test%'", (err, rows) => {
            if (err) console.error(err);
            else {
                console.log('👥 Test Users:');
                rows.forEach(row => console.log(`   - ${row.username} (ID: ${row.id}): Rating ${row.rating}`));
            }
        });
        
        db.all("SELECT id, white_player_id, black_player_id, total_moves FROM games WHERE status = 'active' AND id LIKE 'test-%'", (err, rows) => {
            if (err) console.error(err);
            else {
                console.log('\n🎮 Active Games:');
                rows.forEach(row => console.log(`   - ${row.id}: Player ${row.white_player_id} vs Player ${row.black_player_id} (${row.total_moves} moves)`));
            }
        });
        
        db.all("SELECT id, winner_id, total_moves FROM games WHERE status = 'finished' AND id LIKE 'test-%'", (err, rows) => {
            if (err) console.error(err);
            else {
                console.log('\n🏁 Finished Games:');
                rows.forEach(row => console.log(`   - ${row.id}: Winner ID ${row.winner_id} (${row.total_moves} moves)`));
                console.log('\n✅ Test data loaded successfully!');
                console.log('\n📝 Next steps:');
                console.log(`   1. Login with username: TestAlice (ID: ${userIds.alice})`);
                console.log('   2. You should see 2 active games');
                console.log('   3. You should see 3 games in match history');
                console.log('   4. Rating should show 1420\n');
                
                db.close();
            }
        });
    }
});
