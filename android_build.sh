#!/bin/bash
set -e

echo "Cleaning up previous build artifacts..."
rm -rf node_modules/.cache
rm -rf android/app/build

# echo "Installing dependencies..."
# npm install

echo "Cleaning Android build..."
cd android && ./gradlew clean
./gradlew assembleDebug --stacktrace


echo "Running Android app..."
cd .. && npx expo run:android

echo "✅ Build completed successfully!"