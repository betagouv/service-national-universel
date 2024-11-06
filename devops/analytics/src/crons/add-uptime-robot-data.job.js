require("../services/databases/postgresql.service");
const { capture } = require("../sentry");
const uptimeRobot = require("../models/uptime-robot.model");
const { UPTIME_ROBOT_TOKEN } = require("../config");
const fetch = require("node-fetch");
const slack = require("../slack");

module.exports.handler = async function () {
  // post request only
  const url = `https://api.uptimerobot.com/v2/getMonitors?api_key=${UPTIME_ROBOT_TOKEN}`;
  try {
    const response = await fetch(url, {
      headers: { "Content-Type": "application/json" },
      method: "POST",
      body: JSON.stringify({
        monitors: "788918276-788918288-788918273-792593759-792593767-792593794-793453217-793452221",
        // uptime_ratio sur le dernier jour
        custom_uptime_ratios: "1",
      }),
    });
    const data = await response.json();
    if (data.stat !== "ok") return capture(data.error.message);

    // get date from yesterday
    const date = new Date();
    date.setDate(date.getDate() - 1);
    const dateString = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;

    data.monitors.forEach((monitor) => {
      // pour chaque monitor, save date + uptime_ratio
      uptimeRobot.create({
        uptime_ratio: monitor.custom_uptime_ratio,
        monitor_id: monitor.id,
        monitor_name: monitor.friendly_name,
        date: dateString,
      });
    });
    slack.success({ title: "UptimeRobot Add Data crons", text: "Data was added successfully!" });
  } catch (error) {
    capture(error);
    slack.error({ title: `UptimeRobot Add Data crons - ERROR`, text: JSON.stringify(error) });
  }
};
