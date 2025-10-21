"""
ChatGPT Romgon Player - SIMPLE VERSION
Just watches and makes moves when it's Black's turn
"""

from selenium import webdriver
import time
from openai import OpenAI
import os

# Configuration
GAME_URL = "http://localhost:5500/public/index.html"
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

SYSTEM_PROMPT = """You are an expert Romgon player.

STRATEGY:
1. CAPTURES - Highest priority (150-180 points)
2. THREATEN OPPONENT RHOMBUS - Critical
3. PROTECT YOUR RHOMBUS
4. ADVANCE RHOMBUS when safe
5. CONTROL CENTER (row 3)

Respond with ONLY the move notation (e.g., "3-6→3-5").
"""

def setup_driver():
    options = webdriver.ChromeOptions()
    driver = webdriver.Chrome(options=options)
    return driver

def ask_chatgpt(state_text):
    """Ask ChatGPT for best move"""
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": state_text}
        ],
        temperature=0.7,
        max_tokens=100
    )
    return response.choices[0].message.content.strip()

def main():
    print("🎮 ChatGPT Romgon Player - Simple Version")
    print("=" * 60)
    print("")
    print("📋 INSTRUCTIONS:")
    print("1. I'll open your game in Chrome")
    print("2. YOU manually start a game (click Play vs AI or any mode)")
    print("3. YOU play as White")
    print("4. When it's Black's turn, ChatGPT will suggest a move")
    print("5. Type the move notation to execute it")
    print("")
    input("Press ENTER when you're ready...")
    
    driver = setup_driver()
    driver.get(GAME_URL)
    
    print("\n✅ Browser opened!")
    print("👉 Now start a game in the browser...")
    print("👉 Play your first move as White...")
    print("")
    input("Press ENTER after you've made White's first move...")
    
    move_count = 1
    
    try:
        while True:
            print(f"\n{'='*60}")
            print(f"Move {move_count} - ChatGPT analyzing for Black...")
            print(f"{'='*60}")
            
            # Get current state
            try:
                state = driver.execute_script("return window.RomgonEngine.getGameState();")
                moves = driver.execute_script("return window.RomgonEngine.getLegalMoves();")
                
                if not moves or len(moves) == 0:
                    print("❌ No legal moves or game over!")
                    break
                
                # Format for ChatGPT
                state_text = f"""
CURRENT POSITION (Move {move_count}):

BLACK PIECES:
"""
                for piece in state['pieces']:
                    if piece['color'] == 'black':
                        state_text += f"  - {piece['type']} at {piece['position']}\n"
                
                state_text += "\nWHITE PIECES:\n"
                for piece in state['pieces']:
                    if piece['color'] == 'white':
                        state_text += f"  - {piece['type']} at {piece['position']}\n"
                
                state_text += f"\nYou have {len(moves)} legal moves available.\n"
                state_text += "Sample moves:\n"
                for move in moves[:5]:
                    state_text += f"  - {move['notation']}\n"
                
                state_text += "\nWhat's your best move? (notation only)"
                
                # Ask ChatGPT
                print("🤔 Asking ChatGPT...")
                suggested_move = ask_chatgpt(state_text)
                print(f"🎯 ChatGPT suggests: {suggested_move}")
                
                # Check if it's legal
                legal_notations = [m['notation'] for m in moves]
                if suggested_move not in legal_notations:
                    print(f"⚠️  That's not in the legal moves list!")
                    print(f"   Using first legal move instead: {moves[0]['notation']}")
                    suggested_move = moves[0]['notation']
                
                print(f"\n💡 Execute this move in the browser: {suggested_move}")
                print("   (Or press Ctrl+C to stop)")
                
                input("\nPress ENTER after executing the move and making White's next move...")
                
                move_count += 1
                
            except KeyboardInterrupt:
                print("\n\n⏹️  Stopped by user")
                break
            except Exception as e:
                print(f"❌ Error: {e}")
                print("   Make sure:")
                print("   1. Game is started")
                print("   2. It's Black's turn")
                print("   3. Game Engine API is loaded")
                choice = input("\nRetry? (y/n): ")
                if choice.lower() != 'y':
                    break
        
    finally:
        print("\n🔚 Closing browser...")
        driver.quit()
        print("👋 Thanks for playing!")

if __name__ == "__main__":
    if not os.getenv("OPENAI_API_KEY"):
        print("❌ OPENAI_API_KEY not set!")
        exit(1)
    main()
