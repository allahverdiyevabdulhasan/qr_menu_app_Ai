import paramiko
import sys
import tarfile
import os

host = "173.212.219.214"
username = "root"
password = "B5hr8kAc2TuD4#e"

archive_name = "project_deploy.tar.gz"
remote_path = f"/root/{archive_name}"
deploy_dir = "/root/qr_menu_app_Ai"

def filter_tar(tarinfo):
    exclude_dirs = ['.git', 'node_modules', '.next', '__pycache__', '.venv', 'venv']
    if any(ex in tarinfo.name for ex in exclude_dirs):
        return None
    return tarinfo

print("1. Creating local archive (excluding large/hidden folders)...")
with tarfile.open(archive_name, "w:gz") as tar:
    if os.path.exists('backend'): tar.add('backend', filter=filter_tar)
    if os.path.exists('frontend'): tar.add('frontend', filter=filter_tar)
    if os.path.exists('docker-compose.yml'): tar.add('docker-compose.yml', filter=filter_tar)

print("2. Connecting to server via SSH...")
try:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(hostname=host, username=username, password=password, timeout=10)
    
    print("3. Uploading archive to server (this might take a minute)...")
    sftp = ssh.open_sftp()
    sftp.put(archive_name, remote_path)
    sftp.close()
    
    commands = [
        f"mkdir -p {deploy_dir}",
        f"tar -xzf {remote_path} -C {deploy_dir}",
        f"rm {remote_path}",
        f"cd {deploy_dir} && (docker compose up -d --build || docker-compose up -d --build)"
    ]
    
    print("4. Extracting and starting Docker containers on server...")
    for command in commands:
        print(f"\nExecuting: {command}")
        stdin, stdout, stderr = ssh.exec_command(command)
        
        while True:
            line = stdout.readline()
            if not line:
                break
            try:
                print(line.strip())
            except UnicodeEncodeError:
                print(line.encode('ascii', 'ignore').decode('ascii').strip())
            
        err = stderr.read().decode('utf-8', 'ignore').strip()
        if err:
            try:
                print(f"STDERR: {err}")
            except UnicodeEncodeError:
                print(f"STDERR: {err.encode('ascii', 'ignore').decode('ascii')}")
            
    ssh.close()
    print("\nDeployment completed successfully! The server should be running now.")
    
except Exception as e:
    print(f"An error occurred: {e}")
    sys.exit(1)
finally:
    if os.path.exists(archive_name):
        os.remove(archive_name)
