"""
ChatGPT Romgon Player - Bridge Script
Connects ChatGPT to your Romgon game via Selenium

How to use:
1. Install: pip install selenium openai
2. Set your OpenAI API key: export OPENAI_API_KEY="sk-..."
3. Run: python chatgpt-romgon-player.py
4. ChatGPT will play your game automatically!
"""

from selenium import webdriver
from selenium.webdriver.common.by import By
import time
from openai import OpenAI
import os
import json

# Configuration
GAME_URL = "http://localhost:5500/public/index.html"
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")  # Set this in your environment

# Initialize OpenAI client
client = OpenAI(api_key=OPENAI_API_KEY)

# System prompt for ChatGPT
SYSTEM_PROMPT = """
You are an expert Romgon player. You have access to the game state via JavaScript API.

GAME RULES (SIMPLIFIED):
- Goal: Get your rhombus to opponent's base (row 0 for white, row 6 for black)
- Pieces: Rhombus (king), Triangle (180pts), Hexagon (170pts), Circle (160pts), Square (150pts)
- Pieces can capture by moving to occupied space
- If opponent's base is undefended, you can capture their rhombus for instant win

STRATEGY PRIORITY:
1. CAPTURES - Highest value (150-180 points)
2. THREATEN OPPONENT RHOMBUS - Critical (400 points)
3. PROTECT YOUR RHOMBUS - Don't let it get captured
4. ADVANCE RHOMBUS - But only when safe
5. CONTROL CENTER - Row 3 is strategic

RESPONSE FORMAT:
Analyze the position and respond with ONLY a valid move notation.
Example: "3-0→3-1"

Do not explain, just give the move notation.
"""

def setup_driver():
    """Initialize Chrome WebDriver"""
    options = webdriver.ChromeOptions()
    # Uncomment next line to run headless (no browser window)
    # options.add_argument('--headless')
    driver = webdriver.Chrome(options=options)
    return driver

def get_game_state(driver):
    """Get current game state from Romgon Engine API"""
    state = driver.execute_script("""
        return window.RomgonEngine.getGameState();
    """)
    return state

def get_legal_moves(driver):
    """Get all legal moves"""
    moves = driver.execute_script("""
        return window.RomgonEngine.getLegalMoves();
    """)
    return moves

def analyze_position(driver):
    """Get position analysis"""
    analysis = driver.execute_script("""
        return window.RomgonEngine.analyzePosition();
    """)
    return analysis

def make_move(driver, notation):
    """Execute a move"""
    result = driver.execute_script(f"""
        return window.RomgonEngine.makeMove('{notation}');
    """)
    return result

def is_game_over(driver):
    """Check if game is over"""
    game_over = driver.execute_script("""
        return window.gameOver || false;
    """)
    return game_over

def format_state_for_gpt(state, analysis, legal_moves):
    """Format game state for ChatGPT"""
    
    # Count pieces
    white_pieces = [p for p in state['pieces'] if p['color'] == 'white']
    black_pieces = [p for p in state['pieces'] if p['color'] == 'black']
    
    prompt = f"""
CURRENT POSITION:

Turn: {state['turnNumber']}
Current Player: {state['currentPlayer']}

WHITE PIECES ({len(white_pieces)}):
"""
    for piece in white_pieces:
        prompt += f"  - {piece['type']} at {piece['position']}\n"
    
    prompt += f"\nBLACK PIECES ({len(black_pieces)}):\n"
    for piece in black_pieces:
        prompt += f"  - {piece['type']} at {piece['position']}\n"
    
    prompt += f"""
ANALYSIS:
- Material: White {analysis['material']['white']}, Black {analysis['material']['black']}
- Evaluation: {analysis['evaluation']}
- White Rhombus Distance to Goal: {analysis.get('whiteRhombusDistance', 'N/A')}
- Black Rhombus Distance to Goal: {analysis.get('blackRhombusDistance', 'N/A')}

YOU HAVE {len(legal_moves)} LEGAL MOVES.

Sample moves available:
"""
    # Show first 5 moves as examples
    for move in legal_moves[:5]:
        prompt += f"  - {move['notation']} ({move['piece']} from {move['from']} to {move['to']})\n"
    
    if len(legal_moves) > 5:
        prompt += f"  ... and {len(legal_moves) - 5} more moves\n"
    
    prompt += "\nWhat is your best move? Reply with ONLY the move notation (e.g., '3-0→3-1')."
    
    return prompt

