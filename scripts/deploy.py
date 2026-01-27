import ftplib
import os

def deploy():
    host = "business100.mypowerfulserver.com"
    user = "topwebpa"
    password = r"vf|eRH1q{ci}"
    
    # Remote target directory
    remote_dir = "thecourtdirect.com" 
    
    # Local build directory
    local_dir = r"d:\thecourtdirect\dist"
    
    print(f"Connecting to {host}...")
    try:
        ftp = ftplib.FTP_TLS(host)
        ftp.login(user, password)
        ftp.prot_p()
        print("Login successful!")
        
        # Navigate to target
        try:
            ftp.cwd(remote_dir)
            print(f"Entered {remote_dir}")
        except:
             print(f"Creating {remote_dir}...")
             ftp.mkd(remote_dir)
             ftp.cwd(remote_dir)

        # Upload function
        def upload_recursive(local_path, remote_base):
            items = os.listdir(local_path)
            for item in items:
                local_item_path = os.path.join(local_path, item)
                
                if os.path.isdir(local_item_path):
                    # Directory
                    try:
                        ftp.mkd(item)
                        print(f"Created dir: {item}")
                    except:
                        pass # Exists
                    
                    ftp.cwd(item)
                    upload_recursive(local_item_path, remote_base + "/" + item)
                    ftp.cwd("..")
                    
                else:
                    # File
                    print(f"Uploading {item}...")
                    try:
                        with open(local_item_path, 'rb') as f:
                            ftp.storbinary(f"STOR {item}", f)
                    except Exception as e:
                        print(f"Failed {item}: {e}")

        print("Starting upload...")
        upload_recursive(local_dir, remote_dir)
        
        ftp.quit()
        print("Deployment Complete!")

    except Exception as e:
        print(f"Fatal Error: {e}")

if __name__ == "__main__":
    deploy()
