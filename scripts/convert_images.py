import os
from PIL import Image

def convert_to_webp(directory):
    count = 0
    errors = 0
    
    print(f"Scanning {directory}...")
    
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.lower().endswith(('.jpg', '.jpeg', '.png', '.bmp', '.tiff')):
                file_path = os.path.join(root, file)
                webp_path = os.path.splitext(file_path)[0] + ".webp"
                
                try:
                    # Open and convert
                    with Image.open(file_path) as img:
                        img.save(webp_path, "WEBP", quality=85)
                    
                    # Verify webp exists before deleting original
                    if os.path.exists(webp_path):
                        os.remove(file_path)
                        count += 1
                        # print(f"Converted: {file} -> {os.path.basename(webp_path)}")
                    else:
                        print(f"Failed to save WebP: {file}")
                        errors += 1
                        
                except Exception as e:
                    print(f"Error converting {file}: {e}")
                    errors += 1
                    
    print(f"Directory {directory}: Converted {count} images. Errors: {errors}")

def main():
    dirs_to_scan = [
        r"d:\thecourtdirect\public",
        r"d:\thecourtdirect\src\assets"
    ]
    
    for d in dirs_to_scan:
        if os.path.exists(d):
            convert_to_webp(d)
        else:
            print(f"Directory not found: {d}")

if __name__ == "__main__":
    main()
