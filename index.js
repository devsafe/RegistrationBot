const { Telegraf } = require('telegraf');
const data = require('./data')
const Stage = require('telegraf/stage')
const session = require('telegraf/session')
const Scene = require('telegraf/scenes/base')
const { leave } = Stage
const stage = new Stage()

const bot = new Telegraf(process.env.BOT_TOKEN);

const getName = new Scene('getName')
stage.register(getName)
const getApartmentNumber = new Scene('getApartmentNumber')
stage.register(getApartmentNumber)
const getFloorNumber = new Scene('getFloorNumber')
stage.register(getFloorNumber)
const getDetails = new Scene('getDetails')
stage.register(getDetails)
const getNumber = new Scene('getNumber')
stage.register(getNumber)
const check = new Scene('check')
stage.register(check)

bot.use(session())
bot.use(stage.middleware())


bot.hears('️⬅️ На главную', (ctx) => {
  ctx.reply(
    'Введите фамилию, имя и отчество',
    { reply_markup: { remove_keyboard: true } }
  )
  ctx.scene.enter('getName')
})

bot.start((ctx) => {
  ctx.reply(
    'Введите имя и фамилию',
    { reply_markup: { remove_keyboard: true } }  
  )
  ctx.scene.enter('getName')
})

getName.command('start', async (ctx) => {
  ctx.reply(
    'Начнем заново. Введите имя и фамилию',
    { reply_markup: { remove_keyboard: true } }
  )
  await ctx.scene.leave('getFloorNumber')
  ctx.scene.enter('getName')
})

getName.on('text', async (ctx) => {
  if (ctx.message.text === '◀️ Назад') {
    return ctx.reply('Вы уже вернулись в самое начало. Введите, пожалуйста, свое имя')
  }

  ctx.session.name = ctx.message.text
  ctx.reply(
    'Введите номер вашей квартиры' +
    `\n\nУже введенные данные:\nФ.И.О: ${ctx.session.name}`,
    { reply_markup: { keyboard: [['◀️ Назад']], resize_keyboard: true, one_time_keyboard: true } }
    )
  await ctx.scene.leave('getName')
  ctx.scene.enter('getApartmentNumber')
})

getApartmentNumber.hears(/^[0-9]*$/, async (ctx) => {
  ctx.session.apartmentNumber = ctx.message.text
  ctx.reply(
    'А теперь расскажите с какого вы этажа?' +
    `\n\nУже введенные данные:\nФ.И.О: ${ctx.session.name};\nКвартира: ${ctx.session.apartmentNumber}`,
    { reply_markup: { keyboard: [['◀️ Назад', '❌ Стереть все']], resize_keyboard: true, one_time_keyboard: true } }
  )
  await ctx.scene.leave('getApartmentNumber')
  ctx.scene.enter('getFloorNumber')
})

getApartmentNumber.hears('◀️ Назад', async (ctx) => {
  ctx.reply(
    'Введите фамилию, имя',
    { reply_markup: { remove_keyboard: true } } 
  )
  await ctx.scene.leave('getApartmentNumber')
  ctx.scene.enter('getName')
})

getApartmentNumber.on('text', async (ctx) => {
  ctx.reply(
    'Вводите только цифры. Укажите номер вашей квартиры' +
    `\n\nУже введенные данные:\nФ.И.О: ${ctx.session.name}`,
    { reply_markup: { keyboard: [['◀️ Назад', '❌ Стереть все']], resize_keyboard: true, one_time_keyboard: true } }
  )
})


getFloorNumber.hears('◀️ Назад', async (ctx) => {
  ctx.reply(
    'Введите номер квартиры' +
    `\n\nУже введенные данные:\nФ.И.О: ${ctx.session.name}`,
    { reply_markup: { keyboard: [['◀️ Назад', '❌ Стереть все']], resize_keyboard: true, one_time_keyboard: true } }
  )
  await ctx.scene.leave('getFloorNumber')
  ctx.scene.enter('getApartmentNumber')
})

getFloorNumber.hears(['❌ Стереть все', '/start'], async (ctx) => {
  ctx.reply(     'Начнем заново. Введите имя, фамилию и отчество',     { reply_markup: { remove_keyboard: true } }   )
  await ctx.scene.leave('getFloorNumber')
  ctx.scene.enter('getName')
})

getFloorNumber.on('text', async (ctx) => {
  ctx.session.floorNumber = ctx.message.text
  ctx.reply(
    'Добавьте дополнительные сведения по необходимости' +
    `\n\nУже введенные данные:\nФ.И.О: ${ctx.session.name};\nКвартира: ${ctx.session.apartmentNumber};\nЭтаж: ${ctx.session.floorNumber}`,
    { reply_markup: { keyboard: [['◀️ Назад', '❌ Стереть все']], resize_keyboard: true, one_time_keyboard: true } }
  )
  await ctx.scene.leave('getFloorNumber')
  ctx.scene.enter('getDetails')
})


getDetails.hears('◀️ Назад', async (ctx) => {
  ctx.reply(
    'А теперь расскажите дополнительные сведения' +
    `\n\nУже введенные данные:\nФ.И.О: ${ctx.session.name};\nКвартира: ${ctx.session.apartmentNumber}`,
    { reply_markup: { keyboard: [['◀️ Назад', '❌ Стереть все']], resize_keyboard: true, one_time_keyboard: true } }
  )
  await ctx.scene.leave('getDetails')
  ctx.scene.enter('getFloorNumber')
})

