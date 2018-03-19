class MySignin extends Polymer.Element {
  static get is() {
    return 'my-signin';
  }
  async authenticateUser() {
    let provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/contacts.readonly');

    try {
      await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);
      let result = await firebase.auth().signInWithPopup(provider);
      this.user = result.user;
      this.isAuthenticated = true;
      gapi.client.setToken(result.credential.accessToken);
    } catch (error) {
      console.log(`signin error ${error} `)
    };
    this.set('route.path', 'lists/');
  }
}

window.customElements.define(MySignin.is, MySignin);