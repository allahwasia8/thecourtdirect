import os

def debug_raw_bytes():
    filepath = r"d:\thecourtdirect\public\data\posts\hampden-family-court.json"
    # The browser said line 11, column 5753.
    # In Step 1017, line 11 started with "content":
    # Let's just read the file and find line 11.
    
    with open(filepath, 'rb') as f:
        lines = f.readlines()
    
    if len(lines) >= 11:
        line11 = lines[10]
        # Column 5753 (1-indexed) -> index 5752
        start = max(0, 5752 - 50)
        end = min(len(line11), 5752 + 50)
        
        print(f"--- Line 11 context around col 5753 ---")
        print(f"Bytes: {line11[start:end]}")
        # Mark the exact spot
        rel_pos = 5752 - start
        print(" " * (rel_pos + 7) + "^ ERROR HERE")
    else:
        print(f"File only has {len(lines)} lines.")

if __name__ == "__main__":
    debug_raw_bytes()
