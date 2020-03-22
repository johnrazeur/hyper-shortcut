<p align="center">
    <img src="https://raw.githubusercontent.com/johnrazeur/hyper-shortcut/master/images/header.png" width=1000/>
</p>

# Hyper-shortcut

## Example

Create at the root folder of your workpace a folder named `templates`.
Define a shortcut template, for example create a `createController.tpl` file:

```php
<?php

class {{name}}Controller
{
    // {{testInput}}
}
```

Template file are interpreted using [Mustache](https://github.com/janl/mustache.js/), so you have access to all of the mustache syntax.

Create a file named `hyper-shortcut.json` at the root folder of your namespace with the following data:

```json
{
    "templatesPath": "templates",
    "shortcuts": [{
        "group": "Create",
        "name": "Controller (API)",
        "type": "create",
        "path": "{{name}}.php",
        "template": "createApiController", 
        "actions": {
            "type": "input",
            "name": "testInput",
            "prompt": "Test of the input"
        },      
    }
}
```

When type is `create`, Hyper-Shorcut will prompt an input box asking the name of the file to the user. The name file is store in the variable `name` and you can use it in the template and in the `path` attribute of `hyper-shortcut.json`.

Actions is a list of variables the user must specifies. Result is store in the `name` variable, you can use it in the template file.
Type must be `input`or `quickPick`. If type is `quickPick`, you must provide an `items` ( array of string ) of the possible values of the action.


## Configuration

You must create a file named `hyper-shortcut.json` at the root of your workspace.

| Name  	        | Type   	     | Description   	                    |
|---	            |---	         |---	                                |
| templatesPath  	| string  	     | Where template files are stored.   	|
| shortcuts         | Shortcut[]     | List of shortcuts.                   |

### Shortcut

| Name  	    | Type   	| Description   	                                                              |
|---	        |---	    |---	                                                                          |
| group  	    | string  	| Group name of the shortcut. The view group shortcuts by their groups name.  	  |
| name          | string    | Name of the shortcut.                                                           |
| type          | string    | Type of insertion. Must be `create` or `insert`.                                |
| path          | string    | Path where the file is created when type is `create`.                           |
| template      | string    | Template file of the shortcut in the `̀templatesPath` folder.                    |
| info          | string    | Template file of the info. Info are displayed in readonly beside active editor. |
| actions       | Action[]  | List of actions. Action ask user the value of a variable.                       |

### Action

| Name  	| Type   	| Description   	                                    |
|---	    |---	    |---	                                                |
| type  	| string  	| Type of the action. Muse be `input` or `quickPick`. 	|
| name      | string    | Name of the variable.                                 |
| prompt    | string    | Text displayed in the input box.                      |
| items     | string[]  | List of choice if `type` is `quickPick`.              |