import ftplib

def list_specific_dir():
    host = "business100.mypowerfulserver.com"
    user = "topwebpa"
    password = r"vf|eRH1q{ci}"
    
    # Based on URL from json: 2023/09/Family-court-sending-you-to-jail.webp
    path = "public_html/wp-content/uploads/2023/09"
    
    print(f"Connecting to {host}...")
    try:
        ftp = ftplib.FTP(host)
        ftp.login(user, password)
        print("Login successful!")
        
        print(f"Listing {path}...")
        try:
            ftp.cwd(path)
            ftp.retrlines('LIST')
        except Exception as e:
            print(f"Error: {e}")
            
        ftp.quit()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    list_specific_dir()
