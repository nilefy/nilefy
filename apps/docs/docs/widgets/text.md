# Text

**Text string** 

Sets the text to be displayed. The text remains unchanged until manually updated or edited.

You can dynamically change text by fetching data from queries or JS functions and binding the response to the Text property. For instance, when a row in a Table widget is clicked, the Text widget dynamically displays the specific name associated with that row.

Example:

`{{Table1.selectedRow.name}}`

You have the option to use HTML code within the Text property to customize the appearance of the displayed text. Note that the Text field supports only inline CSS.

Example:

`<p style="color:blue;">Hello World</p>`

This code displays the text Hello World in blue color.

![Alt text](./img/textExample2.png)

Moreover You have the option to use Mark Down within the Text property to customize the appearance of the displayed text.

Example:

```md
# Hello World

* Hi
```

This code displays the text as follows.

![Alt text](./img/textExample1.png)

## Instance Properties

These are properties that can be accessed using the dot operator from any widget instance, in any place you can type code, such as other widget properties or in JS queries.

### text `string`

holds current `text` value of the widget

## Setters - Methods

A list of methods that can be called on the widget instance to control the widget programmatically.

### setDisabled 

Sets the checkbox's disabled state.

- interface: `(disabled: boolean) => void`

### setText

Sets the textWidget's text value

- interface: `(text: string) => void`

### clearText

clears widget text

- interface: `() => void`
