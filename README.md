IMPORTANT:
    - All things in config must be changed before running the program, or it won't actually change anything.

Web links:
replace "{port}" with the port set in config.json.
    - do not keep brackets in link
    - default port is set to 8540

To view: http://{ipv4 address or "localhost"}:{port}
To control: http://{ipv4 address or "localhost"}:{port}/backend

example links:
http://{ipv4 address or "localhost"}:8540
http://{ipv4 address or "localhost"}:8540/backend

to change port change the "port" value in config.json
    - make sure to save file
    - then run program

if accessing from same device the code is running on its easier and more efficient to use "localhost" rather than the ipv4 address

if you want to change whether it can be visited from another device,
    - change "run_locally" to be "false" or "true" in config.json

    - if true:
        - use instructions above
        - use "localhost" in links

    - if false:
        - to access:
            - you need to get the ipv4 address for the computer
            - easiest way to get it is in command prompt, put in "ipconfig" without the quotes
            - then hit enter and use the ipv4 address where the brackets are in example links

 The "deb" value in config.json just controls whether it shows certain things in the terminal that opens when run,
    - the things it shows are not critical, it is just things to help with debugging.
