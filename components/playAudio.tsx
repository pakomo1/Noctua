
import Sound from "react-native-sound";


export function playSound(objectSoundPosition:number, objectVolumeDistance:number){
    var ding = new Sound('ding.mp3', Sound.MAIN_BUNDLE, (error) => {
        if (error) {
          console.log('failed to load the sound', error);
          return;
        }
      });
    //plays form the left headphone 
    ding.setPan(objectSoundPosition);
    ding.setVolume(objectVolumeDistance);
    ding.play();
}
