var ctx;
var canvas;
var width, height;
var compass; // 0 to 359
var forward;
var touching = false;

var tookStep=0;
var stepReady=1;

var sameDirection = 0;
var score = 0;

var badStep=0;
var badStepDelay = 0;

var meDrone;
var bassDrone;
var meDrone2;
var compDrone;
var compDrone2;
var basePitch = 200;

var context;
var path = Math.floor(Math.random()*180);
var tempPath = 90;
var bigsize = 0;

$(document).ready(function(){
    setup();
});

var setup = function(){
  $("canvas").attr('width', window.innerWidth);
  $("canvas").attr('height', window.innerHeight);

  window.onresize = function(){
    $("canvas").attr('width', window.innerWidth);
    $("canvas").attr('height', window.innerHeight);


  }

  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");


  checkFeatureSupport();

  if(typeof(context)!=="undefined"){
    webAudioExists = true;

  }

  if(webAudioExists){
    //make synth

    meDrone = new Drone(basePitch, 0.7);
    bassDrone = new Drone(basePitch/4, 0.7);
    meDrone2 = new Drone(2*basePitch, 0.4);
    compDrone = new Drone(1.5 * basePitch, 0.3);
    compDrone2 = new Drone(1 * basePitch, 0.7);
  }

  if (window.DeviceMotionEvent) {
    window.addEventListener('devicemotion', deviceMotionHandler, false);
  }

  if (window.DeviceOrientationEvent) {
    window.addEventListener('deviceorientation', devOrientHandler, false);
  }


  document.addEventListener('touchstart', function(e) {
      e.preventDefault();
      touching = 1;
      meDrone.play();
      compDrone.play();


  }, false);


  document.addEventListener('touchend', function(e) {
      e.preventDefault();
      touching = 0;
  }, false);


  draw();
}


var update = function(){

 //background
  if(touching){

  }else{

  }

  ctx.fillStyle = "rgb("+score*10+","+score*10+","+score*10+")";
  ctx.fillRect(0,0,canvas.width,canvas.height);


   $("#instructions").text("PRESS");
   $("#sub").show();

   if(touching){
     $("#instructions").text("MATCH DIRECTION");
     $("#title").text("");
     $("#sound").text("");
     $("#sub").hide();
   }
  //angles match

  angleVal = Math.abs((tempPath + compass)%360 - 90)
  compDrone.setPitch(compDrone.pitch + (Math.abs(angleVal))/6);
  compDrone2.setPitch(compDrone2.pitch + (Math.abs(angleVal))/6);

  if(touching && angleVal < 3){
  //  ctx.fillStyle = "#FFFFFF";
  //  ctx.fillRect(0,0,canvas.width,canvas.height);
   $("#instructions").text("STEP FORWARD");
    drawTriangle(90,"#FFFFFF", 1);

    sameDirection = 1;
  }else{
    sameDirection = 0;
  }

  //success step
  if(tookStep){
    tookStep = 0;
    stepReady = 0;
    score+=1;

    var c;
    if(Math.floor(Math.random()*2)){
      c = -1;
    } else {
      c =1;
    }

    tempPath = path;
    path= (path + c * (20 + Math.random()*80))%360

    $("#score").text(score);

    var n = new Pluck(basePitch*4);
    var n2 = new Pluck(basePitch*4*1.5);
    n.play();
    n2.play();

    //delay until another step is registered
    setTimeout(function(){

      stepReady = 1;
    },500);
  }

  //bad step
  if(badStep){
    badStep= 0;
    badStepDelay = 1;
    stepReady = 0;

    var n = new Pluck(basePitch*3+20);
    var n2 = new Pluck(basePitch*3+45);
    n.play();
    n2.play();



    $("#score").text(score);


    //delay until another step is registered
    setTimeout(function(){
      stepReady = 1;
      badStepDelay= 0;
    },500);
  }


  if(stepReady == 0 && badStepDelay == 0){
   $("#instructions").text("+");
   bigsize=1;
  }

  bigTriangle(bigsize);
  bigsize*=1.1;

  if(stepReady == 0 && badStepDelay == 1){
   $("#instructions").text("CAREFUL");
    ctx.fillStyle = "#FF0000";
    ctx.fillRect(0,0,canvas.width,canvas.height);
  }

  if(touching){

    if(path > tempPath){
    tempPath += 1;
    }
    if (path< tempPath){
    tempPath -= 1;
    }

    drawTriangle((tempPath + compass)%360,"rgb(255,"+score*10+","+score*10+")", 0);

    meDrone.play();
    meDrone2.play();
    compDrone.play();
    compDrone2.play();
    bassDrone.play();

  } else{
    meDrone.stop();
    meDrone2.stop();
    compDrone.stop();
    compDrone2.stop();
    bassDrone.stop();

  }
  drawTriangle(90,"#FFFFFF", 0);

}


function bigTriangle(scale){
  var rad = 90* (Math.PI/180);
  ctx.save()
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.beginPath();
  var len = 50;
  ctx.rotate(Math.PI/2);
  ctx.rotate(rad);
  ctx.moveTo(0,scale*200);
  ctx.lineTo(scale*-80,scale*-80);
  ctx.lineTo(scale*80,scale*-80);
  ctx.closePath();
  ctx.lineWidth = 30;
  ctx.strokeStyle = "#FFFFFF";
  ctx.stroke();


  ctx.restore();

}

