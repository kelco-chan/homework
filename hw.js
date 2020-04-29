
//HOMEWORK REVIEW - Kelvin Chan

let prefix ="$"
var hwentries=[];
var discord=require("discord.js");
var bot = new discord.Client("");
let commands={};
commands["homework"]=function(message,args){
	if(!(args[0]&&args[1]])){
		return "Give me something VALID to add. I thought bots were supposed to be more stupid than you.";
	}
	hwentries.push(new Homework(args[0],args[1],args.slice(2).join(" ")));
	console.log(hwentries);
	return hwentries[hwentries.length-1].toString();
}
commands["test"]=function(message,args){
	return "Beep Boop. Boop Beep?"
};
commands["list"]=function(message,args){
	var prnt="";
	for(var i=0;i<hwentries.length;i++){
		prnt+="\nEntry "+(i+1)+": \n"+hwentries[i].toString()+" \n";
	}
	return prnt;
}
commands["change-prefix"]=function(message,args){
	prefix=args[0];
	return `Prefix changed to ${prefix}`
}
bot.on("ready", async ()=> {
	console.log("Bot is ready");
});

class Homework {
	constructor(type,due,description){
		this.type=type;
		this.due=due;
		this.description=description;
		this.dueMS=Date.now() + due*24*60*60*1000;
	}
	toString(){
		return "Type: "+this.type+"\n"+"Due in "+this.due+" day(s).\n"+"What you need to do: "+this.description+"\n";
	}
}
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
		}
		//logging output
		if(output){
			return message.channel.send(output);
		}
		
	}
});
bot.login(process.env.BOT_TOKEN);
