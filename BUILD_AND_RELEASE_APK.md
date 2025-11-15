# Build and Release APK Guide

This guide provides step-by-step instructions for building a release-ready APK and uploading it to a GitHub release.

## Prerequisites

- You have a working Android development environment (Android Studio, JDK 17, etc.).
- You have a GitHub account and you have cloned this repository.

## 1. Build the APK

The first step is to build the release APK.

```bash
pnpm run android:build
```

This command will:

1.  Build the web app.
2.  Sync the web app with the Android project.
3.  Build the release APK.

The generated APK will be located in the `apps/web/android/app/build/outputs/apk/release` directory. The file will be named `app-release-unsigned.apk`.

## 2. Sign the APK

Before you can install the APK on a device, you need to sign it.

1.  **Generate a signing key:** If you don't already have a signing key, you can generate one using the `keytool` command that comes with the JDK.

    ```bash
    keytool -genkey -v -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
    ```

2.  **Sign the APK:** Use the `apksigner` tool that comes with the Android SDK to sign the APK.

    ```bash
    apksigner sign --ks my-release-key.keystore --out app-release.apk app-release-unsigned.apk
    ```

## 3. Create a GitHub Release

Now you can create a new GitHub release and upload the signed APK.

1.  Go to the "Releases" page of your GitHub repository.
2.  Click the "Draft a new release" button.
3.  Enter a tag for the release (e.g., `v1.1.0`).
4.  Enter a title and description for the release.
5.  Upload the signed `app-release.apk` file.
6.  Click the "Publish release" button.

## 4. Share the Release

Now you can share the link to the release with your users. They will be able to download and install the APK on their Android devices.
