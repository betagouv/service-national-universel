// https://developer.matomo.org/api-reference/tracking-api
// https://developer.matomo.org/guides/tracking-javascript-guide
// https://matomo.org/docs/event-tracking/#what-is-event-tracking


class Api {
  constructor() {
    this.userProperties = {};
    window._paq &&  window._paq.push(["enableHeartBeatTimer", 30]);
  }

  /*
    Category (Required) – This describes the type of events you want to track. For example, Link Clicks, Videos, Outbound Links, and Form Events.
    Action (Required) – This is the specific action that is taken. For example, with the Video category, you might have a Play, Pause and Complete action.
    Name (Optional – Recommended) – This is usually the title of the element that is being interacted with, to aid with analysis. For example, it could be the name of a Video that was played or the specific form that is being submitted.
    Value (Optional) – This is a numeric value and is often added dynamically. It could be the cost of a product that is added to a cart, or the completion percentage of a video.
  */
  logEvent(categorie, action, name, value) {
    if (!window._paq) return console.log("No matomo detected");
    console.log("LOG EVENT CALLED")
    window._paq && window._paq.push(["trackEvent", categorie, action, name, value]);
  }

  // init({ baseUrl, idsite, userId, _idvc }) {
  //   this.baseUrl = baseUrl;
  //   this.idsite = idsite;
  //   this.userId = userId;
  //   this._idvc = _idvc;
  //   this.initDone = true;
  //   this.userProperties = {};
  // }
  // makeid(length = 16) {
  //   var result = "";
  //   var characters = "01234567890abcdefABCDEF";
  //   var charactersLength = characters.length;
  //   for (var i = 0; i < length; i++) {
  //     result += characters.charAt(Math.floor(Math.random() * charactersLength));
  //   }
  //   return result;
  // }

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


  // computeCvar(cvarObject) {
  //   const _cvar = {};
  //   for (let [index, key] of Object.keys(cvarObject).entries()) {
  //     _cvar[`${index}`] = [key, cvarObject[key]];
  //   }
  //   return JSON.stringify(_cvar);
  // }
  // computeParams(params, idsite) {
  //   params = {
  //     _cvar: this.computeCvar(this.userProperties),
  //     idsite,
  //     _id: this.userId,
  //     uid: this.userId,
  //     rec: 1,
  //     rand: Date.now(),
  //     _idvc: this._idvc,
  //     ...params,
  //   };
  //   return Object.keys(params).reduce((paramString, key, index) => {
  //     const computedParam = `${key}=${params[key]}`;
  //     if (index === 0) {
  //       return computedParam;
  //     }
  //     return `${paramString}&${computedParam}`;
  //   }, "");
  // }
  // async logEvent({ category, action, name = "", value = null }) {
  //   // e_c — The event category. Must not be empty. (eg. Videos, Music, Games...)
  //   // e_a — The event action. Must not be empty. (eg. Play, Pause, Duration, Add Playlist, Downloaded, Clicked...)
  //   // e_n — The event name. (eg. a Movie name, or Song name, or File name...)
  //   // e_v — The event value. Must be a float or integer value (numeric), not a string.
  //   const params = { e_c: category, e_a: action };
  //   if (name !== "") params.e_n = name;
  //   if (value !== null && !isNaN(Number(value))) params.e_v = Number(value);
  //   await this.execute(params);
  // }
  // async execute(params) {
  //   try {
  //     if (!this.initDone) {
  //       throw new Error("matomo not initialized yet");
  //     }
  //     if (__DEV__) {
  //       console.log(`${this.baseUrl}?${this.computeParams(params, this.idsite)}`);
  //       return;
  //     }
  //     const url = `${this.baseUrl}?${this.computeParams(params, this.idsite)}`;
  //     const res = await fetch(encodeURI(url));
  //     // if (__DEV__) {
  //     //   console.log(url);
  //     //   console.log(res.status);
  //     // }
  //     if (__DEV__ && res.status !== 200) {
  //       console.log(res);
  //       throw new Error("error fetching matomo");
  //     }
  //     if (!this.baseUrl2 || !this.idsite2) {
  //       return;
  //     }
  //     const url2 = `${this.baseUrl2}?${this.computeParams(params, this.idsite2)}`;
  //     const res2 = await fetch(encodeURI(url2));
  //     if (__DEV__) {
  //       console.log(url2);
  //       console.log(res2.status);
  //     }
  //     if (__DEV__ && res2.status !== 200) {
  //       console.log(res);
  //       throw new Error("error fetching matomo");
  //     }
  //   } catch (e) {
  //     if (__DEV__) {
  //       console.log("matomo error", e);
  //     }
  //   }
  // }
}

const matomo = new Api();
export default matomo;
