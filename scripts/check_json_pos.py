import os

def check_pos():
    filepath = r"d:\thecourtdirect\public\data\posts\hampden-family-court.json"
    pos = 6203
    
    with open(filepath, 'rb') as f:
        content = f.read()
    
    start = max(0, pos - 50)
    end = min(len(content), pos + 50)
    
    print(f"--- Raw bytes around position {pos} ---")
    chunk = content[start:end]
    print(chunk)
    
    # Try to decode safely for printing
    print("\nAs string:")
    print(chunk.decode('utf-8', errors='replace'))
    
    # Indicate exact character
    rel = pos - start
    print(" " * rel + "^ THIS BYTE")

if __name__ == "__main__":
    check_pos()
