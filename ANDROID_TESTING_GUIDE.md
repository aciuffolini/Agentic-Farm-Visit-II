# Android Testing Guide

This guide provides step-by-step instructions for setting up your local development environment and testing the Farm Visit App on an Android device.

## Prerequisites

- You have a working Android development environment (Android Studio, JDK 17, etc.).
- You have Docker and Docker Compose installed on your development machine.
- Your Android device and your development machine are connected to the same Wi-Fi network.

## 1. Start the Backend Server

The first step is to start the backend server and the Ollama service using Docker Compose.

```bash
docker-compose up -d
```

This command will start the services in detached mode, so you can continue to use your terminal.

## 2. Find Your Local IP Address

You need to find the local IP address of your development machine so that your Android device can connect to it.

**On macOS or Linux:**

```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**On Windows:**

```bash
ipconfig | findstr /i "ipv4"
```

Look for an address that starts with `192.168.` or `10.0.`.

## 3. Configure the Frontend

Now you need to configure the frontend to use your local IP address to connect to the backend server.

1.  Open the `apps/web/.env` file.
2.  Change the `VITE_API_URL` to use your local IP address. For example:

    ```
    VITE_API_URL=http://192.168.1.100:3000
    ```

## 4. Build and Run the App on Your Android Device

Now you can build and run the app on your Android device.

```bash
pnpm run android:dev
```

This command will:

1.  Build the web app.
2.  Sync the web app with the Android project.
3.  Run the app on your connected Android device.

## 5. Testing

Once the app is running on your device, you should be able to use the chat feature. The chat requests will be sent to your local backend server, which will then route them to the appropriate LLM provider.

## Troubleshooting

- **"Cannot connect to API server" error:** Make sure that your Android device and your development machine are on the same Wi-Fi network.
- **"404 Not Found" error:** Make sure that the `VITE_API_URL` in your `.env` file is correct and includes the `http://` prefix.
- **Docker errors:** Make sure that Docker and Docker Compose are running correctly on your development machine.
