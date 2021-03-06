
//HOMEWORK REVIEW - Kelvin Chan
var day=24*60*60*1000;
let prefix ="$"
var hwentries=[];
var discord=require("discord.js");
var bot = new discord.Client("");
const { Pool, Client } = require('pg');
const pool = new Pool();
let commands={};
class Homework {
	constructor(type,due,description,id,dueMS){
		this.type=type;
		this.due=due;
		this.description=description;
		this.dueMS=(dueMS?dueMS:(Date.now() + due*day));
		this.id=id;
	}
	toString(){
		var str="Type: "+this.type+"\n"+"Due in "+this.due.toString()+" day(s).\n"+"What you need to do: "+this.description+"\n"
		console.log(str);
		return str;
	}
}
function load(){
	pool.query('SELECT * FROM homework', (err, res) => {
		if (err){
			console.warn(err);
			return;
		}
		for(let i=0;i<res.rows.length;i++){
			//turn them to be out vip guests
			let curr = res.rows[i];
			hwentries.push(new Homework(curr.type, curr.due, curr.description, curr.id, curr.duems));
		}
		console.log("loading");
		console.log(hwentries);
	});
}
/***************************
Commands list
****************************/
commands["homework"]=async function(message,args){
	if(!(args[0]&&args[1])){
		return commands.list(message,args);
	}
	hwentries.push(new Homework(args[0],parseInt(args[1]),args.slice(2).join(" "), Date.now()));
	console.log(hwentries);
	try{
		message.reply(await updateDBPromise(hwentries));
		return hwentries[hwentries.length-1].toString();
	}catch(e){
		message.reply("failed to add homework entry");
	}
}
commands["test"]=async function(message,args){
	return "Beep Boop. Boop Beep?"
};
commands["delete"]=async function(message,args){
	console.log(args);
	let q="DELETE FROM homework WHERE id="+args[0]+";";
	console.log("delete query:" + q);
	var msg=message;
	var pending = pool.query(q);
	try{
		await pending;
		msg.reply("deleted");
	}catch(e){
		msg.reply("fail");
		console.log(e);
	}
	await loadIntoRAM();
	console.log("loaded into ram");
};
commands["list"]=async function(message,args){
	if(hwentries.length==0){
		return "There are no homework items.";
	}
	var prnt="";
	
	console.log("loopstart");
	console.log(hwentries);
	for(var j=0;j<hwentries.length;j++){
		prnt+=`\n Homework ${hwentries[j].id} :\n ${hwentries[j].toString()} \n`;
		console.log("looping");
	}
	if(hwentries.length==0){
		prnt="There are no homework items.";
	}
	console.log("loopend");
	return prnt;
}
commands["change-prefix"]=async function(message,args){
	prefix=args[0];
	return `Prefix changed to ${prefix}`
}
//shortcuts
commands["hw"]=function(message,args){
	return commands.homework(message,args);
}
commands["del"]=async function(message,args){
	return commands.delete(message,args);
}
/*************************
Pool data info
*************************/

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
});
function updateDB(l){
	var i={};
	console.log(typeof l);
	var list=JSON.parse(JSON.stringify(l));
	if(list.length>0){
		i=list[0];
		pool.query(`INSERT INTO homework VALUES (\'${i.type}\', ${i.due}, \'${i.description}\',${i.dueMS},${i.id})`)
			.then((e)=>{
				console.log(`Updates list element`);
				updateDB(list.shift());
			})
		.catch((e)=>{console.warn(e)});
	}
}
function updateDBPromise(l){
	return new Promise(function(resolve,reject){
		var i={};
		console.log(typeof l);
		var list=JSON.parse(JSON.stringify(l));
		if(list.length>0){
			i=list[0];
			pool.query(`INSERT INTO homework VALUES (\'${i.type}\', ${i.due}, \'${i.description}\',${i.dueMS},${i.id})`)
			.then((e)=>{
				console.log(`Updates list element`);
				updateDB(list.shift());
				resolve("Homework entries updated");
			})
			.catch((e)=>{
				console.warn(e);
				reject(e);
			});
		};
	})
}
//load in prev thingy
function loadIntoRAM(){
	return new Promise(function (resolve,reject){
		pool.query('SELECT * FROM homework', (err, res) => {
			if (err){
				//console.warn(err);
				reject("THERE IS A BIG ERROR YOU DUMASS");
			}
			for(let i=0;i<res.rows.length;i++){
				//turn them to be out vip guests
				let curr = res.rows[i];
				hwentries.push(new Homework(curr.type, curr.due, curr.description, curr.id, curr.duems));
			}
			//console.log(hwentries);
			resolve("finish loading");
		});
	});
}
loadIntoRAM().then(function(){
	console.log(hwentries);
}).catch(function(e){
	console.warn(e)
})


//actual bot


bot.on("message", async message => {
	if((message.author.bot)||(message.channel.type==="dm")){
		return;
	}
	//
	var output;
	if (message.content.substring(0,prefix.length)===prefix){
		let command = message.content.split(" ")[0].substring(prefix.length);
		let args = message.content.split(" ").slice(1);
		if (commands.hasOwnProperty(command)){
			output= await commands[command](message,args);
			console.log(`command ${command} executed`);
		}
		//logging output
		if(output){
			return message.channel.send(output);
		}
		
	}
});
setInterval(function(){
	for(var i=0;i<hwentries.length;i++){
		if((hwentries[i].dueMS+day)<(hwentries[i].due*day+Date.now())){
			//update the due tag;
			hwentries[i].due=Math.round((Date.now()-hwentries[i].dueMS)/day);
			updateDB(hwentries);
		}
	}

},1000*60);

bot.on("ready", async ()=> {
	console.log("Bot is ready");
});
bot.login(process.env.BOT_TOKEN);
