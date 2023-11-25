import React from "react";
import { Button, View,Text } from "react-native";
import Sound from 'react-native-sound'

const PlaySoundComponent = ()=>{
    Sound.setCategory('Playback');

  
    return(
        <View>
            <Button title="Play sound from left ear" onPress={()=>{playSound(-1, 0.5)}}/>
        </View>
    )
}
    
export function playSound(pan:number,volume:number){
    var ding = new Sound('sound.mp3', Sound.MAIN_BUNDLE, (error) => {
    if (error) {
      console.log('failed to load the sound', error);
      return;
    }
    ding.setPan(pan);
    ding.setVolume(volume);
    // when loaded successfully
    ding.play((success)=>{
        if (!success) {
              console.log('Sound did not play')
        }
    });
    console.log('duration in seconds: ' + ding.getDuration() + 'number of channels: ' +ding.getNumberOfChannels());
});   
}

export default PlaySoundComponent;