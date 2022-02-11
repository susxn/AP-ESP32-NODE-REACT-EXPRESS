# Configurable Wi-Fi Access Point

## Introduction

This project explains how to create an access point with an ESP32 and the functionalities that
will be detailed later.
To develop this project we will need a computer, an ESP32 and a USB to MicroUSB cable
that will allow us to connect the ESP32 to our computer.
We will use the computer to monitor the movements of the esp32 using the HTTP protocol.
This diagram represents the schematic of the project:

![System Scheme](https://github.com/susxn/AP-ESP32-NODE-REACT-EXPRESS/blob/main/soft_ap_server/AP.png "System Scheme")

The IP addresses shown at HOME are our particular case. But the ESP32 is configured to
create a local network with 192.168.4.0/24 addresses.
We will connect the ESP32 to our local home network or access point of choice, where the
device that will monitor the connections will also be connected. From this device we will be
able to do everything we need to perform.
Therefore, in the ESP32 we will have a program running continuously and in the device of
the same local network, will be running a server that will accept requests and send responses
via HTTP protocol.
The way of monitoring is through Gmail, we will see later how to configure the server for
this functionality.


## Features

- Monitor input and output of all devices connected to the access point.
- Remove from the access point the devices with the mac address you want.
- Remove from the access point the devices with the mac address you want in a time zone
that you configure.


## Installation

### Local Server

The server is programmed with nodejs. To install nodejs and its respective package manager
npm you can follow the instructions in the following link: [Nodejs & NPM](https://nodejs.org/es/download/package-manager/).

- Install nodejs and npm 
- Check version. If all has been installed correctly you should get the correct version of each running:
```
$ node -v
$ npm -v
```
- Clone these repository
- Run (inside SOFT_AP_SERVER folder):
```
$ npm i 
$ npm start
```
These runs the app in the development mode. Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

### ESP-IDF

The ESP32 device is programmed with ESP-IDF (Espressif IoT Development Framework). It
is very easy to learn how to program with this framework, following the steps explained in this
link: [Get Started](https://docs.espressif.com/projects/esp-idf/en/latest/esp32/get-started/index.html/).

Following the Get Started tutorial, you will have to reproduce an example project called **hello_world**.

#### Hello_world

The project **hello_world** contains one source file in C language inside **main** folder.

Replace **hello_world_main.c** from **hello_world/main** folder to [main.c](ESP-32/main.c) file from **ESP-32** folder.

Below is short explanation of remaining files in the **hello_world** folder.

```
├── CMakeLists.txt
├── example_test.py            Python script used for automated example testing
├── main
│   ├── CMakeLists.txt
│   ├── component.mk           Component make file
│   └── hello_world_main.c
├── Makefile                   Makefile used by legacy GNU Make
└── README.md                  This is the file you are currently reading
```

For more information on structure and contents of ESP-IDF projects, please refer to Section [Build System](https://docs.espressif.com/projects/esp-idf/en/latest/esp32/api-guides/build-system.html) of the ESP-IDF Programming Guide.

#### ESP32 NAT Router 

The following are the steps required to compile this project:

1.Download and setup the ESP-IDF.

2.In the project directory run make menuconfig (or idf.py menuconfig for cmake).

3.Component config -> LWIP > [x] Enable copy between Layer2 and Layer3 packets.

4.Component config -> LWIP > [x] Enable IP forwarding.

5.Component config -> LWIP > [x] Enable NAT (new/experimental).

6.Build the project and flash it to the ESP32.

A detailed instruction on how to build, configure and flash a ESP-IDF project can also be found the official ESP-IDF guide.






