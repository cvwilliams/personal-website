# [Cameron's Personal Website](https://cameronwillia.ms)

This is the source for my personal website which can be found [here](https://cameronwillia.ms). It is built using Hugo, Bootstrap 4, Gulp and uses Travis CI to deploy to firebase hosting. Feel free to fork this repo or use it as an example for another website.

## Getting Started

These instructions will get you started with a local instace of the website for development and testing purposes. 

### Prerequisites

You will need to have hugo, node, and npm installed on your machine. Links to installion instructions can be found below

* [Hugo](https://gohugo.io/getting-started/installing/)
* [Node.js & NPM](https://nodejs.org/en/download/package-manager/)

### Installing

Begin by cloning the repo onto your local environment and change into the project directory

```
git clone https://github.com/cvwilliams/personal-website.git;
cd personal-website
```

Install all the necessary dependencies by running the install command

```
npm install
```

In order to start development mode (local live-reload server) run

```
npm run dev
```

In order to make a development (includes non-minified files with sourcemaps) build run

```
npm run build:dev
```

In order to make a production build run

```
npm run build:prod
```

After a build, the static files while be generated and placed in the public folder

## Running the linters

Run the linting task prior to deploying any changes

```
npm test
```

The definition of the rulesets can be found in the following:
* [SCSS Linting](.sass-lint.yml)
* [HTML Linting](.htmlhintrc)
* [JS Linting](https://standardjs.com/rules.html)

## Deployment

I use Travis CI to deploy to Firebase Hosting on any commit to the master branch. The Firebase CLI does allow local deployments as well. For instructions on getting started visit the [firebase documentation](https://firebase.google.com/docs/hosting/)

## Built With

* [Hugo](https://gohugo.io/) - A static site generator
* [SCSS](http://sass-lang.com/) - A CSS preprocessor
* [Gulp.js](https://gulpjs.com/) - A build tool which runs on node
* [Bootsrap 4](https://getbootstrap.com/) - A CSS/JS library

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

## Acknowledgments

* Thanks to [Start Bootsrap](https://startbootstrap.com/template-overviews/resume/) for providing the basis of the website
