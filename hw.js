let prefix ="$"
var hwentries=[];
var discord=require("discord.js");
var bot = new discord.Client("");
bot.on("ready", async ()=> {
	console.log("Bot is ready");
})
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
	var output="";
	if (message.content.substring(0,prefix.length)===prefix){
		let command = message.content.split(" ")[0];
		let args = message.content.split(" ").slice(1);
		if(command==(prefix+"test")){
			output="prefix detected. Beep Boop. Boop beep?";
		} 
		if(command==(prefix+"homework")){
			hwentries.push(new Homework(args[0],args[1],args.slice(2).join(" ")));
			console.log(hwentries);
			output=hwentries[hwentries.length-1].toString();
		}
		if(command===(prefix+"list")){

			for(var i=0;i<hwentries.length;i++){
				output+="\nEntry "+(i+1)+": \n"+hwentries[i].toString()+" \n";
			}
			console.log(output);
		}
		if(command ===(prefix+"help")){
			output="Commands:\nhelp\nlist\nhomework\ntest\n";
		}
		if(command==(prefix+"change-prefix")){
			//if(message.member.roles.has(704540113719263343)){// only admins
				prefix=args[0];
				output=`updated prefix to ${prefix}`
			//}else{
			//	output="NO U";
			//}
			
		}
		//logging output
		if(output!==""){
			return message.channel.send(output);
		}
		
	}
})
















//DO NOT READ







bot.login("NzA0ODMxNjE1MTk2NTk0MjM4.Xqi5mQ.dQLgTHETvmO9Ph_NL_c3evKemds");
