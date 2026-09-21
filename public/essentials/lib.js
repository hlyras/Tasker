// -------------------
// javascript lib
// -------------------
const lib = {};

lib.historyStack = [];

lib.pushStateToStack = (stateObject, esc) => {
  lib.historyStack.push({ stateObject, esc });
  history.pushState(stateObject, '');
};

lib.popStateFromStack = () => {
  lib.historyStack.pop();
};

window.addEventListener('popstate', () => {
  if (lib.historyStack.length > 0) {
    lib.historyStack[lib.historyStack.length - 1].esc('popstate');
  }
});

lib.popout = element => {
  if (!element) {
    let top = lib.historyStack[lib.historyStack.length - 1];
    if (!top) return;

    top.esc("popout");
    return;
  }

  let msg_div = element.parentNode.parentNode.parentNode;
  if (!msg_div || !msg_div._popupEsc) return;

  msg_div._popupEsc("popout");
};

lib.popup = (element, cb, fullscreen = false, ground = true, { closable = true } = {}) => {
  const focused_btn = document.querySelector(':focus');
  focused_btn && focused_btn.blur();

  const msg_div = lib.element.create("div", {
    class: "msg h-center",
    style: "z-index: 10;"
  });

  const msg_popup = lib.element.create("div", {
    class: fullscreen
      ? `msg-popup fullscreen ${ground ? 'ground' : 'bg'}`
      : `msg-popup box a3-4 container ${ground ? 'ground' : 'bg'} radius-5`,
    style: "display: flex; flex-direction: column; overflow: hidden;"
  });

  const close_div = lib.element.create("div", {
    class: "close-container",
    style: closable
      ? "position: absolute; top: 5px; right: 5px; z-index: 11;"
      : "display:none;"
  });

  let close_icon = lib.element.create("div", {
    class: "ground size-20 radius-50 padding-1 absolute pointer",
    style: "top: 5px; right: 5px;"
  });
  close_div.append(close_icon);

  close_icon.append(lib.element.create("img", {
    class: "size-20 opacity-out-08",
    src: "/images/icon/close-small.png"
  }));

  msg_popup.append(close_div);

  const content_wrapper = lib.element.create("div", {
    class: "container",
    style: `
      flex: 1;
      min-height: 0;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
    `
  });
  msg_popup.append(content_wrapper);

  content_wrapper.append(element);

  msg_div.append(msg_popup);
  document.body.append(msg_div);
  document.body.style.overflow = "hidden";

  let popupId = lib.string.gen(5);

  function esc(from) {
    if (from === "popout") {
      let index = lib.historyStack.findIndex(item => item.esc === esc);
      if (index === -1) return;

      lib.historyStack.splice(index, 1);
      document.removeEventListener("keydown", keydown);
      msg_div.remove();

      if (!lib.historyStack.length) {
        document.body.style.overflow = "auto";
      }

      if (typeof cb === 'function') { return cb(); }
      return;
    }

    let top = lib.historyStack[lib.historyStack.length - 1];
    if (!top || top.esc !== esc) return;

    if (from != "popstate") {
      if (!closable) return;
      return history.back();
    }

    if (!closable) {
      history.pushState({ popupId: popupId }, '');
      return;
    }

    lib.popStateFromStack();
    document.removeEventListener("keydown", keydown);

    if (!lib.historyStack.length) {
      document.body.style.overflow = "auto";
    }

    msg_div.remove();
    if (typeof cb === 'function') { return cb(); }
  }

  msg_div._popupEsc = esc;

  function keydown(e) {
    if (e.keyCode != 27) return;

    let top = lib.historyStack[lib.historyStack.length - 1];
    if (!top || top.esc !== esc) return;

    esc();
  }

  lib.pushStateToStack({ popupId: popupId }, esc);

  if (closable) {
    msg_div.addEventListener("click", esc);
    close_icon.addEventListener("click", esc);
  }

  msg_popup.addEventListener("click", e => e.stopPropagation());
  document.addEventListener("keydown", keydown);
};

// Essa função será desativada, utilizar lib.message
lib.msg = (msg) => {
  if (!document.getElementById("msg")) {
    alert(msg);
    return true;
  }

  document.getElementById("msg").style.display = "";
  document.getElementById("msg-content").innerHTML = "";
  document.getElementById("msg-content").append(lib.element.create("div", {
    class: "box b1 center lucida-grande em12 bold"
  }, msg));
};

lib.loader = {};

lib.loader.init = (element) => {
  let overlay = lib.element.create("div", {});
  if (!element) {
    lib.addCss(overlay, ["loader-body-overlay"]);
    overlay.append(lib.element.create("div", { class: "loader" }));
    document.body.append(overlay);
  } else if (element.tagName == "IMG") {
    element.dataset.src = `${element.src}`;
    element.src = "https://wt-images-cdn.sfo3.cdn.digitaloceanspaces.com/lib.images/loader.gif";
    element.dataset.func = element.onclick;
    element.onclick = "";
  } else if (element.tagName == "INPUT") {
    lib.addCss(element, ["loader-element-container"]);
    lib.addCss(overlay, ["loader-element-overlay"]);
    overlay.append(lib.element.create("div", { class: "loader" }));
    element.append(overlay);
    if (element) { element.disabled = true; }
  } else {
    lib.addCss(element, ["loader-element-container"]);
    lib.addCss(overlay, ["loader-element-overlay"]);
    overlay.append(lib.element.create("div", { class: "loader" }));
    element.append(overlay);
    if (element) { element.disabled = true; }
  }
};

lib.loader.stop = (element) => {
  if (!element || element.tagName == "INPUT") {
    Array.from(document.getElementsByClassName("loader-body-overlay")).forEach(el => el.remove());
    if (element) { element.disabled = false; }
  } else if (element.tagName == "IMG") {
    element.src = `${element.dataset.src}`;
    element.onclick = element.dataset.func;
  } else {
    if (element) { element.disabled = false; }
    Array.from(element.getElementsByClassName("loader-element-container")).forEach(el => lib.removeCss(el, ["loader-element-container"]));
    Array.from(element.getElementsByClassName("loader-element-overlay")).forEach(el => el.remove());
  }
};

lib.message = (msg, cb) => {
  const focused_btn = document.querySelector(':focus');
  focused_btn && focused_btn.blur();

  const msg_div = lib.element.create("div", {
    class: "msg h-center",
    style: "z-index: 10;"
  });

  const msg_popup = lib.element.create("div", {
    class: "msg-popup container ground box b3-4 container border-st radius-5 padding-10",
    style: "display: flex; flex-direction: column; overflow: hidden;"
  });

  msg_popup.append(lib.element.create("div", { class: "mobile-box b10" }));

  const alert_icon = lib.element.create("div", { class: "mobile-box b4-5 center" });
  alert_icon.append(lib.element.create("img", {
    src: "https://wt-images-cdn.sfo3.cdn.digitaloceanspaces.com/lib.images/alert.png",
    class: "image-prop size-25 noselect"
  }));
  msg_popup.append(alert_icon);

  const close_div = lib.element.create("div", {
    class: "close-container",
    style: "position: absolute; top: 5px; right: 5px; z-index: 11;"
  });

  let close_icon = lib.element.create("div", {
    class: "ground border-st size-20 radius-50 padding-1 absolute pointer",
    style: "top: 5px; right: 5px;"
  });
  close_div.append(close_icon);

  close_icon.append(lib.element.create("img", {
    class: "size-20 opacity-out-08",
    src: "/images/icon/close-small.png"
  }));

  msg_popup.append(close_div);

  msg_popup.append(lib.element.create("div", {
    class: "box b1 center lucida-grande em12 bold margin-top-20"
  }, msg));

  msg_div.append(msg_popup);
  document.body.append(msg_div);
  document.body.style.overflow = "hidden";

  let popupId = lib.string.gen(5);

  function esc(from) {
    if (from === "popout") {
      let index = lib.historyStack.findIndex(item => item.esc === esc);
      if (index === -1) return;

      lib.historyStack.splice(index, 1);
      document.removeEventListener("keydown", keydown);
      msg_div.remove();

      if (!lib.historyStack.length) {
        document.body.style.overflow = "auto";
      }

      if (typeof cb === 'function') { return cb(); }
      return;
    }

    let top = lib.historyStack[lib.historyStack.length - 1];
    if (!top || top.esc !== esc) return;

    if (from != "popstate") {
      return history.back();
    }

    lib.popStateFromStack();
    document.removeEventListener("keydown", keydown);

    if (!lib.historyStack.length) {
      document.body.style.overflow = "auto";
    }

    msg_div.remove();
    if (typeof cb === 'function') { return cb(); }
  }

  msg_div._popupEsc = esc;

  function keydown(e) {
    if (e.keyCode != 27) return;

    let top = lib.historyStack[lib.historyStack.length - 1];
    if (!top || top.esc !== esc) return;

    esc();
  }

  lib.pushStateToStack({ popupId: popupId }, esc);

  msg_div.addEventListener("click", esc);
  msg_popup.addEventListener("click", e => e.stopPropagation());
  close_icon.addEventListener("click", esc);
  document.addEventListener("keydown", keydown);
};

lib.auth = (message, cb) => {
  let auth = "";

  const auth_div = lib.element.create("div", { class: "auth-div", style: "z-index: 10;" });
  const auth_content = lib.element.create("div", { class: "auth-content container box b3-4 container border-st radius-5 padding-10" });
  auth_div.append(auth_content);

  message && auth_content.append(lib.element.create("div", { class: "box b1 lucida-grande bold border center padding-5" }, `${message}`));
  auth_content.append(lib.element.create("div", { class: "box b1 lucida-grande em13 bold center padding-5 margin-top-5" }, "Digite sua senha"));

  auth_content.append(lib.element.create("input", {
    id: "auth_value",
    type: "password",
    class: "box b1 em15 bold border-st nofocus center padding-10",
    readOnly: true,
    value: ''
  }));

  const buttons = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];

  buttons.forEach(buttonValue => {
    let button;
    if (buttonValue === "0") {
      let eraseButton = lib.element.create("div", { class: "mobile-box b3 container border-st margin-top-5 height-100" });
      eraseButton.append(lib.element.create("img", { src: "https://wt-images-cdn.sfo3.cdn.digitaloceanspaces.com/lib.images/erase.png", class: "image-prop size-30 center noselect" }));
      auth_content.append(eraseButton);

      eraseButton.addEventListener("click", e => {
        e.preventDefault();

        auth = auth.slice(0, -1);
        document.getElementById("auth_value").value = auth;
      });

      button = lib.element.create("button", { class: "mobile-box b3 em15 bold border-st margin-top-5 height-100 center noselect" });
    } else {
      button = lib.element.create("button", { class: "mobile-box b3 em15 bold border-st margin-top-5 height-100 center noselect" });
    }

    button.textContent = buttonValue;

    button.addEventListener("click", e => {
      e.preventDefault();

      auth += buttonValue;
      document.getElementById("auth_value").value = auth;

      if (auth.length === 4) {
        document.removeEventListener("keydown", keydown);
        auth_div.remove();

        return cb(auth);
      }
    });

    auth_content.append(button);
  });

  let escButton = lib.element.create("div", { class: "mobile-box b3 container border-st margin-top-5 height-100" });
  escButton.append(lib.element.create("div", { class: "box b1 lucida-grande bold center noselect" }, "Cancelar"));
  auth_content.append(escButton);

  document.body.append(auth_div);

  function esc() {
    document.removeEventListener("keydown", keydown);
    auth_div.remove();
    if (typeof cb === 'function') { return cb(); }
  };

  function keydown(e) {
    e.preventDefault();
    if (e.keyCode == 27) { esc(); }
  };

  escButton.addEventListener("click", esc);
  document.addEventListener("keydown", keydown);
};

lib.pass = (cb) => {
  let pass = "";

  document.getElementById("msg").style.display = "";

  let content_div = document.getElementById("msg-content");
  content_div.innerHTML = "";
  content_div.append(lib.element.create("div", { class: "box b1 em15 bold center padding-10" }, "Digite seu passe"));

  content_div.append(lib.element.create("input", {
    id: "pass-value",
    type: "password",
    class: "box b1 em15 bold border-st nofocus center padding-10",
    readOnly: true,
    value: ''
  }));

  const buttons = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];

  buttons.forEach(buttonValue => {
    let button;
    if (buttonValue === "0") {
      eraseButton = lib.element.create("div", { class: "mobile-box b3 container border-st margin-top-5 height-100" });
      eraseButton.append(lib.element.create("img", { src: "https://wt-images-cdn.sfo3.cdn.digitaloceanspaces.com/lib.images/close.png", class: "image-prop size-30 center noselect" }));

      eraseButton.addEventListener("click", e => {
        e.preventDefault();

        pass = pass.slice(0, -1);
        document.getElementById("pass-value").value = pass;
      });
      content_div.append(eraseButton);

      button = lib.element.create("button", { class: "mobile-box b3 em15 bold border-st margin-top-5 height-100 center noselect" });
    } else {
      button = lib.element.create("button", { class: "mobile-box b3 em15 bold border-st margin-top-5 height-100 center noselect" });
    }

    button.textContent = buttonValue;

    button.addEventListener("click", e => {
      e.preventDefault();

      pass += buttonValue;
      document.getElementById("pass-value").value = pass;

      if (pass.length === 4) {
        content_div.innerHTML = "";
        lib.display("msg", "none");

        return cb(pass);
      }
    });

    content_div.append(button);
  });
};

lib.confirm = (msg, cb, confirm_message, cancel_message) => {
  const msg_div = lib.element.create("div", { class: "msg", style: "z-index: 10;" });
  const msg_popup = lib.element.create("div", { class: "msg-popup container ground mobile-box b3-4 container border-st radius-5 padding-10" });
  const alert_icon = lib.element.create("div", { class: "mobile-box a1 center" });
  alert_icon.append(lib.element.create("img", { src: "https://wt-images-cdn.sfo3.cdn.digitaloceanspaces.com/lib.images/alert.png", class: "image-prop size-30 noselect" }))
  msg_popup.append(alert_icon);

  msg_popup.append(lib.element.create("div", {
    class: "box b1 center lucida-grande bold margin-top-10"
  }, msg));

  function confirm() {
    document.removeEventListener("keydown", keydown);
    msg_div.remove();
    return cb(true);
  };

  function cancel() {
    document.removeEventListener("keydown", keydown);
    msg_div.remove();
    return cb(false);
  };

  function keydown(e) {
    e.preventDefault();
    e.keyCode == 13 && confirm(e);
    e.keyCode == 27 && cancel(e);
  };

  const confirm_btn = lib.element.create("div", {
    class: "mobile-box b2 bold btn-act radius-5 padding-10 margin-top-10 center noselect pointer",
  }, confirm_message || "Confirmar");
  confirm_btn.addEventListener("click", confirm);
  msg_popup.append(confirm_btn);

  const cancel_btn = lib.element.create("div", {
    class: "mobile-box b2 bold btn-cancel radius-5 padding-10 margin-top-10 center noselect pointer",
  }, cancel_message || "Cancelar");
  cancel_btn.addEventListener("click", cancel);
  msg_popup.append(cancel_btn);

  msg_div.append(msg_popup);
  document.body.append(msg_div);

  document.addEventListener("keydown", keydown);
};

lib.confirmAsync = (message) => {
  return new Promise(resolve => {
    lib.confirm(message, r => resolve(r));
  });
};

lib.cookieConfirm = (msg, cb) => {
  const msg_div = lib.element.create("div", { class: "msg", style: "z-index: 10;" });
  const msg_popup = lib.element.create("div", { class: "msg-popup container ground mobile-box b3-4 container border-st radius-5 padding-10" });
  const alert_icon = lib.element.create("div", { class: "mobile-box a1 center" });
  alert_icon.append(lib.element.create("img", { src: "https://wt-images-cdn.sfo3.cdn.digitaloceanspaces.com/lib.images/alert.png", class: "image-prop size-30 noselect" }))
  msg_popup.append(alert_icon);

  msg_popup.append(lib.element.create("div", {
    class: "box b1 center lucida-grande bold margin-top-10"
  }, msg));

  function confirm() {
    document.removeEventListener("keydown", keydown);
    msg_div.remove();
    return cb(true);
  };

  function cancel() {
    document.removeEventListener("keydown", keydown);
    // msg_div.remove();
    return cb(false);
  };

  function keydown(e) {
    e.preventDefault();
    e.keyCode == 13 && confirm(e);
    e.keyCode == 27 && cancel(e);
  };

  const confirm_btn = lib.element.create("div", {
    class: "mobile-box b2 bold btn-act radius-5 padding-10 margin-top-10 center noselect pointer",
  }, "Entendi");
  confirm_btn.addEventListener("click", confirm);
  msg_popup.append(confirm_btn);

  const cancel_btn = lib.element.create("div", {
    class: "mobile-box b2 bold radius-5 padding-10 margin-top-10 center noselect pointer",
    style: "background-color: #222; color: #fff"
  }, "Entender melhor");
  cancel_btn.addEventListener("click", cancel);
  msg_popup.append(cancel_btn);

  msg_div.append(msg_popup);
  document.body.append(msg_div);

  document.addEventListener("keydown", keydown);
};

