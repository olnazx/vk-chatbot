<template>
  <div class="main-container">
    <div class="main-header">
      <b>Чат-боты</b>
      <a href="https://botsforchats.ru/" target="_blank">/ botsforchats.ru</a>
    </div>

    <div class="main-content">
      <captcha-view></captcha-view>
    </div>
  </div>
</template>

<script>
import CaptchaView from './views/CaptchaView';

export default {
  components: {
    CaptchaView
  }
}
</script>

<style lang="stylus">
@import './assets/styles/minireset.css'
@import './assets/styles/base.styl'

.main-container
  .main-header
    padding 20px 0
    background #fafbfc
    border-bottom 1px solid #e7e8ec
    text-align center
  
    & > b
      font-size 18px

    & > a
      text-decoration none
      color #858585
      font-size smaller

  .main-content
    margin 0 auto
    padding 20px
    width 400px

    @media screen and (max-width: 399px)
      width auto
</style>
