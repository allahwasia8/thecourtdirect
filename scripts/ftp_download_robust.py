import ftplib
import os
import re
import time

def download_via_ftp_robust():
    host = "ftp.topwebpartners.com"
    user = "topwebpa@thecourtdirect.com"
    password = r"l%yNovcK{~?I3f*y"
    
    local_images_dir = r"d:\thecourtdirect\public\images"
    os.makedirs(local_images_dir, exist_ok=True)
    
    print(f"Connecting to {host}...")
    try:
        ftp = ftplib.FTP_TLS(host)
        ftp.login(user, password)
        ftp.prot_p()
        print("Login successful!")
        
        # Navigate to uploads
        remote_base = "public_html/wp-content/uploads"
        print(f"Changing directory to {remote_base}")
        ftp.cwd(remote_base)
        
        def download_recursive(current_dir):
            try:
                ftp.cwd(current_dir)
                print(f"Entered {current_dir}")
            except Exception as e:
                print(f"Error Entering {current_dir}: {e}")
                return

            files = []
            try:
                ftp.retrlines('LIST', files.append)
            except Exception as e:
                print(f"Error Listing {current_dir}: {e}")
                return

            for line in files:
                parts = line.split()
                if not parts: continue
                
                name = parts[-1]
                # Is it a directory? 'drwxr-xr-x'
                is_dir = line.startswith('d')
                
                if name in ['.', '..']: continue
                
                if is_dir:
                    # Recurse
                    download_recursive(name)
                    ftp.cwd('..') 
                else:
                    # File
                    # Skip common thumbs like -150x150.jpg, etc if we want to save time/space
                    if re.search(r'-\d+x\d+\.', name):
                        continue
                        
                    if name.lower().endswith(('.webp', '.jpg', '.jpeg', '.png', '.gif')):
                        local_file = os.path.join(local_images_dir, name)
                        
                        # Check if exists and size > 0
                        if os.path.exists(local_file) and os.path.getsize(local_file) > 0:
                            continue
                            
                        print(f"Downloading {name}...")
                        try:
                            # Use a temporary file to avoid partials
                            temp_file = local_file + ".part"
                            with open(temp_file, 'wb') as f:
                                ftp.retrbinary(f"RETR {name}", f.write)
                            
                            # Rename to final if successful
                            if os.path.exists(local_file):
                                os.remove(local_file)
                            os.rename(temp_file, local_file)
                            
                        except Exception as e:
                            print(f"Failed to download {name}: {e}")
                            if os.path.exists(temp_file):
                                os.remove(temp_file)

            return

        # Start recursion from current dir (uploads)
        # But we probably only care about 2023 and maybe 2022/2024?
        # Let's just go recursive from root of uploads to be safe
        download_recursive(".")
        
        ftp.quit()
        print("Download Complete!")

    except Exception as e:
        print(f"Fatal FTP Error: {e}")

if __name__ == "__main__":
    download_via_ftp_robust()
