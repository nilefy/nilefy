# Radio Group

widget that allows users to select one option from a predefined set of choices.

## General Properties

List of properties that can be updated through the inspector panel to customize the widget to your preferences and project needs.

You can type code nearly anywhere in Nilefy, and the following properties are no exception.

### Label

Sets the label of the checkbox.

- Accept `string`

### Options

control radio widget options

- Accepts `{label: sring; value: string}[]`

- options example 

```ts
{{
    [
        {"value":"Option 1","label":"Option 1"},
        {"value":"Option 2","label":"Option 2"},
        {"value":"Option 3","label":"Option 3"}
    ]
}}
```

- example of options from JS query

```ts
{{jsQuery1.data.map(v => ({value: v.value.toString(), label: v.value.toString()}))}}
```

### Disabled

Controls if the checkbox should be disabled.

- Accepts `boolean`

## Events

Events users can react to with custom logic.

### onChange 

Gets triggered when the radio selection changes.

example 

```ts
{{NilefyGlobals.alert("radio selection changed")}}
```

## Instance Properties

These are properties that can be accessed using the dot operator from any widget instance, in any place you can type code, such as other widget properties or in JS queries.

### value `string`

holds the radio widget current value

## Setters - Methods

A list of methods that can be called on the button widget instance to control the widget programmatically.

### setOptions

set the radio group options programmatically

- interface: `(options: array<{value: string; label: string;}>) => void`

### setDisabled 

Sets the radio's disabled state.

- interface: `(disabled: boolean) => void`
