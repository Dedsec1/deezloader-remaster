try{
const shell = require('electron').shell;
const remote = require('electron').remote;
const dialog = remote.dialog;
const packageFile = remote.require('./package.json');
const mainApp = remote.require('./app');
const path = remote.require('path');
}catch(e){}
const version = (typeof packageFile === 'undefined') ? $("sup").html() : packageFile.version;
(function () {
  //open links externally by default
  $(document).on('click', 'a[href^="http"]', function (event) {
    event.preventDefault();
    shell.openExternal(this.href);
  });

  // selectAll-"feature"...its really crappy to wait for document change
  // but since the materialize modal initialization is a fucking callback hell,
  // this is pretty much the only option...will (hopefully) be refactored in
  // version 2.4.0 when the entire rendering is switched to vue's...
  $(document).on('change', 'input:checkbox.selectAll', function(){
    $('input:checkbox.trackCheckbox').prop('checked', $(this).prop('checked'));
  });

  // Open DevTools when F12 is pressed
  document.addEventListener("keydown", function (e) {
    if (e.which === 123) {
      if(remote){
        remote.getCurrentWindow().toggleDevTools();
      }
    }
  });



  // Function to make title-bar work
  function initTitleBar() {
    let $mainEl = $('#title-bar');
    try{
    const window = remote.getCurrentWindow();
    }catch(e){}

    $mainEl.find('#application_version').text(version);

    $mainEl.find('#min-btn').on('click', function () {
      window.minimize();
    });

    $mainEl.find('#max-btn').on('click', function () {
      if (!window.isMaximized()) {
        window.maximize();
      } else {
        window.unmaximize();
      }
    });

    $mainEl.find('#close-btn').on('click', function () {
      window.close();
    });
  }

  // Setup quit button on init loader in case of fail
  $('#init-quit-btn').on('click', function (e) {
    e.preventDefault();
    remote.getCurrentWindow().close();
  });

  // Ready state of the page
  document.onreadystatechange = function () {
    if (document.readyState == "complete") {
      initTitleBar();

      $('#modal_settings_input_downloadTracksLocation').on('click', function () {
        $(this).val(dialog.showOpenDialog({
          properties: ['openDirectory']
        }));
      });
    }
  };
})(jQuery);
