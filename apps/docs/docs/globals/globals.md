Nilefy globals are a set of properties and methods that are considered global to the entire application, things like the current user or the current theme.


# Properties

## currentUser

The current user name.

- Type: `string`

## currentPageName

The current page name.

- Type: `string`


# Methods

## alert

Displays an alert dialog with the specified message.

- Parameters:
  - `message`: The message to display.
    - Type: `string`
    - Required: `true`
    - Default: `undefined`
  - `variant`: The alert variant.
    - Type: `default | destructive`
    - default: `default`
    - Required: `false`


## navigateTo

Navigates to the specified page.

- Parameters:
  - `handle`: The page to navigate to.
    - Type: `string`
    - Required: `true`
  - `external`: Whether the specified page is external or internal to the application.
    - Type: `boolean`
    - Required: `false`
    - Default: `false`
  