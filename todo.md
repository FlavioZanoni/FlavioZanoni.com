TODO:

- homescreen:

  - [ x ] html-droppable slots for the "icons"
  - [ x ] bottom bar with the start menu, hour, and chevron drawer with the linkedin and github icons
  - [ x ] add a button on the context menu to remove CRT styles (too much of it can be jarring)
  - [ ] context menu of the items should have a "delete" option (moves it to the trash ?)

- virtual state:

  - [ x ] the virtual state should have the default state and can be modified on the fly by the user (he can make watherver he wants, (move and delete files))
  - [ x ] the virtual state should be saved in the local storage
  - [ x ] the virtual state should be loaded from the local storage
  - [ ] implement rm command with the flag -rf

- windows:

  - [ x ] the windows should be draggable and resizable
  - [ x ] the windows should have a close/minimize/maximize button
  - [ x ] the windows should have a title
  - [ x ] the windows should have a z-index
  - [ x ] the windows should have a shadow

  - window content
    - the window component will be the multi-page handler, it can basically render anything, from astro islands to .md files
