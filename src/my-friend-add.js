class MyFriendAdd extends Polymer.Element {
  static get is() {
    return 'my-friend-add';
  }

  static get properties() {
    return {
      userId: {
        type: Number
      },
      route: {
        type: Object
      },
      routeData: {
        type: Object,
        observer: '_routeChanged'
      },
      isActive: {
        type: Boolean,
        observer: '_activeChanged'
      },
      listId: {
        type: String
      },
      page: {
        type: String
      },
      contacts: {
        type: [Object]
      }
    };
  }

  submitClick() {
    this.handleClientLoad();
  }
  handleClientLoad() {
    let self = this;
    if (!gapi.load)
      return;
    gapi.load('client', {
      callback: function () {
        self.initClient();

      },
      onerror: function () {
        alert('gapi.client failed to load!');
      },
      timeout: 5000, // 5 seconds.
      ontimeout: function () {
        alert('gapi.client could not load in a timely manner!');
      }
    });
  }

  _routeChanged(route) {
    this.isActive = false;
    if (this.routeData.page === 'friend-add') {
      this.isActive = true;
    }
  }

  _activeChanged(isActive) {
    if (!isActive)
      return;
    this.handleClientLoad();
  }

  initClient() {
    let self = this;

    gapi.client.init({
      apiKey: config.apiKey,
      discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/people/v1/rest'],
      clientId: `${clientId}.apps.googleusercontent.com`,
      scope: 'https://www.googleapis.com/auth/contacts.readonly'
    }).then(function () {
      self._googleApiStart();
    });
  }

  async _googleApiStart() {
    let self = this;
    let googleUser = gapi.auth2.getAuthInstance().currentUser.get();
    let isSignedIn = gapi.auth2.getAuthInstance().isSignedIn.get();
    if (gapi.client.getToken() === null) {
      this.page = 'no-auth';
      return;
    }
    this.page = 'friends';
    this.contacts = new Array();
    gapi.client.people.people.connections
      .list({
        'resourceName': 'people/me',
        'pageSize': 1000,
        'personFields': 'names,emailAddresses,Photos', // https://developers.google.com/people/api/rest/v1/people
      })
      .then(function (response) {
        var connections = response.result.connections;
        var userContacts = new Array();
        if (connections.length > 0) {
          connections.forEach(element => {
            userContacts.push({
              name: element.names ? element.names[0].displayName : null,
              emailAddress: element.emailAddresses ? element.emailAddresses[0].value : null,
              photo: element.photos ? element.photos[0].url : null
            })
          });


          self.set('contacts', userContacts.sort(self._friendsCompare));
          console.log(self.contacts);
        }
      });
  }

  _friendsCompare(a, b) {
    if (a.name < b.name)
      return -1;
    if (a.name > b.name) return 1;
    return 0;
  }

  _allowToSeeMyLists(e) {
    let user = e.currentTarget.dataArgs;
    let userData = {
      name: user.name,
      emailAddress: user.emailAddress,
      photoUrl: user.photo
    };
    let firebaseUser = firebase.auth().currentUser;
    let firebaseData = {
      name: firebaseUser.displayName,
      emailAddress: firebaseUser.email,
      photoUrl: firebaseUser.photoURL
    };
    firebase.firestore().collection('users').doc(firebaseUser.email).collection('viewers').doc(userData.emailAddress).set(userData);
    firebase.firestore().collection('users').doc(user.emailAddress).collection('friends').doc(firebaseData.emailAddress).set(firebaseData);
  }

  _requestToSeeThereLists(e) {
    let user = e.currentTarget.dataArgs;
    let firebaseUser = firebase.auth().currentUser;
    let firebaseData = {
      name: firebaseUser.displayName,
      emailAddress: firebaseUser.email,
      photoUrl: firebaseUser.photoURL
    };
    firebase.firestore().collection('users').doc(user.emailAddress).collection('requests').doc(firebaseData.emailAddress).set(firebaseData);
  }

  async authenticateUser() {
    let provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/contacts.readonly');

    try {
      await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);
      let result = await firebase.auth().signInWithPopup(provider);
      this.user = result.user;
      this.isAuthenticated = true;
      gapi.client.setToken({
        access_token: result.credential.accessToken
      });
      this._googleApiStart();
    } catch (error) {
      console.log(`signin error ${error} `)
    }
  }
}
window.customElements.define(MyFriendAdd.is, MyFriendAdd);