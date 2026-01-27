import ftplib

def explore_topwebpartners():
    host = "business100.mypowerfulserver.com"
    user = "topwebpa"
    password = r"vf|eRH1q{ci}"
    
    print(f"Connecting to {host}...")
    try:
        ftp = ftplib.FTP(host)
        ftp.login(user, password)
        print("Login successful!")
        
        # Based on previous listing and user hint
        # We saw "Topwebpartners" might be a thing, or simply another folder
        # Let's list the root again very carefully to see all folders
        print("\n--- ROOT ---")
        ftp.retrlines('LIST')
        
        # Try to guess common subdomain structures based on user info
        targets = [
            "thecourtdirect.com",
            "public_html/thecourtdirect.com",
            "public_html/court",
            "court",
            "Topwebpartners" 
        ]
        
        for t in targets:
            print(f"\n--- Checking {t} ---")
            try:
                ftp.cwd(t)
                ftp.retrlines('LIST')
                ftp.cwd("/")
            except:
                print(f"Could not enter {t}")

        ftp.quit()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    explore_topwebpartners()
