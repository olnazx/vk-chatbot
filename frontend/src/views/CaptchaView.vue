<template>
  <div
    class="captcha-container"
    :class="{ 'is-empty': !captchas.length }"
  >
    <template v-if="captchas.length">
      <div class="captcha-cell">
        <img :src="captcha.url">
      </div>

      <div class="captcha-cell" style="padding-left: 0px;">
        <input
          type="text"
          placeholder="Код"
          v-model="captcha_key"
          @keyup.enter="doSend"
        >
      </div>

      <div class="captcha-row">
        <div class="captcha-send-button" @click="doSend">Отправить</div>
      </div>
    </template>

    <span v-if="!captchas.length">
      Нет активных капч<br><br>¯\_(ツ)_/¯
    </span>
  </div>
</template>

<script>
/**
 * "Вытаскивает" "auth_key" и "viewer_id" из URL.
 * @returns {Object}
 */
function loadUser () {
  const search = location.search.slice(1);

  if (!search) {
    return null;
  }

  // ID пользователя
  let id = search.match(/viewer_id=([^&]+)/);
      id = id && id[1];

  // auth_key
  let auth_key = search.match(/auth_key=([^&]+)/);
      auth_key = auth_key && auth_key[1];

  if (!id || !auth_key) {
    return null;
  }

  return { auth_key, id };
}

export default {
  data () {
    return {
      captchas: [],
      captcha_key: '',

      // Данные пользователя, который вводит капчу.
      user: null
    }
  },

  computed: {
    captcha () {
      if (!this.captchas[0]) 
        return {};

      return {
        bot_id: this.captchas[0].bot_id,
        sid: this.captchas[0].sid,
        url: '/api/v1/captcha.image?sid=' + this.captchas[0].sid
      }
    }
  },

  methods: {
    doSend () {
      // Капча не введена, либо были использованы спец. символы, 
      // которых в капче быть не может.
      if (
        !this.captcha_key ||
        !this.user ||
        /[^a-zа-яё0-9]/i.test(this.captcha_key)
      ) {
        return;
      }

      this.$api('/captcha.send', {
        qs: {
          auth_key: this.user.auth_key,
          captcha_bot_id: this.captcha.bot_id,
          captcha_sid: this.captcha.sid,
          captcha_key: this.captcha_key,
          user_id: this.user.id
        }
      });

      this.captchas.shift();
      this.captcha_key = '';
    }
  },

  created () {
    this.user = loadUser();

    const captchaObtainer = () => {
      this.$api('/captcha.getAll', (_, response = []) => {
        this.captchas = [];

        response.forEach(item => {
          const [bot_id, captchas] = item;

          captchas.forEach(sid => {
            this.captchas.push({
              bot_id,
              sid
            });
          });
        });

        return setTimeout(() => captchaObtainer(), 15000);
      });
    }

    captchaObtainer();
  }
}
</script>

<style lang="stylus">
.captcha-container
  border-radius 3px
  background #f2f3f4

  &.is-empty
    background none
    text-align center

    & > span
      font-size 16px
      color #656565

  .captcha-cell
    display table-cell
    vertical-align middle
    width 180px
    padding 20px

    &:last-child
      padding-left 0px

    & > img
      width 140px
      height 65px

    & > input
      width 100%
      padding 15px
      outline none
      border none
      background #fafbfc
      border-radius 3px
      height 65px
      font-size 22px
      text-align center

      &:focus
        background #fff

  .captcha-row
    padding 20px
    padding-top 0px
    text-align center

    .captcha-send-button
      border-radius 3px
      padding 10px 15px
      cursor pointer
      background #5e81a8
      color #fff

      &:hover
        opacity .85
</style>
