# InfiniteLoopers Nutritional Search App

The InfiniteLoopers Nutritional Search App is an AI-powered mobile application that allows users to search for food items and receive nutritional information. Using advanced image recognition and natural language processing, the app provides users with comprehensive nutritional data to make informed choices. For more details, refer to our [wiki pages](https://github.com/SCCapstone/InfiniteLoopers/wiki).

This Readme is designed for developers joining the team, with all the necessary instructions to install, compile, run, and test the application. This document is also useful for re-installing everything if you need to start fresh, as well as for teachers assessing the project.

## External Requirements

To build and run this project, you need to install the following:

-   [Node.js](https://nodejs.org/en/) - Use the following commands to install:
    ```bash
    # macOS
    brew install node
    # Windows (PowerShell)
    choco install nodejs
    ```
-   [Expo CLI](https://expo.dev/) - Install with:
    ```bash
    npm install -g expo-cli
    ```

Note: The instructions above are for macOS and Windows users. Additional dependencies are listed in the `package.json` file and will be installed during the setup process.

## Setup

After cloning the repository, follow these one-time setup steps:

1. Clone the repository:
   ```bash
   git clone https://github.com/SCCapstone/InfiniteLoopers.git
   cd InfiniteLoopers
   ```

2. Install project dependencies:
   ```bash
   npm install
   ```

3. Set up any required configuration files (e.g., `.env` files if sensitive data like API keys is required). Instructions for configuration can be found in our [wiki](https://github.com/SCCapstone/InfiniteLoopers/wiki).

## Running

To run the app locally:

1. Start the Expo development server:
   ```bash
   expo start
   ```
2. Open the app in your preferred simulator:
   - For Android: Use an Android emulator or Expo Go on a physical Android device.
   - For iOS (macOS only): Use the iOS simulator or Expo Go on a physical iPhone.

## Deployment

To deploy the mobile app:

1. **Build a release version** for production:
   ```bash
   expo build:android   # For Android APK
   expo build:ios       # For iOS IPA (requires macOS and Apple Developer account)
   ```
2. Follow the Expo deployment instructions to distribute the app to end-users. [Expo documentation](https://docs.expo.dev/)

## Code Style Guide

To maintain a consistent code style across the team, we are following the [Google JavaScript Style Guide](https://google.github.io/styleguide/jsguide.html).

We recommend using an automatic code formatter to ensure consistency without extra effort. Use [Prettier](https://prettier.io/) or any code formatter supported by your IDE. To install Prettier, run the following command:
   ```bash
   npm install --save-dev prettier
   ```

### Setting Up Prettier

1. Configure Prettier to format your code automatically on save.
2. For VS Code users, you can add the following settings to `settings.json`:
   ```json
   {
      "editor.formatOnSave": true,
      "prettier.singleQuote": true,
      "prettier.trailingComma": "all"
   }
   ```

## Testing

### Running Tests

The project includes unit and behavioral tests located in the `tests` folder. To run the tests, follow these steps:

1. Install the testing dependencies:
   ```bash
   npm install --save-dev jest @testing-library/react-native
   ```
2. Run all tests:
   ```bash
   npm test
   ```

### Test Directory

All test files are stored in the `tests` directory. The primary test files include:

- **Unit Tests:** Located in `tests/unit/`
  - `utils.test.js`
  - `Colors.test.ts`
  - `auth.test.ts`
- **Behavioral Tests:** Located in `tests/ui/`
  - `Button.test.jsx`
  - `SearchFood.test.jsx`
  - `SignIn.test.jsx`

To run specific tests, use the filename pattern with Jest:
```bash
npm test -- tests/unit/utils.test.js
npm test -- tests/ui/Button.test.jsx
```

### Testing Video Submission

To complete the testing submission, do the following:

1. Record a video demonstrating test execution:
   - Run `npm test` in your terminal.
   - Show passing tests in the terminal.
   - Optionally, explain the test results in the video.

2. Create an **Issue** in the GitHub repository:
   - Title: `Testing Video`
   - Attach the recorded video (or provide a link).

### Tagging the Commit

After finalizing and committing your test implementation, create a git tag:
```bash
git tag v0.2
git push --tags
```

## Authors

- Kaidi Lyu - [klyu@email.sc.edu](mailto:klyu@email.sc.edu)
- Yingdong Feng - [yingdong@email.sc.edu](mailto:yingdong@email.sc.edu)
- Kiran Chhetri - [chhetrik@email.sc.edu](mailto:chhetrik@email.sc.edu)
- Andrew Dhillon - [dhillons@email.sc.edu](mailto:dhillons@email.sc.edu)
- Logan Munn - [ljmunn@email.sc.edu](mailto:ljmunn@email.sc.edu)
- [InfiniteLoopersMerge]

