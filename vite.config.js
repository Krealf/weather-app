export default {
  base: '/weather-app/',

  assetsInclude: ['**/*.woff2', '**/*.woff', '**/*.ttf'],
  build: {
    assetsDir: 'assets',
  },
  css: {
    devSourcemap: true, //Включаем Sourcemap для стилей
    preprocessorOptions: {
      scss: {
        sassOptions: {},
      },
    },
  },
}

