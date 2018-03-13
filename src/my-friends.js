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
      console.log(recievedLists);
    });
    firebase.firestore().collection('users').doc(firebase.auth().currentUser.email).collection('requests').onSnapshot(function(recievedData) {
      let recievedLists = [];
      recievedData.docs.forEach(function(doc) {
        var data = doc.data();
        recievedLists.push({name: data.name, emailAddress: data.emailAddress, photoUrl: data.photoUrl});
      });
      self.set('requests', recievedLists);
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
  _approveRequest() {
  }
  _stopViewingMyLists() {
  }

  fabClick() {
    console.log('fab');
    this.set('route.path', 'friends-add/');
  }
}

window.customElements.define(MyFriends.is, MyFriends);