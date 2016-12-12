//---------- String helper functions ----------\\

// String comparison for better readability
String.prototype.is = function(comparison){
    return ("" + this) === comparison;
};

String.prototype.capitalizeFirstLetter = function(){
    var temp = this.replace(/\b[a-z]/g, function(letter) {
        return letter.toUpperCase();
    });

    return temp;
};

//---------- General helper functions ----------\\

// Get the first item in the array
function getTop(array){
    if (typeof array[0] === "string"){
        return array[0]
    } else {
        return array[0].join("\t");
    }
}

// Get everything in the array and add to result
function getAll(title, array){
    if (!isNotEmptyArray(array)){
        return "";
    }

    var result = "";

    if (isNotEmpty(title)){
        result += setTitle(title.capitalizeFirstLetter() + ":") + "\n";    
    }
    
    array.map( function(item) {
        result += item.join("\t");

        if (array[array.length - 1] !== item){
            result += "\n";
        }
    });
    return result;
}

// Return colour
function setFormat(string, color, bold, italic, backgroundColor){
    color = typeof color !== 'undefined' ? color: null;
    bold = typeof bold !== 'undefined' ? bold: false;
    italic = typeof italic !== 'undefined' ? italic: false;
    backgroundColor = typeof backgroundColor !== 'undefined' ? backgroundColor: null;

    var result = "[[";
    if (bold){
        result += "b";
    }
    if (italic){
        result += "i";
    }
    if (color != null){
        result += ";";
        result += color;
    }
    if (backgroundColor != null){
        if (bold || italic || color != null){
            result += ";";
        }
        result += backgroundColor;
    } else {
        if (bold || italic || color != null){
            result += ";";
        }
        result += "#000";
    }

    result += "]";
    result += string;
    result += "]";

    return result;
}

function setTitle(string){
    return setFormat(string, "red", true);
}

function setCommand(string){
    return setFormat(string, "white", false, true);
}

function setName(string){
    return setFormat(string, "green", true);
}

// Map skills
function getSkills(skillList){
    var result = [];
    var i = 0;
    skillList.map(function(item){
        result[i] = item[1];
        i++;
    });
    return result;
}

function isNotEmpty(string){
    if (string == undefined || string == null || string.length == 0){
        return false;
    } else {
        return true;
    }
}

function isNotEmptyArray(array){
    if (array == null || array.length == 0){
        return false;
    } else {
        return true;
    }
}

//---------- Resume Code ----------\\
var CMDResume = {};

// Command Storage
CMDResume.commandMap = {};
CMDResume.commandFunctionMap = {};


// Open up github linked (resume) in a new window
CMDResume.getGithub = function(){
    window.open(githubURL);
    return githubURL + "\nHint: May need to allow pop-ups.";
};

CMDResume.getLinkedin = function(){
    window.open(linkedinURL);
    return linkedinURL + "\nHint: May need to allow pop-ups.";
};

// Return social media information
CMDResume.getSocialMedia = function(){
    var result = setTitle("Social Media:");
    socialMedia.map(function(item){
        if (isNotEmpty(item[1])){
            result += "\n";
            result += item[0] + " - " + item[1];
        }
    });
    return result;
};

CMDResume.hasSocialMedia = function(){
    return isNotEmptyArray(socialMedia);
};

// Return a list of skills in a table
CMDResume.getSkillTable = function(){
    var result = setTitle("Skills:\n");
    result += "           |\tStrong\t|\tExperienced\n";
    result += getSkills(skillsLanguages).join("\t|\t") + "\n";
    result += getSkills(skillsTools).join("\t|\t") + "\n";
    result += "Concepts   |\t" + getSkills(skillsConcepts).join("\t|\t");

    return result;
};

CMDResume.hasSkillTable = function(){
    return isNotEmptyArray(skillsLanguages)
        || isNotEmptyArray(skillsTools)
        || isNotEmptyArray(skillsConcepts);
};

// Update page title to Resume owners name
CMDResume.updateTitle = function(){
    if (isNotEmpty(name)){
        document.title = name + "'s Résumé";
    }
};

// Run man command
CMDResume.runMan = function(command){
    if (!command){
        return setCommand("man:") + " No command entered.";
    } else if (this.commandMap[command] != undefined){
        return setCommand(command) + " - " + this.commandMap[command] ;
    } else {
        return setCommand("man:") + " `" + command + "` is an unknown command.";
    }
};

// Run the command
CMDResume.runCommand = function(command, top){
    var formattedCommand = command;

    // Set Top up
    top = typeof top !== 'undefined' ? top: false;
    if (top){
        formattedCommand += " -top";
    }

    var response = this.commandFunctionMap[formattedCommand];

    if ($.isFunction(response)){
        return response();
    } else {
        return response;
    }
};

