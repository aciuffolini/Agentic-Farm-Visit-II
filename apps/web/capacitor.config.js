/**
 * Capacitor Configuration
 * Android-first setup with sensor permissions
 */
var config = {
    appId: 'com.farmvisit.app',
    appName: 'Farm Visit',
    webDir: 'dist',
    server: {
        androidScheme: 'https',
        cleartext: true, // For local development
    },
    plugins: {
        Camera: {
            permissions: {
                camera: 'Camera access required to capture field photos',
            },
        },
        Geolocation: {
            permissions: {
                coarseLocation: 'Location access required for GPS tracking',
                fineLocation: 'Precise location access required for accurate field mapping',
            },
        },
        SplashScreen: {
            launchShowDuration: 2000,
            launchAutoHide: true,
            backgroundColor: '#ffffff',
            androidSplashResourceName: 'splash',
            androidScaleType: 'CENTER_CROP',
        },
        StatusBar: {
            style: 'dark',
            backgroundColor: '#ffffff',
        },
    },
};
export default config;
