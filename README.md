[README.md](https://github.com/user-attachments/files/33960005/README.md)
# Data Flow Toggle – Camunda Modeler Plugin

Hide and show data flows in BPMN diagrams with a single button.

The button sits in the bottom-left corner of the diagram and toggles:

- data associations (input and output)
- data objects
- data stores

Your BPMN file is not changed. The plugin only changes what you see.

**Requirements:** Camunda Modeler 5.x (Camunda 7 or 8). No Node.js, npm or build step needed.

## Installation

1. Download the ZIP from the [Releases](../../releases) page and unzip it. You get a folder named `data-flow-toggle`.
2. Copy that folder into your plugins directory:

   | OS      | Plugins directory |
   |---------|-------------------|
   | macOS   | `~/Library/Application Support/camunda-modeler/resources/plugins/` |
   | Windows | `%APPDATA%\camunda-modeler\resources\plugins\` |
   | Linux   | `~/.config/camunda-modeler/resources/plugins/` |

   If `resources` or `plugins` doesn't exist yet, create it.

   - Correct: `plugins/data-flow-toggle/index.js`
   - Wrong: `plugins/data-flow-toggle/data-flow-toggle/index.js`

3. Quit Camunda Modeler completely and start it again.
4. Check that it loaded: **Help → Plugins** should list "Data Flow Toggle", and a "Hide data flows" button should appear in the bottom-left corner of a BPMN diagram.

## How it works

Each data element gets a CSS class once, when it is added to the diagram. The button only toggles one class on the canvas, and CSS does the hiding. Toggling never loops over the diagram elements, so it stays fast even on large diagrams.

## Customization

To hide only the arrows and keep data objects and data stores visible, delete the `'bpmn:DataObjectReference'` and `'bpmn:DataStoreReference'` lines in `client.js`, then restart Camunda Modeler.

## Uninstall

Delete the `data-flow-toggle` folder from your plugins directory and restart Camunda Modeler.
