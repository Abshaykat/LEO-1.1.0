# L.E.O. Mobile App

This is the installable mobile PWA owner console.

It never executes PC commands itself. It sends authenticated requests to the L.E.O. Cloud Relay, which forwards them to the owner PC. The PC then runs the normal L.E.O. permission, approval, execution, verification and audit pipeline.

Configure the Cloud WebSocket URL, private Device ID, and the same strong Remote Token on the phone and PC.

For a native Android APK later, this PWA protocol can be wrapped by a standard Android WebView/Capacitor shell without changing the command protocol.
