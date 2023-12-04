function waitForEl(selector, callback) {
  if (jQuery(selector).length) {
    console.debug(`find ${selector}`);
    callback();
  } else {
    setTimeout(function() {
        console.debug(`restart ${selector}`);
        waitForEl(selector, callback);
    }, 700);
  }
};
