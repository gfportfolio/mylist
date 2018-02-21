class MyFriendAdd extends Polymer.Element {
  static get is() {
    return 'my-friend-add';
  }

  static get properties() {
    return {
      userId: {type: Number},
      route: {type: Object},
      routeData: {type: Object, observer: '_routeChanged'},
      isActive: {type: Boolean},
      listId: {type: String},
    };
  }

  submitClick() {
    this.handleClientLoad();
    // this._googleApiStart();
    // if (this.listId !== undefined) {
    //   firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid).collection('lists').doc(this.listId).collection('items').add({
    //     name: this.$.nameInput.value,
    //     url: this.$.urlInput.value,
    //     photoUrl: this.$.photoUrlInput.value,
    //     purchased: this.$.purchasedInput.checked
    //   });
    //   this.set('route.path', `lists-items/${this.listId}`);
    // }
  }
  handleClientLoad() {
    let self = this;
    gapi.load('client', {
      callback: function() {
        // Handle gapi.client initialization.
        self.initClient();
        self._googleApiStart();

      },
      onerror: function() {
        // Handle loading error.
        alert('gapi.client failed to load!');
      },
      timeout: 5000,  // 5 seconds.
      ontimeout: function() {
        // Handle timeout.
        alert('gapi.client could not load in a timely manner!');
      }
    });
  }

  _routeChanged(route) {
    this.isActive = false;
    if (this.routeData.page === 'list-items-add') {
      this.isActive = true;
    }
  }

  initClient() {
    // Initialize the client with API key and People API, and initialize OAuth with an
    // OAuth 2.0 client ID and scopes (space delimited string) to request access.
    gapi.client.init({apiKey: config.apiKey, discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/people/v1/rest'], clientId: `${clientId}.apps.googleusercontent.com`, scope: 'https://www.googleapis.com/auth/contacts.readonly'}).then(function() {
      // gapi.client.setToken();

    });
  }  // https://developers.google.com/people/v1/read-people
  // https://developers.google.com/api-client-library/javascript/start/start-js
  _googleApiStart() {
    gapi.client.people.people.connections
        .list({
          'resourceName': 'people/me',
          'pageSize': 10,
          'personFields': 'names,emailAddresses',
        })
        .then(function(response) {
          var connections = response.result.connections;
          appendPre('Connections:');

          if (connections.length > 0) {
            for (i = 0; i < connections.length; i++) {
              var person = connections[i];
              if (person.names && person.names.length > 0) {
                appendPre(person.names[0].displayName)
              } else {
                appendPre('No display name found for connection.');
              }
            }
          } else {
            appendPre('No upcoming events found.');
          }
        });
    // gapi.client.init({
    //     'apiKey': config.apiKey,
    //     'discoveryDocs': ['https://people.googleapis.com/$discovery/rest'],
    //     'clientId': `${clientId}.apps.googleusercontent.com`,
    //     'scope': 'profile',
    //   }).then(function () {
    //     return gapi.client.request({
    //       'path': 'https://people.googleapis.com/v1/people/me?requestMask.includeField=person.names',
    //     })
    //   })
    //   .then(
    //     function (response) {
    //       console.log(response.result);
    //     },
    //     function (reason) {
    //       console.log('Error: ' + reason.result.error.message);
    //     });
  }
}
window.customElements.define(MyFriendAdd.is, MyFriendAdd);