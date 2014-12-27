BBB Generator [![Build Status](https://secure.travis-ci.org/backbone-boilerplate/generator-bbb.png?branch=master)](https://travis-ci.org/backbone-boilerplate/generator-bbb)
====================================================================

The Backbone-Boilerplate generator works with Yeoman.

A generator is a tool that allow you to rapidly create files, modules and
automatically set up relationships between them. For example, the BBB generator
can scaffold a complete project structure. It can also create basic module
files and automatically link them to related unit test files. A generator will
help you being more productive and automize repetitive scaffolding tasks.


## Installation ##

```bash
npm install -g generator-bbb@latest
```

Note that the generator can also be installed locally if you want to keep
different versions on different project.

_Peer dependencies_: When installing the generator, NPM should install other
global dependencies used by the Boilerplate. If for some reason this didn't
work, you can run this command: `npm install -g yo grunt-cli bower`.

### Starting from Scratch. ###

``` bash
yo bbb:app [path]
```

Scaffolds out a new Backbone Boilerplate application.

The `path` parameter is optional and will default to the current working
directory.

### Include in an existing project. ###

``` bash
yo bbb:init
```

Initializes the generator configuration. This can allow you to use the
generator on an existing project or to [manually edit the configuration
file](#advanced-configuration) before scaffolding the full app.

### Create module. ###

``` bash
yo bbb:module <name>
```

Creates a single module and its related test.

If needed, name can specify a sub-directory too: `yo bbb:module views/list-item`

### Advanced configurations ###

For advanced use, you can customize the paths where you hold your application.
For this, just run `yo bbb:init` command, and then manually edit the generated
`.yo-rc.json` configs under the `generator-bbb` namespace.  Some options in this
file are not configured via the command line tool (for the sake of brevity).
Once the manual edit is done, just run `yo bbb` to scaffold the project.

Please note that changing paths manually in the `.yo-rc.json` file won't
update every config path in the multiple third party tools (e.g. Grunt and Bower). You'll
need to fix these manually for now - full built-in support should come sometime in the future.

## Development ##

### Install a development version ##

In order to work with the development version, you'll need to use [`npm-link`
functionality](https://npmjs.org/doc/link.html).

``` bash
# Clone into a folder named `generator-bbb`.
git clone https://github.com/backbone-boilerplate/generator-bbb.git

# Change into it.
cd generator-bbb

# Here you create a global link to `generator-bbb` which will be used by NPM.
npm link

# Now you can use it!
yo bbb my-project
```

License
------------------------------

[MIT License](http://en.wikipedia.org/wiki/MIT_License)
