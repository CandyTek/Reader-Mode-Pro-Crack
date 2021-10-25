// Theme settings
var cr_theme;
var cr_background_color, cr_background_color_light, cr_background_color_dark;
var cr_text_color, cr_text_color_light, cr_text_color_dark;
var cr_link_color, cr_link_color_light, cr_link_color_dark;
var cr_highlighter_color, cr_highlighter_color_light, cr_highlighter_color_dark;

// Encode/Decode HTML based on LZW compression
function compressHTML(c){var x='charCodeAt',b,e={},f=c.split(""),d=[],a=f[0],g=256;for(b=1;b<f.length;b++)c=f[b],null!=e[a+c]?a+=c:(d.push(1<a.length?e[a]:a[x](0)),e[a+c]=g,g++,a=c);d.push(1<a.length?e[a]:a[x](0));for(b=0;b<d.length;b++)d[b]=String.fromCharCode(d[b]);return d.join("")}
function decompressHTML(b){var a,e={},d=b.split(""),c=f=d[0],g=[c],h=o=256;for(b=1;b<d.length;b++)a=d[b].charCodeAt(0),a=h>a?d[b]:e[a]?e[a]:f+c,g.push(a),c=a.charAt(0),e[o]=f+c,o++,f=a;return g.join("")}

// Copy to clipboard
function media_clipboard(doc, item){
  $(doc).find(item).click(function(){
    let str = $(this).attr('data-clipboard-text');
    const el = document.createElement('textarea');
    el.value = str;
    el.setAttribute('readonly', '');
    el.style.position = 'absolute';
    el.style.left = '-9999px';
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);

    btn_clipboard_copy = $(doc).find(item+" .fa-copy");
    $("<span class='btn-clipboard-copied'>Copied!</span>").insertBefore( btn_clipboard_copy ).fadeOut(1000, function() { $(this).remove() });
  });
}

// Check if string is empty
function isEmpty(value) {
  return typeof value == 'string' && !value.trim() || typeof value == 'undefined' || value === null;
}

// Toggle display outline
function outlineDisplayToggle(doc) {
  var outline = $(doc).find("#cr-outline");

  // Hide Sidebar when the first page reload if mobile
  var width = $(window).width();

  if(width <= 1280){
    $(outline).hide();
    $(outline).css('width', '0');
  } else {
    $(outline).show();
    outline.css('width', '250px');
  }

  // Hide Sidebar when the first page reload if resized
  $(window).resize(function() {
    width = $(window).width();
    if(width <= 1280){
      $(outline).hide();
      $(outline).css('width', '0');
    } else {
      $(outline).show();
      $(outline).css('width', '250px');
    }
  });
}

// Return preloader html
function getPreloader(){
  var preloader = `<div id='cr-pre-loader' style='
      width: 250px;
      height: 100px;
      text-align: center;
      font-family: "Helvetica Neue";
      font-weight: 200;
      color: #c1c1c1;
      letter-spacing: 0.5;
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      -ms-transform: translate(-50%, -50%); /* for IE 9 */
      -webkit-transform: translate(-50%, -50%); /* for Safari */
    '>
      <style>
        @keyframes pulse {
          0% { transform: scale(0.95);box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.3); }
          70% { transform: scale(1);box-shadow: 0 0 0 10px rgba(0, 0, 0, 0); }
          100% { transform: scale(0.95);box-shadow: 0 0 0 0 rgba(0, 0, 0, 0); }
        }
      </style>
      <div class="blobs-container text-center" style="margin: 0px auto;margin-bottom: 30px;width: 50px;">
        <div class="blob" style="
          background: #dddddd;
          border-radius: 50%;
          margin: 10px;
          height: 20px;
          width: 20px;
          box-shadow: 0 0 0 0 rgba(0, 0, 0, 1);
          transform: scale(1);
          animation: pulse 2s infinite;"
        >
        </div>
      </div>
      <p>Fetching relevant contents...</p>
    </div>`;

  return preloader
}

// Added pre-loader
function startPreloader(doc){
  //pulse_preloader_url = chrome.extension.getURL('assets/images/pulse-preloader.svg');
  preloader = getPreloader();
  $(doc).find("body").prepend(preloader);
}

// Create iframe
function createIframe(){
  var iframe = document.createElement('iframe');
  iframe.id = "cr-iframe";
  iframe.style.height = "100%";
  iframe.style.width="100%";
  iframe.style.position = "fixed";
  iframe.style.top = "0px";
  iframe.style.right = "0px";
  iframe.style.zIndex = "9000000000000000000";
  iframe.frameBorder = "none";
  iframe.style.backgroundColor = "#fff";

  preloader = getPreloader();
  $(iframe).contents().find('body').html(preloader);

  return iframe;
}

/* Get HTML Of Selected Text */
function getHTMLOfSelection () {
  var range;
  if (document.selection && document.selection.createRange) {
    range = document.selection.createRange();
    return range.htmlText;
  }
  else if (window.getSelection) {
    var selection = window.getSelection();
    if (selection.rangeCount > 0) {
      range = selection.getRangeAt(0);
      var clonedSelection = range.cloneContents();
      var div = document.createElement('div');
      div.appendChild(clonedSelection);
      return div.innerHTML;
    }
    else {
      return '';
    }
  }
  else {
    return '';
  }
}

// Parse the article
function getParsedArticle(){
  var loc = document.location;
  var uri = {
    spec: loc.href,
    host: loc.host,
    prePath: loc.protocol + "//" + loc.host,
    scheme: loc.protocol.substr(0, loc.protocol.indexOf(":")),
    pathBase: loc.protocol + "//" + loc.host + loc.pathname.substr(0, loc.pathname.lastIndexOf("/") + 1)
  };

  var doc_to_parse;

  selected_text = getHTMLOfSelection();
  if(selected_text != "") {
    doc_to_parse = new DOMParser().parseFromString(selected_text, "text/html");
  } else {
    /*
    * Readability's parse() works by modifying the DOM. This removes some elements in the web page.
    * So to avoid this, we are passing the clone of the document object while creating a Readability object.
    */
    doc_to_parse = document.cloneNode(true);
  }

  var article = new Readability(uri, doc_to_parse).parse();

  return article;
}

// Remove unnecassary stuffs from content
function trimContent(doc){
  $(doc).find("#cr-content span:contains('Image copyright')").css("display","none");
  $(doc).find("#cr-content figcaption").css("display","none");
}

// Turn title/text into url friendly slug
function slugify(text){
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}

// Set Outline list
function setOutline(doc, article) {
  if (article.title && article.title != "") {
    $(doc).find("#cr-outline-list").append("<li><a href='#cr-title'>"+article.title+"</a></li>");
  }
  $(article.content).find("h1, h2, h3, h4, h5, h6").each(function(){
    var heading = $(this).text();
    var slug = slugify(heading);
    $(doc).find("#cr-outline-list").append("<li><a href='#"+slug+"'>"+heading+"</a></li>");
  });
}

// Set slug to headings for outline list
function setHeadingsForOutline(doc){
  $(doc).find("h1, h2, h3, h4, h5, h6").each(function(){
    var heading = $(this).text();
    var slug = slugify(heading);

    if ( $(this).attr("id") != "cr-title" ) {
      $(this).attr("id", slug)
    }
  });
}

// Add styletag to iframe
function addStyleTags(doc){
  style_url = chrome.extension.getURL("styles/app.css");
  $(doc).find('head').append("<link rel='stylesheet' type='text/css' href='"+style_url+"'>");

  style_url = chrome.extension.getURL("styles/base.css");
  $(doc).find('head').append("<link rel='stylesheet' type='text/css' href='"+style_url+"'>");

  style_url = chrome.extension.getURL("styles/options-panel.css");
  $(doc).find('head').append("<link rel='stylesheet' type='text/css' href='"+style_url+"'>");

  style_url = chrome.extension.getURL("styles/fontawesome-all.css");
  $(doc).find('head').append("<link rel='stylesheet' type='text/css' href='"+style_url+"'>");

  style_url = chrome.extension.getURL("styles/semantic.css");
  $(doc).find('head').append("<link rel='stylesheet' type='text/css' href='"+style_url+"'>");
}

// Removes the .active CSS class from all spans.
function clearHighlight(doc) {
  $(doc).find("span[data-count]").removeClass("active");
}

/*
* This allows us to highlight the currently spoken word, by refering to the respective span via the onboundary events charIndex property.
* This function should be called once on the initial pageload and whenever the text changes.
*/
function articulateTextChanged(doc) {
  var counter = 0;
  var elements = $(doc).find("#cr-content-container").find("p, h1, h2, h3, h4, h5, h6");
  $(elements).each(function(index, elem){
    $(this).attr("id", "elem-"+index);

    elem = $(elem).html();
    var text = elem.replace(/<[^>]*>/g, "");
    text = text.split(" ");
    var wrappedText = [];
    for (i = 0; i < text.length; i++) {
      var word = text[i].trim();
      var inc = word.length + 1;

      var element_name = $(this).prop("tagName");
      if (i == text.length - 1) {
        if (element_name == "H1" || element_name == "H2" || element_name == "H3" || element_name == "H4" || element_name == "H5" || element_name == "H6") {
          if (word.includes(".") == false ) {
            word = word+".";
          }
        }
      }

      word = "<span data-count='" + counter + "'>" + word + "</span>";
      counter += inc;
      wrappedText.push(word);
    }
    wrappedText = wrappedText.join(" ");
    $(doc).find("#elem-"+index).html(wrappedText);
  });
}

//Remove artificial/helper dots
function articulateReset(doc) {
  var counter = 0;
  var elements = $(doc).find("#cr-content-container").find("p, h1, h2, h3, h4, h5, h6");
  $(elements).each(function(index, elem){
    $(this).attr("id", "elem-"+index);

    elem = $(elem).html();
    var text = elem.replace(/<[^>]*>/g, "");
    text = text.split(" ");
    var wrappedText = [];
    for (i = 0; i < text.length; i++) {
      var word = text[i].trim();
      var inc = word.length + 1;

      var element_name = $(this).prop("tagName");
      if (i == text.length - 1) {
        if (element_name == "H1" || element_name == "H2" || element_name == "H3" || element_name == "H4" || element_name == "H5" || element_name == "H6") {
          if (word.includes(".") == true ) {
            word = word.replace(".","");
          }
        }
      }

      word = "<span data-count='" + counter + "'>" + word + "</span>";
      counter += inc;
      wrappedText.push(word);
    }
    wrappedText = wrappedText.join(" ");
    $(doc).find("#elem-"+index).html(wrappedText);
  });
}

