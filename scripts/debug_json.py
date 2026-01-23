import os

def debug_corrupted_json():
    filepath = r"d:\thecourtdirect\public\data\posts\hampden-family-court.json"
    error_char = 6193 # From the report: char 6193
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    start = max(0, error_char - 100)
    end = min(len(content), error_char + 100)
    
    print(f"--- Context around char {error_char} ---")
    print(content[start:error_char])
    print(">>> ERROR HERE <<<")
    print(content[error_char:end])
    print("---------------------------------------")

if __name__ == "__main__":
    debug_corrupted_json()
