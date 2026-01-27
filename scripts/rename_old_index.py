import ftplib

def rename_index():
    host = "business100.mypowerfulserver.com"
    user = "topwebpa"
    password = r"vf|eRH1q{ci}"
    remote_dir = "thecourtdirect.com" 
    
    print(f"Connecting to {host}...")
    try:
        ftp = ftplib.FTP_TLS(host)
        ftp.login(user, password)
        ftp.prot_p()
        
        ftp.cwd(remote_dir)
        print(f"Entered {remote_dir}")
        
        files = []
        ftp.retrlines('NLST', files.append)
        
        if "index.php" in files:
            print("Found index.php. Renaming to index.php.bak...")
            try:
                ftp.rename("index.php", "index.php.bak")
                print("Renamed successfully.")
            except Exception as e:
                print(f"Rename failed: {e}")
        else:
            print("index.php not found.")
            
        ftp.quit()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    rename_index()
