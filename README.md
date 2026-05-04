# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## EAS build and submit

This project already has EAS profiles configured in `eas.json`.

- `development`: development client build for local testing
- `preview`: internal distribution build
- `preview-testflight`: store-style iOS build for TestFlight upload
- `production`: production build

Before the first release, make sure you are logged in to Expo and that App Store Connect / Google Play credentials are configured.

```bash
eas login
```

### 1. Update version

Before creating a release build, update the app version in `app.json`.

```json
{
  "expo": {
    "version": "1.0.8"
  }
}
```

If you also manage native build numbers, update those values as part of the release process.

### 2. Create a build

For a development client:

```bash
eas build --profile development --platform ios
```

For an internal preview build:

```bash
eas build --profile preview --platform ios
```

For a TestFlight-ready iOS build:

```bash
eas build --profile preview-testflight --platform ios
```

For a production build:

```bash
eas build --profile production --platform ios
```

If you need Android instead, replace `ios` with `android`.

### 3. Submit the build

After the build succeeds, submit it with EAS:

```bash
eas submit --profile production --platform ios
```

You can also submit Android builds the same way:

```bash
eas submit --profile production --platform android
```

### 4. Recommended release flow

1. Update `app.json` version.
2. Commit release-related changes.
3. Run a store-ready build with `preview-testflight` or `production`.
4. Verify the uploaded build in App Store Connect or Google Play Console.
5. Run `eas submit` if you want Expo to handle the upload step.
6. Complete release notes, review, and rollout in the store console.

### Useful commands

```bash
eas build:list
eas submit --latest --platform ios
eas credentials
```

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
