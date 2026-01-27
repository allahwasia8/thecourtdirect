import ftplib

def explore_ftp():
    host = "business100.mypowerfulserver.com"
    user = "topwebpa"
    password = r"vf|eRH1q{ci}"
    
    print(f"Connecting to {host}...")
    try:
        ftp = ftplib.FTP(host)
        ftp.login(user, password)
        print("Login successful!")
        
        print("\n--- ROOT LISTING ---")
        ftp.retrlines('LIST')
        
        # Check standard wp path
        wp_uploads = "public_html/wp-content/uploads"
        print(f"\n--- {wp_uploads} ---")
        try:
            ftp.cwd(wp_uploads)
            ftp.retrlines('LIST')
            
            # Check a year folder
            print(f"\n--- {wp_uploads}/2023 ---")
            ftp.cwd("2023")
            ftp.retrlines('LIST')
            
        except Exception as e:
            print(f"Path error: {e}")
            
        ftp.quit()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    explore_ftp()
