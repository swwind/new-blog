const config = {
  database: {
    address: 'mongodb://localhost:27017/',
    db: 'blog'
  },
  port: 3000,
  favicon: null, // local file path
  avatar: '/avatar.jpg', // http/https url
  title: 'swwind\'s blog',
  subtitle: '何も後悔なんてないさ',
  footer: [
    'Copyright © 2017-2020 swwind. All rights reversed.',
    'Except where otherwise noted, content on this blog is licensed under CC-BY 2.0.'
  ],
  url: 'http://localhost:3000', // no slash at the end of url
  https: { // enabled if port === 443
    hsts: true, // listen to 80 for 302
    cert: './fullchain.pem',
    key: './privkey.pem'
  },
  language: 'zh-CN',
  components: {
    title: true,
    categories: true,
    tags: true,
    replies: true
  },
  meta: {
    themeColor: '#FFFFFF'
  },
  page: {
    size: 5
  },
  reply: {
    enableMarkdownSupport: true
  },
  allowedOrigins: [
    'http://blog.swwind.me'
  ],
  plugins: {
    gallery: {
      enabled: false,
      mountPoint: '/projects',
      title: 'Projects'
    },
    'rss-feed': {
      enabled: true
    },
    'navigation-sound': {
      enabled: false,
      audioURL: '/Windows%20Navigation%20Start.aac'
    },
    'telegram-helper': {
      enabled: false,
      ownerId: null,
      telegramBotToken: null
    }
  }
};

module.exports = config;
