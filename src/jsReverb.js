/**
 * jsVerb
 *  jsPlay Digital Reverb
 * 
 * @author TGrif 2015 - MIT License
 * 
 * @requires jquery, jquery-ui, jqskin
 */
 
 
$(function() {
    
    
        var
        
            reverbSet = {},
            setList = [], 
            
    
                currentSet = 0,
                currentBank = 0,
            

                        
            power = true,            
            
            
            bankDisplay = $('#bank'),
            screenDisplay = document.getElementById('screen'),
                    
                    
            powerBtn = document.getElementById('power')
            
                  .addEventListener("click", function() {
    
                      power = (power === true) ? false : true;
                      console.log(power);
                      
                      if(power === true) {
                          console.log('true');
                          screenDisplay.style.backgroundColor == '#00FFFF'; //cyan
                          console.log(screenDisplay);
                      } else {
                          console.log('not true');
                          screenDisplay.style.backgroundColor == '#009E9E';
                      }
                      
                      
                        bankDisplay.className =
                              (bankDisplay.className === 'hidden') ? '' : 'hidden';

//                              if(power === true) {
//                                  screenDisplay.style.backgroundColor === 'cyan';
//                              } else {
//                                  screenDisplay.style.backgroundColor === '#009E9E';
//                              }
//                        screenDisplay.style.backgroundColor =
//                              (screenDisplay.style.backgroundColor == 'cyan') ? 'cyan' : '#009E9E';
                      
                     });
                       
                       
                       
    
    
    
    
                $.getJSON('jsVerb-config.json', function(config) {

                    setList = Object.keys(config.reverbSet);

                    $.each(config.reverbSet, function(set, bank) {
                        reverbSet[set] = bank;
                    });

                });
    
    
    
    
    
    
        dryGain.gain.value = 0.25;
        
        wetGain.gain.value = 0.75;
    
    
    
    
    
    
        $('#rack')
        
        
                .append(
                
                
                
                
                        $('<div />', {
                            id: 'bank-label',
                            text: 'bank'
                        }),
                        
                        
                        
                                $('<img />', {
                                    id: 'bank-arrow-left',
                                    src: 'img/arrow-left.png',
                                    class: 'arrow'
                                }),


                                $('<img />', {
                                    id: 'bank-arrow-right',
                                    src: 'img/arrow-right.png',
                                    class: 'arrow'
                                }),
                            
                        
                        
                        
                        $('<div />', {
                            id: 'set_label',
                            text: 'set'
                        }),


                                $('<img />', {
                                    id: 'set_btn',
                                    src: 'img/set_button.png'
                                }),





                    $('<img />').knob({

                        id: 'dry',
                        image: 'img/knob_silver_big_mid.png',

                        left: 760,
                        top: 60,        
                        width: 60,
                        height: 60,
                        
                        value: dryGain.gain.value,
                        
                        
                            change: (function() {
                                dryGain.gain.value = $(this).knob('value') / 100;
                            })

                    }),



                                $('<div />', {
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
                        
                        value: wetGain.gain.value,
                        
                        
                            change: (function() {
                                wetGain.gain.value = $(this).knob('value') / 100;
                            })

                    }),



                                $('<div />', {
                                    id: 'wet_knob_label',
                                    text: 'wet'
                                })
                            
                        
                        
                        
        );
 
        
        
        
        
                // on power on

            $('#screen_set').empty()
                    .append(
                        setList[currentSet]
                  );

            $('#screen_bank').empty()
                    .append(
//                        reverbSet[setList[currentSet]][currentBank]
                  );



        
        
            $('#bank-arrow-left').on('click', function() {
                
                currentBank = (currentBank === 0) ? reverbSet[setList[currentSet]].length : currentBank;
                
                    $('#screen_bank').empty()
                            .append(
                                reverbSet[setList[currentSet]][--currentBank]
                          );
                  
                  loadReverb(reverbSet, setList, currentSet, currentBank);
                  
            });



            $('#bank-arrow-right').on('click', function() {

                currentBank = (currentBank === reverbSet[setList[currentSet]].length - 1) ? 0 : ++currentBank;

                    $('#screen_bank').empty()
                            .append(
                                reverbSet[setList[currentSet]][currentBank]
                          );
                  
                  loadReverb(reverbSet, setList, currentSet, currentBank);
                  
            });
        
        
        
        
            $('#set_btn').on('click', function() {
                
                currentBank = 0;

                currentSet = (currentSet === Object.keys(reverbSet).length - 1) ? 0 : ++currentSet;
               
               
                    $('#screen_set').empty()
                            .append(
                                setList[currentSet]
                          );

                    $('#screen_bank').empty()
                            .append(
                                reverbSet[setList[currentSet]][currentBank]
                          );
            

                  loadReverb(reverbSet, setList, currentSet, currentBank);
                
            });
                   
       

        
});

