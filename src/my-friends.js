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
          friends: {type: [Object]}, viewers: {type: [Object]}, requests: {type: [Object]}, isActive: {type: Boolean}
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

  _viewFriendsList() {
  }

  async _stopSeeingFriendsLists(e) {
    var rowData = e.currentTarget.dataArgs;
    try {
      await firebase.firestore().collection('users').doc(firebase.auth().currentUser.email).collection('friends').doc(rowData.emailAddress).delete();
      console.log('success');
    } catch (error) {
      console.error('Error removing document: ', error);
    };
  }

  async _approveRequest(e) {
    let user = e.currentTarget.dataArgs;
    let userData = {name: user.name, emailAddress: user.emailAddress, photoUrl: user.photoUrl};
    try {
      await firebase.firestore().collection('users').doc(firebase.auth().currentUser.email).collection('viewers').doc(user.emailAddress).set(userData);
      await firebase.firestore().collection('users').doc(firebase.auth().currentUser.email).collection('requests').doc(user.emailAddress).delete();
      console.log('success');
    } catch (error) {
      console.error('Error removing document: ', error);
    };
  }

  async _stopViewingMyLists(e) {
    var rowData = e.currentTarget.dataArgs;
    try {
      await firebase.firestore().collection('users').doc(firebase.auth().currentUser.email).collection('viewers').doc(rowData.emailAddress).delete();
      console.log('success');
    } catch (error) {
      console.error('Error removing document: ', error);
    };
  }

  fabClick() {
    console.log('fab');
    this.set('route.path', 'friends-add/');
  }
}

window.customElements.define(MyFriends.is, MyFriends);