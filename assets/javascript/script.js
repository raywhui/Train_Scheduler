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

var num = 0;
var dude = 0;

//Submit btn on click event
$('.btn').on('click', function(event){
	console.log('hey now');
	//prevent event from reloading page
	//event.PreventDefault();

	//create var to be stored in Firebase
	var name = $('#name').val().trim();
	var dest = $('#destination').val().trim();
	var time = $('#first-train').val().trim();
	var freq = $('#freq').val().trim();

	//Conditional if nothing in input boxes
	if (name === '' || dest === '' || time === '' || freq === ''){
		alert('Nope');
	}


	else{
	//object to hold new var values
	function writeUserData(name,dest,time,freq){
		database.ref().push({
			trainname:name,
			destination:dest,
			arrivaltime:time,
			frequency:freq
		});
	};

	writeUserData(name,dest,time,freq);
	//store object into firebase
		//.push adds objects
		//.set replaces objects

	//emptys values
	$('#name').val('');
	$('#destination').val('');
	$('#first-train').val('');
	$('#freq').val('');

	};
});

//Adds entries from Firebase to DOM
database.ref().on('child_added', function(snapshot){
	//time conversion

  var freq = snapshot.val().frequency;

	var time = snapshot.val().arrivaltime;

//setInterval(function(){
	//Convert time. Pushed back one day to prevent negative difference
	var timeConverted = moment(time,'HH:mm').subtract(1, "day");
	var firstArrivalConverted = moment(timeConverted).format('hh:mm A');
	console.log(timeConverted);

	//Current time
	var currentTime = moment();
	//console.log('Current Time: ' + moment().format('HH:mm'));

	//Time difference in minutes from inital time to now
	var timeDif = moment().diff(timeConverted, 'minutes');
	//console.log('Time Dif: ' + timeDif);

	//Time frequency compared to time difference. Train arrival must occur when remainder is 0, so when freq - remainder gives time remaining.
	var timeRemaining = freq - (timeDif % freq);
	//console.log('Time remaining: ' + timeRemaining);

	//Til next train. Remainder + current time = next train arrival.
	var nextTrain = moment().add(timeRemaining, 'm');
	var nextTrainText = moment(nextTrain).format('hh:mm A');

	//pull from firebase + add to table
	var row = $('<tr class="del">');
	var delBoxTd = $('<td>');
	var delBoxLabel = $('<label><input type="checkbox" class="del-box"></label>');
	
	//Stores snapshots unique ID
	var parentName = snapshot.key;
	
	//var newKey = database.ref().push().key; //gets unique parent ID of Firebase
	console.log(parentName);

	//appends Label to <td>
	delBoxTd.append(delBoxLabel);

	//Gives row attr of Unique ID
	row.attr('data-uniqueID', parentName);
	row.append(delBoxTd);
	row.append(
		'<td class="name">' + snapshot.val().trainname + '</td>' + 
		'<td class="dest">' + snapshot.val().destination + '</td>' + 
		'<td class="first-arrival">' + firstArrivalConverted + '</td>' +
		'<td class="freq">' + snapshot.val().frequency + '</td>' + 
		'<td class="arrival">' + nextTrainText + '</td>' + 
		'<td class="time">' + timeRemaining +'</td>' +
		'<td>' + '<div class="edit"></div>' + '</td>'
	);

	//appends row to DOM
	$('.add-more-trains').append(row);
	console.log('yay');
	num++;

	
	// setInterval(function(){	
	// 	$('.arrival-'+ dude).text(nextTrainText);
	// 	$('.time-'+ dude).text(timeRemaining);
	// 	console.log('ok cool');
	// 	dude++;
	// 	if (dude === num){
	// 		dude = 0;
	// 	}
	// },3000);
});

//Delete Button
$('.add-more-trains').on('click', '.del-box', function(){
	//Grabs unique ID saved to attr. //.del-box>label>td>tr
	var thisParent = $(this).parent().parent().parent().attr('data-uniqueID');

	console.log(thisParent);

	//Removes row from Firebase
	database.ref(thisParent).remove();

	//Removes row from DOM
	$(this).parentsUntil('.add-more-trains').empty();
});

//Edit Button
$('.add-more-trains').on('click', '.edit', function(){
	console.log('sweg');
	//Goes up nodes right before .add-more-trains
	var thisParent = $(this).parentsUntil('.add-more-trains');

	//searches children with .name/.dest, takes text
	var initialName = thisParent.children('.name').text();
	var initialDest = thisParent.children('.dest').text();

	//Convert Back to Military Time
	var initialArrival = thisParent.children('.first-arrival').text();
	var timeConverted = moment(initialArrival,'hh:mm A').subtract(1, "day");
	var firstArrivalConverted = moment(timeConverted).format('HH:mm');

	var name = '.name';
	var dest = '.dest';
	var arrival = '.first-arrival';

	function editRow(x,y,z){
		thisParent.children(x).html('<input type="text" value="'+ y +'" class="'+ z +'">');
	// $('.name');
	// $('.dest').html('<input type="text">');
	// $('.freq').html('<input type="text">');
	};

	editRow(name, initialName,'changedName');
	editRow(dest, initialDest,'changedDest');
	editRow(arrival, firstArrivalConverted,'changedArrival');

	var div = $('<div class="complete">');
	var bar1 = '<div class="bar-one"></div>' + 
							'<div class="bar-two"></div>';

	div.append(bar1);
	$(this).replaceWith(div);


});

