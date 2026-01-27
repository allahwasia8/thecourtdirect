import ftplib
import sys

def find_file():
    host = "business100.mypowerfulserver.com"
    user = "topwebpa@thecourtdirect.com"
    password = r"l%yNovcK{~?I3f*y"
    
    # File we know exists from user's URL
    target_file = "Albany-County-Criminal-Court-1024x576.jpg"
    
    # Possible relative paths to the file from FTP root
    candidates = [
        f"2023/07/{target_file}",
        f"uploads/2023/07/{target_file}",
        f"wp-content/uploads/2023/07/{target_file}",
        f"thecourtdirect.com/wp-content/uploads/2023/07/{target_file}",
        f"public_html/wp-content/uploads/2023/07/{target_file}",
        f"public_html/thecourtdirect.com/wp-content/uploads/2023/07/{target_file}"
    ]
    
    print(f"Connecting to {host}...")
    try:
        ftp = ftplib.FTP_TLS(host)
        ftp.login(user, password)
        ftp.prot_p()
        print("Login successful!")
        
        for path in candidates:
            print(f"Checking {path}...")
            try:
                # Try to get size of file
                size = ftp.size(path)
                print(f"SUCCESS! Found file at: {path} (Size: {size})")
                return
            except Exception as e:
                # print(f"Not found at {path}: {e}")
                pass
                
        print("File NOT found in any candidate path.")
        
        # List root again just to be sure
        print("\nRoot listing:")
        ftp.retrlines('LIST')
            
        ftp.quit()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    find_file()
