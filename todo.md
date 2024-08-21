# TODO / bugs

- homescreen:
  - [x] html-droppable slots for the "icons"
  - [x] bottom bar with the start menu, hour, and chevron drawer with the linkedin and github icons
  - [x] add a button on the context menu to remove CRT styles (too much of it can be jarring)
  - [x] context menu of the items should have a "delete" option (moves it to the trash ?)
  - [x] icon on the taskbar
  - [ ] welcome window (maybe?)

- virtual state:
  - [x] the virtual state should have the default state and can be modified on the fly by the user (he can make watherver he wants, (move and delete files))
  - [x] the virtual state should be saved in the local storage
  - [x] the virtual state should be loaded from the local storage
  - [x] window to save current state and load from file, also an "reset" button that "factory reset" the app

- windows:
  - [x] the windows should be draggable and resizable
  - [x] the windows should have a close/minimize/maximize button
  - [x] the windows should have a title
  - [x] the windows should have a z-index
  - [x] the windows should have a shadow

- apps:
  - [x] implement a directory app
  - [ ] copy of ms paint [#1](https://github.com/FlavioZanoni/FlavioZanoni.com/issues/1)
  - [ ] calendar
  - [x] This Computer

- filesystem:
  - [x] create bin dir or apps dir to store the apps iNode (today they need to be in root or in another folder to open, they need a place to be registered on the fs)

- terminal:
  - [ ] implement rm command
  - [ ] implement a text editor
  - [ ] pipe and redirects (maybe?)
  - [ ] terminal history
  - [ ] terminal autocomplete
  - [ ] neofetch/fastfetch

- bugs:
  - [x] correctly use the terminal buffer instead of linecount

- misc:
  - [ ] boot sequence
  - [ ] shutdown sequence
  - [x] highlight app on focus on the taskbar
  - [x] organize default apps on state.json
  - [x] populate the menu popup
  - [x] change mouse cursor to a lower res one
  - [ ] auto-open windows with url param
