import * as firebase from 'firebase';

var config = {
    apiKey: "AIzaSyAZsHVhWrz__8eCs900blM-zGd74qIBvFQ",
    authDomain: "wheel-6d17b.firebaseapp.com",
    databaseURL: "https://wheel-6d17b.firebaseio.com",
    projectId: "wheel-6d17b",
    storageBucket: "wheel-6d17b.appspot.com",
    messagingSenderId: "91662821409"
};

firebase.initializeApp(config);

const fb = {

    dbRef: firebase.database().ref(),

    setWords: words => fb.dbRef.child('words').set(words),

    setSpeed: num => fb.dbRef.child('speed').set(num),
}

export default fb;