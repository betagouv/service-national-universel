// https://developer.matomo.org/api-reference/tracking-api
// https://developer.matomo.org/guides/tracking-javascript-guide
// https://matomo.org/docs/event-tracking/#what-is-event-tracking

class Api {
  constructor() {
    this.userProperties = {};
    if (!window._paq) return console.log("No matomo detected");
    window._paq.push(["enableHeartBeatTimer", 30]);
  }

  /*
      Category (Required) – This describes the type of events you want to track. For example, Link Clicks, Videos, Outbound Links, and Form Events.
      Action (Required) – This is the specific action that is taken. For example, with the Video category, you might have a Play, Pause and Complete action.
      Name (Optional – Recommended) – This is usually the title of the element that is being interacted with, to aid with analysis. For example, it could be the name of a Video that was played or the specific form that is being submitted.
      Value (Optional) – This is a numeric value and is often added dynamically. It could be the cost of a product that is added to a cart, or the completion percentage of a video.
    */
  logEvent(categorie, action, name = "", value = "") {
    if (!window._paq) return;
    window._paq.push(["trackEvent", categorie, action, name, value]);
  }

  setUserId(userId) {
    if (!window._paq) return;
    window._paq.push(["setUserId", userId]);
  }

  setUserProperties(newProperties) {
    //   _paq.push(['setCustomVariable',
    //     // Index, the number from 1 to 5 where this custom variable name is stored
    //     1,
    //     // Name, the name of the variable, for example: Gender, VisitorType
    //     "Gender",
    //     // Value, for example: "Male", "Female" or "new", "engaged", "customer"
    //     "Male",
    //     // Scope of the custom variable, "visit" means the custom variable applies to the current visit
    //     "visit"
    // ]);

    this.userProperties = { ...this.userProperties, ...newProperties };
  }
}

const matomo = new Api();
export default matomo;
