/**
 * jsVerb
 *   digital reverb
 *
* @author TGrif 2015 - License MIT
 * https://github.com/TGrif/jsVerb
 * @requires jquery, jquery-ui, jqskin
 */
 
"use strict";
 
$(function() {

  var screenDisplay = $('#screen');


  // $.getJSON('../jsVerb-config.json', function (config) {
  //   setList = Object.keys(config.reverbSet);
  //   $.each(config.reverbSet, function (set, bank) {
  //     reverbSet[set] = bank;
  //   });
  // });



  $('#screen_title').hide();


  $('#rack').append(

    $('<div>', {
      id: 'set_label',
      text: 'set'
    }),
    
    $('<img>', {
      id: 'set_btn',
      src: 'img/set_button.png'
    }),
    
    
    $('<div>', {
    	id: 'bank-label',
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
    

    $('<img>').knob({

      id: 'dry',
      image: 'img/knob_silver_big_mid.png',

      left: 760,
      top: 60,
      width: 60,
      height: 60,
      
      // value: dryGain.gain.value,
      value: getDryGain(),
      
      change: function() {
        console.log(getDryGain())
        // dryGain.gain.value = $(this).knob('value') / 100;
        var dryGain = $(this).knob('value') / 100;
        setDryGain(dryGain)
      }

    }),

    $('<div>', {
    	id: 'dry_knob_label',
    	text: 'dry'
    }),


    $('<img />').knob({

      id: 'wet',
      image: 'img/knob_silver_big_mid.png',

      left: 850,
      top: 60,
      width: 60,
      height: 60,
      
      // value: wetGain.gain.value,
      value: getWetGain(),
      
      change: function() {
        console.log(getWetGain())
        // console.log(wetGain.gain.value)
        // wetGain.gain.value = $(this).knob('value') / 100;
        var wetGain = $(this).knob('value') / 100;
        setWetGain(wetGain)
      }

    }),

    $('<div>', {
      id: 'wet_knob_label',
      text: 'wet'
    }),


    $('<img>').switch({
    	
    	id: 'bypass',
    	image: 'img/toggle_sw_small.png',
    	title: 'bypass',
    	
    	left: 1060,
    	top: 40,

    	width: 32,
    	height: 20,

      clickable: true,

      click: function() {	//TODO cut bypass marche mais pas l'inverse ?

        bypass = !bypass;
        //  console.log(bypass)
        if (bypass) {

          // wetGain.gain.value = 0;
          setWetGain(0);

          if (power) $('#screen_bypass').show();

        } else {
          var wetGain = $('#wet').knob('value') / 100;
          setWetGain(wetGain);
        	// wetGain.gain.value = $('#wet').knob('value') / 100;
        //  console.log(wetGain.gain.value)
          $('#screen_bypass').hide();
        }

        console.info('bypass');

      }

    }),

    $('<div>', {
      id: 'bypass_label',
      text: 'bypass'
    }),



    $('<img>').switch({

      id: 'power',
      image: 'img/toggle_sw_small.png',
      title: 'power',

      left: 1130,
      top: 30,

      width: 32,
      height: 20,

      clickable: true,

      click: function() {

        power = !power;

        if (power) {

          currentSet = 0;   // TODO function reinit()
          currentBank = 0;

          $('#screen_title, #power_led, #screen_bank, #screen_set').show();
          if (bypass === true) {
            $('#screen_bypass').show();
          }
          screenDisplay.css('backgroundColor', '#00FFFF'); //cyan
          
        } else {
          
          $('#screen_title, #power_led, #screen_bank, #screen_set, #screen_bypass').hide();
          screenDisplay.css('backgroundColor', '#009E9E');
          
        }

        console.info('power');

      }

    }),

    $('<div>', {
      id: 'power_label',
      text: 'power'
    })

    
//                    $('<img />', {
//                        id: 'jack_in',
//                        src: 'img/jack.png'
//                    }),
//
//                            
//                    $('<img />', {
//                        id: 'jack_out',
//                        src: 'img/jack.png'
//                    })

  );
 


  $('#bank-arrow-left, #bank-arrow-right').click(function() {

    var idArrow = $(this).prop('id'),
    currentSetListLenght = reverbSet[setList[currentSet]].length;

    if (power) {

      if (idArrow === 'bank-arrow-left') {

        currentBank = (currentBank === 0) ? currentSetListLenght : currentBank;

        $('#screen_bank').empty()
        .append(
          reverbSet[setList[currentSet]][--currentBank]
        );

      } else if (idArrow === 'bank-arrow-right') {

        currentBank = (currentBank === currentSetListLenght - 1) ? 0 : ++currentBank;

        $('#screen_bank').empty()
        .append(
          reverbSet[setList[currentSet]][currentBank]
        );

      }

      $('#screen_set').empty()
      .append(
        setList[currentSet]
      );


      loadReverb(reverbSet, setList, currentSet, currentBank);

    }

  });



  $('#set_btn').click(function() {

    if (power) {

      var setLength = Object.keys(reverbSet).length;

      currentBank = 0,
      currentSet = (currentSet === setLength - 1) ? 0 : ++currentSet;

      $('#screen_set').empty()
        .append(
          setList[currentSet]
        );

      $('#screen_bank').empty()
        .append(
          reverbSet[setList[currentSet]][currentBank]
        );

      loadReverb(reverbSet, setList, currentSet, currentBank);

    }

  });


})