function drawTriangle(angle, color, fill){

  var rad = angle* (Math.PI/180);
  ctx.save()
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.beginPath();
  var len = 50;
  ctx.rotate(Math.PI/2);
  ctx.rotate(rad);
  ctx.moveTo(0,200);
  ctx.lineTo(-80,-80);
  ctx.lineTo(80,-80);
  ctx.closePath();
  ctx.lineWidth = 30;
  ctx.strokeStyle = color;
  ctx.stroke();

  if(fill == 1){
  ctx.fillStyle= color;
  ctx.fill();

  }
  ctx.restore();
}

function drawLine(angle, offset, color, xoff){

  var rad = angle* (Math.PI/180);
  var offsetDegree = (angle+ 90) * (Math.PI/180);
  ctx.beginPath();

  centerx = xoff + canvas.width/2 + offset*Math.cos(offsetDegree);
  centery = xoff + canvas.height/2 + offset*Math.sin(offsetDegree);
  ctx.moveTo(centerx,centery);

  var len = 200;
  ctx.lineTo(centerx - len*Math.cos(rad),centery - len* Math.sin(rad));
  ctx.lineTo(centerx + len*Math.cos(rad),centery + len* Math.sin(rad));
  ctx.lineWidth = 8;
  ctx.strokeStyle = color;
  ctx.stroke();
}

function devOrientHandler(eventData) {
  if(webAudioExists){
    //
  }
  compass = eventData.alpha;
}


function deviceMotionHandler(eventData) {
  if(webAudioExists){
  }

  var a = eventData.acceleration;
  forward = a.y;
  forward = Math.abs(forward);
  if(touching && forward > 1 && stepReady  && sameDirection){
    tookStep = 1;
  }

  if(touching && forward > 1.5 && stepReady && sameDirection == 0){
    badStep = 1;
  }
}


function draw() {
  window.requestAnimationFrame(draw);
  update();
}


var checkFeatureSupport = function(){
  try{
    window.AudioContext = window.AudioContext||window.webkitAudioContext;
    context = new AudioContext();
  }
  catch (err){
    alert('web audio not supported');
  }

  try{
    motionContext = window.DeviceMotionEvent;
  }
  catch (err){
    console.log('motion not supported');
  }
  if (! (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) ) {
    // some code..
    isDesktop = true;
    console.log('desktop');
    alert('open this up on your phone \n \n <3 whichlight')
  }
}


function Drone(freq,vol){
  this.filter;
  this.gain;
  this.osc;
  this.played = false;
  this.volume = vol;
  this.pitch = freq;
  this.buildSynth();
}

Drone.prototype.buildSynth = function(){
  this.osc = context.createOscillator(); // Create sound source
  this.osc.type = 1;
  this.osc.frequency.value = this.pitch;

  this.filter = context.createBiquadFilter();
  this.filter.type = 0;
  this.filter.frequency.value = 4000;

  this.gain = context.createGain();
  this.gain.gain.value = this.volume;
  //decay
  this.osc.connect(this.filter); // Connect sound to output
  this.filter.connect(this.gain);
  this.gain.connect(context.destination);
}

Drone.prototype.setPitch = function(p){
  this.osc.frequency.value = p;
}

Drone.prototype.setFilter = function(f){
  this.filter.frequency.value = f;
}

Drone.prototype.setVolume= function(v){
  this.gain.gain.value = v;
}

Drone.prototype.play = function(){
  this.setVolume(this.volume);
  if(!this.played){
    this.osc.start(0); // Play instantly
  }
  this.played = true;
  return false;
}

Drone.prototype.stop = function(){
    this.setVolume(0);
//    this.osc.disconnect();
    return false;
}

function map_range(value, low1, high1, low2, high2) {
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}

function Pluck(f){
  this.filter;
  this.gain;
  this.osc;
  this.played = false;
  this.volume = map_range(f,100,1500,0.9, 0.4);//based on F range
  this.pitch = f;
  this.buildSynth();
  this.duration = 1;
}

Pluck.prototype.buildSynth = function(){
  this.osc = context.createOscillator(); // Create sound source
  this.osc.type = 3; // Square wave
  this.osc.frequency.value = this.pitch;

  this.filter = context.createBiquadFilter();
  this.filter.type = 0;
  this.filter.frequency.value = 1500;

  this.gain = context.createGain();
  this.gain.gain.value = this.volume;
  //decay
  this.osc.connect(this.filter); // Connect sound to output
  this.filter.connect(this.gain);
  this.gain.connect(context.destination);
}

Pluck.prototype.setPitch = function(p){
  this.osc.frequency.value = p;
}

Pluck.prototype.setFilter = function(f){
  this.filter.frequency.value = f;
}

Pluck.prototype.setVolume= function(v){
  this.gain.gain.value = v;
  this.volume = v;
}

Pluck.prototype.play = function(dur){
  var dur = this.duration || dur;
  this.osc.start(0); // Play instantly
  this.gain.gain.setTargetAtTime(0, 0, 0.2);
  var that = this;
  setTimeout(function(){
  //this looks funny because start and stop don't work on mobile yet
  //and noteOff doesnt allow new notes
    that.setVolume(0);
    that.osc.disconnect();
  },dur*1000);
}

Pluck.prototype.stop = function(){
  return false;
}

