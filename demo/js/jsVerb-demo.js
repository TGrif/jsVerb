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
      // title: 'Load user preset'
    }),
    
    $('<div>', {
      id: 'preset_label',
      text: 'usr'
    }),
    
    
    /* reverse */
   
    // $('<img>', {
    //   id: 'reverse_btn',
    //   src: 'img/preset_button.png',
    //   // title: 'Reverse computed reverb'
    // }),
    // 
    // $('<div>', {
    //   id: 'reverse_label',
    //   text: 'rev'
    // }),
    
    
    /* infos */
   
    $('<img>', {
      id: 'status_btn',
      src: 'img/preset_button.png',
      title: 'Status'
    }),
    
    $('<div>', {
      id: 'status_label',
      text: 'nfo'
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

        reverb.powerOnOff();

        if (reverb.isPowered()) {
          
          $('#screen_set').empty()
            .append(reverb.getCurrentSet());
            
          $('#screen_bank').empty()
            .append(reverb.getCurrentBank());
              
          // TODO remplacer par une ou plusieurs class
          $('#screen_bank, #screen_set, #dry_gain, #wet_gain').show(); // #screen_title, 
          if (reverb.bypass) $('#screen_bypass').show();
          $('#power_led').css('backgroundColor', 'blue');
          $('#screen').css('backgroundColor', '#00FFFF'); //cyan
          
        } else {
          
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
        
        if (reverb.isPowered()) {
          if (reverb.isBypassed()) {
            $('#screen_bypass').show();
          } else {
            reverb.setWetGain($('#wet')
              .knob('value'));
            $('#screen_bypass').hide();
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
    
    reverb.loadSet();
    
    $('#screen_set').empty()
      .append(reverb.getCurrentSet());
    
    $('#screen_bank').empty()
      .append(reverb.getCurrentBank());
    
  });
  
  
  $('#bank-arrow-right').click(function() {
    reverb.nextBank()
    $('#screen_bank')
      .empty()
      .append(reverb.getCurrentBank());
  });
  
  
  $('#bank-arrow-left').click(function() {
    reverb.previousBank()
    $('#screen_bank')
      .empty()
      .append(reverb.getCurrentBank());
  });


  $('#preset_btn').click(function() {
    reverb.preset();
  })
  
  $('#reverse_btn').click(function() {
    reverb.reverse();
  })
  
  $('#status_btn').click(function() {
    reverb.status();
  })
  
});

