# React + TypeScript + Vite

## Attendance sessions

The Rob Cosman SFWW Showcase (`ev_8952588`) sells three sessions as Ticket
Tailor ticket types. It appears as three columns, labelled with the event name,
session name/time and date. Each booking is matched by `ticket_type_id`; each
column shows that session's issued count and capacity. CSV exports use the same
session columns and quote fields containing commas or quotation marks.

Events with separate sessions are listed in `SESSION_EVENT_IDS` in
`src/services/attendance.ts`. Add another event ID there when its ticket types
represent separate sessions. Other events retain one column, including events
with multiple price categories for the same activity.

Both event and ticket requests follow Ticket Tailor's pagination links through
the existing proxy. A failed request stops loading with an error so that an
incomplete booking list is not displayed as a complete summary.

Run `npm test` with Node.js 22.18+ to check session attendance, totals, CSV
escaping and pagination. Run `npm run build` and `npm run lint` for the frontend
checks. These frontend changes require a GitHub Pages deployment; the proxy
does not need an update.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