//Complete after edit button
$('.add-more-trains').on('click', '.complete', function(){
	that = this;
	var thisParent = $(this).parent().parent();
	var thisUniqueId = thisParent.attr('data-uniqueID');
	console.log(thisUniqueId);

	var newName = thisParent.find('.changedName').val();
	var newDest = thisParent.find('.changedDest').val();

	//Reconverts time back to hh:mm A
	var newArrival = thisParent.find('.changedArrival').val();
	var timeReconverted = moment(newArrival,'HH:mm').subtract(1, "day");
	var firstArrivalReconverted = moment(timeReconverted).format('hh:mm A');


		console.log(newName)
		console.log(newDest)
		console.log(firstArrivalReconverted)

	if (newName === '' || newDest === '' || newArrival === ''){
		alert('Invalid Entry');
	}

	else{
		//updates Firebase 
		function rewriteUserData(name,dest,time){
			database.ref(thisUniqueId).update({
				trainname:name,
				destination:dest,
				arrivaltime:time
			});
		};

		//Replaces input with value into proper place
		function emptyAndReplace(x,y){
			thisParent.find(x).empty();
			thisParent.find(x).append(y);
		};

		rewriteUserData(newName,newDest,newArrival);

		emptyAndReplace('.name',newName);
		emptyAndReplace('.dest',newDest);
		emptyAndReplace('.first-arrival',firstArrivalReconverted);


		//when child changed in Firebase, DO ALL THE TIME STUFF AGAIN
		database.ref().on('child_changed', function(snapshot){
	
		//DO THE TIME STUFF ALL OVER AGAIN
			var freq = snapshot.val().frequency;
			var time = snapshot.val().arrivaltime;

			//setInterval(function(){
			//Convert time. Pushed back one day to prevent negative difference
			var timeConverted = moment(time,'HH:mm').subtract(1, "day");
			var firstArrivalConverted = moment(timeConverted).format('hh:mm A');
			console.log(timeConverted);

			//Current time
			var currentTime = moment();
			//console.log('Current Time: ' + moment().format('HH:mm'));

			//Time difference in minutes from inital time to now
			var timeDif = moment().diff(timeConverted, 'minutes');
			//console.log('Time Dif: ' + timeDif);

			//Time frequency compared to time difference. Train arrival must occur when remainder is 0, so when freq - remainder gives time remaining.
			var timeRemaining = freq - (timeDif % freq);
			//console.log('Time remaining: ' + timeRemaining);

			//Til next train. Remainder + current time = next train arrival.
			var nextTrain = moment().add(timeRemaining, 'm');
			var nextTrainText = moment(nextTrain).format('hh:mm A');

			//Pulls original this from .complete button
			var thatParent = $(that).parent().parent();

			//replace Next Arrival and Minutes Away
			thatParent.find('.arrival').empty().append(nextTrainText);
			thatParent.find('.time').empty().append(timeRemaining);
		});	

		//Replace + bar with - bar				
		var bar = '<div class="edit"></div>'
		$(this).replaceWith(bar);

		// .prepend(
		// '<td class="name">' + newName + '</td>' + 
		// '<td class="dest">' + newDest + '</td>' + 
		// '<td class="first-arrival">' + newTime + '</td>')

	};
	// 	function writeUserData(name,dest,time){
	// 		database.ref().push({
	// 			trainname:name,
	// 			destination:dest,
	// 			arrivaltime:time,
	// 		});
	// 	};

	// 	writeUserData(newName,newDest,newTime);

});



//};



//  	database.ref('train-schedule-'+ dude).on('value', function(snapshot){
// 		//time conversion

// 	  var freq = snapshot.val().frequency;
// 		var time = snapshot.val().arrivaltime;

// 	//setInterval(function(){
// 		//Convert time. Pushed back one day to prevent negative difference
// 		var timeConverted = moment(time,'HH:mm').subtract(1, "day");
// 		//console.log(timeConverted);

// 		//Current time
// 		var currentTime = moment();
// 		//console.log('Current Time: ' + moment().format('HH:mm'));

// 		//Time difference in minutes from inital time to now
// 		var timeDif = moment().diff(timeConverted, 'minutes');
// 		//console.log('Time Dif: ' + timeDif);

// 		//Time frequency compared to time difference. Train arrival must occur when remainder is 0, so when freq - remainder gives time remaining.
// 		var timeRemaining = freq - (timeDif % freq);
// 		//console.log('Time remaining: ' + timeRemaining);

// 		//Til next train. Remainder + current time = next train arrival.
// 		var nextTrain = moment().add(timeRemaining, 'm');
// 		var nextTrainText = moment(nextTrain).format('hh:mm A');


// 	});
// },3000);





//IF ITS ALWAYS CHECKING FIREBASE, ADD UPDATED TIME TO FIREBASE INSTEAD