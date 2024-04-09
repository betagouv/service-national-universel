const Sentry = require("@sentry/core");
const mongoose = require("mongoose");
const { MONGO_URL, IS_MAIN_INSTANCE } = require("./config.js");
const { capture } = require("./third-parties/sentry.js");
const os = require("os");

console.log(`Connect to MONGO : ${MONGO_URL}`);
//Set up default mongoose connection

function connect() {
  const mongoMaxAllowedConnections = 32000;

  const minPoolSize = Math.floor(mongoMaxAllowedConnections / 100 / os.cpus().length);
  const maxPoolSize = Math.floor(mongoMaxAllowedConnections / 10 / os.cpus().length);

  return mongoose
    .connect(MONGO_URL, {
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      maxPoolSize: process.env.NODE_ENV === "production" ? maxPoolSize : 10,
      minPoolSize: process.env.NODE_ENV === "production" ? minPoolSize : 5,
      waitQueueTimeoutMS: 30_000,
      autoIndex: process.env.NODE_ENV === "production" ? IS_MAIN_INSTANCE : false,
    })
    .then(() => {
      console.log("Connected to MONGO: creating models start");
      const adminModel = require("./models/admin.js");
      const answerModel = require("./models/answer.js");
      const captchaModel = require("./models/captcha.js");
      const chatMessageModel = require("./models/chat-message.js");
      const chatRoomModel = require("./models/chat-room.js");
      const discountCodeModel = require("./models/discount-code.js");
      const halfTimeQuestionModel = require("./models/half-time-question.js");
      const ChatArchiveModel = require("./models/chat-archive.js");
      const ipInfoModel = require("./models/ipInfo.js");
      const notificationsModel = require("./models/notifications.js");
      const questionModel = require("./models/question.js");
      const referralCodeModel = require("./models/referral-code.js");
      const reportModel = require("./models/report.js");
      const settingsModel = require("./models/settings.js");
      const smsModel = require("./models/sms.js");
      const onesignalLogModel = require("./models/onesignal-log.js");
      const smsRequestsModel = require("./models/smsRequests.js");
      const userModel = require("./models/user.js");

      console.log("Connected to MONGO: initialising models end");

      return Promise.all([
        adminModel.init(),
        answerModel.init(),
        captchaModel.init(),
        chatMessageModel.init(),
        chatRoomModel.init(),
        discountCodeModel.init(),
        halfTimeQuestionModel.init(),
        ChatArchiveModel.init(),
        ipInfoModel.init(),
        notificationsModel.init(),
        questionModel.init(),
        referralCodeModel.init(),
        reportModel.init(),
        settingsModel.init(),
        smsModel.init(),
        onesignalLogModel.init(),
        smsRequestsModel.init(),
        userModel.init(),
      ]);
    })
    .then(() => {
      console.log("Mongo Ready");
      // console.log('YOOOOOO', process.env.INSTANCE_NUMBER);
    })
    .catch((err) => {
      capture(err);
      setTimeout(() => {
        process.exit(1);
      }, 2_000);

      const client = Sentry.getCurrentHub?.().getClient?.();
      client?.close(2_000).then(() => {
        process.exit(1);
      });
    });
}

//aaa

// Get Mongoose to use the global promise library
mongoose.Promise = global.Promise; //Get the default connection

let db = mongoose.connection;

//Bind connection to error event (to get notification of connection errors)
db.on("error", (error) => {
  capture(error);
});
db.once("open", () => console.log("CONNECTED OK"));

module.exports = connect;

// https://chat.openai.com/share/998a8dbf-7a46-4354-9e1d-203ed8bdbbc6
