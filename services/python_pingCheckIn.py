import requests
import threading
import time

def ping_watchdog():
    interval = 30 # ping interval in seconds
    url = "localhost"
    port = 5002
    path = "/pingCheckIn/Test-pythonPing"
    try:
        r = requests.get("http://{}:{}{}".format(url, port, path))
    except requests.exceptions.RequestException as e:  # This is the correct syntax
        print(e)
    else:
        print('Successful ping at ' + time.ctime())
    threading.Timer(interval, ping_watchdog).start()

if __name__ == '__main__':
    ping_watchdog()