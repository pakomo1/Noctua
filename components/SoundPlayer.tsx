import React from "react";
import { Button, View,Text } from "react-native";
import Sound from 'react-native-sound'

const PlaySoundComponent = ()=>{
    Sound.setCategory('Playback');

  
    return(
        <View>
            <Button title="Play sound from left ear" onPress={()=>{playSound(-1)}}/>
        </View>
    )
}
    
export function playSound(pan:number){
    var ding = new Sound('sound.mp3', Sound.MAIN_BUNDLE, (error) => {
    if (error) {
      console.log('failed to load the sound', error);
      return;
    }
    ding.setPan(pan);
    // when loaded successfully
    ding.play((success)=>{
        if (!success) {
              console.log('Sound did not play')
        }
    });
    console.log('duration in seconds: ' + ding.getDuration() + 'number of channels: ' +ding.getNumberOfChannels());
});   
}

let beepTimer: NodeJS.Timeout | null = null;

export function startBeeping(pan: number, volume: number) {
  if (beepTimer) {
    clearInterval(beepTimer);
  }

  beepTimer = setInterval(() => {
    try {
      const ding = new Sound('sound.mp3', Sound.MAIN_BUNDLE, (error) => {
        if (error) {
          console.log('Failed to load the sound', error);
          return;
        }
                // Set pan and volume
        ding.setPan(pan);
        ding.setVolume(volume);

        // Play the sound
        ding.play((success) => {
          if (!success) {
            console.log('Sound did not play');
          }
        });

        console.log('Duration in seconds:', ding.getDuration(), 'Number of channels:', ding.getNumberOfChannels());
      });
    } catch (error) {
      console.error('Error initializing sound:', error);
    }
  }, calculateInterval(pan));
}

export function stopBeeping() {
  if (beepTimer) {
    clearInterval(beepTimer);
    beepTimer = null;
  }
}

function calculateInterval(pan: number): number {

    if (pan === null || pan === 0) {
         return 0;
     }

  // Calculate the interval inversely proportional to the absolute value of pan
  const baseInterval = 1000; // Adjust the base interval as needed
  const modulationFactor = 1 + Math.abs(pan);
  return Math.round(baseInterval / modulationFactor);
}




export default PlaySoundComponent;