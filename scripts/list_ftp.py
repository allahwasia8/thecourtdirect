import ftplib

def list_remote_dir():
    host = "business100.mypowerfulserver.com"
    user = "topwebpa"
    password = r"vf|eRH1q{ci}"
    
    path = "public_html/wp-content/uploads/2023/09"
    
    print(f"Connecting to {host}...")
    try:
        ftp = ftplib.FTP(host)
        ftp.login(user, password)
        print("Login successful!")
        
        print(f"Listing {path}...")
        ftp.cwd(path)
        ftp.retrlines('LIST')
        
        ftp.quit()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    list_remote_dir()
