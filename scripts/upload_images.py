import ftplib
import os

def upload_images():
    host = "business100.mypowerfulserver.com"
    user = "topwebpa"
    password = r"vf|eRH1q{ci}"
    
    # Remote target directory
    remote_dir = "thecourtdirect.com/images"
    
    # Local images directory
    local_dir = r"d:\thecourtdirect\public\images"
    
    print(f"Connecting to {host}...")
    try:
        ftp = ftplib.FTP_TLS(host)
        ftp.login(user, password)
        ftp.prot_p()
        print("Login successful!")
        
        # Navigate to thecourtdirect.com first
        ftp.cwd("thecourtdirect.com")
        
        # Create images directory if it doesn't exist
        try:
            ftp.mkd("images")
            print("Created images directory")
        except:
            print("Images directory already exists")
        
        ftp.cwd("images")
        print(f"Entered images directory")

        # Get list of files to upload
        files = [f for f in os.listdir(local_dir) if os.path.isfile(os.path.join(local_dir, f))]
        print(f"Found {len(files)} files to upload")
        
        uploaded = 0
        for filename in files:
            local_path = os.path.join(local_dir, filename)
            print(f"Uploading {filename}...")
            try:
                with open(local_path, 'rb') as f:
                    ftp.storbinary(f"STOR {filename}", f)
                uploaded += 1
            except Exception as e:
                print(f"Failed {filename}: {e}")
        
        print(f"\nUpload complete! {uploaded}/{len(files)} files uploaded successfully.")
        ftp.quit()

    except Exception as e:
        print(f"Fatal Error: {e}")

if __name__ == "__main__":
    upload_images()
