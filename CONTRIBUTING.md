**Note:** These are guidelines, please follow them for consistency. Have a discussion to change the guideline before using a different method.



## React

- **Hooks and functional components** over class components
- **Custom hooks** over mixins or high order components, but those may worth looking into in the future



## Tools

- **Yarn** over NPM - using both can cause issues. Yarn is recommended more so let’s use that.
- **Absolute path** over relative path - Absolute path is less confusing and more secure, and can be customized if we need to



## Folders:

- Everything goes to `src` for absolute path to work
- `components` for react components
- `hooks` for react hooks only, that start with use, and use react
- `functions` for general functions that don’t start with use, and don’t use anything from react
- `utils` for more complicated logics that may be a object containing several methods. An example would be an object handling API calls.



## Styling

- Still in debate…
- Some options worth considering:
	- styled components
	- scss modules
- But not frameworks like bootstrap and material ui, because they are too generic