// -------------------
// Date
// -------------------
lib.genDate = () => {
  let d = new Date();
  let date = "";
  if (d.getDate() < 10 && parseInt(d.getMonth()) + 1 > 9) {
    date = "0" + d.getDate() + "-" + (parseInt(d.getMonth()) + 1) + "-" + d.getFullYear();
  } else if (d.getDate() > 9 && parseInt(d.getMonth()) + 1 < 10) {
    date = "" + d.getDate() + "-0" + (parseInt(d.getMonth()) + 1) + "-" + d.getFullYear();
  } else if (parseInt(d.getDate()) < 10 && parseInt(d.getMonth()) + 1 < 10) {
    date = "0" + d.getDate() + "-0" + (parseInt(d.getMonth()) + 1) + "-" + d.getFullYear();
  } else {
    date = "" + d.getDate() + "-" + parseInt(d.getMonth() + 1) + "-" + d.getFullYear();
  };
  return date;
};

lib.genPatternDate = () => {
  let d = new Date();
  let date = "";
  if (d.getDate() < 10 && parseInt(d.getMonth()) + 1 > 9) {
    date = "" + d.getFullYear() + "-" + (parseInt(d.getMonth()) + 1) + "-0" + d.getDate();
  } else if (d.getDate() > 9 && parseInt(d.getMonth()) + 1 < 10) {
    date = "" + d.getFullYear() + "-0" + (parseInt(d.getMonth()) + 1) + "-" + d.getDate();
  } else if (parseInt(d.getDate()) < 10 && parseInt(d.getMonth()) + 1 < 10) {
    date = "" + d.getFullYear() + "-0" + (parseInt(d.getMonth()) + 1) + "-0" + d.getDate();
  } else {
    date = "" + d.getFullYear() + "-" + parseInt(d.getMonth() + 1) + "-" + d.getDate();
  };
  return date;
};

lib.genFullDate = () => {
  let d = new Date();
  let date = "";
  if (d.getDate() < 10 && parseInt(d.getMonth()) + 1 > 9) {
    date = "0" + d.getDate() + "-" + (parseInt(d.getMonth()) + 1) + "-" + d.getFullYear() + " " + d.getHours() + ":" + d.getMinutes();
  } else if (d.getDate() > 9 && parseInt(d.getMonth()) + 1 < 10) {
    date = "" + d.getDate() + "-0" + (parseInt(d.getMonth()) + 1) + "-" + d.getFullYear() + " " + d.getHours() + ":" + d.getMinutes();
  } else if (parseInt(d.getDate()) < 10 && parseInt(d.getMonth()) + 1 < 10) {
    date = "0" + d.getDate() + "-0" + (parseInt(d.getMonth()) + 1) + "-" + d.getFullYear() + " " + d.getHours() + ":" + d.getMinutes();
  } else {
    date = "" + d.getDate() + "-" + parseInt(d.getMonth() + 1) + "-" + d.getFullYear() + " " + d.getHours() + ":" + d.getMinutes();
  };
  return date;
};

lib.genTimestamp = () => {
  const currentDate = new Date();
  const timestamp = currentDate.getTime();
  return timestamp;
};

lib.convertDate = (date) => {
  if (date) {
    let str = date.split('-');
    if (str != "") {
      var convertedDate = str[2] + "-" + str[1] + "-" + str[0];
    } else {
      var convertedDate = "";
    };
    return convertedDate;
  };
  return false;
};

lib.convertDatetime = (datetime) => {
  if (datetime) {
    let str = datetime.split('T');
    if (str != "") {
      var convertedDate = lib.convertDate(str[0]) + " " + str[1];
    } else {
      var convertedDate = "";
    };
    return convertedDate;
  };
  return false;
};

lib.dateToTimestamp = (date) => {
  if (date) {
    let splited_date = date.split('-');
    splited_date.year = splited_date[0];
    splited_date.month = splited_date[1];
    splited_date.day = splited_date[2];
    date = new Date(splited_date.year, (splited_date.month - 1), splited_date.day);
    return date.getTime();
  };
  return false;
};

lib.patterndateToTimestamp = (date) => {
  if (date) {
    let splited_date = date.split('-');
    splited_date.year = splited_date[0];
    splited_date.month = splited_date[1];
    splited_date.day = splited_date[2];
    console.log(splited_date);
    date = new Date(splited_date.year, (splited_date.month - 1), splited_date.day);
    return date.getTime();
  };
  return false;
};

lib.fulldateToTimestamp = (fulldate) => {
  if (fulldate) {
    let date = fulldate.split("-");
    date.day = date[0];
    date.month = date[1];
    date.year = date[2];
    date.hour = date[3].split(":")[0];
    date.minute = date[3].split(":")[1];
    date = new Date(date.year, date.month - 1, date.day, date.hour, date.minute);
    return date.getTime();
  }
  return false;
};

lib.efidateToTimestamp = (efidate) => {
  if (efidate) {
    let date = {};
    date.day = efidate.split("T")[0].split("-")[2];
    date.month = efidate.split("T")[0].split("-")[1];
    date.year = efidate.split("T")[0].split("-")[0];
    date.hour = efidate.split("T")[1].split(":")[0];
    date.minute = efidate.split("T")[1].split(":")[1];
    date = new Date(date.year, date.month - 1, date.day, date.hour, date.minute);
    return date.getTime();
  }
  return false;
};

lib.datetimeToTimestamp = (datetime) => {
  if (datetime) {
    let date = datetime.split("T");
    date.year = date[0].split("-")[0];
    date.month = date[0].split("-")[1];
    date.day = date[0].split("-")[2];
    date.hour = date[1].split(":")[0];
    date.minute = date[1].split(":")[1];
    date = new Date(date.year, date.month - 1, date.day, date.hour, date.minute);
    return date.getTime();
  }
  return false;
};

lib.fulldateToDatetime = () => {
  return null;
};

lib.timestampDay = () => { return 86400000; }

lib.timestampToDate = (timestamp) => {
  if (timestamp) {
    let date = new Date(parseInt(timestamp));
    let day; let month; let hour; let minute;
    if (date.getDate() < 10) { day = "0" + date.getDate() } else { day = date.getDate() };
    if (date.getMonth() < 9) { month = "0" + (date.getMonth() + 1) } else { month = (date.getMonth() + 1) };
    if (date.getHours() < 10) { hour = "0" + date.getHours() } else { hour = date.getHours() };
    if (date.getMinutes() < 10) { minute = "0" + date.getMinutes() } else { minute = date.getMinutes() };
    return day + '-' + month + '-' + date.getFullYear();
  };
  return false;
};

lib.timestampToFulldate = (timestamp) => {
  if (timestamp) {
    let date = new Date(parseInt(timestamp));
    let day; let month; let hour; let minute;
    if (date.getDate() < 10) { day = "0" + date.getDate() } else { day = date.getDate() };
    if (date.getMonth() < 9) { month = "0" + (date.getMonth() + 1) } else { month = (date.getMonth() + 1) };
    if (date.getHours() < 10) { hour = "0" + date.getHours() } else { hour = date.getHours() };
    if (date.getMinutes() < 10) { minute = "0" + date.getMinutes() } else { minute = date.getMinutes() };
    return day + '-' + month + '-' + date.getFullYear() + ' ' + hour + ':' + minute;
  };
  return false;
};

lib.timestampToDatetime = (timestamp) => {
  if (timestamp) {
    let date = new Date(parseInt(timestamp));
    let day; let month; let hour; let minute;
    if (date.getDate() < 10) { day = "0" + date.getDate() } else { day = date.getDate() };
    if (date.getMonth() < 9) { month = "0" + (date.getMonth() + 1) } else { month = (date.getMonth() + 1) };
    if (date.getHours() < 10) { hour = "0" + date.getHours() } else { hour = date.getHours() };
    if (date.getMinutes() < 10) { minute = "0" + date.getMinutes() } else { minute = date.getMinutes() };
    return date.getFullYear() + '-' + month + '-' + day + 'T' + hour + ':' + minute;
  };
  return false;
};

lib.firstDayOfMonth = () => {
  let date = lib.timestampToDate(lib.genTimestamp()).split("-");
  return `01-${date[1]}-${date[2]}`;
};

lib.fillDateInput = (input) => {
  return input.valueAsDate = new Date();
};

lib.fillDatetimeInput = (input) => {
  let date = new Date();
  let day; let month; let hour; let minute;
  if (date.getDate() < 10) { day = "0" + date.getDate() } else { day = date.getDate() };
  if (date.getMonth() < 10) { month = "0" + (date.getMonth() + 1) } else { month = (date.getMonth() + 1) };
  if (date.getHours() < 10) { hour = "0" + date.getHours() } else { hour = date.getHours() };
  if (date.getMinutes() < 10) { minute = "0" + date.getMinutes() } else { minute = date.getMinutes() };
  return input.value = date.getFullYear() + '-' + month + '-' + day + 'T' + hour + ':' + minute;
};

lib.colectByMonth = (month, dates) => {
  let array = [];
  let str = [];
  for (i in dates) {
    str = dates[i].date.split('-');
    if (parseInt(str[1]) == parseInt(month)) {
      array.push(dates[i]);
    };
  };
  return array;
};

// -------------------
// Math
// -------------------
lib.roundToInt = (num, places) => {
  return (parseFloat(num).toFixed(places));
};

lib.roundValue = (value) => {
  return Math.round((value) * 100) / 100;
};

