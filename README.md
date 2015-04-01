# PowershellAPI
Node js API for executing common Powershell tasks

##API
All api urls are listening as post requests, and like to be fed json data.

###Send commands to a list of windows boxes
Listens on /windows/command, and requires two objects named computers and commands. The delay is counted in ms.

Example data sent to server:
```javascript
{
    "computers":
    [
        "vmtsd302891w864",
        "localhost"
    ],
    
    "commands":
    [
        "ping google.com",
        "ping apple.com"
    ]
}
```
Example response:

```javascript

[
  {
    "computer": "localhost",
    "assumedLocation": "localhost",
    "delay": 3672,
    "command": "ping google.com",
    "error": null,
    "stdout": "\ \ Pinging google.com [74.125.20.138] with 32 bytes of data:\ \ Reply from 74.125.20.138: bytes=32 time=9ms TTL=42\ \ Reply from 74.125.20.138: bytes=32 time=9ms TTL=42\ \ Reply from 74.125.20.138: bytes=32 time=9ms TTL=42\ \ Reply from 74.125.20.138: bytes=32 time=9ms TTL=42\ \ \ \ Ping statistics for 74.125.20.138:\ \ Packets: Sent = 4, Received = 4, Lost = 0 (0% loss),\ \ Approximate round trip times in milli-seconds:\ \ Minimum = 9ms, Maximum = 9ms, Average = 9ms\ \ ",
    "stderr": ""
  },
  {
    "computer": "vmtsd302891w864",
    "assumedLocation": "tsd",
    "delay": 4547,
    "command": "ping google.com",
    "error": null,
    "stdout": "\ \ Pinging google.com [74.125.20.113] with 32 bytes of data:\ \ Reply from 74.125.20.113: bytes=32 time=10ms TTL=42\ \ Reply from 74.125.20.113: bytes=32 time=10ms TTL=42\ \ Reply from 74.125.20.113: bytes=32 time=10ms TTL=42\ \ Reply from 74.125.20.113: bytes=32 time=10ms TTL=42\ \ \ \ Ping statistics for 74.125.20.113:\ \ Packets: Sent = 4, Received = 4, Lost = 0 (0% loss),\ \ Approximate round trip times in milli-seconds:\ \ Minimum = 10ms, Maximum = 10ms, Average = 10ms\ \ ",
    "stderr": ""
  },
  {
    "computer": "localhost",
    "assumedLocation": "localhost",
    "delay": 11641,
    "command": "ping apple.com",
    "error": null,
    "stdout": "\ \ Pinging apple.com [17.178.96.59] with 32 bytes of data:\ \ Request timed out.\ \ Request timed out.\ \ Reply from 17.111.65.227: Destination net unreachable.\ \ Reply from 17.111.65.227: Destination net unreachable.\ \ \ \ Ping statistics for 17.178.96.59:\ \ Packets: Sent = 4, Received = 2, Lost = 2 (50% loss),\ \ ",
    "stderr": ""
  },
  {
    "computer": "vmtsd302891w864",
    "assumedLocation": "tsd",
    "delay": 20235,
    "command": "ping apple.com",
    "error": null,
    "stdout": "\ \ Pinging apple.com [17.172.224.47] with 32 bytes of data:\ \ Request timed out.\ \ Request timed out.\ \ Request timed out.\ \ Request timed out.\ \ \ \ Ping statistics for 17.172.224.47:\ \ Packets: Sent = 4, Received = 0, Lost = 4 (100% loss),\ \ ",
    "stderr": ""
  }
]
```

/*
###Enter a list of mac addresses
Listens on /network/addmac, and requires one object called macAddresses.

Example:
```javascript
{
    "macAddresses":
    [
        "notAMacAddress",
        "aca31e9a6cd1", //Already exists in the database.
        "aca31e9a6cd3"
    ]
}
```

Result:

```javascript

```
*/
