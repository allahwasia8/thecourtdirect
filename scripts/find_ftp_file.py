import ftplib
import time

def find_file_recursive():
    host = "business100.mypowerfulserver.com"
    user = "topwebpa"
    password = r"vf|eRH1q{ci}"
    
    target_part = "Family-court-sending"
    start_dir = "public_html/wp-content/uploads"
    
    print(f"Connecting to {host}...")
    try:
        ftp = ftplib.FTP(host)
        ftp.login(user, password)
        print("Login successful!")
        
        found_path = None
        
        def walk(current_dir):
            nonlocal found_path
            if found_path: return
            
            try:
                ftp.cwd(current_dir)
            except:
                return

            files = []
            try:
                ftp.retrlines('LIST', files.append)
            except:
                return

            dirs = []
            
            for line in files:
                parts = line.split()
                if not parts: continue
                name = parts[-1]
                if name in ['.', '..']: continue
                
                is_dir = line.startswith('d')
                
                if is_dir:
                    dirs.append(name)
                else:
                    if target_part.lower() in name.lower():
                        print(f"\n!!! FOUND !!!\n{current_dir}/{name}\n")
                        found_path = f"{current_dir}/{name}"
                        return

            for d in dirs:
                if found_path: return
                walk(d)
                if not found_path:
                    ftp.cwd('..')

        print(f"Searching for '{target_part}' in {start_dir}...")
        ftp.cwd(start_dir)
        walk(".")
        
        ftp.quit()
        
        if not found_path:
            print("Not found in recursive search.")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    find_file_recursive()
