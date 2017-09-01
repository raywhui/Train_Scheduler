// Initialize Firebase
var config = {
  apiKey: "AIzaSyDaDyEptLe2s3EfkLVuo8M0YAMDsL0De_8",
  authDomain: "train-schedule-73716.firebaseapp.com",
  databaseURL: "https://train-schedule-73716.firebaseio.com",
  projectId: "train-schedule-73716",
  storageBucket: "train-schedule-73716.appspot.com",
  messagingSenderId: "229786327628"
};
firebase.initializeApp(config);

//create database var to access firebase
var database = firebase.database();

//btn on click event
$('.btn').on('click',function(event){
	//prevent event from reloading page
	//event.PreventDefault();

	//create var to be stored in Firebase
	var name = $('#name').val().trim();
	var dest = $('#destination').val().trim();
	var time = $('#first-train').val().trim();
	var freq = $('#freq').val().trim();

	//object to hold new var values
	var train = {
		name:name,
		dest:dest,
		time:time,
		freq:freq
	};

	//store object into firebase
		//.push adds objects
		//.set replaces objects
	database.ref().push(train);

	//emptys values
	$('#name').val('');
	$('#destination').val('');
	$('#first-train').val('');
	$('#freq').val('');

});

database.ref().on('child_added', function(snapshot){
	console.log(snapshot.val());
	console.log(snapshot.val().name);
	console.log(snapshot.val().dest);
	console.log(snapshot.val().time);
	console.log(snapshot.val().freq);


	//time conversion
  var freq = snapshot.val().freq;

	var time = snapshot.val().time;

	//Convert time. Pushed back one day to prevent negative difference
	var timeConverted = moment(time,'HH:mm').subtract(1, "day");
	console.log(timeConverted);

	//Current time
	var currentTime = moment();
	console.log('Current Time: ' + moment().format('HH:mm'));

	//Time difference in minutes from inital time to now
	var timeDif = moment().diff(timeConverted, 'minutes');
	console.log('Time Dif: ' + timeDif);

	//Time frequency compared to time difference. Train arrival must occur when remainder is 0, so when freq - remainder gives time remaining.
	var timeRemaining = freq - (timeDif % freq);
	console.log('Time remaining: ' + timeRemaining);

	//Til next train. Remainder + current time = next train arrival.
	var nextTrain = moment().add(timeRemaining, 'm');
	var nextTrainText = moment(nextTrain).format('hh:mm A');


	//pull from firebase + add to table
	$('.add-more-trains').append(
		'<tr>' + 
			'<td>' + snapshot.val().name + '</td>' + 
			'<td>' + snapshot.val().dest + '</td>' + 
			'<td>' + snapshot.val().freq + '</td>' + 
			'<td>' + nextTrainText + '</td>' + 
			'<td>' + timeRemaining +'</td>' + 
		'</tr>')

});