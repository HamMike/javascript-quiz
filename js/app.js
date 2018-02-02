/*
* Brett Spencer, Michael Hammer
*/
var questionsKey = [];
var shuffledQuestions = [];
var score = 0;
var lastQuestionIndex = 0;


// "on change" event handler for category selection menu
function categorySelect() {
	var category = $("#category").val();
	getData(category);
}

// Call the API to get data and groom to proper format
function getData(cat) {
	var url = "https://opentdb.com/api.php?amount=10&type=multiple&category=" + cat;
	$.get(url).done(function(data){
		questionsKey = data.results.map(function(item) {
			var rObj = {};
			rObj["question"] = item.question;
			rObj["correctAnswer"] = item.correct_answer;
			rObj["wrongAnswers"] = item.incorrect_answers;
			return rObj;
		});
		shuffleAnswers();
	});
}

// Randomize answer order to make quiz unpredictable
function shuffleAnswers() {
	shuffledQuestions = questionsKey.map(function(item) {
		var rObj = {};
		rObj["question"] = item.question;
		rObj["answers"] = item.wrongAnswers;
		rObj["answers"].push(item.correctAnswer);
		//randomize answer order
		var ranAnswers = []
		for(var i = 0; i < 4; i++) {
			var ranIndex = Math.round(Math.random() * (rObj["answers"].length - 1));
			ranAnswers[i] = rObj.answers.splice(ranIndex, 1)[0];
		}
		rObj["answers"] = Array.from(ranAnswers);
		return rObj;
	});
	displayQuestion();
	$("#homepage").hide();
	$("#quizPage").show();
}

// Make sure an end state hasn't been reached, then show the next question
function displayQuestion() {
	if (shuffledQuestions.length < 10) {
		checkAnswer();
	}
	if (shuffledQuestions.length > 0) {
		$("#questionNumber").text(11 - shuffledQuestions.length);
		$("#currentQuestion").html(shuffledQuestions[0].question);
		shuffledQuestions[0].answers.forEach(function(item, index) {
			$("#answer" + (index + 1) + "Radio").val(item);
			$("#answer" + (index + 1) + "Text").html(item);
		});

		if (shuffledQuestions.length === 1) {
			$("#next").text("Submit for score");
		}
		lastQuestionIndex =  10 - shuffledQuestions.length;
		shuffledQuestions.shift();
	} else {
		displayScore();
	}
}

// Check whether the user's answer is correct, and if so increment score++
function checkAnswer() {
	//get the question that was asked
	var lastQuestion = questionsKey[lastQuestionIndex]
	//get the user's answer and reset radio buttons
	var userAnswer = "";
	Array.prototype.forEach.call($("input[type='radio']"), function(item) {
		if(item.checked) {
			answeredQuestion = true;
			userAnswer = item.value;
			item.checked = false;
		}
	});
	//check whether the user's answer matches the correct answer
	var answeredCorrectly = (userAnswer === lastQuestion.correctAnswer) ? true : false;
	//if so, increment score++
	if(answeredCorrectly) { score++; }
}


// Make sure the user has answered the previous question, then call the next question
function next() {
	var answeredLastQuestion = false;
	Array.prototype.forEach.call($("input[type='radio']"), function(item) {
		if(item.checked) {
			answeredLastQuestion = true;
		}
	});
	if (answeredLastQuestion) {
		displayQuestion()
	}
}

// Show the score page
function displayScore() {
	$("#score").text(score);
	$("#quizPage").hide();
	$("#scorePage").show();
}

// Reset the game
function playAgain() {
	$("#category").off("change")
	$("option[value='0']").prop("selected", true);
	$("#category").on("change", categorySelect);
	score = 0;
	$("#next").text("Next");
	$("#scorePage").hide();
	$("#homepage").show();
}

// Set event handlers once the DOM is ready
$(document).ready(function() {
	$("#category").on("change", categorySelect);
	$("#next").on("click", next);
	$("#againButton").on("click", playAgain)
});
	