const async = require('async');
const MQTTClient = require('./lib/mqtt_client');
const config = require('./config_ultrasonic');
const colors = require('colors');
const util = require('util');
const INTERVAL = 1000;
const PythonShell = require('python-shell');

var BASE_TMP = 30;
var device = new MQTTClient(config);

device.on('connect', function(){
  console.log('ThingPlug MQTT Connected');
  device.on('command', function(topic,cmd){
    console.log('recv cmd :' + topic +':'+ cmd.exra[0]);
    processCMD(cmd);
    device.updateExecInstance(cmd.cmt[0], cmd.ri[0], function(err,result){});
  });
  initialSetup(function(err,result){
    if(err) {
      console.log(err);
      return device.end();
    }
    console.log(colors.green('5. content Instance 주기적 생성 시작'));
    setInterval( function(){
      PythonShell.run('ultra.py', function (err, results) {
        if (err) throw err;
        // results is an array consisting of messages collected during execution
        //console.log('results: %j', results);
        var value = results
        device.createContentInstance(config.containerName, value, function(err, result){
        if(err) console.log(err)
        else console.log(value, result);
      });
      // var value = BASE_TMP + Math.floor(Math.random() * 5);
      
      });
    },INTERVAL);
  });
})

function initialSetup(cb) {
  async.waterfall([
    function createNode(cb){
      console.log(colors.blue('1. node 생성 요청'));
      device.createNode(cb);
    },
    function createRemoteCSE(nodeRI, cb){
      console.log(colors.blue('2. remoceCSE 생성 요청'));
      device.createRemoteCSE(cb);
    },
    function createContainer(dKey, cb){
      console.log(colors.blue('3. container 생성 요청'));
      device.createContainer(config.containerName, cb);
    },
    function createMgmtCmd(res, cb){
      console.log(colors.blue('4. mgmtCmd 생성 요청'));
      device.createMgmtCmd(config.command, cb);
    }
  ], function processResult (err, result) {
    return cb(err,result);
  });
}

function processCMD(cmd) {
  var cmd_args = JSON.parse(cmd.exra[0])['cmd'];
  if(cmd_args == 'on') return BASE_TMP = 0;
  if(cmd_args == 'off') return BASE_TMP = 30;
}