def ask_chatgpt(prompt):
    """Ask ChatGPT for best move"""
    response = client.chat.completions.create(
        model="gpt-4o-mini",  # Using gpt-4o-mini (faster and cheaper than gpt-4)
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt}
        ],
        temperature=0.7,
        max_tokens=50
    )
    
    move = response.choices[0].message.content.strip()
    return move

def play_game():
    """Main game loop"""
    print("🎮 Starting ChatGPT Romgon Player...")
    
    # Setup
    driver = setup_driver()
    driver.get(GAME_URL)
    print("⏳ Loading game... (waiting 5 seconds)")
    time.sleep(5)  # Wait longer for game to load
    
    # Check if API is available
    try:
        api_check = driver.execute_script("""
            return typeof window.RomgonEngine !== 'undefined';
        """)
        if not api_check:
            print("❌ Error: Game Engine API not found!")
            print("   Make sure you're running the latest version with romgon-engine-api.js")
            driver.quit()
            return
    except Exception as e:
        print(f"❌ Error checking API: {e}")
        driver.quit()
        return
    
    print("✅ Game loaded!")
    print("✅ Game Engine API detected!")
    print("🤖 ChatGPT is analyzing the position...\n")
    
    move_count = 0
    
    try:
        while not is_game_over(driver):
            # Get game state
            try:
                state = get_game_state(driver)
                if not state or 'currentPlayer' not in state:
                    print("⏳ Waiting for game to initialize...")
                    time.sleep(2)
                    continue
                    
                analysis = analyze_position(driver)
                legal_moves = get_legal_moves(driver)
                
                if not legal_moves or len(legal_moves) == 0:
                    print("⚠️  No legal moves available, waiting...")
                    time.sleep(2)
                    continue
                
            except Exception as e:
                print(f"⚠️  Error getting game state: {e}")
                print("   Retrying in 2 seconds...")
                time.sleep(2)
                continue
            
            current_player = state['currentPlayer']
            
            # Only play for one side (you can change this)
            if current_player == 'black':  # ChatGPT plays as black
                print(f"\n{'='*50}")
                print(f"Move {move_count + 1} - ChatGPT's turn (Black)")
                print(f"{'='*50}")
                
                # Format state for ChatGPT
                prompt = format_state_for_gpt(state, analysis, legal_moves)
                
                # Ask ChatGPT
                print("🤔 Asking ChatGPT for best move...")
                move_notation = ask_chatgpt(prompt)
                print(f"🎯 ChatGPT chose: {move_notation}")
                
                # Validate move
                legal_notations = [m['notation'] for m in legal_moves]
                if move_notation not in legal_notations:
                    print(f"⚠️  ChatGPT suggested illegal move! Falling back to first legal move.")
                    move_notation = legal_moves[0]['notation']
                
                # Execute move
                result = make_move(driver, move_notation)
                
                if result.get('success'):
                    print(f"✅ Move executed: {move_notation}")
                    move_count += 1
                else:
                    print(f"❌ Move failed: {result.get('message')}")
                
                time.sleep(1)  # Brief pause
            
            else:
                # Wait for human player
                print(f"\n⏳ Waiting for White (human) to move...")
                time.sleep(2)  # Check every 2 seconds
        
        print("\n🎉 Game Over!")
        
    except KeyboardInterrupt:
        print("\n\n⏹️  Game interrupted by user")
    
    except Exception as e:
        print(f"\n❌ Error: {e}")
    
    finally:
        print("\n🔚 Closing browser...")
        driver.quit()

if __name__ == "__main__":
    # Check if API key is set
    if not OPENAI_API_KEY:
        print("❌ Error: OPENAI_API_KEY environment variable not set!")
        print("\nSet it with:")
        print("  export OPENAI_API_KEY='sk-...'  # Mac/Linux")
        print("  set OPENAI_API_KEY=sk-...       # Windows")
        exit(1)
    
    play_game()
