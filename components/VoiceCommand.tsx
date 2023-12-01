import { playSoundForEar ,playSound} from "./SoundPlayer"
import { useState, useEffect } from 'react';
import Sound from 'react-native-sound';

const commands: {[key:string]: any}={
    'test':{
        'left': ()=>{playSoundForEar(-1)},
        'right':()=>{playSoundForEar(1)}
    },
    'help': ()=>{listAllVoiceCommands()},
    'start': ()=>{hasStartedCommand(true)},
    'stop': ()=>{hasStartedCommand(false)}
    
} 

export function executeCommand(command: string) {
    command += ''
    let commandsFromUser = command.split(' ');
    
    
    
    let firstCommand = commandsFromUser[0] as keyof typeof commands;
    
    if (commandsFromUser.length === 2 &&  commands[commandsFromUser[0]] != undefined) {
        let secondCommand = commandsFromUser[1] as keyof typeof commands[typeof firstCommand];
        const funct:Function = commands[firstCommand][secondCommand];
        funct();
    } else if (commandsFromUser.length === 1 &&  commands[commandsFromUser[0]] != undefined) {
        console.log(firstCommand);
        const funct:Function = commands[firstCommand];
        funct();
    }else{
        console.log('Command not found');
    }
}
let onStarted:boolean= true;

function listAllVoiceCommands(){
    playSound('helpcommand.mp3');
}

export function getHasStartedCommand():boolean{
    'worklet'
    return onStarted
}
function hasStartedCommand(hasStarted:boolean){
    onStarted= hasStarted
}