//Get status from checkbox
function getCheckboxStatus(checkbox){
  var status;
  if ($(checkbox).is(':checked')) { status = "on"; } else { status = "off"; }
  return status;
}

/*** Scrolling ***/
var scrolling = false;
function startStopScrolling(doc){
  start_btn = $(doc).find("#options-manual-scroll .start");
  stop_btn = $(doc).find("#options-manual-scroll .stop");
  speed = parseInt( $(doc).find("#options-scroll-speed input").val() );

  if (scrolling == false) {
    $(doc).find('html, body').animate({scrollTop:$(doc).height()}, speed);

    $(start_btn).hide();
    $(stop_btn).show();
    scrolling = true;
  } else {
    $(doc).find("body").stop();
    $(start_btn).show();
    $(stop_btn).hide();
    scrolling = false;
  }
}
function optionsManualScroll(doc){
  $(doc).find("#options-manual-scroll").click(function(){
    startStopScrolling(doc);
  });
}
function optionsAutoScroll(doc){
  chrome.storage.sync.get(['cr_auto_scroll'],function(result){
    if (result.cr_auto_scroll) {
      if (result.cr_auto_scroll == "on") {
        startStopScrolling(doc);
      }
    }
  });
}

/*** Delete & Undo Deleted Element ***/
var deleted_elements = [];
var last_element;
function startDeleteElement(doc) {
  var content_container = $(doc).find("#cr-content-container");
  var mouseFunc = function (e) {
    var selected = e.target;

    if (last_element != selected)  {
      if (last_element != null) {
        $(last_element).removeClass("deletion-mode-hovered");
      }

      $(selected).addClass("deletion-mode-hovered");
      last_element = selected;
    }
  }, clickFunc = function(e) {
    e.preventDefault();

    selected = e.target;
    $(selected).removeClass("deletion-mode-hovered");

    let actionObj;
    let parent = selected.parentNode;
    actionObj = {
      "type": "delete",
      "index": Array.from(parent.children).indexOf(selected),
      "parent": parent,
      "elem": parent.removeChild(selected)
    };
    deleted_elements.push(actionObj);
    $(doc).find("#options-delete-element-undo").show();
  }, escFunc = function(e) {
    // Listen for the "Esc" key and exit if so
    if(e.keyCode === 27) {
      exitFunc();
    }
  }, exitFunc = function() {
    $(content_container).off('mouseover', mouseFunc);
    $(content_container).off('click', clickFunc);
    $(doc).off('keydown', escFunc);

    $(doc).find(".deletion-mode-hovered").removeClass("deletion-mode-hovered");
    $(doc).find("#options-delete-element").show();
    $(doc).find("#options-delete-element-stop").hide();
  }

  $(content_container).on('mouseover', mouseFunc);
  $(content_container).on('click', clickFunc);
  $(doc).on('keydown', escFunc);

  $(doc).find("#options-delete-element-stop").click(function(){
    exitFunc();
  });
}
function undoDeletedElement(doc) {
  let actionObj = deleted_elements.pop();

  if(actionObj) {
    actionObj.parent.insertBefore(actionObj.elem, actionObj.parent.children[actionObj.index]);
  }

  if(deleted_elements.length === 0) {
    $(doc).find("#options-delete-element-undo").hide();
  }
}

/*** Toolbar ***/
var selection;
var selectedContent;
var range;
var rect;
function toolbarDisplayToggle(doc) {
  $(doc).find("#cr-content-container").mouseup(function(event) {
    selection = doc.getSelection();

    if ( (selection.type === 'Range') &&
      !$(event.target).hasClass("tlite") &&
      !$(event.target).hasClass("no-close") &&
      ( $(event.target).attr("id") != "cr-toolbar-note-form-textarea" )
    ) {
      selectedContent = selection.toString();
      range = selection.getRangeAt(0).cloneRange();
      rect = range.getBoundingClientRect();

      showToolbar(rect, doc);
    } else {
      var toolbar_id = "cr-toolbar";
      var parent = $(event.target).parent();
      if ( ($(event.target).attr("id") != toolbar_id) &&
        ($(parent).attr("id") != toolbar_id) &&
        ($(parent).parent().attr("id") != toolbar_id)
      ) {
        $(doc).find("#cr-toolbar").hide();
        $(doc).find("#cr-toolbar-note-form").hide();
      }
    }
  });
}
function showToolbar(rect, doc) {
  // toolbar element only create once
  var toolbar = doc.getElementById("cr-toolbar");

  // caculate the position of toolbar
  var toolbarWidth = toolbar.offsetWidth;
  var toolbarHeight = toolbar.offsetHeight;
  //toolbar.style.left = `${(rect.right - rect.left) / 2 + rect.left - toolbarWidth / 2}px`;
  //toolbar.style.top = `${rect.top - toolbarHeight - 4 + doc.body.scrollTop}px`;

  //toolbar.style.top = `${rect.top - toolbarHeight - 50 + doc.body.scrollTop}px`;
  //toolbar.style.left = `calc(${rect.left}px - 30%)`;

  //toolbar.style.top = $(selection).offset().top + "px";
  //toolbar.style.left = ($(selection).offset().right + $(this).width()) + "px";

  toolbar.style.left = (window.pageXOffset + rect.x + (rect.width - $(toolbar).width()) / 2)/2;
  toolbar.style.top = `${rect.top - toolbarHeight - 50 + doc.body.scrollTop}px`;

  $(toolbar).show();
}
function toolbarNoteFormToggle(doc){
  $(doc).find("#cr-toolbar-note").click(function(e){
    $(doc).find("#cr-toolbar-note-form").toggle();
  });
}
function toolbarActionsHandler(doc){
  // Handle Highlighting & Taking Note
  $(doc).find("#cr-toolbar-highlight, #cr-toolbar-note-form button[name='add_note']").click(function(e){
    if (selectedContent != ""){
      // Restore selection
      let new_range = new Range();
      new_range.setStart(range.startContainer, range.startOffset);
      new_range.setEnd(range.endContainer, range.endOffset);
      doc.getSelection().removeAllRanges();
      doc.getSelection().addRange(new_range);

      var textarea = $(doc).find("#cr-toolbar-note-form textarea");
      var note = $(textarea).val().trim();

      //if (note != "") {
        var note_wrapper = doc.createElement('span');

        highlighter_color = $(doc).find("#options-highlighter-color input[name='highlighter_color']").val();
        datetime = new Date().getTime();
        data_note_id = "cr-note-wrapper-"+datetime;

        highlighter = rangy.createHighlighter(doc);
        applier = rangy.createClassApplier("cr-note-wrapper", {
            elementProperties: {
              title: note
            },
            elementAttributes: {
              style: "background-color: "+highlighter_color,
              "data-note-id": data_note_id
            }
          }
        );
        highlighter.addClassApplier(applier);
        highlighter.highlightSelection("cr-note-wrapper");

        $(textarea).val("");
        $(doc).find("#cr-toolbar").hide();

        notesToggle(doc, data_note_id);
      //} else {
      //  alert("Note cannot be empty!");
      //}

      //if (note != "") {
        notesUpdateList(doc);
        savePage(doc, true);
      //}

      // Deselect all selected text
      doc.getSelection().removeAllRanges();
    }
  });

  // Translate
  $(doc).find("#cr-toolbar-translate").click(function(){
    if (selectedContent != ""){
      translateText(doc, selectedContent);
    } else {
      alert("Text cannot be empty!");
    }
  });

  // Search
  $(doc).find("#cr-toolbar-search").click(function(){
    if (selectedContent != ""){
      searchText(selectedContent);
    } else {
      alert("Text cannot be empty!");
    }
  });

  // Share to Twitter
  $(doc).find("#cr-toolbar-share-twitter").click(function(){
    if (selectedContent != ""){
      shareTwitter(selectedContent);
    } else {
      alert("Text cannot be empty!");
    }
  });
}

// Toggle accordian content
function optionsAccordian(doc){
  $(doc).find("#options-main-panel .options-panel-header").click(function(){
    if ( $(this).next().is(":visible") ) {
      original_state = "visible";
    } else {
      original_state = "hidden";
    }

    $(doc).find("#options-main-panel .options-panel-header").removeClass("active");
    $(doc).find("#options-main-panel .options-panel-content").removeClass("active");
    $(doc).find("#options-main-panel .options-panel-content").hide();

    if ( original_state == "visible" ) {
      $(this).removeClass("active");
      $(this).next().removeClass("active");
      $(this).next().slideUp(500);
    } else {
      $(this).addClass("active");
      $(this).next().addClass("active");
      $(this).next().slideDown(500);
    }
  });
}

// Colorpicker input field handler
function optionsColorPicker(doc){
  $(doc).on('change', 'input[type=color]', function() {
    $(this.parentNode).next().val($(this).val());
    this.parentNode.style.backgroundColor = this.value;
  });
}

function readingTime(text) {
  var wordsPerMinute = 200;
  var noOfWords = text.split(/\s/g).length;
  var minutes = noOfWords / wordsPerMinute;
  var readTime = Math.ceil(minutes);
  //var `${readTime} minute read`;
  //if (readTime == 0) || (readTime == 1) {
  //  return readTime + " minute read";
  //} else{
  //  return readTime + " minutes read";
  //}

  return readTime;
}

function shareTwitter(text) {
  var twitter_url = "https://twitter.com/intent/tweet?text=";
  var current_url = window.location.href;
  selectedText = text;
  selectedText = encodeURIComponent(text);
  var share_text = '"'+selectedText+'" - ' + current_url + ' via @readermode';
  popupwindow(twitter_url + share_text, 'Share', 550, 295);
}

