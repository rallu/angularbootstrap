# angularbootstrap

Bootstrap for starting angular projects fast. No automatic building of
packages. You are in control of your index.html and structure of your angular
application. This package just provides basic boilerplate for developing and
compressing your application in node.js env.

**Included packages:**

```
angular-route
angular-resource
angular-translate
```

## Using in your project

Create a project folder and then:

    $ git init
    $ git remote add -f angularbootstrap git@github.com:rallu/angularbootstrap.git
    $ git pull angularbootstrap master

If you want to change from default **myapp** name you need to change mainmodulename
variable in **config.json**

Remember to rename everything in package.json and bower.json to fit in your project.

## Developing

Starting development mode (serving from public_html folder) with browsersync
and nodemon

Before first use:

    $ npm install
    $ bower install

Then:
    $ gulp

## Releasing

Create compressed application in **release/** folder. Can be served pretty much
with everything. Though server needs to support angular html5mode.

    $ gulp release
