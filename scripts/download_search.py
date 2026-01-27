import ftplib
import os

def download_specific():
    host = "business100.mypowerfulserver.com"
    user = "topwebpa"
    password = r"vf|eRH1q{ci}"
    
    target_file = "Family-court-sending-you-to-jail.webp"
    local_dir = r"d:\thecourtdirect\public\images"
    
    print(f"Connecting to {host}...")
    try:
        ftp = ftplib.FTP(host)
        ftp.login(user, password)
        print("Login successful!")
        
        # Search places
        base = "public_html/wp-content/uploads"
        years = ["2022", "2023", "2024", "2025"]
        months = [f"{i:02d}" for i in range(1, 13)]
        
        found = False
        
        for y in years:
            for m in months:
                path = f"{base}/{y}/{m}/{target_file}"
                try:
                    # Try to get size to check existence
                    size = ftp.size(path)
                    print(f"FOUND! {path} size={size}")
                    
                    local_path = os.path.join(local_dir, target_file)
                    with open(local_path, 'wb') as f:
                        ftp.retrbinary(f"RETR {path}", f.write)
                    print("Downloaded successfully.")
                    found = True
                    break
                except:
                    # print(f"Not in {y}/{m}")
                    pass
            if found: break
            
        if not found:
            print(f"Could not find {target_file} in any standard folder.")
        
        ftp.quit()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    download_specific()
