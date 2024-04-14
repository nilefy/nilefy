import { Extension } from '@codemirror/state';
import { EditorView } from '@codemirror/view';

export const baseTheme: Extension = [
  EditorView.theme({
    '&': {
      fontSize: '14px',
      fontFamily: 'JetBrains Mono',
    },
    '.cm-scroller': { overflow: 'auto' },
    '.cm-content': {},
    '.cm-gutters': { border: 'none' },
    '.cm-foldMarker': {
      width: '12px',
      height: '12px',
      marginLeft: '8px',

      '&.folded': {
        transform: 'rotate(-90deg)',
      },
    },
    '.cm-foldPlaceholder': { background: 'transparent', border: 'none' },

    '.cm-tooltip': {
      maxWidth: '800px',
      zIndex: '999',
    },

    // Autocomplete
    '.cm-tooltip.cm-tooltip-autocomplete > ul': {
      minWidth: '250px',
    },
    '.cm-tooltip.cm-tooltip-autocomplete > ul > li': {
      display: 'flex',
      alignItems: 'center',
      padding: '2px',
    },
    '.cm-tooltip.cm-tooltip-autocomplete > ul > li[aria-selected]': {},
    '.cm-completionLabel': {}, // Unmatched text
    '.cm-completionMatchedText': {
      textDecoration: 'none',
      fontWeight: 600,
      color: '#00B4D4',
    },
    '.cm-completionDetail': {
      fontStyle: 'initial',
      color: '#ABABAB',
      marginLeft: '2rem',
    }, // Text to the right of tooltip
    '.cm-completionInfo': {}, // "Additional" text that shows up in a panel on the right of the tolltip

    '.cm-completionIcon': {
      padding: '0',
      marginRight: '4px',
      width: '16px',
      height: '16px',
      backgroundRepeat: 'no-repeat',
      // 'snippet' icon from https://code.visualstudio.com/docs/editor/intellisense#_types-of-completions
      // acts as a fallback icon
      backgroundImage:
        "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 16 16' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M2.5 1L2 1.5V13H3V2H14V13H15V1.5L14.5 1H2.5ZM2 15V14H3V15H2ZM5 14.0001H4V15.0001H5V14.0001ZM6 14.0001H7V15.0001H6V14.0001ZM9 14.0001H8V15.0001H9V14.0001ZM10 14.0001H11V15.0001H10V14.0001ZM15 15.0001V14.0001H14V15.0001H15ZM12 14.0001H13V15.0001H12V14.0001Z' fill='%23424242' /%3E%3C/svg%3E\")",
      '&:after': {
        content: "' '",
      },

      '&.cm-completionIcon-var, &.cm-completionIcon-let, &.cm-completionIcon-const':
        {
          // 'variable' icon from https://code.visualstudio.com/docs/editor/intellisense#_types-of-completions
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M1 4C1 3.72386 1.21614 3.5 1.48276 3.5H3.89655C4.16317 3.5 4.37931 3.72386 4.37931 4C4.37931 4.27614 4.16317 4.5 3.89655 4.5H1.96552V11.5H3.89655C4.16317 11.5 4.37931 11.7239 4.37931 12C4.37931 12.2761 4.16317 12.5 3.89655 12.5H1.48276C1.21614 12.5 1 12.2761 1 12V4ZM8.97252 4.57125C8.83764 4.48744 8.6718 4.47693 8.52807 4.54309L4.18324 6.5431C4.04909 6.60485 3.95163 6.72512 3.91384 6.86732C3.90234 6.91044 3.89668 6.95446 3.89655 6.9982L3.89655 7V9.5C3.89655 9.67563 3.98552 9.83839 4.13093 9.92875L6.53533 11.4229C6.60993 11.4718 6.69836 11.5001 6.79318 11.5001C6.86852 11.5001 6.93983 11.4823 7.00337 11.4504L11.334 9.45691C11.5083 9.37666 11.6207 9.1976 11.6207 9V6.51396C11.6227 6.44159 11.6094 6.36764 11.5792 6.29706C11.5404 6.20686 11.4791 6.13438 11.4052 6.0836C11.399 6.07935 11.3927 6.07523 11.3863 6.07125L8.97252 4.57125ZM10.0932 6.43389L8.69092 5.56245L5.42408 7.06623L6.8264 7.93767L10.0932 6.43389ZM4.86207 7.88317V9.21691L6.31042 10.117V8.78322L4.86207 7.88317ZM7.27594 10.2306L10.6552 8.67506V7.26954L7.27594 8.82506V10.2306ZM14.5172 12.5C14.7839 12.5 15 12.2761 15 12L15 4C15 3.72386 14.7839 3.5 14.5172 3.5H12.1034C11.8368 3.5 11.6207 3.72386 11.6207 4C11.6207 4.27614 11.8368 4.5 12.1034 4.5L14.0345 4.5L14.0345 11.5L12.1034 11.5C11.8368 11.5 11.6207 11.7239 11.6207 12C11.6207 12.2761 11.8368 12.5 12.1034 12.5H14.5172Z' fill='%23805AD5' /%3E%3C/svg%3E\")",
          '&:after': {
            content: "' '",
          },
        },

      '&.cm-completionIcon-function, &.cm-completionIcon-method': {
        // 'method' icon from https://code.visualstudio.com/docs/editor/intellisense#_types-of-completions
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath fill-rule='evenodd' d='M8 1C7.7033 1 7.41182 1.08255 7.15479 1.23938L7.15385 1.23995L2.84793 3.84401L2.84615 3.8451C2.58915 4.00214 2.37568 4.22795 2.22716 4.49987C2.07864 4.77179 2.0003 5.08077 2 5.39485V10.6056C2.0003 10.9197 2.07864 11.2282 2.22716 11.5001C2.37568 11.772 2.58915 11.9979 2.84615 12.1549L2.84794 12.156L7.15385 14.76L7.15466 14.7605C7.41173 14.9174 7.70325 15 8 15C8.29675 15 8.58828 14.9174 8.84534 14.7605L8.84615 14.76L13.1521 12.156L13.1538 12.1549C13.4109 11.9979 13.6243 11.772 13.7728 11.5001C13.9214 11.2282 13.9997 10.9192 14 10.6051V5.39435C13.9997 5.08027 13.9214 4.77179 13.7728 4.49987C13.6243 4.22795 13.4109 4.00214 13.1538 3.8451L8.84615 1.23995L8.84521 1.23938C8.58818 1.08255 8.2967 1 8 1ZM7.61538 2.086C7.73232 2.01455 7.86497 1.97693 8 1.97693C8.13503 1.97693 8.26768 2.01455 8.38461 2.086L12.6931 4.69163C12.6992 4.69534 12.7052 4.69914 12.7111 4.70302L7.99996 7.42924L3.28893 4.70303C3.29512 4.69898 3.30138 4.69502 3.30769 4.69115L7.61361 2.08709L7.61538 2.086ZM2.92308 5.64668V10.6049C2.92325 10.7476 2.95886 10.8877 3.02633 11.0112C3.0937 11.1346 3.19047 11.237 3.30698 11.3084L7.53857 13.8675V8.31761L2.92308 5.64668ZM8.46165 13.8674L12.6923 11.3089C12.8088 11.2375 12.9063 11.1346 12.9737 11.0112C13.0412 10.8876 13.0768 10.7474 13.0769 10.6046V5.6467L8.46165 8.31743V13.8674Z' fill='%23DD6B20' /%3E%3C/svg%3E\")",
        '&:after': {
          content: "' '",
        },
      },
      '&.cm-completionIcon-property, &.cm-completionIcon-getter': {
        // 'field' icon from https://code.visualstudio.com/docs/editor/intellisense#_types-of-completions
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 16 16' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M1 6.39443L1.55279 5.5L8.55279 2H9.44721L14.4472 4.5L15 5.39443V9.89443L14.4472 10.7889L7.44721 14.2889H6.55279L1.55279 11.7889L1 10.8944V6.39443ZM6.5 13.1444L2 10.8944V7.17094L6.5 9.21639V13.1444ZM7.5 13.1444L14 9.89443V6.17954L7.5 9.21287V13.1444ZM9 2.89443L2.33728 6.22579L6.99725 8.34396L13.6706 5.22973L9 2.89443Z' fill='%23805AD5' /%3E%3C/svg%3E\")",
        '&:after': {
          content: "' '",
        },
      },

      '&.cm-completionIcon-enum, &.cm-completionIcon-enum-member, &.cm-completionIcon-string':
        {
          // 'constant' icon from https://code.visualstudio.com/docs/editor/intellisense#_types-of-completions
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 16 16' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M4.00024 6H12.0002V7H4.00024V6ZM12.0002 9H4.00024V10H12.0002V9Z' fill='%23424242' /%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M1.00024 4L2.00024 3H14.0002L15.0002 4V12L14.0002 13H2.00024L1.00024 12V4ZM2.00024 4V12H14.0002V4H2.00024Z' fill='%23424242' /%3E%3C/svg%3E\")",
          '&:after': {
            content: "' '",
          },
        },
      '&.cm-completionIcon-keyword': {
        // 'keyword' icon from https://code.visualstudio.com/docs/editor/intellisense#_types-of-completions
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 16 16' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M15 4H10V3H15V4ZM14 7H12V8H14V7ZM10 7H1V8H10V7ZM12 13H1V14H12V13ZM7 10H1V11H7V10ZM15 10H10V11H15V10ZM8 2V5H1V2H8ZM7 3H2V4H7V3Z' fill='%23424242' /%3E%3C/svg%3E\")",
        '&:after': {
          content: "' '",
        },
      },
      '&.cm-completionIcon-class, &.cm-completionIcon-interface, &.cm-completionIcon-alias':
        {
          // 'class' icon from https://code.visualstudio.com/docs/editor/intellisense#_types-of-completions
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 16 16' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M3.35356 6.64642L2.06066 5.35353L5.35356 2.06065L6.64645 3.35354L3.35356 6.64642ZM5 1L1 4.99998V5.70708L3 7.70707H3.70711L4.85355 6.56063V12.3535L5.35355 12.8535H10.0097V13.3741L11.343 14.7074H12.0501L14.7168 12.0407V11.3336L13.3835 10.0003H12.6763L10.8231 11.8535H5.85355V7.89355H10.0097V8.37401L11.343 9.70734H12.0501L14.7168 7.04068V6.33357L13.3835 5.00024H12.6763L10.863 6.81356H5.85355V5.56064L7.70711 3.70709V2.99999L5.70711 1H5ZM11.0703 8.02046L11.6966 8.64668L13.6561 6.68713L13.0299 6.0609L11.0703 8.02046ZM11.0703 13.0205L11.6966 13.6467L13.6561 11.6872L13.0299 11.061L11.0703 13.0205Z' fill='%23DD6B20' /%3E%3C/svg%3E\")",
          '&:after': {
            content: "' '",
          },
        },
    },

    // Diagnostics (Lint issues) & Quickinfo (Hover tooltips)
    '.cm-diagnostic, .cm-quickinfo-tooltip': {
      padding: '0.5rem',
      fontFamily: 'JetBrains Mono',
    },
  }),
];
