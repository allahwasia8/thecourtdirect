import ftplib
import os
import re

def recover_images():
    host = "business100.mypowerfulserver.com"
    user = "topwebpa"
    password = r"vf|eRH1q{ci}"
    
    # Target server path
    remote_root = "thecourtdirect.com/wp-content/uploads"
    
    # Local destination
    local_root = r"d:\thecourtdirect\public\images"
    os.makedirs(local_root, exist_ok=True)
    
    print(f"Connecting to {host}...")
    try:
        ftp = ftplib.FTP_TLS(host)
        ftp.login(user, password)
        ftp.prot_p()
        print("Login successful!")
        
        # Determine years to process.
        print(f"Navigating to {remote_root}...")
        try:
             ftp.cwd(remote_root)
        except:
             print(f"Could not go to {remote_root}")
             return

        years = []
        ftp.retrlines('NLST', years.append)
        years = [y for y in years if re.match(r'^\d{4}$', y)]
        print(f"Found years: {years}")
        
        def process_directory(current_dir, local_dest):
             print(f"Processing remote dir: {current_dir}")
             try:
                 ftp.cwd(current_dir)
             except Exception as e:
                 print(f"Failed to enter {current_dir}: {e}")
                 return

             items = []
             try:
                 ftp.retrlines('LIST', items.append)
             except Exception as e:
                 print(f"List failed in {current_dir}: {e}")
                 ftp.cwd("..")
                 return
             
             for line in items:
                 parts = line.split()
                 if not parts: continue
                 name = parts[-1]
                 if name in ['.', '..']: continue
                 is_dir = line.startswith('d')
                 
                 if is_dir:
                     process_directory(name, local_dest)
                 else:
                     # File Filter
                     if re.search(r'-\d+x\d+', name):
                         # print(f"Skipping thumbnail: {name}")
                         continue
                     if not name.lower().endswith(('.jpg', '.jpeg', '.png', '.webp', '.gif')):
                         continue
                         
                     local_file = os.path.join(local_dest, name)
                     if os.path.exists(local_file): continue
                     
                     print(f"Downloading {name}...")
                     try:
                         with open(local_file, 'wb') as f:
                             ftp.retrbinary(f"RETR {name}", f.write)
                     except Exception as e:
                         print(f"DL Error {name}: {e}")
             
             # Go back up when done with this dir
             ftp.cwd("..")

        for year in years:
            process_directory(year, local_root)
            
        ftp.quit()
        print("Download Complete!")

    except Exception as e:
        print(f"Fatal Error: {e}")

if __name__ == "__main__":
    recover_images()
