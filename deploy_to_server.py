import paramiko
import sys
import time

host = "173.212.219.214"
username = "root"
password = "B5hr8kAc2TuD4#e"

commands = [
    "apt-get update -y",
    "apt-get install -y docker-compose-plugin git",
    "systemctl enable --now docker",
    "rm -rf /root/qr_menu_app_Ai",
    "cd /root && git clone https://github.com/allahverdiyevabdulhasan/qr_menu_app_Ai.git",
    "cd /root/qr_menu_app_Ai && docker compose up -d --build"
]

print(f"Connecting to {host}...")
try:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(hostname=host, username=username, password=password, timeout=10)
    print("Connected successfully!")
    
    for command in commands:
        print(f"\nExecuting: {command}")
        stdin, stdout, stderr = ssh.exec_command(command)
        
        # Read output in real-time
        while True:
            line = stdout.readline()
            if not line:
                break
            print(line.strip())
            
        err = stderr.read().decode().strip()
        if err:
            print(f"STDERR: {err}")
            
        exit_status = stdout.channel.recv_exit_status()
        print(f"Exit status: {exit_status}")
        
    ssh.close()
    print("\nDeployment completed successfully!")
except Exception as e:
    print(f"An error occurred: {e}")
    sys.exit(1)
