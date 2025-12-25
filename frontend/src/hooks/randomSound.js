

const sounds=[
    new Audio("sounds/sounds_keystroke1.mp3"),
    new Audio("sounds/sounds_keystroke2.mp3"),
    new Audio("sounds/sounds_keystroke3.mp3"),
    new Audio("sounds/sounds_keystroke4.mp3")

]

const UseKeyboardSound=()=>{
    const keyStrokeSound=()=>{
        const keysound=sounds[Math.floor(Math.random()*sounds.length)];
        keysound.currentTime=0;
        keysound.play().catch((err)=>console.log("error occured during choosing a sound in a randomsound.js file: ",err.message));
    }
    return {keyStrokeSound}
}

export default UseKeyboardSound;