lib.formatPrice = (value) => {
  if (value === "A combinar") return value;
  const num = parseFloat(value);
  if (isNaN(num)) return "0,00";
  return num.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

lib.formatCurrency = (value) => {
  if (value === "A combinar") return value;
  return `R$${lib.formatPrice(value)}`;
};

// -------------------
// DOM manipulation
// -------------------
lib.displayDiv = (div, button, openEl, closeEl) => {
  let selectedDiv = typeof div === 'string' ? document.getElementById(div) : div;

  if (!selectedDiv) {
    console.error('Elemento div não encontrado');
    return;
  }

  if (button.nodeName == "IMG") {
    if (selectedDiv.style.display == "none") {
      if (button && openEl && closeEl) { button.src = closeEl; };
      selectedDiv.style.display = "";
    } else if (selectedDiv.style.display == "") {
      if (button && openEl && closeEl) { button.src = openEl; };
      selectedDiv.style.display = "none";
    };
  } else {
    if (selectedDiv.style.display == "none") {
      if (button && openEl && closeEl) { button.innerHTML = closeEl; };
      selectedDiv.style.display = "";
    } else if (selectedDiv.style.display == "") {
      if (button && openEl && closeEl) { button.innerHTML = openEl; };
      selectedDiv.style.display = "none";
    };
  }
};

lib.clearInnerHtml = (target) => {
  target.innerHTML = "";
};

lib.displayMenuText = (button, openText, closeText) => {
  if (button.innerHTML == openText) { button.innerHTML = closeText; }
  else if (button.innerHTML == closeText) { button.innerHTML = openText; };
};

lib.clearTable = (table, location) => {
  document.getElementById(table).innerHTML = "NENHUM REGISTRO ENCONTRADO";
  $('#' + location + 'Previous').prop('disabled');
  $('#' + location + 'Next').prop('disabled');
  $('#' + location + 'PageNumber').text('0');
};

lib.noRecord = (table) => {
  document.getElementById(table).innerHTML = "NENHUM REGISTRO ENCONTRADO";
};

lib.fillSelect = (selectLocation, location, route, method) => {
  $.ajax({
    url: route,
    method: method,
    success: (response) => {
      var select = document.getElementById(location);
      select.innerHTML = "";
      select.innerHTML += "<option value='0'>" + selectLocation + "</option>"
      for (i in response) {
        select.innerHTML += "<option value='" + response[i].id + "'>" + response[i].name + "</option>"
      };
    }
  });
};

lib.findCheckedRadios = (radio_name) => {
  let radios = document.getElementsByName(radio_name);
  for (let i in radios) {
    if (radios[i].checked) {
      return radios[i];
    };
  };
  radios = false;
  radios.value = false;
  return radios;
};

lib.splitTextBy = (text, split_string) => {
  if (text && split_string) {
    let splited_text = text.split(split_string);
    return splited_text;
  };
  return false;
};

lib.splitSelectTextBy = (select, string) => {
  if (select && string) {
    let row = select.options[select.selectedIndex].text;
    let splited_text = row.split(string);
    splited_text.select = { value: select.value };
    return splited_text;
  };
  return false;
};

lib.capitalizeFirst = (words) => {
  let separateWord = words.toLowerCase().split(' ');
  for (let i = 0; i < separateWord.length; i++) {
    separateWord[i] = separateWord[i].charAt(0).toUpperCase() +
      separateWord[i].substring(1);
  };
  return separateWord.join(' ');
};

lib.clearSelect = (select) => {
  select.innerHTML = "";
  select.innerHTML += "<option value='0'>Sem resultados</option>"
};

lib.focus = (input) => {
  if (input.id) {
    document.getElementById(input.id).focus();
  } else {
    input.focus();
  };
};


//Mask
lib.mask = {};

lib.mask.phone = (input) => {
  let number = input.value.replace(/\D/g, '');

  if (number.length == 0) {
    input.value = '';
  } else if (number.length <= 2) {
    input.value = '(' + number;
  } else if (number.length <= 6) {
    input.value = '(' + number.substring(0, 2) + ') ' + number.substring(2);
  } else if (number.length <= 10) {
    input.value = '(' + number.substring(0, 2) + ') ' + number.substring(2, 6) + '-' + number.substring(6);
  } else {
    input.value = '(' + number.substring(0, 2) + ') ' + number.substring(2, 7) + '-' + number.substring(7);
  }
};

lib.format = {};

lib.format.phone = (value) => {
  let phoneNumber = value.replace(/\D/g, '');

  let phone;

  if (phoneNumber.length == 0) {
    phone = '';
  } else if (phoneNumber.length <= 2) {
    phone = '(' + phoneNumber;
  } else if (phoneNumber.length <= 6) {
    phone = '(' + phoneNumber.substring(0, 2) + ') ' + phoneNumber.substring(2);
  } else if (phoneNumber.length <= 10) {
    phone = '(' + phoneNumber.substring(0, 2) + ') ' + phoneNumber.substring(2, 6) + '-' + phoneNumber.substring(6);
  } else {
    phone = '(' + phoneNumber.substring(0, 2) + ') ' + phoneNumber.substring(2, 7) + '-' + phoneNumber.substring(7);
  }

  return phone;
};

lib.format.cpfCnpj = (value) => {
  let input = { value: String(value || "") };
  let digits = input.value.replace(/\D/g, "");
  if (digits.length > 11) { lib.mask.cnpj(input); }
  else { lib.mask.cpf(input); }
  return input.value;
};

lib.phoneDigits = (value) => {
  if (value == null || value === "") return value;
  return String(value).replace(/\D/g, "");
};

lib.mask.cnpj = (input) => {
  let cnpj = input.value.replace(/\D/g, '');

  if (cnpj.length == 0) {
    input.value = '';
  } else if (cnpj.length <= 2) {
    input.value = cnpj;
  } else if (cnpj.length <= 5) {
    input.value = cnpj.substring(0, 2) + '.' + cnpj.substring(2);
  } else if (cnpj.length <= 8) {
    input.value = cnpj.substring(0, 2) + '.' + cnpj.substring(2, 5) + '.' + cnpj.substring(5);
  } else if (cnpj.length <= 12) {
    input.value = cnpj.substring(0, 2) + '.' + cnpj.substring(2, 5) + '.' + cnpj.substring(5, 8) + '/' + cnpj.substring(8);
  } else {
    input.value = cnpj.substring(0, 2) + '.' + cnpj.substring(2, 5) + '.' + cnpj.substring(5, 8) + '/' + cnpj.substring(8, 12) + '-' + cnpj.substring(12);
  }
};

lib.mask.cpf = (input) => {
  let cpf = input.value.replace(/\D/g, '');

  if (cpf.length == 0) {
    input.value = '';
  } else if (cpf.length <= 3) {
    input.value = cpf;
  } else if (cpf.length <= 6) {
    input.value = cpf.substring(0, 3) + '.' + cpf.substring(3);
  } else if (cpf.length <= 9) {
    input.value = cpf.substring(0, 3) + '.' + cpf.substring(3, 6) + '.' + cpf.substring(6);
  } else {
    input.value = cpf.substring(0, 3) + '.' + cpf.substring(3, 6) + '.' + cpf.substring(6, 9) + '-' + cpf.substring(9);
  }
};

lib.verifyEmail = (email) => {
  var regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (regex.test(email)) {
    return true;
  } else {
    return false;
  }
};

// -------------------
// Canvas
// -------------------
lib.rect = (ctx, c, x, y, w, h) => {
  ctx.fillStyle = c;
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.closePath();
  ctx.fill();
};

lib.drawRects = (ctx, rects) => {
  for (i in rects) {
    ctx.fillStyle = rects[i].color;
    lib.rect(ctx, rects[i].x, rects[i].y, rects[i].width, rects[i].height);
  };
};

lib.collide = (r1, r2) => {
  let dx = (r1.x + r1.width / 2) - (r2.x + r2.width / 2);
  let dy = (r1.y + r1.height / 2) - (r2.y + r2.height / 2);
  let width = (r1.width + r2.width) / 2;
  let height = (r1.height + r2.height) / 2;
  let crossWidth = width * dy;
  let crossHeight = height * dx;
  let collision = 'none';
  //
  if (Math.abs(dx) <= width && Math.abs(dy) <= height) {
    if (crossWidth > crossHeight) {
      collision = (crossWidth > (-crossHeight)) ? 'bottom' : 'left';
    } else {
      collision = (crossWidth > -(crossHeight)) ? 'right' : 'top';
    }
  }
  return (collision);
};

// -------------------
// Carousel
// -------------------

// Simple Image or Banner Carousel
// lib.Carousel = (box, render, items, pagination) => {
// 	box.innerHTML = "";

// 	let items_div = lib.element.create("div", { class: "box b1 container h-center" });
// 	box.append(items_div);

// 	let navigation_div = lib.element.create("div", { class: "box b1 container h-center padding-10" });
// 	box.append(navigation_div);

// 	let navigation_previous = lib.element.create("button", { class: "mobile-box b12 container noborder noselect center" });
// 	navigation_previous.append(lib.element.create("img", { src: "/images/icon/back-arrow-black.png", class: "size-30 center" }));
// 	navigation_div.append(navigation_previous);
// 	let navigation_span = lib.element.create("span", { class: "mobile-box b2 lucida-grande bold nowrap center noselect" });
// 	navigation_div.append(navigation_span);
// 	let navigation_next = lib.element.create("button", { class: "mobile-box b12 container noborder noselect center" });
// 	navigation_next.append(lib.element.create("img", { src: "/images/icon/next-arrow-black.png", class: "size-30 center" }));
// 	navigation_div.append(navigation_next);

// 	const CarouselPaging = () => {
// 		items_div.innerHTML = "";
// 		render(items, pagination, items_div);
// 	};

// 	const CarouselNavigation = () => {
// 		if (!items.length) {
// 			navigation_previous.disabled = true;
// 			navigation_span.innerHTML = " 0 ";
// 			navigation_next.disabled = true;
// 		};

// 		if (items.length && items.length <= pagination.pageSize) {
// 			navigation_previous.disabled = true;
// 			navigation_span.innerHTML = "1 de 1";
// 			navigation_next.disabled = true;
// 		};

// 		if (items.length > pagination.pageSize) {
// 			if (pagination.page <= 0) {
// 				pagination.page = 0;
// 				navigation_previous.disabled = true;
// 				navigation_span.innerHTML = "" + (pagination.page + 1) + " de " + Math.ceil(items.length / pagination.pageSize);
// 				navigation_next.disabled = false;
// 			};

// 			if (pagination.page > 0 && pagination.page < (items.length / pagination.pageSize) - 1) {
// 				navigation_previous.disabled = false;
// 				navigation_span.innerHTML = "" + (pagination.page + 1) + " de " + Math.ceil(items.length / pagination.pageSize);
// 				navigation_next.disabled = false;
// 			};

// 			if (pagination.page >= (items.length / pagination.pageSize) - 1) {
// 				navigation_previous.disabled = false;
// 				navigation_span.innerHTML = "" + (pagination.page + 1) + " de " + Math.ceil(items.length / pagination.pageSize);
// 				navigation_next.disabled = true;
// 			};

// 			if (navigation_previous.disabled == true) {
// 				lib.removeCss(navigation_previous, ["icon"]);
// 				lib.addCss(navigation_previous, ["opacity-03"]);
// 			} else {
// 				lib.addCss(navigation_previous, ["icon"]);
// 				lib.removeCss(navigation_previous, ["opacity-03"]);
// 			}

// 			if (navigation_next.disabled == true) {
// 				lib.removeCss(navigation_next, ["icon"]);
// 				lib.addCss(navigation_next, ["opacity-03"]);
// 			} else {
// 				lib.addCss(navigation_next, ["icon"]);
// 				lib.removeCss(navigation_next, ["opacity-03"]);
// 			}
// 		};
// 	};

// 	//events
// 	navigation_previous.onclick = function () {
// 		if (pagination.page > 0) {
// 			pagination.page--;
// 			CarouselPaging();
// 			CarouselNavigation();
// 		};

// 		box.scrollIntoView({ behavior: 'smooth' });
// 	};

// 	navigation_next.onclick = function () {
// 		if (pagination.page < items.length / pagination.pageSize - 1) {
// 			pagination.page++;
// 			CarouselPaging();
// 			CarouselNavigation();
// 		};

// 		box.scrollIntoView({ behavior: 'smooth' });
// 	};

// 	CarouselPaging();
// 	CarouselNavigation();
// };

lib.Carousel = (box, render, items, pagination) => {
  box.innerHTML = "";

  let items_div = lib.element.create("div", { class: "box b1 container h-center" });
  box.append(items_div);

  let navigation_div = lib.element.create("div", { class: "box b1 container h-center margin-top-10 margin-bottom-10" });
  box.append(navigation_div);

  let navigation_previous = lib.element.create("button", {
    class: "mobile-box b6 rem09 impact bold border radius-3 padding-5 center pointer noselect"
  }, "<");
  navigation_div.append(navigation_previous);

  let navigation_page_container = lib.element.create("div", { class: "mobile-box b2 container h-center v-center" });
  navigation_div.append(navigation_page_container);

  let navigation_next = lib.element.create("button", {
    class: "mobile-box b6 rem09 impact bold border radius-3 padding-5 center pointer noselect"
  }, ">");
  navigation_div.append(navigation_next);

  const CarouselPaging = () => {
    items_div.innerHTML = "";
    render(items, pagination, items_div);
  };

  const createPageButtons = () => {
    navigation_page_container.innerHTML = "";

    const totalPages = Math.ceil(items.length / pagination.pageSize);
    const maxVisibleButtons = 5; // Número de botões visíveis ao mesmo tempo

    // Calcula o intervalo de botões visíveis
    let startPage = Math.max(0, pagination.page - Math.floor(maxVisibleButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxVisibleButtons);

    // Se o número de páginas visíveis for menor que o máximo, ajusta o início
    if (endPage - startPage < maxVisibleButtons) {
      startPage = Math.max(0, endPage - maxVisibleButtons);
    }

    // Cria botões para as páginas visíveis
    for (let i = startPage; i < endPage; i++) {
      let pageButton = lib.element.create("div", {
        class: "mobile-box b5 avante-garde rem09 bold box-hover shadow-lg-st radius-3 padding-10 center pointer noselect"
      }, (i + 1));

      if (i === pagination.page) {
        lib.addCss(pageButton, ["disabled", "bg-disabled"]);
      }

      pageButton.onclick = () => {
        pagination.page = i;
        CarouselPaging();
        CarouselNavigation();
        box.scrollIntoView({ behavior: 'smooth' });
      };

      navigation_page_container.append(pageButton);
    }
  };

  const CarouselNavigation = () => {
    if (!items.length) {
      navigation_previous.disabled = true;
      navigation_next.disabled = true;
      return;
    }

    if (pagination.page <= 0) {
      navigation_previous.disabled = true;
    } else {
      navigation_previous.disabled = false;
    }

    if (pagination.page >= Math.ceil(items.length / pagination.pageSize) - 1) {
      navigation_next.disabled = true;
    } else {
      navigation_next.disabled = false;
    }

    // Atualiza os botões de navegação das páginas
    createPageButtons();
  };

  //events
  navigation_previous.onclick = function () {
    if (pagination.page > 0) {
      pagination.page--;
      CarouselPaging();
      CarouselNavigation();
    };

    box.scrollIntoView({ behavior: 'smooth' });
  };

  navigation_next.onclick = function () {
    if (pagination.page < items.length / pagination.pageSize - 1) {
      pagination.page++;
      CarouselPaging();
      CarouselNavigation();
    };

    box.scrollIntoView({ behavior: 'smooth' });
  };

  CarouselPaging();
  CarouselNavigation();
};

lib.carousel = {};

lib.carousel.render = (carousel_name) => {
  let slides = document.querySelectorAll("[data-js='" + carousel_name + "']");
  let prevButton = document.querySelector("[data-js='" + carousel_name + "-prev']");
  let pageDiv = document.querySelector("[data-js='" + carousel_name + "-page']");
  let nextButton = document.querySelector("[data-js='" + carousel_name + "-next']");

  let lastSlideIndex = slides.length - 1;
  let currentSlideIndex = 0;

  let updatePage = currentPage => {
    pageDiv.innerHTML = `${currentPage} de ${slides.length}`;
  };

  let manipulateSlidesClasses = correctSlideIndex => {
    slides.forEach(slide => slide.classList.remove("display-block"));
    slides[correctSlideIndex].classList.add("display-block");
  };

  prevButton.addEventListener("click", () => {
    let correctSlideIndex = currentSlideIndex === 0
      ? currentSlideIndex = lastSlideIndex
      : --currentSlideIndex

    manipulateSlidesClasses(correctSlideIndex);
    updatePage(currentSlideIndex + 1);
  });

  nextButton.addEventListener("click", () => {
    let correctSlideIndex = currentSlideIndex === lastSlideIndex
      ? currentSlideIndex = 0
      : ++currentSlideIndex;

    manipulateSlidesClasses(correctSlideIndex);
    updatePage(currentSlideIndex + 1);
  });

  updatePage(currentSlideIndex + 1);
};

lib.carousel.execute = (box, render, response, pagination) => {
  document.getElementById(box).children.namedItem("carousel-navigation").children.namedItem("carousel-previous").onclick = function () {
    window.scrollTo(0, document.getElementById(box).getBoundingClientRect().top - document.body.getBoundingClientRect().top);
    if (pagination.page > 0) {
      pagination.page--;
      lib.carousel.paging(render, response, pagination);
      lib.carousel.navigation(box, response, pagination);
    };
  };

  document.getElementById(box).children.namedItem("carousel-navigation").children.namedItem("carousel-next").onclick = function () {
    window.scrollTo(0, document.getElementById(box).getBoundingClientRect().top - document.body.getBoundingClientRect().top);
    if (pagination.page < response.length / pagination.pageSize - 1) {
      pagination.page++;
      lib.carousel.paging(render, response, pagination);
      lib.carousel.navigation(box, response, pagination);
    };
  };
  lib.carousel.paging(render, response, pagination);
  lib.carousel.navigation(box, response, pagination);
};

lib.carousel.paging = (render, response, pagination) => {
  render(response, pagination);
};

lib.carousel.navigation = (box, response, pagination) => {
  if (!response.length) {
    document.getElementById(box).children.namedItem("carousel-navigation").children.namedItem("carousel-previous").disabled = true;
    document.getElementById(box).children.namedItem("carousel-navigation").children.namedItem("carousel-page").innerHTML = " 0 ";
    document.getElementById(box).children.namedItem("carousel-navigation").children.namedItem("carousel-next").disabled = true;
  };

  if (response.length && response.length <= pagination.pageSize) {
    document.getElementById(box).children.namedItem("carousel-navigation").children.namedItem("carousel-previous").disabled = true;
    document.getElementById(box).children.namedItem("carousel-navigation").children.namedItem("carousel-page").innerHTML = "1 de 1";
    document.getElementById(box).children.namedItem("carousel-navigation").children.namedItem("carousel-next").disabled = true;
  };

  if (response.length > pagination.pageSize) {
    if (pagination.page <= 0) {
      pagination.page = 0;
      document.getElementById(box).children.namedItem("carousel-navigation").children.namedItem("carousel-previous").disabled = true;
      document.getElementById(box).children.namedItem("carousel-navigation").children.namedItem("carousel-page").innerHTML = "" + (pagination.page + 1) + " de " + Math.ceil(response.length / pagination.pageSize);
      document.getElementById(box).children.namedItem("carousel-navigation").children.namedItem("carousel-next").disabled = false;
    };

    if (pagination.page > 0 && pagination.page < (response.length / pagination.pageSize) - 1) {
      document.getElementById(box).children.namedItem("carousel-navigation").children.namedItem("carousel-previous").disabled = false;
      document.getElementById(box).children.namedItem("carousel-navigation").children.namedItem("carousel-page").innerHTML = "" + (pagination.page + 1) + " de " + Math.ceil(response.length / pagination.pageSize);
      document.getElementById(box).children.namedItem("carousel-navigation").children.namedItem("carousel-next").disabled = false;
    };

    if (pagination.page >= (response.length / pagination.pageSize) - 1) {
      document.getElementById(box).children.namedItem("carousel-navigation").children.namedItem("carousel-previous").disabled = false;
      document.getElementById(box).children.namedItem("carousel-navigation").children.namedItem("carousel-page").innerHTML = "" + (pagination.page + 1) + " de " + Math.ceil(response.length / pagination.pageSize);
      document.getElementById(box).children.namedItem("carousel-navigation").children.namedItem("carousel-next").disabled = true;
    };
  };
}

lib.carousel.generic = (items, parentElement, cb) => {
  var isDown = false;
  var isDragging = false;
  var startPageX;
  var startPageY;
  var scrollLeft;

  items.forEach(item => {
    parentElement.append(item);

    cb && item.addEventListener("click", () => {
      if (!isDragging) { cb(item); }
    });
  });

  // After a drag, suppress click on children (e.g. image zoom / links) when mouseup lands on the same element
  parentElement.addEventListener('click', function (e) {
    if (isDragging) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, true);

  // Prevent native link/image drag ghost from stealing the carousel drag
  parentElement.addEventListener('dragstart', function (e) {
    e.preventDefault();
  });

  parentElement.addEventListener('mousedown', function (e) {
    isDown = true;
    startPageX = e.pageX;
    scrollLeft = parentElement.scrollLeft;

    if (e.target.closest('a, img')) {
      e.preventDefault();
    }
  });

  parentElement.addEventListener('mouseleave', function () {
    isDown = false;
  });

  parentElement.addEventListener('mouseup', function () {
    setTimeout(function () { isDragging = false; }, 50);
    isDown = false;
  });

  items.length > 1 && parentElement.addEventListener('mousemove', function (e) {
    if (!isDown) return;
    isDragging = true;
    e.preventDefault();
    var walk = (e.pageX - startPageX) * 2;
    parentElement.scrollLeft = scrollLeft - walk;
  });

  // Para detecção de toque em dispositivos móveis
  parentElement.addEventListener('touchstart', function (e) {
    isDown = true;
    startPageX = e.touches[0].pageX;
    startPageY = e.touches[0].pageY;
    scrollLeft = parentElement.scrollLeft;
    scrollTop = parentElement.scrollTop;
  });

  parentElement.addEventListener('touchend', function () {
    setTimeout(function () { isDragging = false; }, 50);
    isDown = false;
  });

  items.length > 1 && parentElement.addEventListener('touchmove', function (e) {
    if (!isDown) return;
    var walkX = (e.touches[0].pageX - startPageX) * 2;
    var walkY = (e.touches[0].pageY - startPageY) * 2;

    if (Math.abs(walkY) > Math.abs(walkX)) {
      // Movimento vertical maior que o horizontal, permite a rolagem vertical
      return;
    }

    isDragging = true;
    e.preventDefault(); // Impede a rolagem da página

    parentElement.scrollLeft = scrollLeft - walkX;
  });
};

// -------------------
// Array
// -------------------
lib.index = {};

lib.index.last = (objects) => {
  return objects.length - 1;
};

lib.sort = (arr, prop, order = 'asc') => {
  return arr.sort((a, b) => {
    const valueA = a[prop];
    const valueB = b[prop];

    // Verifica se ambos são strings vazias
    if (valueA === '' && valueB === '') {
      return 0;
    } else if (valueA === '') {
      return -1;
    } else if (valueB === '') {
      return 1;
    }

    // Verifica se são números
    const isNumberA = !isNaN(valueA);
    const isNumberB = !isNaN(valueB);

    if (isNumberA && isNumberB) {
      // Se ambos são números, compara numericamente
      return Number(valueA) - Number(valueB);
    } else if (isNumberA) {
      // Se apenas o primeiro é número, coloca-o antes
      return -1;
    } else if (isNumberB) {
      // Se apenas o segundo é número, coloca-o antes
      return 1;
    } else {
      // Se nenhum é número, compara alfabeticamente
      return valueA.localeCompare(valueB);
    }
  }).sort((a, b) => (order.toLowerCase() === 'desc') ? -1 : 1);
};

lib.sort2 = (arr, key, order) => {
  return arr.sort((a, b) => {
    if (order == "des") {
      return b[key].localeCompare(a[key]);
    } else {
      return a[key].localeCompare(b[key]);
    }
  });
};

lib.sort3 = (arr, key, order) => {
  return arr.sort((a, b) => {
    let itemA = a[key];
    let itemB = b[key];

    // Verifica se os itens são números ou strings
    const isNumberA = !isNaN(parseFloat(itemA)) && isFinite(itemA);
    const isNumberB = !isNaN(parseFloat(itemB)) && isFinite(itemB);

    if (order == "desc") {
      if (isNumberA && isNumberB) {
        return itemB - itemA; // Ordenação numérica decrescente
      } else {
        return itemB.toString().localeCompare(itemA.toString()); // Ordenação alfabética decrescente
      }
    } else {
      if (isNumberA && isNumberB) {
        return itemA - itemB; // Ordenação numérica crescente
      } else {
        return itemA.toString().localeCompare(itemB.toString()); // Ordenação alfabética crescente
      }
    }
  });
};

// -------------------
// pre code format
// -------------------
lib.formatHTML = (string) => {
  string = string.replaceAll('<', '&lt;');
  string = string.replaceAll('>', '&gt;');

  let html = "";
  html += "<pre class='box b1 em09'><code>";
  html += string;
  html += "</code></pre>";
  return html;
};

// -------------------
// String
// -------------------
lib.removeChar = (string, regex) => {
  for (let i in regex) { string = string.replaceAll(regex[i], ""); };
  return string;
};

lib.replaceChar = (string, regex, content) => {
  string = string.replaceAll(regex, content);
  return string;
};

lib.stripAccents = (string) => {
  return String(string).normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};

lib.categorySlug = (name) => {
  return lib.stripAccents(String(name).trim()).replace(/\s+/g, '-');
};

lib.hasForbiddenChar = (url) => {
  const forbiddenChars = /[#%&{}\s\\<>*?/$!'":@+,`|[\]^~();¨´áãéíóõúâêîôûàèìòùäëïöüç~]/g;
  return forbiddenChars.test(url);
};

lib.hasSpecialChar = (url) => {
  const forbiddenChars = /[#%&{}\s\\<>*?/$!'":@+,`|[\]^~();¨´~]/g;
  return forbiddenChars.test(url);
};

lib.clearString = (str) => {
  const forbiddenChars = /[#%&{}\s\\<>*?/$!'":@+,`|[\]^~();¨´áãéíóõúâêîôûàèìòùäëïöüç~_-]/g;
  return str.replace(forbiddenChars, '');
};

lib.isValidNumber = (value) => {
  if (value !== null && value !== "" && !isNaN(value)) { return true; }
  else { return false; }
};

// -------------------
// Dropdown
// -------------------
lib.dropdown = {};

lib.dropdown.wrapper = (wrapper_class = "box b1", attributes = {}) => {
  return lib.element.create("div", {
    class: `${wrapper_class} container dropdown`,
    ...attributes
  });
};

lib.dropdown.element = (attributes = {}) => {
  return lib.element.create("input", {
    type: "text",
    role: "presentation",
    autocomplete: "off",
    "data-id": "",
    ...attributes
  });
};

lib.dropdown.content = (attributes = {}) => {
  return lib.element.create("div", {
    class: "ground dropdown-content border",
    ...attributes
  });
};

lib.dropdown.render = (objects, input_id, dropdown_id, target, key, props) => {
  if (objects.length) {
    let html = "";
    for (i in objects) {
      html += "<li><input type='button' class='box b1 box-hover noborder wrapper padding-10' data-id='" + objects[i][key] + "' value='";
      for (j in props) {
        if (props.length - 1 > j) {
          html += objects[i][props[j]] + " | ";
        } else if (props.length - 1 == j) {
          html += objects[i][props[j]];
        };
      };
      html += "' onclick='lib.dropdown.fill." + target + "(this, `" + input_id + "`, `" + dropdown_id + "`)'></li>";
    };
    document.getElementById(dropdown_id).innerHTML = html;
  } else {
    document.getElementById(dropdown_id).innerHTML = "";
  };
};

lib.dropdown.fill = {}

lib.dropdown.fill.input = (dropdown_input, input_id, dropdown_id) => {
  document.getElementById(input_id).dataset.id = dropdown_input.dataset.id;
  document.getElementById(input_id).value = dropdown_input.value;
  document.getElementById(input_id).readOnly = true;

  document.getElementById(dropdown_id).innerHTML = "";
};

lib.dropdown.input = (objects, input, content, props, func) => {
  content.innerHTML = "";
  content.style.display = 'block';

  input.onclick = function (event) {
    event.stopPropagation();
    if (this.readOnly) { this.value = ''; this.dataset.id = ''; this.readOnly = false; }
    content.style.display = 'block';
  };

  content.onclick = function (event) {
    event.stopPropagation();
  };

  objects.forEach(obj => {
    const item = lib.element.create("div", {
      class: "box a1 container box-hover em09 border-lg-st padding-3 pointer",
      'data-id': obj["id"]
    });

    for (let i in props) {
      item.append(lib.element.info(props[i][2], props[i][1], obj[props[i][0]]));
    };

    item.onclick = function (event) {
      input.dataset.id = this.dataset.id;
      input.value = props.reduce((value, prop, currI, arr) => {
        if (currI == arr.length - 1) { value += `${obj[prop[0]]}`; }
        else { value += `${obj[prop[0]]} | `; }
        return value;
      }, "");
      input.readOnly = true;
      content.style.display = 'none';
      func && obj.id && func(obj.id);
    };

    content.appendChild(item);
  });

  document.addEventListener('click', function (event) {
    if (content.style.display == "block") {
      lib.display(content, "none");
    }
  });
};

lib.Dropdown = {};

lib.Dropdown.setEvents = (dropdown_box, dropdown_ul) => {
  document.getElementById(dropdown_box).addEventListener("mouseover", e => {
    lib.display(dropdown_ul, "");
  });

  document.getElementById(dropdown_box).addEventListener("mouseout", e => {
    lib.display(dropdown_ul, "none");
  });
};

lib.Dropdown.render = (objects, input, dropdown_id, props) => {
  let dropdown_ul = document.getElementById(dropdown_id);
  dropdown_ul.innerHTML = "";

  if (!objects.length) { return false; }

  objects.forEach(obj => {
    let dropdown_li = lib.element.create("li", {});

    let obj_info = "";
    for (let i in props) {
      if (i != props.length - 1) { obj_info += `${obj[props[i]]} | ` }
      else { obj_info += `${obj[props[i]]}` }
    };

    dropdown_li = lib.element.create("input", {
      class: "box b1 lucida-grande bold box-hover wrapper padding-10 border pointer",
      'data-id': obj["id"],
      value: obj_info,
      onclick: `lib.Dropdown.fill(this, '${input.id}', '${dropdown_id}');`
    });
    dropdown_ul.append(dropdown_li);
  });
};

lib.Dropdown.fill = (dropdown_input, input_id, dropdown_id) => {
  document.getElementById(input_id).dataset.id = dropdown_input.dataset.id;
  document.getElementById(input_id).value = dropdown_input.value;
  document.getElementById(input_id).readOnly = true;

  document.getElementById(dropdown_id).innerHTML = "";
};

// Adress API
lib.address = {};

lib.address.get = async (CEP) => {
  let response = await fetch("https://viacep.com.br/ws/" + CEP + "/json/");
  response = await response.json();

  if (API.verifyResponse(response)) { return false };

  return response;
};

lib.address.fillForm = async (cep, form) => {
  let address = await lib.address.get(cep);
  if (address.logradouro) { document.getElementById(form).elements.namedItem("street").value = address.logradouro; };
  if (address.complemento) { document.getElementById(form).elements.namedItem("complement").value = address.complemento; };
  if (address.bairro) { document.getElementById(form).elements.namedItem("neighborhood").value = address.bairro; };
  if (address.localidade) { document.getElementById(form).elements.namedItem("city").value = address.localidade; };
  if (address.uf) { document.getElementById(form).elements.namedItem("state").value = address.uf; };
};

lib.listarEstados = () => {
  return [
    { codigo_uf: 27, uf: 'AL', unidade_federativa: 'Alagoas' },
    { codigo_uf: 12, uf: 'AC', unidade_federativa: 'Acre' },
    { codigo_uf: 16, uf: 'AP', unidade_federativa: 'Amapá' },
    { codigo_uf: 13, uf: 'AM', unidade_federativa: 'Amazonas' },
    { codigo_uf: 29, uf: 'BA', unidade_federativa: 'Bahia' },
    { codigo_uf: 23, uf: 'CE', unidade_federativa: 'Ceará' },
    { codigo_uf: 53, uf: 'DF', unidade_federativa: 'Distrito Federal' },
    { codigo_uf: 32, uf: 'ES', unidade_federativa: 'Espírito Santo' },
    { codigo_uf: 52, uf: 'GO', unidade_federativa: 'Goías' },
    { codigo_uf: 21, uf: 'MA', unidade_federativa: 'Maranhão' },
    { codigo_uf: 51, uf: 'MT', unidade_federativa: 'Mato Grosso' },
    { codigo_uf: 50, uf: 'MS', unidade_federativa: 'Mato Grosso do Sul' },
    { codigo_uf: 31, uf: 'MG', unidade_federativa: 'Minas Gerais' },
    { codigo_uf: 15, uf: 'PA', unidade_federativa: 'Pará' },
    { codigo_uf: 25, uf: 'PB', unidade_federativa: 'Paraíba' },
    { codigo_uf: 41, uf: 'PR', unidade_federativa: 'Paraná' },
    { codigo_uf: 26, uf: 'PE', unidade_federativa: 'Pernambuco' },
    { codigo_uf: 22, uf: 'PI', unidade_federativa: 'Piauí' },
    { codigo_uf: 33, uf: 'RJ', unidade_federativa: 'Rio de Janeiro' },
    { codigo_uf: 24, uf: 'RN', unidade_federativa: 'Rio Grande do Norte' },
    { codigo_uf: 43, uf: 'RS', unidade_federativa: 'Rio Grande do Sul' },
    { codigo_uf: 11, uf: 'RO', unidade_federativa: 'Rondônia' },
    { codigo_uf: 14, uf: 'RR', unidade_federativa: 'Roraíma' },
    { codigo_uf: 42, uf: 'SC', unidade_federativa: 'Santa Catarina' },
    { codigo_uf: 35, uf: 'SP', unidade_federativa: 'São Paulo' },
    { codigo_uf: 28, uf: 'SE', unidade_federativa: 'Sergipe' },
    { codigo_uf: 17, uf: 'TO', unidade_federativa: 'Tocantins' },
  ];
};

lib.listarCidadesPorEstado = async (UF) => {
  let cidades = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${UF}/distritos`);
  cidades = await cidades.json();

  return cidades;
};

lib.eventEmmiter = (element, event) => {
  let e = new Event(event);
  element.dispatchEvent(e);
};

lib.copyToClipboard = (output, element, regex) => {
  let text;
  if (output && element) { text = document.getElementById(output).elements.namedItem(element); }
  else if (output && !element) { text = document.getElementById(output); }
  else { alert("Texto inválido!"); return false; }
  text.value = lib.removeChar(text.value, regex);
  text.select();
  document.execCommand("copy");
  alert("Copiado para área de transferência");
  return true;
};

lib.openExternalLink = (url) => {
  if ('http'.substr(0, 4) == url.substr(0, 4)) {
    window.open(url, '_blank');
  } else {
    url = "https://" + url;
    window.open(url, '_blank');
  };
};

lib.kart = function (name, variable, props) {
  this.name = name;
  this.variable = variable;
  this.items = [];
  this.props = props;

  this.insert = function (key, item) {
    if (key) {
      for (let i in this.items) {
        if (this.items[i][key] == item[key]) {
          alert("Você já incluiu este produto no carrinho.");
          return false;
        };
      };
    };

    this.items.push(item);
    this.update(key);

    let stringified_kart = JSON.stringify(this.items);

    return true;
  };

  this.list = function (kart, props) {
    if (this.items.length) {
      let html = "";
      html += "<tr>";
      for (i in props) {
        html += "<td class='padding-5 center em06'>" + Object.entries(props[i])[0][1] + "</td>";
      };
      html += "</tr>";
      for (i in this.items) {
        html += "<tr class='border'>";
        for (j in props) {
          if (j == 0) {
            html += "<td class='padding-5 em09'>" + this.items[i][Object.entries(props[j])[0][0]] + "</td>";
          } else {
            html += "<td class='padding-5 em09'>" + this.items[i][Object.entries(props[j])[0][0]] + "</td>";
          };
        };
        html += "<td class='padding-3'><img class='size-15 icon padding-3 pointer' src='/images/icon/decrease.png' onclick='" + this.variable + ".decrease(" + this.items[i].id + ")'></td>";
        html += "<td><input type='text' id='" + this.variable + "-" + this.items[i].id + "' class='width-50 em11 border-bottom center' onchange='" + this.variable + ".updateAmount(" + this.items[i].id + ", this.value);lib.focus(this)' value='" + this.items[i].amount + "'></td>";
        html += "<td class='padding-3'><img class='size-15 icon padding-3 pointer' src='/images/icon/increase.png' onclick='" + this.variable + ".increase(" + this.items[i].id + ")'></td>";
        html += "<td class='padding-3'><img class='size-20 icon padding-3 pointer' src='/images/icon/trash.png' onclick='" + this.variable + ".remove(" + this.items[i].id + ")'></td>";
        html += "</tr>";
      };
      document.getElementById(this.name + "-table").innerHTML = html;
    } else {
      document.getElementById(this.name + "-table").innerHTML = "";
    };
  };

  this.update = function (key) {
    return this.items = this.items.sort((a, b) => {
      return a[key] - b[key];
    });
  };

  this.decrease = (obj_id) => {
    for (i in this.items) {
      if (this.items[i].id == obj_id && this.items[i].amount > 1) {
        this.items[i].amount -= 1;
      };
    };
    let stringified_kart = JSON.stringify(this.items);
    this.list(this.variable, this.props);
  };

  this.increase = (obj_id) => {
    for (let i in this.items) {
      if (this.items[i].id == obj_id) {
        this.items[i].amount += 1;
      };
    };
    let stringified_kart = JSON.stringify(this.items);
    this.list(this.variable, this.props);
  };

  this.remove = (obj_id) => {
    var kart_backup = [];
    for (let i in this.items) {
      if (this.items[i].id != obj_id) {
        kart_backup.push(this.items[i]);
      };
    };

    this.items = kart_backup;

    let stringified_kart = JSON.stringify(this.items);
    this.list(this.variable, this.props);
  };

  this.updateAmount = async (obj_id, amount) => {
    if (amount < 1 || isNaN(amount)) {
      alert("Quantidade Inválida");
      return this.list(this.variable, this.props);
    };

    for (i in this.items) {
      if (this.items[i].id == obj_id) {
        this.items[i].amount = parseInt(amount);

        let stringified_kart = JSON.stringify(this.items);

        return this.list(this.variable, this.props);
      };
    };
  };
};

lib.localStorage = {};

lib.localStorage.verify = (item) => {
  if (localStorage.getItem(item) != null) {
    return true;
  };
  return false;
};

lib.localStorage.update = (item, stringified_object) => {
  localStorage.setItem(item, stringified_object);
};

lib.localStorage.remove = (item) => {
  localStorage.removeItem(item);
};

lib.image = {};

lib.image.zoom = (image_src, cb, gallery_images, gallery_index) => {
  const focused_btn = document.querySelector(':focus');
  focused_btn && focused_btn.blur();

  function getGalleryImageSrc(item) {
    if (!item) return "";
    if (typeof item === "string") return item;
    return item.url || item.src || "";
  }

  let galleryImages = Array.isArray(gallery_images) && gallery_images.length > 1 ? gallery_images : null;
  let galleryIndex = 0;

  if (galleryImages) {
    if (typeof gallery_index === "number" && gallery_index >= 0 && gallery_index < galleryImages.length) {
      galleryIndex = gallery_index;
    } else {
      let found = galleryImages.findIndex(item => {
        let url = getGalleryImageSrc(item);
        return url && image_src && (url === image_src || image_src.endsWith(url) || url.endsWith(image_src));
      });
      galleryIndex = found >= 0 ? found : 0;
    }
  }

  const msg_div = lib.element.create("div", {
    class: "msg h-center",
    style: "z-index: 10;"
  });

  const msg_popup = lib.element.create("div", {
    class: "msg-popup box a3-4 radius-5",
    style: "position: relative;"
  });

  msg_div.append(msg_popup);
  document.body.append(msg_div);
  document.body.style.overflow = "hidden";

  const close_div = lib.element.create("div", {
    class: "close-container",
    style: "position: absolute; top: 5px; right: 5px; z-index: 11;"
  });
  msg_popup.append(close_div);

  let close_icon = lib.element.create("div", {
    class: "ground size-20 radius-50 padding-1 absolute pointer noselect",
    style: "top: 5px; right: 5px;"
  });
  close_div.append(close_icon);

  close_icon.append(lib.element.create("img", {
    class: "size-20 opacity-out-08",
    src: "/images/icon/close-small.png"
  }));

  let image_box = lib.element.create("div", {
    class: "ground radius-2 max-height-500 scroll-hide scroll-line center",
    style: "user-select: none; -moz-user-select: none; -webkit-user-drag: none; -webkit-user-select: none; -ms-user-select: none; touch-action: none;"
  });
  msg_popup.append(image_box);

  let image = lib.element.create("img", {
    src: image_src,
    class: "ground image-prop max-height-500 radius-2 center zoom-in",
    style: "display:block; user-select: none; -moz-user-select: none; -webkit-user-drag: none; -webkit-user-select: none; -ms-user-select: none;"
  });
  image_box.append(image);

  let leftButton;
  let rightButton;

  if (galleryImages) {
    leftButton = lib.element.create("div", {
      class: "opacity-08 noselect carousel-btn",
      style: "position: absolute; top: 50%; left: 8px; transform: translateY(-50%); z-index: 12; -webkit-tap-highlight-color: transparent; outline: none;"
    });
    msg_popup.append(leftButton);

    let leftIcon = lib.element.create("div", {
      class: "ground border size-20 radius-50 padding-1 pointer noselect",
      style: "-webkit-tap-highlight-color: transparent;"
    });
    leftButton.append(leftIcon);

    leftIcon.append(lib.element.create("img", {
      class: "size-20 opacity-06",
      src: "/images/icon/left-arrow.png",
      style: "-webkit-tap-highlight-color: transparent;"
    }));

    rightButton = lib.element.create("div", {
      class: "opacity-08 noselect carousel-btn",
      style: "position: absolute; top: 50%; right: 8px; transform: translateY(-50%); z-index: 12; -webkit-tap-highlight-color: transparent; outline: none;"
    });
    msg_popup.append(rightButton);

    let rightIcon = lib.element.create("div", {
      class: "ground border size-20 radius-50 padding-1 pointer noselect",
      style: "-webkit-tap-highlight-color: transparent;"
    });
    rightButton.append(rightIcon);

    rightIcon.append(lib.element.create("img", {
      class: "size-20 opacity-06",
      src: "/images/icon/right-arrow.png",
      style: "-webkit-tap-highlight-color: transparent;"
    }));
  }

  let popupId = lib.string.gen(5);

  function esc(from) {
    if (from === "popout") {
      let index = lib.historyStack.findIndex(item => item.esc === esc);
      if (index === -1) return;

      lib.historyStack.splice(index, 1);
      document.removeEventListener("keydown", keydown);
      msg_div.remove();

      if (!lib.historyStack.length) {
        document.body.style.overflow = "auto";
      }

      if (typeof cb === 'function') { return cb(); }
      return;
    }

    let top = lib.historyStack[lib.historyStack.length - 1];
    if (!top || top.esc !== esc) return;

    if (from != "popstate") {
      return history.back();
    }

    lib.popStateFromStack();
    document.removeEventListener("keydown", keydown);

    if (!lib.historyStack.length) {
      document.body.style.overflow = "auto";
    }

    msg_div.remove();
    if (typeof cb === 'function') { return cb(); }
  }

  msg_div._popupEsc = esc;

  function keydown(e) {
    let top = lib.historyStack[lib.historyStack.length - 1];
    if (!top || top.esc !== esc) return;

    if (e.keyCode == 27) {
      esc();
      return;
    }

    if (!galleryImages) return;

    if (e.keyCode == 37) {
      e.preventDefault();
      goToGalleryImage(galleryIndex - 1);
    } else if (e.keyCode == 39) {
      e.preventDefault();
      goToGalleryImage(galleryIndex + 1);
    }
  }

  lib.pushStateToStack({ popupId: popupId }, esc);

  msg_div.addEventListener("click", esc);
  msg_popup.addEventListener("click", e => e.stopPropagation());
  close_icon.addEventListener("click", esc);
  document.addEventListener("keydown", keydown);

  let isDown = false;
  let isDragging = false;
  let isPinching = false;
  let startX;
  let startY;
  let scrollLeft;
  let scrollTop;

  let zoom_status = "off";
  let initial_height;
  let initial_width;
  let currentScale = 1;
  let pinchStartDistance = 0;
  let pinchStartScale = 1;
  const MAX_SCALE = 2.5;

  function getPanFactor() {
    return Math.max(0.35, 2 / currentScale);
  }

  function getPinchZoomScale(startScale, distanceRatio) {
    let sensitivity = Math.max(0.5, 1.28 - startScale * 0.18);
    return startScale * (1 + (distanceRatio - 1) * sensitivity);
  }

  function captureInitialSize() {
    if (!initial_height || !initial_width) {
      let rect = image.getBoundingClientRect();
      initial_width = rect.width;
      initial_height = rect.height;
    }
  }

  function enableZoomMode() {
    lib.removeCss(image_box, ["scroll-hide"]);
    lib.addCss(image_box, ["scroll-y", "scroll-x"]);
    lib.removeCss(image, ["image-prop", "max-height-500", "zoom-in", "center"]);
    lib.addCss(image, ["grab"]);
  }

  function clampScroll(scale) {
    let maxScrollLeft = Math.max(0, initial_width * scale - image_box.clientWidth);
    let maxScrollTop = Math.max(0, initial_height * scale - image_box.clientHeight);
    image_box.scrollLeft = Math.max(0, Math.min(maxScrollLeft, image_box.scrollLeft));
    image_box.scrollTop = Math.max(0, Math.min(maxScrollTop, image_box.scrollTop));
  }

  function getImageFocal(clientX, clientY) {
    captureInitialSize();
    let imageRect = image.getBoundingClientRect();
    return {
      x: ((clientX - imageRect.left) / imageRect.width) * initial_width,
      y: ((clientY - imageRect.top) / imageRect.height) * initial_height
    };
  }

  function applyZoomCentering(scale) {
    let imageBoxWidth = image_box.clientWidth;
    let imageBoxHeight = image_box.clientHeight;
    let scaledWidth = initial_width * scale;
    let scaledHeight = initial_height * scale;
    let maxScrollLeft = Math.max(0, scaledWidth - imageBoxWidth);
    let maxScrollTop = Math.max(0, scaledHeight - imageBoxHeight);
    let marginLeft = maxScrollLeft === 0 ? Math.max(0, (imageBoxWidth - scaledWidth) / 2) : 0;
    let marginTop = maxScrollTop === 0 ? Math.max(0, (imageBoxHeight - scaledHeight) / 2) : 0;

    image.style.margin = `${marginTop}px ${marginLeft}px`;

    return { imageBoxWidth, imageBoxHeight, maxScrollLeft, maxScrollTop };
  }

  function setScrollFromFocal(focalX, focalY, scale) {
    let { imageBoxWidth, imageBoxHeight, maxScrollLeft, maxScrollTop } = applyZoomCentering(scale);

    if (maxScrollLeft === 0 && maxScrollTop === 0) {
      image_box.scrollLeft = 0;
      image_box.scrollTop = 0;
      return;
    }

    image_box.scrollLeft = maxScrollLeft === 0 ? 0 : focalX * scale - imageBoxWidth / 2;
    image_box.scrollTop = maxScrollTop === 0 ? 0 : focalY * scale - imageBoxHeight / 2;
    clampScroll(scale);
  }

  function prepareForScrollZoom() {
    if (zoom_status !== "off") return;

    let offsetX = image.offsetLeft;
    let offsetY = image.offsetTop;

    lib.removeCss(image, ["center"]);
    image.style.margin = "0";
    lib.removeCss(image_box, ["scroll-hide"]);
    lib.addCss(image_box, ["scroll-y", "scroll-x"]);

    image_box.scrollLeft = offsetX;
    image_box.scrollTop = offsetY;
  }

  function setZoomOff() {
    captureInitialSize();
    image.height = initial_height;
    image.width = initial_width;
    image.style.margin = "";
    currentScale = 1;
    zoom_status = "off";
    image_box.scrollLeft = 0;
    image_box.scrollTop = 0;
    lib.removeCss(image_box, ["scroll-y", "scroll-x"]);
    lib.addCss(image_box, ["scroll-hide"]);
    lib.addCss(image, ["image-prop", "max-height-500", "zoom-in", "center"]);
    lib.removeCss(image, ["grab"]);
  }

  function updateZoomArrows() {
    if (!galleryImages || !leftButton || !rightButton) return;
    lib.display(leftButton, galleryIndex <= 0 ? "none" : "");
    lib.display(rightButton, galleryIndex >= galleryImages.length - 1 ? "none" : "");
  }

  function goToGalleryImage(nextIndex) {
    if (!galleryImages || nextIndex < 0 || nextIndex >= galleryImages.length || nextIndex === galleryIndex) return;

    galleryIndex = nextIndex;
    image.removeAttribute("height");
    image.removeAttribute("width");
    image.style.height = "";
    image.style.width = "";
    image.style.margin = "";
    initial_height = 0;
    initial_width = 0;
    currentScale = 1;
    zoom_status = "off";
    isDown = false;
    isDragging = false;
    isPinching = false;
    image_box.scrollLeft = 0;
    image_box.scrollTop = 0;
    lib.removeCss(image_box, ["scroll-y", "scroll-x"]);
    lib.addCss(image_box, ["scroll-hide"]);
    lib.addCss(image, ["image-prop", "max-height-500", "zoom-in", "center"]);
    lib.removeCss(image, ["grab"]);
    image.src = getGalleryImageSrc(galleryImages[galleryIndex]);
    updateZoomArrows();
  }

  function setZoomOn(focalX, focalY, scale) {
    captureInitialSize();
    scale = scale || MAX_SCALE;

    image.height = initial_height * scale;
    image.width = initial_width * scale;
    currentScale = scale;
    zoom_status = "on";
    enableZoomMode();

    if (focalX != null && focalY != null) {
      setScrollFromFocal(focalX, focalY, scale);
    }
  }

  function getTouchDistance(touches) {
    let dx = touches[0].clientX - touches[1].clientX;
    let dy = touches[0].clientY - touches[1].clientY;
    return Math.hypot(dx, dy);
  }

  function getTouchCenter(touches) {
    return {
      x: (touches[0].clientX + touches[1].clientX) / 2,
      y: (touches[0].clientY + touches[1].clientY) / 2
    };
  }

  function applyPinchZoom(scale, centerX, centerY) {
    captureInitialSize();
    scale = Math.min(Math.max(scale, 1), MAX_SCALE);

    if (scale <= 1.05) {
      setZoomOff();
      return;
    }

    if (zoom_status === "off") {
      prepareForScrollZoom();
    }

    let boxRect = image_box.getBoundingClientRect();
    let originX = (image_box.scrollLeft + centerX - boxRect.left) / currentScale;
    let originY = (image_box.scrollTop + centerY - boxRect.top) / currentScale;

    image.width = initial_width * scale;
    image.height = initial_height * scale;
    currentScale = scale;
    zoom_status = "on";
    enableZoomMode();

    let targetScrollLeft = originX * scale - (centerX - boxRect.left);
    let targetScrollTop = originY * scale - (centerY - boxRect.top);

    if (scale >= 2.5) {
      let damp = Math.max(0.3, 1.25 / scale);
      targetScrollLeft = image_box.scrollLeft + (targetScrollLeft - image_box.scrollLeft) * damp;
      targetScrollTop = image_box.scrollTop + (targetScrollTop - image_box.scrollTop) * damp;
    }

    let { maxScrollLeft, maxScrollTop } = applyZoomCentering(scale);

    if (maxScrollLeft === 0 && maxScrollTop === 0) {
      image_box.scrollLeft = 0;
      image_box.scrollTop = 0;
      return;
    }

    image_box.scrollLeft = maxScrollLeft === 0 ? 0 : targetScrollLeft;
    image_box.scrollTop = maxScrollTop === 0 ? 0 : targetScrollTop;
    clampScroll(scale);
  }

  image.addEventListener("click", async (e) => {
    captureInitialSize();

    if (!isDragging && !isPinching) {
      if (zoom_status == "on") {
        setZoomOff();
      } else {
        setZoomOn(initial_width / 2, initial_height / 2, MAX_SCALE);
      }
    }
  });

  image_box.addEventListener("mousedown", function (e) {
    isDown = true;
    startX = e.pageX - image_box.offsetLeft;
    startY = e.pageY - image_box.offsetTop;
    scrollLeft = image_box.scrollLeft;
    scrollTop = image_box.scrollTop;
  });

  image_box.addEventListener("mouseleave", function () {
    setTimeout(function () { isDragging = false; }, 50);
    isDown = false;
  });

  image_box.addEventListener("mouseup", function () {
    setTimeout(function () { isDragging = false; }, 50);
    isDown = false;
  });

  image_box.addEventListener("mousemove", function (e) {
    if (!isDown) return;
    isDragging = true;
    e.preventDefault();

    let x = e.pageX - image_box.offsetLeft;
    let y = e.pageY - image_box.offsetTop;
    let panFactor = getPanFactor();
    let walkX = (x - startX) * panFactor;
    let walkY = (y - startY) * panFactor;

    image_box.scrollLeft = scrollLeft - walkX;
    image_box.scrollTop = scrollTop - walkY;
  });

  image_box.addEventListener("touchstart", function (e) {
    if (e.touches.length === 2) {
      isPinching = true;
      isDown = false;
      captureInitialSize();
      if (zoom_status === "off") {
        prepareForScrollZoom();
      }
      pinchStartDistance = getTouchDistance(e.touches);
      pinchStartScale = currentScale;
      return;
    }

    if (e.touches.length === 1 && zoom_status === "on") {
      isDown = true;
      startX = e.touches[0].pageX - image_box.offsetLeft;
      startY = e.touches[0].pageY - image_box.offsetTop;
      scrollLeft = image_box.scrollLeft;
      scrollTop = image_box.scrollTop;
    }
  }, { passive: true });

  image_box.addEventListener("touchmove", function (e) {
    if (e.touches.length === 2) {
      e.preventDefault();
      isPinching = true;
      let center = getTouchCenter(e.touches);
      let distance = getTouchDistance(e.touches);
      let ratio = distance / pinchStartDistance;
      let scale = getPinchZoomScale(pinchStartScale, ratio);
      applyPinchZoom(scale, center.x, center.y);
      return;
    }

    if (!isDown || zoom_status !== "on") return;
    isDragging = true;
    e.preventDefault();

    let x = e.touches[0].pageX - image_box.offsetLeft;
    let y = e.touches[0].pageY - image_box.offsetTop;
    let panFactor = getPanFactor();
    let walkX = (x - startX) * panFactor;
    let walkY = (y - startY) * panFactor;

    image_box.scrollLeft = scrollLeft - walkX;
    image_box.scrollTop = scrollTop - walkY;
  }, { passive: false });

  image_box.addEventListener("touchend", function () {
    setTimeout(function () {
      isDragging = false;
      isPinching = false;
    }, 50);
    isDown = false;
  });

  if (galleryImages) {
    updateZoomArrows();

    leftButton.addEventListener("click", e => {
      e.preventDefault();
      e.stopPropagation();
      goToGalleryImage(galleryIndex - 1);
    });

    rightButton.addEventListener("click", e => {
      e.preventDefault();
      e.stopPropagation();
      goToGalleryImage(galleryIndex + 1);
    });

    [leftButton, rightButton].forEach(button => {
      button.addEventListener("mousedown", e => e.stopPropagation());
      button.addEventListener("touchstart", e => e.stopPropagation(), { passive: true });
    });
  }
};

lib.image.drag = (images, parentElement, cb) => {
  let isDown = false;
  let isDragging = false;
  let startX;
  let startY;
  let scrollLeft;

  images.forEach(function (image, index) {
    let image_box = lib.element.create("div", {
      class: 'box ground border radius-5 margin-right-5',
      style: images.length > 1 ?
        'width: 90%;height: 100%;flex-grow: 1;flex-shrink: 0;flex-basis: auto;\
				user-select: none;-moz-user-select: none;-webkit-user-drag: none;-webkit-user-select: none;-ms-user-select: none;' :
        'width: 100%;height: 100%;flex-grow: 1;flex-shrink: 0;flex-basis: auto;\
				user-select: none;-moz-user-select: none;-webkit-user-drag: none;-webkit-user-select: none;-ms-user-select: none;'
    });
    parentElement.append(image_box);

    let image_loader = lib.element.create("div", {
      class: "ground",
      style: "width: 100%;height:100%;object-fit: contain;\
			user-select: none;-moz-user-select: none;-webkit-user-drag: none;-webkit-user-select: none;-ms-user-select: none;"
    });
    lib.image.loader(image_loader);
    image_box.append(image_loader);

    let image_div = lib.element.create("img", {
      'data-src': image.url,
      class: 'lazy-image',
      style: "width: 100%;height:100%;object-fit: contain;\
				user-select: none;-moz-user-select: none;-webkit-user-drag: none;-webkit-user-select: none;-ms-user-select: none;"
    });

    lib.image.lazy();

    image_div.addEventListener("load", e => {
      image_loader.remove();
    });

    image_box.append(image_div);

    cb && image_div.addEventListener("click", () => {
      if (!isDragging) { cb(image.url || image_div.src, undefined, images, index); }
    });
  });

  // Para detecção de mouse
  parentElement.addEventListener('mousedown', function (e) {
    isDown = true;
    startX = e.pageX - parentElement.offsetLeft;
    scrollLeft = parentElement.scrollLeft;
  });

  parentElement.addEventListener('mouseleave', function () {
    setTimeout(function () { isDragging = false; }, 50);
    isDown = false;
  });

  parentElement.addEventListener('mouseup', function () {
    setTimeout(function () { isDragging = false; }, 50);
    isDown = false;
  });

  images.length > 1 && parentElement.addEventListener('mousemove', function (e) {
    if (!isDown) return;
    isDragging = true;
    e.preventDefault();
    var x = e.pageX - parentElement.offsetLeft;
    var walk = (x - startX) * 2; // Ajuste a sensibilidade do scroll horizontal conforme necessário
    parentElement.scrollLeft = scrollLeft - walk;
  });

  // Para detecção de toque em dispositivos móveis
  parentElement.addEventListener('touchstart', function (e) {
    isDown = true;
    startX = e.touches[0].pageX - parentElement.offsetLeft;
    startY = e.touches[0].pageY - parentElement.offsetTop;
    scrollLeft = parentElement.scrollLeft;
    scrollTop = parentElement.scrollTop;
  });

  parentElement.addEventListener('touchend', function () {
    setTimeout(function () { isDragging = false; }, 50);
    isDown = false;
  });

  images.length > 1 && parentElement.addEventListener('touchmove', function (e) {
    if (!isDown) return;
    var x = e.touches[0].pageX - parentElement.offsetLeft;
    var y = e.touches[0].pageY - parentElement.offsetTop;
    var walkX = (x - startX) * 2; // Ajuste a sensibilidade do scroll horizontal conforme necessário
    var walkY = (y - startY) * 2; // Ajuste a sensibilidade do scroll vertical conforme necessário

    if (Math.abs(walkY) > Math.abs(walkX)) {
      // Movimento vertical maior que o horizontal, permite a rolagem vertical
      return;
    }

    e.preventDefault(); // Impede a rolagem da página

    parentElement.scrollLeft = scrollLeft - walkX;
  });
};

lib.image.carousel = (images, parentElement, cb) => {
  if (images.length > 1) {
    const leftButton = lib.element.create("div", {
      class: "opacity-08 noselect carousel-btn",
      style: "display: none;position: absolute; top: 45%; left: 33px; transform: translate(0, 0%); z-index: 1;-webkit-tap-highlight-color: transparent;outline: none;" // Estilos ajustados para a posição superior direita
    });
    parentElement.append(leftButton);

    let leftIcon = lib.element.create("div", {
      class: "ground border size-20 radius-50 padding-1 absolute pointer noselect",
      style: "top: 5px; right: 5px;-webkit-tap-highlight-color: transparent;"
    });
    leftButton.append(leftIcon);

    leftIcon.append(lib.element.create("img", {
      class: "size-20 opacity-06",
      src: "/images/icon/left-arrow.png",
      style: "-webkit-tap-highlight-color: transparent;"
    }));

    const rightButton = lib.element.create("div", {
      class: "opacity-08 noselect carousel-btn",
      style: "position: absolute; top: 45%; right: -1px; transform: translate(0, 0%); z-index: 1;-webkit-tap-highlight-color: transparent;outline: none;" // Estilos ajustados para a posição superior direita
    });
    parentElement.append(rightButton);

    let rightIcon = lib.element.create("div", {
      class: "ground border size-20 radius-50 padding-1 absolute pointer noselect",
      style: "top: 5px; right: 5px;-webkit-tap-highlight-color: transparent;"
    });
    rightButton.append(rightIcon);

    rightIcon.append(lib.element.create("img", {
      class: "size-20 opacity-06",
      src: "/images/icon/right-arrow.png",
      style: "-webkit-tap-highlight-color: transparent;"
    }));

    let image_index = 1;

    function updateArrowPosition(index) {
      if (index == 1) {
        lib.display(leftButton, "none");
      } else {
        lib.display(leftButton, "");
      }

      if (index == images.length) {
        lib.display(rightButton, "none");
      } else {
        lib.display(rightButton, "");
      }
    };

    leftButton.addEventListener("click", e => {
      e.stopPropagation();

      let scrollAmount = parentElement.clientWidth;
      parentElement.scrollLeft += -scrollAmount;

      image_index--;
      updateArrowPosition(image_index);

      rightButton.style.transform = `translate(${(scrollAmount * (image_index - 1))}px, 0%)`;
      if (image_index > 1) {
        leftButton.style.transform = `translate(${(scrollAmount * (image_index - 1))}px, 0%)`;
      }
    });

    rightButton.addEventListener("click", e => {
      e.stopPropagation();

      let scrollAmount = parentElement.clientWidth;
      parentElement.scrollLeft += scrollAmount;

      image_index++;
      updateArrowPosition(image_index);

      leftButton.style.transform = `translate(${scrollAmount * (image_index - 1)}px, 0%)`;
      if (image_index < images.length) {
        rightButton.style.transform = `translate(${scrollAmount * (image_index - 1)}px, 0%)`;
      }
    });
  }

  images.forEach(function (image, index) {
    let image_box = lib.element.create("div", {
      class: 'box ground',
      style: images.length > 1 ?
        'width: 100%;height: 100%;flex-grow: 1;flex-shrink: 0;flex-basis: auto;\
				user-select: none;-moz-user-select: none;-webkit-user-drag: none;-webkit-user-select: none;-ms-user-select: none;' :
        'width: 100%;height: 100%;flex-grow: 1;flex-shrink: 0;flex-basis: auto;\
				user-select: none;-moz-user-select: none;-webkit-user-drag: none;-webkit-user-select: none;-ms-user-select: none;'
    });
    parentElement.append(image_box);

    let image_loader = lib.element.create("div", {
      class: "ground",
      style: "width: 100%;height:100%;object-fit: contain;\
			user-select: none;-moz-user-select: none;-webkit-user-drag: none;-webkit-user-select: none;-ms-user-select: none;"
    });
    lib.image.loader(image_loader);
    image_box.append(image_loader);

    let image_div = lib.element.create("img", {
      'data-src': image.url,
      class: 'lazy-image',
      style: "width: 100%;height:100%;object-fit: contain;\
				user-select: none;-moz-user-select: none;-webkit-user-drag: none;-webkit-user-select: none;-ms-user-select: none;"
    });

    lib.image.lazy();

    image_div.addEventListener("load", e => {
      image_loader.remove();
    });

    image_box.append(image_div);

    cb && image_div.addEventListener("click", () => {
      cb(image.url || image_div.src, undefined, images, index);
    });
  });
};

lib.image.lazy = () => {
  const lazyImages = document.querySelectorAll('.lazy-image');

  lazyImages.forEach(image => {
    if (!image.dataset.loaded
      && image.getBoundingClientRect().top <= window.innerHeight
      && image.getBoundingClientRect().bottom >= 0
      && getComputedStyle(image).display !== 'none') {
      image.src = image.dataset.src;
      image.removeAttribute('data-src');
      image.dataset.loaded = true;
    }
  });
};

lib.image.loader = (element) => {
  let overlay = lib.element.create("div", {});
  lib.addCss(element, ["lazy-loader-container"]);
  lib.addCss(overlay, ["lazy-loader-overlay"]);
  overlay.append(lib.element.create("div", { class: "lazy-loader" }));
  element.append(overlay);
  if (element) { element.disabled = true; }
};

lib.ruleOfThree = (index, target, sample) => {
  if (!isNaN(index) && !isNaN(target) && !isNaN(sample)) {
    return ((target * sample) / index);
  };
  return false;
};

lib.updateCssVariable = (origin, variable, content) => {
  let root = document.querySelector(origin).style;
  root.setProperty(variable, content);
};

lib.addCss = (element, cssClasses) => {
  if (element.tagName) {
    cssClasses.forEach(c => element.classList.add(c));
    return;
  };
  cssClasses.forEach(c => document.getElementById(element).classList.add(c));
};

lib.removeCss = (element, cssClasses) => {
  if (element.tagName) {
    cssClasses.forEach(c => element.classList.remove(c));
    return;
  };
  cssClasses.forEach(c => document.getElementById(element).classList.remove(c));
};

lib.disable = (element, state) => {
  if (element.tagName) {
    return element.disabled = state;
  };
  document.getElementById(element).disabled = state;
};

lib.display = (element, state) => {
  if (element.tagName) {
    return element.style.display = state;
  };
  document.getElementById(element).style.display = state;
};

lib.element = {};

lib.element.create = (elementName, attributes, value) => {
  let element = document.createElement(elementName);
  let attributesAsArray = Object.entries(attributes || {});

  attributesAsArray.forEach(([key, value]) => element.setAttribute(key, value));

  // if (value) { element.textContent = value; }
  if (value) { element.innerHTML = value; }

  if (String(elementName).toLowerCase() === "textarea" && typeof lib.autoResizeTextarea === "function") {
    lib.autoResizeTextarea(element);
  }

  return element;
};

lib.element.icon = (box, size, src, action) => {
  let div = lib.element.create("div", { class: "mobile-box " + box + " container center" });
  let img = lib.element.create("img", {
    class: "size-" + size + " noselect center",
    src: src,
    onclick: action
  });
  div.appendChild(img);
  return div;
};

lib.element.svg = (box, size, svgString, action) => {
  let div = lib.element.create("div", {
    class: "mobile-box " + box + " container center"
  });

  // cria container temporário
  let temp = document.createElement("div");
  temp.innerHTML = svgString.trim();

  // pega o svg colado
  let svg = temp.querySelector("svg");

  // aplica seu padrão visual
  svg.setAttribute("width", size);
  svg.setAttribute("height", size);

  if (action) {
    svg.onclick = action;
  }

  div.appendChild(svg);

  return div;
};

lib.element.info = (box, param, paramValue) => {
  let divParent = lib.element.create("div", { class: "mobile-box " + box + " container border padding-5" });
  let divParam = lib.element.create("div", { class: "mobile-box b1 em07 bold" }, param);
  let divValue = lib.element.create("div", { class: "mobile-box b1" }, paramValue);

  divParent.appendChild(divParam);
  divParent.appendChild(divValue);
  return divParent;
};

lib.element.createInfo = (css, param, value, param_css, value_css) => {
  let divParent = lib.element.create("div", { class: css });
  let divParam = lib.element.create("div", { class: param_css ? param_css : `mobile-box b1 em07` }, param);
  let divValue = lib.element.create("div", { class: value_css ? value_css : `mobile-box b1 ${value_css}` }, value);

  divParent.appendChild(divParam);
  divParent.appendChild(divValue);
  return divParent;
};

lib.element.param = (box, param, element, option) => {
  let divParent = lib.element.create("div", { class: "mobile-box " + box + " container padding-5 margin-top-5" });
  let divInput = lib.element.create("div", { class: "mobile-box b1 em06" }, param);
  let divValue = lib.element.create(element, option);

  divParent.appendChild(divInput);
  divParent.appendChild(divValue);
  return divParent;
};

lib.element.infoInput = (css, param, paramValue, input_id, param_css, value_css, attributes = {}) => {
  let divParent = lib.element.create("div", { class: css });
  let divParam = lib.element.create("div", { class: param_css ? param_css : `mobile-box b1 em07` }, param);

  let inputAttributes = {
    id: input_id,
    class: value_css ? value_css : `mobile-box b1 ${value_css}`,
    value: paramValue,
    type: attributes.type || "text", // Define 'type' como 'text' se não for fornecido
    ...attributes // Adiciona os demais atributos
  };

  let divValue = lib.element.create("input", inputAttributes);

  divParent.appendChild(divParam);
  divParent.appendChild(divValue);

  return divParent;
};

lib.element.rotate = (el, deg, dir = 'right', transit = true) => {
  let currentRotation = parseInt(el.dataset.rotation) || 0;

  const lastDir = currentRotation % 360 === 0 ? 'right' : 'left';
  const rotationValue = dir === lastDir ? deg : -deg;
  currentRotation += rotationValue;

  if (transit) { el.style.transition = 'transform 0.5s ease'; }
  el.style.transform = `rotate(${currentRotation}deg)`;
  el.dataset.rotation = currentRotation.toString();
};

lib.element.move = (follower, target, speed, cb, followerToAbsolute, sticky) => {
  follower.dataset.position = follower.dataset.position == undefined ? follower.style.position : follower.dataset.position;
  follower.style.position = "absolute";

  // Pega as posições atuais dos elementos
  const targetRect = target.getBoundingClientRect();
  const followerRect = follower.getBoundingClientRect();

  // Calcula as distâncias entre o seguidor e o alvo
  let dy;
  let dx;
  dy = targetRect.top - followerRect.top
  dx = targetRect.left - followerRect.left;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance > speed) {
    follower.style.left = (followerRect.left) + (dx * (speed / 100)) + 'px';

    if (sticky) {
      follower.style.top = parseInt(follower.style.top) + (dy * (speed / 100)) + 'px';
    } else {
      follower.style.top = followerRect.top + (dy * (speed / 100)) + 'px';
    }

    requestAnimationFrame(() => lib.element.move(follower, target, speed, cb, followerToAbsolute, sticky));
  } else {
    if (!followerToAbsolute) { follower.style.position = follower.dataset.position; }
    if (cb) { cb() }
  }
}

lib.element.scaleUp = (target, { maxWidth, maxHeight, speed }, cb) => {
  target.style.width = (parseInt(target.style.width) + (speed || 4)) + 'px';
  target.style.height = (parseInt(target.style.height) + (speed || 4)) + 'px';

  target.style.left = (parseInt(target.style.left) - ((speed || 4) / 2)) + 'px';
  target.style.top = (parseInt(target.style.top) - ((speed || 4) / 2)) + 'px';

  if (parseInt(target.style.width) >= maxWidth && parseInt(target.style.height) >= maxHeight) {
    console.log('scaleUp cb');
    cb();
  } else {
    requestAnimationFrame(() => { lib.element.scaleUp(target, { maxWidth, maxHeight }, cb) });
  }
};

lib.element.scaleDown = (target, { minWidth, minHeight, speed }, cb) => {
  if (parseInt(target.style.width) > minWidth) {
    target.style.width = (parseInt(target.style.width) - (speed || 4)) + 'px';
    target.style.left = (parseInt(target.style.left) + (speed || 4) / 2) + 'px';
  }

  if (parseInt(target.style.height) > minHeight) {
    target.style.height = (parseInt(target.style.height) - (speed || 4)) + 'px';
    target.style.top = (parseInt(target.style.top) + ((speed || 4) / 2)) + 'px';
  }

  if (parseInt(target.style.width) <= minWidth && parseInt(target.style.height) <= minHeight) {
    cb();
  } else {
    requestAnimationFrame(() => { lib.element.scaleDown(target, { minWidth, minHeight }, cb) });
  }
};

// drag and drop
lib.drag = {};

lib.drag.resolveHorizontalSiblingGap = (parent, element, placeholder) => {
  if (!parent) return "0px";

  const siblings = [...parent.children].filter(child =>
    child !== placeholder &&
    child !== element &&
    !child.classList.contains("drag-floating") &&
    !child.classList.contains("drag-placeholder")
  );

  for (const sibling of siblings) {
    const marginLeft = parseFloat(window.getComputedStyle(sibling).marginLeft);
    if (marginLeft > 0) {
      return `${marginLeft}px`;
    }
  }

  const marginClass = [...(element?.classList || [])]
    .concat(...siblings.map(sibling => [...sibling.classList]))
    .find(className => /^margin-left-\d+$/.test(className));

  if (marginClass) {
    return `${marginClass.replace("margin-left-", "")}px`;
  }

  if (element) {
    const marginLeft = parseFloat(window.getComputedStyle(element).marginLeft);
    if (marginLeft > 0) {
      return `${marginLeft}px`;
    }
  }

  return "0px";
};

lib.drag.syncHorizontalPlaceholderSpacing = (parent, placeholder, dir = "h", sourceElement = null) => {
  if (dir !== "h" || !parent || !placeholder) return;

  const isFirst = parent.firstElementChild === placeholder;
  const gap = sourceElement?._dragHorizontalGap ||
    lib.drag.resolveHorizontalSiblingGap(parent, sourceElement, placeholder);

  placeholder.style.marginLeft = isFirst ? "0" : gap;
};

lib.drag.element = (element, cb, handle = element, dir = "v") => {
  const DRAG_THRESHOLD = 5;
  const HOLD_DELAY_MS = 250;
  const EDGE_SIZE = 100;
  const MAX_SCROLL_PER_FRAME = 36;
  const SCROLL_DELAY_MS = 500;
  const SCROLL_ACCEL_MS = 3000;

  let lastClientX = 0;
  let lastClientY = 0;
  let autoScrollRaf = null;
  let scrollContainers = [window];
  let previousHtmlScrollBehavior = "";
  let previousBodyScrollBehavior = "";
  let scrollAccelElapsed = 0;
  let scrollAccelLastTs = 0;
  let scrollCarryX = 0;
  let scrollCarryY = 0;

  // Mantém scroll/toque nativos até o hold confirmar o grab.
  let previousHtmlTouchAction = "";
  let previousBodyTouchAction = "";
  let blockNativeScroll = null;

  const applyIdleTouchAction = () => {
    if (element && element.style) {
      element.style.touchAction = "auto";
    }

    if (handle && handle.style) {
      handle.style.touchAction = "auto";
      handle.style.userSelect = "none";
      handle.style.webkitUserSelect = "none";
      handle.style.webkitTouchCallout = "none";
    }
  };

  applyIdleTouchAction();

  const lockTouch = () => {
    if (element && element.style) {
      element.style.touchAction = "none";
    }

    if (handle && handle.style) {
      handle.style.touchAction = "none";
    }

    // Com grab ativo: bloqueia scroll nativo; só o auto-scroll das bordas move a tela
    previousHtmlTouchAction = document.documentElement.style.touchAction;
    previousBodyTouchAction = document.body.style.touchAction;
    document.documentElement.style.touchAction = "none";
    document.body.style.touchAction = "none";

    if (!blockNativeScroll) {
      blockNativeScroll = (e) => {
        if (e.cancelable) e.preventDefault();
      };
      document.addEventListener("touchmove", blockNativeScroll, { passive: false });
      document.addEventListener("wheel", blockNativeScroll, { passive: false });
    }
  };

  const unlockTouch = () => {
    applyIdleTouchAction();

    document.documentElement.style.touchAction = previousHtmlTouchAction;
    document.body.style.touchAction = previousBodyTouchAction;

    if (blockNativeScroll) {
      document.removeEventListener("touchmove", blockNativeScroll);
      document.removeEventListener("wheel", blockNativeScroll);
      blockNativeScroll = null;
    }
  };

  const pauseAutoScroll = () => {
    if (autoScrollRaf) {
      cancelAnimationFrame(autoScrollRaf);
      autoScrollRaf = null;
    }

    scrollAccelLastTs = 0;
  };

  const stopAutoScroll = () => {
    pauseAutoScroll();
    scrollAccelElapsed = 0;
    scrollCarryX = 0;
    scrollCarryY = 0;
  };

  const getScrollSpeed = (timestamp) => {
    if (!scrollAccelLastTs) {
      scrollAccelLastTs = timestamp;
      return 0;
    }

    scrollAccelElapsed += timestamp - scrollAccelLastTs;
    scrollAccelLastTs = timestamp;

    if (scrollAccelElapsed <= SCROLL_DELAY_MS) {
      return 0;
    }

    const progress = Math.min(1, (scrollAccelElapsed - SCROLL_DELAY_MS) / SCROLL_ACCEL_MS);
    return MAX_SCROLL_PER_FRAME * progress;
  };

  const disableSmoothScroll = () => {
    previousHtmlScrollBehavior = document.documentElement.style.scrollBehavior;
    previousBodyScrollBehavior = document.body.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = "auto";
    document.body.style.scrollBehavior = "auto";
  };

  const restoreSmoothScroll = () => {
    document.documentElement.style.scrollBehavior = previousHtmlScrollBehavior;
    document.body.style.scrollBehavior = previousBodyScrollBehavior;
  };

  const getScrollPosition = () => {
    const scroller = document.scrollingElement || document.documentElement;
    return {
      scroller,
      top: window.pageYOffset || scroller.scrollTop || 0,
      left: window.pageXOffset || scroller.scrollLeft || 0
    };
  };

  const setScrollPosition = (left, top) => {
    const scroller = document.scrollingElement || document.documentElement;
    scroller.scrollLeft = left;
    scroller.scrollTop = top;
    window.scrollTo(left, top);
  };

  const getScrollContainers = () => {
    const containers = [window];
    let parent = element._dragPlaceholder?.parentNode;

    while (parent && parent !== document.body && parent !== document.documentElement) {
      const style = window.getComputedStyle(parent);
      const overflowY = style.overflowY;
      const overflowX = style.overflowX;
      const overflow = style.overflow;
      const canScrollY = /(auto|scroll)/.test(overflowY) || /(auto|scroll)/.test(overflow);
      const canScrollX = /(auto|scroll)/.test(overflowX) || /(auto|scroll)/.test(overflow);

      if ((canScrollY && parent.scrollHeight > parent.clientHeight) ||
        (canScrollX && parent.scrollWidth > parent.clientWidth)) {
        containers.push(parent);
      }

      parent = parent.parentNode;
    }

    return containers;
  };

  const scrollByAmount = (container, x, y) => {
    if (!x && !y) return;

    if (container === window) {
      const { scroller, top, left } = getScrollPosition();
      scroller.scrollLeft = left + x;
      scroller.scrollTop = top + y;
      return;
    }

    container.scrollLeft += x;
    container.scrollTop += y;
  };

  const isWindowRect = (rect) =>
    rect.left === 0 && rect.top === 0 &&
    rect.right >= window.innerWidth - 1 &&
    rect.bottom >= window.innerHeight - 1;

  const edgeScrollDelta = (clientX, clientY, rect, speed) => {
    let x = 0;
    let y = 0;

    if (clientY < rect.top + EDGE_SIZE) {
      y = -speed;
    } else if (clientY > rect.bottom - EDGE_SIZE) {
      y = speed;
    }

    // "h": scroll horizontal normal
    // "g": só em containers internos — na janela a borda lateral no mobile
    // cancela o pointer (drag solta sozinho após poucos pixels)
    if (dir === "h" || (dir === "g" && !isWindowRect(rect))) {
      if (clientX < rect.left + EDGE_SIZE) {
        x = -speed;
      } else if (clientX > rect.right - EDGE_SIZE) {
        x = speed;
      }
    }

    return { x, y };
  };

  const takeScrollStep = (carry, delta) => {
    const next = carry + delta;
    const step = next > 0 ? Math.floor(next) : Math.ceil(next);
    return { step, carry: next - step };
  };

  const createPlaceholder = () => {
    const rect = element.getBoundingClientRect();
    const placeholder = document.createElement("div");

    placeholder.className = "drag-placeholder";
    placeholder.style.height = `${rect.height}px`;
    placeholder.style.width = `${rect.width}px`;
    placeholder.style.boxSizing = "border-box";
    placeholder.style.flexShrink = "0";

    element._dragPlaceholder = placeholder;
    element.parentNode.insertBefore(placeholder, element);

    if (dir === "h") {
      element._dragHorizontalGap = lib.drag.resolveHorizontalSiblingGap(
        element.parentNode,
        element,
        placeholder
      );
    }

    if (dir === "g") {
      const style = window.getComputedStyle(element);
      placeholder.style.marginLeft = style.marginLeft;
      placeholder.style.marginRight = style.marginRight;
      placeholder.style.marginTop = style.marginTop;
      placeholder.style.marginBottom = style.marginBottom;
    }

    syncHorizontalPlaceholderSpacing(element.parentNode, placeholder);

    return placeholder;
  };

  const attachFloating = () => {
    const rect = element.getBoundingClientRect();

    element._dragWidth = rect.width;
    element._dragHeight = rect.height;

    createPlaceholder();

    document.body.appendChild(element);

    element.classList.add("drag-floating", "noselect");
    element.style.position = "fixed";
    element.style.left = "0";
    element.style.top = "0";
    element.style.width = `${rect.width}px`;
    element.style.height = `${rect.height}px`;
    element.style.minWidth = `${rect.width}px`;
    element.style.minHeight = `${rect.height}px`;
    element.style.margin = "0";
    element.style.zIndex = "999999";
    element.style.pointerEvents = "none";
    element.style.boxShadow = "0 8px 20px rgba(0, 0, 0, 0.25)";
    element.style.willChange = "transform";
    element.style.transform = `translate3d(${rect.left}px, ${rect.top}px, 0)`;
  };

  const moveFloating = (clientX, clientY) => {
    if (!element.classList.contains("drag-floating")) return;

    const offsetX = element._dragOffsetX ?? 0;
    const offsetY = element._dragOffsetY ?? 0;

    element.style.transform = `translate3d(${clientX - offsetX}px, ${clientY - offsetY}px, 0)`;
  };

  const DROP_ANIM_MS = 220;

  const clearFloating = () => {
    element.classList.remove("drag-floating", "dragging", "noselect");
    element.style.position = "";
    element.style.left = "";
    element.style.top = "";
    element.style.width = "";
    element.style.height = "";
    element.style.minWidth = "";
    element.style.minHeight = "";
    element.style.margin = "";
    element.style.zIndex = "";
    element.style.pointerEvents = "";
    element.style.boxShadow = "";
    element.style.willChange = "";
    element.style.transition = "";
    element.style.transform = "";
    element._dragWidth = null;
    element._dragHeight = null;
    element._dragOffsetX = null;
    element._dragOffsetY = null;
    element._dragHorizontalGap = null;
    element._dragSettling = false;
  };

  const settleFloatingToPlaceholder = (onDone) => {
    const placeholder = element._dragPlaceholder;
    if (!placeholder || !placeholder.isConnected) {
      onDone();
      return;
    }

    const fromRect = element.getBoundingClientRect();
    const toRect = placeholder.getBoundingClientRect();
    const dx = Math.abs(fromRect.left - toRect.left);
    const dy = Math.abs(fromRect.top - toRect.top);

    if (dx < 2 && dy < 2) {
      onDone();
      return;
    }

    element._dragSettling = true;
    element.style.transition = "none";
    element.style.transform = `translate3d(${fromRect.left}px, ${fromRect.top}px, 0)`;
    void element.offsetWidth;

    element.style.transition = `transform ${DROP_ANIM_MS}ms ease-out, box-shadow ${DROP_ANIM_MS}ms ease-out`;
    element.style.boxShadow = "0 2px 6px rgba(0, 0, 0, 0.12)";
    element.style.transform = `translate3d(${toRect.left}px, ${toRect.top}px, 0)`;

    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      element.removeEventListener("transitionend", onTransitionEnd);
      onDone();
    };

    const onTransitionEnd = (e) => {
      if (e.target !== element) return;
      if (e.propertyName && e.propertyName !== "transform") return;
      finish();
    };

    element.addEventListener("transitionend", onTransitionEnd);
    setTimeout(finish, DROP_ANIM_MS + 80);
  };

  const cancelDrag = () => {
    stopAutoScroll();

    const { left, top } = getScrollPosition();

    if (element._dragPlaceholder) {
      const placeholder = element._dragPlaceholder;

      settleFloatingToPlaceholder(() => {
        clearFloating();
        if (placeholder.isConnected) {
          placeholder.replaceWith(element);
        }
        element._dragPlaceholder = null;
        setScrollPosition(left, top);
        restoreSmoothScroll();
      });
      return;
    }

    clearFloating();
    setScrollPosition(left, top);
    restoreSmoothScroll();
  };

  const finishDrag = () => {
    stopAutoScroll();

    if (!element._dragPlaceholder) {
      cancelDrag();
      return;
    }

    const { left, top } = getScrollPosition();
    const placeholder = element._dragPlaceholder;
    const parent = placeholder.parentNode;

    const position = [...parent.children]
      .filter(el => el !== element)
      .indexOf(placeholder);

    settleFloatingToPlaceholder(() => {
      clearFloating();
      if (placeholder.isConnected) {
        placeholder.replaceWith(element);
      }
      element._dragPlaceholder = null;
      setScrollPosition(left, top);
      restoreSmoothScroll();

      cb({
        element_id: element.id,
        position
      });
    });
  };

  const syncHorizontalPlaceholderSpacing = (parent, placeholder) => {
    lib.drag.syncHorizontalPlaceholderSpacing(parent, placeholder, dir, element);
  };

  const placePlaceholderBefore = (parent, placeholder, referenceNode) => {
    if (referenceNode == null) {
      if (parent.lastChild !== placeholder) {
        parent.appendChild(placeholder);
      }
      syncHorizontalPlaceholderSpacing(parent, placeholder);
      return;
    }

    if (placeholder.nextSibling !== referenceNode) {
      parent.insertBefore(placeholder, referenceNode);
    }

    syncHorizontalPlaceholderSpacing(parent, placeholder);
  };

  const repositionPlaceholder = (clientX, clientY) => {
    if (!element._dragPlaceholder) return;

    const parent = element._dragPlaceholder.parentNode;
    if (!parent) return;

    const placeholder = element._dragPlaceholder;
    const siblings = [...parent.children].filter(child => child !== placeholder);
    if (!siblings.length) return;

    if (dir === "v") {
      let lo = 0;
      let hi = siblings.length;

      while (lo < hi) {
        const mid = (lo + hi) >> 1;
        const rect = siblings[mid].getBoundingClientRect();

        if (clientY < rect.top + rect.height / 2) {
          hi = mid;
        } else {
          lo = mid + 1;
        }
      }

      placePlaceholderBefore(parent, placeholder, siblings[lo] || null);
      return;
    }

    if (dir === "h") {
      let lo = 0;
      let hi = siblings.length;

      while (lo < hi) {
        const mid = (lo + hi) >> 1;
        const rect = siblings[mid].getBoundingClientRect();

        if (clientX < rect.left + rect.width / 2) {
          hi = mid;
        } else {
          lo = mid + 1;
        }
      }

      placePlaceholderBefore(parent, placeholder, siblings[lo] || null);
      return;
    }

    if (dir === "g") {
      let insertBeforeNode = null;

      for (let i = 0; i < siblings.length; i++) {
        const rect = siblings[i].getBoundingClientRect();

        if (clientY < rect.top) {
          insertBeforeNode = siblings[i];
          break;
        }

        if (clientY <= rect.bottom) {
          if (clientX < rect.left + rect.width / 2) {
            insertBeforeNode = siblings[i];
            break;
          }
        }
      }

      placePlaceholderBefore(parent, placeholder, insertBeforeNode);
    }
  };

  const isNearEdge = (clientX, clientY) => {
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    if (clientY < EDGE_SIZE || clientY > viewportHeight - EDGE_SIZE) {
      return true;
    }

    // Grid não considera borda lateral da janela (evita pointercancel no mobile)
    if (dir === "h" && (clientX < EDGE_SIZE || clientX > viewportWidth - EDGE_SIZE)) {
      return true;
    }

    if (dir === "g") {
      for (const container of scrollContainers) {
        if (container === window) continue;
        const rect = container.getBoundingClientRect();
        if (clientX < rect.left + EDGE_SIZE || clientX > rect.right - EDGE_SIZE) {
          return true;
        }
      }
    }

    return false;
  };

  const autoScrollTick = (timestamp) => {
    if (!element._dragPlaceholder) {
      stopAutoScroll();
      return;
    }

    if (!isNearEdge(lastClientX, lastClientY)) {
      stopAutoScroll();
      return;
    }

    const speed = getScrollSpeed(timestamp);
    let deltaX = 0;
    let deltaY = 0;

    for (const container of scrollContainers) {
      const rect = container === window
        ? { top: 0, left: 0, right: window.innerWidth, bottom: window.innerHeight }
        : container.getBoundingClientRect();

      const delta = edgeScrollDelta(lastClientX, lastClientY, rect, speed);

      if (container === window) {
        deltaX += delta.x;
        deltaY += delta.y;
      } else if (delta.x || delta.y) {
        const xStep = takeScrollStep(0, delta.x);
        const yStep = takeScrollStep(0, delta.y);
        scrollByAmount(container, xStep.step, yStep.step);
      }
    }

    const xScroll = takeScrollStep(scrollCarryX, deltaX);
    const yScroll = takeScrollStep(scrollCarryY, deltaY);
    scrollCarryX = xScroll.carry;
    scrollCarryY = yScroll.carry;

    if (xScroll.step || yScroll.step) {
      scrollByAmount(window, xScroll.step, yScroll.step);
    }

    moveFloating(lastClientX, lastClientY);
    repositionPlaceholder(lastClientX, lastClientY);
    autoScrollRaf = requestAnimationFrame(autoScrollTick);
  };

  const startPointerDrag = () => {
    if (element._dragPlaceholder) return;

    disableSmoothScroll();
    attachFloating();
    scrollContainers = getScrollContainers();
  };

  const movePointerDrag = (clientX, clientY) => {
    lastClientX = clientX;
    lastClientY = clientY;

    moveFloating(clientX, clientY);
    repositionPlaceholder(clientX, clientY);

    if (isNearEdge(clientX, clientY)) {
      if (!autoScrollRaf) {
        autoScrollRaf = requestAnimationFrame(autoScrollTick);
      }
      return;
    }

    stopAutoScroll();
  };

  handle.addEventListener("dragstart", (e) => e.preventDefault());
  element.addEventListener("dragstart", (e) => e.preventDefault());

  const findHorizontalScroller = () => {
    let parent = element.parentElement;

    while (parent && parent !== document.body) {
      const style = window.getComputedStyle(parent);
      const overflowX = style.overflowX;

      if ((overflowX === "auto" || overflowX === "scroll") &&
        parent.scrollWidth > parent.clientWidth) {
        return parent;
      }

      parent = parent.parentElement;
    }

    return null;
  };

  handle.addEventListener("pointerdown", (e) => {
    if (!e.isPrimary) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    if (element._dragPlaceholder || element._dragSettling) return;

    const pointerId = e.pointerId;
    let originX = e.clientX;
    let originY = e.clientY;
    let lastX = originX;
    let lastY = originY;
    let prevX = originX;
    let prevY = originY;
    let dragging = false;
    let holdTimer = null;

    const beginDrag = (clientX, clientY) => {
      if (dragging) return;

      dragging = true;
      clearTimeout(holdTimer);
      document.body.classList.add("noselect", "drag-grabbing");
      lockTouch();

      try {
        handle.setPointerCapture(pointerId);
      } catch (_) { }

      const rect = element.getBoundingClientRect();
      const inside =
        clientX >= rect.left && clientX <= rect.right &&
        clientY >= rect.top && clientY <= rect.bottom;

      // If the pointer left the image while holding, snap the thumb to the hand
      if (inside) {
        element._dragOffsetX = clientX - rect.left;
        element._dragOffsetY = clientY - rect.top;
      } else {
        element._dragOffsetX = rect.width / 2;
        element._dragOffsetY = rect.height / 2;
      }

      // Reparent para o body costuma disparar lostpointercapture/pointercancel no mobile
      element._dragReparenting = true;
      startPointerDrag();
      try {
        handle.setPointerCapture(pointerId);
      } catch (_) { }
      element._dragReparenting = false;

      movePointerDrag(clientX, clientY);
    };

    const scheduleHold = () => {
      clearTimeout(holdTimer);
      if (dragging) return;
      holdTimer = setTimeout(() => {
        beginDrag(lastX, lastY);
      }, HOLD_DELAY_MS);
    };

    scheduleHold();

    let cleaned = false;

    const cleanup = () => {
      if (cleaned) return;
      cleaned = true;
      clearTimeout(holdTimer);
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerup", onPointerUp);
      document.removeEventListener("pointercancel", onPointerCancel);
      handle.removeEventListener("lostpointercapture", onLostCapture);

      try {
        if (handle.hasPointerCapture?.(pointerId)) {
          handle.releasePointerCapture(pointerId);
        }
      } catch (_) { }

      document.body.classList.remove("noselect", "drag-grabbing");
      unlockTouch();
    };

    const onPointerMove = (moveEvent) => {
      if (moveEvent.pointerId !== pointerId) return;

      const clientX = moveEvent.clientX;
      const clientY = moveEvent.clientY;
      const deltaX = clientX - prevX;
      const deltaY = clientY - prevY;
      prevX = clientX;
      prevY = clientY;
      lastX = clientX;
      lastY = clientY;

      if (!dragging) {
        const dx = Math.abs(clientX - originX);
        const dy = Math.abs(clientY - originY);

        // Movimento antes do hold = scroll/gesto normal: cancela o grab
        if (dx > DRAG_THRESHOLD || dy > DRAG_THRESHOLD) {
          clearTimeout(holdTimer);
          holdTimer = null;

          // Keep the gesture alive while panning horizontal thumb strips
          if (dir === "h" && Math.abs(deltaX) >= Math.abs(deltaY)) {
            const scroller = findHorizontalScroller();
            if (scroller) {
              scroller.scrollLeft -= deltaX;
              moveEvent.preventDefault();
            }
          }
        }
        return;
      }

      moveEvent.preventDefault();
      movePointerDrag(clientX, clientY);
    };

    const endDrag = () => {
      cleanup();

      if (dragging) {
        finishDrag();
      } else {
        cancelDrag();
      }
    };

    const onPointerUp = (upEvent) => {
      if (upEvent.pointerId !== pointerId) return;
      endDrag();
    };

    // Ao mover o elemento para o body o mobile dispara cancel/lost — recaptura só nesse momento
    const onPointerCancel = (cancelEvent) => {
      if (cancelEvent.pointerId !== pointerId) return;
      if (element._dragReparenting) {
        try {
          handle.setPointerCapture(pointerId);
          return;
        } catch (_) { }
      }
      endDrag();
    };

    const onLostCapture = (lostEvent) => {
      if (lostEvent.pointerId !== pointerId) return;
      if (!element._dragReparenting) return;
      try {
        handle.setPointerCapture(pointerId);
      } catch (_) { }
    };

    // Não preventDefault no pointerdown: libera scroll até o hold confirmar o grab
    document.addEventListener("pointermove", onPointerMove, { passive: false });
    document.addEventListener("pointerup", onPointerUp);
    document.addEventListener("pointercancel", onPointerCancel);
    handle.addEventListener("lostpointercapture", onLostCapture);
  });
};

lib.drag.drop = (dropArea, targetArea, css, dir) => {
  dropArea.addEventListener("dragover", (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";

    const draggedElement = document.querySelector(".drag-floating");

    if (!draggedElement) return;
    if (dropArea === draggedElement) return;

    const placeholder = draggedElement._dragPlaceholder;
    if (!placeholder) return;
    if (!targetArea && dir !== "g" && dropArea.parentNode !== placeholder.parentNode) return;

    const parent = targetArea || dropArea.parentNode;
    const rect = dropArea.getBoundingClientRect();

    if (dir === "v") {
      const middleY = rect.top + rect.height / 2;

      if (e.clientY < middleY) {
        parent.insertBefore(placeholder, dropArea);
      } else {
        parent.insertBefore(placeholder, dropArea.nextSibling);
      }
    }

    if (dir === "h") {
      const middleX = rect.left + rect.width / 2;

      if (e.clientX < middleX) {
        parent.insertBefore(placeholder, dropArea);
      } else {
        parent.insertBefore(placeholder, dropArea.nextSibling);
      }

      lib.drag.syncHorizontalPlaceholderSpacing(parent, placeholder, dir, draggedElement);
    }

    if (dir === "g") {
      const middleX = rect.left + rect.width / 2;
      const middleY = rect.top + rect.height / 2;

      if (e.clientY < middleY || e.clientX < middleX) {
        parent.insertBefore(placeholder, dropArea);
      } else {
        parent.insertBefore(placeholder, dropArea.nextSibling);
      }
    }
  });
};

// Sanitize using DOMPurify
lib.sanitize = string => {
  if (typeof DOMPurify == "function") {
    return DOMPurify.sanitize(string);
  } else {
    return string;
  }
};

lib.dinamicInputNumber = (input) => {
  // Remover caracteres não numéricos
  input.value = input.value.replace(/[^0-9]/g, '');

  // Obter o valor do input como uma string
  var valorString = input.value;

  let decimalPlaces = parseFloat(input.step).toString().split('.')[1];
  if (!decimalPlaces) {
    return;
  } else {
    decimalPlaces = decimalPlaces.length;
  }

  // Converter a string para um número dividido em parte inteira e parte decimal
  var inteiro = parseInt(valorString.substring(0, valorString.length - decimalPlaces)) || 0;
  var decimal = parseInt(valorString.substring(valorString.length - decimalPlaces)) || 0;

  let decimal_max = "";
  for (let i = 0; i < decimalPlaces; i++) { decimal_max += `9`; };

  // Limitar a parte decimal a duas casas decimais
  if (decimal > parseInt(decimal_max)) { decimal = parseInt(decimal_max); }

  let decimal_min = "";
  for (let i = 0; i < decimalPlaces; i++) {
    if (i == 0) {
      decimal_min += `1`;
    } else {
      decimal_min += `0`;
    }
  };

  let decimal_string = decimal.toString();

  let decimal_fill = "";
  for (let i = 0; i < decimalPlaces - decimal_string.length; i++) {
    decimal_fill += `0`;
  };

  // Atualizar o valor do input com a parte inteira e parte decimal separadas por um ponto
  input.value = inteiro + '.' + (decimal < parseInt(decimal_min) ? decimal_fill : '') + decimal;
};

lib.tooltip = (element, texto) => {
  // Adiciona a classe "tooltip" ao elemento
  element.classList.add("tooltip");

  // Cria um novo elemento para o tooltip
  const tooltipText = document.createElement("span");
  tooltipText.classList.add("tooltiptext");
  tooltipText.textContent = texto;

  // Adiciona o tooltip ao elemento
  element.appendChild(tooltipText);
}

lib.rgbToHex = (rgb) => {
  let partes = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);

  let hex = "#";
  for (let i = 1; i <= 3; i++) {
    let componente = parseInt(partes[i]).toString(16);
    hex += (componente.length === 1) ? "0" + componente : componente;
  };

  return hex;
};

lib.presentation = (target, text, width, direction, left, top, cb, params) => {
  lib.addCss(target, ["presentation-element"]);

  let box_element = lib.element.create("div", {
    class: `presentation-box container ground width-${width} speech-${direction} radius-5 padding-10`
  });
  box_element.append(lib.element.create("div", { class: "box b1 rem09" }, text));

  let confirm_btn = lib.element.create("div", {
    class: "mobile-box b1 lucida-grande rem09 border-lg-st shadow-st padding-5 margin-top-5 center pointer"
  }, 'Confirmar');
  box_element.append(confirm_btn);

  box_element.style.left = (target.offsetLeft + left) + "px";
  box_element.style.top = (target.offsetTop + top) + "px";
  document.body.append(box_element);

  confirm_btn.addEventListener("click", () => {
    lib.removeCss(target, ["presentation-element"]);
    if (cb) { cb(params); }
    box_element.remove();
  });
};

lib.string = {};

lib.string.gen = (size) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  let result = '';

  for (let i = 0; i < size; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    result += chars[randomIndex];
  };

  return result;
};

lib.string.cut = (str, index) => {
  if (str.length > index) {
    return str.substring(0, index);
  }
  return str;
}

lib.base64 = {}

lib.base64.toBlob = (base64, contentType) => {
  if (!contentType) {
    const match = base64.match(/^data:(.*?);/);
    contentType = match ? match[1] : 'application/octet-stream';
  }

  const byteCharacters = atob(base64.split(',')[1]);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    byteArrays.push(new Uint8Array(byteNumbers));
  }

  return new Blob(byteArrays, { type: contentType });
};

lib.print = (print_element) => {
  if (!print_element) {
    lib.message("Elemento inválido para impressão");
    return;
  }

  var printWindow = window.open("", "_blank", "width=900,height=600");

  let css = lib.element.create("link", {
    rel: "stylesheet",
    href: "/front-end/stylesheets/app.css?v=1.0",
    type: "text/css"
  });

  printWindow.document.head.append(css);

  let container = lib.element.create("div", {
    class: "p-box a1 container"
  });

  printWindow.document.body.append(container);

  let print_btn = lib.element.create("div", {
    class: "box b1 container icon noprint padding-10 pointer"
  });
  container.append(print_btn);

  print_btn.append(lib.element.create("div", {
    class: "mobile-box b2 right v-center"
  }, "Imprimir conteúdo"));

  print_btn.append(lib.element.icon("b10", "25", "/images/icon/print.png"));

  css.onload = () => {
    container.append(print_element);
  };

  print_btn.addEventListener("click", () => {
    printWindow.print();
  });
};

lib.scrollTo = (target, smooth = true, offset = 0) => {
  if (!target) return;

  let element = target;

  if (typeof target === "string") {
    element = document.getElementById(target);
  }

  if (!element) return;

  let parent = element.parentElement;

  while (parent) {
    const style = getComputedStyle(parent);
    const overflowY = style.overflowY;

    if (
      (overflowY === "auto" || overflowY === "scroll") &&
      parent.scrollHeight > parent.clientHeight
    ) {
      const top = element.offsetTop - parent.offsetTop - offset;

      parent.scrollTo({
        top,
        behavior: smooth ? "smooth" : "auto"
      });

      return;
    }

    parent = parent.parentElement;
  }

  const top = element.getBoundingClientRect().top + window.pageYOffset - offset;

  window.scrollTo({
    top,
    behavior: smooth ? "smooth" : "auto"
  });
};

lib.autoResizeTextarea = (textarea, min_height = 0) => {
  if (!textarea) { return; }

  if (textarea.dataset.autoResizeBound === "1") {
    return textarea._autoResize || null;
  }

  textarea.dataset.autoResizeBound = "1";
  textarea.classList.add("auto-height-textarea");
  textarea.style.overflowY = "hidden";
  textarea.style.resize = "none";

  if (!textarea.getAttribute("rows")) {
    textarea.setAttribute("rows", "1");
  }

  const resize = () => {
    textarea.style.height = "auto";
    const next_height = Math.max(textarea.scrollHeight, min_height);
    textarea.style.height = `${next_height}px`;
  };

  textarea.addEventListener("input", resize);

  const descriptor = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value");
  if (descriptor && descriptor.get && descriptor.set) {
    Object.defineProperty(textarea, "value", {
      get() {
        return descriptor.get.call(this);
      },
      set(v) {
        descriptor.set.call(this, v);
        requestAnimationFrame(resize);
      },
      configurable: true
    });
  }

  function tryResize() {
    if (textarea.offsetWidth > 0) {
      resize();
    } else {
      requestAnimationFrame(tryResize);
    }
  }

  tryResize();
  textarea._autoResize = resize;
  return resize;
};

lib.resizeOnAttach = (element, min_height = 50) => {
  if (!element) return;

  if (element.tagName === "TEXTAREA") {
    lib.autoResizeTextarea(element, min_height);
    return;
  }

  function tryResize() {
    if (element.offsetHeight > 0) {
      if (typeof autoResizeEditableDiv === "function") {
        autoResizeEditableDiv(element, min_height);
      } else {
        lib.autoResizeTextarea(element, min_height);
      }
    } else {
      requestAnimationFrame(tryResize);
    }
  }

  tryResize();
};