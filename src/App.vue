<template lang="pug">
  div#app
    #left
      div#left-wrapper
        router-view(name="sidebar")
    #right
      keep-alive
        transition(name="forward")
          router-view(v-if="$route.meta.keepAlive")
      transition(name="forward")
        router-view(v-if="!$route.meta.keepAlive")
      footer
        div.row(v-for="line in footer", v-text="line")
    #progress-bar(v-bind:style="{ width: `${progressBarAnimeLength}vw`}", v-bind:class="{ updating: busy && progressBarUpdating, finishing: (!busy) && progressBarUpdating }")
</template>

<script>
import LoadingIcon from './components/LoadingIcon.vue';
import config from './config.json';

export default {
  name: 'App',
  components: {
    LoadingIcon
  },
  data () {
    return {
      transitionName: 'forward',
      lastScrollY: null,
      footer: config.footer,
      progressBarAnimeId: null,
      progressBarAnimeLength: 0,
      progressBarUpdating: false
    };
  },
  openGraph () {
    const og = {
      site_name: config.title,
      type: 'website',
      url: config.url + this.$router.resolve(this.$router.currentRoute).href
    };

    return og;
  },
  computed: {
    busy: function () { return this.$store.state.busy; },
    path: function () { return this.$router.resolve(this.$router.currentRoute).href; }
  },

  watch: {
    $route: function () {
      if (typeof document !== 'undefined') {
        document.querySelector('#left-wrapper').setAttribute('style', '');
      }
    },
    busy: function (val) {
      if (val) {
        this.progressBarUpdating = true;
        this.progressBarAnimeLength = 0;
        this.progressBarAnimeId = setInterval(() => {
          this.progressBarAnimeLength += (60 - this.progressBarAnimeLength) / 20;
        }, 100);
      } else {
        if (this.progressBarAnimeId) {
          clearInterval(this.progressBarAnimeId);
        }
        this.progressBarAnimeLength = 100;
        setTimeout(() => {
          this.progressBarUpdating = false;
          this.progressBarAnimeLength = 0;
        }, 700);
      }
    }
  },
  updated () {
    this.renderKatex();
  },
  mounted () {
    this.lastScrollY = window.scrollY;
    setTimeout(this.renderKatex.bind(this), 100);

    window.addEventListener('scroll', () => {
      if (window.innerWidth <= 800) {
        document.querySelector('#left-wrapper').setAttribute('style', '');
        return;
      }

      const isScrollingDown = (window.scrollY > this.lastScrollY);
      const left = document.querySelector('#left-wrapper');
      const bounding = left.getBoundingClientRect();
      left.parentNode.style.height = `${bounding.height}px`;

      if (bounding.height < window.innerHeight) {
        document.querySelector('#left-wrapper').setAttribute('style', 'position: fixed');
        return;
      }

      if (isScrollingDown) {
        if (left.style.position === 'fixed' && left.style.top === '0px') {
          left.style.position = 'absolute';
          left.style.top = `${window.scrollY + bounding.top}px`;
          left.style.bottom = '';
        } else if (bounding.bottom < window.innerHeight) {
          left.style.position = 'fixed';
          left.style.top = '';
          left.style.bottom = '0px';
        }
      } else {
        if (left.style.position === 'fixed' && left.style.bottom === '0px') {
          left.style.position = 'absolute';
          left.style.top = `${window.scrollY + bounding.top}px`;
          left.style.bottom = '';
        } else if (bounding.top > 0) {
          left.style.position = 'fixed';
          left.style.bottom = '';
          left.style.top = '0px';
        }
      }

      this.lastScrollY = window.scrollY;
    });
  },
  methods: {
    renderKatex () {
      try {
        /* eslint-disable-next-line no-undef */
        renderMathInElement(document.body, {
          delimiters: [
            { left: '$$', right: '$$', display: true },
            { left: '\\(', right: '\\)', display: false },
            { left: '$', right: '$', display: false },
            { left: '\\[', right: '\\]', display: true }
          ]
        });
      } catch (e) {
        console.error(e);
      }
    }
  }
};
</script>

<style lang="scss">
@import './style/global.scss';

body {
  margin: 0;
  color: var(--font_color);
  min-height: 100vh;
  height: 100%;
  overflow-y: scroll;
  background-color: var(--background_color);
  font-family: Microsoft Yahei UI;
}

#app {
  max-width: 1280px;
  padding: 0 1em 0 1em;
  margin: 0 auto;
}

footer {
  font-size: 12px;
  color: grey;
  text-align: center;
  padding: 14px 0;
  // border-top: 2px solid lightgrey;
  // margin: 0 36px;
}

#progress-bar {
  position: fixed;
  z-index: 99999;
  top: 0;
  left: 0;
  background-color: var(--progress_bar_color);
  // box-shadow: 0 0 5px var(--progress_bar_color);
  height: 2px;
  // transition: all ease .3s;
  opacity: 0;

  &.updating {
    transition: all linear .1s;
    opacity: 1;
  }

  &.finishing {
    transition: all ease .7s;
  }
}

@media screen and (min-width: 800px) {
  #app {
    display: flex;
  }

  #left {
    flex-shrink: 0;
    flex-grow: 0;
    width: 300px;
    height: fit-content;
    padding-right: 15px;
    position: relative;
    div#left-wrapper {
      width: 300px;
      position: absolute;
    }
  }

  #right {
    flex-grow: 1;
    position: relative;
    overflow: hidden;
    padding: 0 4px 0 4px;
  }
}

@media screen and (max-width: 800px) {
  #app {
    display: block;
    padding: 0;
  }

  #left {
    width: 100%;
  }

  .hide-on-mobile {
    display: none;
  }

  #progress-bar {
    // box-shadow: 0 0 10px var(--progress_bar_color);
    height: 4px;
  }
}

@import './style/custom.scss';
</style>
