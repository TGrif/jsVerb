/**
 * jsVerb demo
 *
 * @author TGrif 2015 - License MIT
 * https://github.com/TGrif/jsVerb/demo
 */
 
$(function() {

  var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  var destination = audioCtx.destination;

  var reverb = new jsVerb(audioCtx);
  var player = new SimpleAudioPlayer(audioCtx);

  var powered = false;

  reverb.plug(player.output(), destination)




  $('#rack').append(


      /* set */

    $('<div>', {
      id: 'set_label',
      class: 'label',
      text: 'set'
    }),

    $('<img>', {
      id: 'set_btn',
      src: 'img/set_button.png'
    }),


      /* bank */

    $('<div>', {
    	id: 'bank-label',
      class: 'label',
    	text: 'bank'
    }),

    $('<img>', {
    	id: 'bank-arrow-left',
    	src: 'img/arrow-left.png',
    	class: 'arrow'
    }),

    $('<img>', {
    	id: 'bank-arrow-right',
    	src: 'img/arrow-right.png',
    	class: 'arrow'
    }),


     /* preset */

    $('<img>', {
      id: 'preset_btn',
      src: 'img/preset_button.png',
      title: 'Load/save user preset',
      class: 'btn'
    }),

    $('<div>', {
      id: 'preset_label',
      text: 'usr',
      class: 'btn_label'
    }),


    /* load */

    $('<img>', {
      id: 'load_btn',
      src: 'img/preset_button.png',
      title: 'Load impulse response',
      class: 'btn'
    }),

    $('<div>', {
      id: 'load_label',
      text: 'load',
      class: 'btn_label'
    }),


    /* infos */

    $('<img>', {
      id: 'status_btn',
      src: 'img/preset_button.png',
      title: 'Status',
      class: 'btn'
    }),

    $('<div>', {
      id: 'status_label',
      text: 'nfo',
      class: 'btn_label'
    }),


    /* panic */

    $('<img>', {
      id: 'panic_btn',
      src: 'img/preset_button.png',
      title: 'Panic. Stop all sound',
      class: 'btn'
    }),

    $('<div>', {
      id: 'panic_label',
      text: 'panic',
      class: 'btn_label'
    }),


      /* dry */

    $('<div>', {
      id: 'dry_label',
      class: 'label',
      text: 'dry'
    }),

    $('<img>').knob({

      id: 'dry',
      image: './lib/jqskin/img/knob_silver_big_mid.png',

      left: 850,
      top: 60,
      width: 60,
      height: 60,

      value: reverb.getDryGain(),

      change: function() {
        var dryGain = $(this).knob('value');
        reverb.setDryGain(dryGain)
        $('#dry_gain').text(reverb.getDryGain() + '%');
      }

    }),


      /* wet */

    $('<div>', {
      id: 'wet_label',
      class: 'label',
      text: 'wet'
    }),

    $('<img>').knob({

      id: 'wet',
      image: './lib/jqskin/img/knob_silver_big_mid.png',

      left: 760,
      top: 60,
      width: 60,
      height: 60,

      value: reverb.getWetGain(),

      change: function() {
        var wetGain = $(this).knob('value');
        reverb.setWetGain(wetGain)
        $('#wet_gain').text(reverb.getWetGain() + '%')
      }

    }),


    /* power */

    $('<div>', {
      id: 'power_label',
      class: 'label',
      text: 'power'
    }),

    $('<img>').switch({

      id: 'power',
      image: './lib/jqskin/img/toggle_sw_small.png',
      title: 'power',

      left: 1115,
      top: 30,
      width: 32,
      height: 20,

      clickable: true,

      click: function() {

        powered = !powered;

        if (powered) {

          if (reverb.isBypassed()) {
            $('#bypass_label').css('color', 'tomato');
          }

          $('#screen_set').empty().append(reverb.getCurrentSet());
          $('#screen_bank').empty().append(reverb.getCurrentBank());

          // TODO remplacer par une ou plusieurs class
          $('#screen_bank, #screen_set, #dry_gain, #wet_gain').show(); // #screen_title,
          $('#power_led').css('backgroundColor', 'blue');
          $('#screen').css('backgroundColor', '#00FFFF'); //cyan

        } else {

          $('#bypass_label').css('color', 'white');

          $('#screen_bank, #screen_set, #dry_gain, #wet_gain').hide();  // #screen_title,
          $('#power_led').css('backgroundColor', '#293133');
          $('#screen').css('backgroundColor', '#009E9E');

        }

      }

    }),


    /* bypass */

    $('<div>', {
      id: 'bypass_label',
      class: 'label',
      text: 'bypass'
    }),

    $('<img>').switch({

      id: 'bypass',
      image: './lib/jqskin/img/toggle_sw_small.png',
      title: 'bypass',

      left: 1050,
      top: 30,
      width: 32,
      height: 20,

      clickable: true,

      click: function() {

        reverb.bypassOnOff();

        if (powered) {
          if (reverb.isBypassed()) {
            $('#bypass_label').css('color', 'tomato');
          } else {
            reverb.setWetGain($('#wet').knob('value'));
            $('#bypass_label').css('color', 'white');
          }
        }

      }

    }),


    $('<div>', {
      id: 'dry_gain',
      text: reverb.getDryGain() + '%'
    }),

    $('<div>', {
      id: 'wet_gain',
      text: reverb.getWetGain() + '%'
    })

  );



  $('#set_btn').click(function() {
    if (!powered) return;
    reverb.loadSet();
    $('#screen_set').empty().append(reverb.getCurrentSet());
    $('#screen_bank').empty().append(reverb.getCurrentBank());
  });


  $('#bank-arrow-right').click(function() {
    if (!powered) return;
    reverb.nextBank();
    $('#screen_bank').empty().append(reverb.getCurrentBank());
  });


  $('#bank-arrow-left').click(function() {
    if (!powered) return;
    reverb.previousBank();
    $('#screen_bank').empty().append(reverb.getCurrentBank());
  });



  $('#preset_btn').click(function() {  // TODO
    if (!powered) return;

    if (!window.localStorage)
      return console.error('Sorry, preset not supported.');

    var state = 'LOAD';
    var clickDisabled = false;
    $('#screen_preset').text(state + ' USER PRESET?');
    setTimeout(function() {
      $('#preset_btn').click(function() {  // TODO remove event listener    https://stackoverflow.com/a/8335433/5156280
        if (clickDisabled) return
        console.log('jsVerb - Loading userPreset:', userPreset);
        var userPreset = window.localStorage.getItem('jsVerb');
        reverb.preset(userPreset);
        $('#screen_preset').text('LOADING PRESET!');
      })

      $('#screen_preset').text('');
      clickDisabled = true;
    }, 4000)

  })


  $('#load_btn').click(function() {
    $('#irInput').click();
  });

  $('#irInput').change(function(ev) {
    var file = ev.target.files[0];
    if (reverb.loadBank(file)) {
      $('#screen_set').empty().append('perso');
      $('#screen_bank').empty().append(file.name);
    } else {
      $('#screen_preset').text('Format non supporté');
      setTimeout(function() {
        $('#screen_preset').text('');
      }, 4000);
    }
  });


  $('#status_btn').click(function() {
    if (!powered) return;
    let rs = reverb.status();
    let msg = rs['set'] + ' sets - ' + rs['bank'] + ' banks';
    $('#screen_preset').text(msg);
    setTimeout(function() {
      $('#screen_preset').text('');
    }, 4000);
  });


  let panic = 0;
  $('#panic_btn').click(function() {
    if (!powered) return;
    reverb.panic();

    //easter egg
    panic++;
    if (panic >= 3) {
      $('#screen_preset').text('Please, stay calm.');
      setTimeout(function() {
        $('#screen_preset').text('');
      }, 3500);
      panic = 0;
    }
    setTimeout(function() {
      panic = 0;
    }, 1000);
  });

});
