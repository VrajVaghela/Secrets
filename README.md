# Secrets App

## Introduction
The Secrets App is a web application that allows users to share their secrets anonymously. It is built using Node.js, Express, MongoDB, and EJS.

## Features
- User authentication with Google OAuth 2.0
- Secure password storage with bcrypt
- Anonymous secret sharing
- Responsive design

## Installation
1. Clone the repository:
    ```bash
    git clone https://github.com/yourusername/secrets-app.git
    ```
2. Navigate to the project directory:
    ```bash
    cd secrets-app
    ```
3. Install the dependencies:
    ```bash
    npm install
    ```

## Usage
1. Create a `.env` file in the root directory and add your environment variables:
    ```
    PORT=3000
    MONGODB_URI=your_mongodb_uri
    GOOGLE_CLIENT_ID=your_google_client_id
    GOOGLE_CLIENT_SECRET=your_google_client_secret
    SESSION_SECRET=your_session_secret
    ```
2. Start the application:
    ```bash
    npm start
    ```
3. Open your browser and go to `http://localhost:3000`.

## Contributing
Contributions are welcome! Please open an issue or submit a pull request.