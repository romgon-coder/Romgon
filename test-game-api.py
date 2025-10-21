"""
Diagnostic Script - Check if Game Engine API is working
"""

from selenium import webdriver
import time
import json

GAME_URL = "http://localhost:5500/public/index.html"

def main():
    print("🔍 Romgon Game Engine API Diagnostic")
    print("=" * 60)
    print("")
    
    driver = webdriver.Chrome()
    driver.get(GAME_URL)
    
    print("✅ Browser opened")
    print("⏳ Waiting 5 seconds for game to load...")
    time.sleep(5)
    
    print("\n📋 Running diagnostics...\n")
    
    # Test 1: Check if API exists
    try:
        api_exists = driver.execute_script("return typeof window.RomgonEngine !== 'undefined';")
        print(f"1. API Exists: {'✅ YES' if api_exists else '❌ NO'}")
        
        if not api_exists:
            print("\n❌ PROBLEM: Game Engine API not loaded!")
            print("   Solution: Make sure romgon-engine-api.js is included in index.html")
            driver.quit()
            return
    except Exception as e:
        print(f"1. API Exists: ❌ ERROR - {e}")
        driver.quit()
        return
    
    # Test 2: List available methods
    try:
        methods = driver.execute_script("""
            return Object.keys(window.RomgonEngine);
        """)
        print(f"2. Available Methods: ✅ {len(methods)} methods found")
        print(f"   {', '.join(methods)}")
    except Exception as e:
        print(f"2. Available Methods: ❌ ERROR - {e}")
    
    # Test 3: Try getting game state
    print("\n3. Testing getGameState()...")
    try:
        state = driver.execute_script("return window.RomgonEngine.getGameState();")
        print(f"   Type: {type(state)}")
        print(f"   Content: {json.dumps(state, indent=2)[:500]}...")
        
        if isinstance(state, dict) and 'pieces' in state:
            print("   ✅ Game state looks good!")
        else:
            print("   ⚠️  Unexpected format")
    except Exception as e:
        print(f"   ❌ ERROR: {e}")
    
    # Test 4: Try getting legal moves
    print("\n4. Testing getLegalMoves()...")
    try:
        moves = driver.execute_script("return window.RomgonEngine.getLegalMoves();")
        print(f"   Type: {type(moves)}")
        print(f"   Count: {len(moves) if isinstance(moves, list) else 'N/A'}")
        if isinstance(moves, list) and len(moves) > 0:
            print(f"   Sample: {moves[0]}")
            print("   ✅ Legal moves working!")
        else:
            print("   ⚠️  No moves or unexpected format")
    except Exception as e:
        print(f"   ❌ ERROR: {e}")
    
    print("\n" + "=" * 60)
    print("Diagnostic complete! Press Ctrl+C to close browser...")
    
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n🔚 Closing browser...")
        driver.quit()

if __name__ == "__main__":
    main()
