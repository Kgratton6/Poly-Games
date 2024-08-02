# Poly Games

## Visit the Website

Visit the live version of the project [here](https://www.poly-games.online).

## Overview

Poly Games is an ongoing personal project aimed at developing a full-stack application where users can enjoy playing card games online. The project integrates both front-end and back-end technologies to create a seamless gaming experience, allowing multiple players to connect, play, and interact in real-time.

## 🌟 Features

- **Real-time Communication**: Implements WebSocket for real-time communication between players, ensuring instant updates and seamless interaction during gameplay.
- **Token-based Authentication**: Ensures secure login and session management for users, enhancing the overall security of the application.
- **Django and Angular**: Utilizes Django for the server-side logic and Angular for the client-side interface, providing a robust, responsive, and scalable website.
- **Deployment**: The client side is deployed on Vercel, and the server side is hosted on DigitalOcean.
- **Database**: SQL lite for users information and Redis for rapid interaction and real-time updates in games in process.

## 📸 Project Screenshots

### Uno game example
![Uno game](img/screenshot7.png)

### Blackjack game example
![Uno game](img/screenshot8.png)

### Home Page
![Home Page](img/screenshot1.png)

### Connection Page
![Connection Page](img/screenshot2.png)

### Creating an account Page
![Creating an Account Page](img/screenshot3.png)

### Active tables page
![Active tables](img/screenshot6.png)

## 🚀 Installation and Setup

To set up the project on your local machine, follow these steps:

1. **Clone the repository**

2. **Navigate to the server directory**:
   ```sh
   cd server
3. **Install the required packages**:
   ```sh
   pip install -r requirements.txt
4. **Apply the migrations to set up the database**:
   ```sh
   python manage.py makemigrations
   python manage.py migrate
5. **Run the server**:
   ```sh
   python manage.py runserver
6. **Navigate to the client directory**:
   ```sh
   cd client
7. **Install the required packages**:
   ```sh
   npm ci
8. **Run the client**:
   ```sh
   npm start
   
## 🛠️Technologies Used

<img  align="left" width="50" src="https://user-images.githubusercontent.com/25181517/183890595-779a7e64-3f43-4634-bad2-eceef4e80268.png" alt="Angular" title="Angular"/>
<img  align="left" width="50" src="https://user-images.githubusercontent.com/25181517/192158954-f88b5814-d510-4564-b285-dff7d6400dad.png" alt="HTML" title="HTML"/>
<img align="left"  width="50" src="https://user-images.githubusercontent.com/25181517/183898674-75a4a1b1-f960-4ea9-abcb-637170a00a75.png" alt="CSS" title="CSS"/>
<img  align="left" width="50" src="https://user-images.githubusercontent.com/25181517/183890598-19a0ac2d-e88a-4005-a8df-1ee36782fde1.png" alt="TypeScript" title="TypeScript"/>
<img align="left"  width="50" src="https://user-images.githubusercontent.com/25181517/183423507-c056a6f9-1ba8-4312-a350-19bcbc5a8697.png" alt="Python" title="Python"/>
<img align="left"  width="50" src="https://github.com/marwin1991/profile-technology-icons/assets/62091613/9bf5650b-e534-4eae-8a26-8379d076f3b4" alt="Django" title="Django"/>
<img align="left"  width="50" src="https://user-images.githubusercontent.com/25181517/182884894-d3fa6ee0-f2b4-4960-9961-64740f533f2a.png" alt="redis" title="redis"/>
<img align="left"  width="50" src="https://github.com/marwin1991/profile-technology-icons/assets/136815194/82df4543-236b-4e45-9604-5434e3faab17" alt="SQLite" title="SQLite"/>
<img  align="left" width="50" src="https://user-images.githubusercontent.com/25181517/183345125-9a7cd2e6-6ad6-436f-8490-44c903bef84c.png" alt="Nginx" title="Nginx"/>
