# Ride Share - A Ride-Sharing Application

This is the Node.js Express backend documentation for Ride Share, a ride-sharing application (like uberpool). It provides various endpoints for user authentication, managing users, rides, vehicles, and ride requests.

## Table of Contents

- [Overview](#overview)
  - [Introduction](#introduction)
  - [Features](#features)
- [Installation](#installation)
- [Endpoints](#endpoints)
- [My Process](#my-process)
  - [Built With](#built-with)
  - [App Summary](#app-summary)
- [Author](#author)

## Overview

### Introduction

Ride Share is a ride-sharing application that allows users to create rides, request rides, and manage their profile and vehicles. It provides authentication functionality and supports operations such as creating, updating, and deleting rides, vehicles, and ride requests.

### Features

Users should be able to:

- Register and authenticate with their email and password.
- Create, update, and delete their user profile.
- Create, update, and delete rides as a driver.
- Request and manage ride requests as a passenger.
- Create and update vehicles as a driver.
- Search for available rides as a passenger.

## Installation

1. Clone the repository.
2. Install the required packages using `npm install`.
3. Create a `config.env` file in a config directory and set the required environment variables (e.g. JWT_SECRET and MONGO_URI).
4. Start the server: `npm server`

## Endpoints

| Endpoint                                           | Method | Description                                   |
| -------------------------------------------------- | ------ | --------------------------------------------- |
| `/api/auth`                                        | POST   | Authenticate user and get token               |
| `/api/users`                                       | POST   | Register a new user                           |
| `/api/users/:id`                                   | PUT    | Update user profile                           |
| `/api/users/:id`                                   | DELETE | Delete user profile                           |
|  Vehicle                                           |        |                                               |
| `/api/vehicles`                                    | POST   | Create a new vehicle (driver)                  |
| `/api/vehicles`                                    | GET    | Get a list of all vehicles                     |
| `/api/vehicles/:vehicleId`                         | GET    | Get details of a specific vehicle              |
| `/api/vehicles/:vehicleId`                         | PUT    | Update a vehicle (driver)                      |
| `/api/vehicles/:vehicleId`                         | DELETE | Delete a vehicle (driver)                      |
|  Rides                                             |        |                                                |
| `/api/rides`                                       | POST   | Create a new ride (driver)                     |
| `/api/rides`                                       | GET    | Get a list of all rides                        |
| `/api/rides/:rideId`                               | GET    | Get details of a specific ride                 |
| `/api/rides/:rideId`                               | PUT    | Update a ride (driver)                         |
| `/api/rides/:rideId`                               | DELETE | Delete a ride (driver)                         |
| `/api/rides/:rideId/requests`                      | GET    | Get ride requests for a specific ride          |
| `/api/rides/:rideId/requests/:requestId`           | GET    | Get details of a specific ride request         |
| `/api/rides/:rideId/requests/:requestId`           | PUT    | Accept or cancel a ride request (driver)       |
| `/api/rides/:rideId/passengers/:requestId`         | PUT    | Remove a passenger from a ride (driver)        |
|  Passengers                                        |        |                                               |
| `/api/passengers/available-drivers/:rideId`        | GET    | Get an available driver's ride by rideId       |
| `/api/passengers/available-drivers?search={search}`| GET    | Get a list of available drivers                |
| `/api/passengers/available-drivers/:rideId/requests`         | POST   | Create a ride request (passenger)              |
| `/api/passengers/requests`                         | GET    | Get a list of ride requests made by the passenger |
| `/api/passengers/requests/:requestId`              | GET    | Get details of a specific ride request made by the passenger |
| `/api/passengers/available-drivers/:rideId/requests/:requestId` | DELETE | Cancel a ride request (passenger)              |


## My Process

### Built With

- Node.js
- Express.js
- TypeScript
- MongoDB
- JSON Web Tokens (JWT) for authentication

### App Summary

#### User
- The user model is for 3 roles: admin, passenger, driver.
- If a user is not verified, prevent them from requesting or accepting rides. 
- An admin should be the one who verifies new users.

#### Vehicle
- A driver must have a vehicle. It should be created after the driver is created. Passengers should be prevented from creating a vehicle
- When a driver is created, ensure they have a vehicle or the driver will be prevented from accepting rides.
- A driver is allowed only one vehicle which they can modified if the need be. They can't delete their vehicle, simply create or update it.

#### Rides
##### Passengers
Should be allowed to:
- Find available drivers and create a request to a specific ride a driver has created
- View the kind of vehicle the driver is using for the ride
- Cancel their own request
- Prevented from marking ride as completed if ride hasn't even been accepted by driver
- Maybe view the first names of other passengers in the ride
- Bring others with them in the ride if there is enough seats available

##### Drivers
Should be able to:
- Create a ride where they can accept or cancel ride requests from passengers
- Get a list of requests passengers make to their ride
- Get the full request details of a request a passenger makes
- Change the availabilty of the vehicle


## Author

- Github - [Hikmah Yousuph](https://github.com/Hikmahx)
- Email - [hikmayousuph@gmail.com](hikmayousuph@gmail.com)
- LinkedIn - [Hikmah Yousuph](linkedin.com/in/hikmah-yousuph-449467204/)
