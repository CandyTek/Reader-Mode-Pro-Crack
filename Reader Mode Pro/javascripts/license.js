// Create iframe
function createIframe(){
  var iframe = document.createElement('iframe');
  iframe.id = "cr-license-iframe";
  iframe.className = "simple-fade-up no-trans";
  iframe.style.height = "100%";
  iframe.style.width="100%";
  iframe.style.position = "fixed";
  iframe.style.top = "0px";
  iframe.style.right = "0px";
  iframe.style.zIndex = "9000000000000000000";
  iframe.frameBorder = "none";
  iframe.style.backgroundColor = "#fff";

  return iframe;
}

function init(){
  // Initialize iframe & doc
  var iframe = document.getElementById('cr-license-iframe');
  var doc = iframe.contentWindow.document;

  // Fetch template for reader mode
  fetch(chrome.extension.getURL('/license.html'))
  .then(response => response.text())
  .then(data => {

    style_url = chrome.extension.getURL("styles/fontawesome-all.css");
    $(doc).find('head').append("<link rel='stylesheet' type='text/css' href='"+style_url+"'>");

    $(doc).find("body").html(data);

    $(doc).find("#cr-activate-license-btn").click(function(){
      key = $(doc).find("#cr-license-input").val().trim();
      if (key != "") {
        if ( key.length < 30 || key.length >= 50 ) {
          alert("Invalid license!");
        } else {
          $(this).html("<i class='fas fa-circle-notch fa-spin'></i> &nbsp;Validating license please wait...");
          $(this).prop('disabled', true);
          $(this).addClass('disabled');

          chrome.runtime.sendMessage({query: "validate-license", key: key}, function(response) {
            if (response.data.validation) {
              if (response.data.validation.success == true && response.data.validation.activated == true)   {
                $(doc).find("#cr-license-modal-activation").html(
                  `<div id='cr-license-successful'>
                    <h1>Activation Successful</h1>
                    <i id='sucess-logo' class='far fa-check-circle'></i>
                    <br/>
                    <button id="start-chrome-reader" class="btn">Start Reader Mode</button>
                  </div>`
                );

                $(doc).find("#start-chrome-reader").click(function(){
                  chrome.runtime.sendMessage({query: "start-chrome-reader" }, function(response) {});
                });
              } else {
                $(doc).find("#cr-activate-license-btn").prop("disabled", false);
                $(doc).find("#cr-activate-license-btn").attr("class", "btn");
                $(doc).find("#cr-activate-license-btn").html("Activate License");
                alert(response.data.validation.message);
              }
            } else {
              $(doc).find("#cr-activate-license-btn").prop("disabled", false);
              $(doc).find("#cr-activate-license-btn").attr("class", "btn");
              $(doc).find("#cr-activate-license-btn").html("Activate License");
              alert(response.data);
            }
          });
        }
      } else {
        alert("License cannot be empty!");
      }
    });

    $(doc).find("#cr-license-modal-close").click(function(){
      $(iframe).remove();
    });

  });
}

function launch() {
  if( $("#cr-iframe").length ) {
    $("#cr-iframe").remove();
  }

  // Detect past iframe - don't show another
  if(document.getElementById("cr-license-iframe") == null) {
    // Create iframe and append to body
    var iframe = createIframe();
    document.body.appendChild(iframe);
    $(iframe).show();
    init();
  } else {
    iframe = document.getElementById("cr-license-iframe");
    iframe.remove();
  }
}

launch();
