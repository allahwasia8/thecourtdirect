import ftplib
import os
import re

def download_via_ftp():
    host = "business100.mypowerfulserver.com"
    user = "topwebpa"
    password = r"vf|eRH1q{ci}"
    
    local_images_dir = r"d:\thecourtdirect\public\images"
    os.makedirs(local_images_dir, exist_ok=True)
    
    print(f"Connecting to {host}...")
    try:
        ftp = ftplib.FTP(host)
        ftp.login(user, password)
        print("Login successful!")
        
        # Navigate to uploads
        remote_path = "public_html/wp-content/uploads"
        print(f"Changing directory to {remote_path}")
        ftp.cwd(remote_path)
        
        def download_recursive(current_dir, local_path):
            ftp.cwd(current_dir)
            files = []
            ftp.retrlines('LIST', files.append)
            
            for line in files:
                parts = line.split()
                if not parts: continue
                
                name = parts[-1]
                # Check if it's a directory (usually starts with 'd' in LIST output)
                is_dir = line.startswith('d')
                
                if name in ['.', '..']:
                    continue
                    
                if is_dir:
                    new_local = os.path.join(local_path, name)
                    os.makedirs(new_local, exist_ok=True)
                    download_recursive(name, new_local)
                    ftp.cwd('..') # Go back up
                else:
                    # Ignore small thumbnails (e.g. -150x150.webp)
                    if re.search(r'-\d+x\d+\.', name):
                        continue
                    
                    # Only download webp/image files
                    if name.lower().endswith(('.webp', '.jpg', '.jpeg', '.png', '.gif')):
                        local_file = os.path.join(local_path, name)
                        if not os.path.exists(local_file):
                            print(f"Downloading {name}...")
                            with open(local_file, 'wb') as f:
                                ftp.retrbinary(f"RETR {name}", f.write)
                        else:
                            # print(f"Skipping {name} (exists)")
                            pass

        # We want to keep the year/month structure? 
        # Actually our React app expects them in /public/images/
        # Let's just flatten them into /public/images/ for now since that's what we planned
        
        def download_flattened(current_dir):
            try:
                ftp.cwd(current_dir)
            except:
                print(f"Could not enter {current_dir}")
                return

            items = []
            ftp.retrlines('LIST', items.append)
            
            for line in items:
                parts = line.split()
                if not parts: continue
                name = parts[-1]
                is_dir = line.startswith('d')
                
                if name in ['.', '..']: continue
                
                if is_dir:
                    download_flattened(name)
                    ftp.cwd('..')
                else:
                    if re.search(r'-\d+x\d+\.', name): continue
                    if name.lower().endswith(('.webp', '.jpg', '.jpeg', '.png')):
                        local_file = os.path.join(local_images_dir, name)
                        if not os.path.exists(local_file):
                            print(f"Downloading {name}...")
                            with open(local_file, 'wb') as f:
                                ftp.retrbinary(f"RETR {name}", f.write)
        
        download_flattened(".")
        ftp.quit()
        print("Done!")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    download_via_ftp()
