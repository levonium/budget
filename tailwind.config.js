module.exports = {
  purge: {
    enabled: true,
    content: [
      './index.html',
      './src/app.js',
    ]
  },
  theme: {
    extend: {
      screens: {
        'dark': {'raw': '(prefers-color-scheme: dark)'},
      },
      fontFamily: {
        mono: '"Fira Code", monospace'
      }
    },
  },
  variants: {},
  plugins: [],
}
