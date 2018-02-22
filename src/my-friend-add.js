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
        type: Boolean
      },
      listId: {
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
    gapi.load('client', {
      callback: function () {
        // Handle gapi.client initialization.
        self.initClient();
        self._googleApiStart();

      },
      onerror: function () {
        // Handle loading error.
        alert('gapi.client failed to load!');
      },
      timeout: 5000, // 5 seconds.
      ontimeout: function () {
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
    let self = this;

    gapi.client.init({
      apiKey: config.apiKey,
      discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/people/v1/rest'],
      clientId: `${clientId}.apps.googleusercontent.com`,
      scope: 'https://www.googleapis.com/auth/contacts.readonly'
    }).then(function () {
      // gapi.client.setToken();
      self._googleApiStart();
    });
  } // https://developers.google.com/people/v1/read-people
  // https://developers.google.com/api-client-library/javascript/start/start-js
  _googleApiStart() {
    let self = this;
    this.contacts = new Array();
    gapi.client.people.people.connections
      .list({
        'resourceName': 'people/me',
        'pageSize': 10,
        'personFields': 'names,emailAddresses,Photos', //https://developers.google.com/people/api/rest/v1/people
      })
      .then(function (response) {
        var connections = response.result.connections;

        if (connections.length > 0) {
          connections.forEach(element => {
            self.contacts.push({
              name: element.names[0].displayName,
              emailAddress: element.emailAddresses[0].value,
              photo: element.photos[0].url
            })
          });
          console.log(self.contacts);
        }
      });
  }
}
window.customElements.define(MyFriendAdd.is, MyFriendAdd);