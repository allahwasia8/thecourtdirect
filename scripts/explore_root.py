import ftplib

def explore_root():
    host = "business100.mypowerfulserver.com"
    user = "topwebpa"
    password = r"vf|eRH1q{ci}"
    
    print(f"Connecting to {host}...")
    try:
        ftp = ftplib.FTP(host)
        ftp.login(user, password)
        print("Login successful!")
        
        folders = ["public_html", "public_html/wp-content"]
        
        for f in folders:
            print(f"\n--- Listing {f} ---")
            try:
                ftp.cwd(f)
                ftp.retrlines('LIST')
                # Go back to root for next iteration logic if simple cwd
                # But here we use absolute paths effectively by re-login or careful cwd
                # ftp.cwd("/") # tough to know root. Best just re-connect or tracking.
                # simpler: just use full path if server supports, or ...
                # let's just do one by one
                ftp.cwd("/")
            except Exception as e:
                print(f"Error listing {f}: {e}")

        ftp.quit()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    explore_root()
