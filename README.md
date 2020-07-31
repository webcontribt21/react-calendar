# React Calendar App

Welcome to the frontend app.

# Code Standards

## Stack

- React 16.9.x
- Webpack 5.x

## Methodology

- Use of `ES6/7/8` is prefered through out the entire code repository.

- Try to avoid for loop syntax if there's a better way to do it with `map, filter, reduce`, etc... `lambda style`.

- Heavy use of `React hooks`, meaning that there are no React components unless we're dealing with Error Boundaries, in such case there's no way around it.

- Use of JS classes to create factories, and complex functionality is permitted, but should be limited to just few cases.

- The use of `pure functions` is encouraged, and the correct (sometimes wise) use of memoized functions/properties is highly encouraged, with the use of `useMemo` and `useCallback`.

- When importing packages, we need to ask ourselves, do we really need it? Are there alternatives that are lightweight? And if required, perform a profiling test before and after using library(ies) with file size deltas.

- Perform lazy loading of components when neede, using `import` for packages, `React.lazy` for components.

# Dependencies

There are really few dependencies that needs to be part of your environment.

## node & yarn

Install yarn using Homebrew, which will install `node.js` if it's not installed yet.

`brew install yarn`

You could also install vis installation script as follows:

`curl -o- -L https://yarnpkg.com/install.sh | bash`

For more information go to: <https://yarnpkg.com>

# Env file

Use `.env.example` file to generate your own `.env` file. This will be your main environment variables files for both dev and production modes, unless you create a `.env.development` file, which will instead use this when in dev mode.

# Commands

To install packages do a `$yarn` or `$yarn install` in order to install dependencies for frontend app.

`$yarn install`

To build for production do a build:production.

`$yarn build:production`

To build for staging do a build:staging.

`$yarn build:staging`

To test in dev mode just start application. It will open port 8000.

`$yarn dev`

# Distribution files

Once you run `$yarn build:production` or `$yarn build:staging` you will get a untracked git folder called `dist` which will contain all the necessary files to run the app. Normally you wouldn't care for these files, since Gitlab should be handling the processing of the distribution files and upload them to AWS.
