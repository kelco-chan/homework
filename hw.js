
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
	constructor(type,due,description,id){
		this.type=type;
		this.due=due;
		this.description=description;
		this.dueMS=Date.now() + due*day;
		this.id=id;
	}
	toString(){
		return "Type: "+this.type+"\n"+"Due in "+this.due.toString()+" day(s).\n"+"What you need to do: "+this.description+"\n";
	}
}


/***************************
Commands list
****************************/
commands["homework"]=function(message,args){
	if(!(args[0]&&args[1])){
		return commands.list(message,args);
	}
	hwentries.push(new Homework(args[0],parseInt(args[1]),args.slice(2).join(" "), Date.now()));
	console.log(hwentries);
	updateDB(hwentries);
	return hwentries[hwentries.length-1].toString();
}
commands["test"]=function(message,args){
	return "Beep Boop. Boop Beep?"
};
commands["list"]=function(message,args){
	var prnt=" ";
	for(var i=0;i<hwentries.length;i++){
		prnt+="\nEntry "+ (i+1).toString() +": \n"+hwentries[i].toString()+" \n";
		console.log("PRINT:  "+prnt);
	}
	console.log("printing in progress");
	return prnt;
}
commands["change-prefix"]=function(message,args){
	prefix=args[0];
	return `Prefix changed to ${prefix}`
}

/*************************
Pool data info
*************************/

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
});
function updateDB(list){
	var i={};
	if(list.length>0){
		i=list[0];
		pool.query(`INSERT INTO homework VALUES (${i.type}, ${i.due}, ${i.description},${i.dueMS},${i.id})`)
			.then((e)=>{
				console.log(`Updates list element`);
				updateDB(list.shift());
			})
		.catch((e)=>{console.warn(e)});
	}
}


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
			output=commands[command](message,args);
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
		if((hwentries[i].dueMS+day)<(hwentires[i].due*day+Date.now())){
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
