import ftplib
import os

def download_one():
    host = "business100.mypowerfulserver.com"
    user = "topwebpa"
    password = r"vf|eRH1q{ci}"
    
    local_dir = r"d:\thecourtdirect\public\images"
    filename = "Family-court-sending-you-to-jail.webp"
    
    # We don't know exactly where it is in the remote tree (2023/09/ ?)
    # So we'll search for it or just try the path we saw in JSON
    remote_path = "public_html/wp-content/uploads/2023/09/" + filename
    
    print(f"Connecting to {host}...")
    try:
        ftp = ftplib.FTP(host)
        ftp.login(user, password)
        print("Login successful!")
        
        local_path = os.path.join(local_dir, filename)
        
        print(f"Downloading {filename} from {remote_path}...")
        with open(local_path, 'wb') as f:
            ftp.retrbinary(f"RETR {remote_path}", f.write)
            
        print("Done!")
        ftp.quit()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    download_one()
