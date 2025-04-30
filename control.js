var express = require('express')
var app = express();
var fileUpload = require('express-fileupload');
var csv = require("csvtojson");

var request = require('request');
app.use(express.static('public'));

app.set('view engine', 'ejs')
app.set('port',process.env.PORT||5001)

app.use(fileUpload());

var bodyparser = require('body-parser')
app.use(bodyparser.urlencoded({extended:false}))
var session = require('express-session')

app.use(session({ secret: 'keyboard cat', cookie: { maxAge: 60000000 }}))

var mongojs = require('mongojs') 
var db = mongojs('mongodb://xxxxx:xxxxxx@xxxxxx.mlab.com:xxxxx/permission_assistant',['students','incharge','applications','classes'])


app.get('/', function(req,res){
	res.sendFile(__dirname+'/public/login.html')
})

app.get('/student1', function(req,res){
	res.render('student1')
})

app.get('/admin', function(req,res){
	
	if(req.session.FirstTime){
		var doc = {
		fname: "xxxxx",
		lname:"xxxxx",
		email: "admin@gmail.com",
		pass: "12345",
		no:"1234567890"
	}
	db.incharge.find({},function(err, fdoc){
		  	res.render('admin',{res:doc , un : req.session.FirstTime, inch :fdoc})
		 })
	    
    }else{
        res.sendFile(__dirname+'/public/login.html')
    }

})

app.post('/SLogin',function(req,res){
	var doc = {
		sid : req.body.roll,
		pno : req.body.pno,
		password : req.body.passw
  }
  console.log("doc",doc)
	db.students.find(doc, function(err,docs){
    console.log(docs)
		if(docs.length>0){
			req.session.sid = docs.sid;
			if(docs.type == "0"){
               res.render('student1',{res:docs , std : req.session.sid})
			}else{
			   res.render('student2',{res:docs , std : req.session.sid})	
			} 
		}else{
      
			res.sendFile(__dirname+'/public/Invalid.html')
		}		
	})
})


app.get('/error', function(req,res){
	res.sendFile(__dirname+'/public/Invalid.html')
})

app.get('/logout', function(req,res){     
	req.session.destroy(function(err) {
		res.sendFile(__dirname+'/public/login.html')
    })
})

app.post('/MLogin',function(req,res){
	var doc = {
		fname: " Sruthi",
		lname:"Vellore",
		email: req.body.email,
		pass: req.body.pass,
		no:"1234567890",
		t : req.body.select_path
	}
	console.log(doc.t)
	
	if(doc.t == "Admin" ){
		if(doc.email == "admin@gmail.com" && doc.pass == "12345"){
			req.session.FirstTime = doc.fname+" "+doc.lname
			// req.session.result = doc
		  	db.incharge.find({},function(err, fdoc){
		  	res.render('admin',{res:doc , un : req.session.FirstTime, inch :fdoc})
		 })
	    
	    }else{
		   res.sendFile(__dirname+'/public/Invalid.html')
	    }
	}else{
	    res.send(doc.t)
	}
})

app.post('/upload', function(req, res) {
  if (Object.keys(req.files).length == 0) {
    return res.status(400).send('No files were uploaded.');
  }
  let sampleFile = req.files.inputfile;
  uploadPath = __dirname + '/uploads/' + Date.now()+ '-' +sampleFile.name ;
  sampleFile.mv(uploadPath, function(err) {
    if (err){
      return res.status(500).send(err);
    }
    else
    {
          csv()
            .fromFile(uploadPath)
            .then(function(jsonArrayObj){ 

               var cnt=0

               var bulk = db.incharge.initializeOrderedBulkOp()
                  for (var idx in jsonArrayObj){
                  var doc=jsonArrayObj[idx]
                  bulk.insert(doc)

                   cnt++
                                  }
                bulk.execute(function (err, res1) {
                    res.sendFile(__dirname+'/public/login.html')
                })
               
            })
     }
  });
});

app.post('/upload1', function(req, res) {
  if (Object.keys(req.files).length == 0) {
    return res.status(400).send('No files were uploaded.');
  }
  let sampleFile = req.files.inputfile;
  uploadPath = __dirname + '/uploads/' + Date.now()+ '-' +sampleFile.name ;
  sampleFile.mv(uploadPath, function(err) {
    if (err){
      return res.status(500).send(err);
    }
    else
    {
          csv()
            .fromFile(uploadPath)
            .then(function(jsonArrayObj){ 

               var cnt=0

               var bulk = db.classes.initializeOrderedBulkOp()
                  for (var idx in jsonArrayObj){
                  var doc=jsonArrayObj[idx]
                  bulk.insert(doc)

                   cnt++
                                  }
                bulk.execute(function (err, res1) {
                    res.sendFile(__dirname+'/public/login.html')
                })
               
            })
     }
  });
});

app.listen(app.get('port'),function(){
	console.log("Server is running")
})

// app.listen(5000,function(){
// 	console.log("Server is running")
// })
