class MyFriends extends Polymer.Element {
  static get is() {
    return 'my-friends';
  }
  static get properties() {
    return {
      route: {
        type: Object,
        observer: '_routeChanged',
      },
          routeData: {
            type: Object,
          },
          viewingEmail: {type: String, notify: true}, friends: {type: [Object]}, viewers: {type: [Object]}, requests: {type: [Object]}, isActive: {type: Boolean}
    }
  }
  ready() {
    super.ready();
  }

  _routeChanged(route) {
    this.isActive = false;
    if (route.path.indexOf('friends') > -1) {
      this.isActive = true;
    }
  }

  connectedCallback() {
    super.connectedCallback();
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        this.loadUserFriends();
      }
    });
  }

  loadUserFriends() {
    let self = this;
    firebase.firestore().collection('users').doc(firebase.auth().currentUser.email).collection('friends').onSnapshot(function(recievedData) {
      let recievedLists = [];
      recievedData.docs.forEach(function(doc) {
        var data = doc.data();
        recievedLists.push({name: data.name, emailAddress: data.emailAddress, photoUrl: data.photoUrl});
      });
      self.set('friends', recievedLists);
      Polymer.flush();
    });
    firebase.firestore().collection('users').doc(firebase.auth().currentUser.email).collection('viewers').onSnapshot(function(recievedData) {
      let recievedLists = [];
      recievedData.docs.forEach(function(doc) {
        var data = doc.data();
        recievedLists.push({name: data.name, emailAddress: data.emailAddress, photoUrl: data.photoUrl});
      });
      self.set('viewers', recievedLists);
      Polymer.flush();
    });
    firebase.firestore().collection('users').doc(firebase.auth().currentUser.email).collection('requests').onSnapshot(function(recievedData) {
      let recievedLists = [];
      recievedData.docs.forEach(function(doc) {
        var data = doc.data();
        recievedLists.push({name: data.name, emailAddress: data.emailAddress, photoUrl: data.photoUrl});
      });
      self.set('requests', recievedLists);
      Polymer.flush();
    });
  }

  _viewFriendsList(e) {
    let user = e.currentTarget.dataArgs;
    this.set('viewingEmail', user.emailAddress);
    this.set('route.path', 'lists');
  }

  async _stopSeeingFriendsLists(e) {
    let user = e.currentTarget.dataArgs;
    let userData = {name: user.name, emailAddress: user.emailAddress, photoUrl: user.photoUrl};
    let firebaseUser = firebase.auth().currentUser;
    let firebaseData = {name: firebaseUser.displayName, emailAddress: firebaseUser.email, photoUrl: firebaseUser.photoURL};

    try {
      await firebase.firestore().collection('users').doc(firebase.auth().currentUser.email).collection('friends').doc(user.emailAddress).delete();
      await firebase.firestore().collection('users').doc(user.emailAddress).collection('viewers').doc(firebase.auth().currentUser.email).delete();

      console.log('success');
    } catch (error) {
      console.error('Error removing document: ', error);
    };
  }

  async _approveRequest(e) {
    let user = e.currentTarget.dataArgs;
    let userData = {name: user.name, emailAddress: user.emailAddress, photoUrl: user.photoUrl};
    let firebaseUser = firebase.auth().currentUser;
    let firebaseData = {name: firebaseUser.displayName, emailAddress: firebaseUser.email, photoUrl: firebaseUser.photoURL};
    try {
      await firebase.firestore().collection('users').doc(firebase.auth().currentUser.email).collection('viewers').doc(user.emailAddress).set(userData);
      await firebase.firestore().collection('users').doc(user.emailAddress).collection('friends').doc(firebase.auth().currentUser.email).set(firebaseData);
      await firebase.firestore().collection('users').doc(firebase.auth().currentUser.email).collection('requests').doc(user.emailAddress).delete();
      console.log('success');
    } catch (error) {
      console.error('Error removing document: ', error);
    };
  }

  async _stopViewingMyLists(e) {
    let user = e.currentTarget.dataArgs;
    let userData = {name: user.name, emailAddress: user.emailAddress, photoUrl: user.photoUrl};
    let firebaseUser = firebase.auth().currentUser;
    let firebaseData = {name: firebaseUser.displayName, emailAddress: firebaseUser.email, photoUrl: firebaseUser.photoURL};
    try {
      await firebase.firestore().collection('users').doc(firebase.auth().currentUser.email).collection('viewers').doc(user.emailAddress).delete();
      await firebase.firestore().collection('users').doc(user.emailAddress).collection('friends').doc(firebase.auth().currentUser.email).delete();
      console.log('success');
    } catch (error) {
      console.error('Error removing document: ', error);
    };
  }

  fabClick() {
    console.log('fab');
    this.set('route.path', 'friend-add');
  }
}

window.customElements.define(MyFriends.is, MyFriends);