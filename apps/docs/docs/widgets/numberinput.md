# Number Input

accept user input

## General Properties

List of properties that can be updated through the inspector panel to customize the widget to your preferences and project needs.

You can type code nearly anywhere in Nilefy, and the following properties are no exception.

### placeholder `string | undefined`

sets placeholder text for the widget

### default value

sets what value the widget will start with if no value is provided

### min

sets min value for the input

### max

sets max value for the input

### Label

Sets the label of the widget.

- Accept `string`

## Events

events user could react to with custom logic

### onTextChanged

get triggred when value is modified

for more information on when this event will run [mdn](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/change_event)

### onFocus

when input get focused

for more information on when this event will run [mdn](https://developer.mozilla.org/en-US/docs/Web/API/Element/focus_event)

### onBlur

when input get blured

for more information on when this event will run [mdn](https://developer.mozilla.org/en-US/docs/Web/API/Element/blur_event)

## Setters

### `setValue`

sets the input value

- interface: `(value: string) => void`

### `setDisabled`

change disable state of the input

- interface: `(value: boolean) => void`

### `clearValue`

Clear input value

- interface `() => void`