getDetails.hears(['❌ Стереть все', '/start'], async (ctx) => {
  ctx.reply(     'Начнем заново. Введите ваше имя и фамилию',     { reply_markup: { remove_keyboard: true } }   )
  await ctx.scene.leave('getDetails')
  ctx.scene.enter('getName')
})

getDetails.on('text', async (ctx) => {
  ctx.session.details = ctx.message.text
  ctx.reply(
    'Нажмите кнопку "Отправить контакт" ниже, чтобы поделиться номером.' +
    `\n\nУже введенные данные:\nФ.И.О: ${ctx.session.name};\nКвартира: ${ctx.session.apartmentNumber};\nЭтаж: ${ctx.session.floorNumber};` +
    `\nДополнительные сведения: ${ctx.session.details};`,
    { reply_markup: { keyboard: [[{text: '📱 Отправить контакт', request_contact: true}], ['◀️ Назад', '❌ Стереть все']], resize_keyboard: true, one_time_keyboard: true } }
  )
  await ctx.scene.leave('getCompSkills')
  ctx.scene.enter('getNumber')
})

getNumber.hears('◀️ Назад', async (ctx) => {
  ctx.reply(
    'Какими компьютерными программами и на каком уровне Вы владеете?' +
    `\n\nУже введенные данные:\nФ.И.О: ${ctx.session.name};\nКвартира: ${ctx.session.apartmentNumber};\nЭтаж: ${ctx.session.floorNumber};` +
    `\nДополнительные сведения: ${ctx.session.details}`,
    { reply_markup: { keyboard: [['◀️ Назад', '❌ Стереть все']], resize_keyboard: true, one_time_keyboard: true } }
  )
  await ctx.scene.leave('getNumber')
  ctx.scene.enter('getCompSkills')
})

getNumber.hears(['❌ Стереть все', '/start'], async (ctx) => {
  ctx.reply(     'Начнем заново. Введите имя, фамилию и отчество',     { reply_markup: { remove_keyboard: true } }   )
  await ctx.scene.leave('getNumber')
  ctx.scene.enter('getCompSkills')
  ctx.session = null
})

getNumber.on('contact', async (ctx) => {
  ctx.session.phone = ctx.message.contact.phone_number
  ctx.reply(
    '❗️ Проверьте все данные и нажмите "Все верно", если они корректны: ' + 
    `\n\nФ.И.О: ${ctx.session.name}\nКвартира: ${ctx.session.apartmentNumber}\nЭтаж: ${ctx.session.floorNumber}` + 
    `\nДополнительные сведения: ${ctx.session.details};` +
    `\nНомер: ${ctx.session.phone}`,
    { reply_markup: { keyboard: [['️✅ Все верно'], ['◀️ Назад', '❌ Стереть все']], resize_keyboard: true, one_time_keyboard: true }, parse_mode: 'markdown' }
  )
  await ctx.scene.leave('getNumber')
  ctx.scene.enter('check')
})

check.hears('️✅ Все верно', (ctx) => {
  ctx.reply(
    '✅ Спасибо! Ваша заявка отправлена. В ближайшее время вам придёт ссылка для вступления в чат',
    { reply_markup: { keyboard: [['️⬅️ На главную']], resize_keyboard: true, one_time_keyboard: true } }
  )
  ctx.scene.leave('main')

  for (let key of data.admins) {
    bot.telegram.sendMessage(
      key,
      `Новая заявка на доступ к чату! \n\nФ.И.О: [${ctx.session.name}](tg://user?id=${ctx.from.id});\nКвартира: ${ctx.session.apartmentNumber};\nЭтаж: ${ctx.session.floorNumber};` + 
      `\nДополнительные сведения: ${ctx.session.details}` +
      `\nНомер: ${ctx.session.phone}`,
      { parse_mode: 'markdown' }
    )
  }
  ctx.session = null
})

check.hears('◀️ Назад', async (ctx) => {
  ctx.reply(
    'Нажмите кнопку "Отправить контакт" ниже, чтобы поделиться номером.' +
    `\n\nУже введенные данные:\nФ.И.О: ${ctx.session.name};\nКвартира: ${ctx.session.apartmentNumber};\nЭтаж: ${ctx.session.floorNumber};` +
    `\nДополнительные сведения: ${ctx.session.details}`,
    { reply_markup: { keyboard: [[{text: '📱 Отправить контакт', request_contact: true}], ['◀️ Назад', '❌ Стереть все']], resize_keyboard: true, one_time_keyboard: true } }
  )
  await ctx.scene.leave('check')
  ctx.scene.enter('getNumber')
})

check.hears(['❌ Стереть все', '/start'], async (ctx) => {
  ctx.reply(     'Начнем заново. Введите имя, фамилию и отчество',     { reply_markup: { remove_keyboard: true } }   )
  await ctx.scene.leave('getNumber')
  ctx.scene.enter('getCompSkills')
  ctx.session = null
})


module.exports.handler = async function (event, context) {
    const message = JSON.parse(event.body);
    await bot.handleUpdate(message);
    return {
        statusCode: 200,
        body: '',
    };
};