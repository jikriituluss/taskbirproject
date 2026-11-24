export default defineAppConfig({
  ui: {
    colors: {
      primary: 'indigo',
      neutral: 'slate'
    },
    select: {
      slots: {
        content: 'z-[70] min-w-(--reka-select-trigger-width) w-auto bg-white shadow-xl ring-1 ring-slate-200',
        viewport: 'p-1 divide-y-0',
        item: 'rounded-md text-slate-700 data-highlighted:not-data-disabled:text-indigo-700 data-highlighted:not-data-disabled:before:bg-indigo-50'
      }
    },
    selectMenu: {
      slots: {
        content: 'z-[70] min-w-(--reka-select-trigger-width) w-auto bg-white shadow-xl ring-1 ring-slate-200',
        viewport: 'p-1 divide-y-0',
        item: 'rounded-md text-slate-700 data-highlighted:not-data-disabled:text-indigo-700 data-highlighted:not-data-disabled:before:bg-indigo-50',
        input: 'border-b border-slate-200 bg-white'
      }
    },
    dropdownMenu: {
      slots: {
        content: 'z-[70] bg-white shadow-xl ring-1 ring-slate-200'
      }
    },
    popover: {
      slots: {
        content: 'z-[70] bg-white shadow-xl ring-1 ring-slate-200'
      }
    }
  }
})
