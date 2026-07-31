import paramiko

host = "173.212.219.214"
username = "root"
password = "B5hr8kAc2TuD4#e"

commands = [
    "ps aux | grep python",
    "ps aux | grep node",
    "ls -la /root",
    "ls -la /var/www",
    "ls -la /opt",
    "find / -name manage.py -type f 2>/dev/null"
]

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(hostname=host, username=username, password=password, timeout=10)

for command in commands:
    print(f"=== Output of: {command} ===")
    stdin, stdout, stderr = ssh.exec_command(command)
    print(stdout.read().decode())

ssh.close()
