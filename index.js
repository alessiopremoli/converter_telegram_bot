require('dotenv').config();

const Telegraf = require('telegraf');
const Markup = require('telegraf/markup');
const WizardScene = require('telegraf/scenes/wizard');
const Stage = require("telegraf/stage");
const session = require("telegraf/session");
const { enter, leave } = Stage

const Converter = require('./api/currency-converter');

const bot = new Telegraf(process.env.BOT_TOKEN);
const URL = process.env.URL;
const PORT = process.env.PORT || 2000;

bot.telegram.setWebhook(`${URL}bot${BOT_TOKEN}`);
bot.startWebhook(`/bot${BOT_TOKEN}`, null, PORT);

bot.start( ctx =>
    ctx.reply(
        `How can I help you, ${ctx.from.first_name}?`,
        
        //eventually Markup.keyboard
        Markup.inlineKeyboard([
            Markup.callbackButton("Convert currency", "CONVERT_CURRENCY"),
            // Markup.callbackButton("View Rates", "VIEW_RATES")
        ]).extra()
    )
);

// bot.command("stop", ctx => {
//     ctx.reply('Ok boss!');
//     leave('currency_converter');
// });

bot.action("BACK", ctx => {
    ctx.reply(
        'Do you need something else?',
        Markup.inlineKeyboard([
            Markup.callbackButton("Convert currency", "CONVERT_CURRENCY"),
        ]).extra()
    );
});

const currencyConverter = new WizardScene(
    "currency_converter",
    ctx => {
        ctx.reply("Please, type in the currency to convert from (example: USD)");
        ctx.wizard.next();
    },
    ctx => {
        // ctx.wizard.state => state manager of the wizard
        if(ctx.message.text === 'stop' || ctx.message.text === '/stop') {
            leaveWizard(ctx);
        } else {
            ctx.wizard.state.currencySource = ctx.message.text;
            ctx.reply(
                `Got it, you wish to convert from ${ctx.wizard.state.currencySource} to what currency? (example: EUR)`
            );
            ctx.wizard.next();
        }
       
    },
    ctx => {
        if(ctx.message.text === 'stop' || ctx.message.text === '/stop') {
            leaveWizard(ctx);
        } else {
            ctx.wizard.state.currencyDestination = ctx.message.text;
            ctx.reply(
                `Enter the amount to convert from ${ctx.wizard.state.currencySource} to ${ctx.wizard.state.currencyDestination}`
            );
            ctx.wizard.next();
        }
    },
    ctx => {
        if(ctx.message.text === 'stop' || ctx.message.text === '/stop') {
            leaveWizard(ctx);
            } else {
            const amt = (ctx.wizard.state.amount = ctx.message.text);
            const source = ctx.wizard.state.currencySource;
            const dest = ctx.wizard.state.currencyDestination;
            const rates = Converter.getRate(source, dest);

            rates.then(res => {
                let newAmount = res.data.rates[dest] * amt;
                newAmount = newAmount.toFixed(3).toString();

                ctx.reply(
                    `${amt} ${source} is worth \n${newAmount} ${dest}`,
                    Markup.inlineKeyboard([
                        Markup.callbackButton("Back to Menu", "BACK"),
                        Markup.callbackButton("Convert another currency", "CONVERT_CURRENCY")
                    ]).extra()
                );
            }).catch(error => {
                ctx.reply(
                    `An error has occurred: ${error}`,
                    Markup.inlineKeyboard([
                        Markup.callbackButton("Back to Menu", "BACK"),
                        Markup.callbackButton("Convert another currency", "CONVERT_CURRENCY")
                    ]).extra()
                );
            })
            return ctx.scene.leave();
        }
    }
);

const leaveWizard = ctx => {
    ctx.reply('Ok boss!');
    ctx.scene.leave();
};

const stage = new Stage([currencyConverter], {ttl: 300});

bot.use(session());
bot.use(stage.middleware());

bot.command('convert', enter('currency_converter'));
bot.action('CONVERT_CURRENCY', enter('currency_converter'))

bot.hears('Hello', ({ reply }) => reply('Hello! What\'s up?'));
bot.hears('Hi', ({ reply }) => reply('Hello! What\'s up?'));

bot.hears(/.*/, ({ match, reply }) => reply(`I really wish i could understand what "${match}" means! As for now you can use /convert to make me convert currencies`));
bot.startWebhook();