# TODO

- [x] ~~Check the component for the "All brands" and "Any ROM count" buttons. They don't feel very polished. Make sure to use shadcn as much as possible.~~
      Retired: those were native `<select>`s in `DevicesDirectory.tsx`, removed in
      `40b9ba3` when devices moved to search + A–Z letter pages. Search is the
      filtering path now, so there is no component left to polish.
- [ ] Grow indexable content by adding source-backed device data for ROMs that
      currently have none. Deferred: this needs one adapter per ROM, and many
      catalogue entries have no usable public device list.
