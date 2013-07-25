BBB Generator [![Build Status](https://secure.travis-ci.org/SBoudrias/generator.png?branch=master)](https://travis-ci.org/backbone-boilerplate/generator)
====================================================================

The Backbone-Boilerplate generator working on top of Yeoman.

A generator is a tool that allow you to rapidly create files, modules and automatically setup
relationship between them. For example, the BBB generator can scaffhold a complete project
structure. It can also create basic modules files and automatically link them to related
unit test files. A generator will help you being more productive and automize repetitive
scaffholding tasks.


Installation
------------------------------

- Install the generator: `npm install -g generator-bbb@0.2`

Note that the generator can also be installed locally if you want to keep different versions
on different project.

_Peer dependencies_: When installing the generator, NPM should install other global dependencies
used by the Boilerplate. If for some reason this didn't work, you can run this command:
`npm install -g yo bower grunt-cli jamjs`.

### Starting from Scratch? (`bbb:app`)

Run `yo bbb myApp/` to start the default scaffolding.

The `path` parameter is optionnal and will default to the current working directory. The
path can be absolute.


### Include in an existing project and advanced use (`bbb:init`)

Run `yo bbb:init` to initialize the generator configuration. This can allow you to use
the generator on an existing project., or to [manually edit the configuration file](#advanced-configuration) before scaffolding the full app.


### Create module (`bbb:app`)

Run `yo bbb:module <name>` to create a single module and its related test.

If needed, you can specify a sub-directory too: `yo bbb:module views/list-item`

You can also force the module style if you want to use another style than the default one
in your project by passing `--amd` or `--cjs` style.


### Advanced configurations

For advanced use, you can customize the paths where you hold your application. For this,
just run `yo bbb:init` command, and then manually edit the generated `.bbb-rc.json` configs.
Some options in this file are not configured via the command line tool (for the sake of
brievety). Once the manual edit is done, just run `yo bbb` to scaffhold the project.

Please note that changing paths manually in the `.bbb-rc.json` file won't update every
config path in the multiple third party tools (e.g. Grunt, Bower, Jam). You'll need to fix
these manually for now - full built-in support should come sometime in the future.


Developpement
------------------------------

### Install a developpement version

In order to work with the developpement version, you'll need to use [`npm-link` functionnality](https://npmjs.org/doc/link.html).

``` bash
# First, clone the project from Github
cd install/dir
git clone repo/generator-bbb.git .

# Then install the dependencies manually
npm install

# Here you create a global link to `generator-bbb` which will be use by NPM
# This will allow you to use the local module from NPM
npm link

# Then... use it!
cd dir/to/use/as/target
npm install generator-bbb
yo bbb # or any BBB generator options
```


License
------------------------------

[MIT License](http://en.wikipedia.org/wiki/MIT_License)