// Parse command line
CMDResume.commandLineParse = function(input){
    var commandList = input.toLowerCase().split(" ");

    // Command sections
    var rootCommand = commandList[0] != undefined ? commandList[0] : false;
    var stemCommand = commandList[1] != undefined && commandList[1].length > 0 ? commandList[1] : false;

    if (rootCommand.is("help")){
        return this.commandMap.getCommandList();
    } else if (rootCommand.is("man")){
        return this.runMan(stemCommand);
    } else if (rootCommand.is("skills")){
        if (stemCommand){
            var fullCommand = rootCommand + " " + stemCommand;
            if (fullCommand in this.commandFunctionMap){
                return this.commandFunctionMap[fullCommand];
            } else {
                return "Warning: Invalid arguments";
            }
        } else {
            return this.commandFunctionMap[rootCommand];
        }
    } else if (this.commandFunctionMap.hasCommand(rootCommand)){
        return this.runCommand(rootCommand, stemCommand == "-top");
    } else {
        if (rootCommand.length > 0){
            return "`" + rootCommand + "` is an unknown command.";
        } else {
            return "No command entered.";
        }
    }
};

// Initialize class
CMDResume.init = function(tag){
    // Update page title
    this.updateTitle();
    this.initVariables();

    // Command Line Settings
    this.settings =
    {
        greetings: CMDResume.getSplash() + "\n",
        onBlur: function() {
            // prevent loosing focus
            return false;
        },
        completion: CMDResume.commandMap.getKeys()

    };

    // Setup Terminal
    $(tag).terminal(function(command, term) {
        term.echo(CMDResume.commandLineParse(command) + "\n");
    },
    this.settings);
};

CMDResume.getSplash = function(){
    var welcome = ` ${splash} 
     My Name is ${setName(name)} welcome to my portfolio.\n
     Type ${setCommand("help")} for commands`;
    return welcome;
};

CMDResume.setCommand = function(command, information, method, data){
        if (isNotEmpty(data)){
            this.commandMap[command] = information;
            this.commandFunctionMap[command] = method;
        }
};

CMDResume.setArrayCommand = function(command, information, data){
    if (isNotEmptyArray(data)){
        this.commandMap[command] = information + " [-top]";
        this.commandFunctionMap[command] = getAll(command, data);
        this.commandFunctionMap[command + " -top"] = getTop(data);
    }
};

// Initialize variables
CMDResume.initVariables = function(){
    // Help
    this.commandMap["help"] = "lists help for all the commands";
    
    // Clear screen
    this.commandMap.clear = "clear command history from screen";

    // Splash screen
    this.setCommand("splash", "print the welcome screen", this.getSplash, this.getSplash());


    // Name
    this.setCommand("name", "owner of the résumé", setName(name), name);

    // Looking for
    this.setCommand("lookingfor", "looking for", setName(lookingfor), lookingfor);

    // Location
    this.setCommand("location", "current location", setName(loc), loc);

    // PDF
    // this.setCommand("pdf", "pdf version of the résumé", this.pdf, pdfLink);
    
    // Education
    this.setArrayCommand("education", "education history", education);

    // Employment
    this.setArrayCommand("employment", "employment history", employment);

    // Linkedin
    this.setCommand("linkedin", "link to Linkedin Profile", this.getLinkedin, linkedinUsername);

    // Github
    this.setCommand("github", "link to Github repositories", this.getGithub, githubUsername);
    
    // Skills
    this.initSkills();

    this.setArrayCommand("projects", "some projects I've worked on", projects);

    
    // Social Media
    if (this.hasSocialMedia()){
        this.commandMap.socialmedia = "Social Media profiles";
        this.commandFunctionMap.socialmedia = this.getSocialMedia();
    }

};

CMDResume.initSkills = function(){
    if (this.hasSkillTable()){
        var skillSubCategories = "";
        // Skills in total
        this.commandMap["skills"] = "skills obtained. " + skillSubCategories;
        this.commandFunctionMap["skills"] = this.getSkillTable();
    }
};

//---------- Object extra functions ----------\\

// Checks if a command is in the function map
CMDResume.commandFunctionMap.hasCommand = function(command){
    if (command == "hasCommand"){
        return false;
    } else {
        return this[command] != undefined;
    }
};

// Get list of functions from command map
CMDResume.commandMap.getKeys = function(){
    var command = [];
    $.map(this, function(element,index) {
        command.push(index);
    });
    return command;
};

// Get key list of the command map
CMDResume.commandMap.getCommandList = function (){
    var commands = setTitle("Available Commands:");
    for (var key in this) {
        if( typeof this[key] !== 'function') {
            commands += "\n";
            commands += setCommand(key) + " - " + this[key];
        }
    }
    return commands;
};