/*** notesUpdateList ***/
function notesListActionsToggle(doc){
  $(doc).find("#cr-notes-list li").on({
    mouseenter: function () {
      $(this).find(".notes-list-actions").show();
    },
    mouseleave: function () {
      $(this).find(".notes-list-actions").hide();
    }
  });
}
function notesUpdateList(doc){
  highlighter_color = $(doc).find("#options-highlighter-color input[name='highlighter_color']").val();
  notes_list = $(doc).find("#cr-notes-list");
  $(notes_list).html("");

  notes = {};
  $(doc).find(".cr-note-wrapper").each(function(){
    note_id = $(this).attr("data-note-id");

    if (notes[note_id]) {
      notes[note_id].original_text = notes[note_id].original_text + " " + $(this).html();
    } else {
      notes[note_id] = {
        original_text: $(this).html(),
        note: $(this).attr("title")
      }
    }
  });

  if ( $.isEmptyObject(notes) == true ) {
    $(doc).find("#cr-notes .text-default").show();
  } else {
    $(doc).find("#cr-notes .text-default").hide();

    $.each(notes, function(index, obj) {
      note_id = index;
      original_text = obj.original_text;
      original_note = obj.note;
      escaped_text = original_text.replace(/"|'/g,'');

      $(notes_list).append(`
        <li>
          <div class="notes-list-actions" style="display:none;">
            <span class="btn-clipboard" data-clipboard-action="copy" data-clipboard-text="${escaped_text}">
              <i class="fas fa-copy"></i>
            </span>
          </div>
          <div id="${note_id}">
            <blockquote class='notes-list-text' style='border-left: 5px solid ${highlighter_color}'>${original_text}</blockquote>
          </div>
          <div class='notes-list-note'>${original_note}</div>
        </li>
      `);
    });
  }

  media_clipboard(doc, '.btn-clipboard');
  notesListActionsToggle(doc);
}

/*** Search ***/
function searchText(text) {
  var search_url ='https://google.com/search?q=';
  popupwindow(search_url + encodeURIComponent(text), 'Search', 900, 540);
}

/*** Google Translate ***/
function getBrowserLanguage() {
  let language = navigator.language || navigator.userLanguage || function (){
    const languages = navigator.languages;
    if (navigator.languages.length > 0){
      return navigator.languages[0];
    }
  }() || 'en';
  return language.split('-')[0];
}
function translateText(doc, text) {
  var translate_url = 'https://translate.google.com/#auto/';
  var translate_to_language = $(doc).find("#options-translate-to select").find(":selected").val();
  popupwindow(translate_url + translate_to_language + '/' + text, 'Translate', 900, 540);
}

function popupwindow(url, title, w, h) {
  let left = screen.width / 2 - w / 2;
  let top = screen.height / 2 - h / 2;
  return window.open(
    url,
    title,
    'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=' +
      w +
      ', height=' +
      h +
      ', top=' +
      top +
      ', left=' +
      left
  );
}

function notePanelReset(doc){
  var note_panel = $(doc).find("#note-panel");
  var note = $(note_panel).find(".note");
  var edit_btn = $(note_panel).find("button.edit");
  var cancel_btn = $(note_panel).find("button.cancel");
  var update_btn = $(note_panel).find("button.update");

  $(note).html("");
  $(note).attr('contenteditable','false');
  $(note).attr("readonly", true);
  $(edit_btn).show();
  $(cancel_btn).hide();
  $(update_btn).hide();
}

function notesToggle(doc, data_note_id){
  if (data_note_id) {
    /*
    elem = $(doc).find("#"+id);
    notePanel(doc, elem);
    */
    elems = $(doc).find(`span[data-note-id=${data_note_id}]`);
    $(elems).each(function(){
      elem = $(this);
      notePanel(doc, elem);
    });
  } else {
    elems = $(doc).find(".cr-note-wrapper");
    $(elems).each(function(){
      elem = $(this);
      notePanel(doc, elem);
    });
  }
}

/*
* Keep these 2 vars outside
*  Otherwhise, will have problem with deleting elements
*/
var note_panel;
var note;
var note_wrapper;
var original_note;
function notePanel(doc, elem) {

  $(elem).click(function(e){
    e.preventDefault();

    note_wrapper = $(e.target);
    data_note_id = $(note_wrapper).attr("data-note-id");
    original_note = $(this).attr("title");

    note_panel = $(doc).find("#note-panel");
    note = $(doc).find("#note-panel-textarea");

    if ( $(note_panel).is(":hidden") ) {
      $(note).val(original_note);
      $(note_panel).css({
        display: "block",
        position: "absolute",
        left: ($(this).offset().right + $(this).width()) + "px",
        top: $(this).offset().top + "px"
      });

      var close_btn = $(note_panel).find(".btn-close");
      var update_btn = $(note_panel).find("button.update");
      var delete_btn = $(note_panel).find("button.delete");
      $(close_btn).click(function(){
        $(note_panel).hide();
        $(note).html("");
      });
      $(update_btn).click(function(){
        //span = $(this).find("span");
        $(update_btn).html("<span><i class='far fa-check-circle' style='color: #2cbc63'></i>Updated!</span>");

        setTimeout(function(){
          $(update_btn).find("span").fadeOut();
          $(update_btn).html("<span><i class='far fa-save'></i>Update</span>");
        }, 500);

        new_note = $(note).val();
        $(doc).find(`span[data-note-id=${data_note_id}]`).each(function(){
          $(this).attr("title", new_note);
        });

        notesUpdateList(doc);
        savePage(doc, true);
      });
      $(delete_btn).click(function(){
        //var result = confirm("Are you sure you want to delete this?");
        //if (result == true) {
          $(note_panel).hide();
          $(note).html("");

          $(doc).find(`span[data-note-id=${data_note_id}]`).each(function(){
            $(this).replaceWith($(this).html());
          });

          notesUpdateList(doc);
          savePage(doc, true);
        //}
      });
    } else {
      $(note_panel).hide();
      $(note).html("");
    }
  });

}

// Get encoded current url
function getEncodedCurrentURL(){
  var current_url = window.location.href;
  var encodedURL = btoa(current_url);

  return encodedURL;
}

// Save current page
function savePage(doc, run_in_background) {
  $(doc).find("#cr-saved-notice").html("<span class='loading-dots'>Saving</span>...").show();
  $(doc).find("#options-saved-panel .loading-status").html("<span class='loading-dots'>Saving</span>...").fadeIn("Show");

  if (!run_in_background) {
    $(doc).find("#options-saved-panel").show();
  }

  // Get encoded current url
  encodedURL = getEncodedCurrentURL();

  //Compress current_html & save as backup in storage
  current_html = $(doc).find("#cr-content-wrapper").html();
  var compressed_html = compressHTML(current_html);
  chrome.storage.local.set({
    //Use encodedURL as the key
    [encodedURL]: compressed_html
  });

  // Saved encodedURL to saved_pages list
  var current_page_url = window.location.href;
  var current_page = {
    "url": current_page_url,
    "encodedURL": encodedURL
  };
  pages = [];
  // Get default auto_run rules
  chrome.storage.local.get(['cr_saved_pages'], function(result) {
    let default_val = result.cr_saved_pages;
    if (default_val) {
      pages = JSON.parse(default_val);

      // Loop through json here and only save new page if it's not already in storage
      var page_existed_in_storage = false;
      Object.keys(pages).forEach(function(key){
        if (pages[key]) {
          if(pages[key]["url"]==current_page_url) {
            page_existed_in_storage = true;
          }
        }
      });
      if (page_existed_in_storage == false) {
        pages.push(current_page);
        pages_as_string = JSON.stringify(pages);
        chrome.storage.local.set({cr_saved_pages: pages_as_string});
      }
    } else{
      pages.push(current_page);
      pages_as_string = JSON.stringify(pages);
      chrome.storage.local.set({cr_saved_pages: pages_as_string});
    }

    // Put data-encoded-url to the remove-page link
    $(doc).find(".remove-saved-article").attr("data-encoded-url", encodedURL);

    // Show saved info & status
    $(doc).find("#cr-saved-notice").html("<i class='fas fa-check-circle m-r-3'></i> Saved");
    $(doc).find('#cr-container .saved-version-notice').fadeIn();
    $(doc).find("#options-saved-panel .loading-status").html("<i class='fas fa-check-circle m-r-3'></i> Saved");

    // Hide options-saved-panel
    setTimeout(function(){
      $(doc).find("#options-saved-panel").hide();
      $(doc).find("#options-menu li a").attr("class","tooltip");
    }, 7000);
  });
}

// Save setting's value to storage
function saveStorageValue(storage, val) {
  chrome.storage.sync.set({[storage]: val});
}

/*** Set Settings ***/
function removeInlineElemStyles(doc){
  $(doc).find('#cr-content-container, #cr-body, #cr-content-wrapper').find("p,li,a,h1,h2,h3,h4,h5.h6").css("font-family","");
  $(doc).find('#cr-content-container, #cr-body, #cr-content-wrapper').find("p,li,a,h1,h2,h3,h4,h5.h6").css("font-size","");
  $(doc).find('#cr-content-container, #cr-body, #cr-content-wrapper').find("p,li,a,h1,h2,h3,h4,h5.h6").css("line-height","");
  $(doc).find('#cr-content-container, #cr-body, #cr-content-wrapper').find("p,li,a,h1,h2,h3,h4,h5.h6").css("letter-spacing","");
  $(doc).find('#cr-content-container, #cr-body, #cr-content-wrapper').find("p,li,a,h1,h2,h3,h4,h5.h6").css("color","");
}
function setFontFamily(doc, val, save) {
  if (save) {
    chrome.storage.sync.set({cr_font_family: val});
  }
  $(doc).find('#cr-content-container').css( "font-family", val );
  $(doc).find(`#options-font-family select option[value='${val}']`).prop('selected', true);
}
function setFontSize(doc, val, save) {
  if (save) {
    chrome.storage.sync.set({cr_font_size: val});
  }
  $(doc).find("#cr-content-container").css( "font-size", val );
  $(doc).find("#options-font-size input").val(  val );
  $(doc).find("#options-font-size .val").text(  val );
}
function setLineHeight(doc, val, save) {
  if (save) {
    chrome.storage.sync.set({cr_line_height: val});
  }
  $(doc).find("#cr-content-container").css( "line-height", val );
  $(doc).find("#options-line-height input").val(  val );
  $(doc).find("#options-line-height .val").text(  val );
}
function setLetterSpace(doc, val, save) {
  if (save) {
    chrome.storage.sync.set({cr_letter_space: val});
  }
  $(doc).find("#cr-content-container").css( "letter-spacing", val );
  $(doc).find("#options-letter-space input").val(  val );
  $(doc).find("#options-letter-space .val").text(  val );
}
function setMaxWidth(doc, val, save) {
  if (save) {
    chrome.storage.sync.set({cr_max_width: val});
  }
  $(doc).find("#cr-container").css( "max-width", val );
  $(doc).find("#options-max-width input").val(  val );
  $(doc).find("#options-max-width .val").text(  val );
}
function setBackgroundColor(doc, val, theme, save) {
  if (theme == "cr-theme-light") {
    cr_background_color_light = val;
    save ? chrome.storage.sync.set({cr_background_color_light: val}) : null;
  } else if (theme == "cr-theme-dark"){
    cr_background_color_dark = val;
    save ? chrome.storage.sync.set({cr_background_color_dark: val})  : null;
  } else if (theme == "cr-theme-custom"){
    cr_background_color = val;
    save ? chrome.storage.sync.set({cr_background_color: val}) : null;
  } else {
  }

  $(doc).find("#cr-body").css( "background-color", val );
  $(doc).find("#options-theme ul li a[data-theme='"+theme+"']").css("background-color", val);

  $(doc).find("#options-background-color input[name='background_color']").val( val );
  $(doc).find("#options-background-color input[type='color']").val(  val );
  $(doc).find("#options-background-color label.color").css('background-color', val);
}
function setTextColor(doc, val, theme, save) {
  if (theme == "cr-theme-light") {
    cr_text_color_light = val;
    save ? chrome.storage.sync.set({cr_text_color_light: val}) : null;
  } else if (theme == "cr-theme-dark"){
    cr_text_color_dark = val;
    save ? chrome.storage.sync.set({cr_text_color_dark: val}) : null;
  } else if (theme == "cr-theme-custom"){
    cr_text_color = val;
    save ? chrome.storage.sync.set({cr_text_color: val}) : null;
  } else {
  }

  $(doc).find("#cr-body").css( "color", val );

  $(doc).find("#options-text-color input[name='text_color']").val(  val );
  $(doc).find("#options-text-color input[type='color']").val(  val );
  $(doc).find("#options-text-color label.color").css('background-color', val);
}
function setLinkColor(doc, val, theme, save) {
  if (theme == "cr-theme-light") {
    cr_link_color_light = val;
    save ? chrome.storage.sync.set({cr_link_color_light: val}) : null;
  } else if (theme == "cr-theme-dark"){
    cr_link_color_dark = val;
    save ? chrome.storage.sync.set({cr_link_color_dark: val}) : null;
  } else if (theme == "cr-theme-custom"){
    cr_link_color = val;
    save ? chrome.storage.sync.set({cr_link_color: val}) : null;
  } else {
  }
  $(doc).find("#cr-body").find("a").css( "color", val );

  $(doc).find("#options-link-color input[name='link_color']").val(  val );
  $(doc).find("#options-link-color input[type='color']").val(  val );
  $(doc).find("#options-link-color label.color").css('background-color', val);
}
function setHighlighterColor(doc, val, theme, save) {
  if (theme == "cr-theme-light") {
    cr_highlighter_color_light = val;
    save ? chrome.storage.sync.set({cr_highlighter_color_light: val}) : null;
  } else if (theme == "cr-theme-dark"){
    cr_highlighter_color_dark = val;
    save ? chrome.storage.sync.set({cr_highlighter_color_dark: val}) : null;
  } else if (theme == "cr-theme-custom"){
    cr_highlighter_color = val;
    save ? chrome.storage.sync.set({cr_highlighter_color: val}) : null;
  } else {
  }
  $(doc).find("#cr-body .cr-note-wrapper").css( "background-color", val );
  $(doc).find("#cr-body #cr-notes blockquote").css("border-left", "5px solid "+val);

  $(doc).find("#options-highlighter-color input[name='highlighter_color']").val(  val );
  $(doc).find("#options-highlighter-color input[type='color']").val(  val );
  $(doc).find("#options-highlighter-color label.color").css('background-color', val);
}
function setTheme(doc, val, save){
  if (save) {
    cr_theme = $(doc).find("#options-theme ul li a.active").attr("data-theme");
    chrome.storage.sync.set({cr_theme: val});
  }

  $(doc).find("#options-theme ul li a").each(function(){
    if ( $(this).attr("data-theme") == val ) {
      $(this).addClass("active");
    } else {
      $(this).removeClass("active");
    }
  });
  $(doc).find("#cr-body").attr("class", val);

  if (val == "cr-theme-light") {
    setBackgroundColor(doc, cr_background_color_light, "cr-theme-light");
    setTextColor(doc, cr_text_color_light, "cr-theme-light");
    setLinkColor(doc, cr_link_color_light, "cr-theme-light");
    setHighlighterColor(doc, cr_highlighter_color_light, "cr-theme-light");
  } else if (val == "cr-theme-dark"){
    setBackgroundColor(doc, cr_background_color_dark, "cr-theme-dark");
    setTextColor(doc, cr_text_color_dark, "cr-theme-dark");
    setLinkColor(doc, cr_link_color_dark, "cr-theme-dark");
    setHighlighterColor(doc, cr_highlighter_color_dark, "cr-theme-dark");
  } else if (val == "cr-theme-custom"){
    setBackgroundColor(doc, cr_background_color, "cr-theme-custom");
    setTextColor(doc, cr_text_color, "cr-theme-custom");
    setLinkColor(doc, cr_link_color, "cr-theme-custom");
    setHighlighterColor(doc, cr_highlighter_color, "cr-theme-custom");
  } else {
  }
}
function setDisplayOutline(doc, status, save) {
  if (status == "on") {
    $(doc).find('#cr-outline').show();
    $(doc).find('#options-display-outline input').prop("checked", true);
  } else {
    $(doc).find('#cr-outline').hide();
    $(doc).find('#options-display-outline input').prop("checked", false);
  }

  if (save) {
    chrome.storage.sync.set({cr_display_outline: status});
  }
}
function setDisplayImages(doc, status, save) {
  if (status == "on") {
    $(doc).find('#cr-content-container img').show();
    $(doc).find('#options-display-images input').prop("checked", true);
  } else {
    $(doc).find('#cr-content-container img').hide();
    $(doc).find('#options-display-images input').prop("checked", false);
  }
  if (save) {
    chrome.storage.sync.set({cr_display_images: status});
  }
}
function setDisplayNotes(doc, status, save) {
  if (status == "on") {
    notesUpdateList(doc);
    $(doc).find('#cr-container #cr-notes').show();
    $(doc).find('#options-display-notes input').prop("checked", true);
  } else {
    $(doc).find('#cr-container #cr-notes').hide();
    $(doc).find('#options-display-notes input').prop("checked", false);
  }
  if (save) {
    chrome.storage.sync.set({cr_display_notes: status});
  }
}
function setDisplayMeta(doc, status, save) {
  if (status == "on") {
    $(doc).find('#cr-container #cr-meta').show();
    $(doc).find('#options-display-meta input').prop("checked", true);
  } else {
    $(doc).find('#cr-container #cr-meta').hide();
    $(doc).find('#options-display-meta input').prop("checked", false);
  }
  if (save) {
    chrome.storage.sync.set({cr_display_meta: status});
  }
}
function setDisplayAuthor(doc, status, save) {
  if (status == "on") {
    $(doc).find('#cr-container #cr-meta-author').show();
    $(doc).find('#options-display-author input').prop("checked", true);
  } else {
    $(doc).find('#cr-container #cr-meta-author').hide();
    $(doc).find('#options-display-author input').prop("checked", false);
  }
  if (save) {
    chrome.storage.sync.set({cr_display_author: status});
  }
}
function setDisplayReadingTime(doc, status, save) {
  if (status == "on") {
    $(doc).find('#cr-container #cr-meta-reading-time').show();
    $(doc).find('#options-display-reading-time input').prop("checked", true);
  } else {
    $(doc).find('#cr-container #cr-meta-reading-time').hide();
    $(doc).find('#options-display-reading-time input').prop("checked", false);
  }
  if (save) {
    chrome.storage.sync.set({cr_display_reading_time: status});
  }
}
function setDisplaySavedInfo(doc, status, save) {
  if (status == "on") {
    $(doc).find('#cr-container #cr-saved-info').show();
    $(doc).find('#options-display-saved-info input').prop("checked", true);
  } else {
    $(doc).find('#cr-container #cr-saved-info').hide();
    $(doc).find('#options-display-saved-info input').prop("checked", false);
  }

  if (save) {
    chrome.storage.sync.set({cr_display_saved_info: status});
  }

  encodedURL = getEncodedCurrentURL();
  chrome.storage.local.get(encodedURL, function(result) {
    let default_val = result[encodedURL]
    if (default_val) {
      $(doc).find(".remove-saved-article").attr("data-encoded-url", encodedURL);
      $(doc).find('.saved-version-notice').show();
    } else {
      $(doc).find('.saved-version-notice').hide();
    }
  });
}
function setDisplayRuler(doc, status, save) {
  if (status == "on") {
    $(doc).find('#cr-content-container #cr-ruler').show();
    $(doc).find('#options-display-ruler input').prop("checked", true);
  } else {
    $(doc).find('#cr-content-container #cr-ruler').hide();
    $(doc).find('#options-display-ruler input').prop("checked", false);
  }

  if (save) {
    chrome.storage.sync.set({cr_display_ruler: status});
  }
}
function setRulerColor(doc, val, save) {
  if (save) {
    chrome.storage.sync.set({cr_ruler_color: val});
  }
  $(doc).find("#cr-content-container #cr-ruler").css( "background-color", val );
  $(doc).find("#options-ruler-color input[name='ruler_color']").val(  val );
  $(doc).find("#options-ruler-color input[type='color']").val(  val );
  $(doc).find("#options-ruler-color label.color").css('background-color', val);
}
function setRulerHeight(doc, val, save) {
  if (save) {
    chrome.storage.sync.set({cr_ruler_height: val});
  }
  $(doc).find("#cr-content-container #cr-ruler").css( "height", val );
  $(doc).find("#options-ruler-height input").val(  val );
  $(doc).find("#options-ruler-height .val").text(  val );
}
function setRulerPosition(doc, val, save) {
  if (save) {
    chrome.storage.sync.set({cr_ruler_position: val});
  }
  $(doc).find("#cr-content-container #cr-ruler").css( "top", val+"%" );
  $(doc).find("#options-ruler-position input").val(  val );
  $(doc).find("#options-ruler-position .val").text(  val );
}
function setArticulateVoice(doc, val, save) {
  if (save) {
    chrome.storage.sync.set({cr_articulate_voice: val});
  }
  $(doc).find("#options-articulate-voice select option[value='"+val+"']").prop("selected", true);
}
function setArticulateRate(doc, val, save) {
  if (save) {
    chrome.storage.sync.set({cr_articulate_rate: val});
  }
  $(doc).find("#options-articulate-rate input").val(  val );
  $(doc).find("#options-articulate-rate .val").text(  val );
}
function setArticulatePitch(doc, val, save) {
  if (save) {
    chrome.storage.sync.set({cr_articulate_pitch: val});
  }
  $(doc).find("#options-articulate-pitch input").val(  val );
  $(doc).find("#options-articulate-pitch .val").text(  val );
}
function setArticulateVolume(doc, val, save) {
  if (save) {
    chrome.storage.sync.set({cr_articulate_volume: val});
  }
  $(doc).find("#options-articulate-volume input").val(  val );
  $(doc).find("#options-articulate-volume .val").text(  val );
}
function setAutoRunRules(doc, val, save) {
  rules_as_string = val;
  if (save) {
    chrome.storage.sync.set({'cr_auto_run_rules': rules_as_string});
  }

  $(doc).find("#options-auto-run-list").html("");

  if (val == "[]") {
    rules = val;
  } else {
    rules = JSON.parse(val);
    for (var key in rules) {
      var id = rules[key]["id"];
      var domain_is = rules[key]["domain_is"];
      var url_is = rules[key]["url_is"];
      var url_is_not = rules[key]["url_is_not"];
      var url_contains = rules[key]["url_contains"];
      var url_does_not_contain = rules[key]["url_does_not_contain"];
      var url_starts_with = rules[key]["url_starts_with"];
      var url_ends_with = rules[key]["url_ends_with"];
      var url_rule_in_sentence = rules[key]["url_rule_in_sentence"];

      if (isEmpty(url_rule_in_sentence) == false) {
        $(doc).find("#options-auto-run-list").append("<li data-id='"+id+"'>"+url_rule_in_sentence+" <button name='delete_rule'>Delete</button></li>");
      }
    }
  }

  var default_text =   $(doc).find("#options-auto-run .options-panel-default-text");
  if (rules != "[]" && rules.length > 0) {
    if (default_text.is(":visible")) {
      $(default_text).hide();
    }
  } else {
    $(default_text).show();
  }

  $(doc).find("#options-auto-run input").val("");

  deleteAutoRunRule(doc);
}
function deleteAutoRunRule(doc, save) {
  $(doc).find("#options-auto-run-list li button[name='delete_rule']").click(function(){
    id = $(this).parent().attr("data-id");

    chrome.storage.sync.get(['cr_auto_run_rules'], function(result) {
      let default_val = result.cr_auto_run_rules
      if (default_val) {
        rules = JSON.parse(default_val);

        // Remove rule if matched id found
        Object.keys(rules).forEach(function(key){
          if (rules[key]) {
            if(rules[key]["id"]==id) {
              delete rules[key];
              new_rules = rules.filter(function(item){ return item != undefined; });

              // Update storage with new rules
              rules_as_string = JSON.stringify(new_rules);
              setAutoRunRules(doc, rules_as_string, true);
            }
          }
        });

      }
    });

    $(this).parent().remove();
  });
}
function setTranslateTo (doc, val, save) {
  if (save) {
    chrome.storage.sync.set({cr_translate_to: val});
  }
  $(doc).find(`#options-translate-to select option[value='${val}']`).prop('selected', true);
}
function setDarkPanel(doc, status, save){
  if (status == "on") {
    $(doc).find("#cr-container .options-panel").addClass("options-panel-dark");
    $(doc).find("#options-dark-panel input").prop("checked", true);
  } else {
    $(doc).find("#cr-container .options-panel").attr("class", "options-panel");
    $(doc).find("#options-dark-panel input").prop("checked", false);
  }

  if (save) {
    chrome.storage.sync.set({cr_dark_panel: status});
  }
}
function setDisplayFooter(doc, status, save) {
  if (status == "on") {
    $(doc).find('#cr-container #cr-footer').hide();
    $(doc).find('#options-display-footer input').prop("checked", true);
  } else {
    $(doc).find('#cr-container #cr-footer').show();
    $(doc).find('#options-display-footer input').prop("checked", false);
  }
  if (save) {
    chrome.storage.sync.set({cr_display_meta: status});
  }
}
function setAutoScroll(doc, status, save){
  if (status == "on") {
    $(doc).find("#options-auto-scroll input").prop("checked", true);
  } else {
    $(doc).find("#options-auto-scroll input").prop("checked", false);
  }

  if (save) {
    chrome.storage.sync.set({cr_auto_scroll: status});
  }
}
function setScrollSpeed(doc, val, save) {
  if (save) {
    chrome.storage.sync.set({cr_scroll_speed: val});
  }
  $(doc).find("#options-scroll-speed .slider-container .val").text(  val );
}
function setDefaultCss(doc, val, save){
  if (save) {
    chrome.storage.sync.set({'cr_default_css': val});
  }
  $(doc).find("#options-default-css textarea").html(val);
  if ($(doc).find("#cr_default_css").length == false) {
    $("<style id='cr_default_css'>").text(val).appendTo(doc.head);
  }
  $(doc).find("#cr_default_css").html(val);
}

/*** Options Listeners & Save ***/
function optionsDefaultSettings(doc) {
  // Options Style
  chrome.storage.sync.get(['cr_font_family'],function(result){setFontFamily(doc, (result.cr_font_family) ? result.cr_font_family : 'Arial', true) });
  chrome.storage.sync.get(['cr_font_size'],function(result){setFontSize(doc, (result.cr_font_size) ? result.cr_font_size : 16, true) });
  chrome.storage.sync.get(['cr_line_height'],function(result){setLineHeight(doc, (result.cr_line_height) ? result.cr_line_height : 1.84, true) });
  chrome.storage.sync.get(['cr_letter_space'],function(result){setLetterSpace(doc, (result.cr_letter_space) ? result.cr_letter_space : 0, true) });
  chrome.storage.sync.get(['cr_max_width'],function(result){setMaxWidth(doc, (result.cr_max_width) ? result.cr_max_width : 680, true) });

  // Themes
  // Theme & DefaultCSS
  chrome.storage.sync.get(['cr_default_css'], function(result) {
    if (result.cr_default_css) {
      setDefaultCss(doc, result.cr_default_css, true);
    } else {
      fetch(chrome.extension.getURL('styles/default.css')).then(response => response.text()).then(data => { setDefaultCss(doc, data, true); });
    }
  });
  // Light Theme
  chrome.storage.sync.get(['cr_background_color_light'],function(result){ setBackgroundColor(doc, (result.cr_background_color_light ? result.cr_background_color_light : "#FFFFFF"), "cr-theme-light", true) });
  chrome.storage.sync.get(['cr_text_color_light'],function(result){ setTextColor(doc, (result.cr_text_color_light ? result.cr_text_color_light : "#333333"), "cr-theme-light", true) });
  chrome.storage.sync.get(['cr_link_color_light'],function(result){ setLinkColor(doc, (result.cr_link_color_light ? result.cr_link_color_light : "#5F6368"), "cr-theme-light", true) });
  chrome.storage.sync.get(['cr_highlighter_color_light'],function(result){setHighlighterColor(doc, (result.cr_highlighter_color_light ? result.cr_highlighter_color_light : "#7FFFD0"), "cr-theme-light", true) });
  // Dark Theme
  chrome.storage.sync.get(['cr_background_color_dark'],function(result){ setBackgroundColor(doc, (result.cr_background_color_dark ? result.cr_background_color_dark : "#1A1A1A"), "cr-theme-dark", true) });
  chrome.storage.sync.get(['cr_text_color_dark'],function(result){ setTextColor(doc, (result.cr_text_color_dark ? result.cr_text_color_dark : "#E0E0E0"), "cr-theme-dark", true) });
  chrome.storage.sync.get(['cr_link_color_dark'],function(result){ setLinkColor(doc, (result.cr_link_color_dark ? result.cr_link_color_dark : "#FFFFFF"), "cr-theme-dark", true) });
  chrome.storage.sync.get(['cr_highlighter_color_dark'],function(result){setHighlighterColor(doc, (result.cr_highlighter_color_dark ? result.cr_highlighter_color_dark : "#FF0099"), "cr-theme-dark", true) });
  // Custom Theme
  chrome.storage.sync.get(['cr_background_color'],function(result){ setBackgroundColor(doc, (result.cr_background_color ? result.cr_background_color : "#F8F1E3"), "cr-theme-custom", true) });
  chrome.storage.sync.get(['cr_text_color'],function(result){ setTextColor(doc, (result.cr_text_color ? result.cr_text_color : "#333333"), "cr-theme-custom", true) });
  chrome.storage.sync.get(['cr_link_color'],function(result){ setLinkColor(doc, (result.cr_link_color ? result.cr_link_color : "#5F6368"), "cr-theme-custom", true) });
  chrome.storage.sync.get(['cr_highlighter_color'],function(result){setHighlighterColor(doc, (result.cr_highlighter_color ? result.cr_highlighter_color : "#FFCC99"), "cr-theme-custom", true) });
  // Theme (need to be down here bcoz setTheme requires themes' values)
  chrome.storage.sync.get(['cr_theme'],function(result){ setTheme(doc, (result.cr_theme) ? result.cr_theme : "cr-theme-custom", true) });

  // Reader Components
  chrome.storage.sync.get(['cr_dark_panel'],function(result){setDarkPanel(doc, (result.cr_dark_panel) ? result.cr_dark_panel : "on", true) });
  chrome.storage.sync.get(['cr_display_footer'],function(result){setDisplayFooter(doc, (result.cr_display_footer) ? result.cr_display_footer : "off", true) });
  chrome.storage.sync.get(['cr_auto_scroll'],function(result){setAutoScroll(doc, (result.cr_auto_scroll) ? result.cr_auto_scroll : "off", true) });
  chrome.storage.sync.get(['cr_scroll_speed'],function(result){setScrollSpeed(doc, (result.cr_scroll_speed) ? result.cr_scroll_speed : 100000, true) });
  chrome.storage.sync.get(['cr_display_outline'],function(result){setDisplayOutline(doc, (result.cr_display_outline) ? result.cr_display_outline : "off", true) });
  chrome.storage.sync.get(['cr_display_images'],function(result){setDisplayImages(doc, (result.cr_display_images) ? result.cr_display_images : "on", true) });
  chrome.storage.sync.get(['cr_display_notes'],function(result){setDisplayNotes(doc, (result.cr_display_notes) ? result.cr_display_notes : "on", true) });
  chrome.storage.sync.get(['cr_display_meta'],function(result){setDisplayMeta(doc, (result.cr_display_meta) ? result.cr_display_meta : "on", true) });
  chrome.storage.sync.get(['cr_display_author'],function(result){setDisplayAuthor(doc, (result.cr_display_author) ? result.cr_display_author : "on", true) });
  chrome.storage.sync.get(['cr_display_reading_time'],function(result){setDisplayReadingTime(doc, (result.cr_display_reading_time) ? result.cr_display_reading_time : "on", true) });
  chrome.storage.sync.get(['cr_display_saved_info'],function(result){setDisplaySavedInfo(doc, (result.cr_display_saved_info) ? result.cr_display_saved_info : "on", true) });

  // Ruler
  chrome.storage.sync.get(['cr_display_ruler'],function(result){setDisplayRuler(doc, (result.cr_display_ruler) ? result.cr_display_ruler : "off", true) });
  chrome.storage.sync.get(['cr_ruler_color'],function(result){setRulerColor(doc, (result.cr_ruler_color) ? result.cr_ruler_color : "#795CFF", true) });
  chrome.storage.sync.get(['cr_ruler_height'],function(result){setRulerHeight(doc, (result.cr_ruler_height) ? result.cr_ruler_height : 30, true) });
  chrome.storage.sync.get(['cr_ruler_position'],function(result){setRulerPosition(doc, (result.cr_ruler_position) ? result.cr_ruler_position : 15, true) });

  // AutoRun
  chrome.storage.sync.get(['cr_auto_run_rules'], function(result) {
    let default_val = result.cr_auto_run_rules;
    if (default_val) {
      default_rules = JSON.parse(default_val);
      if (default_rules.length > 0) {
        setAutoRunRules(doc, default_val, true);
      } else {
        $(doc).find("#options-auto-run .options-panel-default-text").show();
      }
    } else {
      $(doc).find("#options-auto-run .options-panel-default-text").show();
    }
  });

  // Translate
  chrome.storage.sync.get(['cr_translate_to'],function(result){setTranslateTo(doc, (result.cr_translate_to) ? result.cr_translate_to : getBrowserLanguage(), true) });

  // Articulate
  chrome.storage.sync.get(['cr_articulate_voice'],function(result){setArticulateVoice(doc, (result.cr_articulate_voice) ? result.cr_articulate_voice : "Alex", true) });
  chrome.storage.sync.get(['cr_articulate_rate'],function(result){setArticulateRate(doc, (result.cr_articulate_rate) ? result.cr_articulate_rate : 1, true) });
  chrome.storage.sync.get(['cr_articulate_pitch'],function(result){setArticulatePitch(doc, (result.cr_articulate_pitch) ? result.cr_articulate_pitch : 1, true) });
  chrome.storage.sync.get(['cr_articulate_volume'],function(result){setArticulateVolume(doc, (result.cr_articulate_volume) ? result.cr_articulate_volume : 1, true) });
}
function optionsMenu(iframe) {
  var doc = iframe.contentWindow.document;

  // Handle Active Menu/Panel
  $(doc).find("#options-menu li a").click(function(){
    $(doc).find("#options-menu li a").attr("class","tooltip");

    this_menu = $(this);
    $(doc).find(".options-panel").each(function(index, panel){
      if ( $(this_menu).attr("data-panel") == $(panel).attr("id") ) {
        if ( $(panel).is(":visible") ) {
          $(panel).hide();
        } else {
          $(this_menu).addClass("active");
          $(panel).show();
        }
      } else {
        $(panel).hide();
      }
    });
  });

  // Delete Element
  $(doc).find("#options-delete-element").click(function(){
    $(this).hide();
    $(doc).find("#options-delete-element-stop").show();
    startDeleteElement(doc);
  });

  // Undo Delete Element
  $(doc).find("#options-delete-element-undo").click(function(){
    undoDeletedElement(doc);
  });

  // Fullscreen
  $(doc).find('#options-fullscreen').click(function () {
    screenfull.toggle($('#container')[0]).then(function () {
      if (screenfull.isFullscreen) {
        $(doc).find('#options-fullscreen i.enter').hide();
        $(doc).find('#options-fullscreen i.exit').show();
      } else {
        $(doc).find('#options-fullscreen i.enter').show();
        $(doc).find('#options-fullscreen i.exit').hide();
      }
    });
  });

  // Print
  $(doc).find("#options-print").click(function(){
    iframe.contentWindow.print();
  });

  // Save Page
  $(doc).find("#options-save-page").click(function(){
    savePage(doc);
  });
  $(doc).find("#options-saved-panel a.close").click(function(){
    $(doc).find("#options-menu li a").attr("class","tooltip");
    $(doc).find("#options-saved-panel").hide();
  });

  // Close
  $(doc).find("#options-close").click(function(){
    $(iframe).hide();
  });
}
function optionsPanelCloseHandler(doc){
  $(doc).click(function(e){
    target = $(e.target);
    setTimeout(function(){
      $(doc).find(".options-panel").each(function(){
        id = "#"+$(this).attr('id');
        if ( $(doc).find(id).is(":visible") ) {
          if ( !target.parents( id ).length && !target.parents("#options-menu").length ) {
            $(doc).find( id ).hide();
            $(doc).find( id ).hide();
            $(doc).find("#options-menu li a").removeClass("active");
          }
        }
      });
    }, 100);
  });
}
function optionsStyle(doc) {
  // Listeners
  $(doc).find("#options-font-family select").change(function() { setFontFamily(doc, $(this).val()); });
  $(doc).find("#options-font-size input").on("input change", function() { setFontSize(doc, $(this).val()); });
  $(doc).find("#options-line-height input").on("input change", function() { setLineHeight(doc, $(this).val()); });
  $(doc).find("#options-letter-space input").on("input change", function() { setLetterSpace(doc, $(this).val()); });
  $(doc).find("#options-max-width input").on("input change", function() { setMaxWidth(doc, $(this).val()); });

  // Save
  $(doc).find(".options-panel-content button[name='save-options-style']").click(function(e){
    cr_font_family = $(doc).find("#options-font-family select").find(":selected").val();
    cr_font_size = $(doc).find("#options-font-size input").val().trim();
    cr_line_height = $(doc).find("#options-line-height input").val().trim();
    cr_letter_space = $(doc).find("#options-letter-space input").val().trim();
    cr_max_width = $(doc).find("#options-max-width input").val().trim();
    saveStorageValue("cr_font_family", cr_font_family);
    saveStorageValue("cr_font_size", cr_font_size);
    saveStorageValue("cr_line_height", cr_line_height);
    saveStorageValue("cr_letter_space", cr_letter_space);
    saveStorageValue("cr_max_width", cr_max_width);

    $("<span class='text-info'>Saved!</span>").insertAfter( $(e.target) ).fadeOut(1500, function() { $(this).remove() });
  });
}
function getActiveTheme(doc){
  // Get active theme
  cr_theme = $(doc).find("#options-theme ul li a.active").attr("data-theme");
  return cr_theme;
}
function optionsTheme(doc) {
  cr_theme = getActiveTheme(doc);
  $(doc).find("#options-theme ul li a").click(function() { cr_theme = $(this).attr("data-theme"); setTheme(doc, cr_theme); });
  $(doc).find("#options-background-color input").on("input change", function() { setBackgroundColor(doc, $(this).val(), getActiveTheme(doc)) });
  $(doc).find("#options-text-color input").on("input change", function() { setTextColor(doc, $(this).val(), getActiveTheme(doc)) });
  $(doc).find("#options-link-color input").on("input change", function() { setLinkColor(doc, $(this).val(), getActiveTheme(doc)) });
  $(doc).find("#options-highlighter-color input").on("input change", function() { setHighlighterColor(doc, $(this).val(), getActiveTheme(doc)) });

  // Save
  $(doc).find(".options-panel-content button[name='save-options-themes']").click(function(e){
    cr_theme = getActiveTheme(doc);
    cr_background_color_active = $(doc).find("#options-background-color input[name='background_color']").val().trim();
    cr_text_color_active = $(doc).find("#options-text-color input[name='text_color']").val().trim();
    cr_link_color_active = $(doc).find("#options-link-color input[name='link_color']").val().trim();
    cr_highlighter_color_active = $(doc).find("#options-highlighter-color input[name='highlighter_color']").val().trim();

    saveStorageValue("cr_theme", cr_theme);
    if (cr_theme == "cr-theme-light") {
      cr_background_color_light = cr_background_color_active;
      cr_text_color_light = cr_text_color_active;
      cr_link_color_light = cr_link_color_active;
      cr_highlighter_color_light = cr_highlighter_color_active;

      saveStorageValue("cr_background_color_light", cr_background_color_active);
      saveStorageValue("cr_text_color_light", cr_text_color_active);
      saveStorageValue("cr_link_color_light", cr_link_color_active);
      saveStorageValue("cr_highlighter_color_light", cr_highlighter_color_active);
    } else if (cr_theme == "cr-theme-dark") {
      cr_background_color_dark = cr_background_color_active;
      cr_text_color_dark = cr_text_color_active;
      cr_link_color_dark = cr_link_color_active;
      cr_highlighter_color_dark = cr_highlighter_color_active;

      saveStorageValue("cr_background_color_dark", cr_background_color_active);
      saveStorageValue("cr_text_color_dark", cr_text_color_active);
      saveStorageValue("cr_link_color_dark", cr_link_color_active);
      saveStorageValue("cr_highlighter_color_dark", cr_highlighter_color_active);
    } else if (cr_theme == "cr-theme-custom") {
      cr_background_color_custom = cr_background_color_active;
      cr_text_color_custom = cr_text_color_active;
      cr_link_color_custom = cr_link_color_active;
      cr_highlighter_color_custom = cr_highlighter_color_active;

      saveStorageValue("cr_background_color", cr_background_color_active);
      saveStorageValue("cr_text_color", cr_text_color_active);
      saveStorageValue("cr_link_color", cr_link_color_active);
      saveStorageValue("cr_highlighter_color", cr_highlighter_color_active);
    } else {
    }
    setTheme(doc, cr_theme);

    $("<span class='text-info'>Saved!</span>").insertAfter( $(e.target) ).fadeOut(1500, function() { $(this).remove() });
  });
}
function optionsReaderComponents(doc) {
  // Listeners
  $(doc).find("#options-dark-panel input").change(function(){ setDarkPanel(doc, getCheckboxStatus($(this))); });
  $(doc).find("#options-display-footer input").change(function(){ setDisplayFooter(doc, getCheckboxStatus($(this))); });
  $(doc).find("#options-auto-scroll input").change(function(){ setAutoScroll(doc, getCheckboxStatus($(this))); });
  $(doc).find("#options-scroll-speed input").on("input change", function() { setScrollSpeed(doc, $(this).val()); });
  $(doc).find( "#options-display-outline input").change(function(){ setDisplayOutline(doc, getCheckboxStatus($(this))); });
  $(doc).find( "#options-display-images input").change(function(){ setDisplayImages(doc, getCheckboxStatus($(this))); });
  $(doc).find( "#options-display-notes input").change(function(){ setDisplayNotes(doc, getCheckboxStatus($(this))); });
  $(doc).find( "#options-display-meta input").change(function(){ setDisplayMeta(doc, getCheckboxStatus($(this))); });
  $(doc).find( "#options-display-author input").change(function(){ setDisplayAuthor(doc, getCheckboxStatus($(this))); });
  $(doc).find( "#options-display-reading-time input").change(function(){ setDisplayReadingTime(doc, getCheckboxStatus($(this))); });
  $(doc).find( "#options-display-saved-info input").change(function(){ setDisplaySavedInfo(doc, getCheckboxStatus($(this))); });

  // Save
  $(doc).find(".options-panel-content button[name='save-options-reader-components']").click(function(e){
    cr_auto_dark_panel = getCheckboxStatus( $(doc).find("#options-dark-panel input") );
    cr_display_footer = getCheckboxStatus( $(doc).find("#options-display-footer input") );
    cr_auto_scroll = getCheckboxStatus( $(doc).find("#options-auto-scroll input") );
    cr_scroll_speed = $(doc).find("#options-scroll-speed input").val();
    cr_display_outline = getCheckboxStatus( $(doc).find("#options-display-outline input") );
    cr_display_images = getCheckboxStatus( $(doc).find("#options-display-images input") );
    cr_display_notes = getCheckboxStatus( $(doc).find("#options-display-notes input") );
    cr_display_meta = getCheckboxStatus( $(doc).find("#options-display-meta input") );
    cr_display_author = getCheckboxStatus( $(doc).find("#options-display-author input") );
    cr_display_reading_time = getCheckboxStatus( $(doc).find("#options-display-reading-time input") );
    cr_display_saved_info = getCheckboxStatus( $(doc).find("#options-display-saved-info input") );

    saveStorageValue("cr_dark_panel", cr_auto_dark_panel);
    saveStorageValue("cr_display_footer", cr_display_footer);
    saveStorageValue("cr_auto_scroll", cr_auto_scroll);
    saveStorageValue("cr_scroll_speed", cr_scroll_speed);
    saveStorageValue("cr_display_outline", cr_display_outline);
    saveStorageValue("cr_display_images", cr_display_images);
    saveStorageValue("cr_display_notes", cr_display_notes);
    saveStorageValue("cr_display_meta", cr_display_meta);
    saveStorageValue("cr_display_author", cr_display_author);
    saveStorageValue("cr_display_reading_time", cr_display_reading_time);
    saveStorageValue("cr_display_saved_info", cr_display_saved_info);

    $("<span class='text-info'>Saved!</span>").insertAfter( $(e.target) ).fadeOut(1500, function() { $(this).remove() });
  });
}
function optionsRuler(doc) {
  // Listeners
  $(doc).find("#options-display-ruler input").change(function(){ setDisplayRuler(doc, getCheckboxStatus($(this))); });
  $(doc).find("#options-ruler-color input").on("input change", function() { setRulerColor(doc, $(this).val()); });
  $(doc).find("#options-ruler-height input").on("input change", function() { setRulerHeight(doc, $(this).val()); });
  $(doc).find("#options-ruler-position input").on("input change", function() { setRulerPosition(doc, $(this).val()); });

  // Save
  $(doc).find(".options-panel-content button[name='save-options-ruler']").click(function(e){
    cr_display_ruler = getCheckboxStatus( $(doc).find("#options-display-ruler input") );
    cr_ruler_color = $(doc).find("#options-ruler-color input[name='ruler_color']").val();
    cr_ruler_height = $(doc).find("#options-ruler-height .val").val();
    cr_ruler_position = $(doc).find("#options-ruler-position .val").val();

    saveStorageValue("cr_display_ruler", cr_display_ruler);
    saveStorageValue("cr_ruler_color", cr_ruler_color);
    saveStorageValue("cr_ruler_height", cr_ruler_height);
    saveStorageValue("cr_ruler_position", cr_ruler_position);

    $("<span class='text-info'>Saved!</span>").insertAfter( $(e.target) ).fadeOut(1500, function() { $(this).remove() });
  });
}
function optionsAutoRunRules(doc) {
  add_new_rule_toggle_btn = $(doc).find("#options-auto-run button[name='add_new_rule_toggle']");
  add_new_rule_panel = $(doc).find("#options-auto-run-add-new-rule-panel");
  add_new_rule_btn = $(doc).find("#options-auto-run button[name='add_new_rule']");
  cancel_new_rule_btn = $(doc).find("#options-auto-run button[name='cancel_new_rule']");

  $(add_new_rule_toggle_btn).click(function(){
    add_new_rule_panel = $(doc).find("#options-auto-run-add-new-rule-panel");
    $(add_new_rule_panel).show();
    $(this).hide();
  });
  $(add_new_rule_btn).click(function(){
    // Set and insert new rule to storage
    var auto_run_option = $(doc).find("#options-auto-run");
    var domain_name_is = $(auto_run_option).find("input[name='domain_name_is']").val();
    var url_is = $(auto_run_option).find("input[name='url_is']").val();
    var url_is_not = $(auto_run_option).find("input[name='url_is_not']").val();
    var url_contains = $(auto_run_option).find("input[name='url_contains']").val();
    var url_does_not_contain = $(auto_run_option).find("input[name='url_does_not_contain']").val();
    var url_starts_with = $(auto_run_option).find("input[name='url_starts_with']").val();
    var url_ends_with = $(auto_run_option).find("input[name='url_ends_with']").val();

    var rule_in_words = [];
    if (isEmpty(domain_name_is) == false) { rule_in_words.push("domain name is "+domain_name_is) }
    if (isEmpty(url_is) == false) { rule_in_words.push("url is "+url_is) }
    if (isEmpty(url_is_not) == false) { rule_in_words.push("url is  not "+url_is_not) }
    if (isEmpty(url_contains) == false) { rule_in_words.push("url contains "+url_contains) }
    if (isEmpty(url_does_not_contain) == false) { rule_in_words.push("url does not contain "+url_does_not_contain) }
    if (isEmpty(url_starts_with) == false) { rule_in_words.push("url starts with "+url_starts_with) }
    if (isEmpty(url_ends_with) == false) { rule_in_words.push("url ends with "+url_ends_with) }
    if (rule_in_words.length > 0) {
      var rules = [];
      var new_rule = {
        "id": 0,
        "domain_name_is": domain_name_is,
        "url_is": url_is,
        "url_is_not": url_is_not,
        "url_contains": url_contains,
        "url_does_not_contain": url_does_not_contain,
        "url_starts_with": url_starts_with,
        "url_ends_with": url_starts_with,
        "url_rule_in_sentence": ""
      };
      url_rule_in_sentence = "the page "+rule_in_words.join(" <b>and</b> ");
      new_rule["url_rule_in_sentence"] = url_rule_in_sentence;

      // Get default auto_run rules
      chrome.storage.sync.get(['cr_auto_run_rules'], function(result) {
        let default_val = result.cr_auto_run_rules;
        var default_rules;
        if (default_val) {
          default_rules = JSON.parse(default_val);
          if (default_rules.length > 0) {
            last_id = default_rules[ default_rules.length - 1 ]["id"];
            new_rule["id"] = last_id + 1;
            default_rules.push(new_rule);
          } else {
            new_rule["id"] = 1;
            default_rules.push(new_rule);
          }
        } else {
          new_rule["id"] = 1;
          default_rules = [];
          default_rules.push(new_rule);
        }

        rules_as_string = JSON.stringify(default_rules);
        setAutoRunRules(doc, rules_as_string, true);
      });
    } else {
      alert("Rules cannot be empty!");
    }
  });

  $(cancel_new_rule_btn).click(function(){
    $(add_new_rule_toggle_btn).show();
    $(add_new_rule_panel).hide();
  });
}
function optionsDefaultCss(doc){
  $(doc).find("#options-default-css button").click(function(e){
    cr_default_css = $(doc).find("#options-default-css textarea").val();
    setDefaultCss(doc, cr_default_css, true);

    $("<span class='text-info'>Updated!</span>").insertAfter( $(e.target) ).fadeOut(1500, function() { $(this).remove() });
  });
}
function optionsTranslate (doc) {
  // Listeners
  $(doc).find("#options-translate-to select").change(function() { setTranslateTo(doc, $(this).val()); });

  // Save
  $(doc).find(".options-panel-content button[name='save-options-translate']").click(function(e){
    cr_translate_to = $(doc).find("#options-translate-to select").find(":selected").val();

    saveStorageValue("cr_translate_to", cr_translate_to);

    $("<span class='text-info'>Saved!</span>").insertAfter( $(e.target) ).fadeOut(1500, function() { $(this).remove() });
  });
}
function optionsArticulate(doc) {
  // Listeners
  $(doc).find("#options-articulate-voice select").on("change", function() { setArticulateVoice(doc, $(this).val()); });
  $(doc).find("#options-articulate-rate input").on("input change", function() { setArticulateRate(doc, $(this).val()); });
  $(doc).find("#options-articulate-pitch input").on("input change", function() { setArticulatePitch(doc, $(this).val()); });
  $(doc).find("#options-articulate-volume input").on("input change", function() { setArticulateVolume(doc, $(this).val()); });

  // Save
  $(doc).find(".options-panel-content button[name='save-options-articulate']").click(function(e){
    cr_articulate_voice = $(doc).find("#options-articulate-voice select").find(":selected").val();
    cr_articulate_rate = $(doc).find("#options-articulate-rate input").val().trim();
    cr_articulate_pitch = $(doc).find("#options-articulate-pitch input").val().trim();
    cr_articulate_volume = $(doc).find("#options-articulate-volume input").val().trim();

    saveStorageValue("cr_articulate_voice", cr_articulate_voice);
    saveStorageValue("cr_articulate_rate", cr_articulate_rate);
    saveStorageValue("cr_articulate_pitch", cr_articulate_pitch);
    saveStorageValue("cr_articulate_volume", cr_articulate_volume);

    $("<span class='text-info'>Saved!</span>").insertBefore( $(e.target) ).fadeOut(1500, function() { $(this).remove() });
    $(doc).find(".options-panel-content #articulate-stop").trigger("click");
  });
}
function optionsArticulateProcess(doc){
  var voices = $().articulate('getVoices');
  var select = $(doc).find("#options-articulate-voice select");
  for (i = 0; i < voices.length; i++) {
    voiceName = voices[i].name;
    voiceLang = voices[i].language;

    $(select).append("<option value='"+voiceName+"' data-articulate-language='"+voiceLang+"'>"+voiceName+" ("+voiceLang+")</option>");
  }

  var btn_play = $(doc).find("#options-articulate-panel .options-panel-content button[name='play']");
  var btn_pause = $(doc).find("#options-articulate-panel .options-panel-content button[name='pause']");

  $(doc).find("#articulate-speak, #articulate-pause").click(function(){
    articulateTextChanged(doc);

    // Get the parameter values from the input sliders
    var vn = $(doc).find("#options-articulate-voice select option:selected").val();
    var vl = $(doc).find("#options-articulate-voice select option:selected").attr("data-articulate-language");
    var r = parseFloat($(doc).find('#options-articulate-rate input').val());
    var p = parseFloat($(doc).find('#options-articulate-pitch input').val());
    var v = parseFloat($(doc).find('#options-articulate-volume input').val());

    var speaking = $().articulate('isSpeaking');
    var paused = $().articulate('isPaused');

    if (speaking) {
      if (paused) {
        $().articulate('resume');

        $(btn_play).hide();
        $(btn_pause).show();
      } else {
        $().articulate('pause');

        $(btn_play).show();
        $(btn_pause).hide();
      }
    } else {
      var synth = window.speechSynthesis;

      articulateTextChanged(doc);

      utterance = new SpeechSynthesisUtterance();
      utterance.lang = vl;
      utterance.rate = r;
      utterance.pitch = p;
      utterance.volume = v;

      var wrappedText = [];
      var elems = $(doc).find("#cr-content-container").find("p, h1, h2, h3, h4, h5, h6");
      $(elems).each(function(){
        var element_name = $(this).prop("tagName");
        var rawText = $(this).html();
        var rawText = rawText.replace(/<[^>]*>/g, "");
        text = rawText.split(" ");

        for (i = 0; i < text.length; i++) {
          var word = text[i].trim();

          if (i == text.length - 1) {
            if (element_name == "H1" || element_name == "H2" || element_name == "H3" || element_name == "H4" || element_name == "H5" || element_name == "H6") {
              if (word.includes(".") == false ) {
                word = word+".";
              }
            }
          }

          wrappedText.push(word);
        }
      });
      wrappedText = wrappedText.join(" ");
      utterance.text = wrappedText;

      utterance.onboundary = function(event) {
        clearHighlight(doc);
        var current = $(doc).find("span[data-count='" + event.charIndex + "']")[0];

        if (current) {
          $(current).addClass("active");
        }
      }

      synth.speak(utterance);

      $(btn_play).hide();
      $(btn_pause).show();
    };
  });

  $(doc).find("#articulate-stop").click(function(){
    $().articulate('stop');
    articulateReset(doc);

    $(btn_play).show();
    $(btn_pause).hide();
  });
}
function optionsOspActions(doc){
  $(doc).find("#osp-actions-save").click(function(){
    $(doc).find("a#options-save-page").click();
  });
}

// Open Saved Articles link
function savedArticlesOpenLink(doc){
  $(doc).find(".open-saved-articles").click(function(e){
    e.preventDefault();
    window.open(chrome.extension.getURL("options.html"));
  });
}

// Handle Removing Article action
function removeSavedArticle(doc){
  // Remove article from local storage
  $(doc).find(".remove-saved-article").click(function(){
    var result = confirm("Are you sure you want to delete this article?");
    if (result) {
      $(doc).find('#cr-container #options-saved-panel-header .loading-status').html("<span class='loading-dots'>Deleting</span>...");
      $(doc).find('#cr-container #options-saved-panel').show();

      encoded_url_to_delete = $(this).attr("data-encoded-url");

      // Remove article from saved_pages
      chrome.storage.local.get(['cr_saved_pages'], function(new_result) {
        let default_saved_pages = new_result.cr_saved_pages;
        var pages = JSON.parse(default_saved_pages);
        Object.keys(pages).forEach(function(key){
          if (pages[key]) {
            url = pages[key]['url'];
            encoded_url = pages[key]['encodedURL'];

            if(encoded_url == encoded_url_to_delete){
              pages.splice(key, 1);
              new_pages_as_string = JSON.stringify(pages);

              // Update saved_pages
              chrome.storage.local.set({cr_saved_pages: new_pages_as_string});

              // Hide saved info
              $(doc).find("#cr-saved-notice").fadeOut();
              $(doc).find('#cr-container #options-saved-panel-header .loading-status').html("<i class='fas fa-info-circle m-r-3'></i> Deleted.");
              $(doc).find('#cr-container .saved-version-notice').fadeOut();

              return false; // Stop the loop
            }
          }
        });

        // Remove url from local storage
        chrome.storage.local.remove(encoded_url_to_delete);
      });

      // Hide options-saved-panel
      setTimeout(function(){
        $(doc).find("#cr-container #options-saved-panel").hide();
      }, 7000);
    }
  });
}

// Upsell Tooltip
function upsellTooltip(doc){
  var cr_opened_counter = 0;
  chrome.storage.sync.get(['cr_not_interested_in_pro_tooltip'],function(result){
    setTimeout(function(){
      if (result.cr_not_interested_in_pro_tooltip){
        // Check number of times Reader Mode has been opened
        chrome.storage.sync.get(['cr_opened_counter'],function(res) {
          if (res.cr_opened_counter || res.cr_opened_counter >= 0){
            cr_opened_counter = res.cr_opened_counter + 1;
            chrome.storage.sync.set({cr_opened_counter: cr_opened_counter});
          } else {
            cr_opened_counter = 1;
            chrome.storage.sync.set({cr_opened_counter: cr_opened_counter });
          }

          if ( (cr_opened_counter === 5 || cr_opened_counter % 15 === 0) && cr_opened_counter < 251 ) {
            $(doc).find("#cr-pro-features-tooltip").fadeIn();
            chrome.storage.sync.remove(['cr_not_interested_in_pro_tooltip']);
          } else {
            $(doc).find("#cr-pro-features-tooltip").hide();
          }
        });

      } else {
        $(doc).find("#cr-pro-features-tooltip").fadeIn();
      }
    }, 3000);
  });

  $(doc).find("#cr-pro-features-tooltip .not-interested").click(function(){
    $(doc).find("#cr-pro-features-tooltip").fadeOut();
    chrome.storage.sync.set({cr_not_interested_in_pro_tooltip: "true"});
  });
}

function init(){
  // Initialize iframe & doc
  var iframe = document.getElementById('cr-iframe');
  var doc = iframe.contentWindow.document;

  // Get parsed article
  var article = getParsedArticle();
  var title = article.title;
  var content = article.content;

  var article_url = window.location.href;
  if ( (article.byline == "") || (article.byline == "About 0 Minutes") ) {
    var author = "Unknown author";
  } else {
    var author = article.byline;
  }
  var reading_time = readingTime(title+" "+content) + " min read";

  // Remove Media Playback from content
  content = content.replace("Media playback is unsupported on your device", "");

  // Fetch template for reader mode
  fetch(chrome.extension.getURL('/app.html'))
  .then(response => response.text())
  .then(data => {

    // Add template to doc. Prevent injected links from refresh the iframe to original content
    doc.open();
    doc.write(data);
    doc.close();

    // Add preloader the second time after template was fetched
    startPreloader(doc);

    // Get the saved HTML of the current page from storage
    encodedURL = getEncodedCurrentURL();
    chrome.storage.local.get(encodedURL, function(result) {
      // Set content outline
      setOutline(doc, article);

      // Add main content
      let default_val = result[encodedURL]
      if (default_val) {
        var decompressed_html = decompressHTML(default_val);
        $(doc).find("#cr-content-wrapper").html(decompressed_html);
        removeInlineElemStyles(doc);

        $(doc).find("#cr-saved-notice").show();
      } else {
        $(doc).find("#cr-title").html(title);

        $(doc).find("#cr-content").html(content);

        setHeadingsForOutline(doc);

        $(doc).find("#cr-content a").attr("target", "_blank");
      }

      // Add meta, title, and reading-time
      if (article_url) {
        $(doc).find("#cr-meta").append("<li id='cr-meta-url'><i class='fas fa-link'></i><span class='truncated'><a href='"+article_url+"' target='_blank'>"+article_url+"</a></span><li>");
      }
      if (author) {
        $(doc).find("#cr-meta").append("<li id='cr-meta-author'><i class='fas fa-pen-fancy'></i><span class='truncated'>"+author+"</span><li>");
      }
      if (reading_time) {
        $(doc).find("#cr-meta").append("<li id='cr-meta-reading-time'><i class='far fa-clock'></i><span>"+reading_time+"</span><li>");
      }

      notesToggle(doc);
      notesUpdateList(doc);
    });

    // Trim content
    trimContent(doc);

    // Add style tag
    addStyleTags(doc);

    // Toggle display sidebar
    //outlineDisplayToggle(doc);

    // Toolbar
    toolbarDisplayToggle(doc);
    toolbarNoteFormToggle(doc);
    toolbarActionsHandler(doc);

    // Options
    optionsDefaultSettings(doc);
    optionsMenu(iframe);
    optionsPanelCloseHandler(doc);
    optionsManualScroll(doc);
    optionsAccordian(doc);
    optionsColorPicker(doc);

    // Main Options Panel;
    optionsStyle(doc);
    optionsTheme(doc);
    optionsReaderComponents(doc);
    optionsRuler(doc);
    optionsAutoRunRules(doc);
    optionsDefaultCss(doc);
    optionsTranslate(doc);

    // SavedPanel
    optionsOspActions(doc);

    // Articulate Panel
    optionsArticulate(doc);
    optionsArticulateProcess(doc);

    // Open Saved Articles link
    savedArticlesOpenLink(doc);

    // Handle Removing Article action
    removeSavedArticle(doc);

    // Make sure no injected margin around the body
    $(doc).find("body").css("margin", 0);

    // Display iframe
    $(iframe).show();
    setTimeout(function(){
      $(doc).find("#cr-pre-loader").fadeOut();
      $(doc).find("#cr-body").show();

      // Scroll the page if options set to true
      optionsAutoScroll(doc);
    }, 500);

    // Upsell Tooltip
    //upsellTooltip(doc);
  }).catch(err => {
    //alert("Ops..something wrong, please try again.")
  });
}

var latest_url;
function launch() {
  // If license modal exist, remove it first
  if( $("#cr-license-iframe").length ) {
    $("#cr-license-iframe").remove();
  }

  // Detect past iframe - don't show another
  if(document.getElementById("cr-iframe") == null) {
    // Create iframe and append to body
    var iframe = createIframe();
    document.body.appendChild(iframe);

    latest_url = window.location.href;
    init();
  } else {
    iframe = document.getElementById("cr-iframe");
    if($(iframe).is(':visible')){
      $(iframe).fadeOut();
    } else {
      // Only parse the article if the url was changed
      if (latest_url == window.location) {
        $(iframe).fadeIn();
      } else {
        latest_url = window.location.href;
        init();
      }
    }
  }

}
launch();
