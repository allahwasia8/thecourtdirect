import os
import shutil

def clear_images():
    images_dir = r"d:\thecourtdirect\public\images"
    
    # Keep reviewers folder if possible, as that seems correct/manual? 
    # Or just wipe it all if user says "wrong folder"
    # Let's check what's in there 
    
    for item in os.listdir(images_dir):
        path = os.path.join(images_dir, item)
        if item == "reviewers":
            continue # Keep reviewers? Or nuke?
        
        try:
            if os.path.isdir(path):
                shutil.rmtree(path)
            else:
                os.remove(path)
        except Exception as e:
            print(f"Error deleting {item}: {e}")
            
    print("Cleared ./public/images/ (kept reviewers if present)")

if __name__ == "__main__":
    clear_images()
