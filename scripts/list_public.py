import ftplib

def list_public_html():
    host = "business100.mypowerfulserver.com"
    user = "topwebpa"
    password = r"vf|eRH1q{ci}"
    
    print(f"Connecting to {host} using FTPS...")
    try:
        ftp = ftplib.FTP_TLS(host)
        # ftp.set_debuglevel(2)
        ftp.login(user, password)
        ftp.prot_p() # Switch to secure data connection
        print("Login successful!")
        
        print("Root listed. Now attempting to enter 'thecourtdirect.com'...")
        try:
            ftp.cwd("thecourtdirect.com")
            print("Entered thecourtdirect.com")
            
            ftp.cwd("wp-content")
            print("Entered wp-content")
            
            ftp.cwd("uploads")
            print("Entered uploads")
            
            print("Listing years in uploads:")
            lines = []
            ftp.retrlines('NLST', lines.append)
            for line in lines:
                print(f"UPLOAD: {line}")
                
        except Exception as e:
            print(f"Navigation failed: {e}")
        
        ftp.quit()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    list_public_html()
