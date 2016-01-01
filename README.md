> **Сентябрь, 2017.**  
> Данный проект прекратил своё развитие. Вместо него появилась облегчённая версия - [vk-chatbot-lite](https://github.com/olnazx/vk-chatbot-lite). Все функции ботов перешли в одно сообщество. 

> Сообщество «Чат-ботов» ВКонтакте → [Чат-боты](https://vk.com/dumbbot)

## Содержание

0. [Требования](#Требования)
1. [Установка](#Установка)
2. [Настройка](#Настройка)
3. [Запуск](#Запуск)
4. [Добавление команд](#Добавление-команд) ([Список доступных команд](COMMANDS.md))

## Требования

Бот работает на виртуальном выделенном сервере с установленной операционной системой Ubuntu 16.04, поэтому дальнейшие инструкции будут применимы именно к ней.  

##### Конфигурация сервера

* __OS__: Ubuntu 16.04
* __CPU__: 1x2.2 GHz
* __RAM__: 512 Mb

## Установка

##### Настройка сервера

* [Initial Server Setup with Ubuntu 16.04](https://www.digitalocean.com/community/tutorials/initial-server-setup-with-ubuntu-16-04)

##### Установка Node.js & npm

* [Installing Node.js via package manager](https://nodejs.org/en/download/package-manager/#debian-and-ubuntu-based-linux-distributions)

##### Установка менеджера процессов PM2

```sh
sudo npm i -g pm2
```

А также его настройка

* [Manage Application with PM2](https://www.digitalocean.com/community/tutorials/how-to-set-up-a-node-js-application-for-production-on-ubuntu-16-04#manage-application-with-pm2)

##### Установка и настройка Redis

* [How To Install and Configure Redis on Ubuntu 16.04](https://www.digitalocean.com/community/tutorials/how-to-install-and-configure-redis-on-ubuntu-16-04)

Для сервера Redis использую также следующие параметры:

```sh
maxmemory 10mb
maxmemory-policy allkeys-lru
```

##### Установка и настройка Nginx

* [How To Install Nginx on Ubuntu 16.04](https://www.digitalocean.com/community/tutorials/how-to-install-nginx-on-ubuntu-16-04)
* [How To Secure Nginx with Let's Encrypt on Ubuntu 16.04](https://www.digitalocean.com/community/tutorials/how-to-secure-nginx-with-let-s-encrypt-on-ubuntu-16-04)
* [Set Up Nginx as a Reverse Proxy Server](https://www.digitalocean.com/community/tutorials/how-to-set-up-a-node-js-application-for-production-on-ubuntu-16-04#set-up-nginx-as-a-reverse-proxy-server)

В текущей конфигурации, все `sitename.com/api` запросы проксируются на локальный Node.js сервер (_backend/server/_).  
Для остальных запросов раздаётся статика из директории фронтенд-билда.

##### Клонирование прокета и установка зависимостей

```sh
git clone https://github.com/olnazx/node-vkbot.git
cd node-vkbot
npm i
```

## Настройка

#### Создание приложения сообщества

Для того, чтобы работало распознавание капчи пользователями через приложение сообщества, нужно его создать [здесь](https://vk.com/editapp?act=create) _(Embedded application → Community app)_ и настроить. **ID** приложения и **Secure key** нужно прописать в _backend/config/config.js_ (см. ниже).

#### Редактирование файлов

* _backend/config/accounts.default.js_  
Здесь находится информация об аккаунтах ботов. Ботов может быть несколько.

* _backend/config/config.default.js_  
Основной конфиг приложения.

Необходимо заполнить все поля, заменив строки вида _"&lt;string&gt;"_ на свои данные.  
После завершения редактирования данных файлов, необходимо убрать у них постфиксы _".default"_.

## Запуск

Все команды выполняются в корневой директории проекта.

##### Билдинг фронтенда

```sh
npm run build
```

##### Запуск приложения (Bot + Server), используя PM2

```sh
npm start
```

##### Запуск локального live-reload сервера для разработки

```sh
npm run dev
```

## Добавление команд

Все команды, которые выполняет бот, находятся в папке **backend/bot/commands**. Имя файла является основным названием команды.  

Модуль каждой команды должен экспортировать объект следующего вида:

```js
{
  /**
   * Алиасы команды.
   * @type {Array of String}
   * @optional
   */
  aliases,

  /**
   * Описание команды (доступно по команде: /команда /?).
   * @type {String}
   * @optional
   */
  help_text,

  /**
   * Функция, которая выполняется при вызове команды.
   * На вход первым аргументом принимает объект:
   *   {
   *     bot:     Bot,              // Экземпляр "Bot" (backend/bot/base/Bot/index.js)
   *     args:    CommandArguments, // Экземпляр "CommandArguments" (backend/bot/events/helpers/command-arguments.js)
   *     options: Object            // Настройки команды (backend/config/config.js#commands.<command_name>)
   *   }
   * @type {Function}
   * @required
   * @async
   */
  run,

  /**
   * Уникальность команды:
   *   'mchat': доступна только в беседах;
   *   'pm': доступна только в личных сообщениях;
   *   '': доступна везде.
   * @type {String}
   * @optional
   */
  uniqueness
}
```
