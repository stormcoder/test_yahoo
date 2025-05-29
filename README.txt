You can execute tests in a few ways:

Using ts-node (which is already in your dependencies):

npx ts-node src/your-file.ts

Or compile and run:
# Compile TypeScript to JavaScript
npx tsc
# Run the compiled JavaScript
node dist/your-file.js

For running tests specifically, you can add scripts to your package.json

{
  "scripts": {
    "test": "cucumber-js",
    "build": "tsc",
    "start": "ts-node src/your-file.ts"
  }
}

Then run them using:
npm run build  # to compile
npm run test   # to run tests
npm run start  # to run your main file

