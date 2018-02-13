
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
    if (this.listId !== undefined) {
      firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid).collection('lists').doc(this.listId).collection('items').add({name: this.$.nameInput.value, url: this.$.urlInput.value, photoUrl: this.$.photoUrlInput.value, purchased: this.$.purchasedInput.checked});
      this.set('route.path', `lists-items/${this.listId}`);
    }
  }

  _routeChanged(route) {
    this.isActive = false;
    if (this.routeData.page === 'list-items-add') {
      this.isActive = true;
    }
  }
//https://developers.google.com/api-client-library/javascript/start/start-js
  async _googleApiStart() {
    gapi.client
        .init({
          'apiKey': config.apiKey,
          'discoveryDocs': ['https://people.googleapis.com/$discovery/rest'],
          'clientId': 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
          'scope': 'profile',
        })
        .then(
            function(response) {
              console.log(response.result);
            },
            function(reason) {
              console.log('Error: ' + reason.result.error.message);
            });
  }
}
window.customElements.define(MyFriendAdd.is, MyFriendAdd);