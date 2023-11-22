const { getPayment } = require("./payments.js");

const express = require("express");
const app = express();

// YooMoney
const { YMNotificationChecker, YMNotificationError } = require("yoomoney-sdk");
const { onPay } = require("../discord/bot.js");
const notificationChecker = new YMNotificationChecker(process.env.YOOMONEY_NOTIFY_SECRET);

// ymapi.aniby.ru/notifications/2b00174c-a941-473a-8d13-5c097b4d92bf/yoomoney

const path = require('path');

app.get("/success", async (req, res) => {
    res.sendFile(path.join(__dirname, '/success.html'));
});

app.get("/pay", async (req, res) => {
    const params = req.query;

    if (params.id == null || params.id == undefined) {
        res.status(201).json({
            "error": "Invalid payment ID"
        });
        return;
    }

    const payment = getPayment(params.id);
    if (!payment) {
        res.status(201).json({
            "error": "Payment not found"
        });
        return;
    }

    const form = payment.build();
    res.writeHead(200, "OK", {
        "Content-Type": "text/html; charset=utf-8"
    });
    res.end(form);
});

app.post(process.env.NOTIFICATIONS_PATH,
    // Параметр `memo=false` отключает запоминание обработанных уведомлений
    // Он по умолчанию включён, но для тестирования на localhost'е
    // где вы можете кидать одно и то же уведомление несколько раз
    // лучше выключить
    notificationChecker.middleware({ memo: false }, async (req, res) => {
        const id = req.body.label;
        if (id == null || id == undefined) {
            res.writeHead(201, "ERROR", { "Content-Type": "text/plain" });
            return;
        }

        res.writeHead(200, "OK", { "Content-Type": "text/plain" });

        await onPay(id);
    })
);

app.use((error, _req, _res, next) => {
    if (error instanceof YMNotificationError) {
        console.log(error);
    }

    return next();
});

const port = parseInt(process.env.PORT);
app.listen(port);