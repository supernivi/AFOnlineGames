(function ($, window, document, undefined) {

  'use strict';

  $.quiz = function (el, options) {
    var base = this;
    $("#myForm").hide();
    $('#fter').hide();
    // Access to jQuery version of element
    base.$el = $(el);

    // Add a reverse reference to the DOM object
    base.$el.data('quiz', base);

    base.options = $.extend($.quiz.defaultOptions, options);

    var questions = base.options.questions,
      numQuestions = questions.length,
      startScreen = base.options.startScreen,
      startButton = base.options.startButton,
      homeButton = base.options.homeButton,
      resultsScreen = base.options.resultsScreen,
      gameOverScreen = base.options.gameOverScreen,
      nextButtonText = base.options.nextButtonText,
      finishButtonText = base.options.finishButtonText,
      restartButtonText = base.options.restartButtonText,
      currentQuestion = 1,
      score = 0,
      answerLocked = false;

    base.methods = {
      init: function () {
        base.methods.setup();

        $(document).on('click', startButton, function (e) {
          e.preventDefault();
          base.methods.start();
        });

        $(document).on('click', homeButton, function (e) {
          e.preventDefault();
          base.methods.home();
        });

        $(document).on('click', '.answers a', function (e) {
          e.preventDefault();
          base.methods.answerQuestion(this);
        });

        $(document).on('click', '#quiz-next-btn', function (e) {
          e.preventDefault();
          base.methods.nextQuestion();
        });

        $(document).on('click', '#quiz-finish-btn', function (e) {
          e.preventDefault();
          base.methods.finish();
        });

        $(document).on('click', '#quiz-restart-btn, #quiz-retry-btn', function (e) {
          //e.preventDefault();
          $('#fter').hide();
          base.methods.restart();
        });
      },                                                                                                                                                                
      setup: function () {
        var quizHtml = '';

        if (base.options.counter) {
          quizHtml += '<div id="quiz-counter" style="margin-left: 36px"></div>';
        }

        let img = 0;
        quizHtml += '<div id="questions">';
        $.each(questions, function (i, question) {
          quizHtml += '<div class="question-container">';
          //quizHtml += '<p class="question" style="margin-top:18px; font-size: 14px;">' + question.q + '</p>';
          quizHtml += `<img class="img-responsive" style="margin-bottom: 20px !important; margin-top: 36px !important;" src="../img/q${++img}.png">`;
          quizHtml += '<p class="question" style="font-size: 11px !important; text-align: center; margin-left:"8px;" padding-bottom: 8px";>Hint :<br/>' + question.qHint + '</p>';
          quizHtml += '<ul class="answers">';
          $.each(question.options, function (index, answer) {
            quizHtml += '<li><a href="#" data-index="' + index + '">' + answer + '</a></li>';
          });
          quizHtml += '</ul>';
          quizHtml += '</div>';
        });
        quizHtml += '</div>';

        // if results screen not in DOM, add it
        if ($(resultsScreen).length === 0) {
          quizHtml += '<div id="' + resultsScreen.substr(1) + '">';
          quizHtml += '<p id="quiz-results"></p>';
          quizHtml += '</div>';
        }

        quizHtml += '<div id="quiz-controls">';
        quizHtml += '<p id="quiz-response"></p>';
        quizHtml += '<div id="quiz-buttons">';
        quizHtml += '<a href="#" id="quiz-next-btn">' + nextButtonText + '</a>';
        quizHtml += '<a href="#" id="quiz-finish-btn">' + finishButtonText + '</a>';
        quizHtml += '<a href="#" id="quiz-restart-btn">' + restartButtonText + '</a>';
        quizHtml += '</div>';
        quizHtml += '</div>';

        base.$el.append(quizHtml).addClass('quiz-container quiz-start-state');

        $('#quiz-counter').hide();
        $('.question-container').hide();
        $(gameOverScreen).hide();
        $(resultsScreen).hide();
        $('#quiz-controls').hide();
      },
      start: function () {
        base.$el.removeClass('quiz-start-state').addClass('quiz-questions-state');
        $(startScreen).hide();
        $('#quiz-controls').hide();
        $('#quiz-finish-btn').hide();
        $('#quiz-restart-btn').hide();
        $('#questions').show();
        $('#quiz-counter').show();
        $('.question-container:first-child').show().addClass('active-question');
        base.methods.updateCounter();
      },
      answerQuestion: function (answerEl) {
        if (answerLocked) {
          return;
        }
        answerLocked = true;

        var $answerEl = $(answerEl),
          response = '',
          selected = $answerEl.data('index'),
          currentQuestionIndex = currentQuestion - 1,
          correct = questions[currentQuestionIndex].correctIndex;

        if (selected === correct) {
          $answerEl.addClass('correct');
          response = questions[currentQuestionIndex].correctResponse;
          score++;
        } else {
          $answerEl.addClass('incorrect');
          response = questions[currentQuestionIndex].incorrectResponse;
          if (!base.options.allowIncorrect) {
            base.methods.gameOver(response);
            return;
          }
        }

        $('#quiz-response').html(response);
        $('#quiz-controls').fadeIn();

        if (typeof base.options.answerCallback === 'function') {
          base.options.answerCallback(currentQuestion, selected, questions[currentQuestionIndex]);
        }
      },
      nextQuestion: function () {
        answerLocked = false;

        $('.active-question')
          .hide()
          .removeClass('active-question')
          .next('.question-container')
          .show()
          .addClass('active-question');

        $('#quiz-controls').hide();

        // check to see if we are at the last question
        if (++currentQuestion === numQuestions) {
          $('#quiz-next-btn').hide();
          $('#quiz-finish-btn').show();
        }

        base.methods.updateCounter();

        if (typeof base.options.nextCallback === 'function') {
          base.options.nextCallback();
        }
      },
      gameOver: function (response) {
        // if gameover screen not in DOM, add it
        if ($(gameOverScreen).length === 0) {
          var quizHtml = '';
          quizHtml += '<div id="' + gameOverScreen.substr(1) + '">';
          quizHtml += '<p id="quiz-gameover-response"></p>';
          quizHtml += '<p><a href="#" id="quiz-retry-btn">' + restartButtonText + '</a></p>';
          quizHtml += '</div>';
          base.$el.append(quizHtml);
        }
        $('#quiz-gameover-response').html(response);
        $('#quiz-counter').hide();
        $('#questions').hide();
        $('#quiz-finish-btn').hide();
        $(gameOverScreen).show();
      },
        
      finish: function () {
        base.$el.removeClass('quiz-questions-state').addClass('quiz-results-state');
        $('.active-question').hide().removeClass('active-question');
        $('#quiz-counter').hide();
        $('#quiz-response').hide();
        $('#quiz-finish-btn').hide();
        $('#quiz-next-btn').hide();
        $('#quiz-restart-btn').hide();
        $('.timer').remove();
        $(resultsScreen).show();
        //var resultsStr = base.options.resultsFormat.replace('%score', score).replace('%total', numQuestions);
        if(score==5)
          var resultsStr = base.options.resultsFormat1;
        else if(score==4)
          var resultsStr = base.options.resultsFormat2;
        else if(score==3)
          var resultsStr = base.options.resultsFormat3;
        else if(score==2)
          var resultsStr = base.options.resultsFormat4;
        else if(score==1)
          var resultsStr = base.options.resultsFormat5;
        else
          var resultsStr = base.options.resultsFormat6;
        //Show form
        $('#myForm').show();
        //document.getElementById("#score").value = "tinkumaster";
        $("#score").val(score);
        $('#user').submit(function(e) {
          e.preventDefault();  // prevent the form from 'submitting'
          //var url = e.target.action  // get the target
          //alert($("#score").val());
          var $form = $(this);
          $.post($form.attr("action"), $form.serialize()).then(function() {
              emailcollected = true;
          });
          $('#user').hide();
          //$('#quiz-restart-btn').show();
          $('#quiz').append('<div id="quiz-start-screen"><p><a href="#" id="button" onclick="reloadPage();" class="quiz-button">Restart</a></p></div>');
          $(document).ready(function () {
            $("#button").click(function () {
              location.reload(true);
            });
          });
          $('#quiz-results').html(resultsStr);
          $('#fter').show();
      });

        if (typeof base.options.finishCallback === 'function') {
          base.options.finishCallback();
        }
      },
      restart: function () {
        base.methods.reset();
        base.$el.addClass('quiz-questions-state');
        $('#questions').show();
        $('#quiz-counter').show();
        $('.question-container:first-child').show().addClass('active-question');
        base.methods.updateCounter();
      },
      reset: function () {
        answerLocked = false;
        currentQuestion = 1;
        score = 0;
        $('.answers a').removeClass('correct incorrect');
        base.$el.removeClass().addClass('quiz-container');
        $('#quiz-restart-btn').hide();
        $(gameOverScreen).hide();
        $(resultsScreen).hide();
        $('#quiz-controls').hide();
        $('#quiz-response').show();
        $('#quiz-next-btn').show();
        $('#quiz-counter').hide();
        $('.active-question').hide().removeClass('active-question');
      },
      home: function () {
        base.methods.reset();
        base.$el.addClass('quiz-start-state');
        $(startScreen).show();

        if (typeof base.options.homeCallback === 'function') {
          base.options.homeCallback();
        }
      },
      updateCounter: function () {
        var countStr = base.options.counterFormat.replace('%current', currentQuestion).replace('%total', numQuestions);
        $('#quiz-counter').html(countStr);
      }
    };

    base.methods.init();
  };

  $.quiz.defaultOptions = {
    allowIncorrect: true,
    counter: true,
    counterFormat: '%current/%total',
    startScreen: '#quiz-start-screen',
    startButton: '#quiz-start-btn',
    homeButton: '#quiz-home-btn',
    resultsScreen: '#quiz-results-screen',
    //resultsFormat: 'You got %score out of %total correct!',
    resultsFormat1: 'You\'re a Genius!<br\>&#9733;&#9733;&#9733;&#9733;&#9733;',
    resultsFormat2: 'Well Done, Missed by an Inch!<br\>&#9733;&#9733;&#9733;&#9733;',
    resultsFormat3: 'Great Effort, Better luck next time!<br\>&#9733;&#9733;&#9733;',
    resultsFormat4: 'Nice Try! Better luck next time!<br\>&#9733;&#9733;',
    resultsFormat5: 'Well better luck next time!<br\>&#9733;',
    resultsFormat6: 'Oops you got none correct! :(<br/>Better luck next time!',
    gameOverScreen: '#quiz-gameover-screen',
    nextButtonText: 'Next',
    finishButtonText: 'Finish',
    restartButtonText: 'Restart'
  };

  $('#quiz-start-btn').click(function(){
    $('.timer').startTimer();
});

  $.fn.quiz = function (options) {
    return this.each(function () {
      new $.quiz(this, options);
    });
  };
}(jQuery, window, document));